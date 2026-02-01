/**
 * QuizPlayer 类型定义
 */

import type { QuizDSL } from '@quizerjs/dsl';
import type { ResultDSL, QuestionResult, AnswerValue } from '@quizerjs/dsl';
// 重新导出 DSL 包中的类型，保持向后兼容
export type { ResultDSL, QuestionResult, AnswerValue };

// Swiper 配置选项类型（从 @slidejs/runner-swiper 或自定义）
export interface SwiperRunnerOptions {
  direction?: 'horizontal' | 'vertical';
  loop?: boolean;
  speed?: number;
  spaceBetween?: number;
  slidesPerView?: number | 'auto';
  navigation?: boolean | object;
  pagination?: boolean | object | { clickable?: boolean };
  keyboard?: {
    enabled?: boolean;
    onlyInViewport?: boolean;
  };
  touch?: boolean;
  [key: string]: unknown;
}

// 重新导出 SwiperRunnerOptions 作为 SlideOptions，隐藏实现细节
export type { SwiperRunnerOptions as SlideOptions };

/**
 * Swiper 配置选项（简化版，实际使用 Swiper 的类型）
 */
export interface SwiperAdapterOptions {
  swiperConfig?: {
    direction?: 'horizontal' | 'vertical';
    loop?: boolean;
    speed?: number;
    spaceBetween?: number;
    slidesPerView?: number | 'auto';
    navigation?: boolean | object;
    pagination?: boolean | object;
    keyboard?: {
      enabled?: boolean;
      onlyInViewport?: boolean;
    };
    [key: string]: unknown;
  };
}

/**
 * 支持的主题名称
 * 从 @quizerjs/theme 重新导出以保持向后兼容性
 */
export type ThemeName = 'solarized-dark' | 'solarized-light' | 'dark' | 'light' | (string & {});

/**
 * 主题配置对象（用于 Player 主题）
 *
 * 这些属性会被传递给 @quizerjs/theme.setPlayerTheme()，它通过 @slidejs/theme.setTheme() 在 :root 上设置 CSS 变量（CSS hook API）。
 * 这些 CSS 变量会影响 Slide 播放器的样式。
 *
 * 所有属性都是可选的，允许部分覆盖预设主题。
 * 支持扩展，可以添加额外的自定义属性。
 *
 * @deprecated 建议直接使用 @quizerjs/theme 中的 PlayerThemeConfig 和 PlayerThemeName
 */
export interface ThemeConfig {
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  navigationColor?: string;
  paginationColor?: string;
  paginationActiveColor?: string;
  scrollbarBg?: string;
  scrollbarDragBg?: string;
  arrowColor?: string;
  progressBarColor?: string;
  headingColor?: string;
  codeBackground?: string;
  [key: string]: string | undefined; // 允许扩展自定义属性
}

/**
 * QuizPlayer 选项
 */
export interface QuizPlayerOptions {
  /**
   * 容器元素（必需）
   */
  container: HTMLElement | string;

  /**
   * Quiz 数据（必需）
   * 可以是 QuizDSL 对象
   */
  quizSource: QuizDSL;

  /**
   * Slide 源代码（可选）
   * 定义如何将 Quiz 转换为幻灯片
   * 如果不提供，将使用默认的 Slide 模板
   */
  slideSource?: string;

  /**
   * 初始答案（可选）
   * 用于恢复之前的答题状态
   */
  initialAnswers?: Record<string, AnswerValue>;

  /**
   * 从 Result 恢复（可选）
   * 如果提供，将从 Result 恢复答题状态
   */
  resultSource?: ResultDSL;

  /**
   * 提交回调（可选）
   * 当用户提交测验时触发，返回 Result DSL
   */
  onSubmit?: (result: ResultDSL) => void;

  /**
   * Start callback (optional)
   * Triggered when the player is successfully initialized and starts
   */
  onStart?: () => void;

  /**
   * 答案变更回调（可选）
   * 当用户修改答案时触发
   */
  onAnswerChange?: (questionId: string, answer: AnswerValue) => void;

  /**
   * Complete callback (optional)
   * Triggered when all questions are answered
   */
  onComplete?: () => void;

  /**
   * Reset callback (optional)
   * Triggered when the quiz is reset
   */
  onReset?: () => void;

  /**
   * 只读模式（可选，默认 false）
   * 用于显示结果
   */
  readOnly?: boolean;

  /**
   * 显示结果（可选，默认 true）
   * 当只读模式或提交后，是否显示正确/错误反馈
   */
  showResults?: boolean;

  /**
   * Slide 配置选项（可选）
   * 传递给 slide runner 的配置（当前使用 Swiper）
   */
  slideOptions?: SwiperRunnerOptions;

  /**
   * 主题设置（可选，默认 'solarized-dark'）
   *
   * 支持两种方式：
   * 1. 预设主题名称（字符串）：'solarized-dark' | 'solarized-light' | 'dark' | 'light'
   * 2. 自定义主题配置对象：部分或完整的 ThemeConfig 对象
   *
   * @example
   * // 使用预设主题
   * theme: 'solarized-dark'
   *
   * @example
   * // 使用自定义主题配置
   * theme: {
   *   backgroundColor: '#002b36',
   *   textColor: '#839496',
   *   // ... 其他颜色配置
   * }
   */
  theme?: ThemeName | ThemeConfig;
}
