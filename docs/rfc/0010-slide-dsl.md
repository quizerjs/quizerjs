# RFC 0010: Slide DSL 规范

## 元数据
- **RFC ID**: 0010
- **标题**: Slide DSL - 通用幻灯片演示领域特定语言
- **状态**: 草稿
- **创建日期**: 2025-12-25
- **作者**: Claude Code
- **相关 RFC**: RFC 0006 (Player Core)

## 摘要

Slide DSL 是一个通用的领域特定语言（DSL），用于从任意数据源（Quiz、Survey、Form、Assessment 等）生成幻灯片演示。它通过 Context Adapter 模式实现数据源解耦，支持声明式规则引擎和嵌套循环，确保长期可扩展性。

## 动机

### 背景问题
1. **当前限制**: RFC 0006 的 Player 设计过度耦合 Quiz 数据结构
2. **可扩展性需求**: 需要支持 Quiz 以外的其他数据源（Survey、Form、Assessment 等）
3. **复用性要求**: 相同的幻灯片生成逻辑应该可以跨多种数据源复用

### 设计目标
1. **数据源无关**: DSL 不依赖于特定数据结构（Quiz、Survey 等）
2. **类型安全**: 完整的 TypeScript 类型系统支持
3. **声明式**: 使用规则引擎而非命令式代码
4. **可扩展**: 支持未来新增数据源类型而无需修改核心 DSL

## 详细设计

### 1. 架构概览

```
┌─────────────────┐
│   Data Source   │ (Quiz, Survey, Form, etc.)
│  (任意结构)     │
└────────┬────────┘
         │ transform()
         ▼
┌─────────────────┐
│ Context Adapter │ (quizToSlideContext, surveyToSlideContext, etc.)
│  实现 Context   │
│  接口转换       │
└────────┬────────┘
         │ SlideContext
         ▼
┌─────────────────┐
│   Slide DSL     │ (声明式规则)
│  + Slide Engine │
└────────┬────────┘
         │ generate()
         ▼
┌─────────────────┐
│ SlideDefinition │ (标准化幻灯片输出)
│     Array       │
└─────────────────┘
```

### 2. 核心概念

#### 2.1 SlideContext（上下文接口）

**定义位置**: `@slidejs/context`

所有数据源必须实现的统一接口：

```typescript
export interface SlideContext {
  sourceType: string;        // 数据源类型：'quiz', 'survey', 'form', etc.
  sourceId: string;          // 数据源唯一标识
  metadata: SlideMetadata;   // 元数据
  items: ContentItem[];      // 核心抽象：所有数据都提供"items"
  groups?: ContentGroup[];   // 可选：层级分组
  custom?: Record<string, unknown>; // 数据源特定扩展
}

export interface ContentItem {
  id: string;
  type: string;              // 由数据源定义（如 'question', 'input-field'）
  text: string;              // 主要内容文本
  title?: string;            // 可选标题
  metadata?: {               // 可选元数据
    tags?: string[];
    difficulty?: string;
    [key: string]: unknown;
  };
  data?: Record<string, unknown>; // 类型特定数据
}

export interface ContextAdapter<TSource = unknown> {
  readonly sourceType: string;
  transform(source: TSource): SlideContext;
}
```

**设计原则**:
- `items` 是核心抽象：所有数据源都必须能映射到"项目列表"
- `groups` 支持层级结构（如 Quiz 的 sections）
- `custom` 允许数据源特定扩展，保持灵活性

#### 2.2 SlideDSL（DSL 定义）

**定义位置**: `@slidejs/core`

