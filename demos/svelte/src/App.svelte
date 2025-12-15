<script lang="ts">
  import { QuizEditor, type QuizEditorRef } from '@quizerjs/svelte';
  import JsonViewer from './components/JsonViewer.svelte';
  import type { QuizDSL } from '@quizerjs/dsl';
  import './App.css';

  let dslPreview = '';
  let blockDataPreview = '';
  let editorComponent: any = null;

  // 从组件实例获取 editorRef（响应式更新）
  // 在 Svelte 中，通过 bind:this 获取的组件实例可以访问所有使用 export let 导出的变量
  $: editorRef = editorComponent?.editorRef || null;

  const handleChange = async (dsl: QuizDSL) => {
    // 立即更新 DSL preview（同步操作，确保数据不丢失）
    const dslString = JSON.stringify(dsl, null, 2);
    dslPreview = dslString;

    console.log('DSL 变化:', dsl);

    // 获取 Editor.js block data（同步更新，就像 React 版本一样）
    const currentRef = editorComponent?.editorRef;
    if (currentRef) {
      const editorInstance = currentRef.getEditorInstance();
      if (editorInstance) {
        try {
          const blockData = await editorInstance.save();
          blockDataPreview = JSON.stringify(blockData, null, 2);
          console.log('Block Data 已更新');
        } catch (error) {
          console.error('获取 block data 失败:', error);
        }
      } else {
        console.warn('Editor.js 实例未准备好');
      }
    } else {
      console.warn('editorRef 未准备好, editorComponent:', editorComponent);
    }
  };

  const handleSave = async (dsl: QuizDSL) => {
    // 立即更新 DSL preview（同步操作，确保数据不丢失）
    const dslString = JSON.stringify(dsl, null, 2);
    dslPreview = dslString;

    console.log('保存的 DSL:', dsl);

    // 获取 Editor.js block data（同步更新，就像 React 版本一样）
    const currentRef = editorComponent?.editorRef;
    if (currentRef) {
      const editorInstance = currentRef.getEditorInstance();
      if (editorInstance) {
        try {
          const blockData = await editorInstance.save();
          blockDataPreview = JSON.stringify(blockData, null, 2);
          console.log('Block Data 已更新');
        } catch (error) {
          console.error('获取 block data 失败:', error);
        }
      } else {
        console.warn('Editor.js 实例未准备好');
      }
    } else {
      console.warn('editorRef 未准备好, editorComponent:', editorComponent);
    }
  };
</script>

<div class="app">
  <header class="app-header">
    <div class="header-content">
      <h1>Editor(quizerjs) Demo</h1>
    </div>
  </header>

  <main class="app-main">
    <div class="editor-panel">
      <div class="panel-header">
        <span class="panel-title">Editor</span>
      </div>
      <div class="panel-content">
        <QuizEditor bind:this={editorComponent} onChange={handleChange} onSave={handleSave} />
      </div>
    </div>

    <div class="preview-panel">
      <div class="preview-section">
        <div class="section-header">
          <span class="section-title">Block Data</span>
        </div>
        <div class="section-content">
          <JsonViewer code={blockDataPreview} />
        </div>
      </div>
      <div class="preview-section">
        <div class="section-header">
          <span class="section-title">DSL Preview</span>
        </div>
        <div class="section-content">
          <JsonViewer code={dslPreview} />
        </div>
      </div>
    </div>
  </main>
</div>
