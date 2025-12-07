# API 参考

quizerjs DSL 库提供完整的 API 用于验证、解析和序列化 Quiz DSL 数据。

## 安装

```bash
npm install @quizerjs/dsl
```

## 导入

```typescript
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

## 模块

- [验证器](./validator.md) - DSL 数据验证
- [解析器](./parser.md) - JSON 解析和转换
- [序列化器](./serializer.md) - DSL 序列化
- [类型定义](./types.md) - TypeScript 类型

## 快速示例

```typescript
import { validateQuizDSL, parseQuizDSL, serializeQuizDSL } from '@quizerjs/dsl';

// 验证
const result = validateQuizDSL(dslData);
if (result.valid) {
  console.log('验证通过');
}

// 解析
const parseResult = parseQuizDSL(jsonString);
if (parseResult.success) {
  console.log(parseResult.dsl);
}

// 序列化
const serializeResult = serializeQuizDSL(dsl, { pretty: true });
if (serializeResult.success) {
  console.log(serializeResult.json);
}
```

