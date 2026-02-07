# QuizEditor React 使用指南

本指南介绍如何在 React 应用中正确使用 `QuizEditor` 组件。

---

## 安装

```bash
npm install @quizerjs/react @quizerjs/dsl
# 或
pnpm add @quizerjs/react @quizerjs/dsl
```

---

## 基本用法

### 最简单的示例

```tsx
import { QuizEditor } from '@quizerjs/react';

function App() {
  return <QuizEditor />;
}
```

### 带初始数据

```tsx
import { QuizEditor } from '@quizerjs/react';
import type { QuizDSL } from '@quizerjs/dsl';

const initialData: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'my-quiz',
    title: '我的测验',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: '问题 1',
        points: 10,
        options: [
          { id: 'a', text: '选项 A', isCorrect: true },
          { id: 'b', text: '选项 B', isCorrect: false },
        ],
      },
    ],
  },
};

function App() {
  return <QuizEditor initialDSL={initialData} />;
}
```

### 处理数据变化

```tsx
import { QuizEditor } from '@quizerjs/react';
import { useState } from 'react';

function App() {
  const [dsl, setDsl] = useState<QuizDSL>(initialData);

  return (
    <QuizEditor
      initialDSL={dsl}
      onChange={setDsl}
      onSave={data => {
        console.log('用户保存了数据:', data);
        // 保存到服务器
      }}
    />
  );
}
```

---

## 切换内容（重要）

当需要在不同测验之间切换时，**使用 `load()` 方法**，不要使用 `key` prop。

### ❌ 错误方式：使用 key prop

```tsx
// ❌ 不要这样做！
function MultiQuizEditor({ quizzes, activeQuizId }) {
  const activeQuiz = quizzes.find(q => q.id === activeQuizId);

  return (
    <QuizEditor
      key={activeQuizId} // ❌ 这会导致组件完全重新挂载
      initialDSL={activeQuiz.dsl}
    />
  );
}
```

**为什么这是错误的？**

- 每次切换都会完全销毁并重建组件
- 可能导致重复的编辑器实例
- 性能差
- 违反 React 最佳实践

### ✅ 正确方式：使用 load() 方法

```tsx
// ✅ 正确做法
import { QuizEditor, QuizEditorRef } from '@quizerjs/react';
import { useRef, useEffect } from 'react';

function MultiQuizEditor({ quizzes, activeQuizId }) {
  const editorRef = useRef<QuizEditorRef>(null);
  const activeQuiz = quizzes.find(q => q.id === activeQuizId);

  // 当切换测验时，使用 load() 方法更新内容
  useEffect(() => {
    if (activeQuiz && editorRef.current) {
      editorRef.current.load(activeQuiz.dsl);
    }
  }, [activeQuizId, activeQuiz?.dsl]);

  return (
    <QuizEditor
      ref={editorRef}
      initialDSL={activeQuiz?.dsl}
      onChange={dsl => {
        // 更新当前测验的数据
        updateQuiz(activeQuizId, dsl);
      }}
    />
  );
}
```

**为什么这是正确的？**

- ✅ 组件保持挂载，只更新内容
- ✅ 性能好
- ✅ 不会有重复实例
- ✅ 符合 React 最佳实践

---

## 使用 Ref 方法

### 保存数据

```tsx
function EditorWithSave() {
  const editorRef = useRef<QuizEditorRef>(null);

  const handleSave = async () => {
    if (editorRef.current) {
      const dsl = await editorRef.current.save();

      // 保存到服务器
      await fetch('/api/quiz', {
        method: 'POST',
        body: JSON.stringify(dsl),
      });
    }
  };

  return (
    <>
      <QuizEditor ref={editorRef} />
      <button onClick={handleSave}>保存</button>
    </>
  );
}
```

### 清空编辑器

```tsx
function EditorWithClear() {
  const editorRef = useRef<QuizEditorRef>(null);

  const handleClear = async () => {
    if (editorRef.current) {
      await editorRef.current.clear();
    }
  };

  return (
    <>
      <QuizEditor ref={editorRef} />
      <button onClick={handleClear}>清空</button>
    </>
  );
}
```

### 检查是否有未保存的修改

```tsx
function EditorWithDirtyCheck() {
  const editorRef = useRef<QuizEditorRef>(null);

  const handleNavigateAway = () => {
    if (editorRef.current?.isDirty()) {
      const confirmed = confirm('有未保存的修改，确定要离开吗？');
      if (!confirmed) return;
    }

    // 导航到其他页面
    navigate('/other-page');
  };

  return (
    <>
      <QuizEditor ref={editorRef} />
      <button onClick={handleNavigateAway}>离开</button>
    </>
  );
}
```

---

## 完整示例

### 多测验编辑器

```tsx
import { QuizEditor, QuizEditorRef } from '@quizerjs/react';
import { useState, useRef, useEffect } from 'react';
import type { QuizDSL } from '@quizerjs/dsl';

interface Quiz {
  id: string;
  name: string;
  dsl: QuizDSL;
}

function MultiQuizEditor() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string>('');
  const editorRef = useRef<QuizEditorRef>(null);

  const activeQuiz = quizzes.find(q => q.id === activeQuizId);

  // 切换测验时更新编辑器内容
  useEffect(() => {
    if (activeQuiz && editorRef.current) {
      editorRef.current.load(activeQuiz.dsl);
    }
  }, [activeQuizId, activeQuiz?.dsl]);

  const handleChange = (dsl: QuizDSL) => {
    // 更新当前测验的数据
    setQuizzes(prev => prev.map(q => (q.id === activeQuizId ? { ...q, dsl } : q)));
  };

  const handleSave = async () => {
    if (editorRef.current) {
      const dsl = await editorRef.current.save();
      // 保存到服务器
      await saveToServer(activeQuizId, dsl);
    }
  };

  return (
    <div>
      {/* 测验列表 */}
      <nav>
        {quizzes.map(quiz => (
          <button
            key={quiz.id}
            onClick={() => setActiveQuizId(quiz.id)}
            className={activeQuizId === quiz.id ? 'active' : ''}
          >
            {quiz.name}
          </button>
        ))}
      </nav>

      {/* 编辑器 */}
      {activeQuiz && (
        <>
          <QuizEditor ref={editorRef} initialDSL={activeQuiz.dsl} onChange={handleChange} />
          <button onClick={handleSave}>保存</button>
        </>
      )}
    </div>
  );
}
```

---

## 最佳实践

### 1. 使用 load() 而非 key prop

```tsx
// ✅ 正确
useEffect(() => {
  editorRef.current?.load(newDSL);
}, [dataId]);

// ❌ 错误
<QuizEditor key={dataId} />;
```

### 2. 处理异步操作

```tsx
const handleSave = async () => {
  try {
    const dsl = await editorRef.current?.save();
    await saveToServer(dsl);
  } catch (error) {
    console.error('保存失败:', error);
  }
};
```

### 3. 检查 ref 是否存在

```tsx
if (editorRef.current) {
  await editorRef.current.load(dsl);
}
```

---

## 相关文档

- [API 参考](../api/react-quiz-editor.md) - 完整的 API 文档
- [常见问题](../faq/react.md) - FAQ
- [DSL 文档](../dsl/index.md) - DSL 格式说明
