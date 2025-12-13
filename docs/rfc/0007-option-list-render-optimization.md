# RFC 0007: Option List Render Optimization

**状态**: 进行中  
**创建日期**: 2025-01-27  
**最后更新**: 2025-12-12  
**作者**: AI Assistant  
**相关 RFC**: [RFC 0005: Editor Core](./0005-editor-core.md)

## 摘要

本 RFC 描述了对 `quiz-option-list` 组件和 Editor.js 工具的渲染优化设计，以解决用户在编辑选项文本时因重新渲染导致的焦点丢失问题，以及添加选项时从顶部重新渲染的问题。

## 问题描述

当前实现中存在以下问题：

1. **焦点丢失问题**：文本改变会触发重新渲染，导致焦点丢失
2. **从顶部重新渲染问题**：添加选项时，Editor.js 工具更新属性导致整个列表从顶部重新渲染
3. **不必要的渲染**：选择选项时也会触发重新渲染

### 根本原因

- `quiz-option-list` 内部事件直接更新响应式状态，触发重新渲染
- Editor.js 工具接收到事件后立即更新 `question.options` 并更新属性，强制重新渲染
- 没有区分"编辑值"（editValue）和"实际值"（actualValue），导致所有变化都触发渲染

## 解决方案

### 设计原则

1. **quiz-option-list 维护添加/删除状态**：
   - 添加/删除选项时：合并 `valuesMap` 中的追踪值，更新内部 `items` 状态，触发渲染，派发事件（确保数据一致性）
   - 文本输入时：只更新 `valuesMap`（追踪值），不派发事件，不触发渲染
   - 选择选项时：只派发事件，不更新内部状态，让外部控制渲染

2. **Editor.js 工具符合 Editor.js 最佳实践，谨慎处理渲染**：
   - 遵循 Editor.js 标准数据流模式
   - **只在 `render()` 时设置属性**：当 Editor.js 调用 `render()` 时，通过 `options` 属性传递初始值
   - **事件处理中不更新属性**：在 `onoptionschange` 中只调用 `this.block.dispatchChange()`，不更新 `this.data`，不更新属性
   - **保存时读取最新值**：从 `quiz-option-list.getOptions()` 获取最新值（包含追踪的文本值和选中状态）返回给 Editor.js
   
   **关键原则**：
   - **设置值**：只在 `render()` 时设置（Editor.js 提供初始值）
   - **读取值**：只在 `save()` 时读取（从组件获取最新值）
   - **不更新属性**：事件处理中不更新属性，避免触发 quiz-option-list 重新渲染
   - **quiz-option-list 自包含**：内部管理所有状态和渲染，不需要外部更新属性

3. **渲染完全由外部属性控制**：
   - `quiz-option-list` 的渲染完全由 `options` 属性控制
   - 内部事件只用于维护数据，不触发渲染
   - 只有添加/删除选项时才通过属性更新触发渲染

### 架构设计

```
quiz-option-list
├── items (@state) - 用于渲染的选项数组
│   └── 只在 add/remove 时更新，触发渲染
├── valuesMap (非响应式) - 追踪文本值的 Map<optionId, text>
│   └── 在 textchange 时更新，不触发渲染，不派发事件
└── 合并逻辑
    └── add/remove 时合并 items 和 values，重新生成 items

Editor.js Tool (SingleChoiceTool/MultipleChoiceTool)
├── question.options (初始值) - 只在 render() 时传递给 quiz-option-list
├── 作为连接器/桥接器 - 不追踪任何状态，只监听事件并通知 Editor.js
├── 谨慎处理渲染 - 只在 render() 时设置属性，事件处理中不更新属性
└── 保存时：从 quiz-option-list.getOptions() 获取最新值返回给 Editor.js
```

### 数据流

#### 文本输入流程（不触发渲染）

```
用户输入文本（input 事件）
  ↓
quiz-option.handleInput() 实时触发 textchange 事件
  ↓
quiz-option-list.handleOptionTextChange()
  ↓
更新 valuesMap[optionId] = text (非响应式，追踪值)
  ↓
不派发事件 ✓
  ↓
不触发重新渲染 ✓
  ↓
用户可以继续输入，焦点不丢失 ✓
  ↓
Editor.js 工具：不接收事件，不更新任何值
```

