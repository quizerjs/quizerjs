import { defineConfig } from 'vite';
import { resolve } from 'path';

const themes = ['solarized-light', 'solarized-dark', 'light', 'dark'];

export default defineConfig({
  // 预览服务器配置
  // vite preview 默认预览 dist/ 目录
  // 但我们需要从项目根目录服务，以便同时访问 index.html 和 dist/
  root: '.',
  preview: {
    port: 5177,
    open: 'index.html',
    cors: true,
    // 确保预览服务器从项目根目录服务（而不是 dist/）
    // 这样 index.html 和 dist/*.css 都可以访问
  },
  // 开发服务器配置（用于开发时预览页面，支持 HMR）
  server: {
    port: 5177,
    open: '/index.html',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5177,
    },
    watch: {
      // 监听 SCSS 文件变化
      include: ['styles/**/*.scss', 'index.html'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // 构建 base.css、所有主题文件、CLI 工具和 debug 页面
      input: {
        base: resolve(__dirname, 'styles/base.scss'),
        ...Object.fromEntries(themes.map(t => [t, resolve(__dirname, `styles/${t}.scss`)])),
        // CLI 工具入口
        index: resolve(__dirname, 'src/index.ts'),
      },
      output: {
        entryFileNames: chunkInfo => {
          // CLI 工具输出为 index.js
          if (chunkInfo.name === 'index') {
            return 'index.js';
          }
          // CSS 入口点不需要 JS 输出
          return 'dummy.js';
        },
        assetFileNames: assetInfo => {
          if (assetInfo.name?.endsWith('.css')) {
            return '[name].css';
          }
          return '[name][extname]';
        },
      },
      // 外部化 Node.js 内置模块，CLI 工具需要这些
      external: id => {
        // Node.js 内置模块
        if (['fs', 'path', 'url', 'util', 'stream', 'events', 'os', 'crypto'].includes(id)) {
          return true;
        }
        // Node.js 内置模块（带 node: 前缀）
        if (id.startsWith('node:')) {
          return true;
        }
        return false;
      },
    },
    cssCodeSplit: true, // 启用代码分割，每个入口生成独立的 CSS 文件
    // 为 CLI 工具配置
    target: 'node18',
    format: 'es',
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 只对主题文件自动注入 base.scss，base.scss 本身不需要
        additionalData: (content, filename) => {
          // 如果是 base.scss 本身，不注入
          if (filename.includes('base.scss') && !filename.includes('base-only')) {
            return content;
          }
          // 其他文件（主题文件）自动注入 base.scss
          return `@import "${resolve(__dirname, 'styles/base.scss')}";\n${content}`;
        },
      },
    },
  },
});
