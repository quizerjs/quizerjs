import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'editor/index': 'src/editor/index.ts',
    'player/index': 'src/player/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@quizerjs/dsl',
    '@quizerjs/core',
    'marked',
    '@editorjs/editorjs',
    '@editorjs/paragraph',
    '@editorjs/header',
  ],
});
