/**
 * Slide DSL + reveal.js Demo - 使用 WSX 组件
 */

import { createSlideRunner } from '@slidejs/runner-revealjs';
import type { SlideContext } from '@slidejs/context';
import 'reveal.js/dist/theme/black.css';
import './style.css';

// 导入自定义 Web Component（必须在使用前注册）
import './components/my-quiz-question.wsx';

// 导入 DSL 文件
import dslSource from './demo.slide?raw';

const context: SlideContext = {
  sourceType: 'quiz',
  sourceId: 'demo',
  items: [],
};

async function main() {
  try {
    const runner = await createSlideRunner(dslSource, context, {
      container: '#app',
      revealOptions: {
        controls: true,
        progress: true,
        center: true,
        transition: 'slide',
      },
    });

    // 启动演示（导航到第一张幻灯片）
    runner.play();

    console.log('✅ Presentation ready!');
  } catch (error) {
    console.error('❌ Error:', error);
    const app = document.querySelector('#app');
    if (app) {
      app.innerHTML = `<div style="padding: 2em; color: red;">Error: ${error instanceof Error ? error.message : String(error)}</div>`;
    }
  }
}

main();
