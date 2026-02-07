# QuizerJS

一个使用 [Editor.js](https://editorjs.io/) 和 [wsx](https://www.wsxjs.dev) 构建交互式测验的开源库。

## 简介

QuizerJS 是一个功能强大的测验构建库，它结合了 Editor.js 的块编辑器能力和 wsx 的 Web Components 框架，让您可以轻松创建、管理和展示交互式测验。支持 React、Vue、Svelte 和 Vanilla JS 等多种框架。

## 特性

- 🎯 **多种题型支持** - 单选题、多选题、文本输入题、判断题
- 🎨 **现代化 UI** - 基于 wsx 组件的美观界面，完全响应式设计
- 🔌 **Editor.js 集成** - 作为 Editor.js 工具插件无缝集成
- 📦 **模块化设计** - 核心组件可独立使用，配置灵活
- 🔒 **类型安全** - 完整的 TypeScript 类型定义和验证
- 📋 **DSL 规范** - 统一的 JSON 格式，便于存储和传输
- 🎨 **主题系统** - 多个内置主题，支持自定义
- ⚛️ **框架支持** - React、Vue、Svelte 和 Vanilla JS

## 安装

```bash
# 安装核心组件库
npm install @quizerjs/core

# 安装 Editor.js 工具插件
npm install @quizerjs/editorjs-tool

# 安装 DSL 库（用于验证和序列化）
npm install @quizerjs/dsl

# 安装框架集成包（可选）
npm install @quizerjs/react    # React
npm install @quizerjs/vue      # Vue
npm install @quizerjs/svelte   # Svelte
```

## 快速开始

### 使用编辑器（QuizEditor）

```typescript
import { QuizEditor } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';

const container = document.getElementById('editor-container');

const editor = new QuizEditor({
  container: container!,
  initialDSL: {
    version: '1.0.0',
    quiz: {
      id: 'quiz-1',
      title: '我的测验',
      questions: [],
    },
  },
  onChange: (dsl: QuizDSL) => {
    console.log('DSL 变化:', dsl);
  },
  onSave: (dsl: QuizDSL) => {
    console.log('保存 DSL:', dsl);
  },
});

await editor.init();
```

### 使用播放器（QuizPlayer）

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

const dsl = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: '示例测验',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: '2 + 2 等于多少？',
        options: [
          { id: 'o1', text: '3', isCorrect: false },
          { id: 'o2', text: '4', isCorrect: true },
          { id: 'o3', text: '5', isCorrect: false },
        ],
      },
    ],
  },
};

// 验证 DSL
const result = validateQuizDSL(dsl);
if (result.valid) {
  // 使用 Web Component
  const player = document.createElement('quiz-player');
  player.setAttribute('dsl', JSON.stringify(dsl));
  player.addEventListener('answer-change', (e: any) => {
    console.log('答案变化:', e.detail);
  });
  document.body.appendChild(player);
}
```

### React 集成

```tsx
import { QuizEditor, QuizPlayer } from '@quizerjs/react';

function App() {
  const dsl = {
    /* ... */
  };

  return (
    <>
      <QuizEditor initialDSL={dsl} onChange={dsl => console.log('变化:', dsl)} />
      <QuizPlayer dsl={dsl} />
    </>
  );
}
```

### Vue 集成

```vue
<template>
  <QuizEditor :initial-dsl="dsl" @change="handleChange" />
  <QuizPlayer :dsl="dsl" />
</template>

<script setup>
import { QuizEditor, QuizPlayer } from '@quizerjs/vue';
import { ref } from 'vue';

const dsl = ref({
  /* ... */
});

const handleChange = newDsl => {
  console.log('变化:', newDsl);
  dsl.value = newDsl;
};
</script>
```

### Svelte 集成

```svelte
<script>
  import { QuizEditor, QuizPlayer } from '@quizerjs/svelte';
  import { writable } from 'svelte/store';

  let dsl = writable({ /* ... */ });

  function handleChange(newDsl) {
    console.log('变化:', newDsl);
    dsl.set(newDsl);
  }
</script>

<QuizEditor
  initialDSL={$dsl}
  onChange={handleChange}
/>
<QuizPlayer dsl={$dsl} />
```

### Vanilla JS 集成

```typescript
import { QuizEditor } from '@quizerjs/quizerjs';
import { validateQuizDSL } from '@quizerjs/dsl';

// 编辑器
const editorContainer = document.getElementById('editor');
const editor = new QuizEditor({
  container: editorContainer!,
  onChange: dsl => console.log('变化:', dsl),
});
await editor.init();

