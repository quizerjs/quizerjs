/**
 * @quizerjs/svelte - Svelte 集成包
 *
 * 提供 Svelte 组件和 Stores，用于在 Svelte 应用中集成 quizerjs
 */

export { default as QuizComponent } from './QuizComponent.svelte';
export { useQuiz } from './stores/useQuiz';
export type * from './types';

