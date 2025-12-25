import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
// 主题 CSS 由 useTheme hook 动态加载

ReactDOM.createRoot(document.getElementById('app')!).render(<App />);
