# Demo 中 QuizPlayer 展示设计指南

本文档提供了在 Demo 应用中设计和展示 `QuizPlayer` 的最佳实践和设计模式。

## 目录

1. [基础布局设计](#基础布局设计)
2. [容器样式设计](#容器样式设计)
3. [响应式设计](#响应式设计)
4. [状态管理](#状态管理)
5. [错误处理](#错误处理)
6. [交互设计](#交互设计)
7. [完整示例](#完整示例)

---

## 基础布局设计

### 1. 简单全屏布局

适用于独立的 Player Demo，最大化展示空间。

```html
<div class="app">
  <header class="app-header">
    <!-- 标题和控制按钮 -->
  </header>
  <main class="app-main">
    <div class="player-container"></div>
  </main>
</div>
```

**CSS 样式：**

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.player-container {
  flex: 1;
  min-height: 600px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}
```

### 2. 分割视图布局

适用于编辑器 + 播放器组合 Demo，使用 Splitpanes 或类似组件。

### 3. 卡片式布局

适用于展示多个 Player 或需要突出显示的场景。

---

## 容器样式设计

- 使用 `min-height`、`position: relative`、`overflow: hidden`
- 使用 CSS 变量支持深色主题：`var(--bg-primary)`, `var(--text-primary)`
- 加载状态可用 `loading` 类 + `::before` / `::after` 展示

---

## 响应式设计

- 移动端：减小 padding、min-height，小屏下去掉 border-radius
- 平板与大屏：适当调整 padding 与 max-width

---

## 状态管理

- 明确区分 loading、playing、completed
- 正确在 onMounted/onBeforeUnmount（或等价生命周期）中 init/destroy Player
- 及时清理 player 实例

---

## 错误处理

- 提供用户友好的错误信息与重试按钮
- 针对常见错误（如容器未找到、依赖未安装）给出提示

---

## 交互设计

- 工具栏：返回、提交、重置、重新开始
- 结果面板：得分、是否通过、答题时长

---

## 最佳实践总结

1. **容器设计** — 足够 min-height，relative + overflow，合适 padding
2. **状态管理** — loading/playing/completed 清晰，生命周期内 init/destroy
3. **错误处理** — 友好提示与重试
4. **响应式** — 移动端与多端适配
5. **主题** — CSS 变量与可访问性对比度
