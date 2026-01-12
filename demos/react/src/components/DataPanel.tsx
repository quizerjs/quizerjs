import React from 'react';
import JsonViewer from './JsonViewer';
import './DataPanel.css';

interface DataPanelProps {
  title: string;
  code: string;
}

/**
 * DataPanel 组件
 * 显示 Block Data 或 DSL Preview
 */
export default function DataPanel({ title, code }: DataPanelProps) {
  return (
    <div className="data-panel">
      <div className="panel-header">
        <span className="panel-title">{title}</span>
      </div>
      <div className="panel-content">
        <JsonViewer code={code} />
      </div>
    </div>
  );
}
