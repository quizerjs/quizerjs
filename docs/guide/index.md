# 指南

欢迎使用 quizerjs！本指南将帮助您快速上手。

## 什么是 quizerjs？

quizerjs 是一个功能强大的测验构建库，它结合了 [Editor.js](https://editorjs.io/) 的块编辑器能力和 [wsxjs](https://github.com/wsxjs/wsxjs) 的 Web Components 框架，让您可以轻松创建交互式测验。

## 核心特性

- 🎯 **多种题型支持**：单选题、多选题、文本输入题、判断题
- 🎨 **现代化 UI**：基于 wsx 组件的美观界面
- 🔌 **Editor.js 集成**：作为 Editor.js 工具插件使用
- 📦 **模块化设计**：核心组件可独立使用
- 🎛️ **灵活配置**：丰富的配置选项和回调函数
- 📱 **响应式设计**：适配各种屏幕尺寸
- 🔒 **类型安全**：完整的 TypeScript 类型定义

## 包结构

quizerjs 采用 monorepo 结构，包含以下包：

- `@quizerjs/dsl` - DSL 定义和验证库
- `@quizerjs/core` - 核心 wsx 组件库
- `@quizerjs/vue` - Vue 3 集成包
- `@quizerjs/editorjs-tool` - Editor.js 工具插件

## 下一步

- [快速开始](./getting-started.md) - 5 分钟快速上手
- [安装指南](./installation.md) - 详细的安装说明
- [Vue 集成](./vue-integration.md) - 在 Vue 3 中使用
- [DSL 规范](/dsl/) - 了解数据格式
- [API 参考](/api/) - 查看完整 API

