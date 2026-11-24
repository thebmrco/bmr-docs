// Builds the docs for the protected preview into build-private/, then checks the result:
// no sitemap, no analytics, noindex on every page, nothing loaded from another host.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { robotsTxt } from './policy.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = 'build-private';

export function walk(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else found.push(full);
  }
  return found;
}

// custom.css imports Inter from Google, so every reader's browser would contact Google. The private
// preview drops that import (the font stack falls back to the system font) instead of calling out.
const GOOGLE_FONTS_IMPORT = /@import\s+url\(\s*["']?https?:\/\/fonts\.googleapis\.com[^)]*\)\s*;?/gi;
const NOINDEX_META = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai">';

export function sanitize(outDir) {
  let fontImports = 0;
  let stubs = 0;
  for (const f of walk(outDir)) {
    const ext = path.extname(f).toLowerCase();
    if (ext === '.css') {
      const css = fs.readFileSync(f, 'utf8');
      const cleaned = css.replace(GOOGLE_FONTS_IMPORT, () => {
        fontImports += 1;
        return '';
      });
      if (cleaned !== css) fs.writeFileSync(f, cleaned);
    } else if (ext === '.html') {
      // Redirect stubs from the client-redirects plugin have no Helmet, so they get the tag here.
      const html = fs.readFileSync(f, 'utf8');
      if (html.includes('http-equiv="refresh"') && !/name="robots"/i.test(html)) {
        fs.writeFileSync(f, html.replace('<head>', `<head>\n    ${NOINDEX_META}`));
        stubs += 1;
      }
    }
  }
  return { fontImports, stubs };
}

// Absolute http(s) addresses a page would fetch on its own. Plain links the reader clicks are not loads.
const LOADS = [
  /<(?:script|img|iframe|source|video|audio|embed)\b[^>]*?\bsrc=["'](https?:)?\/\/([^"'/]+)/gi,
  /<link\b[^>]*?\brel=["'](?:stylesheet|preload|prefetch|modulepreload|icon)["'][^>]*?\bhref=["'](https?:)?\/\/([^"'/]+)/gi,
  /<link\b[^>]*?\bhref=["'](https?:)?\/\/([^"'/]+)["'][^>]*?\brel=["'](?:stylesheet|preload|prefetch|modulepreload|icon)["']/gi,
  /url\(\s*["']?(https?:)?\/\/([^)"'/]+)/gi,
  /@import\s+["'](https?:)?\/\/([^"'/]+)/gi,
];

export function audit(outDir) {
  const problems = [];
  const files = walk(outDir);
  const names = files.map((f) => path.relative(outDir, f));

  for (const n of names) {
    if (/(^|\/)sitemap[^/]*\.xml$/i.test(n)) problems.push(`sitemap in the build: ${n}`);
    if (n.endsWith('.map')) problems.push(`source map in the build: ${n}`);
  }

  const hosts = new Map();
  let pages = 0;
  let withoutNoindex = 0;
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (!['.html', '.js', '.css'].includes(ext)) continue;
    const text = fs.readFileSync(f, 'utf8');
    if (/googletagmanager\.com|google-analytics\.com/.test(text)) problems.push(`analytics reference in ${path.relative(outDir, f)}`);
    if (ext === '.html') {
      pages += 1;
      if (!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(text)) withoutNoindex += 1;
    }
    for (const re of LOADS) {
      for (const m of text.matchAll(new RegExp(re.source, re.flags))) {
        hosts.set(m[2], (hosts.get(m[2]) ?? 0) + 1);
      }
    }
  }
  if (withoutNoindex) problems.push(`${withoutNoindex} of ${pages} HTML pages have no noindex meta tag`);
  for (const [host, n] of hosts) problems.push(`loads from another host: ${host} (${n}x)`);
  return { problems, pages, files: files.length };
}

function main() {
  const out = path.join(repoRoot, OUT);
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    BMR_DOCS_PRIVATE: '1',
    DOCUSAURUS_GENERATED_FILES_DIR_NAME: '.docusaurus-build',
  };
  const build = spawnSync('npx', ['docusaurus', 'build', '--out-dir', OUT], { cwd: repoRoot, env, stdio: 'inherit' });
  if (build.status !== 0) process.exit(build.status ?? 1);

  fs.writeFileSync(path.join(out, 'robots.txt'), robotsTxt());
  const { fontImports, stubs } = sanitize(out);
  if (fontImports) console.log(`\nRemoved the Google Fonts import from ${fontImports} stylesheet(s); the preview uses the system font.`);
  if (stubs) console.log(`Added noindex to ${stubs} redirect stub(s).`);
  const { problems, pages, files } = audit(out);
  console.log(`\nChecked ${pages} pages and ${files} files in ${OUT}/`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
    process.exit(2);
  }
  console.log('No sitemap, no analytics, noindex on every page, nothing loaded from another host.');
  console.log(fs.existsSync(path.join(out, 'search-index.json')) ? 'Search index present: it is served only after sign-in. Build with BMR_DOCS_SEARCH=off to leave it out.' : 'No search index.');
  console.log('Next: npm run serve:private');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
