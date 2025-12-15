declare module 'simple-syntax-highlighter' {
  import { DefineComponent } from 'vue';

  const SshPre: DefineComponent<{
    language?: string;
    dark?: boolean;
  }>;

  export default SshPre;
}
