import React, { useRef, useEffect } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import EditorPanel from '../components/EditorPanel';
import DataPanel from '../components/DataPanel';
import { useQuiz } from '../context/QuizContext';
import { type QuizEditorRef } from '@quizerjs/react';
import type { QuizDSL } from '@quizerjs/dsl';

export default function EditorPage() {
  const { currentDSL, initialDSL, updatePreviews, dslPreview, blockDataPreview, selectedSampleId } =
    useQuiz();
  const editorRef = useRef<QuizEditorRef | null>(null);

  // Sync editor with initialDSL when it changes (e.g. sample switch)
  useEffect(() => {
    if (editorRef.current && initialDSL) {
      editorRef.current.load(initialDSL).catch(err => console.error(err));
    }
  }, [selectedSampleId]);

  const handleChange = React.useCallback(
    async (dsl: QuizDSL) => {
      let blockData = null;
      if (editorRef.current) {
        const editorInstance = editorRef.current.getEditorInstance();
        if (editorInstance) {
          try {
            blockData = await editorInstance.save();
          } catch (error) {
            console.error('Failed to save block data:', error);
          }
        }
      }
      updatePreviews(dsl, blockData);
    },
    [updatePreviews]
  );

  const handleSave = handleChange; // Reuse logic for now

  return (
    <Group orientation="horizontal" className="resizable-panels-container">
      {/* Left: Editor */}
      <Panel defaultSize={50} minSize={20} className="panel-container editor-panel-container">
        <EditorPanel
          editorRef={editorRef}
          initialDSL={initialDSL}
          onChange={handleChange}
          onSave={handleSave}
        />
      </Panel>

      <Separator className="resize-handle" />

      {/* Right: Data Visualization */}
      <Panel defaultSize={50} minSize={20} className="panel-container">
        <Group orientation="vertical">
          {/* Top Right: Block Data */}
          <Panel defaultSize={50} minSize={20} className="panel-container">
            <DataPanel title="Block Data" code={blockDataPreview} />
          </Panel>

          <Separator className="resize-handle-vertical" />

          {/* Bottom Right: DSL Preview */}
          <Panel defaultSize={50} minSize={20} className="panel-container">
            <DataPanel title="DSL Preview" code={dslPreview} />
          </Panel>
        </Group>
      </Panel>
    </Group>
  );
}
