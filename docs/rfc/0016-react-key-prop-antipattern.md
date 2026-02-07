# RFC 0016: QuizEditor React 使用指南文档需求

## 状态

- **状态**: 已接受 (Accepted)
- **作者**: QuizEditor 维护团队
- **日期**: 2026-02-07
- **类型**: 文档需求

## 摘要

本 RFC 定义了 `@quizerjs/react` 包的 QuizEditor 组件使用指南的文档需求。该指南将添加到项目网站，帮助用户正确使用组件并避免常见的 React 反模式。

## 背景

用户报告在使用 QuizEditor 时遇到重复实例问题，根因是使用 `key={id}` 强制重新挂载。这是一个常见的 React 反模式。我们需要在文档中明确说明正确用法。

## 文档需求

### 1. API 参考文档

**位置**: `docs/api/react-quiz-editor.md`

**内容**:

- Props 完整定义
- Ref 方法完整定义
- TypeScript 类型定义
- 返回值说明

### 2. 使用指南

**位置**: `docs/guides/react-usage.md`

**内容**:

#### 2.1 基本用法

- 最简单的使用示例
- Props 说明
- 事件处理

#### 2.2 切换内容（重点）

- ✅ 正确方式：使用 `load()` 方法
- ❌ 错误方式：使用 `key` prop
- 完整代码示例
- 原理解释

#### 2.3 Ref 方法使用

- `save()` 使用场景
- `load()` 使用场景
- `clear()` 使用场景
- `isDirty()` 使用场景

### 3. 常见问题 (FAQ)

**位置**: `docs/faq/react.md`

**问题列表**:

**Q: 如何在不同章节之间切换？**

```tsx
// ❌ 错误
<QuizEditor key={chapterId} />;

// ✅ 正确
useEffect(() => {
  editorRef.current?.load(chapterData);
}, [chapterId]);
```

**Q: 为什么不能用 key prop 切换内容？**

- 性能问题
- StrictMode 双重挂载
- 异步清理导致重复实例

**Q: initialDSL 和 load() 有什么区别？**

- `initialDSL`: 首次挂载时使用
- `load()`: 已挂载后更新内容

**Q: 如何检测是否有重复编辑器？**

```javascript
document.querySelectorAll('.codex-editor').length; // 应该是 1
```

### 4. 反模式警告

**位置**: 在使用指南中作为警告框

```markdown
> [!WARNING]
> **常见反模式：使用 key prop 强制重新挂载**
>
> 不要使用 `key={id}` 来切换内容，这会导致：
>
> - 性能问题（完全重建组件）
> - StrictMode 下的重复实例
> - 异步清理问题
>
> 正确做法：使用 `editorRef.current.load(newData)`
```

## 实施计划

### 阶段 1: 创建文档文件

- [ ] 创建 `docs/api/react-quiz-editor.md`
- [ ] 创建 `docs/guides/react-usage.md`
- [ ] 创建 `docs/faq/react.md`

### 阶段 2: 编写内容

- [ ] API 参考文档
- [ ] 使用指南（重点：切换内容部分）
- [ ] FAQ 常见问题

### 阶段 3: 代码示例

- [ ] 基本用法示例
- [ ] 切换内容示例（正确 vs 错误）
- [ ] Ref 方法使用示例
- [ ] 完整应用示例

### 阶段 4: 集成到网站

- [ ] 添加到网站导航
- [ ] 添加搜索索引
- [ ] 添加相关链接

## 文档结构建议

```
docs/
├── api/
│   └── react-quiz-editor.md       # API 参考
├── guides/
│   ├── getting-started.md
│   ├── react-usage.md              # 使用指南（新增）
│   └── vue-usage.md
└── faq/
    ├── general.md
    └── react.md                    # React FAQ（新增）
```

## 代码示例模板

所有示例应包含：

1. ✅ 正确做法
2. ❌ 错误做法（如果适用）
3. 解释为什么
4. 完整可运行的代码

示例格式：

```tsx
// ❌ 错误：使用 key 强制重新挂载
<QuizEditor key={chapterId} initialDSL={data} />;

// ✅ 正确：使用 load() 方法
const editorRef = useRef<QuizEditorRef>(null);

useEffect(() => {
  if (editorRef.current) {
    editorRef.current.load(data);
  }
}, [chapterId, data]);

<QuizEditor ref={editorRef} initialDSL={initialData} />;
```

## 验收标准

文档完成后应满足：

- [ ] 用户能找到如何切换内容的正确方法
- [ ] 明确警告 `key` prop 反模式
- [ ] 提供完整可运行的代码示例
- [ ] 解释了设计原理（为什么这样设计）
- [ ] 包含调试技巧

## 相关 RFC

- RFC 0015: React Editor 渲染循环修复

## 后续工作

- 在 README 中添加文档链接
- 在 TypeScript 类型定义中添加 JSDoc 注释
- 考虑添加 ESLint 规则检测 `key` prop 反模式
