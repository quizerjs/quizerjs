/**
 * Editor.js Quiz Tool 配置选项
 */

import { QuizData, QuizSettings } from '@quizerjs/core';

// 工具配置接口
export interface QuizToolConfig {
  // 默认测验数据
  defaultData?: Partial<QuizData>;
  // 默认设置
  defaultSettings?: QuizSettings;
  // 提交回调
  onSubmit?: (data: QuizData) => void;
  // 答案变化回调
  onAnswerChange?: (questionId: string, answer: string | string[]) => void;
  // 是否只读模式
  readOnly?: boolean;
  // 自定义样式
  customStyles?: string;
}

// 默认配置
export const defaultConfig: QuizToolConfig = {
  defaultData: {
    title: '新测验',
    description: '',
    questions: [],
    settings: {
      allowRetry: true,
      showResults: true,
      randomizeQuestions: false,
      randomizeOptions: false,
    },
  },
  readOnly: false,
};

