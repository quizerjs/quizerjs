import { writable, derived, get } from 'svelte/store';
import { sampleDataList, defaultSampleDataId, getSampleDataById } from '@quizerjs/sample-data';
import { dslToBlock } from '@quizerjs/core';
import type { QuizDSL } from '@quizerjs/dsl';

const initialId = defaultSampleDataId;
const initialDSL = getSampleDataById(initialId) || sampleDataList[0].dsl;

export const selectedTestDataId = writable<string>(initialId);
export const blockDataPreview = writable<string>('');
export const dslPreview = writable<string>('');

// Derived store for current DSL
export const currentTestDSL = derived(selectedTestDataId, $id => {
  return getSampleDataById($id) || sampleDataList[0].dsl;
});

// Helper to update previews
export const updatePreviews = (dsl: QuizDSL, blockData?: any) => {
  dslPreview.set(JSON.stringify(dsl, null, 2));
  if (blockData) {
    blockDataPreview.set(JSON.stringify(blockData, null, 2));
  } else {
    // Fallback
    const blocks = dslToBlock(dsl);
    blockDataPreview.set(JSON.stringify(blocks, null, 2));
  }
};

// Initialize previews with initial data
updatePreviews(initialDSL);

// Subscribe to DSL changes to update previews (if not handled by editor save)
// But typically editor save updates them.
// When switching sample, we might want to reset previews.
selectedTestDataId.subscribe(newId => {
  const dsl = getSampleDataById(newId);
  if (dsl) updatePreviews(dsl);
});

export { sampleDataList };
