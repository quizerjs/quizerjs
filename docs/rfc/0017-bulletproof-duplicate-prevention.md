# RFC 0017: 防弹级重复编辑器防护

## 状态

- **状态**: 已提议 (Proposed)
- **作者**: QuizEditor 核心团队
- **日期**: 2026-02-07
- **优先级**: P0 (Critical)

## 摘要

QuizEditor 组件必须**绝对保证**不会创建重复的 EditorJS 实例，无论用户如何使用（包括错误使用如 `key` prop）。这是组件的**内部责任**，不应依赖用户正确使用。

## 设计原则

> **核心原则**：一个 DOM 容器 = 最多一个 EditorJS 实例
>
> 无论发生什么（StrictMode、key prop、快速切换），这个不变量必须保持。

## 当前问题

### 问题 1: 容器检查不够强

```typescript
// 当前实现
const existingEditor = this.container.querySelector('.codex-editor');
if (existingEditor) {
  throw new Error(...); // ❌ 抛出错误，但已经太晚了
}
```

**问题**：检查时机太晚，且只是抛错，没有主动清理。

### 问题 2: 异步清理竞态

```
T0: 组件 A 开始卸载
T1: 组件 A 的清理函数运行（异步 destroy）
T2: 组件 B 开始挂载（key 变化）
T3: 组件 B 创建新编辑器
T4: 组件 A 的 destroy 完成
结果: T3-T4 之间有两个编辑器！
```

### 问题 3: 清理失败没有重试

如果 `destroy()` 失败，DOM 中会留下孤立的编辑器。

## 解决方案

### 方案 A: 容器级别的全局注册表（推荐）

使用 WeakMap 跟踪每个容器的编辑器实例：

```typescript
// 全局注册表
const editorRegistry = new WeakMap<HTMLElement, QuizEditor>();

class QuizEditor {
  async init(): Promise<void> {
    // 1. 检查注册表
    const existing = editorRegistry.get(this.container);
    if (existing) {
      console.warn('[QuizEditor] 容器已有实例，先销毁旧实例');
      await existing.destroy();
    }

    // 2. 强制清理 DOM（防御性）
    const existingDOM = this.container.querySelector('.codex-editor');
    if (existingDOM) {
      console.warn('[QuizEditor] 发现孤立的编辑器 DOM，强制移除');
      existingDOM.remove();
    }

    // 3. 注册新实例
    editorRegistry.set(this.container, this);

    // 4. 初始化 EditorJS
    this.editor = new EditorJS({...});
  }

  async destroy(): Promise<void> {
    try {
      await this.editor?.destroy();
    } finally {
      // 确保从注册表移除
      editorRegistry.delete(this.container);
      this.editor = null;
    }
  }
}
```

**优势**：

- ✅ 容器级别的单例保证
- ✅ 自动清理旧实例
- ✅ WeakMap 自动垃圾回收
- ✅ 防御性 DOM 清理

### 方案 B: 容器标记 + 强制清理

在容器上添加数据属性标记：

```typescript
class QuizEditor {
  async init(): Promise<void> {
    // 检查容器标记
    if (this.container.dataset.quizEditorActive === 'true') {
      console.warn('[QuizEditor] 容器已激活，强制清理');
      await this.forceCleanup();
    }

    // 标记容器
    this.container.dataset.quizEditorActive = 'true';

    // 初始化
    this.editor = new EditorJS({...});
  }

  private async forceCleanup(): Promise<void> {
    // 移除所有 .codex-editor
    const editors = this.container.querySelectorAll('.codex-editor');
    editors.forEach(el => el.remove());

    // 清除标记
    delete this.container.dataset.quizEditorActive;
  }

  async destroy(): Promise<void> {
    try {
      await this.editor?.destroy();
    } finally {
      delete this.container.dataset.quizEditorActive;
      this.editor = null;
    }
  }
}
```

**优势**：

- ✅ 简单直接
- ✅ 强制清理 DOM
- ✅ 无需全局状态

**劣势**：

- ⚠️ 无法调用旧实例的 destroy()

## 推荐实现：混合方案

结合两种方案的优点：

