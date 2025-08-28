import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    // Fix hanging test runner
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Ensure tests exit properly
    watch: false,
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 1000,
    reporters: [
      ['default', { summary: false }]
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})