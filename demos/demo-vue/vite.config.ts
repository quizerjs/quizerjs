import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { wsx } from '@wsxjs/wsx-vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    wsx({
      debug: false,
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // 在开发环境中优先使用源码（source 字段）
    conditions: ['source', 'import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    exclude: [
      '@quizerjs/vue',
      '@quizerjs/quizerjs',
      '@quizerjs/core',
      '@quizerjs/dsl',
      '@quizerjs/editorjs-tool',
    ],
  },
  server: {
    port: 5174,
    open: true,
    watch: {
      // 监听 workspace 包的源码变化
      ignored: ['!**/node_modules/@quizerjs/**'],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
  },
});
