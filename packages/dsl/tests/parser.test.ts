/**
 * @quizerjs/dsl - 解析器单元测试
 */

import { describe, it, expect } from 'vitest';
import { parseQuizDSL, parseQuizDSLFromObject } from '../src/parser';
import { QuestionType, type QuizDSL } from '../src/types';
import { ValidationErrorCode } from '../src/messages';
import { createMinimalValidDSL } from './fixtures';

const validDSL = createMinimalValidDSL();

describe('parseQuizDSL', () => {
  it('应该成功解析有效的 JSON 字符串', () => {
    const jsonString = JSON.stringify(validDSL);
    const result = parseQuizDSL(jsonString);

    expect(result.success).toBe(true);
    expect(result.dsl).not.toBeNull();
    expect(result.dsl?.version).toBe('1.0.0');
    expect(result.dsl?.quiz.id).toBe('quiz-001');
  });

  it('应该拒绝无效的 JSON 字符串', () => {
    const result = parseQuizDSL('invalid json{');

    expect(result.success).toBe(false);
    expect(result.dsl).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('应该拒绝无效的 DSL 数据', () => {
    const invalidDSL = { version: '1.0.0' }; // 缺少 quiz
    const result = parseQuizDSL(JSON.stringify(invalidDSL));

    expect(result.success).toBe(false);
    expect(result.dsl).toBeNull();
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('应该支持禁用验证', () => {
    const invalidDSL = { version: '1.0.0' };
    const result = parseQuizDSL(JSON.stringify(invalidDSL), { validate: false });

    expect(result.success).toBe(true);
    expect(result.dsl).not.toBeNull();
  });

  it('应该处理空字符串', () => {
    const result = parseQuizDSL('');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('parseQuizDSLFromObject', () => {
  it('应该成功解析有效的对象', () => {
    const result = parseQuizDSLFromObject(validDSL);

    expect(result.success).toBe(true);
    expect(result.dsl).not.toBeNull();
    expect(result.dsl?.version).toBe('1.0.0');
  });

  it('应该拒绝无效的对象', () => {
    const invalidDSL = { version: '1.0.0' };
    const result = parseQuizDSLFromObject(invalidDSL);

    expect(result.success).toBe(false);
    expect(result.dsl).toBeNull();
    expect(result.errors).toBeDefined();
  });

  it('应该支持禁用验证', () => {
    const invalidDSL = { version: '1.0.0' };
    const result = parseQuizDSLFromObject(invalidDSL, { validate: false });

    expect(result.success).toBe(true);
    expect(result.dsl).not.toBeNull();
  });
});
