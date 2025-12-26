import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SlideJsSplide',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        '@slidejs/core',
        '@slidejs/runner',
        '@slidejs/dsl',
        '@slidejs/context',
        '@splidejs/splide',
        // Only externalize JS modules from splide, NOT CSS
        /^@splidejs\/splide\/.*\.js$/,
      ],
    },
    sourcemap: true,
  },
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['**/*.test.ts'],
      rollupTypes: true,
    }),
  ],
});
