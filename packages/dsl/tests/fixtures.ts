/**
 * @quizerjs/dsl - 测试夹具
 *
 * 提供可重用的测试数据
 */

import { QuestionTypes, type QuizDSL } from '../src/types';

/**
 * 创建最小的有效 DSL
 */
export function createMinimalValidDSL(): QuizDSL {
  return {
    version: '1.0.0',
    quiz: {
      id: 'quiz-001',
      title: '测试测验',
      questions: [
        {
          id: 'q1',
          type: QuestionTypes.SINGLE_CHOICE,
          text: '测试问题',
          options: [
            { id: 'o1', text: '选项1', isCorrect: true },
            { id: 'o2', text: '选项2', isCorrect: false },
          ],
        },
      ],
    },
  };
}

/**
 * 创建完整的有效 DSL（包含所有问题类型）
 */
export function createFullValidDSL(): QuizDSL {
  return {
    version: '1.0.0',
    quiz: {
      id: 'quiz-001',
      title: '完整测验',
      description: '包含所有题型',
      metadata: {
        author: 'test',
        tags: ['test'],
      },
      settings: {
        allowRetry: true,
        showResults: true,
        timeLimit: 600,
        randomizeQuestions: false,
        randomizeOptions: false,
        passingScore: 60,
      },
      questions: [
        {
          id: 'q1',
          type: QuestionTypes.SINGLE_CHOICE,
          text: '单选题',
          options: [
            { id: 'o1', text: 'A', isCorrect: true },
            { id: 'o2', text: 'B', isCorrect: false },
          ],
          points: 10,
          explanation: '解释',
          metadata: {
            difficulty: 'easy',
            tags: ['test'],
          },
        },
        {
          id: 'q2',
          type: QuestionTypes.MULTIPLE_CHOICE,
          text: '多选题',
          options: [
            { id: 'o1', text: 'A', isCorrect: true },
            { id: 'o2', text: 'B', isCorrect: true },
            { id: 'o3', text: 'C', isCorrect: false },
          ],
          points: 15,
        },
        {
          id: 'q3',
          type: QuestionTypes.TEXT_INPUT,
          text: '文本输入',
          correctAnswer: 'answer',
          caseSensitive: false,
          points: 5,
        },
        {
          id: 'q4',
          type: QuestionTypes.TRUE_FALSE,
          text: '判断题',
          correctAnswer: true,
          points: 5,
        },
      ],
    },
  };
}
