# RFC 0006: 播放器核心组件设计

**状态**: 草案 (Draft)  
**创建日期**: 2025-12-07  
**作者**: quizerjs 团队

## 摘要

本文档详细设计 `@quizerjs/quizerjs` 包中的核心组件：`QuizPlayer`，包括 API 设计、实现细节、依赖关系和集成方式。QuizPlayer 支持两种模式：Wizard（幻灯片）和 Doc（文档）。

## 动机

- 明确播放器的详细 API 设计
- 定义核心组件的职责和边界
- 指导实现工作
- 确保与 DSL 和架构设计的一致性

## 设计原则

1. **框架无关**: 纯 JavaScript/TypeScript，不依赖 React/Vue
2. **基于标准**: 使用 marked.js 和 wizard 库（Swiper.js/Embla）等成熟库
3. **双模式支持**: 支持 Wizard（幻灯片）和 Doc（文档）两种播放模式
4. **DSL 驱动**: 所有数据交换使用 Quiz DSL 格式
5. **可扩展**: 支持插件和自定义配置
6. **类型安全**: 完整的 TypeScript 类型定义

## QuizPlayer 设计

### 职责

- 渲染和播放 Quiz DSL
- 支持两种模式：Wizard（幻灯片）和 Doc（文档）
- 收集用户答案
- 计算分数和结果
- 提供提交和结果回调

### API 设计

```typescript
interface QuizPlayerOptions {
  /**
   * 容器元素（必需）
   */
  container: HTMLElement;

  /**
   * Quiz DSL 数据（必需）
   */
  dsl: QuizDSL;

  /**
   * 播放模式（可选，默认 'wizard'）
   */
  mode?: 'wizard' | 'doc';

  /**
   * 初始答案（可选）
   * 用于恢复之前的答题状态
   */
  initialAnswers?: Record<string, AnswerValue>;

  /**
   * 提交回调（可选）
   * 当用户提交测验时触发
   */
  onSubmit?: (result: QuizResult) => void;

  /**
   * 答案变更回调（可选）
   * 当用户修改答案时触发
   */
  onAnswerChange?: (questionId: string, answer: AnswerValue) => void;

  /**
   * 模式切换回调（可选）
   */
  onModeChange?: (mode: 'wizard' | 'doc') => void;

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
   * Wizard 模式配置（可选）
   */
  wizardConfig?: WizardPlayerConfig;

  /**
   * Doc 模式配置（可选）
   */
  docConfig?: DocPlayerConfig;
}

interface WizardPlayerConfig {
  /**
   * 动画库选择（可选，默认 'swiper'）
   */
  animationLibrary?: 'swiper' | 'embla';

  /**
   * 动画配置
   */
  animationOptions?: Record<string, unknown>;

  /**
   * 显示进度条（可选，默认 true）
   */
  showProgress?: boolean;

  /**
   * 显示导航按钮（可选，默认 true）
   */
  showNavigation?: boolean;

  /**
   * 键盘导航（可选，默认 true）
   */
  keyboardNavigation?: boolean;
}

interface DocPlayerConfig {
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
}

interface QuizResult {
  /**
   * 用户答案
   */
  answers: Record<string, AnswerValue>;

  /**
   * 总分数
   */
  totalScore: number;

  /**
   * 最高分数
   */
  maxScore: number;

  /**
   * 通过状态
   */
  passed: boolean;

  /**
   * 每题结果
   */
  questionResults: QuestionResult[];

  /**
   * 完成时间（毫秒）
   */
  duration?: number;
}

interface QuestionResult {
  questionId: string;
  correct: boolean;
  score: number;
  maxScore: number;
  userAnswer: AnswerValue;
  correctAnswer: AnswerValue;
}

type AnswerValue = string | string[] | number | boolean;

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
   */
  submit(): QuizResult;

  /**
   * 获取当前分数（不提交）
   */
  getCurrentScore(): number;

  /**
   * 切换模式
   */
  switchMode(mode: 'wizard' | 'doc'): Promise<void>;

  /**
   * 重置答案
   */
  reset(): void;

  /**
   * 销毁播放器实例
   */
  destroy(): Promise<void>;

  /**
   * 获取当前模式
   */
  getMode(): 'wizard' | 'doc';

  /**
   * 检查是否已回答所有问题
   */
  isComplete(): boolean;
}
```

### 实现细节

#### 1. Wizard Mode 实现

