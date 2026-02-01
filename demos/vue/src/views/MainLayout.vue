<template>
  <div class="app" :class="{ 'theme-dark': isDark }">
    <header class="app-header">
      <div class="header-brand">
        <h1 class="header-logo">QuizerJS Editor</h1>
        <nav class="header-nav">
          <router-link to="/" class="nav-link" active-class="active">Editor</router-link>
          <router-link to="/player" class="nav-link" active-class="active">Player</router-link>
        </nav>
      </div>

      <div class="header-actions">
        <!-- Sample Data Select -->
        <div class="data-select-wrapper">
          <select class="data-select" :value="selectedTestDataId" @change="handleDataChange">
            <option v-for="item in sampleDataList" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </div>
        <ThemeToggle :is-dark="isDark" @toggle="toggleTheme" />
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { useTheme } from '../composables/useTheme';
import { useQuizState } from '../composables/useQuizState';
import ThemeToggle from '../components/ThemeToggle.vue';

const { isDark, toggleTheme } = useTheme();
const { selectedTestDataId, setSelectedTestDataId, sampleDataList } = useQuizState();

// Provide isDark to descendants
provide('isDark', isDark);

const handleDataChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  setSelectedTestDataId(target.value);
};
</script>

<style scoped>
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

.nav-link {
  text-decoration: none;
  color: var(--text-secondary, #666);
  font-size: 14px;
  font-weight: 500;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link.active {
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
