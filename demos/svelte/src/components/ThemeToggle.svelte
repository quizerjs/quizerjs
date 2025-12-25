<script lang="ts">
  export let isDark: boolean;
  export let onToggle: () => void;
</script>

<button
  on:click={onToggle}
  class="theme-toggle"
  title={isDark ? '切换到浅色主题' : '切换到深色主题'}
  aria-label="切换主题"
>
  {#if isDark}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  {:else}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  {/if}
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--quiz-border-color, #e0e0e0);
    border-radius: var(--quiz-radius-sm, 4px);
    background: var(--quiz-bg-primary, #fff);
    color: var(--quiz-text-primary, #333);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .theme-toggle:hover {
    background: var(--quiz-bg-tertiary, #f5f5f5);
    border-color: var(--quiz-accent-color, #4a90e2);
  }

  .theme-toggle:active {
    transform: scale(0.95);
  }

  .theme-toggle svg {
    width: 16px;
    height: 16px;
  }
</style>
