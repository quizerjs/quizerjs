import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import prompts from 'prompts';
import { generateAntigravitySkill } from '../generators/antigravity';
import { generateCursorRules } from '../generators/cursor';

export async function generateCommand(
  cmdOptions: { cursor?: boolean; antigravity?: boolean } = {}
) {
  console.log(pc.cyan('🤖 QuizerJS AI Skill Generator'));

  // Check for flags
  const options = cmdOptions;
  let tools: string[] = [];

  if (options.cursor) tools.push('cursor');
  if (options.antigravity) tools.push('antigravity');

  if (tools.length === 0) {
    const response = await prompts([
      {
        type: 'multiselect',
        name: 'tools',
        message: 'Which AI tools do you use?',
        choices: [
          { title: 'Cursor', value: 'cursor', selected: true },
          { title: 'Antigravity / Claude', value: 'antigravity', selected: true },
        ],
        hint: '- Space to select. Return to submit',
      },
    ]);
    tools = response.tools || [];
  }

  if (tools.length === 0) {
    console.log(pc.yellow('No tools selected. Exiting.'));
    return;
  }

  const cwd = process.cwd();

  if (tools.includes('antigravity')) {
    await generateAntigravitySkill(cwd);
  }

  if (tools.includes('cursor')) {
    await generateCursorRules(cwd);
  }

  console.log(pc.green('\n✨ AI Skills generated successfully!'));
}
