/**
 * QuizPlayer - React 组件，包装 QuizPlayer
 *
 * 遵循 RFC 0006: 播放器核心组件设计
 * - 包装器模式：只负责生命周期管理和状态同步
 * - 所有核心逻辑在 @quizerjs/quizerjs 的 QuizPlayer 类中
 * - 框架无关：核心功能不依赖 React
 *
 * @see {@link https://github.com/quizerjs/quizerjs/blob/main/docs/rfc/0006-player-core.md RFC 0006}
 */

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { QuizPlayer as QuizPlayerClass, type QuizPlayerOptions, type ResultDSL, type AnswerValue } from '@quizerjs/quizerjs';
import type { QuizDSL } from '@quizerjs/dsl';
import './QuizPlayer.css';

/**
 * QuizPlayer 组件的 Props
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
  /** 提交事件：当用户提交测验时触发，返回 Result DSL */
  onSubmit?: (result: ResultDSL) => void;
  /** 答案变更事件：当用户修改答案时触发 */
  onAnswerChange?: (questionId: string, answer: AnswerValue) => void;
  /** 错误事件：当播放器初始化或运行出错时触发 */
  onError?: (error: Error) => void;
}

/**
 * QuizPlayer 组件的 Ref 接口
 * 遵循 RFC 0006：暴露 QuizPlayer 类的所有公共方法
 */
export interface QuizPlayerRef {
  /** 提交测验，返回 Result DSL */
  submit: () => ResultDSL | null;
  /** 获取当前答案 */
  getAnswers: () => Record<string, AnswerValue>;
  /** 设置答案 */
  setAnswer: (questionId: string, answer: AnswerValue) => void;
  /** 获取当前分数（不提交） */
  getCurrentScore: () => number;
  /** 检查是否已回答所有问题 */
  isComplete: () => boolean;
  /** 重置答案 */
  reset: () => void;
  /** 获取 Result DSL（不提交），用于保存当前答题状态 */
  getResultDSL: () => ResultDSL | null;
  /** 获取 SlideRunner 实例（用于高级控制） */
  getRunner: () => unknown;
}

/**
 * QuizPlayer React 组件
 */
