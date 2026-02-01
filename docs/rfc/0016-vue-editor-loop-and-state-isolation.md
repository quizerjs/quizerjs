# RFC 0016: Vue Editor Loop and State Isolation

## Summary

This RFC documents the debugging process and solution for persistent "Infinite Save Loops" and "Disappearing Content" bugs in the Vue 3 implementation of the Quiz Editor. The solution focuses on strict **State Isolation**, **Reactivity Neutralization**, and **Layout Simplification** within the Vue demo, without modifying the core logic.

## Motivation

Users observed two critical issues in the Vue demo (`pnpm dev vue`):

1.  **Infinite Save Loop**: The editor would repeatedly save every 500ms (or faster), updating the "Last Modified" timestamp continuously, even without user interaction.
2.  **Disappearing Options**: Adding a new option to a question would sometimes cause the entire question to reset or lose the new option immediately.

These issues matched behavior seen in React (RFC 0015) but required Vue-specific mitigation strategies due to Vue's deep reactivity system and the specific libraries used in the demo (`vue-resizable-panels`, `vue-json-view`).

## Root Cause Analysis

### 1. The Feedback Loop

The "Infinite Save Loop" was caused by a cycle of events:

- **Trigger**: An event (Blur or occasional Input) triggers `editor.save()`.
- **Update**: The saved data includes a new `time` timestamp.
- **Preview Render**: The Vue app updates the "Data Preview" panel with the new JSON.
- **Layout/Focus Shift**: The update of the Right Panel (specifically complex components like `vue-resizable-panels` or `vue-json-view`) caused a layout recalculation or focus theft.
- **Focus Lost**: The Editor (Left Panel) lost focus.
- **Blur Event**: The `QuizOptionList` component in Core detects blur and triggers an unconditional `dispatchChange()`.
- **Loop**: `dispatchChange()` triggers `onChange` -> `save()` -> `Update` -> ... REPEAT.

### 2. Reactivity Leakage (Disappearing Options)

Vue 3 uses Proxies for reactivity. When `initialDSL` was passed directly to the Editor (even as a prop), Vue might have been tracking access or wrapping internal Editor objects.

- When the parent re-rendered (due to preview updates), it passed a "fresh" `initialDSL` object.
- If the Editor component didn't strictly ignore prop updates, or if Vue forced a re-render of the component tree, the Editor instance might be re-initialized or reset to the `initialDSL` state, wiping out the "Dirty" state (the user's new option).

## Solution Design

The solution strictly adheres to a "Vue-Only" scope, modifying `EditorView.vue` and `RightPanel.vue` to aggressively isolate the Editor.

### 1. Layout Isolation (Breaking Focus Theft)

We removed complex libraries that interfere with the DOM or focus management during updates.

- **Removed**: `vue-resizable-panels`. Use standard CSS Grid (`50% 50%`) instead.
- **Removed**: `DataPanel` / `vue-json-view`. Use raw `<pre>` tags for data display.
- **Effect**: Updating the Right Panel is now a purely visual DOM paint operation. It does not run JS logic that queries layout or manages focus, preventing the "Focus Lost" trigger.

### 2. State Isolation (Breaking Reactivity)

We ensure the Editor receives a "Dead" object and is never re-rendered by Vue.

- **Deep Clone**: `const staticInitialDSL = JSON.parse(JSON.stringify(currentTestDSL.value))`.
  - Passing a clone ensures no Vue Proxy is passed into the Editor.
- **v-memo**: `<div class="panel-left" v-memo="[staticInitialDSL]">`.
  - This is Vue's equivalent of `React.memo`. It instructs Vue to **skip** diffing the Editor container entirely unless `staticInitialDSL` changes (which it never does after mount).
  - This creates a "Firewall" around the Editor, preventing parent re-renders from touching it.

### 3. Loop Breaking (Logic)

We added application-level safeguards to stop loops if they _do_ start.

- **Debounce**: `handleChange` is debounced by 500ms.
- **Data De-duplication**: We compare the new DSL content with the last processed content.
  - **Crucial**: We strip the `time` field before comparison (`replace(/"time":\d+/, '"time":0')`).
  - If only the timestamp changed, we **abort** the preview update. This breaks the feedback loop immediately.

## Implementation Details

### `EditorView.vue`

```vue
<template>
  <!-- v-memo freezes the DOM subtree -->
  <div class="panel-left" v-memo="[staticInitialDSL]">
    <EditorPanel :initialDSL="staticInitialDSL" ... />
  </div>
</template>

<script setup>
// Deep clone to remove reactivity
const staticInitialDSL = currentTestDSL.value
  ? JSON.parse(JSON.stringify(currentTestDSL.value))
  : undefined;

const lastProcessedData = ref('');

const handleChange = dsl => {
  // ... Debounce ...
  const cleanString = JSON.stringify(dsl).replace(/"time":\d+/, '"time":0');
  if (cleanString === lastProcessedData.value) return; // Dedupe
  lastProcessedData.value = cleanString;
  updatePreviews(dsl);
};
</script>
```

### `RightPanel.vue`

```vue
<template>
  <div class="panel-content">
    <!-- Simple, inert display -->
    <pre>{{ blockDataPreview }}</pre>
  </div>
</template>
```

## Verification

1.  **Infinite Loop**: with `pnpm dev vue`, the console/network activity should settle 500ms after the last keystroke. The "Block Data" preview timestamp should NOT update automatically.
2.  **Disappearing Options**: Adding an option should persist. Focus should remain in the new input field.
