<template>
  <div class="quiz-player-wrapper">
    <!-- 错误状态 -->
    <div v-if="error" class="quiz-player-error">
      <div class="error-content">
        <strong>加载失败</strong>
        <p>{{ error }}</p>
        <button @click="retry" class="retry-button">重试</button>
      </div>
    </div>
    <!-- 默认视图：没有 quiz 数据时显示 -->
    <div v-show="!hasValidQuiz && !error" class="quiz-player-placeholder">
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
    <!-- 播放器容器：始终存在，使用 v-show 控制显示 -->
    <div ref="playerContainer" v-show="hasValidQuiz && !error" class="quiz-player"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { QuizPlayer } from '@quizerjs/quizerjs';
import type { QuizPlayerOptions, ResultDSL, AnswerValue } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';

/**
 * QuizPlayer Vue 组件
 *
 * 遵循 RFC 0006: 播放器核心组件设计
 * - 包装器模式：只负责生命周期管理和状态同步
 * - 所有核心逻辑在 @quizerjs/quizerjs 的 QuizPlayer 类中
 * - 框架无关：核心功能不依赖 Vue
 *
 * @see {@link https://github.com/quizerjs/quizerjs/blob/main/docs/rfc/0006-player-core.md RFC 0006}
 */
export interface QuizPlayerProps {
  /** Quiz 数据（必需） */
  quiz: QuizDSL;
  /** Slide DSL 源代码（可选，如果不提供则使用默认 Slide DSL） */
  slideDSL?: string;
  /** 初始答案（可选，用于恢复之前的答题状态） */
  initialAnswers?: Record<string, AnswerValue>;
  /** 从 Result DSL 恢复（可选，如果提供将从 Result DSL 恢复答题状态） */
  resultDSL?: ResultDSL;
  /** 只读模式（可选，默认 false，用于显示结果） */
  readOnly?: boolean;
  /** 显示结果（可选，默认 true） */
  showResults?: boolean;
  /** Swiper 配置选项（可选，传递给 @slidejs/runner-swiper 的配置） */
  swiperOptions?: QuizPlayerOptions['swiperOptions'];
}

/**
 * QuizPlayer 组件的事件
 * 遵循 RFC 0006 的事件设计
 */
export interface QuizPlayerEmits {
  /** 提交事件：当用户提交测验时触发，返回 Result DSL */
  (e: 'submit', result: ResultDSL): void;
  /** 答案变更事件：当用户修改答案时触发 */
  (e: 'answer-change', questionId: string, answer: AnswerValue): void;
  /** 错误事件：当播放器初始化或运行出错时触发 */
  (e: 'error', error: Error): void;
}

/**
 * Props 定义
 * quiz 是必需的，通过模板中的 v-if 确保只在有效时渲染
 */
const props = defineProps<QuizPlayerProps>();

const emit = defineEmits<QuizPlayerEmits>();

/**
 * 组件状态
 * 遵循 RFC 0002 的包装器模式：只负责生命周期管理和状态同步
 */
const playerContainer = ref<HTMLElement | null>(null);
const error = ref<string | null>(null);
let player: QuizPlayer | null = null;

/**
 * 检查是否有有效的 quiz 数据
 * 用于决定是显示播放器还是默认视图
 */
const hasValidQuiz = computed(() => {
  return !!(props.quiz && props.quiz.quiz && props.quiz.quiz.id && props.quiz.quiz.title);
});

/**
 * 初始化播放器
 */
const initPlayer = async (): Promise<void> => {
  if (!playerContainer.value || !hasValidQuiz.value) return;

  try {
    error.value = null;
    const options: QuizPlayerOptions = {
      container: playerContainer.value,
      quizDSL: props.quiz,
      slideDSL: props.slideDSL,
      initialAnswers: props.initialAnswers,
      resultDSL: props.resultDSL,
      readOnly: props.readOnly,
      showResults: props.showResults,
      swiperOptions: props.swiperOptions,
      onSubmit: (result: ResultDSL) => emit('submit', result),
      onAnswerChange: (questionId: string, answer: AnswerValue) =>
        emit('answer-change', questionId, answer),
    };
    player = new QuizPlayer(options);
    await player.init();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error.value = errorMessage;
    emit('error', err instanceof Error ? err : new Error(errorMessage));
  }
};

