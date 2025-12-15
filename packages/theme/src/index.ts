#!/usr/bin/env node
/**
 * @quizerjs/theme CLI
 * 将 QuizerJS 主题样式应用到指定的 CSS 文件
 * 基于 base.css 派生内容，然后应用主题特定的颜色变量
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// dist 目录路径
const DIST_DIR = resolve(__dirname, '../dist');
const BASE_CSS_PATH = resolve(DIST_DIR, 'base.css');

/**
 * 从 dist 目录扫描所有 CSS 文件，生成主题列表
 * 排除 base.css，因为它不是主题文件
 */
function discoverThemes() {
  if (!existsSync(DIST_DIR)) {
    return [];
  }

  const files = readdirSync(DIST_DIR);
  const themes = files
    .filter(file => {
      const name = basename(file, '.css');
      return extname(file) === '.css' && name !== 'base';
    })
    .map(file => basename(file, '.css'))
    .sort();

  return themes;
}

/**
 * 获取主题 CSS 文件路径
 */
function getThemePath(theme) {
  return resolve(DIST_DIR, `${theme}.css`);
}

// 动态发现可用的主题列表
const THEMES = discoverThemes();

/**
 * 显示使用说明
 */
function showUsage() {
  const themesList = THEMES.length > 0 ? THEMES.join(', ') : '(无可用主题，请先运行 pnpm build)';

  console.log(`
用法: quizerjs-theme [选项] <目标CSS文件>

选项:
  -t, --theme <主题名>    指定要应用的主题 (默认: light)
                         可选值: ${themesList}
  -o, --output <文件>    输出文件路径 (默认: 覆盖原文件)
  -h, --help             显示此帮助信息

说明:
  此工具会基于 base.css 应用主题样式。
  主题内容从 base.css 派生，然后应用主题特定的颜色变量。

示例:
  quizerjs-theme -t solarized-light styles.css
  quizerjs-theme --theme dark --output output.css styles.css
  quizerjs-theme styles.css
`);
}

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    theme: 'light',
    output: null,
    target: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      showUsage();
      process.exit(0);
    } else if (arg === '-t' || arg === '--theme') {
      options.theme = args[++i];
    } else if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
    } else if (!arg.startsWith('-')) {
      options.target = arg;
    }
  }

  return options;
}

/**
 * 验证主题名称
 */
function validateTheme(theme) {
  if (THEMES.length === 0) {
    console.error('错误: 未找到任何主题文件');
    console.error('提示: 请先运行 "pnpm build" 构建主题文件');
    process.exit(1);
  }

  if (!THEMES.includes(theme)) {
    console.error(`错误: 无效的主题名称 "${theme}"`);
    console.error(`可用的主题: ${THEMES.join(', ')}`);
    process.exit(1);
  }
}

/**
 * 读取文件内容
 */
function readFile(filePath) {
  if (!existsSync(filePath)) {
    console.error(`错误: 文件不存在 "${filePath}"`);
    process.exit(1);
  }

  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`错误: 无法读取文件 "${filePath}":`, error.message);
    process.exit(1);
  }
}

/**
 * 写入文件内容
 */
function writeFile(filePath, content) {
  try {
    writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(
      `无法写入文件 "${filePath}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 从主题 CSS 中提取主题特定的变量部分
 * 主题 CSS 包含 base.css 的内容 + 主题特定的颜色覆盖
 * 我们需要提取主题特定的部分（颜色变量覆盖）
 */
function extractThemeVariables(themeCss, baseCss) {
  // 由于 CSS 可能是压缩的（单行），我们需要更智能的提取方法
  // 策略：查找主题 CSS 中第一个 :root 块（这应该是主题特定的，因为 base 在前面）
  // 或者查找所有 :root 块，取第一个不匹配 base.css 的

  // 如果主题 CSS 和 base CSS 相同，说明没有主题特定的内容
  if (themeCss.trim() === baseCss.trim()) {
    return '';
  }

  // 尝试找到主题特定的 :root 块
  // 主题 CSS 结构：base 内容 + 主题特定的 :root 块
  // 由于 base 在前面，我们可以查找第二个 :root 块开始的内容

  const baseLength = baseCss.length;
  const themeAfterBase = themeCss.substring(baseLength);

  // 如果主题 CSS 比 base 长，说明有主题特定的内容
  if (themeAfterBase.trim().length > 0) {
    return themeAfterBase.trim();
  }

  // 回退：返回整个主题 CSS（向后兼容）
  return themeCss;
}

/**
 * 应用主题样式到 CSS 文件
 * 基于 base.css 派生内容，然后应用主题特定的变量
 */
function applyTheme(targetCss, baseCss, themeVars, themeName) {
  // 组合顺序：
  // 1. base.css（基础变量和通用样式）
  // 2. 主题特定的颜色变量覆盖
  // 3. 目标 CSS 文件内容
  if (themeVars.trim().length > 0) {
    return `${baseCss}\n\n/* Theme: ${themeName} */\n${themeVars}\n\n${targetCss}`;
  } else {
    return `${baseCss}\n\n${targetCss}`;
  }
}

/**
 * 主函数
 */
function main() {
  const options = parseArgs();

  // 检查目标文件是否提供
  if (!options.target) {
    console.error('错误: 请指定目标 CSS 文件');
    showUsage();
    process.exit(1);
  }

  // 验证主题
  validateTheme(options.theme);

  // 检查 base.css 是否存在
  if (!existsSync(BASE_CSS_PATH)) {
    console.error(`错误: base.css 文件不存在 "${BASE_CSS_PATH}"`);
    console.error('提示: 请先运行 "pnpm build" 构建 base.css 文件');
    process.exit(1);
  }

  // 获取主题 CSS 文件路径
  const themePath = getThemePath(options.theme);
  if (!existsSync(themePath)) {
    console.error(`错误: 主题文件不存在 "${themePath}"`);
    console.error('提示: 请先运行 "pnpm build" 构建主题文件');
    if (THEMES.length > 0) {
      console.error(`可用的主题: ${THEMES.join(', ')}`);
    }
    process.exit(1);
  }

  // 使用 ora 显示进度
  const spinner = ora('正在应用主题样式...').start();

  try {
    // 读取文件
    spinner.text = '正在读取文件...';
    const targetCss = readFile(resolve(process.cwd(), options.target));
    const baseCss = readFile(BASE_CSS_PATH);
    const themeCss = readFile(themePath);

    // 从主题 CSS 中提取主题特定的变量（排除 base.css 的内容）
    spinner.text = '正在提取主题变量...';
    const themeVars = extractThemeVariables(themeCss, baseCss);

    // 应用主题（基于 base.css + 主题变量 + 目标 CSS）
    spinner.text = '正在应用主题...';
    const outputCss = applyTheme(targetCss, baseCss, themeVars, options.theme);

    // 确定输出路径
    const outputPath = options.output
      ? resolve(process.cwd(), options.output)
      : resolve(process.cwd(), options.target);

    // 写入文件
    spinner.text = '正在写入文件...';
    writeFile(outputPath, outputCss);

    spinner.succeed(`主题 "${options.theme}" 已成功应用到 CSS 文件（基于 base.css）`);
  } catch (error) {
    spinner.fail(`应用主题失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// 运行主函数
main();
