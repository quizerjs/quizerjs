/**
 * @slidejs/dsl - Compiler
 *
 * 将 AST 编译为可执行的 SlideDSL 对象
 */

import type { SlideContext } from '@slidejs/context';
import type { SlideDSL, SlideRule, SlideDefinition } from '@slidejs/core';
import type {
  PresentationNode,
  RuleNode,
  SlideNode,
  ForLoopNode,
  ContentNode,
  BehaviorNode,
  ExpressionValue,
  MemberExpressionNode,
  BinaryExpressionNode,
  NumberLiteralNode,
  BooleanLiteralNode,
} from './ast';

/**
 * Compiler 错误
 */
export class CompileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompileError';
  }
}

/**
 * 编译 AST 为 SlideDSL
 */
export function compile<TContext extends SlideContext = SlideContext>(
  ast: PresentationNode
): SlideDSL<TContext> {
  // 输入验证
  if (!ast) {
    throw new CompileError('AST is null or undefined');
  }

  if (!ast.rules || !Array.isArray(ast.rules)) {
    throw new CompileError('AST rules must be an array');
  }

  if (!ast.sourceType || typeof ast.sourceType !== 'string') {
    throw new CompileError('AST sourceType must be a non-empty string');
  }

  if (!ast.sourceId || typeof ast.sourceId !== 'string') {
    throw new CompileError('AST sourceId must be a non-empty string');
  }

  const rules: SlideRule<TContext>[] = ast.rules.map(ruleNode => compileRule(ruleNode));

  return {
    version: ast.version,
    sourceType: ast.sourceType,
    sourceId: ast.sourceId,
    rules,
  };
}

/**
 * 编译 Rule 节点
 */
function compileRule<TContext extends SlideContext = SlideContext>(
  node: RuleNode
): SlideRule<TContext> {
  return {
    type: node.ruleType,
    name: node.name,
    generate: (context: TContext) => {
      if (node.slides) {
        // 简单规则：直接生成 slides
        return node.slides.map(slideNode => compileSlide(slideNode, context));
      } else if (node.body) {
        // Content 规则：可能包含 for 循环
        return compileRuleBody(node.body, context);
      }
      return [];
    },
  };
}

/**
 * 编译 Rule Body（可能包含 for 循环）
 */
function compileRuleBody<TContext extends SlideContext = SlideContext>(
  body: ForLoopNode | SlideNode[],
  context: TContext
): SlideDefinition[] {
  if (Array.isArray(body)) {
    // 直接是 slides 数组
    return body.map(slideNode => compileSlide(slideNode, context));
  } else {
    // For 循环
    return compileForLoop(body, context);
  }
}

/**
 * 编译 For 循环
 */
function compileForLoop<TContext extends SlideContext = SlideContext>(
  node: ForLoopNode,
  context: TContext
): SlideDefinition[] {
  const slides: SlideDefinition[] = [];

  // 输入验证
  if (!node.variable || typeof node.variable !== 'string') {
    throw new CompileError('For loop variable must be a non-empty string');
  }

  // 解析集合表达式
  const collection = evaluateExpression(node.collection, context);

  if (collection === null || collection === undefined) {
    throw new CompileError(
      `For loop collection "${node.collection}" evaluates to ${collection === null ? 'null' : 'undefined'}`
    );
  }

  if (!Array.isArray(collection)) {
    throw new CompileError(
      `For loop collection "${node.collection}" must be an array, got: ${typeof collection}`
    );
  }

  // 遍历集合，为每个元素生成 slides
  for (const item of collection) {
    // 创建新的上下文，添加循环变量
    const loopContext = {
      ...context,
      [node.variable]: item,
    } as TContext;

    if (Array.isArray(node.body)) {
      // Body 是 slides 数组
      slides.push(...node.body.map(slideNode => compileSlide(slideNode, loopContext)));
    } else {
      // Body 是嵌套的 for 循环
      slides.push(...compileForLoop(node.body, loopContext));
    }
  }

  return slides;
}

/**
 * 编译 Slide 节点
 */
function compileSlide<TContext extends SlideContext = SlideContext>(
  node: SlideNode,
  context: TContext
): SlideDefinition {
  return {
    content: compileContent(node.content, context),
    behavior: node.behavior ? compileBehavior(node.behavior, context) : undefined,
  };
}

/**
 * 编译 Content 节点
 */
function compileContent<TContext extends SlideContext = SlideContext>(
  node: ContentNode,
  context: TContext
): SlideDefinition['content'] {
  if (node.type === 'dynamic') {
    // 动态内容（组件）
    return {
      type: 'dynamic',
      component: node.component,
      props: evaluateProps(node.props, context),
    };
  } else {
    // 静态文本
    return {
      type: 'text',
      lines: node.lines.map(line => String(evaluateExpression(line, context))),
    };
  }
}

/**
 * 编译 Behavior 节点
 */