#### 添加选项流程（触发渲染）

```
用户点击"添加选项"
  ↓
quiz-option-list.handleAddOption()
  ↓
合并 items 和 valuesMap（使用追踪的文本值），确保数据一致性
  ↓
添加新选项到合并后的列表
  ↓
更新 items (@state) - 触发渲染 ✓
  ↓
派发 optionschange 事件（通知 Editor.js 有变化）
  ↓
Editor.js 工具接收 onoptionschange 事件
  ↓
调用 this.block.dispatchChange() 通知 Editor.js ✓
  ↓
新选项被添加到列表底部，不会从顶部重新渲染 ✓
  ↓
所有选项的文本值保持一致（包含用户输入的追踪值）✓
  ↓
保存时从 getOptions() 获取最新值返回给 Editor.js
```

#### 删除选项流程（触发渲染）

```
用户点击"删除"
  ↓
quiz-option-list.handleOptionDelete()
  ↓
先合并 items 和 valuesMap（使用追踪的文本值），确保数据一致性
  ↓
从 valuesMap 中移除被删除的选项
  ↓
过滤删除的选项
  ↓
更新 items (@state) - 触发渲染 ✓
  ↓
派发 optionschange 事件（通知 Editor.js 有变化）
  ↓
Editor.js 工具接收 onoptionschange 事件
  ↓
调用 this.block.dispatchChange() 通知 Editor.js ✓
  ↓
选项被删除，列表重新渲染 ✓
  ↓
剩余选项的文本值保持一致（包含用户输入的追踪值）✓
  ↓
保存时从 getOptions() 获取最新值返回给 Editor.js
```

#### 选择选项流程（不触发渲染）

```
用户点击单选/复选框
  ↓
quiz-option.handleSelect()
  ↓
更新 quiz-option 内部 selected 状态
  ↓
派发 select 事件 { optionId, selected }
  ↓
quiz-option-list.handleOptionSelect()
  ↓
合并 items 和 values，更新 isCorrect
  ↓
quiz-option-list 内部已更新 items，触发渲染 ✓
  ↓
派发 optionschange 事件（通知 Editor.js 有变化）
  ↓
Editor.js 工具接收 onoptionschange 事件
  ↓
调用 this.block.dispatchChange() 通知 Editor.js ✓
  ↓
不更新 question.options ✓
  ↓
不更新 quiz-option-list 的 options 属性 ✓
  ↓
不触发重新渲染 ✓
  ↓
quiz-option 组件自己管理选中状态，不需要外部更新
  ↓
保存时从 getOptions() 获取最新值（包含选中状态）
```

### 实现细节

#### 1. quiz-option-list 组件

