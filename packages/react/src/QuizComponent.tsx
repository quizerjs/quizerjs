/**
 * QuizComponent - React 版本的 Quiz 组件
 */

import React from 'react';
import { useQuiz } from './hooks/useQuiz';
import type { QuizComponentProps } from './types';
import './QuizComponent.css';

export function QuizComponent({
  dsl,
  disabled = false,
  showResults = true,
  onSubmit,
  onAnswerChange,
}: QuizComponentProps) {
  const {
    answers,
    submitted,
    score,
    setAnswer,
    submit: submitQuiz,
  } = useQuiz({
    dsl,
    onSubmit: (answers, score) => {
      if (onSubmit) {
        onSubmit(answers);
      }
    },
  });

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswer(questionId, answer);
    if (onAnswerChange) {
      onAnswerChange(questionId, answer);
    }
  };

  const handleMultipleChoice = (
    questionId: string,
    optionId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    const current = answers[questionId] || [];

    if (checked) {
      handleAnswerChange(questionId, [...current, optionId]);
    } else {
      handleAnswerChange(
        questionId,
        current.filter((id: string) => id !== optionId)
      );
    }
  };

  const handleSubmit = () => {
    submitQuiz();
  };

  if (!dsl) {
    return <div className="quiz-loading">加载中...</div>;
  }

  // 收集所有问题（从 sections 或 questions）
  const allQuestions = [];
  if (dsl.quiz.sections) {
    dsl.quiz.sections.forEach(section => {
      if (section.questions) {
        allQuestions.push(...section.questions);
      }
    });
  } else if (dsl.quiz.questions) {
    allQuestions.push(...dsl.quiz.questions);
  }

  return (
    <div className="quiz-component">
      <div className="quiz-header">
        <h2>{dsl.quiz.title}</h2>
        {dsl.quiz.description && <p className="quiz-description">{dsl.quiz.description}</p>}
      </div>

      <div className="questions">
        {allQuestions.map((question, index) => (
          <div key={question.id} className="question-item">
            <h3>
              {index + 1}. {question.text}
              {question.points && <span className="points">({question.points} 分)</span>}
            </h3>

            {/* 单选题 */}
            {question.type === 'single_choice' && (
              <div className="options">
                {question.options.map(option => (
                  <label
                    key={option.id}
                    className={`option-label ${disabled || submitted ? 'disabled' : ''}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => handleAnswerChange(question.id, option.id)}
                      disabled={disabled || submitted}
                    />
                    <span className="option-text">{option.text}</span>
                    {submitted && option.isCorrect && <span className="correct-mark">✅</span>}
                  </label>
                ))}
              </div>
            )}

            {/* 多选题 */}
            {question.type === 'multiple_choice' && (
              <div className="options">
                {question.options.map(option => (
                  <label
                    key={option.id}
                    className={`option-label ${disabled || submitted ? 'disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={(answers[question.id] || []).includes(option.id)}
                      onChange={e => handleMultipleChoice(question.id, option.id, e)}
                      disabled={disabled || submitted}
                    />
                    <span className="option-text">{option.text}</span>
                    {submitted && option.isCorrect && <span className="correct-mark">✅</span>}
                  </label>
                ))}
              </div>
            )}

            {/* 文本输入 */}
            {question.type === 'text_input' && (
              <div>
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={e => handleAnswerChange(question.id, e.target.value)}
                  disabled={disabled || submitted}
                  className="text-input"
                  placeholder="请输入答案"
                />
              </div>
            )}

            {/* 判断题 */}
            {question.type === 'true_false' && (
              <div className="options">
                <label className={`option-label ${disabled || submitted ? 'disabled' : ''}`}>
                  <input
                    type="radio"
                    name={question.id}
                    value="true"
                    checked={answers[question.id] === true}
                    onChange={() => handleAnswerChange(question.id, true)}
                    disabled={disabled || submitted}
                  />
                  <span className="option-text">正确</span>
                </label>
                <label className={`option-label ${disabled || submitted ? 'disabled' : ''}`}>
                  <input
                    type="radio"
                    name={question.id}
                    value="false"
                    checked={answers[question.id] === false}
                    onChange={() => handleAnswerChange(question.id, false)}
                    disabled={disabled || submitted}
                  />
                  <span className="option-text">错误</span>
                </label>
              </div>
            )}

            {submitted && question.explanation && (
              <div className="explanation">
                <strong>解析：</strong>
                {question.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="quiz-actions">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={disabled} className="submit-button">
            提交答案
          </button>
        ) : (
          showResults && (
            <div className="results">
              <h3>您的得分: {score}%</h3>
              {dsl.quiz.settings?.passingScore && (
                <p>{score! >= dsl.quiz.settings.passingScore ? '✅ 通过' : '❌ 未通过'}</p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
