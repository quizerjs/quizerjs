/**
 * @quizerjs/cli - generate 命令与生成器单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';
import { generateCursorRules } from '../generators/cursor';
import { generateAntigravitySkill } from '../generators/antigravity';
import { generateCommand } from '../commands/generate';

const mocks = vi.hoisted(() => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  ensureDir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('fs-extra', () => ({
  default: mocks,
}));

vi.mock('prompts', () => ({
  default: vi.fn().mockResolvedValue({ tools: [] }),
}));

describe('generateCursorRules', () => {
  beforeEach(() => {
    mocks.writeFile.mockClear();
  });

  it('应在 cwd 下写入 .cursorrules 文件', async () => {
    const cwd = '/tmp/quizer-test';
    await generateCursorRules(cwd);
    expect(mocks.writeFile).toHaveBeenCalledTimes(1);
    const [filePath, content] = mocks.writeFile.mock.calls[0];
    expect(path.normalize(filePath)).toContain('.cursorrules');
    expect(content).toContain('QuizerJS');
    expect(content).toContain('QuizDSL');
    expect(content).toContain('localization');
  });
});

describe('generateAntigravitySkill', () => {
  beforeEach(() => {
    mocks.ensureDir.mockClear();
    mocks.writeFile.mockClear();
  });

  it('应创建 .agent/skills/quizer-integration 并写入 SKILL.md', async () => {
    const cwd = '/tmp/quizer-test';
    await generateAntigravitySkill(cwd);
    expect(mocks.ensureDir).toHaveBeenCalled();
    expect(mocks.writeFile).toHaveBeenCalledTimes(1);
    const [filePath, content] = mocks.writeFile.mock.calls[0];
    expect(filePath).toContain('SKILL.md');
    expect(content).toContain('QuizerJS Integration');
    expect(content).toContain('localization');
  });
});

describe('generateCommand', () => {
  beforeEach(() => {
    mocks.writeFile.mockClear();
    mocks.ensureDir.mockClear();
  });

  it('传入 --cursor 时应只生成 .cursorrules', async () => {
    await generateCommand({ cursor: true });
    expect(mocks.writeFile).toHaveBeenCalled();
    const paths = mocks.writeFile.mock.calls.map((c: string[]) => c[0]);
    expect(paths.some((p: string) => p.endsWith('.cursorrules'))).toBe(true);
  });

  it('传入 --antigravity 时应生成 SKILL.md', async () => {
    await generateCommand({ antigravity: true });
    expect(mocks.ensureDir).toHaveBeenCalled();
    expect(mocks.writeFile).toHaveBeenCalled();
    const contents = mocks.writeFile.mock.calls.map((c: string[]) => c[1]);
    expect(contents.some((c: string) => c.includes('QuizerJS Integration'))).toBe(true);
  });
});
