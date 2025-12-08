/**
 * @quizerjs/core - 转换器单元测试
 */

import { describe, it, expect } from 'vitest';
import { dslToBlock, blockToDSL } from '../src/transformer';
import type { QuizDSL, QuestionType } from '@quizerjs/dsl';
import {
  createMinimalValidDSL,
  createDSLWithSections,
  createFullDSL,
  createSimpleEditorOutput,
} from './fixtures';

describe('dslToBlock', () => {
  it('应该将最小 DSL 转换为 Editor.js blocks', () => {
    const dsl = createMinimalValidDSL();
    const result = dslToBlock(dsl);

    expect(result.blocks).toBeDefined();
    expect(result.blocks.length).toBeGreaterThan(0);

    // 第一个 block 应该是 H1 标题
    expect(result.blocks[0].type).toBe('header');
    expect(result.blocks[0].data.level).toBe(1);
  });

  it('应该处理带 sections 的 DSL', () => {
    const dsl = createDSLWithSections();
    const result = dslToBlock(dsl);

    expect(result.blocks.length).toBeGreaterThan(0);

    // 第一个 block 应该是 H1 标题
    expect(result.blocks[0].type).toBe('header');
    expect(result.blocks[0].data.level).toBe(1);

    // 第二个 block 应该是描述
    expect(result.blocks[1].type).toBe('paragraph');

    // 应该有 section headers (H2)
    const sectionHeaders = result.blocks.filter(b => b.type === 'header' && b.data.level === 2);
    expect(sectionHeaders.length).toBe(2);

    // 应该有 question blocks
    const questionBlocks = result.blocks.filter(b => b.type.startsWith('quiz-'));
    expect(questionBlocks.length).toBe(2);
  });

  it('应该处理所有问题类型', () => {
    const dsl = createFullDSL();
    const result = dslToBlock(dsl);

    const questionBlocks = result.blocks.filter(b => b.type.startsWith('quiz-'));
    expect(questionBlocks.length).toBe(4);

    // 检查问题类型
    const blockTypes = questionBlocks.map(b => b.type);
    expect(blockTypes).toContain('quiz-single-choice');
    expect(blockTypes).toContain('quiz-multiple-choice');
    expect(blockTypes).toContain('quiz-text-input');
    expect(blockTypes).toContain('quiz-true-false');
  });

  it('应该将 Markdown 转换为 HTML', () => {
    const dsl: QuizDSL = {
      version: '1.0.0',
      quiz: {
        id: 'quiz-1',
        title: '**加粗**标题',
        description: '*斜体*描述',
        questions: [],
      },
    };

    const result = dslToBlock(dsl);

    // 标题应该包含 HTML
    expect(result.blocks[0].data.text).toContain('<strong>');
    // 描述应该包含 HTML
    expect(result.blocks[1].data.text).toContain('<em>');
  });

  it('应该处理没有描述的情况', () => {
    const dsl: QuizDSL = {
      version: '1.0.0',
      quiz: {
        id: 'quiz-1',
        title: '测试标题',
        questions: [],
      },
    };

    const result = dslToBlock(dsl);

    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].type).toBe('header');
  });
});

