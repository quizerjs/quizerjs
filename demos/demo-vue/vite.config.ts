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
      // 在开发环境中直接使用源码（作为后备方案）
      '@quizerjs/vue': path.resolve(__dirname, '../../packages/vue/src'),
      '@quizerjs/quizerjs': path.resolve(__dirname, '../../packages/quizerjs/src'),
      '@quizerjs/core': path.resolve(__dirname, '../../packages/core/src'),
      '@quizerjs/dsl': path.resolve(__dirname, '../../packages/dsl/src'),
    },
    // 在开发环境中优先使用源码（source 字段）
    conditions: ['source', 'import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    exclude: ['@quizerjs/vue', '@quizerjs/quizerjs', '@quizerjs/core', '@quizerjs/dsl'],
  },
  server: {
    port: 5174,
    open: true,
    sourcemap: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
  },
});
