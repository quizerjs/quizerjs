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
    setupFiles: ['src/vitest.setup.ts'],
    include: ['src/**/__tests__/**/*.test.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/__tests__/', '**/*.config.ts', '**/*.d.ts'],
      // 当前基线（入口/类型文件未测），后续只可提高不可降低
      thresholds: { statements: 0, branches: 0, functions: 0, lines: 0 },
    },
  },
  optimizeDeps: {
    exclude: ['tough-cookie', 'psl'],
  },
  resolve: {
    conditions: ['source', 'import', 'module', 'browser', 'default'],
  },
});
