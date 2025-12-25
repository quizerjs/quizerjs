import type { QuizDSL } from '@quizerjs/dsl';
import { sampleDataList, defaultSampleDataId, getSampleDataById } from '@quizerjs/sample-data';
import { dslToBlock } from '@quizerjs/core';
import { createThemeToggle } from './components/ThemeToggle';

export function initDemo() {
  const app = document.getElementById('app');
  if (!app) return;

  let selectedSampleDataId = defaultSampleDataId;

  app.innerHTML = `
    <div class="app">
      <header class="app-header">
        <div class="header-content">
          <div>
            <h1>quizerjs Editor.js Demo</h1>
            <p>Vanilla JS 版本 - 测试 Editor.js 编辑器功能</p>
          </div>
          <div class="header-controls">
            <label for="sample-data-select" class="sample-data-label">Sample Data:</label>
            <select id="sample-data-select" class="sample-data-select">
              ${sampleDataList.map(item => `<option value="${item.id}">${item.name}</option>`).join('')}
            </select>
          </div>
        </div>
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
  const headerControls = document.querySelector('.header-controls');
  const sampleDataSelect = document.getElementById('sample-data-select') as HTMLSelectElement;

  if (!editorContainer || !dslPreview) return;

  // 添加主题切换按钮
  if (headerControls) {
    const themeToggle = createThemeToggle();
    headerControls.appendChild(themeToggle);
  }

  // 获取当前示例数据
  const getCurrentSampleDSL = (): QuizDSL => {
    return getSampleDataById(selectedSampleDataId) || sampleDataList[0].dsl;
  };

  // 更新预览数据
  const updatePreview = (dsl: QuizDSL) => {
    dslPreview.textContent = JSON.stringify(dsl, null, 2);
  };

  // 处理测试数据切换
  if (sampleDataSelect) {
    sampleDataSelect.value = selectedSampleDataId;
    sampleDataSelect.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLSelectElement;
      selectedSampleDataId = target.value;
      const newDSL = getCurrentSampleDSL();
      updatePreview(newDSL);
      // TODO: 当 @quizerjs/quizerjs 包实现后，这里会加载数据到编辑器
      // if (editorInstance) {
      //   await editorInstance.load(newDSL);
      // }
    });
  }

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

  // 初始化预览数据
  const initialDSL = getCurrentSampleDSL();
  updatePreview(initialDSL);
}
