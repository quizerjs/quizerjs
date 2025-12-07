# 基本结构

## DSL 根对象

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

## 必需字段

### version

DSL 版本号，当前版本为 `"1.0.0"`。

```json
{
  "version": "1.0.0"
}
```

### quiz.id

测验的唯一标识符，必须是字符串。

```json
{
  "quiz": {
    "id": "quiz-001"
  }
}
```

### quiz.title

测验的标题，必须是字符串。

```json
{
  "quiz": {
    "title": "JavaScript 基础测验"
  }
}
```

### quiz.questions

问题列表，必须是数组，至少包含一个问题。

```json
{
  "quiz": {
    "questions": [
      {
        "id": "q1",
        "type": "single_choice",
        "text": "问题文本",
        "options": [ ... ]
      }
    ]
  }
}
```

## 可选字段

### quiz.description

测验的描述信息。

```json
{
  "quiz": {
    "description": "这是一个测试你对 JavaScript 基础知识的测验"
  }
}
```

### quiz.metadata

测验的元数据信息。

```json
{
  "quiz": {
    "metadata": {
      "author": "quizerjs",
      "createdAt": "2025-01-27T00:00:00Z",
      "updatedAt": "2025-01-27T00:00:00Z",
      "tags": ["javascript", "programming", "beginner"]
    }
  }
}
```

**支持的字段：**
- `author` (string): 作者
- `createdAt` (string): 创建时间（ISO 8601 格式）
- `updatedAt` (string): 更新时间（ISO 8601 格式）
- `tags` (string[]): 标签列表
- 其他自定义字段

### quiz.settings

测验的设置选项。

```json
{
  "quiz": {
    "settings": {
      "allowRetry": true,
      "showResults": true,
      "timeLimit": 600,
      "randomizeQuestions": false,
      "randomizeOptions": false,
      "passingScore": 60
    }
  }
}
```

**支持的设置：**
- `allowRetry` (boolean): 是否允许重试
- `showResults` (boolean): 是否显示结果
- `timeLimit` (number): 时间限制（秒）
- `randomizeQuestions` (boolean): 是否随机排序问题
- `randomizeOptions` (boolean): 是否随机排序选项
- `passingScore` (number): 及格分数（百分比，0-100）

## ID 唯一性规则

- `quiz.id` 必须在文档中唯一
- 每个问题的 `id` 必须在 `questions` 数组中唯一
- 每个选项的 `id` 必须在所属问题的 `options` 数组中唯一

## 最小有效 DSL

以下是最小的有效 DSL 示例：

```json
{
  "version": "1.0.0",
  "quiz": {
    "id": "quiz-001",
    "title": "测试测验",
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
}
```

## 下一步

- [问题类型](./question-types.md) - 了解所有支持的问题类型
- [验证规则](./validation.md) - 了解数据验证规则

