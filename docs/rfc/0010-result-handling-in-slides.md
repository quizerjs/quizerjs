# RFC 0010: QuizPlayer 核心工作流程设计

**状态**: 实施中 (Implementing) - 75% 完成
**创建日期**: 2025-01-17
**最后更新**: 2025-01-18
**作者**: quizerjs 团队

## 摘要

本文档设计 QuizPlayer 的核心工作流程：开始测验 → 收集答案 → 提交结果。通过简单的事件机制对外暴露状态变化，内部使用轻量级 Store 管理状态。

**关键设计理念**：

- **简单工作流程**：start → collect answers → submit
- **事件驱动**：通过 `onAnswerChange`、`onComplete`、`onSubmit` 事件通知外部
- **内部状态管理**：QuizStore 作为内部实现细节，不对外暴露
- **fire event on submit**：当所有问题回答完毕并提交时，触发提交事件

## 动机

### 当前问题

1. **缺乏统一的工作流程**：QuizPlayer 需要一个清晰的 start → collect → submit 流程
2. **状态管理分散**：答案收集、进度跟踪等状态分散在各处
3. **事件机制不完整**：缺少 `onComplete`（所有问题回答完毕）事件

### 设计目标

1. **清晰的工作流程**：start() → setAnswer() → submit()
2. **简单的事件接口**：onAnswerChange、onComplete、onSubmit
3. **内部状态一致性**：使用 QuizStore 统一管理内部状态
4. **易于集成**：框架适配层（Vue/React/Svelte）可以轻松监听事件

## 设计原则

1. **简单优先**：对外暴露简单的 API 和事件
2. **内部封装**：QuizStore 作为内部实现，不对外暴露
3. **事件驱动**：状态变化通过事件通知外部
4. **向后兼容**：保留现有 API 和行为

## 核心工作流程

### 流程图

```
QuizPlayer.init()
  ↓
QuizPlayer.start() → 初始化内部 Store → 触发 onStart 事件
  ↓
用户答题 → setAnswer(questionId, answer)
  ↓
内部 Store 更新 → 触发 onAnswerChange 事件
  ↓
检测是否所有问题已回答 → isComplete() === true
  ↓
触发 onComplete 事件（通知外部：可以提交了）
  ↓
用户点击提交 → submit() → 检查 isComplete()
  ↓
(如果已完成) 生成 ResultDSL → 触发 onSubmit 事件 → 返回 ResultDSL
(如果未完成) 抛出错误或忽略
```

### 状态机

```
[IDLE] --start()--> [ACTIVE] --setAnswer()--> [ACTIVE]
                        |
                        | (all questions answered)
                        v
                   [COMPLETE] --submit()--> [SUBMITTED]
                        |
                        | reset()
                        v
                     [IDLE]
```

## 公开 API 设计

### QuizPlayer 方法

```typescript
interface QuizPlayer {
  // 生命周期
  init(): Promise<void>; // 初始化（加载 DSL、渲染 UI）
  start(): void; // 开始测验
  reset(): void; // 重置测验
  destroy(): void; // 销毁实例

  // 答案管理
  setAnswer(questionId: string, answer: AnswerValue): void;
  getAnswer(questionId: string): AnswerValue | undefined;
  getAnswers(): Record<string, AnswerValue>;
  clearAnswer(questionId: string): void;

  // 状态查询
  getProgress(): { answered: number; total: number };
  isComplete(): boolean; // 所有问题是否已回答
  isSubmitted(): boolean; // 是否已提交

  // 提交
  submit(): ResultDSL; // 提交并返回结果 (仅当 isComplete() 为 true 时可用)
}
```

### 事件接口

```typescript
interface QuizPlayerOptions {
  // ... 其他选项 ...

  // 事件回调
  onStart?: () => void;
  onAnswerChange?: (questionId: string, answer: AnswerValue) => void;
  onComplete?: () => void; // 所有问题回答完毕时触发
  onSubmit?: (result: ResultDSL) => void; // 提交时触发
  onReset?: () => void;
}
```

