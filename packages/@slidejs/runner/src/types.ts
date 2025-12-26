/**
 * @slidejs/runner - 类型定义
 *
 * 定义 SlideAdapter 接口、插件系统和配置类型
 */

import type { SlideDefinition } from '@slidejs/core';

/**
 * 适配器事件类型
 */
export type AdapterEvent = 'slideChanged' | 'slideRendered' | 'ready' | 'error';

/**
 * 事件处理器
 */
export type EventHandler = (data: unknown) => void;

/**
 * 适配器选项基础接口
 */
export interface AdapterOptions {
  [key: string]: unknown;
}

/**
 * SlideAdapter 接口
 *
 * 所有渲染引擎适配器必须实现此接口
 */
export interface SlideAdapter {
  /**
   * 适配器名称
   */
  readonly name: string;

  /**
   * 初始化适配器
   *
   * @param container - 容器元素
   * @param options - 适配器选项
   */
  initialize(container: HTMLElement, options?: AdapterOptions): Promise<void>;

  /**
   * 渲染幻灯片
   *
   * @param slides - 幻灯片定义数组
   */
  render(slides: SlideDefinition[]): Promise<void>;

  /**
   * 销毁适配器，清理资源
   */
  destroy(): Promise<void>;

  /**
   * 导航到指定幻灯片
   *
   * @param index - 幻灯片索引
   */
  navigateTo(index: number): void;

  /**
   * 获取当前幻灯片索引
   */
  getCurrentIndex(): number;

  /**
   * 获取幻灯片总数
   */
  getTotalSlides(): number;

  /**
   * 更新指定幻灯片（可选）
   *
   * @param index - 幻灯片索引
   * @param slide - 新的幻灯片定义
   */
  updateSlide?(index: number, slide: SlideDefinition): Promise<void>;

  /**
   * 注册事件监听器
   *
   * @param event - 事件类型
   * @param handler - 事件处理器
   */
  on(event: AdapterEvent, handler: EventHandler): void;

  /**
   * 移除事件监听器
   *
   * @param event - 事件类型
   * @param handler - 事件处理器
   */
  off(event: AdapterEvent, handler: EventHandler): void;
}

/**
 * SlideRunner 插件接口
 *
 * 插件可以在 SlideRunner 的生命周期钩子中执行自定义逻辑
 */
export interface SlideRunnerPlugin {
  /**
   * 插件名称
   */
  name: string;

  /**
   * 渲染前钩子
   *
   * @param slides - 即将渲染的幻灯片数组
   */
  beforeRender?(slides: SlideDefinition[]): Promise<void> | void;

  /**
   * 渲染后钩子
   *
   * @param slides - 已渲染的幻灯片数组
   */
  afterRender?(slides: SlideDefinition[]): Promise<void> | void;

  /**
   * 幻灯片切换前钩子
   *
   * @param fromIndex - 当前幻灯片索引
   * @param toIndex - 目标幻灯片索引
   */
  beforeSlideChange?(fromIndex: number, toIndex: number): Promise<void> | void;

  /**
   * 幻灯片切换后钩子
   *
   * @param fromIndex - 上一张幻灯片索引
   * @param toIndex - 当前幻灯片索引
   */
  afterSlideChange?(fromIndex: number, toIndex: number): Promise<void> | void;
}

/**
 * SlideRunner 配置
 */
export interface SlideRunnerConfig {
  /**
   * 容器元素或选择器
   */
  container: HTMLElement | string;

  /**
   * 渲染引擎适配器
   */
  adapter: SlideAdapter;

  /**
   * 适配器选项
   */
  adapterOptions?: AdapterOptions;

  /**
   * 插件数组
   */
  plugins?: SlideRunnerPlugin[];
}
