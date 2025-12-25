# 真实使用案例

本文档展示 quizerjs 在实际项目中的使用案例。

## 案例 1: 在线教育平台

### 场景描述

一个在线教育平台需要为学生创建交互式测验，支持多种题型，并能实时验证答案。

### 实现方案

```typescript
import { validateQuizDSL, parseQuizDSL } from '@quizerjs/dsl';
import type { QuizDSL } from '@quizerjs/dsl';

// 从服务器获取测验数据
async function loadQuiz(quizId: string): Promise<QuizDSL | null> {
  const response = await fetch(`/api/quizzes/${quizId}`);
  const jsonString = await response.text();

  const parseResult = parseQuizDSL(jsonString);

  if (!parseResult.success) {
    console.error('解析失败:', parseResult.error);
    return null;
  }

  // 验证数据
  const validationResult = validateQuizDSL(parseResult.dsl!);
  if (!validationResult.valid) {
    console.error('数据验证失败:', validationResult.errors);
    return null;
  }

  return parseResult.dsl!;
}

// 使用示例
const quiz = await loadQuiz('javascript-basics-101');
if (quiz) {
  console.log(`加载测验: ${quiz.quiz.title}`);
  console.log(`问题数量: ${quiz.quiz.questions.length}`);
}
```

### 完整的 React 组件示例

```tsx
import React, { useState, useEffect } from 'react';
import { validateQuizDSL, parseQuizDSL } from '@quizerjs/dsl';
import type { QuizDSL, Question } from '@quizerjs/dsl';

interface QuizComponentProps {
  quizId: string;
}

export function QuizComponent({ quizId }: QuizComponentProps) {
  const [quiz, setQuiz] = useState<QuizDSL | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  async function loadQuiz() {
    const response = await fetch(`/api/quizzes/${quizId}`);
    const jsonString = await response.text();
    const parseResult = parseQuizDSL(jsonString);

    if (parseResult.success) {
      setQuiz(parseResult.dsl!);
    }
  }

  function handleAnswerChange(questionId: string, answer: any) {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }

  function handleSubmit() {
    if (!quiz) return;

    let totalScore = 0;
    let maxScore = 0;

    quiz.quiz.questions.forEach(question => {
      const points = question.points || 1;
      maxScore += points;

      const userAnswer = answers[question.id];
      if (isAnswerCorrect(question, userAnswer)) {
        totalScore += points;
      }
    });

    setScore((totalScore / maxScore) * 100);
    setSubmitted(true);
  }

  function isAnswerCorrect(question: Question, userAnswer: any): boolean {
    switch (question.type) {
      case 'single_choice':
        const option = question.options.find(opt => opt.id === userAnswer);
        return option?.isCorrect || false;

      case 'multiple_choice':
        const selectedOptions = question.options.filter(opt => userAnswer?.includes(opt.id));
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        return (
          selectedOptions.length === correctOptions.length &&
          selectedOptions.every(opt => opt.isCorrect)
        );

      case 'text_input':
        if (typeof question.correctAnswer === 'string') {
          return question.caseSensitive
            ? userAnswer === question.correctAnswer
            : userAnswer?.toLowerCase() === question.correctAnswer.toLowerCase();
        } else {
          return question.correctAnswer.includes(userAnswer);
        }

      case 'true_false':
        return userAnswer === question.correctAnswer;

      default:
        return false;
    }
  }

  if (!quiz) {
    return <div>加载中...</div>;
  }

  return (
    <div className="quiz-container">
      <h1>{quiz.quiz.title}</h1>
      {quiz.quiz.description && <p className="quiz-description">{quiz.quiz.description}</p>}

      <div className="questions">
        {quiz.quiz.questions.map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            index={index + 1}
            answer={answers[question.id]}
            onChange={answer => handleAnswerChange(question.id, answer)}
            submitted={submitted}
          />
        ))}
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} className="submit-button">
          提交答案
        </button>
      ) : (
        <div className="results">
          <h2>您的得分: {score?.toFixed(1)}%</h2>
          {quiz.quiz.settings?.passingScore && (
            <p>{score! >= quiz.quiz.settings.passingScore ? '✅ 通过' : '❌ 未通过'}</p>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionItem({ question, index, answer, onChange, submitted }: any) {
  return (
    <div className="question-item">
      <h3>
        {index}. {question.text}
        {question.points && <span className="points">({question.points} 分)</span>}
      </h3>

      {question.type === 'single_choice' && (
        <div className="options">
          {question.options.map((option: any) => (
            <label key={option.id} className="option">
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={answer === option.id}
                onChange={() => onChange(option.id)}
                disabled={submitted}
              />
              {option.text}
              {submitted && option.isCorrect && ' ✅'}
            </label>
          ))}
        </div>
      )}

      {question.type === 'multiple_choice' && (
        <div className="options">
          {question.options.map((option: any) => (
            <label key={option.id} className="option">
              <input
                type="checkbox"
                checked={answer?.includes(option.id) || false}
                onChange={e => {
                  const current = answer || [];
                  onChange(
                    e.target.checked
                      ? [...current, option.id]
                      : current.filter((id: string) => id !== option.id)
                  );
                }}
                disabled={submitted}
              />
              {option.text}
              {submitted && option.isCorrect && ' ✅'}
            </label>
          ))}
        </div>
      )}

      {question.type === 'text_input' && (
        <input
          type="text"
          value={answer || ''}
          onChange={e => onChange(e.target.value)}
          disabled={submitted}
          className="text-input"
        />
      )}

      {question.type === 'true_false' && (
        <div className="options">
          <label className="option">
            <input
              type="radio"
              name={question.id}
              value="true"
              checked={answer === true}
              onChange={() => onChange(true)}
              disabled={submitted}
            />
            正确
          </label>
          <label className="option">
            <input
              type="radio"
              name={question.id}
              value="false"
              checked={answer === false}
              onChange={() => onChange(false)}
              disabled={submitted}
            />
            错误
          </label>
        </div>
      )}

      {submitted && question.explanation && (
        <div className="explanation">
          <strong>解析:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}
```

