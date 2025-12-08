<template>
  <div class="quiz-demo">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="quiz" class="quiz-container">
      <h2>{{ quiz.quiz.title }}</h2>
      <p v-if="quiz.quiz.description" class="description">
        {{ quiz.quiz.description }}
      </p>

      <div class="questions">
        <div v-for="(question, index) in quiz.quiz.questions" :key="question.id" class="question">
          <h3>
            {{ index + 1 }}. {{ question.text }}
            <span v-if="question.points" class="points"> ({{ question.points }} 分) </span>
          </h3>

          <!-- 单选题 -->
          <div v-if="question.type === 'single_choice'" class="options">
            <label v-for="option in question.options" :key="option.id" class="option">
              <input
                type="radio"
                :name="question.id"
                :value="option.id"
                :checked="answers[question.id] === option.id"
                @change="handleAnswer(question.id, option.id)"
                :disabled="submitted"
              />
              {{ option.text }}
              <span v-if="submitted && option.isCorrect" class="correct-mark"> ✅ </span>
            </label>
          </div>

          <!-- 多选题 -->
          <div v-if="question.type === 'multiple_choice'" class="options">
            <label v-for="option in question.options" :key="option.id" class="option">
              <input
                type="checkbox"
                :checked="(answers[question.id] || []).includes(option.id)"
                @change="handleMultipleChoice(question.id, option.id, $event)"
                :disabled="submitted"
              />
              {{ option.text }}
              <span v-if="submitted && option.isCorrect" class="correct-mark"> ✅ </span>
            </label>
          </div>

          <!-- 文本输入 -->
          <div v-if="question.type === 'text_input'">
            <input
              type="text"
              :value="answers[question.id] || ''"
              @input="handleAnswer(question.id, $event.target.value)"
              :disabled="submitted"
              class="text-input"
              placeholder="请输入答案"
            />
          </div>

          <!-- 判断题 -->
          <div v-if="question.type === 'true_false'" class="options">
            <label class="option">
              <input
                type="radio"
                :name="question.id"
                :value="true"
                :checked="answers[question.id] === true"
                @change="handleAnswer(question.id, true)"
                :disabled="submitted"
              />
              正确
            </label>
            <label class="option">
              <input
                type="radio"
                :name="question.id"
                :value="false"
                :checked="answers[question.id] === false"
                @change="handleAnswer(question.id, false)"
                :disabled="submitted"
              />
              错误
            </label>
          </div>

          <div v-if="submitted && question.explanation" class="explanation">
            <strong>解析：</strong>{{ question.explanation }}
          </div>
        </div>
      </div>

      <div class="actions">
        <button v-if="!submitted" @click="handleSubmit" class="submit-btn">提交答案</button>
        <div v-else class="results">
          <h3>您的得分: {{ score }}%</h3>
          <p v-if="quiz.quiz.settings?.passingScore">
            {{ score >= quiz.quiz.settings.passingScore ? '✅ 通过' : '❌ 未通过' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { QuizDSL, Question } from '@quizerjs/dsl';

// 答案类型：单选题和文本输入为 string，多选题为 string[]，判断题为 boolean
type AnswerValue = string | string[] | boolean;

const loading = ref(true);
const error = ref<string | null>(null);
const quiz = ref<QuizDSL | null>(null);
const answers = ref<Record<string, AnswerValue>>({});
const submitted = ref(false);
const score = ref<number | null>(null);

// 示例测验数据
const demoQuiz: QuizDSL = {
  version: '1.0.0',
  quiz: {
    id: 'demo-quiz',
    title: 'JavaScript 基础测验',
    description: '测试你对 JavaScript 基础知识的理解',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        text: '以下哪个是 JavaScript 的框架？',
        options: [
          { id: 'o1', text: 'React', isCorrect: true },
          { id: 'o2', text: 'Python', isCorrect: false },
          { id: 'o3', text: 'Java', isCorrect: false },
        ],
        points: 10,
        explanation: 'React 是一个用于构建用户界面的 JavaScript 库',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        text: '以下哪些是 JavaScript 的基本数据类型？（多选）',
        options: [
          { id: 'o1', text: 'String', isCorrect: true },
          { id: 'o2', text: 'Number', isCorrect: true },
          { id: 'o3', text: 'Boolean', isCorrect: true },
          { id: 'o4', text: 'Array', isCorrect: false },
        ],
        points: 15,
        explanation: 'Array 是对象类型，不是基本数据类型',
      },
      {
        id: 'q3',
        type: 'text_input',
        text: 'ES6 中用于声明常量的关键字是什么？',
        correctAnswer: 'const',
        caseSensitive: false,
        points: 5,
        explanation: 'const 关键字用于声明常量',
      },
      {
        id: 'q4',
        type: 'true_false',
        text: 'JavaScript 是一种编译型语言',
        correctAnswer: false,
        points: 5,
        explanation: 'JavaScript 是一种解释型语言',
      },
    ],
  },
};

onMounted(() => {
  // 在实际使用中，这里会调用 validateQuizDSL
  // 为了演示，我们直接使用数据
  quiz.value = demoQuiz;
  loading.value = false;
});

function handleAnswer(questionId: string, answer: AnswerValue) {
  answers.value[questionId] = answer;
}

function handleMultipleChoice(questionId: string, optionId: string, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  const current = answers.value[questionId] || [];

  if (checked) {
    answers.value[questionId] = [...current, optionId];
  } else {
    answers.value[questionId] = current.filter((id: string) => id !== optionId);
  }
}

function isAnswerCorrect(question: Question, userAnswer: AnswerValue): boolean {
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

function handleSubmit() {
  if (!quiz.value) return;

  let totalScore = 0;
  let maxScore = 0;

  quiz.value.quiz.questions.forEach(question => {
    const points = question.points || 1;
    maxScore += points;

    const userAnswer = answers.value[question.id];
    if (isAnswerCorrect(question, userAnswer)) {
      totalScore += points;
    }
  });

  score.value = Math.round((totalScore / maxScore) * 100);
  submitted.value = true;
}
</script>

<style scoped>
.quiz-demo {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: var(--vp-c-red);
}

.quiz-container h2 {
  margin-top: 0;
  color: var(--vp-c-brand);
}

.description {
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}

.question {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.question:last-child {
  border-bottom: none;
}

.question h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.points {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
  font-weight: normal;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.option:hover {
  background-color: var(--vp-c-bg-soft);
}

.option input[type='radio'],
.option input[type='checkbox'] {
  cursor: pointer;
}

.text-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 1rem;
}

.correct-mark {
  color: var(--vp-c-green);
  margin-left: auto;
}

.explanation {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-size: 0.9rem;
}

.actions {
  margin-top: 2rem;
  text-align: center;
}

.submit-btn {
  padding: 0.75rem 2rem;
  background-color: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: var(--vp-c-brand-dark);
}

.results {
  padding: 1.5rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 4px;
}

.results h3 {
  margin-top: 0;
  color: var(--vp-c-brand);
}
</style>
