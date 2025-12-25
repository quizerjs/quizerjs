import React, { useMemo } from 'react';
import './JsonViewer.css';

interface JsonViewerProps {
  code: string;
}

export default function JsonViewer({ code }: JsonViewerProps) {
  const formattedCode = useMemo(() => {
    if (!code || code.trim() === '') {
      return '';
    }

    try {
      // 尝试解析并格式化 JSON
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // 如果不是有效的 JSON，返回原始代码
      return code;
    }
  }, [code]);

  // 简单的语法高亮（使用 CSS）
  const highlightJSON = (json: string): string => {
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        match => {
          let cls = 'json-number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'json-key';
            } else {
              cls = 'json-string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
          } else if (/null/.test(match)) {
            cls = 'json-null';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  };

  return (
    <div className="json-viewer">
      {formattedCode ? (
        <pre className="json-viewer-highlight">
          <code
            className="json-viewer-code"
            dangerouslySetInnerHTML={{ __html: highlightJSON(formattedCode) }}
          />
        </pre>
      ) : (
        <div className="json-viewer-empty">// 暂无数据</div>
      )}
    </div>
  );
}
