# Strict Mode (严格模式) 警告

> **TL;DR**: 请在开发环境中**禁用** React Strict Mode。

## 为什么？

React 18+ 的 Strict Mode 在开发环境下会强制执行**双重挂载** (Mount -> Unmount -> Mount) 以检测副作用。

然而，`Editor.js` 是一个非 React 的第三方库，它直接操作 DOM 且包含复杂的异步初始化逻辑。虽然我们已经为此做了防护，但在开发模式下开启 Strict Mode 仍然会导致：

1.  **性能浪费**：编辑器被无意义地销毁重建。
2.  **调试困难**：控制台会被重复的日志淹没。
3.  **不必要的复杂性**：为了适配一个"仅开发时存在"的 React 特性，需要引入复杂的防护代码。

## 如何禁用？

找到你的入口文件（通常是 `main.tsx` 或 `index.tsx`），移除 `<React.StrictMode>` 包裹。

### 修改前

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 修改后 (推荐)

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

请放心，禁用 Strict Mode 不会影响生产环境构建，也不会破坏应用功能。对于富文本编辑器类应用，这是业界通用的最佳实践。
