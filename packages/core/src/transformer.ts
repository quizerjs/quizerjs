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
  Question,
  Section,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  TextInputQuestion,
  TrueFalseQuestion,
  Option,
  QuestionMetadata,
} from '@quizerjs/dsl';

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

  // 处理可选字段（description 在 DSL 中不存在，但可能在 Editor.js 中使用）
  // 注意：当前 DSL 类型定义中没有 description 字段，如果需要，应该在 DSL 类型中添加

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
 * 转换规则：
 * 1. quiz.title → header block (level 1)，作为第一个 block
 * 2. quiz.description → paragraph block（可选，紧跟 H1）
 * 3. sections[].title → header block (level 2)
 * 4. sections[].description → paragraph block（可选）
 * 5. sections[].questions → quiz-* blocks
 *
 * 如果 DSL 没有 sections，则使用 questions 数组（向后兼容）
 *
 * Markdown → HTML 转换：使用 `marked` 库
 */
export function dslToBlock(dsl: QuizDSL): EditorJSOutput {
  const blocks: EditorJSBlock[] = [];

  // 1. H1 文档标题（必需，作为第一个 block）
  const titleHTML = markdownToHTML(dsl.quiz.title);
  if (titleHTML) {
    blocks.push({
      type: 'header',
      data: {
        text: titleHTML,
        level: 1,
      },
    });
  }

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
  if (dsl.quiz.sections && dsl.quiz.sections.length > 0) {
    // 使用 sections
    for (const section of dsl.quiz.sections) {
      // Section Header (H2)
      const sectionTitleHTML = markdownToHTML(section.title);
      blocks.push({
        type: 'header',
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
      // 注意：不再将 section.title 合并到 question.text 中
      // section.title 已经作为 H2 header block 显示，question.text 只包含问题文本
      for (const question of section.questions) {
        blocks.push(questionToBlock(question));
      }
    }
  } else if (dsl.quiz.questions && dsl.quiz.questions.length > 0) {
    // 向后兼容：直接使用 questions 数组
    for (const question of dsl.quiz.questions) {
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
 * 从 question.text 中提取章节标题
 * 支持格式：问题文本&nbsp;章节标题 或 问题文本 章节标题
 * 返回 { questionText: 清理后的问题文本, sectionTitle: 提取的章节标题 } 或 null
 */
function _extractSectionTitleFromQuestionText(htmlText: string): {
  questionText: string;
  sectionTitle: string;
} | null {
  if (!htmlText) {
    return null;
  }

  // 尝试匹配格式：文本&nbsp;章节标题
  // 查找最后一个 &nbsp; 或 &#160; 作为分隔符
  const lastNbspIndex = htmlText.lastIndexOf('&nbsp;');
  const lastNbsp160Index = htmlText.lastIndexOf('&#160;');
  const separatorIndex = Math.max(lastNbspIndex, lastNbsp160Index);

  if (separatorIndex >= 0) {
    // 找到最后一个分隔符
    const isNbsp = lastNbspIndex > lastNbsp160Index;
    const separatorLength = isNbsp ? 6 : 6; // &nbsp; 和 &#160; 都是 6 个字符
    const sectionTitleHTML = htmlText.substring(separatorIndex + separatorLength).trim();
    const questionTextHTML = htmlText.substring(0, separatorIndex).trim();

    if (sectionTitleHTML) {
      // 将章节标题 HTML 转换为纯文本
      const sectionTitle = turndownService.turndown(sectionTitleHTML).trim();

      if (sectionTitle) {
        return {
          questionText: questionTextHTML,
          sectionTitle,
        };
      }
    }
  }

  // 如果没有找到 &nbsp;，尝试使用文本格式（多个连续空格或制表符）
  const text = turndownService.turndown(htmlText).trim();
  const spacePattern = /\s{2,}|\t/;
  if (spacePattern.test(text)) {
    const parts = text.split(/\s{2,}|\t/);
    if (parts.length > 1) {
      const sectionTitle = parts[parts.length - 1].trim();

      if (sectionTitle) {
        // 从原 HTML 中找到章节标题的位置并移除
        // 先找到章节标题在转换后文本中的位置
        const sectionTitleStartInText = text.lastIndexOf(sectionTitle);
        if (sectionTitleStartInText > 0) {
          // 找到对应的 HTML 位置（近似）
          const textBeforeTitle = text.substring(0, sectionTitleStartInText);
          const questionTextHTML = htmlText.substring(
            0,
            htmlText.length - (text.length - textBeforeTitle.length)
          );

          return {
            questionText: questionTextHTML.trim(),
            sectionTitle,
          };
        }
      }
    }
  }

  return null;
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

  // 根据问题类型构建正确的 Question 对象
  switch (questionType) {
    case 'single_choice': {
      if (!questionData.options) {
        return null;
      }

      const question: SingleChoiceQuestion = {
        id,
        type: questionType,
        text,
        options: questionData.options,
      };

      // 注意：当前 DSL 类型定义中没有 description 字段
      // 如果需要支持 description，应该在 DSL 类型定义中添加

      if (questionData.points !== undefined) {
        question.points = questionData.points;
      }

      if (questionData.explanation !== undefined) {
        question.explanation = questionData.explanation;
      }

      if (questionData.metadata !== undefined) {
        question.metadata = questionData.metadata;
      }

      return question;
    }

    case 'multiple_choice': {
      if (!questionData.options) {
        return null;
      }

      const question: MultipleChoiceQuestion = {
        id,
        type: questionType,
        text,
        options: questionData.options,
      };

      // 注意：当前 DSL 类型定义中没有 description 字段
      // 如果需要支持 description，应该在 DSL 类型定义中添加

      if (questionData.points !== undefined) {
        question.points = questionData.points;
      }

      if (questionData.explanation !== undefined) {
        question.explanation = questionData.explanation;
      }

      if (questionData.metadata !== undefined) {
        question.metadata = questionData.metadata;
      }

      return question;
    }

    case 'text_input': {
      if (questionData.correctAnswer === undefined) {
        return null;
      }

      const question: TextInputQuestion = {
        id,
        type: questionType,
        text,
        correctAnswer: questionData.correctAnswer as string | string[],
      };

      // 注意：当前 DSL 类型定义中没有 description 字段
      // 如果需要支持 description，应该在 DSL 类型定义中添加

      if (questionData.caseSensitive !== undefined) {
        question.caseSensitive = questionData.caseSensitive;
      }

      if (questionData.points !== undefined) {
        question.points = questionData.points;
      }

      if (questionData.explanation !== undefined) {
        question.explanation = questionData.explanation;
      }

      if (questionData.metadata !== undefined) {
        question.metadata = questionData.metadata;
      }

      return question;
    }

    case 'true_false': {
      if (
        questionData.correctAnswer === undefined ||
        typeof questionData.correctAnswer !== 'boolean'
      ) {
        return null;
      }

      const question: TrueFalseQuestion = {
        id,
        type: questionType,
        text,
        correctAnswer: questionData.correctAnswer,
      };

      // 注意：当前 DSL 类型定义中没有 description 字段
      // 如果需要支持 description，应该在 DSL 类型定义中添加

      if (questionData.points !== undefined) {
        question.points = questionData.points;
      }

      if (questionData.explanation !== undefined) {
        question.explanation = questionData.explanation;
      }

      if (questionData.metadata !== undefined) {
        question.metadata = questionData.metadata;
      }

      return question;
    }

    default:
      return null;
  }
}

/**
 * 将 Editor.js 块格式转换为 Quiz DSL（纯函数）
 *
 * 转换规则：
 * 1. 第一个 header block (level 1) → quiz.title
 * 2. 紧跟 H1 的 paragraph block → quiz.description（可选）
 * 3. header block (level 2) → sections[].title
 * 4. header 后的 paragraph block → sections[].description（可选）
 * 5. quiz-* blocks → sections[].questions
 *
 * HTML → Markdown 转换：使用 `turndown` 库
 */
export function blockToDSL(editorData: EditorJSOutput): QuizDSL {
  const blocks = editorData.blocks;

  if (blocks.length === 0) {
    // 空编辑器，返回默认 DSL（包含一个默认 section）
    return {
      version: '1.0.0',
      quiz: {
        id: generateId(),
        title: '未命名测验',
        sections: [
          {
            id: generateId(),
            title: '默认章节',
            questions: [],
          },
        ],
      },
    };
  }

  // 1. 从第一个 header block (level 1) 提取标题
  const titleBlock = blocks.find(
    (b): b is EditorJSBlock<'header'> => isHeaderBlock(b) && b.data.level === 1
  );
  const title = titleBlock ? turndownService.turndown(titleBlock.data.text || '') : '未命名测验';

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
      // 注意：不再从 question.text 中提取章节标题
      // section.title 通过前面的 H2 header block 确定
      const question = blockToQuestion(block);
      if (question) {
        if (currentSection) {
          currentSection.questions.push(question);
        } else {
          // 没有 section，创建一个默认 section
          currentSection = {
            id: generateId(),
            title: '默认章节',
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

  // 如果没有 sections，创建空数组
  if (sections.length === 0) {
    sections.push({
      id: generateId(),
      title: '默认章节',
      questions: [],
    });
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
