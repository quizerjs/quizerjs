import React from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import PlayerPanel from '../components/PlayerPanel';
import { StoreDebugger } from '../components/StoreDebugger';
import { useQuiz } from '../context/QuizContext';

export default function PlayerPage() {
  const { dslPreview } = useQuiz();

  let quizId = 'quiz-demo';
  try {
    if (dslPreview) {
      const parsed = JSON.parse(dslPreview);
      if (parsed?.quiz?.id) {
        quizId = parsed.quiz.id;
      }
    }
  } catch (e) {
    // ignore parse error
  }

  return (
    <div className="h-full w-full" style={{ height: '100%', width: '100%' }}>
      <Group orientation="vertical">
        <Panel defaultSize={70} minSize={30}>
          <PlayerPanel dslPreview={dslPreview} />
        </Panel>

        <Separator className="resize-handle-vertical" />

        <Panel defaultSize={30} minSize={10}>
          <StoreDebugger quizId={quizId} />
        </Panel>
      </Group>
    </div>
  );
}
