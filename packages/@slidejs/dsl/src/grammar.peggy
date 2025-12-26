/**
 * Slide DSL Grammar Definition (Peggy)
 *
 * Syntax:
 * present <type> "<name>" {
 *   rules {
 *     rule start "<name>" { ... }
 *     rule content "<name>" { ... }
 *     rule end "<name>" { ... }
 *   }
 * }
 */

{
  /**
   * 构建 AST 节点
   */
  function buildNode(type, data) {
    return { type, ...data };
  }

  /**
   * 构建属性对象
   */
  function buildAttrs(attrs) {
    return Object.fromEntries(attrs);
  }

  /**
   * 构建选项对象
   */
  function buildOptions(opts) {
    return Object.fromEntries(opts);
  }
}

// ============================================================================
// 主规则
// ============================================================================

Start
  = _ presentation:Presentation _ {
      return presentation;
    }

Presentation
  = "present" _ type:SourceType _ name:StringLiteral _ "{" _ body:PresentationBody _ "}" {
      return {
        version: "1.0.0",
        sourceType: type,
        sourceId: name,
        ...body
      };
    }

SourceType
  = "quiz" / "survey" / "form" / "assessment"

PresentationBody
  = "rules" _ "{" _ rules:RuleList _ "}" {
      return { rules };
    }

// ============================================================================
// 规则定义
// ============================================================================

RuleList
  = rules:Rule* {
      return rules;
    }

Rule
  = StartRule / ContentRule / EndRule

StartRule
  = "rule" _ "start" _ name:StringLiteral _ "{" _ slides:SlideList _ "}" _ {
      return buildNode("rule", {
        ruleType: "start",
        name,
        slides
      });
    }

ContentRule
  = "rule" _ "content" _ name:StringLiteral _ "{" _ body:ContentBody _ "}" _ {
      return buildNode("rule", {
        ruleType: "content",
        name,
        body
      });
    }

EndRule
  = "rule" _ "end" _ name:StringLiteral _ "{" _ slides:SlideList _ "}" _ {
      return buildNode("rule", {
        ruleType: "end",
        name,
        slides
      });
    }

ContentBody
  = ForLoop / SlideList

ForLoop
  = "for" _ variable:Identifier _ "in" _ collection:PathExpression _ "{" _ body:ForLoopBody _ "}" _ {
      return buildNode("for", {
        variable,
        collection,
        body
      });
    }

ForLoopBody
  = NestedForLoop / SlideList

NestedForLoop
  = "for" _ variable:Identifier _ "in" _ collection:PathExpression _ "{" _ body:SlideList _ "}" _ {
      return buildNode("for", {
        variable,
        collection,
        body
      });
    }

// ============================================================================
// Slide 定义
// ============================================================================

SlideList
  = slides:Slide* {
      return slides;
    }

Slide
  = "slide" _ "{" _ content:Content _ behavior:Behavior? _ "}" _ {
      return buildNode("slide", {
        content,
        behavior: behavior || undefined
      });
    }

// ============================================================================
// Content 定义
// ============================================================================

Content
  = DynamicContent / TextContent

DynamicContent
  = "content" _ "dynamic" _ "{" _ name:ComponentName _ attrs:Attrs _ "}" _ {
      return buildNode("dynamic", {
        component: name,
        props: attrs
      });
    }

TextContent
  = "content" _ "text" _ "{" _ lines:TextLineList _ "}" _ {
      return buildNode("text", {
        lines
      });
    }

ComponentName
  = "name" _ ":" _ name:StringLiteral {
      return name;
    }

Attrs
  = "attrs" _ "{" _ attrs:AttrList _ "}" {
      return buildAttrs(attrs);
    }

AttrList
  = attrs:Attr* {
      return attrs;
    }

Attr
  = key:AttrKey _ ":" _ value:AttrValue _ {
      return [key, value];
    }

AttrValue
  = StringLiteral / NumberLiteral / BooleanLiteral / PathExpression

AttrKey
  = first:[a-zA-Z_] rest:[a-zA-Z0-9_]* {
      return first + rest.join('');
    }

TextLineList
  = lines:TextLine* {
      return lines;
    }

TextLine
  = expr:Expression _ {
      return expr;
    }

// ============================================================================
// Behavior 定义
// ============================================================================

Behavior
  = "behavior" _ "{" _ transition:Transition _ "}" _ {
      return buildNode("behavior", {
        transition
      });
    }

Transition
  = "transition" _ transType:TransitionType _ "{" _ options:TransitionOptions? _ "}" _ {
      return buildNode("transition", {
        transType,
        options: options || {}
      });
    }

TransitionType
  = first:[a-zA-Z_] rest:[a-zA-Z0-9_]* {
      return first + rest.join('');
    }

TransitionOptions
  = opts:TransitionOption* {
      return buildOptions(opts);
    }

TransitionOption
  = key:Identifier _ ":" _ value:Expression _ {
      return [key, value];
    }

// ============================================================================
// 表达式
// ============================================================================

Expression
  = BinaryExpression / PrimaryExpression

BinaryExpression
  = left:PrimaryExpression _ "+" _ right:Expression {
      return buildNode("binary", {
        operator: "+",
        left,
        right
      });
    }

PrimaryExpression
  = StringLiteral / NumberLiteral / BooleanLiteral / PathExpression

PathExpression
  = head:Identifier tail:("." PropertyName)+ {
      return buildNode("member", {
        object: head,
        properties: tail.map(t => t[1])
      });
    }
  / id:Identifier {
      return buildNode("member", {
        object: id,
        properties: []
      });
    }

PropertyName
  = first:[a-zA-Z_] rest:[a-zA-Z0-9_]* {
      return first + rest.join('');
    }

// ============================================================================
// 基本类型
// ============================================================================

Identifier
  = !ReservedWord first:[a-zA-Z_] rest:[a-zA-Z0-9_]* {
      return first + rest.join('');
    }

StringLiteral
  = '"' chars:DoubleStringCharacter* '"' {
      return chars.join('');
    }
  / "'" chars:SingleStringCharacter* "'" {
      return chars.join('');
    }

DoubleStringCharacter
  = !'"' !"\\" char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

SingleStringCharacter
  = !"'" !"\\" char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

EscapeSequence
  = '"' / "'" / "\\" / "n" { return "\n"; } / "r" { return "\r"; } / "t" { return "\t"; }

NumberLiteral
  = digits:[0-9]+ {
      return buildNode("number", {
        value: parseInt(digits.join(''), 10)
      });
    }

BooleanLiteral
  = "true" {
      return buildNode("boolean", {
        value: true
      });
    }
  / "false" {
      return buildNode("boolean", {
        value: false
      });
    }

ReservedWord
  = ("present" / "rule" / "start" / "content" / "end" / "for" / "in" / "slide" / "dynamic" / "text" / "name" / "attrs" / "behavior" / "transition") !IdentifierPart

IdentifierPart
  = [a-zA-Z0-9_]

// ============================================================================
// 空白字符
// ============================================================================

_ "whitespace"
  = (WhiteSpace / LineTerminator / Comment)*

WhiteSpace
  = [ \t\v\f]

LineTerminator
  = [\n\r\u2028\u2029]

Comment
  = SingleLineComment / MultiLineComment

SingleLineComment
  = "//" (!LineTerminator .)*

MultiLineComment
  = "/*" (!"*/" .)* "*/"
