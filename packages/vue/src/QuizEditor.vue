<template>
  <div ref="editorContainer" class="quiz-editor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { QuizEditor } from '@quizerjs/quizerjs';
import type { QuizEditorOptions } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';

export interface QuizEditorProps {
  /** 初始 DSL 数据（可选） */
  initialDSL?: QuizDSL;
  /** 只读模式（可选，默认 false） */
  readOnly?: boolean;
}

export interface QuizEditorEmits {
  /** 数据变化事件 */
  (e: 'change', dsl: QuizDSL): void;
  /** 保存事件 */
  (e: 'save', dsl: QuizDSL): void;
}

const props = withDefaults(defineProps<QuizEditorProps>(), {
  initialDSL: undefined,
  readOnly: false,
});

const emit = defineEmits<QuizEditorEmits>();

const editorContainer = ref<HTMLElement | null>(null);
let editor: QuizEditor | null = null;

onMounted(async () => {
  if (!editorContainer.value) return;

  try {
    const options: QuizEditorOptions = {
      container: editorContainer.value,
      initialDSL: props.initialDSL,
      readOnly: props.readOnly,
      onChange: (dsl) => {
        emit('change', dsl);
      },
      onSave: (dsl) => {
        emit('save', dsl);
      },
    };

    editor = new QuizEditor(options);
    await editor.init();
  } catch (error) {
    console.error('初始化 QuizEditor 失败:', error);
  }
});

onBeforeUnmount(async () => {
  if (editor) {
    await editor.destroy();
    editor = null;
  }
});

watch(
  () => props.initialDSL,
  async (newDsl) => {
    if (editor && newDsl) {
      await editor.load(newDsl);
    }
  },
  { deep: true }
);

watch(
  () => props.readOnly,
  (newReadOnly) => {
    if (editor) {
      editor.getEditorInstance()?.readOnly.toggle(newReadOnly);
    }
  }
);

/**
 * 保存编辑器数据
 */
const save = async (): Promise<QuizDSL | null> => {
  if (!editor) return null;
  const dsl = await editor.save();
  emit('save', dsl);
  return dsl;
};

/**
 * 暴露方法供父组件调用
 */
defineExpose({
  save,
  load: async (dsl: QuizDSL) => {
    if (editor) {
      await editor.load(dsl);
    }
  },
  clear: async () => {
    if (editor) {
      await editor.clear();
    }
  },
  isDirty: () => editor?.isDirty || false,
  getEditorInstance: () => editor?.getEditorInstance() || null,
});
</script>

<style scoped>
.quiz-editor {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
