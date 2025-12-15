<template>
  <div class="editor-panel">
    <div class="panel-header">
      <span class="panel-title">Editor</span>
    </div>
    <div class="panel-content">
      <QuizEditor
        ref="editorRef"
        :initialDSL="initialDSL"
        @change="handleChange"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QuizEditor } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';

interface Props {
  initialDSL: QuizDSL;
}

interface Emits {
  (e: 'change', dsl: QuizDSL): void;
  (e: 'save', dsl: QuizDSL): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const editorRef = ref<InstanceType<typeof QuizEditor> | null>(null);

// 处理事件
const handleChange = (dsl: QuizDSL) => {
  emit('change', dsl);
};

const handleSave = (dsl: QuizDSL) => {
  emit('save', dsl);
};

// 暴露方法给父组件
defineExpose({
  editorRef,
  load: async (dsl: QuizDSL) => {
    if (editorRef.value) {
      await editorRef.value.load(dsl);
    }
  },
  getEditorInstance: () => {
    return editorRef.value?.getEditorInstance() || null;
  },
});
</script>

<style scoped>
.editor-panel {
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-content :deep(.quiz-editor) {
  flex: 1;
  min-height: 0;
  border: none;
  border-radius: 0;
  padding: 12px;
  overflow-y: auto;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
</style>
