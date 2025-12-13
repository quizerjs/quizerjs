# @quizerjs/svelte

quizerjs 的 Svelte 集成包，提供 Svelte 组件和 Stores，用于在 Svelte 应用中集成 quizerjs。

## 安装

```bash
npm install @quizerjs/svelte @quizerjs/dsl
# 或
pnpm add @quizerjs/svelte @quizerjs/dsl
# 或
yarn add @quizerjs/svelte @quizerjs/dsl
```

## 使用

### 基础用法

```svelte
<script>
  import { QuizComponent } from '@quizerjs/svelte';
  import type { QuizDSL } from '@quizerjs/dsl';

  const dsl: QuizDSL = {
    quiz: {
      title: '示例测验',
      questions: [
        {
          id: 'q1',
          type: 'single_choice',
          text: '这是单选题？',
          options: [
            { id: 'opt1', text: '选项 A', isCorrect: true },
            { id: 'opt2', text: '选项 B', isCorrect: false },
          ],
        },
      ],
    },
  };
</script>

<QuizComponent {dsl} />
```

### 使用 Store

```svelte
<script>
  import { useQuiz } from '@quizerjs/svelte';
  import type { QuizDSL } from '@quizerjs/dsl';

  const dsl: QuizDSL = { /* ... */ };

  const {
    answers,
    submitted,
    score,
    setAnswer,
    submit,
    reset,
  } = useQuiz({
    dsl,
    onSubmit: (answers, score) => {
      console.log('提交答案:', answers);
      console.log('得分:', score);
    },
  });
</script>

<div>
  <!-- 自定义 UI -->
  <button on:click={submit}>提交</button>
  <button on:click={reset}>重置</button>
</div>
```

## API

### QuizComponent

Svelte 组件，用于渲染完整的测验界面。

#### Props

- `dsl: QuizDSL` - 测验 DSL 数据（必需）
- `disabled?: boolean` - 是否禁用交互（默认：`false`）
- `showResults?: boolean` - 是否显示结果（默认：`true`）
- `onSubmit?: (answers: Record<string, any>) => void` - 提交回调
- `onAnswerChange?: (questionId: string, answer: any) => void` - 答案变化回调

### useQuiz

Svelte Store，提供测验的状态管理和逻辑。

#### 参数

```typescript
interface UseQuizOptions {
  dsl?: QuizDSL;
  autoValidate?: boolean;
  onSubmit?: (answers: Record<string, any>, score: number) => void;
}
```

#### 返回值

```typescript
interface UseQuizReturn {
  dsl: Writable<QuizDSL | null>;
  answers: Writable<Record<string, any>>;
  submitted: Writable<boolean>;
  score: Writable<number | null>;
  loadDSL: (dsl: QuizDSL) => void;
  setAnswer: (questionId: string, answer: any) => void;
  submit: () => void;
  reset: () => void;
  isAnswerCorrect: (question: Question, answer: any) => boolean;
}
```

## 支持的题型

- 单选题 (`single_choice`)
- 多选题 (`multiple_choice`)
- 文本输入题 (`text_input`)
- 判断题 (`true_false`)

## 样式

组件包含默认样式，可以直接使用。如果需要自定义样式，可以通过 CSS 覆盖类名。

## License

MIT

