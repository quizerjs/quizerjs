<template>
  <div class="app" :class="{ 'theme-dark': isDark }">
    <AppHeader
      v-model:selected-test-data-id="selectedTestDataId"
      @test-data-change="handleTestDataChange"
    />

    <main class="app-main">
      <PanelGroup v-if="isPanelsReady" direction="vertical" class="main-panel-group">
        <!-- 顶部：Editor 和 Player -->
        <Panel :defaultSize="60" :minSize="30" class="top-panel">
          <PanelGroup direction="horizontal" class="top-panel-group">
            <Panel :defaultSize="50" :minSize="20" class="panel">
              <EditorPanel
                ref="editorPanelRef"
                :initialDSL="currentTestDSL"
                @change="handleChange"
                @save="handleSave"
              />
            </Panel>
            <PanelResizeHandle class="resize-handle" />
            <Panel :defaultSize="50" :minSize="20" class="panel">
              <PlayerPanel :dsl-preview="dslPreview" />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle class="resize-handle horizontal" />
        <!-- 底部：Block Data 和 DSL Preview -->
        <Panel :defaultSize="40" :minSize="20" class="bottom-panel">
          <PanelGroup direction="horizontal" class="bottom-panel-group">
            <Panel :defaultSize="50" :minSize="20" class="panel">
              <DataPanel title="Block Data" :code="blockDataPreview" />
            </Panel>
            <PanelResizeHandle class="resize-handle" />
            <Panel :defaultSize="50" :minSize="20" class="panel">
              <DataPanel title="DSL Preview" :code="dslPreview" />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
      <div v-else class="app-main-loading">Loading...</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, provide } from 'vue';
import { dslToBlock } from '@quizerjs/core';
import type { QuizDSL } from '@quizerjs/dsl';
import { Panel, PanelGroup, PanelResizeHandle } from 'vue-resizable-panels';
import AppHeader from './components/AppHeader.vue';
import EditorPanel from './components/EditorPanel.vue';
import PlayerPanel from './components/PlayerPanel.vue';
import DataPanel from './components/DataPanel.vue';
import { sampleDataList, defaultSampleDataId, getSampleDataById } from '@quizerjs/sample-data';
import { useTheme } from './composables/useTheme';

// 当前选中的测试数据 ID
const selectedTestDataId = ref<string>(defaultSampleDataId);

// 控制 panels 的渲染，确保 DOM 准备好
const isPanelsReady = ref(false);

// 主题管理 - 使用 composable
const { isDark, toggleTheme } = useTheme();

// 提供主题状态和切换函数给子组件
provide('isDark', isDark);
provide('toggleTheme', toggleTheme);

// 等待 DOM 完全渲染后再显示 panels
onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    isPanelsReady.value = true;
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

/* vue-resizable-panels 样式覆盖 */
.app-main :deep(.main-panel-group),
.app-main :deep(.top-panel-group),
.app-main :deep(.bottom-panel-group) {
  height: 100%;
  width: 100%;
}

.app-main :deep(.top-panel),
.app-main :deep(.bottom-panel) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-main :deep(.panel) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

/* 分割器样式 - vue-resizable-panels PanelResizeHandle */
/* vue-resizable-panels 使用 data-panel-group-direction 属性 */
/* 水平方向的分割器（垂直排列的面板之间） */
.app-main [data-panel-resize-handle-id][data-panel-group-direction='horizontal'] {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  width: 4px;
  min-width: 4px;
  max-width: 4px;
  background: var(--border-color);
  cursor: col-resize;
  transition: background-color 0.2s ease;
}

.app-main [data-panel-resize-handle-id][data-panel-group-direction='horizontal']:hover {
  background: var(--accent-color);
}

/* 垂直方向的分割器（水平排列的面板之间） */
.app-main [data-panel-resize-handle-id][data-panel-group-direction='vertical'] {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  height: 4px;
  min-height: 4px;
  max-height: 4px;
  background: var(--border-color);
  cursor: row-resize;
  transition: background-color 0.2s ease;
}

.app-main [data-panel-resize-handle-id][data-panel-group-direction='vertical']:hover {
  background: var(--accent-color);
}

/* 通过类名选择器（备用方案） */
.app-main :deep(.resize-handle) {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: background-color 0.2s ease;
  background: var(--border-color);
}

.app-main :deep(.resize-handle.horizontal) {
  height: 4px;
  min-height: 4px;
  max-height: 4px;
  cursor: row-resize;
}

.app-main :deep(.resize-handle:not(.horizontal)) {
  width: 4px;
  min-width: 4px;
  max-width: 4px;
  cursor: col-resize;
}

.app-main :deep(.resize-handle:hover) {
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
