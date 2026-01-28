# Implementation Plan: OpenNote Initialization Commands

**Branch**: `001-opennote-init` | **Date**: 2026-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-opennote-init/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement `opennote init` command using Commander.js with TypeScript to install predefined note commands (daily-note, meeting-note, idea-note). Commands are registered with OpenCode via markdown files in `.opencode/commands/` directory using OpenCode's frontmatter schema. The system handles re-initialization gracefully by checking existing installation state in `.opencode/opennote-state.json`. Testing uses Vitest for its Turborepo compatibility and native TypeScript support.

**Command Registration**: Commands are registered by creating markdown files in `.opencode/commands/` directory (OpenCode auto-discovers these files). This is NOT an API call to OpenCode's command registry.

## Technical Context

**Language/Version**: TypeScript (strict mode)
**Primary Dependencies**: Commander.js, @commander-js/extra-typings
**Storage**: File system (JSON config for installation state)
**Testing**: Vitest (official Turborepo support, native TypeScript, fast)
**Target Platform**: Node.js (OpenCode CLI environment)
**Project Type**: single (CLI command package)
**Performance Goals**: <5s for init, <2s for re-init (measured on GitHub Actions ubuntu-latest runner with 2 vCPU, 8 GB RAM, Node.js 18 LTS using performance.now() in cold-start scenario)
**Constraints**: No network dependencies during initialization (commands bundled), OpenCode integration required
**Scale/Scope**: Small (3-5 predefined commands initially, extensible plugin architecture)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: OpenCode Integration First

- [x] Feature prioritizes OpenCode ecosystem integration
- [x] Commands, skills, and plugins follow OpenCode standards/interfaces
- [x] Integration points are well-documented (in quickstart.md and data-model.md)
- [x] Backward compatibility with OpenCode API changes maintained

**Research Finding**: Commands registered via `.opencode/commands/` directory with Markdown files using OpenCode's frontmatter schema.

### Principle II: Type Safety (NON-NEGOTIABLE)

- [x] All code written in TypeScript
- [x] TypeScript compilation passes with no errors (to be verified during implementation)
- [x] Strict type checking enabled
- [x] Type definitions complete (defined in data-model.md and src/types/)
- [x] Public APIs have exported type definitions

**Research Finding**: Using TypeScript with `@commander-js/extra-typings` for enhanced type inference.

**Verification**: Implementation must pass `pnpm run build` and `pnpm run lint` before considering complete per AGENTS.md.

### Principle III: Monorepo Discipline

- [x] Package boundaries clear and respected
- [x] Shared code in appropriate `packages/` packages, not duplicated
- [x] Inter-package dependencies declared in `package.json` with version ranges (workspace protocol configured in T006a)
- [x] Turborepo task definitions used for build/test/lint (configured in T006b)
- [x] No circular dependencies between packages
- [x] UI components in dedicated UI packages (N/A - no UI components)

### Principle IV: Plugin Architecture

- [x] Functionality designed with plugin architecture mindset
- [x] Core features pluggable/extensible
- [x] Plugin interfaces stable between minor versions
- [x] Plugin registration follows OpenCode plugin patterns
- [x] Documentation exists for plugin development (in quickstart.md)

**Research Finding**: Using OpenCode's command file system (`.opencode/commands/`) instead of full plugin SDK.

### Principle V: Test-First Development

- [ ] Tests written before or alongside implementation (to be implemented)
- [ ] Unit tests cover critical business logic (to be implemented)
- [ ] Integration tests verify plugin registration and OpenCode integration points (to be implemented)
- [x] Test coverage not decreased below baseline (new feature)
- [ ] Tests pass in CI before merge (to be verified)

**Research Finding**: Using Vitest (official Turborepo support, native TypeScript, fast).

### Principle VI: Clear Package Responsibilities

- [x] Each package has well-defined, non-overlapping scope
- [x] `packages/opennote` provides OpenCode commands, skills, and plugin functionality
- [x] UI components provided by separate UI packages (N/A - no UI components)
- [x] Cross-package concerns handled through shared packages or well-defined interfaces

**Status**: ✅ Phase 1 design complete. No violations requiring justification. All principles can be met with planned implementation.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/opennote/
├── src/
│   ├── commands/
│   │   ├── init.ts          # opennote init command
│   │   └── index.ts         # command registry
│   ├── templates/
│   │   ├── daily-note.md    # daily note template
│   │   ├── meeting-note.md  # meeting note template
│   │   └── idea-note.md     # idea note template
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   ├── file-operations.ts        # file system utilities (mkdir, writeFile, fileExists)
│   │   ├── state-manager.ts          # manages .opencode/opennote-state.json
│   │   └── command-installer.ts     # creates .opencode/commands/{name}.md files
│   └── index.ts              # package entry point
├── tests/
│   ├── unit/
│   │   ├── init.test.ts
│   │   ├── command-registry.test.ts
│   │   ├── state-manager.test.ts
│   │   └── file-operations.test.ts
│   ├── integration/
│   │   ├── re-init.test.ts
│   │   ├── permissions.test.ts
│   │   ├── corrupted-state.test.ts
│   │   └── opennote-flow.test.ts
│   └── benchmark/
│       ├── init-benchmark.test.ts
│       └── re-init-benchmark.test.ts
├── package.json
├── turbo.json
└── tsconfig.json
```

**Note**: `.opencode/opennote-state.json` is generated in user project root, not in `src/config/`. OpenCode auto-discovers commands from `.opencode/commands/` directory.

**Structure Decision**: Single package structure (`packages/opennote`) focused on CLI commands for OpenCode integration. Commands register with OpenCode's command registry. Templates bundled with package for offline initialization.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
