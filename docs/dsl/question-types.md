# 问题类型

quizerjs 支持四种问题类型：单选题、多选题、文本输入题和判断题。

## 1. 单选题 (single_choice)

单选题要求用户从多个选项中选择一个正确答案。

### 结构

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

### 要求

- 必须至少包含 **2 个选项**
- 必须恰好有 **一个正确答案**（`isCorrect: true`）
- 每个选项必须有 `id`、`text`、`isCorrect` 字段

### 字段说明

- `id` (string, 必需): 问题唯一标识
- `type` (string, 必需): 必须为 `"single_choice"`
- `text` (string, 必需): 问题文本
- `options` (array, 必需): 选项列表，至少 2 个
- `points` (number, 可选): 题目分值
- `explanation` (string, 可选): 答案解析
- `metadata` (object, 可选): 问题元数据

## 2. 多选题 (multiple_choice)

多选题允许用户选择多个正确答案。

### 结构

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

### 要求

- 必须至少包含 **2 个选项**
- 必须至少有一个正确答案
- 可以有多个正确答案

## 3. 文本输入题 (text_input)

文本输入题要求用户输入文本答案。

### 结构

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

### 支持多种答案

```json
{
  "correctAnswer": ["const", "CONST", "Const"]
}
```

### 要求

- `correctAnswer` 必须是字符串或字符串数组
- 如果使用数组，数组不能为空
- `caseSensitive` 控制是否区分大小写（默认：`false`）

### 字段说明

- `id` (string, 必需): 问题唯一标识
- `type` (string, 必需): 必须为 `"text_input"`
- `text` (string, 必需): 问题文本
- `correctAnswer` (string | string[], 必需): 正确答案
- `caseSensitive` (boolean, 可选): 是否区分大小写
- `points` (number, 可选): 题目分值
- `explanation` (string, 可选): 答案解析

## 4. 判断题 (true_false)

判断题要求用户判断陈述的真假。

### 结构

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

### 要求

- `correctAnswer` 必须是布尔值（`true` 或 `false`）

### 字段说明

- `id` (string, 必需): 问题唯一标识
- `type` (string, 必需): 必须为 `"true_false"`
- `text` (string, 必需): 问题文本
- `correctAnswer` (boolean, 必需): 正确答案
- `points` (number, 可选): 题目分值
- `explanation` (string, 可选): 答案解析

## 问题元数据

所有问题类型都支持可选的 `metadata` 字段：

```json
{
  "metadata": {
    "difficulty": "easy",  // "easy" | "medium" | "hard"
    "tags": ["javascript", "react"],
    "customField": "自定义值"  // 支持自定义字段
  }
}
```

## 下一步

- [验证规则](./validation.md) - 了解数据验证规则
- [完整示例](./examples.md) - 查看完整示例

