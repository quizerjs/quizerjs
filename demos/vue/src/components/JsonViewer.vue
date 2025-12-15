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
/* 使用全局样式来确保覆盖第三方库的样式 */
</style>

<style>
/* 使用 CSS 变量，从主题系统读取颜色 */
/* 全局样式：强制覆盖 vue-json-view 在暗色模式下的所有元素 */
.json-viewer.theme-dark .vue-json-view,
.json-viewer.theme-dark .vue-json-view *,
.json-viewer.theme-dark [class*='vue-json-view'],
.json-viewer.theme-dark [class*='vue-json-view'] * {
  color: var(--json-text, #839496);
}

/* 强制覆盖所有文本内容，包括括号、标点符号等 */
.json-viewer.theme-dark .vue-json-view,
.json-viewer.theme-dark [class*='vue-json-view'] {
  color: var(--json-text, #839496);
}

/* 确保所有子元素（包括括号）都使用主题文本色 */
.json-viewer.theme-dark .vue-json-view *,
.json-viewer.theme-dark [class*='vue-json-view'] * {
  color: var(--json-text, #839496);
}

/* 特别针对可能包含括号的文本节点 */
.json-viewer.theme-dark .vue-json-view span,
.json-viewer.theme-dark .vue-json-view div,
.json-viewer.theme-dark [class*='vue-json-view'] span,
.json-viewer.theme-dark [class*='vue-json-view'] div {
  color: var(--json-text, #839496);
}

/* 覆盖所有可能的文本元素 */
.json-viewer.theme-dark .vue-json-view div,
.json-viewer.theme-dark .vue-json-view span,
.json-viewer.theme-dark .vue-json-view p,
.json-viewer.theme-dark .vue-json-view label,
.json-viewer.theme-dark [class*='vue-json-view'] div,
.json-viewer.theme-dark [class*='vue-json-view'] span,
.json-viewer.theme-dark [class*='vue-json-view'] p,
.json-viewer.theme-dark [class*='vue-json-view'] label {
  color: var(--json-text, #839496);
}

/* 特别处理所有没有特定类的 span（通常是提示文本如 "items"） */
.json-viewer.theme-dark
  .vue-json-view
  span:not([class*='key']):not([class*='string']):not([class*='number']):not(
    [class*='boolean']
  ):not([class*='null']),
.json-viewer.theme-dark
  [class*='vue-json-view']
  span:not([class*='key']):not([class*='string']):not([class*='number']):not(
    [class*='boolean']
  ):not([class*='null']) {
  color: var(--json-hint, #93a1a1);
}

/* 特别针对显示计数的元素（如 "36 items", "2 items"） */
.json-viewer.theme-dark .vue-json-view [class*='item'],
.json-viewer.theme-dark .vue-json-view [class*='count'],
.json-viewer.theme-dark .vue-json-view [class*='length'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='item'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='count'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='length'] {
  color: var(--json-hint, #93a1a1);
}

/* 确保所有数字在暗色模式下可见（包括计数中的数字） */
.json-viewer.theme-dark .vue-json-view [class*='number'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='number'] {
  color: var(--json-number, #268bd2);
}

/* 覆盖图标和 SVG - 使用 CSS 变量 */
.json-viewer.theme-dark .vue-json-view svg,
.json-viewer.theme-dark .vue-json-view path,
.json-viewer.theme-dark .vue-json-view polygon,
.json-viewer.theme-dark .vue-json-view circle,
.json-viewer.theme-dark .vue-json-view rect,
.json-viewer.theme-dark .vue-json-view [class*='icon'],
.json-viewer.theme-dark .vue-json-view [class*='toggle'] {
  fill: var(--json-text, #839496);
  stroke: var(--json-text, #839496);
  color: var(--json-text, #839496);
  border-color: var(--json-text, #839496);
}

/* 覆盖线条和边框 - 使用 CSS 变量 */
.json-viewer.theme-dark .vue-json-view [class*='line'],
.json-viewer.theme-dark .vue-json-view hr,
.json-viewer.theme-dark .vue-json-view [class*='border'] {
  border-color: var(--json-line, #073642);
  background-color: var(--json-line, #073642);
  color: var(--json-line, #073642);
}

/* 覆盖提示文本（items count） - 使用 CSS 变量 */
.json-viewer.theme-dark .vue-json-view [class*='count'],
.json-viewer.theme-dark .vue-json-view [class*='length'],
.json-viewer.theme-dark .vue-json-view [class*='hint'],
.json-viewer.theme-dark .vue-json-view [class*='item'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='count'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='length'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='hint'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='item'] {
  color: var(--json-hint, #93a1a1);
}

/* 确保所有数字和普通文本可见，包括括号 - 使用 CSS 变量 */
.json-viewer.theme-dark .vue-json-view {
  background-color: var(--json-bg, #002b36);
  color: var(--json-text, #839496);
}

/* 强制所有文本内容（包括括号、标点符号）使用主题文本色 */
.json-viewer.theme-dark .vue-json-view,
.json-viewer.theme-dark .vue-json-view * {
  color: var(--json-text, #839496);
}

/* JSON 语法高亮 - 使用 CSS 变量 */
.json-viewer.theme-dark .vue-json-view [class*='key'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='key'] {
  color: var(--json-key, #2aa198);
}

.json-viewer.theme-dark .vue-json-view [class*='string'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='string'] {
  color: var(--json-string, #859900);
}

.json-viewer.theme-dark .vue-json-view [class*='number'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='number'] {
  color: var(--json-number, #268bd2);
}

.json-viewer.theme-dark .vue-json-view [class*='boolean'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='boolean'] {
  color: var(--json-boolean, #b58900);
}

.json-viewer.theme-dark .vue-json-view [class*='null'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='null'] {
  color: var(--json-null, #586e75);
}

/* 强制覆盖所有可能的文本颜色 - 使用 CSS 变量 */
.json-viewer.theme-dark .vue-json-view,
.json-viewer.theme-dark [class*='vue-json-view'] {
  background-color: var(--json-bg, #002b36);
  color: var(--json-text, #839496);
}

/* 确保所有子元素都使用主题文本色，包括括号和标点符号 */
.json-viewer.theme-dark .vue-json-view *,
.json-viewer.theme-dark [class*='vue-json-view'] * {
  color: var(--json-text, #839496);
}

/* 特别覆盖可能包含括号的元素 - 使用 CSS 变量，提高优先级 */
.json-viewer.theme-dark .vue-json-view [class*='bracket'],
.json-viewer.theme-dark .vue-json-view [class*='brace'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='bracket'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='brace'] {
  color: var(--json-punctuation, #839496) !important;
}

/* 高优先级：确保提示文本（"36 items"）使用正确的颜色 - 必须在符号规则之前 */
.json-viewer.theme-dark .vue-json-view .jv-item-count,
.json-viewer.theme-dark .vue-json-view [class*='jv-item-count'],
.json-viewer.theme-dark .vue-json-view [class*='item'],
.json-viewer.theme-dark .vue-json-view [class*='count'],
.json-viewer.theme-dark .vue-json-view [class*='length'],
.json-viewer.theme-dark .vue-json-view [class*='hint'],
.json-viewer.theme-dark [class*='vue-json-view'] .jv-item-count,
.json-viewer.theme-dark [class*='vue-json-view'] [class*='jv-item-count'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='item'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='count'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='length'],
.json-viewer.theme-dark [class*='vue-json-view'] [class*='hint'] {
  color: var(--json-hint, #93a1a1) !important;
}

/* 高优先级：确保所有符号（括号、冒号、逗号等）使用正确的颜色 */
/* 针对可能包含符号的文本节点 - 排除已处理的类 */
.json-viewer.theme-dark
  .vue-json-view
  span:not([class*='key']):not([class*='string']):not([class*='number']):not(
    [class*='boolean']
  ):not([class*='null']):not([class*='item']):not([class*='count']):not([class*='length']):not(
    [class*='hint']
  ) {
  color: var(--json-punctuation, #839496) !important;
}

.json-viewer.theme-dark
  [class*='vue-json-view']
  span:not([class*='key']):not([class*='string']):not([class*='number']):not(
    [class*='boolean']
  ):not([class*='null']):not([class*='item']):not([class*='count']):not([class*='length']):not(
    [class*='hint']
  ) {
  color: var(--json-punctuation, #839496) !important;
}
</style>

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

/* 当主题为 dark 时，强制覆盖所有内部元素的颜色，确保文本清晰可见 - 使用 CSS 变量 */
.json-viewer.theme-dark :deep(.vue-json-view),
.json-viewer :deep(.vue-json-view[class*='dark']),
.json-viewer :deep(.vue-json-view[data-theme='dark']) {
  background-color: var(--json-bg, #002b36);
  color: var(--json-text, #839496);
}

/* 确保所有文本（包括括号 { } [ ] 和标点符号）在暗色模式下清晰可见 - 使用 CSS 变量 */
.json-viewer.theme-dark :deep(.vue-json-view),
.json-viewer.theme-dark :deep(.vue-json-view *),
.json-viewer :deep(.vue-json-view[class*='dark']),
.json-viewer :deep(.vue-json-view[class*='dark'] *),
.json-viewer :deep(.vue-json-view[data-theme='dark']),
.json-viewer :deep(.vue-json-view[data-theme='dark'] *) {
  color: var(--json-text, #839496);
}

/* 特别确保括号、冒号、逗号等标点符号在暗色模式下清晰可见 - 使用 CSS 变量 */
.json-viewer.theme-dark :deep(.vue-json-view)::before,
.json-viewer.theme-dark :deep(.vue-json-view)::after,
.json-viewer.theme-dark :deep(.vue-json-view *)::before,
.json-viewer.theme-dark :deep(.vue-json-view *)::after,
.json-viewer :deep(.vue-json-view[class*='dark'])::before,
.json-viewer :deep(.vue-json-view[class*='dark'])::after,
.json-viewer :deep(.vue-json-view[class*='dark'] *)::before,
.json-viewer :deep(.vue-json-view[class*='dark'] *)::after,
.json-viewer :deep(.vue-json-view[data-theme='dark'])::before,
.json-viewer :deep(.vue-json-view[data-theme='dark'])::after,
.json-viewer :deep(.vue-json-view[data-theme='dark'] *)::before,
.json-viewer :deep(.vue-json-view[data-theme='dark'] *)::after {
  color: var(--json-punctuation, #839496);
}

/* 覆盖 vue-json-view 内部所有文本元素，确保在暗色模式下使用主题文本色 */
.json-viewer.theme-dark :deep(.vue-json-view *),
.json-viewer :deep(.vue-json-view[class*='dark'] *),
.json-viewer :deep(.vue-json-view[data-theme='dark'] *) {
  color: var(--json-text, #839496);
}

/* 通用规则：确保所有文本、数字、标签在暗色模式下可见 */
.json-viewer.theme-dark :deep(.vue-json-view div),
.json-viewer.theme-dark :deep(.vue-json-view span),
.json-viewer.theme-dark :deep(.vue-json-view p),
.json-viewer.theme-dark :deep(.vue-json-view label),
.json-viewer :deep(.vue-json-view[class*='dark'] div),
.json-viewer :deep(.vue-json-view[class*='dark'] span),
.json-viewer :deep(.vue-json-view[class*='dark'] p),
.json-viewer :deep(.vue-json-view[class*='dark'] label),
.json-viewer :deep(.vue-json-view[data-theme='dark'] div),
.json-viewer :deep(.vue-json-view[data-theme='dark'] span),
.json-viewer :deep(.vue-json-view[data-theme='dark'] p),
.json-viewer :deep(.vue-json-view[data-theme='dark'] label) {
  color: inherit;
}

/* 覆盖图标（展开/折叠箭头），确保在暗色模式下可见 - 使用 CSS 变量 */
.json-viewer.theme-dark :deep(.vue-json-view .jv-toggle),
.json-viewer.theme-dark :deep(.vue-json-view .jv-icon),
.json-viewer.theme-dark :deep(.vue-json-view [class*='icon']),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-toggle),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-icon),
.json-viewer :deep(.vue-json-view[class*='dark'] [class*='icon']),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-toggle),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-icon),
.json-viewer :deep(.vue-json-view[data-theme='dark'] [class*='icon']) {
  color: var(--json-text, #839496);
  border-color: var(--json-text, #839496);
  fill: var(--json-text, #839496);
  stroke: var(--json-text, #839496);
}

/* 覆盖线条（缩进线、边框），确保在暗色模式下可见 - 使用 CSS 变量 */
.json-viewer.theme-dark :deep(.vue-json-view .jv-line),
.json-viewer.theme-dark :deep(.vue-json-view [class*='line']),
.json-viewer.theme-dark :deep(.vue-json-view hr),
.json-viewer.theme-dark :deep(.vue-json-view [class*='border']),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-line),
.json-viewer :deep(.vue-json-view[class*='dark'] [class*='line']),
.json-viewer :deep(.vue-json-view[class*='dark'] hr),
.json-viewer :deep(.vue-json-view[class*='dark'] [class*='border']),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-line),
.json-viewer :deep(.vue-json-view[data-theme='dark'] [class*='line']),
.json-viewer :deep(.vue-json-view[data-theme='dark'] hr),
.json-viewer :deep(.vue-json-view[data-theme='dark'] [class*='border']) {
  border-color: var(--json-line, #073642);
  background-color: var(--json-line, #073642);
  color: var(--json-line, #073642);
}

/* 覆盖提示文本（如 "36 items", "2 items"），确保在暗色模式下可见 - 使用 CSS 变量，提高优先级 */
.json-viewer.theme-dark :deep(.vue-json-view .jv-item-count),
.json-viewer.theme-dark :deep(.vue-json-view [class*='count']),
.json-viewer.theme-dark :deep(.vue-json-view [class*='length']),
.json-viewer.theme-dark :deep(.vue-json-view [class*='hint']),
.json-viewer.theme-dark :deep(.vue-json-view [class*='item']),
.json-viewer.theme-dark
  :deep(
    .vue-json-view
      span:not([class*='key']):not([class*='string']):not([class*='number']):not(
        [class*='boolean']
      ):not([class*='null'])
  ),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-item-count),
.json-viewer :deep(.vue-json-view[class*='dark'] [class*='count']),
.json-viewer :deep(.vue-json-view[class*='dark'] [class*='length']),
.json-viewer :deep(.vue-json-view[class*='dark'] [class*='hint']),
.json-viewer
  :deep(
    .vue-json-view[class*='dark']
      span:not([class*='key']):not([class*='string']):not([class*='number']):not(
        [class*='boolean']
      ):not([class*='null'])
  ),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-item-count),
.json-viewer :deep(.vue-json-view[data-theme='dark'] [class*='count']),
.json-viewer :deep(.vue-json-view[data-theme='dark'] [class*='length']),
.json-viewer :deep(.vue-json-view[data-theme='dark'] [class*='hint']),
.json-viewer
  :deep(
    .vue-json-view[data-theme='dark']
      span:not([class*='key']):not([class*='string']):not([class*='number']):not(
        [class*='boolean']
      ):not([class*='null'])
  ) {
  color: var(--json-hint, #93a1a1) !important;
}

/* 高优先级：确保符号（括号、冒号、逗号等）使用正确的颜色 */
.json-viewer.theme-dark
  :deep(
    .vue-json-view
      span:not([class*='key']):not([class*='string']):not([class*='number']):not(
        [class*='boolean']
      ):not([class*='null']):not([class*='item']):not([class*='count']):not([class*='length']):not(
        [class*='hint']
      )
  ),
.json-viewer
  :deep(
    .vue-json-view[class*='dark']
      span:not([class*='key']):not([class*='string']):not([class*='number']):not(
        [class*='boolean']
      ):not([class*='null']):not([class*='item']):not([class*='count']):not([class*='length']):not(
        [class*='hint']
      )
  ),
.json-viewer
  :deep(
    .vue-json-view[data-theme='dark']
      span:not([class*='key']):not([class*='string']):not([class*='number']):not(
        [class*='boolean']
      ):not([class*='null']):not([class*='item']):not([class*='count']):not([class*='length']):not(
        [class*='hint']
      )
  ) {
  color: var(--json-punctuation, #839496) !important;
}

/* 覆盖所有 SVG 和路径元素，确保在暗色模式下可见 - 使用 CSS 变量 */
.json-viewer.theme-dark :deep(.vue-json-view svg),
.json-viewer.theme-dark :deep(.vue-json-view path),
.json-viewer.theme-dark :deep(.vue-json-view polygon),
.json-viewer.theme-dark :deep(.vue-json-view circle),
.json-viewer.theme-dark :deep(.vue-json-view rect),
.json-viewer :deep(.vue-json-view[class*='dark'] svg),
.json-viewer :deep(.vue-json-view[class*='dark'] path),
.json-viewer :deep(.vue-json-view[class*='dark'] polygon),
.json-viewer :deep(.vue-json-view[class*='dark'] circle),
.json-viewer :deep(.vue-json-view[class*='dark'] rect),
.json-viewer :deep(.vue-json-view[data-theme='dark'] svg),
.json-viewer :deep(.vue-json-view[data-theme='dark'] path),
.json-viewer :deep(.vue-json-view[data-theme='dark'] polygon),
.json-viewer :deep(.vue-json-view[data-theme='dark'] circle),
.json-viewer :deep(.vue-json-view[data-theme='dark'] rect) {
  fill: var(--json-text, #839496);
  stroke: var(--json-text, #839496);
  color: var(--json-text, #839496);
}

/* 覆盖 JSON 语法高亮的颜色，确保在暗色模式下可见 - 使用 CSS 变量 */
.json-viewer.theme-dark :deep(.vue-json-view .jv-key),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-key),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-key) {
  color: var(--json-key, #2aa198);
}

.json-viewer.theme-dark :deep(.vue-json-view .jv-string),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-string),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-string) {
  color: var(--json-string, #859900);
}

.json-viewer.theme-dark :deep(.vue-json-view .jv-number),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-number),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-number) {
  color: var(--json-number, #268bd2);
}

.json-viewer.theme-dark :deep(.vue-json-view .jv-boolean),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-boolean),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-boolean) {
  color: var(--json-boolean, #b58900);
}

.json-viewer.theme-dark :deep(.vue-json-view .jv-null),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-null),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-null) {
  color: var(--json-null, #586e75);
}

.json-viewer.theme-dark :deep(.vue-json-view .jv-ellipsis),
.json-viewer :deep(.vue-json-view[class*='dark'] .jv-ellipsis),
.json-viewer :deep(.vue-json-view[data-theme='dark'] .jv-ellipsis) {
  color: var(--json-text, #839496);
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

/* 暗色模式下的空状态和错误状态 */
.json-viewer.theme-dark .json-viewer-empty {
  color: var(--text-tertiary, #808080);
}

.json-viewer.theme-dark .error-message {
  color: var(--error-color, #ff6b6b);
}

.json-viewer.theme-dark .error-code {
  background: var(--bg-secondary, #252525);
  color: var(--text-primary, #e0e0e0);
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

/* 暗色模式下的滚动条样式 */
.json-viewer.theme-dark :deep(.vue-json-view)::-webkit-scrollbar-track,
.json-viewer :deep(.vue-json-view[class*='dark'])::-webkit-scrollbar-track,
.json-viewer :deep(.vue-json-view[data-theme='dark'])::-webkit-scrollbar-track {
  background: var(--bg-secondary, #252525);
}

.json-viewer.theme-dark :deep(.vue-json-view)::-webkit-scrollbar-thumb,
.json-viewer :deep(.vue-json-view[class*='dark'])::-webkit-scrollbar-thumb,
.json-viewer :deep(.vue-json-view[data-theme='dark'])::-webkit-scrollbar-thumb {
  background: var(--border-color, #555);
}

.json-viewer.theme-dark :deep(.vue-json-view)::-webkit-scrollbar-thumb:hover,
.json-viewer :deep(.vue-json-view[class*='dark'])::-webkit-scrollbar-thumb:hover,
.json-viewer :deep(.vue-json-view[data-theme='dark'])::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary, #777);
}
</style>
