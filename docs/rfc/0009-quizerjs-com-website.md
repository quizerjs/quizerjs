# RFC 0009: quizerjs.com 开源网站设计

**状态**: 草案 (Draft)  
**创建日期**: 2025-12-14  
**作者**: quizerjs 团队

## 摘要

本文档描述了 quizerjs.com 开源网站的架构设计。该网站将使用 wsx (类似 JSX/TSX 的语法，用于编写 Web Components) 构建，部署在 GitHub Pages 上，作为 quizerjs 项目的官方开源网站，提供完整的开源项目展示、文档、演示和 Playground 功能。

**项目位置**: 网站项目将作为独立的项目放在 `site/` 目录下，与 `demos/` 和 `packages/` 平级，是 monorepo 中的一个独立工作空间。

## 动机

### 为什么需要 quizerjs.com？

1. **统一的开源项目展示平台**
   - 提供专业的项目首页，展示项目价值
   - 统一的品牌形象和用户体验
   - 符合现代开源项目的标准实践

2. **完整的开源网站功能**
   - 项目介绍和特性展示
   - 完整的文档系统
   - 交互式演示和 Playground
   - 社区和贡献指南
   - 下载和安装指南

3. **技术栈一致性**
   - 使用 wsx (类似 JSX/TSX 的语法，用于编写 Web Components) 构建，与核心组件库技术栈一致
   - 展示 wsx 在实际项目中的应用
   - 作为 wsx Web Components 的最佳实践示例

4. **Playground 集成**
   - 集成所有 demo 应用（React、Vue、Svelte、Vanilla）
   - 通过预构建链接打开各个 demo 作为 Playground
   - 提供统一的演示体验

## 目标

### 核心目标

1. **专业开源网站**
   - 符合现代开源项目的网站标准
   - 提供完整的项目信息和使用指南
   - 优秀的用户体验和性能

2. **技术展示**
   - 展示 wsx (类似 JSX/TSX 的语法，用于编写 Web Components) 的能力
   - 展示 quizerjs 的核心功能
   - 提供可运行的代码示例

3. **Playground 集成**
   - 无缝集成所有 demo 应用
   - 通过预构建链接打开 demo
   - 支持主题切换和数据加载

### 非目标

- 不替代现有的文档系统（docs/）
- 不实现完整的在线代码编辑器（使用预构建 demo）
- 不实现用户认证和云存储功能

## 网站结构

### 页面路由

```
quizerjs.com/
├── /                    # 首页 (Home)
├── /features            # 功能特性 (Features)
├── /docs                # 文档 (Documentation)
│   ├── /getting-started # 快速开始
│   ├── /api             # API 文档
│   ├── /dsl             # DSL 规范
│   └── /examples        # 示例
├── /demos               # 演示集合 (Demos)
│   ├── /editor          # 编辑器演示
│   ├── /player          # 播放器演示
│   └── /playground      # Playground
│       ├── /react       # React Demo
│       ├── /vue         # Vue Demo
│       ├── /svelte      # Svelte Demo
│       └── /vanilla     # Vanilla Demo
├── /examples            # 代码示例 (Code Examples)
├── /community           # 社区 (Community)
│   ├── /contributing    # 贡献指南
│   ├── /code-of-conduct # 行为准则
│   └── /changelog       # 更新日志
└── /about               # 关于 (About)
```

### 页面设计

#### 首页 (/)

**功能**:
- Hero 区域：项目标题、简介和 CTA 按钮
- 核心特性展示：卡片式布局展示主要功能
- 快速开始：代码示例和安装指南
- 演示预览：嵌入关键演示
- 社区统计：GitHub Stars、下载量等
- 导航链接：快速访问其他页面

**内容**:
- 项目介绍和定位
- 核心价值主张
- 快速开始代码示例
- 特性亮点（3-5 个）
- 社区链接（GitHub、Discord 等）

#### 功能特性 (/features)

**功能**:
- 详细的功能列表
- 每个功能的说明和示例
- 技术优势展示
- 对比表格（与其他方案对比）

**内容**:
- Editor.js 集成
- 多种题型支持
- DSL 规范
- 主题系统
- 框架集成（React、Vue、Svelte）
- 类型安全
- 可扩展性

#### 文档 (/docs)

**功能**:
- 完整的文档导航
- 搜索功能
- 代码示例高亮
- 交互式示例

**内容**:
- 快速开始指南
- API 参考文档
- DSL 规范文档
- 使用示例
- 最佳实践
- 故障排除

#### 演示集合 (/demos)

**功能**:
- 编辑器演示页面
- 播放器演示页面
- Playground 页面（集成所有 demo）

**编辑器演示**:
- 完整的编辑器界面
- 实时 DSL 预览
- 示例数据加载
- 导出功能

**播放器演示**:
- 完整的播放器界面
- 多种题型展示
- 答题交互
- 结果展示

**Playground**:
- Demo 选择器（React、Vue、Svelte、Vanilla）
- 通过 iframe 或新窗口打开预构建 demo
- 主题切换（同步到 demo）
- 示例数据选择（同步到 demo）

#### 代码示例 (/examples)

**功能**:
- 分类的代码示例
- 可运行的代码片段
- 复制代码功能
- 在线预览

**示例类型**:
- 基础用法
- React 集成
- Vue 集成
- Svelte 集成
- 自定义样式
- 高级功能

**代码示例组件实现** (`components/pages/ExamplesPage.wsx`):
```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, autoRegister, state } from '@wsxjs/wsx-core';
import styles from './ExamplesPage.css?inline';

interface CodeExample {
  id: string;
  title: string;
  description: string;
  code: string;
  language: 'typescript' | 'javascript' | 'html' | 'css';
  framework?: 'react' | 'vue' | 'svelte' | 'vanilla';
}

@autoRegister({ tagName: 'examples-page' })
export class ExamplesPage extends LightComponent {
  @state private selectedCategory = 'all';
  @state private copiedId: string | null = null;

  private examples: CodeExample[] = [
    {
      id: 'basic-usage',
      title: '基础用法',
      description: '最简单的使用方式',
      code: `import { QuizPlayer } from '@quizerjs/core';

const dsl = {
  title: '示例测验',
  questions: [/* ... */]
};

<quiz-player dsl={JSON.stringify(dsl)}></quiz-player>`,
      language: 'typescript',
      framework: 'vanilla',
    },
    // ... 更多示例
  ];

  private getFilteredExamples(): CodeExample[] {
    if (this.selectedCategory === 'all') {
      return this.examples;
    }
    return this.examples.filter(ex => ex.framework === this.selectedCategory);
  }

  private handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      this.copiedId = id;
      setTimeout(() => {
        this.copiedId = null;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  render() {
    const filteredExamples = this.getFilteredExamples();

    return (
      <div class="examples-page">
        <div class="page-header">
          <h1>代码示例</h1>
          <p>查看实际代码示例，快速上手 QuizerJS</p>
        </div>

        <div class="category-filter">
          <button
            class={this.selectedCategory === 'all' ? 'active' : ''}
            onClick={() => this.selectedCategory = 'all'}
          >
            全部
          </button>
          <button
            class={this.selectedCategory === 'react' ? 'active' : ''}
            onClick={() => this.selectedCategory = 'react'}
          >
            React
          </button>
          <button
            class={this.selectedCategory === 'vue' ? 'active' : ''}
            onClick={() => this.selectedCategory = 'vue'}
          >
            Vue
          </button>
          <button
            class={this.selectedCategory === 'svelte' ? 'active' : ''}
            onClick={() => this.selectedCategory = 'svelte'}
          >
            Svelte
          </button>
          <button
            class={this.selectedCategory === 'vanilla' ? 'active' : ''}
            onClick={() => this.selectedCategory = 'vanilla'}
          >
            Vanilla
          </button>
        </div>

        <div class="examples-grid">
          {filteredExamples.map(example => (
            <div key={example.id} class="example-card">
              <div class="card-header">
                <h3>{example.title}</h3>
                {example.framework && (
                  <span class="framework-badge">{example.framework}</span>
                )}
              </div>
              <p class="card-description">{example.description}</p>
              <div class="code-block">
                <div class="code-header">
                  <span class="language">{example.language}</span>
                  <button
                    class="copy-button"
                    onClick={() => this.handleCopy(example.id, example.code)}
                  >
                    {this.copiedId === example.id ? '✓ 已复制' : '复制'}
                  </button>
                </div>
                <pre><code>{example.code}</code></pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
```

#### 社区 (/community)

**功能**:
- 贡献指南
- 行为准则
- 更新日志
- 社区链接

**内容**:
- 如何贡献代码
- 如何报告问题
- 如何提出功能请求
- 社区行为准则
- 版本更新日志

