import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'SlideCore',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@slidejs/context'],
    },
    sourcemap: true,
  },
});
