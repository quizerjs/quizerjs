# 完整测验示例

包含所有问题类型的完整测验示例。

```typescript
import { validateQuizDSL, type QuizDSL } from '@quizerjs/dsl';

const fullQuiz: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-001',
    title: 'JavaScript 综合测验',
    description: '测试你对 JavaScript 基础知识的理解',
    metadata: {
      author: 'quizerjs',
      createdAt: '2025-01-27T00:00:00Z',
      tags: ['javascript', 'programming', 'beginner'],
    },
    settings: {
      allowRetry: true,
      showResults: true,
      timeLimit: 600,
      randomizeQuestions: false,
      randomizeOptions: false,
      passingScore: 60,
    },
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: '以下哪个是 JavaScript 的框架？',
        options: [
          { id: 'o1', text: 'React', isCorrect: true },
          { id: 'o2', text: 'Python', isCorrect: false },
          { id: 'o3', text: 'Java', isCorrect: false },
        ],
        points: 10,
        explanation: 'React 是一个用于构建用户界面的 JavaScript 库',
        metadata: {
          difficulty: 'easy',
          tags: ['javascript', 'react'],
        },
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        text: '以下哪些是 JavaScript 的基本数据类型？（多选）',
        options: [
          { id: 'o1', text: 'String', isCorrect: true },
          { id: 'o2', text: 'Number', isCorrect: true },
          { id: 'o3', text: 'Boolean', isCorrect: true },
          { id: 'o4', text: 'Array', isCorrect: false },
        ],
        points: 15,
        explanation: 'Array 是对象类型，不是基本数据类型',
      },
      {
        id: 'q3',
        type: 'text_input',
        text: 'ES6 中用于声明常量的关键字是什么？',
        correctAnswer: 'const',
        caseSensitive: false,
        points: 5,
        explanation: 'const 关键字用于声明常量',
      },
      {
        id: 'q4',
        type: 'true_false',
        text: 'JavaScript 是一种编译型语言',
        correctAnswer: false,
        points: 5,
        explanation: 'JavaScript 是一种解释型语言',
      },
    ],
  },
};

// 验证
const result = validateQuizDSL(fullQuiz);
console.log('验证结果:', result.valid ? '✅ 通过' : '❌ 失败');

if (result.valid) {
  console.log(`测验: ${fullQuiz.quiz.title}`);
  console.log(`问题数量: ${fullQuiz.quiz.questions.length}`);
  console.log(`总分数: ${fullQuiz.quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0)}`);
}
```
