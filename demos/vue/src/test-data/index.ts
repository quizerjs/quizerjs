/**
 * 测试数据索引
 * 导出所有可用的测试数据
 */

import type { QuizDSL } from '@quizerjs/dsl';
import { spellingQuizDSL } from './spelling-quiz';
import { beatEarnLoseWinQuizDSL } from './beat-earn-lose-win-quiz';

export interface TestDataItem {
  id: string;
  name: string;
  description: string;
  dsl: QuizDSL;
}

export const testDataList: TestDataItem[] = [
  {
    id: 'spelling-quiz',
    name: 'Spelling Quiz',
    description: '33 spelling questions from usingenglish.com',
    dsl: spellingQuizDSL,
  },
  {
    id: 'beat-earn-lose-win-quiz',
    name: 'Beat, Earn, Lose & Win',
    description: '10 questions about verbs beat, earn, lose, and win from usingenglish.com',
    dsl: beatEarnLoseWinQuizDSL,
  },
];

export const getTestDataById = (id: string): QuizDSL | undefined => {
  const item = testDataList.find(item => item.id === id);
  return item?.dsl;
};

export const defaultTestDataId = 'spelling-quiz';
