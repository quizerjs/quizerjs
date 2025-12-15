/**
 * @quizerjs/svelte - 类型定义
 */

import type { QuizDSL } from '@quizerjs/dsl';
import type EditorJS from '@editorjs/editorjs';

export interface QuizEditorRef {
  getEditorInstance: () => EditorJS | null;
  save: () => Promise<QuizDSL | null>;
  load: (dsl: QuizDSL) => Promise<void>;
  clear: () => Promise<void>;
  isDirty: () => boolean;
}

export type { QuizDSL } from '@quizerjs/dsl';
