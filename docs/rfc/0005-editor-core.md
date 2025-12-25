# RFC 0005: 编辑器核心组件设计

**状态**: 草案 (Draft)  
**创建日期**: 2025-12-07  
**作者**: quizerjs 团队

## 摘要

本文档详细设计 `@quizerjs/quizerjs` 包中的核心组件：`QuizEditor`，包括 API 设计、实现细节、依赖关系和集成方式。QuizEditor 基于 Editor.js 块编辑器，每个问题类型是一个独立的块。

**重要架构决策**: DSL ↔ Block 转换逻辑在 `@quizerjs/core` 包中实现，通过转换器（Transformer）提供。QuizEditor 使用这些转换器而不是自己实现转换逻辑，这符合单一职责原则，转换逻辑可被多个组件复用。

**相关文档**：

- [Editor.js 工具开发指南](../guides/editorjs-tool-development.md) - 详细说明如何使用 wsx 编写 Editor.js Block Tool

## 动机

- 明确编辑器的详细 API 设计
- 定义核心组件的职责和边界
- 指导实现工作
- 确保与 DSL 和架构设计的一致性

## 设计原则

1. **框架无关**: 纯 JavaScript/TypeScript，不依赖 React/Vue
2. **基于标准**: 使用 Editor.js 作为块编辑器
3. **块编辑器模式**: 每个问题类型是一个独立的 Editor.js 块，用户可以插入、编辑、删除、排序
4. **DSL 驱动**: 所有数据交换使用 Quiz DSL 格式，保存时将所有块组合成完整 DSL
5. **Opinionated**: v1 版本是 opinionated 库，不支持自定义扩展和插件（未来版本可能支持）
6. **类型安全**: 完整的 TypeScript 类型定义

## 核心概念

### DSL 作为文档结构

**重要设计理念**：DSL 应该被看作一个**文档**，而不是简单的 questions 数组。

**文档结构层次**：

1. **H1 - 文档级别**（Quiz）：
   - `title`: 文档标题（H1，作为第一个 header block，level 1）
   - `description`: 文档描述（可选，作为紧跟 H1 的 paragraph block）
   - `sections`: 文档章节数组

2. **H2 - 章节级别**（Section）：
   - `title`: 章节标题（H2，使用 Editor.js `header` block，level 2）
   - `description`: 章节描述（使用 Editor.js `paragraph` block，可选）
   - `questions`: 章节中的问题数组

3. **H3 - 问题级别**（Question）：
   - `title` (text): 问题标题（H3，在 question block 内部，使用 `quiz-question-header` wsx 组件，样式为 H3）
   - `description`: 问题描述（在 question block 内部，使用 `quiz-question-description` wsx 组件，可选）
   - `type`: 问题类型（single_choice, multiple_choice, text_input, true_false）
   - `options` / `correctAnswer`: 问题选项或正确答案
   - `points`: 分值
   - `explanation`: 解析说明

**文档结构示例**：

```
H1: Quiz Name (quiz.title) - header block (level 1)
  H2: Section 1 (section.title) - header block (level 2)
    H3: Quiz 1 (question.title) - quiz-question-header (H3 样式)
      - description (quiz-question-description) - 问题描述
      - choice1 (quiz-option) - 选项1，可编辑
      - choice2 (quiz-option) - 选项2，可编辑
      - ... (可以继续添加 choice，像文档编辑一样，Enter 创建新 choice)
    H3: Quiz 2 (question.title) - quiz-question-header (H3 样式)
      - description
      - choice1
      - choice2
      - ... (可以继续添加)
  H2: Section 2 (section.title) - header block (level 2)
    H3: Quiz 3 (question.title) - quiz-question-header (H3 样式)
      - description
      - input (文本输入题，不是 choice)
      ...
```

**关键设计点**：

- **H3**：问题标题（`quiz-question-header` wsx 组件，H3 样式）
- **Description**：问题描述（`quiz-question-description` wsx 组件，可选）
- **Choice List**：选项列表（`quiz-option-list` wsx 组件）
  - 每个 choice 是一个可编辑的行（`quiz-option` wsx 组件）
  - **像文档编辑一样**：Enter 创建新 choice，Backspace 删除空 choice
  - 支持单选/多选标记（radio/checkbox）
- **Input**：文本输入题使用 `quiz-correct-answer` 组件（不是 choice list）

**DSL 结构示例**：

```typescript
{
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: 'JavaScript 基础测验',  // 文档标题
    description: '测试你对 JavaScript 基础知识的理解',  // 文档描述
    sections: [  // 文档章节
      {
        id: 'section-1',
        title: '第一章：基础概念',  // Section Header (H2)
        description: '本章节介绍 JavaScript 的基础概念',  // Section Description
        questions: [
          {
            id: 'q1',
            title: '以下哪个是 JavaScript 的框架？',  // Question Header
            description: '请仔细阅读题目',  // Question Description (可选)
            type: 'single_choice',
            options: [...],
            points: 10,
            explanation: '...'
          }
        ]
      },
      {
        id: 'section-2',
        title: '第二章：进阶内容',  // Section Header (H2)
        questions: [...]
      }
    ]
  }
}
```

**Editor.js Blocks 映射**：

- **H1 - 文档标题**：`header` block (level 1)，作为第一个 block
- **文档描述**：`paragraph` block，紧跟 H1（可选）
- **H2 - Section Header**：`header` block (level 2)
- **Section Description**：`paragraph` block（可选）
- **H3 - Question Block**：`quiz-single-choice` / `quiz-multiple-choice` / `quiz-text-input` / `quiz-true-false` block
  - **H3 - Question Header**：在 question block 内部的 `quiz-question-header` wsx 组件（H3 样式）
  - **Question Description**：在 question block 内部的 `quiz-question-description` wsx 组件（可选）
  - **Question Choices**：在 question block 内部的 `quiz-option-list` wsx 组件

### Editor.js 块编辑器模式

**为什么选择 Editor.js**:

- Editor.js 是块编辑器，每个内容单元是独立的块
- 用户可以自由插入、编辑、删除、拖拽排序块
- 完美适配 Quiz 场景：每个问题是一个独立的块

**Editor.js Block 连接机制**：

- **Block 不能嵌套 Block**：Editor.js 的 block 是**平级的**，不能 block inside block
- **Block 之间如何连接**：
  - Editor.js 维护一个 **blocks 数组**，按顺序存储所有 block
  - 每个 block 有唯一的 `id` 和 `type`
  - Block 之间通过数组顺序连接，用户可以拖拽排序
  - 保存时，Editor.js 返回 `{ blocks: [...] }` 格式的数据
- **Block 内部**：
  - Block 内部不能包含其他 Block
  - Block 内部是普通的 HTML 元素和交互（contentEditable、input、button 等）
  - 可以使用 wsx Web Components 作为 Block 内部的 UI 组件（这些组件不是 Block）

**如何分组 Blocks**：
虽然 Editor.js 的 blocks 是平级的，但可以通过以下方式实现分组：

1. **使用 Header Block 作为分组标记**（推荐）：
   - 使用 `header` block 作为章节/分组标题
   - 在 DSL 转换时，识别 header blocks，将后续 blocks 分组到同一个 section
   - 示例：`header` → `paragraph` → `quiz-single-choice` → `quiz-multiple-choice` → `header` → ...
   - 在 `blockToDSL` 转换器中，根据 header 自动分组

2. **使用自定义 Section Block**（可选）：
   - 创建一个 `quiz-section` block，内部包含多个子元素（但不是 blocks）
   - 在 `render()` 中渲染多个问题，但数据存储在一个 block 中
   - 缺点：失去了 Editor.js 的块编辑优势（不能单独编辑、删除、排序每个问题）

3. **在 DSL 层面分组**：
   - DSL 支持 `sections` 数组，每个 section 包含多个 questions
   - 在 `dslToBlock` 转换器中，将 section 展开为多个 blocks（header + questions）
   - 在 `blockToDSL` 转换器中，根据 header 重新分组为 sections

**推荐方案**：使用 Header Block + DSL 层面分组

- 编辑体验：用户使用 header block 标记分组，符合 Editor.js 的设计理念
- 数据存储：在 DSL 中维护 sections 结构，便于组织和管理
- 转换逻辑：在 `dslToBlock` 和 `blockToDSL` 中处理分组逻辑

**Editor.js 数据结构示例**：

