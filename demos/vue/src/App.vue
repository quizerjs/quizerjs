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
import { sampleDataList, defaultSampleDataId, getSampleDataById } from '@quizerjs/sample-data';
import { useTheme } from './composables/useTheme';

// 当前选中的测试数据 ID
const selectedTestDataId = ref<string>(defaultSampleDataId);

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
  return getSampleDataById(selectedTestDataId.value) || sampleDataList[0].dsl;
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
/* 使用 @quizerjs/theme 的 CSS 变量 */
/* 将自定义变量映射到 --quiz-* 变量，保持向后兼容 */
.app {
  /* 映射到 @quizerjs/theme 的 CSS 变量 */
  --bg-primary: var(--quiz-bg-primary);
  --bg-secondary: var(--quiz-bg-secondary);
  --bg-tertiary: var(--quiz-bg-tertiary);
  --border-color: var(--quiz-border-color);
  --text-primary: var(--quiz-text-primary);
  --text-secondary: var(--quiz-text-secondary);
  --text-tertiary: var(--quiz-text-tertiary);
  --accent-color: var(--quiz-accent-color);
  --accent-hover: var(--quiz-accent-hover);
  --error-color: var(--quiz-error-color);
  --shadow: var(--quiz-shadow-sm);

  /* JSON 查看器颜色 - 使用主题变量 */
  --json-bg: var(--quiz-bg-primary);
  --json-text: var(--quiz-text-primary);
  --json-key: var(--quiz-accent-color);
  --json-string: var(--quiz-success-color);
  --json-number: var(--quiz-info-color);
  --json-boolean: var(--quiz-warning-color);
  --json-null: var(--quiz-text-secondary);
  --json-punctuation: var(--quiz-text-primary);
  --json-hint: var(--quiz-text-tertiary);
  --json-line: var(--quiz-bg-secondary);
}

/* 深色主题 - 使用 theme-dark 类或 data-theme="dark" */
.app.theme-dark {
  /* 深色主题的 CSS 变量已由 @quizerjs/theme/solarized-dark.css 提供 */
  /* 这里只需要覆盖 JSON 查看器的特定颜色（如果需要） */
  --json-key: var(--quiz-accent-color);
  --json-number: var(--quiz-info-color);
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
