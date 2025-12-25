# RFC 0003: React 集成设计

**状态**: 草案 (Draft)  
**创建日期**: 2025-01-27  
**作者**: quizerjs 团队

## 摘要

本文档描述了 quizerjs 在 React 中的集成方案，包括组件设计、Hooks API 和最佳实践。

## 动机

- 提供 React 友好的 API
- 充分利用 React 的响应式特性
- 保持与 Web Components 的良好集成
- 提供类型安全的接口

## 设计目标

1. **简单易用**: 提供直观的 React 组件 API
2. **类型安全**: 完整的 TypeScript 支持
3. **性能优化**: 最小化不必要的重渲染
4. **灵活性**: 支持受控和非受控模式

## API 设计

### 组件 API

#### QuizEditor

编辑器组件，用于创建和编辑测验。

```tsx
import { QuizEditor } from '@quizerjs/react';

function App() {
  const [quizData, setQuizData] = useState<QuizDSL | null>(null);

  return (
    <QuizEditor
      initialData={quizData}
      onChange={dsl => setQuizData(dsl)}
      onSave={dsl => console.log('Saved:', dsl)}
      config={{
        allowRetry: true,
        showResults: true,
      }}
    />
  );
}
```

**Props**:

- `initialData?: QuizDSL` - 初始测验数据
- `onChange?: (dsl: QuizDSL) => void` - 数据变化回调
- `onSave?: (dsl: QuizDSL) => void` - 保存回调
- `config?: EditorConfig` - 编辑器配置
- `className?: string` - 自定义样式类
- `style?: React.CSSProperties` - 自定义样式

#### QuizViewer

展示组件，用于显示和答题。

```tsx
import { QuizViewer } from '@quizerjs/react';

function App() {
  const quizData: QuizDSL = {
    /* ... */
  };
  const [result, setResult] = useState<QuizResult | null>(null);

  return (
    <QuizViewer
      data={quizData}
      onSubmit={result => setResult(result)}
      mode="view" // 'view' | 'result'
      result={result}
    />
  );
}
```

**Props**:

- `data: QuizDSL` - 测验数据（必需）
- `onSubmit?: (result: QuizResult) => void` - 提交回调
- `onAnswerChange?: (questionId: string, answer: string | string[]) => void` - 答案变化回调
- `mode?: 'view' | 'result'` - 显示模式
- `result?: QuizResult` - 测验结果（result 模式需要）
- `className?: string` - 自定义样式类
- `style?: React.CSSProperties` - 自定义样式

### Hooks API

#### useQuizEditor

编辑器 Hook，提供更细粒度的控制。

```tsx
import { useQuizEditor } from '@quizerjs/react';

function MyEditor() {
  const {
    quizData,
    setQuizData,
    addQuestion,
    removeQuestion,
    updateQuestion,
    save,
    validate,
    isValid,
  } = useQuizEditor({
    initialData: null,
  });

  return (
    <div>
      <button onClick={() => addQuestion({ type: 'single_choice' })}>添加问题</button>
      <button onClick={save} disabled={!isValid}>
        保存
      </button>
      {/* 自定义编辑器 UI */}
    </div>
  );
}
```

**返回值**:

- `quizData: QuizDSL | null` - 当前测验数据
- `setQuizData: (dsl: QuizDSL) => void` - 设置测验数据
- `addQuestion: (question: Partial<Question>) => void` - 添加问题
- `removeQuestion: (questionId: string) => void` - 删除问题
- `updateQuestion: (questionId: string, updates: Partial<Question>) => void` - 更新问题
- `save: () => QuizDSL | null` - 保存并返回 DSL
- `validate: () => ValidationResult` - 验证测验数据
- `isValid: boolean` - 数据是否有效

#### useQuizViewer

展示 Hook，用于自定义展示逻辑。

```tsx
import { useQuizViewer } from '@quizerjs/react';

function MyViewer() {
  const { quizData, answers, setAnswer, submit, result, canSubmit, reset } = useQuizViewer({
    data: quizData,
  });

  return (
    <div>
      {/* 自定义展示 UI */}
      <button onClick={submit} disabled={!canSubmit}>
        提交
      </button>
    </div>
  );
}
```

