# Tasks: OpenNote Initialization Commands

**Input**: Design documents from `/specs/001-opennote-init/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single package structure**: `packages/opennote/src/`, `packages/opennote/tests/`
- Paths shown below follow the plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create packages/opennote/ directory structure with src/, tests/, templates/ subdirectories
- [x] T002 Initialize TypeScript project with Commander.js, @commander-js/extra-typings, Vitest dependencies
- [x] T003 [P] Configure ESLint for TypeScript in packages/opennote/,should extend by @packages/eslint-config
- [x] T004 [P] Create tsconfig.json with strict mode and paths configuration in packages/opennote/,should extend by @packages/typescript-config
- [x] T005 [P] Configure Vitest in packages/opennote/tests/vitest.config.ts
- [x] T006 Initialize package.json with workspace configuration and scripts in packages/opennote/
- [x] T006a [P] Configure workspace protocol in packages/opennote/package.json (add workspace:\* for inter-package dependencies)
- [x] T006b [P] Create turbo.json in packages/opennote/ with build, test, lint task definitions
- [x] T006c [P] Verify Turborepo configuration with `turbo dry-run` to ensure task inheritance from root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create TypeScript type definitions in packages/opennote/src/types/index.ts
- [x] T008 [P] Define PredefinedCommand interface with name, description, template, agent fields
- [x] T009 [P] Define CommandRegistration interface with name, installedAt, version, source fields (source field added at registration time, not part of spec's entity definition)
- [x] T010 [P] Define InstallationState interface with initialized, version, installedAt, commands fields
- [x] T011 [P] Implement utility functions in packages/opennote/src/utils/file-operations.ts (mkdir, writeFile, readFile, fileExists)
- [x] T012 [P] Implement command registry utility in packages/opennote/src/utils/command-registry.ts (registerCommand function)
- [x] T012a [P] [US1] Implement command validation logic in packages/opennote/src/utils/command-registry.ts (validateCommand with name/description/template validation per FR-010 - checks for required fields, valid naming, non-empty template content)
- [x] T013 [P] Implement state management utility in packages/opennote/src/utils/state-manager.ts (loadState, saveState, isInitialized)
- [x] T014 Create command registry data in packages/opennote/src/commands/index.ts with PREDEFINED_COMMANDS array

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Initialize OpenNote with Predefined Commands (Priority: P1) 🎯 MVP

**Goal**: User runs `opennote init` to install a predefined set of note commands (daily-note, meeting-note, idea-note) that are registered with OpenCode and immediately available for use.

**Independent Test**: Run `opennote init` and verify that the predefined commands appear in the OpenCode command list and can be invoked successfully.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US1] Unit test for init command in packages/opennote/tests/unit/init.test.ts
- [x] T016 [P] [US1] Unit test for command registry in packages/opennote/tests/unit/command-registry.test.ts
- [x] T017 [P] [US1] Unit test for state manager in packages/opennote/tests/unit/state-manager.test.ts
- [x] T018 [P] [US1] Unit test for file operations in packages/opennote/tests/unit/file-operations.test.ts

### Implementation for User Story 1

- [x] T019 [US1] Implement init command logic in packages/opennote/src/commands/init.ts (check initialization, install commands, save state)
- [x] T020 [US1] Create daily-note.md template in packages/opennote/templates/daily-note.md with frontmatter
- [x] T021 [US1] Create meeting-note.md template in packages/opennote/templates/meeting-note.md with frontmatter
- [x] T022 [US1] Create idea-note.md template in packages/opennote/templates/idea-note.md with frontmatter
- [x] T023 [US1] Implement command installer in packages/opennote/src/utils/command-installer.ts with functions:
  - `installCommands(commands: PredefinedCommand[]): Promise<void>` - creates .opencode/commands/ and writes all command files
  - `copyTemplate(sourcePath: string, destPath: string): Promise<void>` - copies template file with validation
  - `createCommandFile(command: PredefinedCommand): Promise<void>` - writes .opencode/commands/{name}.md with frontmatter
  - `createCommandDirectory(): Promise<void>` - creates .opencode/commands/ if it doesn't exist
- [x] T024 [US1] Create CLI factory in packages/opennote/src/index.ts with createCli function
- [x] T025 [US1] Create CLI entry point in packages/opennote/src/cli.ts with:
  - Shebang: `#!/usr/bin/env node`
  - `createCli()` function that returns Commander instance with `opennote init` subcommand
  - `main()` function that calls `createCli().parseAsync(process.argv)`
  - Conditional execution: `if (import.meta.url === \`file://\${process.argv[1]}\`) { main(); }`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Handle Re-initialization Gracefully (Priority: P2)

**Goal**: User runs `opennote init` again after already having installed the commands. The system detects the existing installation and handles it gracefully without errors or duplicate registrations.

**Independent Test**: Run `opennote init` twice in succession and verify no errors occur, and commands remain functional.

### Tests for User Story 2

