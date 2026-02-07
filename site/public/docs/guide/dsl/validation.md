# 验证规则

DSL 验证器确保所有数据符合规范。本文档描述所有验证规则。

## 验证级别

### 1. DSL 级别验证

- `version` 必须存在且为字符串
- DSL 根对象必须是普通对象（非数组、非 null）

### 2. Quiz 级别验证

- `quiz` 必须存在且为对象
- `quiz.id` 必须存在且为字符串
- `quiz.title` 必须存在且为字符串
- `quiz.questions` 必须存在且为数组

### 3. Question 级别验证

- 每个问题必须是对象
- 每个问题必须有 `id`、`type`、`text`
- 问题的 `id` 必须在 `questions` 数组中唯一
- 问题的 `type` 必须是有效的类型值

### 4. 选项验证（选择题）

- 每个选项必须是对象
- 每个选项必须有 `id`、`text`、`isCorrect`
- 选项的 `id` 必须在所属问题的 `options` 数组中唯一
- `isCorrect` 必须是布尔值

### 5. 问题类型特定验证

#### 单选题

- 必须至少包含 2 个选项
- 必须恰好有一个正确答案

#### 多选题

- 必须至少包含 2 个选项
- 必须至少有一个正确答案

#### 文本输入题

- 必须包含 `correctAnswer`（字符串或字符串数组）
- 如果使用数组，数组不能为空

#### 判断题

- 必须包含 `correctAnswer`（布尔值）

## 使用验证器

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

const result = validateQuizDSL(dslData);

if (result.valid) {
  console.log('验证通过');
} else {
  result.errors.forEach(error => {
    console.error(`[${error.code}] ${error.path}: ${error.message}`);
  });
}
```

## 错误处理

验证器返回详细的错误信息，包括：

- **错误代码**：便于程序化处理
- **错误路径**：指向出错的位置
- **错误消息**：人类可读的错误描述

```typescript
interface ValidationError {
  code: ValidationErrorCode;
  path: string;
  message: string;
}
```

## 验证示例

### 有效 DSL

```typescript
const validDSL = {
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
          { id: 'o2', text: 'B', isCorrect: false },
        ],
      },
    ],
  },
};

const result = validateQuizDSL(validDSL);
console.log(result.valid); // true
```

### 无效 DSL

```typescript
const invalidDSL = {
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

const result = validateQuizDSL(invalidDSL);
console.log(result.valid); // false
console.log(result.errors);
// [
//   {
//     code: 'E1502',
//     path: 'quiz.questions[0].options[1].id',
//     message: '选项 id "o1" 重复'
//   }
// ]
```

## 下一步

- [错误代码](./error-codes.md) - 查看所有错误代码
- [完整示例](./examples.md) - 查看完整示例
