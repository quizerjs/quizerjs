/**
 * @quizerjs/dsl - Quiz DSL 定义和验证库
 *
 * 提供 Quiz DSL（领域特定语言）的类型定义、验证、解析和序列化功能
 */

// 导出类型
export * from './types';
// 显式导出 Result DSL 相关类型
export type { AnswerValue, QuestionResult, ResultDSL } from './types';

// 导出验证器
export { validateQuizDSL, type ValidationError, type ValidationResult } from './validator';

// 导出错误代码和消息
export { ValidationErrorCode, ValidationMessages, getErrorMessage } from './messages';

// 导出解析器
export {
  parseQuizDSL,
  parseQuizDSLFromObject,
  type ParseOptions,
  type ParseResult,
} from './parser';

// 导出序列化器
export {
  serializeQuizDSL,
  serializeQuizDSLToObject,
  type SerializeOptions,
  type SerializeResult,
} from './serializer';
