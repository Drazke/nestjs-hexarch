import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    globalSetup: ['test/setup.ts'],
    hookTimeout: 30000,
    include: ['test/**/*.spec.ts'],
    root: './',
    outputFile: 'junit.xml',
    reporters: ['junit', 'default'],
    coverage: {
      reportsDirectory: './coverage',
      include: ['src/**'],
      exclude: ['src/infrastructure/in-memory-storage/**'],
    },
    watch: false,
  },
  plugins: [
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
})
