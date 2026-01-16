/**
 * QuizStore 模块导出
 * Quiz Lite Redux - 轻量级 Redux 风格状态管理
 */

// 导出 QuizStore 类
export {
  QuizStore,
  createQuizStore,
  getQuizStore,
  getQuizStoreById,
  getQuizStoreFromElement,
  registerQuizStore,
  unregisterQuizStore,
  resetQuizStore,
} from './QuizStore.js';

// 导出类型
export type { QuizState, QuizAction } from './QuizStore.js';

// 导出 Action Creators
export { quizActions } from './quizActions.js';
