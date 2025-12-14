/**
 * @quizerjs/dsl - 验证器单元测试
 */

import { describe, it, expect } from 'vitest';
import { validateQuizDSL, type ValidationError } from '../src/validator';
import { ValidationErrorCode } from '../src/messages';
import { QuestionTypes, type QuizDSL } from '../src/types';
import { createMinimalValidDSL, createFullValidDSL } from './fixtures';

// 使用测试夹具
const validDSL = createMinimalValidDSL();

describe('validateQuizDSL', () => {
  describe('DSL 级别验证', () => {
    it('应该拒绝非对象值', () => {
      const result = validateQuizDSL(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.DSL_MUST_BE_OBJECT);
    });

    it('应该拒绝数组', () => {
      const result = validateQuizDSL([]);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.DSL_MUST_BE_OBJECT);
    });

    it('应该拒绝字符串', () => {
      const result = validateQuizDSL('invalid');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ValidationErrorCode.DSL_MUST_BE_OBJECT);
    });

    it('应该要求 version 字段', () => {
      const result = validateQuizDSL({ quiz: createMinimalValidDSL().quiz });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.VERSION_MUST_BE_STRING)).toBe(
        true
      );
    });

    it('应该要求 version 为字符串', () => {
      const dsl = createMinimalValidDSL();
      const result = validateQuizDSL({ version: 123, quiz: dsl.quiz });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.VERSION_MUST_BE_STRING)).toBe(
        true
      );
    });
  });

  describe('Quiz 级别验证', () => {
    it('应该要求 quiz 字段', () => {
      const result = validateQuizDSL({ version: '1.0.0' });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.QUIZ_MUST_BE_OBJECT)).toBe(
        true
      );
    });

    it('应该要求 quiz.id', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: { title: 'Test', questions: [] },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.QUIZ_ID_MUST_BE_STRING)).toBe(
        true
      );
    });

    it('应该要求 quiz.title', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: { id: 'quiz-1', questions: [] },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.QUIZ_TITLE_MUST_BE_STRING)
      ).toBe(true);
    });

    it('应该要求 quiz.questions 为数组', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: { id: 'quiz-1', title: 'Test', questions: 'not-array' },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.QUIZ_QUESTIONS_MUST_BE_ARRAY)
      ).toBe(true);
    });
  });

  describe('Question 级别验证', () => {
    it('应该拒绝非对象问题', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: ['not-object'],
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.QUESTION_MUST_BE_OBJECT)).toBe(
        true
      );
    });

    it('应该要求问题 id', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Test',
              options: [],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.QUESTION_ID_MUST_BE_STRING)
      ).toBe(true);
    });

    it('应该要求问题 type', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              text: 'Test',
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.QUESTION_TYPE_MUST_BE_VALID)
      ).toBe(true);
    });

    it('应该要求问题 text', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.QUESTION_TEXT_MUST_BE_STRING)
      ).toBe(true);
    });

    it('应该检测重复的问题 ID', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Q1',
              options: [
                { id: 'o1', text: 'A', isCorrect: true },
                { id: 'o2', text: 'B', isCorrect: false },
              ],
            },
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Q2',
              options: [
                { id: 'o1', text: 'A', isCorrect: true },
                { id: 'o2', text: 'B', isCorrect: false },
              ],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.QUESTION_ID_DUPLICATE)).toBe(
        true
      );
    });

    it('应该拒绝未知的问题类型', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: 'unknown_type' as QuestionType,
              text: 'Test',
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.QUESTION_TYPE_UNKNOWN)).toBe(
        true
      );
    });
  });

  describe('单选题验证', () => {
    it('应该要求至少 2 个选项', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Test',
              options: [{ id: 'o1', text: 'A', isCorrect: true }],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.SINGLE_CHOICE_OPTIONS_MIN)
      ).toBe(true);
    });

    it('应该要求恰好一个正确答案', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Test',
              options: [
                { id: 'o1', text: 'A', isCorrect: true },
                { id: 'o2', text: 'B', isCorrect: true },
              ],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.SINGLE_CHOICE_MUST_HAVE_ONE_CORRECT)
      ).toBe(true);
    });

    it('应该要求至少一个正确答案', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Test',
              options: [
                { id: 'o1', text: 'A', isCorrect: false },
                { id: 'o2', text: 'B', isCorrect: false },
              ],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.SINGLE_CHOICE_MUST_HAVE_ONE_CORRECT)
      ).toBe(true);
    });

    it('应该验证有效的单选题', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Test',
              options: [
                { id: 'o1', text: 'A', isCorrect: true },
                { id: 'o2', text: 'B', isCorrect: false },
              ],
            },
          ],
        },
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('多选题验证', () => {
    it('应该要求至少 2 个选项', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.MULTIPLE_CHOICE,
              text: 'Test',
              options: [{ id: 'o1', text: 'A', isCorrect: true }],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.MULTIPLE_CHOICE_OPTIONS_MIN)
      ).toBe(true);
    });

    it('应该要求至少一个正确答案', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.MULTIPLE_CHOICE,
              text: 'Test',
              options: [
                { id: 'o1', text: 'A', isCorrect: false },
                { id: 'o2', text: 'B', isCorrect: false },
              ],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          e => e.code === ValidationErrorCode.MULTIPLE_CHOICE_MUST_HAVE_AT_LEAST_ONE_CORRECT
        )
      ).toBe(true);
    });

    it('应该验证有效的多选题', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.MULTIPLE_CHOICE,
              text: 'Test',
              options: [
                { id: 'o1', text: 'A', isCorrect: true },
                { id: 'o2', text: 'B', isCorrect: true },
                { id: 'o3', text: 'C', isCorrect: false },
              ],
            },
          ],
        },
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('选项验证', () => {
    it('应该要求选项为对象', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Test',
              options: [{ id: 'o1', text: 'A', isCorrect: true }, 'not-object' as any],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.OPTION_MUST_BE_OBJECT)).toBe(
        true
      );
    });

    it('应该要求选项 id', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Test',
              options: [
                { text: 'A', isCorrect: true },
                { id: 'o2', text: 'B', isCorrect: false },
              ],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.OPTION_ID_MUST_BE_STRING)).toBe(
        true
      );
    });

    it('应该要求选项 text', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Test',
              options: [
                { id: 'o1', isCorrect: true },
                { id: 'o2', text: 'B', isCorrect: false },
              ],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.OPTION_TEXT_MUST_BE_STRING)
      ).toBe(true);
    });

    it('应该要求选项 isCorrect 为布尔值', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Test',
              options: [
                { id: 'o1', text: 'A', isCorrect: 'true' as any },
                { id: 'o2', text: 'B', isCorrect: false },
              ],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.OPTION_IS_CORRECT_MUST_BE_BOOLEAN)
      ).toBe(true);
    });

    it('应该检测重复的选项 ID', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.SINGLE_CHOICE,
              text: 'Test',
              options: [
                { id: 'o1', text: 'A', isCorrect: true },
                { id: 'o1', text: 'B', isCorrect: false },
              ],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.OPTION_ID_DUPLICATE)).toBe(
        true
      );
    });
  });

  describe('文本输入题验证', () => {
    it('应该要求 correctAnswer', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.TEXT_INPUT,
              text: 'Test',
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(e => e.code === ValidationErrorCode.TEXT_INPUT_CORRECT_ANSWER_REQUIRED)
      ).toBe(true);
    });

    it('应该接受字符串 correctAnswer', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.TEXT_INPUT,
              text: 'Test',
              correctAnswer: 'answer',
            },
          ],
        },
      });
      expect(result.valid).toBe(true);
    });

    it('应该接受字符串数组 correctAnswer', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.TEXT_INPUT,
              text: 'Test',
              correctAnswer: ['answer1', 'answer2'],
            },
          ],
        },
      });
      expect(result.valid).toBe(true);
    });

    it('应该拒绝空数组 correctAnswer', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.TEXT_INPUT,
              text: 'Test',
              correctAnswer: [],
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          e => e.code === ValidationErrorCode.TEXT_INPUT_CORRECT_ANSWER_ARRAY_EMPTY
        )
      ).toBe(true);
    });
  });

  describe('判断题验证', () => {
    it('应该要求 correctAnswer 为布尔值', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.TRUE_FALSE,
              text: 'Test',
              correctAnswer: 'true',
            },
          ],
        },
      });
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          e => e.code === ValidationErrorCode.TRUE_FALSE_CORRECT_ANSWER_MUST_BE_BOOLEAN
        )
      ).toBe(true);
    });

    it('应该接受 true correctAnswer', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.TRUE_FALSE,
              text: 'Test',
              correctAnswer: true,
            },
          ],
        },
      });
      expect(result.valid).toBe(true);
    });

    it('应该接受 false correctAnswer', () => {
      const result = validateQuizDSL({
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test',
          questions: [
            {
              id: 'q1',
              type: QuestionTypes.TRUE_FALSE,
              text: 'Test',
              correctAnswer: false,
            },
          ],
        },
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('完整 DSL 验证', () => {
    it('应该验证完整的有效 DSL', () => {
      const result = validateQuizDSL(validDSL);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该验证包含所有问题类型的 DSL', () => {
      const fullDSL = createFullValidDSL();
      const result = validateQuizDSL(fullDSL);
      expect(result.valid).toBe(true);
    });
  });
});
