/**
 * QuizPlayer - 基于 Slide 的测验播放器
 * 使用 Slide DSL 和 Swiper 渲染交互式幻灯片
 */

import type { QuizDSL, Question } from '@quizerjs/dsl';
import { checkAnswer } from '@quizerjs/core';
import type { Question as CoreQuestion } from '@quizerjs/core';
import { createSlideRunner } from '@slidejs/runner-revealjs';
import { setPlayerTheme } from '@quizerjs/theme';
import type {
  QuizPlayerOptions,
  ResultDSL,
  QuestionResult,
  AnswerValue,
  ThemeName,
  ThemeConfig,
} from './types.js';
import { getDefaultSlideDSL } from './defaultSlideDSL.js';

// @slidejs/runner-swiper 已静态导入（必需依赖）
type SlideContext = {
  sourceType: string;
  sourceId: string;
  items: unknown[];
  custom?: Record<string, unknown>;
  // 对于 quiz 类型的演示，quiz 对象应该直接在顶层可访问
  quiz?: {
    id: string;
    title: string;
    description?: string;
    questions: unknown[];
  };
};

type SlideRunner = {
  play(): void;
  next(): void;
  prev(): void;
  goTo(index: number): void;
  destroy(): void;
  [key: string]: unknown;
};

/**
 * QuizPlayer 类
 * 基于 Slide DSL 的测验播放器
 */
export class QuizPlayer {
  private runner: SlideRunner | null = null;
  private answers: Record<string, AnswerValue> = {};
  private startTime: number = Date.now();
  private quizDSL: QuizDSL;
  private options: QuizPlayerOptions;
  private containerElement: HTMLElement | null = null;
  private answerChangeListener: ((event: Event) => void) | null = null;

  constructor(options: QuizPlayerOptions) {
    this.options = options;
    this.quizDSL = options.quizDSL;

    // 状态恢复优先级：resultDSL > initialAnswers
    // resultDSL 包含完整的恢复信息（包括时间等），优先级更高
    if (options.resultDSL) {
      this.restoreFromResultDSL(options.resultDSL);
      // 如果同时提供了 initialAnswers，使用 initialAnswers 覆盖（允许部分恢复）
      if (options.initialAnswers) {
        this.answers = { ...this.answers, ...options.initialAnswers };
      }
    } else if (options.initialAnswers) {
      this.answers = { ...options.initialAnswers };
    }
  }

