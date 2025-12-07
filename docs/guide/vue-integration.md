# Vue 集成指南

本指南介绍如何在 Vue 3 应用中使用 quizerjs。

## 安装

```bash
npm install @quizerjs/vue @quizerjs/dsl
```

## 使用组件

### 基础使用

```vue
<template>
  <QuizComponent :dsl="quizDSL" />
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
        text: '以下哪个是 JavaScript 的框架？',
        options: [
          { id: 'o1', text: 'React', isCorrect: true },
          { id: 'o2', text: 'Python', isCorrect: false },
        ],
      },
    ],
  },
};
</script>
```

### 处理事件

```vue
<template>
  <QuizComponent
    :dsl="quizDSL"
    @submit="handleSubmit"
    @answer-change="handleAnswerChange"
  />
</template>

<script setup lang="ts">
import { QuizComponent } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';

function handleSubmit(answers: Record<string, any>, score: number) {
  console.log('提交的答案:', answers);
  console.log('得分:', score);
}

function handleAnswerChange(questionId: string, answer: any) {
  console.log('答案变化:', questionId, answer);
}
</script>
```

## 使用组合式 API

### useQuiz

`useQuiz` 提供了完整的测验状态管理。

```vue
<template>
  <div>
    <div v-if="!dsl">加载中...</div>
    <div v-else>
      <h2>{{ dsl.quiz.title }}</h2>
      
      <div v-for="(question, index) in dsl.quiz.questions" :key="question.id">
        <h3>{{ index + 1 }}. {{ question.text }}</h3>
        
        <!-- 单选题 -->
        <div v-if="question.type === 'single_choice'">
          <label
            v-for="option in question.options"
            :key="option.id"
          >
            <input
              type="radio"
              :name="question.id"
              :value="option.id"
              :checked="answers[question.id] === option.id"
              @change="setAnswer(question.id, option.id)"
              :disabled="submitted"
            />
            {{ option.text }}
          </label>
        </div>
        
        <!-- 其他题型... -->
      </div>
      
      <button @click="submit" :disabled="submitted">
        提交答案
      </button>
      
      <div v-if="submitted">
        <p>得分: {{ score }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuiz } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';

const {
  dsl,
  answers,
  submitted,
  score,
  setAnswer,
  submit,
} = useQuiz({
  dsl: quizDSL,
  onSubmit: (answers, score) => {
    console.log('提交:', answers, score);
  },
});
</script>
```

### useQuizValidation

用于验证 DSL 数据。

```vue
<template>
  <div>
    <div v-if="!isValid">
      <p>验证失败:</p>
      <ul>
        <li v-for="error in errors" :key="error.path">
          [{{ error.code }}] {{ error.path }}: {{ error.message }}
        </li>
      </ul>
    </div>
    <QuizComponent v-else :dsl="dsl" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuizValidation } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';

const dsl = ref<QuizDSL | null>(null);
const { validate, isValid, errors } = useQuizValidation();

// 加载 DSL 后验证
async function loadQuiz() {
  const response = await fetch('/api/quiz.json');
  const data = await response.json();
  dsl.value = data;
  validate(data);
}
</script>
```

## 完整示例

```vue
<template>
  <div class="quiz-app">
    <QuizComponent
      v-if="quiz"
      :dsl="quiz"
      :disabled="loading"
      @submit="handleSubmit"
    />
    <div v-else-if="loading">加载中...</div>
    <div v-else>加载失败</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { QuizComponent } from '@quizerjs/vue';
import { parseQuizDSL, validateQuizDSL } from '@quizerjs/dsl';
import type { QuizDSL } from '@quizerjs/dsl';

const quiz = ref<QuizDSL | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch('/api/quiz.json');
    const jsonString = await response.text();
    const parseResult = parseQuizDSL(jsonString);
    
    if (parseResult.success && parseResult.dsl) {
      const validationResult = validateQuizDSL(parseResult.dsl);
      if (validationResult.valid) {
        quiz.value = parseResult.dsl;
      } else {
        console.error('验证失败:', validationResult.errors);
      }
    }
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    loading.value = false;
  }
});

function handleSubmit(answers: Record<string, any>) {
  // 发送答案到服务器
  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  });
}
</script>
```

## 下一步

- [API 参考](/api/) - 查看完整 API
- [DSL 规范](/dsl/) - 了解 DSL 格式

