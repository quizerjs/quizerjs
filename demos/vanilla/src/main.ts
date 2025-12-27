import './style.css';
// 静态导入主题 CSS
import '@quizerjs/theme/solarized-light.css';
import '@quizerjs/theme/solarized-dark.css';
import './App.wsx';

// 初始化应用
const appRoot = document.getElementById('app');
if (appRoot) {
  const appElement = document.createElement('quizerjs-app');
  appRoot.appendChild(appElement);
}