#### 关于 (/about)

**功能**:
- 项目历史
- 团队介绍
- 许可证信息
- 联系方式

## 技术架构

### 技术选型

#### 核心框架

- **wsx (类似 JSX/TSX 的语法，用于编写 Web Components)**: 主要 UI 框架
  - wsx 是模仿 JSX/TSX 的语法，但用于编写 Web Components 而非 React 组件
  - 使用 `LightComponent` 或 `WebComponent` 构建组件
  - 使用 wsx 语法编写 Web Components，构建所有页面
  - 展示 wsx 在实际项目中的应用
  - 与核心组件库技术栈一致（基于 @wsxjs/wsx-core）
  
- **@wsxjs/wsx-base-components**: 基础组件库
  - 提供 `wsx-link` 导航链接组件
  - 提供其他常用基础组件
  - 需要导入以使用基础组件

- **TypeScript**: 类型安全
  - 完整的类型定义
  - 类型安全的组件开发

#### 构建工具

- **Vite**: 构建工具
  - 快速开发体验
  - 优化的生产构建
  - 通过 @wsxjs/wsx-vite-plugin 支持 wsx 文件

#### 样式工具

- **UnoCSS**: 原子化 CSS 引擎
  - 按需生成工具类
  - 与 wsx 组件完美集成
  - 通过 Vite 插件集成（`unocss/vite`）
  - 在 `main.ts` 中导入 `uno.css`

**UnoCSS 配置示例** (`uno.config.ts`):
```typescript
import { defineConfig, presetUno, presetAttributify } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(), // 默认预设
    presetAttributify(), // 属性化模式支持
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded font-semibold',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
    'btn-secondary': 'btn bg-gray-500 text-white hover:bg-gray-600',
  },
  theme: {
    colors: {
      primary: {
        DEFAULT: '#4a90e2',
        light: '#6ba3e8',
        dark: '#3a7dc2',
      },
    },
  },
});
```

**在组件中使用 UnoCSS**:
```typescript
render() {
  return (
    <div class="flex flex-col gap-4 p-6">
      <h1 class="text-2xl font-bold text-primary">Title</h1>
      <button class="btn-primary">Click Me</button>
    </div>
  );
}
```

#### 路由库

- **wsx-router**: Web Components 路由库
  - 轻量级 SPA 路由解决方案
  - 支持历史模式和哈希模式
  - 路由懒加载和代码分割
  - 路由参数和查询参数支持

- **wsx-view**: 路由视图组件
  - 用于渲染当前路由对应的组件
  - 支持声明式嵌套路由（类似 React Router 的嵌套路由）
  - 通过 `route` 属性定义路由路径
  - 通过 `component` 属性指定组件名称（自定义元素标签名）
  - 支持子路由嵌套（通过子 wsx-view 元素）
  - 与 wsx-router 完美集成
  - 支持路由过渡动画（可选）

#### 路由

- **wsx-router**: 基于 Web Components 的路由库
  - 轻量级 SPA 路由
  - **推荐使用哈希模式** (`mode="hash"`)，GitHub Pages 开箱即用
  - 支持历史模式 (`mode="history"`)，需要 404.html 重定向
  - 路由懒加载
  - 与 wsx 组件系统完美集成

- **wsx-view**: 路由视图组件
  - 用于渲染路由对应的组件
  - 支持声明式嵌套路由定义
  - 支持路由参数和查询参数
  - 支持路由守卫和导航守卫（通过 wsx-router 配置）

#### 样式方案

- **@quizerjs/theme**: 使用项目主题系统
  - 统一的主题变量
  - 支持深色/浅色主题
  - 响应式设计

#### 状态管理

- **Web Components 状态管理**: 使用 @wsxjs/wsx-core 的状态管理
  - 组件级状态（通过 @state 装饰器）
  - 全局状态（如主题）
  - 路由状态

**全局状态管理实现** (`src/store/theme.ts`):
```typescript
/**
 * 全局主题状态管理
 * 使用 CustomEvent 实现跨组件通信
 */

export type Theme = 'light' | 'dark';

class ThemeStore {
  private currentTheme: Theme = 'light';
  private listeners: Set<(theme: Theme)> = new Set();

  constructor() {
    // 从 localStorage 恢复主题
    const saved = localStorage.getItem('quizerjs-theme') as Theme | null;
    if (saved && (saved === 'light' || saved === 'dark')) {
      this.currentTheme = saved;
    }

    // 监听系统主题变化
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('quizerjs-theme')) {
          this.setTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    }
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme, save = true): void {
    if (this.currentTheme === theme) return;

    this.currentTheme = theme;
    
    // 保存到 localStorage
    if (save) {
      localStorage.setItem('quizerjs-theme', theme);
    }

    // 更新 DOM
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);

    // 通知所有监听器
    this.listeners.forEach(listener => listener(theme));

    // 派发全局事件
    window.dispatchEvent(
      new CustomEvent('theme-change', {
        detail: { theme },
        bubbles: true,
      })
    );
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }
}

// 单例模式
export const themeStore = new ThemeStore();
```

**在组件中使用全局状态**:
```typescript
@autoRegister({ tagName: 'theme-toggle' })
export class ThemeToggle extends LightComponent {
  @state private theme: Theme = themeStore.getTheme();

  onConnected() {
    // 订阅主题变化
    this.unsubscribe = themeStore.subscribe((theme) => {
      this.theme = theme;
    });
  }

  onDisconnected() {
    // 取消订阅
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private handleToggle = () => {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    themeStore.setTheme(newTheme);
  };

  render() {
    return (
      <button onClick={this.handleToggle} class="theme-toggle">
        {this.theme === 'light' ? '🌙' : '☀️'}
      </button>
    );
  }
}
```

### 项目位置

**独立项目目录**: 网站项目应放在独立的 `site/` 目录下，与 `demos/` 和 `packages/` 平级。

```
quizerjs/
├── packages/          # 核心包
│   ├── core/
│   ├── dsl/
│   ├── theme/
│   └── ...
├── demos/             # 框架演示（React, Vue, Svelte, Vanilla）
│   ├── react/
│   ├── vue/
│   ├── svelte/
│   └── vanilla/
├── site/           # 开源网站项目（独立）
│   └── ...
├── docs/              # 文档
└── ...
```

**为什么独立目录？**
1. **项目性质不同**: 网站是完整的应用，不是简单的 demo
2. **构建和部署独立**: 有自己的构建流程和部署配置
3. **依赖关系清晰**: 网站依赖 packages 和 demos，但它们是独立的项目
4. **维护方便**: 独立的目录结构便于管理和维护

### 项目结构

```
site/
├── src/
│   ├── components/          # wsx Web Components
│   │   ├── layout/          # 布局组件
│   │   │   ├── AppHeader.wsx
│   │   │   ├── AppFooter.wsx
│   │   │   └── Navigation.wsx
│   │   ├── pages/           # 页面组件
│   │   │   ├── HomePage.wsx
│   │   │   ├── FeaturesPage.wsx
│   │   │   ├── DocsLayout.wsx
│   │   │   ├── DemosLayout.wsx
│   │   │   └── ...
│   │   └── common/          # 通用组件
│   │       ├── Button.wsx
│   │       ├── Card.wsx
│   │       └── ...
│   ├── router/              # 路由配置
│   │   └── index.ts         # wsx-router 初始化配置
│   ├── store/               # 状态管理
│   │   ├── theme.ts
│   │   └── playground.ts
│   ├── utils/               # 工具函数
│   │   ├── theme.ts
│   │   └── demo.ts
│   ├── assets/              # 静态资源
│   │   ├── images/
│   │   ├── icons/
│   │   └── examples/
│   ├── styles/              # 全局样式
│   │   ├── global.css
│   │   └── variables.css
│   ├── App.wsx              # 根组件
│   ├── main.ts              # 入口文件
│   ├── main.css             # 全局样式
│   └── i18n.ts              # 国际化配置（可选）
├── public/                  # 公共资源
│   ├── index.html
│   ├── favicon.svg         # SVG 格式 favicon
│   ├── 404.html            # SPA 路由重定向（仅 history 模式需要）
│   └── robots.txt
├── vite.config.ts
├── tsconfig.json
├── package.json           # 网站项目依赖配置
├── uno.config.ts          # UnoCSS 配置
├── vitest.config.ts       # Vitest 测试配置
├── .env.production        # 生产环境变量
├── .env.development       # 开发环境变量（可选）
├── scripts/               # 构建脚本
│   └── generate-sitemap.ts
└── README.md              # 网站项目说明
```

