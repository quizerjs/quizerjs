<svelte:options accessors={true} />

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { QuizEditor } from '@quizerjs/quizerjs';
  import type { QuizEditorOptions } from '@quizerjs/quizerjs';
  import type { QuizDSL } from '@quizerjs/dsl';
  import type { QuizEditorRef } from './types';

  export let initialDSL: QuizDSL | undefined = undefined;
  export let readOnly: boolean = false;
  export let onChange: ((dsl: QuizDSL) => void) | undefined = undefined;
  export let onSave: ((dsl: QuizDSL) => void) | undefined = undefined;

  let editorContainer: HTMLDivElement;
  let editorInstance: QuizEditor | null = null;

  // 导出 ref 给父组件使用（通过 bind:this 访问）
  export let editorRef: QuizEditorRef | null = null;

  onMount(async () => {
    if (!editorContainer) return;

    try {
      const options: QuizEditorOptions = {
        container: editorContainer,
        initialDSL,
        readOnly,
        onChange: dsl => {
          if (onChange) {
            onChange(dsl);
          }
        },
        onSave: dsl => {
          if (onSave) {
            onSave(dsl);
          }
        },
      };

      const editor = new QuizEditor(options);
      await editor.init();
      editorInstance = editor;

      // 创建 ref 对象
      editorRef = {
        getEditorInstance: () => {
          return editorInstance?.getEditorInstance() || null;
        },
        save: async () => {
          if (!editorInstance) return null;
          const dsl = await editorInstance.save();
          if (onSave) {
            onSave(dsl);
          }
          return dsl;
        },
        load: async (dsl: QuizDSL) => {
          if (editorInstance) {
            await editorInstance.load(dsl);
          }
        },
        clear: async () => {
          if (editorInstance) {
            await editorInstance.clear();
          }
        },
        isDirty: () => {
          return editorInstance?.isDirty || false;
        },
      };
    } catch (error) {
      console.error('初始化 QuizEditor 失败:', error);
    }
  });

  onDestroy(() => {
    if (editorInstance) {
      editorInstance.destroy();
      editorInstance = null;
    }
  });

  // 监听 initialDSL 变化
  $: if (editorInstance && initialDSL) {
    editorInstance.load(initialDSL);
  }

  // 监听 readOnly 变化
  $: if (editorInstance) {
    const editorJsInstance = editorInstance.getEditorInstance();
    if (editorJsInstance) {
      editorJsInstance.readOnly.toggle(readOnly);
    }
  }
</script>

<div bind:this={editorContainer} class="quiz-editor" />

<style>
  .quiz-editor {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
