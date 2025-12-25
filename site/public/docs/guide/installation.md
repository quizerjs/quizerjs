# 安装指南

本指南将帮助您安装 QuizerJS 及其依赖。

## 环境要求

- **Node.js**: >= 16.0.0
- **浏览器**: 支持 Web Components 的现代浏览器

## 安装步骤

### 步骤 1: 选择安装方式

根据您的使用场景，选择以下安装方式之一：

#### 方式 A: 使用编辑器 + 播放器（推荐）

如果您需要创建和展示测验：

```bash
npm install @quizerjs/quizerjs @quizerjs/core @quizerjs/dsl
```

#### 方式 B: 仅使用播放器

如果您只需要展示测验：

```bash
npm install @quizerjs/core @quizerjs/dsl
```

#### 方式 C: 仅使用 DSL 验证

如果您只需要验证 DSL 数据：

```bash
npm install @quizerjs/dsl
```

### 步骤 2: 安装框架集成包（可选）

根据您使用的框架，安装相应的集成包：

#### React

```bash
npm install @quizerjs/react @quizerjs/dsl
npm install react react-dom
```

#### Vue

```bash
npm install @quizerjs/vue @quizerjs/dsl
npm install vue@^3.0.0
```

#### Svelte

```bash
npm install @quizerjs/svelte @quizerjs/dsl
npm install svelte@^4.0.0
```

#### Vanilla JS

无需安装额外包，直接使用 `@quizerjs/quizerjs` 和 `@quizerjs/core`。

### 步骤 3: 验证安装

安装完成后，验证安装是否成功：

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

console.log('✅ QuizerJS DSL 已安装！');

// 测试验证功能
const testDSL = {
  version: '1.0.0',
  quiz: {
    id: 'test',
    title: '测试',
    questions: []
  }
};

const result = validateQuizDSL(testDSL);
console.log('验证功能:', result.valid ? '✅ 正常' : '❌ 异常');
```

## TypeScript 支持

所有包都包含完整的 TypeScript 类型定义，无需额外安装类型包。

```typescript
import type { QuizDSL, Question, QuestionType } from '@quizerjs/dsl';
import type { QuizEditorOptions } from '@quizerjs/quizerjs';
```

## 使用包管理器

### npm

```bash
npm install @quizerjs/quizerjs @quizerjs/core @quizerjs/dsl
```

### pnpm

```bash
pnpm add @quizerjs/quizerjs @quizerjs/core @quizerjs/dsl
```

### yarn

```bash
yarn add @quizerjs/quizerjs @quizerjs/core @quizerjs/dsl
```

## 下一步

- [快速开始](./getting-started.md) - 5 分钟快速上手
- [DSL 指南](./dsl-guide.md) - 了解 DSL 数据格式
- [框架集成](./vue-integration.md) - 在 Vue、React、Svelte 中使用