**site/package.json 示例**:
```json
{
  "name": "@quizerjs/site",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "pnpm generate:sitemap && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "generate:sitemap": "tsx scripts/generate-sitemap.ts",
    "lint": "eslint src --ext .ts,.wsx",
    "lint:fix": "eslint src --ext .ts,.wsx --fix"
  },
  "dependencies": {
    "@quizerjs/core": "workspace:*",
    "@quizerjs/dsl": "workspace:*",
    "@quizerjs/theme": "workspace:*",
    "@wsxjs/wsx-base-components": "workspace:*",
    "@wsxjs/wsx-core": "workspace:*",
    "@wsxjs/wsx-router": "workspace:*"
  },
  "devDependencies": {
    "@wsxjs/wsx-vite-plugin": "workspace:*",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "unocss": "^0.58.0",
    "vite": "^5.0.0",
    "vitest": "^1.6.1",
    "@vitest/ui": "^1.6.1",
    "jsdom": "^24.0.0",
    "tsx": "^4.7.1"
  }
}
```

**Monorepo 工作空间配置**:
需要在 `pnpm-workspace.yaml` 中添加 `site/`：

```yaml
packages:
  - 'packages/*'
  - 'demos/*'
  - 'app/site'  # 网站项目
```

### Playground 集成设计

#### Demo 预构建和集成

所有 demo 应用需要在网站构建时一起构建，并将构建产物复制到网站目录：

**构建流程**:
1. 构建所有 demo 项目（React、Vue、Svelte、Vanilla）
2. 将 demo 构建产物复制到 `site/dist/demos/` 目录
3. 网站通过相对路径访问 demo：`/demos/react/`、`/demos/vue/` 等

**目录结构**:
```
site/dist/              # 网站构建产物
├── index.html
├── assets/
└── demos/                 # Demo 构建产物（从 demos/*/dist 复制）
    ├── react/            # React Demo 构建产物
    ├── vue/              # Vue Demo 构建产物
    ├── svelte/           # Svelte Demo 构建产物
    └── vanilla/          # Vanilla Demo 构建产物
```

**访问 URL**:
- `https://quizerjs.com/demos/react/` - React Demo
- `https://quizerjs.com/demos/vue/` - Vue Demo
- `https://quizerjs.com/demos/svelte/` - Svelte Demo
- `https://quizerjs.com/demos/vanilla/` - Vanilla Demo

#### Playground 页面设计

**功能**:
1. **Demo 选择器**
   - 显示所有可用的 demo（React、Vue、Svelte、Vanilla）
   - 每个 demo 显示框架图标和描述
   - 点击打开对应的 demo

2. **Demo 嵌入方式**
   - **方案 A**: 使用 iframe 嵌入（推荐）
     - 优点：隔离性好，不影响主页面
     - 缺点：需要处理跨域和通信
   - **方案 B**: 新窗口/标签页打开
     - 优点：简单直接，无跨域问题
     - 缺点：用户体验稍差

3. **主题同步**
   - Playground 页面支持主题切换
   - 通过 URL 参数或 postMessage 同步主题到 demo
   - Demo 检测主题参数并应用

4. **示例数据同步**
   - Playground 页面显示示例数据选择器
   - 通过 URL 参数传递选中的数据 ID
   - Demo 检测参数并加载对应数据

5. **URL 参数设计**
   ```
   /playground/react?theme=dark&data=spelling-quiz
   /playground/vue?theme=light&data=beat-earn-lose-win-quiz
   ```

#### Demo 通信协议

**主题同步**:
```typescript
// Playground 发送主题变更
window.postMessage({
  type: 'THEME_CHANGE',
  theme: 'dark' | 'light'
}, '*');

// Demo 监听主题变更
window.addEventListener('message', (event) => {
  if (event.data.type === 'THEME_CHANGE') {
    // 应用主题
    themeManager.setTheme(event.data.theme === 'dark');
  }
});
```

**数据加载**:
```typescript
// URL 参数解析
const params = new URLSearchParams(window.location.search);
const dataId = params.get('data');
if (dataId) {
  const dsl = getSampleDataById(dataId);
  if (dsl) {
    editorRef.current?.load(dsl);
  }
}
```

## 实施计划

### 阶段 1: 基础架构（2-3 周）

1. **项目初始化**
   - 在项目根目录创建独立的 `site/` 目录（与 `demos/` 和 `packages/` 平级）
   - 更新 `pnpm-workspace.yaml`，添加 `app/site` 到工作空间
   - 创建 `site/package.json`，配置项目依赖
   - 配置 Vite 和 TypeScript
   - 安装依赖：`@wsxjs/wsx-vite-plugin`、`unocss`、`@wsxjs/wsx-base-components`、`@wsxjs/wsx-router`
   - 配置 Vite 插件（wsx、UnoCSS）
   - 配置开发模式路径别名（支持 HMR，指向 packages 源文件）
   - 设置 wsx 开发环境
   - 配置主题系统

2. **路由系统**
   - 配置 wsx-router
   - 在 App 组件中使用 wsx-view 声明式定义嵌套路由
   - 创建所有页面组件并注册为自定义元素
   - 实现路由导航组件

3. **布局组件**
   - AppHeader（导航栏）
   - AppFooter（页脚）
   - Navigation（导航菜单）
   - 响应式布局

### 阶段 2: 核心页面（3-4 周）

1. **首页**
   - Hero 区域
   - 特性展示
   - 快速开始
   - 社区统计

2. **功能特性页面**
   - 功能列表
   - 技术优势
   - 对比表格

3. **文档页面**
   - 文档导航
   - 内容渲染
   - 搜索功能

### 阶段 3: Demo 集成（2-3 周）

1. **Demo 预构建和集成**
   - 配置 demo 构建脚本（在 GitHub Actions 中）
   - 将 demo 构建产物复制到 `site/dist/demos/` 目录
   - 配置网站路由指向 demo 构建产物
   - 测试访问路径和 iframe 嵌入

2. **Playground 页面**
   - Demo 选择器
   - iframe 嵌入
   - 主题同步
   - 数据同步

3. **Demo 通信**
   - 实现 postMessage 通信
   - URL 参数解析
   - 主题和数据同步

### 阶段 4: 完善和优化（2-3 周）

1. **代码示例页面**
   - 示例分类
   - 代码高亮
   - 复制功能
   - 在线预览

2. **社区页面**
   - 贡献指南
   - 行为准则
   - 更新日志

3. **SEO 优化**
   - Meta 标签
   - 结构化数据
   - Sitemap
   - robots.txt

4. **性能优化**
   - 代码分割
   - 懒加载
   - 资源压缩
   - CDN 配置

### 阶段 5: 部署和发布（1 周）

1. **构建配置**
   - 生产构建优化
   - 静态资源处理
   - 环境变量配置

2. **部署配置**
   - GitHub Pages 配置
   - GitHub Actions 工作流
   - 域名配置（quizerjs.com）

3. **测试和验证**
   - 功能测试
   - 性能测试
   - 跨浏览器测试
   - SEO 验证

## 技术细节

### wsx 组件开发规范

**wsx 语法说明**:
- wsx 是模仿 JSX/TSX 的语法，但用于编写 Web Components
- 使用类似 JSX 的语法编写组件，但最终编译为 Web Components
- 文件扩展名为 `.wsx`（类似 `.jsx`/`.tsx`）

**组件结构**:
```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, autoRegister, state } from '@wsxjs/wsx-core';
import styles from './MyComponent.css?inline';
import '@quizerjs/theme/solarized-light.css';

interface ComponentProps {
  title: string;
  onClick?: () => void;
}

@autoRegister({ tagName: 'my-component' })
export class MyComponent extends LightComponent<ComponentProps> {
  @state private count = 0;

  constructor() {
    super({ 
      styles,
      styleName: 'my-component',
      ...this.props 
    });
  }

  render() {
    return (
      <div class="component">
        <h1>{this.props.title}</h1>
        <button onClick={() => this.count++}>
          Count: {this.count}
        </button>
      </div>
    );
  }
}
```

**关键点**:
- 使用 `LightComponent`（不使用 Shadow DOM）或 `WebComponent`（使用 Shadow DOM）
- 使用 `?inline` 导入 CSS 作为内联样式
- 通过 `styleName` 提供作用域化的样式类名
- 组件通过 `@autoRegister` 注册，然后在路由中使用标签名

**完整的 wsx 组件生命周期**:

