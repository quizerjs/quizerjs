<script lang="ts">
  import { useQuiz } from './stores/useQuiz';
  import type { QuizComponentProps } from './types';

  export let dsl: QuizComponentProps['dsl'];
  export let disabled: QuizComponentProps['disabled'] = false;
  export let showResults: QuizComponentProps['showResults'] = true;
  export let onSubmit: QuizComponentProps['onSubmit'];
  export let onAnswerChange: QuizComponentProps['onAnswerChange'];

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

  function handleAnswerChange(questionId: string, answer: any) {
    setAnswer(questionId, answer);
    if (onAnswerChange) {
      onAnswerChange(questionId, answer);
    }
  }

  function handleMultipleChoice(questionId: string, optionId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const current = $answers[questionId] || [];

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

  // 收集所有问题（从 sections 或 questions）
  $: allQuestions = (() => {
    const questions: typeof dsl.quiz.questions = [];
    if (dsl.quiz.sections) {
      dsl.quiz.sections.forEach(section => {
        if (section.questions) {
          questions.push(...section.questions);
        }
      });
    } else if (dsl.quiz.questions) {
      questions.push(...dsl.quiz.questions);
    }
    return questions;
  })();
</script>

<div class="quiz-component">
  <div class="quiz-header">
    <h2>{dsl.quiz.title}</h2>
    {#if dsl.quiz.description}
      <p class="quiz-description">{dsl.quiz.description}</p>
    {/if}
  </div>

  <div class="questions">
    {#each allQuestions as question, index}
      <div class="question-item">
        <h3>
          {index + 1}. {question.text}
          {#if question.points}
            <span class="points">({question.points} 分)</span>
          {/if}
        </h3>

        <!-- 单选题 -->
        {#if question.type === 'single_choice'}
          <div class="options">
            {#each question.options as option}
              <label
                class="option-label {disabled || $submitted ? 'disabled' : ''}"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={$answers[question.id] === option.id}
                  on:change={() => handleAnswerChange(question.id, option.id)}
                  disabled={disabled || $submitted}
                />
                <span class="option-text">{option.text}</span>
                {#if $submitted && option.isCorrect}
                  <span class="correct-mark">✅</span>
                {/if}
              </label>
            {/each}
          </div>
        {/if}

        <!-- 多选题 -->
        {#if question.type === 'multiple_choice'}
          <div class="options">
            {#each question.options as option}
              <label
                class="option-label {disabled || $submitted ? 'disabled' : ''}"
              >
                <input
                  type="checkbox"
                  checked={($answers[question.id] || []).includes(option.id)}
                  on:change={(e) => handleMultipleChoice(question.id, option.id, e)}
                  disabled={disabled || $submitted}
                />
                <span class="option-text">{option.text}</span>
                {#if $submitted && option.isCorrect}
                  <span class="correct-mark">✅</span>
                {/if}
              </label>
            {/each}
          </div>
        {/if}

        <!-- 文本输入 -->
        {#if question.type === 'text_input'}
          <div>
            <input
              type="text"
              value={$answers[question.id] || ''}
              on:input={(e) => handleAnswerChange(question.id, e.currentTarget.value)}
              disabled={disabled || $submitted}
              class="text-input"
              placeholder="请输入答案"
            />
          </div>
        {/if}

        <!-- 判断题 -->
        {#if question.type === 'true_false'}
          <div class="options">
            <label class="option-label {disabled || $submitted ? 'disabled' : ''}">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={$answers[question.id] === true}
                on:change={() => handleAnswerChange(question.id, true)}
                disabled={disabled || $submitted}
              />
              <span class="option-text">正确</span>
            </label>
            <label class="option-label {disabled || $submitted ? 'disabled' : ''}">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={$answers[question.id] === false}
                on:change={() => handleAnswerChange(question.id, false)}
                disabled={disabled || $submitted}
              />
              <span class="option-text">错误</span>
            </label>
          </div>
        {/if}

        {#if $submitted && question.explanation}
          <div class="explanation">
            <strong>解析：</strong>
            {question.explanation}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="quiz-actions">
    {#if !$submitted}
      <button
        on:click={handleSubmit}
        disabled={disabled}
        class="submit-button"
      >
        提交答案
      </button>
    {:else if showResults}
      <div class="results">
        <h3>您的得分: {$score}%</h3>
        {#if dsl.quiz.settings?.passingScore && $score !== null}
          <p>
            {$score >= dsl.quiz.settings.passingScore ? '✅ 通过' : '❌ 未通过'}
          </p>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
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
</style>

