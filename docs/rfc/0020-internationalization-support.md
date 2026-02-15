# RFC 0020: 核心库国际化 (I18n) 架构设计规范

**状态**: 设计中（L10nService 方案待审批）

---

## 1. 现状评估

`@quizerjs/core` 中直接写死中文字符串（`'默认章节'`、`'提交答案'`、`'测验结果'` 等）。这在工程上不可接受：

1. **强制语言**：非中文开发者生成的数据中会出现无法消除的中文。
2. **难以扩展**：多语言支持不可能通过 `if-else` 实现。
3. **违反 RFC-0021**：禁止硬编码"发明"数据。

---

## 2. 核心设计

### 2.1 本地化接口 (`QuizLocalization`)

定义在 `@quizerjs/core/src/types.ts`。规定系统需要哪些文案，但具体内容由外部注入。

| 区域      | 字段数 | 覆盖范围                                                     |
| --------- | ------ | ------------------------------------------------------------ |
| `quiz`    | 1      | 测验默认标题                                                 |
| `section` | 1      | 章节默认标题                                                 |
| `player`  | 27     | 提交按钮、结果页、得分展示、统计标签、表单提示等全部 UI 文案 |

### 2.2 独立预设包 (`@quizerjs/i18n`)

依赖方向：`i18n → core`。当前支持 7 种语言：

`zhCN` · `enUS` · `jaJP` · `koKR` · `esES` · `deDE` · `frFR`

### 2.3 注入机制：`L10nService`（全局服务模式）

> [!IMPORTANT]
> 这是需要审批的新设计。采用**服务单例**模式，而非通过 props/attributes 逐层透传。

#### 设计原则

- **顶层配置一次，全局消费** — 类似于已有的 `QuizStore` 注册表模式。
- **组件不需要接收 localization 属性** — 内部直接从服务读取。
- **避免 prop drilling** — 不通过 `attribute` 层层传递翻译对象。

#### API 设计

```typescript
// core/src/l10n.ts — 模块级单例

class L10nServiceImpl {
  private _localization: QuizLocalization = EMPTY_LOCALIZATION;

  /** 顶层配置一次 */
  configure(localization: QuizLocalization): void;

  /** 组件内部读取 */
  get t(): QuizLocalization;

  /** 模板替换工具 */
  fmt(template: string, vars: Record<string, string | number>): string;
}

export const L10nService = new L10nServiceImpl();
```

#### 数据流

```
用户代码
  └── new QuizEditor({ localization: zhCN }) 或
      new QuizPlayer({ localization: zhCN })
        └── init() 内部调用 L10nService.configure(zhCN)
              └── 全局生效，组件直接消费

组件内部：
  const t = L10nService.t;
  t.player.submitButton;  // => '提交答案'
  L10nService.fmt(t.player.questionNumberTemplate, { n: 3 });  // => '第 3 题'
```

#### 对比 Props 方案

| 维度               | Props 透传                   | L10nService 服务       |
| ------------------ | ---------------------------- | ---------------------- |
| 复杂度             | 每个组件需要接收、解析、传递 | 配置一次，组件自动消费 |
| Web Component 兼容 | 需要序列化 JSON 到 attribute | 不需要                 |
| 运行时开销         | 每次渲染通过 attribute 传递  | 单例读取，零开销       |
| 可测试性           | 需要 mock props              | `L10nService.reset()`  |

#### 限制

- 同页面只支持一套语言（单例）。如需多语言并存，需要改为 context/scope 模式。
- 如果没有调用 `configure()`，所有字符串返回空字符串并打一次 `console.warn`。

---

## 3. 实施准则

1. **禁止硬编码回退**：缺少配置时使用空字符串，绝不在 `packages/core` 源码中出现自然语言字符串。
2. **注释例外**：JSDoc 注释中的中文不算硬编码。
3. **测试数据例外**：`packages/sample-data` 中的中文是内容数据，不是 UI 字符串。

---

## 4. 实施状态

| 层                             | 状态                  | 说明                             |
| ------------------------------ | --------------------- | -------------------------------- |
| 接口定义 (`core/types.ts`)     | ✅ 完成               | 30+ 字段                         |
| L10nService (`core/l10n.ts`)   | ✅ 已创建             | 待审批后继续接入                 |
| Transformer                    | ✅ 完成               | 零硬编码                         |
| i18n 预设包                    | ✅ 完成               | 7 语言                           |
| `quiz-results.wsx`             | 🔄 已接入 L10nService | 待审批确认                       |
| `quiz-submit.wsx`              | 🔄 已接入 L10nService | 待审批确认                       |
| `defaultSlideSource.ts`        | 🔲 待实施             | 2 个硬编码                       |
| QuizEditor/QuizPlayer `init()` | 🔲 待实施             | 需调用 `L10nService.configure()` |
| `editorjs-tool` toolbox 标题   | 🔲 待实施             | 4 个（需 Editor.js API）         |
