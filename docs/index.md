---
layout: home

hero:
  name: quizerjs
  text: 测验构建库
  tagline: 使用 Editor.js 和 wsx 构建交互式测验
  image:
    src: /logo.svg
    alt: quizerjs
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/wsxjs/quizerjs

features:
  - icon: 🎯
    title: 多种题型
    details: 支持单选题、多选题、文本输入题、判断题等多种题型
  - icon: 🎨
    title: 现代化 UI
    details: 基于 wsx 组件的美观界面，响应式设计
  - icon: 🔌
    title: Editor.js 集成
    details: 作为 Editor.js 工具插件，轻松集成到现有编辑器
  - icon: 📦
    title: 模块化设计
    details: 核心组件可独立使用，灵活配置
  - icon: 🔒
    title: 类型安全
    details: 完整的 TypeScript 类型定义和验证
  - icon: 📝
    title: DSL 规范
    details: 统一的 DSL 格式，便于存储和传输

---

## 快速开始

### 安装

```bash
# 安装核心组件库
npm install @quizerjs/core

# 安装 Editor.js 工具插件
npm install @quizerjs/editorjs-tool

# 安装 DSL 库
npm install @quizerjs/dsl
```

### 基本使用

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

const dsl = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: '我的测验',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: '测试问题',
        options: [
          { id: 'o1', text: '选项1', isCorrect: true },
          { id: 'o2', text: '选项2', isCorrect: false },
        ],
      },
    ],
  },
};

const result = validateQuizDSL(dsl);
if (result.valid) {
  console.log('DSL 有效！');
}
```

## 文档导航

- [DSL 规范](/dsl/) - 了解 Quiz DSL 数据格式
- [API 参考](/api/) - 查看完整的 API 文档
- [RFC 文档](/rfc/) - 技术规范和架构设计
- [发布指南](/publishing) - npm 包发布流程

