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
  onAnswerChange?: (
    questionId: string,
    answer: AnswerValue
  ) => void;
  
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
      const quizBlock = new QuizBlock();
      quizBlock.setAttribute('data-question', JSON.stringify(question));
      quizBlock.setAttribute('data-mode', 'view');
      slide.appendChild(quizBlock);
      
      swiperSlideWrapper.appendChild(slide);
    });
    
    // 初始化 Swiper
    this.swiper = new Swiper(swiperWrapper, {
      slidesPerView: 1,
      spaceBetween: 30,
      navigation: wizardConfig?.showNavigation !== false ? {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      } : false,
      keyboard: wizardConfig?.keyboardNavigation !== false ? {
        enabled: true,
      } : false,
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
    dsl.quiz.questions.forEach((question) => {
      // 使用 @quizerjs/core 的 QuizBlock 渲染问题
      const quizBlock = new QuizBlock();
      quizBlock.setAttribute('data-question', JSON.stringify(question));
      quizBlock.setAttribute('data-mode', 'view');
      
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
    const questionResults = dsl.quiz.questions.map((question) => {
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
  
  private isAnswerCorrect(
    question: Question,
    userAnswer: AnswerValue
  ): boolean {
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

- `QuizBlock`: 渲染单个问题
- `Question`: 问题组件
- `Option`: 选项组件
- `calculateScore`: 分数计算函数

### @quizerjs/dsl 功能

- `validateQuizDSL`: DSL 验证
- `parseQuizDSL`: DSL 解析
- `QuizDSL`: DSL 类型定义

## 类型定义

```typescript
// 从 @quizerjs/dsl 导入
import type {
  QuizDSL,
  Question,
  QuestionType,
} from '@quizerjs/dsl';

// 从 @quizerjs/core 导入
import type {
  AnswerValue,
  QuizResult,
  QuestionResult,
} from '@quizerjs/core';
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
  onSubmit: (result) => {
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
  onSubmit: (result) => {
    console.log('测验结果:', result);
  },
});

await docPlayer.init();
```

## 实施计划

### 阶段 1: QuizPlayer Wizard Mode
1. 📋 选择并集成 wizard 库（Swiper.js 或 Embla）
2. 📋 创建 QuizPlayer 类基础结构
3. 📋 实现 Wizard Mode 渲染
4. 📋 实现答案收集
5. 📋 实现评分逻辑
6. 📋 编写单元测试

### 阶段 2: QuizPlayer Doc Mode
1. 📋 集成 marked.js
2. 📋 实现 Doc Mode 渲染
3. 📋 实现滚动和导航
4. 📋 编写单元测试

### 阶段 3: 集成和优化
1. 📋 实现模式切换
2. 📋 性能优化
3. 📋 文档完善
4. 📋 示例代码

## 依赖关系

```
@quizerjs/quizerjs (QuizPlayer)
├── @quizerjs/dsl (必需)
├── @quizerjs/core (必需)
├── marked (Doc Mode 必需)
└── swiper 或 embla-carousel (Wizard Mode 必需)
```

## 参考

- [RFC 0001: Quiz DSL 规范](./0001-quiz-dsl-specification.md)
- [RFC 0002: 架构设计](./0002-architecture-design.md)
- [RFC 0005: 编辑器核心组件设计](./0005-editor-core.md)
- [marked.js 文档](https://marked.js.org/)
- [Swiper.js 文档](https://swiperjs.com/)
- [Embla Carousel 文档](https://www.embla-carousel.com/)

