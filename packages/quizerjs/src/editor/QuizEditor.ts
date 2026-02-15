import EditorJS, { type ToolConstructable } from '@editorjs/editorjs';
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import {
  SingleChoiceTool,
  MultipleChoiceTool,
  TextInputTool,
  TrueFalseTool,
} from '@quizerjs/editorjs-tool';
import { dslToBlock, blockToDSL, L10nService } from '@quizerjs/core';
import type { EditorJSOutput, EditorJSBlock, QuizLocalization } from '@quizerjs/core';
import type { QuizDSL } from '@quizerjs/dsl';
import { validateQuizDSL } from '@quizerjs/dsl';

/**
 * 全局编辑器注册表
 * 使用 WeakMap 确保容器被垃圾回收时，注册表条目也会被清理
 * 核心不变量：一个容器最多对应一个 QuizEditor 实例
 */
const editorRegistry = new WeakMap<HTMLElement, QuizEditor>();

/**
 * QuizEditor 选项
 */
export interface QuizEditorOptions {
  /**
   * 编辑器容器元素
   */
  container: HTMLElement;
  /**
   * 初始 DSL 数据（可选）
   */
  initialDSL?: QuizDSL;
  /**
   * 数据变化回调
   */
  onChange?: (dsl: QuizDSL) => void;
  /**
   * 保存回调
   */
  onSave?: (dsl: QuizDSL) => void;
  /**
   * 只读模式
   */
  readOnly?: boolean;
  /**
   * 国际化配置
   */
  localization?: QuizLocalization;
}

/**
 * QuizEditor - 测验编辑器
 *
 * 集成 Editor.js 和 DSL 转换器
 */
export class QuizEditor {
  private editor: EditorJS | null = null;
  private container: HTMLElement;
  private options: QuizEditorOptions;
  private currentDSL: QuizDSL | null = null;
  private isDirtyFlag: boolean = false;
  private isDestroyed: boolean = false;

  constructor(options: QuizEditorOptions) {
    this.container = options.container;
    this.options = options;
    if (options.initialDSL) {
      this.currentDSL = options.initialDSL;
    }
  }

  /**
   * 初始化编辑器
   *
   * 防护层级：
   * 1. 检查当前实例是否已初始化
   * 2. 检查注册表中的旧实例并自动销毁
   * 3. 强制清理容器中的孤立 DOM
   * 4. 注册新实例到全局注册表
   */
  async init(): Promise<void> {
    if (this.isDestroyed) return;

    // 配置全局本地化服务
    if (this.options.localization) {
      L10nService.configure(this.options.localization);
    }

    // === 第 1 层：实例级别检查 ===
    if (this.editor) {
      throw new Error('QuizEditor 已经初始化');
    }

    // === 立即注册当前实例（防止并发初始化竞态） ===
    // 在任何 await 之前注册，确保后续的 init 调用能看到这个正在初始化的实例
    const existingInstance = editorRegistry.get(this.container);
    if (existingInstance && existingInstance !== this) {
      console.warn(
        '[QuizEditor] 检测到容器中的旧实例，自动销毁。' +
          '建议使用 load() 方法而非 key prop 切换内容。'
      );

      try {
        await existingInstance.destroy();
      } catch (error) {
        console.error('[QuizEditor] 销毁旧实例失败:', error);
        // 继续执行，依赖第 3 层清理
      }
    }

    // 注册（覆盖旧的或设置新的）
    editorRegistry.set(this.container, this);

    if (this.isDestroyed) {
      // 如果在等待旧实例销毁期间被销毁了
      editorRegistry.delete(this.container);
      return;
    }

    // === 第 3 层：强制清理孤立的 DOM ===
    await this.forceCleanupDOM();

    if (this.isDestroyed) return;

    const initialData = this.options.initialDSL
      ? dslToBlock(this.options.initialDSL, { localization: this.options.localization })
      : {
          blocks: [
            {
              type: 'header',
              data: {
                text: this.options.localization?.quiz.defaultTitle || '',
                level: 1,
              },
            },
          ],
        };

    this.editor = new EditorJS({
      holder: this.container,
      tools: {
        // 标准 Editor.js 工具
        paragraph: Paragraph,
        header: {
          class: Header as unknown as ToolConstructable, // Editor.js Header 类型定义不完整，使用类型断言绕过
          config: {
            levels: [1, 2, 3, 4], // 支持 H1-H4（H1 用于文档标题，H2-H4 用于章节）
            defaultLevel: 2,
          },
        },
        // Quiz 问题块工具
        'quiz-single-choice': {
          class: SingleChoiceTool,
          inlineToolbar: true, // 启用 inline toolbar，支持格式化问题标题、描述等
        },
        'quiz-multiple-choice': {
          class: MultipleChoiceTool,
          inlineToolbar: true,
        },
        'quiz-text-input': {
          class: TextInputTool,
          inlineToolbar: true,
        },
        'quiz-true-false': {
          class: TrueFalseTool,
          inlineToolbar: true,
        },
      },
      data: initialData,
      readOnly: this.options.readOnly ?? false,
      onChange: debounce(async () => {
        if (this.isDestroyed) return;
        this.isDirtyFlag = true;
        const dsl = await this.save();
        this.options.onChange?.(dsl);
      }, 500),
    });

    try {
      await this.editor.isReady;
    } catch (error) {
      // If isReady fails, we should still check destroyed status
      console.warn('[QuizEditor] EditorJS isReady promise rejected:', error);
    }

    // 如果在等待 isReady 期间被销毁，则立即清理（含 destroy + 清空容器）
    if (this.isDestroyed) {
      if (this.editor && typeof this.editor.destroy === 'function') {
        try {
          await this.editor.destroy();
        } catch (e) {
          console.warn('[QuizEditor] Cleanup of destroyed instance failed:', e);
        }
      }
      this.editor = null;
      if (this.container && typeof this.container.innerHTML !== 'undefined') {
        this.container.innerHTML = '';
      }
      editorRegistry.delete(this.container);
      return;
    }
  }

