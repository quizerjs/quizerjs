import EditorJS, { type ToolConstructable } from '@editorjs/editorjs';
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import {
  SingleChoiceTool,
  MultipleChoiceTool,
  TextInputTool,
  TrueFalseTool,
} from '@quizerjs/editorjs-tool';
import { dslToBlock, blockToDSL } from '@quizerjs/core';
import type { EditorJSOutput, EditorJSBlock } from '@quizerjs/core';
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

    // === 第 1 层：实例级别检查 ===
    if (this.editor) {
      throw new Error('QuizEditor 已经初始化');
    }

    // === 第 2 层：注册表检查 + 自动销毁旧实例 ===
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

    if (this.isDestroyed) return;

    // === 第 3 层：强制清理孤立的 DOM ===
    await this.forceCleanupDOM();

    if (this.isDestroyed) return;

    // === 第 4 层：注册当前实例 ===
    editorRegistry.set(this.container, this);

    const initialData = this.options.initialDSL
      ? dslToBlock(this.options.initialDSL)
      : {
          blocks: [
            {
              type: 'header',
              data: {
                text: '欢迎使用 Quiz Editor',
                level: 1,
              },
            },
            {
              type: 'paragraph',
              data: {
                text: '开始编写你的测验内容...',
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
      onChange: async () => {
        if (this.isDestroyed) return;
        this.isDirtyFlag = true;
        const dsl = await this.save();
        this.options.onChange?.(dsl);
      },
    });

    try {
      await this.editor.isReady;
    } catch (error) {
      // If isReady fails, we should still check destroyed status
      console.warn('[QuizEditor] EditorJS isReady promise rejected:', error);
    }

    //如果在等待 isReady 期间被销毁，则立即清理
    if (this.isDestroyed) {
      if (this.editor && typeof this.editor.destroy === 'function') {
        try {
          // editor.destroy is async but we are in a "destroyed" state context
          // so we just trigger it.
          this.editor.destroy();
        } catch (e) {
          console.warn('[QuizEditor] Cleanup of destroyed instance failed:', e);
        }
      }
      this.editor = null;
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
      throw new Error(`Invalid DSL: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    this.currentDSL = dsl;
    const editorData = dslToBlock(dsl);

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
    // 类型转换：Editor.js 的 OutputData 转换为 EditorJSOutput
    const editorJSOutput: EditorJSOutput = {
      blocks: editorData.blocks as EditorJSBlock[],
      time: editorData.time,
      version: editorData.version,
    };
    const dsl = blockToDSL(editorJSOutput);

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
        title: '未命名测验',
        sections: [
          {
            id: `section-${Date.now()}`,
            title: '默认章节',
            questions: [],
          },
        ],
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
      // 确保清理
      this.editor = null;

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

    // 销毁旧编辑器
    if (this.editor) {
      try {
        await this.editor.destroy();
      } catch {
        // 忽略销毁错误
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
}
