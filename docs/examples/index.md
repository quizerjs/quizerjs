# 示例

本文档提供 quizerjs 的完整使用示例和真实使用案例。

## 快速导航

- [真实使用案例](./real-world.md) - 查看在实际项目中的使用场景
- [交互式演示](./interactive-demo.md) - 在线可运行的演示
- [基础验证示例](./basic-validation.md) - 简单的验证示例
- [完整测验示例](./full-quiz.md) - 包含所有问题类型的完整示例

## 基础示例

### 验证 DSL

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

const dsl = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: '我的第一个测验',
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
      },
    ],
  },
};

const result = validateQuizDSL(dsl);

if (result.valid) {
  console.log('✅ DSL 验证通过！');
} else {
  console.error('❌ 验证失败:');
  result.errors.forEach(error => {
    console.error(`  [${error.code}] ${error.path}: ${error.message}`);
  });
}
```

### 解析和序列化

```typescript
import { parseQuizDSL, serializeQuizDSL } from '@quizerjs/dsl';

// 从 JSON 字符串解析
const jsonString = `{
  "version": "1.0.0",
  "quiz": {
    "id": "quiz-1",
    "title": "测试",
    "questions": [
      {
        "id": "q1",
        "type": "single_choice",
        "text": "测试问题",
        "options": [
          { "id": "o1", "text": "选项1", "isCorrect": true },
          { "id": "o2", "text": "选项2", "isCorrect": false }
        ]
      }
    ]
  }
}`;

const parseResult = parseQuizDSL(jsonString);

if (parseResult.success) {
  console.log('解析成功:', parseResult.dsl);
  
  // 序列化回 JSON（格式化）
  const serializeResult = serializeQuizDSL(parseResult.dsl!, {
    pretty: true,
    indent: 2,
  });
  
  if (serializeResult.success) {
    console.log('序列化结果:');
    console.log(serializeResult.json);
  }
}
```

## 完整示例

### 包含所有问题类型的测验

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
```

## 错误处理示例

### 处理验证错误

```typescript
import {
  validateQuizDSL,
  ValidationErrorCode,
  getErrorMessage,
} from '@quizerjs/dsl';

const dsl = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: 'Test',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: 'Test',
        options: [
          { id: 'o1', text: 'A', isCorrect: true },
          { id: 'o1', text: 'B', isCorrect: false }, // 重复的 ID
        ],
      },
    ],
  },
};

const result = validateQuizDSL(dsl);

if (!result.valid) {
  // 按错误代码分组
  const errorsByCode = result.errors.reduce((acc, error) => {
    if (!acc[error.code]) {
      acc[error.code] = [];
    }
    acc[error.code].push(error);
    return acc;
  }, {} as Record<string, typeof result.errors>);

  // 处理特定错误
  if (errorsByCode[ValidationErrorCode.OPTION_ID_DUPLICATE]) {
    console.error('⚠️ 发现重复的选项 ID');
    errorsByCode[ValidationErrorCode.OPTION_ID_DUPLICATE].forEach(error => {
      console.error(`  位置: ${error.path}`);
      console.error(`  消息: ${error.message}`);
    });
  }

  // 显示所有错误
  console.log('\n所有错误:');
  result.errors.forEach((error, index) => {
    console.log(`${index + 1}. [${error.code}] ${error.path}`);
    console.log(`   ${getErrorMessage(error.code as ValidationErrorCode)}`);
  });
}
```

## 文件操作示例

### 从文件读取 DSL

```typescript
import { readFileSync, writeFileSync } from 'fs';
import { parseQuizDSL, validateQuizDSL, serializeQuizDSL } from '@quizerjs/dsl';

// 读取 JSON 文件
function loadQuizFromFile(filePath: string) {
  try {
    const jsonString = readFileSync(filePath, 'utf-8');
    const parseResult = parseQuizDSL(jsonString);

    if (!parseResult.success) {
      console.error('解析失败:', parseResult.error);
      return null;
    }

    // 验证
    const validationResult = validateQuizDSL(parseResult.dsl!);
    if (!validationResult.valid) {
      console.error('验证失败:');
      validationResult.errors.forEach(error => {
        console.error(`  [${error.code}] ${error.path}: ${error.message}`);
      });
      return null;
    }

    return parseResult.dsl;
  } catch (error) {
    console.error('读取文件失败:', error);
    return null;
  }
}

// 保存 DSL 到文件
function saveQuizToFile(dsl: QuizDSL, filePath: string) {
  const result = serializeQuizDSL(dsl, {
    pretty: true,
    indent: 2,
  });

  if (result.success) {
    writeFileSync(filePath, result.json!);
    console.log(`✅ 已保存到 ${filePath}`);
  } else {
    console.error('❌ 保存失败:', result.error);
  }
}

// 使用示例
const quiz = loadQuizFromFile('quiz.json');
if (quiz) {
  console.log(`测验: ${quiz.quiz.title}`);
  console.log(`问题数量: ${quiz.quiz.questions.length}`);
  
  // 修改后保存
  quiz.quiz.title = '修改后的标题';
  saveQuizToFile(quiz, 'quiz-updated.json');
}
```

## 类型安全示例

### 使用 TypeScript 类型

```typescript
import type {
  QuizDSL,
  Question,
  QuestionType,
  SingleChoiceQuestion,
} from '@quizerjs/dsl';

// 类型安全地创建 DSL
const quiz: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: 'TypeScript 测验',
    questions: [
      {
        id: 'q1',
        type: QuestionType.SINGLE_CHOICE, // 类型安全
        text: 'TypeScript 是什么？',
        options: [
          { id: 'o1', text: 'JavaScript 的超集', isCorrect: true },
          { id: 'o2', text: '一个新的编程语言', isCorrect: false },
        ],
      },
    ],
  },
};

// 类型守卫
function isSingleChoice(question: Question): question is SingleChoiceQuestion {
  return question.type === QuestionType.SINGLE_CHOICE;
}

// 处理问题
quiz.quiz.questions.forEach(question => {
  if (isSingleChoice(question)) {
    // TypeScript 知道这是 SingleChoiceQuestion
    console.log(`单选题: ${question.text}`);
    console.log(`选项数量: ${question.options.length}`);
  }
});
```

## 下一步

- [快速开始](/guide/getting-started.md) - 开始使用 quizerjs
- [DSL 规范](/dsl/) - 了解 DSL 格式
- [API 参考](/api/) - 查看完整 API

