# Loudspeaker Check

The interactive check on **Technology & Concepts › Acoustics › Loudspeaker Check**, and the calculation
behind it. This is the working copy: change the calculation here.

- `lib/` — the engine. `constants.ts` holds every number with the source it comes from, `scoring.ts` the
  model, `examples.ts` the looked-up loudspeakers.
- `__tests__/` — the tests that pin the model, the real datasheets and the public-safety rules.
- The rest — the React components of the page. `../../../docs/acoustics/loudspeaker-check/` holds the two
  pages themselves.

```bash
npm test          # vitest
npm run start     # the docs site
```

The measurement data, queries and analyses that the constants in `lib/constants.ts` rest on are kept
internally, with the method notes. When a constant changes here, its evidence is recorded there.

This repository is public: no references to internal services, repositories, databases or their fields
belong in these files. `__tests__/public-safety.test.ts` enforces that.
