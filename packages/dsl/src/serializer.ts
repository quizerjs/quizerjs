/**
 * @quizerjs/dsl - Quiz DSL 序列化器
 *
 * 提供 DSL 数据的序列化功能
 */

import { QuizDSL } from './types';
import { validateQuizDSL } from './validator';

/**
 * 序列化选项
 */
export interface SerializeOptions {
  /** 是否在序列化前进行验证（默认：true） */
  validate?: boolean;
  /** JSON 格式化选项 */
  pretty?: boolean;
  /** JSON 缩进空格数（默认：2） */
  indent?: number;
}

/**
 * 序列化结果
 */
export interface SerializeResult {
  /** 序列化后的 JSON 字符串 */
  json: string | null;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: Error;
}

/**
 * 将 DSL 序列化为 JSON 字符串
 *
 * @param dsl - DSL 数据
 * @param options - 序列化选项
 * @returns 序列化结果
 */
export function serializeQuizDSL(dsl: QuizDSL, options: SerializeOptions = {}): SerializeResult {
  const { validate = true, pretty = false, indent = 2 } = options;

  try {
    // 验证数据
    if (validate) {
      const validationResult = validateQuizDSL(dsl);
      if (!validationResult.valid) {
        return {
          json: null,
          success: false,
          error: new Error(
            `DSL 验证失败: ${validationResult.errors.map(e => e.message).join('; ')}`
          ),
        };
      }
    }

    // 序列化为 JSON
    const json = pretty ? JSON.stringify(dsl, null, indent) : JSON.stringify(dsl);

    return {
      json,
      success: true,
    };
  } catch (error) {
    return {
      json: null,
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * 将 DSL 序列化为对象（不进行 JSON 序列化）
 *
 * @param dsl - DSL 数据
 * @param options - 序列化选项
 * @returns 序列化结果
 */
export function serializeQuizDSLToObject(
  dsl: QuizDSL,
  options: Omit<SerializeOptions, 'pretty' | 'indent'> = {}
): { data: QuizDSL | null; success: boolean; error?: Error } {
  const { validate = true } = options;

  try {
    // 验证数据
    if (validate) {
      const validationResult = validateQuizDSL(dsl);
      if (!validationResult.valid) {
        return {
          data: null,
          success: false,
          error: new Error(
            `DSL 验证失败: ${validationResult.errors.map(e => e.message).join('; ')}`
          ),
        };
      }
    }

    // 返回深拷贝的对象
    return {
      data: JSON.parse(JSON.stringify(dsl)),
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
