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
 * 主题管理类
 */
export class ThemeManager {
  private isDark: boolean;
  private listeners: Array<(isDark: boolean) => void> = [];

  constructor() {
    this.isDark = getInitialTheme();
    this.init();
  }

  /**
   * 初始化主题
   */
  private init() {
    // 监听系统主题变化（仅在用户未手动设置时）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才跟随系统
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        this.setTheme(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  }

  /**
   * 获取当前主题状态
   */
  getTheme(): boolean {
    return this.isDark;
  }

  /**
   * 切换主题
   */
  toggleTheme(): void {
    this.setTheme(!this.isDark);
  }

  /**
   * 设置主题
   */
  setTheme(dark: boolean): void {
    this.isDark = dark;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
      // 通知所有监听器（主题应用由监听器处理）
      this.listeners.forEach(listener => listener(dark));
    } catch (error) {
      console.warn('无法保存主题设置到 localStorage:', error);
    }
  }

  /**
   * 订阅主题变化
   */
  subscribe(listener: (isDark: boolean) => void): () => void {
    this.listeners.push(listener);
    // 返回取消订阅函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// 导出单例
export const themeManager = new ThemeManager();
