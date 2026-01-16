# RFC 0010: Slide DSL 中的结果处理设计

**状态**: 草案 (Draft)  
**创建日期**: 2025-01-XX  
**作者**: quizerjs 团队

## 摘要

本文档设计在 Slide DSL 中处理测验结果展示的机制。当前 QuizPlayer 在提交后通过模态框显示结果，本 RFC 设计将结果展示集成到 Slide DSL 中，使其成为幻灯片流程的一部分，提供更灵活的自定义能力。

**关键设计理念**：
- **结果作为 Slide**：结果页面作为 Slide DSL 中的一个 slide，而非独立的模态框
- **动态数据传递**：通过 Slide DSL 的上下文变量将 Result DSL 传递给结果组件
- **向后兼容**：保留现有的模态框方式作为备选方案
- **灵活配置**：支持在 Slide DSL 中自定义结果页面的样式、布局和交互

## 动机

### 当前问题

1. **结果展示方式固定**：当前 `renderResults` 方法使用硬编码的模态框，无法自定义样式和布局
2. **不在 Slide 流程中**：结果展示是独立的模态框，不在 Slide DSL 定义的流程中
3. **无法自定义**：用户无法在 Slide DSL 中定义结果页面的样式、过渡效果等
4. **导航不统一**：结果页面与答题流程的导航方式不一致

### 设计目标

1. **集成到 Slide DSL**：结果页面作为 Slide DSL 的一部分，可以自定义样式和布局
2. **动态数据绑定**：通过 Slide DSL 的上下文变量将 Result DSL 传递给结果组件
3. **灵活配置**：支持多种结果展示方式（全屏、嵌入、模态框等）
4. **向后兼容**：保留现有的 `showResults` 选项和模态框方式

## 设计原则

1. **Slide DSL 优先**：结果展示优先使用 Slide DSL 中定义的方式
2. **数据驱动**：通过上下文变量传递 Result DSL，组件自动更新
3. **灵活扩展**：支持自定义结果页面的样式、布局和交互
4. **向后兼容**：保留现有 API 和行为，不破坏现有代码
5. **用户体验**：提供流畅的过渡效果和导航体验

## 架构设计

### 当前架构

```
QuizPlayer.submit()
  ↓
生成 Result DSL
  ↓
renderResults() → 创建模态框 → wsx-quiz-results 组件
```

### 新架构

```
QuizPlayer.submit()
  ↓
生成 Result DSL
  ↓
检查 Slide DSL 中是否有结果页面定义
  ├─→ 有定义 → 导航到结果 slide → wsx-quiz-results 组件（通过上下文变量）
  └─→ 无定义 → renderResults() → 创建模态框 → wsx-quiz-results 组件（向后兼容）
```

## Slide DSL 语法设计

### 结果页面定义

在 Slide DSL 中，结果页面可以通过以下方式定义：

#### 方案一：使用 `rule end` 定义结果页面（推荐）

```slide
present quiz "quiz" {
  rules {
    // ... 其他规则 ...
    
    // 结束规则：结果页面
    rule end "results" {
      slide {
        content dynamic {
          name: "wsx-quiz-results"
          attrs {
            result-dsl: resultDSL  // 上下文变量，由 QuizPlayer 自动注入
          }
        }
        behavior {
          transition fade {
            duration: 500
          }
        }
      }
    }
  }
}
```

#### 方案二：使用特殊规则类型 `rule result`

```slide
present quiz "quiz" {
  rules {
    // ... 其他规则 ...
    
    // 结果规则：结果页面
    rule result "results" {
      slide {
        content dynamic {
          name: "wsx-quiz-results"
          attrs {
            result-dsl: resultDSL
          }
        }
        behavior {
          transition fade {
            duration: 500
          }
        }
      }
    }
  }
}
```

**推荐使用方案一**，因为：
- 结果页面本质上是测验的结束页面
- 不需要引入新的规则类型
- 语义更清晰（`rule end` 表示结束）

### 上下文变量注入

QuizPlayer 在提交后，需要将 Result DSL 注入到 Slide DSL 的上下文中。**使用现有的 SlideRunner API**：

```typescript
// QuizPlayer.ts
submit(): ResultDSL {
  // ... 生成 Result DSL ...
  
  const resultDSL: ResultDSL = { /* ... */ };
  
  // 注入到 Slide DSL 上下文（使用 SlideRunner 的内置 API）
  if (this.runner) {
    // 通过 SlideRunner 的上下文更新方法（如果支持）
    // 或者通过重新初始化上下文（如果需要在运行时更新）
    // 具体实现取决于 @slidejs/runner 的 API
    this.updateContext({ custom: { resultDSL } });
  }
  
  // 如果 Slide DSL 中定义了结果页面，导航到结果页面
  if (this.hasResultSlide()) {
    this.navigateToResultSlide();
  } else {
    // 向后兼容：使用模态框
    if (this.options.showResults !== false) {
      this.renderResults(resultDSL);
    }
  }
  
  return resultDSL;
}
```

**注意**：具体的上下文更新方法取决于 `@slidejs/runner` 的实际 API。如果支持运行时更新，直接调用；如果不支持，可能需要重新渲染或使用其他方式。

### 结果页面检测

QuizPlayer 需要检测 Slide DSL 中是否定义了结果页面：

```typescript
private hasResultSlide(): boolean {
  if (!this.runner) return false;
  
  // 检查 rule end 中是否包含 wsx-quiz-results 组件
  const endRules = this.runner.getEndRules();
  return endRules.some(rule => 
    rule.slide?.content?.type === 'dynamic' &&
    rule.slide.content.name === 'wsx-quiz-results'
  );
}
```

## 组件间通信与状态管理

### 问题

当前实现中，各个组件（问题组件、提交组件、结果组件）需要能够：
1. **问题组件** → **QuizPlayer**：通知答案变更
2. **QuizPlayer** → **提交组件**：传递答题进度（answered/total）
3. **提交组件** → **QuizPlayer**：触发提交
4. **QuizPlayer** → **结果组件**：传递 Result DSL

### 解决方案：Quiz Lite Redux

设计一个轻量级的 Redux 风格状态管理系统，专门为 Quiz 场景优化，保持简洁和易用：

#### 核心设计原则（Lite 版本）

1. **单一状态树**：所有状态集中在一个对象中
2. **不可变状态**：状态更新通过创建新对象实现（简化版，使用浅拷贝）
3. **Actions**：通过 dispatch actions 来更新状态（类型化，但简化）
4. **Reducer**：单一 reducer 函数处理所有状态更新（不拆分多个 reducers）
5. **订阅机制**：简单的订阅/取消订阅机制
6. **轻量级**：去除中间件、时间旅行等高级特性，专注核心功能
7. **类型安全**：完整的 TypeScript 类型支持

#### 状态结构

