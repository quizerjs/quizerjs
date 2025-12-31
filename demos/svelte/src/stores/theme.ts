import { writable } from 'svelte/store';
import { setPlayerTheme } from '@quizerjs/theme/player';
import { setEditorTheme } from '@quizerjs/theme/editor';

const THEME_STORAGE_KEY = 'quizerjs-demo-theme';

// 使用 CSS Hook API 设置主题（在 :root 上设置 CSS 变量）
const applyTheme = (isDark: boolean) => {
  const themeName = isDark ? 'solarized-dark' : 'solarized-light';
  setPlayerTheme(themeName);
  setEditorTheme(themeName);
};

/**
 * 获取初始主题
 * 优先级：localStorage > 系统偏好 > 默认浅色
 */
const getInitialTheme = (): boolean => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      return saved === 'dark';
    }
    // 检测系统偏好
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  } catch {
    // 如果 localStorage 或 matchMedia 不可用，默认浅色主题
  }
  return false;
};

/**
 * 主题状态 Store
 */
function createThemeStore() {
  const { subscribe, set, update } = writable<boolean>(getInitialTheme());

  return {
    subscribe,
    toggle: () => {
      update(isDark => {
        const newValue = !isDark;
        try {
          localStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light');
          applyTheme(newValue);
        } catch (error) {
          console.warn('无法保存主题设置到 localStorage:', error);
        }
        return newValue;
      });
    },
    set: (dark: boolean) => {
      set(dark);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
        applyTheme(dark);
      } catch (error) {
        console.warn('无法保存主题设置到 localStorage:', error);
      }
    },
    init: () => {
      const initialTheme = getInitialTheme();
      set(initialTheme);
      applyTheme(initialTheme);

      // 监听系统主题变化（仅在用户未手动设置时）
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        // 只有在用户没有手动设置主题时才跟随系统
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          set(e.matches);
          applyTheme(e.matches);
        }
      };
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    },
  };
}

export const themeStore = createThemeStore();
