/**
 * @quizerjs/theme Editor Theme API
 * 提供 Editor 主题设置的 API
 */

/**
 * Editor 主题配置对象
 * 包含所有 QuizerJS CSS 变量的值（用于编辑器）
 */
export interface EditorThemeConfig {
  // 背景色
  '--quiz-bg-primary'?: string;
  '--quiz-bg-secondary'?: string;
  '--quiz-bg-tertiary'?: string;
  '--quiz-bg-hover'?: string;
  '--quiz-bg-selected'?: string;

  // 文本色
  '--quiz-text-primary'?: string;
  '--quiz-text-secondary'?: string;
  '--quiz-text-tertiary'?: string;
  '--quiz-text-placeholder'?: string;
  '--quiz-text-on-accent'?: string;
  '--quiz-button-text-color'?: string;

  // 边框色
  '--quiz-border-color'?: string;
  '--quiz-border-hover'?: string;
  '--quiz-border-focus'?: string;
  '--quiz-border-selected'?: string;

  // 强调色
  '--quiz-accent-color'?: string;
  '--quiz-accent-hover'?: string;
  '--quiz-accent-active'?: string;

  // 状态色
  '--quiz-error-color'?: string;
  '--quiz-success-color'?: string;
  '--quiz-warning-color'?: string;
  '--quiz-info-color'?: string;

  // 滚动条颜色
  '--quiz-scrollbar-track-color'?: string;
  '--quiz-scrollbar-thumb-color'?: string;
  '--quiz-scrollbar-thumb-hover-color'?: string;
  '--quiz-scrollbar-thumb-active-color'?: string;

  // 阴影
  '--quiz-shadow-sm'?: string;
  '--quiz-shadow-md'?: string;
  '--quiz-shadow-lg'?: string;
}

/**
 * Editor 主题名称
 */
export type EditorThemeName = 'solarized-dark' | 'solarized-light' | 'dark' | 'light';

/**
 * Editor 预设主题配置
 */
