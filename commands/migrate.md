---
allowed-tools: Bash(git:*), Bash(find:*), Bash(cat:*), Bash(grep:*), Bash(mkdir:*), Bash(tee:*), Bash(ls:*), Bash(jq:*), Read, Write, Edit, SequentialThinking
description: Convert existing documentation and git state into ticket-based system for robust, state-driven development.
argument-hint: '[--mode=full|optimized|legacy] (optional, defaults to optimized)'
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

### 0. Parse Migration Mode and Detect Project Type

```bash
# Parse migration mode from arguments
MIGRATION_MODE="optimized"  # Default

for arg in "$@"; do
  case $arg in
    --mode=full)
      MIGRATION_MODE="full"
      ;;
    --mode=optimized)
      MIGRATION_MODE="optimized"
      ;;
    --mode=legacy)
      MIGRATION_MODE="legacy"
      ;;
  esac
done

# Detect documentation availability
SPECS_COUNT=$(find docs/specs -type f -name "spec.md" 2>/dev/null | wc -l | tr -d ' ')
PLANS_COUNT=$(find docs/specs -type f -name "plan.md" 2>/dev/null | wc -l | tr -d ' ')
TASKS_COUNT=$(find docs/specs -type f -name "tasks.md" 2>/dev/null | wc -l | tr -d ' ')
BREAKDOWN_COUNT=$(find docs/breakdown -type f -name "breakdown.md" 2>/dev/null | wc -l | tr -d ' ')

DOCS_TOTAL=$((SPECS_COUNT + PLANS_COUNT + TASKS_COUNT + BREAKDOWN_COUNT))

# Auto-detect legacy codebase
IS_LEGACY_CODEBASE=false
if [ "$DOCS_TOTAL" -eq 0 ] && [ "$MIGRATION_MODE" != "legacy" ]; then
  IS_LEGACY_CODEBASE=true
  echo "⚠️  Legacy codebase detected - no documentation found"
  echo ""
  echo "Documentation Status:"
  echo "  Specs:      $SPECS_COUNT"
  echo "  Plans:      $PLANS_COUNT"
  echo "  Tasks:      $TASKS_COUNT"
  echo "  Breakdowns: $BREAKDOWN_COUNT"
  echo ""
  echo "Switching to LEGACY mode for git-history-only migration"
  MIGRATION_MODE="legacy"
  echo ""
fi

# Display migration configuration
echo "================================================"
echo "MIGRATION MODE: $MIGRATION_MODE"
echo "================================================"
case $MIGRATION_MODE in
  full)
    echo "Full Mode: All tickets get detailed validation configs"
    echo "  - COMPLETED tickets: Full detail (historical record)"
    echo "  - UNPROCESSED tickets: Full detail (implementation ready)"
    ;;
  optimized)
    echo "Optimized Mode: Token-efficient ticket generation"
    echo "  - COMPLETED tickets: Lightweight placeholders (~90% token savings)"
    echo "  - UNPROCESSED tickets: Full detail with validation configs"
    ;;
  legacy)
    echo "Legacy Mode: Git-history-only migration"
    echo "  - No documentation required"
    echo "  - Tickets inferred from commit messages and file changes"
    echo "  - All tickets marked COMPLETED (historical record)"
    echo "  - Minimal metadata (git commits + summary)"
    ;;
esac
echo "================================================"
echo ""
```

**Key Actions:**

- Parse `--mode` argument (full, optimized, legacy)
- Detect documentation availability (specs, plans, tasks, breakdowns)
- Auto-switch to legacy mode if no documentation exists
- Display migration configuration summary

**Mode Behaviors:**

| Mode | COMPLETED Tickets | UNPROCESSED Tickets | Use Case |
|------|------------------|---------------------|----------|
| `full` | Full detail | Full detail | Maximum historical context |
| `optimized` (default) | Lightweight | Full detail | Token-efficient, production ready |
| `legacy` | Minimal (git-only) | N/A (all COMPLETED) | Undocumented codebases |

### 1. Scan Existing Documentation

