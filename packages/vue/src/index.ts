/**
 * @quizerjs/vue - Vue 3 集成包
 *
 * 提供 Vue 3 组件和组合式 API，用于在 Vue 应用中集成 quizerjs
 */

export { default as QuizComponent } from './QuizComponent.vue';
export { default as QuizBlock } from './QuizBlock.vue';
export { useQuiz } from './composables/useQuiz';
export { useQuizValidation } from './composables/useQuizValidation';
export type * from './types';