```typescript
export interface SlideDSL<TContext extends SlideContext = SlideContext> {
  version: string;           // DSL 版本号
  sourceType: string;        // 支持的数据源类型
  sourceId: string;          // 目标数据源 ID
  rules: SlideRule<TContext>[]; // 规则列表
  config?: SlideConfig;      // 可选配置
}

export interface SlideRule<TContext extends SlideContext = SlideContext> {
  type: 'start' | 'content' | 'end'; // 规则类型
  name: string;              // 规则名称
  generate: (context: TContext) => SlideDefinition[]; // 生成函数
}

export interface SlideDefinition {
  id?: string;
  content: SlideContent;     // 幻灯片内容
  behavior?: SlideBehavior;  // 可选行为
  metadata?: Record<string, unknown>;
}

export type SlideContent = DynamicContent | StaticContent;

export interface DynamicContent {
  type: 'dynamic';
  component: string;         // Web Component 标签名
  props: Record<string, unknown>;
}

export interface StaticContent {
  type: 'text';
  lines: string[];
  format?: {
    markdown?: boolean;
    html?: boolean;
  };
}

export interface SlideBehavior {
  transition?: SlideTransition;
}

export interface SlideTransition {
  type: 'slide' | 'zoom' | 'fade' | 'cube' | 'flip' | 'none';
  speed?: 'slow' | 'default' | 'fast' | number; // 过渡速度（预设值或毫秒数）
  direction?: 'horizontal' | 'vertical';
  options?: Record<string, unknown>; // 自定义选项
}
```

### 3. Slide DSL 语法规范

#### 3.1 基础语法（使用 Peggy PEG 语法定义）

**语法文件位置**: `@slidejs/dsl/src/grammar.peggy`

```
present <sourceType> "<sourceId>" {
  rules {
    rule start "<name>" {
      // 起始幻灯片
    }

    rule content "<name>" {
      // 内容幻灯片（支持循环）
    }

    rule end "<name>" {
      // 结束幻灯片
    }
  }
}
```

#### 3.2 完整语法示例

**使用 `:` 分隔键值对**（更清晰的语法）：

```
present quiz "math-quiz" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "Welcome to Math Quiz!"
          "Test your math skills"
        }
        behavior {
          transition zoom {
            speed: "fast"
          }
        }
      }
    }

    rule content "questions" {
      for section in quiz.sections {
        slide {
          content text {
            "Section: " + section.title
          }
        }

        for question in section.questions {
          slide {
            content dynamic {
              name: "wsx-quiz-question"
              attrs {
                title: section.title
                question: question.text
                type: question.type
              }
            }
            behavior {
              transition slide {
                direction: "horizontal"
              }
            }
          }
        }
      }
    }

    rule end "thanks" {
      slide {
        content text {
          "Thank you for participating!"
          "Score: " + quiz.score
        }
        behavior {
          transition fade {}
        }
      }
    }
  }
}
```

#### 3.3 语法元素说明

**关键字**:
- `present`: 声明 DSL 文档
- `rules`: 规则块
- `rule`: 单个规则定义
- `start`, `content`, `end`: 规则类型
- `slide`: 幻灯片定义
- `content`: 内容定义
- `dynamic`, `text`: 内容类型
- `behavior`: 行为定义
- `transition`: 过渡效果
- `for`, `in`: 循环语句
- `name`, `attrs`: 动态内容属性

**表达式**:
- 字符串字面量: `"text"`
- 数字字面量: `500`
- 布尔字面量: `true`, `false`
- 成员访问: `quiz.sections`, `section.title`
- 二元运算: `"Section: " + section.title`

**属性语法**:
- 使用 `:` 分隔键值对
- 格式: `key: value`
- 示例: `speed: 500`, `speed: "fast"`, `title: section.title`

### 4. 编译流程

#### 4.1 解析（Parsing）

使用 Peggy 将 DSL 文本解析为 AST：

```typescript
// @slidejs/dsl/src/parser.ts
import { parse } from './generated/parser.js';
import type { PresentationNode } from './ast';

export async function parseSlideDSL(source: string): Promise<PresentationNode> {
  try {
    return parse(source) as PresentationNode;
  } catch (error) {
    throw new ParseError(`Failed to parse Slide DSL: ${error.message}`);
  }
}
```

#### 4.2 编译（Compilation）

将 AST 编译为可执行的 SlideDSL 对象：

