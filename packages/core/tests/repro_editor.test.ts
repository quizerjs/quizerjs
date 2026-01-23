/**
 * @jest-environment jsdom
 */

import { dslToBlock, type EditorJSOutput } from '../src/transformer';
import { QuizDSL, QuestionTypes } from '@quizerjs/dsl';
import { register } from '@wsxjs/wsx-core';

describe('Editor Transformer Reproduction', () => {
  it('should transform DSL to Block correctly', () => {
    // 1. Define DSL with text
    const dsl: QuizDSL = {
      version: '1.0.0',
      quiz: {
        id: 'test-quiz',
        title: 'Test Quiz',
        questions: [
          {
            id: 'q1',
            type: QuestionTypes.SINGLE_CHOICE,
            text: 'What is 1+1?',
            options: [
              { id: 'o1', text: '1', isCorrect: false },
              { id: 'o2', text: '2', isCorrect: true },
            ],
          },
        ],
      },
    };

    // 2. Convert to Block Data
    const editorData: EditorJSOutput = dslToBlock(dsl);
    const quizBlock = editorData.blocks.find(b => b.type === 'quiz-single-choice');

    expect(quizBlock).toBeDefined();
    console.log('Block Data:', JSON.stringify(quizBlock!.data, null, 2));
    expect(quizBlock!.data.question.text).toBe('What is 1+1?');
  });
});
