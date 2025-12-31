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

```html
<div class="app">
  <Splitpanes>
    <Pane :size="50">
      <!-- 编辑器 -->
    </Pane>
    <Pane :size="50">
      <div class="player-container"></div>
    </Pane>
  </Splitpanes>
</div>
```

**CSS 样式：**

```css
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.player-container {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-primary);
}
```

### 3. 卡片式布局

适用于展示多个 Player 或需要突出显示的场景。

```html
<div class="player-card">
  <div class="player-card-header">
    <h3>测验标题</h3>
  </div>
  <div class="player-card-body">
    <div class="player-container"></div>
  </div>
  <div class="player-card-footer">
    <!-- 操作按钮 -->
  </div>
</div>
```

**CSS 样式：**

```css
.player-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.player-card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.player-card-body {
  flex: 1;
  padding: 2rem;
  min-height: 500px;
}

.player-card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
```

---

## 容器样式设计

### 1. 基础容器样式

```css
.player-container {
  /* 尺寸 */
  width: 100%;
  height: 100%;
  min-height: 600px;
  
  /* 背景和边框 */
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* 内边距 */
  padding: 2rem;
  
  /* 定位和溢出 */
  position: relative;
  overflow: hidden;
  
  /* 过渡效果 */
  transition: all 0.3s ease;
}
```

### 2. 深色主题支持

```css
.player-container {
  background-color: var(--bg-primary, #fff);
  color: var(--text-primary, #333);
}

/* 深色主题 */
.theme-dark .player-container {
  background-color: var(--bg-primary, #1e1e1e);
  color: var(--text-primary, #e0e0e0);
}
```

### 3. 加载状态样式

```css
.player-container {
  position: relative;
}

.player-container.loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.player-container.loading::after {
  content: '加载中...';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 11;
  color: #666;
}
```

---

## 响应式设计

### 1. 移动端适配

```css
.player-container {
  padding: 1rem;
  min-height: 400px;
}

@media (max-width: 768px) {
  .player-container {
    padding: 0.5rem;
    min-height: 300px;
    border-radius: 0;
  }
  
  .app-main {
    padding: 1rem;
  }
}
```

### 2. 平板适配

```css
@media (min-width: 769px) and (max-width: 1024px) {
  .player-container {
    padding: 1.5rem;
    min-height: 500px;
  }
}
```

### 3. 大屏幕优化

```css
@media (min-width: 1400px) {
  .player-container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## 状态管理

### 1. Vanilla JS 实现

```typescript
class PlayerDemo {
  private playerInstance: QuizPlayer | null = null;
  private playerContainerRef: HTMLElement | null = null;
  private isPlaying = false;
  private resultDSL: ResultDSL | null = null;
  private error: string | null = null;

  private async initPlayer() {
    if (!this.playerContainerRef || this.playerInstance) {
      return;
    }

    try {
      // 设置加载状态
      this.playerContainerRef.classList.add('loading');
      this.error = null;
      this.isPlaying = false;
      this.resultDSL = null;

      // 清空容器
      this.playerContainerRef.innerHTML = '';

      const options: QuizPlayerOptions = {
        container: this.playerContainerRef,
        quizDSL: this.getCurrentDSL(),
        onSubmit: (result) => {
          this.resultDSL = result;
          this.isPlaying = false;
        },
        onAnswerChange: (questionId, answer) => {
          console.log('答案变更:', questionId, answer);
        },
        showResults: true,
      };

      this.playerInstance = new QuizPlayer(options);
      await this.playerInstance.init();
      
      // 移除加载状态
      this.playerContainerRef.classList.remove('loading');
      this.isPlaying = true;
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.playerContainerRef?.classList.remove('loading');
      this.playerInstance = null;
    }
  }
}
```

### 2. Vue 实现

```vue
<template>
  <div class="player-wrapper">
    <!-- 加载状态 -->
    <div v-if="loading" class="player-loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="player-error">
      <strong>错误:</strong> {{ error }}
      <button @click="retry">重试</button>
    </div>

    <!-- 播放器容器 -->
    <div
      v-show="!loading && !error"
      ref="playerContainer"
      class="player-container"
      :class="{ 'is-playing': isPlaying }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { QuizPlayer } from '@quizerjs/quizerjs';
