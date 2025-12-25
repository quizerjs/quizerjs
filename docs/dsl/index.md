# Quiz DSL 规范

Quiz DSL（领域特定语言）是 quizerjs 的核心数据格式，用于定义和验证测验数据。

## 什么是 DSL？

DSL 是一个基于 JSON 的数据格式，用于描述测验的结构、问题、选项和配置。它提供了：

- **统一的数据格式**：便于跨平台使用（React、Vue、原生）
- **类型安全**：完整的 TypeScript 类型定义
- **数据验证**：内置验证器确保数据符合规范
- **易于序列化**：支持 JSON 序列化和反序列化

## 快速示例

```json
{
  "version": "1.0.0",
  "quiz": {
    "id": "quiz-001",
    "title": "JavaScript 基础测验",
    "questions": [
      {
        "id": "q1",
        "type": "single_choice",
        "text": "以下哪个是 JavaScript 的框架？",
        "options": [
          { "id": "o1", "text": "React", "isCorrect": true },
          { "id": "o2", "text": "Python", "isCorrect": false }
        ]
      }
    ]
  }
}
```

## 文档导航

- [基本结构](./structure.md) - DSL 的基本结构
- [问题类型](./question-types.md) - 所有支持的问题类型
- [验证规则](./validation.md) - 数据验证规则
- [完整示例](./examples.md) - 完整的使用示例
- [错误代码](./error-codes.md) - 所有错误代码参考

## 开始使用

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

const result = validateQuizDSL(dslData);
if (result.valid) {
  console.log('DSL 有效！');
}
```

## 相关资源

- [API 参考](/api/) - 完整的 API 文档
- [RFC 0001](/rfc/0001-quiz-dsl-specification) - 详细的技术规范
