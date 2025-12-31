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
 * 问题类型常量对象
 */
export const QuestionTypes = {
  SINGLE_CHOICE: 'single_choice', // 单选题
  MULTIPLE_CHOICE: 'multiple_choice', // 多选题
  TEXT_INPUT: 'text_input', // 文本输入题
  TRUE_FALSE: 'true_false', // 判断题
} as const;

/**
 * 问题类型联合类型（所有可能的问题类型）
 */
export type QuestionType = (typeof QuestionTypes)[keyof typeof QuestionTypes];

/**
 * 各问题类型的类型别名（从常量推导，保持类型安全）
 */
export type SingleChoiceType = typeof QuestionTypes.SINGLE_CHOICE;
export type MultipleChoiceType = typeof QuestionTypes.MULTIPLE_CHOICE;
export type TextInputType = typeof QuestionTypes.TEXT_INPUT;
export type TrueFalseType = typeof QuestionTypes.TRUE_FALSE;

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
  type: SingleChoiceType;
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
  type: MultipleChoiceType;
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
  type: TextInputType;
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
  type: TrueFalseType;
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
 * 章节数据
 */
export interface Section {
  /** 章节唯一标识 */
  id: string;
  /** 章节标题 */
  title: string;
  /** 章节描述 */
  description?: string;
  /** 章节中的问题列表 */
  questions: Question[];
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
  /** 问题列表（向后兼容，如果存在 sections 则忽略） */
  questions?: Question[];
  /** 章节列表（可选，用于组织问题） */
  sections?: Section[];
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

/**
 * 答案值类型
 */
export type AnswerValue = string | string[] | number | boolean;

/**
 * 问题评分结果
 */
export interface QuestionResult {
  /** 问题 ID */
  questionId: string;
  /** 是否正确 */
  correct: boolean;
  /** 得分 */
  score: number;
  /** 最高分数 */
  maxScore: number;
  /** 用户答案 */
  userAnswer: AnswerValue;
  /** 正确答案 */
  correctAnswer: AnswerValue;
  /** 答题时间（毫秒，可选） */
  timeSpent?: number;
}

/**
 * Result DSL 类型定义
 * 用于存储测验结果，包含完整的 Quiz DSL、用户答案和评分信息
 */
export interface ResultDSL {
  /** Result DSL 版本号 */
  version: string;
  /** 结果元数据 */
  metadata: {
    /** 结果 ID（唯一标识） */
    id: string;
    /** 关联的 Quiz ID */
    quizId: string;
    /** 用户 ID（可选） */
    userId?: string;
    /** 开始时间（ISO 8601） */
    startedAt: string;
    /** 完成时间（ISO 8601） */
    completedAt: string;
    /** 答题时长（毫秒） */
    duration: number;
  };
  /** 完整的 Quiz DSL（原始测验数据） */
  quiz: QuizDSL;
  /** 用户答案 key: questionId, value: 用户答案 */
  answers: Record<string, AnswerValue>;
  /** 评分结果 */
  scoring: {
    /** 总得分 */
    totalScore: number;
    /** 最高分数 */
    maxScore: number;
    /** 得分百分比 */
    percentage: number;
    /** 是否通过 */
    passed: boolean;
    /** 通过分数线 */
    passingScore: number;
    /** 每题评分详情 */
    questionResults: QuestionResult[];
  };
}