import type { QuizPlayerOptions, ResultDSL } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';

const props = defineProps<{
  quizDSL: QuizDSL;
}>();

const emit = defineEmits<{
  submit: [result: ResultDSL];
  answerChange: [questionId: string, answer: any];
}>();

const playerContainer = ref<HTMLElement | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const isPlaying = ref(false);
let player: QuizPlayer | null = null;

const initPlayer = async () => {
  if (!playerContainer.value || player) return;

  try {
    loading.value = true;
    error.value = null;

    const options: QuizPlayerOptions = {
      container: playerContainer.value,
      quizDSL: props.quizDSL,
      onSubmit: (result) => {
        emit('submit', result);
        isPlaying.value = false;
      },
      onAnswerChange: (questionId, answer) => {
        emit('answerChange', questionId, answer);
      },
      showResults: true,
    };

    player = new QuizPlayer(options);
    await player.init();
    
    loading.value = false;
    isPlaying.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
    loading.value = false;
    player = null;
  }
};

const retry = () => {
  if (player) {
    player.destroy();
    player = null;
  }
  initPlayer();
};

onMounted(() => {
  initPlayer();
});

onBeforeUnmount(async () => {
  if (player) {
    await player.destroy();
    player = null;
  }
});
</script>
```

---

## 错误处理

### 1. 错误显示样式

```css
.player-error {
  padding: 2rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  text-align: center;
}

.player-error strong {
  display: block;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.player-error button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}
```

### 2. 错误处理逻辑

```typescript
try {
  await player.init();
} catch (error) {
  // 显示用户友好的错误信息
  if (error instanceof Error) {
    if (error.message.includes('@slidejs')) {
      this.error = 'SlideJS 包未安装，请运行: pnpm install @slidejs/runner-swiper';
    } else if (error.message.includes('Container')) {
      this.error = '容器元素未找到，请检查 DOM 结构';
    } else {
      this.error = `初始化失败: ${error.message}`;
    }
  } else {
    this.error = '未知错误，请查看控制台';
  }
  
  console.error('Player 初始化错误:', error);
}
```

---

## 交互设计

### 1. 工具栏设计

```html
<div class="player-toolbar">
  <div class="toolbar-left">
    <button @click="goBack">← 返回</button>
    <span class="toolbar-title">测验播放器</span>
  </div>
  <div class="toolbar-right">
    <button v-if="isPlaying" @click="submit" class="btn-primary">
      提交答案
    </button>
    <button v-if="isPlaying" @click="reset" class="btn-secondary">
      重置
    </button>
    <button v-if="resultDSL" @click="restart" class="btn-primary">
      重新开始
    </button>
  </div>
</div>
```

**CSS 样式：**

```css
.player-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #357abd;
}

