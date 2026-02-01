<script lang="ts">
  /* eslint-disable svelte/infinite-reactive-loop */
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import {
    QuizPlayer,
    type QuizPlayerOptions,
    type ResultDSL,
    type AnswerValue,
  } from '@quizerjs/quizerjs';
  import type { QuizDSL } from '@quizerjs/dsl';

  // Props
  export let quizSource: QuizDSL;
  export let slideSource: string | undefined = undefined;
  export let initialAnswers: Record<string, AnswerValue> | undefined = undefined;
  export let resultSource: ResultDSL | undefined = undefined;
  export let readOnly: boolean = false;
  export let showResults: boolean = true;
  export let slideOptions: QuizPlayerOptions['slideOptions'] = undefined;

  // Exports for bind:this
  export const start = () => player?.start();
  export const submit = () => player?.submit() || null;
  export const getAnswers = () => player?.getAnswers() || {};
  export const setAnswer = (questionId: string, answer: AnswerValue) =>
    player?.setAnswer(questionId, answer);
  export const getCurrentScore = () => player?.getCurrentScore() || 0;
  export const isComplete = () => player?.isComplete() || false;
  export const reset = () => player?.reset();
  export const getResultSource = () => player?.getResultSource() || null;
  export const getRunner = () => {
    try {
      return player?.getRunner() || null;
    } catch {
      return null;
    }
  };

  // Internal state
  let playerContainer: HTMLElement;
  let player: QuizPlayer | null = null;
  let error: string | null = null;
  let isInitializing = false;
  let lastQuizId: string | null = null;

  const dispatch = createEventDispatcher<{
    submit: ResultDSL;
    answerChange: { questionId: string; answer: AnswerValue };
    start: void;
    complete: void;
    reset: void;
    error: Error;
  }>();

  // Derived state to check validity
  $: hasValidQuiz = !!(
    quizSource &&
    quizSource.quiz &&
    quizSource.quiz.id &&
    quizSource.quiz.title
  );

  // Initialization logic
  const initPlayer = async () => {
    if (!playerContainer || !hasValidQuiz) return;

    if (isInitializing) {
      console.log('⏸️ 播放器正在初始化，跳过重复调用');
      return;
    }

    const currentQuizId = quizSource?.quiz?.id || null;
    if (currentQuizId === lastQuizId && player) {
      console.log('⏸️ Quiz ID 未变化，跳过重新初始化');
      return;
    }

    try {
      isInitializing = true;
      error = null;

      if (player) {
        await player.destroy();
        player = null;
      }

      const options: QuizPlayerOptions = {
        container: playerContainer,
        quizSource,
        slideSource,
        initialAnswers,
        resultSource,
        readOnly,

        showResults,
        slideOptions,
        onSubmit: (result: ResultDSL) => dispatch('submit', result),
        onAnswerChange: (questionId: string, answer: AnswerValue) =>
          dispatch('answerChange', { questionId, answer }),
        onStart: () => dispatch('start'),
        onComplete: () => dispatch('complete'),
        onReset: () => dispatch('reset'),
      } as unknown as QuizPlayerOptions;

      player = new QuizPlayer(options);
      await player.init();
      player.start();
      lastQuizId = currentQuizId; // eslint-disable-line svelte/infinite-reactive-loop
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      error = errorMessage;
      dispatch('error', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      isInitializing = false;
    }
  };

  const retry = () => {
    if (player) {
      player.destroy();
      player = null;
    }
    initPlayer();
  };

  // Reactivity
  $: if (hasValidQuiz && playerContainer) {
    // Svelte reactive statements run after mount usually, but let's be safe
    // Use setTimeout to allow render cycle to complete if needed, or rely on internal locks
    initPlayer(); // eslint-disable-line svelte/infinite-reactive-loop
  } else if (!hasValidQuiz && player) {
    player.destroy();
    player = null;
    lastQuizId = null;
  }

  onMount(() => {
    if (hasValidQuiz) {
      initPlayer();
    }
  });

  onDestroy(() => {
    if (player) {
      player.destroy();
      player = null;
    }
  });
</script>

<div class="quiz-player-wrapper">
  {#if error}
    <div class="quiz-player-error">
      <div class="error-content">
        <strong>加载失败</strong>
        <p>{error}</p>
        <button on:click={retry} class="retry-button"> 重试 </button>
      </div>
    </div>
  {:else if !hasValidQuiz}
    <div class="quiz-player-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon-wrapper">
          <svg
            class="placeholder-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 2v4M12 18v4M2 12h4M18 12h4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h3 class="placeholder-title">等待测验数据</h3>
        <p class="placeholder-description">请提供有效的 Quiz 数据以开始测验</p>
        <div class="placeholder-features">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span class="feature-text">支持多种题型</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span class="feature-text">实时答题反馈</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span class="feature-text">结果统计分析</span>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div bind:this={playerContainer} class="quiz-player" />
  {/if}
</div>

<style>
  .quiz-player-wrapper {
    height: 100%;
    width: 100%;
    position: relative;
    color: var(--quiz-text-primary);
    background: var(--quiz-bg-primary);
  }

  .quiz-player {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .quiz-player-error {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: var(--quiz-bg-secondary, #fafafa);
    border: 1px solid var(--quiz-error-color, #ff4d4f);
    border-radius: var(--quiz-radius-lg, 8px);
    position: relative;
    overflow: hidden;
  }

  /* 错误背景装饰 */
  .quiz-player-error::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--quiz-error-color, #ff4d4f);
    opacity: 0.05;
    z-index: 0;
  }

  .error-content {
    text-align: center;
    color: var(--quiz-text-primary, #333333);
    max-width: 500px;
    position: relative;
    z-index: 1;
  }

  .error-content strong {
    display: block;
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--quiz-error-color, #ff4d4f);
  }

  .error-content p {
    margin: 1rem 0;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--quiz-text-secondary, #666666);
  }

  .retry-button {
    margin-top: 1.25rem;
    padding: 0.625rem 1.5rem;
    background-color: var(--quiz-error-color, #ff4d4f);
    color: var(--quiz-text-on-accent, #ffffff);
    border: none;
    border-radius: var(--quiz-radius-md, 6px);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: var(--quiz-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .retry-button:hover {
    background-color: var(--quiz-error-color, #ff4d4f);
    opacity: 0.85;
    transform: translateY(-1px);
    box-shadow: var(--quiz-shadow-md, 0 2px 4px rgba(0, 0, 0, 0.15));
  }

  .retry-button:active {
    transform: translateY(0);
    box-shadow: var(--quiz-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .retry-button:focus {
    outline: 2px solid var(--quiz-accent-color, #4a90e2);
    outline-offset: 2px;
  }

  .quiz-player-placeholder {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    background: var(--quiz-bg-secondary, #fafafa);
    border-radius: var(--quiz-radius-lg, 8px);
    position: relative;
    overflow: hidden;
  }

  /* 添加微妙的背景装饰 */
  .quiz-player-placeholder::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, var(--quiz-accent-color, #4a90e2) 0%, transparent 70%);
    opacity: 0.03;
    animation: pulse 8s ease-in-out infinite;
    z-index: 0;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.03;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.05;
    }
  }

  .placeholder-content {
    text-align: center;
    color: var(--quiz-text-secondary, #666666);
    max-width: 480px;
    position: relative;
    z-index: 1;
  }

  .placeholder-icon-wrapper {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
  }

  .placeholder-icon {
    width: 80px;
    height: 80px;
    color: var(--quiz-accent-color, #4a90e2);
    opacity: 0.6;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .placeholder-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--quiz-text-primary, #333333);
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  .placeholder-description {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--quiz-text-secondary, #666666);
    margin-bottom: 2rem;
  }

  .placeholder-features {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--quiz-border-color, #e0e0e0);
  }

  .feature-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: var(--quiz-text-secondary, #666666);
  }

  .feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--quiz-accent-color, #4a90e2);
    color: var(--quiz-text-on-accent, #ffffff);
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
    box-shadow: var(--quiz-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .feature-text {
    flex: 1;
    text-align: left;
  }
</style>
