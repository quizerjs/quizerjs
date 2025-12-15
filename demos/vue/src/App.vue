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
import { useTheme } from './composables/useTheme';

// 当前选中的测试数据 ID
const selectedTestDataId = ref<string>(defaultTestDataId);

// 控制 splitpanes 的渲染，确保 DOM 准备好
const isSplitpanesReady = ref(false);

// 主题管理 - 使用 composable
const { isDark, toggleTheme } = useTheme();

// 提供主题状态和切换函数给子组件
provide('isDark', isDark);
provide('toggleTheme', toggleTheme);

// 等待 DOM 完全渲染后再显示 splitpanes
onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    isSplitpanesReady.value = true;
  }, 0);
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
/* CSS 变量定义 - Solarized Light 主题 */
.app {
  /* Solarized Light 基础色 */
  --base03: #002b36;
  --base02: #073642;
  --base01: #586e75;
  --base00: #657b83;
  --base0: #839496;
  --base1: #93a1a1;
  --base2: #eee8d5;
  --base3: #fdf6e3;
  /* Solarized Light 强调色 */
  --yellow: #b58900;
  --orange: #cb4b16;
  --red: #dc322f;
  --magenta: #d33682;
  --violet: #6c71c4;
  --blue: #268bd2;
  --cyan: #2aa198;
  --green: #859900;
  /* 应用颜色变量 - Solarized Light */
  --bg-primary: var(--base3);
  --bg-secondary: var(--base2);
  --bg-tertiary: #fafafa;
  --border-color: var(--base1);
  --text-primary: var(--base00);
  --text-secondary: var(--base01);
  --text-tertiary: var(--base0);
  --accent-color: var(--blue);
  --accent-hover: var(--cyan);
  --error-color: var(--red);
  --shadow: rgba(0, 0, 0, 0.1);
  /* JSON 查看器颜色 - Solarized Light */
  --json-bg: var(--base3);
  --json-text: var(--base00);
  --json-key: var(--blue);
  --json-string: var(--green);
  --json-number: var(--magenta);
  --json-boolean: var(--yellow);
  --json-null: var(--base01);
  --json-punctuation: var(--base00);
  --json-hint: var(--base0);
  --json-line: var(--base2);
}

/* CSS 变量定义 - Solarized Dark 主题 */
.app.theme-dark {
  /* Solarized Dark 基础色 */
  --base03: #002b36;
  --base02: #073642;
  --base01: #586e75;
  --base00: #657b83;
  --base0: #839496;
  --base1: #93a1a1;
  --base2: #eee8d5;
  --base3: #fdf6e3;
  /* Solarized Dark 强调色 */
  --yellow: #b58900;
  --orange: #cb4b16;
  --red: #dc322f;
  --magenta: #d33682;
  --violet: #6c71c4;
  --blue: #268bd2;
  --cyan: #2aa198;
  --green: #859900;
  /* 应用颜色变量 - Solarized Dark */
  --bg-primary: var(--base03);
  --bg-secondary: var(--base02);
  --bg-tertiary: #0a4a5a;
  --border-color: var(--base01);
  --text-primary: var(--base0);
  --text-secondary: var(--base1);
  --text-tertiary: var(--base00);
  --accent-color: var(--blue);
  --accent-hover: var(--cyan);
  --error-color: var(--red);
  --shadow: rgba(0, 0, 0, 0.3);
  /* JSON 查看器颜色 - Solarized Dark */
  --json-bg: var(--base03);
  --json-text: var(--base0);
  --json-key: var(--cyan);
  --json-string: var(--green);
  --json-number: var(--blue);
  --json-boolean: var(--yellow);
  --json-null: var(--base01);
  --json-punctuation: var(--base0);
  --json-hint: var(--base1);
  --json-line: var(--base02);
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
