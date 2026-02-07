# QuizEditor React 常见问题

## 使用相关

### Q: 如何在不同测验之间切换？

**A**: 使用 `load()` 方法，不要使用 `key` prop。

```tsx
// ✅ 正确
const editorRef = useRef<QuizEditorRef>(null);

useEffect(() => {
  if (editorRef.current) {
    editorRef.current.load(newQuizDSL);
  }
}, [quizId]);

<QuizEditor ref={editorRef} initialDSL={initialQuizDSL} />;
```

```tsx
// ❌ 错误
<QuizEditor key={quizId} initialDSL={quizDSL} />
```

**原因**: 使用 `key` prop 会强制组件完全重新挂载，导致性能问题和可能的重复实例。

---

### Q: 为什么不能用 key prop 切换内容？

**A**: 使用 `key` prop 会导致以下问题：

1. **性能问题**: 完全销毁并重建组件，而不是更新内容
2. **重复实例**: 在 React StrictMode 下可能创建重复的编辑器实例
3. **异步清理问题**: EditorJS 的清理是异步的，可能导致 DOM 中有多个编辑器
4. **违反最佳实践**: `key` prop 应该用于列表渲染，不是用来"刷新"组件

**正确做法**: 使用组件提供的 `load()` 方法。

---

### Q: initialDSL 和 load() 有什么区别？

**A**:

- **`initialDSL` prop**: 仅在组件**首次挂载**时使用，用于初始化编辑器
- **`load()` ref 方法**: 用于组件**已挂载后**更新内容

```tsx
// initialDSL: 首次挂载时的初始数据
<QuizEditor initialDSL={initialData} />;

// load(): 后续更新内容
useEffect(() => {
  editorRef.current?.load(newData);
}, [dataId]);
```

---

### Q: 如何检测是否有重复编辑器？

**A**: 在浏览器开发者工具的控制台运行：

```javascript
document.querySelectorAll('.codex-editor').length;
```

应该返回 `1`。如果返回 `2` 或更多，说明有重复实例。

**解决方法**: 检查是否使用了 `key` prop，改用 `load()` 方法。

---

### Q: 如何保存编辑器内容？

**A**: 使用 `save()` ref 方法：

```tsx
const editorRef = useRef<QuizEditorRef>(null);

const handleSave = async () => {
  const dsl = await editorRef.current?.save();
  // 保存到服务器
  await fetch('/api/quiz', {
    method: 'POST',
    body: JSON.stringify(dsl),
  });
};
```

---

### Q: 如何清空编辑器？

**A**: 使用 `clear()` ref 方法：

```tsx
const handleClear = async () => {
  await editorRef.current?.clear();
};
```

---

### Q: 如何检查是否有未保存的修改？

**A**: 使用 `isDirty()` ref 方法：

```tsx
const handleNavigateAway = () => {
  if (editorRef.current?.isDirty()) {
    const confirmed = confirm('有未保存的修改，确定要离开吗？');
    if (!confirmed) return;
  }
  navigate('/other-page');
};
```

---

## 错误排查

### Q: 为什么会出现"QuizEditor 已经初始化"错误？

**A**: 这通常发生在对同一个实例调用两次 `init()` 时。这是组件内部方法，不应该手动调用。

如果你看到这个错误，检查：

1. 是否在 StrictMode 下运行（开发环境）
2. 是否使用了 `key` prop

**解决方法**: 移除 `key` prop，使用 `load()` 方法。

---

### Q: 为什么编辑器在切换时会闪烁？

**A**: 可能是使用了 `key` prop 导致组件重新挂载。

**解决方法**: 使用 `load()` 方法更新内容，而不是重新挂载组件。

---

### Q: 为什么 onChange 没有触发？

**A**: 检查以下几点：

1. 是否正确传递了 `onChange` prop
2. 是否设置了 `readOnly={true}`
3. 编辑器是否正确初始化

```tsx
<QuizEditor
  onChange={dsl => {
    console.log('内容变化:', dsl);
  }}
/>
```

---

## 性能相关

### Q: 如何优化大型测验的性能？

**A**:

1. **使用 load() 而非 key prop**: 避免不必要的重新挂载
2. **使用 React.memo**: 防止父组件重渲染导致的不必要更新
3. **延迟加载**: 只在需要时加载编辑器

```tsx
const MemoizedEditor = React.memo(QuizEditor);
```

---

### Q: 为什么编辑器加载很慢？

**A**: EditorJS 需要加载多个工具和插件。可以：

1. 使用代码分割
2. 显示加载指示器
3. 预加载编辑器资源

---

## 集成相关

### Q: 如何在 Next.js 中使用？

**A**: QuizEditor 使用了浏览器 API，需要在客户端渲染：

```tsx
'use client'; // Next.js 13+ App Router

import { QuizEditor } from '@quizerjs/react';

export default function EditorPage() {
  return <QuizEditor />;
}
```

或使用动态导入：

```tsx
import dynamic from 'next/dynamic';

const QuizEditor = dynamic(() => import('@quizerjs/react').then(mod => mod.QuizEditor), {
  ssr: false,
});
```

---

### Q: 如何在 TypeScript 中使用？

**A**: 包已经包含 TypeScript 类型定义：

```tsx
import { QuizEditor, QuizEditorRef } from '@quizerjs/react';
import type { QuizDSL } from '@quizerjs/dsl';

const editorRef = useRef<QuizEditorRef>(null);
const [dsl, setDsl] = useState<QuizDSL>(initialData);
```

---

## 相关文档

- [使用指南](../guides/react-usage.md) - 详细的使用教程
- [API 参考](../api/react-quiz-editor.md) - 完整的 API 文档
- [DSL 文档](../dsl/index.md) - DSL 格式说明