```typescript
export class QuizOptionList extends LightComponent {
  // 响应式状态 - 用于渲染的选项数组
  @state private items: Option[] = [];
  
  // 非响应式状态 - 追踪文本值的 Map
  private valuesMap = new Map<string, string>();
  
  // 文本改变处理 - 只追踪值，不派发事件，不触发渲染
  private handleOptionTextChange = (e: CustomEvent) => {
    const { optionId, text } = e.detail;
    // 只更新 valuesMap（追踪值），不触发重新渲染
    // 不派发事件，避免触发 Editor.js 重新渲染
    this.valuesMap.set(optionId, text);
  };
  
  // 添加选项 - 合并追踪值，更新内部状态，触发渲染，派发事件
  private handleAddOption = () => {
    // 先合并 items 和 valuesMap（使用追踪的文本值），确保数据一致性
    const mergedItems = this.mergeItemsAndValues();
    
    const newOption: Option = {
      id: this.generateOptionId(),
      text: '',
      isCorrect: false,
    };
    mergedItems.push(newOption);
    
    // 更新响应式状态，触发渲染
    this.items = mergedItems;
    
    // 派发 optionschange 事件，通知 Editor.js 有变化
    this.dispatchOptionsChange();
  };
  
  // 删除选项 - 合并追踪值，更新内部状态，触发渲染，派发事件
  private handleOptionDelete = (e: CustomEvent) => {
    const { optionId } = e.detail;
    
    // 先合并 items 和 valuesMap（使用追踪的文本值），确保数据一致性
    const mergedItems = this.mergeItemsAndValues();
    
    // 从 valuesMap 中移除
    this.valuesMap.delete(optionId);
    
    // 过滤删除的选项
    const filteredItems = mergedItems.filter(opt => opt.id !== optionId);
    
    // 更新响应式状态，触发渲染
    this.items = filteredItems;
    
    // 派发 optionschange 事件，通知 Editor.js 有变化
    this.dispatchOptionsChange();
  };
  
  // 选择选项 - 只派发事件，不更新内部状态
  private handleOptionSelect = (e: CustomEvent) => {
    const { optionId, selected } = e.detail;
    const mergedItems = this.mergeItemsAndValues();
    
    // 更新 isCorrect 状态
    const updatedItems = mergedItems.map(opt => ({
      ...opt,
      isCorrect: opt.id === optionId && selected,
    }));
    
    // 更新响应式状态，触发渲染
    this.items = updatedItems;
    
    // 派发 optionschange 事件，通知 Editor.js 有变化
    this.dispatchOptionsChange();
  };
  
  // 合并 items 和 values（使用追踪的文本值）
  private mergeItemsAndValues(): Option[] {
    return this.items.map(item => ({
      ...item,
      text: this.valuesMap.get(item.id) ?? item.text,
    }));
  }
  
  // 获取完整选项列表（用于保存，包含追踪的文本值）
  getOptions(): Option[] {
    return this.mergeItemsAndValues();
  }
  
  // 属性变化时，只在 options 变化时更新 items
  protected onAttributeChanged(name: string, _oldValue: string, newValue: string) {
    if (name === 'options') {
      const options = JSON.parse(newValue || '[]');
      const parsedOptions = Array.isArray(options) ? options : [];
      
      // 比较新旧选项 ID，只在添加/删除时更新
      const currentIds = new Set(this.items.map(item => item.id));
      const newIds = new Set(parsedOptions.map(opt => opt.id));
      const idsChanged = 
        currentIds.size !== newIds.size ||
        [...newIds].some(id => !currentIds.has(id));
      
      if (idsChanged) {
        // ID 变化：更新 items，触发渲染
        this.items = parsedOptions;
        // 重建 valuesMap
        this.valuesMap.clear();
        parsedOptions.forEach(opt => {
          if (opt.text) {
            this.valuesMap.set(opt.id, opt.text);
          }
        });
      }
      // 如果只是内容变化（如 isCorrect），不更新 items，不触发渲染
    }
  }
}
```

#### 2. Editor.js 工具（SingleChoiceTool/MultipleChoiceTool）

**设计原则：简单的连接器/桥接器**

Editor.js 工具应该作为简单的连接器/桥接器，不追踪任何状态，只负责：
1. 从 Editor.js 传递数据到 `quiz-option-list`
2. 接收 `quiz-option-list` 的事件，更新 Editor.js 的数据
3. 保存时从 `quiz-option-list` 获取最新值返回给 Editor.js

**关键设计点**：

1. **不追踪任何状态**：
   - 不维护 `editValue` 或其他追踪值
   - 不管理任何中间状态
   - 只作为数据传递的桥梁

2. **事件处理策略**：
   - 监听 `optionschange` 事件，通知 Editor.js 有变化（调用 `this.block.dispatchChange()`）
   - 不更新 `question.options`（quiz-option-list 已内部处理所有渲染）
   - quiz-option-list 内部更新 items 并触发渲染，只派发事件通知变化

3. **保存时获取最新值**：
   - 从 `quiz-option-list.getOptions()` 获取最新值（包含追踪的文本值和选中状态）
   - 返回给 Editor.js 进行持久化