### 事件触发时机

| 事件             | 触发时机                       | 参数               |
| ---------------- | ------------------------------ | ------------------ |
| `onStart`        | 调用 `start()` 时              | 无                 |
| `onAnswerChange` | 调用 `setAnswer()` 后          | questionId, answer |
| `onComplete`     | 所有问题回答完毕时（首次达到） | 无                 |
| `onSubmit`       | 调用 `submit()` 后             | ResultDSL          |
| `onReset`        | 调用 `reset()` 后              | 无                 |

## 内部状态管理（QuizStore）

### 设计原则

QuizStore 是 **内部实现细节**，不对外暴露。它的职责是：

1. 保存答案数据
2. 跟踪答题进度
3. 管理提交状态

### 状态结构

```typescript
// 内部状态 - 不对外暴露
interface QuizState {
  answers: Record<string, AnswerValue>; // 答案数据
  progress: { answered: number; total: number }; // 进度
  isSubmitted: boolean; // 是否已提交
  result: ResultDSL | null; // 提交后的结果
}
```

### 简化实现

QuizStore 只需要提供基本的状态管理能力：

```typescript
// 内部实现 - 不导出
class QuizStore {
  private state: QuizState;

  constructor(totalQuestions: number) {
    this.state = {
      answers: {},
      progress: { answered: 0, total: totalQuestions },
      isSubmitted: false,
      result: null,
    };
  }

  setAnswer(questionId: string, answer: AnswerValue): void {
    this.state.answers[questionId] = answer;
    this.state.progress.answered = Object.keys(this.state.answers).length;
  }

  getAnswers(): Record<string, AnswerValue> {
    return { ...this.state.answers };
  }

  getProgress(): { answered: number; total: number } {
    return { ...this.state.progress };
  }

  isComplete(): boolean {
    return this.state.progress.answered >= this.state.progress.total;
  }

  setResult(result: ResultDSL): void {
    this.state.result = result;
    this.state.isSubmitted = true;
  }

  reset(): void {
    this.state.answers = {};
    this.state.progress.answered = 0;
    this.state.isSubmitted = false;
    this.state.result = null;
  }
}
```

## QuizPlayer 实现

## QuizPlayer 核心实现 (TypeScript)

### 状态机实现细节

```typescript
// packages/quizerjs/src/player/QuizPlayer.ts

class QuizPlayer {
  private store: QuizStore;
  // ...

  submit(): ResultDSL {
    // 强制检查完成状态
    if (!this.store.isComplete()) {
      throw new Error('Quiz is not complete. Cannot submit.');
    }
    // ...
  }
}
```

## UI 组件设计 (WSX)

### 组件状态约束

鉴于 WSX 框架的限制，所有组件的 `@state` 属性必须遵循以下规则：

1. **禁止使用 `null` 或 `undefined` 作为初始值**：必须赋予有效的默认值（如 `''`, `{}`, `[]`, `false`, `0`）。
2. **类型安全**：在解析属性（`onAttributeChanged`）时，若值为无效或缺失，应回退到上述默认值。

### QuizSubmit 组件

`QuizSubmit` 组件负责在测验结束时显示提交逻辑。

**属性 (Attributes/State)**:

- `label`: 按钮文本 (默认: "提交答案")
- `answered`: 已回答题目数量
- `total`: 总题目数量
- `quiz-id`: 关联的测验 ID（用于查找 Store）
- `disabled`: 是否禁用
- `loading`: 是否处于提交中状态

**Store 订阅机制**:
为了保证进度实时同步，`QuizSubmit` 组件在 `onConnected` 时会通过 `quiz-id` 查找 `QuizStore` 并进行 **订阅 (Subscribe)**。

- 当 Store 状态变化时，自动更新 `answered` 和 `total`。
- 若 `answered < total`，提交按钮应处于 `disabled` 状态。

