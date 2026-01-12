import React, { useState, useMemo, useEffect, useRef } from 'react';
import { QuizPlayer } from '@quizerjs/react';
import type { QuizDSL, ResultDSL, AnswerValue } from '@quizerjs/dsl';
import JsonViewer from './JsonViewer';
import './PreviewPanel.css';

interface PreviewPanelProps {
  blockDataPreview: string;
  dslPreview: string;
}

/**
 * PreviewPanel 组件
 * 显示 Player、Block Data 和 DSL Preview
 */
export default function PreviewPanel({ blockDataPreview, dslPreview }: PreviewPanelProps) {
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

  return (
    <div className="preview-panel">
      {/* Player 区域 */}
      <div className="preview-section player-section">
        <div className="section-header">
          <span className="section-title">Player</span>
        </div>
        <div className="section-content">
          {currentDSL && isValidDSL ? (
            <QuizPlayer
              key={dslKey}
              quiz={currentDSL}
              showResults={true}
              onSubmit={handlePlayerSubmit}
              onAnswerChange={handleAnswerChange}
              onError={handlePlayerError}
            />
          ) : (
            <div className="player-placeholder">
              {!dslPreview || dslPreview.trim() === '' ? (
                <div className="placeholder-content">
                  <p>等待 DSL 数据...</p>
                </div>
              ) : (
                <div className="error-content">
                  <p className="error-title">❌ DSL 数据格式无效</p>
                  {dslError && <p className="error-detail">{dslError}</p>}
                  <div className="debug-info">
                    <p>
                      <strong>调试信息:</strong>
                    </p>
                    <ul>
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

      {/* Block Data 区域 */}
      <div className="preview-section">
        <div className="section-header">
          <span className="section-title">Block Data</span>
        </div>
        <div className="section-content">
          <JsonViewer code={blockDataPreview} />
        </div>
      </div>

      {/* DSL Preview 区域 */}
      <div className="preview-section">
        <div className="section-header">
          <span className="section-title">DSL Preview</span>
        </div>
        <div className="section-content">
          <JsonViewer code={dslPreview} />
        </div>
      </div>
    </div>
  );
}
