#!/usr/bin/env node

/**
 * 构建 CLI 入口文件
 * 创建独立的 CLI 入口文件，包含 shebang
 */

import { readFileSync, writeFileSync, existsSync, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '../dist');
const cliEntryPath = join(distDir, 'cli.js');

// 创建简单的 CLI 入口文件内容
const cliEntryContent = `#!/usr/bin/env node

/**
 * CLI 入口文件
 * 自动生成，请勿手动编辑
 */

import { main } from './cli.js';

main().catch(error => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});
`;

// 写入 CLI 入口文件
writeFileSync(cliEntryPath, cliEntryContent, 'utf-8');

// 在 Unix 系统上设置执行权限
if (process.platform !== 'win32') {
  chmodSync(cliEntryPath, 0o755);
}

console.log('✅ CLI 入口文件已创建');