```typescript
// QuizState - 单一状态树
interface QuizState {
  // 答案状态
  answers: Record<string, AnswerValue>;
  
  // 答题进度
  progress: {
    answered: number;
    total: number;
  };
  
  // Result DSL（提交后）
  resultDSL: ResultDSL | null;
  
  // 提交状态
  isSubmitting: boolean;
  isSubmitted: boolean;
  
  // 元数据
  quizId: string | null;
  startTime: number | null;
}
```

#### Actions 定义

```typescript
// QuizActions - 类型化的 Actions
type QuizAction =
  | { type: 'QUIZ_INIT'; payload: { quizId: string; totalQuestions: number } }
  | { type: 'ANSWER_SET'; payload: { questionId: string; answer: AnswerValue } }
  | { type: 'ANSWER_CLEAR'; payload: { questionId: string } }
  | { type: 'ANSWERS_RESET'; payload?: void }
  | { type: 'SUBMIT_START'; payload?: void }
  | { type: 'SUBMIT_SUCCESS'; payload: { resultDSL: ResultDSL } }
  | { type: 'SUBMIT_FAILURE'; payload: { error: Error } }
  | { type: 'RESULT_SET'; payload: { resultDSL: ResultDSL } };
```

#### Lite 版本特点

**简化设计**：
- ✅ **单一 Reducer**：所有状态更新逻辑集中在一个 reducer 方法中（不拆分多个 reducers）
- ✅ **内置 Reducer**：Reducer 作为 QuizStore 的私有方法，不单独导出
- ✅ **浅拷贝优化**：使用浅拷贝实现不可变性，性能更好
- ✅ **无中间件**：去除中间件系统，保持简单
- ✅ **无时间旅行**：不支持状态历史记录和回退（可选的未来扩展）
- ✅ **轻量级**：代码量小，易于理解和维护

**保留的核心特性**：
- ✅ Actions 类型化
- ✅ 不可变状态更新
- ✅ 订阅机制
- ✅ 选择器方法
- ✅ 类型安全

#### QuizStore 实现（Lite 版本）

```typescript
// @quizerjs/core/store/QuizStore.ts

/**
 * Quiz Lite Redux - 轻量级 Redux 风格状态管理
 * 专门为 Quiz 场景优化，保持简洁和易用
 */

// 初始状态
const initialState: QuizState = {
  answers: {},
  progress: { answered: 0, total: 0 },
  resultDSL: null,
  isSubmitting: false,
  isSubmitted: false,
  quizId: null,
  startTime: null,
};

/**
 * QuizStore - 轻量级 Redux 风格 Store
 */
export class QuizStore {
  private state: QuizState;
  private listeners: Set<() => void> = new Set();

  constructor(initialState?: Partial<QuizState>) {
    this.state = { ...initialState, ...initialState };
  }

  /**
   * 获取当前状态（浅拷贝，防止外部修改）
   */
  getState(): QuizState {
    return {
      ...this.state,
      answers: { ...this.state.answers },
      progress: { ...this.state.progress },
    };
  }

  /**
   * Dispatch action 更新状态
   * 
   * 工作流程：
   * 1. 保存当前状态（用于比较）
   * 2. 通过 reducer 计算新状态
   * 3. 如果状态发生变化，通知所有订阅者
   */
  dispatch(action: QuizAction): void {
    const prevState = this.state;
    this.state = this.reducer(this.state, action);
    
    // 如果状态发生变化，通知所有订阅者
    if (prevState !== this.state) {
      this.listeners.forEach(listener => listener());
    }
  }

  /**
   * 订阅状态变化
   * 
   * 工作原理：
   * 1. 将监听器函数添加到 listeners Set 中
   * 2. 当 dispatch() 导致状态变化时，所有监听器会被调用
   * 3. 返回取消订阅函数，用于清理
   * 
   * @param listener 监听器函数，当状态变化时会被调用
   * @returns 取消订阅函数
   * 
   * @example
   * ```typescript
   * const store = getQuizStore();
   * const unsubscribe = store.subscribe(() => {
   *   console.log('状态已更新:', store.getState());
   * });
   * 
   * // 稍后取消订阅
   * unsubscribe();
   * ```
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 单一 Reducer - 处理所有 actions
   * Lite 版本：不拆分多个 reducers，保持简单
   */
  private reducer(state: QuizState, action: QuizAction): QuizState {
    switch (action.type) {
      case 'QUIZ_INIT': {
        const { quizId, totalQuestions } = action.payload;
        return {
          ...state,
          quizId,
          progress: { answered: 0, total: totalQuestions },
          startTime: Date.now(),
        };
      }

      case 'ANSWER_SET': {
        const { questionId, answer } = action.payload;
        const newAnswers = { ...state.answers, [questionId]: answer };
        const answered = Object.keys(newAnswers).length;
        
        return {
          ...state,
          answers: newAnswers,
          progress: { ...state.progress, answered },
        };
      }

      case 'ANSWER_CLEAR': {
        const { questionId } = action.payload;
        const { [questionId]: _, ...newAnswers } = state.answers;
        const answered = Object.keys(newAnswers).length;
        
        return {
          ...state,
          answers: newAnswers,
          progress: { ...state.progress, answered },
        };
      }

      case 'ANSWERS_RESET':
        return {
          ...state,
          answers: {},
          progress: { ...state.progress, answered: 0 },
          resultDSL: null,
          isSubmitted: false,
          startTime: Date.now(),
        };

      case 'SUBMIT_START':
        return { ...state, isSubmitting: true };

      case 'SUBMIT_SUCCESS': {
        const { resultDSL } = action.payload;
        return {
          ...state,
          isSubmitting: false,
          isSubmitted: true,
          resultDSL,
        };
      }

      case 'SUBMIT_FAILURE':
        return { ...state, isSubmitting: false };

      case 'RESULT_SET': {
        const { resultDSL } = action.payload;
        return { ...state, resultDSL };
      }

      default:
        return state;
    }
  }

  // ========== 选择器方法（便利方法）==========

  /**
   * 获取所有答案
   */
  getAnswers(): Record<string, AnswerValue> {
    return { ...this.state.answers };
  }

  /**
   * 获取单个答案
   */
  getAnswer(questionId: string): AnswerValue | undefined {
    return this.state.answers[questionId];
  }

  /**
   * 获取答题进度
   */
  getProgress(): { answered: number; total: number } {
    return { ...this.state.progress };
  }

  /**
   * 获取 Result DSL
   */
  getResultDSL(): ResultDSL | null {
    return this.state.resultDSL;
  }

  /**
   * 是否已回答所有问题
   */
  isComplete(): boolean {
    return this.state.progress.answered >= this.state.progress.total;
  }

  /**
   * 是否正在提交
   */
  isSubmitting(): boolean {
    return this.state.isSubmitting;
  }

  /**
   * 是否已提交
   */
  isSubmitted(): boolean {
    return this.state.isSubmitted;
  }
}

// ========== 单例模式 ==========

let storeInstance: QuizStore | null = null;

/**
 * 创建 QuizStore 实例（单例模式）
 */
export function createQuizStore(initialState?: Partial<QuizState>): QuizStore {
  if (!storeInstance) {
    storeInstance = new QuizStore(initialState);
  }
  return storeInstance;
}

/**
 * 获取 QuizStore 实例
 * @throws 如果 store 未初始化
 */
export function getQuizStore(): QuizStore {
  if (!storeInstance) {
    throw new Error('QuizStore not initialized. Call createQuizStore() first.');
  }
  return storeInstance;
}

/**
 * 重置 QuizStore（用于测试或重新初始化）
 */
export function resetQuizStore(): void {
  storeInstance = null;
}
```

