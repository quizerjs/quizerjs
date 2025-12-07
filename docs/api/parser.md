# 解析器 API

解析器用于从 JSON 字符串或对象解析 DSL 数据。

## parseQuizDSL

从 JSON 字符串解析 DSL。

### 签名

```typescript
function parseQuizDSL(
  jsonString: string,
  options?: ParseOptions
): ParseResult;
```

### 参数

- `jsonString` (string): JSON 字符串
- `options` (ParseOptions, 可选): 解析选项

### 返回值

返回 `ParseResult` 对象。

### 示例

```typescript
import { parseQuizDSL } from '@quizerjs/dsl';

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

## parseQuizDSLFromObject

从对象解析 DSL（不进行 JSON 解析）。

### 签名

```typescript
function parseQuizDSLFromObject(
  data: unknown,
  options?: ParseOptions
): ParseResult;
```

### 参数

- `data` (unknown): 数据对象
- `options` (ParseOptions, 可选): 解析选项

### 示例

```typescript
import { parseQuizDSLFromObject } from '@quizerjs/dsl';

const result = parseQuizDSLFromObject(dslData, {
  validate: true
});

if (result.success) {
  console.log(result.dsl);
}
```

## ParseOptions

解析选项接口。

```typescript
interface ParseOptions {
  validate?: boolean;  // 默认: true
  strict?: boolean;    // 默认: false
}
```

### 属性

- `validate` (boolean, 可选): 是否在解析时进行验证，默认 `true`
- `strict` (boolean, 可选): 是否严格模式，默认 `false`

## ParseResult

解析结果接口。

```typescript
interface ParseResult {
  dsl: QuizDSL | null;
  success: boolean;
  errors?: ValidationError[];
  error?: Error;
}
```

### 属性

- `dsl` (QuizDSL | null): 解析后的 DSL 数据
- `success` (boolean): 是否成功
- `errors` (ValidationError[], 可选): 验证错误列表（如果验证失败）
- `error` (Error, 可选): 解析错误（如果 JSON 解析失败）

## 使用示例

### 从文件读取

```typescript
import { readFileSync } from 'fs';
import { parseQuizDSL } from '@quizerjs/dsl';

const jsonString = readFileSync('quiz.json', 'utf-8');
const result = parseQuizDSL(jsonString);

if (result.success) {
  console.log('解析成功:', result.dsl);
} else {
  console.error('解析失败:', result.error || result.errors);
}
```

### 禁用验证

```typescript
const result = parseQuizDSL(jsonString, { validate: false });
// 即使数据无效也会解析
```

## 相关

- [验证器](./validator.md) - DSL 验证
- [序列化器](./serializer.md) - DSL 序列化