.btn-secondary {
  padding: 0.5rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
```

### 2. 结果显示区域

```html
<div v-if="resultDSL" class="result-panel">
  <h3>测验结果</h3>
  <div class="result-stats">
    <div class="stat-item">
      <span class="stat-label">得分:</span>
      <span class="stat-value">
        {{ resultDSL.scoring.totalScore }} / {{ resultDSL.scoring.maxScore }}
        ({{ resultDSL.scoring.percentage.toFixed(1) }}%)
      </span>
    </div>
    <div class="stat-item">
      <span class="stat-label">状态:</span>
      <span class="stat-value" :class="resultDSL.scoring.passed ? 'passed' : 'failed'">
        {{ resultDSL.scoring.passed ? '✅ 通过' : '❌ 未通过' }}
      </span>
    </div>
    <div class="stat-item">
      <span class="stat-label">答题时长:</span>
      <span class="stat-value">
        {{ formatDuration(resultDSL.metadata.duration) }}
      </span>
    </div>
  </div>
</div>
```

**CSS 样式：**

```css
.result-panel {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.stat-value {
  color: #2c3e50;
  font-weight: 600;
}

.stat-value.passed {
  color: #4caf50;
}

.stat-value.failed {
  color: #f44336;
}
```

---

## 完整示例

### Vanilla JS 完整示例

```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { WebComponent, autoRegister, state } from '@wsxjs/wsx-core';
import { QuizPlayer, type QuizPlayerOptions } from '@quizerjs/quizerjs';
import type { QuizDSL, ResultDSL } from '@quizerjs/dsl';
import './App.css';

@autoRegister({ tagName: 'quiz-player-demo' })
export class PlayerDemo extends WebComponent {
  @state private isPlaying = false;
  @state private resultDSL: ResultDSL | null = null;
  @state private error: string | null = null;

  private playerInstance: QuizPlayer | null = null;
  private playerContainerRef: HTMLElement | null = null;

  onDisconnected() {
    if (this.playerInstance) {
      this.playerInstance.destroy();
      this.playerInstance = null;
    }
  }

  private async initPlayer() {
    if (!this.playerContainerRef || this.playerInstance) return;

    try {
      this.error = null;
      this.isPlaying = false;
      this.resultDSL = null;
      this.playerContainerRef.innerHTML = '';

      const options: QuizPlayerOptions = {
        container: this.playerContainerRef,
        quizDSL: this.getQuizDSL(),
        onSubmit: (result) => {
          this.resultDSL = result;
          this.isPlaying = false;
        },
        onAnswerChange: (questionId, answer) => {
          console.log('答案变更:', questionId, answer);
        },
        showResults: true,
      };

      this.playerInstance = new QuizPlayer(options);
      await this.playerInstance.init();
      this.isPlaying = true;
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.playerInstance = null;
    }
  }

  private handleSubmit = () => {
    if (this.playerInstance) {
      this.playerInstance.submit();
    }
  };

  private handleReset = () => {
    if (this.playerInstance) {
      this.playerInstance.reset();
      this.resultDSL = null;
      this.isPlaying = true;
    }
  };

  private handleRestart = async () => {
    if (this.playerInstance) {
      await this.playerInstance.destroy();
      this.playerInstance = null;
    }
    await this.initPlayer();
  };

  render() {
    return (
      <div class="app">
        <header class="app-header">
          <h1>QuizPlayer Demo</h1>
          <div class="header-controls">
            {this.isPlaying && (
              <>
                <button class="btn-primary" onClick={this.handleSubmit}>
                  提交答案
                </button>
                <button class="btn-secondary" onClick={this.handleReset}>
                  重置
                </button>
              </>
            )}
            {this.resultDSL && (
              <button class="btn-primary" onClick={this.handleRestart}>
                重新开始
              </button>
            )}
          </div>
        </header>

        <main class="app-main">
          {this.error && (
            <div class="error-message">
              <strong>错误:</strong> {this.error}
            </div>
          )}

          <div
            ref={el => {
              this.playerContainerRef = el;
              this.initPlayer();
            }}
            class="player-container"
          />

          {this.resultDSL && (
            <div class="result-panel">
              <h3>测验结果</h3>
              <div class="result-stats">
                <div class="stat-item">
                  <span class="stat-label">得分:</span>
                  <span class="stat-value">
                    {this.resultDSL.scoring.totalScore} / {this.resultDSL.scoring.maxScore} (
                    {this.resultDSL.scoring.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">状态:</span>
                  <span class={`stat-value ${this.resultDSL.scoring.passed ? 'passed' : 'failed'}`}>
                    {this.resultDSL.scoring.passed ? '✅ 通过' : '❌ 未通过'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }
}
```

### Vue 完整示例

```vue
<template>
  <div class="player-demo">
    <header class="demo-header">
      <h1>QuizPlayer Demo</h1>
      <div class="header-controls">
        <button
          v-if="isPlaying"
          @click="handleSubmit"
          class="btn-primary"
        >
          提交答案
        </button>
        <button
          v-if="isPlaying"
          @click="handleReset"
          class="btn-secondary"
        >
          重置
        </button>
        <button
          v-if="resultDSL"
          @click="handleRestart"
          class="btn-primary"
        >
          重新开始
        </button>
      </div>
    </header>

    <main class="demo-main">
      <div v-if="error" class="error-message">
        <strong>错误:</strong> {{ error }}
        <button @click="retry">重试</button>
      </div>

      <QuizPlayer
        v-if="quizDSL"
        ref="playerRef"
        :quiz-dsl="quizDSL"
        :show-results="true"
        @submit="handlePlayerSubmit"
        @answer-change="handleAnswerChange"
      />

      <div v-if="resultDSL" class="result-panel">
        <h3>测验结果</h3>
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">得分:</span>
            <span class="stat-value">
              {{ resultDSL.scoring.totalScore }} / {{ resultDSL.scoring.maxScore }}
              ({{ resultDSL.scoring.percentage.toFixed(1) }}%)
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">状态:</span>
            <span
              class="stat-value"
              :class="resultDSL.scoring.passed ? 'passed' : 'failed'"
            >
              {{ resultDSL.scoring.passed ? '✅ 通过' : '❌ 未通过' }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QuizPlayer } from '@quizerjs/vue';
import type { QuizDSL, ResultDSL } from '@quizerjs/dsl';
import type { AnswerValue } from '@quizerjs/quizerjs';

const props = defineProps<{
  quizDSL: QuizDSL;
}>();

const playerRef = ref<InstanceType<typeof QuizPlayer> | null>(null);
const isPlaying = ref(true);
const resultDSL = ref<ResultDSL | null>(null);
const error = ref<string | null>(null);

const handlePlayerSubmit = (result: ResultDSL) => {
  resultDSL.value = result;
  isPlaying.value = false;
};

const handleAnswerChange = (questionId: string, answer: AnswerValue) => {
  console.log('答案变更:', questionId, answer);
};

const handleSubmit = () => {
  if (playerRef.value) {
    playerRef.value.submit();
  }
};

const handleReset = () => {
  if (playerRef.value) {
    playerRef.value.reset();
    resultDSL.value = null;
    isPlaying.value = true;
  }
};

const handleRestart = () => {
  resultDSL.value = null;
  isPlaying.value = true;
  // 重新加载组件或重置状态
};

const retry = () => {
  error.value = null;
  handleRestart();
};
</script>

<style scoped>
.player-demo {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-header {
  padding: 1rem 2rem;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.demo-main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.error-message {
  padding: 1rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
  margin-bottom: 1rem;
}

.result-panel {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
```

---

## 最佳实践总结

1. **容器设计**
   - 使用 `min-height` 确保有足够空间
   - 添加 `position: relative` 和 `overflow: hidden` 防止布局问题
   - 使用合适的 `padding` 和 `border-radius` 提升视觉效果

2. **状态管理**
   - 明确区分 `loading`、`playing`、`completed` 状态
   - 正确处理生命周期（init、destroy）
   - 及时清理资源

3. **错误处理**
   - 提供用户友好的错误信息
   - 提供重试机制
   - 记录详细错误日志

4. **响应式设计**
   - 移动端优化 padding 和字体大小
   - 使用 `flex` 布局适应不同屏幕
   - 考虑横屏和竖屏场景

5. **交互设计**
   - 提供清晰的操作按钮
   - 显示加载状态
   - 及时反馈用户操作

6. **主题支持**
   - 使用 CSS 变量支持主题切换
   - 考虑深色模式
   - 保持对比度符合可访问性标准