#### Action Creators（可选，提供便利方法）

```typescript
// Action Creators - 创建类型化的 Actions
export const quizActions = {
  initQuiz: (quizId: string, totalQuestions: number): QuizAction => ({
    type: 'QUIZ_INIT',
    payload: { quizId, totalQuestions },
  }),

  setAnswer: (questionId: string, answer: AnswerValue): QuizAction => ({
    type: 'ANSWER_SET',
    payload: { questionId, answer },
  }),

  clearAnswer: (questionId: string): QuizAction => ({
    type: 'ANSWER_CLEAR',
    payload: { questionId },
  }),

  resetAnswers: (): QuizAction => ({
    type: 'ANSWERS_RESET',
  }),

  startSubmit: (): QuizAction => ({
    type: 'SUBMIT_START',
  }),

  submitSuccess: (resultDSL: ResultDSL): QuizAction => ({
    type: 'SUBMIT_SUCCESS',
    payload: { resultDSL },
  }),

  submitFailure: (error: Error): QuizAction => ({
    type: 'SUBMIT_FAILURE',
    payload: { error },
  }),

  setResult: (resultDSL: ResultDSL): QuizAction => ({
    type: 'RESULT_SET',
    payload: { resultDSL },
  }),
};
```

### 使用方式

#### 在 QuizPlayer 中初始化 Store

```typescript
// QuizPlayer.ts
import { createQuizStore, quizActions } from '@quizerjs/core/store';

class QuizPlayer {
  private store: QuizStore;

  constructor(options: QuizPlayerOptions) {
    // 初始化 Store
    this.store = createQuizStore();
    
    // 初始化 Quiz 状态
    const totalQuestions = this.getAllQuestions().length;
    this.store.dispatch(
      quizActions.initQuiz(options.quizDSL.quiz.id, totalQuestions)
    );
  }

  setAnswer(questionId: string, answer: AnswerValue): void {
    // 通过 dispatch action 更新状态
    this.store.dispatch(quizActions.setAnswer(questionId, answer));
    this.options.onAnswerChange?.(questionId, answer);
  }

  submit(): ResultDSL {
    // 开始提交
    this.store.dispatch(quizActions.startSubmit());
    
    try {
      const resultDSL = this.generateResultDSL();
      
      // 提交成功
      this.store.dispatch(quizActions.submitSuccess(resultDSL));
      
      // ... 其他逻辑
      return resultDSL;
    } catch (error) {
      // 提交失败
      this.store.dispatch(
        quizActions.submitFailure(error instanceof Error ? error : new Error(String(error)))
      );
      throw error;
    }
  }

  getStore(): QuizStore {
    return this.store;
  }
}
```

### 组件集成

#### wsx-quiz-question 组件

**设计原则**：组件通过 dispatch action 更新状态，而不是直接修改。

```typescript
// wsx-quiz-question.wsx
import { getQuizStore, quizActions } from '@quizerjs/core/store';

@autoRegister({ tagName: 'wsx-quiz-question' })
export class QuizQuestion extends LightComponent {
  private store: QuizStore;
  private questionId: string;

  onConnected() {
    this.store = getQuizStore();
    // 从属性获取 questionId
    this.questionId = this.getAttribute('question-id') || '';
  }

  private handleAnswerChange = (answer: AnswerValue) => {
    // 通过 dispatch action 更新状态（Redux 风格）
    this.store.dispatch(quizActions.setAnswer(this.questionId, answer));
    
    // 可选：触发自定义事件（用于向后兼容）
    const event = new CustomEvent('answer-change', {
      detail: { questionId: this.questionId, answer },
      bubbles: true,
    });
    this.dispatchEvent(event);
  };

  render() {
    // 从 store 获取当前答案（用于显示选中状态）
    const currentAnswer = this.store.getAnswer(this.questionId);
    // ... 渲染逻辑
  }
}
```

#### wsx-quiz-submit 组件

**设计原则**：组件内部直接订阅 QuizStore，通过 Redux 风格的 subscribe 机制获取状态更新。

```typescript
// wsx-quiz-submit.wsx
import { getQuizStore } from '@quizerjs/core/store';

@autoRegister({ tagName: 'wsx-quiz-submit' })
export class QuizSubmit extends LightComponent {
  @state private answeredCount = 0;
  @state private totalCount = 0;
  @state private isSubmitting = false;
  
  private store: QuizStore;
  private unsubscribe?: () => void;

  onConnected() {
    // 获取 Store 实例
    this.store = getQuizStore();
    
    // 初始化时获取当前状态
    this.updateFromStore();
    
    // 订阅状态变化（Redux 风格的 subscribe）
    this.unsubscribe = this.store.subscribe(() => {
      this.updateFromStore();
      this.requestUpdate(); // 触发组件重新渲染
    });
  }

  onDisconnected() {
    // 清理订阅，防止内存泄漏
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private updateFromStore() {
    const state = this.store.getState();
    this.answeredCount = state.progress.answered;
    this.totalCount = state.progress.total;
    this.isSubmitting = state.isSubmitting;
  }

  private handleSubmit = () => {
    if (this.isSubmitting) return;
    
    // 触发提交事件，由 QuizPlayer 处理
    const event = new CustomEvent('quiz-submit', {
      bubbles: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
  };

  render() {
    const progressText = `已作答 ${this.answeredCount}/${this.totalCount} 题`;
    // ... 渲染逻辑
  }
}
```

**优势**：
- ✅ **可预测的状态更新**：通过 actions 和 reducers，状态更新逻辑清晰
- ✅ **类型安全**：TypeScript 类型检查确保 action 和 state 的正确性
- ✅ **易于测试**：纯函数 reducer 易于单元测试
- ✅ **性能优化**：只更新订阅的组件，不重新渲染整个 Slide
- ✅ **时间旅行调试**：可以记录所有 actions，支持调试（可选扩展）

#### 多实例问题与解决方案

**问题**：如果页面中有多个 QuizPlayer 实例同时运行，会发生什么？

