import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 在开发环境中直接使用源码
      '@quizerjs/vue': path.resolve(__dirname, '../vue/src'),
      '@quizerjs/quizerjs': path.resolve(__dirname, '../quizerjs/src'),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
});
