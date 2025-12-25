# 自定义 QuizEditor

本指南介绍如何自定义 QuizEditor 以满足您的特定需求。

## 基本配置选项

QuizEditor 提供了以下配置选项：

```typescript
interface QuizEditorOptions {
  /** 编辑器容器元素 */
  container: HTMLElement;
  /** 初始 DSL 数据（可选） */
  initialDSL?: QuizDSL;
  /** 数据变化回调 */
  onChange?: (dsl: QuizDSL) => void;
  /** 保存回调 */
  onSave?: (dsl: QuizDSL) => void;
  /** 只读模式 */
  readOnly?: boolean;
}
```

## Vanilla JS

### 基础使用

```typescript
import { QuizEditor } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';

const container = document.getElementById('editor-container')!;

const editor = new QuizEditor({
  container,
  initialDSL: {
    version: '1.0.0',
    quiz: {
      id: 'quiz-1',
      title: '我的测验',
      questions: []
    }
  },
  onChange: (dsl: QuizDSL) => {
    console.log('数据变化:', dsl);
    // 可以在这里实现自动保存
  },
  onSave: (dsl: QuizDSL) => {
    console.log('保存数据:', dsl);
    // 发送到服务器
    fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dsl)
    });
  },
  readOnly: false
});

await editor.init();
```

### 只读模式

```typescript
const editor = new QuizEditor({
  container,
  initialDSL: quizData,
  readOnly: true // 启用只读模式
});

await editor.init();
```

### 动态加载数据

```typescript
// 从服务器加载数据
async function loadQuiz(quizId: string) {
  const response = await fetch(`/api/quizzes/${quizId}`);
  const dsl: QuizDSL = await response.json();
  
  await editor.load(dsl);
}

// 保存数据
async function saveQuiz() {
  const dsl = await editor.save();
  await fetch('/api/quizzes', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dsl)
  });
}
```

### 监听数据变化

```typescript
let autoSaveTimer: number | null = null;

const editor = new QuizEditor({
  container,
  onChange: (dsl: QuizDSL) => {
    // 防抖：延迟 2 秒后自动保存
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    autoSaveTimer = window.setTimeout(async () => {
      await saveQuiz(dsl);
      console.log('自动保存完成');
    }, 2000);
  }
});
```

## React

### 基础使用

```tsx
import React, { useRef, useEffect } from 'react';
import { QuizEditor } from '@quizerjs/react';
import type { QuizDSL } from '@quizerjs/dsl';

function MyEditor() {
  const [dsl, setDsl] = React.useState<QuizDSL | undefined>(undefined);

  return (
    <QuizEditor
      initialDSL={dsl}
      readOnly={false}
      onChange={(newDsl) => {
        setDsl(newDsl);
        console.log('数据变化:', newDsl);
      }}
      onSave={(savedDsl) => {
        console.log('保存数据:', savedDsl);
        // 发送到服务器
      }}
    />
  );
}
```

### 使用 Ref 访问编辑器实例

```tsx
import React, { useRef } from 'react';
import { QuizEditor, type QuizEditorRef } from '@quizerjs/react';

function MyEditor() {
  const editorRef = useRef<QuizEditorRef>(null);

  const handleSave = async () => {
    if (editorRef.current) {
      const dsl = await editorRef.current.save();
      console.log('保存的数据:', dsl);
    }
  };

  const handleLoad = async (quizId: string) => {
    const response = await fetch(`/api/quizzes/${quizId}`);
    const dsl = await response.json();
    
    if (editorRef.current) {
      await editorRef.current.load(dsl);
    }
  };

  return (
    <div>
      <QuizEditor
        ref={editorRef}
        onChange={(dsl) => console.log('变化:', dsl)}
      />
      <button onClick={handleSave}>保存</button>
      <button onClick={() => handleLoad('quiz-1')}>加载</button>
    </div>
  );
}
```

### 条件渲染和状态管理

