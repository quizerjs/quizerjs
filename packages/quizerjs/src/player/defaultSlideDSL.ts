/**
 * 默认 Slide DSL
 * 从 quiz.slide 文件导入作为字符串
 */

// 使用 ?raw 后缀导入文件内容作为字符串
// Vite 会自动处理 ?raw 导入，将文件内容作为字符串
import defaultSlideDSL from './quiz.slide?raw';

/**
 * 获取默认的 Slide DSL
 */
export function getDefaultSlideDSL(): string {
  return defaultSlideDSL as string;
}
