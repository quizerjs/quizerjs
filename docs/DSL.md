# Quiz DSL 规范文档

> 本文档描述了 quizerjs 的 Quiz DSL（领域特定语言）规范，用于定义和验证测验数据。

## 目录

- [简介](#简介)
- [基本结构](#基本结构)
- [问题类型](#问题类型)
- [验证规则](#验证规则)
- [完整示例](#完整示例)
- [API 参考](#api-参考)
- [错误代码](#错误代码)

## 简介

Quiz DSL 是一个基于 JSON 的数据格式，用于描述测验的结构、问题、选项和配置。它提供了：

- **统一的数据格式**：便于跨平台使用（React、Vue、原生）
- **类型安全**：完整的 TypeScript 类型定义
- **数据验证**：内置验证器确保数据符合规范
- **易于序列化**：支持 JSON 序列化和反序列化

## 基本结构

### DSL 根对象

```json
{
  "version": "1.0.0",
  "quiz": {
    "id": "string",
    "title": "string",
    "description": "string?",
    "metadata": { ... },
    "settings": { ... },
    "questions": [ ... ]
  }
}
```

### 必需字段

- `version` (string): DSL 版本号，当前为 `"1.0.0"`
- `quiz.id` (string): 测验唯一标识
- `quiz.title` (string): 测验标题
- `quiz.questions` (array): 问题列表，至少包含一个问题

### 可选字段

- `quiz.description` (string): 测验描述
- `quiz.metadata` (object): 测验元数据
- `quiz.settings` (object): 测验设置

## 问题类型

### 1. 单选题 (single_choice)

```json
{
  "id": "q1",
  "type": "single_choice",
  "text": "以下哪个是 JavaScript 的框架？",
  "options": [
    { "id": "o1", "text": "React", "isCorrect": true },
    { "id": "o2", "text": "Python", "isCorrect": false },
    { "id": "o3", "text": "Java", "isCorrect": false }
  ],
  "points": 10,
  "explanation": "React 是一个用于构建用户界面的 JavaScript 库",
  "metadata": {
    "difficulty": "easy",
    "tags": ["javascript", "react"]
  }
}
```

**要求：**
- 必须至少包含 2 个选项
- 必须恰好有一个正确答案（`isCorrect: true`）

### 2. 多选题 (multiple_choice)

```json
{
  "id": "q2",
  "type": "multiple_choice",
  "text": "以下哪些是 JavaScript 的基本数据类型？（多选）",
  "options": [
    { "id": "o1", "text": "String", "isCorrect": true },
    { "id": "o2", "text": "Number", "isCorrect": true },
    { "id": "o3", "text": "Boolean", "isCorrect": true },
    { "id": "o4", "text": "Array", "isCorrect": false }
  ],
  "points": 15,
  "explanation": "Array 是对象类型，不是基本数据类型"
}
```

**要求：**
- 必须至少包含 2 个选项
- 必须至少有一个正确答案

### 3. 文本输入题 (text_input)

```json
{
  "id": "q3",
  "type": "text_input",
  "text": "ES6 中用于声明常量的关键字是什么？",
  "correctAnswer": "const",
  "caseSensitive": false,
  "points": 5,
  "explanation": "const 关键字用于声明常量"
}
```

**支持多种答案：**

```json
{
  "correctAnswer": ["const", "CONST", "Const"]
}
```

**要求：**
- `correctAnswer` 必须是字符串或字符串数组
- 如果使用数组，数组不能为空

### 4. 判断题 (true_false)

```json
{
  "id": "q4",
  "type": "true_false",
  "text": "JavaScript 是一种编译型语言",
  "correctAnswer": false,
  "points": 5,
  "explanation": "JavaScript 是一种解释型语言"
}
```

**要求：**
- `correctAnswer` 必须是布尔值（`true` 或 `false`）

## 验证规则

### ID 唯一性

- `quiz.id` 必须在文档中唯一
- 每个问题的 `id` 必须在 `questions` 数组中唯一
- 每个选项的 `id` 必须在所属问题的 `options` 数组中唯一

### 问题验证

- 每个问题必须有 `id`、`type`、`text`
- 选择题必须包含 `options` 数组
- 文本输入题和判断题必须有 `correctAnswer`

### 选项验证

- 每个选项必须有 `id`、`text`、`isCorrect`
- `isCorrect` 必须是布尔值

## 完整示例

```json
{
  "version": "1.0.0",
  "quiz": {
    "id": "quiz-001",
    "title": "JavaScript 基础测验",
    "description": "测试你对 JavaScript 基础知识的理解",
    "metadata": {
      "author": "quizerjs",
      "createdAt": "2025-01-27T00:00:00Z",
      "tags": ["javascript", "programming", "beginner"]
    },
    "settings": {
      "allowRetry": true,
      "showResults": true,
      "timeLimit": 600,
      "randomizeQuestions": false,
      "randomizeOptions": false,
      "passingScore": 60
    },
    "questions": [
      {
        "id": "q1",
        "type": "single_choice",
        "text": "以下哪个是 JavaScript 的框架？",
        "options": [
          { "id": "o1", "text": "React", "isCorrect": true },
          { "id": "o2", "text": "Python", "isCorrect": false },
          { "id": "o3", "text": "Java", "isCorrect": false }
        ],
        "points": 10,
        "explanation": "React 是一个用于构建用户界面的 JavaScript 库",
        "metadata": {
          "difficulty": "easy",
          "tags": ["javascript", "react"]
        }
      },
      {
        "id": "q2",
        "type": "multiple_choice",
        "text": "以下哪些是 JavaScript 的基本数据类型？（多选）",
        "options": [
          { "id": "o1", "text": "String", "isCorrect": true },
          { "id": "o2", "text": "Number", "isCorrect": true },
          { "id": "o3", "text": "Boolean", "isCorrect": true },
          { "id": "o4", "text": "Array", "isCorrect": false }
        ],
        "points": 15,
        "explanation": "Array 是对象类型，不是基本数据类型"
      },
      {
        "id": "q3",
        "type": "text_input",
        "text": "ES6 中用于声明常量的关键字是什么？",
        "correctAnswer": "const",
        "caseSensitive": false,
        "points": 5
      },
      {
        "id": "q4",
        "type": "true_false",
        "text": "JavaScript 是一种编译型语言",
        "correctAnswer": false,
        "points": 5
      }
    ]
  }
}
```

## API 参考

### 安装

```bash
npm install @quizerjs/dsl
```

### 验证 DSL

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

const result = validateQuizDSL(dslData);

if (result.valid) {
  console.log('DSL 有效');
} else {
  console.error('验证错误:', result.errors);
}
```

### 解析 DSL

```typescript
import { parseQuizDSL } from '@quizerjs/dsl';

const jsonString = JSON.stringify(dslData);
const result = parseQuizDSL(jsonString);

if (result.success) {
  const dsl = result.dsl;
  // 使用 DSL 数据
}
```

### 序列化 DSL

```typescript
import { serializeQuizDSL } from '@quizerjs/dsl';

const result = serializeQuizDSL(dsl, {
  pretty: true,
  indent: 2
});

if (result.success) {
  console.log(result.json);
}
```

## 错误代码

验证器使用错误代码系统，便于错误处理和国际化：

### DSL 级别错误 (E1000-E1099)

- `E1000`: DSL 必须是对象
- `E1001`: version 必须存在且为字符串

### Quiz 级别错误 (E1100-E1199)

- `E1100`: quiz 必须存在且为对象
- `E1101`: quiz.id 必须存在且为字符串
- `E1102`: quiz.title 必须存在且为字符串
- `E1103`: quiz.questions 必须存在且为数组

### Question 级别错误 (E1200-E1299)

- `E1200`: 问题必须是对象
- `E1201`: 问题 id 必须存在且为字符串
- `E1202`: 问题 id 重复
- `E1203`: 问题 type 必须存在且为有效的类型
- `E1204`: 未知的问题类型
- `E1205`: 问题 text 必须存在且为字符串

### 单选题错误 (E1300-E1399)

- `E1300`: 单选题必须至少包含 2 个选项
- `E1301`: 单选题必须恰好有一个正确答案

### 多选题错误 (E1400-E1499)

- `E1400`: 多选题必须至少包含 2 个选项
- `E1401`: 多选题必须至少有一个正确答案

### 选项错误 (E1500-E1599)

- `E1500`: 选项必须是对象
- `E1501`: 选项 id 必须存在且为字符串
- `E1502`: 选项 id 重复
- `E1503`: 选项 text 必须存在且为字符串
- `E1504`: 选项 isCorrect 必须为布尔值

### 文本输入题错误 (E1600-E1699)

- `E1600`: 文本输入题必须包含 correctAnswer（字符串或字符串数组）
- `E1601`: correctAnswer 数组不能为空

### 判断题错误 (E1700-E1799)

- `E1700`: 判断题必须包含 correctAnswer（布尔值）

## 类型定义

完整的 TypeScript 类型定义请参考 [类型定义文件](../../packages/dsl/src/types.ts)。

## 版本管理

- **当前版本**: `1.0.0`
- **版本格式**: 遵循语义化版本（SemVer）
- **向后兼容**: 新版本应尽可能保持向后兼容

## 扩展性

DSL 设计支持未来扩展：

- 新增问题类型
- 新增设置选项
- 新增元数据字段
- 通过 `metadata` 字段支持自定义数据

## 相关资源

- [RFC 0001: Quiz DSL 规范](./rfc/0001-quiz-dsl-specification.md)
- [GitHub 仓库](https://github.com/wsxjs/quizerjs)
- [npm 包](https://www.npmjs.com/package/@quizerjs/dsl)

