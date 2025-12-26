/**
 * @slidejs/dsl - Parser 接口
 *
 * 使用 Peggy 生成的 parser 解析 Slide DSL 语法
 */

import type { PresentationNode } from './ast';

/**
 * Parser 错误
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public location?: {
      start: { line: number; column: number; offset: number };
      end: { line: number; column: number; offset: number };
    }
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Parser 接口
 */
export interface Parser {
  /**
   * 解析 Slide DSL 源代码
   */
  parse(source: string): PresentationNode;
}

/**
 * 创建 Parser 实例
 */
export async function createParser(): Promise<Parser> {
  // 动态导入生成的 parser
  const { parse } = await import('./generated/parser.js');

  return {
    parse(source: string): PresentationNode {
      try {
        return parse(source) as PresentationNode;
      } catch (error) {
        if (error && typeof error === 'object' && 'location' in error) {
          const errorMessage =
            'message' in error && typeof error.message === 'string'
              ? error.message
              : String(error);
          throw new ParseError(errorMessage, error.location as ParseError['location']);
        }
        const errorMessage =
          error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? error.message
            : String(error);
        throw new ParseError(errorMessage);
      }
    },
  };
}

/**
 * 便捷函数：直接解析 DSL 源代码
 */
export async function parseSlideDSL(source: string): Promise<PresentationNode> {
  // 输入验证
  if (source === null || source === undefined) {
    throw new ParseError('DSL source cannot be null or undefined');
  }

  if (typeof source !== 'string') {
    throw new ParseError(`DSL source must be a string, got: ${typeof source}`);
  }

  if (source.trim().length === 0) {
    throw new ParseError('DSL source cannot be empty');
  }

  const parser = await createParser();
  return parser.parse(source);
}
