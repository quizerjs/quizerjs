import EditorJS, { type OutputData } from '@editorjs/editorjs';
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';

/**
 * QuizEditor 选项
 */
export interface QuizEditorOptions {
  /**
   * 编辑器容器元素
   */
  container: HTMLElement;
  /**
   * 初始数据（可选）
   */
  initialData?: OutputData;
}

/**
 * QuizEditor - 测验编辑器
 *
 * 目前仅提供基础的 Editor.js 渲染功能
 */
export class QuizEditor {
  private editor: EditorJS | null = null;
  private container: HTMLElement;
  private initialData?: OutputData;

  constructor(options: QuizEditorOptions) {
    this.container = options.container;
    this.initialData = options.initialData;
  }

  /**
   * 初始化编辑器
   */
  async init(): Promise<void> {
    if (this.editor) {
      throw new Error('QuizEditor 已经初始化');
    }

    this.editor = new EditorJS({
      holder: this.container,
      tools: {
        paragraph: Paragraph,
        header: Header,
      },
      data: this.initialData || {
        blocks: [
          {
            type: 'header',
            data: {
              text: '欢迎使用 Quiz Editor',
              level: 2,
            },
          },
          {
            type: 'paragraph',
            data: {
              text: '开始编写你的测验内容...',
            },
          },
        ],
      },
    });

    await this.editor.isReady;
  }

  /**
   * 获取编辑器实例（仅用于调试）
   */
  getEditorInstance(): EditorJS | null {
    return this.editor;
  }

  /**
   * 保存编辑器数据
   */
  async save(): Promise<OutputData> {
    if (!this.editor) {
      throw new Error('编辑器尚未初始化');
    }
    return await this.editor.save();
  }

  /**
   * 销毁编辑器
   */
  async destroy(): Promise<void> {
    if (this.editor) {
      // Editor.js 没有显式的 destroy 方法，设置为 null 即可
      this.editor = null;
    }
  }
}
