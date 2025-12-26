/**
 * @slidejs/core - Slide DSL 规则引擎
 */

import type { SlideContext } from '@slidejs/context';
import type { SlideDSL, SlideDefinition } from './types';

/**
 * Slide DSL 规则引擎
 * 根据规则和 Context 生成最终的 Slide 列表
 */
export class SlideEngine<TContext extends SlideContext = SlideContext> {
  constructor(private dsl: SlideDSL<TContext>) {
    this.validateDSL();
  }

  /**
   * 验证 DSL 定义
   */
  private validateDSL(): void {
    const { rules } = this.dsl;

    // 确保至少有一个 start 规则
    const hasStart = rules.some(r => r.type === 'start');
    if (!hasStart) {
      throw new SlideEngineError('At least one "start" rule is required', 'MISSING_START_RULE');
    }

    // 确保至少有一个 end 规则
    const hasEnd = rules.some(r => r.type === 'end');
    if (!hasEnd) {
      throw new SlideEngineError('At least one "end" rule is required', 'MISSING_END_RULE');
    }
  }

  /**
   * 生成 Slides
   */
  generate(context: TContext): SlideDefinition[] {
    // 验证 Context 与 DSL 的源类型匹配
    if (context.sourceType !== this.dsl.sourceType) {
      throw new SlideEngineError(
        `Context source type "${context.sourceType}" does not match DSL source type "${this.dsl.sourceType}"`,
        'SOURCE_TYPE_MISMATCH'
      );
    }

    const slides: SlideDefinition[] = [];
    const { rules } = this.dsl;

    // 执行顺序：start → content → end
    const startRules = rules.filter(r => r.type === 'start');
    const contentRules = rules.filter(r => r.type === 'content');
    const endRules = rules.filter(r => r.type === 'end');

    // 1. 执行 start 规则
    for (const rule of startRules) {
      try {
        const ruleSlides = rule.generate(context);
        slides.push(...this.enrichSlides(ruleSlides, rule.name));
      } catch (error) {
        throw new SlideEngineError(
          `Error in start rule "${rule.name}": ${(error as Error).message}`,
          'RULE_GENERATION_ERROR',
          error as Error
        );
      }
    }

    // 2. 执行 content 规则
    for (const rule of contentRules) {
      try {
        const ruleSlides = rule.generate(context);
        slides.push(...this.enrichSlides(ruleSlides, rule.name));
      } catch (error) {
        throw new SlideEngineError(
          `Error in content rule "${rule.name}": ${(error as Error).message}`,
          'RULE_GENERATION_ERROR',
          error as Error
        );
      }
    }

    // 3. 执行 end 规则
    for (const rule of endRules) {
      try {
        const ruleSlides = rule.generate(context);
        slides.push(...this.enrichSlides(ruleSlides, rule.name));
      } catch (error) {
        throw new SlideEngineError(
          `Error in end rule "${rule.name}": ${(error as Error).message}`,
          'RULE_GENERATION_ERROR',
          error as Error
        );
      }
    }

    return slides;
  }

  /**
   * 丰富 Slides（添加默认值、生成 ID 等）
   */
  private enrichSlides(slides: SlideDefinition[], ruleName: string): SlideDefinition[] {
    return slides.map((slide, index) => ({
      ...slide,
      id: slide.id || `${ruleName}-${index}`,
      behavior: {
        ...(this.dsl.config?.defaultTransition && {
          transition: this.dsl.config.defaultTransition,
        }),
        ...(this.dsl.config?.defaultBackground && {
          background: this.dsl.config.defaultBackground,
        }),
        ...slide.behavior,
      },
    }));
  }
}

/**
 * Slide Engine 错误
 */
export class SlideEngineError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'SlideEngineError';
  }
}
