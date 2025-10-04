---
allowed-tools: Bash(git:*), Bash(find:*), Bash(cat:*), Bash(grep:*), Bash(mkdir:*), Bash(tee:*), Bash(ls:*), Read, Write, Edit, SequentialThinking
description: Convert existing documentation and git state into ticket-based system for robust, state-driven development.
---

## Role

Migration engineer converting existing project artifacts into a ticket-based workflow system.

## Purpose

Bootstrap the ticket lifecycle from existing documentation and git history without losing context or progress:

- **Documentation Scanning**: Extract requirements from specs, plans, tasks, breakdowns
- **Git Analysis**: Map commits and branches to ticket states
- **Ticket Generation**: Create hierarchical tickets with dependencies
- **State Inference**: Determine UNPROCESSED/IN_PROGRESS/COMPLETED/DEFERRED states
- **Interactive Alignment**: Resolve ambiguous cases with user input

## Execution

### 1. Scan Existing Documentation

```bash
# Find all planning artifacts
find docs/specs -type f -name "spec.md"
find docs/specs -type f -name "plan.md"
find docs/specs -type f -name "tasks.md"
find docs/breakdown -type f -name "breakdown.md"
find docs -type f -name "blueprint.md"
```

**Key Actions:**

- Read all spec files to identify epic-level requirements
- Parse plan files for dependencies and architecture decisions
- Extract tasks for feature-level tickets
- Review breakdown for subtask-level granularity
- Parse blueprint for milestone and priority data

### 2. Analyze Git Repository State

```bash
# Get branch list
git branch -a

# Get commit history with messages
git log --all --format="%H|%s|%an|%ad" --date=short

# Check current branch status
git status
```

**Key Actions:**

- Parse commit messages for feature/component references
- Match commit messages to spec/task descriptions
- Identify active feature branches
- Map branches to in-progress work
- Detect completed work from merged commits

### 3. Generate Ticket Hierarchy

**Use SequentialThinking to:**

- Identify component boundaries from specs
- Generate unique ticket IDs (e.g., AUTH-001, DB-001, UI-001)
- Create hierarchy: Epic (spec) → Story (plan/task) → Subtask (breakdown)
- Extract dependencies from plan documentation
- Map priorities from blueprint phases

**Ticket ID Convention:**

- `[COMPONENT]-[NUMBER]` format
- COMPONENT: 2-4 letter code (AUTH, DB, UI, API, etc.)
- NUMBER: Zero-padded 3-digit sequence (001, 002, etc.)

### 4. Infer Ticket States

**State Logic:**

- **COMPLETED**: Commit message matches ticket description AND tests exist
- **IN_PROGRESS**: Active feature branch exists OR partial commits found
- **DEFERRED**: Dependencies unmet OR explicit TODO/FIXME in code
- **UNPROCESSED**: No evidence of work started

### 5. Create Ticket Files

```bash
# Create tickets directory
mkdir -p tickets

# Generate index.json
tee tickets/index.json <<EOF
{
  "version": "1.0",
  "generated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "tickets": [...]
}
EOF

# Generate per-ticket markdown files
tee tickets/AUTH-001.md <<EOF
# AUTH-001: Implement JWT Validation
...
EOF
```

**Ticket Markdown Template:**

```markdown
# [ID]: [Title]

**State:** UNPROCESSED | IN_PROGRESS | DEFERRED | COMPLETED
**Priority:** P0 | P1 | P2
**Type:** Epic | Story | Subtask

## Description
[Clear description of work to be done]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Dependencies
- #[PARENT-ID] (parent)
- #[DEP-ID] (blocked by)

## Context
**Specs:** docs/specs/component/spec.md
**Plans:** docs/specs/component/plan.md
**Breakdown:** docs/breakdown/component/breakdown.md

## Progress
**Branch:** feature/component-name (if applicable)
**Commits:**
- abc123: commit message
- def456: commit message

**Notes:** [Any relevant context]
```

**Index JSON Schema:**

