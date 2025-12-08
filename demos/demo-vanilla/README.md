# @quizerjs/demo-vanilla

quizerjs Editor.js 测试 Demo - Vanilla JS（私有包）

## 用途

这个包用于测试和演示 `@quizerjs/quizerjs` 的 Editor.js 编辑器功能，使用纯 JavaScript（Vanilla JS），不依赖任何框架。

## 技术栈

- Vanilla JavaScript / TypeScript
- Vite
- @quizerjs/dsl
- @quizerjs/core
- @quizerjs/quizerjs (待实现)

## 开发

```bash
# 从根目录运行
pnpm demo:dev

# 或进入 demo 目录
cd demos/demo-vanilla
pnpm dev
```

## 功能

- [ ] 测试 QuizEditor 初始化
- [ ] 测试问题块插入和编辑
- [ ] 测试 DSL 加载和保存
- [ ] 测试 Section Header 分组
- [ ] 测试 Question Header 和 Description
- [ ] 测试 Choice 列表编辑（Enter 创建新 choice）
- [ ] 测试 Inline Tools（加粗、斜体、链接等）
- [ ] 测试 Markdown ↔ HTML 转换

## 注意

这是一个**私有包**，不会发布到 npm。

## 与 demo-vue 的区别

- **demo**: Vanilla JS 版本，不依赖任何框架
- **demo-vue**: Vue 3 版本，使用 `@quizerjs/vue` 包
