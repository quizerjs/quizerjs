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

const QuizEditorComponent = forwardRef<QuizEditorRef, QuizEditorProps>(
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

      // 防止重复初始化（StrictMode 双重挂载保护）
      if (editorRef.current) {
        if (import.meta.env.DEV) {
          console.debug('[QuizEditor] 已初始化，跳过重复初始化');
        }
        return;
      }

      let isCancelled = false;
      let editorInstance: QuizEditorClass | null = null;

      const initEditor = async () => {
        try {
          if (import.meta.env.DEV) {
            console.debug('[QuizEditor] 开始初始化');
          }

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

          editorInstance = new QuizEditorClass(options);
          await editorInstance.init();

          if (isCancelled) {
            if (import.meta.env.DEV) {
              console.debug('[QuizEditor] 初始化已取消，销毁实例');
            }
            await editorInstance.destroy();
            return;
          }

          editorRef.current = editorInstance;
          if (import.meta.env.DEV) {
            console.debug('[QuizEditor] 初始化完成');
          }
        } catch (error) {
          if (!isCancelled) {
            console.error('初始化 QuizEditor 失败:', error);
          }
        }
      };

      initEditor();

      return () => {
        isCancelled = true;

        if (import.meta.env.DEV) {
          console.debug('[QuizEditor] 清理开始', {
            hasLocal: !!editorInstance,
            hasRef: !!editorRef.current,
          });
        }

        // 销毁局部实例
        if (editorInstance) {
          try {
            editorInstance.destroy();
            if (import.meta.env.DEV) {
              console.debug('[QuizEditor] 局部实例已销毁');
            }
          } catch (error) {
            console.warn('[QuizEditor] 销毁局部实例失败:', error);
          }
        }

        // 销毁 ref 实例（处理竞态条件）
        if (editorRef.current) {
          if (editorRef.current !== editorInstance) {
            try {
              editorRef.current.destroy();
              if (import.meta.env.DEV) {
                console.debug('[QuizEditor] Ref 实例已销毁（孤立实例）');
              }
            } catch (error) {
              console.warn('[QuizEditor] 销毁 ref 实例失败:', error);
            }
          }
          editorRef.current = null;
        }

        if (import.meta.env.DEV) {
          console.debug('[QuizEditor] 清理完成');
        }
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
); // Closing forwardRef
QuizEditorComponent.displayName = 'QuizEditorComponent';

// Memoize the component to prevent re-renders when parent state changes (like context)
// We only care if initialDSL or readOnly (value props) change.
// Functions (onChange, onSave) are handled by refs and don't need to trigger re-render.
export const QuizEditor = React.memo(QuizEditorComponent, (prevProps, nextProps) => {
  return prevProps.initialDSL === nextProps.initialDSL && prevProps.readOnly === nextProps.readOnly;
});

QuizEditor.displayName = 'QuizEditor';
