/**
 * @quizerjs/core - QuizQuestionHeader 组件单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../index'; // 触发组件注册

/** 测试用：quiz-question-header 自定义元素类型（含 getText） */
type QuizQuestionHeaderElement = HTMLElement & { getText(): string };

describe('QuizQuestionHeader', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('应该能正确显示初始标题', async () => {
    const header = document.createElement('quiz-question-header') as QuizQuestionHeaderElement;
    header.setAttribute('text', 'What is your name?');
    container.appendChild(header);

    await new Promise(resolve => requestAnimationFrame(resolve));

    const h3El = header.querySelector('h3') as HTMLElement;
    expect(h3El).toBeTruthy();
    expect(h3El.innerHTML).toBe('What is your name?');
  });

  it('输入文字应该通过事件同步到内部成员且不重绘', async () => {
    const header = document.createElement('quiz-question-header') as QuizQuestionHeaderElement;
    header.setAttribute('text', 'Original');
    container.appendChild(header);

    await new Promise(resolve => requestAnimationFrame(resolve));

    const h3El = header.querySelector('h3') as HTMLElement;
    const onTextChange = vi.fn();
    header.addEventListener('textchange', onTextChange);

    // 模拟输入
    h3El.innerHTML = 'New Title';
    h3El.dispatchEvent(new Event('input', { bubbles: true }));

    expect(onTextChange).toHaveBeenCalled();
    expect(header.getText()).toBe('New Title');

    // 关键点：getText() 应该优先从 DOM 获取，或者至少在 input 后保持一致
    expect(h3El.innerHTML).toBe('New Title');
  });

  it('支持 Editor.js 的行内工具 (HTML 内容)', async () => {
    const header = document.createElement('quiz-question-header') as QuizQuestionHeaderElement;
    header.setAttribute('text', '<b>Bold</b> Text');
    container.appendChild(header);

    await new Promise(resolve => requestAnimationFrame(resolve));

    const h3El = header.querySelector('h3') as HTMLElement;
    expect(h3El.innerHTML).toBe('<b>Bold</b> Text');
  });
});
