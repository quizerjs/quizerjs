# React Strict Mode & Editor.js: 终极集成指南

## 1. 核心冲突

React 18+ 的 Strict Mode 在开发环境下会**故意重复挂载组件**（Mount -> Unmount -> Mount），以暴露副作用清理问题。

Editor.js 是一个非 React 的库，它的设计假设是：

1.  `new EditorJS()` 会副作用式地修改 DOM。
2.  `destroy()` 是异步的。

**灾难场景**：

1.  **第一次 Mount**: React 调用 `useEffect` -> `new EditorJS()` 开始初始化（异步）。
2.  **立即 Unmount**: React 销毁组件 -> 调用 `cleanup` -> `editor.destroy()` 被触发（也是异步）。
3.  **第二次 Mount**: React 再次挂载 -> `new EditorJS()` 再次被调用。

**竞态条件**：
此时，第一次的 `destroy()` 可能还没跑完（DOM 还没清理干净），第二次的 `init()` 就开始了。结果就是：**一个容器里出现了两个编辑器，或者编辑器初始化报错**。

---

## 2. 社区常见方案（及其缺陷）

### 方案 A: 禁用 Strict Mode

最常见的建议是删除 `<React.StrictMode>`。

- **缺点**：掩耳盗铃，失去了 React 的严格检查，且在未来并发模式下可能再次崩溃。

### 方案 B: 简单的 `useRef` 检查

```typescript
if (editorRef.current) return;
```

- **缺点**：`editorRef` 通常在 `init` 完成后才赋值。在异步间隙期（gap），`editorRef` 是空的，无法阻止第二次初始化。

### 方案 C: `react-editor-js` 包装器

- **缺点**：大多数包装器只是简单封装，内部同样面临上述竞态问题，Issues 区充满了 "duplicate instance" 的报告。

---

## 3. 我们的解决方案：双重锁定 (Double Lock)

经过深度研究，我们实施了目前最健壮的**双重锁定 + 隔离策略**。

### 🔒 锁 1：Core 层同步注册表

**文件**: `packages/quizerjs/src/editor/QuizEditor.ts`

我们在 `init()` 的**第一行同步代码**就注册实例：

```typescript
// 立即占位，不等待 await
editorRegistry.set(this.container, this);
```

**作用**：即使第一个实例还在异步加载中，第二个实例一进来查注册表，就能发现"有人占座了"，从而触发自动清理或中止。

### 🔒 锁 2：React 层唯一 ID 隔离

**文件**: `packages/react/src/useQuizEditor.ts`

我们不复用 DOM ID，而是每次挂载生成唯一 ID：

```typescript
const holderId = `quiz-editor-${randomId}`;
container.id = holderId;
container.innerHTML = ''; // 暴力同步清理
```

**作用**：

1.  **物理隔离**：每个实例都认为自己拥有一个全新的容器。
2.  **暴力清理**：同步清空 `innerHTML` 确保即使上一个 destroy 慢了，新实例也不会在旧 DOM 上叠加。

---

## 4. 结论

不要寻找 "Standard Way" —— 标准做法在 React 18 Strict Mode 下是失效的。

目前的实现是**超越社区标准**的最佳实践：

1.  **保留 Strict Mode**：不妥协开发体验。
2.  **零竞态**：从逻辑（Registry）和物理（DOM）两个层面杜绝冲突。
3.  **自愈能力**：能处理任何极端快速的挂载/卸载序列。

此方案已通过 `QuizEditor.duplicate-prevention.test.ts` 的压力测试验证。
