# Quickstart: OpenNote Initialization Commands

**Feature**: 001-opennote-init | **Date**: 2026-01-27

This guide helps you get started with developing and testing the OpenNote initialization feature.

## Prerequisites

- Node.js (LTS)
- pnpm (package manager)
- TypeScript
- Turborepo

## Installation

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run typecheck
pnpm typecheck
```

## Usage

### Initialize OpenNote

Run the init command to install predefined note commands:

```bash
# From project root
pnpm --filter @opennote/cli init
```

Or after building:

```bash
node packages/opennote/dist/cli.js init
```

### Available Commands

After initialization, the following commands are available in OpenCode:

- `/daily-note` - Create a daily note with date header
- `/meeting-note` - Create a meeting note with attendees and agenda
- `/idea-note` - Create an idea note with title and description

Press `Ctrl+K` in OpenCode TUI to access commands.

## Development

### Project Structure

```
packages/opennote/
├── src/
│   ├── commands/
│   │   ├── init.ts          # opennote init command
│   │   └── index.ts         # command registry
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   └── index.ts              # package entry point
├── templates/
│   ├── daily-note.md         # daily note template
│   ├── meeting-note.md       # meeting note template
│   └── idea-note.md          # idea note template
└── tests/
```

### Adding New Commands

1. Create a new command file in `templates/`:

   ```markdown
   ---
   description: Create a custom note
   agent: general
   ---

   Your template content here...
   ```

2. Register the command in `src/commands/index.ts`:

   ```typescript
   export const PREDEFINED_COMMANDS: PredefinedCommand[] = [
     // ... existing commands
     {
       name: "custom-note",
       description: "Create a custom note",
       template: fs.readFileSync("templates/custom-note.md", "utf-8"),
       agent: "general",
     },
   ];
   ```

3. Update type definitions if needed in `src/types/index.ts`

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific file
pnpm test packages/opennote/tests/unit/init.test.ts
```

### Linting

```bash
# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## Architecture

### Command Registration Flow

1. User runs `opennote init`
2. System checks for existing installation state
3. If not initialized:
   - Create `.opencode/commands/` directory
   - Copy command templates to `.opencode/commands/`
   - Create `.opencode/opennote-state.json` with installation record
4. Display confirmation message

### Re-initialization

- System detects existing `.opencode/opennote-state.json`
- Skips command installation
- Displays "Already initialized" message
- If version mismatch detected, prompts for update

### OpenCode Integration

Commands are registered via markdown files in `.opencode/commands/`:

```markdown
---
description: Create a daily note
agent: general
---

Template content that becomes the LLM prompt...
```

OpenCode automatically discovers these files and makes them available via `Ctrl+K`.

## Type Safety

All code is written in TypeScript with strict mode enabled. Key type definitions:

```typescript
interface PredefinedCommand {
  name: string;
  description: string;
  template: string;
  agent?: "general" | "plan" | "build" | "explore";
  model?: string;
}

interface InstallationState {
  initialized: boolean;
  version?: string;
  installedAt?: string;
  commands: CommandRegistration[];
}

interface CommandRegistration {
  name: string;
  installedAt: string;
  version: string;
  source: "predefined" | "user" | "project";
}
```

## Troubleshooting

### Commands not showing in OpenCode

1. Verify `.opencode/commands/` directory exists
2. Check command files have correct frontmatter
3. Restart OpenCode TUI
4. Check OpenCode logs for errors

### Initialization fails

1. Check write permissions in project directory
2. Verify `.opencode/` directory exists or can be created
3. Check for existing state file corruption: remove `.opencode/opennote-state.json` and retry

### Type errors

```bash
# Clean and rebuild
pnpm clean
pnpm build
```

## Contributing

1. Follow the constitution (see `.specify/memory/constitution.md`)
2. Ensure TypeScript passes with no errors
3. Add tests for new functionality
4. Run linting before committing
5. Follow branch naming convention: `feature/###-brief-description`
