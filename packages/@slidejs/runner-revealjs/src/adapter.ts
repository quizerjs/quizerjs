/**
 * @slidejs/runner-revealjs - RevealJsAdapter 适配器实现
 *
 * 将 Slide DSL 渲染为 reveal.js 演示文稿
 */

import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import type { SlideDefinition } from '@slidejs/core';
import type { SlideAdapter, AdapterEvent, EventHandler } from '@slidejs/runner';
import type { RevealJsOptions } from './types';

/**
 * reveal.js 适配器
 *
 * 实现 SlideAdapter 接口，将 SlideDefinition 渲染为 reveal.js 幻灯片
 */
export class RevealJsAdapter implements SlideAdapter {
  readonly name = 'revealjs';

  private reveal?: Reveal.Api;
  private revealContainer?: HTMLElement;
  private slidesContainer?: HTMLElement;
  private eventHandlers: Map<AdapterEvent, Set<EventHandler>> = new Map();

  /**
   * 初始化 reveal.js 适配器
   *
   * @param container - 容器元素
   * @param options - reveal.js 选项
   */
  async initialize(container: HTMLElement, options?: RevealJsOptions): Promise<void> {
    try {
      // 创建 reveal.js DOM 结构
      this.createRevealStructure(container);

      // 初始化 reveal.js
      if (!this.revealContainer) {
        throw new Error('Reveal container not created');
      }

      this.reveal = new Reveal(this.revealContainer, {
        // 默认配置
        controls: true,
        progress: true,
        center: true,
        hash: false,
        transition: 'slide',
        ...options?.revealConfig,
      });

      await this.reveal.initialize();

      // 设置事件监听
      this.setupEventListeners();

      // 触发 ready 事件
      this.emit('ready');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emit('error', { message: errorMessage });
      throw new Error(`Failed to initialize RevealJsAdapter: ${errorMessage}`);
    }
  }

  /**
   * 渲染幻灯片
   *
   * @param slides - 幻灯片定义数组
   */
  async render(slides: SlideDefinition[]): Promise<void> {
    if (!this.slidesContainer || !this.reveal) {
      throw new Error('RevealJsAdapter not initialized');
    }

    try {
      // 清空现有幻灯片
      this.slidesContainer.innerHTML = '';

      // 渲染每张幻灯片
      for (const slide of slides) {
        const section = await this.renderSlide(slide);
        this.slidesContainer.appendChild(section);
      }

      // 同步 reveal.js
      this.reveal.sync();

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
    if (this.reveal) {
      this.reveal.destroy();
      this.reveal = undefined;
    }

    if (this.revealContainer) {
      this.revealContainer.innerHTML = '';
      this.revealContainer = undefined;
    }

    this.slidesContainer = undefined;
    this.eventHandlers.clear();
  }

  /**
   * 导航到指定幻灯片
   *
   * @param index - 幻灯片索引
   */
  navigateTo(index: number): void {
    if (!this.reveal) {
      throw new Error('RevealJsAdapter not initialized');
    }

    // reveal.js 的 slide 方法需要 (indexh, indexv) 两个参数
    // 对于单层幻灯片，indexv 为 0
    this.reveal.slide(index, 0);
  }

  /**
   * 获取当前幻灯片索引
   */
  getCurrentIndex(): number {
    if (!this.reveal) {
      return 0;
    }

    const indices = this.reveal.getIndices();
    return indices.h;
  }

  /**
   * 获取幻灯片总数
   */
  getTotalSlides(): number {
    if (!this.reveal) {
      return 0;
    }

    return this.reveal.getTotalSlides();
  }

  /**
   * 更新指定幻灯片
   *
   * @param index - 幻灯片索引
   * @param slide - 新的幻灯片定义
   */
  async updateSlide(index: number, slide: SlideDefinition): Promise<void> {
    if (!this.slidesContainer || !this.reveal) {
      throw new Error('RevealJsAdapter not initialized');
    }

    try {
      // 获取指定索引的 section 元素
      const sections = this.slidesContainer.querySelectorAll('section');
      const targetSection = sections[index];

      if (!targetSection) {
        throw new Error(`Slide at index ${index} not found`);
      }

      // 渲染新的幻灯片内容
      const newSection = await this.renderSlide(slide);

      // 替换旧的 section
      targetSection.replaceWith(newSection);

      // 同步 reveal.js
      this.reveal.sync();
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
   * 创建 reveal.js DOM 结构
   *
   * @param container - 容器元素
   */
  private createRevealStructure(container: HTMLElement): void {
    // 创建 .reveal 容器
    const revealDiv = document.createElement('div');
    revealDiv.className = 'reveal';

    // 创建 .slides 容器
    const slidesDiv = document.createElement('div');
    slidesDiv.className = 'slides';

    revealDiv.appendChild(slidesDiv);
    container.appendChild(revealDiv);

    this.revealContainer = revealDiv;
    this.slidesContainer = slidesDiv;
  }

  /**
   * 设置 reveal.js 事件监听
   */
  private setupEventListeners(): void {
    if (!this.reveal) {
      return;
    }

    // 监听幻灯片切换事件
    this.reveal.on('slidechanged', (event: unknown) => {
      const revealEvent = event as { indexh: number; previousSlide?: HTMLElement };
      this.emit('slideChanged', {
        index: revealEvent.indexh,
        previousIndex: revealEvent.previousSlide?.dataset.index,
      });
    });

    // 监听 ready 事件
    this.reveal.on('ready', () => {
      this.emit('ready');
    });
  }

  /**
   * 渲染单张幻灯片
   *
   * @param slide - 幻灯片定义
   * @returns section 元素
   */
  private async renderSlide(slide: SlideDefinition): Promise<HTMLElement> {
    const section = document.createElement('section');

    // 设置过渡效果
    if (slide.behavior?.transition) {
      const transition = this.mapTransition(slide.behavior.transition.type);
      section.setAttribute('data-transition', transition);
    }

    // 渲染内容
    if (slide.content.type === 'dynamic') {
      // 动态内容（Web Components）
      const content = this.renderDynamicContent(slide.content.component, slide.content.props);
      section.appendChild(content);
    } else {
      // 静态文本内容
      const content = this.renderTextContent(slide.content.lines);
      section.appendChild(content);
    }

    return section;
  }

  /**
   * 渲染动态内容（Web Components）
   *
   * @param component - 组件名称
   * @param props - 组件属性
   * @returns 组件元素
   */
  private renderDynamicContent(component: string, props: Record<string, unknown>): HTMLElement {
    const element = document.createElement(component);

    // 设置属性
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string' || typeof value === 'number') {
        element.setAttribute(key, String(value));
      } else if (typeof value === 'boolean') {
        if (value) {
          element.setAttribute(key, '');
        }
      } else {
        // 对于对象和数组，设置为属性而不是 attribute
        (element as unknown as Record<string, unknown>)[key] = value;
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
   * 映射 Slide DSL 过渡效果到 reveal.js 过渡效果
   *
   * @param transition - Slide DSL 过渡效果
   * @returns reveal.js 过渡效果
   */
  private mapTransition(transition?: 'slide' | 'zoom' | 'fade' | 'cube' | 'flip' | 'none'): string {
    if (!transition) {
      return 'slide';
    }

    // 映射特殊过渡效果
    const transitionMap: Record<string, string> = {
      cube: 'convex',
      flip: 'concave',
    };

    return transitionMap[transition] || transition;
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
