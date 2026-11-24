// Access rules for the private docs server. Pure functions and one class, no I/O,
// so every rule can be tested without opening a socket.
import { createHash, timingSafeEqual } from 'node:crypto';
import path from 'node:path';

export const HONEYPOT = '/internal-archive/';

// User-agent tokens of AI training, AI search and bulk-scraping crawlers.
export const AI_CRAWLERS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
  'ClaudeBot', 'Claude-Web', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
  'Google-Extended', 'GoogleOther', 'Google-CloudVertexBot',
  'CCBot', 'PerplexityBot', 'Perplexity-User', 'Bytespider', 'Amazonbot', 'Applebot-Extended',
  'meta-externalagent', 'meta-externalfetcher', 'FacebookBot',
  'Diffbot', 'Omgili', 'ImagesiftBot', 'Timpibot', 'PetalBot',
  'cohere-ai', 'cohere-training-data-crawler', 'YouBot', 'DuckAssistBot', 'MistralAI-User',
  'AI2Bot', 'Ai2Bot-Dolma', 'FriendlyCrawler', 'img2dataset', 'Webzio', 'Kangaroo Bot',
  'ICC-Crawler', 'SBIntuitionsBot', 'Brightbot', 'Crawl4AI', 'Firecrawl', 'PanguBot',
  'SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot', 'BLEXBot', 'DataForSeoBot',
];

// HTTP libraries and mirroring tools that announce themselves. curl stays allowed for health checks.
export const SCRAPER_CLIENTS = [
  'python-requests', 'python-urllib', 'python-httpx', 'aiohttp', 'scrapy', 'libwww-perl',
  'go-http-client', 'okhttp', 'apache-httpclient', 'node-fetch', 'axios/', 'got (',
  'httrack', 'webcopier', 'wget', 'java/', 'headlesschrome', 'phantomjs',
];

export function classifyAgent(userAgent) {
  const ua = String(userAgent ?? '').trim();
  if (!ua) return { blocked: true, reason: 'empty-user-agent' };
  const low = ua.toLowerCase();
  const ai = AI_CRAWLERS.find((t) => low.includes(t.toLowerCase()));
  if (ai) return { blocked: true, reason: 'ai-crawler', match: ai };
  const client = SCRAPER_CLIENTS.find((t) => low.includes(t));
  if (client) return { blocked: true, reason: 'scraper-client', match: client };
  return { blocked: false };
}

export function robotsTxt() {
  const named = AI_CRAWLERS.map((t) => `User-agent: ${t}\nDisallow: /\n`).join('\n');
  return [
    '# Private documentation. Everything needs a sign-in.',
    'User-agent: *',
    'Disallow: /',
    `Disallow: ${HONEYPOT}`,
    '',
    named,
    `# Do not request ${HONEYPOT}. A request to it is logged and the address is blocked.`,
    '',
  ].join('\n');
}

export const SECURITY_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai',
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  // Docusaurus writes inline scripts and styles, so those two keep 'unsafe-inline'. Nothing is loaded from another origin.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'self'",
    "object-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
};

export class TokenBucket {
  constructor({ capacity, refillPerSec, now = Date.now }) {
    this.capacity = capacity;
    this.refillPerSec = refillPerSec;
    this.now = now;
    this.buckets = new Map();
  }

  take(key) {
    const t = this.now();
    let b = this.buckets.get(key);
    if (!b) {
      b = { tokens: this.capacity, at: t };
      this.buckets.set(key, b);
    }
    b.tokens = Math.min(this.capacity, b.tokens + ((t - b.at) / 1000) * this.refillPerSec);
    b.at = t;
    if (this.buckets.size > 5000) this.prune(t);
    if (b.tokens >= 1) {
      b.tokens -= 1;
      return { ok: true };
    }
    return { ok: false, retryAfterSec: Math.ceil((1 - b.tokens) / this.refillPerSec) };
  }

  prune(t) {
    for (const [k, b] of this.buckets) {
      if (t - b.at > 600_000) this.buckets.delete(k);
    }
  }
}

export function parseBasic(header) {
  const m = /^Basic\s+([A-Za-z0-9+/=]+)\s*$/.exec(String(header ?? ''));
  if (!m) return null;
  let text;
  try {
    text = Buffer.from(m[1], 'base64').toString('utf8');
  } catch {
    return null;
  }
  const i = text.indexOf(':');
  if (i < 0) return null;
  return { user: text.slice(0, i), password: text.slice(i + 1) };
}

const digest = (s) => createHash('sha256').update(String(s)).digest();