```bash
# Skip documentation scan if in legacy mode
if [ "$MIGRATION_MODE" != "legacy" ]; then
  echo "Scanning documentation..."

  # Find all planning artifacts
  SPEC_FILES=$(find docs/specs -type f -name "spec.md" 2>/dev/null)
  PLAN_FILES=$(find docs/specs -type f -name "plan.md" 2>/dev/null)
  TASK_FILES=$(find docs/specs -type f -name "tasks.md" 2>/dev/null)
  BREAKDOWN_FILES=$(find docs/breakdown -type f -name "breakdown.md" 2>/dev/null)
  BLUEPRINT_FILE=$(find docs -type f -name "blueprint.md" 2>/dev/null)

  echo "Found documentation:"
  echo "  Specs:      $(echo "$SPEC_FILES" | grep -c . || echo 0)"
  echo "  Plans:      $(echo "$PLAN_FILES" | grep -c . || echo 0)"
  echo "  Tasks:      $(echo "$TASK_FILES" | grep -c . || echo 0)"
  echo "  Breakdowns: $(echo "$BREAKDOWN_FILES" | grep -c . || echo 0)"
  echo "  Blueprint:  $([ -n "$BLUEPRINT_FILE" ] && echo "Yes" || echo "No")"
  echo ""
else
  echo "Legacy mode: Skipping documentation scan"
  echo "Will generate tickets from git history only"
  echo ""
fi
```

**Key Actions:**

- **Standard Mode (full/optimized):**
  - Read all spec files to identify epic-level requirements
  - Parse plan files for dependencies and architecture decisions
  - Extract tasks for feature-level tickets
  - Review breakdown for subtask-level granularity
  - Parse blueprint for milestone and priority data

- **Legacy Mode:**
  - Skip documentation scan entirely
  - Proceed directly to git analysis
  - Infer ticket structure from commit patterns

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
- Match commit messages to spec/task descriptions (standard mode)
- Identify active feature branches
- Map branches to in-progress work
- Detect completed work from merged commits

### 2a. Legacy Mode: Infer Tickets from Git History

**Only runs if MIGRATION_MODE = "legacy"**

```bash
if [ "$MIGRATION_MODE" = "legacy" ]; then
  echo "Legacy mode: Inferring tickets from git commit history..."
  echo ""

  # Extract unique components from commit messages
  # Pattern: feat(component): message, fix(component): message
  COMPONENTS=$(git log --all --format="%s" | \
    grep -oE '\((.*?)\)' | \
    tr -d '()' | \
    sort | uniq)

  echo "Detected components from git history:"
  echo "$COMPONENTS"
  echo ""

  # Group commits by component
  for COMPONENT in $COMPONENTS; do
    # Generate component code (e.g., auth → AUTH, database → DB)
    COMPONENT_CODE=$(echo "$COMPONENT" | tr '[:lower:]' '[:upper:]' | cut -c1-4)

    # Get all commits for this component
    COMMITS=$(git log --all --format="%H|%s|%ad" --date=short | \
      grep -i "($COMPONENT)" || true)

    if [ -n "$COMMITS" ]; then
      # Create single ticket per component (all COMPLETED)
      TICKET_ID="${COMPONENT_CODE}-001"
      TICKET_TITLE="$COMPONENT Implementation"

      # Extract first and last commit dates
      FIRST_COMMIT_DATE=$(echo "$COMMITS" | tail -1 | cut -d'|' -f3)
      LAST_COMMIT_DATE=$(echo "$COMMITS" | head -1 | cut -d'|' -f3)

      # Store for ticket generation
      echo "$TICKET_ID|$TICKET_TITLE|COMPLETED|$LAST_COMMIT_DATE|$COMMITS" >> /tmp/legacy-tickets.txt
    fi
  done

  # If no conventional commit patterns found, create generic tickets from file changes
  if [ ! -s /tmp/legacy-tickets.txt ]; then
    echo "No conventional commits found - inferring from file changes..."

    # Group by top-level directories
    git log --all --name-only --format="" | \
      grep -v '^$' | \
      cut -d'/' -f1 | \
      sort | uniq | \
      while read DIR; do
        if [ -n "$DIR" ]; then
          DIR_CODE=$(echo "$DIR" | tr '[:lower:]' '[:upper:]' | cut -c1-4)
          TICKET_ID="${DIR_CODE}-001"
          COMMITS=$(git log --all --format="%H|%s" -- "$DIR/*" | head -5)
          echo "$TICKET_ID|${DIR} Implementation|COMPLETED|$(date -u +%Y-%m-%d)|$COMMITS" >> /tmp/legacy-tickets.txt
        fi
      done
  fi

  echo "Generated $(wc -l < /tmp/legacy-tickets.txt) legacy tickets from git history"
  echo ""
fi
```

