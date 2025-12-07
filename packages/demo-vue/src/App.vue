<template>
  <div class="app">
    <header class="app-header">
      <h1>quizerjs Editor.js Demo</h1>
      <p>测试 Editor.js 编辑器功能</p>
    </header>

    <main class="app-main">
      <div class="editor-container">
        <h2>Quiz Editor</h2>
        <QuizEditor @change="handleChange" @save="handleSave" />
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
import type { OutputData } from '@editorjs/editorjs';

const dslPreview = ref<string>('');

const handleChange = (data: OutputData) => {
  dslPreview.value = JSON.stringify(data, null, 2);
};

const handleSave = (data: OutputData) => {
  dslPreview.value = JSON.stringify(data, null, 2);
  console.log('保存的数据:', data);
};
</script>

<style scoped>
.app {
  min-height: 100vh;
}

.app-header {
  background: #fff;
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.editor-container,
.dsl-preview {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.editor-container h2,
.dsl-preview h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

#quiz-editor {
  min-height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
}

.dsl-preview pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .app-main {
    grid-template-columns: 1fr;
  }
}
</style>
