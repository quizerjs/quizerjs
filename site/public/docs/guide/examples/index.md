# 示例

本文档提供 quizerjs 的完整使用示例和真实使用案例。

## 快速导航

- [真实使用案例](./real-world.md) - 查看在实际项目中的使用场景
- [交互式演示](./interactive-demo.md) - 在线可运行的演示
- [基础验证示例](./basic-validation.md) - 简单的验证示例
- [完整测验示例](./full-quiz.md) - 包含所有问题类型的完整示例

## 基础示例

### 验证 DSL

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
          { id: 'o3', text: 'Java', isCorrect: false },
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

### 解析和序列化

```typescript
import { parseQuizDSL, serializeQuizDSL } from '@quizerjs/dsl';

// 从 JSON 字符串解析
const jsonString = `{
  "version": "1.0.0",
  "quiz": {
    "id": "quiz-1",
    "title": "测试",
    "questions": [
      {
        "id": "q1",
        "type": "single_choice",
        "text": "测试问题",
        "options": [
          { "id": "o1", "text": "选项1", "isCorrect": true },
          { "id": "o2", "text": "选项2", "isCorrect": false }
        ]
      }
    ]
  }
}`;

const parseResult = parseQuizDSL(jsonString);

if (parseResult.success) {
  console.log('解析成功:', parseResult.dsl);

  // 序列化回 JSON（格式化）
  const serializeResult = serializeQuizDSL(parseResult.dsl!, {
    pretty: true,
    indent: 2,
  });

  if (serializeResult.success) {
    console.log('序列化结果:');
    console.log(serializeResult.json);
  }
}
```

## 完整示例

详见 [完整测验示例](./full-quiz.md) 与 [真实使用案例](./real-world.md)。

## 错误处理示例

详见 [基础验证示例](./basic-validation.md)。

## 下一步

- [快速开始](../getting-started.md) - 开始使用 quizerjs
- [DSL 规范](../dsl/index.md) - 了解 DSL 格式
- [API 参考](../api/index.md) - 查看完整 API