**Legacy Mode Ticket Inference Strategy:**

1. **Pattern Detection:**
   - Extract components from conventional commits: `feat(auth):`, `fix(db):`
   - Group commits by component prefix

2. **Fallback Strategy (if no conventional commits):**
   - Group by top-level directory structure
   - Create tickets based on file change patterns

3. **Ticket Characteristics:**
   - All tickets marked COMPLETED (code already exists)
   - Minimal metadata (git commits + summary)
   - No validation configs (historical record)
   - Completion date = last commit date

4. **Limitations:**
   - Cannot infer dependencies without documentation
   - All tickets are independent
   - No subtask breakdown
   - Historical record only (not execution-ready)

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

### 5. Create Ticket Files (Mode-Aware)

```bash
# Create tickets directory
mkdir -p .sage/tickets

echo "Generating tickets in $MIGRATION_MODE mode..."
echo ""

# Function to generate ticket based on mode and state
generate_ticket() {
  local TICKET_ID="$1"
  local TICKET_TITLE="$2"
  local TICKET_STATE="$3"
  local HAS_DOCS="$4"  # true/false

  # Determine ticket detail level based on mode and state
  case "$MIGRATION_MODE" in
    full)
      # Full detail for all tickets regardless of state
      generate_full_ticket "$TICKET_ID" "$TICKET_TITLE" "$TICKET_STATE"
      ;;

    optimized)
      # Lightweight for COMPLETED, full for others
      if [ "$TICKET_STATE" = "COMPLETED" ]; then
        generate_lightweight_ticket "$TICKET_ID" "$TICKET_TITLE" "$TICKET_STATE"
      else
        generate_full_ticket "$TICKET_ID" "$TICKET_TITLE" "$TICKET_STATE"
      fi
      ;;

    legacy)
      # Minimal git-history-only tickets
      generate_legacy_ticket "$TICKET_ID" "$TICKET_TITLE"
      ;;
  esac
}

# Generate index.json with mode metadata
cat > .sage/tickets/index.json <<EOF
{
  "version": "1.0",
  "migration_mode": "$MIGRATION_MODE",
  "generated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "tickets": [
    $(generate_all_tickets_json)
  ]
}
EOF

echo "✓ Tickets generated"
echo ""
```

**Ticket Templates by Mode:**

#### Full Mode Template (All Tickets)

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

#### Optimized Mode - Lightweight Template (COMPLETED Tickets Only)

```markdown
# [ID]: [Title]

**State:** COMPLETED
**Completed:** 2025-09-15T10:23:00Z

## Summary
Implemented in commits abc123, def456

## Git History
- abc123: feat(auth): add JWT validation logic
- def456: test(auth): add JWT validation tests
```

**Lightweight JSON Schema (COMPLETED):**

```json
{
  "id": "AUTH-001",
  "title": "Implement JWT validation",
  "state": "COMPLETED",
  "type": "implementation",
  "completed_at": "2025-09-15T10:23:00Z",
  "git": {
    "commits": ["abc123", "def456"]
  },
  "summary": "Implemented JWT validation with tests"
}
```

**Token Savings:** ~90% reduction (500 tokens vs 5000 tokens for full detail)

#### Optimized Mode - Full Template (UNPROCESSED/IN_PROGRESS Tickets)

Same as Full Mode template above (includes validation configs, sub-tasks, acceptance criteria)

#### Legacy Mode Template (Git-History Only)

