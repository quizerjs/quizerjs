declare module '*.wsx' {
  import { LightComponent } from '@wsxjs/wsx-core';
  export class EditableText extends LightComponent {
    getValue(): string;
    setValue(html: string): void;
  }
  export class QuizOption extends LightComponent {
    getData(): { id: string; text: string; isCorrect: boolean };
  }
  const component: unknown;
  export default component;
}
