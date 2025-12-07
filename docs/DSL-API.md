# Quiz DSL API 参考

> 完整的 API 文档，包含所有函数、类型和错误代码的详细说明。

## 安装

```bash
npm install @quizerjs/dsl
```

## 导入

```typescript
// 完整导入
import {
  // 类型
  QuizDSL,
  Question,
  QuestionType,
  // 验证器
  validateQuizDSL,
  ValidationError,
  ValidationResult,
  ValidationErrorCode,
  // 解析器
  parseQuizDSL,
  parseQuizDSLFromObject,
  // 序列化器
  serializeQuizDSL,
  serializeQuizDSLToObject,
} from '@quizerjs/dsl';
```

## 类型定义

### QuizDSL

DSL 根类型，包含版本和测验数据。

```typescript
interface QuizDSL {
  version: string;
  quiz: Quiz;
}
```

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

### Question

问题联合类型，支持所有问题类型。

```typescript
type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextInputQuestion
  | TrueFalseQuestion;
```

## 验证器 API

### validateQuizDSL

验证 DSL 数据是否符合规范。

```typescript
function validateQuizDSL(dsl: unknown): ValidationResult;
```

**参数：**
- `dsl` (unknown): 要验证的 DSL 数据

**返回：**
- `ValidationResult`: 验证结果对象

**示例：**

```typescript
const result = validateQuizDSL(dslData);

if (result.valid) {
  console.log('验证通过');
} else {
  result.errors.forEach(error => {
    console.error(`[${error.code}] ${error.path}: ${error.message}`);
  });
}
```

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

### ValidationError

```typescript
interface ValidationError {
  code: ValidationErrorCode;
  path: string;
  message: string;
}
```

## 解析器 API

### parseQuizDSL

从 JSON 字符串解析 DSL。

```typescript
function parseQuizDSL(
  jsonString: string,
  options?: ParseOptions
): ParseResult;
```

**参数：**
- `jsonString` (string): JSON 字符串
- `options` (ParseOptions, 可选): 解析选项

**返回：**
- `ParseResult`: 解析结果对象

**示例：**

```typescript
const jsonString = JSON.stringify(dslData);
const result = parseQuizDSL(jsonString, {
  validate: true,
  strict: false
});

if (result.success) {
  const dsl = result.dsl;
  // 使用解析后的 DSL
} else {
  console.error('解析失败:', result.error);
}
```

### parseQuizDSLFromObject

从对象解析 DSL（不进行 JSON 解析）。

```typescript
function parseQuizDSLFromObject(
  data: unknown,
  options?: ParseOptions
): ParseResult;
```

### ParseOptions

```typescript
interface ParseOptions {
  validate?: boolean;  // 默认: true
  strict?: boolean;    // 默认: false
}
```

### ParseResult

```typescript
interface ParseResult {
  dsl: QuizDSL | null;
  success: boolean;
  errors?: ValidationError[];
  error?: Error;
}
```

## 序列化器 API

### serializeQuizDSL

将 DSL 序列化为 JSON 字符串。

```typescript
function serializeQuizDSL(
  dsl: QuizDSL,
  options?: SerializeOptions
): SerializeResult;
```

**参数：**
- `dsl` (QuizDSL): DSL 数据
- `options` (SerializeOptions, 可选): 序列化选项

**返回：**
- `SerializeResult`: 序列化结果对象

**示例：**

```typescript
const result = serializeQuizDSL(dsl, {
  validate: true,
  pretty: true,
  indent: 2
});

if (result.success) {
  console.log(result.json);
  // 保存到文件或发送到服务器
}
```

### serializeQuizDSLToObject

将 DSL 序列化为对象（深拷贝）。

```typescript
function serializeQuizDSLToObject(
  dsl: QuizDSL,
  options?: Omit<SerializeOptions, 'pretty' | 'indent'>
): { data: QuizDSL | null; success: boolean; error?: Error };
```

### SerializeOptions

