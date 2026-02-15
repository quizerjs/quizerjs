import { defineConfig } from 'vitest/config';
import { wsx } from '@wsxjs/wsx-vite-plugin';

import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@quizerjs/dsl': path.resolve(__dirname, '../dsl/src/index.ts'),
    },
  },
  plugins: [
    wsx({
      debug: false,
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.wsx'],
      exclude: ['node_modules/', 'dist/', '**/*.config.ts', '**/*.test.ts', '**/types.ts'],
      // 当前基线，后续只可提高不可降低
      thresholds: { statements: 63, branches: 70, functions: 30, lines: 63 },
    },
  },
});
