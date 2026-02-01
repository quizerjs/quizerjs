<script lang="ts">
  import { Splitpanes, Pane } from 'svelte-splitpanes';
  import { QuizPlayer } from '@quizerjs/svelte'; // Newly created
  import { currentTestDSL } from '../stores/quizStore';

  // We need to parse initialDSL from the store to pass to player
  // Since QuizPlayer takes quizSource (QuizDSL)
</script>

<div class="player-route">
  <Splitpanes class="default-theme" horizontal={true} style="height: 100%">
    <Pane size={100}>
      <div class="panel-content">
        <!-- Player Component -->
        {#if $currentTestDSL}
          <QuizPlayer quizSource={$currentTestDSL} showResults={true} />
        {:else}
          <div class="no-data">No Quiz Data</div>
        {/if}
      </div>
    </Pane>
    <!-- Add Debugger Pane here if we port StoreDebugger later -->
  </Splitpanes>
</div>

<style>
  .player-route {
    height: 100%;
    width: 100%;
  }
  .panel-content {
    height: 100%;
    overflow: hidden;
    padding: 0;
  }
  .no-data {
    padding: 20px;
    text-align: center;
    color: var(--text-secondary);
  }

  /* Splitpanes Theme Overrides */
  :global(.splitpanes.default-theme .splitpanes__splitter) {
    background-color: var(--border-color) !important;
    border: none !important;
  }
</style>
