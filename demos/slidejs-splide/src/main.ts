/**
 * Slide DSL + Splide Demo - 使用 WSX 组件
 */

import { createSlideRunner } from '@slidejs/runner-splide';
import type { SlideContext } from '@slidejs/context';
// Splide CSS - 只需要导入基础 CSS
import '@splidejs/splide/css';
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
      splideOptions: {
        type: 'slide',
        perPage: 1,
        perMove: 1,
        gap: '1rem',
        pagination: true,
        arrows: true,
        keyboard: 'global',
        autoplay: false,
      },
    });

    // 启动演示（导航到第一张幻灯片）
    runner.play();

    console.log('✅ Presentation ready!');
    console.log('💡 Use arrow keys or drag to navigate');
  } catch (error) {
    console.error('❌ Error:', error);
    const app = document.querySelector('#app');
    if (app) {
      app.innerHTML = `<div style="padding: 2em; color: red;">Error: ${error instanceof Error ? error.message : String(error)}</div>`;
    }
  }
}

main();