**当前设计的问题**：
- QuizStore 使用单例模式（`createQuizStore()` 返回同一个实例）
- 如果创建了 2 个 QuizPlayer 实例，它们会共享同一个 QuizStore 实例
- 这会导致：
  - ❌ 两个播放器的答案会互相覆盖
  - ❌ 进度会混乱（两个播放器的进度会合并）
  - ❌ 提交状态会冲突
  - ❌ 组件订阅会收到错误的状态更新

**解决方案：每个 QuizPlayer 实例使用独立的 QuizStore**

修改设计，让每个 QuizPlayer 实例创建自己的 QuizStore 实例：

```typescript
// QuizPlayer.ts
constructor(options: QuizPlayerOptions) {
  // 每个实例创建自己的 QuizStore（不使用单例）
  this.store = new QuizStore();
  // 或者：createQuizStore() 改为非单例，每次都创建新实例
}
```

**组件如何找到正确的 Store？**

方案一：通过 QuizPlayer 实例传递（推荐）
- QuizPlayer 在创建组件时，通过 DOM 属性或全局注册传递 store 实例
- 组件通过 `getQuizStore()` 获取，但需要支持传入实例 ID

方案二：使用命名空间/ID
- 每个 QuizPlayer 有一个唯一 ID
- QuizStore 支持多个命名空间实例
- 组件通过 ID 获取对应的 store

方案三：组件直接访问 QuizPlayer（最简单）
- 组件通过 DOM 事件或属性获取 QuizPlayer 实例
- 通过 `player.getStore()` 获取 store

**推荐方案：方案三（最简单）**

```typescript
// wsx-quiz-submit.wsx
onConnected() {
  // 通过 DOM 事件或属性获取 QuizPlayer 实例
  const player = this.getQuizPlayerInstance();
  if (player) {
    this.store = player.getStore();
    this.unsubscribe = this.store.subscribe(() => {
      this.updateFromStore();
      this.requestUpdate();
    });
  }
}

private getQuizPlayerInstance(): QuizPlayer | null {
  // 方法1：通过 DOM 属性
  const playerId = this.getAttribute('player-id');
  if (playerId) {
    return QuizPlayerRegistry.get(playerId);
  }
  
  // 方法2：通过事件查找最近的 QuizPlayer
  // 方法3：通过容器元素向上查找
  return null;
}
```

**或者更简单的方案：每个 QuizPlayer 创建独立的 QuizStore，组件通过容器元素查找**

```typescript
// QuizPlayer.ts
constructor(options: QuizPlayerOptions) {
  // 创建独立的 QuizStore 实例
  this.store = new QuizStore();
  
  // 在容器元素上注册 store（用于组件查找）
  if (typeof container === 'string') {
    // 延迟到 init() 时注册
  } else {
    (container as HTMLElement).dataset.quizStoreId = this.storeId;
    QuizStoreRegistry.set(this.storeId, this.store);
  }
}

// 组件通过容器元素查找 store
onConnected() {
  const container = this.closest('[data-quiz-store-id]');
  if (container) {
    const storeId = container.getAttribute('data-quiz-store-id');
    this.store = QuizStoreRegistry.get(storeId);
  }
}
```

**最终推荐方案：每个 QuizPlayer 实例创建独立的 QuizStore**

修改 `createQuizStore()` 为非单例模式，或者直接使用 `new QuizStore()`：

```typescript
// QuizPlayer.ts
constructor(options: QuizPlayerOptions) {
  // 每个实例创建自己的 QuizStore（不使用单例）
  this.store = new QuizStore();
  
  // 在容器元素上存储 store 引用（用于组件查找）
  // 延迟到 init() 时设置
}

async init(): Promise<void> {
  // ... 其他初始化代码 ...
  
  // 在容器元素上存储 store 引用
  if (this.containerElement) {
    (this.containerElement as any).__quizStore = this.store;
  }
}

// 组件通过容器元素查找 store
onConnected() {
  // 向上查找最近的容器元素
  let element: HTMLElement | null = this;
  while (element && element !== document.body) {
    if ((element as any).__quizStore) {
      this.store = (element as any).__quizStore;
      break;
    }
    element = element.parentElement;
  }
  
  if (this.store) {
    this.unsubscribe = this.store.subscribe(() => {
      this.updateFromStore();
      this.requestUpdate();
    });
  }
}
```

#### Quiz Lite Redux 的优势

1. **轻量级设计**
   - 代码量小（约 200-300 行），易于理解和维护
   - 无外部依赖，纯 TypeScript 实现
   - 专门为 Quiz 场景优化，去除不必要的复杂性

2. **可预测的状态更新**
   - 所有状态更新都通过 actions 和 reducer，逻辑清晰
   - 状态变化可追溯，易于调试

3. **类型安全**
   - TypeScript 类型检查确保 action 和 state 的正确性
   - 编译时发现错误，减少运行时问题

4. **易于测试**
   - Reducer 是纯函数，易于单元测试
   - 可以测试每个 action 的状态变化

5. **性能优化**
   - 组件只订阅需要的状态部分
   - 只更新订阅的组件，不重新渲染整个 Slide
   - 使用浅拷贝，性能更好

6. **单一数据源**
   - 所有状态集中在一个 store 中
   - 避免状态同步问题

7. **简单易用**
   - API 简洁，学习成本低
   - 不需要了解 Redux 的复杂概念（如 combineReducers、中间件等）

#### 与完整 Redux 的区别

| 特性 | Quiz Lite Redux | 完整 Redux |
|------|----------------|-----------|
| Reducer | 单一 reducer（内置） | 可拆分多个 reducers |
| 中间件 | 不支持 | 支持（如 redux-thunk, redux-saga） |
| 时间旅行 | 不支持 | 支持（redux-devtools） |
| 代码量 | ~200-300 行 | ~1000+ 行（含中间件） |
| 学习曲线 | 低 | 中高 |
| 适用场景 | Quiz 专用 | 通用应用 |

**为什么选择 Lite 版本？**
- Quiz 场景的状态管理需求相对简单，不需要 Redux 的完整功能
- 保持代码库轻量，避免引入不必要的复杂性
- 更容易维护和理解，适合团队协作
- 性能足够好，满足 Quiz 场景的需求

#### Store 通知机制详解

**通知流程**：

```
组件 A (wsx-quiz-question)
  ↓
dispatch(quizActions.setAnswer('q1', 'A'))
  ↓
QuizStore.dispatch()
  ├─→ 保存旧状态: prevState = this.state
  ├─→ 计算新状态: this.state = reducer(this.state, action)
  ├─→ 比较状态: if (prevState !== this.state)
  └─→ 通知所有订阅者: listeners.forEach(listener => listener())
       ├─→ 组件 B (wsx-quiz-submit) 的监听器被调用
       │   └─→ 更新 answeredCount 和 totalCount
       └─→ 组件 C (其他订阅者) 的监听器被调用
           └─→ 执行相应的更新逻辑
```

**工作原理**：

