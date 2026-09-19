import { defineConfig } from 'vitest/config'

// The Loudspeaker Check calculation and its pages are tested here; the docs site itself is built by Docusaurus.
export default defineConfig({
  // The card tests render the React components, which use the automatic JSX runtime like the site does.
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    include: ['src/components/LoudspeakerCheck/__tests__/**/*.test.ts'],
    environment: 'node',
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
