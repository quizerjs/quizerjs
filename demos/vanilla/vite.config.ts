import { defineConfig } from 'vite';
import path from 'path';
import { wsx } from '@wsxjs/wsx-vite-plugin';

export default defineConfig({
  plugins: [
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
      '@quizerjs/quizerjs': path.resolve(__dirname, '../../packages/quizerjs/src'),
      '@quizerjs/core': path.resolve(__dirname, '../../packages/core/src'),
      '@quizerjs/dsl': path.resolve(__dirname, '../../packages/dsl/src'),
      '@quizerjs/editorjs-tool': path.resolve(__dirname, '../../packages/editorjs-tool/src'),
      '@quizerjs/sample-data': path.resolve(__dirname, '../../packages/sample-data/src'),
    },
    // 在开发环境中优先使用源码（source 字段）
    conditions: ['source', 'import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    exclude: ['@quizerjs/quizerjs', '@quizerjs/core', '@quizerjs/dsl', '@quizerjs/editorjs-tool'],
    // 强制重新预构建
    force: true,
  },
  base: process.env.GITHUB_PAGES === 'true' ? '/demos/vanilla/' : '/',
  server: {
    port: 5179,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
  },
});