1. **订阅阶段**：组件通过 `store.subscribe()` 注册监听器
   ```typescript
   const unsubscribe = store.subscribe(() => {
     // 当状态变化时，这个函数会被调用
     const newState = store.getState();
     // 更新组件状态
     this.updateFromStore(newState);
   });
   ```

2. **状态更新阶段**：当 `dispatch(action)` 被调用时
   ```typescript
   store.dispatch(quizActions.setAnswer('q1', 'answer1'));
   // 内部流程：
   // 1. 保存旧状态: prevState = this.state
   // 2. 计算新状态: this.state = this.reducer(this.state, action)
   // 3. 比较状态: if (prevState !== this.state)
   // 4. 通知所有监听器: this.listeners.forEach(listener => listener())
   ```

3. **通知阶段**：所有订阅的监听器都会被同步调用
   ```typescript
   // 在 dispatch() 内部
   if (prevState !== this.state) {
     this.listeners.forEach(listener => listener());
     // 每个监听器函数都会被调用
   }
   ```

4. **组件更新阶段**：监听器函数中更新组件状态
   ```typescript
   store.subscribe(() => {
     const state = store.getState();
     this.answeredCount = state.progress.answered;
     this.totalCount = state.progress.total;
     this.requestUpdate(); // 触发组件重新渲染
   });
   ```

5. **清理阶段**：组件卸载时取消订阅
   ```typescript
   onDisconnected() {
     if (this.unsubscribe) {
       this.unsubscribe(); // 从 listeners Set 中移除
     }
   }
   ```

**关键点**：
- ✅ **同步通知**：所有监听器在 `dispatch()` 调用时同步执行
- ✅ **批量更新**：一次 `dispatch()` 只触发一次通知，即使状态多个字段变化
- ✅ **自动清理**：返回的取消订阅函数用于防止内存泄漏
- ✅ **性能优化**：只有状态真正变化时才通知（通过 `prevState !== this.state` 比较）

**示例：完整流程**

```typescript
// 1. 组件订阅
const store = getQuizStore();
const unsubscribe = store.subscribe(() => {
  console.log('状态已更新');
  const state = store.getState();
  console.log('新状态:', state);
});

// 2. 某个地方 dispatch action
store.dispatch(quizActions.setAnswer('q1', 'A'));
// 输出：
// "状态已更新"
// "新状态: { answers: { q1: 'A' }, progress: { answered: 1, total: 5 }, ... }"

// 3. 清理
unsubscribe();
```

#### QuizPlayer 集成示例

```typescript
// QuizPlayer.ts
import { createQuizStore, quizActions } from '@quizerjs/core/store';

class QuizPlayer {
  private store: QuizStore;
  
  constructor(options: QuizPlayerOptions) {
    // 初始化 Store
    this.store = createQuizStore();
    
    // 初始化 Quiz 状态
    const totalQuestions = this.getAllQuestions().length;
    this.store.dispatch(
      quizActions.initQuiz(options.quizDSL.quiz.id, totalQuestions)
    );
  }
  
  setAnswer(questionId: string, answer: AnswerValue): void {
    // 通过 dispatch action 更新状态
    this.store.dispatch(quizActions.setAnswer(questionId, answer));
    this.options.onAnswerChange?.(questionId, answer);
  }
  
  submit(): ResultDSL {
    // 开始提交
    this.store.dispatch(quizActions.startSubmit());
    
    try {
      const resultDSL = this.generateResultDSL();
      
      // 提交成功
      this.store.dispatch(quizActions.submitSuccess(resultDSL));
      
      // ... 其他逻辑（导航、显示结果等）
      return resultDSL;
    } catch (error) {
      // 提交失败
      this.store.dispatch(
        quizActions.submitFailure(error instanceof Error ? error : new Error(String(error)))
      );
      throw error;
    }
  }

  getStore(): QuizStore {
    return this.store;
  }
}
```

### 在 Slide DSL 中使用

**重要设计原则**：组件内部直接消费 store，而不是通过 Slide DSL 属性传递动态数据。

**原因**：
1. **避免重新渲染**：Slide DSL 是静态定义的，如果通过上下文变量传递频繁变化的数据（如 `answeredCount`），每次变化都需要重新渲染整个 Slide，性能差
2. **组件化设计**：组件应该自己管理状态订阅，而不是依赖外部属性传递
3. **更高效**：组件内部订阅 store 变化，只更新组件自身，不影响整个 Slide

**正确的 Slide DSL 定义**：

```slide
rule end "submit" {
  slide {
    content dynamic {
      name: "wsx-quiz-submit"
      attrs {
        label: "提交答案"
        progress: true
        // 注意：answered 和 total 不需要在 Slide DSL 中传递
        // 组件内部会直接从 QuizStore 获取
      }
    }
  }
}
```

**组件实现**：`wsx-quiz-submit` 组件在 `onConnected()` 时订阅 QuizStore，实时获取进度：

```typescript
// wsx-quiz-submit.wsx
onConnected() {
  // 组件内部直接订阅 QuizStore，获取实时进度
  const store = QuizStore.getInstance();
  
  // 初始化时获取当前进度
  const progress = store.getProgress();
  this.answeredCount = progress.answered;
  this.totalCount = progress.total;
  
  // 订阅进度变化事件
  this.unsubscribeProgress = store.onProgressChange((progress) => {
    this.answeredCount = progress.answered;
    this.totalCount = progress.total;
    this.requestUpdate(); // 触发组件更新
  });
}

onDisconnected() {
  // 清理订阅
  if (this.unsubscribeProgress) {
    this.unsubscribeProgress();
  }
}
```

**优势**：
- ✅ 性能好：只更新组件自身，不重新渲染整个 Slide
- ✅ 实时更新：组件自动响应 store 变化
- ✅ 解耦：Slide DSL 只负责布局，不关心动态数据
- ✅ 灵活：组件可以自由决定如何消费 store

## 组件设计

### wsx-quiz-results 组件增强

**设计选择**：Result DSL 可以通过两种方式传递：

#### 方案一：通过属性传递（适合一次性数据）

在 Slide DSL 中通过上下文变量传递（Result DSL 只在提交时生成一次，不会频繁变化）：

```slide
content dynamic {
  name: "wsx-quiz-results"
  attrs {
    result-dsl: resultDSL  // 上下文变量，只在提交时设置一次
  }
}
```

#### 方案二：组件内部消费 Store（推荐，更灵活）

组件内部直接从 QuizStore 获取 Result DSL：

```typescript
// wsx-quiz-results.wsx
onConnected() {
  const store = QuizStore.getInstance();
  
  // 初始化时获取 Result DSL
  this.resultDSL = store.getResultDSL();
  
  // 订阅 Result DSL 变化（如果支持重新提交等场景）
  this.unsubscribeResult = store.onResultChange((resultDSL) => {
    this.resultDSL = resultDSL;
    this.requestUpdate();
  });
}
```

