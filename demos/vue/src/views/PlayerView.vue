<template>
  <div class="player-view">
    <PanelGroup direction="vertical">
      <Panel :defaultSize="100" class="panel">
        <PlayerPanel :dsl-preview="dslPreview" />
      </Panel>
    </PanelGroup>
  </div>
</template>

<script setup lang="ts">
import { Panel, PanelGroup } from 'vue-resizable-panels';
import PlayerPanel from '../components/PlayerPanel.vue';
import { useQuizState } from '../composables/useQuizState';

const { dslPreview } = useQuizState();
</script>

<style scoped>
.player-view {
  height: 100%;
  width: 100%;
}
.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
