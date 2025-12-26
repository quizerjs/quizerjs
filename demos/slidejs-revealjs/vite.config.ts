import { defineConfig } from 'vite';
import { wsx } from '@wsxjs/wsx-vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    // wsx 插件 - 处理 .wsx 文件
    wsx({
      debug: process.env.NODE_ENV === 'development',
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 开发模式：直接使用源码，支持 HMR
      ...(process.env.NODE_ENV === 'development'
        ? {
            '@slidejs/core': path.resolve(__dirname, '../../packages/@slidejs/core/src'),
            '@slidejs/runner': path.resolve(__dirname, '../../packages/@slidejs/runner/src'),
            '@slidejs/context': path.resolve(__dirname, '../../packages/@slidejs/context/src'),
            '@slidejs/dsl': path.resolve(__dirname, '../../packages/@slidejs/dsl/src'),
            '@slidejs/runner-revealjs': path.resolve(__dirname, '../../packages/@slidejs/runner-revealjs/src'),
          }
        : {}),
    },
    conditions: ['source', 'import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    exclude: [
      '@slidejs/core',
      '@slidejs/runner',
      '@slidejs/context',
      '@slidejs/dsl',
      '@slidejs/runner-revealjs',
      '@wsxjs/wsx-core',
    ],
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },
    watch: {
      // 监听 workspace 包的源码变化
      ignored: ['!**/node_modules/@slidejs/**', '!**/packages/**'],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
