# RFC 0012: Slide DSL 增强功能与性能优化

## 元数据
- **RFC ID**: 0012
- **标题**: Slide DSL 增强功能与性能优化
- **状态**: 提案
- **创建日期**: 2025-01-XX
- **作者**: AI Assistant
- **相关 RFC**: RFC 0010 (Slide DSL 规范)

## 摘要

本 RFC 提出对 Slide DSL 的增强功能和性能优化方案，包括条件逻辑支持、变量定义、模块化、性能优化和安全性增强。这些功能将显著提升 DSL 的表达能力和实用性。

## 动机

### 当前限制

1. **缺乏条件逻辑**: 无法根据数据动态选择生成不同的幻灯片
2. **无变量定义**: 无法在 DSL 中定义和复用变量
3. **无模块化支持**: 无法复用 DSL 片段或导入外部 DSL
4. **性能未优化**: 大文件和复杂 DSL 的解析和编译性能未优化
5. **安全性不足**: 表达式求值可能存在安全风险

### 设计目标

1. **增强表达能力**: 支持条件逻辑、变量定义和函数
2. **提升可维护性**: 支持模块化和代码复用
3. **优化性能**: 提升大文件和复杂 DSL 的处理性能
4. **增强安全性**: 防止代码注入和恶意表达式执行

## 详细设计

### 1. 条件逻辑支持

#### 1.1 语法设计

```
rule content "conditional" {
  if quiz.difficulty == "hard" {
    slide {
      content text {
        "This is a hard quiz!"
      }
    }
  } else if quiz.difficulty == "medium" {
    slide {
      content text {
        "This is a medium quiz!"
      }
    }
  } else {
    slide {
      content text {
        "This is an easy quiz!"
      }
    }
  }
}
```

#### 1.2 实现方案

**AST 节点扩展**:
```typescript
export interface IfStatementNode extends ASTNode {
  type: 'if';
  condition: ExpressionValue;
  thenBody: ForLoopNode | SlideNode[];
  elseIfClauses?: ElseIfClauseNode[];
  elseBody?: ForLoopNode | SlideNode[];
}

export interface ElseIfClauseNode extends ASTNode {
  type: 'elseif';
  condition: ExpressionValue;
  body: ForLoopNode | SlideNode[];
}
```

**编译逻辑**:
```typescript
function compileIfStatement<TContext extends SlideContext = SlideContext>(
  node: IfStatementNode,
  context: TContext
): SlideDefinition[] {
  const conditionValue = evaluateExpression(node.condition, context);
  
  if (isTruthy(conditionValue)) {
    return compileRuleBody(node.thenBody, context);
  }
  
  // 检查 else if 子句
  if (node.elseIfClauses) {
    for (const elseIf of node.elseIfClauses) {
      const elseIfValue = evaluateExpression(elseIf.condition, context);
      if (isTruthy(elseIfValue)) {
        return compileRuleBody(elseIf.body, context);
      }
    }
  }
  
  // 执行 else 分支
  if (node.elseBody) {
    return compileRuleBody(node.elseBody, context);
  }
  
  return [];
}
```

#### 1.3 支持的比较运算符

- 相等: `==`, `!=`
- 比较: `<`, `<=`, `>`, `>=`
- 逻辑: `&&`, `||`, `!`
- 成员检查: `in` (如 `"tag" in item.metadata.tags`)

### 2. 变量定义

#### 2.1 语法设计

```
rule content "variables" {
  let title = "Welcome to " + quiz.title;
  let count = quiz.questions.length;
  
  slide {
    content text {
      title
      "Total questions: " + count
    }
  }
}
```

#### 2.2 实现方案

**AST 节点扩展**:
```typescript
export interface VariableDeclarationNode extends ASTNode {
  type: 'variable';
  name: string;
  value: ExpressionValue;
  constant?: boolean; // let vs const
}
```

**作用域管理**:
```typescript
interface CompileContext {
  variables: Map<string, unknown>;
  parent?: CompileContext;
}

function compileWithContext<TContext extends SlideContext = SlideContext>(
  body: ForLoopNode | SlideNode[] | VariableDeclarationNode[],
  context: TContext,
  compileContext: CompileContext
): SlideDefinition[] {
  // 处理变量声明
  if (Array.isArray(body) && body[0]?.type === 'variable') {
    const variables = body.filter(n => n.type === 'variable') as VariableDeclarationNode[];
    const slides = body.filter(n => n.type !== 'variable') as SlideNode[];
    
    // 在作用域中定义变量
    for (const varDecl of variables) {
      const value = evaluateExpression(varDecl.value, context, compileContext);
      compileContext.variables.set(varDecl.name, value);
    }
    
    return slides.map(slide => compileSlide(slide, context, compileContext));
  }
  
  // 原有逻辑...
}
```

### 3. 函数定义与调用

#### 3.1 语法设计

