/**
 * useQuizValidation - Quiz 验证组合式 API
 */

import { ref, computed } from 'vue';
import { validateQuizDSL, type ValidationResult } from '@quizerjs/dsl';
import type { QuizDSL } from '@quizerjs/dsl';

export function useQuizValidation() {
  const validationResult = ref<ValidationResult | null>(null);

  function validate(dsl: QuizDSL | null) {
    if (!dsl) {
      validationResult.value = {
        valid: false,
        errors: [{ code: 'E1000', path: '', message: 'DSL 不能为空' }],
      };
      return validationResult.value;
    }

    validationResult.value = validateQuizDSL(dsl);
    return validationResult.value;
  }

  const isValid = computed(() => validationResult.value?.valid ?? false);
  const errors = computed(() => validationResult.value?.errors ?? []);

  function clear() {
    validationResult.value = null;
  }

  return {
    validate,
    isValid,
    errors,
    clear,
    validationResult,
  };
}
