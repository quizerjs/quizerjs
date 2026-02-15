# RFC-0022: CLI for AI Skills Generation

## Summary

Introduce a new package `@quizerjs/cli` to provide command-line tools for generating "AI Skills" — configuration and documentation files (like `.cursorrules` and `.agent/skills/SKILL.md`) that help AI coding assistants understand and work with the QuizerJS framework in consumer projects.

## Motivation

QuizerJS is a complex framework with specific patterns for:

- **Localization**: Using `L10nService` and presets.
- **Component Usage**: Using `QuizEditor` and `QuizPlayer` correct props.
- **DSL**: Understanding the `QuizDSL` structure.

When developers use AI tools (Cursor, Windsurf, Claude Desktop, Antigravity) to build apps with QuizerJS, the AI often lacks context about these specific patterns. Providing a CLI to generate high-quality "Skill" documents ensures AI assistants have the correct context to generate valid code, reducing hallucinations and improving developer productivity.

## Design

### Package

- **Name**: `@quizerjs/cli`
- **Bin**: `quizer` (or `quizer-cli`)

### Commands

#### `init` (or `generate-skill`)

Generates the AI skill files in the current project.

```bash
npx @quizerjs/cli init
```

### Outputs

#### 1. `.cursorrules`

A curated list of rules for Cursor AI, focusing on:

- **Localization**: "Always use `localization` prop for `QuizEditor`/`QuizPlayer`."
- **Imports**: "Import types from `@quizerjs/dsl`."
- **Styling**: "Use `@quizerjs/theme` variables."

#### 2. `.agent/skills/quizer-integration/SKILL.md` (Antigravity/Claude)

A comprehensive markdown document containing:

- **Project Structure**: How QuizerJS fits into a React/Svelte app.
- **Component Interface**: Detailed props for `QuizEditor` and `QuizPlayer`.
- **L10n Specs**: How to load and pass language presets.
- **Examples**: Correct usage patterns vs. anti-patterns.

### Implementation Details

- **Tech Stack**: TypeScript, `cac` (CLI framework), `prompts` (interactive), `picocolors`.
- **Templates**: Use template strings or separate `.md` template files embedded in the binary.
- **Detection**: Automatically detect project type (React/Svelte) to tailor examples.

## UX Flow

1. User runs `npx @quizerjs/cli init`.
2. CLI asks: "Which AI tools do you use? [Cursor / Antigravity / Generic]".
3. CLI generates files.
4. User asks AI: "Create a Quiz Page".
5. AI reads `.cursorrules` or `SKILL.md` and generates correct code with L10n support.

## Future Scope

- **Scaffolding**: `quizer create-app`.
- **Validation**: `quizer validate-dsl`.
