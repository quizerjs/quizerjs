/**
 * @quizerjs/theme Player Theme API
 * 提供 Player 主题设置的 API（基于 @slidejs/theme）
 */

import { setTheme as setSlideTheme } from '@slidejs/theme';

/**
 * Player 主题配置对象（用于 @slidejs/theme）
 * 这些属性会被传递给 @slidejs/theme.setTheme()，它会在 :root 上设置 CSS 变量
 */
export interface PlayerThemeConfig {
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  navigationColor?: string;
  paginationColor?: string;
  paginationActiveColor?: string;
  scrollbarBg?: string;
  scrollbarDragBg?: string;
  arrowColor?: string;
  progressBarColor?: string;
  headingColor?: string;
  codeBackground?: string;
  [key: string]: string | undefined; // 允许扩展自定义属性
}

/**
 * Player 主题名称
 */
export type PlayerThemeName =
  | 'solarized-dark'
  | 'solarized-light'
  | 'dark'
  | 'light'
  | (string & {});

/**
 * Player 预设主题配置
 * 这些预设会传递给 @slidejs/theme.setTheme()
 */
export const PLAYER_THEME_PRESETS: Record<PlayerThemeName, PlayerThemeConfig> = {
  'solarized-dark': {
    backgroundColor: '#002b36',
    textColor: '#839496',
    linkColor: '#268bd2',
    navigationColor: '#839496',
    paginationColor: '#586e75',
    paginationActiveColor: '#268bd2',
    scrollbarBg: '#073642',
    scrollbarDragBg: '#586e75',
    arrowColor: '#839496',
    progressBarColor: '#268bd2',
    headingColor: '#93a1a1',
    codeBackground: '#073642',
  },
  'solarized-light': {
    backgroundColor: '#fdf6e3',
    textColor: '#586e75',
    linkColor: '#268bd2',
    navigationColor: '#586e75',
    paginationColor: '#93a1a1',
    paginationActiveColor: '#268bd2',
    scrollbarBg: '#eee8d5',
    scrollbarDragBg: '#93a1a1',
    arrowColor: '#586e75',
    progressBarColor: '#268bd2',
    headingColor: '#657b83',
    codeBackground: '#eee8d5',
  },
  dark: {
    backgroundColor: '#1a1a1a',
    textColor: '#e0e0e0',
    linkColor: '#4a9eff',
    navigationColor: '#e0e0e0',
    paginationColor: '#666666',
    paginationActiveColor: '#4a9eff',
    scrollbarBg: '#2a2a2a',
    scrollbarDragBg: '#666666',
    arrowColor: '#e0e0e0',
    progressBarColor: '#4a9eff',
    headingColor: '#ffffff',
    codeBackground: '#2a2a2a',
  },
  light: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    linkColor: '#0066cc',
    navigationColor: '#333333',
    paginationColor: '#999999',
    paginationActiveColor: '#0066cc',
    scrollbarBg: '#f0f0f0',
    scrollbarDragBg: '#999999',
    arrowColor: '#333333',
    progressBarColor: '#0066cc',
    headingColor: '#000000',
    codeBackground: '#f5f5f5',
  },
};

/**
 * 设置 Player 主题（CSS Hook API）
 * 通过 @slidejs/theme.setTheme() 在 :root 上设置 CSS 变量
 *
 * @param theme 主题名称或主题配置对象
 */
export function setPlayerTheme(theme: PlayerThemeName | PlayerThemeConfig): void {
  // 如果是主题名称，获取预设配置
  const themeConfig: PlayerThemeConfig =
    typeof theme === 'string'
      ? PLAYER_THEME_PRESETS[theme] || PLAYER_THEME_PRESETS['solarized-dark']
      : theme;

  // 调用 @slidejs/theme.setTheme() 设置主题
  setSlideTheme(themeConfig);
}
