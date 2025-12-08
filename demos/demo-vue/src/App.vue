<template>
  <div class="app">
    <header class="app-header">
      <h1>quizerjs Editor.js Demo</h1>
      <p>测试 Editor.js 编辑器功能</p>
    </header>

    <main class="app-main">
      <div class="editor-container">
        <h2>Quiz Editor</h2>
        <div class="editor-wrapper">
          <QuizEditor @change="handleChange" @save="handleSave" />
        </div>
      </div>

      <div class="dsl-preview">
        <h2>DSL Preview</h2>
        <pre>{{ dslPreview }}</pre>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QuizEditor } from '@quizerjs/vue';
import type { QuizDSL } from '@quizerjs/dsl';

const dslPreview = ref<string>('');

const handleChange = (dsl: QuizDSL) => {
  dslPreview.value = JSON.stringify(dsl, null, 2);
  console.log('DSL 变化:', dsl);
};

const handleSave = (dsl: QuizDSL) => {
  dslPreview.value = JSON.stringify(dsl, null, 2);
  console.log('保存的 DSL:', dsl);
};
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  background: #fff;
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
  flex-shrink: 0;
}

.app-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.app-header p {
  color: #666;
}

.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 1fr;
  gap: 2rem;
  overflow-y: auto;
  overflow-x: hidden;
  align-items: stretch;
}

.editor-container,
.dsl-preview {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}

.editor-container h2,
.dsl-preview h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
  flex-shrink: 0;
}

.editor-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-wrapper :deep(.quiz-editor) {
  flex: 1;
  min-height: 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  overflow-y: auto;
}

.dsl-preview pre {
  flex: 1;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  min-height: 0;
}

@media (max-width: 1024px) {
  .app-main {
    grid-template-columns: 1fr;
  }
}
</style>
