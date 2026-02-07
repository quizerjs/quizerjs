# 交互式演示

这是一个可以在浏览器中运行的交互式演示。

## 说明

演示展示 quizerjs 的完整功能：

- ✅ 支持所有问题类型（单选题、多选题、文本输入、判断题）
- ✅ 实时答案验证
- ✅ 提交后显示得分和解析
- ✅ 响应式设计

## 代码示例

### 基础使用

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

const quiz = {
  version: '1.0.0',
  quiz: {
    id: 'demo-1',
    title: '演示测验',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: 'quizerjs 是什么？',
        options: [
          { id: 'o1', text: '一个测验构建库', isCorrect: true },
          { id: 'o2', text: '一个编辑器', isCorrect: false },
        ],
      },
    ],
  },
};

const result = validateQuizDSL(quiz);
console.log('验证结果:', result.valid);
```

## 在线平台

您可以在以下平台查看和运行完整的示例：

- [CodeSandbox](https://codesandbox.io) - 在线代码编辑器
- [StackBlitz](https://stackblitz.com) - 在线 IDE
- 项目 [Demos](/demos/) 页面 - 官方演示站点

## 下一步

- [真实使用案例](./real-world.md) - 查看实际项目中的使用
- [API 参考](../api/index.md) - 查看完整 API