```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, autoRegister, state } from '@wsxjs/wsx-core';
import styles from './MyComponent.css?inline';

@autoRegister({ tagName: 'my-component' })
export class MyComponent extends LightComponent {
  // 1. 响应式状态 - 使用 @state 装饰器
  @state private count = 0;
  @state private title = '';

  // 2. 非响应式私有属性
  private buttonRef: HTMLButtonElement | null = null;

  constructor() {
    super({ 
      styles,
      styleName: 'my-component'
    });
  }

  // 3. 定义观察的属性（Web Components 标准）
  static get observedAttributes() {
    return ['title', 'count'];
  }

  // 4. 属性变化处理
  protected onAttributeChanged(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case 'title':
        this.title = newValue || '';
        break;
      case 'count':
        const count = parseInt(newValue, 10);
        if (!isNaN(count)) {
          this.count = count;
        }
        break;
    }
  }

  // 5. 组件挂载到 DOM 后调用
  onConnected() {
    // 初始化 DOM 引用
    this.buttonRef = this.querySelector('button') as HTMLButtonElement;
    // 添加事件监听器
    if (this.buttonRef) {
      this.buttonRef.addEventListener('click', this.handleClick);
    }
  }

  // 6. 组件从 DOM 移除前调用
  onDisconnected() {
    // 清理事件监听器
    if (this.buttonRef) {
      this.buttonRef.removeEventListener('click', this.handleClick);
      this.buttonRef = null;
    }
  }

  // 7. 事件处理函数（使用箭头函数绑定 this）
  private handleClick = () => {
    this.count++;
    // 派发自定义事件
    this.dispatchEvent(
      new CustomEvent('count-change', {
        detail: { count: this.count },
        bubbles: true,
      })
    );
  };

  // 8. 渲染方法
  render() {
    return (
      <div class="my-component">
        <h1>{this.title || 'Default Title'}</h1>
        <button ref={(el) => { this.buttonRef = el; }} onClick={this.handleClick}>
          Count: {this.count}
        </button>
      </div>
    );
  }
}
```

**组件属性传递和使用**:

```typescript
// 在父组件中使用
<my-component title="Hello" count="5"></my-component>

// 组件内部通过 observedAttributes 和 onAttributeChanged 接收属性
// 属性值始终是字符串，需要手动转换类型
```

**事件处理**:

```typescript
// 1. 监听 DOM 事件（在 render 中使用）
<button onClick={this.handleClick}>Click</button>

// 2. 派发自定义事件
this.dispatchEvent(
  new CustomEvent('custom-event', {
    detail: { data: 'value' },
    bubbles: true, // 允许事件冒泡
    composed: true, // 允许跨 Shadow DOM 边界（如果使用 WebComponent）
  })
);

// 3. 在父组件中监听自定义事件
<my-component oncustom-event={(e: CustomEvent) => {
  console.log('Custom event:', e.detail);
}}></my-component>
```

**ref 的使用**:

```typescript
// 在 render 中使用 ref 获取 DOM 元素引用
render() {
  return (
    <div>
      <input 
        ref={(el) => { this.inputRef = el; }}
        type="text"
      />
      <button onClick={() => this.inputRef?.focus()}>
        Focus Input
      </button>
    </div>
  );
}
```

**性能优化技巧**:

1. **避免不必要的重新渲染**:
   - 使用非响应式属性存储不需要触发渲染的数据
   - 只在必要时更新 `@state` 属性

2. **条件渲染**:
   ```typescript
   render() {
     return (
       <div>
         {this.showContent && <div>Content</div>}
         {this.items.map(item => <div key={item.id}>{item.text}</div>)}
       </div>
     );
   }
   ```

3. **事件处理优化**:
   - 使用箭头函数绑定 this，避免每次渲染创建新函数
   - 在 `onDisconnected` 中清理事件监听器

4. **样式优化**:
   - 使用 `?inline` 导入 CSS，避免额外的 HTTP 请求
   - 使用 `styleName` 提供作用域化的类名，避免样式冲突

**组件通信模式**:

1. **父子组件通信**:
   ```typescript
   // 父组件
   <child-component 
     title="Hello"
     oncustom-event={(e: CustomEvent) => {
       console.log('Received:', e.detail);
     }}
   ></child-component>

   // 子组件
   this.dispatchEvent(
     new CustomEvent('custom-event', {
       detail: { data: 'value' },
       bubbles: true,
     })
   );
   ```

2. **兄弟组件通信**:
   ```typescript
   // 通过父组件或全局事件总线
   // 方案 A: 通过父组件
   <parent-component>
     <child-a onchange={(e) => this.handleChange(e)}></child-a>
     <child-b data={this.sharedData}></child-b>
   </parent-component>

   // 方案 B: 全局事件总线
   window.dispatchEvent(new CustomEvent('global-event', { detail: data }));
   window.addEventListener('global-event', handler);
   ```

3. **属性传递**:
   ```typescript
   // 属性值始终是字符串，需要手动转换
   static get observedAttributes() {
     return ['count', 'enabled'];
   }

   protected onAttributeChanged(name: string, _oldValue: string, newValue: string) {
     switch (name) {
       case 'count':
         this.count = parseInt(newValue, 10) || 0;
         break;
       case 'enabled':
         this.enabled = newValue === 'true';
         break;
     }
   }
   ```

**错误处理**:

```typescript
@autoRegister({ tagName: 'error-boundary' })
export class ErrorBoundary extends LightComponent {
  @state private hasError = false;
  @state private error: Error | null = null;

  static get observedAttributes() {
    return [];
  }

  onConnected() {
    // 监听全局错误
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  onDisconnected() {
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  private handleError = (event: ErrorEvent) => {
    this.hasError = true;
    this.error = event.error || new Error(event.message);
    console.error('Component error:', this.error);
  };

  private handlePromiseRejection = (event: PromiseRejectionEvent) => {
    this.hasError = true;
    this.error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    console.error('Unhandled promise rejection:', this.error);
  };

  render() {
    if (this.hasError) {
      return (
        <div class="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.error?.message}</p>
          <button onClick={() => {
            this.hasError = false;
            this.error = null;
            window.location.reload();
          }}>
            Reload Page
          </button>
        </div>
      );
    }

    return <slot></slot>; // 渲染子组件
  }
}
```

**类型定义最佳实践**:

```typescript
// 定义组件属性接口
interface MyComponentProps {
  title: string;
  count?: number;
  enabled?: boolean;
  onCustomEvent?: (event: CustomEvent) => void;
}

// 在组件中使用
@autoRegister({ tagName: 'my-component' })
export class MyComponent extends LightComponent {
  // 类型安全的状态
  @state private title: string = '';
  @state private count: number = 0;
  @state private enabled: boolean = false;

  // 类型安全的属性处理
  protected onAttributeChanged(name: string, _oldValue: string, newValue: string) {
    switch (name) {
      case 'title':
        this.title = newValue || '';
        break;
      case 'count':
        this.count = parseInt(newValue, 10) || 0;
        break;
      case 'enabled':
        this.enabled = newValue === 'true';
        break;
    }
  }
}
```

### 路由实现

**使用 wsx-router 和 wsx-view 的声明式嵌套路由**:

**路由配置**:
使用 `wsx-router` 时，路由配置通过 `<wsx-router>` 和 `<wsx-view>` 组件声明式定义，无需单独的配置文件。

**路由模式设置**:
在 `wsx-router` 组件上设置 `mode` 属性：

```typescript
// 在 App 组件中
<wsx-router mode="hash">
  {/* wsx-view 路由定义 */}
</wsx-router>
```

**路由模式选项**:
- `mode="hash"`: 使用哈希路由（`#/path`），**GitHub Pages 推荐**
  - 无需服务器配置
  - 无需 404.html 重定向
  - 开箱即用
- `mode="history"`: 使用历史 API（`/path`）
  - 需要 404.html 重定向（见部署配置部分）
  - URL 更美观
  - 需要服务器支持

**路由变化监听**:
可以通过监听路由变化来更新页面标题等：

```typescript
// 在组件中
protected onConnected(): void {
  const router = document.querySelector('wsx-router');
  router?.addEventListener('routechange', (e: CustomEvent) => {
    const route = e.detail;
    if (route.meta?.title) {
      document.title = route.meta.title;
    }
    // 更新 meta description
    if (route.meta?.description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', route.meta.description);
      }
    }
  });
}
```

