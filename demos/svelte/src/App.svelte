<script lang="ts">
  import { onMount } from 'svelte';
  import { QuizEditor, type QuizEditorRef } from '@quizerjs/svelte';
  import JsonViewer from './components/JsonViewer.svelte';
  import ThemeToggle from './components/ThemeToggle.svelte';
  import { themeStore } from './stores/theme';
  import { sampleDataList, defaultSampleDataId, getSampleDataById } from '@quizerjs/sample-data';
  import { dslToBlock } from '@quizerjs/core';
  import type { QuizDSL } from '@quizerjs/dsl';
  import './App.css';

  let dslPreview = '';
  let blockDataPreview = '';
  let editorComponent: any = null;
  let selectedSampleDataId = defaultSampleDataId;

  // 当前选中的示例数据 DSL
  $: currentSampleDSL = getSampleDataById(selectedSampleDataId) || sampleDataList[0].dsl;

  // 初始化主题和预览数据
  onMount(() => {
    themeStore.init();
    // 初始化预览数据
    if (currentSampleDSL) {
      dslPreview = JSON.stringify(currentSampleDSL, null, 2);
      const blockData = dslToBlock(currentSampleDSL);
      blockDataPreview = JSON.stringify(blockData, null, 2);
    }
  });

  // 处理测试数据切换
  const handleSampleDataChange = async (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const newId = target.value;
    selectedSampleDataId = newId;
    const newDSL = getSampleDataById(newId);
    // Svelte QuizEditor 通过 bind:this 获取的组件实例有 load 方法
    if (editorComponent && newDSL && typeof editorComponent.load === 'function') {
      try {
        await editorComponent.load(newDSL);
        dslPreview = JSON.stringify(newDSL, null, 2);
        const blockData = dslToBlock(newDSL);
        blockDataPreview = JSON.stringify(blockData, null, 2);
      } catch (error) {
        console.error('加载测试数据失败:', error);
      }
    }
  };

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
      <div class="header-controls">
        <label for="sample-data-select" class="sample-data-label">Sample Data:</label>
        <select
          id="sample-data-select"
          value={selectedSampleDataId}
          on:change={handleSampleDataChange}
          class="sample-data-select"
        >
          {#each sampleDataList as item}
            <option value={item.id}>{item.name}</option>
          {/each}
        </select>
        <ThemeToggle isDark={$themeStore} onToggle={() => themeStore.toggle()} />
      </div>
    </div>
  </header>

  <main class="app-main">
    <div class="editor-panel">
      <div class="panel-header">
        <span class="panel-title">Editor</span>
      </div>
      <div class="panel-content">
        <QuizEditor
          bind:this={editorComponent}
          initialDSL={currentSampleDSL}
          onChange={handleChange}
          onSave={handleSave}
        />
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
