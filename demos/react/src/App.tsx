import React, { useState, useRef, useEffect, useMemo } from 'react';
import { type QuizEditorRef } from '@quizerjs/react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import ThemeToggle from './components/ThemeToggle';
import EditorPanel from './components/EditorPanel';
import PlayerPanel from './components/PlayerPanel';
import DataPanel from './components/DataPanel';
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
        <Group orientation="vertical" className="main-panel-group">
          {/* 顶部：Editor 和 Player */}
          <Panel defaultSize={60} minSize={30} className="top-panel">
            <Group orientation="horizontal" className="top-panel-group">
              <Panel defaultSize={50} minSize={20} className="panel">
                <EditorPanel
                  editorRef={editorRef}
                  initialDSL={currentSampleDSL}
                  onChange={handleChange}
                  onSave={handleSave}
                />
              </Panel>
              <Separator className="resize-handle" />
              <Panel defaultSize={50} minSize={20} className="panel">
                <PlayerPanel dslPreview={dslPreview} />
              </Panel>
            </Group>
          </Panel>
          <Separator className="resize-handle horizontal" />
          {/* 底部：Block Data 和 DSL Preview */}
          <Panel defaultSize={40} minSize={20} className="bottom-panel">
            <Group orientation="horizontal" className="bottom-panel-group">
              <Panel defaultSize={50} minSize={20} className="panel">
                <DataPanel title="Block Data" code={blockDataPreview} />
              </Panel>
              <Separator className="resize-handle" />
              <Panel defaultSize={50} minSize={20} className="panel">
                <DataPanel title="DSL Preview" code={dslPreview} />
              </Panel>
            </Group>
          </Panel>
        </Group>
      </main>
    </div>
  );
}
