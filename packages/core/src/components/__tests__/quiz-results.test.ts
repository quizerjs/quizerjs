/**
 * @quizerjs/core - QuizResults 组件单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../index'; // 触发组件注册
import type { ResultDSL } from '@quizerjs/dsl';

/** 测试用：wsx-quiz-results 自定义元素类型 */
type QuizResultsElement = HTMLElement & {
  setAttribute(name: string, value: string): void;
  shadowRoot: ShadowRoot | null;
};

describe('QuizResults', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('应该能渲染 Markdown 格式的问题文本和解析', async () => {
    const mockResult: ResultDSL = {
      version: '1.0.0',
      metadata: {
        id: 'res-1',
        quizId: 'quiz-1',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        duration: 1000,
      },
      quiz: {
        version: '1.0.0',
        quiz: {
          id: 'quiz-1',
          title: 'Test Quiz',
          questions: [
            {
              id: 'q1',
              type: 'single_choice',
              text: 'Where is **Paris**?',
              explanation: 'It is in _France_.',
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ] as any[],
        },
      },
      answers: {},
      scoring: {
        totalScore: 10,
        maxScore: 10,
        percentage: 100,
        passed: true,
        passingScore: 6,
        questionResults: [
          {
            questionId: 'q1',
            correct: true,
            score: 10,
            maxScore: 10,
            userAnswer: 'Option A',
            correctAnswer: 'Option A',
          },
        ],
      },
    };

    const results = document.createElement('wsx-quiz-results') as QuizResultsElement;
    results.setAttribute('result-source', JSON.stringify(mockResult));
    container.appendChild(results);

    await new Promise(resolve => requestAnimationFrame(resolve));

    const textEl =
      results.shadowRoot?.querySelector('.quiz-results-question-text') ||
      results.querySelector('.quiz-results-question-text');
    const explanationEl =
      results.shadowRoot?.querySelector('.quiz-results-question-explanation-content') ||
      results.querySelector('.quiz-results-question-explanation-content');

    // LightComponent renders to children (no shadow root by default, but verify if implementation details changed)
    // Actually wsx LightComponent renders into the element itself.

    expect(textEl).toBeTruthy();
    expect(textEl?.innerHTML).toContain('<strong>Paris</strong>');

    expect(explanationEl).toBeTruthy();
    expect(explanationEl?.innerHTML).toContain('<em>France</em>');
  });
});
