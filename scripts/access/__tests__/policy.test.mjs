import { describe, expect, it } from 'vitest';
import {
  AI_CRAWLERS, Guard, HONEYPOT, TokenBucket, classifyAgent, credentialsMatch, normalizePath, parseBasic, robotsTxt, safeJoin,
} from '../policy.mjs';

const BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
const basic = (user, password) => `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;

function clock(start = 1_000_000) {
  let t = start;
  const now = () => t;
  now.advance = (ms) => { t += ms; };
  return now;
}

const request = (over = {}) => ({
  ip: '10.0.0.1',
  method: 'GET',
  urlPath: '/docs/getting-started/faq',
  headers: { 'user-agent': BROWSER, authorization: basic('bmr', 'correct horse battery') },
  ...over,
});

describe('classifyAgent', () => {
  it.each(['GPTBot/1.1', 'Mozilla/5.0 (compatible; ClaudeBot/1.0)', 'CCBot/2.0', 'PerplexityBot/1.0', 'Bytespider', 'Google-Extended'])(
    'blocks the AI crawler %s', (ua) => expect(classifyAgent(ua).blocked).toBe(true),
  );
  it.each(['python-requests/2.32', 'Scrapy/2.11', 'Go-http-client/1.1', 'HTTrack', 'Wget/1.21', 'HeadlessChrome/120'])(
    'blocks the scraping client %s', (ua) => expect(classifyAgent(ua).blocked).toBe(true),
  );
  it('blocks an empty user agent', () => {
    expect(classifyAgent('').reason).toBe('empty-user-agent');
    expect(classifyAgent(undefined).blocked).toBe(true);
  });
  it('lets browsers and curl through', () => {
    expect(classifyAgent(BROWSER).blocked).toBe(false);
    expect(classifyAgent('curl/8.7.1').blocked).toBe(false);
  });
  it('matches without regard to case', () => expect(classifyAgent('gptbot').blocked).toBe(true));
});

describe('robotsTxt', () => {
  const text = robotsTxt();
  it('disallows everything for everyone', () => expect(text).toMatch(/User-agent: \*\nDisallow: \//));
  it('names every listed crawler', () => {
    for (const token of AI_CRAWLERS) expect(text).toContain(`User-agent: ${token}\nDisallow: /`);
  });
  it('mentions the trap path', () => expect(text).toContain(`Disallow: ${HONEYPOT}`));
});

describe('parseBasic and credentialsMatch', () => {
  it('reads a well formed header, with a colon inside the password', () => {
    expect(parseBasic(basic('bmr', 'a:b'))).toEqual({ user: 'bmr', password: 'a:b' });
  });
  it.each([undefined, '', 'Bearer abc', 'Basic', 'Basic !!!', `Basic ${Buffer.from('nocolon').toString('base64')}`])(
    'rejects %s', (header) => expect(parseBasic(header)).toBeNull(),
  );
  it('compares both fields', () => {
    const expected = { user: 'bmr', password: 'secret-password' };
    expect(credentialsMatch({ user: 'bmr', password: 'secret-password' }, expected)).toBe(true);
    expect(credentialsMatch({ user: 'BMR', password: 'secret-password' }, expected)).toBe(false);
    expect(credentialsMatch({ user: 'bmr', password: 'secret-passwor' }, expected)).toBe(false);
    expect(credentialsMatch({ user: '', password: '' }, expected)).toBe(false);
    expect(credentialsMatch(null, expected)).toBe(false);
  });
});

describe('safeJoin', () => {
  const root = '/srv/build';
  it('maps ordinary paths into the folder', () => {
    expect(safeJoin(root, '/docs/faq')).toBe('/srv/build/docs/faq');
    expect(safeJoin(root, '/')).toBe('/srv/build');
    expect(safeJoin(root, '/img/a%20b.png?x=1#y')).toBe('/srv/build/img/a b.png');
  });
  it.each(['/../etc/passwd', '/%2e%2e/etc/passwd', '/docs/..%2f..%2fsecret', '/.env', '/docs/.git/config', '/a%00b', '/app.js.map', '/%E0%A4%A'])(
    'refuses %s', (p) => expect(safeJoin(root, p)).toBeNull(),
  );
});

describe('normalizePath', () => {
  it('decodes, collapses slashes and lowercases', () => {
    expect(normalizePath('//Internal-Archive/%41?x=1')).toBe('/internal-archive/a');
    expect(normalizePath('/%E0%A4%A')).toBe('/%e0%a4%a');
  });
});

describe('TokenBucket', () => {
  it('allows a burst, then refuses, then refills', () => {
    const now = clock();
    const bucket = new TokenBucket({ capacity: 3, refillPerSec: 1, now });
    expect([1, 2, 3].map(() => bucket.take('a').ok)).toEqual([true, true, true]);
    const refused = bucket.take('a');
    expect(refused.ok).toBe(false);
    expect(refused.retryAfterSec).toBe(1);
    now.advance(2000);
    expect(bucket.take('a').ok).toBe(true);
  });
  it('counts each caller on its own', () => {
    const bucket = new TokenBucket({ capacity: 1, refillPerSec: 0.01, now: clock() });
    expect(bucket.take('a').ok).toBe(true);
    expect(bucket.take('a').ok).toBe(false);
    expect(bucket.take('b').ok).toBe(true);
  });
});

describe('Guard', () => {
  const make = (limits) => {
    const now = clock();
    return { now, guard: new Guard({ user: 'bmr', password: 'correct horse battery', now, limits }) };
  };

  it('asks for a sign-in when there is none', () => {
    const { guard } = make();
    const r = guard.check(request({ headers: { 'user-agent': BROWSER } }));
    expect(r.allow).toBe(false);
    expect(r.status).toBe(401);
    expect(r.headers['WWW-Authenticate']).toMatch(/^Basic realm=/);
  });

  it('lets the right credentials through with noindex and no-store headers', () => {
    const { guard } = make();
    const r = guard.check(request());
    expect(r.allow).toBe(true);
    expect(r.headers['X-Robots-Tag']).toContain('noindex');
    expect(r.headers['Cache-Control']).toBe('private, no-store');
    expect(r.headers['Content-Security-Policy']).toContain("default-src 'self'");
  });

  it('locks the address after repeated wrong passwords, even for the right one, then unlocks', () => {
    const { guard, now } = make({ maxAuthFailures: 3, lockSeconds: 60 });
    const bad = request({ headers: { 'user-agent': BROWSER, authorization: basic('bmr', 'wrong') } });
    expect([1, 2, 3].map(() => guard.check(bad).status)).toEqual([401, 401, 401]);
    const locked = guard.check(request());
    expect(locked.status).toBe(429);
    expect(Number(locked.headers['Retry-After'])).toBeGreaterThan(0);
    now.advance(61_000);
    expect(guard.check(request()).allow).toBe(true);
  });

  it('does not count a missing header as a failed guess', () => {
    const { guard } = make({ maxAuthFailures: 2 });
    for (let i = 0; i < 5; i += 1) guard.check(request({ headers: { 'user-agent': BROWSER } }));
    expect(guard.check(request()).allow).toBe(true);
  });

  it('refuses AI crawlers and scraping clients even with the right password', () => {
    const { guard } = make();
    for (const ua of ['GPTBot/1.1', 'python-requests/2.32', '']) {
      const r = guard.check(request({ headers: { 'user-agent': ua, authorization: basic('bmr', 'correct horse battery') } }));
      expect(r.status).toBe(403);
    }
  });

  it('serves robots.txt to everyone, crawlers included', () => {
    const { guard } = make();
    const r = guard.check(request({ urlPath: '/robots.txt', headers: { 'user-agent': 'GPTBot/1.1' } }));
    expect(r.status).toBe(200);
    expect(r.body).toContain('User-agent: GPTBot');
  });

  it('bans whoever touches the trap path, whatever the spelling, for every later request', () => {
    const { guard, now } = make({ banSeconds: 100 });
    expect(guard.check(request({ urlPath: '//Internal-Archive/secret.html' })).reason).toBe('honeypot');
    const after = guard.check(request());
    expect(after.status).toBe(403);
    expect(after.reason).toBe('banned');
    expect(guard.check(request({ ip: '10.0.0.2' })).allow).toBe(true);
    now.advance(101_000);
    expect(guard.check(request()).allow).toBe(true);
  });

  it('limits page requests per address and says when to retry', () => {
    const { guard } = make({ page: { capacity: 3, refillPerSec: 0.5 } });
    expect([1, 2, 3].map(() => guard.check(request()).allow)).toEqual([true, true, true]);
    const r = guard.check(request());
    expect(r.status).toBe(429);
    expect(r.headers['Retry-After']).toBe('2');
    expect(guard.check(request({ ip: '10.0.0.9' })).allow).toBe(true);
  });

  it('keeps assets on a roomier allowance than pages', () => {
    const { guard } = make({ page: { capacity: 1, refillPerSec: 0.01 }, asset: { capacity: 50, refillPerSec: 1 } });
    for (let i = 0; i < 20; i += 1) expect(guard.check(request({ urlPath: `/assets/js/chunk-${i}.js` })).allow).toBe(true);
  });

  it('answers anything but GET and HEAD with 405', () => {
    const { guard } = make();
    for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']) expect(guard.check(request({ method })).status).toBe(405);
    expect(guard.check(request({ method: 'HEAD' })).allow).toBe(true);
  });
});
