import React, { useState, useMemo, useEffect, useRef } from 'react';
import { QuizPlayer } from '@quizerjs/react';
import type { QuizDSL, ResultDSL, AnswerValue } from '@quizerjs/dsl';
import type { QuizLocalization } from '@quizerjs/core';
import './PlayerPanel.css';

interface PlayerPanelProps {
  dslPreview: string;
  localization?: QuizLocalization;
}

/**
 * PlayerPanel 组件
 * 显示 QuizPlayer
 */
export default function PlayerPanel({ dslPreview, localization }: PlayerPanelProps) {
  const [dslError, setDslError] = useState<string | null>(null);
  const [dslKey, setDslKey] = useState(0);

  // 从 dslPreview JSON 字符串解析为 QuizDSL
  const currentDSL = useMemo<QuizDSL | null>(() => {
    setDslError(null);

    if (!dslPreview || dslPreview.trim() === '') {
      setDslError('DSL 数据为空');
      return null;
    }

    try {
      const parsed = JSON.parse(dslPreview) as QuizDSL;

      // 验证 DSL 结构是否完整
      if (!parsed || typeof parsed !== 'object') {
        const errorMsg = 'DSL 不是有效对象';
        setDslError(errorMsg);
        console.error('❌ DSL 解析失败:', errorMsg, { parsed, raw: dslPreview });
        return null;
      }

      if (!parsed.quiz || typeof parsed.quiz !== 'object') {
        const errorMsg = 'DSL.quiz 属性缺失或无效';
        setDslError(errorMsg);
        console.error('❌ DSL 解析失败:', errorMsg, {
          hasQuiz: !!parsed.quiz,
          quizType: typeof parsed.quiz,
          parsed,
        });
        return null;
      }

      if (!parsed.quiz.id || typeof parsed.quiz.id !== 'string') {
        const errorMsg = `DSL.quiz.id 缺失或无效 (当前值: ${JSON.stringify(parsed.quiz.id)})`;
        setDslError(errorMsg);
        console.error('❌ DSL 解析失败:', errorMsg, {
          quizId: parsed.quiz.id,
          quizIdType: typeof parsed.quiz.id,
          quiz: parsed.quiz,
        });
        return null;
      }

      if (!parsed.quiz.title || typeof parsed.quiz.title !== 'string') {
        const errorMsg = `DSL.quiz.title 缺失或无效 (当前值: ${JSON.stringify(parsed.quiz.title)})`;
        setDslError(errorMsg);
        console.error('❌ DSL 解析失败:', errorMsg, {
          quizTitle: parsed.quiz.title,
          quizTitleType: typeof parsed.quiz.title,
          quiz: parsed.quiz,
        });
        return null;
      }

      // 验证成功
      console.log('✅ DSL 验证通过:', {
        id: parsed.quiz.id,
        title: parsed.quiz.title,
        hasQuestions: !!(parsed.quiz.questions || parsed.quiz.sections),
      });
      return parsed;
    } catch (error) {
      const errorMsg = `JSON 解析失败: ${error instanceof Error ? error.message : String(error)}`;
      setDslError(errorMsg);
      console.error('❌ DSL JSON 解析失败:', error, {
        previewLength: dslPreview.length,
        previewPreview: dslPreview.substring(0, 200) + '...',
      });
      return null;
    }
  }, [dslPreview]);

  // 验证 DSL 是否有效
  const isValidDSL = useMemo(() => {
    const dsl = currentDSL;
    if (!dsl) {
      console.log('🔍 isValidDSL: false (dsl is null)');
      return false;
    }
    // 确保有基本结构
    const valid = !!(dsl.quiz && dsl.quiz.id && dsl.quiz.title);
    console.log('🔍 isValidDSL 检查:', {
      valid,
      hasQuiz: !!dsl.quiz,
      hasId: !!dsl.quiz?.id,
      hasTitle: !!dsl.quiz?.title,
      quizId: dsl.quiz?.id,
      quizTitle: dsl.quiz?.title,
    });
    if (!valid && !dslError) {
      setDslError('DSL 结构不完整');
    }
    return valid;
  }, [currentDSL, dslError]);

  // 监听 dslPreview 变化，更新 key 强制重新渲染播放器
  const prevDslPreviewRef = useRef(dslPreview);
  useEffect(() => {
    if (prevDslPreviewRef.current !== dslPreview) {
      console.log('📝 DSL Preview 变化:', {
        length: dslPreview?.length || 0,
        preview: dslPreview?.substring(0, 100) || '',
      });
      if (isValidDSL && currentDSL) {
        console.log('🔄 更新播放器 key, DSL:', {
          id: currentDSL.quiz?.id,
          title: currentDSL.quiz?.title,
        });
        setDslKey(prev => prev + 1);
      }
      prevDslPreviewRef.current = dslPreview;
    }
  }, [dslPreview, isValidDSL, currentDSL]);

  // 处理播放器提交
  const handlePlayerSubmit = (result: ResultDSL) => {
    console.log('测验提交:', result);
  };

  // 处理答案变更
  const handleAnswerChange = (questionId: string, answer: AnswerValue) => {
    console.log('答案变更:', questionId, answer);
  };

  // 处理播放器错误
  const handlePlayerError = (error: Error) => {
    console.error('播放器错误:', error);
  };

  const handleStart = () => {
    console.log('🏁 测验开始 (onStart)');
  };

  const handleComplete = () => {
    console.log('✅ 测验完成 (onComplete)');
  };

  const handleReset = () => {
    console.log('🔄 测验重置 (onReset)');
  };

  return (
    <div className="player-panel">
      <div className="panel-header">
        <span className="panel-title">Player</span>
      </div>
      <div className="panel-content">
        {currentDSL && isValidDSL ? (
          <QuizPlayer
            key={dslKey}
            quizSource={currentDSL}
            showResults={true}
            onSubmit={handlePlayerSubmit}
            onAnswerChange={handleAnswerChange}
            onStart={handleStart}
            onComplete={handleComplete}
            onReset={handleReset}
            onError={handlePlayerError}
            localization={localization}
          />
        ) : (
          <div className="empty-state">
            {!dslPreview || dslPreview.trim() === '' ? (
              <div className="waiting-message">
                <p>等待 DSL 数据...</p>
              </div>
            ) : (
              <div className="error-message-container">
                <p className="error-title">❌ DSL 数据格式无效</p>
                {dslError && <p className="error-details">{dslError}</p>}
                <div className="debug-info">
                  <p className="debug-title">
                    <strong>调试信息:</strong>
                  </p>
                  <ul className="debug-list">
                    <li>currentDSL: {currentDSL ? '存在' : 'null'}</li>
                    <li>isValidDSL: {isValidDSL ? 'true' : 'false'}</li>
                    {currentDSL && (
                      <>
                        <li>quiz.id: {currentDSL.quiz?.id || '缺失'}</li>
                        <li>quiz.title: {currentDSL.quiz?.title || '缺失'}</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
