import { defineConfig } from 'vite';
import { wsx } from '@wsxjs/wsx-vite-plugin';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    wsx({
      debug: false,
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
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
      fileName: format => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    sourcemap: true, // 生成 source map
    rollupOptions: {
      external: ['@quizerjs/core', '@quizerjs/dsl', '@editorjs/editorjs', '@wsxjs/wsx-core'],
    },
  },
});
