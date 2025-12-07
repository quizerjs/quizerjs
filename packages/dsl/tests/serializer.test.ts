/**
 * @quizerjs/dsl - 序列化器单元测试
 */

import { describe, it, expect } from 'vitest';
import { serializeQuizDSL, serializeQuizDSLToObject } from '../src/serializer';
import { type QuizDSL } from '../src/types';
import { createMinimalValidDSL } from './fixtures';

const validDSL = createMinimalValidDSL();

describe('serializeQuizDSL', () => {
  it('应该成功序列化有效的 DSL', () => {
    const result = serializeQuizDSL(validDSL);

    expect(result.success).toBe(true);
    expect(result.json).not.toBeNull();
    expect(result.json).toBe(JSON.stringify(validDSL));
  });

  it('应该支持格式化输出', () => {
    const result = serializeQuizDSL(validDSL, { pretty: true });

    expect(result.success).toBe(true);
    expect(result.json).not.toBeNull();
    expect(result.json).toContain('\n');
  });

  it('应该支持自定义缩进', () => {
    const result = serializeQuizDSL(validDSL, { pretty: true, indent: 4 });

    expect(result.success).toBe(true);
    expect(result.json).not.toBeNull();
    expect(result.json).toContain('    '); // 4 个空格
  });

  it('应该拒绝无效的 DSL', () => {
    const invalidDSL = { version: '1.0.0' } as QuizDSL;
    const result = serializeQuizDSL(invalidDSL);

    expect(result.success).toBe(false);
    expect(result.json).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('应该支持禁用验证', () => {
    const invalidDSL = { version: '1.0.0' } as QuizDSL;
    const result = serializeQuizDSL(invalidDSL, { validate: false });

    expect(result.success).toBe(true);
    expect(result.json).not.toBeNull();
  });
});

describe('serializeQuizDSLToObject', () => {
  it('应该成功序列化为对象', () => {
    const result = serializeQuizDSLToObject(validDSL);

    expect(result.success).toBe(true);
    expect(result.data).not.toBeNull();
    expect(result.data?.version).toBe('1.0.0');
    expect(result.data?.quiz.id).toBe('quiz-001');
  });

  it('应该返回深拷贝', () => {
    const result = serializeQuizDSLToObject(validDSL);

    expect(result.success).toBe(true);
    expect(result.data).not.toBe(validDSL);
    expect(result.data).toEqual(validDSL);
  });

  it('应该拒绝无效的 DSL', () => {
    const invalidDSL = { version: '1.0.0' } as QuizDSL;
    const result = serializeQuizDSLToObject(invalidDSL);

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('应该支持禁用验证', () => {
    const invalidDSL = { version: '1.0.0' } as QuizDSL;
    const result = serializeQuizDSLToObject(invalidDSL, { validate: false });

    expect(result.success).toBe(true);
    expect(result.data).not.toBeNull();
  });
});
