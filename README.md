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
│   ├── editorjs-tool/     # Editor.js 工具插件
│   │   ├── src/
│   │   │   ├── QuizTool.ts   # Tool 实现
│   │   │   ├── config.ts      # 配置选项
│   │   │   └── index.ts
│   │   └── package.json
│   ├── dsl/              # DSL 解析器和验证器
│   ├── theme/            # 主题系统
│   └── ...               # 其他包
├── demos/                # 演示项目
│   ├── vue/              # Vue 3 演示
│   ├── react/            # React 演示
│   ├── svelte/           # Svelte 演示
│   └── vanilla/          # Vanilla JS 演示
├── site/                  # QuizerJS 开源网站
│   ├── src/
│   │   ├── components/   # wsx 组件
│   │   ├── router/       # 路由配置
│   │   └── App.wsx       # 根组件
│   └── package.json
├── docs/                 # 文档
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

## 文档

- [DSL 规范文档](./docs/DSL.md) - Quiz DSL 完整规范
- [DSL API 参考](./docs/DSL-API.md) - API 详细文档
- [RFC 文档](./docs/rfc/) - 技术规范和架构设计
- [网站设计文档](./docs/rfc/0009-quizerjs-com-website.md) - QuizerJS 开源网站设计规范

### 在线资源

- **官方网站**: [quizerjs.io](https://quizerjs.io) (建设中)
- **GitHub 仓库**: [github.com/quizerjs/quizerjs](https://github.com/quizerjs/quizerjs)

## 开发

```bash
# 克隆仓库
git clone https://github.com/your-org/quizerjs.git
cd quizerjs

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式（交互式菜单）
pnpm dev

# 运行测试
pnpm test

# 代码检查
pnpm lint
```

### 开发特定项目

```bash
# 开发演示项目
pnpm dev:vue        # Vue 3 演示
pnpm dev:react      # React 演示
pnpm dev:svelte     # Svelte 演示
pnpm dev:vanilla    # Vanilla JS 演示
pnpm dev:theme      # 主题系统预览

# 开发网站
pnpm site
# 或
pnpm dev:site

# 构建网站
pnpm build:site

# 预览构建结果
pnpm preview:site

# 网站相关命令
pnpm site:typecheck    # 类型检查
pnpm site:lint        # 代码检查
pnpm site:lint:fix     # 自动修复
pnpm site:test        # 运行测试
```

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

## 许可证

### 开源许可证
本项目采用 **MIT License**，允许自由使用、修改和分发，包括商业用途。

### 企业许可证
对于企业客户，我们提供商业许可证选项，包括：
- ✅ 商业法律保护（无 MIT 免责声明）
- ✅ 优先技术支持
- ✅ SLA（服务级别协议）
- ✅ 定制开发服务
- ✅ 白标/品牌定制

**了解更多**: 查看 [企业许可证文档](./docs/ENTERPRISE-LICENSE.md) 或联系 [enterprise@quizerjs.io](mailto:enterprise@quizerjs.io)

### 许可证兼容性
✅ **所有依赖库均使用 MIT 或 Apache 2.0 许可证，完全兼容企业使用，无许可证冲突。**

## 相关项目

- [Editor.js](https://editorjs.io/) - 块样式编辑器
- [wsxjs](https://github.com/wsxjs/wsxjs) - Web Components 框架

## 作者

quizerjs 团队