```typescript
// @slidejs/dsl/src/compiler.ts
export function compile<TContext extends SlideContext = SlideContext>(
  ast: PresentationNode
): SlideDSL<TContext> {
  const rules: SlideRule<TContext>[] = ast.rules.map(ruleNode =>
    compileRule(ruleNode)
  );

  return {
    version: ast.version,
    sourceType: ast.sourceType,
    sourceId: ast.sourceId,
    rules,
  };
}

function compileRule<TContext extends SlideContext = SlideContext>(
  node: RuleNode
): SlideRule<TContext> {
  return {
    type: node.ruleType,
    name: node.name,
    generate: (context: TContext) => {
      if (node.slides) {
        return node.slides.map(slideNode => compileSlide(slideNode, context));
      } else if (node.body) {
        return compileRuleBody(node.body, context);
      }
      return [];
    },
  };
}
```

#### 4.3 执行（Execution）

使用 SlideEngine 生成幻灯片：

```typescript
// @slidejs/core/src/engine.ts
export class SlideEngine<TContext extends SlideContext = SlideContext> {
  constructor(private dsl: SlideDSL<TContext>) {
    this.validateDSL();
  }

  generate(context: TContext): SlideDefinition[] {
    if (context.sourceType !== this.dsl.sourceType) {
      throw new SlideEngineError(
        `Context sourceType "${context.sourceType}" does not match DSL sourceType "${this.dsl.sourceType}"`
      );
    }

    const slides: SlideDefinition[] = [];
    const rules = this.dsl.rules;

    // 按顺序执行规则：start → content → end
    const startRules = rules.filter(r => r.type === 'start');
    const contentRules = rules.filter(r => r.type === 'content');
    const endRules = rules.filter(r => r.type === 'end');

    for (const rule of startRules) {
      slides.push(...rule.generate(context));
    }

    for (const rule of contentRules) {
      slides.push(...rule.generate(context));
    }

    for (const rule of endRules) {
      slides.push(...rule.generate(context));
    }

    return slides;
  }
}
```

### 5. 包结构

#### 5.1 @slidejs/context

**职责**: 定义 SlideContext 接口和 Adapter 模式

```
packages/@slidejs/context/
├── src/
│   ├── types.ts           # SlideContext, ContentItem, ContextAdapter
│   └── index.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**依赖**: 无（纯类型定义）

#### 5.2 @slidejs/core

**职责**: SlideDSL 类型定义和 SlideEngine 执行引擎

```
packages/@slidejs/core/
├── src/
│   ├── types.ts           # SlideDSL, SlideRule, SlideDefinition
│   ├── engine.ts          # SlideEngine 类
│   ├── errors.ts          # 错误类定义
│   └── index.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**依赖**: `@slidejs/context`

#### 5.3 @slidejs/dsl

**职责**: DSL 解析器、编译器和验证器

```
packages/@slidejs/dsl/
├── src/
│   ├── grammar.peggy      # Peggy 语法定义
│   ├── generated/
│   │   └── parser.js      # Peggy 生成的解析器
│   ├── ast.ts             # AST 类型定义
│   ├── parser.ts          # 解析器封装
│   ├── compiler.ts        # AST → SlideDSL 编译器
│   ├── errors.ts          # 错误类定义
│   └── index.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**依赖**: `@slidejs/core`, `@slidejs/context`, `peggy`

### 6. 与 @quizerjs 的集成

#### 6.1 Quiz Context Adapter

**实现位置**: `@quizerjs/dsl/src/slide-context.ts`

```typescript
import type { QuizData } from './types';
import type { SlideContext, ContentItem, ContextAdapter } from '@slidejs/context';

export class QuizSlideContextAdapter implements ContextAdapter<QuizData> {
  readonly sourceType = 'quiz';