**推荐使用方案一**（通过属性传递），因为：
- Result DSL 只在提交时生成一次，不会频繁变化
- 通过上下文变量传递更符合 Slide DSL 的设计理念
- 不需要组件内部管理订阅

**但是**，对于频繁变化的数据（如 `answeredCount`），必须使用组件内部消费 Store 的方式。

组件需要支持：
1. **属性更新**：当通过属性传递时，组件能够解析 JSON 字符串
2. **Store 订阅**：当通过 Store 获取时，组件能够订阅变化
3. **JSON 序列化**：Result DSL 对象自动序列化为 JSON 字符串
4. **错误处理**：如果 Result DSL 无效，显示错误信息

### 组件属性

`wsx-quiz-results` 组件支持以下属性：

| 属性名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| `result-dsl` | `string` (JSON) | Result DSL 的 JSON 字符串 | `null` |
| `show-details` | `boolean` | 是否显示每题详情 | `true` |
| `show-stats` | `boolean` | 是否显示统计信息 | `true` |
| `compact` | `boolean` | 紧凑模式（减少间距） | `false` |

## 导航设计

### 提交后导航

当用户点击提交按钮后：

1. **生成 Result DSL**：QuizPlayer 调用 `submit()` 生成 Result DSL
2. **注入上下文变量**：将 Result DSL 注入到 Slide DSL 上下文
3. **检测结果页面**：检查 Slide DSL 中是否定义了结果页面
4. **导航到结果页面**：
   - 如果定义了结果页面，导航到结果 slide
   - 如果未定义，使用模态框方式（向后兼容）

### 导航流程

```
提交按钮点击
  ↓
QuizPlayer.submit()
  ↓
生成 Result DSL
  ↓
注入上下文变量 (resultDSL)
  ↓
检测结果页面
  ├─→ 有定义 → runner.navigateToSlide('results') → 显示结果 slide
  └─→ 无定义 → renderResults() → 显示模态框
```

### 返回导航

结果页面可以包含返回按钮，允许用户：
- 返回查看题目（如果 QuizPlayer 支持）
- 重新开始测验
- 关闭结果页面

## 样式和布局

### 默认样式

结果页面使用 `wsx-quiz-results` 组件的默认样式，支持：
- 主题集成（通过 CSS 变量）
- 响应式设计
- 可访问性支持

### 自定义样式

用户可以在 Slide DSL 中通过 `behavior` 和 `style` 定义自定义样式：

```slide
rule end "results" {
  slide {
    content dynamic {
      name: "wsx-quiz-results"
      attrs {
        result-dsl: resultDSL
        compact: true
      }
    }
    behavior {
      transition fade {
        duration: 500
      }
    }
    style {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      padding: "2rem"
    }
  }
}
```

## 向后兼容

### 兼容策略

1. **保留现有 API**：`showResults` 选项继续有效
2. **默认行为**：如果 Slide DSL 中未定义结果页面，使用模态框方式
3. **渐进增强**：用户可以选择使用 Slide DSL 定义结果页面，也可以继续使用模态框

### 兼容性检查

```typescript
// QuizPlayer.ts
submit(): ResultDSL {
  const resultDSL = this.generateResultDSL();
  
  // 检查是否在 Slide DSL 中定义了结果页面
  const hasResultSlide = this.hasResultSlide();
  
  if (hasResultSlide) {
    // 使用 Slide DSL 中的结果页面
    this.navigateToResultSlide(resultDSL);
  } else if (this.options.showResults !== false) {
    // 向后兼容：使用模态框
    this.renderResults(resultDSL);
  }
  
  return resultDSL;
}
```

## 实现说明

### 内置功能

**重要**：以下功能已经内置在 Slide DSL 和 SlideRunner 中，**无需增强**：

1. **Slide DSL 解析**：`@slidejs/dsl` 已经支持 `rule end` 语法，可以正常解析结果页面定义
2. **上下文变量系统**：Slide DSL 已经支持上下文变量（如 `quiz.title`），可以通过 `SlideContext.custom` 字段传递自定义变量
3. **动态数据绑定**：Slide DSL 的 `attrs` 中可以使用上下文变量，组件会自动接收更新后的数据

### 需要实现的功能

只需要在 QuizPlayer 中实现以下逻辑：

1. **结果页面检测**：检查 Slide DSL 中是否定义了结果页面（检查 `rule end` 中是否包含 `wsx-quiz-results` 组件）
2. **上下文变量注入**：在提交时，将 `resultDSL` 添加到 `SlideContext.custom` 字段，SlideRunner 会自动处理变量绑定
3. **导航到结果页面**：如果检测到结果页面，使用 SlideRunner 的导航方法跳转到结果 slide

## 实施计划

### 阶段一：QuizStore 核心实现（优先级：高）

**目标**：实现轻量级 Redux 风格的状态管理系统

#### 任务 1.1：创建 QuizStore 模块结构

**文件**：`packages/core/src/store/QuizStore.ts`

**步骤**：
1. 创建 `packages/core/src/store/` 目录
2. 定义 `QuizState` 接口
3. 定义 `QuizAction` 类型（所有 action 类型）
4. 实现 `QuizStore` 类：
   - 私有属性：`state`, `listeners`
   - 构造函数：初始化状态
   - `getState()`: 返回状态浅拷贝
   - `dispatch(action)`: 更新状态并通知订阅者
   - `subscribe(listener)`: 订阅状态变化
   - `private reducer()`: 处理所有 actions
   - 选择器方法：`getAnswers()`, `getAnswer()`, `getProgress()`, `getResultDSL()`, `isComplete()`, `isSubmitting()`, `isSubmitted()`
5. 实现单例模式：`createQuizStore()`, `getQuizStore()`, `resetQuizStore()`
6. 导出所有类型和函数

**验收标准**：
- [ ] 所有 TypeScript 类型定义完整
- [ ] QuizStore 类可以创建和初始化
- [ ] dispatch() 可以更新状态
- [ ] subscribe() 可以注册和取消订阅
- [ ] 所有选择器方法正常工作

#### 任务 1.2：实现 Action Creators

**文件**：`packages/core/src/store/quizActions.ts`

**步骤**：
1. 创建 `quizActions` 对象
2. 实现所有 action creators：
   - `initQuiz(quizId, totalQuestions)`
   - `setAnswer(questionId, answer)`
   - `clearAnswer(questionId)`
   - `resetAnswers()`
   - `startSubmit()`
   - `submitSuccess(resultDSL)`
   - `submitFailure(error)`
   - `setResult(resultDSL)`
3. 导出 `quizActions` 对象

**验收标准**：
- [ ] 所有 action creators 返回正确的 action 类型
- [ ] TypeScript 类型检查通过

#### 任务 1.3：导出 QuizStore 模块

**文件**：`packages/core/src/store/index.ts`

