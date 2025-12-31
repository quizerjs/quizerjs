import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
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
      fileName: format => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    sourcemap: true, // 生成 source map
    minify: false, // 不压缩
    rollupOptions: {
      external: ['vue', '@quizerjs/dsl', '@quizerjs/core', '@quizerjs/quizerjs'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
