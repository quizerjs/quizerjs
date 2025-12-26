/**
 * Slide DSL + Swiper Demo - 使用 WSX 组件
 */

import { createSlideRunner } from '@slidejs/runner-swiper';
import type { SlideContext } from '@slidejs/context';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
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
      swiperOptions: {
        direction: 'horizontal',
        loop: false,
        speed: 300,
        spaceBetween: 30,
        slidesPerView: 1,
        // navigation 和 keyboard 已在适配器中默认启用
        // 这里可以覆盖配置
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
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
