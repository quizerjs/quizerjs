/**
 * @slidejs/runner-revealjs - 入口文件
 *
 * 导出 reveal.js 适配器和 SlideRunner 工厂函数
 *
 * 主题使用方法（直接从 reveal.js 导入）：
 * ```typescript
 * import 'reveal.js/dist/theme/black.css';
 * // 或其他主题: white.css, league.css, sky.css, night.css, beige.css
 * ```
 */

// 适配器（低级 API）
export { RevealJsAdapter } from './adapter';
export type { RevealJsOptions } from './types';

// SlideRunner 工厂函数（推荐）
export { createSlideRunner } from './runner';
export type { SlideRunnerConfig } from './runner';

// 重新导出 SlideRunner 类型
export type { SlideRunner } from '@slidejs/runner';
