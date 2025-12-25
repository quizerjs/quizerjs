/**
 * @quizerjs/sample-data
 * 共享的测试数据包，供所有 demo 项目使用
 */

import type { QuizDSL } from '@quizerjs/dsl';
import { spellingQuizDSL } from './spelling-quiz';
import { beatEarnLoseWinQuizDSL } from './beat-earn-lose-win-quiz';

export interface SampleDataItem {
  id: string;
  name: string;
  description: string;
  dsl: QuizDSL;
}

/**
 * 所有可用的示例数据列表
 */
export const sampleDataList: SampleDataItem[] = [
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

/**
 * 根据 ID 获取示例数据
 */
export function getSampleDataById(id: string): QuizDSL | undefined {
  const item = sampleDataList.find(item => item.id === id);
  return item?.dsl;
}

/**
 * 默认示例数据 ID
 */
export const defaultSampleDataId = 'spelling-quiz';

// 导出所有示例数据 DSL（用于直接导入）
export { spellingQuizDSL } from './spelling-quiz';
export { beatEarnLoseWinQuizDSL } from './beat-earn-lose-win-quiz';
