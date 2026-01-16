/**
 * @quizerjs/core - 核心组件库导出
 */

// 导出类型定义
export * from './types';

// 导出组件（通过 autoRegister 自动注册，这里仅导入以触发注册）
// 编辑器相关组件
import './components/quiz-option.wsx';
import './components/quiz-option-list.wsx';
import './components/quiz-question-header.wsx';
import './components/quiz-question-description.wsx';
// 播放器组件
import './components/quiz-question.wsx';
import './components/quiz-results.wsx';
import './components/quiz-submit.wsx';

// 导出工具函数
export { calculateQuestionScore, checkAnswer, calculateQuizResult } from './utils/quizCalculator';

// 导出转换器
export { dslToBlock, blockToDSL } from './transformer';
export type { EditorJSOutput, EditorJSBlock, EditorJSQuestionData } from './transformer';

// 导出 QuizStore（Quiz Lite Redux）
export * from './store';