  transform(quiz: QuizData): SlideContext {
    // 将 Quiz sections/questions 转换为 ContentItem[]
    const items: ContentItem[] = [];

    for (const section of quiz.sections) {
      for (const question of section.questions) {
        items.push({
          id: question.id,
          type: question.type,
          text: question.question,
          title: section.title,
          metadata: {
            tags: question.metadata?.tags,
            difficulty: question.metadata?.difficulty,
          },
          data: {
            options: question.options,
            correctAnswer: question.correctAnswer,
          },
        });
      }
    }

    return {
      sourceType: 'quiz',
      sourceId: quiz.metadata.id,
      metadata: {
        title: quiz.metadata.title,
        description: quiz.metadata.description,
        version: quiz.metadata.version,
      },
      items,
      groups: quiz.sections.map(section => ({
        id: section.id,
        title: section.title,
        description: section.description,
        items: section.questions.map(q => ({
          id: q.id,
          type: q.type,
          text: q.question,
          title: section.title,
          metadata: {
            tags: q.metadata?.tags,
            difficulty: q.metadata?.difficulty,
          },
          data: {
            options: q.options,
            correctAnswer: q.correctAnswer,
          },
        })),
        metadata: section.metadata,
      })),
      custom: {
        quiz, // 保留原始 Quiz 数据
      },
    };
  }
}

export function quizToSlideContext(quiz: QuizData): SlideContext {
  const adapter = new QuizSlideContextAdapter();
  return adapter.transform(quiz);
}
```

#### 6.2 使用示例

```typescript
import { parseSlideDSL, compile } from '@slidejs/dsl';
import { SlideEngine } from '@slidejs/core';
import { quizToSlideContext } from '@quizerjs/dsl';
import type { QuizData } from '@quizerjs/dsl';

// 1. 加载 Quiz 数据
const quiz: QuizData = { /* ... */ };

// 2. 转换为 SlideContext
const context = quizToSlideContext(quiz);

// 3. 解析 DSL
const dslSource = `
present quiz "${quiz.metadata.id}" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "Welcome to " + quiz.title
        }
      }
    }

    rule content "questions" {
      for section in quiz.sections {
        for question in section.questions {
          slide {
            content dynamic {
              name: "wsx-quiz-question"
              attrs {
                question: question.text
                options: question.options
              }
            }
          }
        }
      }
    }
  }
}
`;

const ast = await parseSlideDSL(dslSource);

// 4. 编译为 SlideDSL
const slideDSL = compile(ast);

// 5. 生成幻灯片
const engine = new SlideEngine(slideDSL);
const slides = engine.generate(context);

