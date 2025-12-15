<template>
  <div class="app" :class="{ 'theme-dark': isDark }">
    <AppHeader
      v-model:selected-test-data-id="selectedTestDataId"
      @test-data-change="handleTestDataChange"
    />

    <main class="app-main">
      <Splitpanes v-if="isSplitpanesReady" class="default-theme" key="main-split">
        <Pane :size="50" :min-size="20" key="editor-pane">
          <EditorPanel
            ref="editorPanelRef"
            :initialDSL="currentTestDSL"
            @change="handleChange"
            @save="handleSave"
          />
        </Pane>
        <Pane :size="50" :min-size="20" key="preview-pane">
          <PreviewSplitpanes :block-data-preview="blockDataPreview" :dsl-preview="dslPreview" />
        </Pane>
      </Splitpanes>
      <div v-else class="app-main-loading">Loading...</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, provide } from 'vue';
import { dslToBlock } from '@quizerjs/core';
import type { QuizDSL } from '@quizerjs/dsl';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import AppHeader from './components/AppHeader.vue';
import EditorPanel from './components/EditorPanel.vue';
import PreviewSplitpanes from './components/PreviewSplitpanes.vue';
import { testDataList, defaultTestDataId, getTestDataById } from './test-data';

// 当前选中的测试数据 ID
const selectedTestDataId = ref<string>(defaultTestDataId);

// 控制 splitpanes 的渲染，确保 DOM 准备好
const isSplitpanesReady = ref(false);

// 主题管理
const THEME_STORAGE_KEY = 'quizerjs-demo-theme';
const getInitialTheme = (): boolean => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      return saved === 'dark';
    }
    // 检测系统偏好
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  } catch {
    // 如果 localStorage 或 matchMedia 不可用，默认浅色主题
  }
  return false;
};
const isDark = ref<boolean>(getInitialTheme());

// 提供主题状态给子组件
provide('isDark', isDark);

// 监听系统主题变化
onMounted(async () => {
  // 等待 DOM 完全渲染后再显示 splitpanes
  // 使用 setTimeout 确保所有组件都已正确初始化
  await nextTick();
  setTimeout(() => {
    isSplitpanesReady.value = true;
  }, 0);

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    // 只有在用户没有手动设置主题时才跟随系统
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      isDark.value = e.matches;
    }
  };
  mediaQuery.addEventListener('change', handleSystemThemeChange);
});

// 当前选中的测试数据 DSL
const currentTestDSL = computed(() => {
  return getTestDataById(selectedTestDataId.value) || testDataList[0].dsl;
});

// 初始化预览数据：
// 1. DSL Preview: 直接使用 initialDSL
// 2. Block Data Preview: 使用 dslToBlock 转换 initialDSL
const dslPreview = ref<string>('');
const blockDataPreview = ref<string>('');
const editorPanelRef = ref<{
  load: (dsl: QuizDSL) => Promise<void>;
  getEditorInstance: () => any;
} | null>(null);

// 更新预览数据
const updatePreview = (dsl: QuizDSL) => {
  dslPreview.value = JSON.stringify(dsl, null, 2);
  const blockData = dslToBlock(dsl);
  blockDataPreview.value = JSON.stringify(blockData, null, 2);
};

// 初始化预览数据
updatePreview(currentTestDSL.value);

// 处理测试数据切换
const handleTestDataChange = async () => {
  const newDSL = currentTestDSL.value;
  if (editorPanelRef.value && newDSL) {
    try {
      await editorPanelRef.value.load(newDSL);
      updatePreview(newDSL);
    } catch (error) {
      console.error('加载测试数据失败:', error);
    }
  }
};

const handleChange = async (dsl: QuizDSL) => {
  // 更新 DSL Preview
  dslPreview.value = JSON.stringify(dsl, null, 2);

  // 更新 Block Data Preview: 从编辑器获取最新的 block data
  if (editorPanelRef.value) {
    const editorInstance = editorPanelRef.value.getEditorInstance();
    if (editorInstance) {
      try {
        const blockData = await editorInstance.save();
        blockDataPreview.value = JSON.stringify(blockData, null, 2);
      } catch (error) {
        console.error('获取 block data 失败:', error);
      }
    }
  }

  console.log('DSL 变化:', dsl);
};

const handleSave = async (dsl: QuizDSL) => {
  // 更新 DSL Preview
  dslPreview.value = JSON.stringify(dsl, null, 2);

  // 更新 Block Data Preview: 从编辑器获取最新的 block data
  if (editorPanelRef.value) {
    const editorInstance = editorPanelRef.value.getEditorInstance();
    if (editorInstance) {
      try {
        const blockData = await editorInstance.save();
        blockDataPreview.value = JSON.stringify(blockData, null, 2);
      } catch (error) {
        console.error('获取 block data 失败:', error);
      }
    }
  }

  console.log('保存的 DSL:', dsl);
};
</script>

<style scoped>
/* CSS 变量定义 - 浅色主题 */
.app {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #fafafa;
  --border-color: #e0e0e0;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --accent-color: #4a90e2;
  --accent-hover: #357abd;
  --shadow: rgba(0, 0, 0, 0.1);
}

/* CSS 变量定义 - 深色主题 */
.app.theme-dark {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252525;
  --bg-tertiary: #2d2d2d;
  --border-color: #3a3a3a;
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
  --text-tertiary: #808080;
  --accent-color: #5a9de2;
  --accent-hover: #4a8dd2;
  --shadow: rgba(0, 0, 0, 0.3);
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* 主内容区 - 充分利用空间 */
.app-main {
  flex: 1;
  overflow: hidden;
  background: var(--bg-secondary);
  min-height: 0;
  transition: background-color 0.3s ease;
}

/* Splitpanes 样式覆盖 */
.app-main :deep(.splitpanes) {
  height: 100%;
  width: 100%;
}

.app-main :deep(.splitpanes__pane) {
  overflow: hidden;
}

.app-main :deep(.splitpanes__splitter) {
  background: var(--border-color);
  transition: background 0.2s;
}

.app-main :deep(.splitpanes__splitter:hover) {
  background: var(--accent-color);
}

.app-main-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  font-size: 14px;
  transition: color 0.3s ease;
}

/* 响应式 */
@media (max-width: 1024px) {
  /* 在小屏幕上，分割视图会自动适应 */
  .app-main {
    flex-direction: column;
  }
}
</style>
