# RFC 文档

本目录包含 quizerjs 项目的 RFC（Request for Comments）文档，用于记录技术规范、架构设计和设计决策。

## RFC 列表

### 已完成

- [RFC 0001: Quiz DSL 规范](./completed/0001-quiz-dsl-specification.md) - 定义 Quiz DSL 的数据格式和验证规则 ✅
- [RFC 0003: React 集成设计](./completed/0003-react-integration.md) - React 包装器的 API 设计 ✅
- [RFC 0004: 演示站点架构设计](./completed/0004-demo-site-architecture.md) - quizerjs.io 演示站点设计 ✅
- [RFC 0005: 编辑器核心组件设计](./completed/0005-editor-core.md) - QuizEditor 的详细 API 设计 ✅
- [RFC 0007: 选项列表渲染优化](./completed/0007-option-list-render-optimization.md) - 优化选项列表渲染以避免焦点丢失 ✅
- [RFC 0008: 主题系统设计](./completed/0008-theming-system.md) - WSX 组件主题定制和样式系统设计 ✅
- [RFC 0009: quizerjs.io 开源网站设计](./completed/0009-quizerjs-io-website.md) - quizerjs.io 开源网站架构设计 ✅

### 实施中

- [RFC 0002: 架构设计](./0002-architecture-design.md) - 整体架构和包结构设计 (90% 完成)
- [RFC 0006: 播放器核心组件设计](./0006-player-core.md) - QuizPlayer 的详细 API 设计 (80% 完成)
- [RFC 0010: QuizPlayer 核心工作流程设计](./0010-result-handling-in-slides.md) - 开始测验 → 收集答案 → 提交结果的完整工作流程 (75% 完成)

### 草案中

- RFC 0014: Vue 集成设计（计划中）- Vue QuizPlayer 组件已实现，待文档化
- RFC 0015: 插件系统设计（计划中）

### 已废弃

- RFC 0011: Slide Runner 与 reveal.js 集成（已合并到 RFC 0010）
- RFC 0012: Slide DSL 增强功能与性能优化（已合并到 RFC 0010）
- RFC 0013: Slide DSL 语言服务器与开发工具（延后实施）

## RFC 流程

1. **提案**: 创建新的 RFC 文档，状态为"草案"
2. **讨论**: 在 GitHub Issues 或 Discussions 中讨论
3. **修订**: 根据反馈修订 RFC
4. **批准**: 核心团队批准后，状态改为"已批准"
5. **实施**: 按照 RFC 实施功能
6. **完成**: 实施完成后，状态改为"已完成"

## RFC 状态

- **草案 (Draft)**: 正在讨论中
- **已批准 (Approved)**: 已批准，准备实施
- **实施中 (Implementing)**: 正在实施
- **已完成 (Completed)**: 实施完成
- **已废弃 (Deprecated)**: 不再使用

## 贡献指南

1. 创建新的 RFC 文档，编号递增
2. 使用 Markdown 格式
3. 包含必要的章节：摘要、动机、设计、实施等
4. 提交 PR 并等待审查

## 参考

- [Rust RFC Process](https://github.com/rust-lang/rfcs)
- [React RFC Process](https://github.com/reactjs/rfcs)
