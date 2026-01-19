# RFC 0006: 播放器核心组件设计

**状态**: 草案 (Draft)  
**创建日期**: 2025-12-07  
**作者**: quizerjs 团队

## 摘要

本文档详细设计播放器组件架构。**Player 的核心职责是播放 Quiz DSL、收集用户答案、计算分数、生成结果并提交**。

**关键设计理念**：

- **Editor 设计 Quiz**：使用 `@quizerjs/editor` 创建和编辑 Quiz DSL
- **核心播放器**：`@quizerjs/quizerjs` 包中的 `QuizPlayer` 始终是 Slide 播放器（使用 Slide DSL）
- **扩展播放器**：`@quizerjs/player-markdown` 包提供 `MarkdownPlayer` 支持
- **结果格式设计**：定义 Result DSL 格式，包含完整的 Quiz DSL + 用户答案 + 评分信息，可用于重新生成报告

## 动机

- 明确播放器的详细 API 设计
- 定义核心组件的职责和边界
- 指导实现工作
- 确保与 DSL 和架构设计的一致性

## 设计原则

1. **核心职责明确**: Player 专注于播放、收集答案、计算分数、生成结果和提交
2. **展示方式分离**: Slide DSL 和 Markdown 是展示方式，通过 Renderer 接口实现
3. **结果可追溯**: Result DSL 包含完整的 Quiz DSL + 答案 + 评分，可用于重新生成报告
4. **框架无关**: 纯 JavaScript/TypeScript，不依赖 React/Vue
5. **可扩展**: 支持自定义 Renderer 和插件
6. **类型安全**: 完整的 TypeScript 类型定义

## 架构设计

### 包结构

系统采用核心包 + 扩展包的架构：

#### 1. @quizerjs/quizerjs（核心包）

**QuizPlayer（幻灯片播放器）**：

- **位置**：`@quizerjs/quizerjs` 包中的 `QuizPlayer` 类
- **职责**：始终是 Slide 播放器，使用 Slide DSL 渲染为交互式幻灯片
- **特点**：
  - 使用 Slide DSL 定义幻灯片布局
  - 通过 Swiper 实现流畅的幻灯片导航
  - 适合一题一页的答题体验
  - 核心包功能，所有用户都可以使用

#### 2. @quizerjs/player-markdown（扩展包）

**MarkdownPlayer（Markdown 播放器）**：

- **位置**：`@quizerjs/player-markdown` 包中的 `MarkdownPlayer` 类
- **职责**：将 Quiz DSL 渲染为 Markdown 文档格式
- **特点**：
  - 将 Quiz DSL 渲染为 Markdown 文档
  - 支持滚动阅读和答题
  - 适合长文档和教程式测验
  - 可选扩展，需要单独安装

### 设计优势

**为什么采用核心包 + 扩展包架构**：

1. **核心包专注**：`@quizerjs/quizerjs` 专注于 Slide 播放器，保持核心功能简洁
2. **按需安装**：需要 Markdown 播放器时才安装 `@quizerjs/player-markdown`
3. **避免强制依赖**：核心包不依赖 Markdown 相关代码
4. **更小的打包体积**：只安装需要的播放器
5. **清晰的职责分离**：核心功能与扩展功能分离

### 工作流程

```
Quiz DSL
  ↓
选择播放器
  ├─→ @quizerjs/quizerjs → QuizPlayer (Slide)
  │   ├─→ 使用 Slide DSL 定义布局
  │   ├─→ 渲染为 Swiper 幻灯片
  │   ├─→ 收集答案
  │   ├─→ 计算分数
  │   └─→ 生成 Result DSL
  │
  └─→ @quizerjs/player-markdown → MarkdownPlayer
      ├─→ 转换为 Markdown 文档
      ├─→ 嵌入答题组件
      ├─→ 收集答案
      ├─→ 计算分数
      └─→ 生成 Result DSL
```

### 共享功能

两个播放器共享以下核心功能（通过 `@quizerjs/core` 包的工具函数实现）：

- **答案收集**：统一的答案收集机制
- **分数计算**：使用相同的评分逻辑
- **结果生成**：生成相同格式的 Result DSL
- **事件处理**：统一的答案变更和提交回调

## Result DSL 设计

### 设计理念

**Result DSL 是 Quiz DSL 的扩展，包含完整的 Quiz 信息 + 用户答案 + 评分信息**。这样设计的好处：

1. **完整信息**：包含原始 Quiz DSL，可以重新生成报告
2. **可追溯**：可以查看原始问题和用户答案
3. **可分析**：可以分析答题情况，生成统计报告
4. **可恢复**：可以从 Result DSL 恢复答题状态

### Result DSL 格式

**类型定义位置**: `@quizerjs/dsl` 包中的 `ResultDSL`、`QuestionResult`、`AnswerValue` 类型

```typescript
// 从 @quizerjs/dsl 导入
import type { ResultDSL, QuestionResult, AnswerValue } from '@quizerjs/dsl';

interface ResultDSL {
  /**
   * Result DSL 版本号
   */
  version: string;

  /**
   * 结果元数据
   */
  metadata: {
    /**
     * 结果 ID（唯一标识）
     */
    id: string;

    /**
     * 关联的 Quiz ID
     */
    quizId: string;

    /**
     * 用户 ID（可选）
     */
    userId?: string;

    /**
     * 开始时间（ISO 8601）
     */
    startedAt: string;

    /**
     * 完成时间（ISO 8601）
     */
    completedAt: string;

    /**
     * 答题时长（毫秒）
     */
    duration: number;
  };

  /**
   * 完整的 Quiz DSL（原始测验数据）
   * 这是 Quiz DSL 的完整副本，用于重新生成报告
   */
  quiz: QuizDSL;

  /**
   * 用户答案
   * key: questionId, value: 用户答案
   */
  answers: Record<string, AnswerValue>;

  /**
   * 评分结果
   */
  scoring: {
    /**
     * 总得分
     */
    totalScore: number;

    /**
     * 最高分数
     */
    maxScore: number;

    /**
     * 得分百分比
     */
    percentage: number;

    /**
     * 是否通过
     */
    passed: boolean;

    /**
     * 通过分数线
     */
    passingScore: number;

    /**
     * 每题评分详情
     */
    questionResults: QuestionResult[];
  };
}

interface QuestionResult {
  /**
   * 问题 ID
   */
  questionId: string;

  /**
   * 是否正确
   */
  correct: boolean;

  /**
   * 得分
   */
  score: number;

  /**
   * 最高分数
   */
  maxScore: number;

  /**
   * 用户答案
   */
  userAnswer: AnswerValue;

  /**
   * 正确答案
   */
  correctAnswer: AnswerValue;

  /**
   * 答题时间（毫秒，可选）
   */
  timeSpent?: number;
}

type AnswerValue = string | string[] | number | boolean;
```

### Result DSL 示例

```json
{
  "version": "1.0.0",
  "metadata": {
    "id": "result-001",
    "quizId": "math-quiz-001",
    "userId": "user-123",
    "startedAt": "2025-01-27T10:00:00Z",
    "completedAt": "2025-01-27T10:15:30Z",
    "duration": 930000
  },
  "quiz": {
    "version": "1.0.0",
    "quiz": {
      "id": "math-quiz-001",
      "title": "数学基础测验",
      "description": "测试数学基础知识",
      "questions": [
        {
          "id": "q1",
          "type": "single_choice",
          "text": "1 + 1 = ?",
          "options": [
            { "id": "o1", "text": "1", "isCorrect": false },
            { "id": "o2", "text": "2", "isCorrect": true }
          ],
          "points": 10
        }
      ],
      "settings": {
        "passingScore": 60
      }
    }
  },
  "answers": {
    "q1": "o2"
  },
  "scoring": {
    "totalScore": 10,
    "maxScore": 10,
    "percentage": 100,
    "passed": true,
    "passingScore": 60,
    "questionResults": [
      {
        "questionId": "q1",
        "correct": true,
        "score": 10,
        "maxScore": 10,
        "userAnswer": "o2",
        "correctAnswer": "o2"
      }
    ]
  }
}
```

### Result DSL 的使用场景

1. **存储结果**：将 Result DSL 保存到数据库或文件
2. **重新生成报告**：从 Result DSL 重新渲染报告界面
3. **数据分析**：分析答题情况，生成统计报告
4. **恢复状态**：从 Result DSL 恢复答题状态（用于继续答题或查看结果）

## API 设计

### QuizPlayer API（@quizerjs/quizerjs）

