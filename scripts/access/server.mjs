// Protected local preview of the built docs (build-private/): sign-in, crawler blocking,
// rate limits and security headers from policy.mjs. Listens on 127.0.0.1 only unless told otherwise.
// Usage: npm run build:private, then npm run serve:private
import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Guard, normalizePath, safeJoin } from './policy.mjs';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.usdz': 'model/vnd.usdz+zip',
  '.glb': 'model/gltf-binary',
};

const BODIES = {
  401: 'Sign-in required.\n',
  403: 'Forbidden.\n',
  404: 'Not found.\n',
  405: 'Method not allowed.\n',
  429: 'Too many requests.\n',
};

const MIN_PASSWORD = 12;

// Order: environment, then the git-ignored local file, then a new random password written to that file.
export function loadCredentials({ env = process.env, file = path.join(repoRoot, '.docs-access.local.json') } = {}) {
  if (env.BMR_DOCS_USER && env.BMR_DOCS_PASSWORD) {
    if (env.BMR_DOCS_PASSWORD.length < MIN_PASSWORD) throw new Error(`BMR_DOCS_PASSWORD needs at least ${MIN_PASSWORD} characters.`);
    return { user: env.BMR_DOCS_USER, password: env.BMR_DOCS_PASSWORD, source: 'environment' };
  }
  if (fs.existsSync(file)) {
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (saved.user && saved.password) return { user: saved.user, password: saved.password, source: file };
  }
  const created = { user: 'bmr', password: crypto.randomBytes(18).toString('base64url') };
  fs.writeFileSync(file, `${JSON.stringify(created, null, 2)}\n`, { mode: 0o600 });
  return { ...created, source: file, created: true };
}

export function clientIp(req, trustProxy) {
  if (trustProxy) {
    const parts = String(req.headers['x-forwarded-for'] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1]; // the address the trusted proxy saw, not a value the client wrote
  }
  return req.socket.remoteAddress ?? 'unknown';
}

async function resolveFile(root, urlPath) {
  const base = safeJoin(root, urlPath);
  if (!base) return null;
  const clean = urlPath.split('?')[0].split('#')[0];
  const candidates = clean.endsWith('/') ? [path.join(base, 'index.html')] : [base, `${base}.html`, path.join(base, 'index.html')];
  const realRoot = await fsp.realpath(root);
  for (const c of candidates) {
    try {
      const real = await fsp.realpath(c);
      if (real !== realRoot && !real.startsWith(realRoot + path.sep)) continue; // a link pointing out of the build folder
      const st = await fsp.stat(real);
      if (st.isFile()) return { file: real, size: st.size };
    } catch {
      // try the next candidate
    }
  }
  return null;
}

export function createServer({ root, guard, trustProxy = false, log = () => {} }) {
  return http.createServer(async (req, res) => {
    const ip = clientIp(req, trustProxy);
    const send = (status, headers, body) => {
      res.writeHead(status, { 'Content-Length': Buffer.byteLength(body ?? ''), ...headers });
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    try {
      const target = req.url ?? '/';
      if (target.length > 2048 || !target.startsWith('/')) return send(400, {}, 'Bad request.\n');

      const verdict = guard.check({ ip, method: req.method, urlPath: target, headers: req.headers });
      if (!verdict.allow) {
        if (verdict.status >= 400) log({ ip, status: verdict.status, reason: verdict.reason, path: normalizePath(target).slice(0, 120), agent: String(req.headers['user-agent'] ?? '').slice(0, 80) });
        const type = verdict.type ?? 'text/plain; charset=utf-8';
        return send(verdict.status, { ...verdict.headers, 'Content-Type': type }, verdict.body ?? BODIES[verdict.status] ?? '');
      }

      let hit = await resolveFile(root, target);
      let status = 200;
      if (!hit) {
        hit = await resolveFile(root, '/404.html');
        status = 404;
        if (!hit) return send(404, { ...verdict.headers, 'Content-Type': 'text/plain; charset=utf-8' }, BODIES[404]);
      }
      const type = TYPES[path.extname(hit.file).toLowerCase()] ?? 'application/octet-stream';
      res.writeHead(status, { ...verdict.headers, 'Content-Type': type, 'Content-Length': hit.size });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(hit.file).on('error', () => res.destroy()).pipe(res);
    } catch (error) {
      log({ ip, status: 500, reason: 'error', message: String(error?.message ?? error) });
      if (!res.headersSent) send(500, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Server error.\n');
      else res.destroy();
    }
  });
}

function main() {
  const root = path.resolve(repoRoot, process.env.BMR_DOCS_ROOT ?? 'build-private');
  if (!fs.existsSync(path.join(root, 'index.html'))) {
    console.error(`No build found in ${root}. Run: npm run build:private`);
    process.exit(1);
  }
  const creds = loadCredentials();
  const port = Number(process.env.BMR_DOCS_PORT ?? 3100);
  const host = process.env.BMR_DOCS_HOST ?? '127.0.0.1';
  const limit = (name, fallback) => (process.env[name] ? Number(process.env[name]) : fallback);
  const guard = new Guard({
    user: creds.user,
    password: creds.password,
    limits: {
      lockSeconds: limit('BMR_DOCS_LOCK_SECONDS', 900),
      banSeconds: limit('BMR_DOCS_BAN_SECONDS', 3600),
      maxAuthFailures: limit('BMR_DOCS_MAX_FAILURES', 5),
    },
  });
  const quiet = process.env.BMR_DOCS_QUIET === '1';
  const server = createServer({
    root,
    guard,
    trustProxy: process.env.BMR_DOCS_TRUST_PROXY === '1',
    log: (entry) => !quiet && console.log(JSON.stringify({ t: new Date().toISOString(), ...entry })),
  });
  server.listen(port, host, () => {
    console.log(`Protected docs preview: http://${host === '127.0.0.1' ? 'localhost' : host}:${port}`);
    console.log(`Sign in as "${creds.user}". Password: ${creds.created ? creds.password : `kept in ${creds.source}`}`);
    if (creds.created) console.log(`Saved to ${creds.source} (git-ignored, owner-only). Delete the file to get a new password.`);
    console.log('Press Ctrl+C to stop.');
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
