// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QuizPlayer } from '../QuizPlayer';
import { QuizDSL } from '@quizerjs/dsl';
import { getQuizStoreById, resetQuizStore } from '@quizerjs/core';

// Mock @slidejs/runner-swiper since we don't want real DOM/Swiper interactions
vi.mock('@slidejs/runner-swiper', () => ({
  createSlideRunner: vi.fn().mockResolvedValue({
    play: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
    goTo: vi.fn(),
    destroy: vi.fn(),
  }),
}));

// Mock @quizerjs/theme
vi.mock('@quizerjs/theme', () => ({
  setPlayerTheme: vi.fn(),
}));

// Helper to create a basic QuizDSL
const createMockQuizDSL = (id: string = 'test-quiz'): QuizDSL => ({
  version: '1.0.0',
  quiz: {
    id,
    title: 'Test Quiz',
    description: 'A test quiz',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: 'Question 1',
        points: 10,
        options: [
          { id: 'opt1', text: 'Option 1', isCorrect: true },
          { id: 'opt2', text: 'Option 2', isCorrect: false },
        ],
      },
      {
        id: 'q2',
        type: 'text_input',
        text: 'Question 2',
        points: 10,
        correctAnswer: 'answer',
      },
    ],
  },
});

describe('QuizPlayer', () => {
  let player: QuizPlayer;
  let container: HTMLElement;
  let quizDSL: QuizDSL;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    quizDSL = createMockQuizDSL();
    resetQuizStore();
  });

  afterEach(async () => {
    if (player) {
      await player.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.clearAllMocks();
  });

  it('should initialize correctly', async () => {
    player = new QuizPlayer({ container, quizSource: quizDSL });
    await player.init();

    // Check if store is created and registered
    const store = getQuizStoreById(quizDSL.quiz.id);
    expect(store).toBeDefined();
  });

  it('should trigger onStart event', async () => {
    const onStart = vi.fn();
    player = new QuizPlayer({ container, quizSource: quizDSL, onStart });
    await player.init();
    player.start();

    expect(onStart).toHaveBeenCalled();
  });

  it('should trigger onAnswerChange event and update store', async () => {
    const onAnswerChange = vi.fn();
    player = new QuizPlayer({ container, quizSource: quizDSL, onAnswerChange });
    await player.init();
    player.start();

    player.setAnswer('q1', 'opt1');

    expect(onAnswerChange).toHaveBeenCalledWith('q1', 'opt1');

    // Verify store update
    const store = player.getStore();
    expect(store.getAnswers()).toEqual({ q1: 'opt1' });
  });

  it('should trigger onComplete event when all questions are answered', async () => {
    const onComplete = vi.fn();
    player = new QuizPlayer({ container, quizSource: quizDSL, onComplete });
    await player.init();
    player.start();

    player.setAnswer('q1', 'opt1');
    // Not complete yet
    expect(onComplete).not.toHaveBeenCalled();

    player.setAnswer('q2', 'answer');
    expect(onComplete).toHaveBeenCalled();
  });

  it('should trigger onSubmit event and return valid result', async () => {
    const onSubmit = vi.fn();
    player = new QuizPlayer({ container, quizSource: quizDSL, onSubmit });
    await player.init();
    player.start();

    // Answer questions
    player.setAnswer('q1', 'opt1'); // Correct
    player.setAnswer('q2', 'wrong'); // Incorrect

    const result = player.submit();

    expect(onSubmit).toHaveBeenCalledWith(result);
    // 10 pts for q1, 0 for q2 = 10 total
    expect(result.scoring.totalScore).toBe(10);
    expect(result.scoring.maxScore).toBe(20);
  });

  it('should reset answers and trigger onReset', async () => {
    const onReset = vi.fn();
    player = new QuizPlayer({ container, quizSource: quizDSL, onReset });
    await player.init();
    player.start();

    player.setAnswer('q1', 'opt1');
    player.reset();

    expect(onReset).toHaveBeenCalled();
    expect(player.getAnswers()).toEqual({});
    expect(player.getStore().getAnswers()).toEqual({});
  });

  it('should prevent infinite loop when event target is container', async () => {
    player = new QuizPlayer({ container, quizSource: quizDSL });
    await player.init();
    player.start();

    // Spy on setAnswer
    const setAnswerSpy = vi.spyOn(player, 'setAnswer');

    // Dispatch event from container itself (simulating bubble from self logic if buggy)
    const event = new CustomEvent('answer-change', {
      detail: { questionId: 'q1', answer: 'opt1' },
      bubbles: true,
    });

    container.dispatchEvent(event);

    // Should NOT call setAnswer because of the fix in listener
    expect(setAnswerSpy).not.toHaveBeenCalled();

    // Now dispatch on a child element
    const child = document.createElement('div');
    container.appendChild(child);
    child.dispatchEvent(
      new CustomEvent('answer-change', {
        detail: { questionId: 'q1', answer: 'opt1' },
        bubbles: true,
      })
    );

    // Should call setAnswer
    expect(setAnswerSpy).toHaveBeenCalledWith('q1', 'opt1');
  });
});
