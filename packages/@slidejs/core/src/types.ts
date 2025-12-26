/**
 * @slidejs/core - Slide DSL 核心类型定义
 */

import type { SlideContext } from '@slidejs/context';

/**
 * Slide DSL 根对象
 */
export interface SlideDSL<TContext extends SlideContext = SlideContext> {
  /**
   * DSL 版本
   */
  version: string;

  /**
   * 数据源类型（必须与 Context.sourceType 匹配）
   */
  sourceType: string;

  /**
   * 数据源 ID
   */
  sourceId: string;

  /**
   * 规则列表
   */
  rules: SlideRule<TContext>[];

  /**
   * 全局配置（可选）
   */
  config?: SlideConfig;
}

/**
 * Slide DSL 规则
 */
export interface SlideRule<TContext extends SlideContext = SlideContext> {
  /**
   * 规则类型
   * - start: 开始规则，在内容前执行
   * - content: 内容规则，从数据动态生成
   * - end: 结束规则，在内容后执行
   */
  type: 'start' | 'content' | 'end';

  /**
   * 规则名称（用于调试和日志）
   */
  name: string;

  /**
   * 幻灯片生成器函数
   * 接收 Context，返回 Slide 定义数组
   */
  generate: (context: TContext) => SlideDefinition[];
}

/**
 * Slide 定义
 */
export interface SlideDefinition {
  /**
   * Slide ID（可选，自动生成如果未提供）
   */
  id?: string;

  /**
   * 内容配置
   */
  content: SlideContent;

  /**
   * 行为配置（过渡、背景、布局等）
   */
  behavior?: SlideBehavior;

  /**
   * 元数据
   */
  metadata?: Record<string, unknown>;
}

/**
 * Slide 内容
 */
export type SlideContent = DynamicContent | StaticContent;

/**
 * 动态内容（组件）
 */
export interface DynamicContent {
  type: 'dynamic';
  /** 组件名称（如 'wsx-quiz-question'） */
  component: string;
  /** 组件属性 */
  props: Record<string, unknown>;
}

/**
 * 静态内容（文本）
 */
export interface StaticContent {
  type: 'text';
  /** 文本行数组 */
  lines: string[];
  /** 格式选项 */
  format?: {
    /** Markdown 支持 */
    markdown?: boolean;
    /** HTML 支持 */
    html?: boolean;
  };
}

/**
 * Slide 行为配置
 */
export interface SlideBehavior {
  /**
   * 过渡动画
   */
  transition?: SlideTransition;

  /**
   * 背景配置
   */
  background?: SlideBackground;

  /**
   * 布局配置
   */
  layout?: SlideLayout;

  /**
   * Fragments（分步显示）
   */
  fragments?: boolean;

  /**
   * 自动播放（秒数）
   */
  autoplay?: number;
}

/**
 * 过渡动画
 */
export interface SlideTransition {
  /** 过渡类型 */
  type: 'slide' | 'zoom' | 'fade' | 'cube' | 'flip' | 'none';
  /** 过渡速度（'slow' | 'default' | 'fast' 或毫秒数） */
  speed?: 'slow' | 'default' | 'fast' | number;
  /** 过渡方向（仅对某些类型有效） */
  direction?: 'horizontal' | 'vertical';
  /** 自定义选项 */
  options?: Record<string, unknown>;
}

/**
 * 背景配置
 */
export interface SlideBackground {
  /** 背景颜色 */
  color?: string;
  /** 背景图片 */
  image?: string;
  /** 背景视频 */
  video?: string;
  /** 背景不透明度 */
  opacity?: number;
}

/**
 * 布局配置
 */
export interface SlideLayout {
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 垂直对齐 */
  valign?: 'top' | 'middle' | 'bottom';
  /** 内容宽度 */
  width?: string | number;
}

/**
 * 全局配置
 */
export interface SlideConfig {
  /** 默认过渡 */
  defaultTransition?: SlideTransition;
  /** 默认背景 */
  defaultBackground?: SlideBackground;
  /** 主题 */
  theme?: string;
  /** 其他配置 */
  [key: string]: unknown;
}