  /**
   * 加载 DSL 数据
   */
  async load(dsl: QuizDSL): Promise<void> {
    if (!this.editor) {
      throw new Error('编辑器尚未初始化');
    }

    const validation = validateQuizDSL(dsl);
    if (!validation.valid) {
      // 验证现在仅作为警告（Lint 模式），不再阻塞加载
      console.warn(
        '[QuizEditor] DSL Validation Warnings:',
        validation.errors.map(e => e.message).join(', ')
      );
    }

    this.currentDSL = dsl;
    const editorData = dslToBlock(dsl, { localization: this.options.localization });

    try {
      // 检查编辑器是否有内容
      const currentData = await this.editor.save();
      const hasBlocks = currentData.blocks && currentData.blocks.length > 0;

      if (hasBlocks) {
        // 如果有内容，先清空再渲染，避免 render() 时出现 "Can't find a Block to remove" 错误
        await this.editor.clear();
      }
      // 渲染新数据
      await this.editor.render(editorData);
    } catch (error) {
      // 如果出错，尝试直接 render（可能编辑器已经为空）
      // 如果仍然失败，记录错误并重新初始化
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('Editor.js load 警告:', errorMessage);

      try {
        await this.editor.render(editorData);
      } catch (renderError) {
        console.error('Editor.js render 失败，尝试重新初始化:', renderError);
        // 重新初始化编辑器作为最后手段
        await this.reinitializeEditor(editorData);
      }
    }

    this.isDirtyFlag = false;
  }

  /**
   * 保存为 DSL
   */
  async save(): Promise<QuizDSL> {
    if (!this.editor) {
      throw new Error('编辑器尚未初始化');
    }

    const editorData = await this.editor.save();

    // Async Guard: save() is async, check destroyed status again
    if (this.isDestroyed) {
      throw new Error('Editor instance destroyed during save');
    }

    // 类型转换：Editor.js 的 OutputData 转换为 EditorJSOutput
    const editorJSOutput: EditorJSOutput = {
      blocks: editorData.blocks as EditorJSBlock[],
      time: editorData.time,
      version: editorData.version,
    };
    const dsl = blockToDSL(editorJSOutput, { localization: this.options.localization });

    this.currentDSL = dsl;
    this.isDirtyFlag = false;
    this.options.onSave?.(dsl);

    return dsl;
  }

