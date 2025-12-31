import { defineConfig } from 'vite';
import { resolve } from 'path';
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
        index: resolve(__dirname, 'src/index.ts'),
        player: resolve(__dirname, 'src/player.ts'),
        editor: resolve(__dirname, 'src/editor.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    sourcemap: true, // 生成 source map
    minify: false, // 不压缩
    rollupOptions: {
      external: ['@slidejs/theme'],
    },
  },
});
