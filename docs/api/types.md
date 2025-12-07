# 类型定义

quizerjs DSL 提供完整的 TypeScript 类型定义。

## 核心类型

### QuizDSL

DSL 根类型。

```typescript
interface QuizDSL {
  version: string;
  quiz: Quiz;
}
```

### Quiz

测验数据类型。

```typescript
interface Quiz {
  id: string;
  title: string;
  description?: string;
  metadata?: QuizMetadata;
  settings?: QuizSettings;
  questions: Question[];
}
```

### Question

问题联合类型。

```typescript
type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextInputQuestion
  | TrueFalseQuestion;
```

## 问题类型

### SingleChoiceQuestion

单选题。

```typescript
interface SingleChoiceQuestion {
  id: string;
  type: QuestionType.SINGLE_CHOICE;
  text: string;
  options: Option[];
  points?: number;
  explanation?: string;
  metadata?: QuestionMetadata;
}
```

### MultipleChoiceQuestion

多选题。

```typescript
interface MultipleChoiceQuestion {
  id: string;
  type: QuestionType.MULTIPLE_CHOICE;
  text: string;
  options: Option[];
  points?: number;
  explanation?: string;
  metadata?: QuestionMetadata;
}
```

### TextInputQuestion

文本输入题。

```typescript
interface TextInputQuestion {
  id: string;
  type: QuestionType.TEXT_INPUT;
  text: string;
  correctAnswer: string | string[];
  caseSensitive?: boolean;
  points?: number;
  explanation?: string;
  metadata?: QuestionMetadata;
}
```

### TrueFalseQuestion

判断题。

```typescript
interface TrueFalseQuestion {
  id: string;
  type: QuestionType.TRUE_FALSE;
  text: string;
  correctAnswer: boolean;
  points?: number;
  explanation?: string;
  metadata?: QuestionMetadata;
}
```

## 辅助类型

### QuestionType

问题类型枚举。

```typescript
enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT_INPUT = 'text_input',
  TRUE_FALSE = 'true_false',
}
```

### Option

选项接口。

```typescript
interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}
```

### QuizSettings

测验设置。

```typescript
interface QuizSettings {
  allowRetry?: boolean;
  showResults?: boolean;
  timeLimit?: number;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  passingScore?: number;
}
```

### QuizMetadata

测验元数据。

```typescript
interface QuizMetadata {
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  [key: string]: unknown;
}
```

### QuestionMetadata

问题元数据。

```typescript
interface QuestionMetadata {
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  [key: string]: unknown;
}
```

## 使用示例

```typescript
import type {
  QuizDSL,
  Question,
  QuestionType,
  SingleChoiceQuestion,
} from '@quizerjs/dsl';

// 类型安全地创建 DSL
const dsl: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: 'Test',
    questions: [
      {
        id: 'q1',
        type: QuestionType.SINGLE_CHOICE,
        text: 'Test',
        options: [
          { id: 'o1', text: 'A', isCorrect: true },
          { id: 'o2', text: 'B', isCorrect: false },
        ],
      },
    ],
  },
};

// 类型守卫
function isSingleChoice(question: Question): question is SingleChoiceQuestion {
  return question.type === QuestionType.SINGLE_CHOICE;
}

const question = dsl.quiz.questions[0];
if (isSingleChoice(question)) {
  // TypeScript 知道这是 SingleChoiceQuestion
  console.log(question.options.length);
}
```

## 相关

- [DSL 规范](/dsl/) - DSL 规范文档
- [验证器](./validator.md) - 验证 API

