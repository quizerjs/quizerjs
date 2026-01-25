# RFC 0012: ContentEditable 组件封装

**状态**: 草案 (Draft)
**创建日期**: 2025-01-22
**更新日期**: 2025-01-24
**作者**: AI Assistant
**相关 RFC**: [RFC 0007: Option List Render Optimization](./completed/0007-option-list-render-optimization.md)

## 摘要

本 RFC 描述了将 contentEditable 逻辑封装为独立的 `editable-text` 组件，以解决：

1. 添加新选项时已有选项文本被清空的问题
2. 多个组件重复实现 contentEditable 逻辑的问题
3. contentEditable 与响应式框架的固有冲突

## 问题描述

### 根本问题：contentEditable 与响应式框架的冲突

contentEditable 元素的值是"脱离"响应式系统的：

```
用户输入 "Hello"
  ↓
DOM.innerHTML = "Hello"（用户操作，非框架控制）
  ↓
但 this.text 仍然是旧值（空字符串）
  ↓
其他 state 变化触发重新渲染
  ↓
框架用 this.text（空字符串）覆盖用户输入！
```

**为什么不能直接用 JSX 绑定 `{this.text}`？**

```jsx
// 方案 A：绑定但不更新 state
<div contentEditable>{this.text}</div>;
// 问题：重新渲染时用空值覆盖用户输入

// 方案 B：绑定且更新 state
handleInput = () => {
  this.text = el.innerHTML;
};
// 问题：每次输入触发重新渲染，光标跳动

// 方案 C：不绑定，手动 innerHTML 同步
// 问题：需要复杂的标志位逻辑，代码散布在多个生命周期钩子中
```

### 当前实现的问题

当前 `quiz-option.wsx` 使用方案 C，导致：

1. **复杂的同步逻辑**：`_needsContentSync` 标志位、多处 innerHTML 设置点
2. **代码重复**：`quiz-option`、`quiz-question-header`、`quiz-question-description` 都有类似逻辑
3. **难以维护**：wsxjs 框架的缓存机制需要在多个生命周期钩子中处理

### wsxjs 框架的实际行为

RFC 最初假设 `onRendered()` 总是被调用，但实际情况是：

```typescript
// connectedCallback 中（第 117-122 行）
if (hasActualContent === false || hasErrorElement) {
  requestAnimationFrame(() => {
    this.onRendered?.();
  });
}
// 当 hasActualContent === true 时，onRendered() 不会被调用！
```

这意味着当组件被缓存复用时，需要在 `onConnected()` 和 `ref` 回调中也处理内容同步，进一步增加了复杂性。

## 解决方案：封装 `editable-text` 组件

### 设计原则

**将所有 contentEditable 复杂性封装到单一组件中**，使用者只需：

```jsx
<editable-text value={this.text} readonly={this.readonly} ontextchange={this.handleTextChange} />
```

### 组件接口

```typescript
interface EditableTextProps {
  /** 文本内容（HTML 字符串） */
  value: string;

  /** 是否只读 */
  readonly?: boolean;

  /** 占位符文本 */
  placeholder?: string;

  /** 文本变化时触发 */
  ontextchange?: (e: CustomEvent<{ value: string }>) => void;

  /** 失去焦点时触发 */
  onblur?: (e: CustomEvent<{ value: string }>) => void;
}
```

### 组件实现

