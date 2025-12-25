import App from './App.svelte';
import './style.css';
// 主题 CSS 由 theme store 动态加载

const app = new App({
  target: document.getElementById('app')!,
});

export default app;
