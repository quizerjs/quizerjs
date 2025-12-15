/**
 * @quizerjs/editorjs-tool - MultipleChoiceTool 单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import MultipleChoiceTool from '../MultipleChoiceTool.wsx';
import { QuestionTypes } from '@quizerjs/dsl';
import { createMultipleChoiceData } from './fixtures';
import type { MultipleChoiceData } from '../types';

describe('MultipleChoiceTool', () => {
  describe('静态属性', () => {
    it('应该有正确的 toolbox 配置', () => {
      const toolbox = MultipleChoiceTool.toolbox;
      expect(toolbox.title).toBe('多选题');
      expect(toolbox.icon).toContain('<svg');
    });

    it('应该支持只读模式', () => {
      expect(MultipleChoiceTool.isReadOnlySupported).toBe(true);
    });
  });

  describe('构造函数', () => {
    it('应该使用默认数据创建实例', () => {
      const tool = new MultipleChoiceTool({});
      expect(tool).toBeInstanceOf(MultipleChoiceTool);
      const toolData = tool['data'] as MultipleChoiceData;
      expect(toolData.question.type).toBe(QuestionTypes.MULTIPLE_CHOICE);
      expect(toolData.question.text).toBe('');
      expect(toolData.question.options).toEqual([]);
      expect(tool['readOnly']).toBe(false);
    });

    it('应该使用提供的数据创建实例', () => {
      const data = createMultipleChoiceData();
      const tool = new MultipleChoiceTool({ data });
      const toolData = tool['data'] as MultipleChoiceData;
      expect(toolData.question.text).toBe('测试多选题');
      expect(toolData.question.options).toHaveLength(3);
    });
  });

  describe('render', () => {
    it('应该返回 HTMLElement', () => {
      const tool = new MultipleChoiceTool({});
      const element = tool.render();
      expect(element).toBeInstanceOf(HTMLElement);
    });

    it('应该包含所有必需的组件', () => {
      const tool = new MultipleChoiceTool({});
      const element = tool.render() as HTMLElement;
      expect(element.querySelector('quiz-question-header')).toBeTruthy();
      expect(element.querySelector('quiz-question-description')).toBeTruthy();
      expect(element.querySelector('quiz-option-list')).toBeTruthy();
    });
  });

  describe('save', () => {
    it('应该返回更新的数据', () => {
      const data = createMultipleChoiceData();
      const tool = new MultipleChoiceTool({ data });
      tool.render();

      const headerComponent = { getText: vi.fn(() => '更新的标题') };
      const descComponent = { getText: vi.fn(() => '更新的描述') };
      const optionListComponent = { getOptions: vi.fn(() => data.question.options) };

      tool['questionHeaderComponent'] = headerComponent;
      tool['questionDescriptionComponent'] = descComponent;
      tool['optionListComponent'] = optionListComponent;

      const saved = tool.save() as MultipleChoiceData;
      expect(saved.question.text).toBe('更新的标题');
      expect(saved.question.description).toBe('更新的描述');
    });
  });

  describe('validate', () => {
    it('应该验证有效数据', () => {
      const data = createMultipleChoiceData();
      const tool = new MultipleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(true);
    });

    it('应该拒绝空问题文本', () => {
      const data = createMultipleChoiceData({
        question: { id: 'q1', type: QuestionTypes.MULTIPLE_CHOICE, text: '' },
      });
      const tool = new MultipleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该拒绝少于2个选项', () => {
      const data = createMultipleChoiceData({
        question: {
          id: 'q1',
          type: QuestionTypes.MULTIPLE_CHOICE,
          text: '测试',
          options: [{ id: 'opt1', text: '选项1', isCorrect: true }],
        },
      });
      const tool = new MultipleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该拒绝没有正确答案的选项', () => {
      const data = createMultipleChoiceData({
        question: {
          id: 'q1',
          type: QuestionTypes.MULTIPLE_CHOICE,
          text: '测试',
          options: [
            { id: 'opt1', text: '选项1', isCorrect: false },
            { id: 'opt2', text: '选项2', isCorrect: false },
          ],
        },
      });
      const tool = new MultipleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该接受至少有一个正确答案的选项', () => {
      const data = createMultipleChoiceData({
        question: {
          id: 'q1',
          type: QuestionTypes.MULTIPLE_CHOICE,
          text: '测试问题',
          options: [
            { id: 'opt1', text: '选项1', isCorrect: true },
            { id: 'opt2', text: '选项2', isCorrect: false },
          ],
        },
      });
      const tool = new MultipleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(true);
    });
  });
});
