/**
 * @quizerjs/dsl - 验证错误代码和消息
 *
 * 使用错误代码系统，支持国际化和消息模板
 */

/**
 * 验证错误代码枚举
 */
export enum ValidationErrorCode {
  // DSL 级别错误 (1000-1099)
  DSL_MUST_BE_OBJECT = 'E1000',
  VERSION_MUST_BE_STRING = 'E1001',

  // Quiz 级别错误 (1100-1199)
  QUIZ_MUST_BE_OBJECT = 'E1100',
  QUIZ_ID_MUST_BE_STRING = 'E1101',
  QUIZ_TITLE_MUST_BE_STRING = 'E1102',
  QUIZ_QUESTIONS_MUST_BE_ARRAY = 'E1103',

  // Question 级别错误 (1200-1299)
  QUESTION_MUST_BE_OBJECT = 'E1200',
  QUESTION_ID_MUST_BE_STRING = 'E1201',
  QUESTION_ID_DUPLICATE = 'E1202',
  QUESTION_TYPE_MUST_BE_VALID = 'E1203',
  QUESTION_TYPE_UNKNOWN = 'E1204',
  QUESTION_TEXT_MUST_BE_STRING = 'E1205',

  // Single Choice Question 错误 (1300-1399)
  SINGLE_CHOICE_OPTIONS_MIN = 'E1300',
  SINGLE_CHOICE_MUST_HAVE_ONE_CORRECT = 'E1301',

  // Multiple Choice Question 错误 (1400-1499)
  MULTIPLE_CHOICE_OPTIONS_MIN = 'E1400',
  MULTIPLE_CHOICE_MUST_HAVE_AT_LEAST_ONE_CORRECT = 'E1401',

  // Option 错误 (1500-1599)
  OPTION_MUST_BE_OBJECT = 'E1500',
  OPTION_ID_MUST_BE_STRING = 'E1501',
  OPTION_ID_DUPLICATE = 'E1502',
  OPTION_TEXT_MUST_BE_STRING = 'E1503',
  OPTION_IS_CORRECT_MUST_BE_BOOLEAN = 'E1504',

  // Text Input Question 错误 (1600-1699)
  TEXT_INPUT_CORRECT_ANSWER_REQUIRED = 'E1600',
  TEXT_INPUT_CORRECT_ANSWER_ARRAY_EMPTY = 'E1601',

  // True/False Question 错误 (1700-1799)
  TRUE_FALSE_CORRECT_ANSWER_MUST_BE_BOOLEAN = 'E1700',
}

/**
 * 错误消息模板（支持参数化）
 */
export type MessageTemplate =
  | string
  | ((id: string) => string)
  | ((type: string) => string)
  | ((...args: unknown[]) => string);

/**
 * 错误消息映射
 */
export const ValidationMessages: Record<ValidationErrorCode, MessageTemplate> = {
  // DSL 级别错误
  [ValidationErrorCode.DSL_MUST_BE_OBJECT]: 'DSL 必须是对象',
  [ValidationErrorCode.VERSION_MUST_BE_STRING]: 'version 必须存在且为字符串',

  // Quiz 级别错误
  [ValidationErrorCode.QUIZ_MUST_BE_OBJECT]: 'quiz 必须存在且为对象',
  [ValidationErrorCode.QUIZ_ID_MUST_BE_STRING]: 'quiz.id 必须存在且为字符串',
  [ValidationErrorCode.QUIZ_TITLE_MUST_BE_STRING]: 'quiz.title 必须存在且为字符串',
  [ValidationErrorCode.QUIZ_QUESTIONS_MUST_BE_ARRAY]: 'quiz.questions 必须存在且为数组',

  // Question 级别错误
  [ValidationErrorCode.QUESTION_MUST_BE_OBJECT]: '问题必须是对象',
  [ValidationErrorCode.QUESTION_ID_MUST_BE_STRING]: '问题 id 必须存在且为字符串',
  [ValidationErrorCode.QUESTION_ID_DUPLICATE]: (id: string) => `问题 id "${id}" 重复`,
  [ValidationErrorCode.QUESTION_TYPE_MUST_BE_VALID]: '问题 type 必须存在且为有效的类型',
  [ValidationErrorCode.QUESTION_TYPE_UNKNOWN]: (type: string) => `未知的问题类型: ${type}`,
  [ValidationErrorCode.QUESTION_TEXT_MUST_BE_STRING]: '问题 text 必须存在且为字符串',

  // Single Choice Question 错误
  [ValidationErrorCode.SINGLE_CHOICE_OPTIONS_MIN]: '单选题必须至少包含 2 个选项',
  [ValidationErrorCode.SINGLE_CHOICE_MUST_HAVE_ONE_CORRECT]: '单选题必须恰好有一个正确答案',

  // Multiple Choice Question 错误
  [ValidationErrorCode.MULTIPLE_CHOICE_OPTIONS_MIN]: '多选题必须至少包含 2 个选项',
  [ValidationErrorCode.MULTIPLE_CHOICE_MUST_HAVE_AT_LEAST_ONE_CORRECT]:
    '多选题必须至少有一个正确答案',

  // Option 错误
  [ValidationErrorCode.OPTION_MUST_BE_OBJECT]: '选项必须是对象',
  [ValidationErrorCode.OPTION_ID_MUST_BE_STRING]: '选项 id 必须存在且为字符串',
  [ValidationErrorCode.OPTION_ID_DUPLICATE]: (id: string) => `选项 id "${id}" 重复`,
  [ValidationErrorCode.OPTION_TEXT_MUST_BE_STRING]: '选项 text 必须存在且为字符串',
  [ValidationErrorCode.OPTION_IS_CORRECT_MUST_BE_BOOLEAN]: '选项 isCorrect 必须为布尔值',

  // Text Input Question 错误
  [ValidationErrorCode.TEXT_INPUT_CORRECT_ANSWER_REQUIRED]:
    '文本输入题必须包含 correctAnswer（字符串或字符串数组）',
  [ValidationErrorCode.TEXT_INPUT_CORRECT_ANSWER_ARRAY_EMPTY]: 'correctAnswer 数组不能为空',

  // True/False Question 错误
  [ValidationErrorCode.TRUE_FALSE_CORRECT_ANSWER_MUST_BE_BOOLEAN]:
    '判断题必须包含 correctAnswer（布尔值）',
};

/**
 * 根据错误代码和参数生成错误消息
 */
export function getErrorMessage(code: ValidationErrorCode, ...args: unknown[]): string {
  const template = ValidationMessages[code];
  if (typeof template === 'function') {
    // 处理参数化消息
    if (args.length === 1 && typeof args[0] === 'string') {
      // 单参数字符串类型（如 id 或 type）
      return (template as (arg: string) => string)(args[0]);
    }
    // 多参数或通用情况
    return (template as (...args: unknown[]) => string)(...args);
  }
  return template;
}
