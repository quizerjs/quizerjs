/**
 * @slidejs/runner - 错误处理
 *
 * 定义 SlideRunner 相关的错误类
 */

/**
 * SlideRunner 错误类
 */
export class SlideRunnerError extends Error {
  /**
   * @param message - 错误消息
   * @param code - 错误代码（可选）
   */
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SlideRunnerError';
    // 保持正确的原型链
    Object.setPrototypeOf(this, SlideRunnerError.prototype);
  }
}