export const QuizPlayer = forwardRef<QuizPlayerRef, QuizPlayerProps>(
  (
    {
      quiz,
      slideDSL,
      initialAnswers,
      resultDSL,
      readOnly = false,
      showResults = true,
      swiperOptions,
      onSubmit,
      onAnswerChange,
      onError,
    },
    ref
  ) => {
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<QuizPlayerClass | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isInitializingRef = useRef(false);
    const lastQuizIdRef = useRef<string | null>(null);
    
    // 使用 ref 存储回调，避免 useEffect 重复执行
    const onSubmitRef = useRef(onSubmit);
    const onAnswerChangeRef = useRef(onAnswerChange);
    const onErrorRef = useRef(onError);

    // 更新回调 ref
    useEffect(() => {
      onSubmitRef.current = onSubmit;
      onAnswerChangeRef.current = onAnswerChange;
      onErrorRef.current = onError;
    }, [onSubmit, onAnswerChange, onError]);

    /**
     * 检查是否有有效的 quiz 数据
     * 用于决定是显示播放器还是默认视图
     */
    const hasValidQuiz = useMemo(() => {
      return !!(quiz && quiz.quiz && quiz.quiz.id && quiz.quiz.title);
    }, [quiz]);

    /**
     * 初始化播放器
     */
    const initPlayer = async (): Promise<void> => {
      if (!playerContainerRef.current || !hasValidQuiz) return;
      
      // 防止重复初始化
      if (isInitializingRef.current) {
        console.log('⏸️ 播放器正在初始化，跳过重复调用');
        return;
      }

      // 检查 quiz ID 是否变化
      const currentQuizId = quiz?.quiz?.id || null;
      if (currentQuizId === lastQuizIdRef.current && playerRef.current) {
        console.log('⏸️ Quiz ID 未变化，跳过重新初始化');
        return;
      }

      try {
        isInitializingRef.current = true;
        setError(null);
        
        // 如果已有播放器实例，先销毁
        if (playerRef.current) {
          await playerRef.current.destroy();
          playerRef.current = null;
        }
        
        const options: QuizPlayerOptions = {
          container: playerContainerRef.current,
          quizDSL: quiz,
          slideDSL,
          initialAnswers,
          resultDSL,
          readOnly,
          showResults,
          swiperOptions,
          onSubmit: (result: ResultDSL) => {
            if (onSubmitRef.current) {
              onSubmitRef.current(result);
            }
          },
          onAnswerChange: (questionId: string, answer: AnswerValue) => {
            if (onAnswerChangeRef.current) {
              onAnswerChangeRef.current(questionId, answer);
            }
          },
        };
        playerRef.current = new QuizPlayerClass(options);
        await playerRef.current.init();
        lastQuizIdRef.current = currentQuizId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        if (onErrorRef.current) {
          onErrorRef.current(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        isInitializingRef.current = false;
      }
    };

    /**
     * 重试初始化
     */
    const retry = (): void => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      initPlayer();
    };

    // 监听 quiz 变化，重新初始化播放器
    useEffect(() => {
      // 检查 quiz 是否有效
      const isValid = !!(quiz && quiz.quiz && quiz.quiz.id && quiz.quiz.title);
      
      // 如果 quiz 无效，清理播放器
      if (!isValid) {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
        lastQuizIdRef.current = null;
        return;
      }

      // 如果容器已准备好，初始化播放器
      if (playerContainerRef.current) {
        initPlayer();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quiz]);

    // 组件卸载时清理
    useEffect(() => {
      return () => {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      };
    }, []);

    // 暴露方法供父组件调用
    useImperativeHandle(ref, () => ({
      /** 提交测验，返回 Result DSL */
      submit: () => {
        if (!playerRef.current) return null;
        return playerRef.current.submit();
      },
      /** 获取当前答案 */
      getAnswers: () => {
        if (!playerRef.current) return {};
        return playerRef.current.getAnswers();
      },
      /** 设置答案 */
      setAnswer: (questionId: string, answer: AnswerValue) => {
        if (playerRef.current) {
          playerRef.current.setAnswer(questionId, answer);
        }
      },
      /** 获取当前分数（不提交） */
      getCurrentScore: () => {
        if (!playerRef.current) return 0;
        return playerRef.current.getCurrentScore();
      },
      /** 检查是否已回答所有问题 */
      isComplete: () => {
        if (!playerRef.current) return false;
        return playerRef.current.isComplete();
      },
      /** 重置答案 */
      reset: () => {
        if (playerRef.current) {
          playerRef.current.reset();
        }
      },
      /** 获取 Result DSL（不提交），用于保存当前答题状态 */
      getResultDSL: () => {
        if (!playerRef.current) return null;
        return playerRef.current.getResultDSL();
      },
      /** 获取 SlideRunner 实例（用于高级控制） */
      getRunner: () => {
        if (!playerRef.current) return null;
        try {
          return playerRef.current.getRunner();
        } catch {
          return null;
        }
      },
    }));

    return (
      <div className="quiz-player-wrapper">
        {/* 错误状态 */}
        {error && (
          <div className="quiz-player-error">
            <div className="error-content">
              <strong>加载失败</strong>
              <p>{error}</p>
              <button onClick={retry} className="retry-button">
                重试
              </button>
            </div>
          </div>
        )}
        {/* 默认视图：没有 quiz 数据时显示 */}
        {!hasValidQuiz && !error && (
          <div className="quiz-player-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon-wrapper">
                <svg
                  className="placeholder-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2v4M12 18v4M2 12h4M18 12h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="placeholder-title">等待测验数据</h3>
              <p className="placeholder-description">请提供有效的 Quiz 数据以开始测验</p>
              <div className="placeholder-features">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">支持多种题型</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">实时答题反馈</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">结果统计分析</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* 播放器容器：始终存在，使用条件渲染控制显示 */}
        {hasValidQuiz && !error && (
          <div ref={playerContainerRef} className="quiz-player" />
        )}
      </div>
    );
  }
);

QuizPlayer.displayName = 'QuizPlayer';