## 框架集成示例

### Vue 集成

```vue
<template>
  <div ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { QuizPlayer } from '@quizerjs/quizerjs';

const container = ref(null);
let player = null;

const emit = defineEmits(['start', 'answer-change', 'complete', 'submit']);

onMounted(async () => {
  player = new QuizPlayer({
    container: container.value,
    quizDSL: props.quizDSL,
    onStart: () => emit('start'),
    onAnswerChange: (qid, answer) => emit('answer-change', { qid, answer }),
    onComplete: () => emit('complete'),
    onSubmit: result => emit('submit', result),
  });
  await player.init();
  player.start();
});

onUnmounted(() => {
  player?.destroy();
});
</script>
```

### React 集成

```tsx
import { useEffect, useRef } from 'react';
import { QuizPlayer } from '@quizerjs/quizerjs';

function Quiz({ quizDSL, onComplete, onSubmit }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const player = new QuizPlayer({
      container: containerRef.current,
      quizDSL,
      onComplete,
      onSubmit,
    });

    player.init().then(() => player.start());
    playerRef.current = player;

    return () => player.destroy();
  }, [quizDSL]);

  return <div ref={containerRef} />;
}
```

## 实施计划

### 任务清单

1. **QuizPlayer 核心实现**
   - [x] 实现内部 QuizStore 类 (使用 @quizerjs/core)
   - [x] 实现 `start()`, `setAnswer()`, `submit()`, `reset()` 方法
   - [ ] 实现事件回调机制：`onStart`, `onAnswerChange`, `onComplete`, `onSubmit`
     - [ ] `onStart`: `start()` 时触发
     - [x] `onAnswerChange`: `setAnswer()` 时触发
     - [ ] `onComplete`: `setAnswer()` 检测到所有题目完成时触发
     - [x] `onSubmit`: `submit()` 时触发
     - [ ] `onReset`: `reset()` 时触发
   - [x] 实现 `isComplete()` 检测逻辑

2. **框架适配层更新**
   - [x] 更新 React 组件，暴露事件和方法
   - [ ] 更新 Vue 组件，暴露事件 (待办)
   - [ ] 更新 Svelte 组件，暴露事件 (待办)

3. **测试**
   - [ ] QuizPlayer 单元测试
   - [ ] 事件触发时机测试
   - [ ] 框架集成测试

## 验收标准

- ✅ `start()` 调用时触发 `onStart`
- ✅ `setAnswer()` 调用时触发 `onAnswerChange`
- ✅ 所有问题回答完毕时触发 `onComplete`（仅首次）
- ✅ `submit()` 调用时触发 `onSubmit`，并返回 `ResultDSL`
- ✅ `reset()` 重置状态，可以重新开始测验
- ✅ 内部 QuizStore 不对外暴露

## 修正与优化 (Post-Implementation Refinements)

### 1. 事件死循环修复 (Infinite Loop Fix)

**问题**：`QuizQuestion` 组件监听 `answer-change` 事件并调用 `setAnswer`，而 `setAnswer` 内部会再次分发 `answer-change` 以通知外界。由于事件名相同，组件会捕获到自己发出的事件，导致无限递归。

**修正**：在 `handleAnswerChange` 监听器中增加目标检查：

```typescript
if (e.target === this.element) return;
```

只有来自子组件（如单选题、文本框）的事件才会被处理，组件自身分发的事件将被忽略。这确保了事件可以安全地冒泡到 `QuizPlayer` 而不会触发内部死循环。

### 2. 状态单一数据源 (Single Source of Truth)

**问题**：最初版本中，`QuizPlayer` 和 `QuizStore` 各自通过 `this.answers` 维护一份答案副本。这种冗余导致了状态不一致：UI 可能更新了 Store，但 `QuizPlayer` 的 `submit()` 逻辑仍在使用旧的内部变量。

**修正**：

