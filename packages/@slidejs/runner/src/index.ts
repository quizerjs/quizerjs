/**
 * @slidejs/runner - 入口文件
 *
 * 导出所有公共 API
 */

export { SlideRunner } from './runner';
export { SlideRunnerError } from './errors';
export type {
  SlideAdapter,
  AdapterEvent,
  EventHandler,
  AdapterOptions,
  SlideRunnerPlugin,
  SlideRunnerConfig,
} from './types';
