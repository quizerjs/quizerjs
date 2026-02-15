/**
 * 测验数据类型定义
 */

// 问题类型枚举
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice', // 单选题
  MULTIPLE_CHOICE = 'multiple_choice', // 多选题
  TEXT_INPUT = 'text_input', // 文本输入题
  TRUE_FALSE = 'true_false', // 判断题
}

// 选项接口
export interface Option {
  id: string; // 选项唯一标识
  text: string; // 选项文本
  isCorrect?: boolean; // 是否为正确答案（用于编辑模式）
}

// 问题接口
export interface Question {
  id: string; // 问题唯一标识
  type: QuestionType; // 问题类型
  text: string; // 问题文本
  options?: Option[]; // 选项列表（选择题需要）
  correctAnswer?: string | string[]; // 正确答案（用于验证）
  explanation?: string; // 答案解析
  points?: number; // 题目分值
}

// 测验数据接口
export interface QuizData {
  id: string; // 测验唯一标识
  title: string; // 测验标题
  description?: string; // 测验描述
  questions: Question[]; // 问题列表
  settings?: QuizSettings; // 测验设置
}

// 测验设置接口
export interface QuizSettings {
  allowRetry?: boolean; // 是否允许重试
  showResults?: boolean; // 是否显示结果
  timeLimit?: number; // 时间限制（秒）
  randomizeQuestions?: boolean; // 是否随机排序问题
  randomizeOptions?: boolean; // 是否随机排序选项
}

// 用户答案接口
export interface UserAnswer {
  questionId: string; // 问题ID
  answer: string | string[]; // 用户答案
  isCorrect?: boolean; // 是否正确（提交后计算）
}

// 测验结果接口
export interface QuizResult {
  quizId: string; // 测验ID
  answers: UserAnswer[]; // 用户答案列表
  score: number; // 得分
  totalScore: number; // 总分
  percentage: number; // 得分百分比
  completedAt: Date; // 完成时间
}

/**
 * RFC 0020: 国际化配置接口
 * 用于在核心库中定义“本地化模具”
 */
export interface QuizLocalization {
  quiz: {
    /** 测验默认标题占位符 */
    defaultTitle: string;
  };
  section: {
    /** 章节默认标题占位符 */
    defaultTitle: string;
  };
  player: {
    /** 提交按钮文本 */
    submitButton: string;
    /** 提交中状态文本 */
    submitting: string;
    /** 已提交状态文本 */
    submitted: string;
    /** 结果页标题 */
    resultTitle: string;
    /** 加载中 */
    loading: string;
    /** 通过 */
    passed: string;
    /** 未通过 */
    failed: string;
    /** 通过分数线模板 */
    passingScoreTemplate: string;
    /** 得分模板 */
    scoreTemplate: string;
    /** 答题时长标签 */
    durationLabel: string;
    /** 完成时间标签 */
    completedAtLabel: string;
    /** 答题详情标题 */
    detailsTitle: string;
    /** 第 N 题模板 */
    questionNumberTemplate: string;
    /** 正确 */
    correct: string;
    /** 错误 */
    incorrect: string;
    /** 您的答案 */
    yourAnswer: string;
    /** 未作答 */
    notAnswered: string;
    /** 正确答案 */
    correctAnswer: string;
    /** 解析 */
    explanation: string;
    /** 分钟单位 */
    minutes: string;
    /** 秒单位 */
    seconds: string;
    /** 已完成 */
    completed: string;
    /** 已回答 */
    answered: string;
    /** 未回答 */
    unanswered: string;
    /** 总题数 */
    totalQuestions: string;
    /** 未完成提示模板 */
    incompleteWarningTemplate: string;
    /** 测验介绍模板 */
    quizIntroTemplate: string;
    /** 分数单位（如"分"） */
    pointsUnit: string;
  };
  editor: {
    /** 添加选项按钮 */
    addOption: string;
    /** 空选项提示 */
    noOptionsHint: string;
    /** 删除按钮 */
    deleteOption: string;
    /** 选项文本占位符 */
    optionPlaceholder: string;
    /** 问题描述占位符 */
    descriptionPlaceholder: string;
    /** 问题标题占位符 */
    titlePlaceholder: string;
    /** 正确答案标签 */
    correctAnswerLabel: string;
    /** 单选题工具名 */
    singleChoiceTitle: string;
    /** 多选题工具名 */
    multipleChoiceTitle: string;
    /** 文本输入题工具名 */
    textInputTitle: string;
    /** 判断题工具名 */
    trueFalseTitle: string;
    /** 正确（布尔值） */
    boolTrue: string;
    /** 错误（布尔值） */
    boolFalse: string;
    /** 单选题设置标签 */
    singleChoiceSettings: string;
    /** 多选题设置标签 */
    multipleChoiceSettings: string;
    /** 文本输入题设置标签 */
    textInputSettings: string;
    /** 判断题设置标签 */
    trueFalseSettings: string;
    /** 单选题设置描述 */
    singleChoiceDescription: string;
    /** 多选题设置描述 */
    multipleChoiceDescription: string;
    /** 文本输入题设置描述 */
    textInputDescription: string;
    /** 判断题设置描述 */
    trueFalseDescription: string;
  };
}

/**
 * 转换器配置选项
 */
export interface TransformerOptions {
  localization?: QuizLocalization;
}
