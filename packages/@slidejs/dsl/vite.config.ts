import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/generated/**/*'],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'SlideDSL',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@slidejs/core', '@slidejs/context'],
    },
    sourcemap: true,
  },
});
