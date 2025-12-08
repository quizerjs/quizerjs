/**
 * @quizerjs/editorjs-tool - Editor.js 工具插件导出
 */

// 导入工具（触发 wsx 组件自动注册）
import '@quizerjs/core';

// 导出工具类
export { default as SingleChoiceTool } from './tools/SingleChoiceTool.wsx';
export { default as MultipleChoiceTool } from './tools/MultipleChoiceTool.wsx';
export { default as TextInputTool } from './tools/TextInputTool.wsx';
export { default as TrueFalseTool } from './tools/TrueFalseTool.wsx';

// 导出类型（从 types.ts 导出）
export type {
  SingleChoiceData,
  MultipleChoiceData,
  TextInputData,
  TrueFalseData,
} from './tools/types';