```json
{
  "version": "1.0",
  "generated": "ISO8601-timestamp",
  "tickets": [
    {
      "id": "AUTH-001",
      "title": "Implement JWT validation",
      "state": "IN_PROGRESS",
      "priority": "P0",
      "type": "Story",
      "parent": null,
      "children": ["AUTH-002", "AUTH-003"],
      "dependencies": ["DB-001"],
      "docs": {
        "spec": "docs/specs/authentication/spec.md",
        "plan": "docs/specs/authentication/plan.md",
        "breakdown": "docs/breakdown/auth/breakdown.md"
      },
      "git": {
        "branch": "feature/auth-jwt",
        "commits": ["abc123", "def456"]
      },
      "created": "ISO8601-timestamp",
      "updated": "ISO8601-timestamp"
    }
  ]
}
```

### 6. Enhance Tickets with Validation Configuration

**Use Sequential Thinking to:**

- **Detect Validation Type**: Analyze task descriptions and infer appropriate validation type
- **Generate Sub-Tasks**: Break down task files into granular sub-tasks with validation scripts
- **Create Component Groupings**: Group related tasks into logical components for checkpointing
- **Add Validation Scripts**: Generate appropriate validation commands based on project structure

**Validation Type Detection Logic:**

```bash
# Analyze task description keywords
if grep -qi "auth\|login\|state.*flow\|cascade" task_file; then
  VALIDATION_TYPE="stateflow"
elif grep -qi "percentage\|calculation\|counter\|total" task_file; then
  VALIDATION_TYPE="content"
elif grep -qi "button\|click\|form\|link\|handler" task_file; then
  VALIDATION_TYPE="interactive"
elif grep -qi "github\|api\|integration\|external" task_file; then
  VALIDATION_TYPE="integration"
else
  VALIDATION_TYPE="generic"
fi
```

**Sub-Task Generation from Task Breakdown:**

```bash
# Read task breakdown file
TASK_FILE="docs/specs/component/tasks.md"

# Extract individual tasks and create sub-task entries
# Each task becomes a sub-task with validation script

# Example output:
"tasks": [
  {
    "id": "TASK-001-1",
    "type": "interactive",
    "description": "Implement login button handler",
    "status": "UNPROCESSED",
    "validation_script": "npm test -- LoginButton.test",
    "auto_fix": true,
    "max_retries": 3
  },
  {
    "id": "TASK-001-2",
    "type": "stateflow",
    "description": "Validate auth state cascade",
    "status": "UNPROCESSED",
    "validation_script": "npm test -- AuthFlow.test",
    "auto_fix": true,
    "max_retries": 3
  }
]
```

**Component Grouping Strategy:**

```bash
# Group tasks by logical components (from breakdown or spec structure)
# Example: Auth ticket might have AuthModule and AuthUI components

"components": [
  {
    "name": "AuthModule",
    "description": "Core authentication logic",
    "checkpoint_id": "",  # Will be filled by /stream
    "status": "UNPROCESSED",
    "tasks": ["TASK-001-1", "TASK-001-2"]
  },
  {
    "name": "AuthUI",
    "description": "Authentication UI components",
    "checkpoint_id": "",
    "status": "UNPROCESSED",
    "tasks": ["TASK-001-3", "TASK-001-4"]
  }
]
```

**Validation Script Generation:**

```bash
# Detect project type and generate appropriate validation commands

# For React/TypeScript projects
if [ -f "package.json" ] && grep -q "react" package.json; then
  TEST_COMMAND="npm test --"
  LINT_COMMAND="npm run lint"
  BUILD_COMMAND="npm run build"
fi

# For Python projects
if [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  TEST_COMMAND="pytest"
  LINT_COMMAND="ruff check"
  BUILD_COMMAND="python -m build"
fi

# Generate validation config based on ticket type
"validation_config": {
  "validator": "${VALIDATOR_TYPE}",
  "auto_fix": true,
  "max_retries": 3,
  "verification_scripts": [
    {
      "name": "unit_tests",
      "command": "${TEST_COMMAND} ${TEST_FILE}",
      "success_pattern": "All tests passed",
      "failure_action": "auto_fix"
    }
  ]
}
```

**Enhanced Ticket JSON Schema:**