```typescript
interface QuizPlayerOptions {
  /**
   * 容器元素（必需）
   */
  container: HTMLElement | string;

  /**
   * Quiz DSL 数据（必需）
   */
  quizDSL: QuizDSL;

  /**
   * Slide DSL 源代码（必需）
   * 定义如何将 Quiz DSL 转换为幻灯片
   */
  slideDSL: string;

  /**
   * 初始答案（可选）
   * 用于恢复之前的答题状态
   */
  initialAnswers?: Record<string, AnswerValue>;

  /**
   * 从 Result DSL 恢复（可选）
   * 如果提供，将从 Result DSL 恢复答题状态
   */
  resultDSL?: ResultDSL;

  /**
   * 提交回调（可选）
   * 当用户提交测验时触发，返回 Result DSL
   */
  onSubmit?: (result: ResultDSL) => void;

  /**
   * 答案变更回调（可选）
   * 当用户修改答案时触发
   */
  onAnswerChange?: (questionId: string, answer: AnswerValue) => void;

  /**
   * 只读模式（可选，默认 false）
   * 用于显示结果
   */
  readOnly?: boolean;

  /**
   * 显示结果（可选，默认 true）
   */
  showResults?: boolean;

  /**
   * Swiper 配置选项（可选）
   * 传递给 @slidejs/runner-swiper 的配置
   */
  swiperOptions?: SwiperAdapterOptions['swiperConfig'];

  /**
   * 主题设置（可选，默认 'solarized-dark'）
   *
   * 支持两种方式：
   * 1. 预设主题名称（字符串）：'solarized-dark' | 'solarized-light' | 'dark' | 'light'
   * 2. 自定义主题配置对象：部分或完整的 ThemeConfig 对象
   *
   * @example
   * // 使用预设主题
   * theme: 'solarized-dark'
   *
   * @example
   * // 使用自定义主题配置
   * theme: {
   *   backgroundColor: '#002b36',
   *   textColor: '#839496',
   *   linkColor: '#268bd2',
   *   // ... 其他颜色配置
   * }
   */
  theme?: ThemeName | ThemeConfig;
}

class QuizPlayer {
  /**
   * 构造函数
   */
  constructor(options: QuizPlayerOptions);

  /**
   * 初始化播放器
   */
  init(): Promise<void>;

  /**
   * 获取当前答案
   */
  getAnswers(): Record<string, AnswerValue>;

  /**
   * 设置答案
   */
  setAnswer(questionId: string, answer: AnswerValue): void;

  /**
   * 提交测验
   * 返回 Result DSL
   */
  submit(): ResultDSL;

  /**
   * 获取当前分数（不提交）
   */
  getCurrentScore(): number;

  /**
   * 重置答案
   */
  reset(): void;

  /**
   * 销毁播放器实例
   */
  destroy(): Promise<void>;

  /**
   * 检查是否已回答所有问题
   */
  isComplete(): boolean;

  /**
   * 获取 Result DSL（不提交）
   * 用于保存当前答题状态
   */
  getResultSource(): ResultDSL;

  /**
   * 从 Result DSL 恢复状态
   */
  restoreFromResultDSL(resultDSL: ResultDSL): void;

  /**
   * 获取 SlideRunner 实例（用于高级控制）
   */
  getRunner(): SlideRunner<SlideContext>;

  /**
   * 设置主题
   *
   * 支持两种方式：
   * 1. 预设主题名称（字符串）：快速使用内置主题
   * 2. 自定义主题配置对象：完全自定义或部分覆盖预设主题
   *
   * @param theme 主题名称（'solarized-dark' | 'solarized-light' | 'dark' | 'light'）或自定义主题配置对象
   *
   * @example
   * // 使用预设主题
   * await player.setTheme('solarized-dark');
   *
   * @example
   * // 使用自定义主题配置
   * await player.setTheme({
   *   backgroundColor: '#002b36',
   *   textColor: '#839496',
   *   linkColor: '#268bd2'
   * });
   */
  setTheme(theme: ThemeName | ThemeConfig): Promise<void>;
}
```

### MarkdownPlayer API（@quizerjs/player-markdown）

```typescript
interface MarkdownPlayerOptions {
  /**
   * 容器元素（必需）
   */
  container: HTMLElement | string;

  /**
   * Quiz DSL 数据（必需）
   */
  quizDSL: QuizDSL;

  /**
   * 初始答案（可选）
   * 用于恢复之前的答题状态
   */
  initialAnswers?: Record<string, AnswerValue>;

  /**
   * 从 Result DSL 恢复（可选）
   * 如果提供，将从 Result DSL 恢复答题状态
   */
  resultDSL?: ResultDSL;

  /**
   * 提交回调（可选）
   * 当用户提交测验时触发，返回 Result DSL
   */
  onSubmit?: (result: ResultDSL) => void;

  /**
   * 答案变更回调（可选）
   * 当用户修改答案时触发
   */
  onAnswerChange?: (questionId: string, answer: AnswerValue) => void;

  /**
   * 只读模式（可选，默认 false）
   * 用于显示结果
   */
  readOnly?: boolean;

  /**
   * 显示结果（可选，默认 true）
   */
  showResults?: boolean;

  /**
   * Markdown 渲染配置（可选）
   */
  markdownConfig?: {
    /**
     * Marked.js 配置（可选）
     */
    markedOptions?: MarkedOptions;

    /**
     * 自定义 CSS 类（可选）
     */
    customClass?: string;

    /**
     * 滚动行为（可选）
     */
    scrollBehavior?: 'smooth' | 'auto';
  };
}

class MarkdownPlayer {
  /**
   * 构造函数
   */
  constructor(options: MarkdownPlayerOptions);

  /**
   * 初始化播放器
   */
  init(): Promise<void>;

  /**
   * 获取当前答案
   */
  getAnswers(): Record<string, AnswerValue>;

  /**
   * 设置答案
   */
  setAnswer(questionId: string, answer: AnswerValue): void;

  /**
   * 提交测验
   * 返回 Result DSL
   */
  submit(): ResultDSL;

  /**
   * 获取当前分数（不提交）
   */
  getCurrentScore(): number;

  /**
   * 重置答案
   */
  reset(): void;

  /**
   * 销毁播放器实例
   */
  destroy(): Promise<void>;

  /**
   * 检查是否已回答所有问题
   */
  isComplete(): boolean;

  /**
   * 获取 Result DSL（不提交）
   * 用于保存当前答题状态
   */
  getResultSource(): ResultDSL;

  /**
   * 从 Result DSL 恢复状态
   */
  restoreFromResultDSL(resultDSL: ResultDSL): void;
}
```

### 实现细节

#### 1. QuizPlayer 实现（@quizerjs/quizerjs）

```typescript
import { createSlideRunner } from '@slidejs/runner-swiper';
import type { SlideContext } from '@slidejs/context';
import type { SlideRunner } from '@slidejs/runner';
import { checkAnswer } from '@quizerjs/core';

class QuizPlayer {
  private runner: SlideRunner<SlideContext> | null = null;
  private answers: Record<string, AnswerValue> = {};
  private startTime: number = Date.now();
  private quizDSL: QuizDSL;
  private options: QuizPlayerOptions;

  constructor(options: QuizPlayerOptions) {
    this.options = options;
    this.quizDSL = options.quizDSL;

    // 从 Result DSL 恢复状态（如果提供）
    if (options.resultDSL) {
      this.restoreFromResultDSL(options.resultDSL);
    } else if (options.initialAnswers) {
      this.answers = { ...options.initialAnswers };
    }
  }

  async init(): Promise<void> {
    const { container, quizDSL, slideDSL, swiperOptions } = this.options;

    // 获取容器元素
    const containerElement =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (!containerElement) {
      throw new Error('Container element not found');
    }

    // 获取容器元素
    const containerElement =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (!containerElement) {
      throw new Error('Container element not found');
    }

    // 1. 创建 SlideContext，将 Quiz DSL 作为数据源
    const context: SlideContext = {
      sourceType: 'quiz',
      sourceId: quizDSL.quiz.id,
      items: this.transformQuizDSLToContextItems(quizDSL),
    };

    // 2. 使用 @slidejs/runner-swiper 创建并运行幻灯片
    this.runner = await createSlideRunner(slideDSL, context, {
      container: containerElement,
      swiperOptions: {
        direction: 'horizontal',
        loop: false,
        speed: 300,
        spaceBetween: 30,
        slidesPerView: 1,
        navigation: true,
        pagination: true,
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
        ...swiperOptions,
      },
    });

    // 3. 启动演示（导航到第一张幻灯片）
    this.runner.play();

    // 4. 设置答案监听器
    this.setupAnswerListeners();

    this.startTime = Date.now();
  }

  /**
   * 将 Quiz DSL 转换为 SlideContext 的 items
   */
  private transformQuizDSLToContextItems(quizDSL: QuizDSL): any[] {
    return quizDSL.quiz.questions.map(question => ({
      id: question.id,
      type: question.type,
      text: question.text,
      options: question.options,
      points: question.points,
      explanation: question.explanation,
      metadata: question.metadata,
    }));
  }

  getRunner(): SlideRunner<SlideContext> {
    if (!this.runner) {
      throw new Error('Player not initialized');
    }
    return this.runner;
  }

  setAnswer(questionId: string, answer: AnswerValue): void {
    this.answers[questionId] = answer;
    this.options.onAnswerChange?.(questionId, answer);
  }

  getAnswers(): Record<string, AnswerValue> {
    return { ...this.answers };
  }

  submit(): ResultDSL {
    const completedAt = new Date();
    const duration = completedAt.getTime() - this.startTime;

    // 计算分数
    const questionResults = this.quizDSL.quiz.questions.map(question => {
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

  getResultSource(): ResultDSL {
    const now = Date.now();
    const duration = now - this.startTime;

    // 计算当前分数
    const questionResults = this.quizDSL.quiz.questions.map(question => {
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

  getCurrentScore(): number {
    return this.quizDSL.quiz.questions.reduce((sum, question) => {
      const userAnswer = this.answers[question.id];
      const correct = this.isAnswerCorrect(question, userAnswer);
      return sum + (correct ? question.points || 0 : 0);
    }, 0);
  }

  isComplete(): boolean {
    return this.quizDSL.quiz.questions.every(question => question.id in this.answers);
  }

  reset(): void {
    this.answers = {};
    this.startTime = Date.now();
  }

  async destroy(): Promise<void> {
    if (this.runner) {
      this.runner = null;
    }
  }

  private isAnswerCorrect(question: Question, userAnswer: AnswerValue): boolean {
    return checkAnswer(question, userAnswer);
  }

  private getCorrectAnswer(question: Question): AnswerValue {
    // 根据问题类型获取正确答案
    // 实现逻辑...
  }

  private setupAnswerListeners(): void {
    document.addEventListener('answer-change', (event: CustomEvent) => {
      const { questionId, answer } = event.detail;
      this.setAnswer(questionId, answer);
    });
  }

  private renderResults(resultDSL: ResultDSL): void {
    // 渲染结果界面
    // 实现逻辑...
  }
}
```

