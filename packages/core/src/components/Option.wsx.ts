/**
 * 选项组件
 * 用于显示测验问题的选项
 */

import { WebComponent, autoRegister } from '@wsxjs/wsx-core';
import { Option as OptionType } from '../types';

// 组件样式
const styles = `
  .quiz-option {
    display: flex;
    align-items: center;
    padding: 12px;
    margin: 8px 0;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: #ffffff;
  }

  .quiz-option:hover {
    border-color: #4a90e2;
    background-color: #f5f8ff;
  }

  .quiz-option.selected {
    border-color: #4a90e2;
    background-color: #e8f2ff;
  }

  .quiz-option.correct {
    border-color: #52c41a;
    background-color: #f6ffed;
  }

  .quiz-option.incorrect {
    border-color: #ff4d4f;
    background-color: #fff1f0;
  }

  .quiz-option input[type="radio"],
  .quiz-option input[type="checkbox"] {
    margin-right: 12px;
    cursor: pointer;
  }

  .quiz-option-label {
    flex: 1;
    cursor: pointer;
    user-select: none;
  }
`;

interface OptionProps {
  option: OptionType; // 选项数据
  questionType: 'single_choice' | 'multiple_choice'; // 问题类型
  selected?: boolean; // 是否选中
  disabled?: boolean; // 是否禁用
  showResult?: boolean; // 是否显示结果
  isCorrect?: boolean; // 是否为正确答案
  onSelect?: (optionId: string) => void; // 选择回调
}

@autoRegister()
export class QuizOption extends WebComponent<OptionProps> {
  constructor() {
    super({ styles });
  }

  render() {
    const { option, questionType, selected, disabled, showResult, isCorrect, onSelect } =
      this.props;

    // 计算样式类名
    const classNames = ['quiz-option'];
    if (selected) classNames.push('selected');
    if (showResult && isCorrect) classNames.push('correct');
    if (showResult && selected && !isCorrect) classNames.push('incorrect');

    // 处理点击事件
    const handleClick = () => {
      if (!disabled && onSelect) {
        onSelect(option.id);
      }
    };

    // 处理输入框变化
    const handleChange = (e: Event) => {
      e.stopPropagation();
      if (!disabled && onSelect) {
        onSelect(option.id);
      }
    };

    const inputType = questionType === 'single_choice' ? 'radio' : 'checkbox';
    const inputName = `question-${this.getAttribute('data-question-id') || 'default'}`;

    return (
      <div className={classNames.join(' ')} onClick={handleClick}>
        <input
          type={inputType}
          name={inputName}
          value={option.id}
          checked={selected}
          disabled={disabled}
          onChange={handleChange}
        />
        <span className="quiz-option-label">{option.text}</span>
      </div>
    );
  }
}

