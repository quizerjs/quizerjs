# RFC 0004: 演示站点架构设计

**状态**: 已完成 (Completed)  
**创建日期**: 2025-01-27  
**完成日期**: 2025-12-24  
**作者**: quizerjs 团队

## 摘要

本文档描述了 quizerjs.io 演示站点的架构设计，包括页面结构、部署方案和技术选型。

## 动机

- 展示 quizerjs 的核心功能
- 提供交互式演示
- 作为文档和示例的入口
- 支持 GitHub Pages 部署

## 站点结构

```
quizerjs.io/
├── /                    # 首页
├── /editor              # 编辑器演示
├── /viewer              # 展示组件演示
├── /examples            # 示例集合
├── /docs                # 文档
└── /playground          # 在线 Playground
```

## 页面设计

### 首页 (/)

**功能**:

- 项目介绍
- 快速开始指南
- 功能特性展示
- 链接到其他页面

**内容**:

- Hero 区域：项目标题和简介
- 特性卡片：展示核心功能
- 快速开始：代码示例
- 链接导航：编辑器、展示、文档等

### 编辑器演示 (/editor)

**功能**:

- 展示 QuizEditor 组件
- 实时预览 DSL 输出
- 示例数据加载
- 导出功能

**交互**:

- 左侧：编辑器界面
- 右侧：实时 DSL 预览
- 底部：操作按钮（保存、导出、重置）

### 展示组件演示 (/viewer)

**功能**:

- 展示 QuizViewer 组件
- 答题交互
- 结果显示
- 多种题型演示

**交互**:

- 测验展示区域
- 答题界面
- 提交按钮
- 结果展示

### 示例集合 (/examples)

**功能**:

- 展示各种使用场景
- 代码示例
- 可运行的演示

**示例类型**:

- 基础用法
- React 集成
- 自定义样式
- 高级功能

### 文档 (/docs)

**功能**:

- API 文档
- 使用指南
- DSL 规范
- RFC 文档

### 在线 Playground (/playground)

**功能**:

- 在线代码编辑器
- 实时预览
- 代码分享
- 多种框架支持（React、Vue、原生）

## 技术选型

### 构建工具

- **Vite**: 快速开发和构建
- **TypeScript**: 类型安全
- **React**: UI 框架（演示页面）

### 样式方案

- **Tailwind CSS**: 实用优先的 CSS 框架
- **自定义主题**: quizerjs 品牌色

### 部署方案

- **GitHub Pages**: 静态站点托管
- **GitHub Actions**: 自动部署
- **自定义域名**: quizerjs.io

## 项目结构

```
demo/
├── src/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── EditorDemo.tsx
│   │   ├── ViewerDemo.tsx
│   │   ├── Examples.tsx
│   │   └── Playground.tsx
│   ├── components/
│   │   ├── Layout/
│   │   ├── CodeBlock/
│   │   └── DemoCard/
│   ├── assets/
│   │   ├── examples/
│   │   └── images/
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── index.html
│   └── favicon.ico
├── vite.config.ts
├── package.json
└── README.md
```

## 部署配置

### GitHub Actions 工作流

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./demo/dist
```

### 域名配置

1. 在 GitHub 仓库设置中添加自定义域名 `quizerjs.io`
2. 在 DNS 提供商添加 CNAME 记录
3. 配置 HTTPS（GitHub Pages 自动提供）

## 内容管理

### 示例数据

示例数据存储在 `src/assets/examples/` 目录：

```
examples/
├── basic-quiz.json
├── multiple-choice.json
├── mixed-types.json
└── advanced-quiz.json
```

### 代码示例

代码示例使用 Markdown 格式，支持语法高亮：

```markdown
\`\`\`tsx
import { QuizEditor } from '@quizerjs/react';

function App() {
return <QuizEditor />;
}
\`\`\`
```

## 性能优化

1. **代码分割**: 按路由分割代码
2. **懒加载**: 非关键资源懒加载
3. **CDN**: 静态资源使用 CDN
4. **压缩**: 生产环境代码压缩

## SEO 优化

1. **Meta 标签**: 完整的 meta 信息
2. **结构化数据**: JSON-LD 格式
3. **Sitemap**: 自动生成 sitemap
4. **robots.txt**: 搜索引擎爬虫配置

## 分析统计

- **Google Analytics**: 访问统计
- **GitHub Stars**: 展示项目受欢迎程度
- **使用统计**: 匿名使用数据收集

## 未来扩展

- 多语言支持
- 暗色主题
- 更多交互式示例
- 视频教程
- 社区贡献展示