```typescript
export default class SingleChoiceTool implements BlockTool {
  private data: SingleChoiceData;
  private optionListComponent: QuizOptionListComponent | null = null;
  // 不追踪任何状态，只作为连接器/桥接器
  
  render(): HTMLElement {
    const question = this.data.question;
    
    return (
      <quiz-option-list
        options={JSON.stringify(question.options || [])}
        type={QuestionType.SINGLE_CHOICE}
        readonly={this.readOnly ? 'true' : 'false'}
        onoptionschange={() => {
          // 符合 Editor.js 最佳实践：通知 Editor.js 有变化
          // 不更新 this.data（总是从 option-list 读取值）
          // 不更新属性（避免触发 quiz-option-list 重新渲染）
          // quiz-option-list 内部已处理所有渲染，只通知 Editor.js 有变化
          this.block.dispatchChange();
        }}
        ref={(component: QuizOptionListComponent) => {
          this.optionListComponent = component;
        }}
      />
    );
  }
  
  save(): SingleChoiceData {
    // 保存时：从 quiz-option-list 获取最新值（包含追踪的文本值和选中状态）
    // getOptions() 会合并 items 和 valuesMap，返回完整数据
    // 直接返回给 Editor.js 进行持久化
    if (this.optionListComponent?.getOptions) {
      this.data.question.options = this.optionListComponent.getOptions();
    }
    return this.data;
  }
}
```

**MultipleChoiceTool 的实现完全相同**，只是 `type` 属性不同。

**重要说明**：

1. **符合 Editor.js 最佳实践，谨慎处理渲染**：
   - **设置初始值**：只在 `render()` 时通过 `options` 属性设置初始值（Editor.js 提供）
   - **事件处理**：在 `onoptionschange` 中只调用 `this.block.dispatchChange()`，不更新 `this.data`，不更新属性
   - **通知变化**：调用 `this.block.dispatchChange()` 通知 Editor.js 有变化
   - **保存时读取**：从 `quiz-option-list.getOptions()` 获取最新值（包含追踪的文本值和选中状态）
   - **不更新属性**：事件处理中不更新属性，避免触发 quiz-option-list 重新渲染
   - **quiz-option-list 自包含**：内部管理所有状态和渲染，不需要外部更新属性

2. **为什么选择时不处理**：
   - `quiz-option` 组件自己管理选中状态（通过内部 `selected` 状态）
   - 不需要 Editor.js 工具追踪或更新
   - 保存时从 `getOptions()` 获取最新值即可

3. **为什么添加/删除时不更新属性**：
   - quiz-option-list 内部已处理所有渲染
   - 只在 Editor.js 给值时设置属性（通过 render() 时的 `options` 属性）
   - 不通过事件更新属性

4. **为什么文本输入不接收事件**：
   - `quiz-option-list` 不派发 `textchange` 事件（只更新 `valuesMap`）
   - Editor.js 工具不需要知道文本变化
   - 保存时从 `getOptions()` 获取最新值即可

5. **简化设计的好处**：
   - 减少状态管理复杂度
   - 降低出错可能性
   - 更容易理解和维护
   - 数据流更清晰：Editor.js ↔ Tool（连接器）↔ quiz-option-list

#### 3. quiz-option 组件

```typescript
export class QuizOption extends LightComponent {
  // 文本输入处理 - 只派发事件，不更新状态
  private handleInput = () => {
    if (this.textElement) {
      const html = this.textElement.innerHTML;
      // 不更新 text 状态，避免重新渲染
      // 直接派发 textchange 事件，让 quiz-option-list 追踪值
      this.dispatchEvent(
        new CustomEvent('textchange', {
          detail: { optionId: this.optionId, text: html },
          bubbles: true,
        })
      );
    }
  };
  
  // 属性变化时，只在非焦点状态下更新 DOM
  protected onAttributeChanged(name: string, _oldValue: string, newValue: string) {
    if (name === 'text') {
      // 只在元素没有焦点时更新，避免打断用户输入
      if (this.textElement && document.activeElement !== this.textElement) {
        this.textElement.innerHTML = newValue || '';
      }
      // 不更新 text 状态，避免重新渲染
    }
  }
}
```

### 关键优化点

1. **quiz-option-list 内部维护添加/删除状态**：
   - 添加/删除时：先合并 `items` 和 `valuesMap`（确保数据一致性），更新 `items`，触发渲染，派发事件
   - 文本输入时：只更新 `valuesMap`（追踪值），不派发事件，不触发渲染
   - 选择时：只派发事件，不更新内部状态