```typescript
// Editor.js 保存的数据格式
{
  blocks: [
    {
      id: 'block1',
      type: 'header',
      data: { text: '第一章', level: 2 }
    },
    {
      id: 'block2',
      type: 'paragraph',
      data: { text: '这是描述性内容' }
    },
    {
      id: 'block3',
      type: 'quiz-single-choice',
      data: { question: { id: 'q1', text: '...', options: [...] } }
    },
    {
      id: 'block4',
      type: 'quiz-multiple-choice',
      data: { question: { id: 'q2', text: '...', options: [...] } }
    }
  ]
}
```

**块类型**:

- `quiz-single-choice`: 单选题块
- `quiz-multiple-choice`: 多选题块
- `quiz-text-input`: 文本输入题块
- `quiz-true-false`: 判断题块
- `paragraph`: 段落块（用于描述性内容）
- `header`: 标题块（用于章节标题，支持 level 1-6）

**Header 使用场景**：

1. **Section Header**（章节标题）：
   - 使用 Editor.js 的 `header` block
   - 用于分组多个问题，形成章节
   - 支持 level 1-6（H1-H6），通常使用 H2 或 H3
   - 示例：`header` (level 2) → `paragraph` → `quiz-single-choice` → `quiz-multiple-choice` → `header` (level 2) → ...

2. **Question Header**（问题标题和描述）：
   - **不在 Block 内部**（因为 Block 不能嵌套 Block）
   - **在 Question Block 内部**，使用 wsx 组件组织：
     - `quiz-question-header`: 问题标题（可编辑，支持 inline tools）
     - `quiz-question-description`: 问题描述（可编辑，支持 inline tools）
     - `quiz-option-list`: 选项列表
   - 问题标题和描述是 Question 数据结构的一部分，不是独立的 blocks

**工作流程**:

1. 用户在编辑器中插入多个问题块（每个块是平级的，不嵌套）
2. Editor.js 维护一个 blocks 数组，按顺序存储所有 block
3. 每个块可以独立编辑（问题文本、选项、正确答案等）
4. 可以拖拽排序问题块（改变 blocks 数组的顺序）
5. 保存时，Editor.js 返回所有 blocks，我们转换为完整的 Quiz DSL
6. Quiz DSL 包含元数据（标题、描述、设置）和所有问题

## QuizEditor 设计

### 职责

- 提供基于 Editor.js 的测验编辑器
- 将用户操作转换为 Quiz DSL
- 支持从 Quiz DSL 加载和编辑
- 提供保存和变更事件

### API 设计

```typescript
interface QuizEditorOptions {
  /**
   * 容器元素（必需）
   */
  container: HTMLElement;

  /**
   * 初始 Quiz DSL 数据（可选）
   */
  initialDSL?: QuizDSL;

  /**
   * 编辑器配置（可选）
   */
  config?: EditorJSConfig;

  /**
   * 变更回调（可选）
   * 当编辑器内容发生变化时触发
   */
  onChange?: (dsl: QuizDSL) => void;

  /**
   * 保存回调（可选）
   * 当用户触发保存时调用
   */
  onSave?: (dsl: QuizDSL) => void;

  /**
   * 只读模式（可选，默认 false）
   */
  readOnly?: boolean;
}

class QuizEditor {
  /**
   * 构造函数
   */
  constructor(options: QuizEditorOptions);

  /**
   * 初始化编辑器
   * 必须在创建实例后调用
   *
   * 编辑器布局：
   * - Editor.js blocks 包含完整的文档结构
   * - H1 文档标题（第一个 header block, level 1）
   * - 文档描述（可选，paragraph block）
   * - H2 sections + H3 questions
   */
  init(): Promise<void>;

  /**
   * 加载 Quiz DSL（异步）
   * 会更新编辑器内容
   */
  load(dsl: QuizDSL): Promise<void>;

  /**
   * 保存当前内容为 Quiz DSL（异步）
   * 从 Editor.js 获取最新数据并转换为 DSL
   * 触发 onSave 回调
   */
  save(): Promise<QuizDSL>;

  /**
   * 清空编辑器
   */
  clear(): Promise<void>;

  /**
   * 销毁编辑器实例
   * 清理资源，移除事件监听
   */
  destroy(): Promise<void>;

  /**
   * 检查是否有未保存的更改
   */
  get isDirty(): boolean;
}
```

### 实现细节

#### 1. Editor.js 集成（块编辑器模式）

```typescript
import EditorJS from '@editorjs/editorjs';
import SingleChoiceTool from '@quizerjs/editorjs-tool/single-choice';
import MultipleChoiceTool from '@quizerjs/editorjs-tool/multiple-choice';
import TextInputTool from '@quizerjs/editorjs-tool/text-input';
import TrueFalseTool from '@quizerjs/editorjs-tool/true-false';
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import { dslToBlock, blockToDSL } from '@quizerjs/core/transformer';
import { validateQuizDSL } from '@quizerjs/dsl';

class QuizEditor {
  private editor: EditorJS | null = null;
  private container: HTMLElement;
  private options: QuizEditorOptions;
  private isDirtyFlag: boolean = false;
  private currentDSL: QuizDSL | null = null;

  constructor(options: QuizEditorOptions) {
    this.container = options.container;
    this.options = options;

    // 保存初始 DSL
    if (options.initialDSL) {
      this.currentDSL = options.initialDSL;
    }
  }

  async init(): Promise<void> {
    const tools: Record<string, EditorJSTool> = {
      // Quiz 问题块工具
      'quiz-single-choice': {
        class: SingleChoiceTool,
        inlineToolbar: true, // 启用 inline toolbar，支持格式化问题标题、描述等
        config: {
          onChange: () => {
            this.handleBlockChange();
          },
        },
      },
      'quiz-multiple-choice': {
        class: MultipleChoiceTool,
        inlineToolbar: true,
        config: {
          onChange: () => {
            this.handleBlockChange();
          },
        },
      },
      'quiz-text-input': {
        class: TextInputTool,
        inlineToolbar: true,
        config: {
          onChange: () => {
            this.handleBlockChange();
          },
        },
      },
      'quiz-true-false': {
        class: TrueFalseTool,
        inlineToolbar: true,
        config: {
          onChange: () => {
            this.handleBlockChange();
          },
        },
      },
      // 标准 Editor.js 工具（用于添加描述性内容）
      paragraph: {
        class: Paragraph,
      },
      header: {
        class: Header,
        config: {
          levels: [1, 2, 3, 4], // 支持 H1-H4（H1 用于文档标题，H2-H4 用于章节）
          defaultLevel: 2,
        },
      },
    };

    this.editor = new EditorJS({
      holder: this.container,
      tools,
      data: this.options.initialDSL ? this.convertFromDSL(this.options.initialDSL) : undefined,
      readOnly: this.options.readOnly ?? false,
      onChange: async () => {
        await this.handleBlockChange();
      },
      ...this.options.config,
    });

    await this.editor.isReady;
  }

  private async handleBlockChange(): Promise<void> {
    this.isDirtyFlag = true;
    const dsl = await this.save();
    this.options.onChange?.(dsl);
  }

  /**
   * 将 Quiz DSL 转换为 Editor.js 块格式
   * 使用 @quizerjs/core 的转换器
   *
   * 转换逻辑：
   * - quiz.title → header block (level 1)
   * - quiz.description → paragraph block（可选）
   * - sections → header blocks (level 2) + questions
   */
  private convertFromDSL(dsl: QuizDSL): EditorJSOutput {
    return dslToBlock(dsl);
  }

  /**
   * 将 Editor.js 块格式转换为 Quiz DSL
   * 使用 @quizerjs/core 的转换器
   *
   * 转换逻辑：
   * - 第一个 header block (level 1) → quiz.title
   * - 紧跟的 paragraph block → quiz.description（可选）
   * - header blocks (level 2) → sections
   */
  private convertToDSL(editorData: EditorJSOutput): QuizDSL {
    return blockToDSL(editorData);
  }

  /**
   * 加载 Quiz DSL（异步）
   * 会更新编辑器内容
   */
  async load(dsl: QuizDSL): Promise<void> {
    if (!this.editor) {
      throw new Error('Editor not initialized');
    }

    // 验证 DSL
    const validation = validateQuizDSL(dsl);
    if (!validation.valid) {
      throw new QuizEditorError(
        `Invalid DSL: ${validation.errors.join(', ')}`,
        QuizEditorErrorCode.INVALID_DSL
      );
    }

    // 保存当前 DSL
    this.currentDSL = dsl;

    // 转换为 Editor.js 格式并设置
    const editorData = this.convertFromDSL(dsl);
    await this.editor.render(editorData);
    this.isDirtyFlag = false;
  }

  /**
   * 保存当前内容为 Quiz DSL（异步）
   * 从 Editor.js 获取最新数据并转换为 DSL
   */
  async save(): Promise<QuizDSL> {
    if (!this.editor) {
      throw new Error('Editor not initialized');
    }

    const editorData = await this.editor.save();
    const dsl = this.convertToDSL(editorData);

    // 保存当前 DSL
    this.currentDSL = dsl;
    this.isDirtyFlag = false;
    this.options.onSave?.(dsl);

    return dsl;
  }

  async destroy(): Promise<void> {
    if (this.editor) {
      await this.editor.destroy();
      this.editor = null;
    }
  }

  get isDirty(): boolean {
    return this.isDirtyFlag;
  }
}
```