#### 2. MarkdownPlayer 实现（@quizerjs/player-markdown）

```typescript
import { marked } from 'marked';
import { QuizBlock } from '@quizerjs/core';
import { checkAnswer } from '@quizerjs/core';

class MarkdownPlayer {
  private answers: Record<string, AnswerValue> = {};
  private startTime: number = Date.now();
  private containerElement: HTMLElement | null = null;
  private quizDSL: QuizDSL;
  private options: MarkdownPlayerOptions;

  constructor(options: MarkdownPlayerOptions) {
    this.options = options;
    this.quizDSL = options.quizDSL;

    // 从 Result DSL 恢复状态（如果提供）
    if (options.resultDSL) {
      this.restoreFromResultDSL(options.resultDSL);
    } else if (options.initialAnswers) {
      this.answers = { ...options.initialAnswers };
    }
  }

  async init(): Promise<void> {
    const { container, quizDSL, markdownConfig } = this.options;

    // 获取容器元素
    this.containerElement =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (!this.containerElement) {
      throw new Error('Container element not found');
    }

    // 1. 将 Quiz DSL 转换为 Markdown 格式
    const markdown = this.quizDSLToMarkdown(quizDSL);

    // 2. 使用 marked.js 解析 Markdown
    const html = marked.parse(markdown, markdownConfig?.markedOptions);

    // 3. 创建文档容器
    const docContainer = document.createElement('div');
    docContainer.className = `quiz-markdown-player ${markdownConfig?.customClass || ''}`;
    docContainer.innerHTML = html;

    // 4. 在问题位置嵌入答题组件
    this.embedQuizBlocks(docContainer, quizDSL);

    // 5. 添加到容器
    this.containerElement.appendChild(docContainer);

    // 6. 设置滚动行为
    if (markdownConfig?.scrollBehavior === 'smooth') {
      docContainer.style.scrollBehavior = 'smooth';
    }

    // 7. 设置答案监听器
    this.setupAnswerListeners();

    this.startTime = Date.now();
  }

  // 共享方法（与 SlidePlayer 相同）
  setAnswer(questionId: string, answer: AnswerValue): void {
    this.answers[questionId] = answer;
    this.options.onAnswerChange?.(questionId, answer);
  }

  getAnswers(): Record<string, AnswerValue> {
    return { ...this.answers };
  }

  submit(): ResultDSL {
    // 与 SlidePlayer 相同的实现
    // 计算分数和生成 Result DSL
    // ...
  }

  getResultSource(): ResultDSL {
    // 与 SlidePlayer 相同的实现
    // ...
  }

  restoreFromResultDSL(resultDSL: ResultDSL): void {
    // 与 SlidePlayer 相同的实现
    // ...
  }

  getCurrentScore(): number {
    // 与 SlidePlayer 相同的实现
    // ...
  }

  isComplete(): boolean {
    // 与 SlidePlayer 相同的实现
    // ...
  }

  reset(): void {
    this.answers = {};
    this.startTime = Date.now();
  }

  async destroy(): Promise<void> {
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
      this.containerElement = null;
    }
  }

  private quizDSLToMarkdown(quizDSL: QuizDSL): string {
    let markdown = '';

    // 标题
    markdown += `# ${quizDSL.quiz.title}\n\n`;

    // 描述
    if (quizDSL.quiz.description) {
      markdown += `${quizDSL.quiz.description}\n\n`;
    }

    // 问题列表
    quizDSL.quiz.questions.forEach((question, index) => {
      markdown += `## 问题 ${index + 1}\n\n`;
      markdown += `${question.text}\n\n`;

      // 在问题文本后插入占位符，用于嵌入答题组件
      markdown += `<!-- QUIZ_BLOCK_PLACEHOLDER:${question.id} -->\n\n`;

      // 如果有解释，添加解释部分
      if (question.explanation) {
        markdown += `> **解释**: ${question.explanation}\n\n`;
      }
    });

    return markdown;
  }

  private embedQuizBlocks(container: HTMLElement, quizDSL: QuizDSL): void {
    // 查找所有占位符注释并替换为答题组件
    // 实现逻辑...
  }

  private setupAnswerListeners(): void {
    document.addEventListener('answer-change', (event: CustomEvent) => {
      const { questionId, answer } = event.detail;
      this.setAnswer(questionId, answer);
    });
  }

  private isAnswerCorrect(question: Question, userAnswer: AnswerValue): boolean {
    return checkAnswer(question, userAnswer);
  }

  private getCorrectAnswer(question: Question): AnswerValue {
    // 根据问题类型获取正确答案
    // 实现逻辑...
  }
}
```

#### 3. Result DSL 生成和使用

Result DSL 的生成和使用示例：

```typescript
// 1. 提交时生成 Result DSL（MarkdownPlayer）
const player = new MarkdownPlayer({
  container: '#player',
  quizDSL: myQuizDSL,
  onSubmit: resultDSL => {
    // 保存 Result DSL 到服务器
    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultDSL),
    });

    // 或者保存到本地存储
    localStorage.setItem(`result-${resultDSL.metadata.id}`, JSON.stringify(resultDSL));
  },
});

await player.init();

// 2. 从 Result DSL 恢复状态
const savedResultDSL = JSON.parse(localStorage.getItem('result-xxx') || '{}');
const player2 = new MarkdownPlayer({
  container: '#player',
  resultDSL: savedResultDSL, // 从 Result DSL 恢复
  readOnly: true, // 只读模式，用于查看结果
});

await player2.init();

// 3. 从 Result DSL 重新生成报告
function generateReport(resultDSL: ResultDSL): string {
  const { quiz, scoring, answers } = resultDSL;

  let report = `# ${quiz.quiz.title}\n\n`;
  report += `得分: ${scoring.totalScore} / ${scoring.maxScore} (${scoring.percentage.toFixed(1)}%)\n\n`;
  report += `状态: ${scoring.passed ? '通过' : '未通过'}\n\n`;

  report += `## 答题详情\n\n`;
  quiz.quiz.questions.forEach((question, index) => {
    const result = scoring.questionResults.find(r => r.questionId === question.id);
    report += `### 问题 ${index + 1}\n\n`;
    report += `${question.text}\n\n`;
    report += `你的答案: ${result?.userAnswer}\n\n`;
    report += `正确答案: ${result?.correctAnswer}\n\n`;
    report += `得分: ${result?.score} / ${result?.maxScore}\n\n`;
  });

  return report;
}

