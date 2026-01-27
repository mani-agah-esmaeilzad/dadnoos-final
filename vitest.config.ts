import path from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: __dirname,
  test: {
    environment: 'node',
    setupFiles: ['tests/setupEnv.ts'],
  },
  resolve: {
    alias: [
      { find: '@/', replacement: `${path.resolve(__dirname)}/` },
      { find: '@', replacement: path.resolve(__dirname) },
    ],
  },
})
