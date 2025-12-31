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
  getResultDSL(): ResultDSL;

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
  getResultDSL(): ResultDSL;

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
      typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!containerElement) {
      throw new Error('Container element not found');
    }

    // 获取容器元素
    const containerElement =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;

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

  getResultDSL(): ResultDSL {
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
    return this.quizDSL.quiz.questions.every(
      question => question.id in this.answers
    );
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

  getResultDSL(): ResultDSL {
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
  onSubmit: (resultDSL) => {
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

  /**
   * 将 Quiz DSL 转换为 Markdown 格式
   */
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

  /**
   * 在 Markdown 渲染后的 HTML 中嵌入答题组件
   */
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

  /**
   * 设置答案监听器
   */
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
```


## 核心组件依赖

### QuizPlayer 依赖（@quizerjs/quizerjs）

#### @quizerjs/core 组件

- `QuizBlock`: 纯 UI 组件，用于在幻灯片中渲染测验问题和收集答案。通过 `disabled` 和 `result` 属性控制显示状态。

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
  backgroundColor?: string;        // 背景色
  textColor?: string;             // 文本色
  linkColor?: string;             // 链接色
  navigationColor?: string;       // 导航按钮颜色
  paginationColor?: string;       // 分页指示器颜色
  paginationActiveColor?: string; // 活动分页指示器颜色
  scrollbarBg?: string;           // 滚动条背景色
  scrollbarDragBg?: string;       // 滚动条拖拽背景色
  arrowColor?: string;            // 箭头颜色
  progressBarColor?: string;      // 进度条颜色
  headingColor?: string;          // 标题颜色
  codeBackground?: string;        // 代码块背景色
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
  theme: 'solarized-dark' // 或 'solarized-light', 'dark', 'light'
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
  }
});

// 不指定主题，使用默认的 'solarized-dark'
const player3 = new QuizPlayer({
  container: '#quiz-container',
  quizDSL: myQuiz
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
  linkColor: '#0066cc'
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
const savedResultDSL: ResultDSL = JSON.parse(
  localStorage.getItem('result-xxx') || '{}'
);

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
    
    // 结束规则：感谢页（必需）
    rule end "thanks" {
      slide {
        content text {
          "感谢您的参与！"
          "测验已完成"
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
8. 📋 `quiz-block.wsx` - 问题块组件（用于 Markdown 中嵌入） ⚠️ **需要创建**

**状态**: 大部分完成，缺少 Slide 和 Markdown 专用组件

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

**注意**：`@quizerjs/player-markdown` 是可选扩展包，需要单独安装。不包含 Slide 相关代码（@slidejs/*, swiper）

## 参考

- [RFC 0001: Quiz DSL 规范](./completed/0001-quiz-dsl-specification.md)
- [RFC 0002: 架构设计](./0002-architecture-design.md)
- [RFC 0005: 编辑器核心组件设计](./completed/0005-editor-core.md)
- [Slide DSL 设计](./0006-player-core.md#slide-dsl-设计) - 本文档中的 Slide DSL 设计部分
- [marked.js 文档](https://marked.js.org/)
- [Swiper.js 文档](https://swiperjs.com/)
- [@slidejs 文档](../packages/@slidejs/README.md)

