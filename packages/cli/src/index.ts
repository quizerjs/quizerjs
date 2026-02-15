import { cac } from 'cac';
import pc from 'picocolors';
import { version } from '../package.json';
import { generateCommand } from './commands/generate';

const cli = cac('quizer');

cli
  .command('init', 'Initialize QuizerJS AI skills in your project')
  .alias('ai-skill')
  .option('--cursor', 'Generate Cursor rules')
  .option('--antigravity', 'Generate Antigravity/Claude skills')
  .action(options => {
    generateCommand(options);
  });

cli.help();
cli.version(version);

try {
  cli.parse();
} catch (error) {
  console.error(pc.red(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