// 6. 使用幻灯片
console.log(`Generated ${slides.length} slides`);
```

## 实施计划

### Phase 1: 核心基础设施 ✅
- [x] 创建 `@slidejs/context` 包
- [x] 创建 `@slidejs/core` 包
- [x] 创建 `@slidejs/dsl` 包
- [x] 实现 Peggy 语法解析器
- [ ] 修复语法解析错误（使用 `:` 语法）

### Phase 2: 测试与验证
- [ ] 完成 `@slidejs/dsl` 单元测试
- [ ] 完成 `@slidejs/core` SlideEngine 测试
- [ ] 集成测试：Quiz → SlideContext → Slides

### Phase 3: Quiz 集成
- [ ] 实现 `@quizerjs/dsl` 的 QuizSlideContextAdapter
- [ ] 更新 `@quizerjs/player` 使用 SlideEngine
- [ ] 迁移现有 Quiz DSL 到 Slide DSL

### Phase 4: 文档与示例
- [ ] 编写 Slide DSL 完整文档
- [ ] 创建示例项目
- [ ] 编写最佳实践指南

## 风险评估

### 技术风险
1. **Peggy 语法复杂性**:
   - 风险等级: 中
   - 缓解: 使用简化的 `:` 语法，逐步增加特性

2. **类型安全挑战**:
   - 风险等级: 中
   - 缓解: 使用 TypeScript 泛型确保编译时类型安全

3. **性能问题**:
   - 风险等级: 低
   - 缓解: DSL 编译是一次性操作，运行时性能由 SlideEngine 优化

### 迁移风险
1. **现有 Quiz DSL 兼容性**:
   - 风险等级: 高
   - 缓解: 提供自动迁移工具，保持向后兼容

## 替代方案

### 方案 A: 继续使用 Quiz 特定 DSL
- **优点**: 无需重构，短期开发成本低
- **缺点**: 无法扩展到其他数据源，长期维护成本高

### 方案 B: 使用现有 DSL 框架（如 Xstate, SCXML）
- **优点**: 成熟的生态系统
- **缺点**: 过度复杂，不符合我们的特定需求

### 方案 C: JSON 配置（不使用 DSL）
- **优点**: 简单，无需解析器
- **缺点**: 缺乏表达能力，难以处理循环和条件逻辑

**选择**: 我们选择自定义 Slide DSL（本 RFC），因为：
1. 完全控制语法和特性
2. 符合我们的特定需求（循环、表达式、组件化）
3. 类型安全和可扩展性

## 未解决问题

1. **条件逻辑**: 是否需要支持 `if`/`else` 语句？
2. **变量定义**: 是否需要 `let` 或 `const` 关键字？
3. **函数定义**: 是否需要支持自定义函数？
4. **模块化**: 是否需要 `import` 其他 DSL 文件？

这些问题将在实施过程中根据实际需求决定。

## 代码审查与实现状态

### 实现状态

#### ✅ 已实现的核心功能

1. **架构设计** ✅
   - `@slidejs/context`: Context 接口定义完整
   - `@slidejs/core`: SlideDSL 类型和 SlideEngine 实现完整
   - `@slidejs/dsl`: 解析器和编译器实现完整

2. **语法规范** ✅
   - Peggy 语法文件 (`grammar.peggy`) 正确实现了 RFC 中定义的语法
   - 使用 `:` 分隔键值对的语法已实现
   - 支持 `for` 循环和嵌套循环

3. **类型系统** ✅
   - TypeScript 类型定义完整
   - AST 节点类型与 RFC 规范一致
   - 泛型支持确保类型安全

### 代码质量

#### ✅ 优点

1. **类型安全**: 完整的 TypeScript 类型定义，泛型使用恰当
2. **错误处理**: 定义了专门的错误类（`ParseError`, `CompileError`, `SlideEngineError`）
3. **模块化**: 清晰的包结构，职责分离明确
4. **测试覆盖**: 基础测试用例通过，覆盖了主要功能

#### ⚠️ 需要改进的地方

1. **表达式求值的错误处理**: 当访问不存在的属性时，错误信息可以更清晰
2. **For 循环中的上下文扩展**: 使用类型断言，可考虑更安全的扩展方式
3. **输入验证**: 添加对空字符串、null 等的基本验证

### 测试覆盖

#### ✅ 已覆盖

1. ✅ 基础 DSL 解析和编译
2. ✅ For 循环功能
3. ✅ 三种规则类型（start, content, end）
4. ✅ 错误场景测试（语法错误、类型错误、表达式求值错误）
5. ✅ 边界情况测试（空规则列表、空循环集合、嵌套循环）

#### ⚠️ 待补充

1. **集成测试**: 完整的 Quiz → Context → Slides 流程
2. **复杂 DSL 文件解析**: 大型 DSL 文件的性能测试

### 文档一致性

**已修复的不一致问题**:

1. ✅ `ContentGroup` 示例代码已更新为使用 `title` 和 `items`
2. ✅ `SlideTransition` 已统一使用 `speed` 而不是 `duration`
3. ✅ 示例代码中的语法错误已修正
4. ✅ `StaticContent` 的 `format` 选项已在类型定义中说明

## 参考资料

- [Peggy 文档](https://peggyjs.org/)
- [Web Components 标准](https://www.webcomponents.org/)
- [领域特定语言设计模式](https://martinfowler.com/books/dsl.html)
- RFC 0006: Player Core

## 变更历史

- 2025-12-25: 初始草稿
- 2025-12-25: 语法更新为使用 `:` 分隔键值对
- 2025-12-25: 代码审查，修复文档不一致问题，整合审查报告
