<template>
  <header class="app-header">
    <div class="header-content">
      <h1>Editor(quizerjs) Demo</h1>
      <div class="header-controls">
        <label for="test-data-select" class="test-data-label">Test Data:</label>
        <select
          id="test-data-select"
          :value="selectedTestDataId"
          @change="handleChange"
          class="test-data-select"
        >
          <option v-for="item in testDataList" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
        <ThemeToggle :is-dark="isDark" @toggle="handleThemeToggle" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import ThemeToggle from './ThemeToggle.vue';
import { testDataList } from '../test-data';

interface Props {
  selectedTestDataId: string;
}

interface Emits {
  (e: 'update:selectedTestDataId', value: string): void;
  (e: 'testDataChange'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 从父组件注入主题状态和切换函数
const isDarkRef = inject<{ value: boolean } | undefined>('isDark');
const isDark = isDarkRef || { value: false };
const toggleTheme = inject<(() => void) | undefined>('toggleTheme');

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:selectedTestDataId', target.value);
  emit('testDataChange');
};

const handleThemeToggle = () => {
  if (toggleTheme) {
    toggleTheme();
  }
};
</script>

<style scoped>
.app-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-data-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.test-data-select {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  min-width: 150px;
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease,
    color 0.3s ease;
}

.test-data-select:hover {
  border-color: var(--text-tertiary);
}

.test-data-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
}

.app-header h1 {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: var(--text-primary);
  line-height: 1;
  transition: color 0.3s ease;
}
</style>