```typescript
interface SerializeOptions {
  validate?: boolean;  // 默认: true
  pretty?: boolean;   // 默认: false
  indent?: number;    // 默认: 2
}
```

### SerializeResult

```typescript
interface SerializeResult {
  json: string | null;
  success: boolean;
  error?: Error;
}
```

## 错误代码

### 获取错误消息

```typescript
import { ValidationErrorCode, getErrorMessage } from '@quizerjs/dsl';

const message = getErrorMessage(ValidationErrorCode.DSL_MUST_BE_OBJECT);
// 返回: "DSL 必须是对象"

// 参数化消息
const message2 = getErrorMessage(
  ValidationErrorCode.QUESTION_ID_DUPLICATE,
  'q1'
);
// 返回: '问题 id "q1" 重复'
```

### 所有错误代码

完整的错误代码列表请参考 [错误代码文档](./DSL.md#错误代码)。

## 使用示例

### 完整工作流

```typescript
import {
  validateQuizDSL,
  parseQuizDSL,
  serializeQuizDSL,
  type QuizDSL,
} from '@quizerjs/dsl';

// 1. 从 JSON 字符串解析
const jsonString = fs.readFileSync('quiz.json', 'utf-8');
const parseResult = parseQuizDSL(jsonString);

if (!parseResult.success) {
  console.error('解析失败:', parseResult.error);
  return;
}

const dsl = parseResult.dsl!;

// 2. 验证数据
const validationResult = validateQuizDSL(dsl);

if (!validationResult.valid) {
  console.error('验证失败:');
  validationResult.errors.forEach(error => {
    console.error(`  [${error.code}] ${error.path}: ${error.message}`);
  });
  return;
}

// 3. 使用 DSL 数据
console.log(`测验: ${dsl.quiz.title}`);
console.log(`问题数量: ${dsl.quiz.questions.length}`);

// 4. 序列化回 JSON
const serializeResult = serializeQuizDSL(dsl, {
  pretty: true,
  indent: 2
});

if (serializeResult.success) {
  fs.writeFileSync('quiz-formatted.json', serializeResult.json!);
}
```

### 错误处理

```typescript
import {
  validateQuizDSL,
  ValidationErrorCode,
  getErrorMessage,
} from '@quizerjs/dsl';

const result = validateQuizDSL(dslData);

if (!result.valid) {
  // 按错误代码分组
  const errorsByCode = result.errors.reduce((acc, error) => {
    if (!acc[error.code]) {
      acc[error.code] = [];
    }
    acc[error.code].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  // 处理特定错误
  if (errorsByCode[ValidationErrorCode.QUESTION_ID_DUPLICATE]) {
    console.error('发现重复的问题 ID');
  }

  // 显示所有错误
  result.errors.forEach(error => {
    console.error(
      `[${error.code}] ${error.path}: ${getErrorMessage(error.code)}`
    );
  });
}
```

## 类型安全

所有 API 都提供完整的 TypeScript 类型支持：

```typescript
import type { QuizDSL, Question, QuestionType } from '@quizerjs/dsl';

// 类型检查
const quiz: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-1',
    title: 'Test',
    questions: [
      {
        id: 'q1',
        type: QuestionType.SINGLE_CHOICE, // 类型安全
        text: 'Test',
        options: [
          { id: 'o1', text: 'A', isCorrect: true },
          { id: 'o2', text: 'B', isCorrect: false },
        ],
      },
    ],
  },
};
```

## 性能考虑

- 验证器使用类型守卫，避免不必要的类型转换
- 解析器支持禁用验证以提高性能
- 序列化器支持格式化选项，便于调试

## 最佳实践

1. **始终验证数据**：在解析后立即验证 DSL 数据
2. **使用错误代码**：通过错误代码进行错误处理，而不是硬编码消息
3. **类型安全**：充分利用 TypeScript 类型系统
4. **错误处理**：妥善处理所有可能的错误情况

## 相关文档

- [DSL 规范文档](./DSL.md)
- [RFC 0001: Quiz DSL 规范](./rfc/0001-quiz-dsl-specification.md)

