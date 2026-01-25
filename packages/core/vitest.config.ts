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
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.wsx'],
      exclude: ['node_modules/', 'dist/', '**/*.config.ts', '**/*.test.ts', '**/types.ts'],
    },
  },
});