```typescript
import Swiper from 'swiper';
import { QuizBlock } from '@quizerjs/core';

class QuizPlayer {
  private mode: 'wizard' | 'doc' = 'wizard';
  private swiper: Swiper | null = null;
  private answers: Record<string, AnswerValue> = {};
  private startTime: number = Date.now();

  async init(): Promise<void> {
    if (this.options.mode === 'wizard') {
      await this.initWizardMode();
    } else {
      await this.initDocMode();
    }
  }

  private async initWizardMode(): Promise<void> {
    const { container, dsl, wizardConfig } = this.options;

    // 创建幻灯片容器
    const swiperWrapper = document.createElement('div');
    swiperWrapper.className = 'swiper';
    container.appendChild(swiperWrapper);

    const swiperSlideWrapper = document.createElement('div');
    swiperSlideWrapper.className = 'swiper-wrapper';
    swiperWrapper.appendChild(swiperSlideWrapper);

    // 为每个问题创建幻灯片
    dsl.quiz.questions.forEach((question, index) => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';

      // 使用 @quizerjs/core 的 QuizBlock 渲染问题
      // QuizBlock 是纯 UI 组件，不需要 mode 参数
      const quizBlock = document.createElement('quiz-block');
      quizBlock.setAttribute('data-quiz-data', JSON.stringify({ questions: [question] }));
      slide.appendChild(quizBlock);

      swiperSlideWrapper.appendChild(slide);
    });

    // 初始化 Swiper
    this.swiper = new Swiper(swiperWrapper, {
      slidesPerView: 1,
      spaceBetween: 30,
      navigation:
        wizardConfig?.showNavigation !== false
          ? {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }
          : false,
      keyboard:
        wizardConfig?.keyboardNavigation !== false
          ? {
              enabled: true,
            }
          : false,
      ...wizardConfig?.animationOptions,
    });

    // 添加进度条（如果启用）
    if (wizardConfig?.showProgress !== false) {
      this.renderProgressBar();
    }
  }

  private renderProgressBar(): void {
    // 实现进度条渲染
  }
}
```

#### 2. Doc Mode 实现

```typescript
import { marked } from 'marked';
import { QuizBlock } from '@quizerjs/core';

class QuizPlayer {
  private async initDocMode(): Promise<void> {
    const { container, dsl, docConfig } = this.options;

    // 创建文档容器
    const docContainer = document.createElement('div');
    docContainer.className = `quiz-doc-player ${docConfig?.customClass || ''}`;

    // 渲染 Markdown 内容（如果有）
    if (dsl.quiz.description) {
      const descriptionHTML = marked.parse(dsl.quiz.description, docConfig?.markedOptions);
      const descDiv = document.createElement('div');
      descDiv.className = 'quiz-description';
      descDiv.innerHTML = descriptionHTML;
      docContainer.appendChild(descDiv);
    }

    // 渲染每个问题
    dsl.quiz.questions.forEach(question => {
      // 使用 @quizerjs/core 的 QuizBlock 渲染问题
      // QuizBlock 是纯 UI 组件，不需要 mode 参数
      const quizBlock = document.createElement('quiz-block');
      quizBlock.setAttribute('data-quiz-data', JSON.stringify({ questions: [question] }));

      // 监听答案变更
      quizBlock.addEventListener('answer-change', (event: CustomEvent) => {
        const { questionId, answer } = event.detail;
        this.setAnswer(questionId, answer);
      });

      docContainer.appendChild(quizBlock);
    });

    container.appendChild(docContainer);

    // 平滑滚动（如果启用）
    if (docConfig?.scrollBehavior === 'smooth') {
      docContainer.style.scrollBehavior = 'smooth';
    }
  }
}
```

#### 3. 答案收集和评分

```typescript
import { calculateScore } from '@quizerjs/core';

class QuizPlayer {
  setAnswer(questionId: string, answer: AnswerValue): void {
    this.answers[questionId] = answer;
    this.options.onAnswerChange?.(questionId, answer);
  }

  submit(): QuizResult {
    const { dsl } = this.options;
    const duration = Date.now() - this.startTime;

    // 计算分数
    const questionResults = dsl.quiz.questions.map(question => {
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
    const passingScore = dsl.quiz.settings?.passingScore || 0;
    const passed = totalScore >= passingScore;

    const result: QuizResult = {
      answers: { ...this.answers },
      totalScore,
      maxScore,
      passed,
      questionResults,
      duration,
    };

    this.options.onSubmit?.(result);

    // 如果启用结果显示，渲染结果
    if (this.options.showResults !== false) {
      this.renderResults(result);
    }

    return result;
  }

  private isAnswerCorrect(question: Question, userAnswer: AnswerValue): boolean {
    // 根据问题类型判断答案是否正确
    // 实现逻辑...
  }

  private getCorrectAnswer(question: Question): AnswerValue {
    // 获取正确答案
    // 实现逻辑...
  }
}
```

#### 4. 模式切换

