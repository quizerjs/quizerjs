/**
 * Quiz Lite Redux - 轻量级 Redux 风格状态管理
 * 专门为 Quiz 场景优化，保持简洁和易用
 */

import type { AnswerValue, ResultDSL } from '@quizerjs/dsl';

/**
 * QuizState - 单一状态树
 */
export interface QuizState {
  // 答案状态
  answers: Record<string, AnswerValue>;

  // 答题进度
  progress: {
    answered: number;
    total: number;
  };

  // Result DSL（提交后）
  resultSource: ResultDSL | null;

  // 提交状态
  isSubmitting: boolean;
  isSubmitted: boolean;

  // 元数据
  quizId: string | null;
  startTime: number | null;
}

/**
 * QuizAction - 类型化的 Actions
 */
export type QuizAction =
  | { type: 'QUIZ_INIT'; payload: { quizId: string; totalQuestions: number } }
  | { type: 'ANSWER_SET'; payload: { questionId: string; answer: AnswerValue } }
  | { type: 'ANSWER_CLEAR'; payload: { questionId: string } }
  | { type: 'ANSWERS_RESET'; payload?: void }
  | { type: 'SUBMIT_START'; payload?: void }
  | { type: 'SUBMIT_SUCCESS'; payload: { resultSource: ResultDSL } }
  | { type: 'SUBMIT_FAILURE'; payload: { error: Error } }
  | { type: 'RESULT_SET'; payload: { resultSource: ResultDSL } };

/**
 * 初始状态
 */
const initialState: QuizState = {
  answers: {},
  progress: { answered: 0, total: 0 },
  resultSource: null,
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

  constructor(initialStateOverride?: Partial<QuizState>) {
    this.state = { ...initialState, ...initialStateOverride };
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

    // 只有在开发环境或调试时可以开启
    console.log(`[QuizStore] Action: ${action.type}`, action.payload);

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
          resultSource: null,
          isSubmitted: false,
          startTime: Date.now(),
        };

      case 'SUBMIT_START':
        return { ...state, isSubmitting: true };

      case 'SUBMIT_SUCCESS': {
        const { resultSource } = action.payload;
        return {
          ...state,
          isSubmitting: false,
          isSubmitted: true,
          resultSource,
        };
      }

      case 'SUBMIT_FAILURE':
        return { ...state, isSubmitting: false };

      case 'RESULT_SET': {
        const { resultSource } = action.payload;
        return { ...state, resultSource };
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
  getResultSource(): ResultDSL | null {
    return this.state.resultSource;
  }

  /**
   * 是否已回答所有问题
   * 条件：total > 0 且 answered === total
   */
  isComplete(): boolean {
    const { answered, total } = this.state.progress;
    return total > 0 && answered === total;
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

// ========== 多实例支持（基于 quizId）==========

/**
 * QuizStore 注册表（用于组件查找对应的 store）
 * Key: quizId（Quiz DSL 中的唯一标识符）
 * Value: QuizStore 实例
 */
const storeRegistry = new Map<string, QuizStore>();

/**
 * 创建 QuizStore 实例（非单例模式，每个 QuizPlayer 实例创建自己的 store）
 * @param initialState 初始状态（可选）
 * @returns 新的 QuizStore 实例
 */
export function createQuizStore(initialState?: Partial<QuizState>): QuizStore {
  return new QuizStore(initialState);
}

/**
 * 注册 QuizStore（使用 quizId 作为标识符）
 * 每个 QuizPlayer 实例在初始化时注册自己的 store
 * @param quizId Quiz 的唯一标识符（来自 Quiz DSL）
 * @param store QuizStore 实例
 */
export function registerQuizStore(quizId: string, store: QuizStore): void {
  if (!quizId) {
    throw new Error('quizId is required to register QuizStore');
  }
  storeRegistry.set(quizId, store);
}

/**
 * 通过 quizId 获取 QuizStore 实例
 * 组件通过 quizId 查找对应的 store（推荐方式）
 * @param quizId Quiz 的唯一标识符
 * @returns QuizStore 实例，如果未找到则返回 null
 */
export function getQuizStoreById(quizId: string): QuizStore | null {
  if (!quizId) return null;
  return storeRegistry.get(quizId) || null;
}

/**
 * 从容器元素获取 QuizStore 实例（向后兼容）
 * 组件通过向上查找容器元素来获取对应的 store
 * @param element 起始元素（通常是组件自身）
 * @returns QuizStore 实例，如果未找到则返回 null
 * @deprecated 建议使用 getQuizStoreById() 通过 quizId 获取
 */
export function getQuizStoreFromElement(element: HTMLElement | null): QuizStore | null {
  if (!element) return null;

  // 向上查找容器元素（查找有 __quizStore 属性的元素）
  let current: HTMLElement | null = element;
  while (current && current !== document.body) {
    if ((current as any).__quizStore) {
      return (current as any).__quizStore;
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * 获取 QuizStore 实例（向后兼容，但建议使用 getQuizStoreById）
 * @deprecated 建议使用 getQuizStoreById() 通过 quizId 获取
 * @throws 如果 store 未初始化
 */
export function getQuizStore(): QuizStore {
  // 尝试从注册表获取第一个 store（向后兼容）
  if (storeRegistry.size > 0) {
    return Array.from(storeRegistry.values())[0];
  }
  throw new Error(
    'QuizStore not initialized. Call createQuizStore() first, or use getQuizStoreById() to get store by quizId.'
  );
}

/**
 * 取消注册 QuizStore
 * @param quizId Quiz 的唯一标识符
 */
export function unregisterQuizStore(quizId: string): void {
  if (quizId) {
    storeRegistry.delete(quizId);
  }
}

/**
 * 重置所有 QuizStore（用于测试）
 */
export function resetQuizStore(): void {
  storeRegistry.clear();
}
