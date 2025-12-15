<script lang="ts">
  export let code: string = '';

  $: formattedCode = (() => {
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
  })();

  // 简单的语法高亮（使用正则表达式）
  function highlightJSON(json: string): string {
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
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
  }

  $: highlightedCode = formattedCode ? highlightJSON(formattedCode) : '';
</script>

<div class="json-viewer">
  {#if formattedCode}
    <pre class="json-viewer-highlight">
      <code class="json-viewer-code">{@html highlightedCode}</code>
    </pre>
  {:else}
    <div class="json-viewer-empty">// 暂无数据</div>
  {/if}
</div>

<style>
  @import './JsonViewer.css';
</style>

