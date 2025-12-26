/**
 * @slidejs/runner-swiper - SlideRunner 工厂函数
 *
 * 提供创建配置好的 SlideRunner 实例的便捷方法
 */

import { parseSlideDSL, compile } from '@slidejs/dsl';
import { SlideRunner } from '@slidejs/runner';
import type { SlideContext } from '@slidejs/context';
import { SwiperAdapter } from './adapter';
import type { SwiperAdapterOptions } from './types';

/**
 * SlideRunner 配置选项
 */
export interface SlideRunnerConfig {
  /**
   * 容器选择器或 HTMLElement
   */
  container: string | HTMLElement;

  /**
   * Swiper 配置选项
   */
  swiperOptions?: SwiperAdapterOptions['swiperConfig'];
}

/**
 * 从 DSL 源代码创建并运行 SlideRunner
 *
 * @example
 * ```typescript
 * import { createSlideRunner } from '@slidejs/runner-swiper';
 *
 * const dslSource = `
 *   present quiz "demo" {
 *     rules {
 *       rule start "intro" {
 *         slide {
 *           content text { "Hello World!" }
 *         }
 *       }
 *     }
 *   }
 * `;
 *
 * const context = { sourceType: 'quiz', sourceId: 'demo', items: [] };
 * const runner = await createSlideRunner(dslSource, context, {
 *   container: '#app',
 *   swiperOptions: {
 *     navigation: true,
 *     pagination: true,
 *   },
 * });
 * ```
 */
export async function createSlideRunner<TContext extends SlideContext = SlideContext>(
  dslSource: string,
  context: TContext,
  config: SlideRunnerConfig
): Promise<SlideRunner<TContext>> {
  // 1. 解析 DSL
  const ast = await parseSlideDSL(dslSource);

  // 2. 编译为 SlideDSL
  const slideDSL = compile<TContext>(ast);

  // 3. 创建适配器和 Runner
  const adapter = new SwiperAdapter();
  const runner = new SlideRunner<TContext>({
    container: config.container,
    adapter,
    adapterOptions: {
      swiperConfig: config.swiperOptions,
    },
  });

  // 4. 运行演示（这会初始化适配器并渲染幻灯片）
  await runner.run(slideDSL, context);

  // 注意：需要手动调用 runner.play() 来启动演示（导航到第一张幻灯片）
  // 返回 runner 以便用户可以控制演示
  return runner;
}