2. **Editor.js 工具作为简单的连接器/桥接器**：
   - 不追踪任何状态，不维护 `editValue`
   - 不处理任何事件（quiz-option-list 内部已处理所有渲染）
   - 保存时：从 `getOptions()` 获取最新值（包含追踪的文本值和选中状态）返回给 Editor.js

3. **渲染完全由外部属性控制**：
   - `quiz-option-list` 的渲染完全由 `options` 属性控制
   - 内部事件只用于维护数据，不触发渲染
   - 只有添加/删除选项时才通过属性更新触发渲染

4. **合并追踪值以保持数据一致性**：
   - 添加/删除选项时，先合并 `items` 和 `valuesMap`（使用追踪的文本值）
   - 确保渲染的选项包含用户输入的最新文本值
   - 派发事件时包含合并后的完整数据，保持数据一致性

## 影响分析

### 优点

1. **解决焦点丢失问题**：文本改变不再触发重新渲染
2. **提升用户体验**：用户可以连续输入，不会被中断
3. **性能优化**：减少不必要的重新渲染
4. **数据一致性**：通过合并机制确保保存的数据是最新的

### 缺点

1. **复杂度增加**：需要维护两个数据结构
2. **合并逻辑**：需要在添加/删除时正确合并数据

### 风险

1. **数据同步**：需要确保 `items` 和 `values` 始终保持同步
2. **边界情况**：处理选项 ID 变化、外部更新等情况

## 实施计划

### 阶段 1: 重构 quiz-option-list 组件

#### 步骤 1.1: 更新 `handleOptionTextChange` 方法
**目标**：文本输入只追踪值，不触发渲染

- [ ] 打开 `packages/core/src/components/quiz-option-list.wsx`
- [ ] 找到 `handleOptionTextChange` 方法（约第 133 行）
- [ ] 移除 `this.dispatchOptionsChange()` 调用
- [ ] 保留 `this.valuesMap.set(optionId, text)`（只更新追踪值）
- [ ] 添加注释说明：只追踪值，不派发事件，不触发渲染
- [ ] 验证：文本输入时焦点不丢失

**预期代码**：
```typescript
private handleOptionTextChange = (e: CustomEvent) => {
  const { optionId, text } = e.detail;
  // 只更新 valuesMap（非响应式），不触发重新渲染
  // 不派发事件，避免触发 Editor.js 重新渲染
  this.valuesMap.set(optionId, text);
};
```

#### 步骤 1.2: 更新 `handleAddOption` 方法
**目标**：添加选项时合并追踪值，触发渲染，派发事件

- [ ] 找到 `handleAddOption` 方法（约第 84 行）
- [ ] 在添加新选项前，先调用 `this.mergeItemsAndValues()` 合并追踪值
- [ ] 添加新选项到合并后的列表
- [ ] 更新 `this.items = mergedItems`（触发渲染）
- [ ] 调用 `this.dispatchOptionsChange()` 派发事件
- [ ] 添加注释说明：合并追踪值确保数据一致性

**预期代码**：
```typescript
private handleAddOption = () => {
  const isReadonly = this.readonly;
  if (isReadonly) return;

  // 先合并 items 和 valuesMap（使用追踪的文本值），确保数据一致性
  const mergedItems = this.mergeItemsAndValues();
  
  const newOption: Option = {
    id: this.generateOptionId(),
    text: '',
    isCorrect: false,
  };
  mergedItems.push(newOption);
  
  // 更新响应式状态，触发渲染
  this.items = mergedItems;
  
  // 派发 optionschange 事件，通知 Editor.js 有变化
  this.dispatchOptionsChange();
};
```

#### 步骤 1.3: 更新 `handleOptionDelete` 方法
**目标**：删除选项时合并追踪值，触发渲染，派发事件

- [ ] 找到 `handleOptionDelete` 方法（约第 142 行）
- [ ] 在删除前，先调用 `this.mergeItemsAndValues()` 合并追踪值
- [ ] 从 `valuesMap` 中移除被删除的选项
- [ ] 过滤删除的选项
- [ ] 更新 `this.items = filteredItems`（触发渲染）
- [ ] 调用 `this.dispatchOptionsChange()` 派发事件

