import { useEffect, useRef, MutableRefObject } from 'react';
import { QuizEditor as QuizEditorClass, type QuizEditorOptions } from '@quizerjs/quizerjs';
import type { QuizLocalization } from '@quizerjs/core';
import type { QuizDSL } from '@quizerjs/dsl';

export type UseQuizEditorProps = {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  initialDSL?: QuizDSL;
  readOnly?: boolean;
  onChange?: (dsl: QuizDSL) => void;
  onSave?: (dsl: QuizDSL) => void;
  localization?: QuizLocalization;
};

export function useQuizEditor({
  containerRef,
  initialDSL,
  readOnly = false,
  onChange,
  onSave,
  localization,
}: UseQuizEditorProps) {
  const editorRef = useRef<QuizEditorClass | null>(null);

  // Store callbacks in refs to avoid re-init effects
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onChangeRef.current = onChange;
    onSaveRef.current = onSave;
  }, [onChange, onSave]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent double init in Strict Mode if ref is already set
    const options: QuizEditorOptions = {
      container: containerRef.current,
      initialDSL,
      readOnly,
      onChange: dsl => onChangeRef.current?.(dsl),
      onSave: dsl => onSaveRef.current?.(dsl),
      localization,
    };

    // Initialize core class
    // Trust the Core class to handle race conditions via Registry and isDestroyed checks
    const instance = new QuizEditorClass(options);
    editorRef.current = instance;

    instance.init().catch(error => {
      // Ignore errors if destroyed (expected behavior during race conditions)
      if (!instance.isDirty && error.message.includes('destroyed')) return;
      console.error('Failed to initialize QuizEditor:', error);
    });

    return () => {
      // Immediately clear ref
      editorRef.current = null;
      // Trust the Core class to handle destroy() even if init() is pending
      instance.destroy().catch(console.warn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]); // Only re-run if container changes, avoid re-init for props handled elsewhere

  // Handle readOnly updates
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setReadOnly(readOnly).catch(console.warn);
    }
  }, [readOnly]);

  return editorRef;
}
