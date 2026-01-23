import React, { useEffect, useState } from 'react';
import { getQuizStoreById, QuizStore } from '@quizerjs/core';
import JsonViewer from './JsonViewer';
import './StoreDebugger.css';

interface StoreDebuggerProps {
  quizId: string;
}

export const StoreDebugger: React.FC<StoreDebuggerProps> = ({ quizId }) => {
  const [storeState, setStoreState] = useState<any>(null);
  const [store, setStore] = useState<QuizStore | null>(null);

  useEffect(() => {
    // Poll for store existence or wait for registration
    const checkStore = () => {
      const s = getQuizStoreById(quizId);
      if (s) {
        setStore(s);
        setStoreState(s.getState());

        // Subscribe
        const unsubscribe = s.subscribe(() => {
          setStoreState(s.getState());
        });
        return unsubscribe;
      }
      return null;
    };

    let unsubscribe: (() => void) | null = null;
    const interval = setInterval(() => {
      if (!store) {
        unsubscribe = checkStore();
        if (unsubscribe) clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, [quizId]);

  if (!storeState) {
    return <div className="store-debugger loading">Waiting for QuizStore (ID: {quizId})...</div>;
  }

  const { isSubmitting, isSubmitted, progress, answers, resultDSL } = storeState;

  return (
    <div className="store-debugger">
      <div className="debugger-header">
        <h3>QuizStore Debugger</h3>
        <div className="debugger-badges">
          <span className={`badge ${isSubmitting ? 'warn' : 'neutral'}`}>
            Submitting: {String(isSubmitting)}
          </span>
          <span className={`badge ${isSubmitted ? 'success' : 'neutral'}`}>
            Submitted: {String(isSubmitted)}
          </span>
          <span className="badge info">
            Progress: {progress.answered} / {progress.total}
          </span>
        </div>
      </div>

      <div className="debugger-content">
        <div className="debugger-section">
          <h4>Answers</h4>
          <JsonViewer code={JSON.stringify(answers)} />
        </div>
        <div className="debugger-section">
          <h4>State Dump</h4>
          <JsonViewer
            code={JSON.stringify({
              isSubmitting,
              isSubmitted,
              progress,
              resultDSL,
              startTime: new Date(storeState.startTime).toLocaleTimeString(),
            })}
          />
        </div>
      </div>
    </div>
  );
};
