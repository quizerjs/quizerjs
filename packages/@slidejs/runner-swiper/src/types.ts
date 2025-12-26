/**
 * @slidejs/runner-swiper - 类型定义
 *
 * 定义 Swiper 适配器的选项和配置
 */

import type { SwiperOptions } from 'swiper';
import type { AdapterOptions } from '@slidejs/runner';

/**
 * SwiperAdapter 选项
 *
 * Swiper CSS 需要手动导入：
 * ```typescript
 * import 'swiper/css';
 * import 'swiper/css/navigation';
 * import 'swiper/css/pagination';
 * ```
 *
 * 注意：Keyboard、Navigation 和 Pagination 模块已在适配器中自动注册，
 * 无需在配置中再次指定 modules。
 */
export interface SwiperAdapterOptions extends AdapterOptions {
  /**
   * Swiper 配置选项
   * @see https://swiperjs.com/swiper-api#parameters
   */
  swiperConfig?: SwiperOptions;
}