**在 App 组件中使用 wsx-router 和 wsx-view**:
```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, autoRegister } from '@wsxjs/wsx-core';
import styles from './App.css?inline';
// 导入基础组件和路由
import '@wsxjs/wsx-base-components';
import '@wsxjs/wsx-router';
// 导入页面组件（触发自动注册）
import './components/pages/HomePage.wsx';
import './components/pages/FeaturesPage.wsx';
import './components/pages/DocsLayout.wsx';
import './components/pages/GettingStartedDoc.wsx';
import './components/pages/InstallationDoc.wsx';
import './components/pages/ApiLayout.wsx';
import './components/pages/DslLayout.wsx';
import './components/pages/DemosLayout.wsx';
import './components/pages/PlaygroundLayout.wsx';
import './components/pages/ExamplesPage.wsx';
import './components/pages/CommunityLayout.wsx';
import './components/pages/AboutPage.wsx';
import './components/layout/AppHeader.wsx';
import './components/layout/AppFooter.wsx';

@autoRegister({ tagName: 'quizerjs-app' })
export default class App extends LightComponent {
  constructor() {
    super({
      styles,
      styleName: 'quizerjs-app',
    });
  }

  render() {
    return (
      <div class="app-container">
        {/* 导航栏 */}
        <app-header />
        
        {/* 路由容器 */}
        <wsx-router>
          {/* 首页 */}
          <wsx-view route="/" component="home-page"></wsx-view>
          
          {/* 功能特性 */}
          <wsx-view route="/features" component="features-page"></wsx-view>
          
          {/* 文档路由 - 嵌套结构 */}
          <wsx-view route="/docs" component="docs-layout">
            {/* 快速开始 */}
            <wsx-view route="/docs/guide/getting-started" component="getting-started-doc"></wsx-view>
            <wsx-view route="/docs/installation" component="installation-doc"></wsx-view>
            
            {/* API 文档 */}
            <wsx-view route="/docs/api" component="api-layout">
              <wsx-view route="/docs/api/parser" component="api-parser-doc"></wsx-view>
              <wsx-view route="/docs/api/serializer" component="api-serializer-doc"></wsx-view>
              <wsx-view route="/docs/api/validator" component="api-validator-doc"></wsx-view>
              <wsx-view route="/docs/api/types" component="api-types-doc"></wsx-view>
            </wsx-view>
            
            {/* DSL 文档 */}
            <wsx-view route="/docs/dsl" component="dsl-layout">
              <wsx-view route="/docs/dsl/structure" component="dsl-structure-doc"></wsx-view>
              <wsx-view route="/docs/dsl/question-types" component="dsl-question-types-doc"></wsx-view>
              <wsx-view route="/docs/dsl/validation" component="dsl-validation-doc"></wsx-view>
              <wsx-view route="/docs/dsl/examples" component="dsl-examples-doc"></wsx-view>
            </wsx-view>
            
            {/* 示例 */}
            <wsx-view route="/docs/examples" component="examples-layout">
              <wsx-view route="/docs/examples/basic" component="example-basic-doc"></wsx-view>
              <wsx-view route="/docs/examples/full-quiz" component="example-full-quiz-doc"></wsx-view>
              <wsx-view route="/docs/examples/interactive" component="example-interactive-doc"></wsx-view>
            </wsx-view>
          </wsx-view>
          
          {/* 演示路由 */}
          <wsx-view route="/demos" component="demos-layout">
            <wsx-view route="/demos/editor" component="editor-demo-page"></wsx-view>
            <wsx-view route="/demos/player" component="player-demo-page"></wsx-view>
            
            {/* Playground */}
            <wsx-view route="/demos/playground" component="playground-layout">
              <wsx-view route="/demos/playground/react" component="playground-react"></wsx-view>
              <wsx-view route="/demos/playground/vue" component="playground-vue"></wsx-view>
              <wsx-view route="/demos/playground/svelte" component="playground-svelte"></wsx-view>
              <wsx-view route="/demos/playground/vanilla" component="playground-vanilla"></wsx-view>
            </wsx-view>
          </wsx-view>
          
          {/* 代码示例 */}
          <wsx-view route="/examples" component="examples-page"></wsx-view>
          
          {/* 社区 */}
          <wsx-view route="/community" component="community-layout">
            <wsx-view route="/community/contributing" component="contributing-doc"></wsx-view>
            <wsx-view route="/community/code-of-conduct" component="code-of-conduct-doc"></wsx-view>
            <wsx-view route="/community/changelog" component="changelog-doc"></wsx-view>
          </wsx-view>
          
          {/* 关于 */}
          <wsx-view route="/about" component="about-page"></wsx-view>
        </wsx-router>

        {/* 页脚 */}
        <app-footer />
      </div>
    );
  }
}
```

**导航链接组件（使用 wsx-link）**:
```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, autoRegister } from '@wsxjs/wsx-core';
import '@wsxjs/wsx-base-components'; // 提供 wsx-link 组件
import styles from './Navigation.css?inline';

@autoRegister({ tagName: 'app-navigation' })
export class Navigation extends LightComponent {
  constructor() {
    super({ styles, styleName: 'app-navigation' });
  }

  render() {
    return (
      <nav class="main-nav">
        <div class="nav-container">
          <div class="nav-brand">
            <span class="nav-title">QuizerJS</span>
          </div>
          
          <div class="nav-menu">
            <wsx-link to="/" class="nav-link" active-class="nav-link-active" exact>
              Home
            </wsx-link>
            <wsx-link to="/features" class="nav-link" active-class="nav-link-active">
              Features
            </wsx-link>
            <wsx-link to="/docs" class="nav-link" active-class="nav-link-active">
              Docs
            </wsx-link>
            <wsx-link to="/demos" class="nav-link" active-class="nav-link-active">
              Demos
            </wsx-link>
            <wsx-link to="/examples" class="nav-link" active-class="nav-link-active">
              Examples
            </wsx-link>
            <wsx-link to="/community" class="nav-link" active-class="nav-link-active">
              Community
            </wsx-link>
            <wsx-link to="/about" class="nav-link" active-class="nav-link-active">
              About
            </wsx-link>
          </div>
        </div>
      </nav>
    );
  }
}
```

**关键点说明**:
1. **使用 `LightComponent`**: 继承自 `LightComponent` 而非 `WebComponent`（不使用 Shadow DOM）
2. **导入路由库**: 需要导入 `@wsxjs/wsx-base-components` 和 `@wsxjs/wsx-router`
3. **组件自动注册**: 通过 `@autoRegister` 注册组件，然后在路由中使用标签名（如 `home-page`）
4. **wsx-link 组件**: 使用 `<wsx-link>` 进行导航，支持 `active-class` 和 `exact` 属性
5. **路由容器**: 使用 `<wsx-router>` 包裹所有 `<wsx-view>` 组件
6. **样式导入**: 使用 `?inline` 导入 CSS 作为内联样式

**wsx-link 组件使用**:
`wsx-link` 是 `@wsxjs/wsx-base-components` 提供的导航链接组件，无需自定义：

```typescript
// 在组件中使用 wsx-link
import '@wsxjs/wsx-base-components'; // 导入基础组件

// 在 render 中使用
<wsx-link 
  to="/features" 
  class="nav-link" 
  active-class="nav-link-active"
  exact={false}
>
  Features
</wsx-link>
```

**wsx-link 属性**:
- `to`: 目标路由路径
- `class`: CSS 类名
- `active-class`: 激活状态时的 CSS 类名（当路由匹配时自动添加）
- `exact`: 是否精确匹配（默认 false，支持部分匹配）

### 入口文件实现

**main.ts - 应用入口**:
```typescript
/**
 * QuizerJS Website - Main Entry Point
 *
 * 初始化 wsx 应用，挂载根组件到 DOM
 */

import { createLogger } from '@wsxjs/wsx-core';
import 'uno.css'; // UnoCSS 工具类
import './main.css'; // 全局样式
// 导入基础组件包（包含 CSS）
import '@wsxjs/wsx-base-components';
// 导入路由
import '@wsxjs/wsx-router';
// 初始化国际化（可选）
import './i18n';
// 导入 App 组件（触发自动注册）
import './App.wsx';

const logger = createLogger('QuizerJS-Website');

/**
 * 初始化应用
 */
function initApp() {
  const appContainer = document.getElementById('app');

  if (!appContainer) {
    logger.error('App container not found');
    return;
  }

  // 挂载 WSX App 组件到 DOM
  // 使用自定义元素标签名（由 @autoRegister 定义）
  appContainer.innerHTML = '<quizerjs-app></quizerjs-app>';

  logger.info('QuizerJS Website initialized');
}

// DOM 就绪后启动应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
```

**index.html - HTML 模板**:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>QuizerJS - Quiz Builder Library</title>
    <link rel="icon" href="/favicon.svg?v=2" />
    <meta
      name="description"
      content="Build interactive quizzes with Editor.js and wsx - Web Components with JSX syntax"
    />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
          Cantarell, sans-serif;
      }

      #app {
        min-height: 100vh;
      }
    </style>
    <!-- GitHub Pages SPA 路由处理（如果使用 history 模式） -->
    <!-- 如果使用哈希模式，可以移除此脚本 -->
    <script>
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
              l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**index.html 关键点说明**:
