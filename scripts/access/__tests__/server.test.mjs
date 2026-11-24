import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Guard } from '../policy.mjs';
import { clientIp, createServer, loadCredentials } from '../server.mjs';

const BROWSER = 'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Safari/605.1.15';
const PASSWORD = 'correct horse battery';
const AUTH = `Basic ${Buffer.from(`bmr:${PASSWORD}`).toString('base64')}`;

let dir;
let outside;
let server;
let port;
const logged = [];

function get(target, { method = 'GET', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: target, method, headers: { 'user-agent': BROWSER, ...headers } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end();
  });
}
const signedIn = (target, opts = {}) => get(target, { ...opts, headers: { authorization: AUTH, ...opts.headers } });

beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bmr-build-'));
  outside = fs.mkdtempSync(path.join(os.tmpdir(), 'bmr-outside-'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<h1>Home</h1>');
  fs.mkdirSync(path.join(dir, 'docs', 'faq'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'docs', 'faq', 'index.html'), '<h1>FAQ</h1>');
  fs.writeFileSync(path.join(dir, 'docs', 'about.html'), '<h1>About</h1>');
  fs.writeFileSync(path.join(dir, '404.html'), '<h1>Gone</h1>');
  fs.writeFileSync(path.join(dir, 'app.js'), 'console.log(1)');
  fs.writeFileSync(path.join(dir, 'app.js.map'), '{"sources":["secret.ts"]}');
  fs.writeFileSync(path.join(dir, '.env'), 'TOKEN=abc');
  fs.writeFileSync(path.join(outside, 'secret.txt'), 'outside the build folder');
  fs.symlinkSync(path.join(outside, 'secret.txt'), path.join(dir, 'link.txt'));

  const guard = new Guard({ user: 'bmr', password: PASSWORD, limits: { page: { capacity: 1000, refillPerSec: 1000 }, asset: { capacity: 1000, refillPerSec: 1000 } } });
  server = createServer({ root: dir, guard, log: (e) => logged.push(e) });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  port = server.address().port;
});

afterAll(async () => {
  await new Promise((r) => server.close(r));
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(outside, { recursive: true, force: true });
});

describe('private docs server', () => {
  it('asks for a sign-in and gives nothing away before it', async () => {
    const r = await get('/');
    expect(r.status).toBe(401);
    expect(r.headers['www-authenticate']).toMatch(/^Basic/);
    expect(r.body).not.toContain('Home');
  });

  it('answers a wrong password the same way as no password', async () => {
    const r = await get('/', { headers: { authorization: `Basic ${Buffer.from('bmr:nope').toString('base64')}` } });
    expect(r.status).toBe(401);
  });

  it('serves pages after sign-in with noindex, no-store and a content policy', async () => {
    const r = await signedIn('/');
    expect(r.status).toBe(200);
    expect(r.body).toBe('<h1>Home</h1>');
    expect(r.headers['x-robots-tag']).toContain('noindex');
    expect(r.headers['cache-control']).toBe('private, no-store');
    expect(r.headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(r.headers['content-type']).toMatch(/^text\/html/);
  });

  it('finds folder indexes, .html files and a styled 404', async () => {
    expect((await signedIn('/docs/faq/')).body).toBe('<h1>FAQ</h1>');
    expect((await signedIn('/docs/faq')).body).toBe('<h1>FAQ</h1>');
    expect((await signedIn('/docs/about')).body).toBe('<h1>About</h1>');
    const missing = await signedIn('/docs/missing');
    expect(missing.status).toBe(404);
    expect(missing.body).toBe('<h1>Gone</h1>');
  });

  it('supports HEAD without a body', async () => {
    const r = await signedIn('/app.js', { method: 'HEAD' });
    expect(r.status).toBe(200);
    expect(r.body).toBe('');
    expect(r.headers['content-length']).toBe('14');
  });

  it('never leaves the build folder', async () => {
    for (const p of ['/..%2f..%2fetc%2fpasswd', '/%2e%2e/%2e%2e/etc/passwd', '/docs/%2e%2e/%2e%2e/x', '/link.txt']) {
      const r = await signedIn(p);
      expect(r.status).toBe(404);
      expect(r.body).not.toContain('outside the build folder');
      expect(r.body).not.toContain('root:');
    }
  });

  it('hides dotfiles and source maps', async () => {
    expect((await signedIn('/.env')).status).toBe(404);
    expect((await signedIn('/app.js.map')).status).toBe(404);
  });

  it('serves robots.txt to anyone and refuses declared crawlers everywhere else', async () => {
    const robots = await get('/robots.txt', { headers: { 'user-agent': 'GPTBot/1.1' } });
    expect(robots.status).toBe(200);
    expect(robots.body).toContain('User-agent: *');
    const page = await signedIn('/', { headers: { 'user-agent': 'ClaudeBot/1.0' } });
    expect(page.status).toBe(403);
  });

  it('refuses methods that change things', async () => {
    const r = await signedIn('/', { method: 'POST' });
    expect(r.status).toBe(405);
    expect(r.headers.allow).toBe('GET, HEAD');
  });

  it('logs refusals without ever writing credentials', async () => {
    await get('/', { headers: { authorization: `Basic ${Buffer.from('bmr:guess-guess-guess').toString('base64')}` } });
    const text = JSON.stringify(logged);
    expect(text).toContain('bad-credentials');
    expect(text).not.toContain('guess-guess-guess');
    expect(text).not.toContain(PASSWORD);
  });

  it('bans a caller that follows the trap link', async () => {
    const first = await signedIn('/internal-archive/');
    expect(first.status).toBe(403);
    const later = await signedIn('/');
    expect(later.status).toBe(403);
  });
});

describe('clientIp', () => {
  const req = (xff) => ({ headers: xff ? { 'x-forwarded-for': xff } : {}, socket: { remoteAddress: '127.0.0.1' } });
  it('uses the socket address unless a proxy is trusted', () => expect(clientIp(req('1.2.3.4'), false)).toBe('127.0.0.1'));
  it('takes the address the trusted proxy saw, not what the client wrote first', () => {
    expect(clientIp(req('6.6.6.6, 203.0.113.9'), true)).toBe('203.0.113.9');
    expect(clientIp(req(undefined), true)).toBe('127.0.0.1');
  });
});

describe('loadCredentials', () => {
  const tmp = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bmr-cred-')), 'creds.json');

  it('takes the environment first and insists on a long password', () => {
    expect(() => loadCredentials({ env: { BMR_DOCS_USER: 'a', BMR_DOCS_PASSWORD: 'short' }, file: tmp() })).toThrow(/at least 12/);
    expect(loadCredentials({ env: { BMR_DOCS_USER: 'a', BMR_DOCS_PASSWORD: 'long enough pass' }, file: tmp() })).toMatchObject({ user: 'a', source: 'environment' });
  });

  it('creates a random password once, owner-only, then reuses it', () => {
    const file = tmp();
    const first = loadCredentials({ env: {}, file });
    expect(first.created).toBe(true);
    expect(first.password.length).toBeGreaterThanOrEqual(20);
    expect(fs.statSync(file).mode & 0o777).toBe(0o600);
    const second = loadCredentials({ env: {}, file });
    expect(second.password).toBe(first.password);
    expect(second.created).toBeUndefined();
  });
});
