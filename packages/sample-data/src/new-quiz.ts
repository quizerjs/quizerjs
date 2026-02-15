/**
 * New Quiz - Minimal quiz with one multiple choice question
 * Used for testing default section behavior
 */

import type { QuizDSL } from '@quizerjs/dsl';

export const newQuizDSL: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'new-quiz',
    title: 'New Quiz',
    description: 'A fresh quiz ready for editing',
    sections: [
      {
        id: 'default-section',
        title: '默认章节',
        questions: [
          {
            id: 'q-1',
            type: 'multiple_choice',
            text: 'Select all programming languages from the list below:',
            options: [
              { id: 'opt-1', text: 'JavaScript', isCorrect: true },
              { id: 'opt-2', text: 'Python', isCorrect: true },
              { id: 'opt-3', text: 'HTML', isCorrect: false },
              { id: 'opt-4', text: 'TypeScript', isCorrect: true },
            ],
          },
        ],
      },
    ],
  },
};
