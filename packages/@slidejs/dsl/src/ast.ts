/**
 * @slidejs/dsl - AST 类型定义
 *
 * Peggy 解析器生成的抽象语法树（AST）类型
 */

/**
 * AST 节点基类
 */
export interface ASTNode {
  type: string;
}

/**
 * Presentation 节点（根节点）
 */
export interface PresentationNode {
  version: string;
  sourceType: string;
  sourceId: string;
  rules: RuleNode[];
}

/**
 * Rule 节点
 */
export interface RuleNode extends ASTNode {
  type: 'rule';
  ruleType: 'start' | 'content' | 'end';
  name: string;
  slides?: SlideNode[];
  body?: ForLoopNode | SlideNode[];
}

/**
 * For Loop 节点
 */
export interface ForLoopNode extends ASTNode {
  type: 'for';
  variable: string;
  collection: MemberExpressionNode | string;
  body: ForLoopNode | SlideNode[];
}

/**
 * Slide 节点
 */
export interface SlideNode extends ASTNode {
  type: 'slide';
  content: ContentNode;
  behavior?: BehaviorNode;
}

/**
 * Content 节点
 */
export type ContentNode = DynamicContentNode | TextContentNode;

/**
 * Dynamic Content 节点
 */
export interface DynamicContentNode extends ASTNode {
  type: 'dynamic';
  component: string;
  props: Record<string, ExpressionValue>;
}

/**
 * Text Content 节点
 */
export interface TextContentNode extends ASTNode {
  type: 'text';
  lines: ExpressionValue[];
}

/**
 * Behavior 节点
 */
export interface BehaviorNode extends ASTNode {
  type: 'behavior';
  transition: TransitionNode;
}

/**
 * Transition 节点
 */
export interface TransitionNode extends ASTNode {
  type: 'transition';
  transType: string;
  options: Record<string, ExpressionValue>;
}

/**
 * Member Expression 节点
 */
export interface MemberExpressionNode extends ASTNode {
  type: 'member';
  object: string;
  properties: string[];
}

/**
 * Binary Expression 节点
 */
export interface BinaryExpressionNode extends ASTNode {
  type: 'binary';
  operator: '+' | '-' | '*' | '/';
  left: ExpressionValue;
  right: ExpressionValue;
}

/**
 * Number Literal 节点
 */
export interface NumberLiteralNode extends ASTNode {
  type: 'number';
  value: number;
}

/**
 * Boolean Literal 节点
 */
export interface BooleanLiteralNode extends ASTNode {
  type: 'boolean';
  value: boolean;
}

/**
 * Expression 值类型
 */
export type ExpressionValue =
  | string // String Literal
  | NumberLiteralNode
  | BooleanLiteralNode
  | MemberExpressionNode
  | BinaryExpressionNode;
