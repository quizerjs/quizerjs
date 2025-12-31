/**
 * Vite 环境类型声明
 */

/// <reference types="vite/client" />

/**
 * 声明 .slide 文件的 ?raw 导入
 */
declare module '*.slide?raw' {
  const content: string;
  export default content;
}
