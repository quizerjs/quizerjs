/**
 * @quizerjs/core - DSL ↔ Editor.js Block 转换器
 *
 * 提供纯函数用于在 Quiz DSL 和 Editor.js Block 格式之间转换
 * 负责 Markdown ↔ HTML 格式转换
 */

import { marked } from 'marked';
import TurndownService from 'turndown';
import type {
  QuizDSL,
  Section,
  Question,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  TextInputQuestion,
  TrueFalseQuestion,
  Option,
  QuestionMetadata,
} from '@quizerjs/dsl';
import type { TransformerOptions } from './types';

/**
 * Editor.js Header Block 数据
 */
export interface EditorJSHeaderData {
  text: string;
  level: number;
}

/**
 * Editor.js Paragraph Block 数据
 */
export interface EditorJSParagraphData {
  text: string;
}

/**
 * Editor.js Quiz Block 中的问题数据格式
 */
export interface EditorJSQuestionData {
  id: string;
  type: Question['type'];
  text: string;
  description?: string;
  options?: Option[];
  correctAnswer?: string | string[] | boolean;
  caseSensitive?: boolean;
  points?: number;
  explanation?: string;
  metadata?: QuestionMetadata;
}

/**
 * Editor.js Quiz Block 数据
 */
export interface EditorJSQuizBlockData {
  question: EditorJSQuestionData;
}

/**
 * Editor.js Block 数据联合类型
 */
export type EditorJSBlockData = EditorJSHeaderData | EditorJSParagraphData | EditorJSQuizBlockData;

/**
 * Editor.js Block 类型
 */
export type EditorJSBlockType = 'header' | 'paragraph' | `quiz-${string}`;

/**
 * Editor.js Block（泛型）
 */
export interface EditorJSBlock<T extends EditorJSBlockType = EditorJSBlockType> {
  id?: string;
  type: T;
  data: T extends 'header'
    ? EditorJSHeaderData
    : T extends 'paragraph'
      ? EditorJSParagraphData
      : T extends `quiz-${string}`
        ? EditorJSQuizBlockData
        : EditorJSBlockData;
}

/**
 * Editor.js 输出数据格式
 */