// 4. 从 Result DSL 分析答题情况
function analyzeResults(resultDSL: ResultDSL) {
  const { scoring } = resultDSL;

  const correctCount = scoring.questionResults.filter(r => r.correct).length;
  const totalCount = scoring.questionResults.length;
  const accuracy = (correctCount / totalCount) * 100;

  return {
    accuracy,
    correctCount,
    totalCount,
    averageTime: resultDSL.metadata.duration / totalCount,
  };
}
```

    // 获取容器元素
    this.containerElement =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!this.containerElement) {
      throw new Error('Container element not found');
    }

    // 1. 将 Quiz DSL 转换为 Markdown 格式
    const markdown = this.quizDSLToMarkdown(quizDSL);

    // 2. 使用 marked.js 解析 Markdown
    const html = marked.parse(markdown, markdownConfig?.markedOptions);

    // 3. 创建文档容器
    const docContainer = document.createElement('div');
    docContainer.className = `quiz-markdown-player ${markdownConfig?.customClass || ''}`;
    docContainer.innerHTML = html;

    // 4. 在问题位置嵌入答题组件
    this.embedQuizBlocks(docContainer, quizDSL);

    // 5. 添加到容器
    this.containerElement.appendChild(docContainer);

    // 6. 设置滚动行为
    if (markdownConfig?.scrollBehavior === 'smooth') {
      docContainer.style.scrollBehavior = 'smooth';
    }

    // 7. 监听答案变更事件
    this.setupAnswerListeners();

    this.startTime = Date.now();

}

/\*\*

- 将 Quiz DSL 转换为 Markdown 格式
  \*/
  private quizDSLToMarkdown(quizDSL: QuizDSL): string {
  let markdown = '';


    // 标题
    markdown += `# ${quizDSL.quiz.title}\n\n`;

    // 描述
    if (quizDSL.quiz.description) {
      markdown += `${quizDSL.quiz.description}\n\n`;
    }

    // 问题列表
    quizDSL.quiz.questions.forEach((question, index) => {
      markdown += `## 问题 ${index + 1}\n\n`;
      markdown += `${question.text}\n\n`;

      // 在问题文本后插入占位符，用于嵌入答题组件
      markdown += `<!-- QUIZ_BLOCK_PLACEHOLDER:${question.id} -->\n\n`;

      // 如果有解释，添加解释部分
      if (question.explanation) {
        markdown += `> **解释**: ${question.explanation}\n\n`;
      }
    });

    return markdown;

}

/\*\*

- 在 Markdown 渲染后的 HTML 中嵌入答题组件
  \*/
  private embedQuizBlocks(container: HTMLElement, quizDSL: QuizDSL): void {
  // 查找所有占位符注释
  const walker = document.createTreeWalker(
  container,
  NodeFilter.SHOW_COMMENT,
  null
  );


    const placeholders: Array<{ node: Comment; questionId: string }> = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      const comment = node as Comment;
      const match = comment.textContent?.match(/^ QUIZ_BLOCK_PLACEHOLDER:(.+)$/);
      if (match) {
        placeholders.push({
          node: comment,
          questionId: match[1],
        });
      }
    }

    // 为每个占位符创建答题组件
    placeholders.forEach(({ node, questionId }) => {
      const question = quizDSL.quiz.questions.find(q => q.id === questionId);
      if (!question) {
        return;
      }

      // 创建答题组件
      const quizBlock = document.createElement('quiz-block');
      quizBlock.setAttribute('data-quiz-data', JSON.stringify({ questions: [question] }));

      // 替换占位符注释
      node.parentNode?.replaceChild(quizBlock, node);
    });

}

/\*\*

- 设置答案监听器
  \*/
  private setupAnswerListeners(): void {
  document.addEventListener('answer-change', (event: CustomEvent) => {
  const { questionId, answer } = event.detail;
  this.setAnswer(questionId, answer);
  });
  }

async destroy(): Promise<void> {
if (this.containerElement) {
this.containerElement.innerHTML = '';
this.containerElement = null;
}
}
}

````


## 提交按钮与答案收集 UI 设计

### 设计原则（基于 Don Norman 的可用性原则）

1. **可见性 (Visibility)**: 所有功能应该清晰可见，用户能够发现和理解如何操作
2. **反馈 (Feedback)**: 每个操作都应该有即时的、清晰的反馈
3. **约束 (Constraints)**: 通过设计限制错误操作，防止用户犯错
4. **映射 (Mapping)**: 控件和功能之间应该有清晰的对应关系
5. **一致性 (Consistency)**: 保持设计语言和交互模式的一致性
6. **容错性 (Error Tolerance)**: 设计应该容错，允许用户撤销或修正操作

### 答案收集与记录 UI 设计

**需求**：
- 每个问题都可以回答
- 选择答案应该被立即记录
- 提供视觉反馈表明答案已被记录

**实现方式**：
- 使用 `wsx-quiz-question` 组件渲染问题
- 组件内部通过 `answer-change` 事件通知 QuizPlayer
- QuizPlayer 通过 `setAnswer()` 方法记录答案
- 组件可以显示"已作答"状态（通过 `disabled` 或 `result` 属性）

**视觉反馈设计**:

1. **答案选择反馈**:
   - **选中状态**: 选项背景色变化（使用主题的主色调，透明度 10-15%）
   - **选中标记**: 显示选中图标（✓）或边框高亮（2-3px solid）
   - **即时反馈**: 选择后 100ms 内显示视觉变化
   - **动画效果**: 使用 fade-in 或 scale 动画（200ms）

2. **已作答状态指示**:
   - **问题卡片**: 已作答的问题显示轻微背景色变化或边框颜色
   - **进度指示器**: 在导航栏或进度条中标记已作答题目
   - **视觉标记**: 使用小图标（如 ✓）或颜色点标识已作答
   - **对比度**: 已作答/未作答状态应该有明显的视觉区分

3. **答案修改反馈**:
   - **修改提示**: 修改答案时显示轻微动画（如 shake 或 highlight）
   - **状态更新**: 实时更新已作答状态
   - **撤销支持**: 支持清除答案（显示清除按钮或双击清除）

4. **错误预防**:
   - **确认机制**: 重要操作（如清除答案）需要确认
   - **约束提示**: 多选题显示"至少选择 X 项"提示
   - **必答题标记**: 必答题显示红色星号（*）或"必答"标签

5. **可访问性**:
   - **键盘导航**: 支持方向键选择选项，Tab 键切换问题
   - **屏幕阅读器**: 提供清晰的选项描述和选中状态
   - **焦点管理**: 清晰的焦点指示，支持跳过已作答题目

### wsx-quiz-submit 组件设计

**组件名称**: `wsx-quiz-submit`
**位置**: `@quizerjs/core` 包
**职责**: 在最后一个 slide 中显示提交按钮