#### 2. 元数据管理

QuizEditor 的元数据（标题、描述、设置等）是 DSL 的一部分，位于 `quiz` 对象中。所有元数据操作都通过 DSL 进行，保持 API 的统一性：

```typescript
// 获取元数据：通过 save() 获取完整 DSL
const dsl = await editor.save();
console.log('标题:', dsl.quiz.title);
console.log('描述:', dsl.quiz.description);
console.log('设置:', dsl.quiz.settings);

// 修改元数据：修改 DSL 后重新加载
const dsl = await editor.save();
dsl.quiz.title = '新的标题';
dsl.quiz.description = '新的描述';
dsl.quiz.settings = {
  allowRetry: true,
  showResults: true,
  passingScore: 60,
};
await editor.load(dsl);
```

**设计原则**：

- 所有数据操作都通过 DSL，消除特殊情况
- 保持 API 简洁统一，不提供元数据的单独访问器
- 用户可以通过 `save()` 和 `load()` 完成所有操作

#### 3. DSL 验证

在 `load()` 方法中验证用户传入的 DSL，确保数据有效：

```typescript
class QuizEditor {
  /**
   * 加载 Quiz DSL（异步）
   * 会更新编辑器内容
   */
  async load(dsl: QuizDSL): Promise<void> {
    if (!this.editor) {
      throw new Error('Editor not initialized');
    }

    // 验证 DSL
    const validation = validateQuizDSL(dsl);
    if (!validation.valid) {
      throw new QuizEditorError(
        `Invalid DSL: ${validation.errors.join(', ')}`,
        QuizEditorErrorCode.INVALID_DSL
      );
    }

    // 保存当前 DSL
    this.currentDSL = dsl;

    // 转换为 Editor.js 格式并设置
    const editorData = this.convertFromDSL(dsl);
    await this.editor.render(editorData);
    this.isDirtyFlag = false;
  }

  /**
   * 保存当前内容为 Quiz DSL（异步）
   */
  async save(): Promise<QuizDSL> {
    if (!this.editor) {
      throw new Error('Editor not initialized');
    }

    const editorData = await this.editor.save();
    const dsl = this.convertToDSL(editorData);

    // 保存当前 DSL
    this.currentDSL = dsl;
    this.isDirtyFlag = false;
    this.options.onSave?.(dsl);

    return dsl;
  }
}
```

#### 4. 错误处理

```typescript
class QuizEditorError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'QuizEditorError';
  }
}

// 错误代码
enum QuizEditorErrorCode {
  // 初始化错误
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  EDITOR_INIT_FAILED = 'EDITOR_INIT_FAILED',

  // DSL 验证错误
  INVALID_DSL = 'INVALID_DSL',
  DSL_SCHEMA_ERROR = 'DSL_SCHEMA_ERROR',

  // 编辑器操作错误
  EDITOR_ERROR = 'EDITOR_ERROR',
  BLOCK_RENDER_ERROR = 'BLOCK_RENDER_ERROR',

  // 转换错误
  CONVERSION_ERROR = 'CONVERSION_ERROR',
  MARKDOWN_PARSE_ERROR = 'MARKDOWN_PARSE_ERROR',
  HTML_PARSE_ERROR = 'HTML_PARSE_ERROR',

  // 组件错误
  COMPONENT_RENDER_ERROR = 'COMPONENT_RENDER_ERROR',
  COMPONENT_STATE_ERROR = 'COMPONENT_STATE_ERROR',

  // 数据同步错误
  STATE_SYNC_ERROR = 'STATE_SYNC_ERROR',
  SAVE_ERROR = 'SAVE_ERROR',
  LOAD_ERROR = 'LOAD_ERROR',
}
```

## 核心组件依赖

### @quizerjs/editorjs-tool 工具

QuizEditor 需要使用 `@quizerjs/editorjs-tool` 中的工具：

- `SingleChoiceTool`: 单选题块工具
- `MultipleChoiceTool`: 多选题块工具
- `TextInputTool`: 文本输入题块工具
- `TrueFalseTool`: 判断题块工具

**工具实现设计**：每个工具使用 `@quizerjs/core` 中的**细粒度 wsx 组件**来组合渲染：

**关键设计点**：

1. **使用 JSX 语法**：工具使用 `/** @jsxImportSource @wsxjs/wsx-core */` 和 JSX 创建 wsx 组件
2. **直接导入 wsx 组件**：`import './QuizQuestionHeader.wsx'` 导入 wsx 组件文件
3. **JSX 属性传递**：通过 JSX 属性传递数据（`text={...}`, `readonly="false"`），wsx 自动转换为组件 props
4. **事件监听**：通过 `ontextchange` 等事件属性监听组件变化
5. **ref 获取实例**：使用 `ref` 获取组件实例，在 `save()` 时调用组件方法获取数据
6. **状态管理**：wsx 组件内部管理所有状态和 UI，工具只维护数据副本用于 Editor.js
7. **细粒度组件组合**：工具组合多个细粒度组件（`quiz-question-header`、`quiz-option-list` 等）构建编辑界面

**重要**：工具的正确实现方式：

- 使用 JSX 创建 wsx 组件（不是 `document.createElement`）
- 通过 JSX 属性传递数据（不是 `setAttribute`）
- 通过事件属性监听变化（不是 `addEventListener`）
- 使用 ref 获取组件实例，调用方法获取数据
- 使用细粒度组件组合，而不是单一的大组件

### @quizerjs/core wsx 组件扩展

工具依赖 `@quizerjs/core` 中的 wsx 组件，需要扩展 `QuizQuestion` 组件以支持完整的编辑功能：

**需要扩展的功能**：

- `QuizQuestion` 组件在 `mode='edit'` 时提供：
  - 可编辑的问题文本（contentEditable 或 input）
  - 可编辑的选项列表（每个选项可编辑文本、删除）
  - "添加选项"按钮
  - 设置正确答案的控件（单选/复选框）
  - 分值输入
  - 解析说明输入

**事件接口**：

- `question-change`: 问题数据变化时触发
- `option-add`: 添加选项时触发
- `option-remove`: 删除选项时触发
- `option-update`: 选项更新时触发
- `correct-answer-change`: 正确答案变化时触发

**属性接口**：

- `data-question`: JSON 字符串，包含完整的 Question 对象
- `data-mode`: 'edit' | 'view' | 'result'

### @quizerjs/dsl 功能

- `QuizDSL`: DSL 类型定义
- `QuestionType`: 问题类型枚举
- `Question`: 问题类型定义

## Editor.js 工具详细设计

### 图标库选择

使用 **Heroicons** 作为图标库（MIT 许可证，适合开源项目）：

- **安装**：`npm install @heroicons/react` 或直接使用 SVG 字符串
- **优势**：MIT 许可证、高质量 SVG、轻量级、设计一致
- **替代方案**：Feather Icons、Bootstrap Icons（均为 MIT 许可证）

**图标映射**：

- 单选题：`CheckCircleIcon` - 圆形选中图标
- 多选题：`Squares2X2Icon` - 多个方块图标
- 文本输入：`PencilIcon` - 铅笔图标
- 判断题：`CheckBadgeIcon` - 检查徽章图标

### 工具架构

每个问题类型对应一个 Editor.js 工具，工具使用 `@quizerjs/core` 的**细粒度 wsx 组件**进行组合渲染和编辑：

```
Editor.js Block
    ↓
Tool (SingleChoiceTool/MultipleChoiceTool/etc.)
    ↓
组合多个小组件：
  - quiz-question-text (问题文本)
  - quiz-option-list (选项列表)
  - quiz-option (单个选项)
  - quiz-points (分值)
  - quiz-explanation (解析说明)
    ↓
用户编辑交互
```

**设计原则**：

- 每个组件职责单一，可独立使用
- 工具组合多个小组件构建编辑界面
- 符合 Editor.js 的细粒度编辑理念

