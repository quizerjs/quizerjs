# 真实使用案例

本文档展示 quizerjs 在实际项目中的使用案例。

## 案例 1: 在线教育平台

### 场景描述

一个在线教育平台需要为学生创建交互式测验，支持多种题型，并能实时验证答案。

### 实现方案

```typescript
import { validateQuizDSL, parseQuizDSL } from '@quizerjs/dsl';
import type { QuizDSL } from '@quizerjs/dsl';

// 从服务器获取测验数据
async function loadQuiz(quizId: string): Promise<QuizDSL | null> {
  const response = await fetch(`/api/quizzes/${quizId}`);
  const jsonString = await response.text();

  const parseResult = parseQuizDSL(jsonString);

  if (!parseResult.success) {
    console.error('解析失败:', parseResult.error);
    return null;
  }

  // 验证数据
  const validationResult = validateQuizDSL(parseResult.dsl!);
  if (!validationResult.valid) {
    console.error('数据验证失败:', validationResult.errors);
    return null;
  }

  return parseResult.dsl!;
}

// 使用示例
const quiz = await loadQuiz('javascript-basics-101');
if (quiz) {
  console.log(`加载测验: ${quiz.quiz.title}`);
  console.log(`问题数量: ${quiz.quiz.questions.length}`);
}
```

（完整 React 组件示例见仓库文档。）

## 案例 2: 内容管理系统

### 场景描述

一个 CMS 系统需要让内容编辑者通过 Editor.js 创建包含测验的文章。

### 实现方案

使用 `@quizerjs/editorjs-tool` 集成 Editor.js，在保存前用 `validateQuizDSL` 验证 DSL，再提交到后端。

## 案例 3: 移动应用

### 场景描述

移动学习应用需要离线支持，能够下载和本地存储测验数据。

### 实现方案

使用 `parseQuizDSL` / `serializeQuizDSL` 配合本地存储（如 AsyncStorage），下载时解析并验证，离线时从本地读取并解析。

## 案例 4: 数据分析平台

### 场景描述

数据分析平台需要批量处理测验数据，进行统计分析。

### 实现方案

使用 `parseQuizDSL` 和 `validateQuizDSL` 批量处理文件，再按题型、得分等维度做统计与导出。

## 下一步

- [快速开始](../getting-started.md) - 开始使用 quizerjs
- [DSL 规范](../dsl/index.md) - 了解 DSL 格式
- [API 参考](../api/index.md) - 查看完整 API
