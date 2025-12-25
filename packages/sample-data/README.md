# @quizerjs/sample-data

QuizerJS 示例数据包 - 为所有 demo 项目提供共享的测试数据

## 概述

这个包包含了用于测试和演示 QuizerJS 功能的示例测验数据。所有 demo 项目（React、Vue、Svelte、Vanilla）都可以使用这个包来加载和切换不同的示例数据。

## 安装

```bash
pnpm add @quizerjs/sample-data
```

## 使用方法

### 基本用法

```typescript
import { sampleDataList, defaultSampleDataId, getSampleDataById } from '@quizerjs/sample-data';

// 获取所有示例数据列表
console.log(sampleDataList);
// [
//   { id: 'spelling-quiz', name: 'Spelling Quiz', description: '...', dsl: {...} },
//   { id: 'beat-earn-lose-win-quiz', name: 'Beat, Earn, Lose & Win', description: '...', dsl: {...} }
// ]

// 根据 ID 获取示例数据
const dsl = getSampleDataById('spelling-quiz');

// 使用默认示例数据 ID
const defaultDSL = getSampleDataById(defaultSampleDataId);
```

### 直接导入特定示例数据

```typescript
import { spellingQuizDSL } from '@quizerjs/sample-data/spelling-quiz';
import { beatEarnLoseWinQuizDSL } from '@quizerjs/sample-data/beat-earn-lose-win-quiz';
```

## 可用的示例数据

### 1. Spelling Quiz (拼写测验)

- **ID**: `spelling-quiz`
- **来源**: https://www.usingenglish.com/quizzes/33.html
- **类型**: 拼写选择题
- **题目数量**: 33 道
- **描述**: 包含33道拼写选择题，涵盖常见的英语拼写错误

### 2. Beat, Earn, Lose & Win

- **ID**: `beat-earn-lose-win-quiz`
- **来源**: https://www.usingenglish.com/quizzes/277.html
- **类型**: 动词选择题
- **题目数量**: 10 道
- **描述**: 关于动词 beat, earn, lose, win 的选择题测验

## API

### `sampleDataList`

所有可用的示例数据列表。

```typescript
interface SampleDataItem {
  id: string;
  name: string;
  description: string;
  dsl: QuizDSL;
}
```

### `getSampleDataById(id: string): QuizDSL | undefined`

根据 ID 获取示例数据的 DSL。

### `defaultSampleDataId`

默认示例数据 ID（`'spelling-quiz'`）。

## 注意事项

- 此测试数据仅用于开发和测试目的
- 原始测验版权归 UsingEnglish.com 所有
- 在使用时请遵守相关版权规定
