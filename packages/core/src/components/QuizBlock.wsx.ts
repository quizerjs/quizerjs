/**
 * 测验块组件
 * 主要的测验容器组件，包含所有问题
 */

import { WebComponent, autoRegister } from '@wsxjs/wsx-core';
import { QuizData, UserAnswer, QuizResult, Question } from '../types';
import { QuizQuestion } from './Question.wsx';

// 组件样式
const styles = `
  .quiz-block {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .quiz-block-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e0e0e0;
  }

  .quiz-block-title {
    font-size: 24px;
    font-weight: 700;
    color: #333333;
    margin-bottom: 8px;
  }

  .quiz-block-description {
    font-size: 16px;
    color: #666666;
    line-height: 1.6;
  }

  .quiz-block-questions {
    margin-bottom: 24px;
  }

  .quiz-block-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 2px solid #e0e0e0;
  }

  .quiz-block-button {
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .quiz-block-button-primary {
    background-color: #4a90e2;
    color: #ffffff;
  }

  .quiz-block-button-primary:hover {
    background-color: #357abd;
  }

  .quiz-block-button-primary:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .quiz-block-result {
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 12px;
    margin-bottom: 24px;
  }

  .quiz-block-result-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #333333;
  }

  .quiz-block-result-score {
    font-size: 32px;
    font-weight: 700;
    color: #4a90e2;
    margin-bottom: 8px;
  }

  .quiz-block-result-percentage {
    font-size: 18px;
    color: #666666;
  }
`;

interface QuizBlockProps {
  quizData: QuizData; // 测验数据
  mode?: 'edit' | 'view' | 'result'; // 模式
  userAnswers?: UserAnswer[]; // 用户答案列表
  result?: QuizResult; // 测验结果
  onSubmit?: (answers: UserAnswer[]) => void; // 提交回调
  onAnswerChange?: (questionId: string, answer: string | string[]) => void; // 答案变化回调
}

@autoRegister()
export class QuizBlock extends WebComponent<QuizBlockProps> {
  private answers: Map<string, UserAnswer> = new Map();

  constructor() {
    super({ styles });
  }

  // 初始化答案
  private initializeAnswers() {
    const { userAnswers, quizData } = this.props;
    this.answers.clear();

    if (userAnswers) {
      userAnswers.forEach((answer) => {
        this.answers.set(answer.questionId, answer);
      });
    } else {
      // 初始化空答案
      quizData.questions.forEach((question) => {
        this.answers.set(question.id, {
          questionId: question.id,
          answer: question.type === 'multiple_choice' ? [] : '',
        });
      });
    }
  }

  // 处理答案变化
  private handleAnswerChange = (questionId: string, answer: string | string[]) => {
    const currentAnswer = this.answers.get(questionId) || {
      questionId,
      answer: this.props.quizData.questions.find((q) => q.id === questionId)?.type ===
        'multiple_choice'
        ? []
        : '',
    };

    currentAnswer.answer = answer;
    this.answers.set(questionId, currentAnswer);

    // 调用外部回调
    if (this.props.onAnswerChange) {
      this.props.onAnswerChange(questionId, answer);
    }

    // 触发重新渲染
    this.update();
  };

  // 处理提交
  private handleSubmit = () => {
    const answers = Array.from(this.answers.values());
    if (this.props.onSubmit) {
      this.props.onSubmit(answers);
    }
  };

  // 检查是否可以提交
  private canSubmit(): boolean {
    const { quizData } = this.props;
    return quizData.questions.every((question) => {
      const answer = this.answers.get(question.id);
      if (!answer) return false;

      if (question.type === 'multiple_choice') {
        return Array.isArray(answer.answer) && answer.answer.length > 0;
      }
      return answer.answer !== '' && answer.answer !== null && answer.answer !== undefined;
    });
  }

  render() {
    const { quizData, mode = 'view', result } = this.props;

    // 初始化答案
    this.initializeAnswers();

    const isEditMode = mode === 'edit';
    const isResultMode = mode === 'result';
    const showSubmitButton = !isEditMode && !isResultMode;

    return (
      <div className="quiz-block">
        {/* 测验头部 */}
        <div className="quiz-block-header">
          <h2 className="quiz-block-title">{quizData.title}</h2>
          {quizData.description && (
            <p className="quiz-block-description">{quizData.description}</p>
          )}
        </div>

        {/* 结果显示 */}
        {isResultMode && result && (
          <div className="quiz-block-result">
            <div className="quiz-block-result-title">测验结果</div>
            <div className="quiz-block-result-score">
              {result.score} / {result.totalScore}
            </div>
            <div className="quiz-block-result-percentage">
              得分率：{result.percentage.toFixed(1)}%
            </div>
          </div>
        )}

        {/* 问题列表 */}
        <div className="quiz-block-questions">
          {quizData.questions.map((question) => {
            const userAnswer = this.answers.get(question.id);
            return (
              <QuizQuestion
                key={question.id}
                question={question}
                userAnswer={userAnswer}
                mode={mode}
                disabled={isResultMode}
                onAnswerChange={this.handleAnswerChange}
              />
            );
          })}
        </div>

        {/* 底部操作栏 */}
        {showSubmitButton && (
          <div className="quiz-block-footer">
            <button
              className="quiz-block-button quiz-block-button-primary"
              onClick={this.handleSubmit}
              disabled={!this.canSubmit()}
            >
              提交答案
            </button>
          </div>
        )}
      </div>
    );
  }
}

