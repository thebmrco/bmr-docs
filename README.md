# BETTERMEETINGROOMS Documentation

The public documentation site for BETTERMEETINGROOMS, built with [Docusaurus](https://docusaurus.io/).

Published at **https://thebmrco.github.io/bmr-docs/**

## Before you write a page

Read **[the Style Guide](docs/contributing/style.mdx)** first — or view it rendered, with live component examples, at `/docs/contributing/style` on a running site. It is deliberately unlisted, so it never appears in the reader-facing navigation or search. It holds the decisions every page follows — which of the four page archetypes you are writing, which of the five illustration forms to reach for, and the rulings on spelling, headings, frontmatter and image assets.

The short version:

- British English — organisation, colour, centre, recognise.
- Sentence case for every H2 and H3; sections start at `##`, never `###`.
- `title` and `description` in the frontmatter of every page; `sidebar_label` when the sidebar needs something shorter.
- Images go through `<Figure>`, never a hand-written `<img style={{...}}>`. A caption is required.
- WebP at ≤300 KB and ≤1600 px. `static/img/release/` is for release notes only — evergreen pages must not reference it.

## Install

```bash
npm install
```

## Local development

```bash
npm start
```

Serves the site at **http://localhost:3000/bmr-docs/** with hot reload.

## Build

```bash
npm run build
```

Generates the static site into `build/`. Broken links fail the build (`onBrokenLinks: 'throw'`), so run this before pushing. Note that broken *anchors* are only warned about, not thrown — check in-page `#links` by hand.

Preview the production build locally:

```bash
npm run serve
```

## Tests

```bash
npm test
```

Vitest, covering the Loudspeaker Check calculation.

## Deployment

**Pushing to `main` publishes the site.** `.github/workflows/deploy.yml` builds it and deploys to GitHub Pages on every push, and can also be run manually from the Actions tab.

There is nothing to run by hand — in particular, do not use `npm run deploy`. That command pushes to the `gh-pages` branch, which this site stopped serving from in November 2025; it is dead and left only for history.

## Layout

| Path | What lives there |
|---|---|
| `docs/` | The documentation pages, as MDX |
| `docs/contributing/style.mdx` | The style guide — read before writing. Unlisted: not in the sidebar |
| `docs/release-notes/` | A dated archive. Apply new rulings to new entries only |
| `src/components/` | Shared components — `Figure`, `Callouts`, `FactGrid`, `StepTabs`, `Icon` |
| `src/css/custom.css` | Brand tokens and all component styling |
| `static/img/<section>/` | Page assets, named by subject |
| `static/img/release/` | Release-note assets, dated. Not for evergreen pages |
| `sidebars.ts` | Navigation. Every reader-facing page must appear here |