**返回值**:

- `quizData: QuizDSL` - 测验数据
- `answers: Map<string, UserAnswer>` - 用户答案
- `setAnswer: (questionId: string, answer: string | string[]) => void` - 设置答案
- `submit: () => QuizResult` - 提交答案
- `result: QuizResult | null` - 测验结果
- `canSubmit: boolean` - 是否可以提交
- `reset: () => void` - 重置答案

## 实现细节

### Web Components 集成

由于核心组件基于 wsx（Web Components），React 包装器需要处理以下问题：

1. **属性传递**: 通过 `ref` 和 `useEffect` 同步 React 状态到 Web Component
2. **事件处理**: 监听 Web Component 的自定义事件
3. **生命周期**: 确保组件正确挂载和卸载

### 示例实现

```tsx
import { useEffect, useRef, useState } from 'react';
import { QuizDSL } from '@quizerjs/dsl';

export function QuizEditor({ initialData, onChange, ...props }) {
  const editorRef = useRef<HTMLElement>(null);
  const [internalData, setInternalData] = useState<QuizDSL | null>(initialData);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // 设置初始数据
    if (initialData) {
      editor.setAttribute('data-quiz-dsl', JSON.stringify(initialData));
    }

    // 监听数据变化
    const handleChange = (e: CustomEvent) => {
      const newData = e.detail;
      setInternalData(newData);
      onChange?.(newData);
    };

    editor.addEventListener('quiz-dsl-change', handleChange);

    return () => {
      editor.removeEventListener('quiz-dsl-change', handleChange);
    };
  }, [initialData, onChange]);

  return <quiz-editor ref={editorRef} {...props} />;
}
```

## 最佳实践

### 受控组件模式

```tsx
function ControlledEditor() {
  const [quizData, setQuizData] = useState<QuizDSL | null>(null);

  return <QuizEditor initialData={quizData} onChange={setQuizData} />;
}
```

### 非受控组件模式

```tsx
function UncontrolledEditor() {
  const editorRef = useRef<QuizEditorRef>(null);

  const handleSave = () => {
    const data = editorRef.current?.save();
    console.log('Saved:', data);
  };

  return <QuizEditor ref={editorRef} onSave={handleSave} />;
}
```

### 与状态管理集成

```tsx
import { useSelector, useDispatch } from 'react-redux';

function ReduxEditor() {
  const quizData = useSelector(state => state.quiz.data);
  const dispatch = useDispatch();

  return <QuizEditor initialData={quizData} onChange={dsl => dispatch(updateQuiz(dsl))} />;
}
```

## 类型定义

```typescript
// @quizerjs/react 类型定义
export interface QuizEditorProps {
  initialData?: QuizDSL | null;
  onChange?: (dsl: QuizDSL) => void;
  onSave?: (dsl: QuizDSL) => void;
  config?: EditorConfig;
  className?: string;
  style?: React.CSSProperties;
}

export interface QuizViewerProps {
  data: QuizDSL;
  onSubmit?: (result: QuizResult) => void;
  onAnswerChange?: (questionId: string, answer: string | string[]) => void;
  mode?: 'view' | 'result';
  result?: QuizResult;
  className?: string;
  style?: React.CSSProperties;
}

export interface QuizEditorRef {
  save: () => QuizDSL | null;
  validate: () => ValidationResult;
  getData: () => QuizDSL | null;
}
```

## 性能考虑

1. **Memoization**: 使用 `React.memo` 包装组件
2. **事件防抖**: 对 `onChange` 事件进行防抖处理
3. **懒加载**: 支持代码分割和懒加载
4. **虚拟化**: 对于大量问题，考虑虚拟滚动

## 测试策略

- 单元测试：测试 Hooks 和工具函数
- 集成测试：测试组件与 Web Components 的集成
- E2E 测试：测试完整的用户流程

## 未来扩展

- 支持 React Server Components
- 支持 Suspense
- 提供更多自定义选项
- 支持主题定制
