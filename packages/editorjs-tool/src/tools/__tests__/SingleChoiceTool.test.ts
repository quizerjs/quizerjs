/**
 * @quizerjs/editorjs-tool - SingleChoiceTool 单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import SingleChoiceTool from '../SingleChoiceTool.wsx';
import { QuestionTypes } from '@quizerjs/dsl';
import { createSingleChoiceData } from './fixtures';
import type { SingleChoiceData } from '../types';

describe('SingleChoiceTool', () => {
  describe('静态属性', () => {
    it('应该有正确的 toolbox 配置', () => {
      const toolbox = SingleChoiceTool.toolbox;
      expect(toolbox.title).toBe('单选题');
      expect(toolbox.icon).toContain('<svg');
    });

    it('应该支持只读模式', () => {
      expect(SingleChoiceTool.isReadOnlySupported).toBe(true);
    });
  });

  describe('构造函数', () => {
    it('应该使用默认数据创建实例', () => {
      const tool = new SingleChoiceTool({});
      expect(tool).toBeInstanceOf(SingleChoiceTool);
      const toolData = tool['data'] as SingleChoiceData;
      expect(toolData.question.type).toBe(QuestionTypes.SINGLE_CHOICE);
      expect(toolData.question.text).toBe('');
      expect(toolData.question.options).toEqual([]);
      expect(tool['readOnly']).toBe(false);
    });

    it('应该使用提供的数据创建实例', () => {
      const data = createSingleChoiceData();
      const tool = new SingleChoiceTool({ data });
      const toolData = tool['data'] as SingleChoiceData;
      expect(toolData.question.text).toBe('测试单选题');
      expect(toolData.question.options).toHaveLength(3);
    });

    it('应该支持只读模式', () => {
      const tool = new SingleChoiceTool({ readOnly: true });
      expect(tool['readOnly']).toBe(true);
    });
  });

  describe('render', () => {
    it('应该返回 HTMLElement', () => {
      const tool = new SingleChoiceTool({});
      const element = tool.render();
      expect(element).toBeInstanceOf(HTMLElement);
    });

    it('应该包含 quiz-question-header 组件', () => {
      const tool = new SingleChoiceTool({});
      const element = tool.render();
      const header = (element as HTMLElement).querySelector('quiz-question-header');
      expect(header).toBeTruthy();
    });

    it('应该包含 quiz-question-description 组件', () => {
      const tool = new SingleChoiceTool({});
      const element = tool.render();
      const description = (element as HTMLElement).querySelector('quiz-question-description');
      expect(description).toBeTruthy();
    });

    it('应该包含 quiz-option-list 组件', () => {
      const tool = new SingleChoiceTool({});
      const element = tool.render();
      const optionList = (element as HTMLElement).querySelector('quiz-option-list');
      expect(optionList).toBeTruthy();
    });

    it('应该在只读模式下设置 readonly 属性', () => {
      const tool = new SingleChoiceTool({ readOnly: true });
      const element = tool.render();
      const header = (element as HTMLElement).querySelector('quiz-question-header');
      expect(header?.getAttribute('readonly')).toBe('true');
    });
  });

  describe('save', () => {
    it('应该返回当前数据', () => {
      const data = createSingleChoiceData();
      const tool = new SingleChoiceTool({ data });
      tool.render();

      // 模拟组件方法
      const headerComponent = {
        getText: vi.fn(() => '更新的标题'),
      };
      const descComponent = {
        getText: vi.fn(() => '更新的描述'),
      };
      const optionListComponent = {
        getOptions: vi.fn(() => data.question.options),
      };

      tool['questionHeaderComponent'] = headerComponent;
      tool['questionDescriptionComponent'] = descComponent;
      tool['optionListComponent'] = optionListComponent;

      const saved = tool.save() as SingleChoiceData;
      expect(saved.question.text).toBe('更新的标题');
      expect(saved.question.description).toBe('更新的描述');
      expect(saved.question.options).toEqual(data.question.options);
    });

    it('应该在没有组件引用时返回原始数据', () => {
      const data = createSingleChoiceData();
      const tool = new SingleChoiceTool({ data });
      tool.render();

      const saved = tool.save() as SingleChoiceData;
      expect(saved).toEqual(data);
    });
  });

  describe('validate', () => {
    it('应该验证有效数据', () => {
      const data = createSingleChoiceData();
      const tool = new SingleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(true);
    });

    it('应该拒绝空问题文本', () => {
      const data = createSingleChoiceData({
        question: { id: 'q1', type: QuestionTypes.SINGLE_CHOICE, text: '' },
      });
      const tool = new SingleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该拒绝只有空白字符的问题文本', () => {
      const data = createSingleChoiceData({
        question: { id: 'q1', type: QuestionTypes.SINGLE_CHOICE, text: '   ' },
      });
      const tool = new SingleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该拒绝少于2个选项', () => {
      const data = createSingleChoiceData({
        question: {
          id: 'q1',
          type: QuestionTypes.SINGLE_CHOICE,
          text: '测试',
          options: [{ id: 'opt1', text: '选项1', isCorrect: true }],
        },
      });
      const tool = new SingleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该拒绝没有正确答案的选项', () => {
      const data = createSingleChoiceData({
        question: {
          id: 'q1',
          type: QuestionTypes.SINGLE_CHOICE,
          text: '测试',
          options: [
            { id: 'opt1', text: '选项1', isCorrect: false },
            { id: 'opt2', text: '选项2', isCorrect: false },
          ],
        },
      });
      const tool = new SingleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(false);
    });

    it('应该接受有正确答案的选项', () => {
      const data = createSingleChoiceData({
        question: {
          id: 'q1',
          type: QuestionTypes.SINGLE_CHOICE,
          text: '测试问题',
          options: [
            { id: 'opt1', text: '选项1', isCorrect: true },
            { id: 'opt2', text: '选项2', isCorrect: false },
          ],
        },
      });
      const tool = new SingleChoiceTool({ data });
      const isValid = tool.validate?.(data) ?? false;
      expect(isValid).toBe(true);
    });
  });

  describe('renderSettings', () => {
    it('应该返回 HTMLElement', () => {
      const tool = new SingleChoiceTool({});
      const settings = (tool as { renderSettings: () => HTMLElement }).renderSettings();
      expect(settings).toBeInstanceOf(HTMLElement);
    });

    it('应该包含设置内容', () => {
      const tool = new SingleChoiceTool({});
      const settings = (tool as { renderSettings: () => HTMLElement }).renderSettings();
      expect(settings.textContent).toContain('单选题设置');
    });
  });
});
