/**
 * Action Creators - 创建类型化的 Actions
 * 提供便利方法创建 actions
 */

import type { AnswerValue, ResultDSL } from '@quizerjs/dsl';
import type { QuizAction } from './QuizStore.js';

/**
 * quizActions - Action Creators 对象
 * 提供便利方法创建类型化的 actions
 */
export const quizActions = {
  /**
   * 初始化 Quiz
   */
  initQuiz: (quizId: string, totalQuestions: number): QuizAction => ({
    type: 'QUIZ_INIT',
    payload: { quizId, totalQuestions },
  }),

  /**
   * 设置答案
   */
  setAnswer: (questionId: string, answer: AnswerValue): QuizAction => ({
    type: 'ANSWER_SET',
    payload: { questionId, answer },
  }),

  /**
   * 清除答案
   */
  clearAnswer: (questionId: string): QuizAction => ({
    type: 'ANSWER_CLEAR',
    payload: { questionId },
  }),

  /**
   * 重置所有答案
   */
  resetAnswers: (): QuizAction => ({
    type: 'ANSWERS_RESET',
  }),

  /**
   * 开始提交
   */
  startSubmit: (): QuizAction => ({
    type: 'SUBMIT_START',
  }),

  /**
   * 提交成功
   */
  submitSuccess: (resultSource: ResultDSL): QuizAction => ({
    type: 'SUBMIT_SUCCESS',
    payload: { resultSource },
  }),

  /**
   * 提交失败
   */
  submitFailure: (error: Error): QuizAction => ({
    type: 'SUBMIT_FAILURE',
    payload: { error },
  }),

  /**
   * 设置 Result DSL
   */
  setResult: (resultSource: ResultDSL): QuizAction => ({
    type: 'RESULT_SET',
    payload: { resultSource },
  }),
};
