# @quizerjs/vue 使用指南

## 组件概览

`@quizerjs/vue` 提供了两个主要组件：

1. **QuizEditor** - 测验编辑器组件
2. **QuizPlayer** - 测验播放器组件

## 快速开始

### 1. 使用 QuizEditor

```vue
<template>
  <QuizEditor :initial-dsl="quizDSL" @change="handleChange" @save="handleSave" />
</template>

<script setup lang="ts">
import { QuizEditor } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/vue';

const quizDSL: QuizDSL = {
  // ... DSL 数据
};

function handleChange(dsl: QuizDSL) {
  console.log('DSL 变化:', dsl);
}

function handleSave(dsl: QuizDSL) {
  console.log('保存的 DSL:', dsl);
}
</script>
```

### 2. 使用 QuizPlayer

```vue
<template>
  <QuizPlayer :quiz-dsl="quizDSL" @submit="handleSubmit" @answer-change="handleAnswerChange" />
</template>

<script setup lang="ts">
import { QuizPlayer } from '@quizerjs/vue';
import type { QuizDSL, ResultDSL, AnswerValue } from '@quizerjs/vue';

const quizDSL: QuizDSL = {
  // ... DSL 数据
};

function handleSubmit(result: ResultDSL) {
  console.log('提交的结果:', result);
}

function handleAnswerChange(questionId: string, answer: AnswerValue) {
  console.log('答案变化:', questionId, answer);
}
</script>
```

### 3. 组合使用 QuizEditor 和 QuizPlayer

如果需要同时使用编辑器和播放器，可以自己组合这两个组件：

```vue
<template>
  <div class="app">
    <div class="toolbar">
      <button @click="mode = 'editor'">编辑</button>
      <button @click="handlePlay">播放</button>
    </div>

    <QuizEditor
      v-if="mode === 'editor'"
      ref="editorRef"
      :initial-dsl="quizDSL"
      @change="handleEditorChange"
      @save="handleEditorSave"
    />

    <QuizPlayer
      v-if="mode === 'player' && playDSL"
      :quiz="playDSL"
      @submit="handlePlayerSubmit"
      @answer-change="handleAnswerChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QuizEditor, QuizPlayer } from '@quizerjs/vue';
import type { QuizDSL, ResultDSL, AnswerValue } from '@quizerjs/vue';

const mode = ref<'editor' | 'player'>('editor');
const quizDSL = ref<QuizDSL>({
  /* ... */
});
const playDSL = ref<QuizDSL | null>(null);
const editorRef = ref<InstanceType<typeof QuizEditor> | null>(null);

async function handlePlay() {
  if (editorRef.value) {
    const dsl = await editorRef.value.save();
    if (dsl) {
      playDSL.value = dsl;
      mode.value = 'player';
    }
  }
}

function handleEditorChange(dsl: QuizDSL) {
  quizDSL.value = dsl;
}

function handleEditorSave(dsl: QuizDSL) {
  quizDSL.value = dsl;
}

function handlePlayerSubmit(result: ResultDSL) {
  console.log('提交结果:', result);
}

function handleAnswerChange(questionId: string, answer: AnswerValue) {
  console.log('答案变化:', questionId, answer);
}
</script>
```

## 组件 API

### QuizEditor

**Props:**

- `initialDSL` (QuizDSL, 可选): 初始 DSL 数据
- `readOnly` (boolean, 可选, 默认 false): 只读模式

**Events:**

- `change`: DSL 数据变化时触发
- `save`: 保存时触发

**暴露的方法:**

- `save()`: 保存编辑器数据，返回 QuizDSL
- `load(dsl: QuizDSL)`: 加载 DSL 数据
- `clear()`: 清空编辑器
- `isDirty()`: 检查是否有未保存的更改
- `getEditorInstance()`: 获取 Editor.js 实例

### QuizPlayer

**Props:**

- `quiz` (QuizDSL, 必需): Quiz DSL 数据
- `slideDSL` (string, 可选): Slide DSL 源代码
- `readOnly` (boolean, 可选, 默认 false): 只读模式
- `showResults` (boolean, 可选, 默认 true): 是否显示结果
- `swiperOptions` (object, 可选): Swiper 配置选项

**Events:**

- `submit`: 提交测验时触发，返回 ResultDSL
- `answer-change`: 答案变化时触发

**暴露的方法:**

- `submit()`: 提交测验，返回 ResultDSL
- `getAnswers()`: 获取当前答案
- `setAnswer(questionId, answer)`: 设置答案
- `getCurrentScore()`: 获取当前分数
- `isComplete()`: 检查是否已回答所有问题
- `reset()`: 重置答案

## 注意事项

- 确保已安装 `@quizerjs/quizerjs` 和 `@quizerjs/dsl` 依赖
- QuizPlayer 需要 `@slidejs/runner-swiper` 包（会自动处理）
- 组件需要容器有明确的高度（建议使用 `height: 100vh` 或固定高度）
