# RFC 0018: QuizEditor 测试覆盖率和纯函数重构

## 状态

- **状态**: 已提议 (Proposed)
- **作者**: QuizEditor 核心团队
- **日期**: 2026-02-07
- **优先级**: P1 (High)

## 摘要

提高 QuizEditor 的测试覆盖率，并通过提取纯函数来减少组件大小，提高可测试性和可维护性。

## 目标

1. **提取纯函数**：将复杂逻辑从类方法中提取为独立的纯函数
2. **提高测试覆盖率**：为核心逻辑添加单元测试
3. **减少组件大小**：通过模块化降低单个文件的复杂度

## 当前状态

### 测试覆盖现状

- ✅ 有 `QuizPlayer.test.ts`
- ❌ 缺少 `QuizEditor` 测试
- ❌ 缺少防护机制测试
- ❌ 缺少边缘情况测试

### 代码结构问题

- `QuizEditor.ts` 约 350 行，包含大量逻辑
- 工具配置、数据转换等逻辑耦合在类中
- 难以单独测试各个功能

## 重构计划

### 1. 提取纯函数

#### 1.1 工具配置函数

```typescript
// src/editor/utils/tools.ts
export function getEditorTools(): Record<string, ToolConfig> {
  return {
    paragraph: Paragraph,
    header: {
      class: Header as unknown as ToolConstructable,
      config: {
        levels: [1, 2, 3, 4],
        defaultLevel: 2,
      },
    },
    'quiz-single-choice': {
      class: SingleChoiceTool,
      inlineToolbar: true,
    },
    // ...
  };
}
```

#### 1.2 默认数据生成

```typescript
// src/editor/utils/defaults.ts
export function getDefaultEditorData(): EditorJSOutput {
  return {
    blocks: [
      {
        type: 'header',
        data: {
          text: '欢迎使用 Quiz Editor',
          level: 1,
        },
      },
      {
        type: 'paragraph',
        data: {
          text: '开始编写你的测验内容...',
        },
      },
    ],
  };
}
```

#### 1.3 容器清理函数

```typescript
// src/editor/utils/cleanup.ts
export async function cleanupEditorDOM(container: HTMLElement): Promise<number> {
  const existingEditors = container.querySelectorAll('.codex-editor');
  const count = existingEditors.length;

  if (count > 0) {
    existingEditors.forEach(el => el.remove());
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return count;
}
```

#### 1.4 注册表操作

```typescript
// src/editor/utils/registry.ts
const editorRegistry = new WeakMap<HTMLElement, QuizEditor>();

export function getRegisteredEditor(container: HTMLElement): QuizEditor | undefined {
  return editorRegistry.get(container);
}

export function registerEditor(container: HTMLElement, editor: QuizEditor): void {
  editorRegistry.set(container, editor);
}

export function unregisterEditor(container: HTMLElement, editor: QuizEditor): boolean {
  if (editorRegistry.get(container) === editor) {
    editorRegistry.delete(container);
    return true;
  }
  return false;
}
```

### 2. 测试计划

#### 2.1 纯函数测试

```typescript
// src/editor/utils/__tests__/cleanup.test.ts
describe('cleanupEditorDOM', () => {
  it('should remove existing editor DOM', async () => {
    const container = document.createElement('div');
    const editor = document.createElement('div');
    editor.className = 'codex-editor';
    container.appendChild(editor);

    const count = await cleanupEditorDOM(container);

    expect(count).toBe(1);
    expect(container.querySelector('.codex-editor')).toBeNull();
  });

  it('should return 0 when no editors exist', async () => {
    const container = document.createElement('div');
    const count = await cleanupEditorDOM(container);
    expect(count).toBe(0);
  });
});
```

#### 2.2 注册表测试

