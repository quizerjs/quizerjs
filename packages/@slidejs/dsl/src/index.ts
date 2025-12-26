/**
 * @slidejs/dsl
 *
 * Slide DSL 语法解析器和编译器
 */

export type {
  PresentationNode,
  RuleNode,
  SlideNode,
  ForLoopNode,
  ContentNode,
  DynamicContentNode,
  TextContentNode,
  BehaviorNode,
  TransitionNode,
  MemberExpressionNode,
  BinaryExpressionNode,
  NumberLiteralNode,
  BooleanLiteralNode,
  ExpressionValue,
} from './ast';

export { ParseError, createParser, parseSlideDSL } from './parser';
export type { Parser } from './parser';

export { compile, CompileError } from './compiler';
