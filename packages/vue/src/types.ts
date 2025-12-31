/**
 * @quizerjs/vue - 类型定义
 */

// 导出 DSL 相关类型
export type { QuizDSL } from '@quizerjs/dsl';
export type { ResultDSL, AnswerValue, QuestionResult } from '@quizerjs/quizerjs';

// 导出组件 Props 和 Emits 类型
export type { QuizEditorProps, QuizEditorEmits } from './QuizEditor.vue';
export type { QuizPlayerProps, QuizPlayerEmits } from './QuizPlayer.vue';
