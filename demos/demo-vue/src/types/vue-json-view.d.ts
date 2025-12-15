declare module '@matpool/vue-json-view' {
  import { DefineComponent } from 'vue';

  export default DefineComponent<{
    src: any;
    theme?: 'chrome' | 'dark';
    deep?: number;
    showDoubleQuotes?: boolean;
    showLength?: boolean;
    showLineNumber?: boolean;
    highlightMouseoverNode?: boolean;
    collapsedOnClickBrackets?: boolean;
  }>;
}