  /**
   * 清空编辑器
   */
  async clear(): Promise<void> {
    if (!this.editor) {
      throw new Error('编辑器尚未初始化');
    }
    await this.editor.clear();
    this.currentDSL = {
      version: '1.0.0',
      quiz: {
        id: `quiz-${Date.now()}`,
        title: '',
        sections: [],
      },
    };
    this.isDirtyFlag = false;
  }

  /**
   * 获取编辑器实例（仅用于调试）
   */
  getEditorInstance(): EditorJS | null {
    return this.editor;
  }

  /**
   * 是否已修改
   */
  get isDirty(): boolean {
    return this.isDirtyFlag;
  }

  /**
   * 销毁编辑器
   *
   * 行为（对齐 Editor.js 文档 https://editorjs.io/destroyer/）：
   * 1. 调用 editor.destroy() 移除 UI、解绑监听、释放资源
   * 2. 显式清空 holder 容器，确保同一容器可安全重新初始化（Strict Mode 二次挂载或路由复用时无残留 DOM）
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return; // 防止重复销毁
    }

    this.isDestroyed = true;

    try {
      if (this.editor) {
        await this.editor.destroy();
      }
    } catch (error) {
      console.warn('[QuizEditor] destroy 失败:', error);
    } finally {
      this.editor = null;

      // 显式清空 holder：Editor.js destroy() 会移除其 UI，但文档建议若需在同一元素上重新初始化则手动清空容器
      if (this.container && typeof this.container.innerHTML !== 'undefined') {
        this.container.innerHTML = '';
      }

      // 从注册表移除（仅当是当前注册的实例时）
      if (editorRegistry.get(this.container) === this) {
        editorRegistry.delete(this.container);
      }
    }
  }

  /**
   * 强制清理容器中的孤立 DOM
   * 用于清理异步销毁未完成时残留的编辑器 DOM
   */
  private async forceCleanupDOM(): Promise<void> {
    const existingEditors = this.container.querySelectorAll('.codex-editor');
    if (existingEditors.length > 0) {
      console.warn(`[QuizEditor] 发现 ${existingEditors.length} 个孤立的编辑器 DOM，强制移除`);
      existingEditors.forEach(el => el.remove());

      // 等待 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  /**
   * 重新初始化编辑器（用于错误恢复）
   */
  private async reinitializeEditor(editorData: EditorJSOutput): Promise<void> {
    const container = this.container;
    const readOnly = this.options.readOnly ?? false;

    // 销毁旧编辑器并清空 holder，便于在同一容器上重新创建
    if (this.editor) {
      try {
        await this.editor.destroy();
      } catch {
        // 忽略销毁错误
      }
      this.editor = null;
      if (container && typeof container.innerHTML !== 'undefined') {
        container.innerHTML = '';
      }
    }

    // 创建新编辑器
    this.editor = new EditorJS({
      holder: container,
      tools: {
        paragraph: Paragraph,
        header: {
          class: Header as unknown as ToolConstructable,
          config: {
            levels: [1, 2, 3, 4],
            defaultLevel: 2,
          },
        },
        'quiz-single-choice': {
          class: SingleChoiceTool,
          inlineToolbar: true,
        },
        'quiz-multiple-choice': {
          class: MultipleChoiceTool,
          inlineToolbar: true,
        },
        'quiz-text-input': {
          class: TextInputTool,
          inlineToolbar: true,
        },
        'quiz-true-false': {
          class: TrueFalseTool,
          inlineToolbar: true,
        },
      },
      data: editorData,
      readOnly,
      onChange: async () => {
        this.isDirtyFlag = true;
        const savedDSL = await this.save();
        this.options.onChange?.(savedDSL);
      },
    });

    await this.editor.isReady;
  }

  /**
   * 设置只读状态 (Safe API)
   * 封装了内部属性访问，提供更安全的接口
   */
  public async setReadOnly(state: boolean): Promise<void> {
    if (!this.editor || this.isDestroyed) return;
    try {
      this.editor.readOnly.toggle(state);
    } catch (error) {
      console.warn('[QuizEditor] setReadOnly failed:', error);
    }
  }
}

/**
 * 简单的防抖工具函数
 */
function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  } as T;
}
