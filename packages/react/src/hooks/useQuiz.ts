/**
 * useQuiz - Quiz React Hook
 */

import { useState, useCallback } from 'react';
import type { QuizDSL, Question } from '@quizerjs/dsl';
import type { UseQuizOptions, UseQuizReturn } from '../types';

export function useQuiz(options: UseQuizOptions = {}): UseQuizReturn {
  const { dsl: initialDSL, autoValidate = true, onSubmit } = options;

  const [dsl, setDSL] = useState<QuizDSL | null>(initialDSL || null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const loadDSL = useCallback((newDSL: QuizDSL) => {
    setDSL(newDSL);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  }, []);

  const setAnswer = useCallback(
    (questionId: string, answer: any) => {
      if (submitted) return;
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
    },
    [submitted]
  );

  const isAnswerCorrect = useCallback((question: Question, userAnswer: any): boolean => {
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
  }, []);

  const submit = useCallback(() => {
    if (!dsl || submitted) return;

    let totalScore = 0;
    let maxScore = 0;

    // 收集所有问题（从 sections 或 questions）
    const allQuestions: Question[] = [];
    if (dsl.quiz.sections) {
      dsl.quiz.sections.forEach(section => {
        if (section.questions) {
          allQuestions.push(...section.questions);
        }
      });
    } else if (dsl.quiz.questions) {
      allQuestions.push(...dsl.quiz.questions);
    }

    allQuestions.forEach(question => {
      const points = question.points || 1;
      maxScore += points;

      const userAnswer = answers[question.id];
      if (isAnswerCorrect(question, userAnswer)) {
        totalScore += points;
      }
    });

    const finalScore = Math.round((totalScore / maxScore) * 100);
    setScore(finalScore);
    setSubmitted(true);

    if (onSubmit) {
      onSubmit(answers, finalScore);
    }
  }, [dsl, submitted, answers, isAnswerCorrect, onSubmit]);

  const reset = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  }, []);

  return {
    dsl,
    answers,
    submitted,
    score,
    loadDSL,
    setAnswer,
    submit,
    reset,
    isAnswerCorrect,
  };
}
