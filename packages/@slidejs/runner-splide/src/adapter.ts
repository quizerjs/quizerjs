/**
 * @slidejs/runner-splide - SplideAdapter 适配器实现
 *
 * 将 Slide DSL 渲染为 Splide 幻灯片
 */

import { Splide } from '@splidejs/splide';
import type { Options } from '@splidejs/splide';
import type { SlideDefinition } from '@slidejs/core';
import type { SlideAdapter, AdapterEvent, EventHandler } from '@slidejs/runner';
import type { SplideAdapterOptions } from './types';

/**
 * Splide 适配器
 *
 * 实现 SlideAdapter 接口，将 SlideDefinition 渲染为 Splide 幻灯片
 */
export class SplideAdapter implements SlideAdapter {
  readonly name = 'splide';

  private splide?: Splide;
  private splideContainer?: HTMLElement;
  private splideTrack?: HTMLElement;
  private splideList?: HTMLElement;
  private eventHandlers: Map<AdapterEvent, Set<EventHandler>> = new Map();

  /**
   * 初始化 Splide 适配器
   *
   * @param container - 容器元素
   * @param options - Splide 选项
   */
  async initialize(container: HTMLElement, options?: SplideAdapterOptions): Promise<void> {
    try {
      // 创建 Splide DOM 结构
      this.createSplideStructure(container);

      // 初始化 Splide
      if (!this.splideContainer) {
        throw new Error('Splide container not created');
      }

      const splideConfig: Options = {
        // 默认配置
        type: 'slide',
        perPage: 1,
        perMove: 1,
        gap: '1rem',
        pagination: true,
        arrows: true,
        keyboard: 'global',
        ...options?.splideConfig,
      };

      this.splide = new Splide(this.splideContainer, splideConfig);
      this.splide.mount();

      // 等待初始化完成
      await new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          resolve();
        });
      });

      // 设置事件监听
      this.setupEventListeners();

      // 触发 ready 事件
      this.emit('ready');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emit('error', { message: errorMessage });
      throw new Error(`Failed to initialize SplideAdapter: ${errorMessage}`);
    }
  }

  /**
   * 渲染幻灯片
   *
   * @param slides - 幻灯片定义数组
   */
  async render(slides: SlideDefinition[]): Promise<void> {
    if (!this.splideList || !this.splide) {
      throw new Error('SplideAdapter not initialized');
    }

    try {
      // 清空现有幻灯片
      this.splideList.innerHTML = '';

      // 渲染每张幻灯片
      for (const slide of slides) {
        const slideElement = await this.renderSlide(slide);
        this.splideList.appendChild(slideElement);
      }

      // 刷新 Splide（重新计算和更新）
      this.splide.refresh();

      // 触发 slideRendered 事件
      this.emit('slideRendered', { totalSlides: slides.length });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emit('error', { message: errorMessage });
      throw new Error(`Failed to render slides: ${errorMessage}`);
    }
  }

  /**
   * 销毁适配器
   */
  async destroy(): Promise<void> {
    if (this.splide) {
      this.splide.destroy();
      this.splide = undefined;
    }

    if (this.splideContainer) {
      this.splideContainer.innerHTML = '';
      this.splideContainer = undefined;
    }

    this.splideTrack = undefined;
    this.splideList = undefined;
    this.eventHandlers.clear();
  }

  /**
   * 导航到指定幻灯片
   *
   * @param index - 幻灯片索引
   */
  navigateTo(index: number): void {
    if (!this.splide) {
      throw new Error('SplideAdapter not initialized');
    }

    this.splide.go(index);
  }

  /**
   * 获取当前幻灯片索引
   */
  getCurrentIndex(): number {
    if (!this.splide) {
      return 0;
    }

    return this.splide.index;
  }

  /**
   * 获取幻灯片总数
   */
  getTotalSlides(): number {
    if (!this.splide) {
      return 0;
    }

    return this.splide.length;
  }

  /**
   * 更新指定幻灯片
   *
   * @param index - 幻灯片索引
   * @param slide - 新的幻灯片定义
   */
  async updateSlide(index: number, slide: SlideDefinition): Promise<void> {
    if (!this.splideList || !this.splide) {
      throw new Error('SplideAdapter not initialized');
    }

    try {
      // 获取指定索引的 slide 元素
      const slides = this.splideList.querySelectorAll('.splide__slide');
      const targetSlide = slides[index] as HTMLElement;

      if (!targetSlide) {
        throw new Error(`Slide at index ${index} not found`);
      }

      // 渲染新的幻灯片内容
      const newSlide = await this.renderSlide(slide);

      // 替换旧的 slide
      targetSlide.replaceWith(newSlide);

      // 刷新 Splide
      this.splide.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emit('error', { message: errorMessage });
      throw new Error(`Failed to update slide: ${errorMessage}`);
    }
  }

  /**
   * 注册事件监听器
   *
   * @param event - 事件类型
   * @param handler - 事件处理器
   */
  on(event: AdapterEvent, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * 移除事件监听器
   *
   * @param event - 事件类型
   * @param handler - 事件处理器
   */
  off(event: AdapterEvent, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 创建 Splide DOM 结构
   *
   * @param container - 容器元素
   */
  private createSplideStructure(container: HTMLElement): void {
    // 创建 .splide 容器
    const splideDiv = document.createElement('div');
    splideDiv.className = 'splide';

    // 创建 .splide__track 容器
    const trackDiv = document.createElement('div');
    trackDiv.className = 'splide__track';

    // 创建 .splide__list 容器
    const listUl = document.createElement('ul');
    listUl.className = 'splide__list';

    trackDiv.appendChild(listUl);
    splideDiv.appendChild(trackDiv);
    container.appendChild(splideDiv);

    this.splideContainer = splideDiv;
    this.splideTrack = trackDiv;
    this.splideList = listUl;
  }

  /**
   * 设置 Splide 事件监听
   */
  private setupEventListeners(): void {
    if (!this.splide) {
      return;
    }

    // 监听幻灯片切换事件
    this.splide.on('moved', (newIndex, prevIndex) => {
      this.emit('slideChanged', {
        index: newIndex,
        previousIndex: prevIndex,
        from: prevIndex,
        to: newIndex,
      });
    });
  }

  /**
   * 渲染单张幻灯片
   *
   * @param slide - 幻灯片定义
   * @returns slide 元素
   */
  private async renderSlide(slide: SlideDefinition): Promise<HTMLElement> {
    const slideElement = document.createElement('li');
    slideElement.className = 'splide__slide';

    // 渲染内容
    if (slide.content.type === 'dynamic') {
      // 动态内容（Web Components）
      const content = await this.renderDynamicContent(slide.content.component, slide.content.props);
      slideElement.appendChild(content);
    } else {
      // 静态文本内容
      const content = this.renderTextContent(slide.content.lines);
      slideElement.appendChild(content);
    }

    return slideElement;
  }

  /**
   * 渲染动态内容（Web Component）
   *
   * @param component - 组件名称
   * @param props - 组件属性
   * @returns 组件元素
   */
  private async renderDynamicContent(
    component: string,
    props: Record<string, unknown>
  ): Promise<HTMLElement> {
    // 创建 Web Component 元素
    const element = document.createElement(component);

    // 设置属性
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string' || typeof value === 'number') {
        // 字符串和数字 → HTML attributes
        element.setAttribute(key, String(value));
      } else if (typeof value === 'boolean') {
        // 布尔值 → HTML attributes（true 时设置空属性）
        if (value) {
          element.setAttribute(key, '');
        }
      } else {
        // 对象和数组 → JavaScript properties
        (element as Record<string, unknown>)[key] = value;
      }
    }

    return element;
  }

  /**
   * 渲染文本内容
   *
   * 支持以下格式：
   * - # 标题 -> h1
   * - ## 标题 -> h2
   * - ### 标题 -> h3
   * - ![alt](url) -> img
   * - - 列表项 -> ul/li
   * - 普通文本 -> p
   *
   * @param lines - 文本行数组
   * @returns 内容容器元素
   */
  private renderTextContent(lines: string[]): HTMLElement {
    const container = document.createElement('div');
    container.className = 'slide-content';

    let listContainer: HTMLUListElement | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // 空行，结束列表
      if (!trimmedLine) {
        listContainer = null;
        continue;
      }

      // 标题 - # H1
      if (trimmedLine.startsWith('# ')) {
        listContainer = null;
        const h1 = document.createElement('h1');
        h1.textContent = trimmedLine.substring(2);
        container.appendChild(h1);
        continue;
      }

      // 标题 - ## H2
      if (trimmedLine.startsWith('## ')) {
        listContainer = null;
        const h2 = document.createElement('h2');
        h2.textContent = trimmedLine.substring(3);
        container.appendChild(h2);
        continue;
      }

      // 标题 - ### H3
      if (trimmedLine.startsWith('### ')) {
        listContainer = null;
        const h3 = document.createElement('h3');
        h3.textContent = trimmedLine.substring(4);
        container.appendChild(h3);
        continue;
      }

      // 图片 - ![alt](url)
      const imageMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imageMatch) {
        listContainer = null;
        const img = document.createElement('img');
        img.alt = imageMatch[1];
        img.src = imageMatch[2];
        img.style.maxWidth = '80%';
        img.style.maxHeight = '500px';
        container.appendChild(img);
        continue;
      }

      // 列表项 - - 项目
      if (trimmedLine.startsWith('- ')) {
        if (!listContainer) {
          listContainer = document.createElement('ul');
          container.appendChild(listContainer);
        }
        const li = document.createElement('li');
        li.textContent = trimmedLine.substring(2);
        listContainer.appendChild(li);
        continue;
      }

      // 普通文本
      listContainer = null;
      const p = document.createElement('p');
      p.textContent = trimmedLine;
      container.appendChild(p);
    }

    return container;
  }

  /**
   * 触发事件
   *
   * @param event - 事件类型
   * @param data - 事件数据
   */
  private emit(event: AdapterEvent, data?: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      }
    }
  }
}