  /**
   * 初始化播放器
   */
  async init(): Promise<void> {
    const { container, quizDSL, slideDSL, slideOptions } = this.options;

    // 验证 quizDSL 是否存在且格式正确
    if (!quizDSL) {
      throw new Error('QuizDSL is required but not provided');
    }
    if (!quizDSL.quiz) {
      throw new Error('QuizDSL.quiz is required but not provided');
    }
    if (!quizDSL.quiz.id) {
      throw new Error('QuizDSL.quiz.id is required but not provided');
    }

    // 如果没有提供 slideDSL，使用默认的 quiz.slide 文件
    const finalSlideDSL = slideDSL || getDefaultSlideDSL();

    // 获取容器元素
    this.containerElement =
      typeof container === 'string'
        ? (document.querySelector(container) as HTMLElement)
        : container;

    if (!this.containerElement) {
      throw new Error('Container element not found');
    }

    // 使用 @slidejs/runner-swiper 创建并运行幻灯片（已静态导入）
    try {
      // 1. 创建 SlideContext，将 Quiz DSL 作为数据源
      // 对于 quiz 类型，quiz 对象应该在顶层可访问（Slide DSL 模板中可以直接使用 quiz.title 等）
      const context: SlideContext = {
        sourceType: 'quiz',
        sourceId: quizDSL.quiz.id,
        items: this.transformQuizDSLToContextItems(quizDSL),
        quiz: {
          id: quizDSL.quiz.id,
          title: quizDSL.quiz.title,
          description: quizDSL.quiz.description,
          questions: this.getAllQuestions(),
        },
      };

      // 2. 使用 @slidejs/runner-revealjs 创建并运行幻灯片
      this.runner = (await createSlideRunner(
        finalSlideDSL,
        {
          ...context,
          items: context.items as unknown[],
          metadata: {
            title: quizDSL.quiz.title || 'Quiz',
            createdAt: new Date().toISOString(),
          },
        } as unknown as Parameters<typeof createSlideRunner>[1],
        {
          container: this.containerElement,
          revealOptions: {
            hash: true,
            controls: true,
            progress: true,
            center: true,
            transition: 'slide',
            keyboard: true,
            touch: true,
            ...slideOptions,
          },
        }
      )) as unknown as SlideRunner;

      // 3. 启动演示（导航到第一张幻灯片）
      this.runner.play();

      // 4. 设置答案监听器
      this.setupAnswerListeners();

      // 5. 应用主题（默认使用 solarized-dark）
      const theme = this.options.theme || 'solarized-dark';
      this.setTheme(theme);

      this.startTime = Date.now();
    } catch (error) {
      // 提供更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to initialize QuizPlayer: ${errorMessage}. Please check your configuration and ensure all required dependencies are installed.`
      );
    }
  }

  /**
   * 设置主题
   *
   * 此方法使用 @slidejs/theme 库来设置 CSS 变量（CSS hook API）。
   * @slidejs/theme.setTheme() 会在 :root 上设置 CSS 变量，影响整个 Slide 播放器的样式。
   *
   * 支持两种方式：
   * 1. 预设主题名称（字符串）：使用内置预设主题配置
   * 2. 自定义主题配置对象：完全自定义或部分覆盖预设主题
   *
   * @param theme 主题名称或主题配置对象
   *
   * @example
   * // 使用预设主题
   * player.setTheme('solarized-dark');
   *
   * @example
   * // 使用自定义主题配置
   * player.setTheme({
   *   backgroundColor: '#002b36',
   *   textColor: '#839496',
   *   linkColor: '#268bd2'
   * });
   */
  setTheme(theme: ThemeName | ThemeConfig): void {
    // 调用 @quizerjs/theme.setPlayerTheme() 设置主题
    setPlayerTheme(theme);
  }

  /**
   * 收集所有问题（支持 sections 和直接 questions）
   * 提取为公共方法，避免代码重复
   */
  private getAllQuestions(): Question[] {
    const allQuestions: Question[] = [];
    if (this.quizDSL.quiz.sections) {
      this.quizDSL.quiz.sections.forEach(section => {
        if (section.questions) {
          allQuestions.push(...section.questions);
        }
      });
    } else if (this.quizDSL.quiz.questions) {
      allQuestions.push(...this.quizDSL.quiz.questions);
    }
    return allQuestions;
  }

  /**
   * 将 Quiz DSL 转换为 SlideContext 的 items
   */
  private transformQuizDSLToContextItems(quizDSL: QuizDSL): unknown[] {
    // 收集所有问题（支持 sections 和直接 questions）
    const allQuestions: Question[] = [];
    if (quizDSL.quiz.sections) {
      quizDSL.quiz.sections.forEach(section => {
        if (section.questions) {
          allQuestions.push(...section.questions);
        }
      });
    } else if (quizDSL.quiz.questions) {
      allQuestions.push(...quizDSL.quiz.questions);
    }

    return allQuestions.map(question => {
      const baseItem: Record<string, unknown> = {
        id: question.id,
        type: question.type,
        text: question.text,
        points: question.points,
        explanation: question.explanation,
        metadata: question.metadata,
      };

      // 只有选择题才有 options
      if (question.type === 'single_choice' || question.type === 'multiple_choice') {
        const questionWithOptions = question as { options?: unknown[] };
        baseItem.options = questionWithOptions.options;
      }

      return baseItem;
    });
  }

  /**
   * 获取 SlideRunner 实例（用于高级控制）
   */
  getRunner(): SlideRunner {
    if (!this.runner) {
      throw new Error('Player not initialized. Call init() first.');
    }
    return this.runner;
  }

  /**
   * 设置答案
   */
  setAnswer(questionId: string, answer: AnswerValue): void {
    if (this.options.readOnly) {
      return;
    }
    this.answers[questionId] = answer;
    this.options.onAnswerChange?.(questionId, answer);
  }

  /**
   * 获取当前答案
   */
  getAnswers(): Record<string, AnswerValue> {
    return { ...this.answers };
  }

  /**
   * 提交测验
   * 返回 Result DSL
   */
  submit(): ResultDSL {
    const completedAt = new Date();
    const duration = completedAt.getTime() - this.startTime;

    // 收集所有问题
    const allQuestions = this.getAllQuestions();

    // 计算分数
    const questionResults: QuestionResult[] = allQuestions.map(question => {
      const userAnswer = this.answers[question.id];
      const correct = this.isAnswerCorrect(question, userAnswer);
      const score = correct ? question.points || 0 : 0;

      return {
        questionId: question.id,
        correct,
        score,
        maxScore: question.points || 0,
        userAnswer,
        correctAnswer: this.getCorrectAnswer(question),
      };
    });

    const totalScore = questionResults.reduce((sum, r) => sum + r.score, 0);
    const maxScore = questionResults.reduce((sum, r) => sum + r.maxScore, 0);
    const passingScore = this.quizDSL.quiz.settings?.passingScore || 0;
    const passed = totalScore >= passingScore;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // 生成 Result DSL
    const resultDSL: ResultDSL = {
      version: '1.0.0',
      metadata: {
        id: `result-${Date.now()}`,
        quizId: this.quizDSL.quiz.id,
        startedAt: new Date(this.startTime).toISOString(),
        completedAt: completedAt.toISOString(),
        duration,
      },
      quiz: { ...this.quizDSL }, // 完整 Quiz DSL 副本
      answers: { ...this.answers },
      scoring: {
        totalScore,
        maxScore,
        percentage,
        passed,
        passingScore,
        questionResults,
      },
    };

    // 触发提交回调
    this.options.onSubmit?.(resultDSL);

    // 如果启用结果显示，渲染结果
    if (this.options.showResults !== false) {
      this.renderResults(resultDSL);
    }

    return resultDSL;
  }

  /**
   * 获取 Result DSL（不提交）
   * 用于保存当前答题状态
   */
  getResultDSL(): ResultDSL {
    const now = Date.now();
    const duration = now - this.startTime;

    // 收集所有问题
    const allQuestions = this.getAllQuestions();

    // 计算当前分数
    const questionResults: QuestionResult[] = allQuestions.map(question => {
      const userAnswer = this.answers[question.id];
      const correct = this.isAnswerCorrect(question, userAnswer);
      const score = correct ? question.points || 0 : 0;

      return {
        questionId: question.id,
        correct,
        score,
        maxScore: question.points || 0,
        userAnswer,
        correctAnswer: this.getCorrectAnswer(question),
      };
    });

    const totalScore = questionResults.reduce((sum, r) => sum + r.score, 0);
    const maxScore = questionResults.reduce((sum, r) => sum + r.maxScore, 0);
    const passingScore = this.quizDSL.quiz.settings?.passingScore || 0;
    const passed = totalScore >= passingScore;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    return {
      version: '1.0.0',
      metadata: {
        id: `result-${Date.now()}`,
        quizId: this.quizDSL.quiz.id,
        startedAt: new Date(this.startTime).toISOString(),
        completedAt: new Date(now).toISOString(),
        duration,
      },
      quiz: { ...this.quizDSL },
      answers: { ...this.answers },
      scoring: {
        totalScore,
        maxScore,
        percentage,
        passed,
        passingScore,
        questionResults,
      },
    };
  }

  /**
   * 从 Result DSL 恢复状态
   */
  restoreFromResultDSL(resultDSL: ResultDSL): void {
    // 恢复 Quiz DSL
    this.quizDSL = resultDSL.quiz;

    // 恢复答案
    this.answers = { ...resultDSL.answers };

    // 恢复开始时间（如果有）
    if (resultDSL.metadata.startedAt) {
      this.startTime = new Date(resultDSL.metadata.startedAt).getTime();
    }
  }

  /**
   * 获取当前分数（不提交）
   */
  getCurrentScore(): number {
    // 收集所有问题
    const allQuestions = this.getAllQuestions();

    return allQuestions.reduce((sum, question) => {
      const userAnswer = this.answers[question.id];
      const correct = this.isAnswerCorrect(question, userAnswer);
      return sum + (correct ? question.points || 0 : 0);
    }, 0);
  }

  /**
   * 检查是否已回答所有问题
   */
  isComplete(): boolean {
    // 收集所有问题
    const allQuestions = this.getAllQuestions();

    return allQuestions.every(question => question.id in this.answers);
  }

  /**
   * 重置答案
   */
  reset(): void {
    this.answers = {};
    this.startTime = Date.now();
  }

  /**
   * 销毁播放器实例
   */
  async destroy(): Promise<void> {
    // 移除事件监听器，防止内存泄漏
    if (this.answerChangeListener) {
      document.removeEventListener('answer-change', this.answerChangeListener);
      this.answerChangeListener = null;
    }

    if (this.runner) {
      try {
        this.runner.destroy();
      } catch {
        // 忽略销毁错误
      }
      this.runner = null;
    }
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
      this.containerElement = null;
    }
  }

  /**
   * 检查答案是否正确
   */
  private isAnswerCorrect(question: Question, userAnswer: AnswerValue): boolean {
    // 处理空答案
    if (userAnswer === null || userAnswer === undefined) {
      return false;
    }

    // 处理布尔值（判断题）
    if (typeof userAnswer === 'boolean') {
      const questionWithAnswer = question as { correctAnswer?: AnswerValue };
      return questionWithAnswer.correctAnswer === userAnswer;
    }

    // 使用 @quizerjs/core 的 checkAnswer 函数
    // 需要将 AnswerValue 转换为 string | string[]
    const answerStr =
      typeof userAnswer === 'string'
        ? userAnswer
        : Array.isArray(userAnswer)
          ? userAnswer
          : String(userAnswer);

    // 将 DSL Question 转换为 Core Question 格式
    const coreQuestion = this.convertToCoreQuestion(question);
    // 类型断言：我们已经确保了类型兼容性
    return checkAnswer(coreQuestion as CoreQuestion, answerStr);
  }

  /**
   * 将 DSL Question 转换为 Core Question 格式
   */
  private convertToCoreQuestion(question: Question): {
    id: string;
    type: 'single_choice' | 'multiple_choice' | 'text_input' | 'true_false';
    text: string;
    correctAnswer?: string | string[];
    options?: Array<{ id: string; isCorrect: boolean }>;
    caseSensitive?: boolean;
  } {
    if (question.type === 'single_choice' || question.type === 'multiple_choice') {
      const questionWithOptions = question as {
        options?: Array<{ id: string; isCorrect: boolean }>;
      };
      const correctOptions = questionWithOptions.options?.filter(opt => opt.isCorrect) || [];
      return {
        id: question.id,
        type: question.type as 'single_choice' | 'multiple_choice',
        text: question.text,
        correctAnswer:
          question.type === 'single_choice'
            ? correctOptions[0]?.id
            : correctOptions.map(opt => opt.id),
        options: questionWithOptions.options,
      };
    }

    const questionWithAnswer = question as { correctAnswer?: AnswerValue; caseSensitive?: boolean };
    return {
      id: question.id,
      type: question.type as 'text_input' | 'true_false',
      text: question.text,
      correctAnswer:
        typeof questionWithAnswer.correctAnswer === 'string'
          ? questionWithAnswer.correctAnswer
          : Array.isArray(questionWithAnswer.correctAnswer)
            ? questionWithAnswer.correctAnswer
            : String(questionWithAnswer.correctAnswer || ''),
      caseSensitive: questionWithAnswer.caseSensitive,
    };
  }

  /**
   * 获取正确答案
   */
  private getCorrectAnswer(question: Question): AnswerValue {
    // 根据问题类型获取正确答案
    if (question.type === 'single_choice' || question.type === 'multiple_choice') {
      const questionWithOptions = question as {
        options?: Array<{ id: string; isCorrect: boolean }>;
      };
      const correctOptions = questionWithOptions.options?.filter(opt => opt.isCorrect) || [];
      if (question.type === 'single_choice') {
        return correctOptions[0]?.id || '';
      } else {
        return correctOptions.map(opt => opt.id);
      }
    }

    // 文本输入题和判断题直接返回 correctAnswer
    const questionWithAnswer = question as { correctAnswer?: AnswerValue };
    return questionWithAnswer.correctAnswer || '';
  }

  /**
   * 设置答案监听器
   */
  private setupAnswerListeners(): void {
    // 保存监听器引用，以便后续清理
    this.answerChangeListener = (event: Event) => {
      const customEvent = event as CustomEvent<{ questionId: string; answer: AnswerValue }>;
      const { questionId, answer } = customEvent.detail;
      this.setAnswer(questionId, answer);
    };
    document.addEventListener('answer-change', this.answerChangeListener);
  }

  /**
   * 渲染结果界面
   */
  private renderResults(resultDSL: ResultDSL): void {
    if (!this.containerElement) {
      console.warn('Container element not found, cannot render results');
      return;
    }

    // @quizerjs/core 已在文件顶部静态导入，组件会自动注册

    // 创建结果容器
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'quiz-player-results-container';
    resultsContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      overflow-y: auto;
      padding: 2rem;
    `;

    // 创建结果内容区域
    const resultsContent = document.createElement('div');
    resultsContent.style.cssText = `
      background-color: white;
      border-radius: 12px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    `;

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #666;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    `;
    closeButton.onmouseover = () => {
      closeButton.style.backgroundColor = '#f0f0f0';
    };
    closeButton.onmouseout = () => {
      closeButton.style.backgroundColor = 'transparent';
    };
    closeButton.onclick = () => {
      resultsContainer.remove();
    };

    // 创建结果组件
    const resultsElement = document.createElement('wsx-quiz-results');
    resultsElement.setAttribute('result-dsl', JSON.stringify(resultDSL));
    resultsElement.style.cssText = 'display: block;';

    // 组装结构
    resultsContent.appendChild(closeButton);
    resultsContent.appendChild(resultsElement);
    resultsContainer.appendChild(resultsContent);

    // 点击背景关闭
    resultsContainer.onclick = e => {
      if (e.target === resultsContainer) {
        resultsContainer.remove();
      }
    };

    // 添加到页面
    document.body.appendChild(resultsContainer);

    // 等待组件渲染后滚动到顶部
    setTimeout(() => {
      resultsContent.scrollTop = 0;
    }, 100);
  }
}