```markdown
# [ID]: [Title]

**State:** COMPLETED
**Type:** inferred
**Inferred From:** Git commit history

## Summary
Historical ticket inferred from codebase analysis

## Git History
- abc123: Initial implementation
- def456: Follow-up changes

## Notes
This ticket was auto-generated from git history.
No documentation available. Marked COMPLETED as code exists.
```

**Legacy JSON Schema:**

```json
{
  "id": "COMP-001",
  "title": "Component Implementation",
  "state": "COMPLETED",
  "type": "legacy",
  "inferred_from": "git-history",
  "completed_at": "2025-09-15T10:23:00Z",
  "git": {
    "commits": ["abc123", "def456"]
  },
  "summary": "Inferred from git history - no documentation",
  "notes": "Auto-generated from existing codebase"
}
```

**Full Index JSON Schema (All Modes):**

```json
{
  "version": "1.0",
  "migration_mode": "optimized",
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

**Note:** Only applies to UNPROCESSED/IN_PROGRESS tickets in full/optimized modes. Lightweight COMPLETED tickets and legacy tickets skip this step.

**Use Sequential Thinking to:**

- **Detect Validation Type**: Analyze task descriptions and infer appropriate validation type
- **Generate Sub-Tasks**: Break down task files into granular sub-tasks with validation scripts
- **Create Component Groupings**: Group related tasks into logical components for checkpointing
- **Add Validation Scripts**: Generate appropriate validation commands based on project structure

```bash
# Skip validation config for lightweight/legacy tickets
if [ "$MIGRATION_MODE" = "legacy" ]; then
  echo "Legacy mode: Skipping validation configuration"
  echo "All tickets are historical COMPLETED records"
  # Jump to step 7 (migration report)
elif [ "$MIGRATION_MODE" = "optimized" ] && [ "$TICKET_STATE" = "COMPLETED" ]; then
  echo "Optimized mode: Skipping validation for COMPLETED ticket $TICKET_ID"
  # Lightweight ticket already generated, skip to next
else
  echo "Adding validation configuration for $TICKET_ID..."
  # Proceed with validation config generation below
