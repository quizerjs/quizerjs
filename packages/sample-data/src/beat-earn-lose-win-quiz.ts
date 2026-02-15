/**
 * Beat, Earn, Lose & Win 测验测试数据
 * 来源: https://www.usingenglish.com/quizzes/277.html
 *
 * 这是一个包含10道关于动词 beat, earn, lose, win 的选择题测验
 */

import type { QuizDSL } from '@quizerjs/dsl';

export const beatEarnLoseWinQuizDSL: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'beat-earn-lose-win-quiz-277',
    title: 'Beat, Earn, Lose & Win',
    description:
      'Choose the correct verb (beat, earn, lose, or win) to complete each sentence. This quiz tests your understanding of these commonly confused verbs.',
    sections: [
      {
        id: 'section-1',
        title: 'Beat, Earn, Lose & Win Questions',
        questions: [
          {
            id: 'q-1',
            type: 'single_choice',
            text: 'She ______ the championship last year.',
            description: 'Hint: The event happened in the past and refers to a competition.',
            options: [
              { id: 'opt-1-1', text: 'beat', isCorrect: false },
              { id: 'opt-1-2', text: 'won', isCorrect: true },
              { id: 'opt-1-3', text: 'earned', isCorrect: false },
              { id: 'opt-1-4', text: 'lost', isCorrect: false },
            ],
          },
          {
            id: 'q-2',
            type: 'single_choice',
            text: 'He ______ a fortune through his investments.',
            description: 'Context: Relating to financial gain from business or investment.',
            options: [
              { id: 'opt-2-1', text: 'beat', isCorrect: false },
              { id: 'opt-2-2', text: 'won', isCorrect: false },
              { id: 'opt-2-3', text: 'earned', isCorrect: true },
              { id: 'opt-2-4', text: 'lost', isCorrect: false },
            ],
          },
          {
            id: 'q-3',
            type: 'single_choice',
            text: 'They ______ the opposing team by three goals.',
            options: [
              { id: 'opt-3-1', text: 'beat', isCorrect: true },
              { id: 'opt-3-2', text: 'won', isCorrect: false },
              { id: 'opt-3-3', text: 'earned', isCorrect: false },
              { id: 'opt-3-4', text: 'lost', isCorrect: false },
            ],
          },
          {
            id: 'q-4',
            type: 'single_choice',
            text: 'After misplacing his wallet, he realized he had ______ all his cash.',
            options: [
              { id: 'opt-4-1', text: 'beat', isCorrect: false },
              { id: 'opt-4-2', text: 'won', isCorrect: false },
              { id: 'opt-4-3', text: 'earned', isCorrect: false },
              { id: 'opt-4-4', text: 'lost', isCorrect: true },
            ],
          },
          {
            id: 'q-5',
            type: 'single_choice',
            text: 'Despite their efforts, the team ______ the match.',
            options: [
              { id: 'opt-5-1', text: 'beat', isCorrect: false },
              { id: 'opt-5-2', text: 'won', isCorrect: false },
              { id: 'opt-5-3', text: 'earned', isCorrect: false },
              { id: 'opt-5-4', text: 'lost', isCorrect: true },
            ],
          },
          {
            id: 'q-6',
            type: 'single_choice',
            text: 'She ______ a medal for her performance in the competition.',
            options: [
              { id: 'opt-6-1', text: 'beat', isCorrect: false },
              { id: 'opt-6-2', text: 'won', isCorrect: true },
              { id: 'opt-6-3', text: 'earned', isCorrect: false },
              { id: 'opt-6-4', text: 'lost', isCorrect: false },
            ],
          },
          {
            id: 'q-7',
            type: 'single_choice',
            text: 'He ______ his opponent in the final round.',
            options: [
              { id: 'opt-7-1', text: 'beat', isCorrect: true },
              { id: 'opt-7-2', text: 'won', isCorrect: false },
              { id: 'opt-7-3', text: 'earned', isCorrect: false },
              { id: 'opt-7-4', text: 'lost', isCorrect: false },
            ],
          },
          {
            id: 'q-8',
            type: 'single_choice',
            text: 'After years of hard work, she finally ______ a promotion.',
            options: [
              { id: 'opt-8-1', text: 'beat', isCorrect: false },
              { id: 'opt-8-2', text: 'won', isCorrect: false },
              { id: 'opt-8-3', text: 'earned', isCorrect: true },
              { id: 'opt-8-4', text: 'lost', isCorrect: false },
            ],
          },
          {
            id: 'q-9',
            type: 'single_choice',
            text: 'They ______ the contract after months of negotiations.',
            options: [
              { id: 'opt-9-1', text: 'beat', isCorrect: false },
              { id: 'opt-9-2', text: 'won', isCorrect: true },
              { id: 'opt-9-3', text: 'earned', isCorrect: false },
              { id: 'opt-9-4', text: 'lost', isCorrect: false },
            ],
          },
          {
            id: 'q-10',
            type: 'single_choice',
            text: 'He ______ his temper during the heated argument.',
            options: [
              { id: 'opt-10-1', text: 'beat', isCorrect: false },
              { id: 'opt-10-2', text: 'won', isCorrect: false },
              { id: 'opt-10-3', text: 'earned', isCorrect: false },
              { id: 'opt-10-4', text: 'lost', isCorrect: true },
            ],
          },
        ],
      },
    ],
  },
};
