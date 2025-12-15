/**
 * @quizerjs/editorjs-tool - TrueFalseTool 单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import TrueFalseTool from '../TrueFalseTool.wsx';
import { QuestionTypes } from '@quizerjs/dsl';
import { createTrueFalseData } from './fixtures';
import type { TrueFalseData } from '../types';

describe('TrueFalseTool', () => {
  describe('静态属性', () => {
    it('应该有正确的 toolbox 配置', () => {
      const toolbox = TrueFalseTool.toolbox;
      expect(toolbox.title).toBe('判断题');
      expect(toolbox.icon).toContain('<svg');
    });

    it('应该支持只读模式', () => {
      expect(TrueFalseTool.isReadOnlySupported).toBe(true);
    });
  });

  describe('构造函数', () => {
    it('应该使用默认数据创建实例', () => {
      const tool = new TrueFalseTool({});
      expect(tool).toBeInstanceOf(TrueFalseTool);
      const toolData = tool['data'] as TrueFalseData;
      expect(toolData.question.type).toBe(QuestionTypes.TRUE_FALSE);
      expect(toolData.question.text).toBe('');
      expect(toolData.question.correctAnswer).toBe(true);
    });

    it('应该使用提供的数据创建实例', () => {
      const data = createTrueFalseData();
      const tool = new TrueFalseTool({ data });
      const toolData = tool['data'] as TrueFalseData;
      expect(toolData.question.text).toBe('测试判断题');
      expect(toolData.question.correctAnswer).toBe(true);
    });
  });

  describe('render', () => {
    it('应该返回 HTMLElement', () => {
      const tool = new TrueFalseTool({});
      const element = tool.render();
      expect(element).toBeInstanceOf(HTMLElement);
    });

    it('应该包含所有必需的组件', () => {
      const tool = new TrueFalseTool({});
      const element = tool.render() as HTMLElement;
      expect(element.querySelector('quiz-question-header')).toBeTruthy();
      expect(element.querySelector('quiz-question-description')).toBeTruthy();
      expect(element.querySelector('select')).toBeTruthy();
    });

    it('应该包含正确和错误选项', () => {
      const tool = new TrueFalseTool({});
      const element = tool.render() as HTMLElement;
      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select).toBeTruthy();
      const options = Array.from(select.options);
      expect(options.some(opt => opt.value === 'true')).toBe(true);
      expect(options.some(opt => opt.value === 'false')).toBe(true);
    });
  });

  describe('save', () => {
    it('应该返回更新的数据', () => {
      const data = createTrueFalseData();
      const tool = new TrueFalseTool({ data });
      tool.render();

      const headerComponent = { getText: vi.fn(() => '更新的标题') };
      const descComponent = { getText: vi.fn(() => '更新的描述') };
      const select = { value: 'false' } as HTMLSelectElement;

      tool['questionHeaderComponent'] = headerComponent;
      tool['questionDescriptionComponent'] = descComponent;
      tool['trueFalseSelect'] = select;

      const saved = tool.save() as TrueFalseData;
      expect(saved.question.text).toBe('更新的标题');
      expect(saved.question.description).toBe('更新的描述');
      expect(saved.question.correctAnswer).toBe(false);
    });
  });

  describe('validate', () => {
    it('应该验证有效数据', () => {
      const data = createTrueFalseData();
      const tool = new TrueFalseTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(true);
    });

    it('应该拒绝空问题文本', () => {
      const data = createTrueFalseData({
        question: { id: 'q1', type: QuestionTypes.TRUE_FALSE, text: '' },
      });
      const tool = new TrueFalseTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该拒绝 undefined 的正确答案', () => {
      const data = createTrueFalseData({
        question: {
          id: 'q1',
          type: QuestionTypes.TRUE_FALSE,
          text: '测试',
          correctAnswer: undefined as unknown as boolean,
        },
      });
      const tool = new TrueFalseTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该接受 true 作为正确答案', () => {
      const data = createTrueFalseData({
        question: {
          id: 'q1',
          type: QuestionTypes.TRUE_FALSE,
          text: '测试问题',
          correctAnswer: true,
        },
      });
      const tool = new TrueFalseTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(true);
    });

    it('应该接受 false 作为正确答案', () => {
      const data = createTrueFalseData({
        question: {
          id: 'q1',
          type: QuestionTypes.TRUE_FALSE,
          text: '测试问题',
          correctAnswer: false,
        },
      });
      const tool = new TrueFalseTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(true);
    });
  });
});
