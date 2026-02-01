# Quiz DSL 架构指南 (Architecture Guide)

欢迎来到 `@quizerjs/dsl` 核心规范库。作为 Quiz Architect，我将引导你理解本项目的灵魂——**结构化评估语言 (Quiz DSL)**。

## 0. 设计哲学

在 Quizer 体系中，数据高于一切。我们将评估逻辑抽象为平台无关的 JSON 模型，确保同一份测验可以在 Web、移动端、甚至命令行中以一致的逻辑运行。

- **模型驱动**：UI 只是状态的投影，DSL 才是状态的源头。
- **类型安全**：借助 TypeScript，我们在编译期捕获 90% 的模型错误。
- **严谨验证**：运行时 Schema 验证确保数据的完整性。

## 1. 核心模型 (Core Models)

### Quiz DSL (测验定义)

定义了一个测验的静态结构，包括标题、描述、设置、章节和题目。

```typescript
import { QuizDSL } from '@quizerjs/dsl';

const myQuiz: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'quiz-001',
    title: '基础地理测试',
    questions: [
      {
        id: 'q-1',
        type: 'single_choice',
        text: '珠穆朗玛峰在哪个洲？',
        options: [
          { id: 'o1', text: '亚洲', isCorrect: true },
          { id: 'o2', text: '欧洲', isCorrect: false },
        ],
      },
    ],
  },
};
```

### Result DSL (结果模型)

捕获一次测验旅程的完整数据，包括原始测验定义、用户答案、得分情况以及元数据。

- **Scoring**: 包含总分、百分比、通过状态。
- **QuestionResults**: 每道题的详细表现（耗时、正误、答案映射）。

## 2. API 使用手册

### 验证 (Validation)

在将 DSL 传递给支付或存储模块前，务必验证其合法性。

```typescript
import { validateQuizDSL } from '@quizerjs/dsl';

const { valid, errors } = validateQuizDSL(myQuiz);
if (!valid) {
  console.error('DSL 格式错误:', errors);
}
```

### 解析与序列化 (Parsing & Serialization)

提供容错性解析和标准化序列化。

```typescript
import { parseQuizDSL, serializeQuizDSL } from '@quizerjs/dsl';

// 从字符串解析
const parseResult = parseQuizDSL(jsonString);

// 序列化为标准化 JSON 字符串
const { data, success } = serializeQuizDSL(myQuiz, { indent: 2 });
```

## 3. 扩展 DSL

如果你需要添加新的题目类型或元数据字段：

1.  **修改 `types.ts`**: 添加新的 `Question` 子类型。
2.  **更新 `QuestionTypes`**: 在常量中注册新类型。
3.  **更新 `validator.ts`**: 为新类型编写验证逻辑。
4.  **更新 `schema.json`**: 确保 JSON Schema 同步更新，以支持非 TS 端的验证。

---

> "一个定义良好的元模型是所有交互的灵魂。" —— Quentin "Quiz" Masterson