- 移除 `QuizPlayer` 类中的 `this.answers` 私有属性。
- 所有查询方法（`getAnswers()`, `isComplete()`, `getCurrentScore()`）全部委托给 `QuizStore`。
- `submit()` 方法直接从 Store 获取最新答案并计算结果。
- 确保所有状态变更均通过 `dispatch(quizActions.setAnswer(...))` 完成。

这种设计确保了整个系统中只有一份权威的答案数据，提高了系统的可靠性。

### 3. QuizSubmit 状态不一致修复 (State Mismatch Fix)

**问题**：`QuizSubmit` 组件显示的“已完成”问题数量与 `QuizStore` 中的实际答题数不一致（例如实际回答 4 题，UI 显示 3 题）。

**根本原因**：这是一个初始化时的 **竞态条件 (Race Condition)**。

1. `QuizPlayer` 初始化流程中，先调用 `createSlideRunner` 创建 UI（包括挂载 `wsx-quiz-submit` 组件）。
2. `wsx-quiz-submit` 组件在 `connectedCallback` 中立即尝试通过 `getQuizStoreById` 获取 Store 并订阅。
3. 但此时 `registerQuizStore` 尚未被调用（在创建 UI 之后才调用），导致组件首次订阅失败。
4. 虽然组件有 `quiz-id` 属性监听，但在某些情况下未能正确触发重新连接。

**修正**：

1. **重构初始化顺序**：调整 `QuizPlayer.ts` 的 `init()` 方法，确保在创建 SlideRunner 之前先完成 Store 的注册和初始化。
2. **增强组件健壮性**：`QuizSubmit.wsx` 在 `quiz-id` 属性变更时强制重新订阅，并增加了详细的调试日志接口。

此修复通过 Browser Subagent 进行了端到端验证，确认解决了状态同步问题。

## 实施进度

### 已完成 ✅

1.  **QuizPlayer 核心实现**
    - ✅ 生命周期方法 (`init`, `start`, `reset`, `destroy`)
    - ✅ 答案管理 (`setAnswer`, `getAnswer`, `getAnswers`, `clearAnswer`)
    - ✅ 状态查询 (`getProgress`, `isComplete`, `isSubmitted`)
    - ✅ 提交功能 (`submit`)
    - ✅ Reveal.js 集成用于 Slide 展示

2.  **QuizStore 状态管理**
    - ✅ 核心状态管理类实现
    - ✅ 答案收集和进度跟踪
    - ✅ 提交状态管理
    - ✅ Store 不对外暴露

3.  **UI 组件**
    - ✅ `quiz-submit.wsx` - 提交按钮组件
    - ✅ `quiz-results.wsx` - 结果展示组件
    - ✅ 组件状态约束遵循 WSX 框架要求

4.  **框架集成**
    - ✅ React QuizPlayer 组件 (90%)
    - ✅ Vue QuizPlayer 组件 (85%)
    - ✅ 事件传递机制 (`onAnswerChange`, `onSubmit`)

5.  **事件回调机制优化**
    - ✅ 实现 `onStart` 事件
    - ✅ 实现 `onComplete` 事件（检测所有问题完成）
    - ✅ 实现 `onReset` 事件
    - ✅ 事件触发时机测试

6.  **测试覆盖**
    - ✅ QuizPlayer 单元测试
    - ✅ QuizStore 单元测试
    - ✅ 事件触发时机测试

### 进行中 🔄

1.  **框架集成完善**
    - ⏳ Svelte QuizPlayer 组件实现
    - ⏳ 完善 React/Vue 组件的错误处理

### 待办 ⏳

1.  **文档和示例**
    - ⏳ 完善 API 文档
    - ⏳ 添加更多使用示例
    - ⏳ 创建最佳实践指南

## 已知问题

(无 - 核心功能已验证)

---

**状态**: 已完成 (Completed) - 核心功能 100% 完成
**最后更新**: 2025-01-21
