/**
 * QuizEditor - React 组件，包装 QuizEditor
 */

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { QuizEditor as QuizEditorClass, type QuizEditorOptions } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';
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
}

export interface QuizEditorRef {
  getEditorInstance: () => EditorJS | null;
  save: () => Promise<QuizDSL | null>;
  load: (dsl: QuizDSL) => Promise<void>;
  clear: () => Promise<void>;
  isDirty: () => boolean;
}

export const QuizEditor = forwardRef<QuizEditorRef, QuizEditorProps>(
  ({ initialDSL, readOnly = false, onChange, onSave }, ref) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<QuizEditorClass | null>(null);
    // 使用 ref 存储回调，避免 useEffect 重复执行
    const onChangeRef = useRef(onChange);
    const onSaveRef = useRef(onSave);

    // 更新回调 ref
    useEffect(() => {
      onChangeRef.current = onChange;
      onSaveRef.current = onSave;
    }, [onChange, onSave]);

    useEffect(() => {
      if (!editorContainerRef.current) return;

      // 如果已经初始化过，先销毁
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }

      const initEditor = async () => {
        try {
          const options: QuizEditorOptions = {
            container: editorContainerRef.current!,
            initialDSL,
            readOnly,
            onChange: dsl => {
              if (onChangeRef.current) {
                onChangeRef.current(dsl);
              }
            },
            onSave: dsl => {
              if (onSaveRef.current) {
                onSaveRef.current(dsl);
              }
            },
          };

          const editor = new QuizEditorClass(options);
          await editor.init();
          editorRef.current = editor;
        } catch (error) {
          console.error('初始化 QuizEditor 失败:', error);
        }
      };

      initEditor();

      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }, [initialDSL, readOnly]);

    // 监听 initialDSL 变化
    useEffect(() => {
      if (editorRef.current && initialDSL) {
        editorRef.current.load(initialDSL);
      }
    }, [initialDSL]);

    // 监听 readOnly 变化
    useEffect(() => {
      if (editorRef.current) {
        const editorInstance = editorRef.current.getEditorInstance();
        if (editorInstance) {
          editorInstance.readOnly.toggle(readOnly);
        }
      }
    }, [readOnly]);

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
);

QuizEditor.displayName = 'QuizEditor';
