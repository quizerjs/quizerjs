<template>
  <Splitpanes horizontal class="default-theme">
    <Pane :size="50" :min-size="20">
      <div class="preview-section">
        <div class="section-header">
          <span class="section-title">Block Data</span>
        </div>
        <div class="section-content">
          <JsonViewer :code="blockDataPreview" />
        </div>
      </div>
    </Pane>
    <Pane :size="50" :min-size="20">
      <div class="preview-section">
        <div class="section-header">
          <span class="section-title">DSL Preview</span>
        </div>
        <div class="section-content">
          <JsonViewer :code="dslPreview" />
        </div>
      </div>
    </Pane>
  </Splitpanes>
</template>

<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes';
import JsonViewer from './JsonViewer.vue';

interface Props {
  blockDataPreview: string;
  dslPreview: string;
}

defineProps<Props>();
</script>

<style scoped>
.preview-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
  height: 100%;
  width: 100%;
  transition: background-color 0.3s ease;
}

.section-header {
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  padding: 6px 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 32px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.section-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>

