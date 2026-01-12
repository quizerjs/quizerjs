declare module 'vue-resizable-panels' {
  import { DefineComponent } from 'vue';

  export const Panel: DefineComponent<{
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    collapsible?: boolean;
    className?: string;
  }>;

  export const PanelGroup: DefineComponent<{
    direction?: 'horizontal' | 'vertical';
    className?: string;
  }>;

  export const PanelResizeHandle: DefineComponent<{
    className?: string;
  }>;

  export interface ImperativePanelHandle {
    collapse: () => void;
    expand: () => void;
    resize: (size: number) => void;
  }

  export interface PanelProps {
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    collapsible?: boolean;
  }

  export interface PanelGroupProps {
    direction?: 'horizontal' | 'vertical';
  }

  export interface PanelResizeHandleProps {
    // Empty for now
  }
}
