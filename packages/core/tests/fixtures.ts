/**
 * @quizerjs/core - 测试夹具
 *
 * 提供可重用的测试数据
 */

import { QuestionTypes, type QuizDSL, type Section } from '@quizerjs/dsl';
import type { EditorJSOutput, EditorJSBlock } from '../src/transformer';

/**
 * 创建最小的有效 DSL（使用 questions）
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
 * 创建带 sections 的 DSL
 */
export function createDSLWithSections(): QuizDSL {
  return {
    version: '1.0.0',
    quiz: {
      id: 'quiz-001',
      title: '测试测验',
      description: '这是一个测试描述',
      sections: [
        {
          id: 'section-1',
          title: '第一章',
          description: '第一章描述',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: '问题1',
              options: [
                { id: 'o1', text: '选项1', isCorrect: true },
                { id: 'o2', text: '选项2', isCorrect: false },
              ],
              points: 10,
            },
          ],
        },
        {
          id: 'section-2',
          title: '第二章',
          questions: [
            {
              id: 'q2',
              type: QuestionTypes.MULTIPLE_CHOICE,
              text: '问题2',
              options: [
                { id: 'o1', text: '选项1', isCorrect: true },
                { id: 'o2', text: '选项2', isCorrect: true },
                { id: 'o3', text: '选项3', isCorrect: false },
              ],
              points: 15,
            },
          ],
        },
      ],
    },
  };
}

/**
 * 创建包含所有问题类型的 DSL
 */
export function createFullDSL(): QuizDSL {
  return {
    version: '1.0.0',
    quiz: {
      id: 'quiz-001',
      title: '完整测验',
      description: '包含所有题型',
      sections: [
        {
          id: 'section-1',
          title: '基础题型',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: '单选题',
              options: [
                { id: 'o1', text: '选项1', isCorrect: true },
                { id: 'o2', text: '选项2', isCorrect: false },
              ],
              points: 10,
              explanation: '这是解析',
            },
            {
              id: 'q2',
              type: QuestionTypes.MULTIPLE_CHOICE,
              text: '多选题',
              options: [
                { id: 'o1', text: '选项1', isCorrect: true },
                { id: 'o2', text: '选项2', isCorrect: true },
                { id: 'o3', text: '选项3', isCorrect: false },
              ],
              points: 15,
            },
            {
              id: 'q3',
              type: QuestionTypes.TEXT_INPUT,
              text: '文本输入题',
              correctAnswer: '答案',
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
      ],
    },
  };
}

/**
 * 创建简单的 Editor.js 输出
 */
export function createSimpleEditorOutput(): EditorJSOutput {
  return {
    blocks: [
      {
        type: 'header',
        data: {
          // Editor.js header block 的 text 字段只包含内部 HTML，不包含 <h1> 标签
          text: '测试测验',
          level: 1,
        },
      },
      {
        type: 'paragraph',
        data: {
          // Editor.js paragraph block 的 text 字段只包含内部 HTML，不包含 <p> 标签
          text: '测试描述',
        },
      },
      {
        type: 'header',
        data: {
          text: '第一章',
          level: 2,
        },
      },
      {
        type: 'quiz-single-choice',
        data: {
          question: {
            id: 'q1',
            type: 'single_choice',
            text: '问题1',
            options: [
              { id: 'o1', text: '选项1', isCorrect: true },
              { id: 'o2', text: '选项2', isCorrect: false },
            ],
          },
        },
      },
    ],
  };
}