```
function formatTitle(prefix: string, title: string): string {
  return prefix + ": " + title;
}

rule start "intro" {
  slide {
    content text {
      formatTitle("Quiz", quiz.title)
    }
  }
}
```

#### 3.2 实现方案

**AST 节点扩展**:
```typescript
export interface FunctionDeclarationNode extends ASTNode {
  type: 'function';
  name: string;
  parameters: ParameterNode[];
  returnType?: string;
  body: ExpressionValue;
}

export interface FunctionCallNode extends ASTNode {
  type: 'call';
  callee: string;
  arguments: ExpressionValue[];
}
```

**函数注册表**:
```typescript
class FunctionRegistry {
  private functions = new Map<string, FunctionDefinition>();
  
  register(name: string, fn: FunctionDefinition): void {
    this.functions.set(name, fn);
  }
  
  call(name: string, args: unknown[], context: TContext): unknown {
    const fn = this.functions.get(name);
    if (!fn) {
      throw new CompileError(`Function "${name}" is not defined`);
    }
    return fn.execute(args, context);
  }
}
```

### 4. 模块化支持

#### 4.1 语法设计

```
// common.slide
function createTitleSlide(title: string) {
  slide {
    content text {
      title
    }
  }
}

// main.slide
import { createTitleSlide } from "./common.slide";

present quiz "math-quiz" {
  rules {
    rule start "intro" {
      createTitleSlide("Welcome!")
    }
  }
}
```

#### 4.2 实现方案

**模块解析器**:
```typescript
class ModuleResolver {
  private cache = new Map<string, ModuleDefinition>();
  
  async resolve(modulePath: string, basePath: string): Promise<ModuleDefinition> {
    const fullPath = resolvePath(modulePath, basePath);
    
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath)!;
    }
    
    const source = await readFile(fullPath);
    const ast = await parseSlideDSL(source);
    const module = compileModule(ast);
    
    this.cache.set(fullPath, module);
    return module;
  }
}
```

### 5. 性能优化

#### 5.1 解析器优化

**问题**: Peggy 生成的解析器对于大文件可能较慢。

**优化方案**:
1. **增量解析**: 支持解析 DSL 片段，而不是整个文件
2. **缓存机制**: 缓存已解析的 AST
3. **懒加载**: 延迟解析未使用的规则

```typescript
class CachedParser {
  private cache = new LRUCache<string, PresentationNode>({ max: 100 });
  
  async parse(source: string, options?: { cache?: boolean }): Promise<PresentationNode> {
    const hash = hashString(source);
    
    if (options?.cache !== false && this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }
    
    const ast = await parseSlideDSL(source);
    
    if (options?.cache !== false) {
      this.cache.set(hash, ast);
    }
    
    return ast;
  }
}
```

#### 5.2 编译器优化

**问题**: 复杂表达式的重复求值。

**优化方案**:
1. **表达式缓存**: 缓存表达式求值结果
2. **编译时优化**: 在编译时简化常量表达式
3. **懒求值**: 延迟求值未使用的表达式

```typescript
class OptimizedCompiler {
  private expressionCache = new Map<string, unknown>();
  
  evaluateExpression(expr: ExpressionValue, context: TContext): unknown {
    const cacheKey = hashExpression(expr);
    
    if (this.expressionCache.has(cacheKey)) {
      return this.expressionCache.get(cacheKey);
    }
    
    // 常量折叠优化
    if (isConstantExpression(expr)) {
      const value = evaluateConstantExpression(expr);
      this.expressionCache.set(cacheKey, value);
      return value;
    }
    
    const value = evaluateExpression(expr, context);
    this.expressionCache.set(cacheKey, value);
    return value;
  }
}
```

#### 5.3 运行时优化

**问题**: 大量幻灯片的生成可能较慢。

**优化方案**:
1. **流式生成**: 支持流式生成幻灯片，而不是一次性生成所有
2. **并行处理**: 对于独立的规则，支持并行处理
3. **增量更新**: 支持增量更新已生成的幻灯片

```typescript
class StreamingSlideEngine<TContext extends SlideContext = SlideContext> {
  async *generateStream(context: TContext): AsyncGenerator<SlideDefinition> {
    // 按顺序生成幻灯片，支持流式输出
    for (const rule of this.dsl.rules) {
      const slides = rule.generate(context);
      for (const slide of slides) {
        yield slide;
      }
    }
  }
}
```

### 6. 安全性增强

#### 6.1 沙箱执行环境

**问题**: 表达式求值可能执行恶意代码。

**解决方案**:
1. **白名单机制**: 只允许访问预定义的对象和属性
2. **资源限制**: 限制表达式求值的执行时间和内存
3. **输入验证**: 严格验证所有输入

