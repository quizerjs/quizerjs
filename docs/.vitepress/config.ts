import { defineConfig } from 'vitepress';
import path from 'path';

export default defineConfig({
  title: 'quizerjs',
  description: '一个使用 Editor.js 和 wsx 构建测验的开源库',
  base: '/quizerjs/',
  lang: 'zh-CN',

  vite: {
    resolve: {
      alias: {
        '@quizerjs/dsl': path.resolve(__dirname, '../../packages/dsl/src'),
      },
    },
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'DSL 规范', link: '/dsl/' },
      { text: 'API 参考', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: 'RFC', link: '/rfc/' },
      {
        text: '链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/wsxjs/quizerjs' },
          { text: 'npm', link: 'https://www.npmjs.com/org/quizerjs' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: 'Vue 集成', link: '/guide/vue-integration' },
          ],
        },
      ],
      '/dsl/': [
        {
          text: 'DSL 规范',
          items: [
            { text: '概述', link: '/dsl/' },
            { text: '基本结构', link: '/dsl/structure' },
            { text: '问题类型', link: '/dsl/question-types' },
            { text: '验证规则', link: '/dsl/validation' },
            { text: '完整示例', link: '/dsl/examples' },
            { text: '错误代码', link: '/dsl/error-codes' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概述', link: '/api/' },
            { text: '验证器', link: '/api/validator' },
            { text: '解析器', link: '/api/parser' },
            { text: '序列化器', link: '/api/serializer' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '概述', link: '/examples/' },
            { text: '真实使用案例', link: '/examples/real-world' },
            { text: '交互式演示', link: '/examples/interactive-demo' },
            { text: '基础验证', link: '/examples/basic-validation' },
            { text: '完整测验', link: '/examples/full-quiz' },
          ],
        },
      ],
      '/rfc/': [
        {
          text: 'RFC 文档',
          items: [
            { text: 'RFC 列表', link: '/rfc/' },
            { text: 'RFC 0001: Quiz DSL 规范', link: '/rfc/0001-quiz-dsl-specification' },
            { text: 'RFC 0002: 架构设计', link: '/rfc/0002-architecture-design' },
            { text: 'RFC 0003: React 集成设计', link: '/rfc/0003-react-integration' },
            { text: 'RFC 0004: 演示站点架构设计', link: '/rfc/0004-demo-site-architecture' },
            { text: 'RFC 0005: 编辑器核心组件设计', link: '/rfc/0005-editor-core' },
            { text: 'RFC 0006: 播放器核心组件设计', link: '/rfc/0006-player-core' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/wsxjs/quizerjs' }],

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2025 quizerjs',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/wsxjs/quizerjs/edit/master/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新于',
    },
  },
});
