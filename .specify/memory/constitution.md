<!--
Sync Impact Report
==================
Version change: 1.1.1 → 1.2.0
Modified principles: Technology Stack Standards (Package Manager requirement strengthened: pnpm REQUIRED; npm/yarn/bun prohibited)
Added sections: Package Manager Requirement (Constitution Check, templates)
Removed sections: N/A
Templates / Files updated:
  ✅ .specify/templates/plan-template.md - Added pnpm checks
  ✅ .specify/memory/constitution.md - Strengthened pnpm requirement and updated version
  ✅ apps/docs/README.md - Prefer pnpm only and note pnpm is required
  ✅ apps/web/README.md - Prefer pnpm only and note pnpm is required
  ✅ .specify/scripts/bash/update-agent-context.sh - Replaced npm commands with pnpm
Follow-up TODOs:
  - ⚠ Search other READMEs and scripts for accidental npm/yarn usage and update if found
-->

# OpenNote Constitution

## Core Principles

### I. OpenCode Integration First

All features MUST prioritize deep integration with the OpenCode ecosystem. Commands, skills, and plugins MUST follow OpenCode standards and interfaces. Integration points MUST be well-documented and maintain backward compatibility with OpenCode API changes.

**Rationale**: OpenNote is fundamentally an OpenCode-integrated solution; tight coupling with OpenCode ecosystem provides the primary value proposition and ensures seamless user experience.

### II. Type Safety (NON-NEGOTIABLE)

All code MUST be written in TypeScript. TypeScript compilation MUST pass with no errors. Strict type checking MUST be enabled. Type definitions MUST be complete - `any` types are prohibited except in documented edge cases. All public APIs MUST have exported type definitions.

**Rationale**: TypeScript provides compile-time safety, better IDE support, and reduces runtime errors in a complex monorepo application.

### III. Monorepo Discipline

Package boundaries MUST be clear and respected. Shared code MUST reside in appropriate `packages/` packages, not duplicated. Inter-package dependencies MUST be declared in `package.json` with version ranges. Turborepo task definitions MUST be used for building, testing, and linting. Circular dependencies between packages are prohibited. UI components MUST be developed in dedicated UI packages.

**Rationale**: Turborepo monorepo structure enables code sharing and consistent tooling; clear boundaries prevent architectural debt and separation of concerns.

### IV. Plugin Architecture

All functionality MUST be designed with plugin architecture mindset. Core features MUST be pluggable/extensible. Plugin interfaces MUST be stable between minor versions. Plugin registration MUST follow OpenCode plugin patterns. Documentation MUST exist for plugin development.

**Rationale**: Project provides OpenCode plugin; modular design enables future extensibility and third-party contributions.

### V. Test-First Development

For new features, tests MUST be written before or alongside implementation. Unit tests MUST cover critical business logic. Integration tests MUST verify plugin registration and OpenCode integration points. Test coverage MUST not decrease below current baseline. Tests MUST pass in CI before merge.

**Rationale**: Ensures code quality, catches regressions, and validates OpenCode integration contracts early.

### VI. Clear Package Responsibilities

Each package MUST have a well-defined, non-overlapping scope. This package (`packages/opennote`) provides OpenCode commands, skills, and plugin functionality. UI components are provided by separate UI packages. Cross-package concerns MUST be handled through shared packages or well-defined interfaces.

**Rationale**: Clear separation prevents feature creep, maintains maintainability, and allows independent evolution of different packages (e.g., UI can evolve independently of core OpenCode integration).

## Technology Stack Standards

### Mandatory Stack

- **Build System**: Turborepo for monorepo orchestration
- **Language**: TypeScript (strict mode enabled)
- **Package Manager**: **pnpm** — **MUST** be used for all development, CI, and installation tasks across the repository. Use of `npm`, `yarn`, or `bun` for installs or scripts is **prohibited** in project workflows. The repository **MUST** include `pnpm-lock.yaml`, and `package.json` **SHOULD** include a `packageManager` field (for example, `pnpm@>=8`).
- **Runtime**: Node.js (for OpenCode commands, skills, and plugin execution)

### Code Quality Tools

- **Linting**: ESLint with shared configuration from `packages/eslint-config`
- **Type Checking**: TypeScript compiler (tsc) as part of build process
- **Testing**: **Vitest** (recommended for TypeScript + Turborepo projects). If a plan proposes a different test framework that affects the monorepo (e.g., Jest, Mocha), the plan MUST document the rationale and follow the Amendment Process to update this section of the constitution (proposal, impact analysis, and version bump).
- **Formatting**: Framework TBD (add to constitution when determined)

### Architecture Constraints

- Monorepo structure MUST be maintained
- Shared UI components MUST reside in dedicated UI packages
- Configuration packages (`packages/eslint-config`, `packages/typescript-config`) MUST be used by all workspaces
- All packages MUST have `name`, `version`, `main`, `types` in package.json

## Development Workflow

### Branch Strategy

- Feature branches MUST follow naming convention: `feature/###-brief-description`
- All changes MUST go through pull requests
- Pull request descriptions MUST link to relevant spec if applicable

### Code Review Requirements

- At least one approval required for merge
- Type checking (tsc) MUST pass
- Linting (eslint) MUST pass with zero errors
- Tests MUST pass (if tests exist for changed code)

### Quality Gates

- Build MUST succeed: `pnpm run build`
- All developer and CI workflows **MUST** use `pnpm` commands (for example, `pnpm install`, `pnpm run build`, `pnpm test`). Use of `npm`, `yarn`, or `bun` for installs or scripts in CI or primary documentation is **prohibited**.
- The repository **MUST** include `pnpm-lock.yaml` and `package.json` **SHOULD** include a `packageManager` field.
- No TypeScript errors across entire monorepo
- No ESLint errors across entire monorepo
- Critical paths MUST have tests (OpenCode integration points, plugin registration)

### Documentation Requirements

- README MUST remain accurate for quickstart instructions
- Public API changes MUST be documented in code (JSDoc/TSDoc)
- OpenCode integration changes MUST be documented

## Governance

### Amendment Process

Constitution amendments require:

1. Proposal with rationale and impact analysis
2. Review of affected templates and workflows
3. Version bump according to semantic versioning
4. Update to this document with amendment history

### Versioning Policy

- **MAJOR**: Backward-incompatible principle removal or redefinition
- **MINOR**: New principle or section added, or material expansion of guidance
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

### Compliance Review

All pull requests MUST implicitly comply with current constitution. Violations MUST be explicitly justified with:

- Why the deviation is necessary
- Why no simpler alternative exists
- Plan to return to compliance (if applicable)

Use development guidelines in `.specify/templates/agent-file-template.md` for runtime project-specific guidance.

**Version**: 1.2.0 | **Ratified**: 2026-01-27 | **Last Amended**: 2026-01-27