### 工具实现细节

#### 1. 单选题工具 (SingleChoiceTool)

**功能**：

- 编辑问题文本
- 添加/删除选项
- 设置正确答案（单选）
- 设置分值
- 添加解析说明

**实现**：

```typescript
/** @jsxImportSource @wsxjs/wsx-core */

import type { BlockTool, BlockToolConstructorOptions, BlockToolData } from '@editorjs/editorjs';
import { Question, QuestionType, Option } from '@quizerjs/dsl';
import './QuizQuestionHeader.wsx';
import './QuizQuestionDescription.wsx';
import './QuizOptionList.wsx';
import './QuizPoints.wsx';
import './QuizExplanation.wsx';

export interface SingleChoiceData extends BlockToolData {
  question: Question;
}

export class SingleChoiceTool implements BlockTool {
  private data: SingleChoiceData;
  private readOnly: boolean;
  private wrapper: HTMLElement;
  private questionTextComponent: any; // quiz-question-text 组件实例
  private optionListComponent: any; // quiz-option-list 组件实例
  private pointsComponent: any; // quiz-points 组件实例

  static get toolbox() {
    return {
      title: '单选题',
      // Heroicons: CheckCircleIcon (outline)
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor(options?: BlockToolConstructorOptions<SingleChoiceData>) {
    this.data = options?.data || {
      question: this.getDefaultQuestion()
    };
    this.readOnly = options?.readOnly || false;
  }

  render(): HTMLElement {
    // 组合多个小组件构建编辑界面
    this.wrapper = (
      <div class="quiz-editor-block">
        {/* 问题标题（支持 inline tools） */}
        <quiz-question-header
          text={this.data.question.text}
          readonly={this.readOnly ? "true" : "false"}
          ontextchange={(e: CustomEvent<{ text: string }>) => {
            this.data.question.text = e.detail.text;
          }}
          ref={(component: any) => {
            this.questionHeaderComponent = component;
          }}
        ></quiz-question-header>

        {/* 问题描述（可选，支持 inline tools） */}
        {this.data.question.description && (
          <quiz-question-description
            description={this.data.question.description}
            readonly={this.readOnly ? "true" : "false"}
            ondescriptionchange={(e: CustomEvent<{ description: string }>) => {
              this.data.question.description = e.detail.description;
            }}
            ref={(component: any) => {
              this.questionDescriptionComponent = component;
            }}
          ></quiz-question-description>
        )}

        {/* 选项列表 - 像文档编辑一样，Enter 创建新 choice */}
        <quiz-option-list
          options={JSON.stringify(this.data.question.options || [
            { id: 'o1', text: '', isCorrect: false },
            { id: 'o2', text: '', isCorrect: false },
          ])}
          readonly={this.readOnly ? "true" : "false"}
          type="single"
          onoptionadd={(e: CustomEvent<{ option: Option }>) => {
            // Enter 键触发，添加新 choice
            if (!this.data.question.options) {
              this.data.question.options = [];
            }
            this.data.question.options.push(e.detail.option);
            this.updateOptionList();
          }}
          onoptionremove={(e: CustomEvent<{ optionId: string }>) => {
            // Backspace 在空行触发，删除 choice
            if (this.data.question.options && this.data.question.options.length > 2) {
              this.data.question.options = this.data.question.options.filter(
                opt => opt.id !== e.detail.optionId
              );
              this.updateOptionList();
            }
          }}
          onoptionupdate={(e: CustomEvent<{ option: Option }>) => {
            // Choice 文本变化
            if (this.data.question.options) {
              const index = this.data.question.options.findIndex(
                opt => opt.id === e.detail.option.id
              );
              if (index !== -1) {
                this.data.question.options[index] = e.detail.option;
              }
            }
          }}
          oncorrectchange={(e: CustomEvent<{ optionId: string; isCorrect: boolean }>) => {
            // 点击单选按钮，标记正确答案
            // 单选题：只能有一个正确答案
            if (this.data.question.options) {
              this.data.question.options.forEach(opt => {
                opt.isCorrect = false;
              });
              const option = this.data.question.options.find(
                opt => opt.id === e.detail.optionId
              );
              if (option) {
                option.isCorrect = e.detail.isCorrect;
              }
              this.updateOptionList();
            }
          }}
          ref={(component: any) => {
            this.optionListComponent = component;
          }}
        ></quiz-option-list>

        {/* 分值 */}
        <quiz-points
          points={this.data.question.points?.toString() || "10"}
          readonly={this.readOnly ? "true" : "false"}
          onpointschange={(e: CustomEvent<{ points: number }>) => {
            this.data.question.points = e.detail.points;
          }}
          ref={(component: any) => {
            this.pointsComponent = component;
          }}
        ></quiz-points>

        {/* 解析说明 */}
        <quiz-explanation
          explanation={this.data.question.explanation || ""}
          readonly={this.readOnly ? "true" : "false"}
          onexplanationchange={(e: CustomEvent<{ explanation: string }>) => {
            this.data.question.explanation = e.detail.explanation;
          }}
          ref={(component: any) => {
            this.explanationComponent = component;
          }}
        ></quiz-explanation>
      </div>
    );

    return this.wrapper;
  }

  private updateOptionList(): void {
    if (this.optionListComponent) {
      this.optionListComponent.setAttribute('options', JSON.stringify(this.data.question.options || []));
    }
  }

  save(): SingleChoiceData {
    // 从 wsx 组件收集数据（使用 ref，不是 querySelector）
    if (this.questionHeaderComponent && typeof this.questionHeaderComponent.getText === 'function') {
      this.data.question.text = this.questionHeaderComponent.getText();
    }

    if (this.questionDescriptionComponent && typeof this.questionDescriptionComponent.getDescription === 'function') {
      this.data.question.description = this.questionDescriptionComponent.getDescription();
    }

    if (this.optionListComponent && typeof this.optionListComponent.getOptions === 'function') {
      this.data.question.options = this.optionListComponent.getOptions();
    }

    if (this.pointsComponent && typeof this.pointsComponent.getPoints === 'function') {
      this.data.question.points = this.pointsComponent.getPoints();
    }

    if (this.explanationComponent && typeof this.explanationComponent.getExplanation === 'function') {
      this.data.question.explanation = this.explanationComponent.getExplanation();
    }

    return this.data;
  }

  private getDefaultQuestion(): Question {
    return {
      id: `q-${Date.now()}`,
      type: QuestionType.SINGLE_CHOICE,
      text: '请输入问题',
      options: [
        { id: 'o1', text: '选项 1', isCorrect: false },
        { id: 'o2', text: '选项 2', isCorrect: false },
      ],
      points: 10,
    };
  }
}
```

#### 2. 多选题工具 (MultipleChoiceTool)

**与单选题的区别**：

- 正确答案可以是多个（复选框而非单选）
- 至少需要两个选项
- 至少需要选择一个正确答案

**实现要点**：

```typescript
export class MultipleChoiceTool implements BlockTool {
  // 类似 SingleChoiceTool，但：

  private renderOption(option: Option, index: number): HTMLElement {
    // 使用复选框而非单选按钮
    const correctCheckbox = document.createElement('input');
    correctCheckbox.type = 'checkbox';
    correctCheckbox.checked = option.isCorrect || false;
    correctCheckbox.addEventListener('change', () => {
      option.isCorrect = correctCheckbox.checked;
      // 不需要清除其他选项，允许多选
    });
    // ...
  }

  private getDefaultQuestion(): Question {
    return {
      id: `q-${Date.now()}`,
      type: QuestionType.MULTIPLE_CHOICE,
      text: '请输入问题',
      options: [
        { id: 'o1', text: '选项 1', isCorrect: false },
        { id: 'o2', text: '选项 2', isCorrect: false },
      ],
      points: 10,
    };
  }
}
```

#### 3. 文本输入题工具 (TextInputTool)

**实现**：使用细粒度组件，但不需要选项列表组件