1. **DOCTYPE**: 使用 `<!doctype html>`（小写，HTML5 标准）
2. **Favicon**: 使用 SVG 格式的 favicon（`/favicon.svg`）
3. **内联样式**: 在 `<head>` 中使用 `<style>` 标签定义基础样式
4. **字体系统**: 使用系统字体栈，确保跨平台一致性
5. **SPA 路由脚本**: 如果使用哈希模式路由，可以移除 GitHub Pages SPA 路由处理脚本
6. **最小高度**: `#app` 容器设置 `min-height: 100vh` 确保全屏布局

**main.ts 关键点说明**:
1. **导入顺序**: 先导入样式和基础组件，再导入应用组件
2. **组件注册**: 通过导入 `.wsx` 文件触发 `@autoRegister` 自动注册
3. **DOM 挂载**: 使用自定义元素标签名直接挂载到 DOM
4. **DOM 就绪检查**: 确保 DOM 完全加载后再初始化应用
5. **日志系统**: 使用 `createLogger` 创建日志记录器

**开发调试技巧**:

1. **启用 wsx 调试模式**:
   ```typescript
   // vite.config.ts
   wsx({
     debug: process.env.NODE_ENV === 'development', // 开发模式启用调试
   })
   ```

2. **使用浏览器 DevTools**:
   - 在 Elements 面板中查看自定义元素
   - 在 Console 中使用 `$0` 访问选中的元素
   - 使用 `$0.__wsxComponent` 访问组件实例（如果可用）

3. **日志记录**:
   ```typescript
   import { createLogger } from '@wsxjs/wsx-core';
   const logger = createLogger('MyComponent');
   
   logger.info('Component initialized');
   logger.warn('Warning message');
   logger.error('Error message');
   ```

4. **状态调试**:
   - 在组件中添加 `console.log` 查看状态变化
   - 使用浏览器断点调试组件方法

### Playground 集成实现

**Playground 组件**:
```typescript
// components/demo/Playground.wsx
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, autoRegister, state } from '@wsxjs/wsx-core';
import styles from './Playground.css?inline';

@autoRegister({ tagName: 'playground-page' })
export class PlaygroundPage extends LightComponent {
  @state private selectedDemo: 'react' | 'vue' | 'svelte' | 'vanilla' = 'react';
  @state private theme: 'light' | 'dark' = 'light';
  @state private sampleDataId = 'spelling-quiz';

  private iframeRef: HTMLIFrameElement | null = null;

  constructor() {
    super({
      styles,
      styleName: 'playground-page',
    });
  }

  // Demo 构建产物路径（相对于网站根目录）
  private demoUrls = {
    react: '/demos/react/',
    vue: '/demos/vue/',
    svelte: '/demos/svelte/',
    vanilla: '/demos/vanilla/'
  };

  onConnected() {
    // 监听来自 iframe 的消息
    window.addEventListener('message', this.handleMessage);
  }

  onDisconnected() {
    window.removeEventListener('message', this.handleMessage);
  }

  private handleMessage = (event: MessageEvent) => {
    // 验证消息来源（安全考虑）
    if (!this.iframeRef?.contentWindow || event.source !== this.iframeRef.contentWindow) {
      return;
    }

    // 处理来自 demo 的消息
    if (event.data.type === 'THEME_REQUEST') {
      this.syncThemeToDemo();
    }
  };

  private getDemoUrl(): string {
    const base = this.demoUrls[this.selectedDemo];
    const params = new URLSearchParams({
      theme: this.theme,
      data: this.sampleDataId
    });
    return `${base}?${params.toString()}`;
  }

  private handleThemeChange(theme: 'light' | 'dark') {
    this.theme = theme;
    this.syncThemeToDemo();
  }

  private handleDemoChange(demo: 'react' | 'vue' | 'svelte' | 'vanilla') {
    this.selectedDemo = demo;
    // iframe src 变化会自动重新加载
  }

  private syncThemeToDemo() {
    if (this.iframeRef?.contentWindow) {
      this.iframeRef.contentWindow.postMessage({
        type: 'THEME_CHANGE',
        theme: this.theme
      }, '*');
    }
  }

  render() {
    return (
      <div class="playground">
        <div class="playground-controls">
          <div class="control-group">
            <label>选择 Demo:</label>
            <select 
              value={this.selectedDemo}
              onChange={(e) => this.handleDemoChange((e.target as HTMLSelectElement).value as any)}
            >
              <option value="react">React</option>
              <option value="vue">Vue</option>
              <option value="svelte">Svelte</option>
              <option value="vanilla">Vanilla</option>
            </select>
          </div>
          
          <div class="control-group">
            <label>主题:</label>
            <button 
              onClick={() => this.handleThemeChange(this.theme === 'light' ? 'dark' : 'light')}
            >
              {this.theme === 'light' ? '🌙' : '☀️'} {this.theme}
            </button>
          </div>
          
          <div class="control-group">
            <label>示例数据:</label>
            <select 
              value={this.sampleDataId}
              onChange={(e) => this.sampleDataId = e.target.value}
            >
              <option value="spelling-quiz">拼写测验</option>
              <option value="beat-earn-lose-win-quiz">Beat/Earn/Lose/Win 测验</option>
            </select>
          </div>
        </div>
        
        <iframe
          ref={(el) => { this.iframeRef = el; }}
          src={this.getDemoUrl()}
          class="demo-iframe"
          allow="clipboard-read; clipboard-write"
          title={`${this.selectedDemo} Demo`}
        />
      </div>
    );
  }
}
```

**关键实现细节**:
1. **使用 LightComponent**: 不使用 Shadow DOM，便于样式继承和调试
2. **iframe 引用**: 使用 ref 获取 iframe 元素，用于 postMessage 通信
3. **消息监听**: 在 `onConnected` 中添加全局消息监听，在 `onDisconnected` 中清理
4. **安全考虑**: 验证消息来源，防止 XSS 攻击
5. **URL 参数**: 通过 URL 参数传递主题和数据，支持直接链接分享

## 部署方案

### GitHub Pages 部署

**重要说明**: 网站将托管在 GitHub Pages 上，需要特殊配置以支持 SPA 路由。

**构建配置**:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { wsx } from '@wsxjs/wsx-vite-plugin';
import UnoCSS from 'unocss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // GitHub Pages 部署 base 路径配置
  // 支持自定义域名和子路径部署
  base:
    process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true'
      ? process.env.CUSTOM_DOMAIN === 'true'
        ? '/' // 自定义域名 (quizerjs.com)
        : '/quizerjs/' // GitHub Pages 子路径 (username.github.io/quizerjs)
      : '/', // 开发模式

  plugins: [
    // UnoCSS 原子化 CSS 引擎
    UnoCSS(),
    // wsx 插件 - 处理 .wsx 文件
    wsx({
      debug: process.env.NODE_ENV === 'development', // 开发模式启用调试
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    }),
  ],

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production', // 生产环境不生成 sourcemap
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['@wsxjs/wsx-core', '@wsxjs/wsx-base-components', '@wsxjs/wsx-router'],
          'theme': ['@quizerjs/theme'],
          'quizerjs': ['@quizerjs/core', '@quizerjs/dsl'],
        }
      }
    }
  },

  // 开发模式下的路径别名
  // 直接使用源文件以支持热模块替换 (HMR)
  // 生产模式使用 package.json exports (dist 文件)
  resolve: {
    alias:
      process.env.NODE_ENV === 'development'
        ? {
            // 开发模式：直接使用源文件，支持 HMR
            '@wsxjs/wsx-core': path.resolve(__dirname, '../../packages/wsx-core/src/index.ts'),
            '@wsxjs/wsx-base-components': path.resolve(
              __dirname,
              '../../packages/wsx-base-components/src/index.ts'
            ),
            '@wsxjs/wsx-router': path.resolve(__dirname, '../../packages/wsx-router/src/index.ts'),
            '@quizerjs/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
            '@quizerjs/dsl': path.resolve(__dirname, '../../packages/dsl/src/index.ts'),
            '@quizerjs/theme': path.resolve(__dirname, '../../packages/theme/src/index.ts'),
          }
        : undefined,
  },
});
```

**关键配置说明**:

1. **Base 路径配置**:
   - 通过环境变量 `GITHUB_PAGES` 和 `CUSTOM_DOMAIN` 控制
   - 自定义域名：`base: '/'`
   - GitHub Pages 子路径：`base: '/repository-name/'`
   - 开发模式：`base: '/'`

2. **插件配置**:
   - `UnoCSS()`: 原子化 CSS 引擎
   - `wsx()`: wsx 文件处理插件，开发模式启用调试

3. **开发模式别名**:
   - 直接解析到源文件（`.ts`），支持 HMR
   - 无需先构建依赖包
   - 生产模式使用构建后的 dist 文件

4. **构建优化**:
   - 代码分割：vendor、theme、quizerjs 分别打包
   - 生产环境不生成 sourcemap（减小体积）

5. **HMR 配置**:
   ```typescript
   server: {
     hmr: {
       protocol: 'ws',
       host: 'localhost',
       port: 5178,
     },
     watch: {
       // 监听 workspace 包的源码变化
       ignored: ['!**/node_modules/@quizerjs/**', '!**/packages/**'],
     },
   },
   optimizeDeps: {
     exclude: [
       '@wsxjs/wsx-core',
       '@wsxjs/wsx-base-components',
       '@wsxjs/wsx-router',
       '@quizerjs/core',
       '@quizerjs/dsl',
       '@quizerjs/theme',
     ],
   },
   ```

6. **条件解析**:
   ```typescript
   resolve: {
     // 在开发环境中优先使用源码（source 字段）
     conditions: ['source', 'import', 'module', 'browser', 'default'],
   },
   ```

**环境变量设置**:

`.env.production`:
```bash
# GitHub Pages 部署配置
GITHUB_PAGES=true
CUSTOM_DOMAIN=true  # 如果使用自定义域名，否则设为 false

