# quizerjs 文档

本目录包含 quizerjs 项目的完整文档，使用 VitePress 构建。

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

## 文档结构

```
docs/
├── .vitepress/          # VitePress 配置
│   ├── config.ts        # 配置文件
│   └── theme/           # 主题自定义
├── index.md             # 首页
├── guide/               # 指南
│   ├── index.md
│   ├── getting-started.md
│   └── installation.md
├── dsl/                 # DSL 规范
│   ├── index.md
│   ├── structure.md
│   ├── question-types.md
│   ├── validation.md
│   ├── examples.md
│   └── error-codes.md
├── api/                 # API 参考
│   ├── index.md
│   ├── validator.md
│   ├── parser.md
│   ├── serializer.md
│   └── types.md
├── examples/            # 示例
│   ├── index.md
│   ├── basic-validation.md
│   └── full-quiz.md
└── rfc/                 # RFC 文档
    ├── index.md
    └── *.md
```

## GitHub Pages 部署

文档会自动通过 GitHub Actions 部署到 GitHub Pages。

### 手动部署

1. 构建文档：
   ```bash
   pnpm docs:build
   ```

2. 部署到 `gh-pages` 分支：
   ```bash
   git subtree push --prefix docs/.vitepress/dist origin gh-pages
   ```

## 相关链接

- [VitePress 文档](https://vitepress.dev/)
- [GitHub 仓库](https://github.com/wsxjs/quizerjs)
