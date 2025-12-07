# quizerjs

一个使用 Editor.js 和 wsx 构建测验的开源库。

## 简介

quizerjs 是一个功能强大的测验构建库，它结合了 [Editor.js](https://editorjs.io/) 的块编辑器能力和 [wsxjs](https://github.com/wsxjs/wsxjs) 的 Web Components 框架，让您可以轻松创建交互式测验。

## 特性

- 🎯 **多种题型支持**：单选题、多选题、文本输入题、判断题
- 🎨 **现代化 UI**：基于 wsx 组件的美观界面
- 🔌 **Editor.js 集成**：作为 Editor.js 工具插件使用
- 📦 **模块化设计**：核心组件可独立使用
- 🎛️ **灵活配置**：丰富的配置选项和回调函数
- 📱 **响应式设计**：适配各种屏幕尺寸
- 🔒 **类型安全**：完整的 TypeScript 类型定义

## 安装

```bash
# 安装核心组件库
npm install @quizerjs/core

# 安装 Editor.js 工具插件
npm install @quizerjs/editorjs-tool

# 安装依赖
npm install @editorjs/editorjs @wsxjs/wsx-core
```

## 快速开始

### 作为 Editor.js 工具使用

```typescript
import EditorJS from '@editorjs/editorjs';
import QuizTool from '@quizerjs/editorjs-tool';

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    quiz: {
      class: QuizTool,
      config: {
        onSubmit: (data) => {
          console.log('测验提交:', data);
        },
        onAnswerChange: (questionId, answer) => {
          console.log('答案变化:', questionId, answer);
        },
      },
    },
  },
});
```

### 独立使用核心组件

```typescript
import { QuizBlock } from '@quizerjs/core';
import { QuizData, QuestionType } from '@quizerjs/core';

const quizData: QuizData = {
  id: 'quiz-1',
  title: '示例测验',
  description: '这是一个示例测验',
  questions: [
    {
      id: 'q1',
      type: QuestionType.SINGLE_CHOICE,
      text: '以下哪个是 JavaScript 的框架？',
      options: [
        { id: 'o1', text: 'React' },
        { id: 'o2', text: 'Python' },
        { id: 'o3', text: 'Java' },
      ],
      correctAnswer: 'o1',
      points: 10,
    },
  ],
};

// 使用 wsx 组件
const quizBlock = new QuizBlock();
quizBlock.setAttribute('data-quiz-data', JSON.stringify(quizData));
document.body.appendChild(quizBlock);
```

## 项目结构

```
quizerjs/
├── packages/
│   ├── core/              # 核心 wsx 组件库
│   │   ├── src/
│   │   │   ├── components/    # wsx 组件
│   │   │   ├── types.ts       # 类型定义
│   │   │   └── index.ts       # 导出入口
│   │   └── package.json
│   └── editorjs-tool/     # Editor.js 工具插件
│       ├── src/
│       │   ├── QuizTool.ts   # Tool 实现
│       │   ├── config.ts      # 配置选项
│       │   └── index.ts
│       └── package.json
├── examples/              # 示例项目
└── README.md
```

## API 文档

### 核心组件

#### QuizBlock

主要的测验容器组件。

**Props:**
- `quizData: QuizData` - 测验数据
- `mode?: 'edit' | 'view' | 'result'` - 显示模式
- `userAnswers?: UserAnswer[]` - 用户答案列表
- `result?: QuizResult` - 测验结果
- `onSubmit?: (answers: UserAnswer[]) => void` - 提交回调
- `onAnswerChange?: (questionId: string, answer: string | string[]) => void` - 答案变化回调

#### QuizQuestion

单个问题组件。

**Props:**
- `question: Question` - 问题数据
- `userAnswer?: UserAnswer` - 用户答案
- `mode?: 'edit' | 'view' | 'result'` - 显示模式
- `disabled?: boolean` - 是否禁用
- `onAnswerChange?: (questionId: string, answer: string | string[]) => void` - 答案变化回调

### Editor.js 工具配置

```typescript
interface QuizToolConfig {
  defaultData?: Partial<QuizData>;
  defaultSettings?: QuizSettings;
  onSubmit?: (data: QuizData) => void;
  onAnswerChange?: (questionId: string, answer: string | string[]) => void;
  readOnly?: boolean;
  customStyles?: string;
}
```

## 开发

```bash
# 克隆仓库
git clone https://github.com/your-org/quizerjs.git
cd quizerjs

# 安装依赖
pnpm install

# 构建
pnpm build

# 开发模式
pnpm dev

# 运行测试
pnpm test

# 代码检查
pnpm lint
```

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

## 许可证

MIT License

## 相关项目

- [Editor.js](https://editorjs.io/) - 块样式编辑器
- [wsxjs](https://github.com/wsxjs/wsxjs) - Web Components 框架

## 作者

quizerjs 团队

