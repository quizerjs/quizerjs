import { ref, computed } from 'vue';
import { sampleDataList, defaultSampleDataId, getSampleDataById } from '@quizerjs/sample-data';
import { dslToBlock } from '@quizerjs/core';
import type { QuizDSL } from '@quizerjs/dsl';

const selectedTestDataId = ref<string>(defaultSampleDataId);

const currentTestDSL = computed(() => {
  return getSampleDataById(selectedTestDataId.value) || sampleDataList[0].dsl;
});

const dslPreview = ref<string>('');
const blockDataPreview = ref<string>('');

export function useQuizState() {
  const setSelectedTestDataId = (id: string) => {
    selectedTestDataId.value = id;
  };

  const updatePreviews = (dsl: QuizDSL, blockData?: any) => {
    dslPreview.value = JSON.stringify(dsl, null, 2);
    if (blockData) {
      blockDataPreview.value = JSON.stringify(blockData, null, 2);
    } else {
      // Fallback if blockData is not provided (e.g. initial load)
      const blocks = dslToBlock(dsl);
      blockDataPreview.value = JSON.stringify(blocks, null, 2);
    }
  };

  return {
    selectedTestDataId,
    currentTestDSL,
    dslPreview,
    blockDataPreview,
    setSelectedTestDataId,
    updatePreviews,
    sampleDataList,
  };
}
