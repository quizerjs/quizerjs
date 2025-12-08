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
      entry: {
        index: 'src/index.ts',
        editor: 'src/editor/index.ts',
        player: 'src/player/index.ts',
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}/index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        '@quizerjs/dsl',
        '@quizerjs/core',
        '@quizerjs/editorjs-tool',
        '@editorjs/editorjs',
        '@editorjs/paragraph',
        '@editorjs/header',
        'marked',
      ],
    },
  },
});