```typescript
/** @jsxImportSource @wsxjs/wsx-core */

import type { BlockTool, BlockToolConstructorOptions, BlockToolData } from '@editorjs/editorjs';
import { Question, QuestionType } from '@quizerjs/dsl';
import './QuizQuestionHeader.wsx';
import './QuizQuestionDescription.wsx';
import './QuizCorrectAnswer.wsx';
import './QuizPoints.wsx';
import './QuizExplanation.wsx';

export interface TextInputData extends BlockToolData {
  question: Question;
}

export class TextInputTool implements BlockTool {
  private data: TextInputData;
  private readOnly: boolean;
  private wrapper: HTMLElement;
  private questionHeaderComponent: any;
  private questionDescriptionComponent: any;
  private correctAnswerComponent: any;
  private pointsComponent: any;
  private explanationComponent: any;

  static get toolbox() {
    return {
      title: '文本输入题',
      // Heroicons: PencilIcon (outline)
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>',
    };
  }

  constructor(options?: BlockToolConstructorOptions<TextInputData>) {
    this.data = options?.data || {
      question: this.getDefaultQuestion()
    };
    this.readOnly = options?.readOnly || false;
  }

  render(): HTMLElement {
    return (
      <div class="quiz-editor-block">
        <quiz-question-header
          text={this.data.question.text}
          readonly={this.readOnly ? "true" : "false"}
          ontextchange={(e: CustomEvent<{ text: string }>) => {
            this.data.question.text = e.detail.text;
          }}
          ref={(component: any) => {
            this.questionHeaderComponent = component;
          }}
        ></quiz-question-header>

        {this.data.question.description && (
          <quiz-question-description
            description={this.data.question.description}
            readonly={this.readOnly ? "true" : "false"}
            ondescriptionchange={(e: CustomEvent<{ description: string }>) => {
              this.data.question.description = e.detail.description;
            }}
            ref={(component: any) => {
              this.questionDescriptionComponent = component;
            }}
          ></quiz-question-description>
        )}

        <quiz-correct-answer
          correctAnswer={typeof this.data.question.correctAnswer === 'string'
            ? this.data.question.correctAnswer
            : ''}
          caseSensitive={this.data.question.caseSensitive || false}
          readonly={this.readOnly ? "true" : "false"}
          oncorrectanswerchange={(e: CustomEvent<{ correctAnswer: string | string[]; caseSensitive?: boolean }>) => {
            this.data.question.correctAnswer = e.detail.correctAnswer;
            if (e.detail.caseSensitive !== undefined) {
              this.data.question.caseSensitive = e.detail.caseSensitive;
            }
          }}
          ref={(component: any) => {
            this.correctAnswerComponent = component;
          }}
        ></quiz-correct-answer>

        <quiz-points
          points={this.data.question.points?.toString() || "10"}
          readonly={this.readOnly ? "true" : "false"}
          onpointschange={(e: CustomEvent<{ points: number }>) => {
            this.data.question.points = e.detail.points;
          }}
          ref={(component: any) => {
            this.pointsComponent = component;
          }}
        ></quiz-points>

        <quiz-explanation
          explanation={this.data.question.explanation || ""}
          readonly={this.readOnly ? "true" : "false"}
          onexplanationchange={(e: CustomEvent<{ explanation: string }>) => {
            this.data.question.explanation = e.detail.explanation;
          }}
          ref={(component: any) => {
            this.explanationComponent = component;
          }}
        ></quiz-explanation>
      </div>
    );
  }

  save(): TextInputData {
    if (this.questionHeaderComponent && typeof this.questionHeaderComponent.getText === 'function') {
      this.data.question.text = this.questionHeaderComponent.getText();
    }

    if (this.questionDescriptionComponent && typeof this.questionDescriptionComponent.getDescription === 'function') {
      this.data.question.description = this.questionDescriptionComponent.getDescription();
    }

    if (this.correctAnswerComponent && typeof this.correctAnswerComponent.getCorrectAnswer === 'function') {
      this.data.question.correctAnswer = this.correctAnswerComponent.getCorrectAnswer();
    }

    if (this.pointsComponent && typeof this.pointsComponent.getPoints === 'function') {
      this.data.question.points = this.pointsComponent.getPoints();
    }

    if (this.explanationComponent && typeof this.explanationComponent.getExplanation === 'function') {
      this.data.question.explanation = this.explanationComponent.getExplanation();
    }

    return this.data;
  }

  private getDefaultQuestion(): Question {
    return {
      id: `q-${Date.now()}`,
      type: QuestionType.TEXT_INPUT,
      text: '请输入问题',
      correctAnswer: '',
      points: 10,
    };
  }
}
```

#### 4. 判断题工具 (TrueFalseTool)

**实现**：使用细粒度组件，使用 `quiz-correct-answer` 组件选择 true/false

```typescript
/** @jsxImportSource @wsxjs/wsx-core */

import type { BlockTool, BlockToolConstructorOptions, BlockToolData } from '@editorjs/editorjs';
import { Question, QuestionType } from '@quizerjs/dsl';
import './QuizQuestionHeader.wsx';
import './QuizQuestionDescription.wsx';
import './QuizCorrectAnswer.wsx';
import './QuizPoints.wsx';
import './QuizExplanation.wsx';

export interface TrueFalseData extends BlockToolData {
  question: Question;
}

export class TrueFalseTool implements BlockTool {
  private data: TrueFalseData;
  private readOnly: boolean;
  private wrapper: HTMLElement;
  private questionHeaderComponent: any;
  private questionDescriptionComponent: any;
  private correctAnswerComponent: any;
  private pointsComponent: any;
  private explanationComponent: any;

  static get toolbox() {
    return {
      title: '判断题',
      // Heroicons: CheckBadgeIcon (outline)
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>',
    };
  }

  constructor(options?: BlockToolConstructorOptions<TrueFalseData>) {
    this.data = options?.data || {
      question: this.getDefaultQuestion()
    };
    this.readOnly = options?.readOnly || false;
  }

  render(): HTMLElement {
    this.wrapper = (
      <div class="quiz-editor-block">
        <quiz-question-header
          text={this.data.question.text}
          readonly={this.readOnly ? "true" : "false"}
          ontextchange={(e: CustomEvent<{ text: string }>) => {
            this.data.question.text = e.detail.text;
          }}
          ref={(component: any) => {
            this.questionHeaderComponent = component;
          }}
        ></quiz-question-header>

        {this.data.question.description && (
          <quiz-question-description
            description={this.data.question.description}
            readonly={this.readOnly ? "true" : "false"}
            ondescriptionchange={(e: CustomEvent<{ description: string }>) => {
              this.data.question.description = e.detail.description;
            }}
            ref={(component: any) => {
              this.questionDescriptionComponent = component;
            }}
          ></quiz-question-description>
        )}

        <quiz-correct-answer
          correctAnswer={this.data.question.correctAnswer ? "true" : "false"}
          readonly={this.readOnly ? "true" : "false"}
          oncorrectanswerchange={(e: CustomEvent<{ correctAnswer: boolean }>) => {
            this.data.question.correctAnswer = e.detail.correctAnswer;
          }}
          ref={(component: any) => {
            this.correctAnswerComponent = component;
          }}
        ></quiz-correct-answer>

        <quiz-points
          points={this.data.question.points?.toString() || "10"}
          readonly={this.readOnly ? "true" : "false"}
          onpointschange={(e: CustomEvent<{ points: number }>) => {
            this.data.question.points = e.detail.points;
          }}
          ref={(component: any) => {
            this.pointsComponent = component;
          }}
        ></quiz-points>

        <quiz-explanation
          explanation={this.data.question.explanation || ""}
          readonly={this.readOnly ? "true" : "false"}
          onexplanationchange={(e: CustomEvent<{ explanation: string }>) => {
            this.data.question.explanation = e.detail.explanation;
          }}
          ref={(component: any) => {
            this.explanationComponent = component;
          }}
        ></quiz-explanation>
      </div>
    );

    return this.wrapper;
  }

  save(): TrueFalseData {
    if (this.questionHeaderComponent && typeof this.questionHeaderComponent.getText === 'function') {
      this.data.question.text = this.questionHeaderComponent.getText();
    }

    if (this.questionDescriptionComponent && typeof this.questionDescriptionComponent.getDescription === 'function') {
      this.data.question.description = this.questionDescriptionComponent.getDescription();
    }

    if (this.correctAnswerComponent && typeof this.correctAnswerComponent.getCorrectAnswer === 'function') {
      const answer = this.correctAnswerComponent.getCorrectAnswer();
      this.data.question.correctAnswer = answer === "true" || answer === true;
    }

    if (this.pointsComponent && typeof this.pointsComponent.getPoints === 'function') {
      this.data.question.points = this.pointsComponent.getPoints();
    }

    if (this.explanationComponent && typeof this.explanationComponent.getExplanation === 'function') {
      this.data.question.explanation = this.explanationComponent.getExplanation();
    }

    return this.data;
  }

  private getDefaultQuestion(): Question {
    return {
      id: `q-${Date.now()}`,
      type: QuestionType.TRUE_FALSE,
      text: '请输入问题',
      correctAnswer: true,
      points: 10,
    };
  }
}
```

