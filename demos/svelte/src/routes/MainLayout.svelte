<script lang="ts">
  import { Router, Link, Route } from 'svelte-routing';
  import ThemeToggle from '../components/ThemeToggle.svelte';
  import { themeStore } from '../stores/theme';
  import { selectedTestDataId, sampleDataList } from '../stores/quizStore';
  import EditorRoute from './EditorRoute.svelte';
  import PlayerRoute from './PlayerRoute.svelte';

  export let url = ''; // For SSR or testing if needed

  function handleDataChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedTestDataId.set(target.value);
  }
</script>

<div class="app" class:theme-dark={$themeStore}>
  <Router {url}>
    <header class="app-header">
      <div class="header-brand">
        <h1 class="header-logo">QuizerJS Editor</h1>
        <nav class="header-nav">
          <Link to="/">Editor</Link>
          <Link to="player">Player</Link>
        </nav>
      </div>

      <div class="header-actions">
        <div class="data-select-wrapper">
          <select class="data-select" value={$selectedTestDataId} on:change={handleDataChange}>
            {#each sampleDataList as item}
              <option value={item.id}>{item.name}</option>
            {/each}
          </select>
        </div>
        <ThemeToggle isDark={$themeStore} onToggle={() => themeStore.toggle()} />
      </div>
    </header>

    <main class="app-main">
      <Route path="/" component={EditorRoute} />
      <Route path="player" component={PlayerRoute} />
    </main>
  </Router>
</div>

<style>
  .app {
    --bg-primary: var(--quiz-bg-primary);
    --bg-secondary: var(--quiz-bg-secondary);
    --border-color: var(--quiz-border-color);
    --text-primary: var(--quiz-text-primary);
    --accent-color: var(--quiz-accent-color);

    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .app-header {
    height: 50px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    flex-shrink: 0;
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .header-logo {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .header-nav {
    display: flex;
    gap: 16px;
  }

  /* Style global Link component? Svelte routing uses <a> under the hood.
     We can target 'a' inside .header-nav
  */
  .header-nav :global(a) {
    text-decoration: none;
    color: var(--text-secondary, #666);
    font-size: 14px;
    font-weight: 500;
    padding: 4px 0;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .header-nav :global(a:hover) {
    color: var(--text-primary);
  }

  .header-nav :global(a[aria-current='page']) {
    color: var(--text-primary);
    border-bottom-color: var(--accent-color);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .data-select-wrapper {
    position: relative;
  }

  .data-select {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 13px;
    min-width: 140px;
  }

  .app-main {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
</style>
