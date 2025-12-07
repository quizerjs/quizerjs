# 发布指南

本文档说明如何将 quizerjs 包发布到 npm。

## 发布前准备

### 1. 登录 npm

```bash
npm login
# 或使用访问令牌
npm login --auth-type=legacy
```

### 2. 检查登录状态

```bash
npm whoami
```

### 3. 创建或加入 @quizerjs 组织

发布到 `@quizerjs` 命名空间需要：

**选项 A：创建 npm 组织**
1. 访问 https://www.npmjs.com/org/create
2. 创建名为 `quizerjs` 的组织
3. 确保你的账户是组织的所有者或成员

**选项 B：使用个人账户（临时方案）**
如果暂时无法创建组织，可以：
1. 先发布到个人命名空间（如 `@your-username/quizerjs-core`）
2. 后续迁移到 `@quizerjs` 组织

### 4. 验证组织权限

```bash
# 检查是否有权限发布到 @quizerjs
npm access ls-packages @quizerjs
```

## 发布步骤

### 1. 构建所有包

```bash
# 在项目根目录
pnpm install
pnpm build
```

### 2. 检查包内容

```bash
cd packages/core
npm pack --dry-run
```

这会显示将要发布的文件列表。

### 3. 测试发布（dry-run）

```bash
cd packages/core
npm publish --dry-run
```

### 4. 实际发布

**发布单个包：**

```bash
cd packages/core
npm publish
```

**发布所有包（使用 pnpm）：**

```bash
# 在项目根目录
pnpm -r publish
```

## 常见问题

### 错误：404 Not Found - @quizerjs/core is not in this registry

**原因**：
- `@quizerjs` 组织不存在
- 你的账户没有该组织的权限
- npm 访问令牌过期

**解决方案**：

1. **检查组织是否存在**：
   ```bash
   npm view @quizerjs/core
   ```

2. **创建组织**：
   - 访问 https://www.npmjs.com/org/create
   - 创建 `quizerjs` 组织

3. **重新登录**：
   ```bash
   npm logout
   npm login
   ```

4. **验证权限**：
   ```bash
   npm access ls-packages @quizerjs
   ```

### 错误：Access token expired or revoked

**解决方案**：

```bash
# 重新登录
npm logout
npm login

# 或使用访问令牌
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN
```

### 错误：You do not have permission to publish

**解决方案**：

1. 确认你是 `@quizerjs` 组织的成员
2. 确认你有发布权限
3. 联系组织管理员添加权限

## 版本管理

### 发布新版本

1. 更新版本号：
   ```bash
   # 在 package.json 中更新版本
   # 或使用 npm version
   npm version patch  # 0.0.0 -> 0.0.1
   npm version minor  # 0.0.1 -> 0.1.0
   npm version major  # 0.1.0 -> 1.0.0
   ```

2. 构建：
   ```bash
   pnpm build
   ```

3. 发布：
   ```bash
   npm publish
   ```

### 发布标签

默认发布到 `latest` 标签。要发布到其他标签：

```bash
npm publish --tag beta
npm publish --tag alpha
```

安装时指定标签：
```bash
npm install @quizerjs/core@beta
```

## 自动化发布

可以使用 GitHub Actions 自动化发布流程。示例工作流：

```yaml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm -r publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 检查清单

发布前确认：

- [ ] 所有包已构建（`pnpm build`）
- [ ] 版本号已更新
- [ ] 已登录 npm（`npm whoami`）
- [ ] 有 `@quizerjs` 组织权限
- [ ] 已通过 dry-run 测试
- [ ] README 和文档已更新
- [ ] CHANGELOG 已更新

## 相关链接

- [npm 组织文档](https://docs.npmjs.com/organizations)
- [npm 发布文档](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [语义化版本](https://semver.org/)

