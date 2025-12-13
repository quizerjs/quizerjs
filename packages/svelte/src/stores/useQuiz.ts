/**
 * useQuiz - Quiz Svelte Store
 */

import { writable, get } from 'svelte/store';
import type { QuizDSL, Question } from '@quizerjs/dsl';
import type { UseQuizOptions, UseQuizReturn } from '../types';

export function useQuiz(options: UseQuizOptions = {}): UseQuizReturn {
  const { dsl: initialDSL, autoValidate = true, onSubmit } = options;

  const dsl = writable<QuizDSL | null>(initialDSL || null);
  const answers = writable<Record<string, any>>({});
  const submitted = writable(false);
  const score = writable<number | null>(null);

  function loadDSL(newDSL: QuizDSL) {
    dsl.set(newDSL);
    reset();
  }

  function setAnswer(questionId: string, answer: any) {
    if (get(submitted)) return;
    answers.update(current => ({ ...current, [questionId]: answer }));
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

  function submit() {
    const currentDSL = get(dsl);
    const currentSubmitted = get(submitted);
    if (!currentDSL || currentSubmitted) return;

    let totalScore = 0;
    let maxScore = 0;

    // 收集所有问题（从 sections 或 questions）
    const allQuestions: Question[] = [];
    if (currentDSL.quiz.sections) {
      currentDSL.quiz.sections.forEach(section => {
        if (section.questions) {
          allQuestions.push(...section.questions);
        }
      });
    } else if (currentDSL.quiz.questions) {
      allQuestions.push(...currentDSL.quiz.questions);
    }

    const currentAnswers = get(answers);
    allQuestions.forEach(question => {
      const points = question.points || 1;
      maxScore += points;

      const userAnswer = currentAnswers[question.id];
      if (isAnswerCorrect(question, userAnswer)) {
        totalScore += points;
      }
    });

    const finalScore = Math.round((totalScore / maxScore) * 100);
    score.set(finalScore);
    submitted.set(true);

    if (onSubmit) {
      onSubmit(currentAnswers, finalScore);
    }
  }

  function reset() {
    answers.set({});
    submitted.set(false);
    score.set(null);
  }

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
