/**
 * 测试夹具 - 用于 Editor.js 工具测试
 */

import { QuestionTypes, type Option } from '@quizerjs/dsl';
import type { EditorJSQuestionData } from '@quizerjs/core';
import type {
  SingleChoiceData,
  MultipleChoiceData,
  TextInputData,
  TrueFalseData,
} from '../src/tools/types';

/**
 * 创建单选题测试数据
 */
export function createSingleChoiceData(overrides?: Partial<SingleChoiceData>): SingleChoiceData {
  const defaultOptions: Option[] = [
    { id: 'opt1', text: '选项1', isCorrect: true },
    { id: 'opt2', text: '选项2', isCorrect: false },
    { id: 'opt3', text: '选项3', isCorrect: false },
  ];

  return {
    question: {
      id: 'q1',
      type: QuestionTypes.SINGLE_CHOICE,
      text: '测试单选题',
      description: '这是测试描述',
      options: defaultOptions,
      ...overrides?.question,
    },
    ...overrides,
  };
}

/**
 * 创建多选题测试数据
 */
export function createMultipleChoiceData(
  overrides?: Partial<MultipleChoiceData>
): MultipleChoiceData {
  const defaultOptions: Option[] = [
    { id: 'opt1', text: '选项1', isCorrect: true },
    { id: 'opt2', text: '选项2', isCorrect: true },
    { id: 'opt3', text: '选项3', isCorrect: false },
  ];

  return {
    question: {
      id: 'q1',
      type: QuestionTypes.MULTIPLE_CHOICE,
      text: '测试多选题',
      description: '这是测试描述',
      options: defaultOptions,
      ...overrides?.question,
    },
    ...overrides,
  };
}

/**
 * 创建文本输入题测试数据
 */
export function createTextInputData(overrides?: Partial<TextInputData>): TextInputData {
  return {
    question: {
      id: 'q1',
      type: QuestionTypes.TEXT_INPUT,
      text: '测试文本输入题',
      description: '这是测试描述',
      correctAnswer: '正确答案',
      ...overrides?.question,
    },
    ...overrides,
  };
}

/**
 * 创建判断题测试数据
 */
export function createTrueFalseData(overrides?: Partial<TrueFalseData>): TrueFalseData {
  return {
    question: {
      id: 'q1',
      type: QuestionTypes.TRUE_FALSE,
      text: '测试判断题',
      description: '这是测试描述',
      correctAnswer: true,
      ...overrides?.question,
    },
    ...overrides,
  };
}
