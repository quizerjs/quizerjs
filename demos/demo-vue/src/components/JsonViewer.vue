<template>
  <div class="json-viewer">
    <VueJsonView
      v-if="parsedData !== null"
      :src="parsedData"
      :theme="theme"
      :deep="10"
      :show-double-quotes="false"
      :show-length="true"
      :show-line-number="false"
      :highlight-mouseover-node="true"
      :collapsed-on-click-brackets="true"
    />
    <div v-else-if="code && code.trim() !== ''" class="json-viewer-error">
      <div class="error-message">Invalid JSON</div>
      <pre class="error-code">{{ code }}</pre>
    </div>
    <div v-else class="json-viewer-empty">// 暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import VueJsonView from '@matpool/vue-json-view';

interface Props {
  code: string;
}

const props = defineProps<Props>();

// 从父组件注入主题状态
const isDarkRef = inject<{ value: boolean } | undefined>('isDark');
const isDark = computed(() => isDarkRef?.value ?? false);
const theme = computed(() => (isDark.value ? 'dark' : 'chrome'));

const parsedData = computed(() => {
  if (!props.code || props.code.trim() === '') {
    return null;
  }

  try {
    // 尝试解析 JSON
    return JSON.parse(props.code);
  } catch {
    // 如果不是有效的 JSON，返回 null
    return null;
  }
});
</script>

<style scoped>
.json-viewer {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.json-viewer :deep(.vue-json-view) {
  flex: 1;
  overflow: auto;
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #333);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.json-viewer-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary, #999);
  font-family:
    'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Fira Mono', 'Droid Sans Mono',
    'Source Code Pro', 'Courier New', monospace;
  font-size: 0.875rem;
  padding: 1rem;
  transition: color 0.3s ease;
}

.json-viewer-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow: auto;
}

.error-message {
  color: #e74c3c;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.error-code {
  flex: 1;
  margin: 0;
  padding: 0.75rem;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 4px;
  font-family:
    'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Fira Mono', 'Droid Sans Mono',
    'Source Code Pro', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-primary, #333);
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* 自定义滚动条样式 */
.json-viewer :deep(.vue-json-view)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.json-viewer :deep(.vue-json-view)::-webkit-scrollbar-track {
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.json-viewer :deep(.vue-json-view)::-webkit-scrollbar-thumb {
  background: var(--border-color, #ccc);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.json-viewer :deep(.vue-json-view)::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary, #999);
}
</style>
