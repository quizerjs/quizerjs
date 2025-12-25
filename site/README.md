# QuizerJS Site

QuizerJS 开源网站项目，使用 wsx (Web Components with JSX syntax) 构建。

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 构建

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 测试

```bash
# 运行测试
pnpm test

# 监听模式
pnpm test:watch

# UI 模式
pnpm test:ui
```

## 项目结构

```
site/
├── src/
│   ├── components/     # wsx Web Components
│   ├── router/        # 路由配置
│   ├── store/         # 状态管理
│   ├── utils/         # 工具函数
│   ├── App.wsx        # 根组件
│   └── main.ts        # 入口文件
├── public/            # 静态资源
└── scripts/           # 构建脚本
```

## 技术栈

- **wsx**: Web Components with JSX syntax
- **UnoCSS**: 原子化 CSS 引擎
- **Vite**: 构建工具
- **TypeScript**: 类型安全

## 部署

网站部署在 GitHub Pages 上，通过 GitHub Actions 自动构建和部署。

详见 [RFC 0009](../../docs/rfc/0009-quizerjs-com-website.md)。

