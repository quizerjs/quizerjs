<svelte:options accessors={true} />

<script>
  import { onMount, onDestroy } from 'svelte';
  import { QuizEditor } from '@quizerjs/quizerjs';

  export let initialDSL = undefined;
  export let readOnly = false;
  export let onChange = undefined;
  export let onSave = undefined;

  let editorContainer;
  let editorInstance = null;

  // 导出 ref 给父组件使用（通过 bind:this 访问）
  export let editorRef = null;

  let mounted = true;

  onMount(async () => {
    if (!editorContainer) return;

    try {
      const options = {
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

      const instance = new QuizEditor(options);
      await instance.init();

      if (!mounted) {
        instance.destroy();
        return;
      }

      editorInstance = instance;

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
        load: async (dsl) => {
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
    mounted = false;
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
