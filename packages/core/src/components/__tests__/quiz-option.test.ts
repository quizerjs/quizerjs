/**
 * @quizerjs/core - QuizOption 组件单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../index'; // 触发组件注册
import { QuizOption } from '../quiz-option.wsx';

describe('QuizOption', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('应该能正确显示初始文本', async () => {
    const option = document.createElement('quiz-option') as QuizOption;
    option.setAttribute('text', 'Initial Text');
    container.appendChild(option);

    // 等待 WSX 渲染生命周期
    await new Promise(resolve => requestAnimationFrame(resolve));

    const textEl = option.querySelector('.quiz-option-text') as HTMLElement;
    expect(textEl).toBeTruthy();
    expect(textEl.innerHTML).toBe('Initial Text');
  });

  it('输入文字应该触发 textchange 事件', async () => {
    const option = document.createElement('quiz-option') as QuizOption;
    option.setAttribute('text', 'Old');
    container.appendChild(option);

    await new Promise(resolve => requestAnimationFrame(resolve));

    const textEl = option.querySelector('.quiz-option-text') as HTMLElement;
    const onTextChange = vi.fn();
    option.addEventListener('textchange', onTextChange);

    // 模拟输入
    textEl.innerHTML = 'New Content';
    textEl.dispatchEvent(new Event('input', { bubbles: true }));

    expect(onTextChange).toHaveBeenCalled();
    const eventDetail = onTextChange.mock.calls[0][0].detail;
    expect(eventDetail.text).toBe('New Content');
  });

  it('getData() 应该返回最新的 DOM 内容', async () => {
    const option = document.createElement('quiz-option') as QuizOption;
    option.setAttribute('text', 'Original');
    container.appendChild(option);

    await new Promise(resolve => requestAnimationFrame(resolve));

    const textEl = option.querySelector('.quiz-option-text') as HTMLElement;
    textEl.innerHTML = 'Modified in DOM';

    // 模拟输入触发内部更新
    textEl.dispatchEvent(new Event('input', { bubbles: true }));

    const data = option.getData();
    expect(data.text).toBe('Modified in DOM');
  });

  it('更新选中状态不应导致文本丢失 (核心 Bug 修复验证)', async () => {
    const option = document.createElement('quiz-option') as QuizOption;
    option.setAttribute('text', 'User Typed Content');
    container.appendChild(option);

    await new Promise(resolve => requestAnimationFrame(resolve));

    const textEl = option.querySelector('.quiz-option-text') as HTMLElement;

    // 模拟用户输入，但此时内部成员 text 已更新，而重绘不应发生
    textEl.innerHTML = 'Actually Typed';
    textEl.dispatchEvent(new Event('input', { bubbles: true }));

    // 模拟属性变化触发重绘（例如通过 Radio 选中其他选项导致此选项失焦或被重设状态）
    option.setAttribute('selected', 'true');

    // 等待重绘完成
    await new Promise(resolve => requestAnimationFrame(resolve));

    const textElAfter = option.querySelector('.quiz-option-text') as HTMLElement;
    expect(textElAfter.innerHTML).toBe('Actually Typed');
  });

  it('失焦时如果属性变更，应该同步 DOM 内容', async () => {
    const option = document.createElement('quiz-option') as QuizOption;
    option.setAttribute('text', 'Text A');
    container.appendChild(option);

    await new Promise(resolve => requestAnimationFrame(resolve));

    const textEl = option.querySelector('.quiz-option-text') as HTMLElement;
    expect(textEl.innerHTML).toBe('Text A');

    // 修改属性
    option.setAttribute('text', 'Text B');

    // 等待渲染
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(textEl.innerHTML).toBe('Text B');
  });
});
