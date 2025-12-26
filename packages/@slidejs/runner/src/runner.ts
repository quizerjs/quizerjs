/**
 * @slidejs/runner - SlideRunner 核心类
 *
 * 提供幻灯片运行时的核心功能，包括适配器管理、插件系统和生命周期控制
 */

import type { SlideDSL, SlideDefinition } from '@slidejs/core';
import { SlideEngine } from '@slidejs/core';
import type { SlideContext } from '@slidejs/context';
import type {
  SlideAdapter,
  SlideRunnerConfig,
  SlideRunnerPlugin,
  AdapterEvent,
  EventHandler,
  AdapterOptions,
} from './types';
import { SlideRunnerError } from './errors';

/**
 * SlideRunner 核心类
 *
 * 负责协调 SlideEngine、SlideAdapter 和插件系统，提供完整的幻灯片运行时环境
 */
export class SlideRunner<TContext extends SlideContext = SlideContext> {
  private adapter: SlideAdapter;
  private plugins: SlideRunnerPlugin[];
  private container: HTMLElement;
  private adapterOptions?: AdapterOptions;
  private slides: SlideDefinition[] = [];
  private currentIndex = 0;
  private isInitialized = false;

  /**
   * 创建 SlideRunner 实例
   *
   * @param config - SlideRunner 配置
   * @throws {SlideRunnerError} 如果配置无效
   */
  constructor(config: SlideRunnerConfig) {
    // 验证配置
    if (!config.adapter) {
      throw new SlideRunnerError('Adapter is required', 'MISSING_ADAPTER');
    }

    this.adapter = config.adapter;
    this.plugins = config.plugins ?? [];
    this.container = this.resolveContainer(config.container);
    this.adapterOptions = config.adapterOptions;

    // 设置适配器事件监听
    this.setupAdapterEventListeners();
  }

  /**
   * 运行幻灯片演示
   *
   * 完整流程：
   * 1. 使用 SlideEngine 生成幻灯片
   * 2. 执行 beforeRender 插件钩子
   * 3. 初始化适配器
   * 4. 渲染幻灯片
   * 5. 执行 afterRender 插件钩子
   *
   * @param dsl - Slide DSL 对象
   * @param context - 幻灯片上下文数据
   */
  async run(dsl: SlideDSL<TContext>, context: TContext): Promise<void> {
    try {
      // 1. 使用 SlideEngine 生成幻灯片
      const engine = new SlideEngine(dsl);
      this.slides = engine.generate(context);

      // 2. 执行 beforeRender 插件钩子
      await this.executePluginHook('beforeRender', this.slides);

      // 3. 初始化适配器（如果尚未初始化）
      if (!this.isInitialized) {
        await this.adapter.initialize(this.container, this.adapterOptions);
        this.isInitialized = true;
      }

      // 4. 渲染幻灯片
      await this.adapter.render(this.slides);

      // 5. 执行 afterRender 插件钩子
      await this.executePluginHook('afterRender', this.slides);

      // 重置当前索引
      this.currentIndex = 0;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new SlideRunnerError(
        `Failed to run slides: ${errorMessage}`,
        'RUN_FAILED'
      );
    }
  }

  /**
   * 直接渲染幻灯片数组
   *
   * 跳过 SlideEngine 生成步骤，直接渲染提供的幻灯片
   *
   * @param slides - 幻灯片定义数组
   */
  async renderSlides(slides: SlideDefinition[]): Promise<void> {
    try {
      this.slides = slides;

      // 执行 beforeRender 插件钩子
      await this.executePluginHook('beforeRender', this.slides);

      // 初始化适配器（如果尚未初始化）
      if (!this.isInitialized) {
        await this.adapter.initialize(this.container, this.adapterOptions);
        this.isInitialized = true;
      }

      // 渲染幻灯片
      await this.adapter.render(this.slides);

      // 执行 afterRender 插件钩子
      await this.executePluginHook('afterRender', this.slides);

      // 重置当前索引
      this.currentIndex = 0;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new SlideRunnerError(
        `Failed to render slides: ${errorMessage}`,
        'RENDER_FAILED'
      );
    }
  }

  /**
   * 导航到指定幻灯片
   *
   * 执行 beforeSlideChange 和 afterSlideChange 插件钩子
   *
   * @param index - 目标幻灯片索引
   * @throws {SlideRunnerError} 如果索引超出范围
   */
  navigateTo(index: number): void {
    if (index < 0 || index >= this.slides.length) {
      throw new SlideRunnerError(
        `Invalid slide index: ${index}. Valid range: 0-${this.slides.length - 1}`,
        'INVALID_INDEX'
      );
    }

    const fromIndex = this.currentIndex;
    const toIndex = index;

    // 执行 beforeSlideChange 插件钩子（同步）
    this.executePluginHook('beforeSlideChange', fromIndex, toIndex).then(
      () => {
        // 调用适配器导航
        this.adapter.navigateTo(index);
        this.currentIndex = index;

        // 执行 afterSlideChange 插件钩子（异步）
        this.executePluginHook('afterSlideChange', fromIndex, toIndex).catch(
          (error) => {
            console.error('Plugin afterSlideChange hook failed:', error);
          }
        );
      }
    );
  }

