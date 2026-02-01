# RFC 0013: 重新定义 QuizPlayer 职责与结果展示解耦

## 1. 现状与反思 (Context)

之前的设计将视图切换逻辑耦合在 `QuizPlayer` 内部。根据单一职责原则（SRP），`QuizPlayer` 作为一个“播放器”，其核心任务应当只有两个：

1.  **Play**：执行测验交互流。
2.  **Complete**：在完成时计算并分发结果数据（ResultDSL）。

视图的切换（例如从播放状态进入结果状态）应当由 **Host Component**（如 React/Vue/Svelte 包装层或集成方）决定。

## 2. 核心目标 (Objectives)

- **解耦 QuizPlayer**：移除播放器内部的视图渲染/切换逻辑。
- **标准化结果分发**：确保播放器抛出的 `quiz-complete` 事件携带完整的、可被外部组件直接消费的 `ResultDSL`。
- **结果组件原子化**：确保 `wsx-quiz-results` 是一个独立的、纯粹的数据驱动组件，支持完整的 Markdown 渲染。

## 3. 技术方案 (Proposed Design)

### 3.1 QuizPlayer 精简化

修改 `packages/quizerjs/src/player/QuizPlayer.ts`:

- **移除 `renderResults` 方法**：播放器不再管如何显示结果，也不再有 `showResults` 选项逻辑。
- **强化 `submit()`**：计算 `ResultDSL` 后，仅触发 DOM 事件和可选的回调。
- **清理逻辑**：确保 `destroy` 只清理播放器自身的 runner 和监听器。

### 3.2 结果组件 (QuizResults)

`packages/core/src/components/quiz-results.wsx` 应当作为结果展示的“真源”：

- **数据驱动**：接受 `result-source` 属性（ResultDSL JSON）。
- **Markdown 精英化封装**：使用 `marked` 处理题目文本和解答。
- **语义化与审美**：遵循 Linus 的实用主义与 Albert 的稳健风格，直接渲染 Markdown 生成的 HTML。

### 3.3 交互链路 (Workflow)

1.  用户点击提交 -> `QuizPlayer` 内部 `submit()` 被执行。
2.  `QuizPlayer` 计算得分，构造 `ResultDSL` 对象。
3.  `QuizPlayer` 在容器上触发 `quiz-complete` 事件。
4.  **Host**（宿主）监听到该事件，自行决定是将 `QuizPlayer` 销毁，还是切换到 `wsx-quiz-results` 视图。

## 4. 验证计划 (Verification)

- [ ] 检查 `QuizPlayer.ts` 是否除去了所有渲染逻辑。
- [ ] 验证 `quiz-complete` 事件是否能在宿主层捕获，且包含完整数据。
- [ ] 验证 `wsx-quiz-results` 组件在单独传入数据时能够正确渲染 Markdown。

---

**Status**: Revised (Separation of Concerns)
**Author**: Linus Torvalds / Andrej Karpathy Style
**Location**: docs/rfc/0013-fix-submit-binding.md
