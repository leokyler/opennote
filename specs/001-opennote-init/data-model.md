# Data Model: OpenNote Initialization Commands

**Feature**: 001-opennote-init | **Date**: 2026-01-27

This document defines the entities, relationships, and validation rules for the OpenNote initialization feature.

## Entities

### 1. PredefinedCommand

A note command template with name, description, and note content template.

**Fields**:

- `name` (string, required) - Identifier for the command (e.g., "daily-note")
- `description` (string, required) - User-facing explanation of what the command does
- `template` (string, required) - Default content structure for notes created by this command
- `agent` (string, optional) - OpenCode agent to execute the command (default: "general")
- `model` (string, optional) - Model override for the command

**Validation Rules**:

- `name` must be alphanumeric with hyphens only (regex: `^[a-z0-9-]+$`)
- `name` must be unique across all commands
- `description` must be non-empty and < 200 characters
- `template` must be non-empty
- `agent` must be one of: "general", "plan", "build", "explore" (if specified)
- `model` must be a valid OpenCode model identifier (if specified)

**Relationships**:

- One PredefinedCommand → One CommandRegistration (after installation)

---

### 2. CommandRegistration

Record of an installed command in OpenCode's command registry.

**Fields**:

- `name` (string, required) - Command name (e.g., "daily-note")
- `installedAt` (ISO 8601 timestamp, required) - When the command was installed
- `version` (string, required) - Version of the command set (e.g., "1.0.0")
- `source` (enum, required) - "predefined" | "user" | "project"

**Validation Rules**:

- `name` must match a valid PredefinedCommand name
- `installedAt` must be a valid ISO 8601 timestamp
- `version` must follow semantic versioning (semver)

**Relationships**:

- One CommandRegistration → One PredefinedCommand (reference by name)

---

### 3. InstallationState

System state tracking OpenNote initialization status.

**Fields**:

- `initialized` (boolean, required) - Whether OpenNote has been initialized
- `version` (string, optional) - Version of installed command set
- `installedAt` (ISO 8601 timestamp, optional) - When initialization was completed
- `commands` (array of CommandRegistration, required) - List of registered commands

**Validation Rules**:

- `initialized` must be true if `commands` array is non-empty
- `version` must follow semantic versioning (if present)
- `installedAt` must be a valid ISO 8601 timestamp (if present)
- `commands` must contain unique command names (no duplicates)

**Storage Location**: `.opencode/opennote-state.json`

---

### 4. CommandTemplate

The markdown template file for an OpenCode command.

**Fields**:

- `frontmatter.description` (string, required) - Brief description shown in TUI
- `frontmatter.agent` (string, optional) - Agent to execute
- `frontmatter.model` (string, optional) - Model override
- `content` (string, required) - Template that becomes LLM prompt

**Template Variables**:

- `$ARGUMENTS` - Full argument string passed to command
- `$1`, `$2`, `$3`, etc. - Positional arguments
- `!`command`` - Bash command output injection
- `@filepath` - File reference inclusion

**Storage Location**: `.opencode/commands/{name}.md`

---

## Relationships

```
PredefinedCommand (1) ──→ (1) CommandRegistration
                                   │
                                   ↓
                          InstallationState (1) ──→ (*) CommandRegistration
                                   │
                                   ↓
                          CommandTemplate (1) ──→ (1) PredefinedCommand
```

## State Transitions

### Installation Flow

```
[NOT_INITIALIZED] ──→ opennote init ──→ [INITIALIZED]
    │                                          │
    │                                          │
    └────────────────── opennote init ─────────┘
                     (re-initialization - no-op)
```

### InstallationState States

| State           | Description                                         | Valid Actions                   |
| --------------- | --------------------------------------------------- | ------------------------------- |
| NOT_INITIALIZED | `.opencode/opennote-state.json` does not exist      | `opennote init`                 |
| INITIALIZED     | `.opencode/opennote-state.json` exists and is valid | `opennote init` (no-op)         |
| CORRUPTED       | State file exists but is invalid                    | `opennote init` (re-initialize) |

---

## Predefined Commands (Initial Set)

### daily-note

- **name**: "daily-note"
- **description**: "Create a daily note with date header"
- **agent**: "general"
- **template**: See `.opencode/commands/daily-note.md`

### meeting-note

- **name**: "meeting-note"
- **description**: "Create a meeting note with attendees and agenda"
- **agent**: "general"
- **template**: See `.opencode/commands/meeting-note.md`

### idea-note

- **name**: "idea-note"
- **description**: "Create an idea note with title and description"
- **agent**: "general"
- **template**: See `.opencode/commands/idea-note.md`
