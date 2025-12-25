import React, { useState, useRef, useEffect, useMemo } from 'react';
import { QuizEditor, type QuizEditorRef } from '@quizerjs/react';
import JsonViewer from './components/JsonViewer';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { sampleDataList, defaultSampleDataId, getSampleDataById } from '@quizerjs/sample-data';
import { dslToBlock } from '@quizerjs/core';
import type { QuizDSL } from '@quizerjs/dsl';
import './App.css';

export default function App() {
  const [dslPreview, setDslPreview] = useState<string>('');
  const [blockDataPreview, setBlockDataPreview] = useState<string>('');
  const [selectedSampleDataId, setSelectedSampleDataId] = useState<string>(defaultSampleDataId);
  const editorRef = useRef<QuizEditorRef | null>(null);
  const { isDark, toggleTheme } = useTheme();

  // 当前选中的示例数据 DSL
  const currentSampleDSL = useMemo(() => {
    return getSampleDataById(selectedSampleDataId) || sampleDataList[0].dsl;
  }, [selectedSampleDataId]);

  // 初始化预览数据
  useEffect(() => {
    if (currentSampleDSL) {
      setDslPreview(JSON.stringify(currentSampleDSL, null, 2));
      const blockData = dslToBlock(currentSampleDSL);
      setBlockDataPreview(JSON.stringify(blockData, null, 2));
    }
  }, [currentSampleDSL]);

  // 处理测试数据切换
  const handleSampleDataChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = event.target.value;
    setSelectedSampleDataId(newId);
    const newDSL = getSampleDataById(newId);
    if (editorRef.current && newDSL) {
      try {
        await editorRef.current.load(newDSL);
        setDslPreview(JSON.stringify(newDSL, null, 2));
        const blockData = dslToBlock(newDSL);
        setBlockDataPreview(JSON.stringify(blockData, null, 2));
      } catch (error) {
        console.error('加载测试数据失败:', error);
      }
    }
  };

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
          <div className="header-controls">
            <label htmlFor="sample-data-select" className="sample-data-label">
              Sample Data:
            </label>
            <select
              id="sample-data-select"
              value={selectedSampleDataId}
              onChange={handleSampleDataChange}
              className="sample-data-select"
            >
              {sampleDataList.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
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
              initialDSL={currentSampleDSL}
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