```json
{
  "id": "AUTH-001",
  "title": "Implement Authentication System",
  "type": "implementation",  // NEW: ticket type
  "validation_type": "stateflow",  // NEW: validation strategy
  "state": "UNPROCESSED",
  "priority": "P0",
  "parent": null,
  "children": ["AUTH-002"],
  "dependencies": ["DB-001"],

  "tasks": [  // NEW: sub-task array
    {
      "id": "TASK-001-1",
      "type": "interactive",
      "description": "Implement login button handler",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- LoginButton.test",
      "auto_fix": true,
      "max_retries": 3
    },
    {
      "id": "TASK-001-2",
      "type": "stateflow",
      "description": "Validate auth state cascade",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- AuthFlow.test",
      "auto_fix": true,
      "max_retries": 3
    }
  ],

  "validation_config": {  // NEW: validation configuration
    "validator": "StateFlowValidator",
    "auto_fix": true,
    "max_retries": 3,
    "verification_scripts": [
      {
        "name": "auth_flow_test",
        "command": "npm test -- AuthFlow.test",
        "success_pattern": "All tests passed",
        "failure_action": "auto_fix"
      }
    ],
    "state_paths": [  // Validator-specific config
      {
        "name": "admin_login",
        "transitions": [
          "logged_out → login(admin) → admin_nav_visible"
        ]
      }
    ]
  },

  "components": [  // NEW: component grouping
    {
      "name": "AuthModule",
      "description": "Core authentication logic",
      "checkpoint_id": "",
      "status": "UNPROCESSED",
      "tasks": ["TASK-001-1", "TASK-001-2"]
    }
  ],

  "docs": {
    "spec": "docs/specs/authentication/spec.md",
    "plan": "docs/specs/authentication/plan.md",
    "tasks": "docs/specs/authentication/tasks.md",
    "breakdown": "docs/breakdown/auth/breakdown.md"
  },

  "git": {
    "branch": "",
    "commits": []
  },

  "created": "ISO8601-timestamp",
  "updated": "ISO8601-timestamp"
}
```

**Enhanced Ticket Markdown Template:**

```markdown
# [ID]: [Title]

**Type:** implementation | enhancement | bugfix | refactor
**Validation Type:** stateflow | content | interactive | integration | generic
**State:** UNPROCESSED | IN_PROGRESS | DEFERRED | COMPLETED
**Priority:** P0 | P1 | P2

## Description
[Clear description of work to be done]

## Sub-Tasks
- [ ] TASK-001-1: Implement login button handler (interactive)
- [ ] TASK-001-2: Validate auth state cascade (stateflow)
- [ ] TASK-001-3: Display user profile data (content)

## Components
- **AuthModule**: Core authentication logic
- **AuthUI**: Authentication UI components

## Validation Configuration
**Validator:** StateFlowValidator
**Auto-Fix:** Enabled
**Max Retries:** 3

**Verification Scripts:**
- `npm test -- AuthFlow.test` (must pass)
- `npm run lint` (must pass)

## Acceptance Criteria
- [ ] All sub-tasks completed
- [ ] All validation scripts pass
- [ ] No deferred sub-tasks

## Dependencies
- #[PARENT-ID] (parent)
- #[DEP-ID] (blocked by)

## Context
**Specs:** docs/specs/component/spec.md
**Plans:** docs/specs/component/plan.md
**Tasks:** docs/specs/component/tasks.md
**Breakdown:** docs/breakdown/component/breakdown.md

## Progress
**Branch:** feature/component-name (if applicable)
**Commits:** (populated by /stream)

**Notes:** [Any relevant context]
```

### 7. Generate Migration Report

```bash
tee TEMP_DOCS/MIGRATION_REPORT.md
```

**Report Template:**

````markdown
# Ticket Migration Report

**Generated:** [timestamp]
**Total Tickets:** [N]

## Summary

| State | Count | Percentage |
|-------|-------|------------|
| COMPLETED | X | Y% |
| IN_PROGRESS | X | Y% |
| DEFERRED | X | Y% |
| UNPROCESSED | X | Y% |

## Ticket Breakdown by Component

### Authentication (AUTH)
- AUTH-001: JWT validation (IN_PROGRESS)
- AUTH-002: OAuth integration (UNPROCESSED)
- AUTH-003: Password reset (COMPLETED)

### Database (DB)
- DB-001: Schema setup (COMPLETED)
- DB-002: Migrations (IN_PROGRESS)

## State Inference Details

### Completed Tickets (X)
- AUTH-003: Matched commit "feat(auth): add password reset" [abc123]
- DB-001: Matched commit "feat(db): initial schema" [def456]