# 网站配置
VITE_SITE_URL=https://quizerjs.com
VITE_API_BASE_URL=https://api.quizerjs.com  # 如果有 API
```

`.env.development` (可选):
```bash
# 开发环境配置
GITHUB_PAGES=false
CUSTOM_DOMAIN=false
VITE_SITE_URL=http://localhost:5173
```

**在代码中使用环境变量**:
```typescript
// 在组件或工具函数中
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://quizerjs.com';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// 注意：Vite 环境变量必须以 VITE_ 开头才能在客户端代码中访问
```

**类型定义** (`src/env.d.ts`):
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_API_BASE_URL?: string;
  readonly GITHUB_PAGES: string;
  readonly CUSTOM_DOMAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**路由模式选择**:

**方案 A: 哈希模式（推荐，GitHub Pages）**:
使用哈希模式路由（`#/path`），无需额外配置：

```typescript
// 在 App.wsx 中
<wsx-router mode="hash">
  {/* 路由定义 */}
</wsx-router>
```

优点：
- 无需服务器配置
- 无需 404.html 重定向
- GitHub Pages 开箱即用

**方案 B: History 模式（需要 404.html）**:
如果使用 history 模式路由，需要创建 `public/404.html` 文件：

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>QuizerJS</title>
    <script>
      // GitHub Pages SPA 路由重定向
      // 单页应用 (SPA) 重定向脚本
      var pathSegmentsToKeep = 0;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

然后在 `index.html` 中添加路由处理脚本（已在上面示例中包含）。

**GitHub Actions 工作流**:
```yaml
name: Deploy Website to GitHub Pages

on:
  push:
    branches: [master]
    paths:
      - 'site/**'        # 网站项目变更
      - 'demos/**'          # Demo 项目变更（需要重新构建并复制到 website）
      - 'packages/**'       # 核心包变更（可能影响网站）
      - '.github/workflows/website.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pages: write
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build demos
        run: |
          cd demos/react && pnpm build
          cd ../vue && pnpm build
          cd ../svelte && pnpm build
          cd ../vanilla && pnpm build
          cd ../..
      
      - name: Build core packages
        run: |
          # 先构建依赖的包
          pnpm --filter @quizerjs/core build
          pnpm --filter @quizerjs/dsl build
          pnpm --filter @quizerjs/theme build
      
      - name: Build website
        env:
          NODE_ENV: production
          GITHUB_PAGES: true
          CUSTOM_DOMAIN: true  # 如果使用自定义域名，否则设为 false
        run: |
          cd app/site
          pnpm build
      
      - name: Copy demo builds to website
        run: |
          # 创建 demos 目录
          mkdir -p site/dist/demos
          # 复制各个 demo 的构建产物到 site/dist/demos/
          # 注意：需要创建目标目录，然后复制内容
          mkdir -p site/dist/demos/react
          mkdir -p site/dist/demos/vue
          mkdir -p site/dist/demos/svelte
          mkdir -p site/dist/demos/vanilla
          
          # 复制构建产物（如果存在）
          [ -d demos/react/dist ] && cp -r demos/react/dist/* site/dist/demos/react/ || true
          [ -d demos/vue/dist ] && cp -r demos/vue/dist/* site/dist/demos/vue/ || true
          [ -d demos/svelte/dist ] && cp -r demos/svelte/dist/* site/dist/demos/svelte/ || true
          [ -d demos/vanilla/dist ] && cp -r demos/vanilla/dist/* site/dist/demos/vanilla/ || true
      
      - name: Copy 404.html for SPA routing (if using history mode)
        run: |
          # 如果使用 history 模式，复制 404.html 到 dist
          # 如果使用哈希模式，可以跳过此步骤
          if [ -f site/public/404.html ]; then
            cp site/public/404.html site/dist/404.html
          fi
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './site/dist'  # 网站构建产物目录
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**GitHub Pages 设置**:
1. 在仓库 Settings > Pages 中：
   - Source: GitHub Actions
   - 如果使用自定义域名，在 Custom domain 中输入 `quizerjs.com`
   - 启用 Enforce HTTPS

### 域名配置（GitHub Pages）

1. **DNS 配置**
   - 添加 CNAME 记录：`quizerjs.com` -> `username.github.io`
   - 或添加 A 记录指向 GitHub Pages IP 地址：
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

2. **GitHub Pages 配置**
   - 在仓库 Settings > Pages 中添加自定义域名 `quizerjs.com`
   - GitHub Pages 会自动创建 CNAME 文件
   - 启用 Enforce HTTPS（GitHub Pages 自动提供 SSL 证书）
   - 等待 DNS 传播（通常几分钟到几小时）

3. **验证配置**
   - 访问 `https://quizerjs.com` 确认网站正常加载
   - 检查所有路由是否正常工作
   - 验证 HTTPS 证书有效

## 性能优化

### 代码分割

- 按路由分割代码（wsx-router 自动支持）
- 按功能模块分割
- 第三方库单独打包（vendor chunks）
- GitHub Pages CDN 自动缓存静态资源

### 懒加载

- 路由组件懒加载
- 图片懒加载
- Demo iframe 懒加载

### 资源优化

- 图片压缩和 WebP 格式
- CSS 压缩和提取
- JavaScript 压缩和混淆
- 字体子集化

### CDN 配置

- GitHub Pages 自动提供 CDN 加速
- 自动启用 Gzip 压缩
- 静态资源缓存策略（通过 Cache-Control headers）
- 无需额外 CDN 配置

## SEO 优化

### Meta 标签

```html
<head>
  <title>QuizerJS - Quiz Builder Library</title>
  <meta name="description" content="Build interactive quizzes with Editor.js and wsx">
  <meta name="keywords" content="quiz, editorjs, wsx, web-components">
  <meta property="og:title" content="QuizerJS">
  <meta property="og:description" content="Build interactive quizzes">
  <meta property="og:image" content="/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
</head>
```

### 结构化数据

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "QuizerJS",
  "applicationCategory": "WebApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### Sitemap

自动生成 sitemap.xml，包含所有页面路径。

**Sitemap 生成脚本** (`scripts/generate-sitemap.ts`):
```typescript
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const baseUrl = 'https://quizerjs.com';
const routes = [
  '/',
  '/features',
  '/docs',
  '/docs/guide/getting-started',
  '/docs/installation',
  '/docs/api',
  '/docs/api/parser',
  '/docs/api/serializer',
  '/docs/api/validator',
  '/docs/api/types',
  '/docs/dsl',
  '/docs/dsl/structure',
  '/docs/dsl/question-types',
  '/docs/dsl/validation',
  '/docs/dsl/examples',
  '/docs/examples',
  '/docs/examples/basic',
  '/docs/examples/full-quiz',
  '/docs/examples/interactive',
  '/demos',
  '/demos/editor',
  '/demos/player',
  '/demos/playground',
  '/demos/playground/react',
  '/demos/playground/vue',
  '/demos/playground/svelte',
  '/demos/playground/vanilla',
  '/examples',
  '/community',
  '/community/contributing',
  '/community/code-of-conduct',
  '/community/changelog',
  '/about',
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    route => `  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