export interface EditorJSOutput {
  blocks: EditorJSBlock[];
  time?: number;
  version?: string;
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 初始化 Markdown 转换器
 * marked v11 parse 方法进行 Markdown 到 HTML 转换（同步）
 */
function markdownToHTML(markdown: string): string {
  const result = marked.parse(markdown);
  // marked.parse 默认返回 string（同步模式）
  return typeof result === 'string' ? result : String(result);
}

/**
 * 初始化 HTML to Markdown 转换器
 */
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

/**
 * 将问题转换为 Editor.js Block
 */
function questionToBlock(question: Question): EditorJSBlock<`quiz-${string}`> {
  const blockType = `quiz-${question.type.replace('_', '-')}` as const;

  const questionData: EditorJSQuestionData = {
    id: question.id,
    type: question.type,
    text: question.text || '',
  };

  if (question.description) {
    questionData.description = question.description;
  }

  if (question.type === 'single_choice' || question.type === 'multiple_choice') {
    questionData.options = question.options;
  }

  if (question.type === 'text_input' || question.type === 'true_false') {
    questionData.correctAnswer = question.correctAnswer;
  }

  if (question.type === 'text_input' && 'caseSensitive' in question) {
    questionData.caseSensitive = question.caseSensitive;
  }

  if ('points' in question && question.points !== undefined) {
    questionData.points = question.points;
  }

  if ('explanation' in question && question.explanation !== undefined) {
    questionData.explanation = question.explanation;
  }

  if ('metadata' in question && question.metadata !== undefined) {
    questionData.metadata = question.metadata;
  }

  return {
    id: question.id,
    type: blockType,
    data: {
      question: questionData,
    },
  };
}

/**
 * 将 Quiz DSL 转换为 Editor.js 块格式（纯函数）
 *
 * Markdown → HTML 转换：使用 `marked` 库
 */
export function dslToBlock(dsl: QuizDSL, options?: TransformerOptions): EditorJSOutput {
  const blocks: EditorJSBlock[] = [];
  const l10n = options?.localization;
  if (!l10n) {
    // RFC 0020 Section 3: 禁止硬编码回退，宁可显示占位符
    console.warn('[QuizTransformer] Missing localization configuration. RFC-0020 violation risk.');
  }

  // 1. H1 文档标题
  // 韧性处理：如果标题为空，尝试使用配置中的默认值。
  // 如果配置也缺失，回退到 RFC 建议的非中文占位符。
  const rawTitle = dsl.quiz.title || l10n?.quiz.defaultTitle || '';
  const titleHTML = markdownToHTML(rawTitle);

  // WYSIWYG: 即使是空标题也应该渲染，以便用户看到这个 Block
  blocks.push({
    type: 'header',
    data: {
      text: titleHTML,
      level: 1,
    },
  });

  // 2. 文档描述（可选）
  if (dsl.quiz.description) {
    const descHTML = markdownToHTML(dsl.quiz.description);
    blocks.push({
      type: 'paragraph',
      data: {
        text: descHTML,
      },
    });
  }

  // 3. 处理 sections 或 questions
  const sections = dsl.quiz.sections || [];
  const legacyQuestions = dsl.quiz.questions || [];

  if (sections.length > 0) {
    for (const section of sections) {
      // Section Header (H2)
      const rawSectionTitle = section.title || l10n?.section.defaultTitle || '';
      const sectionTitleHTML = markdownToHTML(rawSectionTitle);
      blocks.push({
        type: 'header',
        id: section.id,
        data: {
          text: sectionTitleHTML,
          level: 2,
        },
      });

      // Section Description (可选)
      if (section.description) {
        const sectionDescHTML = markdownToHTML(section.description);
        blocks.push({
          type: 'paragraph',
          data: {
            text: sectionDescHTML,
          },
        });
      }

      // Section Questions
      for (const question of section.questions) {
        blocks.push(questionToBlock(question));
      }
    }
  } else if (legacyQuestions.length > 0) {
    for (const question of legacyQuestions) {
      blocks.push(questionToBlock(question));
    }
  }

  return { blocks };
}

/**
 * 类型守卫：检查是否为 Quiz Block
 */
function isQuizBlock(block: EditorJSBlock): block is EditorJSBlock<`quiz-${string}`> {
  return block.type.startsWith('quiz-');
}

/**
 * 类型守卫：检查是否为 Header Block
 */
function isHeaderBlock(block: EditorJSBlock): block is EditorJSBlock<'header'> {
  return block.type === 'header';
}

/**
 * 类型守卫：检查是否为 Paragraph Block
 */
function isParagraphBlock(block: EditorJSBlock): block is EditorJSBlock<'paragraph'> {
  return block.type === 'paragraph';
}

/**
 * 从 Editor.js Block 提取问题
 */
function blockToQuestion(block: EditorJSBlock<`quiz-${string}`>): Question | null {
  if (!isQuizBlock(block)) {
    return null;
  }

  const blockData = block.data;
  if (!('question' in blockData)) {
    return null;
  }

  const questionData = blockData.question;
  const questionType = questionData.type;
  const id = questionData.id || generateId();
  const text = questionData.text;
  const description = questionData.description;

  // 通用属性填充辅助函数
  const fillCommonProps = (q: Question) => {
    if (description) q.description = description;
    if (questionData.points !== undefined) q.points = questionData.points;
    if (questionData.explanation !== undefined) q.explanation = questionData.explanation;
    if (questionData.metadata !== undefined) q.metadata = questionData.metadata;
  };

  // 根据问题类型构建正确的 Question 对象
  switch (questionType) {
    case 'single_choice': {
      if (!questionData.options) return null;
      const question: SingleChoiceQuestion = {
        id,
        type: questionType,
        text,
        options: questionData.options,
      };
      fillCommonProps(question);
      return question;
    }

    case 'multiple_choice': {
      if (!questionData.options) return null;
      const question: MultipleChoiceQuestion = {
        id,
        type: questionType,
        text,
        options: questionData.options,
      };
      fillCommonProps(question);
      return question;
    }

    case 'text_input': {
      if (questionData.correctAnswer === undefined) return null;
      const question: TextInputQuestion = {
        id,
        type: questionType,
        text,
        correctAnswer: questionData.correctAnswer as string | string[],
      };
      if (questionData.caseSensitive !== undefined)
        question.caseSensitive = questionData.caseSensitive;
      fillCommonProps(question);
      return question;
    }

    case 'true_false': {
      if (
        questionData.correctAnswer === undefined ||
        typeof questionData.correctAnswer !== 'boolean'
      )
        return null;
      const question: TrueFalseQuestion = {
        id,
        type: questionType,
        text,
        correctAnswer: questionData.correctAnswer,
      };
      fillCommonProps(question);
      return question;
    }

    default:
      return null;
  }
}

/**
 * 将 Editor.js 块格式转换为 Quiz DSL（纯函数）
 *
 * HTML → Markdown 转换：使用 `turndown` 库
 */
export function blockToDSL(editorData: EditorJSOutput, options?: TransformerOptions): QuizDSL {
  const blocks = editorData.blocks;

  const quizId = generateId();
  const defaultTitle = options?.localization?.quiz.defaultTitle || '';

  if (blocks.length === 0) {
    // 空编辑器，返回基础结构。不再硬编码中文。
    return {
      version: '1.0.0',
      quiz: {
        id: quizId,
        title: defaultTitle,
        sections: [],
      },
    };
  }

  // 1. 从第一个 header block (level 1) 提取标题
  const titleBlock = blocks.find(
    (b): b is EditorJSBlock<'header'> => isHeaderBlock(b) && b.data.level === 1
  );
  const title = titleBlock ? turndownService.turndown(titleBlock.data.text || '') : defaultTitle;

  // 2. 从紧跟标题的 paragraph block 提取描述
  let description = '';
  if (titleBlock) {
    const titleIndex = blocks.indexOf(titleBlock);
    const descBlock = blocks[titleIndex + 1];
    if (descBlock && isParagraphBlock(descBlock)) {
      description = turndownService.turndown(descBlock.data.text || '');
    }
  }

  // 3. 处理 sections 和 questions
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  // 跳过标题和描述 blocks
  const contentBlocks = titleBlock
    ? blocks.slice(blocks.indexOf(titleBlock) + (description ? 2 : 1))
    : blocks;

  for (const block of contentBlocks) {
    if (isHeaderBlock(block) && block.data.level === 2) {
      // 新的 section 开始
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        id: block.id || generateId(),
        title: turndownService.turndown(block.data.text || ''),
        questions: [],
      };
    } else if (isParagraphBlock(block) && currentSection && !currentSection.description) {
      // Section description（第一个 paragraph 作为描述）
      currentSection.description = turndownService.turndown(block.data.text || '');
    } else if (isQuizBlock(block)) {
      // Question block
      const question = blockToQuestion(block);
      if (question) {
        if (currentSection) {
          currentSection.questions.push(question);
        } else {
          // 没有 section，创建一个默认 section
          currentSection = {
            id: generateId(),
            title: '', // WYSIWYG: 不再填充“默认章节”
            questions: [question],
          };
        }
      }
    }
  }

  // 添加最后一个 section
  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    version: '1.0.0',
    quiz: {
      id: generateId(),
      title,
      description: description || undefined,
      sections,
    },
  };
}