### In-Progress Tickets (Y)
- AUTH-001: Active branch `feature/auth-jwt` detected
- DB-002: Partial commits found, tests incomplete

### Deferred Tickets (Z)
- UI-005: Blocked by AUTH-001 (dependency unmet)

### Ambiguous Cases Requiring Review (N)

**TICKET-ID: [Description]**
- **Evidence:** Partial commits found, no tests
- **Question:** Mark as COMPLETED or IN_PROGRESS?
- **Recommendation:** IN_PROGRESS (tests incomplete)

## Dependency Graph

```text
DB-001 (COMPLETED)
  ↓
AUTH-001 (IN_PROGRESS)
  ↓
AUTH-002 (UNPROCESSED)
  ↓
UI-005 (DEFERRED - blocked)
```

## Next Steps

1. Review ambiguous tickets listed above
2. Run `/implement` to process UNPROCESSED tickets
3. Run `/sync` to push to GitHub
4. Use `/stream` for automated execution

## Files Created

- tickets/index.json
- tickets/AUTH-001.md (N files total)
- TEMP_DOCS/MIGRATION_REPORT.md

```

### 7. Interactive Ambiguity Resolution

**Present ambiguous cases to user:**
```

Found ambiguous state for AUTH-004:

- Evidence: 2 commits found
- Tests: Not found
- Branch: No active branch

Options:

1. Mark as COMPLETED (assume tests exist elsewhere)
2. Mark as IN_PROGRESS (incomplete)
3. Mark as DEFERRED (needs review)

Your choice: [1/2/3]

```

### 8. Validation Checks

```bash
# Verify JSON structure
cat tickets/index.json | grep -c '"id"'

# Count tickets by state
grep -r "^**State:**" tickets/*.md | sort | uniq -c

# Check for orphaned dependencies
# (dependencies referencing non-existent tickets)
````

## Integration Points

**Inputs:**

- `docs/specs/*/spec.md` - Epic requirements
- `docs/specs/*/plan.md` - Dependencies and architecture
- `docs/specs/*/tasks.md` - Task breakdown
- `docs/breakdown/*/breakdown.md` - Implementation details
- `docs/blueprint.md` - Priorities and milestones
- Git repository (branches, commits, status)

**Outputs:**

- `tickets/index.json` - Central ticket graph
- `tickets/[ID].md` - Per-ticket markdown files
- `TEMP_DOCS/MIGRATION_REPORT.md` - Migration summary
- Ready-to-use ticket system for `/implement` and `/stream`

**Workflow Position:**

- **Run Once**: During initial ticket system setup
- **Before**: `/implement`, `/stream`, `/sync`
- **After**: All documentation commands (`/specify`, `/plan`, `/tasks`, etc.)

## Error Scenarios and Recovery

### Missing Documentation

```bash
find docs/specs -name "spec.md" | wc -l
```

**Action**: Warn user if no specs found, suggest running `/specify` first

### Git Repository Not Initialized

```bash
git status 2>&1 | grep -q "not a git repository"
```

**Action**: Skip git analysis, create tickets in UNPROCESSED state only

### Conflicting Ticket IDs

**Action**: Use sequential numbering to avoid collisions, validate uniqueness

### Invalid JSON Structure

**Action**: Validate JSON before writing, provide clear error messages

## Success Criteria

- [ ] All spec files converted to epic tickets
- [ ] All tasks converted to story/subtask tickets
- [ ] Ticket hierarchy established (parent-child relationships)
- [ ] Dependencies mapped from plan documentation
- [ ] Git commits matched to completed tickets
- [ ] Active branches mapped to in-progress tickets
- [ ] tickets/index.json created with valid structure
- [ ] Per-ticket markdown files generated
- [ ] Migration report produced with statistics
- [ ] Ambiguous cases resolved with user input
- [ ] Ready for `/implement` to process tickets

## Usage Examples

```bash
# Run migration on existing project
/migrate

# Review migration report
cat TEMP_DOCS/MIGRATION_REPORT.md

# Inspect generated tickets
ls tickets/
cat tickets/index.json
```

## Notes

- Run this command **once** when introducing ticket system
- After migration, use `/specify`, `/tasks`, etc. to create new tickets
- Use `/implement` to process tickets from the queue
- Use `/sync` to keep GitHub synchronized
- Re-running is safe (will overwrite existing tickets directory)
