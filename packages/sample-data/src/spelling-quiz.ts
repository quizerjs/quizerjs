/**
 * 拼写测验测试数据
 * 来源: https://www.usingenglish.com/quizzes/33.html
 *
 * 这是一个包含33道拼写选择题的测验，用于测试 quizerjs 编辑器功能
 */

import type { QuizDSL } from '@quizerjs/dsl';

export const spellingQuizDSL: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'spelling-quiz-33',
    title: 'Spelling Quiz',
    description:
      'Choose the correct spelling for each word. This quiz contains 33 questions about common spelling mistakes.',
    sections: [
      {
        id: 'section-1',
        title: 'Spelling Questions',
        questions: [
          {
            id: 'q-1',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            description: 'Common mistake: double r, double s.',
            options: [
              { id: 'opt-1-1', text: 'embarasment', isCorrect: false },
              { id: 'opt-1-2', text: 'embarrasment', isCorrect: false },
              { id: 'opt-1-3', text: 'embarrassment', isCorrect: true },
              { id: 'opt-1-4', text: 'embarassment', isCorrect: false },
            ],
          },
          {
            id: 'q-2',
            type: 'single_choice',
            text: 'Which is correct?',
            description: 'Common mistake: double c, double m.',
            options: [
              { id: 'opt-2-1', text: 'acomodate', isCorrect: false },
              { id: 'opt-2-2', text: 'accomodate', isCorrect: false },
              { id: 'opt-2-3', text: 'acommodate', isCorrect: false },
              { id: 'opt-2-4', text: 'accommodate', isCorrect: true },
            ],
          },
          {
            id: 'q-3',
            type: 'single_choice',
            text: 'Which is right in British English?',
            options: [
              { id: 'opt-3-1', text: 'finalise', isCorrect: true },
              { id: 'opt-3-2', text: 'finalize', isCorrect: false },
              { id: 'opt-3-3', text: 'Both.', isCorrect: false },
            ],
          },
          {
            id: 'q-4',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-4-1', text: 'seperate', isCorrect: false },
              { id: 'opt-4-2', text: 'separate', isCorrect: true },
              { id: 'opt-4-3', text: 'seperrate', isCorrect: false },
              { id: 'opt-4-4', text: 'seperat', isCorrect: false },
            ],
          },
          // New Question Types
          {
            id: 'q-34',
            type: 'multiple_choice',
            text: 'Which of the following are colors? (Select all that apply)',
            options: [
              { id: 'opt-34-1', text: 'Red', isCorrect: true },
              { id: 'opt-34-2', text: 'Car', isCorrect: false },
              { id: 'opt-34-3', text: 'Blue', isCorrect: true },
              { id: 'opt-34-4', text: 'Dog', isCorrect: false },
            ],
          },
          {
            id: 'q-35',
            type: 'true_false',
            text: 'The earth is flat.',
            correctAnswer: false,
          },
          {
            id: 'q-36',
            type: 'text_input',
            text: 'What is the capital of France?',
            correctAnswer: 'Paris',
          },
        ],
      },
    ],
  },
};
