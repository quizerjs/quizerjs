import { ref, watch, onMounted } from 'vue';

const THEME_STORAGE_KEY = 'quizerjs-demo-theme';

// 动态导入主题 CSS
const loadThemeCSS = async (isDark: boolean) => {
  try {
    if (isDark) {
      await import('@quizerjs/theme/solarized-dark.css');
    } else {
      await import('@quizerjs/theme/solarized-light.css');
    }
  } catch (error) {
    console.warn('无法加载主题 CSS:', error);
  }
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
 * 主题管理 Composable
 * 提供主题状态管理和持久化存储
 */
export function useTheme() {
  const isDark = ref<boolean>(getInitialTheme());

  // 监听主题变化并保存到 localStorage，同时加载对应的主题 CSS
  watch(
    isDark,
    newValue => {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light');
        // 动态加载主题 CSS
        loadThemeCSS(newValue);
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
  const setTheme = (dark: boolean) => {
    isDark.value = dark;
  };

  // 初始化时加载主题 CSS 和监听系统主题变化
  onMounted(() => {
    // 初始化时加载主题 CSS
    loadThemeCSS(isDark.value);

    // 监听系统主题变化（仅在用户未手动设置时）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才跟随系统
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        isDark.value = e.matches;
        loadThemeCSS(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  });

  return {
    isDark,
    toggleTheme,
    setTheme,
  };
}