**预期代码**：
```typescript
private handleOptionDelete = (e: CustomEvent) => {
  const { optionId } = e.detail;
  
  // 先合并 items 和 valuesMap（使用追踪的文本值），确保数据一致性
  const mergedItems = this.mergeItemsAndValues();
  
  // 从 valuesMap 中移除
  this.valuesMap.delete(optionId);
  
  // 过滤删除的选项
  const filteredItems = mergedItems.filter(opt => opt.id !== optionId);
  
  // 更新响应式状态，触发渲染
  this.items = filteredItems;
  
  // 派发 optionschange 事件，通知 Editor.js 有变化
  this.dispatchOptionsChange();
};
```

#### 步骤 1.4: 更新 `handleOptionSelect` 方法
**目标**：选择选项时更新状态，触发渲染，派发事件

- [ ] 找到 `handleOptionSelect` 方法（约第 103 行）
- [ ] 合并 `items` 和 `valuesMap`（使用追踪的文本值）
- [ ] 更新 `isCorrect` 状态
- [ ] 更新 `this.items = updatedItems`（触发渲染）
- [ ] 调用 `this.dispatchOptionsChange()` 派发事件

**预期代码**：
```typescript
private handleOptionSelect = (e: CustomEvent) => {
  const { optionId, selected } = e.detail;
  const currentItems = this.items;
  const option = currentItems.find(opt => opt.id === optionId);
  if (!option) return;

  const currentType = this.type;

  // 合并 items 和 valuesMap（使用追踪的文本值）
  const mergedItems = this.mergeItemsAndValues();

  let updatedItems: Option[];
  if (currentType === QuestionType.SINGLE_CHOICE) {
    // 单选题：只能选择一个
    updatedItems = mergedItems.map(opt => ({
      ...opt,
      isCorrect: opt.id === optionId && selected,
    }));
  } else {
    // 多选题：可以多选
    updatedItems = mergedItems.map(opt =>
      opt.id === optionId ? { ...opt, isCorrect: selected } : opt
    );
  }

  // 更新响应式状态，触发渲染
  this.items = updatedItems;
  
  // 派发 optionschange 事件，通知 Editor.js 有变化
  this.dispatchOptionsChange();
};
```

#### 步骤 1.5: 更新 `onAttributeChanged` 方法
**目标**：只在选项 ID 变化时更新 items，避免不必要的渲染

- [ ] 找到 `onAttributeChanged` 方法（约第 42 行）
- [ ] 在 `case 'options'` 分支中，添加 ID 比较逻辑
- [ ] 比较新旧选项 ID，只在添加/删除时更新 `items`
- [ ] 如果只是内容变化（如 `isCorrect`），不更新 `items`，不触发渲染
- [ ] 只在 ID 变化时重建 `valuesMap`

**预期代码**：
```typescript
protected onAttributeChanged(name: string, _oldValue: string, newValue: string) {
  switch (name) {
    case 'options':
      const options = JSON.parse(newValue || '[]');
      const parsedOptions = Array.isArray(options) ? options : [];
      
      // 比较新旧选项 ID，只在添加/删除时更新
      const currentIds = new Set(this.items.map(item => item.id));
      const newIds = new Set(parsedOptions.map(opt => opt.id));
      const idsChanged = 
        currentIds.size !== newIds.size ||
        [...newIds].some(id => !currentIds.has(id));
      
      if (idsChanged) {
        // ID 变化：更新 items，触发渲染
        this.items = parsedOptions;
        // 重建 valuesMap
        this.valuesMap.clear();
        parsedOptions.forEach(opt => {
          if (opt.text) {
            this.valuesMap.set(opt.id, opt.text);
          }
        });
      }
      // 如果只是内容变化（如 isCorrect），不更新 items，不触发渲染
      break;
    // ... 其他 case
  }
}
```

#### 步骤 1.6: 验证 quiz-option-list 重构
- [ ] 运行 `cd packages/core && pnpm run build`
- [ ] 检查是否有编译错误
- [ ] 运行 `cd packages/core && pnpm run typecheck`
- [ ] 检查是否有类型错误
- [ ] 手动测试：在浏览器中测试添加、删除、选择、文本输入

### 阶段 2: 重构 Editor.js 工具（SingleChoiceTool/MultipleChoiceTool）