```typescript
class SandboxedEvaluator {
  private allowedProperties = new Set<string>(['quiz', 'section', 'question', 'items']);
  private maxExecutionTime = 1000; // 1秒
  private maxMemoryUsage = 10 * 1024 * 1024; // 10MB
  
  evaluate(expr: ExpressionValue, context: TContext): unknown {
    // 验证属性访问
    if (expr.type === 'member') {
      this.validatePropertyAccess(expr);
    }
    
    // 设置执行超时
    return this.withTimeout(() => {
      return evaluateExpression(expr, context);
    }, this.maxExecutionTime);
  }
  
  private validatePropertyAccess(expr: MemberExpressionNode): void {
    if (!this.allowedProperties.has(expr.object)) {
      throw new SecurityError(`Access to "${expr.object}" is not allowed`);
    }
  }
}
```

#### 6.2 类型安全检查

**问题**: 类型不匹配可能导致运行时错误。

**解决方案**:
1. **编译时类型检查**: 在编译时验证类型
2. **运行时类型验证**: 在运行时验证类型
3. **类型推断**: 自动推断表达式类型

```typescript
class TypeChecker {
  checkExpression(expr: ExpressionValue, expectedType: string): void {
    const actualType = this.inferType(expr);
    
    if (!this.isCompatible(actualType, expectedType)) {
      throw new TypeError(
        `Type mismatch: expected ${expectedType}, got ${actualType}`
      );
    }
  }
}
```

## 实施计划

### Phase 1: 条件逻辑支持 (优先级: 高)
- [ ] 扩展 Peggy 语法支持 `if/else if/else`
- [ ] 实现 AST 节点类型
- [ ] 实现编译逻辑
- [ ] 添加测试用例
- [ ] 更新文档

**预计时间**: 1-2 周

### Phase 2: 变量定义 (优先级: 高)
- [ ] 扩展语法支持 `let/const`
- [ ] 实现作用域管理
- [ ] 实现变量解析
- [ ] 添加测试用例
- [ ] 更新文档

**预计时间**: 1 周

### Phase 3: 函数定义 (优先级: 中)
- [ ] 扩展语法支持函数定义和调用
- [ ] 实现函数注册表
- [ ] 实现函数调用逻辑
- [ ] 添加内置函数库
- [ ] 添加测试用例
- [ ] 更新文档

**预计时间**: 2 周

### Phase 4: 模块化支持 (优先级: 中)
- [ ] 实现模块解析器
- [ ] 实现导入/导出机制
- [ ] 实现模块缓存
- [ ] 添加测试用例
- [ ] 更新文档

**预计时间**: 2 周

### Phase 5: 性能优化 (优先级: 中)
- [ ] 实现解析器缓存
- [ ] 实现表达式缓存和常量折叠
- [ ] 实现流式生成
- [ ] 性能基准测试
- [ ] 更新文档

**预计时间**: 2-3 周

### Phase 6: 安全性增强 (优先级: 高)
- [ ] 实现沙箱执行环境
- [ ] 实现白名单机制
- [ ] 实现资源限制
- [ ] 实现类型检查
- [ ] 安全审计
- [ ] 更新文档

**预计时间**: 2 周

## 风险评估

### 技术风险

1. **语法复杂性增加**
   - 风险等级: 中
   - 缓解: 分阶段实施，充分测试

2. **性能影响**
   - 风险等级: 低
   - 缓解: 通过优化措施确保性能不下降

3. **向后兼容性**
   - 风险等级: 中
   - 缓解: 新功能为可选，不影响现有 DSL

### 安全风险

1. **代码注入**
   - 风险等级: 高
   - 缓解: 沙箱执行环境和白名单机制

2. **资源耗尽**
   - 风险等级: 中
   - 缓解: 资源限制和超时机制

## 替代方案

### 方案 A: 不添加新功能
- **优点**: 保持简单，无风险
- **缺点**: 表达能力受限，无法满足复杂需求

### 方案 B: 使用外部脚本语言 (如 JavaScript)
- **优点**: 功能强大，无需实现
- **缺点**: 安全性风险高，类型安全难以保证

### 方案 C: 使用模板引擎 (如 Handlebars)
- **优点**: 成熟稳定
- **缺点**: 不符合 DSL 设计理念，难以扩展

**选择**: 我们选择自定义增强功能（本 RFC），因为：
1. 完全控制语法和特性
2. 类型安全和安全性可控
3. 符合 DSL 设计理念
4. 可逐步实施，风险可控

## 未解决问题

1. **函数作用域**: 函数是否可以访问外部变量？
2. **模块版本管理**: 如何处理模块版本冲突？
3. **热更新**: 是否支持 DSL 的热更新？
4. **调试支持**: 是否需要添加调试工具？

这些问题将在实施过程中根据实际需求决定。

## 参考资料

- RFC 0010: Slide DSL 规范
- [Peggy 文档](https://peggyjs.org/)
- [领域特定语言设计模式](https://martinfowler.com/books/dsl.html)
- [表达式求值安全最佳实践](https://owasp.org/www-community/vulnerabilities/Code_Injection)

## 变更历史

- 2025-01-XX: 初始提案

