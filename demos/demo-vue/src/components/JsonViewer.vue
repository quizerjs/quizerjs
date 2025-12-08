<template>
  <div class="json-viewer">
    <ssh-pre v-if="formattedCode" language="json" class="json-viewer-highlight">
      {{ formattedCode }}
    </ssh-pre>
    <div v-else class="json-viewer-empty">// 暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SshPre from 'simple-syntax-highlighter';
import 'simple-syntax-highlighter/dist/sshpre.css';

interface Props {
  code: string;
}

const props = defineProps<Props>();

const formattedCode = computed(() => {
  if (!props.code || props.code.trim() === '') {
    return '';
  }

  try {
    // 尝试解析并格式化 JSON
    const parsed = JSON.parse(props.code);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // 如果不是有效的 JSON，返回原始代码
    return props.code;
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

.json-viewer-highlight {
  flex: 1;
  margin: 0;
  min-height: 0;
  overflow: auto;
  border-radius: 4px;
}

.json-viewer-highlight :deep(pre) {
  margin: 0;
  padding: 1rem;
  height: 100%;
  font-size: 0.875rem;
  line-height: 1.6;
}

.json-viewer-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-family:
    'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Fira Mono', 'Droid Sans Mono',
    'Source Code Pro', 'Courier New', monospace;
  font-size: 0.875rem;
  padding: 1rem;
}

/* 自定义滚动条样式 */
.json-viewer-highlight::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.json-viewer-highlight::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

.json-viewer-highlight::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.json-viewer-highlight::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
