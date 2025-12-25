# 序列化器 API

序列化器用于将 DSL 数据序列化为 JSON 字符串或对象。

## serializeQuizDSL

将 DSL 序列化为 JSON 字符串。

### 签名

```typescript
function serializeQuizDSL(dsl: QuizDSL, options?: SerializeOptions): SerializeResult;
```

### 参数

- `dsl` (QuizDSL): DSL 数据
- `options` (SerializeOptions, 可选): 序列化选项

### 返回值

返回 `SerializeResult` 对象。

### 示例

```typescript
import { serializeQuizDSL } from '@quizerjs/dsl';

const result = serializeQuizDSL(dsl, {
  validate: true,
  pretty: true,
  indent: 2,
});

if (result.success) {
  console.log(result.json);
  // 保存到文件或发送到服务器
}
```

## serializeQuizDSLToObject

将 DSL 序列化为对象（深拷贝）。

### 签名

```typescript
function serializeQuizDSLToObject(
  dsl: QuizDSL,
  options?: Omit<SerializeOptions, 'pretty' | 'indent'>
): { data: QuizDSL | null; success: boolean; error?: Error };
```

### 参数

- `dsl` (QuizDSL): DSL 数据
- `options` (可选): 序列化选项（不包含 `pretty` 和 `indent`）

### 示例

```typescript
import { serializeQuizDSLToObject } from '@quizerjs/dsl';

const result = serializeQuizDSLToObject(dsl);

if (result.success) {
  const clonedDSL = result.data;
  // 使用深拷贝的 DSL
}
```

## SerializeOptions

序列化选项接口。

```typescript
interface SerializeOptions {
  validate?: boolean; // 默认: true
  pretty?: boolean; // 默认: false
  indent?: number; // 默认: 2
}
```

### 属性

- `validate` (boolean, 可选): 是否在序列化前进行验证，默认 `true`
- `pretty` (boolean, 可选): 是否格式化输出，默认 `false`
- `indent` (number, 可选): JSON 缩进空格数，默认 `2`

## SerializeResult

序列化结果接口。

```typescript
interface SerializeResult {
  json: string | null;
  success: boolean;
  error?: Error;
}
```

### 属性

- `json` (string | null): 序列化后的 JSON 字符串
- `success` (boolean): 是否成功
- `error` (Error, 可选): 序列化错误

## 使用示例

### 格式化输出

```typescript
const result = serializeQuizDSL(dsl, {
  pretty: true,
  indent: 2,
});

if (result.success) {
  fs.writeFileSync('quiz-formatted.json', result.json!);
}
```

### 压缩输出

```typescript
const result = serializeQuizDSL(dsl, {
  pretty: false,
});

if (result.success) {
  // 压缩的 JSON 字符串，适合网络传输
  sendToServer(result.json!);
}
```

### 深拷贝对象

```typescript
const result = serializeQuizDSLToObject(dsl);

if (result.success) {
  const cloned = result.data!;
  // 修改 cloned 不会影响原始 dsl
  cloned.quiz.title = '新标题';
}
```

## 相关

- [验证器](./validator.md) - DSL 验证
- [解析器](./parser.md) - DSL 解析
