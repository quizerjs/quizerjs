/**
 * @slidejs/core
 *
 * Slide DSL 核心引擎
 */

export type {
  SlideDSL,
  SlideRule,
  SlideDefinition,
  SlideContent,
  DynamicContent,
  StaticContent,
  SlideBehavior,
  SlideTransition,
  SlideBackground,
  SlideLayout,
  SlideConfig,
} from './types';

export { SlideEngine, SlideEngineError } from './engine';
