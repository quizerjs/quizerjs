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

  constructor(options: QuizEditorOptions) {
    this.container = options.container;
    this.options = options;
    if (options.initialDSL) {
      this.currentDSL = options.initialDSL;
    }
  }

  /**
   * 初始化编辑器
   */
  async init(): Promise<void> {
    if (this.editor) {
      throw new Error('QuizEditor 已经初始化');
    }

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
        this.isDirtyFlag = true;
        const dsl = await this.save();
        this.options.onChange?.(dsl);
      },
    });

    await this.editor.isReady;
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
    await this.editor.render(editorData);
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
    if (this.editor) {
      await this.editor.destroy();
      this.editor = null;
    }
  }
}
