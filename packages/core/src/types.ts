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