fi
```

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
# Calculate statistics
TOTAL_TICKETS=$(cat .sage/tickets/index.json | jq '.tickets | length')
COMPLETED=$(cat .sage/tickets/index.json | jq '[.tickets[] | select(.state == "COMPLETED")] | length')
IN_PROGRESS=$(cat .sage/tickets/index.json | jq '[.tickets[] | select(.state == "IN_PROGRESS")] | length')
DEFERRED=$(cat .sage/tickets/index.json | jq '[.tickets[] | select(.state == "DEFERRED")] | length')
UNPROCESSED=$(cat .sage/tickets/index.json | jq '[.tickets[] | select(.state == "UNPROCESSED")] | length')

COMPLETED_PCT=$((COMPLETED * 100 / TOTAL_TICKETS))
IN_PROGRESS_PCT=$((IN_PROGRESS * 100 / TOTAL_TICKETS))
DEFERRED_PCT=$((DEFERRED * 100 / TOTAL_TICKETS))
UNPROCESSED_PCT=$((UNPROCESSED * 100 / TOTAL_TICKETS))

# Calculate token savings (optimized mode only)
if [ "$MIGRATION_MODE" = "optimized" ]; then
  # Estimate: Full ticket ~5000 tokens, Lightweight ~500 tokens
  FULL_TOKENS=$((UNPROCESSED * 5000 + IN_PROGRESS * 5000))
  LIGHTWEIGHT_TOKENS=$((COMPLETED * 500))
  TOTAL_TOKENS=$((FULL_TOKENS + LIGHTWEIGHT_TOKENS))

  # Compare to full mode (all tickets at 5000 tokens)
  FULL_MODE_TOKENS=$((TOTAL_TICKETS * 5000))
  SAVED_TOKENS=$((FULL_MODE_TOKENS - TOTAL_TOKENS))
  SAVINGS_PCT=$((SAVED_TOKENS * 100 / FULL_MODE_TOKENS))
fi

# Generate report
tee .docs/MIGRATION_REPORT.md <<EOF
# Ticket Migration Report

**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Migration Mode:** $MIGRATION_MODE
**Total Tickets:** $TOTAL_TICKETS

## Summary

| State | Count | Percentage |
|-------|-------|------------|
| COMPLETED | $COMPLETED | ${COMPLETED_PCT}% |
| IN_PROGRESS | $IN_PROGRESS | ${IN_PROGRESS_PCT}% |
| DEFERRED | $DEFERRED | ${DEFERRED_PCT}% |
| UNPROCESSED | $UNPROCESSED | ${UNPROCESSED_PCT}% |

## Migration Mode Details

**Mode:** $MIGRATION_MODE
$(if [ "$MIGRATION_MODE" = "optimized" ]; then
  echo "
**Token Optimization:**
- COMPLETED tickets (lightweight): $COMPLETED × 500 tokens = $LIGHTWEIGHT_TOKENS tokens
- UNPROCESSED/IN_PROGRESS (full): $((UNPROCESSED + IN_PROGRESS)) × 5000 tokens = $FULL_TOKENS tokens
- **Total tokens used:** $TOTAL_TOKENS
- **Tokens saved vs full mode:** $SAVED_TOKENS ($SAVINGS_PCT% reduction)
"
elif [ "$MIGRATION_MODE" = "legacy" ]; then
  echo "
**Legacy Mode:**
- All tickets inferred from git history
- No documentation required
- All tickets marked COMPLETED
- Minimal metadata (git commits only)
"
elif [ "$MIGRATION_MODE" = "full" ]; then
  echo "
**Full Mode:**
- All tickets contain complete validation configs
- COMPLETED tickets retain full historical detail
- Maximum context preservation
"
fi)

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

- .sage/tickets/index.json
- .sage/tickets/AUTH-001.md (N files total)
- .docs/MIGRATION_REPORT.md

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
cat .sage/tickets/index.json | grep -c '"id"'

# Count tickets by state
grep -r "^**State:**" .sage/tickets/*.md | sort | uniq -c

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

- `.sage/tickets/index.json` - Central ticket graph
- `.sage/tickets/[ID].md` - Per-ticket markdown files
- `.docs/MIGRATION_REPORT.md` - Migration summary
- Ready-to-use ticket system for `/implement` and `/stream`

**Workflow Position:**

- **Run Once**: During initial ticket system setup
- **Before**: `/implement`, `/stream`, `/sync`
- **After**: All documentation commands (`/specify`, `/plan`, `/tasks`, etc.)

## Error Scenarios and Recovery

### Missing Documentation (Auto-Handled)

```bash
SPECS_COUNT=$(find docs/specs -name "spec.md" 2>/dev/null | wc -l | tr -d ' ')
DOCS_TOTAL=$((SPECS_COUNT + PLANS_COUNT + TASKS_COUNT + BREAKDOWN_COUNT))

if [ "$DOCS_TOTAL" -eq 0 ]; then
  echo "⚠️  No documentation found - auto-switching to LEGACY mode"
  MIGRATION_MODE="legacy"
fi
```

**Action (Optimized/Full Mode):**
- ❌ ~~Warn user if no specs found, suggest running `/specify` first~~ (OLD BEHAVIOR)
- ✅ **Auto-detect legacy codebase and switch to LEGACY mode** (NEW BEHAVIOR)
- Generate tickets from git history only
- Mark all tickets as COMPLETED (historical record)
- Continue migration without blocking

**Action (Legacy Mode Explicitly Set):**
- Skip documentation scan entirely
- Proceed with git-history-only migration

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
- [ ] .sage/tickets/index.json created with valid structure
- [ ] Per-ticket markdown files generated
- [ ] Migration report produced with statistics
- [ ] Ambiguous cases resolved with user input
- [ ] Ready for `/implement` to process tickets

## Usage Examples

```bash
# Run migration on existing project
/migrate

# Review migration report
cat .docs/MIGRATION_REPORT.md

# Inspect generated tickets
ls .sage/tickets/
cat .sage/tickets/index.json
```

## Notes

- Run this command **once** when introducing ticket system
- After migration, use `/specify`, `/tasks`, etc. to create new tickets
- Use `/implement` to process tickets from the queue
- Use `/sync` to keep GitHub synchronized
- Re-running is safe (will overwrite existing tickets directory)
