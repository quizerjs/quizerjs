import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';

export async function generateAntigravitySkill(cwd: string) {
  const skillDir = path.join(cwd, '.agent/skills/quizer-integration');
  await fs.ensureDir(skillDir);

  const targetFile = path.join(skillDir, 'SKILL.md');

  // AI Skill Content (English for better model performance)
  const content = `---
description: Guide for integrating and consuming QuizerJS in applications
---

# QuizerJS Integration Guide

Use this skill when the user asks to:
- Create a quiz page or component.
- Configure the Quiz Editor or Player.
- Fix localization issues in QuizerJS components.
- Understand the Quiz DSL structure.

## 1. Localization (L10n) Configuration

**CRITICAL**: QuizerJS components require explicit localization configuration to display correct text (e.g., "Submit", "Next").

### How to configure:

1.  **Import Presets**:
    \`\`\`typescript
    import { zhCN, enUS } from '@quizerjs/i18n';
    \`\`\`

2.  **Pass to Components**:
    \`\`\`tsx
    // React Example
    <QuizEditor localization={zhCN} ... />
    <QuizPlayer localization={zhCN} ... />
    \`\`\`

3.  **Dynamic Switching**:
    If your app supports multiple languages, maintain the \`localization\` object in state and pass the selected one.

## 2. Component Usage

### QuizEditor (React)

\`\`\`tsx
import { QuizEditor, type QuizEditorRef } from '@quizerjs/react';
import type { QuizDSL } from '@quizerjs/dsl';
import { zhCN } from '@quizerjs/i18n';

export function MyEditor() {
  const handleSave = async (dsl: QuizDSL) => {
    console.log('Saved:', dsl);
  };

  return (
    <QuizEditor
      initialDSL={myDSL}
      onSave={handleSave}
      localization={zhCN} // CRITICAL: Must pass this prop!
    />
  );
}
\`\`\`

### QuizPlayer (React)

\`\`\`tsx
import { QuizPlayer } from '@quizerjs/react';
import { zhCN } from '@quizerjs/i18n';

export function MyPlayer() {
  return (
    <QuizPlayer
      quizSource={myDSL}
      onSubmit={(result) => console.log('Result:', result)}
      localization={zhCN}
    />
  );
}
\`\`\`

## 3. Common Anti-Patterns

- ❌ **Hardcoding Strings**: Don't try to overwrite internal labels via CSS or DOM manipulation. Use the \`localization\` prop.
- ❌ **Missing Styles**: Ensure \`import '@quizerjs/react/dist/react.css'\` (or similar) is present.
`;

  await fs.writeFile(targetFile, content, 'utf-8');
  console.log(pc.blue(`  ✓ Created .agent/skills/quizer-integration/SKILL.md`));
}
