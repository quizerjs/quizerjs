declare module '*.wsx' {
  // 遵循 Editor.js 的 BlockTool 接口定义
  // Editor.js 的 BlockToolConstructorOptions 在实际使用中所有属性都是可选的
  // 虽然类型定义可能标记为必需，但实际运行时都是可选的
  import type { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';

  interface ToolClass {
    // 使用 Partial 使所有属性可选，符合 Editor.js 的实际使用方式
    new (options?: Partial<BlockToolConstructorOptions<any>>): BlockTool & {
      [key: string]: any; // 允许访问私有属性用于测试
    };
    readonly toolbox: { title: string; icon: string };
    readonly isReadOnlySupported: boolean;
    validate?(data: any): boolean;
  }

  const Tool: ToolClass;
  export default Tool;
}
