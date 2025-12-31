import { defineConfig, Plugin } from 'vite';
import { wsx } from '@wsxjs/wsx-vite-plugin';
import { wsxPress } from '@wsxjs/wsx-press/node';
import UnoCSS from 'unocss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite 插件：处理 @quizerjs/theme CSS 文件导入
 *
 * 问题：当 resolve.alias 为 @quizerjs/theme 设置别名时，会绕过 package.json 的 exports 字段
 * 解决：在别名解析之前拦截 CSS 导入，直接解析到 dist 目录
 */
function themeCssPlugin(): Plugin {
  // 从 site 目录到 packages/theme/dist 的正确路径
  const themeDistPath = path.resolve(__dirname, '../packages/theme/dist');

  return {
    name: 'quizerjs-theme-css',
    enforce: 'pre', // 在其他插件之前执行，必须在别名解析之前
    resolveId(id) {
      // 匹配 @quizerjs/theme/*.css 格式的导入
      if (id.startsWith('@quizerjs/theme/') && id.endsWith('.css')) {
        // 提取文件名（如 light.css, marble.css）
        const filename = id.replace('@quizerjs/theme/', '');
        const resolvedPath = path.resolve(themeDistPath, filename);

        // 返回绝对路径，Vite 会处理 CSS 文件
        return resolvedPath;
      }
      return null; // 不处理其他导入
    },
  };
}

/**
 * Vite 插件：处理 pino 浏览器版本的导入问题
 *
 * 问题：pino/browser.js 是 CommonJS 模块，使用 module.exports，但某些代码可能尝试默认导入
 * 解决：拦截 pino 的导入，重定向到 pino/browser，并确保正确的导出处理
 */
function pinoBrowserPlugin(): Plugin {
  return {
    name: 'pino-browser-fix',
    enforce: 'pre',
    resolveId(id, importer) {
      // 如果导入的是 pino，重定向到 pino/browser
      if (id === 'pino' && importer) {
        return {
          id: 'pino/browser',
          external: false,
        };
      }
      return null;
    },
    load(id) {
      // 如果加载的是 pino/browser，确保正确处理 CommonJS 导出
      if (id.includes('pino/browser')) {
        return null; // 让 Vite 正常处理
      }
      return null;
    },
  };
}

export default defineConfig({
  // GitHub Pages 部署 base 路径配置
  // 支持自定义域名和子路径部署
  base:
    process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true'
      ? process.env.CUSTOM_DOMAIN === 'true'
        ? '/' // 自定义域名 (quizerjs.io)
        : '/quizerjs/' // GitHub Pages 子路径 (username.github.io/quizerjs)
      : '/', // 开发模式

  plugins: [
    // pino 浏览器版本修复插件 - 必须在最前面
    pinoBrowserPlugin(),
    // wsx-press 插件 - 构建文档页面（必须在其他插件之前）
    // 注意：当前版本 (0.0.19) 存在 glob 导入问题，需要等待上游修复
    // 如果遇到 "Named export 'glob' not found" 错误，请暂时注释掉此插件
    wsxPress({
      docsRoot: path.resolve(__dirname, './public/docs'),
      outputDir: path.resolve(__dirname, './.wsx-press'),
    }),
    // 主题 CSS 插件 - 必须在其他插件之前处理 CSS 导入
    themeCssPlugin(),
    // UnoCSS 原子化 CSS 引擎
    UnoCSS(),
    // wsx 插件 - 处理 .wsx 文件
    wsx({
      debug: false, // 开发模式启用调试
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
  ],

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production', // 生产环境不生成 sourcemap
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@wsxjs/wsx-core', '@wsxjs/wsx-base-components', '@wsxjs/wsx-router'],
          theme: ['@quizerjs/theme'],
          quizerjs: ['@quizerjs/core', '@quizerjs/dsl'],
        },
      },
    },
  },

  // 开发模式下的路径别名
  // 直接使用源文件以支持热模块替换 (HMR)
  // 生产模式使用 package.json exports (dist 文件)
  resolve: {
    alias: {
      // 开发模式：直接使用源文件，支持 HMR
      // 注意：@wsxjs/* 包是外部 npm 包，不在 monorepo 中，不需要别名
      ...(process.env.NODE_ENV === 'development'
        ? {
            '@quizerjs/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
            '@quizerjs/dsl': path.resolve(__dirname, '../packages/dsl/src/index.ts'),
            // 注意：不设置 @quizerjs/theme 别名
            // CSS 文件由 themeCssPlugin 处理，JS 文件通过 node_modules 正常解析
            '@': path.resolve(__dirname, './src'),
          }
        : {
            '@': path.resolve(__dirname, './src'),
          }),
      // 处理 pino 浏览器版本导入问题
      // pino 的浏览器版本 (pino/browser) 使用命名导出，不是默认导出
      pino: 'pino/browser',
    },
    // 在开发环境中优先使用源码（source 字段）
    // CSS 文件通过插件直接解析到 dist 目录
    conditions: ['import', 'module', 'browser', 'default'],
  },

  server: {
    port: 5178,
    open: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5178,
    },
    watch: {
      // 监听 workspace 包的源码变化
      ignored: ['!**/node_modules/@quizerjs/**', '!**/packages/**'],
    },
  },

  // 预览服务器配置
  preview: {
    port: 5180, // 使用不同端口避免与开发服务器冲突
    open: true,
    // 预览时使用与构建时相同的 base 路径
    // 这样可以在本地预览 GitHub Pages 部署效果
    cors: true,
  },

  optimizeDeps: {
    exclude: [
      '@wsxjs/wsx-core',
      '@wsxjs/wsx-base-components',
      '@wsxjs/wsx-router',
      '@quizerjs/core',
      '@quizerjs/dsl',
      '@quizerjs/theme',
    ],
    // 包含 pino/browser 以便 Vite 预构建并正确处理 CommonJS 导出
    include: ['pino/browser'],
    // 处理 pino 的浏览器版本导入问题
    esbuildOptions: {
      resolveExtensions: ['.browser.js', '.js', '.mjs'],
    },
  },
});
