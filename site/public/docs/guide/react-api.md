# QuizEditor React API 参考

`@quizerjs/react` 包提供了 `QuizEditor` 组件，用于在 React 应用中集成测验编辑器。

---

## 组件 Props

### QuizEditorProps

```typescript
interface QuizEditorProps {
  /** 初始 DSL 数据（仅用于首次挂载） */
  initialDSL?: QuizDSL;

  /** 只读模式 */
  readOnly?: boolean;

  /** 数据变化事件 */
  onChange?: (dsl: QuizDSL) => void;

  /** 保存事件 */
  onSave?: (dsl: QuizDSL) => void;
}
```

#### initialDSL

- **类型**: `QuizDSL | undefined`
- **默认值**: `undefined`
- **用途**: 编辑器首次挂载时的初始数据
- **注意**: 仅在组件挂载时使用，后续更新请使用 `load()` 方法

#### readOnly

- **类型**: `boolean | undefined`
- **默认值**: `false`
- **用途**: 设置编辑器为只读模式

#### onChange

- **类型**: `(dsl: QuizDSL) => void | undefined`
- **用途**: 编辑器内容变化时触发
- **参数**: `dsl` - 当前的 DSL 数据

#### onSave

- **类型**: `(dsl: QuizDSL) => void | undefined`
- **用途**: 用户保存时触发（Ctrl+S / Cmd+S）
- **参数**: `dsl` - 当前的 DSL 数据

---

## Ref 方法

通过 `ref` 可以访问编辑器实例的方法：

```typescript
interface QuizEditorRef {
  getEditorInstance(): EditorJS | null;
  save(): Promise<QuizDSL | null>;
  load(dsl: QuizDSL): Promise<void>;
  clear(): Promise<void>;
  isDirty(): boolean;
}
```

### getEditorInstance()

获取底层的 EditorJS 实例（用于高级操作）。

```typescript
const editorInstance = editorRef.current?.getEditorInstance();
```

**返回值**: `EditorJS | null`

---

### save()

保存当前编辑器内容为 DSL 格式。

```typescript
const dsl = await editorRef.current?.save();
```

**返回值**: `Promise<QuizDSL | null>`

---

### load(dsl)

加载新的 DSL 数据到编辑器（用于更新内容）。

```typescript
await editorRef.current?.load(newDSL);
```

**参数**:

- `dsl`: `QuizDSL` - 要加载的 DSL 数据

**返回值**: `Promise<void>`

**重要**: 这是更新编辑器内容的**正确方法**，不要使用 `key` prop。

---

### clear()

清空编辑器内容。

```typescript
await editorRef.current?.clear();
```

**返回值**: `Promise<void>`

---

### isDirty()

检查编辑器内容是否已修改（相对于初始状态）。

```typescript
const hasChanges = editorRef.current?.isDirty();
```

**返回值**: `boolean`

---

## 类型定义

### QuizDSL

完整的 DSL 类型定义请参考 [@quizerjs/dsl 文档](../dsl/index.md)。

---

## 示例

### 基本使用

```tsx
import { QuizEditor } from '@quizerjs/react';
import { useState } from 'react';

function MyEditor() {
  const [dsl, setDsl] = useState<QuizDSL>(initialData);

  return (
    <QuizEditor initialDSL={dsl} onChange={setDsl} onSave={data => console.log('Saved:', data)} />
  );
}
```

### 使用 Ref 方法

```tsx
import { QuizEditor, QuizEditorRef } from '@quizerjs/react';
import { useRef } from 'react';

function EditorWithActions() {
  const editorRef = useRef<QuizEditorRef>(null);

  const handleSave = async () => {
    const data = await editorRef.current?.save();
    // 保存到服务器
  };

  const handleClear = async () => {
    await editorRef.current?.clear();
  };

  return (
    <>
      <QuizEditor ref={editorRef} />
      <button onClick={handleSave}>保存</button>
      <button onClick={handleClear}>清空</button>
    </>
  );
}
```

---

## 相关文档

- [使用指南](../guides/react-usage.md) - 详细的使用教程
- [常见问题](../faq/react.md) - FAQ
- [DSL 文档](../dsl/index.md) - DSL 格式说明
