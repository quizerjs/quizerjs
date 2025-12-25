# 测试数据

## Spelling Quiz (拼写测验)

### 来源

- 网址: https://www.usingenglish.com/quizzes/33.html
- 类型: 拼写选择题
- 题目数量: 33 道

### 内容

这是一个包含33道拼写选择题的测验，涵盖了常见的英语拼写错误，例如：

- embarrassment (尴尬)
- accommodate (容纳)
- separate (分离)
- definitely (肯定地)
- occurred (发生)
- receive (接收)
- 等等...

### 使用方法

在 `App.vue` 中，测试数据已经自动加载：

```vue
<QuizEditor
  ref="editorRef"
  :initialDSL="spellingQuizDSL"
  @change="handleChange"
  @save="handleSave"
/>
```

### 数据结构

测试数据遵循 `QuizDSL` 格式：

- 包含一个 section: "Spelling Questions"
- 每个问题都是 `single_choice` 类型
- 每个问题有 3-4 个选项，其中一个是正确答案

### 注意事项

- 此测试数据仅用于开发和测试目的
- 原始测验版权归 UsingEnglish.com 所有
- 在使用时请遵守相关版权规定
