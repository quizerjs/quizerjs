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
  },
});