describe('blockToDSL', () => {
  it('应该将 Editor.js blocks 转换为 DSL', () => {
    const editorData = createSimpleEditorOutput();
    const result = blockToDSL(editorData);

    expect(result.version).toBe('1.0.0');
    expect(result.quiz.title).toBe('测试测验');
    expect(result.quiz.description).toBe('测试描述');
    expect(result.quiz.sections).toBeDefined();
    expect(result.quiz.sections?.length).toBeGreaterThan(0);
  });

  it('应该将 HTML 转换为 Markdown', () => {
    const editorData = {
      blocks: [
        {
          type: 'header',
          data: {
            // Editor.js header block 的 text 字段只包含内部 HTML，不包含 <h1> 标签
            text: '<strong>加粗</strong>标题',
            level: 1,
          },
        },
        {
          type: 'paragraph',
          data: {
            // Editor.js paragraph block 的 text 字段只包含内部 HTML，不包含 <p> 标签
            text: '<em>斜体</em>描述',
          },
        },
      ],
    };

    const result = blockToDSL(editorData);

    // 标题应该包含 Markdown（turndown 可能使用 ** 或 __ 表示加粗）
    expect(result.quiz.title).toMatch(/\*\*加粗\*\*|__加粗__/);
    // 描述应该包含 Markdown（turndown 可能使用 * 或 _ 表示斜体）
    expect(result.quiz.description).toMatch(/\*斜体\*|_斜体_/);
  });

  it('应该处理空 blocks', () => {
    const editorData = {
      blocks: [],
    };

    const result = blockToDSL(editorData);

    expect(result.quiz.title).toBe('未命名测验');
    expect(result.quiz.sections).toBeDefined();
    expect(result.quiz.sections?.length).toBe(1);
  });

  it('应该正确分组 sections', () => {
    const editorData = {
      blocks: [
        {
          type: 'header',
          data: { text: '标题', level: 1 },
        },
        {
          type: 'header',
          data: { text: '第一章', level: 2 },
        },
        {
          type: 'quiz-single-choice',
          data: {
            question: {
              id: 'q1',
              type: 'single_choice',
              text: '问题1',
              options: [
                { id: 'o1', text: '选项1', isCorrect: true },
                { id: 'o2', text: '选项2', isCorrect: false },
              ],
            },
          },
        },
        {
          type: 'header',
          data: { text: '第二章', level: 2 },
        },
        {
          type: 'quiz-multiple-choice',
          data: {
            question: {
              id: 'q2',
              type: 'multiple_choice',
              text: '问题2',
              options: [
                { id: 'o1', text: '选项1', isCorrect: true },
                { id: 'o2', text: '选项2', isCorrect: true },
              ],
            },
          },
        },
      ],
    };

    const result = blockToDSL(editorData);

    expect(result.quiz.sections?.length).toBe(2);
    expect(result.quiz.sections?.[0].title).toBe('第一章');
    expect(result.quiz.sections?.[0].questions.length).toBe(1);
    expect(result.quiz.sections?.[1].title).toBe('第二章');
    expect(result.quiz.sections?.[1].questions.length).toBe(1);
  });

  it('应该处理 section description', () => {
    const editorData = {
      blocks: [
        {
          type: 'header',
          data: { text: '标题', level: 1 },
        },
        {
          type: 'header',
          data: { text: '第一章', level: 2 },
        },
        {
          type: 'paragraph',
          data: { text: '章节描述' },
        },
        {
          type: 'quiz-single-choice',
          data: {
            question: {
              id: 'q1',
              type: 'single_choice',
              text: '问题1',
              options: [
                { id: 'o1', text: '选项1', isCorrect: true },
                { id: 'o2', text: '选项2', isCorrect: false },
              ],
            },
          },
        },
      ],
    };

    const result = blockToDSL(editorData);

    expect(result.quiz.sections?.[0].description).toBe('章节描述');
  });
});

describe('双向转换', () => {
  it('应该能够双向转换 DSL（带 sections）', () => {
    const originalDSL = createDSLWithSections();
    const blocks = dslToBlock(originalDSL);
    const convertedDSL = blockToDSL(blocks);

    // 验证基本结构
    expect(convertedDSL.quiz.title).toBe(originalDSL.quiz.title);
    expect(convertedDSL.quiz.description).toBe(originalDSL.quiz.description);
    expect(convertedDSL.quiz.sections?.length).toBe(originalDSL.quiz.sections?.length);

    // 验证 sections
    if (originalDSL.quiz.sections && convertedDSL.quiz.sections) {
      for (let i = 0; i < originalDSL.quiz.sections.length; i++) {
        const originalSection = originalDSL.quiz.sections[i];
        const convertedSection = convertedDSL.quiz.sections[i];

        expect(convertedSection.title).toBe(originalSection.title);
        expect(convertedSection.description).toBe(originalSection.description);
        expect(convertedSection.questions.length).toBe(originalSection.questions.length);
      }
    }
  });

  it('应该能够双向转换 DSL（使用 questions，向后兼容）', () => {
    const originalDSL = createMinimalValidDSL();
    const blocks = dslToBlock(originalDSL);
    const convertedDSL = blockToDSL(blocks);

    // 验证基本结构
    expect(convertedDSL.quiz.title).toBe(originalDSL.quiz.title);

    // 转换后应该变成 sections 结构
    expect(convertedDSL.quiz.sections).toBeDefined();
    expect(convertedDSL.quiz.sections?.length).toBeGreaterThan(0);

    // 验证问题数量
    const totalQuestions = convertedDSL.quiz.sections?.reduce(
      (sum, section) => sum + section.questions.length,
      0
    );
    expect(totalQuestions).toBe(originalDSL.quiz.questions?.length);
  });

  it('应该能够双向转换所有问题类型', () => {
    const originalDSL = createFullDSL();
    const blocks = dslToBlock(originalDSL);
    const convertedDSL = blockToDSL(blocks);

    // 验证所有问题都被转换
    const originalQuestions = originalDSL.quiz.sections?.[0].questions || [];
    const convertedQuestions = convertedDSL.quiz.sections?.[0].questions || [];

    expect(convertedQuestions.length).toBe(originalQuestions.length);

    // 验证问题类型
    const convertedTypes = convertedQuestions.map(q => q.type);
    const originalTypes = originalQuestions.map(q => q.type);
    expect(convertedTypes.sort()).toEqual(originalTypes.sort());
  });
});
