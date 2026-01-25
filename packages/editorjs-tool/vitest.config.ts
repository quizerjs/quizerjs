import { defineConfig } from 'vitest/config';
import { wsx } from '@wsxjs/wsx-vite-plugin';

export default defineConfig({
  plugins: [
    wsx({
      debug: false,
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/__tests__/**/*.test.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/__tests__/', '**/*.config.ts', '**/*.d.ts'],
    },
  },
  optimizeDeps: {
    exclude: ['tough-cookie', 'psl'],
  },
  resolve: {
    conditions: ['source', 'import', 'module', 'browser', 'default'],
  },
});
