<template>
  <div class="data-panel">
    <div class="panel-header">
      <span class="panel-title">{{ title }}</span>
    </div>
    <div class="panel-content">
      <JsonViewer :code="code" />
    </div>
  </div>
</template>

<script setup lang="ts">
import JsonViewer from './JsonViewer.vue';

interface Props {
  title: string;
  code: string;
}

defineProps<Props>();
</script>

<style scoped>
.data-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
  height: 100%;
  width: 100%;
  transition: background-color 0.3s ease;
}

.panel-header {
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

.panel-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.panel-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-content :deep(.json-viewer) {
  border-radius: 0;
  flex: 1;
  min-height: 0;
}
</style>