```typescript
// 全局注册表
const editorRegistry = new WeakMap<HTMLElement, QuizEditor>();

export class QuizEditor {
  private editor: EditorJS | null = null;
  private container: HTMLElement;
  private isDestroyed = false;

  async init(): Promise<void> {
    if (this.editor) {
      throw new Error('QuizEditor 已经初始化');
    }

    // === 第 1 步：检查并清理旧实例 ===
    const existingInstance = editorRegistry.get(this.container);
    if (existingInstance && existingInstance !== this) {
      console.warn(
        '[QuizEditor] 检测到容器中的旧实例，自动销毁。' +
          '建议使用 load() 方法而非 key prop 切换内容。'
      );

      try {
        await existingInstance.destroy();
      } catch (error) {
        console.error('[QuizEditor] 销毁旧实例失败:', error);
      }
    }

    // === 第 2 步：强制清理孤立的 DOM ===
    await this.forceCleanupDOM();

    // === 第 3 步：注册当前实例 ===
    editorRegistry.set(this.container, this);

    // === 第 4 步：初始化 EditorJS ===
    const initialData = this.options.initialDSL
      ? dslToBlock(this.options.initialDSL)
      : this.getDefaultData();

    this.editor = new EditorJS({
      holder: this.container,
      tools: this.getTools(),
      data: initialData,
      readOnly: this.options.readOnly ?? false,
      onChange: async () => {
        this.isDirtyFlag = true;
        const dsl = await this.save();
        this.options.onChange?.(dsl);
      },
    });

    await this.editor.isReady;
  }

  private async forceCleanupDOM(): Promise<void> {
    const existingEditors = this.container.querySelectorAll('.codex-editor');
    if (existingEditors.length > 0) {
      console.warn(`[QuizEditor] 发现 ${existingEditors.length} 个孤立的编辑器 DOM，强制移除`);
      existingEditors.forEach(el => el.remove());

      // 等待 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return; // 防止重复销毁
    }

    this.isDestroyed = true;

    try {
      if (this.editor) {
        await this.editor.destroy();
      }
    } catch (error) {
      console.warn('[QuizEditor] destroy 失败:', error);
    } finally {
      // 确保清理
      this.editor = null;

      // 从注册表移除
      if (editorRegistry.get(this.container) === this) {
        editorRegistry.delete(this.container);
      }
    }
  }
}
```

## 防护层级

实施后的防护层级：

```
第 1 层: React 组件守卫
  ↓ (如果绕过，如 key prop)
第 2 层: 实例级别守卫 (this.editor 检查)
  ↓ (如果绕过，如新实例)
第 3 层: 注册表检查 + 自动销毁旧实例
  ↓ (如果旧实例销毁失败)
第 4 层: 强制 DOM 清理
  ↓
✅ 保证：容器中最多一个编辑器
```

## 测试场景

必须通过以下所有场景：

### 场景 1: StrictMode 双重挂载

```tsx
<React.StrictMode>
  <QuizEditor />
</React.StrictMode>
```

**预期**: 只有一个编辑器实例

### 场景 2: key prop 强制重新挂载

```tsx
<QuizEditor key={id} />
```

**预期**:

- 旧实例被销毁
- 新实例正常初始化
- 过程中最多一个编辑器
- 控制台有警告信息

### 场景 3: 快速连续切换

```tsx
for (let i = 0; i < 10; i++) {
  setKey(i);
  await sleep(10);
}
```

**预期**: 任何时刻都只有一个编辑器

### 场景 4: destroy 失败

模拟 `editor.destroy()` 抛出错误
**预期**:

- DOM 被强制清理
- 新实例可以正常初始化

## 验收标准

- [ ] 通过所有测试场景
- [ ] `document.querySelectorAll('.codex-editor').length` 始终 ≤ 1
- [ ] 错误使用时有清晰的警告信息
- [ ] 不影响正常使用性能
- [ ] WeakMap 不会导致内存泄漏

## 实施计划

1. **Phase 1**: 实现混合方案
2. **Phase 2**: 添加完整测试
3. **Phase 3**: 更新文档说明防护机制
4. **Phase 4**: 在 React/Vue/Svelte 包中验证

## 相关 RFC

- RFC 0015: React Editor 渲染循环修复
- RFC 0016: QuizEditor React 使用指南文档需求