```typescript
// src/editor/utils/__tests__/registry.test.ts
describe('Editor Registry', () => {
  it('should register and retrieve editor', () => {
    const container = document.createElement('div');
    const editor = {} as QuizEditor;

    registerEditor(container, editor);
    expect(getRegisteredEditor(container)).toBe(editor);
  });

  it('should unregister only matching editor', () => {
    const container = document.createElement('div');
    const editor1 = {} as QuizEditor;
    const editor2 = {} as QuizEditor;

    registerEditor(container, editor1);
    expect(unregisterEditor(container, editor2)).toBe(false);
    expect(unregisterEditor(container, editor1)).toBe(true);
  });
});
```

#### 2.3 QuizEditor 集成测试

```typescript
// src/editor/__tests__/QuizEditor.test.ts
describe('QuizEditor', () => {
  describe('Duplicate Prevention', () => {
    it('should prevent duplicate initialization on same instance', async () => {
      const container = document.createElement('div');
      const editor = new QuizEditor({ container });

      await editor.init();
      await expect(editor.init()).rejects.toThrow('已经初始化');
    });

    it('should auto-destroy old instance when new one initializes', async () => {
      const container = document.createElement('div');
      const editor1 = new QuizEditor({ container });
      const editor2 = new QuizEditor({ container });

      await editor1.init();
      const destroySpy = vi.spyOn(editor1, 'destroy');

      await editor2.init();

      expect(destroySpy).toHaveBeenCalled();
      expect(container.querySelectorAll('.codex-editor').length).toBe(1);
    });

    it('should cleanup orphaned DOM', async () => {
      const container = document.createElement('div');
      const orphan = document.createElement('div');
      orphan.className = 'codex-editor';
      container.appendChild(orphan);

      const editor = new QuizEditor({ container });
      await editor.init();

      // Orphan should be removed
      expect(container.querySelectorAll('.codex-editor').length).toBe(1);
    });
  });

  describe('Lifecycle', () => {
    it('should prevent double destroy', async () => {
      const container = document.createElement('div');
      const editor = new QuizEditor({ container });

      await editor.init();
      await editor.destroy();
      await editor.destroy(); // Should not throw
    });
  });
});
```

## 文件结构

```
packages/quizerjs/src/editor/
├── QuizEditor.ts                    # 主类（简化后）
├── utils/
│   ├── tools.ts                     # 工具配置
│   ├── defaults.ts                  # 默认数据
│   ├── cleanup.ts                   # DOM 清理
│   ├── registry.ts                  # 注册表管理
│   └── __tests__/
│       ├── tools.test.ts
│       ├── defaults.test.ts
│       ├── cleanup.test.ts
│       └── registry.test.ts
└── __tests__/
    └── QuizEditor.test.ts           # 集成测试
```

## 实施步骤

1. **Phase 1**: 提取纯函数
   - [ ] 创建 `utils/` 目录
   - [ ] 提取工具配置
   - [ ] 提取默认数据生成
   - [ ] 提取 DOM 清理逻辑
   - [ ] 提取注册表操作

2. **Phase 2**: 重构 QuizEditor
   - [ ] 使用提取的纯函数
   - [ ] 简化 `init()` 方法
   - [ ] 简化 `destroy()` 方法

3. **Phase 3**: 添加测试
   - [ ] 纯函数单元测试
   - [ ] QuizEditor 集成测试
   - [ ] 边缘情况测试

4. **Phase 4**: 验证
   - [ ] 运行测试套件
   - [ ] 检查覆盖率报告
   - [ ] 确保所有测试通过

## 预期收益

- **可测试性**: 纯函数易于测试，无需 mock
- **可维护性**: 单一职责，逻辑清晰
- **可重用性**: 纯函数可在其他地方使用
- **代码大小**: QuizEditor.ts 从 ~350 行减少到 ~200 行
- **测试覆盖率**: 从 0% 提升到 >80%

## 验收标准

- [ ] QuizEditor.ts < 250 行
- [ ] 所有纯函数有单元测试
- [ ] QuizEditor 有集成测试
- [ ] 测试覆盖率 > 80%
- [ ] 所有测试通过
- [ ] 构建成功
