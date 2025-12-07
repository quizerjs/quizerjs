/**
 * @quizerjs/dsl - Quiz DSL 解析器
 *
 * 提供 DSL 数据的解析和转换功能
 */

import { QuizDSL } from './types';
import { validateQuizDSL, ValidationError } from './validator';

/**
 * 解析选项
 */
export interface ParseOptions {
  /** 是否在解析时进行验证（默认：true） */
  validate?: boolean;
  /** 是否严格模式（默认：false） */
  strict?: boolean;
}

/**
 * 解析结果
 */
export interface ParseResult {
  /** 解析后的 DSL 数据 */
  dsl: QuizDSL | null;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  errors?: ValidationError[];
  /** 原始错误（如果解析失败） */
  error?: Error;
}

/**
 * 从 JSON 字符串解析 DSL
 *
 * @param jsonString - JSON 字符串
 * @param options - 解析选项
 * @returns 解析结果
 */
export function parseQuizDSL(jsonString: string, options: ParseOptions = {}): ParseResult {
  const { validate = true, strict = false } = options;

  try {
    // 解析 JSON
    const data = JSON.parse(jsonString) as unknown;

    // 验证数据
    if (validate) {
      const validationResult = validateQuizDSL(data);
      if (!validationResult.valid) {
        return {
          dsl: null,
          success: false,
          errors: validationResult.errors,
        };
      }
    }

    // 类型转换（在严格模式下进行更严格的类型检查）
    const dsl = strict ? strictParse(data) : (data as QuizDSL);

    return {
      dsl,
      success: true,
    };
  } catch (error) {
    return {
      dsl: null,
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * 从对象解析 DSL（不进行 JSON 解析）
 *
 * @param data - 数据对象
 * @param options - 解析选项
 * @returns 解析结果
 */
export function parseQuizDSLFromObject(data: unknown, options: ParseOptions = {}): ParseResult {
  const { validate = true, strict = false } = options;

  try {
    // 验证数据
    if (validate) {
      const validationResult = validateQuizDSL(data);
      if (!validationResult.valid) {
        return {
          dsl: null,
          success: false,
          errors: validationResult.errors,
        };
      }
    }

    // 类型转换
    const dsl = strict ? strictParse(data) : (data as QuizDSL);

    return {
      dsl,
      success: true,
    };
  } catch (error) {
    return {
      dsl: null,
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * 严格解析（进行更严格的类型检查）
 */
function strictParse(data: unknown): QuizDSL {
  // 这里可以进行更严格的类型检查和转换
  // 目前先进行基本验证，后续可以扩展
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('DSL 必须是对象');
  }

  return data as QuizDSL;
}
