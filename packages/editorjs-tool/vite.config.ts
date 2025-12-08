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
      entry: {
        index: 'src/index.ts',
        'tools/SingleChoiceTool': 'src/tools/SingleChoiceTool.wsx',
        'tools/MultipleChoiceTool': 'src/tools/MultipleChoiceTool.wsx',
        'tools/TextInputTool': 'src/tools/TextInputTool.wsx',
        'tools/TrueFalseTool': 'src/tools/TrueFalseTool.wsx',
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (entryName === 'index') {
          return `index.${format === 'es' ? 'mjs' : 'js'}`;
        }
        return `${entryName}.${format === 'es' ? 'mjs' : 'js'}`;
      },
    },
    rollupOptions: {
      external: ['@quizerjs/core', '@quizerjs/dsl', '@editorjs/editorjs', '@wsxjs/wsx-core'],
    },
  },
});

