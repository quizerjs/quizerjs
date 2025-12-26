# @slidejs/dsl

Slide DSL 语法解析器和编译器。

## 特性

- 基于 [Peggy](https://peggyjs.org/) 的语法解析器
- 类型安全的 AST 定义
- 支持表达式计算和 for 循环
- 完整的错误处理

## 使用示例

### 解析 DSL

```typescript
import { parseSlideDSL } from '@slidejs/dsl';

const source = `
present quiz "my-quiz" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "Welcome to the quiz!"
        }
        behavior {
          transition zoom {
            duration 500
          }
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
                title: section.title
                question: question.text
              }
            }
          }
        }
      }
    }

    rule end "thanks" {
      slide {
        content text {
          "Thank you!"
        }
      }
    }
  }
}
`;

const ast = await parseSlideDSL(source);
console.log(ast);
```

### 编译为可执行的 SlideDSL

```typescript
import { compile } from '@slidejs/dsl';
import { SlideEngine } from '@slidejs/core';
import { quizToSlideContext } from '@quizerjs/dsl';

// 解析 DSL
const ast = await parseSlideDSL(source);

// 编译为 SlideDSL 对象
const slideDSL = compile(ast);

// 创建 Context
const context = quizToSlideContext(quizDSL);

// 生成 Slides
const engine = new SlideEngine(slideDSL);
const slides = engine.generate(context);
```

## 语法参考

### Presentation

```
present <type> "<name>" {
  rules {
    // 规则定义
  }
}
```

### Rules

```
rule start "<name>" {
  // slides
}

rule content "<name>" {
  // for 循环或 slides
}

rule end "<name>" {
  // slides
}
```

### Slide

```
slide {
  content <type> {
    // 内容
  }
  behavior {
    // 行为
  }
}
```

### Content

```
// 动态内容（组件）
content dynamic {
  name: "<component-name>"
  attrs {
    key: value
  }
}

// 静态文本
content text {
  "line 1"
  "line 2"
}
```

### Behavior

```
behavior {
  transition <type> {
    option: value
  }
}
```

### For Loop

```
for item in collection {
  // slides
}

// 嵌套 for 循环
for outer in collection1 {
  for inner in outer.collection2 {
    // slides
  }
}
```

## 开发

### 生成 Parser

```bash
pnpm generate:parser
```

### 构建

```bash
pnpm build
```

### 测试

```bash
pnpm test
```

## License

MIT
