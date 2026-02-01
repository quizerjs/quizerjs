<template>
  <div class="right-panel">
    <!-- Top Right: Block Data -->
    <div class="panel-section">
      <div class="panel-header">Block Data</div>
      <div class="panel-content">
        <pre>{{ blockDataPreview }}</pre>
      </div>
    </div>

    <!-- Bottom Right: DSL Preview -->
    <div class="panel-section">
      <div class="panel-header">DSL Preview</div>
      <div class="panel-content">
        <pre>{{ dslPreview }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { Panel, PanelGroup, PanelResizeHandle } from 'vue-resizable-panels';
// import DataPanel from '../components/DataPanel.vue';
import { useQuizState } from '../composables/useQuizState';

// Access shared state
// Only this component will re-render when these refs change
const { dslPreview, blockDataPreview } = useQuizState();
</script>

<style scoped>
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.panel-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-bottom: 1px solid var(--border-color);
}

.panel-header {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.panel-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: var(--bg-primary);
}

pre {
  margin: 0;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-primary);
}
</style>
