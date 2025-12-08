import type { QuizDSL } from '@quizerjs/dsl';

export function initDemo() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="app">
      <header class="app-header">
        <h1>quizerjs Editor.js Demo</h1>
        <p>Vanilla JS 版本 - 测试 Editor.js 编辑器功能</p>
      </header>

      <main class="app-main">
        <div class="editor-container">
          <h2>Quiz Editor</h2>
          <div id="quiz-editor" class="editor-wrapper"></div>
        </div>

        <div class="dsl-preview">
          <h2>DSL Preview</h2>
          <pre id="dsl-preview-content"></pre>
        </div>
      </main>
    </div>
  `;

  const editorContainer = document.getElementById('quiz-editor');
  const dslPreview = document.getElementById('dsl-preview-content');

  if (!editorContainer || !dslPreview) return;

  // TODO: 初始化 QuizEditor
  // 当 @quizerjs/quizerjs 包实现后，这里会使用它
  // import { QuizEditor } from '@quizerjs/quizerjs';

  // const editor = new QuizEditor({
  //   container: editorContainer,
  //   initialDSL: {
  //     version: '1.0.0',
  //     quiz: {
  //       id: 'demo-quiz',
  //       title: 'Demo Quiz',
  //       questions: [],
  //     },
  //   },
  //   onChange: (dsl: QuizDSL) => {
  //     dslPreview.textContent = JSON.stringify(dsl, null, 2);
  //   },
  // });

  // await editor.init();

  // 临时显示占位符
  editorContainer.innerHTML = `
    <div class="placeholder">
      <p>等待 @quizerjs/quizerjs 包实现</p>
      <p>Editor.js 编辑器将在这里显示</p>
    </div>
  `;

  const initialDSL: QuizDSL = {
    version: '1.0.0',
    quiz: {
      id: 'demo-quiz',
      title: 'Demo Quiz',
      questions: [],
    },
  };

  dslPreview.textContent = JSON.stringify(initialDSL, null, 2);
}
