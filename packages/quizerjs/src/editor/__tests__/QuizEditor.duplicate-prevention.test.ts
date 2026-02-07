import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QuizEditor } from '../QuizEditor';

describe('QuizEditor - Duplicate Prevention (RFC 0017)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(async () => {
    // 清理所有编辑器实例
    const editors = container.querySelectorAll('.codex-editor');
    editors.forEach(el => el.remove());
    document.body.removeChild(container);
  });

  describe('Layer 1: Instance Level Check', () => {
    it('should prevent duplicate initialization on same instance', async () => {
      const editor = new QuizEditor({ container });

      await editor.init();

      // 尝试再次初始化同一个实例
      await expect(editor.init()).rejects.toThrow('QuizEditor 已经初始化');
    });
  });

  describe('Layer 2: Registry Check + Auto Destroy', () => {
    it('should auto-destroy old instance when new one initializes', async () => {
      const editor1 = new QuizEditor({ container });
      const editor2 = new QuizEditor({ container });

      await editor1.init();

      // Spy on editor1.destroy
      const destroySpy = vi.spyOn(editor1, 'destroy');

      // 初始化 editor2 应该自动销毁 editor1
      await editor2.init();

      expect(destroySpy).toHaveBeenCalled();

      // 容器中应该只有一个编辑器
      const editorElements = container.querySelectorAll('.codex-editor');
      expect(editorElements.length).toBe(1);
    });

    it('should handle destroy failure gracefully', async () => {
      const editor1 = new QuizEditor({ container });
      const editor2 = new QuizEditor({ container });

      await editor1.init();

      // Mock destroy to throw error
      vi.spyOn(editor1, 'destroy').mockRejectedValue(new Error('Destroy failed'));

      // 应该继续初始化，依赖第 3 层清理
      await expect(editor2.init()).resolves.not.toThrow();

      // 容器中应该只有一个编辑器
      const editorElements = container.querySelectorAll('.codex-editor');
      expect(editorElements.length).toBe(1);
    });
  });

  describe('Layer 3: Force DOM Cleanup', () => {
    it('should cleanup orphaned DOM elements', async () => {
      // 手动创建孤立的编辑器 DOM
      const orphan1 = document.createElement('div');
      orphan1.className = 'codex-editor';
      container.appendChild(orphan1);

      const orphan2 = document.createElement('div');
      orphan2.className = 'codex-editor';
      container.appendChild(orphan2);

      expect(container.querySelectorAll('.codex-editor').length).toBe(2);

      const editor = new QuizEditor({ container });
      await editor.init();

      // 孤立的 DOM 应该被清理，只剩下新编辑器
      const editorElements = container.querySelectorAll('.codex-editor');
      expect(editorElements.length).toBe(1);
    });
  });

  describe('Layer 4: Registry Management', () => {
    it('should register instance on init', async () => {
      const editor = new QuizEditor({ container });
      await editor.init();

      // 创建第二个实例应该检测到注册表中的实例
      const editor2 = new QuizEditor({ container });
      const destroySpy = vi.spyOn(editor, 'destroy');

      await editor2.init();

      expect(destroySpy).toHaveBeenCalled();
    });

    it('should unregister instance on destroy', async () => {
      const editor1 = new QuizEditor({ container });
      await editor1.init();
      await editor1.destroy();

      // 销毁后，新实例应该可以正常初始化，不会尝试销毁已销毁的实例
      const editor2 = new QuizEditor({ container });
      await expect(editor2.init()).resolves.not.toThrow();

      const editorElements = container.querySelectorAll('.codex-editor');
      expect(editorElements.length).toBe(1);
    });
  });

  describe('Lifecycle: Prevent Double Destroy', () => {
    it('should prevent double destroy', async () => {
      const editor = new QuizEditor({ container });
      await editor.init();

      await editor.destroy();
      await editor.destroy(); // 第二次销毁应该安全返回

      // 不应该抛出错误
      expect(true).toBe(true);
    });
  });

  describe('Integration: Rapid Switching', () => {
    it('should handle rapid instance creation', async () => {
      const editors: QuizEditor[] = [];

      // 快速创建多个实例
      for (let i = 0; i < 5; i++) {
        const editor = new QuizEditor({ container });
        editors.push(editor);
        await editor.init();
      }

      // 任何时刻都应该只有一个编辑器
      const editorElements = container.querySelectorAll('.codex-editor');
      expect(editorElements.length).toBe(1);
    });

    it('should handle rapid init-destroy cycles', async () => {
      for (let i = 0; i < 5; i++) {
        const editor = new QuizEditor({ container });
        await editor.init();
        await editor.destroy();
      }

      // 最后应该没有编辑器
      const editorElements = container.querySelectorAll('.codex-editor');
      expect(editorElements.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple containers independently', async () => {
      const container2 = document.createElement('div');
      container2.id = 'test-container-2';
      document.body.appendChild(container2);

      const editor1 = new QuizEditor({ container });
      const editor2 = new QuizEditor({ container: container2 });

      await editor1.init();
      await editor2.init();

      // 每个容器应该有一个编辑器
      expect(container.querySelectorAll('.codex-editor').length).toBe(1);
      expect(container2.querySelectorAll('.codex-editor').length).toBe(1);

      await editor1.destroy();
      await editor2.destroy();
      document.body.removeChild(container2);
    });
  });
});
