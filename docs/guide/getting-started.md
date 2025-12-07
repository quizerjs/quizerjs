# 快速开始

本指南将帮助您在 5 分钟内开始使用 quizerjs。

## 安装

```bash
# 使用 npm
npm install @quizerjs/core @quizerjs/editorjs-tool @quizerjs/dsl

# 使用 pnpm
pnpm add @quizerjs/core @quizerjs/editorjs-tool @quizerjs/dsl

# 使用 yarn
yarn add @quizerjs/core @quizerjs/editorjs-tool @quizerjs/dsl
```

## 作为 Editor.js 工具使用

```typescript
import EditorJS from '@editorjs/editorjs';
import QuizTool from '@quizerjs/editorjs-tool';

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    quiz: {
      class: QuizTool,
      config: {
        onSubmit: (data) => {
          console.log('测验提交:', data);
        },
      },
    },
  },
});
```

## 在 Vue 中使用

```vue
<template>
  <QuizComponent :dsl="quizDSL" @submit="handleSubmit" />
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
</script>
```

## 独立使用核心组件

```typescript
import { QuizBlock } from '@quizerjs/core';
import { QuizData, QuestionType } from '@quizerjs/core';

const quizData: QuizData = {
  id: 'quiz-1',
  title: '示例测验',
  description: '这是一个示例测验',
  questions: [
    {
      id: 'q1',
      type: QuestionType.SINGLE_CHOICE,
      text: '以下哪个是 JavaScript 的框架？',
      options: [
        { id: 'o1', text: 'React' },
        { id: 'o2', text: 'Python' },
        { id: 'o3', text: 'Java' },
      ],
      correctAnswer: 'o1',
      points: 10,
    },
  ],
};

// 使用 wsx 组件
const quizBlock = new QuizBlock();
quizBlock.setAttribute('data-quiz-data', JSON.stringify(quizData));
document.body.appendChild(quizBlock);
```

## 使用 DSL

```typescript
import { validateQuizDSL, parseQuizDSL } from '@quizerjs/dsl';

// 验证 DSL
const dsl = {
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

const result = validateQuizDSL(dsl);
if (result.valid) {
  console.log('DSL 有效！');
} else {
  console.error('验证错误:', result.errors);
}

// 从 JSON 字符串解析
const jsonString = JSON.stringify(dsl);
const parseResult = parseQuizDSL(jsonString);
if (parseResult.success) {
  console.log('解析成功:', parseResult.dsl);
}
```

## 下一步

- 查看 [DSL 规范](/dsl/) 了解数据格式
- 阅读 [API 参考](/api/) 查看完整 API
- 查看 [示例项目](https://github.com/wsxjs/quizerjs/tree/main/examples)

