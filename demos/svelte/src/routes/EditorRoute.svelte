<script lang="ts">
  import { onMount } from 'svelte';
  import { Splitpanes, Pane } from 'svelte-splitpanes';
  import { QuizEditor } from '@quizerjs/svelte';
  import JsonViewer from '../components/JsonViewer.svelte';
  import {
    currentTestDSL,
    updatePreviews,
    dslPreview,
    blockDataPreview,
  } from '../stores/quizStore';
  import type { QuizDSL } from '@quizerjs/dsl';

  let editorComponent: any;

  async function handleChange(dsl: QuizDSL) {
    // Update store previews
    // blockData needs to be fetched
    if (editorComponent?.editorRef) {
      try {
        const instance = editorComponent.editorRef.getEditorInstance();
        if (instance) {
          const blockData = await instance.save();
          updatePreviews(dsl, blockData);
        } else {
          updatePreviews(dsl);
        }
      } catch (e) {
        console.error(e);
        updatePreviews(dsl);
      }
    } else {
      updatePreviews(dsl);
    }
  }

  async function handleSave(dsl: QuizDSL) {
    await handleChange(dsl);
  }

  // Watch for external DSL changes (e.g. sample select)
  // Svelte reactive statement
  $: if ($currentTestDSL && editorComponent && typeof editorComponent.load === 'function') {
    editorComponent.load($currentTestDSL).catch(console.error);
  }
</script>

<div class="editor-route">
  <Splitpanes class="default-theme" horizontal={false} style="height: 100%">
    <!-- Editor Pane -->
    <Pane minSize={20} size={50}>
      <div class="panel-content">
        <QuizEditor
          bind:this={editorComponent}
          initialDSL={$currentTestDSL}
          onChange={handleChange}
          onSave={handleSave}
        />
      </div>
    </Pane>

    <!-- Data Pane -->
    <Pane minSize={20} size={50}>
      <Splitpanes horizontal={true}>
        <Pane size={50}>
          <div class="panel-header">Block Data</div>
          <div class="panel-scroll">
            <JsonViewer code={$blockDataPreview} />
          </div>
        </Pane>
        <Pane size={50}>
          <div class="panel-header">DSL Preview</div>
          <div class="panel-scroll">
            <JsonViewer code={$dslPreview} />
          </div>
        </Pane>
      </Splitpanes>
    </Pane>
  </Splitpanes>
</div>

<style>
  .editor-route {
    height: 100%;
    width: 100%;
  }
  .panel-content {
    height: 100%;
    overflow: hidden;
  }
  .panel-header {
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    background: var(--bg-primary); /* Uses vars inherited from MainLayout */
    border-bottom: 1px solid var(--border-color);
  }
  .panel-scroll {
    height: calc(100% - 33px);
    overflow: auto;
  }

  /* Splitpanes Theme Overrides for QuizerJS Look */
  :global(.splitpanes.default-theme .splitpanes__splitter) {
    background-color: var(--border-color) !important;
    border: none !important;
  }
  :global(.splitpanes.default-theme .splitpanes__splitter:hover) {
    background-color: var(--accent-color) !important;
  }
  :global(.splitpanes.default-theme .splitpanes__pane) {
    background-color: var(--bg-secondary) !important;
  }
</style>