**属性**:
```typescript
interface QuizSubmitAttributes {
  /**
   * 按钮文本（可选，默认 "提交答案"）
   */
  'button-text'?: string;

  /**
   * 是否显示答题进度（可选，默认 true）
   */
  'show-progress'?: boolean;

  /**
   * 自定义 CSS 类名（可选）
   */
  'class'?: string;
}
````

**行为**:

- 显示提交按钮
- 可选显示答题进度（例如："已作答 3/5 题"）
- 点击按钮时触发 `quiz-submit` 事件
- 支持禁用状态（如果已提交）

**事件**:

- `quiz-submit`: 当用户点击提交按钮时触发
  ```typescript
  {
    detail: {
      // 事件详情为空，QuizPlayer 会监听此事件并调用 submit()
    }
  }
  ```

**视觉设计规范**:

1. **尺寸与间距**:
   - 按钮最小点击区域：44×44px（符合移动端触摸标准）
   - 按钮高度：48-56px（桌面端），44-48px（移动端）
   - 按钮内边距：16-24px 水平，12-16px 垂直
   - 按钮与进度文本间距：12-16px
   - 按钮与容器边缘间距：24-32px

2. **颜色与对比度**:
   - 主按钮背景色：使用主题的主色调（如 `--color-primary`）
   - 按钮文字颜色：与背景有至少 4.5:1 的对比度（WCAG AA 标准）
   - 悬停状态：背景色加深 10-15%，或添加阴影效果
   - 激活状态：背景色加深 20-25%
   - 禁用状态：透明度 50%，背景色使用灰色调
   - 进度文本：使用次要文本颜色，与主文本有 3:1 对比度

3. **字体与排版**:
   - 按钮文字：16-18px，字重 500-600（Medium/SemiBold）
   - 进度文本：14-16px，字重 400（Regular）
   - 行高：1.5（确保可读性）
   - 文字对齐：居中对齐

4. **视觉层次**:
   - 按钮应该是最突出的元素（使用主色调）
   - 进度信息作为辅助信息（使用次要颜色）
   - 使用阴影或边框增强按钮的视觉重量

5. **响应式设计**:
   - 移动端：按钮宽度 100%（减去边距），最大宽度 400px
   - 桌面端：按钮宽度自适应内容，最小宽度 200px
   - 平板端：按钮宽度 80%，最大宽度 400px

6. **主题系统集成**:
   - 使用 CSS 变量支持主题切换
   - 深色/浅色主题自动适配
   - 支持自定义主题配置

**交互设计规范**:

1. **状态定义**:
   - **默认状态**: 按钮可点击，显示正常样式
   - **悬停状态**: 鼠标悬停时显示视觉反馈（颜色变化、阴影增强）
   - **激活状态**: 点击时显示按下效果（颜色加深、轻微位移）
   - **加载状态**: 提交中显示加载动画，按钮禁用
   - **禁用状态**: 已提交或不可提交时显示禁用样式
   - **错误状态**: 提交失败时显示错误提示（可选）

2. **反馈机制**:
   - **即时反馈**: 点击按钮后立即显示加载状态（200ms 内）
   - **视觉反馈**: 使用微动画（fade、scale）增强交互感
   - **进度反馈**: 显示答题进度（如 "已作答 3/5 题"）
   - **完成反馈**: 提交成功后显示成功提示或跳转到结果页

3. **动画设计**:
   - 按钮点击动画：scale(0.98) 持续 150ms
   - 悬停动画：transition 200ms ease-in-out
   - 加载动画：旋转图标或进度条
   - 状态切换动画：fade 300ms

4. **可访问性**:
   - 键盘导航：支持 Tab 键聚焦，Enter/Space 键触发
   - 屏幕阅读器：提供清晰的 aria-label 和 role
   - 焦点指示：清晰的焦点环（2px solid，对比色）
   - 语义化 HTML：使用 `<button>` 元素而非 `<div>`

5. **错误处理**:
   - 未完成所有题目时：显示提示信息（如 "还有 2 题未作答"）
   - 提交失败时：显示错误消息，允许重试
   - 网络错误时：提供离线提示和重试选项

### QuizPlayer 集成

**答案收集监听**:

- QuizPlayer 在 `init()` 时设置 `answer-change` 事件监听器
- 当 `wsx-quiz-question` 组件触发 `answer-change` 事件时，自动调用 `setAnswer()`
- 实时更新内部 `answers` 对象

**提交按钮监听**:

- QuizPlayer 在 `init()` 时设置 `quiz-submit` 事件监听器
- 当 `wsx-quiz-submit` 组件触发 `quiz-submit` 事件时，调用 `submit()` 方法
- 生成 Result DSL 并触发 `onSubmit` 回调

**结果展示 UI 设计**:

1. **结果页面布局**:
   - **顶部摘要**: 显示总分、百分比、通过状态（大号字体，居中）
   - **统计信息**: 显示答题时长、完成时间等元数据
   - **题目列表**: 每题显示详细结果（用户答案、正确答案、得分）
   - **操作按钮**: 提供"重新开始"、"查看详情"等操作

2. **视觉层次设计**:
   - **主要信息**: 总分和百分比（48-64px 字体，粗体）
   - **次要信息**: 统计数据和元数据（16-18px 字体）
   - **详细信息**: 每题详情（14-16px 字体）
   - **操作按钮**: 次要按钮样式（与提交按钮区分）

3. **结果状态可视化**:
   - **正确题目**: 绿色背景或边框，显示 ✓ 图标
   - **错误题目**: 红色背景或边框，显示 ✗ 图标
   - **得分显示**: 使用进度条或百分比圆环
   - **通过状态**: 使用大号图标和颜色强调（绿色=通过，红色=未通过）

4. **交互设计**:
   - **展开/折叠**: 每题详情可以展开/折叠查看
   - **滚动行为**: 长列表支持平滑滚动
   - **导航支持**: 支持返回查看题目或重新答题
   - **分享功能**: 提供结果分享按钮（可选）

5. **反馈与动画**:
   - **加载动画**: 提交后显示加载状态（2-3 秒）
   - **结果出现**: 使用 fade-in 或 slide-up 动画
   - **得分动画**: 数字递增动画（从 0 到实际得分）
   - **状态切换**: 平滑的状态转换动画

6. **响应式设计**:
   - **移动端**: 垂直布局，卡片式设计
   - **桌面端**: 可以并排显示摘要和详情
   - **平板端**: 自适应布局，优化触摸交互

7. **可访问性**:
   - **语义化结构**: 使用 `<section>`, `<article>` 等语义标签
   - **ARIA 标签**: 提供清晰的结果描述
   - **键盘导航**: 支持完整的键盘操作
   - **屏幕阅读器**: 清晰的结果朗读和状态说明

### 用户体验流程设计

**完整的答题流程**:

1. **开始阶段**:
   - 显示欢迎页面（介绍页）
   - 显示测验说明和题目数量
   - 提供"开始答题"按钮

2. **答题阶段**:
   - 一题一页的幻灯片展示
   - 实时记录答案选择
   - 显示答题进度（如 "3/5"）
   - 支持前进/后退导航
   - 已作答题目有视觉标记

3. **提交阶段**:
   - 到达最后一个 slide（提交页）
   - 显示提交按钮和答题进度
   - 点击提交后显示加载状态
   - 如果未完成所有题目，显示提示

4. **结果阶段**:
   - 显示总分和百分比
   - 显示通过/未通过状态
   - 显示每题详细结果
   - 提供"重新开始"或"查看详情"选项

**错误处理流程**:

1. **未完成所有题目**:
   - 显示提示："还有 X 题未作答，确定要提交吗？"
   - 提供"继续答题"和"确认提交"选项
   - 允许返回继续答题

2. **提交失败**:
   - 显示错误消息（网络错误、服务器错误等）
   - 提供"重试"按钮
   - 保存当前答案，允许稍后重试

3. **答案丢失**:
   - 自动保存答案到本地存储
   - 页面刷新后恢复答案
   - 显示"已恢复上次答题进度"提示

### 设计检查清单

**可见性检查**:

- [ ] 提交按钮在所有状态下都清晰可见
- [ ] 答题进度信息易于理解
- [ ] 已作答/未作答状态有明显区分
- [ ] 所有交互元素都有清晰的视觉指示

**反馈检查**:

- [ ] 每个操作都有即时反馈（< 200ms）
- [ ] 答案选择有明确的视觉反馈
- [ ] 提交过程有加载状态提示
- [ ] 结果展示有清晰的视觉层次

**约束检查**:

- [ ] 防止重复提交（提交后按钮禁用）
- [ ] 防止未完成提交（显示提示）
- [ ] 防止意外操作（重要操作需要确认）
- [ ] 限制输入范围（如多选题选项数量）

**映射检查**:

- [ ] 按钮功能与标签一致
- [ ] 导航控件与功能对应
- [ ] 状态指示与实际情况匹配
- [ ] 错误消息与问题对应

**一致性检查**:

- [ ] 设计语言与整体系统一致
- [ ] 交互模式保持一致
- [ ] 颜色和字体使用一致
- [ ] 动画和过渡效果一致

**可访问性检查**:

- [ ] 支持键盘导航
- [ ] 支持屏幕阅读器
- [ ] 颜色对比度符合 WCAG 标准
- [ ] 焦点指示清晰可见
- [ ] 语义化 HTML 结构

**响应式检查**:

- [ ] 移动端布局优化
- [ ] 触摸目标大小合适（≥ 44×44px）
- [ ] 桌面端布局合理
- [ ] 平板端自适应良好

### 默认 Slide DSL 中的提交按钮

在默认 `quiz.slide` 文件的 `rule end` 中使用 `wsx-quiz-submit` 组件：

```javascript
// 结束规则：提交页（必需）
rule end "submit" {
  slide {
    content dynamic {
      name "wsx-quiz-submit"
      attrs {
        "button-text": "提交答案"
        "show-progress": true
      }
    }
    behavior {
      transition zoom {
        duration 500
      }
    }
  }
}
```

## 核心组件依赖

### QuizPlayer 依赖（@quizerjs/quizerjs）

#### @quizerjs/core 组件

- `QuizBlock`: 纯 UI 组件，用于在幻灯片中渲染测验问题和收集答案。通过 `disabled` 和 `result` 属性控制显示状态。
- `wsx-quiz-submit`: 提交按钮组件，用于在最后一个 slide 中显示提交按钮并触发提交事件。

#### @quizerjs/dsl 功能

- `validateQuizDSL`: Quiz DSL 验证
- `parseQuizDSL`: Quiz DSL 解析
- `QuizDSL`: Quiz DSL 类型定义

#### @slidejs 包

- `@slidejs/dsl`: Slide DSL 解析器和编译器
- `@slidejs/runner`: SlideRunner 核心
- `@slidejs/runner-swiper`: Swiper 适配器
- `@slidejs/context`: SlideContext 类型定义

### MarkdownPlayer 依赖（@quizerjs/player-markdown）

#### @quizerjs/core 组件

- `QuizBlock`: 纯 UI 组件，用于在文档中渲染测验问题和收集答案。通过 `disabled` 和 `result` 属性控制显示状态。
- `calculateScore`: 分数计算函数

#### @quizerjs/dsl 功能

- `validateQuizDSL`: Quiz DSL 验证
- `parseQuizDSL`: Quiz DSL 解析
- `QuizDSL`: Quiz DSL 类型定义

#### 第三方库

- `marked`: Markdown 解析器

## 类型定义

```typescript
// 从 @quizerjs/dsl 导入
import type { QuizDSL, Question, QuestionType } from '@quizerjs/dsl';

// 从 @quizerjs/core 导入（如果类型定义在 core 中）
import type { AnswerValue } from '@quizerjs/core';

