# HMR 配置说明

## 确保 HMR 正常工作的关键配置

### 1. Vite 配置 (`vite.config.ts`)

已配置以下关键设置：

1. **直接 alias 指向源码**：
   ```typescript
   alias: {
     '@quizerjs/vue': path.resolve(__dirname, '../../packages/vue/src'),
     '@quizerjs/quizerjs': path.resolve(__dirname, '../../packages/quizerjs/src'),
     '@quizerjs/core': path.resolve(__dirname, '../../packages/core/src'),
     '@quizerjs/dsl': path.resolve(__dirname, '../../packages/dsl/src'),
     '@quizerjs/editorjs-tool': path.resolve(__dirname, '../../packages/editorjs-tool/src'),
   }
   ```
   这确保 Vite 直接使用源码文件，而不是构建后的文件。

2. **优先使用 source 字段**：
   ```typescript
   conditions: ['source', 'import', 'module', 'browser', 'default']
   ```
   这会优先使用 package.json 中的 `exports.source` 字段。

3. **排除依赖预构建**：
   ```typescript
   optimizeDeps: {
     exclude: ['@quizerjs/vue', '@quizerjs/quizerjs', ...],
     force: true, // 强制重新预构建
   }
   ```

4. **监听源码变化**：
   ```typescript
   watch: {
     ignored: ['!**/node_modules/@quizerjs/**', '!**/packages/**', '!**/demos/**'],
   }
   ```

### 2. Package.json 配置

所有 workspace 包都需要在 `exports` 中配置 `source` 字段：

```json
{
  "exports": {
    ".": {
      "source": "./src/index.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 3. 开发工作流

**推荐方式**：

1. **启动 demo-vue**：
   ```bash
   pnpm demo-vue:dev
   ```

2. **同时启动相关包的 watch 模式**（如果需要）：
   ```bash
   # 在另一个终端
   pnpm --filter @quizerjs/core dev
   pnpm --filter @quizerjs/editorjs-tool dev
   ```

**注意**：由于使用了 alias 直接指向源码，通常不需要同时运行包的 watch 模式，Vite 会直接使用源码文件。

### 4. 验证 HMR 是否工作

1. 修改 `demos/demo-vue/src/App.vue` 中的内容
2. 保存文件
3. 浏览器应该自动更新，无需刷新

如果 HMR 不工作：
- 检查浏览器控制台是否有错误
- 检查 Vite 终端输出
- 尝试手动刷新页面
- 检查文件路径是否正确

### 5. 常见问题

**问题**：修改 workspace 包的源码后，demo 没有更新

**解决方案**：
- 确保 `vite.config.ts` 中的 alias 路径正确
- 确保包的 `package.json` 中有 `exports.source` 字段
- 检查 Vite 是否正在监听文件变化（查看终端输出）

**问题**：HMR 导致页面刷新而不是热更新

**解决方案**：
- 检查是否有语法错误
- 检查是否有循环依赖
- 尝试重启开发服务器

