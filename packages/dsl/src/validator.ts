/**
 * @quizerjs/dsl - Quiz DSL 验证器
 *
 * 提供 DSL 数据验证功能，确保数据符合规范
 */

import { Question, QuestionType, QuestionTypes } from './types';
import { ValidationErrorCode, getErrorMessage } from './messages';

/**
 * 类型守卫：检查是否为普通对象（非数组）
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 类型守卫：检查是否为字符串
 */
function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * 类型守卫：检查是否为数组
 */
function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * 类型守卫：检查是否为布尔值
 */
function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 类型守卫：检查是否为有效的 QuestionType
 */
function isQuestionType(value: unknown): value is QuestionType {
  return isString(value) && Object.values(QuestionTypes).includes(value as QuestionType);
}

/**
 * 验证错误信息
 */
export interface ValidationError {
  /** 错误代码 */
  code: ValidationErrorCode;
  /** 错误路径（如 "quiz.id"） */
  path: string;
  /** 错误消息 */
  message: string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误列表 */
  errors: ValidationError[];
}

/**
 * 验证 DSL 数据
 *
 * @param dsl - 要验证的 DSL 数据
 * @returns 验证结果
 */
export function validateQuizDSL(dsl: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // 检查是否为对象
  if (!isPlainObject(dsl)) {
    return {
      valid: false,
      errors: [
        {
          code: ValidationErrorCode.DSL_MUST_BE_OBJECT,
          path: '',
          message: getErrorMessage(ValidationErrorCode.DSL_MUST_BE_OBJECT),
        },
      ],
    };
  }

  const dslObj = dsl;

  // 验证 version
  if (!isString(dslObj.version)) {
    errors.push({
      code: ValidationErrorCode.VERSION_MUST_BE_STRING,
      path: 'version',
      message: getErrorMessage(ValidationErrorCode.VERSION_MUST_BE_STRING),
    });
  }

  // 验证 quiz
  if (!isPlainObject(dslObj.quiz)) {
    errors.push({
      code: ValidationErrorCode.QUIZ_MUST_BE_OBJECT,
      path: 'quiz',
      message: getErrorMessage(ValidationErrorCode.QUIZ_MUST_BE_OBJECT),
    });
    return { valid: false, errors };
  }

  const quiz = dslObj.quiz;

  // 验证 quiz.id
  if (!isString(quiz.id)) {
    errors.push({
      code: ValidationErrorCode.QUIZ_ID_MUST_BE_STRING,
      path: 'quiz.id',
      message: getErrorMessage(ValidationErrorCode.QUIZ_ID_MUST_BE_STRING),
    });
  }

  // 验证 quiz.title
  if (!isString(quiz.title)) {
    errors.push({
      code: ValidationErrorCode.QUIZ_TITLE_MUST_BE_STRING,
      path: 'quiz.title',
      message: getErrorMessage(ValidationErrorCode.QUIZ_TITLE_MUST_BE_STRING),
    });
  }

  // 验证 quiz.questions 或 quiz.sections
  // 支持两种格式：questions（向后兼容）或 sections（新格式）
  // 但不能同时存在两个属性
  const hasSections = isArray<unknown>(quiz.sections);
  const hasQuestions = isArray<unknown>(quiz.questions);

  if (hasSections && hasQuestions) {
    // 两个属性同时存在，明确拒绝
    errors.push({
      code: ValidationErrorCode.QUIZ_SECTIONS_AND_QUESTIONS_MUTUALLY_EXCLUSIVE,
      path: 'quiz',
      message: getErrorMessage(ValidationErrorCode.QUIZ_SECTIONS_AND_QUESTIONS_MUTUALLY_EXCLUSIVE),
    });
    // 继续验证 sections（优先使用），但标记为错误状态
  }

  if (hasSections) {
    // 验证 sections 格式
    const questionIds = new Set<string>();
    (quiz.sections as unknown[]).forEach((section: unknown, sectionIndex: number) => {
      const sectionPath = `quiz.sections[${sectionIndex}]`;

      // 验证 section.id
      if (!isPlainObject(section)) {
        errors.push({
          code: ValidationErrorCode.QUIZ_QUESTIONS_MUST_BE_ARRAY,
          path: sectionPath,
          message: `${sectionPath} 必须是对象`,
        });
        return;
      }

      const sectionObj = section as Record<string, unknown>;

      // 验证 section.title
      if (!isString(sectionObj.title)) {
        errors.push({
          code: ValidationErrorCode.QUIZ_TITLE_MUST_BE_STRING,
          path: `${sectionPath}.title`,
          message: `${sectionPath}.title 必须是字符串`,
        });
      }

      // 验证 section.questions
      if (!isArray(sectionObj.questions)) {
        errors.push({
          code: ValidationErrorCode.QUIZ_QUESTIONS_MUST_BE_ARRAY,
          path: `${sectionPath}.questions`,
          message: `${sectionPath}.questions 必须是数组`,
        });
      } else {
        // 验证每个问题
        sectionObj.questions.forEach((question, questionIndex) => {
          const questionPath = `${sectionPath}.questions[${questionIndex}]`;
          const questionErrors = validateQuestion(question as Question, questionPath, questionIds);
          errors.push(...questionErrors);
        });
      }
    });
  } else if (isArray(quiz.questions)) {
    // 验证 questions 格式（向后兼容）
    const questionIds = new Set<string>();
    quiz.questions.forEach((question, index) => {
      const questionPath = `quiz.questions[${index}]`;
      const questionErrors = validateQuestion(question as Question, questionPath, questionIds);
      errors.push(...questionErrors);
    });
  } else {
    // 既没有 sections 也没有 questions
    errors.push({
      code: ValidationErrorCode.QUIZ_QUESTIONS_MUST_BE_ARRAY,
      path: 'quiz',
      message: 'quiz.sections 或 quiz.questions 必须存在且为数组',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证单个问题
 *
 * @param question - 要验证的问题
 * @param path - 问题路径
 * @param questionIds - 已使用的问题 ID 集合（用于检查唯一性）
 * @returns 错误列表
 */
function validateQuestion<T extends Question>(
  question: T,
  path: string,
  questionIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 检查是否为对象
  if (!isPlainObject(question)) {
    errors.push({
      code: ValidationErrorCode.QUESTION_MUST_BE_OBJECT,
      path,
      message: getErrorMessage(ValidationErrorCode.QUESTION_MUST_BE_OBJECT),
    });
    return errors;
  }

  const q = question as Record<string, unknown>;

  // 验证 id
  if (!isString(q.id)) {
    errors.push({
      code: ValidationErrorCode.QUESTION_ID_MUST_BE_STRING,
      path: `${path}.id`,
      message: getErrorMessage(ValidationErrorCode.QUESTION_ID_MUST_BE_STRING),
    });
  } else {
    // 检查 ID 唯一性
    if (questionIds.has(q.id)) {
      errors.push({
        code: ValidationErrorCode.QUESTION_ID_DUPLICATE,
        path: `${path}.id`,
        message: getErrorMessage(ValidationErrorCode.QUESTION_ID_DUPLICATE, q.id),
      });
    } else {
      questionIds.add(q.id);
    }
  }

  // 验证 type
  if (!isQuestionType(q.type)) {
    // 检查是否为字符串但无效的类型
    if (typeof q.type === 'string') {
      errors.push({
        code: ValidationErrorCode.QUESTION_TYPE_UNKNOWN,
        path: `${path}.type`,
        message: getErrorMessage(ValidationErrorCode.QUESTION_TYPE_UNKNOWN, q.type),
      });
    } else {
      errors.push({
        code: ValidationErrorCode.QUESTION_TYPE_MUST_BE_VALID,
        path: `${path}.type`,
        message: getErrorMessage(ValidationErrorCode.QUESTION_TYPE_MUST_BE_VALID),
      });
    }
    return errors; // 没有有效的 type 无法继续验证
  }

  const questionType = q.type;

  // 验证 text
  if (!isString(q.text)) {
    errors.push({
      code: ValidationErrorCode.QUESTION_TEXT_MUST_BE_STRING,
      path: `${path}.text`,
      message: getErrorMessage(ValidationErrorCode.QUESTION_TEXT_MUST_BE_STRING),
    });
  }

  // 根据问题类型进行特定验证
  switch (questionType) {
    case QuestionTypes.SINGLE_CHOICE:
      errors.push(...validateSingleChoiceQuestion(q, path));
      break;
    case QuestionTypes.MULTIPLE_CHOICE:
      errors.push(...validateMultipleChoiceQuestion(q, path));
      break;
    case QuestionTypes.TEXT_INPUT:
      errors.push(...validateTextInputQuestion(q, path));
      break;
    case QuestionTypes.TRUE_FALSE:
      errors.push(...validateTrueFalseQuestion(q, path));
      break;
  }

  return errors;
}

/**
 * 验证单选题
 */
function validateSingleChoiceQuestion(
  question: Record<string, unknown>,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isArray(question.options) || question.options.length < 2) {
    errors.push({
      code: ValidationErrorCode.SINGLE_CHOICE_OPTIONS_MIN,
      path: `${path}.options`,
      message: getErrorMessage(ValidationErrorCode.SINGLE_CHOICE_OPTIONS_MIN),
    });
  } else {
    const optionIds = new Set<string>();
    let correctCount = 0;

    question.options.forEach((option, index) => {
      const optionPath = `${path}.options[${index}]`;

      // 检查选项是否为对象
      if (!isPlainObject(option)) {
        errors.push({
          code: ValidationErrorCode.OPTION_MUST_BE_OBJECT,
          path: optionPath,
          message: getErrorMessage(ValidationErrorCode.OPTION_MUST_BE_OBJECT),
        });
        return;
      }

      // 验证选项 id
      if (!isString(option.id)) {
        errors.push({
          code: ValidationErrorCode.OPTION_ID_MUST_BE_STRING,
          path: `${optionPath}.id`,
          message: getErrorMessage(ValidationErrorCode.OPTION_ID_MUST_BE_STRING),
        });
      } else if (optionIds.has(option.id)) {
        errors.push({
          code: ValidationErrorCode.OPTION_ID_DUPLICATE,
          path: `${optionPath}.id`,
          message: getErrorMessage(ValidationErrorCode.OPTION_ID_DUPLICATE, option.id),
        });
      } else {
        optionIds.add(option.id);
      }

      // 验证选项 text
      if (!isString(option.text)) {
        errors.push({
          code: ValidationErrorCode.OPTION_TEXT_MUST_BE_STRING,
          path: `${optionPath}.text`,
          message: getErrorMessage(ValidationErrorCode.OPTION_TEXT_MUST_BE_STRING),
        });
      }

      // 验证 isCorrect
      if (!isBoolean(option.isCorrect)) {
        errors.push({
          code: ValidationErrorCode.OPTION_IS_CORRECT_MUST_BE_BOOLEAN,
          path: `${optionPath}.isCorrect`,
          message: getErrorMessage(ValidationErrorCode.OPTION_IS_CORRECT_MUST_BE_BOOLEAN),
        });
      } else if (option.isCorrect) {
        correctCount++;
      }
    });

    // 单选题必须恰好有一个正确答案
    if (correctCount !== 1) {
      errors.push({
        code: ValidationErrorCode.SINGLE_CHOICE_MUST_HAVE_ONE_CORRECT,
        path: `${path}.options`,
        message: getErrorMessage(ValidationErrorCode.SINGLE_CHOICE_MUST_HAVE_ONE_CORRECT),
      });
    }
  }

  return errors;
}

/**
 * 验证多选题
 */
function validateMultipleChoiceQuestion(
  question: Record<string, unknown>,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isArray(question.options) || question.options.length < 2) {
    errors.push({
      code: ValidationErrorCode.MULTIPLE_CHOICE_OPTIONS_MIN,
      path: `${path}.options`,
      message: getErrorMessage(ValidationErrorCode.MULTIPLE_CHOICE_OPTIONS_MIN),
    });
  } else {
    const optionIds = new Set<string>();
    let correctCount = 0;

    question.options.forEach((option, index) => {
      const optionPath = `${path}.options[${index}]`;

      // 检查选项是否为对象
      if (!isPlainObject(option)) {
        errors.push({
          code: ValidationErrorCode.OPTION_MUST_BE_OBJECT,
          path: optionPath,
          message: getErrorMessage(ValidationErrorCode.OPTION_MUST_BE_OBJECT),
        });
        return;
      }

      // 验证选项 id
      if (!isString(option.id)) {
        errors.push({
          code: ValidationErrorCode.OPTION_ID_MUST_BE_STRING,
          path: `${optionPath}.id`,
          message: getErrorMessage(ValidationErrorCode.OPTION_ID_MUST_BE_STRING),
        });
      } else if (optionIds.has(option.id)) {
        errors.push({
          code: ValidationErrorCode.OPTION_ID_DUPLICATE,
          path: `${optionPath}.id`,
          message: getErrorMessage(ValidationErrorCode.OPTION_ID_DUPLICATE, option.id),
        });
      } else {
        optionIds.add(option.id);
      }

      // 验证选项 text
      if (!isString(option.text)) {
        errors.push({
          code: ValidationErrorCode.OPTION_TEXT_MUST_BE_STRING,
          path: `${optionPath}.text`,
          message: getErrorMessage(ValidationErrorCode.OPTION_TEXT_MUST_BE_STRING),
        });
      }

      // 验证 isCorrect
      if (!isBoolean(option.isCorrect)) {
        errors.push({
          code: ValidationErrorCode.OPTION_IS_CORRECT_MUST_BE_BOOLEAN,
          path: `${optionPath}.isCorrect`,
          message: getErrorMessage(ValidationErrorCode.OPTION_IS_CORRECT_MUST_BE_BOOLEAN),
        });
      } else if (option.isCorrect) {
        correctCount++;
      }
    });

    // 多选题必须至少有一个正确答案
    if (correctCount < 1) {
      errors.push({
        code: ValidationErrorCode.MULTIPLE_CHOICE_MUST_HAVE_AT_LEAST_ONE_CORRECT,
        path: `${path}.options`,
        message: getErrorMessage(
          ValidationErrorCode.MULTIPLE_CHOICE_MUST_HAVE_AT_LEAST_ONE_CORRECT
        ),
      });
    }
  }

  return errors;
}

/**
 * 验证文本输入题
 */
function validateTextInputQuestion(
  question: Record<string, unknown>,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  const correctAnswer = question.correctAnswer;

  if (
    correctAnswer === undefined ||
    correctAnswer === null ||
    (!isString(correctAnswer) && !isArray<string>(correctAnswer))
  ) {
    errors.push({
      code: ValidationErrorCode.TEXT_INPUT_CORRECT_ANSWER_REQUIRED,
      path: `${path}.correctAnswer`,
      message: getErrorMessage(ValidationErrorCode.TEXT_INPUT_CORRECT_ANSWER_REQUIRED),
    });
  } else if (isArray<string>(correctAnswer) && correctAnswer.length === 0) {
    errors.push({
      code: ValidationErrorCode.TEXT_INPUT_CORRECT_ANSWER_ARRAY_EMPTY,
      path: `${path}.correctAnswer`,
      message: getErrorMessage(ValidationErrorCode.TEXT_INPUT_CORRECT_ANSWER_ARRAY_EMPTY),
    });
  }

  return errors;
}

/**
 * 验证判断题
 */
function validateTrueFalseQuestion(
  question: Record<string, unknown>,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isBoolean(question.correctAnswer)) {
    errors.push({
      code: ValidationErrorCode.TRUE_FALSE_CORRECT_ANSWER_MUST_BE_BOOLEAN,
      path: `${path}.correctAnswer`,
      message: getErrorMessage(ValidationErrorCode.TRUE_FALSE_CORRECT_ANSWER_MUST_BE_BOOLEAN),
    });
  }

  return errors;
}
