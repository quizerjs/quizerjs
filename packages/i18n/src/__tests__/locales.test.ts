/**
 * @quizerjs/i18n - 语言预设单元测试
 * 校验各 locale 符合 QuizLocalization 契约且必填键存在
 */

import { describe, it, expect } from 'vitest';
import type { QuizLocalization } from '@quizerjs/core';
import { zhCN, enUS, jaJP, koKR, esES, deDE, frFR } from '../index';

const LOCALES = [
  { name: 'zhCN', value: zhCN },
  { name: 'enUS', value: enUS },
  { name: 'jaJP', value: jaJP },
  { name: 'koKR', value: koKR },
  { name: 'esES', value: esES },
  { name: 'deDE', value: deDE },
  { name: 'frFR', value: frFR },
] as const;

function assertQuizLocalization(loc: QuizLocalization) {
  expect(loc).toBeDefined();
  expect(loc.quiz).toBeDefined();
  expect(typeof loc.quiz.defaultTitle).toBe('string');
  expect(loc.section).toBeDefined();
  expect(typeof loc.section.defaultTitle).toBe('string');
  expect(loc.player).toBeDefined();
  expect(typeof loc.player.submitButton).toBe('string');
  expect(typeof loc.player.scoreTemplate).toBe('string');
  expect(typeof loc.player.questionNumberTemplate).toBe('string');
  expect(loc.editor).toBeDefined();
  expect(typeof loc.editor.singleChoiceTitle).toBe('string');
  expect(typeof loc.editor.multipleChoiceTitle).toBe('string');
  expect(typeof loc.editor.textInputTitle).toBe('string');
  expect(typeof loc.editor.trueFalseTitle).toBe('string');
  expect(typeof loc.editor.titlePlaceholder).toBe('string');
}

describe('i18n locales', () => {
  it('应导出 7 个语言预设', () => {
    expect(LOCALES).toHaveLength(7);
  });

  LOCALES.forEach(({ name, value }) => {
    it(`${name} 应满足 QuizLocalization 契约`, () => {
      assertQuizLocalization(value);
    });
  });

  it('zhCN 应有中文文案', () => {
    expect(zhCN.editor.singleChoiceTitle).toBe('单选题');
    expect(zhCN.player.submitButton).toBe('提交答案');
  });

  it('enUS 应有英文文案', () => {
    expect(enUS.editor.singleChoiceTitle).toBe('Single Choice');
    expect(enUS.player.submitButton).toBe('Submit');
  });
});
