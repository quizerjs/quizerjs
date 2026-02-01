/**
 * QuizPlayer - 基于 Slide 的测验播放器
 * 使用 Slide DSL 和 Swiper runner 渲染交互式幻灯片
 */

import type { QuizDSL, Question } from '@quizerjs/dsl';
import {
  checkAnswer,
  createQuizStore,
  quizActions,
  registerQuizStore,
  unregisterQuizStore,
} from '@quizerjs/core';
import type { Question as CoreQuestion } from '@quizerjs/core';
import type { QuizStore } from '@quizerjs/core';
import { createSlideRunner } from '@slidejs/runner-swiper';
import { setPlayerTheme } from '@quizerjs/theme';
import type {
  QuizPlayerOptions,
  ResultDSL,
  QuestionResult,
  AnswerValue,
  ThemeName,
  ThemeConfig,
} from './types.js';
import { getDefaultSlideSource } from './defaultSlideSource.js';

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
  private startTime: number = Date.now();
  private quizSource: QuizDSL;
  private options: QuizPlayerOptions;
  private containerElement: HTMLElement | null = null;
  private answerChangeListener: ((event: Event) => void) | null = null;
  private _submitListener: ((event: Event) => void) | null = null;
  private store: QuizStore;
  private hasCompleted: boolean = false;

  constructor(options: QuizPlayerOptions) {
    this.options = options;
    this.quizSource = options.quizSource;

    // 初始化 QuizStore（每个 QuizPlayer 实例创建自己的 store）
    this.store = createQuizStore();

    // 状态恢复优先级：resultDSL > initialAnswers
    // 将在 init() 中处理，因为需要先初始化 QuizStore 状态 (QUIZ_INIT)
  }

  /**
   * 初始化播放器
   */
  async init(): Promise<void> {
    const { container, quizSource, slideSource, slideOptions } = this.options;

    // 验证 quizSource 是否存在且格式正确
    if (!quizSource) {
      throw new Error('QuizSource is required but not provided');
    }
    if (!quizSource.quiz) {
      throw new Error('QuizSource.quiz is required but not provided');
    }
    if (!quizSource.quiz.id) {
      throw new Error('QuizSource.quiz.id is required but not provided');
    }

    // 如果没有提供 slideSource，使用默认的 quiz.slide 文件
    const finalSlideSource = slideSource || getDefaultSlideSource();

    // 获取容器元素
    this.containerElement =
      typeof container === 'string'
        ? (document.querySelector(container) as HTMLElement)
        : container;

    if (!this.containerElement) {
      throw new Error('Container element not found');
    }

    // 使用 @slidejs/runner-swiper 创建并运行幻灯片
    try {
      // 1. 创建 SlideContext，将 Quiz 作为数据源
      // 对于 quiz 类型，quiz 对象应该在顶层可访问（Slide 模板中可以直接使用 quiz.title 等）
      const context: SlideContext = {
        sourceType: 'quiz',
        sourceId: quizSource.quiz.id,
        items: this.transformQuizSourceToContextItems(quizSource),
        quiz: {
          id: quizSource.quiz.id,
          title: quizSource.quiz.title,
          description: quizSource.quiz.description,
          questions: this.getAllQuestions(),
        },
      };

      // 4. 注册并初始化 QuizStore（使用 quizId 作为标识符）
      // 必须在 runner 启动前完成，以便组件能立即找到 store
      registerQuizStore(quizSource.quiz.id, this.store);
      const totalQuestions = this.getAllQuestions().length;
      console.log(
        `[QuizPlayer] Initializing store with ${totalQuestions} questions for quiz: ${quizSource.quiz.id}`
      );
      this.store.dispatch(quizActions.initQuiz(quizSource.quiz.id, totalQuestions));

      // 5. 使用 @slidejs/runner-swiper 创建并运行幻灯片
      this.runner = (await createSlideRunner(
        finalSlideSource,
        {
          ...context,
          items: context.items as unknown[],
          metadata: {
            title: quizSource.quiz.title || 'Quiz',
            createdAt: new Date().toISOString(),
          },
        } as unknown as Parameters<typeof createSlideRunner>[1],
        {
          container: this.containerElement,
          swiperOptions: { ...slideOptions },
        }
      )) as unknown as SlideRunner;

      // 5. 恢复状态 (必须在 initQuiz 之后执行，以确保进度计算正确)
      if (this.options.resultSource) {
        this.restoreFromResultSource(this.options.resultSource);
        if (this.options.initialAnswers) {
          Object.entries(this.options.initialAnswers).forEach(([qid, ans]) => {
            this.setAnswer(qid, ans);
          });
        }
      } else if (this.options.initialAnswers) {
        Object.entries(this.options.initialAnswers).forEach(([qid, ans]) => {
          this.setAnswer(qid, ans);
        });
      }

      // 6. 启动演示（导航到第一张幻灯片）
      this.runner.play();

      // 7. 设置答案监听器
      this.setupAnswerListeners();

      // 8. 应用主题（默认使用 solarized-dark）
      const theme = this.options.theme || 'solarized-dark';
      this.setTheme(theme);

      this.startTime = Date.now();

      // Trigger onStart callback
      this.options.onStart?.();
    } catch (error) {
      // 提供更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to initialize QuizPlayer: ${errorMessage}. Please check your configuration and ensure all required dependencies are installed.`
      );
    }
  }

  /**
   * 开始测验
   */
  start(): void {
    if (!this.runner) {
      throw new Error('Player not initialized. Call init() first.');
    }

    this.startTime = Date.now();
    this.runner.play();
    this.options.onStart?.();
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
    if (this.quizSource.quiz.sections) {
      this.quizSource.quiz.sections.forEach(section => {
        if (section.questions) {
          allQuestions.push(...section.questions);
        }
      });
    } else if (this.quizSource.quiz.questions) {
      allQuestions.push(...this.quizSource.quiz.questions);
    }
    return allQuestions;
  }

  /**
   * 将 Quiz Source 转换为 SlideContext 的 items
   */
  private transformQuizSourceToContextItems(quizSource: QuizDSL): unknown[] {
    // 收集所有问题（支持 sections 和直接 questions）
    const allQuestions: Question[] = [];
    if (quizSource.quiz.sections) {
      quizSource.quiz.sections.forEach(section => {
        if (section.questions) {
          allQuestions.push(...section.questions);
        }
      });
    } else if (quizSource.quiz.questions) {
      allQuestions.push(...quizSource.quiz.questions);
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
   * 获取 QuizStore 实例
   * 允许组件访问 store 实例
   */
  getStore(): QuizStore {
    return this.store;
  }

  /**
   * 设置答案
   */
  setAnswer(questionId: string, answer: AnswerValue): void {
    if (this.options.readOnly) {
      return;
    }
    // const wasComplete = this.store.isComplete(); // 如果需要 onComplete 事件可以在这里做判断

    // 通过 QuizStore dispatch action 更新状态
    this.store.dispatch(quizActions.setAnswer(questionId, answer));

    // 保留现有的回调（向后兼容）
    this.options.onAnswerChange?.(questionId, answer);

    // 检查是否完成并触发 onComplete
    if (this.isComplete()) {
      this.options.onComplete?.();
    }
  }

  /**
   * 获取当前答案
   */
  getAnswers(): Record<string, AnswerValue> {
    return this.store.getAnswers();
  }

  /**
   * 提交测验
   * 返回 Result Source
   */
  submit(): ResultDSL {
    // 开始提交：Dispatch SUBMIT_START action
    this.store.dispatch(quizActions.startSubmit());

    try {
      const completedAt = new Date();
      const duration = completedAt.getTime() - this.startTime;

      // 收集所有问题
      const allQuestions = this.getAllQuestions();
      const currentAnswers = this.store.getAnswers();

      // 计算分数
      const questionResults: QuestionResult[] = allQuestions.map(question => {
        const userAnswer = currentAnswers[question.id];
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
      const passingScore = this.quizSource.quiz.settings?.passingScore || 0;
      const passed = totalScore >= passingScore;
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      // 生成 Result Source
      const resultSource: ResultDSL = {
        version: '1.0.0',
        metadata: {
          id: `result-${Date.now()}`,
          quizId: this.quizSource.quiz.id,
          startedAt: new Date(this.startTime).toISOString(),
          completedAt: completedAt.toISOString(),
          duration,
        },
        quiz: { ...this.quizSource }, // 完整 Quiz Source 副本
        answers: currentAnswers,
        scoring: {
          totalScore,
          maxScore,
          percentage,
          passed,
          passingScore,
          questionResults,
        },
      };

      // 提交成功：Dispatch SUBMIT_SUCCESS action
      this.store.dispatch(quizActions.submitSuccess(resultSource));

      // 触发外部 DOM 事件，携带所有信息 (Host should listen to this to switch views)
      if (this.containerElement) {
        const completeEvent = new CustomEvent('quiz-complete', {
          detail: resultSource,
          bubbles: true,
          composed: true,
        });
        this.containerElement.dispatchEvent(completeEvent);
      }

      // 触发提交回调（向后兼容）
      this.options.onSubmit?.(resultSource);

      return resultSource;
    } catch (error) {
      // 提交失败：Dispatch SUBMIT_FAILURE action
      this.store.dispatch(
        quizActions.submitFailure(error instanceof Error ? error : new Error(String(error)))
      );
      throw error;
    }
  }

  /**
   * 获取 Result Source（不提交）
   * 用于保存当前答题状态
   */
  getResultSource(): ResultDSL {
    const now = Date.now();
    const duration = now - this.startTime;

    // 收集所有问题
    const allQuestions = this.getAllQuestions();
    const currentAnswers = this.store.getAnswers();

    // 计算当前分数
    const questionResults: QuestionResult[] = allQuestions.map(question => {
      const userAnswer = currentAnswers[question.id];
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
    const passingScore = this.quizSource.quiz.settings?.passingScore || 0;
    const passed = totalScore >= passingScore;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    return {
      version: '1.0.0',
      metadata: {
        id: `result-${Date.now()}`,
        quizId: this.quizSource.quiz.id,
        startedAt: new Date(this.startTime).toISOString(),
        completedAt: new Date(now).toISOString(),
        duration,
      },
      quiz: { ...this.quizSource },
      answers: currentAnswers,
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
   * 从 Result Source 恢复状态
   */
  restoreFromResultSource(resultSource: ResultDSL): void {
    // 恢复 Quiz Source
    this.quizSource = resultSource.quiz;

    // 恢复答案
    Object.entries(resultSource.answers).forEach(([qid, ans]) => {
      this.store.dispatch(quizActions.setAnswer(qid, ans));
    });

    // 恢复开始时间（如果有）
    if (resultSource.metadata.startedAt) {
      this.startTime = new Date(resultSource.metadata.startedAt).getTime();
    }
  }

  /**
   * 获取当前分数（不提交）
   */
  getCurrentScore(): number {
    // 收集所有问题
    const allQuestions = this.getAllQuestions();
    const currentAnswers = this.store.getAnswers();

    return allQuestions.reduce((sum, question) => {
      const userAnswer = currentAnswers[question.id];
      const correct = this.isAnswerCorrect(question, userAnswer);
      return sum + (correct ? question.points || 0 : 0);
    }, 0);
  }

  /**
   * 检查是否已回答所有问题
   */
  isComplete(): boolean {
    return this.store.isComplete();
  }

  /**
   * 重置答案
   */
  reset(): void {
    this.store.dispatch(quizActions.resetAnswers());
    this.startTime = Date.now();
    this.options.onReset?.();
  }

  /**
   * 销毁播放器实例
   */
  async destroy(): Promise<void> {
    // 取消注册 QuizStore（使用 quizId）
    if (this.quizSource?.quiz?.id) {
      unregisterQuizStore(this.quizSource.quiz.id);
    }

    // 移除事件监听器，防止内存泄漏
    if (this.answerChangeListener) {
      document.removeEventListener('answer-change', this.answerChangeListener);
      this.answerChangeListener = null;
    }

    if (this._submitListener && this.containerElement) {
      this.containerElement.removeEventListener('quiz-submit', this._submitListener);
      this._submitListener = null;
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
      // Prevent infinite loop: ignore events dispatched by the player container itself
      if (this.containerElement && event.target === this.containerElement) {
        return;
      }

      const customEvent = event as CustomEvent<{ questionId: string; answer: AnswerValue }>;
      const { questionId, answer } = customEvent.detail;
      this.setAnswer(questionId, answer);
    };
    document.addEventListener('answer-change', this.answerChangeListener);

    // 监听提交事件：Linus 风格，严格锁定在容器内
    this._submitListener = (_event: Event) => {
      // 捕获到冒泡上来的提交信号
      this.submit();
    };

    if (this.containerElement) {
      this.containerElement.addEventListener('quiz-submit', this._submitListener);
    }
  }
}