- [x] T026 [P] [US2] Integration test for re-initialization in packages/opennote/tests/integration/re-init.test.ts

### Implementation for User Story 2

- [x] T027 [US2] Add installation state detection in packages/opennote/src/commands/init.ts (check .opencode/opennote-state.json)
- [x] T028 [US2] Implement graceful skip logic in packages/opennote/src/commands/init.ts (return message if already initialized)
- [x] T029 [US2] Add version comparison in packages/opennote/src/utils/state-manager.ts (detect version changes)
- [x] T030 [US2] Add installation failure handling in packages/opennote/src/commands/init.ts (detect and handle partial installation failures, network issues, permission denied with helpful error messages per FR-007)
- [x] T030a [US2] Implement simple retry mechanism for transient errors in packages/opennote/src/commands/init.ts (max 3 retries with exponential backoff for network-related errors)
- [x] T030b [US2] Implement corrupted state handling in packages/opennote/src/commands/init.ts (re-initialize if state file invalid)
- [x] T030c [US2] Implement transactional install/rollback in packages/opennote/src/commands/init.ts (ensure partial installations are cleaned up and `.opencode/opennote-state.json` remains consistent on failure)
- [x] T031 [P] [US2] Add permission denied test in packages/opennote/tests/integration/permissions.test.ts (simulate EACCES error)
- [x] T032 [P] [US2] Add corrupted state recovery test in packages/opennote/tests/integration/corrupted-state.test.ts (invalid JSON, missing fields)
- [x] T033 [P] [US2] Add rollback integration test in packages/opennote/tests/integration/rollback.test.ts (simulate partial installation failure and verify cleanup and consistent state)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Provide Command Usage Feedback (Priority: P3)

**Goal**: After initialization completes, user receives clear feedback about installed commands including their names, descriptions, and how to use them.

**Independent Test**: Run `opennote init` and verify the output message includes command names, descriptions, and usage examples.

### Tests for User Story 3

- [x] T034 [P] [US3] Unit test for feedback message generation in packages/opennote/tests/unit/feedback.test.ts

### Implementation for User Story 3

