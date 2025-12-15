<template>
  <div class="json-viewer" :class="{ 'theme-dark': isDark }">
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

/* 使用更具体的选择器来覆盖第三方库的样式 */
.json-viewer :deep(.vue-json-view) {
  flex: 1;
  overflow: auto;
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  background-color: var(--bg-primary, #fff);
  color: var(--text-primary, #333);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* 当主题为 dark 时，强制覆盖所有内部元素的颜色，确保文本清晰可见 */
.json-viewer.theme-dark :deep(.vue-json-view),
.json-viewer :deep(.vue-json-view[class*='dark']),
.json-viewer :deep(.vue-json-view[data-theme='dark']) {
  background-color: var(--bg-primary, #1e1e1e);
  color: var(--text-primary, #e0e0e0);
}

/* 覆盖 vue-json-view 内部所有文本元素，确保在暗色模式下使用浅色 */
.json-viewer.theme-dark :deep(.vue-json-view *),
.json-viewer :deep(.vue-json-view[class*='dark'] *),
.json-viewer :deep(.vue-json-view[data-theme='dark'] *) {
  color: var(--text-primary, #e0e0e0);
}

/* 覆盖 JSON 语法高亮的颜色，确保在暗色模式下可见 */
.json-viewer.theme-dark :deep(.vue-json-view .jv-key),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-key),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-key) {
  color: #9cdcfe;
}

.json-viewer.theme-dark :deep(.vue-json-view .jv-string),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-string),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-string) {
  color: #ce9178;
}

.json-viewer.theme-dark :deep(.vue-json-view .jv-number),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-number),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-number) {
  color: #b5cea8;
}

.json-viewer.theme-dark :deep(.vue-json-view .jv-boolean),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-boolean),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-boolean) {
  color: #569cd6;
}

.json-viewer.theme-dark :deep(.vue-json-view .jv-null),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-null),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-null) {
  color: #808080;
}

.json-viewer.theme-dark :deep(.vue-json-view .jv-ellipsis),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-ellipsis),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-ellipsis) {
  color: var(--text-primary, #e0e0e0);
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
  color: var(--error-color, #e74c3c);
  font-weight: 500;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
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