### 编辑交互流程

所有交互都由 wsx 组件内部处理，工具不参与：

1. **插入问题块**：
   - 用户点击 Editor.js 的 "+" 按钮
   - 选择问题类型（单选题/多选题/文本输入/判断题）
   - 工具使用 JSX 创建 wsx 组件，传递默认问题数据

2. **编辑问题文本**：
   - wsx 组件在 `mode='edit'` 时显示可编辑的问题文本
   - 用户编辑后，组件内部更新状态
   - 组件触发 `onquestionchange` 事件通知工具

3. **管理选项**（选择题，由 wsx 组件处理）：
   - **添加选项**：wsx 组件提供 "+ 添加选项" 按钮
   - **编辑选项文本**：wsx 组件提供可编辑的选项输入
   - **设置正确答案**：wsx 组件提供单选/复选框控件
   - **删除选项**：wsx 组件提供删除按钮

4. **设置问题属性**：
   - wsx 组件提供分值输入、解析说明输入等
   - 所有设置都在组件内部管理

5. **保存数据**：
   - Editor.js 调用工具的 `save()` 方法
   - 工具通过 `ref` 获取组件实例，调用 `getQuestion()` 方法
   - 返回完整的 `Question` 对象

### wsx 组件开发规范

**wsxjs 基本要求**：

- **文件扩展名**：`.wsx`（不是 `.wsx.ts`）
- **组件定义**：必须是类组件，继承 `WebComponent<Props>`
- **装饰器**：使用 `@autoRegister()` 自动注册为自定义元素
- **Props 类型**：通过泛型传递，例如 `WebComponent<QuizQuestionHeaderProps>`
- **JSX 配置**：需要配置 `jsxImportSource` 为 `@wsxjs/wsx-core/jsx`
- **样式**：使用 Shadow DOM，通过 `super({ styles })` 传递

**标准组件模板**：

```typescript
import { WebComponent, autoRegister } from '@wsxjs/wsx-core';

const styles = `
  .component-class {
    /* 组件样式 */
  }
`;

interface ComponentProps {
  prop1: string;
  prop2?: boolean;
  onEvent?: (data: any) => void;
}

@autoRegister()
export class ComponentName extends WebComponent<ComponentProps> {
  constructor() {
    super({ styles });
  }

  // 私有方法（事件处理器）
  private handleEvent = (e: Event) => {
    // 处理事件
    this.props.onEvent?.(data);
  };

  // 渲染方法
  render() {
    const { prop1, prop2 } = this.props;
    return (
      <div className="component-class">
        {/* JSX 内容 */}
      </div>
    );
  }

  // 公共方法（供外部调用）
  public getData(): any {
    return this.props.prop1;
  }
}
```

### wsx 组件设计（细粒度组件）

`@quizerjs/core` 需要提供以下细粒度 wsx 组件，供 Editor.js 工具组合使用：

#### 1. `quiz-question-header.wsx` - 问题标题组件

**职责**：编辑问题标题（支持 Editor.js inline tools）

**属性**：

- `text: string` - 问题标题文本
- `readonly: "true" | "false"` - 是否只读

**事件**：

- `textchange` - 文本变化时触发（CustomEvent<{ text: string }>）

**方法**：

- `getText(): string` - 获取当前文本（**HTML 格式**，供 Editor.js 使用）

**实现要点**：

- 使用 `contentEditable` div
- 启用 Editor.js inline toolbar（通过 Block Tool 配置 `inlineToolbar: true`）
- 支持加粗、斜体、链接等格式化
- **保存时返回 HTML 格式的文本**（例如：`<strong>加粗</strong>`、`<em>斜体</em>`、`<a href="url">链接</a>`）
- Editor.js inline tools 直接操作 HTML，组件返回 HTML
- **格式转换由转换器处理**：`blockToDSL` 将 HTML 转换为 Markdown 存储到 DSL

#### 2. `quiz-question-description` - 问题描述组件

**职责**：编辑问题描述（支持 Editor.js inline tools，可选）

**属性**：

- `description: string` - 问题描述文本（Markdown 格式）
- `readonly: "true" | "false"` - 是否只读

**事件**：

- `descriptionchange` - 描述变化时触发（CustomEvent<{ description: string }>）

**方法**：

- `getDescription(): string` - 获取当前描述（**HTML 格式**，供 Editor.js 使用）

**实现要点**：

- 使用 `contentEditable` div
- 启用 Editor.js inline toolbar
- 支持加粗、斜体、链接等格式化
- **保存时返回 HTML 格式的文本**（例如：`<strong>加粗</strong>`、`<em>斜体</em>`、`<a href="url">链接</a>`）
- Editor.js inline tools 直接操作 HTML，组件返回 HTML
- **格式转换由转换器处理**：`blockToDSL` 将 HTML 转换为 Markdown 存储到 DSL
- 可选显示（如果 description 为空，不显示该组件）

#### 3. `quiz-option-list.wsx` - 选项列表组件

**职责**：管理选项列表，提供灵活的编辑体验

**属性**：

- `options: string` - JSON 字符串，选项数组
- `type: "single" | "multiple"` - 单选或多选
- `readonly: "true" | "false"` - 是否只读

**双重交互方式**（提升用户体验）：

**方式 1：键盘交互（类文档编辑，提升效率）**

- **Enter 键**：在当前 choice 下方创建新 choice
- **Backspace 在空行**：删除当前 choice（至少保留 2 个 choice）
- **适用场景**：高级用户、快速编辑

**方式 2：显式按钮（降低学习成本）**

- **"+ 添加选项" 按钮**：点击添加新 choice
- **"×" 删除按钮**：每个选项右侧的删除按钮
- **适用场景**：新手用户、明确操作

**通用交互**：

- **点击单选/复选框**：标记正确答案
- **内联编辑**：直接点击 choice 文本进行编辑
- **拖拽排序**：支持拖拽调整选项顺序（可选）

**实现要点**：

- 两种方式可以同时使用，互不冲突
- 键盘交互在焦点在输入框时生效
- 按钮交互始终可见且可用

**事件**：

- `optionadd` - 添加选项时触发（CustomEvent<{ option: Option }>）
- `optionremove` - 删除选项时触发（CustomEvent<{ optionId: string }>）
- `optionupdate` - 选项更新时触发（CustomEvent<{ option: Option }>）
- `correctchange` - 正确答案变化时触发（CustomEvent<{ optionId: string; isCorrect: boolean }>）

**方法**：

- `getOptions(): Option[]` - 获取当前选项列表

**实现要点**：

- 使用 `contentEditable` div 实现每行编辑
- 监听 Enter 键创建新 choice
- 监听 Backspace 键删除空 choice
- 支持拖拽排序（可选）

#### 4. `quiz-option` - 单个选项组件（在 option-list 内部使用）

**职责**：渲染和编辑单个选项（一行）

**属性**：

- `option: string` - JSON 字符串，Option 对象
- `type: "single" | "multiple"` - 单选或多选（决定使用单选按钮还是复选框）
- `readonly: "true" | "false"` - 是否只读

**UI 结构**：

```
[radio/checkbox] [contentEditable div] [delete button]
```

**编辑体验**：

- **内联编辑**：点击文本区域直接编辑（contentEditable）
- **Enter 键**：由 `quiz-option-list` 处理，创建新 choice
- **Backspace 在空行**：由 `quiz-option-list` 处理，删除当前 choice
- **点击单选/复选框**：标记正确答案

**事件**：

- `textchange` - 选项文本变化时触发（CustomEvent<{ text: string }>）
- `correctchange` - 正确性变化时触发（CustomEvent<{ isCorrect: boolean }>）
- `delete` - 删除选项时触发（CustomEvent<{ optionId: string }>）

**方法**：

- `getOption(): Option` - 获取当前选项数据

#### 5. `quiz-points` - 分值组件

**职责**：编辑问题分值

**属性**：

- `points: string` - 分值（字符串形式）
- `readonly: "true" | "false"` - 是否只读

**事件**：

- `pointschange` - 分值变化时触发（CustomEvent<{ points: number }>）

**方法**：

- `getPoints(): number` - 获取当前分值

#### 6. `quiz-explanation` - 解析说明组件

**职责**：编辑解析说明

**属性**：

- `explanation: string` - 解析说明文本
- `readonly: "true" | "false"` - 是否只读

**事件**：

- `explanationchange` - 解析说明变化时触发（CustomEvent<{ explanation: string }>）

**方法**：

- `getExplanation(): string` - 获取当前解析说明

**设计原则**：

