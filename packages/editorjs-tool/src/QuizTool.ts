/**
 * Editor.js Quiz Tool
 * 实现 Editor.js Tool 接口，集成 quizerjs 组件
 */

import { BlockTool, BlockToolData, ToolConfig } from '@editorjs/editorjs';
import { QuizData, QuizResult, UserAnswer } from '@quizerjs/core';
import { QuizBlock } from '@quizerjs/core';
import { QuizToolConfig, defaultConfig } from './config';

// Editor.js 数据格式接口
export interface QuizToolData extends BlockToolData {
  quizData: QuizData; // 测验数据
  result?: QuizResult; // 测验结果（可选）
}

/**
 * Quiz Tool 类
 * 实现 Editor.js Tool 接口
 */
export class QuizTool implements BlockTool {
  private wrapper: HTMLElement | null = null;
  private config: QuizToolConfig;
  private data: QuizToolData;
  private quizBlock: QuizBlock | null = null;

  /**
   * 构造函数
   * @param data - 工具数据
   * @param config - 工具配置
   * @param api - Editor.js API（可选）
   */
  constructor({
    data,
    config,
  }: {
    data?: QuizToolData;
    config?: ToolConfig<QuizToolConfig>;
    api?: any;
  }) {
    // 合并配置
    this.config = { ...defaultConfig, ...config };
    // 初始化数据
    this.data = data || {
      quizData: {
        id: this.generateId(),
        title: this.config.defaultData?.title || '新测验',
        description: this.config.defaultData?.description || '',
        questions: this.config.defaultData?.questions || [],
        settings: {
          ...defaultConfig.defaultSettings,
          ...this.config.defaultSettings,
        },
      },
    };
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 渲染工具 UI
   * @returns HTML 元素
   */
  render(): HTMLElement {
    // 创建容器
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('quiz-tool-wrapper');

    // 创建测验块组件
    // 注意：这里需要将 wsx 组件挂载到 DOM
    // 由于 wsx 组件是 Web Component，我们需要创建自定义元素
    const quizElement = document.createElement('quiz-block');
    quizElement.setAttribute('data-quiz-id', this.data.quizData.id);

    // 设置属性（通过 data 属性传递数据）
    quizElement.setAttribute('data-quiz-data', JSON.stringify(this.data.quizData));
    if (this.data.result) {
      quizElement.setAttribute('data-result', JSON.stringify(this.data.result));
    }
    if (this.config.readOnly) {
      quizElement.setAttribute('data-read-only', 'true');
    }

    // 监听自定义事件
    quizElement.addEventListener('quiz-submit', ((e: CustomEvent) => {
      if (this.config.onSubmit) {
        this.config.onSubmit(this.data.quizData);
      }
    }) as EventListener);

    quizElement.addEventListener('quiz-answer-change', ((e: CustomEvent) => {
      if (this.config.onAnswerChange) {
        this.config.onAnswerChange(e.detail.questionId, e.detail.answer);
      }
    }) as EventListener);

    this.wrapper.appendChild(quizElement);

    // 初始化 wsx 组件
    // 注意：实际使用时需要确保 wsx 组件已注册
    // 这里假设 QuizBlock 已经通过 @autoRegister() 注册
    // 如果需要在运行时动态创建，可能需要使用不同的方式

    return this.wrapper;
  }

  /**
   * 保存工具数据
   * @returns 工具数据
   */
  save(): QuizToolData {
    // 从组件中获取最新数据
    // 注意：实际实现中需要从 QuizBlock 组件获取当前状态
    // 这里返回当前保存的数据
    return {
      ...this.data,
    };
  }

  /**
   * 验证工具数据
   * @param data - 要验证的数据
   * @returns 验证结果
   */
  static validate(data: QuizToolData): boolean {
    // 验证测验数据
    if (!data.quizData) {
      return false;
    }

    if (!data.quizData.id || !data.quizData.title) {
      return false;
    }

    if (!Array.isArray(data.quizData.questions)) {
      return false;
    }

    // 验证每个问题
    for (const question of data.quizData.questions) {
      if (!question.id || !question.text || !question.type) {
        return false;
      }

      // 选择题必须有选项
      if (
        (question.type === 'single_choice' || question.type === 'multiple_choice') &&
        (!question.options || question.options.length === 0)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * 清理工具
   */
  destroy(): void {
    if (this.wrapper) {
      this.wrapper.innerHTML = '';
      this.wrapper = null;
    }
    this.quizBlock = null;
  }

  /**
   * 获取工具配置
   */
  static get toolbox() {
    return {
      title: '测验',
      icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L3 7V18H17V7L10 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 12V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="15" r="1" fill="currentColor"/></svg>',
    };
  }

  /**
   * 获取工具配置面板
   */
  static get sanitize() {
    return {
      quizData: {
        id: {},
        title: {},
        description: {},
        questions: {
          id: {},
          type: {},
          text: {},
          options: {
            id: {},
            text: {},
            isCorrect: {},
          },
          correctAnswer: {},
          explanation: {},
          points: {},
        },
        settings: {
          allowRetry: {},
          showResults: {},
          timeLimit: {},
          randomizeQuestions: {},
          randomizeOptions: {},
        },
      },
      result: {},
    };
  }
}
