/**
 * useQuiz - Quiz 组合式 API
 */

import { ref, computed, type Ref } from 'vue';
import type { QuizDSL, Question } from '@quizerjs/dsl';
import type { UseQuizOptions, UseQuizReturn } from '../types';

export function useQuiz(options: UseQuizOptions = {}): UseQuizReturn {
  const { dsl: initialDSL, autoValidate = true, onSubmit } = options;

  const dsl = ref<QuizDSL | null>(initialDSL || null);
  const answers = ref<Record<string, any>>({});
  const submitted = ref(false);
  const score = ref<number | null>(null);

  function loadDSL(newDSL: QuizDSL) {
    dsl.value = newDSL;
    reset();
  }

  function setAnswer(questionId: string, answer: any) {
    if (submitted.value) return;
    answers.value[questionId] = answer;
  }

  function isAnswerCorrect(question: Question, userAnswer: any): boolean {
    switch (question.type) {
      case 'single_choice':
        const option = question.options.find(opt => opt.id === userAnswer);
        return option?.isCorrect || false;

      case 'multiple_choice':
        const selectedOptions = question.options.filter(opt =>
          userAnswer?.includes(opt.id)
        );
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
    if (!dsl.value || submitted.value) return;

    let totalScore = 0;
    let maxScore = 0;

    dsl.value.quiz.questions.forEach(question => {
      const points = question.points || 1;
      maxScore += points;

      const userAnswer = answers.value[question.id];
      if (isAnswerCorrect(question, userAnswer)) {
        totalScore += points;
      }
    });

    const finalScore = Math.round((totalScore / maxScore) * 100);
    score.value = finalScore;
    submitted.value = true;

    if (onSubmit) {
      onSubmit(answers.value, finalScore);
    }
  }

  function reset() {
    answers.value = {};
    submitted.value = false;
    score.value = null;
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

