import { useState, useEffect } from 'react';
import { setPlayerTheme, setEditorTheme } from '@quizerjs/theme';

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
 * 主题管理 Hook
 * 提供主题状态管理和持久化存储
 */
export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  // 初始化时应用主题和监听系统主题变化
  useEffect(() => {
    // 初始化时应用主题
    applyTheme(isDark);

    // 监听系统主题变化（仅在用户未手动设置时）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才跟随系统
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setIsDark(e.matches);
        applyTheme(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // 监听主题变化并保存到 localStorage，同时应用主题
  useEffect(() => {
    // 避免在初始化时重复应用
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
      // 应用主题
      applyTheme(isDark);
    } catch (error) {
      console.warn('无法保存主题设置到 localStorage:', error);
    }
  }, [isDark]);

  // 切换主题
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // 设置主题
  const setThemeValue = (dark: boolean) => {
    setIsDark(dark);
  };

  return {
    isDark,
    toggleTheme,
    setTheme: setThemeValue,
  };
}