function compileBehavior<TContext extends SlideContext = SlideContext>(
  node: BehaviorNode,
  context: TContext
): SlideDefinition['behavior'] {
  return {
    transition: {
      type: (node.transition as unknown as { transType: string }).transType as 'slide' | 'zoom' | 'fade' | 'cube' | 'flip' | 'none',
      ...evaluateProps(node.transition.options, context),
    },
  };
}

/**
 * 计算属性对象
 */
function evaluateProps<TContext extends SlideContext = SlideContext>(
  props: Record<string, ExpressionValue>,
  context: TContext
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    result[key] = evaluateExpression(value, context);
  }

  return result;
}

/**
 * 计算表达式
 */
function evaluateExpression<TContext extends SlideContext = SlideContext>(
  expr: ExpressionValue,
  context: TContext
): unknown {
  // 字符串字面量
  if (typeof expr === 'string') {
    return expr;
  }

  // 对象类型（AST 节点）
  if (typeof expr === 'object' && expr !== null && 'type' in expr) {
    switch (expr.type) {
      case 'number':
        return (expr as NumberLiteralNode).value;

      case 'boolean':
        return (expr as BooleanLiteralNode).value;

      case 'member':
        return evaluateMemberExpression(expr as MemberExpressionNode, context);

      case 'binary':
        return evaluateBinaryExpression(expr as BinaryExpressionNode, context);

      default:
        throw new CompileError(`Unknown expression type: ${(expr as { type: string }).type}`);
    }
  }

  throw new CompileError(`Invalid expression: ${JSON.stringify(expr)}`);
}

/**
 * 计算成员表达式（如 quiz.title, section.questions）
 * 也处理单个变量引用（properties 为空数组）
 */
function evaluateMemberExpression<TContext extends SlideContext = SlideContext>(
  expr: MemberExpressionNode,
  context: TContext
): unknown {
  // 从 context 中获取对象
  let value: unknown = context[expr.object as keyof TContext];

  // 如果没有属性，直接返回变量值（单个标识符的情况）
  if (expr.properties.length === 0) {
    if (value === undefined) {
      throw new CompileError(
        `Variable "${expr.object}" is not defined in context`
      );
    }
    return value;
  }

  // 构建属性路径用于错误信息
  const pathParts: string[] = [expr.object];

  // 遍历属性链
  for (const prop of expr.properties) {
    pathParts.push(prop);
    const currentPath = pathParts.join('.');

    // 检查 value 是否为 null 或 undefined
    if (value === null || value === undefined) {
      throw new CompileError(
        `Cannot access property "${prop}" of "${pathParts.slice(0, -1).join('.')}" because it is ${value === null ? 'null' : 'undefined'}`
      );
    }

    // 检查 value 是否为对象
    if (typeof value !== 'object') {
      throw new CompileError(
        `Cannot access property "${prop}" of "${pathParts.slice(0, -1).join('.')}" because it is not an object (got ${typeof value})`
      );
    }

    // 检查属性是否存在
    if (!(prop in value)) {
      throw new CompileError(
        `Property "${prop}" does not exist on "${pathParts.slice(0, -1).join('.')}"`
      );
    }

    value = (value as Record<string, unknown>)[prop];
  }

  return value;
}

/**
 * 计算二元表达式
 */
function evaluateBinaryExpression<TContext extends SlideContext = SlideContext>(
  expr: BinaryExpressionNode,
  context: TContext
): unknown {
  const left = evaluateExpression(expr.left, context);
  const right = evaluateExpression(expr.right, context);

  switch (expr.operator) {
    case '+':
      // 字符串拼接或数字相加
      if (typeof left === 'string' || typeof right === 'string') {
        return String(left) + String(right);
      }
      // 确保是数字类型
      if (typeof left !== 'number' || typeof right !== 'number') {
        throw new CompileError(
          `Cannot add ${typeof left} and ${typeof right}. Both operands must be numbers or at least one must be a string.`
        );
      }
      return left + right;

    case '-':
      if (typeof left !== 'number' || typeof right !== 'number') {
        throw new CompileError(
          `Cannot subtract ${typeof right} from ${typeof left}. Both operands must be numbers.`
        );
      }
      return left - right;

    case '*':
      if (typeof left !== 'number' || typeof right !== 'number') {
        throw new CompileError(
          `Cannot multiply ${typeof left} and ${typeof right}. Both operands must be numbers.`
        );
      }
      return left * right;

    case '/':
      if (typeof left !== 'number' || typeof right !== 'number') {
        throw new CompileError(
          `Cannot divide ${typeof left} by ${typeof right}. Both operands must be numbers.`
        );
      }
      if (right === 0) {
        throw new CompileError('Division by zero is not allowed');
      }
      return left / right;

    default:
      throw new CompileError(`Unknown operator: ${expr.operator}`);
  }
}
