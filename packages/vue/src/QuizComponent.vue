<template>
  <div v-if="!dsl" class="quiz-loading">加载中...</div>
  <div v-else class="quiz-component">
    <div class="quiz-header">
      <h2>{{ dsl.quiz.title }}</h2>
      <p v-if="dsl.quiz.description" class="quiz-description">
        {{ dsl.quiz.description }}
      </p>
    </div>

    <div class="questions">
      <div v-for="(question, index) in dsl.quiz.questions" :key="question.id" class="question-item">
        <h3>
          {{ index + 1 }}. {{ question.text }}
          <span v-if="question.points" class="points">({{ question.points }} 分)</span>
        </h3>

        <!-- 单选题 -->
        <div v-if="question.type === 'single_choice'" class="options">
          <label
            v-for="option in question.options"
            :key="option.id"
            class="option-label"
            :class="{ disabled: disabled || submitted }"
          >
            <input
              type="radio"
              :name="question.id"
              :value="option.id"
              :checked="answers[question.id] === option.id"
              @change="handleAnswerChange(question.id, option.id)"
              :disabled="disabled || submitted"
            />
            <span class="option-text">{{ option.text }}</span>
            <span v-if="submitted && option.isCorrect" class="correct-mark">✅</span>
          </label>
        </div>

        <!-- 多选题 -->
        <div v-if="question.type === 'multiple_choice'" class="options">
          <label
            v-for="option in question.options"
            :key="option.id"
            class="option-label"
            :class="{ disabled: disabled || submitted }"
          >
            <input
              type="checkbox"
              :checked="(answers[question.id] || []).includes(option.id)"
              @change="handleMultipleChoice(question.id, option.id, $event)"
              :disabled="disabled || submitted"
            />
            <span class="option-text">{{ option.text }}</span>
            <span v-if="submitted && option.isCorrect" class="correct-mark">✅</span>
          </label>
        </div>

        <!-- 文本输入 -->
        <div v-if="question.type === 'text_input'">
          <input
            type="text"
            :value="answers[question.id] || ''"
            @input="handleAnswerChange(question.id, ($event.target as HTMLInputElement).value)"
            :disabled="disabled || submitted"
            class="text-input"
            placeholder="请输入答案"
          />
        </div>

        <!-- 判断题 -->
        <div v-if="question.type === 'true_false'" class="options">
          <label class="option-label" :class="{ disabled: disabled || submitted }">
            <input
              type="radio"
              :name="question.id"
              :value="true"
              :checked="answers[question.id] === true"
              @change="handleAnswerChange(question.id, true)"
              :disabled="disabled || submitted"
            />
            <span class="option-text">正确</span>
          </label>
          <label class="option-label" :class="{ disabled: disabled || submitted }">
            <input
              type="radio"
              :name="question.id"
              :value="false"
              :checked="answers[question.id] === false"
              @change="handleAnswerChange(question.id, false)"
              :disabled="disabled || submitted"
            />
            <span class="option-text">错误</span>
          </label>
        </div>

        <div v-if="submitted && question.explanation" class="explanation">
          <strong>解析：</strong>{{ question.explanation }}
        </div>
      </div>
    </div>

    <div class="quiz-actions">
      <button v-if="!submitted" @click="handleSubmit" :disabled="disabled" class="submit-button">
        提交答案
      </button>
      <div v-else-if="showResults" class="results">
        <h3>您的得分: {{ score }}%</h3>
        <p v-if="dsl.quiz.settings?.passingScore">
          {{ score! >= dsl.quiz.settings.passingScore ? '✅ 通过' : '❌ 未通过' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuiz } from './composables/useQuiz';
import type { QuizComponentProps, QuizComponentEmits } from './types';

const props = withDefaults(defineProps<QuizComponentProps>(), {
  disabled: false,
  showResults: true,
});

const emit = defineEmits<QuizComponentEmits>();

const {
  answers,
  submitted,
  score,
  setAnswer,
  submit: submitQuiz,
  isAnswerCorrect,
} = useQuiz({
  dsl: props.dsl,
  onSubmit: (answers, score) => {
    emit('submit', answers, score);
    if (props.onSubmit) {
      props.onSubmit(answers);
    }
  },
});

function handleAnswerChange(questionId: string, answer: any) {
  setAnswer(questionId, answer);
  emit('answer-change', questionId, answer);
  if (props.onAnswerChange) {
    props.onAnswerChange(questionId, answer);
  }
}

function handleMultipleChoice(questionId: string, optionId: string, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  const current = answers.value[questionId] || [];

  if (checked) {
    handleAnswerChange(questionId, [...current, optionId]);
  } else {
    handleAnswerChange(
      questionId,
      current.filter((id: string) => id !== optionId)
    );
  }
}

function handleSubmit() {
  submitQuiz();
}
</script>

<style scoped>
.quiz-component {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.quiz-header h2 {
  margin-top: 0;
  color: #2c3e50;
}

.quiz-description {
  color: #666;
  margin-bottom: 1.5rem;
}

.question-item {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.question-item:last-child {
  border-bottom: none;
}

.question-item h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.points {
  font-size: 0.9em;
  color: #666;
  font-weight: normal;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.option-label:hover:not(.disabled) {
  background-color: #f5f5f5;
}

.option-label.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.option-text {
  flex: 1;
}

.correct-mark {
  color: #4caf50;
  margin-left: auto;
}

.text-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.text-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.explanation {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 0.9rem;
}

.quiz-actions {
  margin-top: 2rem;
  text-align: center;
}

.submit-button {
  padding: 0.75rem 2rem;
  background-color: #3eaf7c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #2d8f5f;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.results {
  padding: 1.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.results h3 {
  margin-top: 0;
  color: #3eaf7c;
}

.quiz-loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