- 每个组件职责单一，可独立使用
- 工具组合多个小组件构建编辑界面
- 符合 Editor.js 的细粒度编辑理念
- 所有样式和 UI 交互都由 wsx 组件内部管理

**格式转换策略**：

- **wsx 组件**：返回 HTML 格式（Editor.js inline tools 直接操作 HTML）
  - `quiz-question-header.getText()` → HTML 格式
  - `quiz-question-description.getDescription()` → HTML 格式
  - `quiz-explanation.getExplanation()` → HTML 格式
  - `quiz-option.getOption().text` → 纯文本（不支持格式化）
- **转换器职责**：
  - **`dslToBlock`**：DSL 中的 Markdown → HTML（供 Editor.js 使用）
    - 使用 `marked` 或类似的 Markdown-to-HTML 转换库
  - **`blockToDSL`**：Editor.js blocks 中的 HTML → Markdown（存储到 DSL）
    - 使用 `turndown` 或类似的 HTML-to-Markdown 转换库
- **DSL 存储**：Markdown 格式（便于阅读和编辑）
- **Editor.js 使用**：HTML 格式（Editor.js inline tools 需要 HTML）

## Block 分组策略

### 使用 Header Block 作为分组标记

**编辑体验**：

- 用户插入 `header` block 作为章节标题
- 后续的 `paragraph` 和 `quiz-*` blocks 属于该章节
- 直到下一个 `header` block 出现，开始新的章节

**数据结构示例**：

```typescript
// Editor.js blocks 数组
[
  { type: 'header', data: { text: '第一章：基础概念', level: 2 } },
  { type: 'paragraph', data: { text: '这是第一章的描述' } },
  { type: 'quiz-single-choice', data: { question: {...} } },
  { type: 'quiz-multiple-choice', data: { question: {...} } },
  { type: 'header', data: { text: '第二章：进阶内容', level: 2 } },
  { type: 'quiz-text-input', data: { question: {...} } },
]

// 转换为 DSL 时，分组为 sections
{
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: '...',
    sections: [
      {
        id: 'section-1',
        title: '第一章：基础概念',
        description: '这是第一章的描述',
        questions: [
          { id: 'q1', ... },
          { id: 'q2', ... },
        ]
      },
      {
        id: 'section-2',
        title: '第二章：进阶内容',
        questions: [
          { id: 'q3', ... },
        ]
      }
    ]
  }
}
```

### 转换器实现要点

**`dslToBlock` 函数**：

- 如果 DSL 有 `sections`，为每个 section 创建：
  1. `header` block（section.title）
  2. `paragraph` block（section.description，如果存在）
  3. `quiz-*` blocks（section.questions）
- 如果 DSL 没有 `sections`，直接创建 `quiz-*` blocks

**`blockToDSL` 函数**：

- 遍历 blocks 数组
- 识别 `header` blocks，将后续 blocks 分组
- 直到下一个 `header` block 或数组结束
- 创建 `sections` 数组，每个 section 包含：
  - `title`：从 header block 提取
  - `description`：从第一个 paragraph block 提取（如果存在）
  - `questions`：从后续 `quiz-*` blocks 提取

**注意**：

- Header block 的 `level` 属性可以用来区分章节层级（如果需要支持多级分组）
- 如果第一个 block 不是 header，这些 blocks 属于根级别（不在任何 section 中）

## 类型定义

```typescript
// 从 @quizerjs/dsl 导入
import type { QuizDSL, Question, QuestionType, QuizSettings } from '@quizerjs/dsl';

// Editor.js 类型
import type { EditorJS, EditorJSConfig, EditorJSOutput, BlockToolData } from '@editorjs/editorjs';
```

## 使用示例

### QuizEditor 使用示例

```typescript
import { QuizEditor } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';
import { QuestionType } from '@quizerjs/dsl';

const container = document.getElementById('editor')!;

// 创建编辑器实例
const editor = new QuizEditor({
  container,
  initialDSL: {
    version: '1.0.0',
    quiz: {
      id: 'quiz-1',
      title: 'JavaScript 基础测验',
      description: '测试你对 JavaScript 基础知识的理解',
      sections: [
        {
          id: 'section-1',
          title: '基础概念',
          questions: [
            {
              id: 'q1',
              type: QuestionType.SINGLE_CHOICE,
              text: '以下哪个是 JavaScript 的框架？',
              options: [
                { id: 'o1', text: 'React', isCorrect: true },
                { id: 'o2', text: 'Python', isCorrect: false },
                { id: 'o3', text: 'Java', isCorrect: false },
              ],
              points: 10,
            },
          ],
        },
      ],
    },
  },
  onChange: dsl => {
    console.log('DSL 更新:', dsl);
    // 可以实时保存到本地存储或服务器
  },
  onSave: dsl => {
    console.log('保存 DSL:', dsl);
    // 发送到服务器
    fetch('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(dsl),
    });
  },
});

// 初始化编辑器
await editor.init();

// 用户可以在编辑器中：
// 1. 插入新的问题块（点击 + 按钮，选择问题类型）
// 2. 编辑每个问题块（点击块，编辑内容）
// 3. 拖拽排序问题块
// 4. 删除问题块
// 5. 添加描述性内容（段落、标题等）

// 保存当前内容为 DSL（异步方法）
const dsl = await editor.save();
console.log('完整 DSL:', dsl);

// 加载 DSL（异步方法）
await editor.load({
  version: '1.0.0',
  quiz: {
    id: 'quiz-2',
    title: '新的测验',
    sections: [],
  },
});

// 管理元数据：通过 DSL 操作
const dsl = await editor.save();
dsl.quiz.title = '新的测验标题';
dsl.quiz.description = '新的描述';
dsl.quiz.settings = {
  allowRetry: true,
  showResults: true,
  passingScore: 60,
};
await editor.load(dsl);
```

## 实施计划

### 阶段 1: @quizerjs/core 转换器实现

1. ✅ DSL 包完成
2. 📋 在 @quizerjs/core 中实现 dslToBlock 函数
3. 📋 在 @quizerjs/core 中实现 blockToDSL 函数
4. 📋 编写转换器单元测试
5. 📋 导出转换器 API (`@quizerjs/core/transformer`)

### 阶段 2: QuizEditor 基础结构

1. 📋 创建 QuizEditor 类基础结构
2. 📋 集成 Editor.js
3. 📋 使用 @quizerjs/core 转换器
4. 📋 实现元数据管理 API
5. 📋 添加错误处理
6. 📋 编写单元测试

### 阶段 3: Editor.js 工具实现

1. 📋 在 `@quizerjs/core` 中实现细粒度 wsx 组件：
   - `quiz-question-header.wsx` - 问题标题组件
   - `quiz-question-description.wsx` - 问题描述组件
   - `quiz-option-list.wsx` - 选项列表组件
   - `quiz-option.wsx` - 单个选项组件
   - `quiz-correct-answer.wsx` - 正确答案组件
   - `quiz-points.wsx` - 分值组件
   - `quiz-explanation.wsx` - 解析说明组件
2. 📋 实现 SingleChoiceTool（使用细粒度 wsx 组件）
3. 📋 实现 MultipleChoiceTool（使用细粒度 wsx 组件）
4. 📋 实现 TextInputTool（使用细粒度 wsx 组件）
5. 📋 实现 TrueFalseTool（使用细粒度 wsx 组件）
6. 📋 编写工具单元测试

### 阶段 4: 集成和优化

1. 📋 性能优化
2. 📋 文档完善
3. 📋 示例代码
4. 📋 集成测试

## 依赖关系

```
@quizerjs/quizerjs (QuizEditor)
├── @quizerjs/dsl (必需)
├── @quizerjs/core (必需，用于转换器)
├── @quizerjs/editorjs-tool (必需)
├── @editorjs/editorjs (必需)
├── @editorjs/paragraph, @editorjs/header (必需，用于描述性内容)
├── @editorjs/inline-code, @editorjs/bold, @editorjs/italic, @editorjs/link (可选，inline tools)
├── marked 或类似的 Markdown-to-HTML 转换库 (必需，用于 dslToBlock 转换)
└── turndown 或类似的 HTML-to-Markdown 转换库 (必需，用于 blockToDSL 转换)
```

**格式转换策略和依赖**：

**为什么使用 Markdown**：

- **Quiz Player 需求**：播放器使用 Markdown 格式渲染问题和解析
- **可读性**：Markdown 格式便于阅读、编辑和版本控制
- **DSL 标准化**：统一使用 Markdown 作为 DSL 的文本格式标准

**转换流程**：

