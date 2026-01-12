import { ref, watch, onMounted } from 'vue';
import { setPlayerTheme , setEditorTheme } from '@quizerjs/theme';

const THEME_STORAGE_KEY = 'quizerjs-demo-theme';

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
 * 应用主题（使用新的主题 API）
 */
const applyTheme = (isDark: boolean) => {
  const themeName = isDark ? 'solarized-dark' : 'solarized-light';

  // Player 主题
  setPlayerTheme(themeName);

  // Editor 主题（也用于应用级别的 UI）
  setEditorTheme(themeName);
};

/**
 * 主题管理 Composable
 * 提供主题状态管理和持久化存储
 */
export function useTheme() {
  const isDark = ref<boolean>(getInitialTheme());

  // 监听主题变化并保存到 localStorage，同时应用主题
  watch(
    isDark,
    (newValue, oldValue) => {
      // 避免重复应用相同的主题
      if (newValue === oldValue) return;

      try {
        localStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light');
        // 应用主题
        applyTheme(newValue);
      } catch (error) {
        console.warn('无法保存主题设置到 localStorage:', error);
      }
    },
    { immediate: false }
  );

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  // 设置主题
  const setThemeValue = (dark: boolean) => {
    isDark.value = dark;
  };

  // 初始化时应用主题和监听系统主题变化
  onMounted(() => {
    // 初始化时应用主题
    applyTheme(isDark.value);

    // 监听系统主题变化（仅在用户未手动设置时）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才跟随系统
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        isDark.value = e.matches;
        applyTheme(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  });

  return {
    isDark,
    toggleTheme,
    setTheme: setThemeValue,
  };
}