writeFileSync(resolve(__dirname, '../site/public/sitemap.xml'), sitemap);
console.log('Sitemap generated successfully');
```

在 `package.json` 中添加脚本：
```json
{
  "scripts": {
    "generate:sitemap": "tsx scripts/generate-sitemap.ts",
    "build": "pnpm generate:sitemap && vite build"
  }
}
```

### robots.txt

```
User-agent: *
Allow: /
Sitemap: https://quizerjs.com/sitemap.xml
```

### 组件测试

**测试 wsx 组件**:

```typescript
// MyComponent.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './MyComponent.wsx'; // 导入组件以触发注册

describe('MyComponent', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('应该正确渲染', () => {
    container.innerHTML = '<my-component title="Test"></my-component>';
    const component = container.querySelector('my-component');
    expect(component).toBeTruthy();
    expect(component?.querySelector('h1')?.textContent).toBe('Test');
  });

  it('应该响应属性变化', () => {
    container.innerHTML = '<my-component title="Initial"></my-component>';
    const component = container.querySelector('my-component');
    component?.setAttribute('title', 'Updated');
    expect(component?.querySelector('h1')?.textContent).toBe('Updated');
  });

  it('应该派发自定义事件', (done) => {
    container.innerHTML = '<my-component></my-component>';
    const component = container.querySelector('my-component');
    
    component?.addEventListener('count-change', (e: Event) => {
      const customEvent = e as CustomEvent;
      expect(customEvent.detail.count).toBe(1);
      done();
    });

    const button = component?.querySelector('button');
    button?.click();
  });
});
```

**测试配置** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import { wsx } from '@wsxjs/wsx-vite-plugin';

export default defineConfig({
  plugins: [wsx()],
  test: {
    environment: 'jsdom', // 需要 DOM 环境
    globals: true,
  },
});
```

## 未来扩展

### 短期（3-6 个月）

- 多语言支持（i18n）
- 更多交互式示例
- 视频教程集成
- 社区论坛链接

### 中期（6-12 个月）

- 在线代码编辑器（Monaco Editor）
- 代码分享功能
- 用户贡献展示
- 性能监控和分析

### 长期（12+ 个月）

- 插件市场
- 模板库
- 云服务集成
- 企业版功能展示

## 风险和挑战

### 技术风险

1. **wsx 语法和工具链成熟度**
   - 风险：wsx (类似 JSX/TSX 的 Web Components 语法) 可能不够成熟，缺少某些功能
   - 缓解：使用稳定的 @wsxjs/wsx-core 版本，必要时使用原生 Web Components

2. **Demo 集成复杂性**
   - 风险：iframe 通信和跨域问题
   - 缓解：使用 postMessage API，处理跨域限制

3. **性能问题**
   - 风险：wsx 编译的 Web Components 可能影响性能
   - 缓解：代码分割、懒加载、性能监控

### 维护风险

1. **内容更新**
   - 风险：文档和示例需要持续更新
   - 缓解：建立内容更新流程，自动化文档生成

2. **Demo 同步**
   - 风险：Demo 更新后需要同步到网站
   - 缓解：自动化构建和部署流程

## 成功标准

### 功能完整性

- [ ] 所有计划页面已实现
- [ ] Playground 功能正常工作
- [ ] 主题和数据同步正常
- [ ] 所有链接和导航正常

### 性能指标

- [ ] 首屏加载时间 < 2s
- [ ] Lighthouse 性能分数 > 90
- [ ] 所有页面响应时间 < 100ms

### SEO 指标

- [ ] 所有页面有完整的 meta 标签
- [ ] 结构化数据验证通过
- [ ] Sitemap 正确生成
- [ ] robots.txt 配置正确

### 用户体验

- [ ] 响应式设计在所有设备上正常
- [ ] 主题切换流畅
- [ ] 导航清晰直观
- [ ] 代码示例可复制和运行

## 参考

- [RFC 0004: 演示站点架构设计](./0004-demo-site-architecture.md)
- [Vite 文档](https://vitejs.dev/)
- [UnoCSS 文档](https://unocss.dev/)
- [wsx 文档](https://wsxjs.dev/) - wsx 是类似 JSX/TSX 的语法，用于编写 Web Components
- [wsx-router 文档](https://wsxjs.dev/router) - Web Components 路由库
- [wsx-view 文档](https://wsxjs.dev/view) - 路由视图组件
- [@wsxjs/wsx-vite-plugin 文档](https://wsxjs.dev/vite-plugin) - Vite 插件
- [GitHub Pages 文档](https://docs.github.com/en/pages)

## 讨论

### 待讨论问题

1. **Demo 嵌入方式**
   - iframe vs 新窗口？
   - 推荐：iframe（更好的用户体验）

2. **路由方案**
   - 自定义路由 vs 使用 wsx-router？
   - 推荐：使用 wsx-router 和 wsx-view（官方路由解决方案，与 wsx 完美集成）

3. **内容管理**
   - 静态内容 vs CMS？
   - 推荐：静态内容（GitHub 管理，版本控制）

4. **多语言支持**
   - 何时实现？
   - 推荐：第二阶段后考虑

### 反馈渠道

- GitHub Issues: 使用 `rfc-0009` 标签
- GitHub Discussions: 在 RFC 讨论区讨论
- PR 评论: 在 RFC PR 中评论

## 关键补充说明

本文档已包含基于 wsxjs 构建网站所需的所有关键信息：

### 已包含的关键内容

1. **wsx 组件开发规范**:
   - ✅ 完整的组件生命周期（constructor, onConnected, onDisconnected, onAttributeChanged）
   - ✅ observedAttributes 静态方法
   - ✅ @state 装饰器使用
   - ✅ @autoRegister 组件注册
   - ✅ 属性传递和类型转换
   - ✅ 事件处理（DOM 事件和自定义事件）
   - ✅ ref 的使用
   - ✅ 组件通信模式（父子、兄弟）
   - ✅ 错误处理和错误边界
   - ✅ 性能优化技巧

2. **UnoCSS 配置**:
   - ✅ 完整的配置示例
   - ✅ 预设和快捷方式配置
   - ✅ 主题定制
   - ✅ 在组件中的使用方式

3. **路由系统**:
   - ✅ wsx-router 和 wsx-view 使用
   - ✅ 声明式嵌套路由定义
   - ✅ 哈希模式和历史模式
   - ✅ 路由变化监听
   - ✅ wsx-link 导航组件

4. **全局状态管理**:
   - ✅ ThemeStore 实现示例
   - ✅ 单例模式
   - ✅ 事件订阅机制
   - ✅ localStorage 持久化

5. **环境变量配置**:
   - ✅ 开发和生产环境变量
   - ✅ Vite 环境变量使用
   - ✅ TypeScript 类型定义

6. **测试配置**:
   - ✅ Vitest 配置
   - ✅ 组件测试示例
   - ✅ jsdom 环境配置

7. **构建和部署**:
   - ✅ Vite 完整配置
   - ✅ HMR 配置
   - ✅ 代码分割
   - ✅ GitHub Actions 工作流
   - ✅ Demo 构建和复制流程

8. **开发工具**:
   - ✅ 调试技巧
   - ✅ 日志系统
   - ✅ 开发模式配置

9. **SEO 和性能**:
   - ✅ Meta 标签配置
   - ✅ 结构化数据
   - ✅ Sitemap 生成脚本
   - ✅ robots.txt 配置

10. **Playground 集成**:
    - ✅ iframe 通信
    - ✅ postMessage API
    - ✅ URL 参数传递
    - ✅ 主题和数据同步

### 实施检查清单

在开始实施前，请确保：

- [ ] 已理解 wsx 组件生命周期和状态管理
- [ ] 已配置 UnoCSS 和 Vite
- [ ] 已理解路由系统（wsx-router 和 wsx-view）
- [ ] 已了解组件通信模式
- [ ] 已配置环境变量
- [ ] 已设置测试环境
- [ ] 已理解构建和部署流程
- [ ] 已了解 Playground 集成方案

### 常见问题

**Q: wsx 组件和 React 组件有什么区别？**
A: wsx 组件最终编译为 Web Components，使用 `@state` 装饰器管理状态，通过 `observedAttributes` 和 `onAttributeChanged` 处理属性，生命周期方法为 `onConnected` 和 `onDisconnected`。

**Q: 如何在 wsx 组件中处理异步操作？**
A: 可以在生命周期方法或事件处理函数中使用 async/await，但需要注意在组件卸载时清理异步操作。

**Q: 如何实现组件间的数据共享？**
A: 可以使用全局状态管理（如 ThemeStore），或通过父组件传递，或使用 CustomEvent 进行跨组件通信。

**Q: wsx 组件支持 TypeScript 吗？**
A: 完全支持，使用 `.wsx` 文件扩展名，TypeScript 会正确识别和类型检查。
