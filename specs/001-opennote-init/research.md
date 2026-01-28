# Research: OpenNote Initialization Commands

**Feature**: 001-opennote-init | **Date**: 2026-01-27

This document consolidates research findings for all unknowns in the Technical Context and Constitution Check.

## Research Tasks

### Task 1: Testing Framework for OpenNote

**Decision**: Vitest

**Rationale**:

1. **Turborepo Official Support** - Vitest is officially documented and recommended by Turborepo with dedicated integration guides
2. **Performance** - Up to 10x faster than Jest due to Vite's ESM-first architecture and parallel execution
3. **Native TypeScript** - No transpilation needed; tests run directly on TypeScript files
4. **Modern Mocking** - Superior mocking APIs (`vi.mock`, `vi.spyOn`) that handle ESM modules better than Jest
5. **Jest Compatibility** - Drop-in replacement for most Jest projects with familiar API (`describe`, `test`, `expect`)

**Commander.js Testing Patterns**:

```typescript
// Create fresh Command objects per test (from Commander.js #1565)
import { Command } from "commander";

test("cli command", () => {
  const program = new Command();
  program.command("test").action(() => {});
  program.parse(["node", "cli", "test"]);
  expect(program.opts()).toEqual({});
});
```

**Mocking OpenCode Integration**:

```typescript
vi.mock("@opencode/sdk", () => ({
  OpenCode: vi.fn(() => ({ session: { ask: vi.fn() } })),
}));
```

**Alternatives Considered**:

- **Jest**: Slower performance, requires ESM/Jest configuration, less Turborepo integration support
- **Mocha**: Requires additional setup for TypeScript, mocking, and coverage; less modern ecosystem

---

### Task 2: OpenCode Integration Standards

**Decision**: Use OpenCode's command file system in `.opencode/commands/`

**Rationale**: OpenCode provides two methods to register commands:

1. **Markdown files** in `commands/` directories:
   - Project: `.opencode/commands/` (prefix `project:`)
   - File name becomes command ID: `daily-note.md` → `/daily-note`
   - Frontmatter schema:
     ```yaml
     ---
     description: <brief description shown in TUI>
     agent: <agent name (optional)>
     model: <model override (optional)>
     ---
     ```

2. **JSON config** in `opencode.json`:
   ```json
   {
     "command": {
       "daily-note": {
         "template": "Create a daily note",
         "description": "Create a new daily note",
         "agent": "general"
       }
     }
   }
   ```

**Template content becomes the LLM prompt** and supports:

- `$ARGUMENTS` - Full argument string
- `$1`, `$2`, `$3` - Positional arguments
- `!`command`` - Bash command output injection
- `@filepath` - File reference inclusion

**Command Interface Specification**:

- Frontmatter with `description` (required) and optional `agent`, `model`
- Commands can specify which agent executes them (`build`, `plan`, `general`, `explore`)
- Press `Ctrl+K` in TUI → select command → Enter

**Alternatives Considered**:

- **Markdown files vs JSON**: Both valid; Markdown files are simpler for templates, JSON is more programmatic. Choose based on use case.

---

### Task 3: OpenCode Plugin Patterns

**Decision**: OpenNote is not a plugin itself but provides commands for OpenCode

**Rationale**:

- OpenNote provides commands that integrate with OpenCode's existing command system
- Commands are registered via `.opencode/commands/` directory
- Each command is a separate file that becomes available in OpenCode TUI via `Ctrl+K`
- OpenNote does not need to implement plugin architecture, it just needs to create command files

**Plugin Integration**:

- Your project already uses `@opencode-ai/plugin` (npm package) for extensibility if needed
- Commands can specify `agent` field to route to specific OpenCode agent
- OpenCode documentation at https://opencode.ai/docs/commands/ and https://opencode.ai/docs/agents/

**Alternatives Considered**:

- **Full plugin**: More complex, requires OpenCode plugin SDK. Not needed for simple command registration.

---

### Task 4: Commander.js Best Practices for Monorepo CLI

**Decision**: Use TypeScript with `@commander-js/extra-typings`, factory pattern for testability

**Rationale**:

**Recommended Project Structure**:

```
packages/opennote/
├── src/
│   ├── commands/
│   │   ├── init.ts          # opennote init command
│   │   └── index.ts         # command registry
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   └── index.ts             # package entry point
├── tests/
│   └── unit/
└── package.json
```

**TypeScript Patterns**:

1. Use local `Command` instance for testability (not global singleton)
2. Define option interfaces
3. Use `@commander-js/extra-typings` for enhanced types
4. Chain options at creation for type inference
5. Custom parsers for validation

**Testing Strategy**:

1. Factory function for test isolation
2. Test error handling with `exitOverride()`
3. Extract business logic for unit testing
4. Use Vitest with TypeScript

**Monorepo-Specific Tips**:

1. Workspace dependencies via `workspace:` protocol
2. Use `tsx` for local development without build
3. Shebang with `node` ensures portability: `#!/usr/bin/env node`

**Example Factory Pattern**:

```typescript
export const createCli = () => {
  return new Command()
    .name("opennote")
    .command("init")
    .action(() => {
      /* init logic */
    });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  createCli().parseAsync(process.argv);
}
```

**Alternatives Considered**:

- **Global program**: Not testable. Factory pattern is recommended.
- **No TypeScript typing**: Lose type safety. TypeScript is non-negotiable per constitution.

---

### Task 2: OpenCode Integration Standards

**Question**: What are the OpenCode integration standards and interfaces for registering commands?

**Research Areas**:

- OpenCode command registry API
- OpenCode plugin registration patterns
- OpenCode command interface specifications
- OpenCode SDK/API documentation

**Decision**: [TO BE FILLED]

**Rationale**: [TO BE FILLED]

**Alternatives Considered**:

- [Option 1]: [pros/cons]
- [Option 2]: [pros/cons]

---

### Task 3: OpenCode Plugin Patterns

**Question**: What are the OpenCode plugin patterns that OpenNote should follow?

**Research Areas**:

- OpenCode plugin architecture
- OpenCode plugin lifecycle
- OpenCode plugin registration process
- OpenCode plugin documentation requirements

**Decision**: [TO BE FILLED]

**Rationale**: [TO BE FILLED]

**Alternatives Considered**:

- [Option 1]: [pros/cons]
- [Option 2]: [pros/cons]

---

### Task 4: Commander.js Best Practices for Monorepo CLI

**Question**: What are the best practices for using Commander.js in a Turborepo monorepo?

**Research Areas**:

- Commander.js TypeScript best practices
- Commander.js command organization in monorepos
- Commander.js testing strategies
- Commander.js CLI patterns for OpenCode integration

**Decision**: [TO BE FILLED]

**Rationale**: [TO BE FILLED]

**Alternatives Considered**:

- [Option 1]: [pros/cons]
- [Option 2]: [pros/cons]