- **编辑时**：DSL (Markdown) → `dslToBlock` (使用 `marked`) → HTML (Editor.js)
- **保存时**：Editor.js (HTML) → `blockToDSL` (使用 `turndown`) → DSL (Markdown)

**转换依赖**：

- **`marked`**：将 DSL 中的 Markdown 转换为 HTML（`dslToBlock` 使用）
- **`turndown`**：将 Editor.js blocks 中的 HTML 转换为 Markdown（`blockToDSL` 使用）

**职责分离**：

- **wsx 组件**：只负责返回 HTML 格式（Editor.js inline tools 需要 HTML）
- **转换器**：负责 Markdown ↔ HTML 转换（在 @quizerjs/core 中实现）
- **DSL 存储**：统一使用 Markdown 格式

## 转换器设计（@quizerjs/core）

**为什么转换器在 core 包中**:

- **核心功能复用**: 转换逻辑是核心功能，可被多个组件复用（编辑器、播放器等）
- **单一职责原则**: 转换逻辑独立于编辑器实现，职责清晰
- **更好的可测试性**: 转换器可以独立测试，不依赖 Editor.js
- **更好的可维护性**: 转换逻辑集中管理，便于维护和优化
- **架构清晰**: 符合分层架构，core 包提供基础能力，quizerjs 包使用这些能力

转换器应该在 `@quizerjs/core` 包中实现，提供 DSL ↔ Block 的双向转换。

### DSL → Block 转换函数

```typescript
/**
 * 将 Quiz DSL 转换为 Editor.js 块格式（纯函数）
 *
 * 转换规则：
 * 1. quiz.title → header block (level 1)，作为第一个 block
 * 2. quiz.description → paragraph block（可选，紧跟 H1）
 * 3. sections[].title → header block (level 2)
 * 4. sections[].description → paragraph block（可选）
 * 5. sections[].questions → quiz-* blocks
 *
 * Markdown → HTML 转换：使用 `marked` 库
 */
function dslToBlock(dsl: QuizDSL): EditorJSOutput {
  const blocks = [];

  // 1. H1 文档标题（必需，作为第一个 block）
  blocks.push({
    type: 'header',
    data: {
      text: marked(dsl.quiz.title), // Markdown → HTML
      level: 1,
    },
  });

  // 2. 文档描述（可选）
  if (dsl.quiz.description) {
    blocks.push({
      type: 'paragraph',
      data: {
        text: marked(dsl.quiz.description), // Markdown → HTML
      },
    });
  }

  // 3. 处理 sections 和 questions...
  // （展开 sections，为每个 section 创建 header block + questions）

  return { blocks };
}
```

### Block → DSL 转换函数

```typescript
/**
 * 将 Editor.js 块格式转换为 Quiz DSL（纯函数）
 *
 * 转换规则：
 * 1. 第一个 header block (level 1) → quiz.title
 * 2. 紧跟 H1 的 paragraph block → quiz.description（可选）
 * 3. header block (level 2) → sections[].title
 * 4. header 后的 paragraph block → sections[].description（可选）
 * 5. quiz-* blocks → sections[].questions
 *
 * HTML → Markdown 转换：使用 `turndown` 库
 */
function blockToDSL(editorData: EditorJSOutput): QuizDSL {
  const blocks = editorData.blocks;

  // 1. 从第一个 header block (level 1) 提取标题
  const titleBlock = blocks.find(b => b.type === 'header' && b.data.level === 1);
  const title = titleBlock
    ? turndown(titleBlock.data.text) // HTML → Markdown
    : '未命名测验';

  // 2. 从紧跟标题的 paragraph block 提取描述
  const titleIndex = blocks.indexOf(titleBlock);
  const descBlock = blocks[titleIndex + 1];
  const description = (descBlock?.type === 'paragraph')
    ? turndown(descBlock.data.text) // HTML → Markdown
    : '';

  // 3. 处理 sections 和 questions...
  // （根据 header blocks (level 2) 分组，构建 sections）

  return {
    version: '1.0.0',
    quiz: {
      id: generateId(),
      title,
      description,
      sections: [...] // 构建的 sections
    }
  };
}
```

### 使用示例

```typescript
import { dslToBlock, blockToDSL } from '@quizerjs/core/transformer';

// DSL → Block
const editorData = dslToBlock(quizDSL);

// Block → DSL
const dsl = blockToDSL(editorData);
// 函数会从块中提取 title（header 块）和 description（paragraph 块）
```

## 设计决策

### 为什么是 Opinionated 库？

**v1 版本设计决策**:

- **不支持自定义工具**: QuizEditor 是一个 opinionated 库，专注于 Quiz 编辑场景
- **固定工具集**: 只支持预定义的问题类型块（single-choice, multiple-choice, text-input, true-false）和标准内容块（paragraph, header）
- **简化 API**: 移除扩展性，提供更简单、更专注的 API
- **未来扩展**: 自定义工具和插件支持可能在 v2 或更高版本中考虑

**优势**:

- 更简单的 API，减少学习成本
- 更好的类型安全（所有工具类型已知）
- 更小的包体积（不需要动态加载）
- 更一致的用户体验

**限制**:

- 无法添加自定义问题类型（v1）
- 无法添加自定义 Editor.js 工具（v1）

## 性能优化（v1.1+）

### 虚拟滚动（大量问题场景）

**适用场景**：问题数量 > 100 时

**实现策略**：

- 只渲染可见区域的 blocks（视口内 + 上下缓冲区）
- 使用 `IntersectionObserver` 监听 blocks 的可见性
- 动态加载和卸载 wsx 组件实例
- 减少 DOM 节点数量，提升滚动性能

**示例实现**：

```typescript
class QuizEditor {
  private observer: IntersectionObserver;

  private setupVirtualScrolling() {
    if (!this.shouldUseVirtualScrolling()) return;

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.renderBlock(entry.target);
          } else {
            this.unrenderBlock(entry.target);
          }
        });
      },
      {
        rootMargin: '200px', // 缓冲区
      }
    );
  }

  private shouldUseVirtualScrolling(): boolean {
    return this.currentDSL?.quiz.sections.reduce((count, s) => count + s.questions.length, 0) > 100;
  }
}
```

### 组件懒加载（v1.1+，可选优化）

**注意**：v1 版本使用静态导入，所有工具在初始化时加载。组件懒加载是 v1.1+ 的可选优化。

**策略**（如果实现）：

- wsx 组件按需加载（使用静态导入，但延迟初始化）
- 减少初始加载时间
- 提升首屏渲染速度

**实现方式**（不使用动态 import）：

- 所有工具类使用静态导入
- 延迟实例化工具，只在需要时创建实例
- 使用工厂模式管理工具实例

### 状态更新优化

**Debounce onChange 事件**：

```typescript
class QuizEditor {
  private onChangeDebounced = debounce(async () => {
    const dsl = await this.save();
    this.options.onChange?.(dsl);
  }, 300); // 300ms 防抖

  private async handleBlockChange(): Promise<void> {
    this.isDirtyFlag = true;
    this.onChangeDebounced();
  }
}
```

**批量更新 DSL**：

- 收集多个小的状态变更
- 批量提交，减少重渲染次数

### 内存优化

**及时释放资源**：

```typescript
class QuizEditor {
  async destroy(): Promise<void> {
    // 清理 Observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // 清理事件监听
    this.removeEventListeners();

    // 销毁 Editor.js
    if (this.editor) {
      await this.editor.destroy();
      this.editor = null;
    }

    // 清理引用
    this.currentDSL = null;
  }
}
```

### 性能监控

**关键指标**：

- **初始化时间**：从创建实例到 `editor.isReady`
- **渲染时间**：DSL 转换 + blocks 渲染
- **保存时间**：blocks 转换为 DSL
- **内存占用**：大量问题时的内存使用

**监控实现**：

```typescript
class QuizEditor {
  private metrics = {
    initTime: 0,
    renderTime: 0,
    saveTime: 0,
  };

  async init(): Promise<void> {
    const start = performance.now();
    // ... 初始化逻辑
    this.metrics.initTime = performance.now() - start;
    console.log('Editor init time:', this.metrics.initTime, 'ms');
  }
}
```

---

## 参考

- [RFC 0001: Quiz DSL 规范](./0001-quiz-dsl-specification.md)
- [RFC 0002: 架构设计](./0002-architecture-design.md)
- [Editor.js 文档](https://editorjs.io/)
- [Editor.js 工具开发指南](https://editorjs.io/tools-api)
- [wsxjs GitHub](https://github.com/wsxjs/wsxjs)
