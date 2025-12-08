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
    rollupOptions: {
      external: ['@wsxjs/wsx-core', '@quizerjs/dsl', 'marked', 'turndown'],
      output: {
        globals: {
          '@wsxjs/wsx-core': 'wsxCore',
          '@quizerjs/dsl': 'quizerjsDsl',
          marked: 'marked',
          turndown: 'TurndownService',
        },
      },
    },
  },
});
