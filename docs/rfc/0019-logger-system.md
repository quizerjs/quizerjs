# RFC 0019: QuizJS 日志系统 (Linus 风格)

## 状态

- **状态**: 已提议 (Proposed)
- **作者**: QuizJS 核心团队
- **日期**: 2026-02-07
- **优先级**: P0 (Critical)
- **风格**: KISS (Keep It Simple, Stupid)

---

## Linus 的原则

> "Talk is cheap. Show me the code."  
> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."

**核心思想**：

1. **简单** - 不要过度设计
2. **实用** - 解决实际问题
3. **零开销** - 默认情况下零成本
4. **清晰** - API 一目了然

---

## 设计

### 1. 最简单的类型

```typescript
// packages/quizerjs/src/logger/types.ts

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

export interface LogFn {
  (message: string, data?: unknown): void;
}

export interface Logger {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}
```

### 2. 最简单的实现

```typescript
// packages/quizerjs/src/logger/index.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';
type LogFn = (message: string, data?: unknown) => void;

interface Logger {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

// 全局配置
let currentLevel: LogLevel = 'warn';
let customLogger: Logger | null = null;

// 级别映射
const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

// 默认 logger（直接用 console）
const defaultLogger: Logger = {
  debug: (msg, data) => console.debug(msg, data),
  info: (msg, data) => console.info(msg, data),
  warn: (msg, data) => console.warn(msg, data),
  error: (msg, data) => console.error(msg, data),
};

// 空 logger（什么都不做）
const noop = () => {};
const noopLogger: Logger = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};

// 创建模块 logger
function createLogger(module: string): Logger {
  const prefix = `[QuizJS:${module}]`;

  return {
    debug: (msg, data) => {
      if (levels.debug >= levels[currentLevel]) {
        (customLogger || defaultLogger).debug(`${prefix} ${msg}`, data);
      }
    },
    info: (msg, data) => {
      if (levels.info >= levels[currentLevel]) {
        (customLogger || defaultLogger).info(`${prefix} ${msg}`, data);
      }
    },
    warn: (msg, data) => {
      if (levels.warn >= levels[currentLevel]) {
        (customLogger || defaultLogger).warn(`${prefix} ${msg}`, data);
      }
    },
    error: (msg, data) => {
      if (levels.error >= levels[currentLevel]) {
        (customLogger || defaultLogger).error(`${prefix} ${msg}`, data);
      }
    },
  };
}

// 配置函数
export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function setLogger(logger: Logger | null): void {
  customLogger = logger;
}

// 导出
export { createLogger };
export type { Logger, LogLevel, LogFn };
```

**就这么简单！总共不到 80 行代码。**

---

## 使用方式

### 在 QuizEditor 中

```typescript
// packages/quizerjs/src/editor/QuizEditor.ts
import { createLogger } from '../logger';

const log = createLogger('editor');

export class QuizEditor {
  async init(): Promise<void> {
    log.debug('开始初始化');

    const existingInstance = editorRegistry.get(this.container);
    if (existingInstance) {
      log.warn('检测到旧实例，自动销毁', { containerId: this.container.id });
      await existingInstance.destroy();
    }

    log.debug('初始化完成');
  }

  async destroy(): Promise<void> {
    log.debug('销毁编辑器');
    // ...
  }
}
```

### 在 QuizPlayer 中

```typescript
// packages/quizerjs/src/player/QuizPlayer.ts
import { createLogger } from '../logger';

const log = createLogger('player');

export class QuizPlayer {
  async init(): Promise<void> {
    log.info('初始化播放器', { quizId: this.quizSource.quiz.id });
    // ...
  }
}
```

---

## 用户配置

### 1. 设置日志级别

```typescript
import { setLogLevel } from '@quizerjs/quizerjs';

// 禁用所有日志
setLogLevel('none');

// 只显示错误
setLogLevel('error');

// 显示所有日志（开发环境）
setLogLevel('debug');
```

### 2. 自定义 Logger（集成 Sentry）

```typescript
import { setLogger } from '@quizerjs/quizerjs';
import * as Sentry from '@sentry/browser';

setLogger({
  debug: () => {}, // 忽略 debug
  info: () => {}, // 忽略 info
  warn: (msg, data) => {
    Sentry.captureMessage(msg, { level: 'warning', extra: data });
  },
  error: (msg, data) => {
    Sentry.captureException(new Error(msg), { extra: data });
  },
});
```

### 3. 开发/生产环境

```typescript
import { setLogLevel } from '@quizerjs/quizerjs';

if (import.meta.env.DEV) {
  setLogLevel('debug');
} else {
  setLogLevel('none');
}
```

---

## 为什么这样设计？

### ✅ 简单

- 不到 80 行代码
- 没有复杂的类层次
- 没有中间件、handler 数组等复杂概念

### ✅ 零开销

- 如果设置 `level: 'none'`，所有日志调用都是 noop
- 没有额外的对象创建
- 没有复杂的条件判断

### ✅ 实用

- 解决实际问题：控制日志、集成监控
- 不解决不存在的问题：不需要复杂的过滤、中间件等

### ✅ 清晰

```typescript
// API 一目了然
setLogLevel('error');
setLogger(myLogger);
```

---

## 导出 API

```typescript
// packages/quizerjs/src/index.ts
export { setLogLevel, setLogger, type Logger, type LogLevel, type LogFn } from './logger';
```

---

## 对比

### ❌ 之前的设计（过度设计）

```typescript
// 太复杂了！
const sentryHandler: LogHandler = entry => {
  if (entry.level >= LogLevel.ERROR) {
    Sentry.captureException(new Error(entry.message), {
      extra: entry.data,
      tags: { module: entry.module, context: entry.context },
    });
  }
};

configureLogger({
  level: LogLevel.WARN,
  handlers: [sentryHandler],
  moduleFilters: ['editor'],
});
```

### ✅ 现在（简单）

```typescript
// 简单明了！
setLogger({
  debug: noop,
  info: noop,
  warn: (msg, data) => Sentry.captureMessage(msg, { level: 'warning', extra: data }),
  error: (msg, data) => Sentry.captureException(new Error(msg), { extra: data }),
});
```

---

## Linus 会说

> "这才对！不到 80 行代码，解决了问题，没有过度设计。  
> 如果你需要更复杂的功能，自己在 `setLogger()` 里实现。  
> 框架不应该试图解决所有问题。"

---

## 实施计划

### Phase 1: 实现 (1 小时)

- [ ] 创建 `src/logger/index.ts` (80 行)
- [ ] 导出 API

### Phase 2: 替换 (2 小时)

- [ ] QuizEditor: 替换所有 console
- [ ] QuizPlayer: 替换所有 console

### Phase 3: 测试 (1 小时)

- [ ] 验证默认行为
- [ ] 验证 setLogLevel
- [ ] 验证 setLogger

**总计：4 小时，完成！**

---

## 总结

**Linus 的智慧**：

- 不要过度设计
- 解决实际问题
- 保持简单
- 代码胜于雄辩

这个设计：

- ✅ 不到 80 行代码
- ✅ 零依赖
- ✅ 零开销（level: 'none' 时）
- ✅ 满足所有需求
- ✅ 清晰的 API

**Talk is cheap. Show me the code.** ✅
