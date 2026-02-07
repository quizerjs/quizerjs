# 验证器 API

验证器用于验证 DSL 数据是否符合规范。

## validateQuizDSL

验证 DSL 数据是否符合规范。

### 签名

```typescript
function validateQuizDSL(dsl: unknown): ValidationResult;
```

### 参数

- `dsl` (unknown): 要验证的 DSL 数据

### 返回值

返回 `ValidationResult` 对象，包含验证结果和错误列表。

### 示例

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

## ValidationResult

验证结果接口。

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

### 属性

- `valid` (boolean): 是否有效
- `errors` (ValidationError[]): 错误列表

## ValidationError

验证错误接口。

```typescript
interface ValidationError {
  code: ValidationErrorCode;
  path: string;
  message: string;
}
```

### 属性

- `code` (ValidationErrorCode): 错误代码
- `path` (string): 错误路径（如 "quiz.id"）
- `message` (string): 错误消息

## 错误处理示例

```typescript
import { validateQuizDSL, ValidationErrorCode, getErrorMessage } from '@quizerjs/dsl';

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

  // 显示所有错误
  result.errors.forEach(error => {
    console.error(`[${error.code}] ${error.path}: ${getErrorMessage(error.code)}`);
  });
}
```

## 相关

- [错误代码](../dsl/error-codes.md) - 所有错误代码列表
- [验证规则](../dsl/validation.md) - 验证规则说明
