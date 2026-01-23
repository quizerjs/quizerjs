/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizPlayer } from '../src/player/QuizPlayer';
import { getDefaultSlideSource } from '../src/player/defaultSlideSource';
import { QuizDSL, QuestionTypes } from '@quizerjs/dsl';

// Mock dependencies if necessary, but we want to test the full init flow if possible
// We might need to mock @slidejs/runner-swiper's createSlideRunner since it uses Swiper which might need DOM/Canvas
vi.mock('@slidejs/runner-swiper', () => ({
  createSlideRunner: vi.fn().mockResolvedValue({
    play: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
  }),
}));

describe('QuizPlayer Integration Reproduction', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container); // Append to body so querySelector works if needed
  });

  it('should initialize successfully with default slide source', async () => {
    // 1. Valid Quiz DSL
    const quizDSL: QuizDSL = {
      version: '1.0.0',
      quiz: {
        id: 'test-quiz',
        title: 'Integration Test Quiz',
        description: 'Testing player init',
        questions: [
          {
            id: 'q1',
            type: QuestionTypes.TRUE_FALSE,
            text: 'Is this working?',
            correctAnswer: true,
          },
        ],
      },
    };

    // 2. Get the actual default slide source we want to verify
    const slideSource = getDefaultSlideSource();
    expect(slideSource).toContain('present quiz');

    // 3. Initialize Player
    const player = new QuizPlayer({
      container,
      quizSource: quizDSL,
      slideSource: slideSource, // Use explicit source to test it
    });

    // 4. Run init() - this will throw if the slideSource DSL is causing parser errors in createSlideRunner
    // Note: Since we mocked createSlideRunner, we are verifying that QuizPlayer code logic + DSL *passing* is correct.
    // We are trusting that createSlideRunner *would* work if the DSL string is valid in the Runner,
    // BUT we validated the DSL string syntax manually in previous step.
    // The main error previously was QuizPlayer throwing before calling runner, or during setup.

    await expect(player.init()).resolves.not.toThrow();

    console.log('Player initialized successfully');
  });
});
