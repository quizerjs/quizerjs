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

describe('question.text 和 section.title 分离', () => {
  it('dslToBlock 应该将 section.title 作为 H2 header，不合并到 question.text', () => {
    const dsl: QuizDSL = {
      version: '1.0.0',
      quiz: {
        id: 'quiz-1',
        title: '测试测验',
        sections: [
          {
            id: 'section-1',
            title: 'Spelling Questions',
            questions: [
              {
                id: 'q1',
                type: 'single_choice',
                text: 'Which is the correct spelling?',
                options: [
                  { id: 'o1', text: 'Option 1', isCorrect: true },
                  { id: 'o2', text: 'Option 2', isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    };

    const result = dslToBlock(dsl);

    // 查找 H2 header block（section title）
    const h2Headers = result.blocks.filter(
      b => b.type === 'header' && (b.data as any).level === 2
    );
    expect(h2Headers.length).toBe(1);
    expect((h2Headers[0].data as any).text).toContain('Spelling Questions');

    // 查找 question block
    const questionBlocks = result.blocks.filter(b => b.type.startsWith('quiz-'));
    expect(questionBlocks.length).toBe(1);
    const questionData = (questionBlocks[0].data as any).question;
    expect(questionData.text).toBe('Which is the correct spelling?');
    // 确保 question.text 不包含 section.title
    expect(questionData.text).not.toContain('Spelling Questions');
  });

  it('blockToDSL 应该从 H2 header 提取 section.title，不修改 question.text', () => {
    const editorData = {
      blocks: [
        {
          type: 'header',
          data: { text: '测试测验', level: 1 },
        },
        {
          type: 'header',
          data: { text: 'Spelling Questions', level: 2 },
        },
        {
          type: 'quiz-single-choice',
          data: {
            question: {
              id: 'q1',
              type: 'single_choice',
              text: 'Which is the correct spelling?',
              options: [
                { id: 'o1', text: 'Option 1', isCorrect: true },
                { id: 'o2', text: 'Option 2', isCorrect: false },
              ],
            },
          },
        },
      ],
    };

    const result = blockToDSL(editorData);

    expect(result.quiz.sections?.length).toBe(1);
    expect(result.quiz.sections?.[0].title).toBe('Spelling Questions');
    expect(result.quiz.sections?.[0].questions.length).toBe(1);
    expect(result.quiz.sections?.[0].questions[0].text).toBe('Which is the correct spelling?');
    // 确保 question.text 不包含 section.title
    expect(result.quiz.sections?.[0].questions[0].text).not.toContain('Spelling Questions');
  });

  it('双向转换应该保持 question.text 和 section.title 分离', () => {
    const originalDSL: QuizDSL = {
      version: '1.0.0',
      quiz: {
        id: 'quiz-1',
        title: '测试测验',
        sections: [
          {
            id: 'section-1',
            title: 'Spelling Questions',
            questions: [
              {
                id: 'q1',
                type: 'single_choice',
                text: 'Which is the correct spelling?',
                options: [
                  { id: 'o1', text: 'Option 1', isCorrect: true },
                  { id: 'o2', text: 'Option 2', isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    };

    const blocks = dslToBlock(originalDSL);
    const convertedDSL = blockToDSL(blocks);

    // 验证 section.title
    expect(convertedDSL.quiz.sections?.[0].title).toBe(originalDSL.quiz.sections?.[0].title);
    expect(convertedDSL.quiz.sections?.[0].title).toBe('Spelling Questions');

    // 验证 question.text
    expect(convertedDSL.quiz.sections?.[0].questions[0].text).toBe(
      originalDSL.quiz.sections?.[0].questions[0].text
    );
    expect(convertedDSL.quiz.sections?.[0].questions[0].text).toBe('Which is the correct spelling?');

    // 确保 question.text 不包含 section.title
    expect(convertedDSL.quiz.sections?.[0].questions[0].text).not.toContain('Spelling Questions');
  });

  it('应该正确处理多个 sections 和 questions', () => {
    const originalDSL: QuizDSL = {
      version: '1.0.0',
      quiz: {
        id: 'quiz-1',
        title: '测试测验',
        sections: [
          {
            id: 'section-1',
            title: 'Section 1',
            questions: [
              {
                id: 'q1',
                type: 'single_choice',
                text: 'Question 1',
                options: [
                  { id: 'o1', text: 'Option 1', isCorrect: true },
                ],
              },
              {
                id: 'q2',
                type: 'single_choice',
                text: 'Question 2',
                options: [
                  { id: 'o1', text: 'Option 1', isCorrect: true },
                ],
              },
            ],
          },
          {
            id: 'section-2',
            title: 'Section 2',
            questions: [
              {
                id: 'q3',
                type: 'single_choice',
                text: 'Question 3',
                options: [
                  { id: 'o1', text: 'Option 1', isCorrect: true },
                ],
              },
            ],
          },
        ],
      },
    };

    const blocks = dslToBlock(originalDSL);
    const convertedDSL = blockToDSL(blocks);

    // 验证两个 sections
    expect(convertedDSL.quiz.sections?.length).toBe(2);
    expect(convertedDSL.quiz.sections?.[0].title).toBe('Section 1');
    expect(convertedDSL.quiz.sections?.[1].title).toBe('Section 2');

    // 验证每个 section 的问题
    expect(convertedDSL.quiz.sections?.[0].questions.length).toBe(2);
    expect(convertedDSL.quiz.sections?.[0].questions[0].text).toBe('Question 1');
    expect(convertedDSL.quiz.sections?.[0].questions[1].text).toBe('Question 2');
    expect(convertedDSL.quiz.sections?.[1].questions.length).toBe(1);
    expect(convertedDSL.quiz.sections?.[1].questions[0].text).toBe('Question 3');

    // 确保 question.text 不包含 section.title
    expect(convertedDSL.quiz.sections?.[0].questions[0].text).not.toContain('Section 1');
    expect(convertedDSL.quiz.sections?.[1].questions[0].text).not.toContain('Section 2');
  });

  it('应该正确处理 options 数据', () => {
    const originalDSL: QuizDSL = {
      version: '1.0.0',
      quiz: {
        id: 'quiz-1',
        title: '测试测验',
        sections: [
          {
            id: 'section-1',
            title: 'Section 1',
            questions: [
              {
                id: 'q1',
                type: 'single_choice',
                text: 'Question 1',
                options: [
                  { id: 'o1', text: 'Option 1', isCorrect: true },
                  { id: 'o2', text: 'Option 2', isCorrect: false },
                  { id: 'o3', text: 'Option 3', isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    };

    const blocks = dslToBlock(originalDSL);
    const convertedDSL = blockToDSL(blocks);

    // 验证 options
    const question = convertedDSL.quiz.sections?.[0].questions[0];
    expect(question.type).toBe('single_choice');
    if (question.type === 'single_choice') {
      expect(question.options.length).toBe(3);
      expect(question.options[0].text).toBe('Option 1');
      expect(question.options[0].isCorrect).toBe(true);
      expect(question.options[1].text).toBe('Option 2');
      expect(question.options[1].isCorrect).toBe(false);
      expect(question.options[2].text).toBe('Option 3');
      expect(question.options[2].isCorrect).toBe(false);
    }
  });
});
