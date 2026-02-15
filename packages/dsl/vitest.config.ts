import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['node_modules/', 'dist/', '**/*.config.ts', '**/*.test.ts', '**/types.ts'],
      // 当前基线，后续只可提高不可降低
      thresholds: { statements: 89, branches: 90, functions: 100, lines: 89 },
    },
  },
});
