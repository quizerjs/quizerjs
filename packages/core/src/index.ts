/**
 * @quizerjs/core - 核心组件库导出
 */

// 导出类型定义
export * from './types';

// 导出组件
export { QuizBlock } from './components/QuizBlock.wsx';
export { QuizQuestion } from './components/Question.wsx';
export { QuizOption } from './components/Option.wsx';

// 导出工具函数
export {
  calculateQuestionScore,
  checkAnswer,
  calculateQuizResult,
} from './utils/quizCalculator';

