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
          {
            id: 'q-5',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-5-1', text: 'definately', isCorrect: false },
              { id: 'opt-5-2', text: 'definately', isCorrect: false },
              { id: 'opt-5-3', text: 'definitely', isCorrect: true },
              { id: 'opt-5-4', text: 'definitley', isCorrect: false },
            ],
          },
          {
            id: 'q-6',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-6-1', text: 'occured', isCorrect: false },
              { id: 'opt-6-2', text: 'ocurred', isCorrect: false },
              { id: 'opt-6-3', text: 'occurred', isCorrect: true },
              { id: 'opt-6-4', text: 'ocured', isCorrect: false },
            ],
          },
          {
            id: 'q-7',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-7-1', text: 'recieve', isCorrect: false },
              { id: 'opt-7-2', text: 'receive', isCorrect: true },
              { id: 'opt-7-3', text: 'recive', isCorrect: false },
              { id: 'opt-7-4', text: 'receve', isCorrect: false },
            ],
          },
          {
            id: 'q-8',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-8-1', text: 'independant', isCorrect: false },
              { id: 'opt-8-2', text: 'independant', isCorrect: false },
              { id: 'opt-8-3', text: 'independent', isCorrect: true },
              { id: 'opt-8-4', text: 'indepedent', isCorrect: false },
            ],
          },
          {
            id: 'q-9',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-9-1', text: 'existance', isCorrect: false },
              { id: 'opt-9-2', text: 'existance', isCorrect: false },
              { id: 'opt-9-3', text: 'existence', isCorrect: true },
              { id: 'opt-9-4', text: 'exsistence', isCorrect: false },
            ],
          },
          {
            id: 'q-10',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-10-1', text: 'maintainance', isCorrect: false },
              { id: 'opt-10-2', text: 'maintainence', isCorrect: false },
              { id: 'opt-10-3', text: 'maintenance', isCorrect: true },
              { id: 'opt-10-4', text: 'maintanance', isCorrect: false },
            ],
          },
          {
            id: 'q-11',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-11-1', text: 'neccessary', isCorrect: false },
              { id: 'opt-11-2', text: 'necesary', isCorrect: false },
              { id: 'opt-11-3', text: 'necessary', isCorrect: true },
              { id: 'opt-11-4', text: 'necesarry', isCorrect: false },
            ],
          },
          {
            id: 'q-12',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-12-1', text: 'priviledge', isCorrect: false },
              { id: 'opt-12-2', text: 'priviledge', isCorrect: false },
              { id: 'opt-12-3', text: 'privilege', isCorrect: true },
              { id: 'opt-12-4', text: 'privelege', isCorrect: false },
            ],
          },
          {
            id: 'q-13',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-13-1', text: 'rythm', isCorrect: false },
              { id: 'opt-13-2', text: 'rythm', isCorrect: false },
              { id: 'opt-13-3', text: 'rhythm', isCorrect: true },
              { id: 'opt-13-4', text: 'rhythem', isCorrect: false },
            ],
          },
          {
            id: 'q-14',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-14-1', text: 'sucessful', isCorrect: false },
              { id: 'opt-14-2', text: 'successful', isCorrect: true },
              { id: 'opt-14-3', text: 'succesful', isCorrect: false },
              { id: 'opt-14-4', text: 'sucessfull', isCorrect: false },
            ],
          },
          {
            id: 'q-15',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-15-1', text: 'tommorrow', isCorrect: false },
              { id: 'opt-15-2', text: 'tomorrow', isCorrect: true },
              { id: 'opt-15-3', text: 'tommorow', isCorrect: false },
              { id: 'opt-15-4', text: 'tomorow', isCorrect: false },
            ],
          },
          {
            id: 'q-16',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-16-1', text: 'acomplish', isCorrect: false },
              { id: 'opt-16-2', text: 'accomplish', isCorrect: true },
              { id: 'opt-16-3', text: 'acomplish', isCorrect: false },
              { id: 'opt-16-4', text: 'acomplishe', isCorrect: false },
            ],
          },
          {
            id: 'q-17',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-17-1', text: 'begining', isCorrect: false },
              { id: 'opt-17-2', text: 'beginning', isCorrect: true },
              { id: 'opt-17-3', text: 'begining', isCorrect: false },
              { id: 'opt-17-4', text: 'begginning', isCorrect: false },
            ],
          },
          {
            id: 'q-18',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-18-1', text: 'beleive', isCorrect: false },
              { id: 'opt-18-2', text: 'believe', isCorrect: true },
              { id: 'opt-18-3', text: 'beleive', isCorrect: false },
              { id: 'opt-18-4', text: 'belive', isCorrect: false },
            ],
          },
          {
            id: 'q-19',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-19-1', text: 'calender', isCorrect: false },
              { id: 'opt-19-2', text: 'calendar', isCorrect: true },
              { id: 'opt-19-3', text: 'calender', isCorrect: false },
              { id: 'opt-19-4', text: 'calandar', isCorrect: false },
            ],
          },
          {
            id: 'q-20',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-20-1', text: 'cemetary', isCorrect: false },
              { id: 'opt-20-2', text: 'cemetery', isCorrect: true },
              { id: 'opt-20-3', text: 'cemetary', isCorrect: false },
              { id: 'opt-20-4', text: 'cemetery', isCorrect: false },
            ],
          },
          {
            id: 'q-21',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-21-1', text: 'conscience', isCorrect: true },
              { id: 'opt-21-2', text: 'consciense', isCorrect: false },
              { id: 'opt-21-3', text: 'conscence', isCorrect: false },
              { id: 'opt-21-4', text: 'consciance', isCorrect: false },
            ],
          },
          {
            id: 'q-22',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-22-1', text: 'dependant', isCorrect: false },
              { id: 'opt-22-2', text: 'dependent', isCorrect: true },
              { id: 'opt-22-3', text: 'dependant', isCorrect: false },
              { id: 'opt-22-4', text: 'dependat', isCorrect: false },
            ],
          },
          {
            id: 'q-23',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-23-1', text: 'exagerate', isCorrect: false },
              { id: 'opt-23-2', text: 'exaggerate', isCorrect: true },
              { id: 'opt-23-3', text: 'exagerate', isCorrect: false },
              { id: 'opt-23-4', text: 'exagerrate', isCorrect: false },
            ],
          },
          {
            id: 'q-24',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-24-1', text: 'exhilirate', isCorrect: false },
              { id: 'opt-24-2', text: 'exhilarate', isCorrect: true },
              { id: 'opt-24-3', text: 'exhilirate', isCorrect: false },
              { id: 'opt-24-4', text: 'exhilerate', isCorrect: false },
            ],
          },
          {
            id: 'q-25',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-25-1', text: 'guarentee', isCorrect: false },
              { id: 'opt-25-2', text: 'guarantee', isCorrect: true },
              { id: 'opt-25-3', text: 'guarentee', isCorrect: false },
              { id: 'opt-25-4', text: 'garantee', isCorrect: false },
            ],
          },
          {
            id: 'q-26',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-26-1', text: 'harrass', isCorrect: false },
              { id: 'opt-26-2', text: 'harass', isCorrect: true },
              { id: 'opt-26-3', text: 'harrass', isCorrect: false },
              { id: 'opt-26-4', text: 'haras', isCorrect: false },
            ],
          },
          {
            id: 'q-27',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-27-1', text: 'imediately', isCorrect: false },
              { id: 'opt-27-2', text: 'immediately', isCorrect: true },
              { id: 'opt-27-3', text: 'imediately', isCorrect: false },
              { id: 'opt-27-4', text: 'immediatly', isCorrect: false },
            ],
          },
          {
            id: 'q-28',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-28-1', text: 'liason', isCorrect: false },
              { id: 'opt-28-2', text: 'liaison', isCorrect: true },
              { id: 'opt-28-3', text: 'liason', isCorrect: false },
              { id: 'opt-28-4', text: 'laison', isCorrect: false },
            ],
          },
          {
            id: 'q-29',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-29-1', text: 'millenium', isCorrect: false },
              { id: 'opt-29-2', text: 'millennium', isCorrect: true },
              { id: 'opt-29-3', text: 'millenium', isCorrect: false },
              { id: 'opt-29-4', text: 'milenium', isCorrect: false },
            ],
          },
          {
            id: 'q-30',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-30-1', text: 'miniscule', isCorrect: false },
              { id: 'opt-30-2', text: 'minuscule', isCorrect: true },
              { id: 'opt-30-3', text: 'miniscule', isCorrect: false },
              { id: 'opt-30-4', text: 'miniscul', isCorrect: false },
            ],
          },
          {
            id: 'q-31',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-31-1', text: 'occassion', isCorrect: false },
              { id: 'opt-31-2', text: 'occasion', isCorrect: true },
              { id: 'opt-31-3', text: 'occassion', isCorrect: false },
              { id: 'opt-31-4', text: 'ocasion', isCorrect: false },
            ],
          },
          {
            id: 'q-32',
            type: 'single_choice',
            text: 'Which is the correct spelling?',
            options: [
              { id: 'opt-32-1', text: 'perseverence', isCorrect: false },
              { id: 'opt-32-2', text: 'perseverance', isCorrect: true },
              { id: 'opt-32-3', text: 'perseverence', isCorrect: false },
              { id: 'opt-32-4', text: 'perseveranse', isCorrect: false },
            ],
          },
          {
            id: 'q-33',
            type: 'single_choice',
            text: 'Which is correct?',
            options: [
              { id: 'opt-33-1', text: 'restaraunt', isCorrect: false },
              { id: 'opt-33-2', text: 'restaurant', isCorrect: true },
              { id: 'opt-33-3', text: 'restaraunt', isCorrect: false },
              { id: 'opt-33-4', text: 'restarant', isCorrect: false },
            ],
          },
        ],
      },
    ],
  },
};
