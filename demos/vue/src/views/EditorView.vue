<template>
  <div class="editor-view">
    <PanelGroup direction="horizontal" class="main-panel-group">
      <!-- Left: Editor -->
      <Panel :defaultSize="50" :minSize="20" class="panel editor-panel-wrapper">
        <EditorPanel
          ref="editorPanelRef"
          :initialDSL="currentTestDSL"
          @change="handleChange"
          @save="handleSave"
        />
      </Panel>

      <PanelResizeHandle class="resize-handle" />

      <!-- Right: Data -->
      <Panel :defaultSize="50" :minSize="20" class="panel">
        <PanelGroup direction="vertical">
          <!-- Top Right: Block Data -->
          <Panel :defaultSize="50" :minSize="20" class="panel">
            <DataPanel title="Block Data" :code="blockDataPreview" />
          </Panel>

          <PanelResizeHandle class="resize-handle horizontal" />

          <!-- Bottom Right: DSL Preview -->
          <Panel :defaultSize="50" :minSize="20" class="panel">
            <DataPanel title="DSL Preview" :code="dslPreview" />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Panel, PanelGroup, PanelResizeHandle } from 'vue-resizable-panels';
import EditorPanel from '../components/EditorPanel.vue';
import DataPanel from '../components/DataPanel.vue';
import { useQuizState } from '../composables/useQuizState';
import type { QuizDSL } from '@quizerjs/dsl';

const { currentTestDSL, updatePreviews, dslPreview, blockDataPreview } = useQuizState();
const editorPanelRef = ref<any>(null);

// Initialize previews on mount
onMounted(() => {
  if (currentTestDSL.value) {
    updatePreviews(currentTestDSL.value);
  }
});

// Watch for DSL changes (e.g. sample change) to reload editor
watch(currentTestDSL, async newDSL => {
  if (editorPanelRef.value && newDSL) {
    try {
      await editorPanelRef.value.load(newDSL);
      updatePreviews(newDSL);
    } catch (e) {
      console.error(e);
    }
  }
});

const handleChange = async (dsl: QuizDSL) => {
  if (editorPanelRef.value) {
    const editorInstance = editorPanelRef.value.getEditorInstance();
    if (editorInstance) {
      try {
        const blockData = await editorInstance.save();
        updatePreviews(dsl, blockData);
      } catch (error) {
        console.error('Failed to get block data:', error);
      }
    }
  }
};

const handleSave = handleChange;
</script>

<style scoped>
.editor-view {
  height: 100%;
  width: 100%;
}
.main-panel-group {
  height: 100%;
  width: 100%;
}
.panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Resize Handles */
.resize-handle {
  flex-shrink: 0;
  background: var(--border-color);
  transition: background 0.2s;
  position: relative;
  z-index: 10;
}

.resize-handle:not(.horizontal) {
  width: 8px; /* Wider hit area */
  cursor: col-resize;
  background: transparent;
  display: flex;
  justify-content: center;
}

.resize-handle:not(.horizontal)::after {
  content: '';
  width: 1px;
  height: 100%;
  background: var(--border-color);
}

.resize-handle.horizontal {
  height: 8px;
  cursor: row-resize;
  background: transparent;
  display: flex;
  align-items: center;
}

.resize-handle.horizontal::after {
  content: '';
  height: 1px;
  width: 100%;
  background: var(--border-color);
}

.resize-handle:hover::after,
.resize-handle:active::after {
  background: var(--accent-color);
  width: 2px; /* Thicker on hover */
  height: 100%;
}

.resize-handle.horizontal:hover::after,
.resize-handle.horizontal:active::after {
  height: 2px;
  width: 100%;
}
</style>
