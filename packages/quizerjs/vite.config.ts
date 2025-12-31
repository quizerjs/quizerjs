import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  resolve: {
    conditions: ['source', 'import', 'module', 'browser', 'default'],
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    sourcemap: true, // 生成 source map
    minify: false, // 不压缩
    rollupOptions: {
      external: [
        '@quizerjs/dsl',
        '@quizerjs/core',
        '@quizerjs/editorjs-tool',
        '@editorjs/editorjs',
        '@editorjs/paragraph',
        '@editorjs/header',
        'marked',
        '@slidejs/runner-swiper',
        '@slidejs/runner',
        '@slidejs/context',
        '@slidejs/core',
        '@slidejs/dsl',
        'swiper',
      ],
    },
  },
});
