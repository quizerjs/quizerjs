/**
 * QuizEditor - React 组件，包装 QuizEditor
 */

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuizEditor } from './useQuizEditor';
import type { QuizDSL } from '@quizerjs/dsl';
import type { QuizLocalization } from '@quizerjs/core';
import type EditorJS from '@editorjs/editorjs';
import './QuizEditor.css';

export interface QuizEditorProps {
  /** 初始 DSL 数据（可选） */
  initialDSL?: QuizDSL;
  /** 只读模式（可选，默认 false） */
  readOnly?: boolean;
  /** 数据变化事件 */
  onChange?: (dsl: QuizDSL) => void;
  /** 保存事件 */
  onSave?: (dsl: QuizDSL) => void;
  /** 国际化配置 */
  localization?: QuizLocalization;
}

export interface QuizEditorRef {
  getEditorInstance: () => EditorJS | null;
  save: () => Promise<QuizDSL | null>;
  load: (dsl: QuizDSL) => Promise<void>;
  clear: () => Promise<void>;
  isDirty: () => boolean;
}

const QuizEditorComponent = forwardRef<QuizEditorRef, QuizEditorProps>(
  ({ initialDSL, readOnly = false, onChange, onSave, localization }, ref) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);

    const editorRef = useQuizEditor({
      containerRef: editorContainerRef,
      initialDSL,
      readOnly,
      onChange,
      onSave,
      localization,
    });

    useImperativeHandle(ref, () => ({
      getEditorInstance: () => {
        return editorRef.current?.getEditorInstance() || null;
      },
      save: async () => {
        if (!editorRef.current) return null;
        const dsl = await editorRef.current.save();
        if (onSave) {
          onSave(dsl);
        }
        return dsl;
      },
      load: async (dsl: QuizDSL) => {
        if (editorRef.current) {
          await editorRef.current.load(dsl);
        }
      },
      clear: async () => {
        if (editorRef.current) {
          await editorRef.current.clear();
        }
      },
      isDirty: () => {
        return editorRef.current?.isDirty || false;
      },
    }));

    return <div ref={editorContainerRef} className="quiz-editor" />;
  }
); // Closing forwardRef
QuizEditorComponent.displayName = 'QuizEditorComponent';

// Memoize the component to prevent re-renders when parent state changes (like context)
// We only care if initialDSL or readOnly (value props) change.
// Functions (onChange, onSave) are handled by refs and don't need to trigger re-render.
export const QuizEditor = React.memo(QuizEditorComponent, (prevProps, nextProps) => {
  return prevProps.initialDSL === nextProps.initialDSL && prevProps.readOnly === nextProps.readOnly;
});

QuizEditor.displayName = 'QuizEditor';