```typescript
class QuizPlayer {
  async switchMode(mode: 'wizard' | 'doc'): Promise<void> {
    if (this.mode === mode) {
      return;
    }

    // 保存当前答案
    const currentAnswers = this.getAnswers();

    // 销毁当前模式
    await this.destroy();

    // 切换到新模式
    this.mode = mode;
    this.options.mode = mode;

    // 重新初始化
    await this.init();

    // 恢复答案
    Object.entries(currentAnswers).forEach(([questionId, answer]) => {
      this.setAnswer(questionId, answer);
    });

    this.options.onModeChange?.(mode);
  }
}
```

## 核心组件依赖

### @quizerjs/core 组件

QuizPlayer 需要使用 `@quizerjs/core` 中的组件：

- `QuizBlock`: 纯 UI 组件，用于渲染测验问题和收集答案。不需要 mode 参数，通过 `disabled` 和 `result` 属性控制显示状态。
- `QuizQuestion`: 问题显示组件
- `QuizOption`: 选项显示组件
- `calculateScore`: 分数计算函数

### @quizerjs/dsl 功能

- `validateQuizDSL`: DSL 验证
- `parseQuizDSL`: DSL 解析
- `QuizDSL`: DSL 类型定义

## 类型定义

```typescript
// 从 @quizerjs/dsl 导入
import type { QuizDSL, Question, QuestionType } from '@quizerjs/dsl';

// 从 @quizerjs/core 导入
import type { AnswerValue, QuizResult, QuestionResult } from '@quizerjs/core';
```

## 错误处理

```typescript
class QuizPlayerError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'QuizPlayerError';
  }
}

enum QuizPlayerErrorCode {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  INVALID_DSL = 'INVALID_DSL',
  INVALID_MODE = 'INVALID_MODE',
  RENDER_ERROR = 'RENDER_ERROR',
  SUBMIT_ERROR = 'SUBMIT_ERROR',
}
```

## 使用示例

### QuizPlayer 使用示例

```typescript
import { QuizPlayer } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';

const container = document.getElementById('player')!;
const dsl: QuizDSL = {
  // ... DSL 数据
};

// Wizard 模式
const wizardPlayer = new QuizPlayer({
  container,
  dsl,
  mode: 'wizard',
  wizardConfig: {
    showProgress: true,
    showNavigation: true,
    keyboardNavigation: true,
  },
  onSubmit: result => {
    console.log('测验结果:', result);
  },
});

await wizardPlayer.init();

// Doc 模式
const docPlayer = new QuizPlayer({
  container,
  dsl,
  mode: 'doc',
  docConfig: {
    scrollBehavior: 'smooth',
  },
  onSubmit: result => {
    console.log('测验结果:', result);
  },
});

await docPlayer.init();
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

### 阶段 1: Slide DSL 核心

1. 📋 设计 Slide DSL JSON 格式规范
2. 📋 实现 Slide DSL 解析器（JSON）
3. 📋 实现规则引擎
4. 📋 实现模板变量系统
5. 📋 编写单元测试

### 阶段 2: DSL 语法支持

1. 📋 设计 DSL 语法规范
2. 📋 实现 DSL 语法解析器（Lexer + Parser）
3. 📋 实现 DSL 语法到 JSON 的编译器
4. 📋 编写单元测试

### 阶段 3: reveal.js 集成

1. 📋 安装 reveal.js 依赖
2. 📋 实现 reveal.js HTML 生成器
3. 📋 实现 WSX 组件集成
4. 📋 实现 reveal.js 特性支持（Fragments、Backgrounds、Nested Slides）
5. 📋 编写集成测试

### 阶段 4: QuizPlayer 实现

1. 📋 创建 QuizPlayer 类基础结构
2. 📋 实现 `initWizardMode()` 方法
3. 📋 实现答案收集和评分
4. 📋 实现模式切换
5. 📋 编写单元测试和集成测试

### 阶段 5: Doc Mode（可选）

1. 📋 实现 `initDocMode()` 方法
2. 📋 使用 marked.js 渲染 Markdown
3. 📋 嵌入 WSX 组件
4. 📋 编写测试

## 依赖关系

```
@quizerjs/quizerjs (QuizPlayer)
├── @quizerjs/dsl (必需)
├── @quizerjs/core (必需)
├── reveal.js (Wizard Mode 必需，用于幻灯片渲染)
├── marked (Doc Mode 必需)
└── @slidejs (Slide DSL 解析器和编译器，未来实现)
```

## 参考

- [RFC 0001: Quiz DSL 规范](./0001-quiz-dsl-specification.md)
- [RFC 0002: 架构设计](./0002-architecture-design.md)
- [RFC 0005: 编辑器核心组件设计](./0005-editor-core.md)
- [marked.js 文档](https://marked.js.org/)
- [Swiper.js 文档](https://swiperjs.com/)
- [Embla Carousel 文档](https://www.embla-carousel.com/)
