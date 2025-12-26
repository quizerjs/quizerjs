import { describe, it, expect } from 'vitest';
import { SlideEngine } from '../engine';
import type { SlideDSL } from '../types';
import type { SlideContext } from '@slidejs/context';

describe('SlideEngine', () => {
  it('should create an instance', () => {
    const dsl: SlideDSL<SlideContext> = {
      version: '1.0.0',
      sourceType: 'quiz',
      sourceId: 'test',
      rules: [
        {
          type: 'start',
          name: 'intro',
          generate: () => [],
        },
        {
          type: 'end',
          name: 'thanks',
          generate: () => [],
        },
      ],
    };

    const engine = new SlideEngine(dsl);
    expect(engine).toBeInstanceOf(SlideEngine);
  });

  it('should generate slides from context', () => {
    const dsl: SlideDSL<SlideContext> = {
      version: '1.0.0',
      sourceType: 'quiz',
      sourceId: 'test',
      rules: [
        {
          type: 'start',
          name: 'intro',
          generate: () => [
            {
              content: {
                type: 'text',
                lines: ['Welcome'],
              },
            },
          ],
        },
        {
          type: 'end',
          name: 'thanks',
          generate: () => [
            {
              content: {
                type: 'text',
                lines: ['Thank you'],
              },
            },
          ],
        },
      ],
    };

    const context: SlideContext = {
      sourceType: 'quiz',
      sourceId: 'test',
      items: [],
    };

    const engine = new SlideEngine(dsl);
    const slides = engine.generate(context);

    expect(slides).toHaveLength(2);
    expect(slides[0].content.type).toBe('text');
    expect(slides[1].content.type).toBe('text');
  });
});