## 案例 2: 内容管理系统

### 场景描述

一个 CMS 系统需要让内容编辑者通过 Editor.js 创建包含测验的文章。

### 实现方案

```typescript
import EditorJS from '@editorjs/editorjs';
import QuizTool from '@quizerjs/editorjs-tool';
import { validateQuizDSL } from '@quizerjs/dsl';

// 初始化 Editor.js
const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    quiz: {
      class: QuizTool,
      config: {
        onSubmit: data => {
          // 验证 DSL
          const result = validateQuizDSL(data);

          if (result.valid) {
            // 保存到服务器
            saveQuiz(data);
          } else {
            // 显示错误
            showValidationErrors(result.errors);
          }
        },
        onAnswerChange: (questionId, answer) => {
          // 实时保存答案（草稿）
          saveDraft(questionId, answer);
        },
      },
    },
  },
});

// 保存测验
async function saveQuiz(dsl: QuizDSL) {
  const response = await fetch('/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dsl),
  });

  if (response.ok) {
    console.log('测验已保存');
  }
}

// 加载已保存的测验
async function loadQuiz(quizId: string) {
  const response = await fetch(`/api/quizzes/${quizId}`);
  const dsl = await response.json();

  // 验证并加载到编辑器
  const result = validateQuizDSL(dsl);
  if (result.valid) {
    editor.blocks.insert('quiz', dsl);
  }
}
```

## 案例 3: 移动应用

### 场景描述

一个移动学习应用需要离线支持，能够下载和本地存储测验数据。

### 实现方案

```typescript
import { validateQuizDSL, parseQuizDSL, serializeQuizDSL } from '@quizerjs/dsl';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 下载并保存测验
async function downloadAndSaveQuiz(quizId: string) {
  try {
    // 从服务器下载
    const response = await fetch(`https://api.example.com/quizzes/${quizId}`);
    const jsonString = await response.text();

    // 解析和验证
    const parseResult = parseQuizDSL(jsonString);
    if (!parseResult.success || !parseResult.dsl) {
      throw new Error('解析失败');
    }

    const validationResult = validateQuizDSL(parseResult.dsl);
    if (!validationResult.valid) {
      throw new Error('验证失败');
    }

    // 保存到本地存储
    await AsyncStorage.setItem(`quiz_${quizId}`, jsonString);

    console.log('测验已下载并保存');
    return parseResult.dsl;
  } catch (error) {
    console.error('下载失败:', error);
    return null;
  }
}

