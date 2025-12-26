/**
 * @slidejs/dsl - 示例测试
 */

import { describe, it, expect } from 'vitest';
import { parseSlideDSL } from '../parser';
import { compile } from '../compiler';
import type { SlideContext } from '@slidejs/context';

describe('Slide DSL Example', () => {
  it('should parse and compile a simple quiz slide DSL', async () => {
    const source = `
present quiz "math-quiz" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "Welcome to Math Quiz!"
          "Test your math skills"
        }
        behavior {
          transition zoom {
            speed: 500
          }
        }
      }
    }

    rule content "questions" {
      slide {
        content dynamic {
          name: "wsx-quiz-question"
          attrs {
            title: "Question 1"
            text: "What is 2 + 2?"
          }
        }
        behavior {
          transition slide {
            direction: "horizontal"
          }
        }
      }
    }

    rule end "thanks" {
      slide {
        content text {
          "Thank you for participating!"
        }
        behavior {
          transition fade {}
        }
      }
    }
  }
}
    `;

    // 解析 DSL
    const ast = await parseSlideDSL(source);

    expect(ast).toMatchObject({
      version: '1.0.0',
      sourceType: 'quiz',
      sourceId: 'math-quiz',
    });

    expect(ast.rules).toHaveLength(3);
    expect(ast.rules[0].ruleType).toBe('start');
    expect(ast.rules[1].ruleType).toBe('content');
    expect(ast.rules[2].ruleType).toBe('end');

    // 编译为 SlideDSL
    const slideDSL = compile(ast);

    expect(slideDSL.version).toBe('1.0.0');
    expect(slideDSL.sourceType).toBe('quiz');
    expect(slideDSL.sourceId).toBe('math-quiz');
    expect(slideDSL.rules).toHaveLength(3);

    // 创建测试 Context
    const mockContext: SlideContext = {
      sourceType: 'quiz',
      sourceId: 'math-quiz',
      metadata: {
        title: 'Math Quiz',
        description: 'Test your math skills',
      },
      items: [
        {
          id: 'q1',
          type: 'question',
          text: 'What is 2 + 2?',
        },
      ],
    };

    // 生成 Slides
    const slides = slideDSL.rules.flatMap(rule => rule.generate(mockContext));

    expect(slides).toHaveLength(3);

    // 验证第一个 slide（intro）
    expect(slides[0].content.type).toBe('text');
    if (slides[0].content.type === 'text') {
      expect(slides[0].content.lines).toEqual(['Welcome to Math Quiz!', 'Test your math skills']);
    }
    expect(slides[0].behavior?.transition?.type).toBe('zoom');

    // 验证第二个 slide（question）
    expect(slides[1].content.type).toBe('dynamic');
    if (slides[1].content.type === 'dynamic') {
      expect(slides[1].content.component).toBe('wsx-quiz-question');
      expect(slides[1].content.props).toMatchObject({
        title: 'Question 1',
        text: 'What is 2 + 2?',
      });
    }
    expect(slides[1].behavior?.transition?.type).toBe('slide');

    // 验证第三个 slide（thanks）
    expect(slides[2].content.type).toBe('text');
    if (slides[2].content.type === 'text') {
      expect(slides[2].content.lines).toEqual(['Thank you for participating!']);
    }
    expect(slides[2].behavior?.transition?.type).toBe('fade');
  });

  it('should handle for loops in content rules', async () => {
    const source = `
present quiz "loop-test" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "Starting"
        }
      }
    }

    rule content "items" {
      for item in items {
        slide {
          content dynamic {
            name: "item-component"
            attrs {
              text: item.text
            }
          }
        }
      }
    }

    rule end "outro" {
      slide {
        content text {
          "Ending"
        }
      }
    }
  }
}
    `;

    const ast = await parseSlideDSL(source);
    const slideDSL = compile(ast);

    // 创建包含 items 的 Context
    const mockContext: SlideContext = {
      sourceType: 'quiz',
      sourceId: 'loop-test',
      metadata: { title: 'Loop Test' },
      items: [
        { id: '1', type: 'item', text: 'Item 1' },
        { id: '2', type: 'item', text: 'Item 2' },
        { id: '3', type: 'item', text: 'Item 3' },
      ],
    };

    const slides = slideDSL.rules.flatMap(rule => rule.generate(mockContext));

    // 应该有 5 个 slides: 1 intro + 3 items + 1 outro
    expect(slides).toHaveLength(5);

    // 验证 intro
    expect(slides[0].content.type).toBe('text');

    // 验证 3 个 item slides
    for (let i = 0; i < 3; i++) {
      expect(slides[i + 1].content.type).toBe('dynamic');
      if (slides[i + 1].content.type === 'dynamic') {
        expect(slides[i + 1].content.component).toBe('item-component');
        expect(slides[i + 1].content.props.text).toBe(`Item ${i + 1}`);
      }
    }

    // 验证 outro
    expect(slides[4].content.type).toBe('text');
  });

  describe('Error Handling', () => {
    it('should throw ParseError for invalid syntax', async () => {
      const invalidSource = `
present quiz "test" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "Missing closing brace"
        }
      }
    }
  }
`;

      await expect(parseSlideDSL(invalidSource)).rejects.toThrow();
    });

    it('should throw CompileError for non-array collection in for loop', async () => {
      const source = `
present quiz "test" {
  rules {
    rule content "items" {
      for item in custom.items {
        slide {
          content text {
            "Item"
          }
        }
      }
    }
  }
}
`;

      const ast = await parseSlideDSL(source);
      const slideDSL = compile(ast);

      const mockContext: SlideContext = {
        sourceType: 'quiz',
        sourceId: 'test',
        metadata: { title: 'Test' },
        items: [],
        custom: {
          items: 'not-an-array', // 错误：不是数组
        },
      } as SlideContext;

      expect(() => {
        slideDSL.rules.flatMap(rule => rule.generate(mockContext));
      }).toThrow(/For loop collection.*must be an array/);
    });

    it('should throw CompileError for invalid property access', async () => {
      const source = `
present quiz "test" {
  rules {
    rule start "intro" {
      slide {
        content text {
          quiz.nonExistentProperty
        }
      }
    }
  }
}
`;

      const ast = await parseSlideDSL(source);
      const slideDSL = compile(ast);

      const mockContext: SlideContext = {
        sourceType: 'quiz',
        sourceId: 'test',
        metadata: { title: 'Test' },
        items: [],
        custom: {
          quiz: { title: 'Test Quiz' },
        },
      };

      expect(() => {
        slideDSL.rules.flatMap(rule => rule.generate(mockContext));
      }).toThrow('Cannot access property');
    });

    it('should handle binary operators correctly', async () => {
      // 测试字符串拼接（应该成功）
      const source1 = `
present quiz "test" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "Test" + "Valid"
        }
      }
    }
  }
}
`;

      const ast1 = await parseSlideDSL(source1);
      const slideDSL1 = compile(ast1);

      const mockContext: SlideContext = {
        sourceType: 'quiz',
        sourceId: 'test',
        metadata: { title: 'Test' },
        items: [],
        custom: {
          num1: 10,
          num2: 5,
        },
      };

      const slides1 = slideDSL1.rules.flatMap(rule => rule.generate(mockContext));
      expect(slides1).toHaveLength(1);
      if (slides1[0].content.type === 'text') {
        expect(slides1[0].content.lines[0]).toBe('TestValid');
      }

      // 注意：当前语法不支持减法运算符 "-"，只支持 "+"
      // 如果需要支持其他运算符，需要扩展 grammar.peggy
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty for loop collection', async () => {
      const source = `
present quiz "test" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "Starting"
        }
      }
    }

    rule content "items" {
      for item in items {
        slide {
          content text {
            item.text
          }
        }
      }
    }

    rule end "outro" {
      slide {
        content text {
          "Ending"
        }
      }
    }
  }
}
`;

      const ast = await parseSlideDSL(source);
      const slideDSL = compile(ast);

      const mockContext: SlideContext = {
        sourceType: 'quiz',
        sourceId: 'test',
        metadata: { title: 'Test' },
        items: [], // 空数组
      };

      const slides = slideDSL.rules.flatMap(rule => rule.generate(mockContext));

      // 应该只有 intro 和 outro，没有 items
      expect(slides).toHaveLength(2);
      expect(slides[0].content.type).toBe('text');
      expect(slides[1].content.type).toBe('text');
    });

    it('should handle nested for loops', async () => {
      const source = `
present quiz "test" {
  rules {
    rule content "nested" {
      for section in custom.sections {
        for item in section.items {
          slide {
            content text {
              item.text
            }
          }
        }
      }
    }
  }
}
`;

      const ast = await parseSlideDSL(source);
      const slideDSL = compile(ast);

      const mockContext: SlideContext = {
        sourceType: 'quiz',
        sourceId: 'test',
        metadata: { title: 'Test' },
        items: [],
        custom: {
          sections: [
            {
              items: [{ text: 'Item 1-1' }, { text: 'Item 1-2' }],
            },
            {
              items: [{ text: 'Item 2-1' }],
            },
          ],
        },
      };

      const slides = slideDSL.rules.flatMap(rule => rule.generate(mockContext));

      // 应该有 3 个 slides (2 + 1)
      expect(slides).toHaveLength(3);
    });

    it('should handle complex expressions', async () => {
      const source = `
present quiz "test" {
  rules {
    rule start "intro" {
      slide {
        content text {
          "Title: " + custom.quiz.title + " (" + custom.quiz.count + " items)"
        }
      }
    }
  }
}
`;

      const ast = await parseSlideDSL(source);
      const slideDSL = compile(ast);

      const mockContext: SlideContext = {
        sourceType: 'quiz',
        sourceId: 'test',
        metadata: { title: 'Test' },
        items: [],
        custom: {
          quiz: {
            title: 'Math Quiz',
            count: 10,
          },
        },
      };

      const slides = slideDSL.rules.flatMap(rule => rule.generate(mockContext));

      expect(slides).toHaveLength(1);
      if (slides[0].content.type === 'text') {
        expect(slides[0].content.lines[0]).toBe('Title: Math Quiz (10 items)');
      }
    });
  });
});