// 播放器内部定义的类型
import type { QuizResult, QuestionResult } from '@quizerjs/quizerjs';

// 从 @slidejs 导入（仅 QuizPlayer 使用）
import type { SlideContext, SlideRunner } from '@slidejs/runner';
import type { SlideContext as SlideContextType } from '@slidejs/context';

// 主题相关类型定义
/**
 * 支持的主题名称
 */
type ThemeName = 'solarized-dark' | 'solarized-light' | 'dark' | 'light';

/**
 * 主题配置对象（用于 @slidejs/theme）
 * 所有属性都是可选的，允许部分覆盖预设主题
 * 支持扩展，可以添加额外的自定义属性
 */
interface ThemeConfig {
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  navigationColor?: string;
  paginationColor?: string;
  paginationActiveColor?: string;
  scrollbarBg?: string;
  scrollbarDragBg?: string;
  arrowColor?: string;
  progressBarColor?: string;
  headingColor?: string;
  codeBackground?: string;
  [key: string]: string | undefined; // 允许扩展自定义属性
}
```

## 错误处理

```typescript
class PlayerError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'PlayerError';
  }
}

enum PlayerErrorCode {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  INVALID_QUIZ_DSL = 'INVALID_QUIZ_DSL',
  INVALID_SLIDE_DSL = 'INVALID_SLIDE_DSL',
  CONTAINER_NOT_FOUND = 'CONTAINER_NOT_FOUND',
  RENDER_ERROR = 'RENDER_ERROR',
  SUBMIT_ERROR = 'SUBMIT_ERROR',
  ANSWER_COLLECTION_ERROR = 'ANSWER_COLLECTION_ERROR',
}
```

### 错误处理示例

```typescript
try {
  const player = new SlidePlayer(options);
  await player.init();
} catch (error) {
  if (error instanceof PlayerError) {
    switch (error.code) {
      case PlayerErrorCode.INVALID_QUIZ_DSL:
        console.error('Quiz DSL 格式错误:', error.message);
        break;
      case PlayerErrorCode.INVALID_SLIDE_DSL:
        console.error('Slide DSL 格式错误:', error.message);
        break;
      case PlayerErrorCode.CONTAINER_NOT_FOUND:
        console.error('容器元素未找到:', error.message);
        break;
      default:
        console.error('播放器错误:', error.message);
    }
  } else {
    console.error('未知错误:', error);
  }
}
```

## 主题支持

### 概述

QuizPlayer 支持基于 `@slidejs/theme` 的主题系统，允许用户通过预设主题名称或自定义主题配置对象来设置播放器的视觉样式。

### 设计原则

1. **灵活性**：支持预设主题（快速使用）和自定义主题配置（完全控制）
2. **默认值**：未指定主题时，默认使用 `'solarized-dark'` 主题
3. **运行时切换**：支持在运行时通过 `setTheme()` 方法切换主题
4. **向后兼容**：保持现有 API 的兼容性

### 预设主题

QuizPlayer 内置了 4 个预设主题：

1. **`'solarized-dark'`**（默认）：基于 Solarized 调色板的深色主题
   - 背景色：`#002b36` (base03)
   - 文本色：`#839496` (base0)
   - 强调色：`#268bd2` (blue)

2. **`'solarized-light'`**：基于 Solarized 调色板的浅色主题
   - 背景色：`#fdf6e3` (base3)
   - 文本色：`#586e75` (base00)
   - 强调色：`#268bd2` (blue)

3. **`'dark'`**：标准深色主题
   - 背景色：`#1a1a1a`
   - 文本色：`#e0e0e0`
   - 强调色：`#4a9eff`

4. **`'light'`**：标准浅色主题
   - 背景色：`#ffffff`
   - 文本色：`#333333`
   - 强调色：`#0066cc`

### 自定义主题配置

`ThemeConfig` 接口定义了所有可配置的主题属性：

```typescript
interface ThemeConfig {
  backgroundColor?: string; // 背景色
  textColor?: string; // 文本色
  linkColor?: string; // 链接色
  navigationColor?: string; // 导航按钮颜色
  paginationColor?: string; // 分页指示器颜色
  paginationActiveColor?: string; // 活动分页指示器颜色
  scrollbarBg?: string; // 滚动条背景色
  scrollbarDragBg?: string; // 滚动条拖拽背景色
  arrowColor?: string; // 箭头颜色
  progressBarColor?: string; // 进度条颜色
  headingColor?: string; // 标题颜色
  codeBackground?: string; // 代码块背景色
  [key: string]: string | undefined; // 允许扩展自定义属性
}
```

所有属性都是可选的，允许部分覆盖预设主题。例如，可以只覆盖背景色和文本色，其他属性使用预设值。

### 使用方式

#### 1. 初始化时设置主题

```typescript
// 使用预设主题名称
const player = new QuizPlayer({
  container: '#quiz-container',
  quizDSL: myQuiz,
  theme: 'solarized-dark', // 或 'solarized-light', 'dark', 'light'
});

// 使用自定义主题配置
const player2 = new QuizPlayer({
  container: '#quiz-container',
  quizDSL: myQuiz,
  theme: {
    backgroundColor: '#002b36',
    textColor: '#839496',
    linkColor: '#268bd2',
    // 可以只设置部分属性，其他使用默认值
  },
});

// 不指定主题，使用默认的 'solarized-dark'
const player3 = new QuizPlayer({
  container: '#quiz-container',
  quizDSL: myQuiz,
  // theme 未指定，自动使用 'solarized-dark'
});
```

#### 2. 运行时切换主题

```typescript
// 切换到预设主题
await player.setTheme('solarized-light');

// 切换到自定义主题
await player.setTheme({
  backgroundColor: '#ffffff',
  textColor: '#000000',
  linkColor: '#0066cc',
});
```

### 主题应用时机

- **初始化时**：如果 `QuizPlayerOptions.theme` 已指定，在 `init()` 方法中自动应用
- **默认主题**：如果未指定 `theme` 选项，自动使用 `'solarized-dark'`
- **运行时**：通过 `setTheme()` 方法可以在任何时候切换主题

### 实现细节

1. **主题映射**：预设主题名称通过 `THEME_PRESETS` 常量映射到对应的 `ThemeConfig` 对象
2. **动态导入**：`setTheme()` 方法动态导入 `@slidejs/theme` 包并应用主题配置
3. **必需依赖**：`@slidejs/theme` 是 QuizPlayer 的必需依赖，需要确保已正确安装

### 与 @slidejs/theme 的集成

QuizPlayer 的主题系统基于 `@slidejs/theme` 包实现。`setTheme()` 方法内部调用 `@slidejs/theme` 的 `setTheme()` 函数来应用主题配置。

### @quizerjs/theme 包（应用级主题管理）

`@quizerjs/theme` 包提供了统一的主题管理 API，用于在应用级别统一管理 Player 和 Editor 的主题。这个包特别适用于 React、Vue 等框架的集成。

#### 包结构

```
@quizerjs/theme
├── player.ts - Player 主题 API（基于 @slidejs/theme）
├── editor.ts - Editor 主题 API（CSS Hook API）
└── index.ts - 统一导出
```

#### 核心 API

**Player 主题 API** (`setPlayerTheme`):

- 基于 `@slidejs/theme` 实现
- 支持预设主题名称：`'solarized-dark' | 'solarized-light' | 'dark' | 'light'`
- 支持自定义 `PlayerThemeConfig` 对象
- 在 `:root` 上设置 CSS 变量（通过 `@slidejs/theme`）

**Editor 主题 API** (`setEditorTheme`):

- 独立的 Editor 主题系统
- 支持相同的预设主题名称
- 支持自定义 `EditorThemeConfig` 对象
- 在 `:root` 上设置 QuizerJS CSS 变量（用于编辑器 UI）

#### 使用示例

```typescript
import { setPlayerTheme, setEditorTheme } from '@quizerjs/theme';

// 统一设置主题（推荐）
const applyTheme = (isDark: boolean) => {
  const themeName = isDark ? 'solarized-dark' : 'solarized-light';

  // Player 主题（用于 QuizPlayer）
  setPlayerTheme(themeName);

  // Editor 主题（用于 QuizEditor 和应用级 UI）
  setEditorTheme(themeName);
};

// React/Vue 集成示例
// React Hook
export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  return { isDark, toggleTheme: () => setIsDark(!isDark) };
}

// Vue Composable
export function useTheme() {
  const isDark = ref(false);

  watch(isDark, newValue => {
    applyTheme(newValue);
  });

  return { isDark, toggleTheme: () => (isDark.value = !isDark.value) };
}
```

#### 主题预设

`@quizerjs/theme` 包提供了 4 个预设主题，Player 和 Editor 共享相同的主题名称：

1. **`'solarized-dark'`** - Solarized 深色主题（默认）
2. **`'solarized-light'`** - Solarized 浅色主题
3. **`'dark'`** - 标准深色主题
4. **`'light'`** - 标准浅色主题

