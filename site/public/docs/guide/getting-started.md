# 快速开始

本指南将帮助您在 5 分钟内开始使用 QuizerJS。

## 步骤 1: 安装

根据您的项目需求，选择安装相应的包：

```bash
# 核心包（必需）
npm install @quizerjs/quizerjs @quizerjs/core @quizerjs/dsl

# 框架集成包（可选，选择一个）
npm install @quizerjs/react    # React
npm install @quizerjs/vue      # Vue
npm install @quizerjs/svelte   # Svelte
```

## 步骤 2: 创建第一个测验

### 使用编辑器（QuizEditor）

编辑器用于创建和编辑测验。

```typescript
import { QuizEditor } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';

const container = document.getElementById('editor-container');

const editor = new QuizEditor({
  container: container!,
  initialDSL: {
    version: '1.0.0',
    quiz: {
      id: 'quiz-1',
      title: '我的第一个测验',
      questions: []
    }
  },
  onChange: (dsl: QuizDSL) => {
    console.log('DSL 变化:', dsl);
  },
  onSave: (dsl: QuizDSL) => {
    console.log('保存 DSL:', dsl);
  }
});

await editor.init();
```

### 使用播放器（QuizPlayer）

播放器用于展示测验并收集答案。

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

// 创建 DSL 数据
const dsl = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: '我的第一个测验',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: '2 + 2 等于多少？',
        options: [
          { id: 'o1', text: '3', isCorrect: false },
          { id: 'o2', text: '4', isCorrect: true },
          { id: 'o3', text: '5', isCorrect: false }
        ]
      }
    ]
  }
};

// 验证 DSL
const result = validateQuizDSL(dsl);
if (result.valid) {
  // 使用 Web Component
  const player = document.createElement('quiz-player');
  player.setAttribute('dsl', JSON.stringify(dsl));
  player.addEventListener('answer-change', (e: any) => {
    console.log('答案变化:', e.detail);
  });
  document.body.appendChild(player);
} else {
  console.error('验证错误:', result.errors);
}
```

## 步骤 3: 在框架中使用

### React

```tsx
import { QuizEditor, QuizPlayer } from '@quizerjs/react';

function App() {
  const dsl = { /* ... */ };
  
  return (
    <>
      <QuizEditor 
        initialDSL={dsl}
        onChange={(dsl) => console.log('变化:', dsl)}
      />
      <QuizPlayer dsl={dsl} />
    </>
  );
}
```

### Vue

```vue
<template>
  <QuizEditor 
    :initial-dsl="dsl"
    @change="handleChange"
  />
  <QuizPlayer :dsl="dsl" />
</template>

<script setup>
import { QuizEditor, QuizPlayer } from '@quizerjs/vue';
import { ref } from 'vue';

const dsl = ref({ /* ... */ });

const handleChange = (newDsl) => {
  console.log('变化:', newDsl);
  dsl.value = newDsl;
};
</script>
```

### Svelte

```svelte
<script>
  import { QuizEditor, QuizPlayer } from '@quizerjs/svelte';
  import { writable } from 'svelte/store';
  
  let dsl = writable({ /* ... */ });
  
  function handleChange(newDsl) {
    console.log('变化:', newDsl);
    dsl.set(newDsl);
  }
</script>

<QuizEditor 
  initialDSL={$dsl}
  onChange={handleChange}
/>
<QuizPlayer dsl={$dsl} />
```

## 下一步

- [安装指南](./installation.md) - 详细的安装说明
- [DSL 指南](./dsl-guide.md) - 了解 DSL 数据格式
- [Vue 集成](./vue-integration.md) - 在 Vue 3 中使用
- [React 集成](../examples/) - 在 React 中使用
- [框架集成示例](../examples/) - 查看完整示例

