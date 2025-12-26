/**
 * @slidejs/context - Slide DSL Context 接口定义
 *
 * 定义所有数据源（quiz、survey、form 等）必须实现的通用接口
 */

/**
 * Slide DSL 通用 Context 接口
 * 所有数据源（quiz、survey、form 等）都必须提供此接口的实现
 */
export interface SlideContext {
  /**
   * 数据源类型标识符
   * @example 'quiz', 'survey', 'form', 'assessment'
   */
  sourceType: string;

  /**
   * 数据源唯一标识
   */
  sourceId: string;

  /**
   * 元数据（标题、描述等）
   */
  metadata: SlideMetadata;

  /**
   * 内容项集合
   * 核心抽象 - 所有数据源都提供"内容项"的概念
   */
  items: ContentItem[];

  /**
   * 分组/章节（可选）
   * 用于组织 items 的层级结构
   */
  groups?: ContentGroup[];

  /**
   * 自定义属性
   * 数据源特定的扩展属性，供 Slide DSL 规则使用
   */
  custom?: Record<string, unknown>;
}

/**
 * Slide 元数据
 */
export interface SlideMetadata {
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 作者 */
  author?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 标签 */
  tags?: string[];
  /** 其他元数据 */
  [key: string]: unknown;
}

/**
 * 内容项接口（通用抽象）
 * 表示演示文稿中的一个内容单元
 */
export interface ContentItem {
  /**
   * 唯一标识
   */
  id: string;

  /**
   * 内容类型（由数据源定义）
   * @example 'question', 'survey-item', 'form-field', 'content-block'
   */
  type: string;

  /**
   * 显示文本（主要内容）
   */
  text: string;

  /**
   * 标题（可选）
   */
  title?: string;

  /**
   * 元数据
   */
  metadata?: {
    /** 标签 */
    tags?: string[];
    /** 难度（如果适用） */
    difficulty?: string;
    /** 其他元数据 */
    [key: string]: unknown;
  };

  /**
   * 数据源特定的数据
   * 用于传递类型特定的信息（如选项、正确答案等）
   */
  data?: Record<string, unknown>;
}

/**
 * 内容分组/章节
 */
export interface ContentGroup {
  /** 分组 ID */
  id: string;
  /** 分组标题 */
  title: string;
  /** 分组描述 */
  description?: string;
  /** 分组内的内容项 */
  items: ContentItem[];
  /** 元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * Context 适配器接口
 * 数据源需要实现此接口，将自己的 DSL 转换为 SlideContext
 */
export interface ContextAdapter<TSource = unknown> {
  /**
   * 数据源类型标识符
   */
  readonly sourceType: string;

  /**
   * 转换函数：将数据源 DSL 转换为 SlideContext
   */
  transform(source: TSource): SlideContext;
}