#### 与 QuizPlayer 的关系

- `QuizPlayer` 内部使用 `@slidejs/theme` 来设置 Player 主题
- `@quizerjs/theme` 的 `setPlayerTheme` 是对 `@slidejs/theme` 的封装
- 在应用级别，推荐使用 `@quizerjs/theme` 来统一管理主题，确保 Player 和 Editor 主题一致

## 使用示例

### QuizPlayer 使用示例（@quizerjs/quizerjs）

```typescript
import { QuizPlayer } from '@quizerjs/quizerjs';
import type { QuizDSL, ResultDSL } from '@quizerjs/dsl';

const container = document.getElementById('player')!;
const quizDSL: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'math-quiz',
    title: '数学测验',
    questions: [
      // ... 问题数据
    ],
  },
};

// Slide DSL 定义（定义如何将 Quiz DSL 转换为幻灯片）
const slideDSL = `
present quiz "math-quiz" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "欢迎参加数学测验"
          "本测验包含 " + quiz.questions.length + " 道题目"
        }
      }
    }
    
    rule content "questions" {
      for question in quiz.questions {
        slide {
          content dynamic {
            name "wsx-quiz-question"
            attrs {
              question question
            }
          }
        }
      }
    }
    
    rule end "thanks" {
      slide {
        content text {
          "感谢您的参与！"
        }
      }
    }
  }
}
`;

// 使用预设主题初始化
const player = new QuizPlayer({
  container,
  quizDSL,
  slideDSL,
  theme: 'solarized-dark', // 使用预设主题
  swiperOptions: {
    navigation: true,
    pagination: true,
    keyboard: {
      enabled: true,
    },
  },
  onSubmit: (resultDSL: ResultDSL) => {
    console.log('测验结果:', resultDSL);
    // 保存 Result DSL
    localStorage.setItem(`result-${resultDSL.metadata.id}`, JSON.stringify(resultDSL));
  },
  onAnswerChange: (questionId, answer) => {
    console.log(`问题 ${questionId} 的答案已更新:`, answer);
  },
});

await player.init();

// 运行时切换主题
await player.setTheme('solarized-light'); // 切换到浅色主题

// 使用自定义主题配置
await player.setTheme({
  backgroundColor: '#002b36',
  textColor: '#839496',
  linkColor: '#268bd2',
  navigationColor: '#839496',
  paginationColor: '#586e75',
  paginationActiveColor: '#268bd2',
});
```

### 主题使用示例

```typescript
import { QuizPlayer } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';

const container = document.getElementById('player')!;
const quizDSL: QuizDSL = {
  // ... Quiz DSL 数据
};

// 示例 1: 使用预设主题名称
const player1 = new QuizPlayer({
  container,
  quizDSL,
  theme: 'solarized-dark', // 预设主题
});

await player1.init();

// 示例 2: 使用自定义主题配置
const player2 = new QuizPlayer({
  container,
  quizDSL,
  theme: {
    backgroundColor: '#002b36',
    textColor: '#839496',
    linkColor: '#268bd2',
    navigationColor: '#839496',
    paginationColor: '#586e75',
    paginationActiveColor: '#268bd2',
  },
});

await player2.init();

// 示例 3: 不指定主题，使用默认的 'solarized-dark'
const player3 = new QuizPlayer({
  container,
  quizDSL,
  // theme 未指定，自动使用 'solarized-dark'
});

await player3.init();

// 示例 4: 运行时切换主题
const player4 = new QuizPlayer({
  container,
  quizDSL,
  theme: 'solarized-dark', // 初始主题
});

await player4.init();

// 切换到浅色主题
await player4.setTheme('solarized-light');

// 切换到自定义主题
await player4.setTheme({
  backgroundColor: '#ffffff',
  textColor: '#000000',
  linkColor: '#0066cc',
});
```

### MarkdownPlayer 使用示例（@quizerjs/player-markdown）

```typescript
import { MarkdownPlayer } from '@quizerjs/player-markdown';
import type { QuizDSL, ResultDSL } from '@quizerjs/dsl';

const container = document.getElementById('player')!;
const quizDSL: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'math-quiz',
    title: '数学测验',
    description: '这是一个测试你对数学基础知识的测验',
    questions: [
      // ... 问题数据
    ],
  },
};

// 使用 MarkdownPlayer
const player = new MarkdownPlayer({
  container,
  quizDSL,
  markdownConfig: {
      markedOptions: {
        breaks: true,
        gfm: true,
      },
      scrollBehavior: 'smooth',
      customClass: 'my-quiz-doc',
    },
  },
  onSubmit: (resultDSL: ResultDSL) => {
    console.log('测验结果:', resultDSL);
    // 保存 Result DSL
    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultDSL),
    });
  },
  onAnswerChange: (questionId, answer) => {
    console.log(`问题 ${questionId} 的答案已更新:`, answer);
  },
});

await player.init();
```

### 从 Result DSL 恢复状态

```typescript
// 从存储中读取 Result DSL
const savedResultDSL: ResultDSL = JSON.parse(localStorage.getItem('result-xxx') || '{}');

// 使用 Result DSL 恢复状态（只读模式，用于查看结果）
const player = new MarkdownPlayer({
  container: '#player',
  resultDSL: savedResultDSL,
  readOnly: true, // 只读模式
  showResults: true,
});

await player.init();
```

## Slide DSL 设计

### 概述

Slide DSL 是一个独立的领域特定语言，用于定义如何将 Quiz DSL 数据转换为 reveal.js 幻灯片。它采用声明式语法，支持规则引擎和模板变量系统。

### 根声明：`present type name`

**语法**:

```javascript
present quiz "my quiz" {
  rules {
    // 规则定义
  }
}
```

**类型说明**:

- `present`: 关键字，表示这是一个演示文稿定义
- `type`: 支持的类型标识符
  - `quiz`: **当前支持的类型**，表示要为 Quiz DSL 数据生成 slides
  - 未来可能支持的类型：`survey`、`form`、`assessment` 等
- `name`: 演示文稿名称（字符串，用引号包裹），会映射到 JSON 的 `quizId` 字段

**语义**:

- 当指定 `present quiz` 时，表示要为 Quiz DSL 数据生成幻灯片
- 编译器会根据 `quiz` 类型，提供相应的数据上下文（如 `quiz.questions`、`quiz.sections` 等）
- `name` 参数用于标识这个演示文稿，在编译后的 JSON 中作为 `quizId`

**示例**:

```javascript
// 为 Quiz DSL 生成幻灯片
present quiz "math-quiz" {
  rules {
    // 规则定义
  }
}

// 未来可能支持的类型（示例）
// present survey "user-feedback" { ... }
// present form "registration" { ... }
```

### 规则类型

Slide DSL 支持三种规则类型：

1. **`rule start`**: 开始规则（必需），在内容前执行，用于生成介绍页
2. **`rule content`**: 内容规则（可选），从数据动态生成 slides
3. **`rule end`**: 结束规则（必需），在内容后执行，用于生成总结页

**执行顺序**: `start` → `content`（按定义顺序）→ `end`

### 内容类型

**1. 动态内容（WSX 组件）**:

```javascript
content dynamic {
  name "wsx-quiz-question"
  attrs {
    title section.title      // key value 格式
    question question        // key value 格式
    "show-hint" true         // key value 格式（带引号的 key）
  }
}
```

**2. 文本内容（直接文本）**:

```javascript
content text {
  "欢迎参加测验"
  "本测验包含 " + quiz.questions.length + " 道题目"
}
```

### 行为配置（Behavior）

**语法**:

```javascript
behavior {
  transition [type] {
    // transition 参数配置
  }
  // 其他行为配置（如 background、fragments 等）
}
```

**Transition 配置**:

- `transition`: 过渡动画类型（如 `slide`、`zoom`、`fade`、`cube` 等）
- Transition 块中可以包含参数配置，用于自定义过渡效果
- 参数示例：`speed`、`direction`、`easing` 等（具体参数取决于 reveal.js 的实现）

**示例**:

```javascript
behavior {
  transition slide {
    speed "fast"        // 过渡速度
    direction "horizontal"  // 过渡方向
  }

  transition zoom {
    duration 500        // 持续时间（毫秒）
  }
}
```

### 完整示例

```javascript
// Slide DSL 文件（.dsl 扩展名）
// 语法：present type name
present quiz "my quiz" {
  rules {
    // 开始规则：介绍页（必需）
    rule start "intro" {
      slide {
        content dynamic {
          name "wsx-quiz-intro"
          attrs {
            title "欢迎参加测验"
            body "本测验包含 " + quiz.questions.length + " 道题目"
          }
        }
        behavior {
          transition zoom {
            duration 500
          }
        }
      }
    }

    // 内容规则：问题 slides（从数据生成）
    rule content "questions" {
      for section in quiz.sections {
        for question in section.questions {
          slide {
            content dynamic {
              name "wsx-quiz-question"
              attrs {
                title section.title      // key value 格式
                question question        // key value 格式
                "show-hint" true         // key value 格式（带引号的 key）
              }
            }
            behavior {
              transition slide {
                speed "fast"
                direction "horizontal"
              }
            }
          }
        }
      }
    }

    // 结束规则：提交页（必需）
    rule end "submit" {
      slide {
        content dynamic {
          name "wsx-quiz-submit"
          attrs {
            "button-text": "提交答案"
            "show-progress": true
          }
        }
        behavior {
          transition zoom {
            duration 500
          }
        }
      }
    }
  }
}
```

