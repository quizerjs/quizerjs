import type { BlockToolData } from '@editorjs/editorjs';
import type { EditorJSQuestionData } from '@quizerjs/core';

/**
 * 单选题工具数据
 */
export interface SingleChoiceData extends BlockToolData {
  question: EditorJSQuestionData;
}

/**
 * 多选题工具数据
 */
export interface MultipleChoiceData extends BlockToolData {
  question: EditorJSQuestionData;
}

/**
 * 文本输入题工具数据
 */
export interface TextInputData extends BlockToolData {
  question: EditorJSQuestionData;
}

/**
 * 判断题工具数据
 */
export interface TrueFalseData extends BlockToolData {
  question: EditorJSQuestionData;
}
