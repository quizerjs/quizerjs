/**
 * @quizerjs/editorjs-tool - TextInputTool 单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import TextInputTool from '../TextInputTool.wsx';
import { QuestionTypes } from '@quizerjs/dsl';
import { createTextInputData } from './fixtures';
import type { TextInputData } from '../types';

describe('TextInputTool', () => {
  describe('静态属性', () => {
    it('应该有正确的 toolbox 配置', () => {
      const toolbox = TextInputTool.toolbox;
      expect(toolbox.title).toBe('文本输入题');
      expect(toolbox.icon).toContain('<svg');
    });

    it('应该支持只读模式', () => {
      expect(TextInputTool.isReadOnlySupported).toBe(true);
    });
  });

  describe('构造函数', () => {
    it('应该使用默认数据创建实例', () => {
      const tool = new TextInputTool({});
      expect(tool).toBeInstanceOf(TextInputTool);
      const toolData = tool['data'] as TextInputData;
      expect(toolData.question.type).toBe(QuestionTypes.TEXT_INPUT);
      expect(toolData.question.text).toBe('');
      expect(toolData.question.correctAnswer).toBe('');
    });

    it('应该使用提供的数据创建实例', () => {
      const data = createTextInputData();
      const tool = new TextInputTool({ data });
      const toolData = tool['data'] as TextInputData;
      expect(toolData.question.text).toBe('测试文本输入题');
      expect(toolData.question.correctAnswer).toBe('正确答案');
    });
  });

  describe('render', () => {
    it('应该返回 HTMLElement', () => {
      const tool = new TextInputTool({});
      const element = tool.render();
      expect(element).toBeInstanceOf(HTMLElement);
    });

    it('应该包含所有必需的组件', () => {
      const tool = new TextInputTool({});
      const element = tool.render() as HTMLElement;
      expect(element.querySelector('quiz-question-header')).toBeTruthy();
      expect(element.querySelector('quiz-question-description')).toBeTruthy();
      expect(element.querySelector('input[type="text"]')).toBeTruthy();
    });
  });

  describe('save', () => {
    it('应该返回更新的数据', () => {
      const data = createTextInputData();
      const tool = new TextInputTool({ data });
      tool.render();

      const headerComponent = { getText: vi.fn(() => '更新的标题') };
      const descComponent = { getText: vi.fn(() => '更新的描述') };
      const input = { value: '更新的答案' } as HTMLInputElement;

      tool['questionHeaderComponent'] = headerComponent;
      tool['questionDescriptionComponent'] = descComponent;
      tool['correctAnswerInput'] = input;

      const saved = tool.save() as TextInputData;
      expect(saved.question.text).toBe('更新的标题');
      expect(saved.question.description).toBe('更新的描述');
      expect(saved.question.correctAnswer).toBe('更新的答案');
    });
  });

  describe('validate', () => {
    it('应该验证有效数据', () => {
      const data = createTextInputData();
      const tool = new TextInputTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(true);
    });

    it('应该拒绝空问题文本', () => {
      const data = createTextInputData({
        question: { id: 'q1', type: QuestionTypes.TEXT_INPUT, text: '' },
      });
      const tool = new TextInputTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该拒绝空正确答案', () => {
      const data = createTextInputData({
        question: {
          id: 'q1',
          type: QuestionTypes.TEXT_INPUT,
          text: '测试',
          correctAnswer: '',
        },
      });
      const tool = new TextInputTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该拒绝只有空白字符的正确答案', () => {
      const data = createTextInputData({
        question: {
          id: 'q1',
          type: QuestionTypes.TEXT_INPUT,
          text: '测试',
          correctAnswer: '   ',
        },
      });
      const tool = new TextInputTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该接受有效的文本输入题', () => {
      const data = createTextInputData({
        question: {
          id: 'q1',
          type: QuestionTypes.TEXT_INPUT,
          text: '问题',
          correctAnswer: '答案',
        },
      });
      const tool = new TextInputTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(true);
    });
  });
});
