# @quizerjs/vue

quizerjs 的 Vue 3 集成包，提供 Vue 组件用于在 Vue 应用中集成 quizerjs。

## 安装

```bash
npm install @quizerjs/vue @quizerjs/dsl @quizerjs/quizerjs
```

## 快速开始

### 1. 使用 QuizEditor（编辑器）

```vue
<template>
  <QuizEditor :initial-dsl="quizDSL" @change="handleChange" @save="handleSave" />
</template>

<script setup lang="ts">
import { QuizEditor } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';

const quizDSL: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: '我的测验',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: '测试问题',
        options: [
          { id: 'o1', text: '选项1', isCorrect: true },
          { id: 'o2', text: '选项2', isCorrect: false },
        ],
      },
    ],
  },
};

function handleChange(dsl: QuizDSL) {
  console.log('DSL 变化:', dsl);
}

function handleSave(dsl: QuizDSL) {
  console.log('保存的 DSL:', dsl);
}
</script>
```

### 2. 使用 QuizPlayer（播放器）

```vue
<template>
  <QuizPlayer
    :quiz-dsl="quizDSL"
    @submit="handleSubmit"
    @answer-change="handleAnswerChange"
  />
</template>

<script setup lang="ts">
import { QuizPlayer } from '@quizerjs/vue';
import type { QuizDSL, ResultDSL, AnswerValue } from '@quizerjs/dsl';

const quizDSL: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: '我的测验',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: '测试问题',
        options: [
          { id: 'o1', text: '选项1', isCorrect: true },
          { id: 'o2', text: '选项2', isCorrect: false },
        ],
      },
    ],
  },
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
    />
    
    <QuizPlayer
      v-if="mode === 'player' && playDSL"
      :quiz="playDSL"
      @submit="handlePlayerSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QuizEditor, QuizPlayer } from '@quizerjs/vue';
import type { QuizDSL, ResultDSL, AnswerValue } from '@quizerjs/dsl';

const quizDSL: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: '我的测验',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: '测试问题',
        options: [
          { id: 'o1', text: '选项1', isCorrect: true },
          { id: 'o2', text: '选项2', isCorrect: false },
        ],
      },
    ],
  },
};

function handleEditorChange(dsl: QuizDSL) {
  console.log('编辑器变化:', dsl);
}

function handleEditorSave(dsl: QuizDSL) {
  console.log('编辑器保存:', dsl);
}

function handlePlayerSubmit(result: ResultDSL) {
  console.log('播放器提交:', result);
}

function handleAnswerChange(questionId: string, answer: AnswerValue) {
  console.log('答案变化:', questionId, answer);
}
</script>
```

### 使用组合式 API

```vue
<template>
  <div>
    <div v-for="(question, index) in dsl?.quiz.questions" :key="question.id">
      <h3>{{ index + 1 }}. {{ question.text }}</h3>
      <!-- 自定义渲染 -->
    </div>
    <button @click="submit">提交</button>
    <div v-if="submitted">得分: {{ score }}%</div>
  </div>
</template>

<script setup lang="ts">
import { useQuiz } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';

const { dsl, answers, submitted, score, setAnswer, submit } = useQuiz({
  dsl: quizDSL,
  onSubmit: (answers, score) => {
    console.log('提交:', answers, score);
  },
});
</script>
```

## API

### 组件

#### QuizEditor

测验编辑器组件，用于创建和编辑 Quiz DSL。

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

#### QuizPlayer

测验播放器组件，用于播放和答题。

**Props:**

- `quizDSL` (QuizDSL, 必需): Quiz DSL 数据
- `slideDSL` (string, 可选): Slide DSL 源代码
- `initialAnswers` (Record<string, AnswerValue>, 可选): 初始答案
- `resultDSL` (ResultDSL, 可选): 从 Result DSL 恢复状态
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
- `getResultDSL()`: 获取 Result DSL（不提交）
- `getRunner()`: 获取 SlideRunner 实例

## 相关

- [DSL 规范](../../docs/dsl/)
- [API 参考](../../docs/api/)
