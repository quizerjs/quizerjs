/**
 * @slidejs/runner-splide - 类型定义
 *
 * 定义 Splide 适配器的选项和配置
 */

import type { Options } from '@splidejs/splide';
import type { AdapterOptions } from '@slidejs/runner';

/**
 * SplideAdapter 选项
 *
 * Splide CSS 需要手动导入：
 * ```typescript
 * import '@splidejs/splide/css';
 * ```
 *
 * 注意：只需要导入基础 CSS，主题是可选的。
 */
export interface SplideAdapterOptions extends AdapterOptions {
  /**
   * Splide 配置选项
   * @see https://splidejs.com/options/
   */
  splideConfig?: Options;
}