**步骤**：
1. 导出 `QuizStore` 类
2. 导出所有类型：`QuizState`, `QuizAction`
3. 导出函数：`createQuizStore()`, `getQuizStore()`, `resetQuizStore()`
4. 导出 `quizActions`
5. 更新 `packages/core/src/index.ts` 导出 store 模块

**验收标准**：
- [ ] 可以从 `@quizerjs/core/store` 导入所有内容
- [ ] 类型定义正确导出

### 阶段二：组件集成（优先级：高）

**目标**：将 QuizStore 集成到现有组件中

#### 任务 2.1：集成 wsx-quiz-question 组件

**文件**：`packages/core/src/components/quiz-question.wsx`

**步骤**：
1. 导入 `getQuizStore` 和 `quizActions`
2. 在 `onConnected()` 中获取 store 实例
3. 修改答案变更处理：
   - 通过 `store.dispatch(quizActions.setAnswer())` 更新状态
   - 保留现有的事件触发（向后兼容）
4. 使用 `store.getAnswer()` 获取当前答案（用于显示选中状态）
5. 测试组件正常工作

**验收标准**：
- [ ] 答案变更时，store 状态正确更新
- [ ] 组件显示正确的选中状态
- [ ] 不影响现有功能

#### 任务 2.2：集成 wsx-quiz-submit 组件

**文件**：`packages/core/src/components/quiz-submit.wsx`

**步骤**：
1. 导入 `getQuizStore`
2. 在 `onConnected()` 中：
   - 获取 store 实例
   - 初始化时获取当前进度：`store.getProgress()`
   - 订阅状态变化：`store.subscribe()`
   - 在监听器中更新 `answeredCount` 和 `totalCount`
3. 在 `onDisconnected()` 中取消订阅
4. 使用 `store.isSubmitting()` 获取提交状态
5. 移除硬编码的 `answered-count` 和 `total-count` 属性处理（如果存在）
6. 测试组件实时更新

**验收标准**：
- [ ] 答题进度实时更新
- [ ] 提交状态正确显示
- [ ] 组件卸载时正确清理订阅
- [ ] 不影响现有功能

#### 任务 2.3：集成 wsx-quiz-results 组件（可选）

**文件**：`packages/core/src/components/quiz-results.wsx`

**步骤**：
1. 保持通过属性传递 Result DSL 的方式（一次性数据）
2. 可选：添加通过 store 获取 Result DSL 的支持
3. 测试组件正常工作

**验收标准**：
- [ ] 通过属性传递 Result DSL 正常工作
- [ ] 如果实现 store 支持，也能正常工作

### 阶段三：QuizPlayer 集成（优先级：高）

**目标**：将 QuizStore 集成到 QuizPlayer 中

#### 任务 3.1：QuizPlayer 集成 QuizStore

**文件**：`packages/quizerjs/src/player/QuizPlayer.ts`

**步骤**：
1. 导入 `createQuizStore`, `quizActions`
2. 添加私有属性：`private store: QuizStore`
3. 在构造函数中：
   - 调用 `createQuizStore()` 初始化 store
4. 在 `init()` 方法中：
   - 获取总题目数
   - Dispatch `quizActions.initQuiz(quizId, totalQuestions)`
5. 修改 `setAnswer()` 方法：
   - 使用 `this.store.dispatch(quizActions.setAnswer(questionId, answer))`
   - 保留现有的 `onAnswerChange` 回调
6. 修改 `submit()` 方法：
   - Dispatch `quizActions.startSubmit()`
   - 生成 Result DSL
   - Dispatch `quizActions.submitSuccess(resultDSL)` 或 `quizActions.submitFailure(error)`
   - 保留现有的结果展示逻辑
7. 添加 `getStore()` 方法：返回 store 实例
8. 测试所有功能正常工作

**验收标准**：
- [ ] QuizPlayer 初始化时，store 正确初始化
- [ ] 答案变更时，store 状态正确更新
- [ ] 提交时，store 状态正确更新
- [ ] 不影响现有功能

#### 任务 3.2：实现结果页面检测和导航

**文件**：`packages/quizerjs/src/player/QuizPlayer.ts`

**步骤**：
1. 实现 `hasResultSlide()` 方法：
   - 检查 Slide DSL 中是否定义了结果页面
   - 检查 `rule end` 中是否包含 `wsx-quiz-results` 组件
   - 返回 boolean
2. 实现 `navigateToResultSlide()` 方法：
   - 使用 SlideRunner 的导航方法跳转到结果页面
   - 将 `resultDSL` 注入到上下文变量（如果支持）
3. 修改 `submit()` 方法：
   - 如果检测到结果页面，调用 `navigateToResultSlide()`
   - 否则，使用现有的 `renderResults()` 方法（向后兼容）
4. 测试结果页面导航

**验收标准**：
- [ ] 可以正确检测结果页面
- [ ] 可以正确导航到结果页面
- [ ] 向后兼容：未定义结果页面时使用模态框

### 阶段四：测试（优先级：中）

**目标**：确保所有功能正常工作

#### 任务 4.1：QuizStore 单元测试

**文件**：`packages/core/src/store/QuizStore.test.ts`

**步骤**：
1. 测试 QuizStore 创建和初始化
2. 测试所有 actions 的状态更新
3. 测试 subscribe/unsubscribe
4. 测试所有选择器方法
5. 测试单例模式

**验收标准**：
- [ ] 所有测试通过
- [ ] 测试覆盖率 ≥ 80%

#### 任务 4.2：组件集成测试

**文件**：`packages/core/src/components/*.test.ts`

**步骤**：
1. 测试 wsx-quiz-question 与 store 集成
2. 测试 wsx-quiz-submit 与 store 集成
3. 测试组件订阅和更新

**验收标准**：
- [ ] 所有测试通过

#### 任务 4.3：QuizPlayer 集成测试

**文件**：`packages/quizerjs/src/player/QuizPlayer.test.ts`

**步骤**：
1. 测试 QuizPlayer 与 QuizStore 集成
2. 测试结果页面检测
3. 测试结果页面导航
4. 测试向后兼容性

**验收标准**：
- [ ] 所有测试通过

### 阶段五：文档和示例（优先级：中）

**目标**：更新文档和添加示例

#### 任务 5.1：更新 API 文档

**文件**：`docs/api/` 相关文件

**步骤**：
1. 添加 QuizStore API 文档
2. 更新 QuizPlayer API 文档
3. 更新组件文档

**验收标准**：
- [ ] 所有 API 都有文档
- [ ] 包含使用示例

#### 任务 5.2：更新 Slide DSL 文档

**文件**：`docs/dsl/` 相关文件

**步骤**：
1. 添加结果页面定义示例
2. 说明上下文变量使用
3. 说明组件与 store 的集成

**验收标准**：
- [ ] 文档清晰完整

#### 任务 5.3：添加示例代码