```tsx
import React, { useState, useEffect } from 'react';
import { QuizEditor } from '@quizerjs/react';
import type { QuizDSL } from '@quizerjs/dsl';

function EditorWithState() {
  const [dsl, setDsl] = useState<QuizDSL | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 加载初始数据
    fetch('/api/quizzes/default')
      .then(res => res.json())
      .then(data => {
        setDsl(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (savedDsl: QuizDSL) => {
    setSaving(true);
    try {
      await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedDsl)
      });
      console.log('保存成功');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      {saving && <div>保存中...</div>}
      <QuizEditor
        initialDSL={dsl}
        onChange={setDsl}
        onSave={handleSave}
      />
    </div>
  );
}
```

## Vue

### 基础使用

```vue
<template>
  <QuizEditor
    :initial-dsl="dsl"
    :read-only="readOnly"
    @change="handleChange"
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QuizEditor } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';

const dsl = ref<QuizDSL | undefined>(undefined);
const readOnly = ref(false);

const handleChange = (newDsl: QuizDSL) => {
  dsl.value = newDsl;
  console.log('数据变化:', newDsl);
};

const handleSave = (savedDsl: QuizDSL) => {
  console.log('保存数据:', savedDsl);
  // 发送到服务器
  fetch('/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(savedDsl)
  });
};
</script>
```

### 使用模板引用访问编辑器实例

```vue
<template>
  <div>
    <QuizEditor
      ref="editorRef"
      :initial-dsl="dsl"
      @change="handleChange"
    />
    <button @click="handleSave">保存</button>
    <button @click="handleLoad">加载</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QuizEditor } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';

const editorRef = ref<InstanceType<typeof QuizEditor> | null>(null);
const dsl = ref<QuizDSL | undefined>(undefined);

const handleChange = (newDsl: QuizDSL) => {
  dsl.value = newDsl;
};

const handleSave = async () => {
  if (editorRef.value) {
    const savedDsl = await editorRef.value.save();
    console.log('保存的数据:', savedDsl);
  }
};

const handleLoad = async () => {
  const response = await fetch('/api/quizzes/quiz-1');
  const loadedDsl = await response.json();
  
  if (editorRef.value) {
    await editorRef.value.load(loadedDsl);
  }
};
</script>
```

### 响应式数据绑定

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-if="saving">保存中...</div>
      <QuizEditor
        :initial-dsl="dsl"
        :read-only="readOnly"
        @change="handleChange"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { QuizEditor } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';

const dsl = ref<QuizDSL | undefined>(undefined);
const loading = ref(true);
const saving = ref(false);
const readOnly = ref(false);

onMounted(async () => {
  try {
    const response = await fetch('/api/quizzes/default');
    dsl.value = await response.json();
  } finally {
    loading.value = false;
  }
});

const handleChange = (newDsl: QuizDSL) => {
  dsl.value = newDsl;
};

const handleSave = async (savedDsl: QuizDSL) => {
  saving.value = true;
  try {
    await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedDsl)
    });
    console.log('保存成功');
  } finally {
    saving.value = false;
  }
};
</script>
```

## Svelte

### 基础使用

```svelte
<script lang="ts">
  import { QuizEditor } from '@quizerjs/svelte';
  import type { QuizDSL } from '@quizerjs/dsl';
  
  let dsl: QuizDSL | undefined = undefined;
  let readOnly = false;

  function handleChange(newDsl: QuizDSL) {
    dsl = newDsl;
    console.log('数据变化:', newDsl);
  }

  function handleSave(savedDsl: QuizDSL) {
    console.log('保存数据:', savedDsl);
    // 发送到服务器
    fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedDsl)
    });
  }
</script>

<QuizEditor
  {initialDSL={dsl}}
  {readOnly}
  on:change={(e) => handleChange(e.detail)}
  on:save={(e) => handleSave(e.detail)}