// Hashing first makes both inputs the same length, so the comparison leaks neither value nor length.
export function credentialsMatch(given, expected) {
  const user = timingSafeEqual(digest(given?.user ?? ''), digest(expected.user));
  const pass = timingSafeEqual(digest(given?.password ?? ''), digest(expected.password));
  return user && pass;
}

// Maps a URL path into the build folder. Returns null for anything outside it, dotfiles and source maps.
export function safeJoin(root, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const parts = decoded.split('/').filter(Boolean);
  if (parts.some((p) => p === '..' || p.startsWith('.'))) return null;
  if (decoded.toLowerCase().endsWith('.map')) return null;
  const full = path.join(root, ...parts);
  const rel = path.relative(root, full);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return full;
}

// Decodes, drops the query, collapses repeated slashes and lowercases, so //Internal-Archive/ cannot slip past a check.
export function normalizePath(urlPath) {
  const bare = String(urlPath).split('?')[0].split('#')[0];
  let decoded;
  try {
    decoded = decodeURIComponent(bare);
  } catch {
    decoded = bare;
  }
  return decoded.replace(/\/{2,}/g, '/').toLowerCase();
}

const isPage = (p) => p.endsWith('/') || !path.extname(p) || p.endsWith('.html');

const DEFAULT_LIMITS = {
  page: { capacity: 40, refillPerSec: 1 },
  asset: { capacity: 400, refillPerSec: 20 },
  maxAuthFailures: 5,
  lockSeconds: 900,
  banSeconds: 3600,
};

export class Guard {
  constructor({ user, password, now = Date.now, limits = {} }) {
    this.expected = { user, password };
    this.now = now;
    this.limits = { ...DEFAULT_LIMITS, ...limits };
    this.pages = new TokenBucket({ ...this.limits.page, now });
    this.assets = new TokenBucket({ ...this.limits.asset, now });
    this.failures = new Map();
    this.locked = new Map();
    this.banned = new Map();
  }

  // Returns what the server must do. { allow: true } means serve the file; otherwise status, headers and reason say why not.
  check({ ip, method, urlPath, headers }) {
    const t = this.now();
    const deny = (status, reason, extra = {}) => ({ allow: false, status, reason, ...extra, headers: { ...SECURITY_HEADERS, ...extra.headers } });
    const p = normalizePath(urlPath);

    if (this.banned.get(ip) > t) return deny(403, 'banned');
    if (p === HONEYPOT.slice(0, -1) || p.startsWith(HONEYPOT)) {
      this.banned.set(ip, t + this.limits.banSeconds * 1000);
      return deny(403, 'honeypot');
    }
    if (method !== 'GET' && method !== 'HEAD') return deny(405, 'method', { headers: { Allow: 'GET, HEAD' } });

    // robots.txt is public on purpose: a well-behaved crawler must be able to read that it is not welcome.
    if (p === '/robots.txt') {
      if (!this.assets.take(ip).ok) return deny(429, 'rate-limit', { headers: { 'Retry-After': '5' } });
      return { allow: false, status: 200, reason: 'robots', body: robotsTxt(), type: 'text/plain; charset=utf-8', headers: SECURITY_HEADERS };
    }

    const agent = classifyAgent(headers['user-agent']);
    if (agent.blocked) return deny(403, agent.reason + (agent.match ? `:${agent.match}` : ''));

    const bucket = isPage(p) ? this.pages : this.assets;
    const taken = bucket.take(ip);
    if (!taken.ok) return deny(429, 'rate-limit', { headers: { 'Retry-After': String(taken.retryAfterSec) } });

    const lockedUntil = this.locked.get(ip);
    if (lockedUntil > t) return deny(429, 'locked', { headers: { 'Retry-After': String(Math.ceil((lockedUntil - t) / 1000)) } });

    const given = parseBasic(headers.authorization);
    if (!given || !credentialsMatch(given, this.expected)) {
      if (given) this.recordFailure(ip, t);
      return deny(401, given ? 'bad-credentials' : 'no-credentials', {
        headers: { 'WWW-Authenticate': 'Basic realm="BMR docs (private)", charset="UTF-8"' },
      });
    }
    this.failures.delete(ip);
    return { allow: true, headers: SECURITY_HEADERS };
  }

  recordFailure(ip, t) {
    const list = (this.failures.get(ip) ?? []).filter((x) => t - x < this.limits.lockSeconds * 1000);
    list.push(t);
    this.failures.set(ip, list);
    if (list.length >= this.limits.maxAuthFailures) {
      this.locked.set(ip, t + this.limits.lockSeconds * 1000);
      this.failures.delete(ip);
    }
  }
}
