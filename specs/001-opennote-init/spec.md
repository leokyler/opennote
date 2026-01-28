# Feature Specification: OpenNote Initialization Commands

**Feature Branch**: `001-opennote-init`
**Created**: 2026-01-27
**Status**: Draft
**Input**: User description: "User runs 'opennote init' to install a predefined set of note commands (e.g., daily-note). The commands are registered and immediately available for use."

## User Scenarios & Testing

### User Story 1 - Initialize OpenNote with Predefined Commands (Priority: P1)

User runs `opennote init` in their project to install a predefined set of note commands (e.g., daily-note, meeting-note, idea-note). After successful installation, all commands are registered with OpenCode and immediately available for use.

**Why this priority**: This is the core functionality that enables users to set up OpenNote in their projects. Without initialization, no other OpenNote features are accessible.

**Independent Test**: Can be fully tested by running `opennote init` and verifying that the predefined commands appear in the OpenCode command list and can be invoked successfully.

**Acceptance Scenarios**:

1. **Given** a new project without OpenNote installed, **When** user runs `opennote init`, **Then** all predefined note commands are installed and registered
2. **Given** OpenNote installation in progress, **When** installation completes, **Then** user receives confirmation message listing installed commands
3. **Given** OpenNote commands installed, **When** user runs `opennote <command>`, **Then** the command executes successfully

---

### User Story 2 - Handle Re-initialization Gracefully (Priority: P2)

User runs `opennote init` again after already having installed the commands. The system detects the existing installation and handles it gracefully without errors or duplicate registrations.

**Why this priority**: Users may accidentally or intentionally re-run the init command. The system must handle this common edge case to provide a good user experience.

**Independent Test**: Can be fully tested by running `opennote init` twice in succession and verifying no errors occur, and commands remain functional.

**Acceptance Scenarios**:

1. **Given** OpenNote already initialized, **When** user runs `opennote init` again, **Then** system detects existing installation and skips re-registration
2. **Given** OpenNote already initialized, **When** re-init completes, **Then** user receives message indicating no action taken or updated if version changed

---

### User Story 3 - Provide Command Usage Feedback (Priority: P3)

After initialization completes, user receives clear feedback about installed commands including their names, descriptions, and how to use them.

**Why this priority**: While less critical than the basic initialization, good feedback helps users understand what's available and reduces confusion.

**Independent Test**: Can be tested by running `opennote init` and verifying the output message includes command names, descriptions, and usage examples.

**Acceptance Scenarios**:

1. **Given** OpenNote installation completes, **When** initialization finishes, **Then** user sees list of all installed commands with descriptions
2. **Given** installation output displayed, **When** user reads the output, **Then** they understand how to invoke each command

---

### Edge Cases

- What happens when initialization fails partway through (e.g., network issue, permission denied)?
- How does system handle corrupted or partial previous installations?
- What happens if .opencode/commands/ directory cannot be created or is inaccessible?
- How does system behave if predefined command definitions are missing or invalid?
- What happens if user has write permissions issues in the project directory?

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide `opennote init` command that installs predefined note commands
- **FR-002**: System MUST have a predefined set of note commands (minimum of 3: daily-note, meeting-note, idea-note; extensible for future command types)
- **FR-003**: System MUST create markdown files for each command in `.opencode/commands/` directory (OpenCode auto-discovers and registers these files)
- **FR-004**: Commands MUST be immediately available for use after installation completes
- **FR-005**: System MUST detect existing OpenNote installations to avoid duplicate registrations
- **FR-006**: System MUST provide clear user feedback about installation status and results
- **FR-007**: System MUST handle installation failures gracefully with helpful error messages that include: error context, specific failure reason, and suggested next steps. On partial failures the system **MUST** perform cleanup/rollback to leave the project in a consistent state (no partial command files or corrupted state file). Acceptance tests **MUST** verify rollback behavior.
- **FR-008**: Each predefined command MUST have a name, description, and template for note creation
- **FR-009**: System MUST persist command registration state to enable re-initialization detection (stored in `.opencode/opennote-state.json` with InstallationState schema)
- **FR-010**: System MUST validate command definitions before registration

### Key Entities

- **Predefined Command**: A note command template with name, description, note content template, and agent
  - Name: Identifier for the command (e.g., "daily-note")
  - Description: User-facing explanation of what the command does
  - Template: Default content structure for notes created by this command
  - Agent: Optional OpenCode agent identifier for command execution (null for simple templates)
- **Command Registration**: Record of installed commands in OpenCode's command registry
  - Command name
  - Installation timestamp
  - Version (for future update detection)
- **Installation State**: System state tracking OpenNote initialization status
  - Initialized flag
  - List of registered commands
  - Installation timestamp
  - Version of installed command set

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete `opennote init` and have commands available in under 5 seconds when measured on the project's benchmark environment: GitHub Actions `ubuntu-latest` runner (2 vCPU, 8 GB RAM) with Node.js 18 LTS. Timing is measured by the benchmark suite using `performance.now()` in a cold-start scenario.
- **SC-002**: All predefined commands are successfully registered and available after initialization in all defined test scenarios (local filesystem, standard permissions, no external dependencies)
- **SC-003**: Re-initialization of an already-installed OpenNote completes without errors in under 2 seconds when measured under the same benchmark environment and measurement method as SC-001.
- **SC-004**: At least **95%** of participants in a moderated usability test (N=20) can, immediately after running `opennote init`, correctly (1) list at least two installed commands and (2) demonstrate how to invoke one command. Test procedure: provide participants a fresh project, have them run `opennote init` (cold-start), then ask them to list installed commands and either run one or explain the exact invocation. Success criterion: ≥19/20 participants pass. If human testing is not feasible, an automated acceptance alternative may verify the initialization output includes a machine-parseable commands list and usage examples that meet the same success criteria when exercised by an automated script.

## Assumptions

- OpenCode auto-discovers commands from .opencode/commands/ directory
- Predefined commands are bundled with the OpenNote package
- User has appropriate file system permissions in the project directory
- OpenNote commands will include at minimum: daily-note, meeting-note, idea-note (or similar basic note types)
- Note templates use a simple text-based format (not rich formatting initially)