// 播放器（使用 Web Component）
const dsl = {
  /* ... */
};
const player = document.createElement('quiz-player');
player.setAttribute('dsl', JSON.stringify(dsl));
document.body.appendChild(player);
```

## 项目结构

```
quizerjs/
├── packages/              # 核心包
│   ├── core/             # 核心 wsx 组件（QuizPlayer）
│   ├── dsl/              # DSL 定义、验证和序列化
│   ├── editorjs-tool/    # Editor.js 工具插件
│   ├── quizerjs/         # 主包（编辑器和播放器）
│   ├── react/            # React 集成包
│   ├── vue/              # Vue 集成包
│   ├── svelte/           # Svelte 集成包
│   ├── theme/            # 主题系统
│   └── sample-data/      # 示例数据
├── demos/                # 框架集成演示
│   ├── react/            # React 演示
│   ├── vue/              # Vue 演示
│   ├── svelte/           # Svelte 演示
│   └── vanilla/          # Vanilla JS 演示
├── site/                 # 官方网站（quizerjs.io）
│   └── src/              # wsx 组件和页面
└── docs/                 # 文档
    ├── dsl/              # DSL 规范
    ├── api/              # API 参考
    ├── examples/        # 使用示例
    └── rfc/              # 技术规范和架构设计
```

## 核心包

### @quizerjs/quizerjs

主包，提供框架无关的测验编辑器和播放器。

- `QuizEditor` - 测验编辑器类（基于 Editor.js）
- `QuizPlayer` - 测验播放器（Web Component）

### @quizerjs/core

核心展示组件库，基于 wsx Web Components。

- `QuizPlayer` - 测验播放器 Web Component
- `QuizQuestion` - 问题组件
- `QuizOption` - 选项组件

### @quizerjs/dsl

Quiz DSL 定义、验证和序列化工具。

- `validateQuizDSL()` - DSL 验证
- `parseQuizDSL()` - DSL 解析
- `serializeQuizDSL()` - DSL 序列化

### @quizerjs/react

React 集成包，提供 React 组件包装器。

- `QuizEditor` - 编辑器组件
- `QuizPlayer` - 播放器组件

### @quizerjs/vue

Vue 集成包，提供 Vue 组件包装器。

- `QuizEditor` - 编辑器组件
- `QuizPlayer` - 播放器组件

### @quizerjs/svelte

Svelte 集成包，提供 Svelte 组件包装器。

- `QuizEditor` - 编辑器组件
- `QuizPlayer` - 播放器组件

### Vanilla JS

无需安装额外包，直接使用 `@quizerjs/quizerjs` 和 `@quizerjs/core`。

- `QuizEditor` - 编辑器类（来自 `@quizerjs/quizerjs`）
- `QuizPlayer` - 播放器 Web Component（来自 `@quizerjs/core`）

## 文档

- **官方网站**: [quizerjs.io](https://quizerjs.io)
- **DSL 规范 / API 参考 / 使用示例**: 见官网 [文档 - Guide](https://quizerjs.io/docs/guide/getting-started)（[DSL](https://quizerjs.io/docs/guide/dsl) · [API](https://quizerjs.io/docs/guide/api) · [示例](https://quizerjs.io/docs/guide/examples)）
- **RFC 文档**: [docs/rfc/](./docs/rfc/) - 技术规范和架构设计
- **实施状态**: [docs/IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md) - 项目实施进度和状态报告

## 开发

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发命令

```bash
# 开发模式（交互式菜单）
pnpm dev

# 开发特定项目
pnpm dev:site        # 开发网站
pnpm dev:react      # React 演示
pnpm dev:vue        # Vue 演示
pnpm dev:svelte      # Svelte 演示
pnpm dev:vanilla     # Vanilla JS 演示

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint
pnpm lint:fix        # 自动修复
```

### 网站部署

```bash
# 构建网站和演示
pnpm build:pages

# 预览构建结果
pnpm preview:pages

# 部署到 GitHub Pages
pnpm deploy:pages
```

## 许可证

本项目采用 **MIT License**，允许自由使用、修改和分发，包括商业用途。

### 企业许可证

对于企业客户，我们提供商业许可证选项，包括：

- ✅ 商业法律保护（无 MIT 免责声明）
- ✅ 优先技术支持
- ✅ SLA（服务级别协议）
- ✅ 定制开发服务
- ✅ 白标/品牌定制

**了解更多**: 查看 [企业许可证文档](./docs/ENTERPRISE-LICENSE.md) 或联系 [enterprise@quizerjs.io](mailto:enterprise@quizerjs.io)

## 相关项目

- [Editor.js](https://editorjs.io/) - 块样式编辑器
- [wsxjs](https://www.wsxjs.dev) - Web Components 框架

## 贡献

欢迎贡献！请查看 [GitHub Issues](https://github.com/quizerjs/quizerjs/issues) 了解待办事项。

## 作者

QuizerJS 团队
