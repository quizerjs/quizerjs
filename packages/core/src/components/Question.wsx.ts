/**
 * 问题组件
 * 用于显示单个测验问题及其选项
 */

import { WebComponent, autoRegister } from '@wsxjs/wsx-core';
import { Question as QuestionType, QuestionType as QType, UserAnswer } from '../types';
import { QuizOption } from './Option.wsx';

// 组件样式
const styles = `
  .quiz-question {
    margin-bottom: 24px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background-color: #ffffff;
  }

  .quiz-question-header {
    margin-bottom: 16px;
  }

  .quiz-question-title {
    font-size: 18px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 8px;
  }

  .quiz-question-text {
    font-size: 16px;
    color: #666666;
    line-height: 1.6;
  }

  .quiz-question-options {
    margin-top: 16px;
  }

  .quiz-question-explanation {
    margin-top: 16px;
    padding: 12px;
    background-color: #f5f5f5;
    border-radius: 8px;
    font-size: 14px;
    color: #666666;
  }

  .quiz-question-points {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
    font-size: 12px;
    color: #999999;
  }
`;

interface QuestionProps {
  question: QuestionType; // 问题数据
  userAnswer?: UserAnswer; // 用户答案
  mode?: 'edit' | 'view' | 'result'; // 模式：编辑、查看、结果
  disabled?: boolean; // 是否禁用
  onAnswerChange?: (questionId: string, answer: string | string[]) => void; // 答案变化回调
}

@autoRegister()
export class QuizQuestion extends WebComponent<QuestionProps> {
  constructor() {
    super({ styles });
  }

  // 处理选项选择
  private handleOptionSelect = (optionId: string) => {
    const { question, userAnswer, onAnswerChange, mode } = this.props;

    if (mode === 'edit' || !onAnswerChange) return;

    let newAnswer: string | string[];

    if (question.type === QType.SINGLE_CHOICE || question.type === QType.TRUE_FALSE) {
      // 单选题或判断题：直接设置答案
      newAnswer = optionId;
    } else if (question.type === QType.MULTIPLE_CHOICE) {
      // 多选题：切换选项
      const currentAnswers = (userAnswer?.answer as string[]) || [];
      if (currentAnswers.includes(optionId)) {
        newAnswer = currentAnswers.filter((id) => id !== optionId);
      } else {
        newAnswer = [...currentAnswers, optionId];
      }
    } else {
      return;
    }

    onAnswerChange(question.id, newAnswer);
  };

  // 检查选项是否被选中
  private isOptionSelected = (optionId: string): boolean => {
    const { userAnswer } = this.props;
    if (!userAnswer) return false;

    if (Array.isArray(userAnswer.answer)) {
      return userAnswer.answer.includes(optionId);
    }
    return userAnswer.answer === optionId;
  };

  render() {
    const { question, userAnswer, mode = 'view', disabled } = this.props;
    const showResult = mode === 'result';
    const isEditMode = mode === 'edit';

    return (
      <div className="quiz-question" data-question-id={question.id}>
        <div className="quiz-question-header">
          <div className="quiz-question-title">
            {question.text}
            {question.points && (
              <span className="quiz-question-points">{question.points} 分</span>
            )}
          </div>
        </div>

        {question.type === QType.TEXT_INPUT ? (
          // 文本输入题
          <div className="quiz-question-options">
            <input
              type="text"
              value={(userAnswer?.answer as string) || ''}
              disabled={disabled || showResult}
              onInput={(e: Event) => {
                const target = e.target as HTMLInputElement;
                if (this.props.onAnswerChange) {
                  this.props.onAnswerChange(question.id, target.value);
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
              }}
              placeholder="请输入答案"
            />
          </div>
        ) : (
          // 选择题：显示选项
          <div className="quiz-question-options">
            {question.options?.map((option) => (
              <QuizOption
                key={option.id}
                option={option}
                questionType={
                  question.type === QType.SINGLE_CHOICE ? 'single_choice' : 'multiple_choice'
                }
                selected={this.isOptionSelected(option.id)}
                disabled={disabled || showResult}
                showResult={showResult}
                isCorrect={option.isCorrect}
                onSelect={this.handleOptionSelect}
                data-question-id={question.id}
              />
            ))}
          </div>
        )}

        {showResult && question.explanation && (
          <div className="quiz-question-explanation">
            <strong>解析：</strong>
            {question.explanation}
          </div>
        )}
      </div>
    );
  }
}

