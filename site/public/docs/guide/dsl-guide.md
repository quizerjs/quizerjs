# DSL 完整指南

> 本指南将帮助您理解和使用 QuizerJS 的 Quiz DSL（领域特定语言），包括数据格式、验证规则和 API 使用方法。

## 目录

- [简介](#简介)
- [安装](#安装)
- [基本结构](#基本结构)
- [问题类型](#问题类型)
- [验证规则](#验证规则)
- [完整示例](#完整示例)
- [API 参考](#api-参考)
  - [类型定义](#类型定义)
  - [验证器 API](#验证器-api)
  - [解析器 API](#解析器-api)
  - [序列化器 API](#序列化器-api)
- [错误代码](#错误代码)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)

## 什么是 DSL？

Quiz DSL 是一个基于 JSON 的数据格式，用于描述测验的结构、问题、选项和配置。它提供了：

- **统一的数据格式**：便于跨平台使用（React、Vue、Svelte、Vanilla JS）
- **类型安全**：完整的 TypeScript 类型定义
- **数据验证**：内置验证器确保数据符合规范
- **易于序列化**：支持 JSON 序列化和反序列化

## 开始之前

### 安装

```bash
npm install @quizerjs/dsl
```

### 导入

```typescript
import {
  validateQuizDSL,
  parseQuizDSL,
  serializeQuizDSL,
  type QuizDSL,
  type Question,
  QuestionType,
} from '@quizerjs/dsl';
```

## 理解 DSL 结构

### 基本格式

每个 Quiz DSL 文档都遵循以下基本结构：

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

每个 DSL 文档必须包含以下字段：

- `version` (string): DSL 版本号，当前为 `"1.0.0"`
- `quiz.id` (string): 测验唯一标识
- `quiz.title` (string): 测验标题
- `quiz.questions` (array): 问题列表，至少包含一个问题

### 可选字段

以下字段是可选的，但建议使用：

- `quiz.description` (string): 测验描述
- `quiz.metadata` (object): 测验元数据（作者、创建时间、标签等）
- `quiz.settings` (object): 测验设置（时间限制、允许重试等）

## 创建问题

QuizerJS 支持四种问题类型。让我们逐一了解如何创建它们。

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

**创建步骤：**

1. 设置 `type` 为 `"single_choice"`
2. 添加至少 2 个选项
3. 确保恰好有一个选项的 `isCorrect` 为 `true`

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

**创建步骤：**

1. 设置 `type` 为 `"multiple_choice"`
2. 添加至少 2 个选项
3. 确保至少有一个选项的 `isCorrect` 为 `true`

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

**创建步骤：**

1. 设置 `type` 为 `"text_input"`
2. 设置 `correctAnswer` 为字符串或字符串数组
3. （可选）设置 `caseSensitive` 控制是否区分大小写

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

**创建步骤：**

1. 设置 `type` 为 `"true_false"`
2. 设置 `correctAnswer` 为 `true` 或 `false`

**要求：**

- `correctAnswer` 必须是布尔值（`true` 或 `false`）

## 验证您的 DSL

在创建 DSL 后，您应该验证它是否符合规范。

### 基本验证

使用 `validateQuizDSL` 函数验证您的 DSL：

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

const dsl = {
  /* 您的 DSL 数据 */
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

### 验证规则

验证器会检查以下规则：

#### ID 唯一性

- `quiz.id` 必须在文档中唯一
- 每个问题的 `id` 必须在 `questions` 数组中唯一
- 每个选项的 `id` 必须在所属问题的 `options` 数组中唯一

#### 问题验证

- 每个问题必须有 `id`、`type`、`text`
- 选择题必须包含 `options` 数组
- 文本输入题和判断题必须有 `correctAnswer`

#### 选项验证

- 每个选项必须有 `id`、`text`、`isCorrect`
- `isCorrect` 必须是布尔值

## 完整示例：创建您的第一个测验

让我们创建一个包含所有问题类型的完整测验。这个示例展示了如何构建一个完整的测验 DSL：

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

## 使用 API

QuizerJS DSL 库提供了完整的 API 用于验证、解析和序列化 DSL 数据。

### 导入 API

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

### 类型定义

#### QuizDSL

DSL 根类型，包含版本和测验数据。

```typescript
interface QuizDSL {
  version: string;
  quiz: Quiz;
}
```

#### QuestionType

问题类型枚举。

```typescript
enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT_INPUT = 'text_input',
  TRUE_FALSE = 'true_false',
}
```

#### Question

问题联合类型，支持所有问题类型。

```typescript
type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextInputQuestion
  | TrueFalseQuestion;
```

完整的 TypeScript 类型定义请参考 [类型定义文件](../../packages/dsl/src/types.ts)。

### 验证器 API

#### validateQuizDSL

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

#### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

#### ValidationError

```typescript
interface ValidationError {
  code: ValidationErrorCode;
  path: string;
  message: string;
}
```

### 解析器 API

#### parseQuizDSL

从 JSON 字符串解析 DSL。

```typescript
function parseQuizDSL(jsonString: string, options?: ParseOptions): ParseResult;
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
  strict: false,
});

if (result.success) {
  const dsl = result.dsl;
  // 使用解析后的 DSL
} else {
  console.error('解析失败:', result.error);
}
```

#### parseQuizDSLFromObject

从对象解析 DSL（不进行 JSON 解析）。

```typescript
function parseQuizDSLFromObject(data: unknown, options?: ParseOptions): ParseResult;
```

#### ParseOptions

```typescript
interface ParseOptions {
  validate?: boolean; // 默认: true
  strict?: boolean; // 默认: false
}
```

#### ParseResult

```typescript
interface ParseResult {
  dsl: QuizDSL | null;
  success: boolean;
  errors?: ValidationError[];
  error?: Error;
}
```

### 序列化器 API

#### serializeQuizDSL

将 DSL 序列化为 JSON 字符串。

```typescript
function serializeQuizDSL(dsl: QuizDSL, options?: SerializeOptions): SerializeResult;
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
  indent: 2,
});

if (result.success) {
  console.log(result.json);
  // 保存到文件或发送到服务器
}
```

#### serializeQuizDSLToObject

将 DSL 序列化为对象（深拷贝）。

```typescript
function serializeQuizDSLToObject(
  dsl: QuizDSL,
  options?: Omit<SerializeOptions, 'pretty' | 'indent'>
): { data: QuizDSL | null; success: boolean; error?: Error };
```

#### SerializeOptions

```typescript
interface SerializeOptions {
  validate?: boolean; // 默认: true
  pretty?: boolean; // 默认: false
  indent?: number; // 默认: 2
}
```

#### SerializeResult

```typescript
interface SerializeResult {
  json: string | null;
  success: boolean;
  error?: Error;
}
```

## 错误代码

验证器使用错误代码系统，便于错误处理和国际化。

### 获取错误消息

```typescript
import { ValidationErrorCode, getErrorMessage } from '@quizerjs/dsl';

const message = getErrorMessage(ValidationErrorCode.DSL_MUST_BE_OBJECT);
// 返回: "DSL 必须是对象"

// 参数化消息
const message2 = getErrorMessage(ValidationErrorCode.QUESTION_ID_DUPLICATE, 'q1');
// 返回: '问题 id "q1" 重复'
```

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

完整的错误代码列表请参考 [错误代码文档](./dsl/error-codes.md)。

## 实际使用示例

### 示例 1: 完整工作流

```typescript
import { validateQuizDSL, parseQuizDSL, serializeQuizDSL, type QuizDSL } from '@quizerjs/dsl';

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
  indent: 2,
});

if (serializeResult.success) {
  fs.writeFileSync('quiz-formatted.json', serializeResult.json!);
}
```

### 错误处理

```typescript
import { validateQuizDSL, ValidationErrorCode, getErrorMessage } from '@quizerjs/dsl';

const result = validateQuizDSL(dslData);

if (!result.valid) {
  // 按错误代码分组
  const errorsByCode = result.errors.reduce(
    (acc, error) => {
      if (!acc[error.code]) {
        acc[error.code] = [];
      }
      acc[error.code].push(error);
      return acc;
    },
    {} as Record<string, ValidationError[]>
  );

  // 处理特定错误
  if (errorsByCode[ValidationErrorCode.QUESTION_ID_DUPLICATE]) {
    console.error('发现重复的问题 ID');
  }

  // 显示所有错误
  result.errors.forEach(error => {
    console.error(`[${error.code}] ${error.path}: ${getErrorMessage(error.code)}`);
  });
}
```

### 示例 3: 类型安全

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

## 最佳实践

1. **始终验证数据**：在解析后立即验证 DSL 数据
2. **使用错误代码**：通过错误代码进行错误处理，而不是硬编码消息
3. **类型安全**：充分利用 TypeScript 类型系统
4. **错误处理**：妥善处理所有可能的错误情况

## 性能考虑

- 验证器使用类型守卫，避免不必要的类型转换
- 解析器支持禁用验证以提高性能
- 序列化器支持格式化选项，便于调试

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

## 下一步

- [快速开始](./getting-started.md) - 开始使用 QuizerJS
- [Vue 集成](./vue-integration.md) - 在 Vue 中使用
- [安装指南](./installation.md) - 查看详细安装说明

## 相关资源

- [错误代码参考](./dsl/error-codes.md) - 所有错误代码列表
- [GitHub 仓库](https://github.com/quizerjs/quizerjs)
- [npm 包](https://www.npmjs.com/package/@quizerjs/dsl)
