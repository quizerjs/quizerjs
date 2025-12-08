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
      // 直接指向源码，确保 HMR 正常工作
      '@quizerjs/vue': path.resolve(__dirname, '../../packages/vue/src'),
      '@quizerjs/quizerjs': path.resolve(__dirname, '../../packages/quizerjs/src'),
      '@quizerjs/core': path.resolve(__dirname, '../../packages/core/src'),
      '@quizerjs/dsl': path.resolve(__dirname, '../../packages/dsl/src'),
      '@quizerjs/editorjs-tool': path.resolve(__dirname, '../../packages/editorjs-tool/src'),
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
    // 强制重新预构建
    force: true,
  },
  server: {
    port: 5174,
    open: true,
    hmr: {
      // 启用 HMR
      protocol: 'ws',
      host: 'localhost',
      port: 5174,
    },
    watch: {
      // 监听 workspace 包的源码变化
      ignored: ['!**/node_modules/@quizerjs/**', '!**/packages/**', '!**/demos/**'],
      // 使用轮询模式（在某些文件系统上更可靠）
      usePolling: false,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
  },
});