```typescript
/** @jsxImportSource @wsxjs/wsx-core */

import { LightComponent, autoRegister, state } from '@wsxjs/wsx-core';
import styles from './editable-text.css?inline';

@autoRegister({ tagName: 'editable-text' })
export class EditableText extends LightComponent {
  @state private value = '';
  @state private readonly = false;
  @state private placeholder = '';

  private editableElement: HTMLElement | null = null;
  private _needsContentSync = false;

  constructor() {
    super({ styles, styleName: 'editable-text' });
  }

  static get observedAttributes() {
    return ['value', 'readonly', 'placeholder'];
  }

  protected onAttributeChanged(name: string, _oldValue: string, newValue: string) {
    switch (name) {
      case 'value':
        this.value = newValue || '';
        this._needsContentSync = true;
        break;
      case 'readonly':
        this.readonly = newValue === 'true';
        break;
      case 'placeholder':
        this.placeholder = newValue || '';
        break;
    }
  }

  onConnected() {
    // 处理缓存复用场景
    if (!this.editableElement) {
      this.editableElement = this.querySelector('.editable-text-content');
    }
    if (this.editableElement && this._needsContentSync) {
      this.syncContent();
    }
    this.setupEditable();
  }

  onDisconnected() {
    if (this.editableElement) {
      this.editableElement.removeEventListener('input', this.handleInput);
      this.editableElement.removeEventListener('blur', this.handleBlur);
    }
  }

  onRendered() {
    if (!this.editableElement) {
      this.editableElement = this.querySelector('.editable-text-content');
    }
    if (this._needsContentSync) {
      this.syncContent();
    }
  }

  private syncContent() {
    if (!this.editableElement) return;

    // 只有当元素没有焦点时才同步，避免覆盖用户输入
    if (document.activeElement !== this.editableElement) {
      if (this.editableElement.innerHTML !== this.value) {
        this.editableElement.innerHTML = this.value;
      }
    }
    this._needsContentSync = false;
  }

  private setupEditable() {
    if (!this.editableElement) return;

    this.editableElement.contentEditable = this.readonly ? 'false' : 'true';
    this.editableElement.removeEventListener('input', this.handleInput);
    this.editableElement.removeEventListener('blur', this.handleBlur);

    if (!this.readonly) {
      this.editableElement.addEventListener('input', this.handleInput);
      this.editableElement.addEventListener('blur', this.handleBlur);
    }
  }

  private handleInput = () => {
    if (this.editableElement) {
      this.dispatchEvent(
        new CustomEvent('textchange', {
          detail: { value: this.editableElement.innerHTML },
          bubbles: true,
        })
      );
    }
  };

  private handleBlur = () => {
    if (this.editableElement) {
      this.dispatchEvent(
        new CustomEvent('blur', {
          detail: { value: this.editableElement.innerHTML },
          bubbles: true,
        })
      );
    }
  };

  /** 获取当前文本内容 */
  getValue(): string {
    return this.editableElement?.innerHTML || '';
  }

  /** 设置文本内容 */
  setValue(html: string): void {
    if (this.editableElement) {
      this.editableElement.innerHTML = html;
    }
  }

  render() {
    const isEmpty = !this.value && !this.editableElement?.innerHTML;

    return (
      <div className={`editable-text ${this.readonly ? 'editable-text-readonly' : ''}`}>
        <div
          className="editable-text-content"
          contentEditable={!this.readonly}
          data-placeholder={this.placeholder}
          ref={el => {
            if (el && el !== this.editableElement) {
              if (this.editableElement) {
                this.editableElement.removeEventListener('input', this.handleInput);
                this.editableElement.removeEventListener('blur', this.handleBlur);
              }
              this.editableElement = el;
              this.setupEditable();
              if (this._needsContentSync || (el.innerHTML === '' && this.value)) {
                this.syncContent();
              }
            }
          }}
        />
      </div>
    );
  }
}
```

### 使用示例

**简化后的 quiz-option.wsx：**

