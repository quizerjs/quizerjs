/**
 * @quizerjs/dsl - Quiz DSL 类型定义
 *
 * 定义 Quiz DSL（领域特定语言）的 TypeScript 类型
 * 基于 RFC 0001: Quiz DSL 规范
 */

/**
 * DSL 版本号
 */
export type DSLVersion = string;

/**
 * 问题类型枚举
 */
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice', // 单选题
  MULTIPLE_CHOICE = 'multiple_choice', // 多选题
  TEXT_INPUT = 'text_input', // 文本输入题
  TRUE_FALSE = 'true_false', // 判断题
}

/**
 * 难度级别
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * 选项接口
 */
export interface Option {
  /** 选项唯一标识 */
  id: string;
  /** 选项文本 */
  text: string;
  /** 是否为正确答案 */
  isCorrect: boolean;
}

/**
 * 问题元数据
 */
export interface QuestionMetadata {
  /** 难度级别 */
  difficulty?: Difficulty;
  /** 标签列表 */
  tags?: string[];
  /** 自定义元数据 */
  [key: string]: unknown;
}

/**
 * 单选题问题
 */
export interface SingleChoiceQuestion {
  /** 问题唯一标识 */
  id: string;
  /** 问题类型 */
  type: QuestionType.SINGLE_CHOICE;
  /** 问题文本 */
  text: string;
  /** 选项列表 */
  options: Option[];
  /** 题目分值 */
  points?: number;
  /** 答案解析 */
  explanation?: string;
  /** 问题元数据 */
  metadata?: QuestionMetadata;
}

/**
 * 多选题问题
 */
export interface MultipleChoiceQuestion {
  /** 问题唯一标识 */
  id: string;
  /** 问题类型 */
  type: QuestionType.MULTIPLE_CHOICE;
  /** 问题文本 */
  text: string;
  /** 选项列表 */
  options: Option[];
  /** 题目分值 */
  points?: number;
  /** 答案解析 */
  explanation?: string;
  /** 问题元数据 */
  metadata?: QuestionMetadata;
}

/**
 * 文本输入题问题
 */
export interface TextInputQuestion {
  /** 问题唯一标识 */
  id: string;
  /** 问题类型 */
  type: QuestionType.TEXT_INPUT;
  /** 问题文本 */
  text: string;
  /** 正确答案（可以是字符串或字符串数组） */
  correctAnswer: string | string[];
  /** 是否区分大小写 */
  caseSensitive?: boolean;
  /** 题目分值 */
  points?: number;
  /** 答案解析 */
  explanation?: string;
  /** 问题元数据 */
  metadata?: QuestionMetadata;
}

/**
 * 判断题问题
 */
export interface TrueFalseQuestion {
  /** 问题唯一标识 */
  id: string;
  /** 问题类型 */
  type: QuestionType.TRUE_FALSE;
  /** 问题文本 */
  text: string;
  /** 正确答案 */
  correctAnswer: boolean;
  /** 题目分值 */
  points?: number;
  /** 答案解析 */
  explanation?: string;
  /** 问题元数据 */
  metadata?: QuestionMetadata;
}

/**
 * 问题联合类型
 */
export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextInputQuestion
  | TrueFalseQuestion;

/**
 * 测验元数据
 */
export interface QuizMetadata {
  /** 作者 */
  author?: string;
  /** 创建时间（ISO 8601 格式） */
  createdAt?: string;
  /** 更新时间（ISO 8601 格式） */
  updatedAt?: string;
  /** 标签列表 */
  tags?: string[];
  /** 自定义元数据 */
  [key: string]: unknown;
}

/**
 * 测验设置
 */
export interface QuizSettings {
  /** 是否允许重试 */
  allowRetry?: boolean;
  /** 是否显示结果 */
  showResults?: boolean;
  /** 时间限制（秒） */
  timeLimit?: number;
  /** 是否随机排序问题 */
  randomizeQuestions?: boolean;
  /** 是否随机排序选项 */
  randomizeOptions?: boolean;
  /** 及格分数（百分比） */
  passingScore?: number;
}

/**
 * 测验数据
 */
export interface Quiz {
  /** 测验唯一标识 */
  id: string;
  /** 测验标题 */
  title: string;
  /** 测验描述 */
  description?: string;
  /** 测验元数据 */
  metadata?: QuizMetadata;
  /** 测验设置 */
  settings?: QuizSettings;
  /** 问题列表 */
  questions: Question[];
}

/**
 * Quiz DSL 根对象
 */
export interface QuizDSL {
  /** DSL 版本号 */
  version: DSLVersion;
  /** 测验数据 */
  quiz: Quiz;
}