// 监听 quiz 变化，重新初始化播放器
watch(
  () => props.quiz,
  async () => {
    if (player) {
      await player.destroy();
      player = null;
    }
    // 确保容器元素已准备好
    if (hasValidQuiz.value && playerContainer.value) {
      await initPlayer();
    }
  }
);

// 组件挂载后，如果 quiz 有效则初始化
onMounted(() => {
  if (hasValidQuiz.value && playerContainer.value) {
    initPlayer();
  }
});

onBeforeUnmount(async () => {
  if (player) {
    await player.destroy();
    player = null;
  }
});

/**
 * 重试初始化
 */
const retry = (): void => {
  if (player) {
    player.destroy();
    player = null;
  }
  initPlayer();
};

/**
 * 提交测验
 */
const submit = (): ResultDSL | null => {
  if (!player) return null;
  return player.submit();
};

/**
 * 获取当前答案
 */
const getAnswers = (): Record<string, AnswerValue> => {
  if (!player) return {};
  return player.getAnswers();
};

/**
 * 设置答案
 */
const setAnswer = (questionId: string, answer: AnswerValue): void => {
  if (player) {
    player.setAnswer(questionId, answer);
  }
};

/**
 * 获取当前分数
 */
const getCurrentScore = (): number => {
  if (!player) return 0;
  return player.getCurrentScore();
};

/**
 * 检查是否已回答所有问题
 */
const isComplete = (): boolean => {
  if (!player) return false;
  return player.isComplete();
};

/**
 * 重置答案
 */
const reset = (): void => {
  if (player) {
    player.reset();
  }
};

/**
 * 获取 Result DSL（不提交）
 */
const getResultDSL = (): ResultDSL | null => {
  if (!player) return null;
  return player.getResultDSL();
};

/**
 * 暴露方法供父组件调用
 * 遵循 RFC 0006：暴露 QuizPlayer 类的所有公共方法
 * 这些方法直接代理到核心 QuizPlayer 实例
 */
const exposedMethods = {
  /** 提交测验，返回 Result DSL */
  submit,
  /** 获取当前答案 */
  getAnswers,
  /** 设置答案 */
  setAnswer,
  /** 获取当前分数（不提交） */
  getCurrentScore,
  /** 检查是否已回答所有问题 */
  isComplete,
  /** 重置答案 */
  reset,
  /** 获取 Result DSL（不提交），用于保存当前答题状态 */
  getResultDSL,
  /** 获取 SlideRunner 实例（用于高级控制） */
  getRunner: () => {
    if (!player) return null;
    try {
      return player.getRunner();
    } catch {
      return null;
    }
  },
} as {
  submit: () => ResultDSL | null;
  getAnswers: () => Record<string, AnswerValue>;
  setAnswer: (questionId: string, answer: AnswerValue) => void;
  getCurrentScore: () => number;
  isComplete: () => boolean;
  reset: () => void;
  getResultDSL: () => ResultDSL | null;
  getRunner: () => unknown;
};

defineExpose(exposedMethods);
</script>

<style scoped>
.quiz-player-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
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

/* 深色模式适配 - 使用主题变量自动适配 */
.theme-dark .quiz-player-placeholder::before,
[data-theme='dark'] .quiz-player-placeholder::before {
  opacity: 0.05;
}

.theme-dark .placeholder-icon,
[data-theme='dark'] .placeholder-icon {
  opacity: 0.7;
}

.theme-dark .placeholder-features,
[data-theme='dark'] .placeholder-features {
  border-top-color: var(--quiz-border-color);
}

/* 确保所有元素都使用主题变量，自动适配深色/浅色模式 */
.quiz-player-wrapper {
  color: var(--quiz-text-primary);
  background: var(--quiz-bg-primary);
}

.quiz-player-error {
  background: var(--quiz-bg-secondary);
  border-color: var(--quiz-error-color);
}

.error-content {
  color: var(--quiz-text-primary);
}

.error-content strong {
  color: var(--quiz-error-color);
}

.error-content p {
  color: var(--quiz-text-secondary);
}

.quiz-player-placeholder {
  background: var(--quiz-bg-secondary);
}

.placeholder-content {
  color: var(--quiz-text-secondary);
}

.placeholder-title {
  color: var(--quiz-text-primary);
}

.placeholder-description {
  color: var(--quiz-text-secondary);
}

.feature-item {
  color: var(--quiz-text-secondary);
}

.feature-icon {
  background: var(--quiz-accent-color);
  color: var(--quiz-text-on-accent);
}
</style>
