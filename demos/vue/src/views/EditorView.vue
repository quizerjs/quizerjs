<template>
  <div class="editor-view">
    <div class="split-view">
      <!-- Left: Editor -->
      <div class="panel-left" v-memo="[staticInitialDSL]">
        <EditorPanel
          ref="editorPanelRef"
          :initialDSL="staticInitialDSL"
          @change="handleChange"
          @save="handleSave"
        />
      </div>

      <!-- Right: Data (Isolated) -->
      <div class="panel-right">
        <RightPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import EditorPanel from '../components/EditorPanel.vue';
import RightPanel from './RightPanel.vue';
import { useQuizState } from '../composables/useQuizState';
import { getSampleDataById } from '@quizerjs/sample-data';
import type { QuizDSL } from '@quizerjs/dsl';

// Only use selectedTestDataId and updatePreviews
// Do NOT destructure dslPreview/blockDataPreview here to avoid re-renders
const { currentTestDSL, updatePreviews, selectedTestDataId } = useQuizState();
const editorPanelRef = ref<any>(null);

// Snapshot initial DSL to ensure prop stability.
// Detach from reactivity entirely by cloning.
const staticInitialDSL = currentTestDSL.value
  ? JSON.parse(JSON.stringify(currentTestDSL.value))
  : undefined;

// Initialize previews on mount
onMounted(() => {
  if (currentTestDSL.value) {
    updatePreviews(currentTestDSL.value);
  }
});

// Watch for ID changes (e.g. sample change) to reload editor
watch(selectedTestDataId, async newId => {
  if (editorPanelRef.value) {
    try {
      const dsl = getSampleDataById(newId);
      if (dsl) {
        // Clone for load as well to be safe
        const clonedDSL = JSON.parse(JSON.stringify(dsl));
        await editorPanelRef.value.load(clonedDSL);
        updatePreviews(dsl);
      }
    } catch (e) {
      console.error(e);
    }
  }
});

// Track last processed data to dedupe timestamp-only updates
const lastProcessedData = ref('');

const handleChange = (dsl: QuizDSL) => {
  // Use a simple debounce to avoid rapid updates/loops
  if (editorPanelRef.value) {
    if ((window as any).__saveTimeout) {
      clearTimeout((window as any).__saveTimeout);
    }
    (window as any).__saveTimeout = setTimeout(async () => {
      if (editorPanelRef.value) {
        // We already have the DSL from the event, but we can also save to be sure
        // Actually, the dsl passed in IS the result of internal save() in the wrapper.

        // De-duplication: Check if content actually changed (ignoring time)
        // This prevents infinite loops where Blur -> Save -> Preview Update -> Blur -> Save...
        // because the 'time' field always changes on save.
        const cleanString = JSON.stringify(dsl).replace(/"time":\d+/, '"time":0');

        if (cleanString === lastProcessedData.value) {
          // Content matches, ignore update (break loop)
          return;
        }

        lastProcessedData.value = cleanString;

        // Get fresh block data for preview (this includes the time, which is fine for display)
        // But we gate the update based on content.
        const editorInstance = editorPanelRef.value.getEditorInstance();
        if (editorInstance) {
          try {
            // Note: We used dsl from event for check, but for preview we want strict sync
            // or just use the dsl we have.
            // But we also need blockData (raw editor output) for the top panel.
            // dsl IS the blockData in this context (QuizDSL ~ OutputData).
            const blockData = await editorInstance.save();
            updatePreviews(dsl, blockData);
          } catch (error) {
            console.error('Failed to get block data:', error);
          }
        }
      }
    }, 500); // 500ms debounce
  }
};

const handleSave = (dsl: QuizDSL) => {
  // Immediate save on manual save
  if (editorPanelRef.value) {
    const editorInstance = editorPanelRef.value.getEditorInstance();
    if (editorInstance) {
      editorInstance.save().then((blockData: any) => {
        // Manual save always updates
        lastProcessedData.value = JSON.stringify(blockData).replace(/"time":\d+/, '"time":0');
        updatePreviews(dsl, blockData);
      });
    }
  }
};
</script>

<style scoped>
.editor-view {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.split-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  width: 100%;
}

.panel-left,
.panel-right {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-left {
  border-right: 1px solid var(--border-color);
}
</style>
