# Editor.js 工具开发指南

**状态**: 正式 (Active)  
**创建日期**: 2025-12-07  
**作者**: quizerjs 团队

## 概述

本文档详细说明如何使用 **wsx** 编写 Editor.js Block Tool，包括最佳实践、常见陷阱和解决方案。所有 quizerjs 的 Editor.js 工具都使用 wsx Web Components 构建。

## 目录

1. [快速开始](#快速开始)
2. [工具结构](#工具结构)
3. [核心概念](#核心概念)
4. [事件处理与数据同步](#事件处理与数据同步)
5. [validate 方法设计](#validate-方法设计)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)

## 快速开始

### 基本工具模板

```typescript
/** @jsxImportSource @wsxjs/wsx-core */

import { createLogger } from '@wsxjs/wsx-core';
import type {
  BlockTool,
  BlockToolConstructorOptions,
  BlockAPI,
  API,
} from '@editorjs/editorjs';
import { QuestionType } from '@quizerjs/dsl';

// 导入 @quizerjs/core 以触发 wsx 组件自动注册
import '@quizerjs/core';

const logger = createLogger('MyTool');

// 定义工具数据类型
export interface MyToolData {
  question: {
    id: string;
    type: QuestionType;
    text: string;
    // ... 其他字段
  };
}

/**
 * 我的 Editor.js 工具
 * 使用 wsx 组件构建
 */
export default class MyTool implements BlockTool {
  private data: MyToolData;
  private readOnly: boolean;
  private wrapper: HTMLElement;
  private block: BlockAPI;  // ⚠️ 必须：用于调用 dispatchChange()
  private api: API;         // ⚠️ 必须：Editor.js API 实例
  private questionHeaderComponent: any = null;

  static get toolbox() {
    return {
      title: '我的工具',
      icon: `<svg>...</svg>`,
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor(options?: BlockToolConstructorOptions<MyToolData>) {
    // 初始化数据
    const providedData = options?.data as MyToolData | undefined;
    this.data = {
      ...providedData,
      question: providedData?.question || {
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: QuestionType.SINGLE_CHOICE,
        text: '',
      },
    } as MyToolData;
    
    this.readOnly = options?.readOnly || false;
    
    // ⚠️ 关键：必须保存 block 和 api 引用
    this.block = options!.block;
    this.api = options!.api;
  }

  render(): HTMLElement {
    const question = this.data.question;

    this.wrapper = (
      <div className="my-tool">
        <quiz-question-header
          text={question.text || ''}
          readonly={this.readOnly ? 'true' : 'false'}
          ontextchange={(e: CustomEvent<{ text: string }>) => {
            question.text = e.detail.text;
            // ⚠️ 关键：必须调用 dispatchChange() 通知 Editor.js
            this.block.dispatchChange();
          }}
          ref={(component: any) => {
            this.questionHeaderComponent = component;
          }}
        ></quiz-question-header>
      </div>
    ) as unknown as HTMLElement;

    return this.wrapper;
  }

  save(): MyToolData {
    // 从组件实例获取最新数据
    if (this.questionHeaderComponent?.getText) {
      this.data.question.text = this.questionHeaderComponent.getText();
    }
    logger.info('Saving tool data', this.data);
    return this.data;
  }

  validate(savedData: MyToolData): boolean {
    // ⚠️ 重要：validate 方法不能太严格
    // 详见 "validate 方法设计" 章节
    const question = savedData.question;
    if (!question) {
      return false;
    }
    // 允许部分数据为空，这样编辑过程中可以正常触发 onChange
    return true;
  }

  renderSettings(): HTMLElement {
    return (
      <div style="padding: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold;">
          工具设置
        </label>
      </div>
    ) as unknown as HTMLElement;
  }
}
```

## 工具结构

### 必需的静态属性

```typescript
static get toolbox() {
  return {
    title: '工具名称',  // 显示在工具栏中
    icon: '<svg>...</svg>',  // SVG 图标字符串
  };
}

static get isReadOnlySupported() {
  return true;  // 是否支持只读模式
}
```

### 必需的实例方法

1. **`constructor(options)`**: 初始化工具
2. **`render()`**: 返回工具的 DOM 元素
3. **`save()`**: 返回工具的数据（Editor.js 调用）
4. **`validate(data)`**: 验证数据有效性（可选，但推荐实现）

## 核心概念

### 1. 使用 wsx JSX 语法

**✅ 正确**：使用 JSX 创建 wsx 组件

```typescript
render(): HTMLElement {
  this.wrapper = (
    <div className="my-tool">
      <quiz-question-header
        text={this.data.question.text}
        readonly={this.readOnly ? 'true' : 'false'}
        ontextchange={(e: CustomEvent<{ text: string }>) => {
          this.data.question.text = e.detail.text;
          this.block.dispatchChange();
        }}
      ></quiz-question-header>
    </div>
  ) as unknown as HTMLElement;
  return this.wrapper;
}
```

**❌ 错误**：使用 `document.createElement`

```typescript
render(): HTMLElement {
  const wrapper = document.createElement('div');
  const header = document.createElement('quiz-question-header');
  // ... 这种方式无法正确绑定 wsx 组件
  return wrapper;
}
```

### 2. 保存 block 和 api 引用

**⚠️ 关键**：必须在构造函数中保存 `block` 和 `api` 引用

```typescript
constructor(options?: BlockToolConstructorOptions<MyToolData>) {
  // ...
  this.block = options!.block;  // ⚠️ 必须：用于 dispatchChange()
  this.api = options!.api;      // ⚠️ 必须：Editor.js API
}
```

**为什么需要 `block`？**

- `block.dispatchChange()` 是通知 Editor.js 数据已更改的唯一正确方式
- 必须在所有数据变化时调用，否则 Editor.js 的 `onChange` 回调不会触发

### 3. 事件处理

wsx 组件通过自定义事件通信，事件名称遵循 `on{EventName}` 模式：

```typescript
<quiz-question-header
  ontextchange={(e: CustomEvent<{ text: string }>) => {
    // e.detail 包含事件数据
    question.text = e.detail.text;
    this.block.dispatchChange();
  }}
></quiz-question-header>
```

**常见事件**：
- `ontextchange`: 文本变化（`CustomEvent<{ text: string }>`）
- `ontextblur`: 文本失焦（`CustomEvent<{ text: string }>`）
- `onoptionschange`: 选项列表变化（`CustomEvent<{ options: Option[] }>`）

### 4. 使用 ref 获取组件实例

在 `save()` 方法中，需要从组件实例获取最新数据：

```typescript
private questionHeaderComponent: any = null;

render(): HTMLElement {
  return (
    <quiz-question-header
      ref={(component: any) => {
        this.questionHeaderComponent = component;
      }}
    ></quiz-question-header>
  ) as unknown as HTMLElement;
}

save(): MyToolData {
  if (this.questionHeaderComponent?.getText) {
    this.data.question.text = this.questionHeaderComponent.getText();
  }
  return this.data;
}
```

## 事件处理与数据同步

### 数据流

```
用户编辑
  ↓
wsx 组件触发事件 (textchange, optionschange, etc.)
  ↓
工具的事件处理程序更新 this.data
  ↓
调用 this.block.dispatchChange()
  ↓
Editor.js 触发 onChange 回调
  ↓
QuizEditor.save() 被调用
  ↓
工具的 save() 方法被调用
  ↓
返回最新数据
```

### 正确的事件处理模式

**✅ 正确**：在事件处理程序中更新数据并调用 `dispatchChange()`

```typescript
<quiz-question-header
  ontextchange={(e: CustomEvent<{ text: string }>) => {
    // 1. 更新内部数据
    question.text = e.detail.text;
    // 2. 立即通知 Editor.js
    this.block.dispatchChange();
  }}
></quiz-question-header>
```

**❌ 错误**：忘记调用 `dispatchChange()`

```typescript
<quiz-question-header
  ontextchange={(e: CustomEvent<{ text: string }>) => {
    question.text = e.detail.text;
    // ❌ 缺少 dispatchChange()，Editor.js 不会触发 onChange
  }}
></quiz-question-header>
```

**❌ 错误**：使用错误的方法

```typescript
// ❌ 错误：api.blocks.dispatchChange() 不存在
this.api?.blocks?.dispatchChange();

// ✅ 正确：使用 block.dispatchChange()
this.block.dispatchChange();
```

### 所有数据变化点都必须调用 dispatchChange()

```typescript
render(): HTMLElement {
  return (
    <div>
      {/* 文本变化 */}
      <quiz-question-header
        ontextchange={(e) => {
          question.text = e.detail.text;
          this.block.dispatchChange();  // ✅
        }}
      />
      
      {/* 描述变化 */}
      <quiz-question-description
        ontextchange={(e) => {
          question.description = e.detail.text;
          this.block.dispatchChange();  // ✅
        }}
      />
      
      {/* 选项变化 */}
      <quiz-option-list
        onoptionschange={(e) => {
          question.options = e.detail.options;
          this.block.dispatchChange();  // ✅
        }}
      />
      
      {/* 原生 input 变化 */}
      <input
        oninput={(e) => {
          question.correctAnswer = (e.target as HTMLInputElement).value;
          this.block.dispatchChange();  // ✅
        }}
      />
    </div>
  ) as unknown as HTMLElement;
}
```

## validate 方法设计

### ⚠️ 重要：validate 不能太严格

**问题**：如果 `validate()` 方法返回 `false`，Editor.js 可能不会触发 `onChange` 回调，导致编辑过程中的数据变化无法被检测到。

### ❌ 错误的 validate 实现

```typescript
validate(savedData: TextInputData): boolean {
  const question = savedData.question;
  // ❌ 太严格：要求所有字段都必须有值
  if (!question.text || question.text.trim().length === 0) {
    return false;  // 用户正在输入标题时，会返回 false
  }
  if (!question.correctAnswer || String(question.correctAnswer).trim().length === 0) {
    return false;  // 用户正在输入答案时，会返回 false
  }
  return true;
}
```

**问题**：
- 用户输入标题时，`correctAnswer` 为空 → `validate()` 返回 `false`
- Editor.js 认为数据无效 → 不触发 `onChange`
- 结果：标题变化无法被检测到

### ✅ 正确的 validate 实现

```typescript
validate(savedData: TextInputData): boolean {
  const question = savedData.question;
  // ✅ 宽松验证：只要 question 对象存在就允许
  // 这样编辑过程中的所有更改都能触发 onChange
  if (!question) {
    return false;
  }
  // 允许部分数据为空，这样编辑过程中可以正常触发 onChange
  return true;
}
```

**原则**：
- `validate()` 应该只检查**数据结构**是否有效，而不是**数据内容**是否完整
- 数据内容的验证应该在最终保存时进行（在 `QuizEditor.save()` 或应用层）
- 编辑过程中，即使数据不完整，也应该允许并触发 `onChange`

### 不同工具的 validate 实现

**单选题/多选题**：

```typescript
validate(savedData: SingleChoiceData): boolean {
  const question = savedData.question;
  if (!question) {
    return false;
  }
  // 允许部分数据为空
  return true;
}
```

**文本输入题**：

```typescript
validate(savedData: TextInputData): boolean {
  const question = savedData.question;
  if (!question) {
    return false;
  }
  // 允许部分数据为空
  return true;
}
```

**判断题**：

```typescript
validate(savedData: TrueFalseData): boolean {
  const question = savedData.question;
  if (!question) {
    return false;
  }
  // 允许部分数据为空
  return true;
}
```

## 最佳实践

### 1. 数据初始化

**✅ 正确**：在构造函数中提供默认值

```typescript
constructor(options?: BlockToolConstructorOptions<MyToolData>) {
  const providedData = options?.data as MyToolData | undefined;
  this.data = {
    ...providedData,
    question: providedData?.question || {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: QuestionType.SINGLE_CHOICE,
      text: '',
      options: [],
    },
  } as MyToolData;
}
```

**为什么重要**：Editor.js 创建新块时，`options.data` 可能是 `undefined` 或空对象，必须提供默认值。

### 2. 类型安全

**✅ 正确**：使用 Editor.js 的类型定义

```typescript
import type {
  BlockTool,
  BlockToolConstructorOptions,
  BlockAPI,
  API,
} from '@editorjs/editorjs';

export default class MyTool implements BlockTool {
  private block: BlockAPI;  // ✅ 使用正确的类型
  private api: API;         // ✅ 使用正确的类型
}
```

**❌ 错误**：使用 `any` 或自定义类型

```typescript
private block: any;  // ❌ 失去类型安全
private api: any;    // ❌ 失去类型安全
```

### 3. 组件引用管理

**✅ 正确**：使用 ref 保存组件实例

```typescript
private questionHeaderComponent: any = null;

render(): HTMLElement {
  return (
    <quiz-question-header
      ref={(component: any) => {
        this.questionHeaderComponent = component;
      }}
    ></quiz-question-header>
  ) as unknown as HTMLElement;
}

save(): MyToolData {
  if (this.questionHeaderComponent?.getText) {
    this.data.question.text = this.questionHeaderComponent.getText();
  }
  return this.data;
}
```

### 4. 日志记录

**✅ 推荐**：在关键方法中添加日志

```typescript
import { createLogger } from '@wsxjs/wsx-core';

const logger = createLogger('MyTool');

save(): MyToolData {
  logger.info('Saving tool data', this.data);
  return this.data;
}
```

### 5. 只读模式支持

**✅ 正确**：所有工具都应该支持只读模式

```typescript
static get isReadOnlySupported() {
  return true;
}

render(): HTMLElement {
  return (
    <quiz-question-header
      readonly={this.readOnly ? 'true' : 'false'}
    ></quiz-question-header>
  ) as unknown as HTMLElement;
}
```

## 常见问题

### Q1: 为什么修改标题/描述后，block data 没有更新？

**A**: 检查以下几点：

1. **是否调用了 `dispatchChange()`？**
   ```typescript
   ontextchange={(e) => {
     question.text = e.detail.text;
     this.block.dispatchChange();  // ✅ 必须调用
   }}
   ```

2. **是否正确保存了 `block` 引用？**
   ```typescript
   constructor(options) {
     this.block = options!.block;  // ✅ 必须保存
   }
   ```

3. **`validate()` 方法是否太严格？**
   ```typescript
   validate(savedData) {
     // ✅ 宽松验证，允许部分数据为空
     return savedData.question ? true : false;
   }
   ```

### Q2: `this.block.dispatchChange()` 返回 undefined 或不工作？

**A**: 检查以下几点：

1. **`block` 是否正确初始化？**
   ```typescript
   constructor(options) {
     this.block = options!.block;  // ✅ 使用非空断言
   }
   ```

2. **是否使用了正确的方法？**
   ```typescript
   // ❌ 错误
   this.api?.blocks?.dispatchChange();
   
   // ✅ 正确
   this.block.dispatchChange();
   ```

3. **类型是否正确？**
   ```typescript
   import type { BlockAPI } from '@editorjs/editorjs';
   private block: BlockAPI;  // ✅ 使用正确的类型
   ```

### Q3: 为什么 `validate()` 返回 `false` 时，onChange 不触发？

**A**: 这是 Editor.js 的行为。如果 `validate()` 返回 `false`，Editor.js 可能认为数据无效，不触发 `onChange`。

**解决方案**：让 `validate()` 更宽松，只检查数据结构，不检查数据内容：

```typescript
validate(savedData: MyToolData): boolean {
  // ✅ 只检查 question 对象是否存在
  return savedData.question ? true : false;
}
```

### Q4: 如何调试工具问题？

**A**: 使用以下方法：

1. **添加日志**：
   ```typescript
   const logger = createLogger('MyTool');
   logger.info('Event fired', { data: this.data });
   ```

2. **检查事件是否触发**：
   ```typescript
   ontextchange={(e) => {
     console.log('textchange event:', e.detail);
     question.text = e.detail.text;
     this.block.dispatchChange();
   }}
   ```

3. **检查 `dispatchChange()` 是否调用**：
   ```typescript
   ontextchange={(e) => {
     question.text = e.detail.text;
     console.log('Calling dispatchChange');
     this.block.dispatchChange();
     console.log('dispatchChange called');
   }}
   ```

### Q5: wsx 组件的事件没有触发？

**A**: 检查以下几点：

1. **事件名称是否正确？**
   ```typescript
   // ✅ 正确：ontextchange (小写)
   <quiz-question-header ontextchange={...} />
   
   // ❌ 错误：onTextChange (驼峰)
   <quiz-question-header onTextChange={...} />
   ```

2. **事件处理程序类型是否正确？**
   ```typescript
   // ✅ 正确
   ontextchange={(e: CustomEvent<{ text: string }>) => {
     // ...
   }}
   ```

3. **组件是否正确注册？**
   ```typescript
   // ✅ 必须导入以触发自动注册
   import '@quizerjs/core';
   ```

## 完整示例

参考以下工具实现：

- `packages/editorjs-tool/src/tools/SingleChoiceTool.wsx`
- `packages/editorjs-tool/src/tools/MultipleChoiceTool.wsx`
- `packages/editorjs-tool/src/tools/TextInputTool.wsx`
- `packages/editorjs-tool/src/tools/TrueFalseTool.wsx`

## 总结

开发 Editor.js 工具的关键点：

1. ✅ 使用 wsx JSX 语法创建组件
2. ✅ 在构造函数中保存 `block` 和 `api` 引用
3. ✅ 在所有数据变化时调用 `this.block.dispatchChange()`
4. ✅ `validate()` 方法要宽松，只检查数据结构
5. ✅ 使用 ref 获取组件实例，在 `save()` 中获取最新数据
6. ✅ 支持只读模式
7. ✅ 提供完整的数据默认值

遵循这些原则，可以确保工具正常工作，数据同步正确，Editor.js 的 `onChange` 回调能够正确触发。