#### 步骤 2.1: 更新 SingleChoiceTool 的 `onoptionschange` 处理
**目标**：只通知 Editor.js 有变化，不更新任何值，不更新属性

- [ ] 打开 `packages/editorjs-tool/src/tools/SingleChoiceTool.wsx`
- [ ] 找到 `onoptionschange` 事件处理（约第 101 行）
- [ ] 移除事件参数 `(e: CustomEvent)`，改为 `()`
- [ ] 移除 `question.options = e.detail.options`（不更新 `this.data`）
- [ ] 只保留 `this.block.dispatchChange()` 调用
- [ ] 更新注释说明：不更新任何值，不更新属性，只通知 Editor.js 有变化

**预期代码**：
```typescript
<quiz-option-list
  options={JSON.stringify(question.options || [])}
  type={QuestionType.SINGLE_CHOICE}
  readonly={this.readOnly ? 'true' : 'false'}
  onoptionschange={() => {
    // 符合 Editor.js 最佳实践：通知 Editor.js 有变化
    // 不更新 this.data（总是从 option-list 读取值）
    // 不更新属性（避免触发 quiz-option-list 重新渲染）
    // quiz-option-list 内部已处理所有渲染，只通知 Editor.js 有变化
    this.block.dispatchChange();
  }}
  ref={(component: QuizOptionListComponent) => {
    this.optionListComponent = component;
  }}
></quiz-option-list>
```

#### 步骤 2.2: 验证 SingleChoiceTool 的 `render()` 方法
**目标**：确认只在 `render()` 时设置属性

- [ ] 检查 `render()` 方法（约第 70 行）
- [ ] 确认 `options={JSON.stringify(question.options || [])}` 来自 `this.data.question.options`
- [ ] 确认这是 Editor.js 提供的初始值（通过 `constructor` 传入）
- [ ] 添加注释说明：只在 `render()` 时设置属性（Editor.js 提供初始值）

#### 步骤 2.3: 验证 SingleChoiceTool 的 `save()` 方法
**目标**：确认从组件读取最新值

- [ ] 检查 `save()` 方法（约第 118 行）
- [ ] 确认 `this.data.question.options = this.optionListComponent.getOptions()`
- [ ] 确认 `getOptions()` 会合并 items 和 valuesMap，返回完整数据
- [ ] 添加注释说明：总是从组件读取最新值（包含追踪的文本值和选中状态）

#### 步骤 2.4: 更新 MultipleChoiceTool（与 SingleChoiceTool 相同）
- [ ] 打开 `packages/editorjs-tool/src/tools/MultipleChoiceTool.wsx`
- [ ] 重复步骤 2.1、2.2、2.3（将 `SINGLE_CHOICE` 改为 `MULTIPLE_CHOICE`）

#### 步骤 2.5: 验证 Editor.js 工具重构
- [ ] 运行 `cd packages/editorjs-tool && pnpm run build`
- [ ] 检查是否有编译错误
- [ ] 运行 `cd packages/editorjs-tool && pnpm run typecheck`
- [ ] 检查是否有类型错误

### 阶段 3: 集成测试与验证

#### 步骤 3.1: 功能测试 - 文本输入
**目标**：验证文本输入不触发重新渲染

- [ ] 在 Editor.js 中创建一个单选题
- [ ] 在第一个选项的文本框中输入文本
- [ ] 验证：焦点不丢失，可以连续输入
- [ ] 验证：其他选项不受影响
- [ ] 验证：保存时文本值正确

#### 步骤 3.2: 功能测试 - 添加选项
**目标**：验证添加选项时合并追踪值，不会从顶部重新渲染

- [ ] 在 Editor.js 中创建一个单选题
- [ ] 编辑第一个选项的文本为 "Option A"
- [ ] 点击"添加选项"按钮
- [ ] 验证：新选项被添加
- [ ] 验证：第一个选项的文本仍然是 "Option A"
- [ ] 验证：不会从顶部重新渲染（使用浏览器 DevTools 检查 DOM 变化）

#### 步骤 3.3: 功能测试 - 删除选项
**目标**：验证删除选项时数据一致性

- [ ] 在 Editor.js 中创建一个单选题，包含 3 个选项
- [ ] 编辑所有选项的文本
- [ ] 删除中间选项
- [ ] 验证：选项被删除
- [ ] 验证：其他选项的文本保持不变
- [ ] 验证：保存时数据正确

