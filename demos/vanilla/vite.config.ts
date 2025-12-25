import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // 在开发环境中优先使用源码（source 字段）
    conditions: ['source', 'import', 'module', 'browser', 'default'],
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
