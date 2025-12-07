# 完整示例

本文档提供完整的 DSL 示例，涵盖所有功能。

## 基础示例

### 简单的单选题测验

```json
{
  "version": "1.0.0",
  "quiz": {
    "id": "quiz-001",
    "title": "JavaScript 基础测验",
    "questions": [
      {
        "id": "q1",
        "type": "single_choice",
        "text": "以下哪个是 JavaScript 的框架？",
        "options": [
          { "id": "o1", "text": "React", "isCorrect": true },
          { "id": "o2", "text": "Python", "isCorrect": false },
          { "id": "o3", "text": "Java", "isCorrect": false }
        ]
      }
    ]
  }
}
```

## 完整功能示例

### 包含所有问题类型的测验

```json
{
  "version": "1.0.0",
  "quiz": {
    "id": "quiz-001",
    "title": "JavaScript 综合测验",
    "description": "测试你对 JavaScript 基础知识的理解",
    "metadata": {
      "author": "quizerjs",
      "createdAt": "2025-01-27T00:00:00Z",
      "tags": ["javascript", "programming", "beginner"]
    },
    "settings": {
      "allowRetry": true,
      "showResults": true,
      "timeLimit": 600,
      "randomizeQuestions": false,
      "randomizeOptions": false,
      "passingScore": 60
    },
    "questions": [
      {
        "id": "q1",
        "type": "single_choice",
        "text": "以下哪个是 JavaScript 的框架？",
        "options": [
          { "id": "o1", "text": "React", "isCorrect": true },
          { "id": "o2", "text": "Python", "isCorrect": false },
          { "id": "o3", "text": "Java", "isCorrect": false }
        ],
        "points": 10,
        "explanation": "React 是一个用于构建用户界面的 JavaScript 库",
        "metadata": {
          "difficulty": "easy",
          "tags": ["javascript", "react"]
        }
      },
      {
        "id": "q2",
        "type": "multiple_choice",
        "text": "以下哪些是 JavaScript 的基本数据类型？（多选）",
        "options": [
          { "id": "o1", "text": "String", "isCorrect": true },
          { "id": "o2", "text": "Number", "isCorrect": true },
          { "id": "o3", "text": "Boolean", "isCorrect": true },
          { "id": "o4", "text": "Array", "isCorrect": false }
        ],
        "points": 15,
        "explanation": "Array 是对象类型，不是基本数据类型"
      },
      {
        "id": "q3",
        "type": "text_input",
        "text": "ES6 中用于声明常量的关键字是什么？",
        "correctAnswer": "const",
        "caseSensitive": false,
        "points": 5,
        "explanation": "const 关键字用于声明常量"
      },
      {
        "id": "q4",
        "type": "true_false",
        "text": "JavaScript 是一种编译型语言",
        "correctAnswer": false,
        "points": 5,
        "explanation": "JavaScript 是一种解释型语言"
      }
    ]
  }
}
```

## 使用示例

### TypeScript 示例

```typescript
import { validateQuizDSL, parseQuizDSL, serializeQuizDSL } from '@quizerjs/dsl';
import type { QuizDSL } from '@quizerjs/dsl';

// 创建 DSL
const dsl: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-001',
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

// 验证
const validationResult = validateQuizDSL(dsl);
if (!validationResult.valid) {
  console.error('验证失败:', validationResult.errors);
  return;
}

// 序列化
const serializeResult = serializeQuizDSL(dsl, { pretty: true });
if (serializeResult.success) {
  console.log(serializeResult.json);
}

// 解析
const jsonString = serializeResult.json!;
const parseResult = parseQuizDSL(jsonString);
if (parseResult.success) {
  console.log('解析成功:', parseResult.dsl);
}
```

## 下一步

- [验证规则](./validation.md) - 了解验证规则
- [错误代码](./error-codes.md) - 查看错误代码

