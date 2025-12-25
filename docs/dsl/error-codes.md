# 错误代码

验证器使用错误代码系统，便于错误处理和国际化。所有错误代码都以 `E` 开头，后跟 4 位数字。

## 错误代码分类

### DSL 级别错误 (E1000-E1099)

| 代码    | 说明                       |
| ------- | -------------------------- |
| `E1000` | DSL 必须是对象             |
| `E1001` | version 必须存在且为字符串 |

### Quiz 级别错误 (E1100-E1199)

| 代码    | 说明                            |
| ------- | ------------------------------- |
| `E1100` | quiz 必须存在且为对象           |
| `E1101` | quiz.id 必须存在且为字符串      |
| `E1102` | quiz.title 必须存在且为字符串   |
| `E1103` | quiz.questions 必须存在且为数组 |

### Question 级别错误 (E1200-E1299)

| 代码    | 说明                             |
| ------- | -------------------------------- |
| `E1200` | 问题必须是对象                   |
| `E1201` | 问题 id 必须存在且为字符串       |
| `E1202` | 问题 id 重复                     |
| `E1203` | 问题 type 必须存在且为有效的类型 |
| `E1204` | 未知的问题类型                   |
| `E1205` | 问题 text 必须存在且为字符串     |

### 单选题错误 (E1300-E1399)

| 代码    | 说明                         |
| ------- | ---------------------------- |
| `E1300` | 单选题必须至少包含 2 个选项  |
| `E1301` | 单选题必须恰好有一个正确答案 |

### 多选题错误 (E1400-E1499)

| 代码    | 说明                         |
| ------- | ---------------------------- |
| `E1400` | 多选题必须至少包含 2 个选项  |
| `E1401` | 多选题必须至少有一个正确答案 |

### 选项错误 (E1500-E1599)

| 代码    | 说明                         |
| ------- | ---------------------------- |
| `E1500` | 选项必须是对象               |
| `E1501` | 选项 id 必须存在且为字符串   |
| `E1502` | 选项 id 重复                 |
| `E1503` | 选项 text 必须存在且为字符串 |
| `E1504` | 选项 isCorrect 必须为布尔值  |

### 文本输入题错误 (E1600-E1699)

| 代码    | 说明                                                   |
| ------- | ------------------------------------------------------ |
| `E1600` | 文本输入题必须包含 correctAnswer（字符串或字符串数组） |
| `E1601` | correctAnswer 数组不能为空                             |

### 判断题错误 (E1700-E1799)

| 代码    | 说明                                   |
| ------- | -------------------------------------- |
| `E1700` | 判断题必须包含 correctAnswer（布尔值） |

## 使用错误代码

### 获取错误消息

```typescript
import { ValidationErrorCode, getErrorMessage } from '@quizerjs/dsl';

// 简单消息
const message = getErrorMessage(ValidationErrorCode.DSL_MUST_BE_OBJECT);
// 返回: "DSL 必须是对象"

// 参数化消息
const message2 = getErrorMessage(ValidationErrorCode.QUESTION_ID_DUPLICATE, 'q1');
// 返回: '问题 id "q1" 重复'
```

### 错误处理示例

```typescript
import { validateQuizDSL, ValidationErrorCode } from '@quizerjs/dsl';

const result = validateQuizDSL(dslData);

if (!result.valid) {
  // 按错误代码分组
  const errorsByCode = result.errors.reduce(
    (acc, error) => {
      if (!acc[error.code]) {
        acc[error.code] = [];
      }
      acc[error.code].push(error);
      return acc;
    },
    {} as Record<string, ValidationError[]>
  );

  // 处理特定错误
  if (errorsByCode[ValidationErrorCode.QUESTION_ID_DUPLICATE]) {
    console.error('发现重复的问题 ID');
  }

  if (errorsByCode[ValidationErrorCode.SINGLE_CHOICE_MUST_HAVE_ONE_CORRECT]) {
    console.error('单选题必须有且仅有一个正确答案');
  }
}
```

## 国际化支持

错误代码系统支持国际化，您可以自定义错误消息：

```typescript
import { ValidationMessages } from '@quizerjs/dsl';

// 自定义英文消息（示例）
const englishMessages = {
  [ValidationErrorCode.DSL_MUST_BE_OBJECT]: 'DSL must be an object',
  [ValidationErrorCode.VERSION_MUST_BE_STRING]: 'version must be a string',
  // ...
};
```

## 下一步

- [验证规则](./validation.md) - 了解验证规则
- [API 参考](/api/) - 查看完整 API
