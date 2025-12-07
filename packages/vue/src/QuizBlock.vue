<template>
  <QuizComponent :dsl="dsl" v-bind="$attrs" />
</template>

<script setup lang="ts">
import QuizComponent from './QuizComponent.vue';
import type { QuizDSL } from '@quizerjs/dsl';

defineProps<{
  dsl: QuizDSL;
}>();
</script>