**文件**：`docs/examples/` 相关文件

**步骤**：
1. 添加 QuizStore 使用示例
2. 添加结果页面定义示例
3. 添加完整的工作流程示例

**验收标准**：
- [ ] 示例代码可以运行
- [ ] 示例代码有注释说明

### 实施时间估算

| 阶段 | 任务 | 预估时间 |
|------|------|----------|
| 阶段一 | QuizStore 核心实现 | 4-6 小时 |
| 阶段二 | 组件集成 | 3-4 小时 |
| 阶段三 | QuizPlayer 集成 | 3-4 小时 |
| 阶段四 | 测试 | 4-6 小时 |
| 阶段五 | 文档和示例 | 2-3 小时 |
| **总计** | | **16-23 小时** |

### 依赖关系

```
阶段一（QuizStore） → 阶段二（组件集成）
                  ↓
阶段一（QuizStore） → 阶段三（QuizPlayer 集成）
                  ↓
阶段二 + 阶段三 → 阶段四（测试）
                  ↓
阶段四（测试） → 阶段五（文档）
```

### 风险与缓解

1. **风险**：SlideRunner API 可能不支持运行时上下文变量更新
   - **缓解**：先检查 API，如果不支持，使用其他方式（如重新渲染）

2. **风险**：组件订阅可能导致内存泄漏
   - **缓解**：确保所有组件在卸载时取消订阅，添加测试验证

3. **风险**：向后兼容性问题
   - **缓解**：保留所有现有 API，添加兼容性测试

### 验收标准（总体）

- [ ] QuizStore 正常工作，所有功能测试通过
- [ ] 所有组件正确集成 QuizStore
- [ ] QuizPlayer 正确使用 QuizStore
- [ ] 结果页面可以正常显示和导航
- [ ] 向后兼容性保持
- [ ] 所有测试通过
- [ ] 文档完整
- [ ] 示例代码可用

## 示例代码

### 基本示例

```slide
present quiz "quiz" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "欢迎参加测验"
        }
      }
    }
    
    rule content "questions" {
      for question in quiz.questions {
        slide {
          content dynamic {
            name: "wsx-quiz-question"
            attrs {
              question: question
            }
          }
        }
      }
    }
    
    rule end "submit" {
      slide {
        content dynamic {
          name: "wsx-quiz-submit"
          attrs {
            label: "提交答案"
            progress: true
            // 注意：answered 和 total 不需要在这里传递
            // wsx-quiz-submit 组件内部会直接从 QuizStore 获取
          }
        }
      }
    }
    
    rule end "results" {
      slide {
        content dynamic {
          name: "wsx-quiz-results"
          attrs {
            // Result DSL 通过上下文变量传递（只在提交时设置一次）
            result-dsl: resultDSL
          }
        }
        behavior {
          transition fade {
            duration: 500
          }
        }
      }
    }
  }
}
```

### 组件实现示例

#### wsx-quiz-submit 组件（内部消费 Store）

```typescript
// wsx-quiz-submit.wsx
import { QuizStore } from '@quizerjs/core';

@autoRegister({ tagName: 'wsx-quiz-submit' })
export class QuizSubmit extends LightComponent {
  @state private answeredCount = 0;
  @state private totalCount = 0;
  private unsubscribeProgress?: () => void;

  onConnected() {
    const store = QuizStore.getInstance();
    
    // 初始化时获取当前进度
    const progress = store.getProgress();
    this.answeredCount = progress.answered;
    this.totalCount = progress.total;
    
    // 订阅进度变化
    this.unsubscribeProgress = store.onProgressChange((progress) => {
      this.answeredCount = progress.answered;
      this.totalCount = progress.total;
      this.requestUpdate();
    });
  }

  onDisconnected() {
    if (this.unsubscribeProgress) {
      this.unsubscribeProgress();
    }
  }

  render() {
    const progressText = `已作答 ${this.answeredCount}/${this.totalCount} 题`;
    // ... 渲染逻辑
  }
}
```

### 自定义样式示例

```slide
rule end "submit" {
  slide {
    content dynamic {
      name: "wsx-quiz-submit"
      attrs {
        label: "提交答案"
        progress: true
        // 注意：answered 和 total 由组件内部从 QuizStore 获取
      }
    }
    behavior {
      transition zoom {
        duration: 500
      }
    }
  }
}

rule end "results" {
  slide {
    content dynamic {
      name: "wsx-quiz-results"
      attrs {
        // Result DSL 通过上下文变量传递（只在提交时设置一次）
        result-dsl: resultDSL
        compact: true
        show-details: true
        show-stats: true
      }
    }
    behavior {
      transition zoom {
        duration: 600
      }
    }
    style {
      background: "var(--color-background)"
      padding: "1.5rem"
      max-width: "1200px"
      margin: "0 auto"
    }
  }
}
```

## 设计检查清单

### 功能完整性

- [x] 结果页面可以在 Slide DSL 中定义
- [x] Result DSL 通过上下文变量传递给组件
- [x] 支持自定义样式和布局
- [x] 支持向后兼容（模态框方式）
- [x] 支持导航和交互

### 用户体验

- [x] 流畅的过渡效果
- [x] 清晰的视觉反馈
- [x] 响应式设计
- [x] 可访问性支持

### 技术实现

- [x] 上下文变量系统
- [x] 结果页面检测
- [x] 导航流程
- [x] 组件属性更新

### 文档和测试

- [ ] Slide DSL 文档更新
- [ ] API 文档更新
- [ ] 示例代码
- [ ] 单元测试
- [ ] 集成测试

## 风险评估

### 技术风险

1. **上下文变量系统复杂性**：需要确保变量注入和更新的正确性
   - **缓解措施**：充分测试，使用类型系统保证类型安全

2. **向后兼容性**：需要确保现有代码不受影响
   - **缓解措施**：保留现有 API，默认使用模态框方式

3. **性能影响**：Result DSL 可能很大，序列化可能影响性能
   - **缓解措施**：使用懒加载，只在需要时序列化

### 用户体验风险

1. **导航混乱**：用户可能不知道如何从结果页面返回
   - **缓解措施**：提供清晰的导航按钮和说明

2. **样式不一致**：自定义样式可能导致视觉不一致
   - **缓解措施**：提供默认样式和主题支持

## 未来扩展

### 可能的增强

1. **多结果页面**：支持定义多个结果页面（不同场景）
2. **结果分享**：支持分享结果到社交媒体
3. **结果导出**：支持导出结果为 PDF 或图片
4. **结果分析**：支持更详细的结果分析和可视化

## 参考

- [RFC 0006: 播放器核心组件设计](./0006-player-core.md)
- [Slide DSL 规范（计划中）](./README.md)
- [Result DSL 格式](./0006-player-core.md#result-dsl-设计)

---

**状态**: 草案 (Draft)  
**最后更新**: 2025-01-XX
