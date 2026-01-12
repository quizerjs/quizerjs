import React from 'react';
import { QuizEditor, type QuizEditorRef } from '@quizerjs/react';
import type { QuizDSL } from '@quizerjs/dsl';
import './EditorPanel.css';

interface EditorPanelProps {
  editorRef: React.RefObject<QuizEditorRef>;
  initialDSL: QuizDSL;
  onChange?: (dsl: QuizDSL) => void;
  onSave?: (dsl: QuizDSL) => void;
}

/**
 * EditorPanel 组件
 * 显示 QuizEditor
 */
export default function EditorPanel({ editorRef, initialDSL, onChange, onSave }: EditorPanelProps) {
  return (
    <div className="editor-panel">
      <div className="panel-header">
        <span className="panel-title">Editor</span>
      </div>
      <div className="panel-content">
        <QuizEditor ref={editorRef} initialDSL={initialDSL} onChange={onChange} onSave={onSave} />
      </div>
    </div>
  );
}
