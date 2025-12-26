# RFC 0001: Quiz DSL 规范

**状态**: 已完成 (Completed)  
**创建日期**: 2025-01-27  
**完成日期**: 2025-12-07  
**作者**: quizerjs 团队

## 摘要

本文档定义了 quizerjs 的 Quiz DSL（领域特定语言）规范。Quiz DSL 是一个基于 JSON 的数据格式，用于描述测验的结构、问题、选项和配置。

## 动机

- 提供统一的数据格式，便于跨平台使用（React、Vue、原生）
- 支持序列化和反序列化，便于存储和传输
- 定义清晰的规范，便于验证和工具支持

## 规范

### 基本结构

```json
{
  "version": "1.0.0",
  "quiz": {
    "id": "string",
    "title": "string",
    "description": "string?",
    "metadata": {
      "author": "string?",
      "createdAt": "string?",
      "updatedAt": "string?",
      "tags": "string[]?"
    },
    "settings": {
      "allowRetry": "boolean?",
      "showResults": "boolean?",
      "timeLimit": "number?",
      "randomizeQuestions": "boolean?",
      "randomizeOptions": "boolean?",
      "passingScore": "number?"
    },
    "questions": "Question[]"
  }
}
```

### Question 类型

#### 单选题 (single_choice)

```json
{
  "id": "string",
  "type": "single_choice",
  "text": "string",
  "options": [
    {
      "id": "string",
      "text": "string",
      "isCorrect": "boolean"
    }
  ],
  "points": "number?",
  "explanation": "string?",
  "metadata": {
    "difficulty": "easy | medium | hard?",
    "tags": "string[]?"
  }
}
```

#### 多选题 (multiple_choice)

```json
{
  "id": "string",
  "type": "multiple_choice",
  "text": "string",
  "options": [
    {
      "id": "string",
      "text": "string",
      "isCorrect": "boolean"
    }
  ],
  "points": "number?",
  "explanation": "string?",
  "metadata": {
    "difficulty": "easy | medium | hard?",
    "tags": "string[]?"
  }
}
```

#### 文本输入题 (text_input)

```json
{
  "id": "string",
  "type": "text_input",
  "text": "string",
  "correctAnswer": "string | string[]",
  "caseSensitive": "boolean?",
  "points": "number?",
  "explanation": "string?",
  "metadata": {
    "difficulty": "easy | medium | hard?",
    "tags": "string[]?"
  }
}
```

#### 判断题 (true_false)

```json
{
  "id": "string",
  "type": "true_false",
  "text": "string",
  "correctAnswer": "true | false",
  "points": "number?",
  "explanation": "string?",
  "metadata": {
    "difficulty": "easy | medium | hard?",
    "tags": "string[]?"
  }
}
```

### 完整示例

```json
{
  "version": "1.0.0",
  "quiz": {
    "id": "quiz-001",
    "title": "JavaScript 基础测验",
    "description": "测试你对 JavaScript 基础知识的理解",
    "metadata": {
      "author": "quizerjs",
      "createdAt": "2025-12-07T00:00:00Z",
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
        "explanation": "Array 是对象类型，不是基本数据类型",
        "metadata": {
          "difficulty": "medium",
          "tags": ["javascript", "types"]
        }
      },
      {
        "id": "q3",
        "type": "text_input",
        "text": "ES6 中用于声明常量的关键字是什么？",
        "correctAnswer": "const",
        "caseSensitive": false,
        "points": 5,
        "explanation": "const 关键字用于声明常量",
        "metadata": {
          "difficulty": "easy",
          "tags": ["javascript", "es6"]
        }
      },
      {
        "id": "q4",
        "type": "true_false",
        "text": "JavaScript 是一种编译型语言",
        "correctAnswer": false,
        "points": 5,
        "explanation": "JavaScript 是一种解释型语言",
        "metadata": {
          "difficulty": "easy",
          "tags": ["javascript", "basics"]
        }
      }
    ]
  }
}
```

## 验证规则

1. **必需字段**：
   - `version`: 必须存在且为字符串
   - `quiz.id`: 必须存在且为字符串
   - `quiz.title`: 必须存在且为字符串
   - `quiz.questions`: 必须存在且为数组

2. **问题验证**：
   - 每个问题必须有 `id`、`type`、`text`
   - 选择题（single_choice、multiple_choice）必须有 `options` 数组，且至少包含 2 个选项
   - 每个选项必须有 `id`、`text`、`isCorrect`
   - 选择题必须至少有一个正确答案（`isCorrect: true`）
   - 单选题必须恰好有一个正确答案
   - 多选题必须至少有一个正确答案
   - 文本输入题和判断题必须有 `correctAnswer`

3. **ID 唯一性**：
   - `quiz.id` 必须在文档中唯一
   - 每个问题的 `id` 必须在 `questions` 数组中唯一
   - 每个选项的 `id` 必须在所属问题的 `options` 数组中唯一

## 版本管理

- 当前版本：`1.0.0`
- 版本格式：遵循语义化版本（SemVer）
- 向后兼容：新版本应尽可能保持向后兼容

## 扩展性

DSL 设计支持未来扩展：

- 新增问题类型
- 新增设置选项
- 新增元数据字段
- 通过 `metadata` 字段支持自定义数据

## 实现状态

### ✅ 已完成

1. **类型定义** (`packages/dsl/src/types.ts`)
   - ✅ 所有问题类型的 TypeScript 接口
   - ✅ Quiz、QuizMetadata、QuizSettings 接口
   - ✅ 完整的类型系统

2. **JSON Schema** (`packages/dsl/schema.json`)
   - ✅ 完整的 JSON Schema 定义
   - ✅ 所有问题类型的 schema
   - ✅ 验证规则定义

3. **验证器** (`packages/dsl/src/validator.ts`)
   - ✅ DSL 级别验证
   - ✅ Quiz 级别验证
   - ✅ Question 级别验证
   - ✅ 所有问题类型的特定验证
   - ✅ ID 唯一性检查
   - ✅ 错误代码系统（28 个错误代码）
   - ✅ 错误消息模板系统

4. **解析器** (`packages/dsl/src/parser.ts`)
   - ✅ JSON 字符串解析
   - ✅ 对象解析
   - ✅ 解析选项（验证、严格模式）

5. **序列化器** (`packages/dsl/src/serializer.ts`)
   - ✅ JSON 序列化
   - ✅ 对象序列化（深拷贝）
   - ✅ 格式化选项

6. **测试覆盖**
   - ✅ 验证器单元测试（53 个测试，100% 通过）
   - ✅ 解析器单元测试
   - ✅ 序列化器单元测试
   - ✅ 代码覆盖率：89.63%

7. **文档**
   - ✅ DSL 规范文档
   - ✅ API 参考文档
   - ✅ 使用示例
   - ✅ 错误代码文档

### 实现细节

- **验证规则**: 所有 RFC 中定义的验证规则均已实现
- **错误处理**: 使用错误代码系统，支持国际化和消息模板
- **类型安全**: 完整的 TypeScript 类型定义和类型守卫
- **测试**: 全面的单元测试覆盖所有功能

## 参考实现

- TypeScript 类型定义：`packages/dsl/src/types.ts`
- JSON Schema：`packages/dsl/schema.json`
- 验证器：`packages/dsl/src/validator.ts`
- 解析器：`packages/dsl/src/parser.ts`
- 序列化器：`packages/dsl/src/serializer.ts`
- 错误消息：`packages/dsl/src/messages.ts`

## 使用示例

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