## 实施计划

### 阶段 1: Slide DSL 核心（@slidejs 包）

1. ✅ 设计 Slide DSL JSON 格式规范
2. ✅ 实现 Slide DSL 解析器（JSON）
3. ✅ 实现规则引擎
4. ✅ 实现模板变量系统
5. 📋 编写单元测试

**状态**: 已完成（@slidejs 包已实现）

### 阶段 2: DSL 语法支持（@slidejs 包）

1. ✅ 设计 DSL 语法规范
2. ✅ 实现 DSL 语法解析器（Lexer + Parser）
3. ✅ 实现 DSL 语法到 JSON 的编译器
4. 📋 编写单元测试

**状态**: 已完成（@slidejs 包已实现）

### 阶段 3: Swiper 集成（@slidejs 包）

1. ✅ 安装 swiper 依赖
2. ✅ 实现 Swiper 适配器（@slidejs/runner-swiper）
3. ✅ 实现 WSX 组件集成
4. ✅ 实现 Swiper 特性支持（导航、分页、键盘控制等）
5. 📋 编写集成测试

**状态**: 已完成（@slidejs/runner-swiper 包已实现）

### 阶段 4: QuizPlayer 实现（@quizerjs/quizerjs）

1. ✅ 创建 `@quizerjs/quizerjs` 包结构
2. ✅ 创建 QuizPlayer 类基础结构
3. ✅ 集成 `@slidejs/runner-swiper`（动态导入）
4. ✅ 实现 Quiz DSL 到 SlideContext 的转换
5. ✅ 实现答案收集和评分
6. ✅ 实现答案变更事件监听
7. ✅ 实现 Result DSL 生成
8. ✅ 创建默认 Slide DSL（quiz.slide 文件）
9. ✅ 实现类型定义（QuizPlayerOptions, ResultDSL, QuestionResult 等）
10. ✅ 实现状态恢复（从 Result DSL 恢复）
11. ✅ 创建 `wsx-quiz-question` 组件（用于在 Slide 中显示单个问题）
12. ✅ 实现结果渲染（renderResults 方法）
13. ✅ 创建 `wsx-quiz-results` 组件（用于显示测验结果）
14. ✅ 创建测试 Demo（已移除，Player 功能已集成到 Vue/React/Svelte demo 中）
15. ✅ **主题支持**（2025-01-27 新增）
    - ✅ 基于 `@slidejs/theme` 的主题系统集成
    - ✅ 实现预设主题映射（solarized-dark, solarized-light, dark, light）
    - ✅ 实现 `setTheme()` 方法（支持主题名称和自定义配置）
    - ✅ 在 `init()` 方法中自动应用默认主题（solarized-dark）
    - ✅ 扩展 `QuizPlayerOptions` 接口，添加 `theme` 选项
    - ✅ 添加类型定义（`ThemeName`, `ThemeConfig`）
16. 📋 编写单元测试和集成测试

**状态**: 核心功能已完成（约 98%），剩余单元测试和集成测试

**已完成项**:

- ✅ QuizPlayer 类核心实现
- ✅ 答案收集和评分逻辑
- ✅ Result DSL 生成
- ✅ 默认 Slide DSL 支持
- ✅ 类型定义完整
- ✅ **主题支持**（2025-01-27 新增）
  - ✅ 基于 `@slidejs/theme` 的主题系统
  - ✅ 支持预设主题名称（'solarized-dark', 'solarized-light', 'dark', 'light'）
  - ✅ 支持自定义主题配置对象
  - ✅ 默认主题：'solarized-dark'
  - ✅ 运行时主题切换 API（`setTheme()` 方法）
  - ✅ 类型定义（`ThemeName`, `ThemeConfig`）
  - ✅ 主题预设映射（`THEME_PRESETS`）

**待完成项**:

- 📋 单元测试和集成测试

### 阶段 5: MarkdownPlayer 实现（@quizerjs/player-markdown）

1. 📋 创建 `@quizerjs/player-markdown` 包结构
2. 📋 创建 MarkdownPlayer 类基础结构
3. 📋 实现 Quiz DSL 到 Markdown 的转换
4. 📋 使用 marked.js 渲染 Markdown
5. 📋 实现答题组件嵌入逻辑
6. 📋 实现答案收集和评分
7. 📋 实现 Result DSL 生成（与 QuizPlayer 共享格式）
8. 📋 编写单元测试和集成测试

**状态**: 未开始

### 阶段 6: 核心组件支持（@quizerjs/core）

1. ✅ `quiz-player.wsx` - 完整测验播放器组件（已存在）
2. ✅ `quiz-option.wsx` - 选项组件（已存在）
3. ✅ `quiz-option-list.wsx` - 选项列表组件（已存在）
4. ✅ `quiz-question-header.wsx` - 问题标题组件（已存在）
5. ✅ `quiz-question-description.wsx` - 问题描述组件（已存在）
6. ✅ `quiz-question.wsx` - **单个问题组件（用于 Slide 中显示）** ✅ **已完成**
7. ✅ `quiz-results.wsx` - **结果组件（用于显示测验结果）** ✅ **已完成**
8. 📋 `quiz-submit.wsx` - **提交按钮组件（用于最后一个 slide）** ⚠️ **需要创建**
9. 📋 `quiz-block.wsx` - 问题块组件（用于 Markdown 中嵌入） ⚠️ **需要创建**

**状态**: 大部分完成，缺少提交按钮组件和 Markdown 专用组件

## 依赖关系

### @quizerjs/quizerjs 核心依赖

```
@quizerjs/quizerjs (QuizPlayer)
├── @quizerjs/dsl (必需) - Quiz DSL 类型和验证，包括 ResultDSL 类型定义
├── @quizerjs/core (必需) - QuizBlock 组件和评分逻辑
├── @slidejs/dsl (必需) - Slide DSL 解析器和编译器
├── @slidejs/runner (必需) - SlideRunner 核心
├── @slidejs/runner-swiper (必需) - Swiper 适配器
├── @slidejs/context (必需) - SlideContext 类型
├── @slidejs/theme (必需) - 主题系统支持（用于主题设置）
└── swiper (必需) - Swiper.js 库
```

**注意**：

- `@quizerjs/quizerjs` 包中的 `QuizPlayer` 始终是 Slide 播放器，不包含 Markdown 相关代码
- **ResultDSL、QuestionResult、AnswerValue 类型定义在 `@quizerjs/dsl` 包中**，所有包都应该从 DSL 包导入这些类型
- `@slidejs/theme` 是必需依赖，用于主题支持功能

### @quizerjs/player-markdown 依赖

```
@quizerjs/player-markdown (MarkdownPlayer)
├── @quizerjs/dsl (必需) - Quiz DSL 类型和验证
├── @quizerjs/core (必需) - QuizBlock 组件和评分逻辑
└── marked (必需) - Markdown 解析器
```

**注意**：`@quizerjs/player-markdown` 是可选扩展包，需要单独安装。不包含 Slide 相关代码（@slidejs/\*, swiper）

### @quizerjs/theme 包（应用级主题管理）

```
@quizerjs/theme
├── @slidejs/theme (必需) - Player 主题支持（通过 @slidejs/theme 实现）
└── (无其他依赖) - Editor 主题通过 CSS Hook API 实现
```

**功能**：

- 提供统一的主题管理 API（`setPlayerTheme`, `setEditorTheme`）
- 支持预设主题名称和自定义主题配置
- 适用于 React、Vue 等框架的应用级主题管理
- Player 主题基于 `@slidejs/theme`，Editor 主题通过 CSS 变量实现

**使用场景**：

- React/Vue/Svelte 等框架的 demo 应用
- 需要统一管理 Player 和 Editor 主题的应用
- 需要运行时切换主题的应用

## 参考

- [RFC 0001: Quiz DSL 规范](./completed/0001-quiz-dsl-specification.md)
- [RFC 0002: 架构设计](./0002-architecture-design.md)
- [RFC 0005: 编辑器核心组件设计](./completed/0005-editor-core.md)
- [Slide DSL 设计](./0006-player-core.md#slide-dsl-设计) - 本文档中的 Slide DSL 设计部分
- [marked.js 文档](https://marked.js.org/)
- [Swiper.js 文档](https://swiperjs.com/)
- [@slidejs 文档](../packages/@slidejs/README.md)