#### 步骤 3.4: 功能测试 - 选择选项
**目标**：验证选择选项时状态正确更新

- [ ] 在 Editor.js 中创建一个单选题
- [ ] 选择/取消选择选项
- [ ] 验证：选中状态正确更新
- [ ] 验证：不触发不必要的重新渲染
- [ ] 验证：保存时选中状态正确

#### 步骤 3.5: 边界情况测试
- [ ] 测试空选项列表
- [ ] 测试只有一个选项时删除（应该不允许或提示）
- [ ] 测试快速连续添加多个选项
- [ ] 测试快速连续输入文本
- [ ] 测试 Editor.js 重新加载数据（验证初始值设置正确）

#### 步骤 3.6: 性能测试
- [ ] 测试大量选项（50+）时的性能
- [ ] 测试快速输入时的响应性
- [ ] 使用浏览器 DevTools Performance 工具检查重新渲染次数
- [ ] 验证：没有不必要的重新渲染

### 阶段 4: 文档更新

#### 步骤 4.1: 更新开发文档
- [ ] 打开 `docs/guides/editorjs-tool-development.md`
- [ ] 添加关于渲染优化的说明
- [ ] 添加关于何时更新属性的指导原则
- [ ] 添加关于 quiz-option-list 使用的最佳实践

#### 步骤 4.2: 更新代码注释
- [ ] 确保所有关键方法都有清晰的注释
- [ ] 说明为什么某些操作不触发渲染
- [ ] 说明数据流和渲染时机

### 阶段 5: 代码审查与优化

#### 步骤 5.1: 代码审查
- [ ] 审查 quiz-option-list 的实现
  - 检查是否符合 Linus Torvalds 代码风格（CLAUDE.md）
  - 检查是否有不必要的复杂度
  - 检查是否有潜在的 bug
- [ ] 审查 Editor.js 工具的实现
  - 检查是否符合 Editor.js 最佳实践
  - 检查是否正确处理了所有边界情况

#### 步骤 5.2: 性能优化
- [ ] 检查是否有不必要的计算
- [ ] 优化 `mergeItemsAndValues` 方法（如果选项很多）
- [ ] 确保 `onAttributeChanged` 中的 ID 比较高效

#### 步骤 5.3: 最终验证
- [ ] 运行所有测试：`pnpm test`（如果有）
- [ ] 检查 lint 错误：`pnpm lint`
- [ ] 检查类型错误：`pnpm typecheck`
- [ ] 手动测试完整流程：创建 → 编辑 → 保存 → 重新加载
- [ ] 验证：所有功能正常工作，没有回归问题

## 测试用例

### 用例 1: 文本改变不触发重新渲染

```
1. 渲染包含 3 个选项的列表
2. 在第一个选项的输入框中输入文本
3. 验证：焦点不丢失，可以连续输入
4. 验证：其他选项不受影响
```

### 用例 2: 添加选项正确合并值

```
1. 渲染包含 2 个选项的列表
2. 编辑第一个选项的文本为 "Option A"
3. 添加新选项
4. 验证：新选项被添加
5. 验证：第一个选项的文本仍然是 "Option A"
```

### 用例 3: 删除选项正确清理

```
1. 渲染包含 3 个选项的列表
2. 编辑所有选项的文本
3. 删除中间选项
4. 验证：选项被删除
5. 验证：其他选项的文本保持不变
```

### 用例 4: 保存数据正确性

```
1. 渲染包含 2 个选项的列表
2. 编辑第一个选项的文本为 "Option A"
3. 调用 getOptions()
4. 验证：返回的数据包含最新的文本值
```

## 后续优化

1. **选择状态优化**：选择改变时也可以考虑不触发重新渲染
2. **批量更新**：支持批量文本更新
3. **虚拟滚动**：如果选项数量很大，考虑虚拟滚动

## 参考

- [RFC 0005: Editor Core](./0005-editor-core.md)
- [Editor.js Block Tool Documentation](https://editorjs.io/creating-a-block-tool)
- [Web Components Best Practices](https://web.dev/custom-elements-best-practices/)

