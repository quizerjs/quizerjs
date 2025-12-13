<svelte:options accessors={true} />

<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { QuizEditor } from '@quizerjs/quizerjs';
  import type { QuizEditorOptions } from '@quizerjs/quizerjs';
  import type { QuizDSL } from '@quizerjs/dsl';
  import type { EditorJS } from '@editorjs/editorjs';

  export interface QuizEditorRef {
    getEditorInstance: () => EditorJS | null;
    save: () => Promise<QuizDSL | null>;
    load: (dsl: QuizDSL) => Promise<void>;
    clear: () => Promise<void>;
    isDirty: () => boolean;
  }

  export let initialDSL: QuizDSL | undefined = undefined;
  export let readOnly: boolean = false;
  export let onChange: ((dsl: QuizDSL) => void) | undefined = undefined;
  export let onSave: ((dsl: QuizDSL) => void) | undefined = undefined;

  let editorContainer: HTMLDivElement;
  let editorInstance: QuizEditor | null = null;

  // 导出 ref 给父组件使用
  // 在 Svelte 中，通过 bind:this 获取的组件实例只能访问使用 export let 导出的变量
  // 即使它是 prop，如果父组件不传递值，它会保持初始值，然后在 onMount 中被赋值
  export let editorRef: QuizEditorRef | null = null;

  onMount(async () => {
    if (!editorContainer) return;

    const initEditor = async () => {
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

        // 等待 Svelte 更新，确保 ref 被正确绑定
        await tick();
      } catch (error) {
        console.error('初始化 QuizEditor 失败:', error);
      }
    };

    await initEditor();
  });

  onDestroy(() => {
    if (editorInstance) {
      editorInstance.destroy();
      editorInstance = null;
    }
  });

  // 导出 ref 给父组件使用（通过 export 使其可被外部访问）
  // 注意：在 Svelte 中，通过 bind:this 获取组件实例后，可以访问所有导出的变量
</script>

<div bind:this={editorContainer} class="quiz-editor" />