- [x] T035 [US3] Create feedback message utility in packages/opennote/src/utils/feedback.ts (formatCommandList(commands: PredefinedCommand[]): string, generateSuccessMessage(count: number): string)
- [x] T036 [US3] Integrate feedback messages into init command in packages/opennote/src/commands/init.ts (display installed commands)
- [x] T037 [US3] Add usage examples to feedback messages in packages/opennote/src/utils/feedback.ts (show how to invoke each command)
- [x] T038 [US3] Implement color/formatted output in packages/opennote/src/utils/feedback.ts (improve readability)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T039 [P] Add comprehensive error messages in packages/opennote/src/utils/error-handler.ts with error types: InstallationError extends Error, ValidationError extends Error, PermissionError extends Error
- [ ] T040 [P] Implement logging in packages/opennote/src/utils/logger.ts (info, warn, error levels) with output to stdout (file logging via environment variable LOG_FILE if set)
- [ ] T041 [P] Create integration test for full opennote flow in packages/opennote/tests/integration/opennote-flow.test.ts
- [ ] T042 [P] Add reliability test in packages/opennote/tests/integration/reliability.test.ts to verify SC-002 (100% success rate in defined test scenarios)
- [ ] T043 [P] Add README with usage instructions in packages/opennote/README.md
- [ ] T044 [P] Run quickstart.md validation scenarios in packages/opennote/tests/quickstart-validation.test.ts
- [ ] T045 Code cleanup and remove unused imports across all files
- [ ] T046 Performance optimization (ensure init completes in <5s and re-init <2s when measured on the project's benchmark environment: GitHub Actions `ubuntu-latest` runner with Node.js 18 LTS, 2 vCPU, 8GB RAM; measurements performed by benchmark tests T047-T049 using `performance.now()`)
- [ ] T047 [P] Add performance benchmark for init command in packages/opennote/tests/benchmark/init-benchmark.test.ts using performance.now()
- [ ] T048 [P] Add performance benchmark for re-init command in packages/opennote/tests/benchmark/re-init-benchmark.test.ts
- [ ] T049 [P] Add automated verification in CI: assert init <5000ms and re-init <2000ms on benchmark suite
- [ ] T050 [P] Conduct manual usability test per SC-004 (N=20 participants; provide fresh project, run `opennote init`, then ask participants to list ≥2 commands and demonstrate invoking one; success criterion: ≥19/20 pass; record results and feedback)
- [ ] T051 [P] Create automated alternative validation script per SC-004 (verify initialization output includes machine-parseable commands list and usage examples; script should parse output and validate it contains required information)

---

## Phase 7: Package & Distribution (Optional)

**Purpose**: Prepare package for npm distribution (publish only when ready)

**When to Publish**:

- After User Story 3 is complete
- After core Phase 6 tasks are done (T039, T040, T043)
- All tests pass and basic validation complete
- Version should be at least 0.1.0 for first public release

**Versioning Strategy**:

- **0.1.0**: First public release after US1+US2 (MVP functionality)
- **0.2.0**: Include US3 feedback messages
- **1.0.0**: All features complete, Phase 6 polished, ready for production

### Package Configuration Tasks

- [ ] T052 [P] Verify package.json configuration for npm publishing
  - Check: name, version, description, author, license
  - Check: main entry point, bin commands, exports
  - Check: dependencies and devDependencies
  - Check: files and publishConfig (if needed)
- [ ] T053 [P] Add .npmignore file to exclude unnecessary files from npm package
  - Exclude: node_modules/, tests/, .git/, .vscode/, dist/
  - Exclude: _.log, .env_, \*.md (except README)
  - Ensure only production files are published
- [ ] T054 [P] Create npm scripts for publish workflow
  - Add prepublishOnly script: runs before package is packed
  - Add prepublish script: runs before package is published (deprecated but may be used)
  - Add postpublish script: runs after package is published
- [ ] T055 [P] Configure semantic-release for automated versioning (optional)
  - Set up conventional commits parsing
  - Configure changelog generation
  - Add GitHub release creation
  - Enable automated npm publish from CI
- [ ] T056 [P] Add GitHub Actions workflow for automated npm publishing
  - Create .github/workflows/publish.yml
  - Trigger on version tags or manual dispatch
  - Run tests before publish
  - Build package and publish to npm
  - Use NPM_TOKEN secret for authentication

### Pre-Publish Validation Tasks

- [ ] T057 [P] Verify package build and distribution before publish
  - Run: `pnpm build` and verify dist/ output
  - Check: All required files are included
  - Validate: TypeScript types are generated correctly
  - Test: Package can be installed and used from tarball
- [ ] T058 [P] Run package integrity checks
  - Use: `npm pack` to create tarball
  - Verify: tarball contents are correct
  - Test: Install from tarball: `npm install opennote-0.x.x.tgz`
  - Check: Bin command is executable: `./node_modules/.bin/opennote`
- [ ] T059 [P] Verify package.json metadata
  - Check: package name is available on npm (use `npm view <name>`)
  - Validate: version follows semver format
  - Ensure: description is clear and concise
  - Check: keywords for better discoverability
  - Add: repository and homepage URLs

### Publishing Tasks

- [ ] T060 Publish package to npm (version >= 0.1.0)
  - Command: `npm publish` or `pnpm publish --access public`
  - Note: First publish requires `--access public` for scoped packages
  - Verify: Package appears on npm registry
  - Test: Install from npm in fresh environment: `npm install @repo/opennote`
- [ ] T061 [P] Create release notes for npm package
  - Document: What's new in this version
  - Include: Fixed issues and new features
  - Add: Migration guides if needed (for breaking changes)
  - Format: Use markdown for npm display

### Post-Publish Tasks

- [ ] T062 [P] Verify npm package installation
  - Test: Fresh install in new project
  - Verify: `opennote init` command works
  - Check: All commands are installed correctly
  - Test: Re-initialization works as expected
- [ ] T063 [P] Update documentation and announce release
  - Update: README with latest version and usage
  - Create: GitHub release with changelog
  - Announce: In relevant channels (community, discord, etc.)
  - Tag: Release in version control: `git tag v0.1.0`

---

## Dependencies & Execution Order (Updated)

### Phase Dependencies (Updated)

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete
- **Package & Distribution (Phase 7)**: Optional - can be done after Phase 5 (US1+US2) or wait for Phase 6

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 state management but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1 init command but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Templates before command installation logic
- Command installation logic before init command
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T003, T004, T005) can run in parallel
- All Foundational tasks (T008, T009, T010, T011, T012, T013) can run in parallel
- All tests for US1 (T015, T016, T017, T018) can run in parallel
- All templates for US1 (T020, T021, T022) can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members
- All Polish tasks (T039, T040, T041, T042, T043, T044, T045, T047, T048, T049, T050, T051) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for init command in packages/opennote/tests/unit/init.test.ts"
Task: "Unit test for command registry in packages/opennote/tests/unit/command-registry.test.ts"
Task: "Unit test for state manager in packages/opennote/tests/unit/state-manager.test.ts"
Task: "Unit test for file operations in packages/opennote/tests/unit/file-operations.test.ts"

# Launch all templates for User Story 1 together:
Task: "Create daily-note.md template in packages/opennote/templates/daily-note.md with frontmatter"
Task: "Create meeting-note.md template in packages/opennote/templates/meeting-note.md with frontmatter"
Task: "Create idea-note.md template in packages/opennote/templates/idea-note.md with frontmatter"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006c)
2. Complete Phase 2: Foundational (T007-T014) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T015-T025)
4. **STOP and VALIDATE**: Run `opennote init` and verify commands work
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Complete Phase 6: Polish & Cross-Cutting Concerns → Deploy/Demo (full feature with usability validation per T050-T051)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
