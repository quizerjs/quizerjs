# 基础验证示例

## 简单验证

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

## 验证错误处理

```typescript
import { validateQuizDSL, ValidationErrorCode } from '@quizerjs/dsl';

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

if (!result.valid) {
  // 检查特定错误
  const duplicateIdError = result.errors.find(
    e => e.code === ValidationErrorCode.OPTION_ID_DUPLICATE
  );

  if (duplicateIdError) {
    console.error('发现重复的选项 ID:', duplicateIdError.path);
  }
}
```
