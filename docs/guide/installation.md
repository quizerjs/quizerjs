# 安装

## 环境要求

- Node.js >= 16.0.0
- 现代浏览器（支持 Web Components）

## 包安装

### 完整安装

如果您需要所有功能：

```bash
npm install @quizerjs/core @quizerjs/editorjs-tool @quizerjs/dsl
npm install @editorjs/editorjs @wsxjs/wsx-core
```

### 按需安装

#### 仅使用 DSL

```bash
npm install @quizerjs/dsl
```

#### 仅使用核心组件

```bash
npm install @quizerjs/core
npm install @wsxjs/wsx-core
```

#### 在 Vue 中使用

```bash
npm install @quizerjs/vue
npm install @quizerjs/dsl
npm install vue@^3.0.0
```

#### 仅使用 Editor.js 工具

```bash
npm install @quizerjs/editorjs-tool
npm install @quizerjs/core
npm install @editorjs/editorjs @wsxjs/wsx-core
```

## TypeScript 支持

所有包都包含完整的 TypeScript 类型定义，无需额外安装类型包。

```typescript
import type { QuizDSL, Question } from '@quizerjs/dsl';
```

## CDN 使用

```html
<!-- 通过 CDN 使用（未来支持） -->
<script src="https://cdn.jsdelivr.net/npm/@quizerjs/core/dist/index.js"></script>
```

## 验证安装

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

console.log('quizerjs DSL 已安装！');
```

## 下一步

- [快速开始](./getting-started.md)
- [DSL 规范](/dsl/)

