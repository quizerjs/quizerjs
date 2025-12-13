import React, { useState, useRef } from 'react';
import QuizEditor, { type QuizEditorRef } from './components/QuizEditor';
import JsonViewer from './components/JsonViewer';
import type { QuizDSL } from '@quizerjs/dsl';
import './App.css';

export default function App() {
  const [dslPreview, setDslPreview] = useState<string>('');
  const [blockDataPreview, setBlockDataPreview] = useState<string>('');
  const editorRef = useRef<QuizEditorRef | null>(null);

  const handleChange = async (dsl: QuizDSL) => {
    setDslPreview(JSON.stringify(dsl, null, 2));

    // 获取 Editor.js block data
    if (editorRef.current) {
      const editorInstance = editorRef.current.getEditorInstance();
      if (editorInstance) {
        try {
          const blockData = await editorInstance.save();
          setBlockDataPreview(JSON.stringify(blockData, null, 2));
        } catch (error) {
          console.error('获取 block data 失败:', error);
        }
      }
    }

    console.log('DSL 变化:', dsl);
  };

  const handleSave = async (dsl: QuizDSL) => {
    setDslPreview(JSON.stringify(dsl, null, 2));

    // 获取 Editor.js block data
    if (editorRef.current) {
      const editorInstance = editorRef.current.getEditorInstance();
      if (editorInstance) {
        try {
          const blockData = await editorInstance.save();
          setBlockDataPreview(JSON.stringify(blockData, null, 2));
        } catch (error) {
          console.error('获取 block data 失败:', error);
        }
      }
    }

    console.log('保存的 DSL:', dsl);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Editor(quizerjs) Demo</h1>
        </div>
      </header>

      <main className="app-main">
        <div className="editor-panel">
          <div className="panel-header">
            <span className="panel-title">Editor</span>
          </div>
          <div className="panel-content">
            <QuizEditor
              ref={editorRef}
              onChange={handleChange}
              onSave={handleSave}
            />
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-section">
            <div className="section-header">
              <span className="section-title">Block Data</span>
            </div>
            <div className="section-content">
              <JsonViewer code={blockDataPreview} />
            </div>
          </div>
          <div className="preview-section">
            <div className="section-header">
              <span className="section-title">DSL Preview</span>
            </div>
            <div className="section-content">
              <JsonViewer code={dslPreview} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

