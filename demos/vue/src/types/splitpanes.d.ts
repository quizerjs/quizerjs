declare module 'splitpanes' {
  import { DefineComponent } from 'vue';

  export const Splitpanes: DefineComponent<{
    horizontal?: boolean;
    class?: string;
    pushOtherPanes?: boolean;
    dblClickSplitter?: boolean;
    firstSplitter?: boolean;
    max?: number;
    min?: number;
  }>;

  export const Pane: DefineComponent<{
    size?: number | string;
    minSize?: number | string;
    maxSize?: number | string;
  }>;
}
