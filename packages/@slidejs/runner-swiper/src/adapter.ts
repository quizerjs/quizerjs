/**
 * @slidejs/runner-swiper - SwiperAdapter 适配器实现
 *
 * 将 Slide DSL 渲染为 Swiper 幻灯片
 */

import { Swiper } from 'swiper';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import type { SwiperOptions } from 'swiper';
import type { SlideDefinition } from '@slidejs/core';
import type { SlideAdapter, AdapterEvent, EventHandler } from '@slidejs/runner';
import type { SwiperAdapterOptions } from './types';

// 注册 Swiper 模块
Swiper.use([Navigation, Pagination, Keyboard]);

/**
 * Swiper 适配器
 *
 * 实现 SlideAdapter 接口，将 SlideDefinition 渲染为 Swiper 幻灯片
 */
export class SwiperAdapter implements SlideAdapter {
  readonly name = 'swiper';

  private swiper?: Swiper;
  private swiperContainer?: HTMLElement;
  private swiperWrapper?: HTMLElement;
  private eventHandlers: Map<AdapterEvent, Set<EventHandler>> = new Map();

  /**
   * 初始化 Swiper 适配器
   *
   * @param container - 容器元素
   * @param options - Swiper 选项
   */
  async initialize(container: HTMLElement, options?: SwiperAdapterOptions): Promise<void> {
    try {
      // 创建 Swiper DOM 结构
      this.createSwiperStructure(container);

      // 初始化 Swiper
      if (!this.swiperContainer || !this.swiperWrapper) {
        throw new Error('Swiper container not created');
      }

      const swiperConfig: SwiperOptions = {
        // 默认配置
        direction: 'horizontal',
        loop: false,
        speed: 300,
        spaceBetween: 30,
        slidesPerView: 1,
        // 注册模块
        modules: [Navigation, Pagination, Keyboard],
        // 导航配置
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        // 分页配置
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        // 键盘控制配置
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
        ...options?.swiperConfig,
      };

      this.swiper = new Swiper(this.swiperContainer, swiperConfig);

      // 等待 Swiper 初始化完成
      // Swiper 初始化是同步的，但我们需要等待 DOM 更新
      await new Promise<void>(resolve => {
        // 使用 requestAnimationFrame 确保 DOM 已更新
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
      throw new Error(`Failed to initialize SwiperAdapter: ${errorMessage}`);
    }
  }

  /**
   * 渲染幻灯片
   *
   * @param slides - 幻灯片定义数组
   */
  async render(slides: SlideDefinition[]): Promise<void> {
    if (!this.swiperWrapper || !this.swiper) {
      throw new Error('SwiperAdapter not initialized');
    }

    try {
      // 清空现有幻灯片
      this.swiperWrapper.innerHTML = '';

      // 渲染每张幻灯片
      for (const slide of slides) {
        const slideElement = await this.renderSlide(slide);
        this.swiperWrapper.appendChild(slideElement);
      }

      // 更新 Swiper（重新计算尺寸和更新 slides）
      // 在 Swiper 11 中，update() 会自动重新计算所有内容
      this.swiper.update();

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
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = undefined;
    }

    if (this.swiperContainer) {
      this.swiperContainer.innerHTML = '';
      this.swiperContainer = undefined;
    }

    this.swiperWrapper = undefined;
    this.eventHandlers.clear();
  }

  /**
   * 导航到指定幻灯片
   *
   * @param index - 幻灯片索引
   */
  navigateTo(index: number): void {
    if (!this.swiper) {
      throw new Error('SwiperAdapter not initialized');
    }

    this.swiper.slideTo(index);
  }

  /**
   * 获取当前幻灯片索引
   */
  getCurrentIndex(): number {
    if (!this.swiper) {
      return 0;
    }

    return this.swiper.activeIndex;
  }

  /**
   * 获取幻灯片总数
   */
  getTotalSlides(): number {
    if (!this.swiper) {
      return 0;
    }

    return this.swiper.slides.length;
  }

  /**
   * 更新指定幻灯片
   *
   * @param index - 幻灯片索引
   * @param slide - 新的幻灯片定义
   */
  async updateSlide(index: number, slide: SlideDefinition): Promise<void> {
    if (!this.swiperWrapper || !this.swiper) {
      throw new Error('SwiperAdapter not initialized');
    }

    try {
      // 获取指定索引的 slide 元素
      const slides = this.swiperWrapper.querySelectorAll('.swiper-slide');
      const targetSlide = slides[index];

      if (!targetSlide) {
        throw new Error(`Slide at index ${index} not found`);
      }

      // 渲染新的幻灯片内容
      const newSlide = await this.renderSlide(slide);

      // 替换旧的 slide
      targetSlide.replaceWith(newSlide);

      // 更新 Swiper
      this.swiper.update();
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
   * 创建 Swiper DOM 结构
   *
   * @param container - 容器元素
   */
  private createSwiperStructure(container: HTMLElement): void {
    // 创建 .swiper 容器
    const swiperDiv = document.createElement('div');
    swiperDiv.className = 'swiper';

    // 创建 .swiper-wrapper 容器
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'swiper-wrapper';

    // 创建导航按钮
    const prevButton = document.createElement('div');
    prevButton.className = 'swiper-button-prev';
    const nextButton = document.createElement('div');
    nextButton.className = 'swiper-button-next';

    // 创建分页器
    const pagination = document.createElement('div');
    pagination.className = 'swiper-pagination';

    swiperDiv.appendChild(wrapperDiv);
    swiperDiv.appendChild(prevButton);
    swiperDiv.appendChild(nextButton);
    swiperDiv.appendChild(pagination);
    container.appendChild(swiperDiv);

    this.swiperContainer = swiperDiv;
    this.swiperWrapper = wrapperDiv;
  }

  /**
   * 设置 Swiper 事件监听
   */
  private setupEventListeners(): void {
    if (!this.swiper) {
      return;
    }

    // 监听幻灯片切换事件
    this.swiper.on('slideChange', () => {
      const currentIndex = this.swiper!.activeIndex;
      const previousIndex = this.swiper!.previousIndex;
      this.emit('slideChanged', {
        index: currentIndex,
        previousIndex,
        from: previousIndex,
        to: currentIndex,
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
    const slideElement = document.createElement('div');
    slideElement.className = 'swiper-slide';

    // 设置过渡效果（通过 CSS 类）
    if (slide.behavior?.transition) {
      const transitionClass = this.mapTransition(slide.behavior.transition.type);
      if (transitionClass) {
        slideElement.classList.add(`slide-transition-${transitionClass}`);
      }
    }

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
   * 支持所有 Web Components，包括：
   * - 标准 Web Components（原生 Custom Elements）
   * - wsx 组件（编译为标准 Web Components）
   * - 其他框架的 Web Components（Vue、React、Angular 等）
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
   * 映射 Slide DSL 过渡效果到 Swiper 过渡效果
   *
   * @param transition - Slide DSL 过渡效果
   * @returns Swiper 过渡效果类名（用于 CSS）
   */
  private mapTransition(
    transition?: 'slide' | 'zoom' | 'fade' | 'cube' | 'flip' | 'none'
  ): string | null {
    if (!transition || transition === 'none') {
      return null;
    }

    // Swiper 默认支持 slide，其他效果可以通过 CSS 实现
    // 返回类名以便通过 CSS 应用自定义过渡效果
    return transition;
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
