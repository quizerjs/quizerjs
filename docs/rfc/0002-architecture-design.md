# RFC 0002: quizerjs 架构设计

**状态**: 草案 (Draft)  
**创建日期**: 2025-01-27  
**作者**: quizerjs 团队

## 摘要

本文档描述了 quizerjs 的整体架构设计，包括包结构、模块职责和组件关系。

## 动机

- 明确各包的职责和边界
- 提供清晰的架构指导
- 便于新开发者理解项目结构

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    应用层 (Applications)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  React App   │  │  Vue App     │  │  Native App  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────┐
│         │                  │                  │         │
│  ┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐   │
│  │ @quizerjs/    │  │ @quizerjs/     │  │ @quizerjs/     │   │
│  │ react       │  │ vue          │  │ core        │   │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │           │
└─────────┼─────────────────┼──────────────────┼──────────┘
          │                 │                  │
┌─────────┼─────────────────┼──────────────────┼──────────┐
│         │                 │                  │          │
│  ┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐   │
│  │ @quizerjs/    │  │ @quizerjs/     │  │ @quizerjs/     │   │
│  │ editor      │  │ core        │  │ dsl          │   │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │           │
└─────────┼─────────────────┼──────────────────┼──────────┘
          │                 │                  │
          └─────────────────┴──────────────────┘
                            │
                   ┌────────▼────────┐
                   │   Quiz DSL      │
                   │  (JSON Format)  │
                   └─────────────────┘
```

## 包结构

### @quizerjs/dsl

**职责**: Quiz DSL 定义和验证

- 定义 DSL 的 TypeScript 类型
- 提供 JSON Schema 验证
- 提供 DSL 验证器
- 提供序列化/反序列化工具

**依赖**: 无

**导出**:
- `QuizDSL` 类型
- `validateQuizDSL()` 函数
- `parseQuizDSL()` 函数
- `serializeQuizDSL()` 函数

### @quizerjs/core

**职责**: 核心展示组件（基于 wsx）

- 提供测验展示组件（QuizViewer）
- 提供答题交互组件
- 提供结果计算功能
- 不包含编辑功能

**依赖**: 
- `@quizerjs/dsl`
- `@wsxjs/wsx-core`

**导出**:
- `QuizViewer` 组件
- `QuizQuestion` 组件
- `calculateQuizResult()` 函数

### @quizerjs/editor

**职责**: 编辑器核心（基于 Editor.js + wsx）

- 提供测验编辑器组件
- 提供问题编辑功能
- 输出 Quiz DSL 格式
- 支持拖拽排序、添加/删除问题等

**依赖**:
- `@quizerjs/dsl`
- `@quizerjs/core`
- `@editorjs/editorjs`
- `@wsxjs/wsx-core`

**导出**:
- `QuizEditor` 类
- 编辑器配置接口

### @quizerjs/react

**职责**: React 包装器

- 提供 React 版本的编辑器组件
- 提供 React 版本的展示组件
- 提供 React Hooks（useQuizEditor, useQuizViewer）
- 处理 React 与 Web Components 的集成

**依赖**:
- `@quizerjs/dsl`
- `@quizerjs/core`
- `@quizerjs/editor`
- `react`

**导出**:
- `<QuizEditor />` 组件
- `<QuizViewer />` 组件
- `useQuizEditor()` hook
- `useQuizViewer()` hook

### @quizerjs/vue (未来)

**职责**: Vue 包装器

- 提供 Vue 版本的编辑器组件
- 提供 Vue 版本的展示组件
- 提供 Vue Composables

**依赖**:
- `@quizerjs/dsl`
- `@quizerjs/core`
- `@quizerjs/editor`
- `vue`

### @quizerjs/editorjs-tool

**职责**: Editor.js 工具插件

- 作为 Editor.js 的插件使用
- 在 Editor.js 编辑器中嵌入测验编辑功能

**依赖**:
- `@quizerjs/dsl`
- `@quizerjs/editor`
- `@editorjs/editorjs`

## 数据流

### 编辑器流程

```
用户操作 → QuizEditor → 内部状态 → 输出 Quiz DSL
```

### 展示流程

```
Quiz DSL → QuizViewer → 渲染组件 → 用户答题 → 计算结果
```

### React 集成流程

```
React Component → useQuizEditor Hook → QuizEditor → Quiz DSL
React Component → useQuizViewer Hook → QuizViewer → 渲染
```

## 设计原则

1. **DSL 优先**: 所有功能围绕 Quiz DSL 设计
2. **平台无关**: 核心功能不依赖特定框架
3. **可组合**: 各包可独立使用
4. **类型安全**: 完整的 TypeScript 支持
5. **可扩展**: 支持未来添加新功能

## 技术选型

- **核心组件**: wsx (Web Components)
- **编辑器**: Editor.js
- **React 集成**: React Hooks + Web Components
- **构建工具**: tsup
- **包管理**: pnpm workspaces
- **类型系统**: TypeScript

## 未来扩展

- Vue 包装器
- Angular 包装器
- 更多问题类型支持
- 国际化支持
- 主题系统
- 插件系统