  /**
   * 播放/启动演示文稿
   *
   * 导航到第一张幻灯片（索引 0），开始演示
   */
  play(): void {
    if (this.slides.length === 0) {
      throw new SlideRunnerError(
        'No slides to play. Call run() or renderSlides() first.',
        'NO_SLIDES'
      );
    }

    if (!this.isInitialized) {
      throw new SlideRunnerError(
        'Adapter not initialized. Call run() or renderSlides() first.',
        'NOT_INITIALIZED'
      );
    }

    // 导航到第一张幻灯片
    this.navigateTo(0);
  }

  /**
   * 获取当前幻灯片索引
   */
  getCurrentIndex(): number {
    return this.adapter.getCurrentIndex();
  }

  /**
   * 获取幻灯片总数
   */
  getTotalSlides(): number {
    return this.adapter.getTotalSlides();
  }

  /**
   * 更新指定幻灯片
   *
   * 仅当适配器支持 updateSlide 方法时可用
   *
   * @param index - 幻灯片索引
   * @param slide - 新的幻灯片定义
   * @throws {SlideRunnerError} 如果适配器不支持更新
   */
  async updateSlide(index: number, slide: SlideDefinition): Promise<void> {
    if (!this.adapter.updateSlide) {
      throw new SlideRunnerError(
        `Adapter "${this.adapter.name}" does not support updateSlide`,
        'UNSUPPORTED_OPERATION'
      );
    }

    if (index < 0 || index >= this.slides.length) {
      throw new SlideRunnerError(
        `Invalid slide index: ${index}. Valid range: 0-${this.slides.length - 1}`,
        'INVALID_INDEX'
      );
    }

    try {
      // 更新内部状态
      this.slides[index] = slide;

      // 调用适配器更新
      await this.adapter.updateSlide(index, slide);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new SlideRunnerError(
        `Failed to update slide: ${errorMessage}`,
        'UPDATE_FAILED'
      );
    }
  }

  /**
   * 刷新当前幻灯片
   *
   * 重新渲染所有幻灯片
   */
  async refresh(): Promise<void> {
    try {
      await this.adapter.render(this.slides);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new SlideRunnerError(
        `Failed to refresh slides: ${errorMessage}`,
        'REFRESH_FAILED'
      );
    }
  }

  /**
   * 销毁 SlideRunner，清理资源
   */
  async destroy(): Promise<void> {
    try {
      await this.adapter.destroy();
      this.slides = [];
      this.currentIndex = 0;
      this.isInitialized = false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new SlideRunnerError(
        `Failed to destroy runner: ${errorMessage}`,
        'DESTROY_FAILED'
      );
    }
  }

  /**
   * 注册事件监听器
   *
   * @param event - 事件类型
   * @param handler - 事件处理器
   */
  on(event: AdapterEvent, handler: EventHandler): void {
    this.adapter.on(event, handler);
  }

  /**
   * 移除事件监听器
   *
   * @param event - 事件类型
   * @param handler - 事件处理器
   */
  off(event: AdapterEvent, handler: EventHandler): void {
    this.adapter.off(event, handler);
  }

  /**
   * 解析容器元素
   *
   * @param container - 容器元素或选择器
   * @returns 解析后的 HTMLElement
   * @throws {SlideRunnerError} 如果容器无效或找不到
   */
  private resolveContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector<HTMLElement>(container);
      if (!element) {
        throw new SlideRunnerError(
          `Container element not found: ${container}`,
          'CONTAINER_NOT_FOUND'
        );
      }
      return element;
    }

    if (!(container instanceof HTMLElement)) {
      throw new SlideRunnerError(
        'Container must be an HTMLElement or a valid selector',
        'INVALID_CONTAINER'
      );
    }

    return container;
  }

  /**
   * 执行插件钩子
   *
   * @param hookName - 钩子名称
   * @param args - 钩子参数
   */
  private async executePluginHook(
    hookName: keyof SlideRunnerPlugin,
    ...args: unknown[]
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin[hookName];
      if (typeof hook === 'function') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (hook as any).apply(plugin, args);
        } catch (error) {
          console.error(
            `Plugin "${plugin.name}" ${String(hookName)} hook failed:`,
            error
          );
          // 插件错误不应阻止流程继续
        }
      }
    }
  }

  /**
   * 设置适配器事件监听
   */
  private setupAdapterEventListeners(): void {
    // 监听 slideChanged 事件，更新内部状态
    this.adapter.on('slideChanged', (data) => {
      if (typeof data === 'object' && data !== null && 'index' in data) {
        this.currentIndex = data.index as number;
      }
    });
  }
}
