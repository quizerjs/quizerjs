<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <h1>Editor(quizerjs) Demo</h1>
      </div>
    </header>

    <main class="app-main">
      <div class="editor-panel">
        <div class="panel-header">
          <span class="panel-title">Editor</span>
        </div>
        <div class="panel-content">
          <QuizEditor ref="editorRef" @change="handleChange" @save="handleSave" />
        </div>
      </div>

      <div class="preview-panel">
        <div class="preview-section">
          <div class="section-header">
            <span class="section-title">Block Data</span>
          </div>
          <div class="section-content">
            <JsonViewer :code="blockDataPreview" />
          </div>
        </div>
        <div class="preview-section">
          <div class="section-header">
            <span class="section-title">DSL Preview</span>
          </div>
          <div class="section-content">
            <JsonViewer :code="dslPreview" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QuizEditor } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';
import JsonViewer from './components/JsonViewer.vue';

const dslPreview = ref<string>('');
const blockDataPreview = ref<string>('');
const editorRef = ref<InstanceType<typeof QuizEditor> | null>(null);

const handleChange = async (dsl: QuizDSL) => {
  dslPreview.value = JSON.stringify(dsl, null, 2);

  // 获取 Editor.js block data
  if (editorRef.value) {
    const editorInstance = editorRef.value.getEditorInstance();
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
  dslPreview.value = JSON.stringify(dsl, null, 2);

  // 获取 Editor.js block data
  if (editorRef.value) {
    const editorInstance = editorRef.value.getEditorInstance();
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
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f5f5;
}

/* 紧凑的顶部栏 - 类似 jsbin */
.app-header {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.header-content {
  width: 100%;
}

.app-header h1 {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: #333;
  line-height: 1;
}

/* 主内容区 - 充分利用空间 */
.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  overflow: hidden;
  background: #f5f5f5;
  min-height: 0;
}

/* 面板样式 - 类似 jsbin 的标签页 */
.editor-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border-right: 1px solid #e0e0e0;
}

.preview-panel {
  border-right: none;
}

/* 面板标题栏 - 类似 jsbin 的标签 */
.panel-header {
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  padding: 6px 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 32px;
}

.panel-title {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 预览区域样式 - 上下分栏 */
.preview-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-bottom: 1px solid #e0e0e0;
}

.preview-section:last-child {
  border-bottom: none;
}

.section-header {
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  padding: 6px 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 32px;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 面板内容区 - 关键 flex 布局 */
.panel-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Editor 样式 */
.panel-content :deep(.quiz-editor) {
  flex: 1;
  min-height: 0;
  border: none;
  border-radius: 0;
  padding: 12px;
  overflow-y: auto;
  background: #fff;
  color: #333;
}

/* JsonViewer 样式调整 */
.section-content :deep(.json-viewer) {
  border-radius: 0;
}

.section-content :deep(.json-viewer-highlight) {
  border-radius: 0;
}

.section-content :deep(.json-viewer-highlight pre) {
  padding: 12px;
  margin: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .app-main {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    border-top: 1px solid #e0e0e0;
    border-right: none;
  }
}
</style>