export const EDITOR_THEME_PRESETS: Record<EditorThemeName, EditorThemeConfig> = {
  'solarized-dark': {
    '--quiz-bg-primary': '#002b36',
    '--quiz-bg-secondary': '#073642',
    '--quiz-bg-tertiary': '#002b36',
    '--quiz-bg-hover': '#073642',
    '--quiz-bg-selected': '#073642',
    '--quiz-text-primary': '#839496',
    '--quiz-text-secondary': '#93a1a1',
    '--quiz-text-tertiary': '#657b83',
    '--quiz-text-placeholder': '#586e75',
    '--quiz-text-on-accent': '#ffffff',
    '--quiz-button-text-color': '#ffffff',
    '--quiz-border-color': '#586e75',
    '--quiz-border-hover': '#268bd2',
    '--quiz-border-focus': '#268bd2',
    '--quiz-border-selected': '#268bd2',
    '--quiz-accent-color': '#268bd2',
    '--quiz-accent-hover': '#2aa198',
    '--quiz-accent-active': '#1e6fa8',
    '--quiz-error-color': '#dc322f',
    '--quiz-success-color': '#859900',
    '--quiz-warning-color': '#b58900',
    '--quiz-info-color': '#268bd2',
    '--quiz-scrollbar-track-color': '#073642',
    '--quiz-scrollbar-thumb-color': '#586e75',
    '--quiz-scrollbar-thumb-hover-color': '#657b83',
    '--quiz-scrollbar-thumb-active-color': '#839496',
    '--quiz-shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
    '--quiz-shadow-md': '0 2px 4px rgba(0, 0, 0, 0.4)',
    '--quiz-shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.5)',
  },
  'solarized-light': {
    '--quiz-bg-primary': '#fdf6e3',
    '--quiz-bg-secondary': '#eee8d5',
    '--quiz-bg-tertiary': '#fdf6e3',
    '--quiz-bg-hover': '#eee8d5',
    '--quiz-bg-selected': '#eee8d5',
    '--quiz-text-primary': '#657b83',
    '--quiz-text-secondary': '#586e75',
    '--quiz-text-tertiary': '#839496',
    '--quiz-text-placeholder': '#93a1a1',
    '--quiz-text-on-accent': '#ffffff',
    '--quiz-button-text-color': '#ffffff',
    '--quiz-border-color': '#93a1a1',
    '--quiz-border-hover': '#268bd2',
    '--quiz-border-focus': '#268bd2',
    '--quiz-border-selected': '#268bd2',
    '--quiz-accent-color': '#268bd2',
    '--quiz-accent-hover': '#1e6fa8',
    '--quiz-accent-active': '#15537a',
    '--quiz-error-color': '#dc322f',
    '--quiz-success-color': '#859900',
    '--quiz-warning-color': '#b58900',
    '--quiz-info-color': '#268bd2',
    '--quiz-scrollbar-track-color': '#eee8d5',
    '--quiz-scrollbar-thumb-color': '#93a1a1',
    '--quiz-scrollbar-thumb-hover-color': '#839496',
    '--quiz-scrollbar-thumb-active-color': '#657b83',
    '--quiz-shadow-sm': '0 1px 2px rgba(88, 110, 117, 0.1)',
    '--quiz-shadow-md': '0 2px 4px rgba(88, 110, 117, 0.15)',
    '--quiz-shadow-lg': '0 4px 8px rgba(88, 110, 117, 0.2)',
  },
  dark: {
    '--quiz-bg-primary': '#1a1a1a',
    '--quiz-bg-secondary': '#262626',
    '--quiz-bg-tertiary': '#2d2d2d',
    '--quiz-bg-hover': '#2d3a4a',
    '--quiz-bg-selected': '#1e3a5f',
    '--quiz-text-primary': '#e0e0e0',
    '--quiz-text-secondary': '#b0b0b0',
    '--quiz-text-tertiary': '#808080',
    '--quiz-text-placeholder': '#666666',
    '--quiz-text-on-accent': '#ffffff',
    '--quiz-button-text-color': '#ffffff',
    '--quiz-border-color': '#404040',
    '--quiz-border-hover': '#5a9de2',
    '--quiz-border-focus': '#5a9de2',
    '--quiz-border-selected': '#5a9de2',
    '--quiz-accent-color': '#5a9de2',
    '--quiz-accent-hover': '#4a8dd2',
    '--quiz-accent-active': '#3a7dc2',
    '--quiz-error-color': '#ff6b6b',
    '--quiz-success-color': '#6bcf7f',
    '--quiz-warning-color': '#ffb84d',
    '--quiz-info-color': '#4da6ff',
    '--quiz-scrollbar-track-color': '#262626',
    '--quiz-scrollbar-thumb-color': '#404040',
    '--quiz-scrollbar-thumb-hover-color': '#505050',
    '--quiz-scrollbar-thumb-active-color': '#606060',
    '--quiz-shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
    '--quiz-shadow-md': '0 2px 4px rgba(0, 0, 0, 0.4)',
    '--quiz-shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.5)',
  },
  light: {
    '--quiz-bg-primary': '#ffffff',
    '--quiz-bg-secondary': '#fafafa',
    '--quiz-bg-tertiary': '#f5f5f5',
    '--quiz-bg-hover': '#f5f8ff',
    '--quiz-bg-selected': '#e8f2ff',
    '--quiz-text-primary': '#333333',
    '--quiz-text-secondary': '#666666',
    '--quiz-text-tertiary': '#999999',
    '--quiz-text-placeholder': '#999999',
    '--quiz-text-on-accent': '#ffffff',
    '--quiz-button-text-color': '#ffffff',
    '--quiz-border-color': '#e0e0e0',
    '--quiz-border-hover': '#4a90e2',
    '--quiz-border-focus': '#4a90e2',
    '--quiz-border-selected': '#4a90e2',
    '--quiz-accent-color': '#4a90e2',
    '--quiz-accent-hover': '#357abd',
    '--quiz-accent-active': '#2a5f8f',
    '--quiz-error-color': '#ff4d4f',
    '--quiz-success-color': '#52c41a',
    '--quiz-warning-color': '#faad14',
    '--quiz-info-color': '#1890ff',
    '--quiz-scrollbar-track-color': '#f5f5f5',
    '--quiz-scrollbar-thumb-color': '#cccccc',
    '--quiz-scrollbar-thumb-hover-color': '#999999',
    '--quiz-scrollbar-thumb-active-color': '#666666',
    '--quiz-shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
    '--quiz-shadow-md': '0 2px 4px rgba(0, 0, 0, 0.15)',
    '--quiz-shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
};

/**
 * 设置主题（CSS Hook API）
 * 在 :root 上设置 CSS 变量（用于应用级别的 UI 组件）
 * 使用 Editor 主题配置
 *
 * @param theme 主题名称或主题配置对象
 */
export function setEditorTheme(theme: EditorThemeName | EditorThemeConfig): void {
  // 如果是主题名称，获取预设配置
  const themeConfig: EditorThemeConfig =
    typeof theme === 'string'
      ? EDITOR_THEME_PRESETS[theme] || EDITOR_THEME_PRESETS['solarized-dark']
      : theme;

  // 在 :root 上设置所有 CSS 变量（CSS hook API）
  const root = document.documentElement;
  Object.entries(themeConfig).forEach(([property, value]) => {
    if (value !== undefined) {
      root.style.setProperty(property, value);
    }
  });
}
