import './style.css';
import './App.wsx';
// 初始化主题（使用 CSS Hook API）
import { setPlayerTheme } from '@quizerjs/theme/player';
import { setEditorTheme } from '@quizerjs/theme/editor';
import { themeManager } from './theme';

// 应用主题（使用 CSS Hook API）
const applyTheme = (isDark: boolean) => {
  const themeName = isDark ? 'solarized-dark' : 'solarized-light';
  setPlayerTheme(themeName);
  setEditorTheme(themeName);
};

// 初始化时应用主题
applyTheme(themeManager.getTheme());

// 监听主题变化
themeManager.subscribe(applyTheme);

// 初始化应用
const appRoot = document.getElementById('app');
if (appRoot) {
  const appElement = document.createElement('quizerjs-app');
  appRoot.appendChild(appElement);
}