```typescript
/** @jsxImportSource @wsxjs/wsx-core */

import { LightComponent, autoRegister, state } from '@wsxjs/wsx-core';
import { QuestionTypes } from '@quizerjs/dsl';
import './editable-text.wsx';  // 导入 editable-text 组件
import styles from './quiz-option.css?inline';

@autoRegister({ tagName: 'quiz-option' })
export class QuizOption extends LightComponent {
  @state private optionId = '';
  @state private text = '';
  @state private selected = false;
  @state private type = QuestionTypes.SINGLE_CHOICE;
  @state private readonly = false;

  // 不再需要：
  // - textElement 引用
  // - _needsContentSync 标志位
  // - syncTextContent() 方法
  // - setupTextElement() 方法
  // - onRendered() 中的同步逻辑

  constructor() {
    super({ styles, styleName: 'quiz-option' });
  }

  static get observedAttributes() {
    return ['optionid', 'text', 'selected', 'type', 'readonly'];
  }

  protected onAttributeChanged(name: string, _oldValue: string, newValue: string) {
    switch (name) {
      case 'optionid':
        this.optionId = newValue || '';
        break;
      case 'text':
        this.text = newValue || '';
        break;
      case 'selected':
        this.selected = newValue === 'true';
        break;
      case 'type':
        this.type = (newValue as typeof QuestionTypes.SINGLE_CHOICE) || QuestionTypes.SINGLE_CHOICE;
        break;
      case 'readonly':
        this.readonly = newValue === 'true';
        break;
    }
  }

  private handleTextChange = (e: CustomEvent<{ value: string }>) => {
    this.dispatchEvent(
      new CustomEvent('textchange', {
        detail: { optionId: this.optionId, text: e.detail.value },
        bubbles: true,
      })
    );
  };

  private handleSelect = () => {
    if (this.readonly) return;
    this.selected = !this.selected;
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: { optionId: this.optionId, selected: this.selected },
        bubbles: true,
      })
    );
  };

  private handleDelete = () => {
    if (this.readonly) return;
    this.dispatchEvent(
      new CustomEvent('delete', {
        detail: { optionId: this.optionId },
        bubbles: true,
      })
    );
  };

  getData(): { id: string; text: string; isCorrect: boolean } {
    const editableText = this.querySelector('editable-text') as EditableText | null;
    return {
      id: this.optionId,
      text: editableText?.getValue() || '',
      isCorrect: this.selected,
    };
  }

  render() {
    const inputType = this.type === QuestionTypes.SINGLE_CHOICE ? 'radio' : 'checkbox';
    const classNames = ['quiz-option'];
    if (this.selected) classNames.push('quiz-option-selected');
    if (this.readonly) classNames.push('quiz-option-readonly');

    return (
      <div className={classNames.join(' ')}>
        <input
          type={inputType}
          className={this.type === QuestionTypes.SINGLE_CHOICE ? 'quiz-option-radio' : 'quiz-option-checkbox'}
          checked={this.selected}
          disabled={this.readonly}
          onChange={this.handleSelect}
        />
        <editable-text
          value={this.text}
          readonly={this.readonly ? 'true' : 'false'}
          placeholder="输入选项内容..."
          ontextchange={this.handleTextChange}
        />
        {!this.readonly && (
          <div className="quiz-option-actions">
            <button className="quiz-option-button" onClick={this.handleDelete} type="button">
              删除
            </button>
          </div>
        )}
      </div>
    );
  }
}
```

## 影响分析

### 优点

1. **单一职责**：contentEditable 复杂性隔离在一个组件中
2. **可复用**：`quiz-question-header`、`quiz-question-description` 也能使用
3. **易于测试**：单独测试 `editable-text` 组件
4. **简化使用**：使用者无需了解 contentEditable 的复杂性
5. **代码更少**：`quiz-option` 减少约 50 行代码

### 代码量对比

| 组件                | 之前    | 之后    |
| ------------------- | ------- | ------- |
| `quiz-option.wsx`   | ~230 行 | ~120 行 |
| `editable-text.wsx` | 不存在  | ~130 行 |
| **总计**            | ~230 行 | ~250 行 |

虽然总代码量略有增加，但：

- 复杂性集中在一处
- 其他使用 contentEditable 的组件可以直接复用
- 测试和维护更容易

### 可复用的组件

以下组件可以使用 `editable-text`：

- `quiz-option` - 选项文本
- `quiz-question-header` - 问题标题
- `quiz-question-description` - 问题描述

## 实施计划

### 步骤 1: 创建 editable-text 组件

- [ ] 创建 `packages/core/src/components/editable-text.wsx`
- [ ] 创建 `packages/core/src/components/editable-text.css`
- [ ] 导出组件

### 步骤 2: 重构 quiz-option

- [ ] 移除 contentEditable 相关代码
- [ ] 使用 `editable-text` 组件
- [ ] 更新测试

### 步骤 3: 重构其他组件

- [ ] 重构 `quiz-question-header` 使用 `editable-text`
- [ ] 重构 `quiz-question-description` 使用 `editable-text`

### 步骤 4: 测试验证

- [ ] 单元测试 `editable-text`
- [ ] 集成测试添加/删除选项流程
- [ ] 测试焦点和光标行为

## 测试用例

### editable-text 组件测试

```typescript
describe('EditableText', () => {
  it('should render with initial value', () => {
    // 验证初始值正确显示
  });

  it('should emit textchange on user input', () => {
    // 验证用户输入时派发事件
  });

  it('should not overwrite user input on rerender', () => {
    // 验证重新渲染时不覆盖用户输入
  });

  it('should sync value when not focused', () => {
    // 验证无焦点时同步外部值
  });

  it('should respect readonly state', () => {
    // 验证只读状态
  });
});
```

### 集成测试

```typescript
describe('QuizOption with EditableText', () => {
  it('should preserve text when adding new option', () => {
    // 1. 在选项中输入文本
    // 2. 点击添加选项
    // 3. 验证原选项文本保持不变
  });
});
```

## 参考

- [RFC 0007: Option List Render Optimization](./completed/0007-option-list-render-optimization.md)
- wsxjs 框架 LightComponent 源码
- Editor.js contentEditable 实现
