/**
 * QuizPlayer 类型定义
 */

import type { QuizDSL } from '@quizerjs/dsl';
import type { ResultDSL, QuestionResult, AnswerValue } from '@quizerjs/dsl';
import type { QuizLocalization } from '@quizerjs/core';
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
  [key: string]: string | undefined;
}

/**
 * QuizPlayer 选项
 */
export interface QuizPlayerOptions {
  /** 容器元素（必需） */
  container: HTMLElement | string;

  /** Quiz 数据（必需） */
  quizSource: QuizDSL;

  /** Slide 源代码（可选），如果不提供，将使用默认的 Slide 模板 */
  slideSource?: string;

  /** 初始答案（可选），用于恢复之前的答题状态 */
  initialAnswers?: Record<string, AnswerValue>;

  /** 从 Result 恢复（可选） */
  resultSource?: ResultDSL;

  /** 提交回调（可选） */
  onSubmit?: (result: ResultDSL) => void;

  /** Start callback (optional) */
  onStart?: () => void;

  /** 答案变更回调（可选） */
  onAnswerChange?: (questionId: string, answer: AnswerValue) => void;

  /** Complete callback (optional) */
  onComplete?: () => void;

  /** Reset callback (optional) */
  onReset?: () => void;

  /** 只读模式（可选，默认 false） */
  readOnly?: boolean;

  /** 显示结果（可选，默认 true） */
  showResults?: boolean;

  /** Slide 配置选项（可选） */
  slideOptions?: SwiperRunnerOptions;

  /** 主题设置（可选，默认 'solarized-dark'） */
  theme?: ThemeName | ThemeConfig;

  /**
   * 国际化配置（可选）
   * 如果提供，会调用 L10nService.configure() 配置全局本地化
   */
  localization?: QuizLocalization;
}
