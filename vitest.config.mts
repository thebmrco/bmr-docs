import { defineConfig } from 'vitest/config'

// The Loudspeaker Check calculation and its pages are tested here; the docs site itself is built by Docusaurus.
export default defineConfig({
  test: {
    include: ['src/components/LoudspeakerCheck/__tests__/**/*.test.ts'],
    environment: 'node',
  },
})
