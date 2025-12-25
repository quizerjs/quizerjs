# @quizerjs/vue

quizerjs 的 Vue 3 集成包，提供 Vue 组件和组合式 API。

## 安装

```bash
npm install @quizerjs/vue @quizerjs/dsl
```

## 快速开始

### 使用组件

```vue
<template>
  <QuizComponent :dsl="quizDSL" @submit="handleSubmit" @answer-change="handleAnswerChange" />
</template>

<script setup lang="ts">
import { QuizComponent } from '@quizerjs/vue';
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

function handleSubmit(answers: Record<string, any>) {
  console.log('提交的答案:', answers);
}

function handleAnswerChange(questionId: string, answer: any) {
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

#### QuizComponent

完整的测验组件。

**Props:**

- `dsl` (QuizDSL, 必需): DSL 数据
- `disabled` (boolean, 可选): 是否禁用
- `showResults` (boolean, 可选): 是否显示结果

**Events:**

- `submit`: 提交答案时触发
- `answer-change`: 答案变化时触发

### 组合式 API

#### useQuiz

管理测验状态的组合式 API。

```typescript
const {
  dsl, // DSL 数据
  answers, // 用户答案
  submitted, // 是否已提交
  score, // 得分
  loadDSL, // 加载 DSL
  setAnswer, // 设置答案
  submit, // 提交
  reset, // 重置
  isAnswerCorrect, // 检查答案
} = useQuiz(options);
```

#### useQuizValidation

验证 DSL 数据的组合式 API。

```typescript
const { validate, isValid, errors } = useQuizValidation();
```

## 相关

- [DSL 规范](../../docs/dsl/)
- [API 参考](../../docs/api/)
