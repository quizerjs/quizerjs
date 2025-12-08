/**
 * WSX 组件引用类型
 * 定义 Editor.js 工具中使用的 wsx 组件的接口
 */

/**
 * 问题标题组件接口
 */
export interface QuizQuestionHeaderComponent {
  /**
   * 获取当前文本（HTML 格式）
   */
  getText(): string;
  /**
   * 设置文本（HTML 格式）
   */
  setText(html: string): void;
}

/**
 * 问题描述组件接口
 */
export interface QuizQuestionDescriptionComponent {
  /**
   * 获取当前文本（HTML 格式）
   */
  getText(): string;
  /**
   * 设置文本（HTML 格式）
   */
  setText(html: string): void;
}

/**
 * 选项列表组件接口
 */
export interface QuizOptionListComponent {
  /**
   * 获取选项列表
   */
  getOptions(): Array<{ id: string; text: string; isCorrect: boolean }>;
  /**
   * 设置选项列表
   */
  setOptionsList(options: Array<{ id: string; text: string; isCorrect: boolean }>): void;
}
