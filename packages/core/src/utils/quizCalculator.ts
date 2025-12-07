/**
 * 测验计算工具函数
 * 用于计算测验得分和结果
 */

import { QuizData, UserAnswer, QuizResult, Question } from '../types';

/**
 * 计算单个问题的得分
 * @param question - 问题数据
 * @param userAnswer - 用户答案
 * @returns 得分
 */
export function calculateQuestionScore(question: Question, userAnswer: UserAnswer): number {
  if (!question.correctAnswer || !userAnswer.answer) {
    return 0;
  }

  const isCorrect = checkAnswer(question, userAnswer.answer);
  return isCorrect ? question.points || 1 : 0;
}

/**
 * 检查答案是否正确
 * @param question - 问题数据
 * @param answer - 用户答案
 * @returns 是否正确
 */
export function checkAnswer(question: Question, answer: string | string[]): boolean {
  if (!question.correctAnswer) {
    return false;
  }

  // 处理多选题
  if (question.type === 'multiple_choice') {
    const correctAnswers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];
    const userAnswers = Array.isArray(answer) ? answer : [answer];

    if (correctAnswers.length !== userAnswers.length) {
      return false;
    }

    return correctAnswers.every((correct) => userAnswers.includes(correct));
  }

  // 处理单选题、判断题、文本输入题
  const correctAnswer = Array.isArray(question.correctAnswer)
    ? question.correctAnswer[0]
    : question.correctAnswer;
  const userAnswerStr = Array.isArray(answer) ? answer[0] : answer;

  // 文本输入题：支持大小写不敏感比较
  if (question.type === 'text_input') {
    return (
      userAnswerStr.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    );
  }

  // 其他题型：精确匹配
  return userAnswerStr === correctAnswer;
}

/**
 * 计算测验结果
 * @param quizData - 测验数据
 * @param userAnswers - 用户答案列表
 * @returns 测验结果
 */
export function calculateQuizResult(
  quizData: QuizData,
  userAnswers: UserAnswer[]
): QuizResult {
  let totalScore = 0;
  let userScore = 0;

  // 计算每个问题的得分
  const answersWithScore = userAnswers.map((userAnswer) => {
    const question = quizData.questions.find((q) => q.id === userAnswer.questionId);
    if (!question) {
      return { ...userAnswer, isCorrect: false };
    }

    const points = question.points || 1;
    totalScore += points;

    const isCorrect = checkAnswer(question, userAnswer.answer);
    if (isCorrect) {
      userScore += points;
    }

    return {
      ...userAnswer,
      isCorrect,
    };
  });

  // 计算百分比
  const percentage = totalScore > 0 ? (userScore / totalScore) * 100 : 0;

  return {
    quizId: quizData.id,
    answers: answersWithScore,
    score: userScore,
    totalScore,
    percentage,
    completedAt: new Date(),
  };
}

