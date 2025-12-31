/**
 * QuizerJS Site - Main Entry Point
 *
 * 初始化 wsx 应用，挂载根组件到 DOM
 */

import { createLogger } from '@wsxjs/wsx-core';
import 'uno.css'; // UnoCSS 工具类
// 导入主题系统（使用 CSS Hook API）
import { setEditorTheme, setPlayerTheme } from '@quizerjs/theme';
import './main.css'; // 全局样式
// 导入基础组件包（包含 CSS）
import '@wsxjs/wsx-base-components';
// 导入路由
import '@wsxjs/wsx-router';
// 初始化 i18n（必须在组件导入之前）
import './i18n';

// 导入 App 组件（触发自动注册）
import './App.wsx';

const logger = createLogger('QuizerJS-Site');

/**
 * 初始化应用
 */
function initApp() {
  // 应用主题（使用 CSS Hook API）
  // 使用 solarized-dark 作为默认主题（严肃活泼的暖色单系色调）
  setEditorTheme('solarized-dark');

  setPlayerTheme('solarized-dark');

  const appContainer = document.getElementById('app');

  if (!appContainer) {
    logger.error('App container not found');
    return;
  }

  // 挂载 WSX App 组件到 DOM
  // 使用自定义元素标签名（由 @autoRegister 定义）
  appContainer.innerHTML = '<quizerjs-app></quizerjs-app>';

  logger.info('QuizerJS Site initialized');
}

// DOM 就绪后启动应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
