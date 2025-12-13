/**
 * @quizerjs/react - 类型定义
 */

import type { QuizDSL, Question } from '@quizerjs/dsl';

export interface QuizComponentProps {
  /** DSL 数据 */
  dsl: QuizDSL;
  /** 是否禁用交互 */
  disabled?: boolean;
  /** 是否显示结果 */
  showResults?: boolean;
  /** 提交回调 */
  onSubmit?: (answers: Record<string, any>) => void;
  /** 答案变化回调 */
  onAnswerChange?: (questionId: string, answer: any) => void;
}

export interface UseQuizOptions {
  /** 初始 DSL 数据 */
  dsl?: QuizDSL;
  /** 是否自动验证 */
  autoValidate?: boolean;
  /** 提交回调 */
  onSubmit?: (answers: Record<string, any>, score: number) => void;
}

export interface UseQuizReturn {
  /** DSL 数据 */
  dsl: QuizDSL | null;
  /** 用户答案 */
  answers: Record<string, any>;
  /** 是否已提交 */
  submitted: boolean;
  /** 得分 */
  score: number | null;
  /** 加载 DSL */
  loadDSL: (dsl: QuizDSL) => void;
  /** 设置答案 */
  setAnswer: (questionId: string, answer: any) => void;
  /** 提交答案 */
  submit: () => void;
  /** 重置 */
  reset: () => void;
  /** 检查答案是否正确 */
  isAnswerCorrect: (question: Question, answer: any) => boolean;
}

