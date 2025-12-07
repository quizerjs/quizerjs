<template>
  <div ref="editorContainer" class="quiz-editor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { QuizEditor } from '@quizerjs/quizerjs';
import type { QuizEditorOptions } from '@quizerjs/quizerjs';
import type { OutputData } from '@editorjs/editorjs';

export interface QuizEditorProps {
  /** 初始数据（可选） */
  initialData?: OutputData;
}

export interface QuizEditorEmits {
  /** 数据变化事件 */
  (e: 'change', data: OutputData): void;
  /** 保存事件 */
  (e: 'save', data: OutputData): void;
}

const props = withDefaults(defineProps<QuizEditorProps>(), {
  initialData: undefined,
});

const emit = defineEmits<QuizEditorEmits>();

const editorContainer = ref<HTMLElement | null>(null);
let editor: QuizEditor | null = null;

onMounted(async () => {
  if (!editorContainer.value) return;

  try {
    const options: QuizEditorOptions = {
      container: editorContainer.value,
    };

    if (props.initialData) {
      options.initialData = props.initialData;
    }

    editor = new QuizEditor(options);
    await editor.init();

    // 定期检查数据变化（Editor.js 没有内置的 onChange 事件）
    const interval = setInterval(async () => {
      if (editor) {
        try {
          const data = await editor.save();
          emit('change', data);
        } catch (error) {
          // 忽略保存错误（可能编辑器正在初始化）
        }
      }
    }, 1000);

    // 清理定时器
    onBeforeUnmount(() => {
      clearInterval(interval);
    });
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

/**
 * 保存编辑器数据
 */
const save = async (): Promise<OutputData | null> => {
  if (!editor) return null;
  const data = await editor.save();
  emit('save', data);
  return data;
};

/**
 * 暴露方法供父组件调用
 */
defineExpose({
  save,
  getEditorInstance: () => editor?.getEditorInstance() || null,
});
</script>

<style scoped>
.quiz-editor {
  min-height: 400px;
}
</style>