/>
```

### 使用绑定访问编辑器实例

```svelte
<script lang="ts">
  import { QuizEditor, type QuizEditorRef } from '@quizerjs/svelte';
  import type { QuizDSL } from '@quizerjs/dsl';
  
  let editorRef: QuizEditorRef | null = null;
  let dsl: QuizDSL | undefined = undefined;

  async function handleSave() {
    if (editorRef) {
      const savedDsl = await editorRef.save();
      console.log('保存的数据:', savedDsl);
    }
  }

  async function handleLoad() {
    const response = await fetch('/api/quizzes/quiz-1');
    const loadedDsl = await response.json();
    
    if (editorRef) {
      await editorRef.load(loadedDsl);
    }
  }
</script>

<div>
  <QuizEditor
    bind:editorRef
    initialDSL={dsl}
    on:change={(e) => dsl = e.detail}
  />
  <button on:click={handleSave}>保存</button>
  <button on:click={handleLoad}>加载</button>
</div>
```

### 响应式状态管理

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { QuizEditor } from '@quizerjs/svelte';
  import type { QuizDSL } from '@quizerjs/dsl';
  
  let dsl: QuizDSL | undefined = undefined;
  let loading = true;
  let saving = false;
  let readOnly = false;

  onMount(async () => {
    try {
      const response = await fetch('/api/quizzes/default');
      dsl = await response.json();
    } finally {
      loading = false;
    }
  });

  function handleChange(newDsl: QuizDSL) {
    dsl = newDsl;
  }

  async function handleSave(savedDsl: QuizDSL) {
    saving = true;
    try {
      await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedDsl)
      });
      console.log('保存成功');
    } finally {
      saving = false;
    }
  }
</script>

{#if loading}
  <div>加载中...</div>
{:else}
  {#if saving}
    <div>保存中...</div>
  {/if}
  <QuizEditor
    initialDSL={dsl}
    {readOnly}
    on:change={(e) => handleChange(e.detail)}
    on:save={(e) => handleSave(e.detail)}
  />
{/if}
```

## 高级自定义

### 自定义样式

所有框架都支持通过 CSS 自定义编辑器样式：

```css
/* 自定义编辑器容器 */
.quiz-editor {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  min-height: 400px;
}

/* 自定义 Editor.js 样式 */
.quiz-editor .codex-editor {
  font-family: 'Inter', sans-serif;
}

.quiz-editor .ce-block__content {
  max-width: 800px;
  margin: 0 auto;
}
```

### 监听编辑器状态

```typescript
// Vanilla JS
const editor = new QuizEditor({ container });

await editor.init();

// 检查是否有未保存的更改
if (editor.isDirty) {
  console.log('有未保存的更改');
}

// 获取 Editor.js 实例（用于高级操作）
const editorInstance = editor.getEditorInstance();
if (editorInstance) {
  // 可以访问 Editor.js 的所有 API
  console.log('编辑器已就绪');
}
```

### 错误处理

```typescript
try {
  const editor = new QuizEditor({
    container,
    initialDSL: invalidDSL // 可能无效的数据
  });
  
  await editor.init();
} catch (error) {
  if (error instanceof Error) {
    console.error('初始化失败:', error.message);
    // 显示错误提示给用户
  }
}

// 加载数据时的错误处理
try {
  await editor.load(dsl);
} catch (error) {
  if (error instanceof Error && error.message.includes('Invalid DSL')) {
    console.error('DSL 验证失败');
    // 显示验证错误
  }
}
```

## 最佳实践

1. **使用 onChange 实现自动保存**：监听数据变化，使用防抖或节流来避免频繁保存。

2. **验证数据**：在保存前验证 DSL 数据，确保数据完整性。

3. **错误处理**：始终处理可能的错误，提供友好的错误提示。

4. **性能优化**：对于大型测验，考虑使用虚拟滚动或分页加载。

5. **状态管理**：在框架中使用状态管理库（如 Redux、Pinia）来管理编辑器状态。

## 下一步

- [DSL 指南](./dsl-guide.md) - 了解 DSL 数据格式
- [快速开始](./getting-started.md) - 查看基础使用
- [框架集成](./vue-integration.md) - 查看 Vue 集成示例
