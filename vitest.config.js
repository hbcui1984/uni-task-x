import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/setup.js'],
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      include: ['uniCloud-alipay/cloudfunctions/**/*.js'],
      exclude: ['**/node_modules/**', '**/package.json'],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage'
    }
  }
})
