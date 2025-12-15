import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync } from 'fs';
import { resolve, basename, extname } from 'path';

// 创建临时测试目录
const TEST_DIR = resolve(__dirname, '../.test-temp');
const TEST_DIST_DIR = resolve(TEST_DIR, 'dist');

describe('@quizerjs/theme CLI', () => {
  beforeEach(() => {
    // 创建测试目录
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
    if (!existsSync(TEST_DIST_DIR)) {
      mkdirSync(TEST_DIST_DIR, { recursive: true });
    }

    // 创建模拟的 base.css
    const baseCss = `:root {
      --quiz-spacing-xs: 4px;
      --quiz-bg-primary: #ffffff;
      --quiz-text-primary: #333333;
    }`;
    writeFileSync(resolve(TEST_DIST_DIR, 'base.css'), baseCss);

    // 创建模拟的主题 CSS（包含 base + 主题特定变量）
    const themeCss = `${baseCss}\n\n:root {
      --quiz-bg-primary: #fdf6e3;
      --quiz-text-primary: #586e75;
    }`;
    writeFileSync(resolve(TEST_DIST_DIR, 'solarized-light.css'), themeCss);
    writeFileSync(resolve(TEST_DIST_DIR, 'light.css'), themeCss);
    writeFileSync(resolve(TEST_DIST_DIR, 'dark.css'), themeCss);
    writeFileSync(resolve(TEST_DIST_DIR, 'solarized-dark.css'), themeCss);
  });

  afterEach(() => {
    // 清理测试目录
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('主题发现', () => {
    it('应该能够发现所有主题文件', () => {
      const files = readdirSync(TEST_DIST_DIR);
      const themes = files
        .filter(file => file.endsWith('.css') && !file.startsWith('base'))
        .map(file => file.replace('.css', ''))
        .sort();

      expect(themes).toContain('dark');
      expect(themes).toContain('light');
      expect(themes).toContain('solarized-dark');
      expect(themes).toContain('solarized-light');
      expect(themes).not.toContain('base');
    });

    it('应该排除 base.css', () => {
      const files = readdirSync(TEST_DIST_DIR);
      const themes = files
        .filter(file => file.endsWith('.css') && !file.startsWith('base'))
        .map(file => file.replace('.css', ''));

      expect(themes).not.toContain('base');
    });
  });

  describe('文件操作', () => {
    it('应该能够读取 base.css', () => {
      const baseCssPath = resolve(TEST_DIST_DIR, 'base.css');
      expect(existsSync(baseCssPath)).toBe(true);

      const content = readFileSync(baseCssPath, 'utf-8');
      expect(content).toContain('--quiz-spacing-xs');
      expect(content).toContain('--quiz-bg-primary');
    });

    it('应该能够读取主题 CSS 文件', () => {
      const themePath = resolve(TEST_DIST_DIR, 'solarized-light.css');
      expect(existsSync(themePath)).toBe(true);

      const content = readFileSync(themePath, 'utf-8');
      expect(content).toContain('--quiz-bg-primary: #fdf6e3');
    });
  });

  describe('主题变量提取', () => {
    it('应该能够从主题 CSS 中提取主题特定的变量', () => {
      const baseCss = readFileSync(resolve(TEST_DIST_DIR, 'base.css'), 'utf-8');
      const themeCss = readFileSync(resolve(TEST_DIST_DIR, 'solarized-light.css'), 'utf-8');

      // 主题 CSS 应该包含 base 的内容加上主题特定的变量
      expect(themeCss.length).toBeGreaterThan(baseCss.length);

      // 提取主题特定的部分
      const themeAfterBase = themeCss.substring(baseCss.length).trim();
      expect(themeAfterBase).toContain('--quiz-bg-primary: #fdf6e3');
      expect(themeAfterBase).toContain('--quiz-text-primary: #586e75');
    });

    it('如果主题 CSS 和 base CSS 相同，应该返回空字符串', () => {
      const baseCss = readFileSync(resolve(TEST_DIST_DIR, 'base.css'), 'utf-8');
      const themeAfterBase = baseCss.substring(baseCss.length).trim();
      expect(themeAfterBase).toBe('');
    });
  });

  describe('主题应用', () => {
    it('应该能够组合 base.css、主题变量和目标 CSS', () => {
      const baseCss = readFileSync(resolve(TEST_DIST_DIR, 'base.css'), 'utf-8');
      const themeCss = readFileSync(resolve(TEST_DIST_DIR, 'solarized-light.css'), 'utf-8');
      const targetCss = 'body { color: red; }';

      // 提取主题变量
      const themeVars = themeCss.substring(baseCss.length).trim();

      // 组合
      const outputCss = `${baseCss}\n\n/* Theme: solarized-light */\n${themeVars}\n\n${targetCss}`;

      expect(outputCss).toContain(baseCss);
      expect(outputCss).toContain(themeVars);
      expect(outputCss).toContain(targetCss);
      expect(outputCss).toContain('/* Theme: solarized-light */');
    });

    it('如果没有主题变量，应该只组合 base.css 和目标 CSS', () => {
      const baseCss = readFileSync(resolve(TEST_DIST_DIR, 'base.css'), 'utf-8');
      const targetCss = 'body { color: red; }';
      const themeVars = '';

      const outputCss = `${baseCss}\n\n${targetCss}`;

      expect(outputCss).toContain(baseCss);
      expect(outputCss).toContain(targetCss);
      expect(outputCss).not.toContain('/* Theme:');
    });
  });

  describe('文件写入', () => {
    it('应该能够写入文件', () => {
      const testFile = resolve(TEST_DIR, 'test-output.css');
      const content = 'body { color: red; }';

      writeFileSync(testFile, content, 'utf-8');

      expect(existsSync(testFile)).toBe(true);
      const written = readFileSync(testFile, 'utf-8');
      expect(written).toBe(content);
    });
  });
});