// 从本地加载测验
async function loadLocalQuiz(quizId: string) {
  try {
    const jsonString = await AsyncStorage.getItem(`quiz_${quizId}`);
    if (!jsonString) {
      return null;
    }

    const parseResult = parseQuizDSL(jsonString);
    if (parseResult.success && parseResult.dsl) {
      return parseResult.dsl;
    }

    return null;
  } catch (error) {
    console.error('加载失败:', error);
    return null;
  }
}

// 保存用户答案
async function saveUserAnswers(quizId: string, answers: Record<string, any>) {
  try {
    await AsyncStorage.setItem(`answers_${quizId}`, JSON.stringify(answers));
  } catch (error) {
    console.error('保存答案失败:', error);
  }
}

// 同步到服务器
async function syncToServer(quizId: string) {
  const quiz = await loadLocalQuiz(quizId);
  const answers = await AsyncStorage.getItem(`answers_${quizId}`);

  if (quiz && answers) {
    // 序列化并发送到服务器
    const serializeResult = serializeQuizDSL(quiz);
    if (serializeResult.success) {
      await fetch('https://api.example.com/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          quiz: serializeResult.json,
          answers: JSON.parse(answers),
        }),
      });
    }
  }
}
```

## 案例 4: 数据分析平台

### 场景描述

一个数据分析平台需要批量处理测验数据，进行统计分析。

### 实现方案

```typescript
import { validateQuizDSL, parseQuizDSL } from '@quizerjs/dsl';
import type { QuizDSL } from '@quizerjs/dsl';

// 批量验证测验数据
async function validateBatchQuizzes(quizFiles: string[]) {
  const results = [];

  for (const file of quizFiles) {
    const content = await readFile(file, 'utf-8');
    const parseResult = parseQuizDSL(content);

    if (parseResult.success && parseResult.dsl) {
      const validationResult = validateQuizDSL(parseResult.dsl);
      results.push({
        file,
        valid: validationResult.valid,
        errors: validationResult.errors,
        quiz: parseResult.dsl,
      });
    } else {
      results.push({
        file,
        valid: false,
        errors: [{ message: '解析失败' }],
      });
    }
  }

  return results;
}

// 统计分析
function analyzeQuizzes(quizzes: QuizDSL[]) {
  const stats = {
    totalQuizzes: quizzes.length,
    totalQuestions: 0,
    questionTypeDistribution: {
      single_choice: 0,
      multiple_choice: 0,
      text_input: 0,
      true_false: 0,
    },
    averageQuestionsPerQuiz: 0,
    averagePointsPerQuiz: 0,
  };

  quizzes.forEach(quiz => {
    stats.totalQuestions += quiz.quiz.questions.length;

    quiz.quiz.questions.forEach(question => {
      stats.questionTypeDistribution[question.type]++;
    });
  });

  stats.averageQuestionsPerQuiz = stats.totalQuestions / stats.totalQuizzes;

  return stats;
}

// 导出为 CSV
function exportToCSV(quizzes: QuizDSL[]) {
  const rows = [['Quiz ID', 'Title', 'Questions', 'Points']];

  quizzes.forEach(quiz => {
    const totalPoints = quiz.quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

    rows.push([
      quiz.quiz.id,
      quiz.quiz.title,
      quiz.quiz.questions.length.toString(),
      totalPoints.toString(),
    ]);
  });

  return rows.map(row => row.join(',')).join('\n');
}
```

## 下一步

- [快速开始](/guide/getting-started.md) - 开始使用 quizerjs
- [DSL 规范](/dsl/) - 了解 DSL 格式
- [API 参考](/api/) - 查看完整 API
