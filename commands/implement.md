---
allowed-tools: Bash(git:*), Bash(cat:*), Bash(jq:*), Bash(grep:*), Bash(test:*), Read, Write, Edit, SequentialThinking
description: Execute ticket-based implementation following Ticket Clearance Methodology with automatic state management and test validation.
argument-hint: '[ticket-id] (optional, defaults to next UNPROCESSED ticket)'
---

## Role

Implementation engineer executing ticket-based development following the Ticket Clearance Methodology.

## Purpose

Transform tickets into working code through systematic implementation:

- **Ticket Selection**: Automatically select next UNPROCESSED ticket with satisfied dependencies
- **State Management**: Follow ticket state machine (UNPROCESSED → IN_PROGRESS → COMPLETED/DEFERRED)
- **Branch Management**: Create and manage feature branches per ticket
- **Code Implementation**: Generate code based on ticket context (spec, plan, breakdown)
- **Test Creation**: Create and validate comprehensive tests
- **Atomic Commits**: Commit changes during implementation with ticket ID references
- **Dependency Validation**: Verify dependencies before starting work
- **Error Recovery**: Handle failures with automatic retry or defer

## Execution

### 0. Workflow Mode Validation

```bash
# Check workflow mode (added for Issue 1.1 - Dual Workflow Confusion)
if [ -f .sage/workflow-mode ]; then
  WORKFLOW_MODE=$(cat .sage/workflow-mode)
  if [ "$WORKFLOW_MODE" != "TICKET_BASED" ]; then
    echo "ERROR: /implement requires TICKET_BASED workflow mode"
    echo "Current mode: $WORKFLOW_MODE"
    echo ""
    echo "To use ticket-based implementation:"
    echo "  1. Run /migrate to convert to ticket system"
    echo "  2. Or run /workflow to reconfigure"
    exit 1
  fi
else
  echo "WARNING: No workflow mode set. Run /workflow first."
  echo "Proceeding with ticket-based mode detection..."
fi
```

### 1. Ticket Selection

```bash
# Verify ticket system exists
test -f tickets/index.json || {
  echo "ERROR: Ticket system not found"
  echo ""
  echo "Next steps:"
  echo "  1. Run /workflow to choose workflow"
  echo "  2. Run /migrate to create ticket system"
  echo "  3. Or run traditional workflow: /specify → /plan → /tasks → /blueprint"
  exit 1
}

# If user specified ticket ID, validate it
TICKET_ID="${1}"  # From argument

# If no ticket specified, select next UNPROCESSED with satisfied dependencies
if [ -z "$TICKET_ID" ]; then
  TICKET_ID=$(cat tickets/index.json | jq -r '
    .tickets[] |
    select(.state == "UNPROCESSED") |
    select(
      if .dependencies then
        all(.dependencies[]; . as $dep |
          any($index.tickets[]; .id == $dep and .state == "COMPLETED")
        )
      else true end
    ) |
    .id
  ' | head -n 1)
fi

# Load ticket data
TICKET_DATA=$(cat tickets/index.json | jq ".tickets[] | select(.id == \"$TICKET_ID\")")
```

**Key Actions:**

- Accept optional ticket ID argument or auto-select
- Query `tickets/index.json` for UNPROCESSED tickets
- Filter by satisfied dependencies (all dependencies COMPLETED)
- Sort by priority (P0 > P1 > P2)
- Validate ticket exists and is actionable

### 2. Mark Ticket IN_PROGRESS

```bash
# Update ticket state in index.json
# State: UNPROCESSED → IN_PROGRESS

# Update ticket markdown
cat >> tickets/${TICKET_ID}.md <<EOF

## Implementation Started
**Started:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Status:** IN_PROGRESS
EOF

# Record updated timestamp in index.json
```

**Key Actions:**

- Update `tickets/index.json`: state = "IN_PROGRESS"
- Append status to `tickets/[ID].md`
- Record start timestamp
- This ensures resumption safety if interrupted

### 3. Analyze Requirements

```bash
# Load ticket context documents
SPEC_PATH=$(echo $TICKET_DATA | jq -r '.docs.spec')
PLAN_PATH=$(echo $TICKET_DATA | jq -r '.docs.plan')
BREAKDOWN_PATH=$(echo $TICKET_DATA | jq -r '.docs.breakdown // empty')
TASKS_PATH=$(echo $TICKET_DATA | jq -r '.docs.tasks // empty')

# Read context documents
test -f "$SPEC_PATH" && cat "$SPEC_PATH"
test -f "$PLAN_PATH" && cat "$PLAN_PATH"
test -f "$BREAKDOWN_PATH" && cat "$BREAKDOWN_PATH"
test -f "$TASKS_PATH" && cat "$TASKS_PATH"

# Extract acceptance criteria from ticket
echo $TICKET_DATA | jq -r '.acceptanceCriteria[]'
```

**Key Actions:**

- Read all linked documentation (spec, plan, breakdown, tasks)
- Extract acceptance criteria from ticket
- Use SequentialThinking to understand requirements
- Identify files to create/modify
- Determine testing approach

### 4. Check Dependencies

```bash
# Verify all dependencies are COMPLETED
DEPENDENCIES=$(echo $TICKET_DATA | jq -r '.dependencies[]?')

for DEP in $DEPENDENCIES; do
  DEP_STATE=$(cat tickets/index.json | jq -r ".tickets[] | select(.id == \"$DEP\") | .state")

  if [ "$DEP_STATE" != "COMPLETED" ]; then
    echo "ERROR: Dependency $DEP not satisfied (state: $DEP_STATE)"
    # Mark ticket DEFERRED
    # Update tickets/index.json and tickets/[ID].md
    exit 1
  fi
done
```

**Key Actions:**

- Parse dependency list from ticket
- Check each dependency state in `index.json`
- If any dependency not COMPLETED → DEFER ticket
- Update ticket with deferral reason
- Exit early (no implementation attempted)

### 5. Create Feature Branch

```bash
# Generate branch name from ticket ID
BRANCH_NAME="feature/${TICKET_ID,,}"  # lowercase

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)

# Create and switch to feature branch if needed
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
  git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
fi

# Update ticket with branch info
cat >> tickets/${TICKET_ID}.md <<EOF
**Branch:** $BRANCH_NAME
EOF
```

**Key Actions:**

- Generate branch name: `feature/auth-001`
- Create branch from current HEAD
- Switch to feature branch
- Record branch name in ticket

### 6. Implement Solution

```bash
# Read breakdown for implementation guidance
test -f "$BREAKDOWN_PATH" && cat "$BREAKDOWN_PATH"

# Identify files to create/modify
# Implement code based on:
# - Acceptance criteria
# - Architecture from plan
# - Patterns from breakdown
# - Existing codebase conventions
```

**Key Actions:**

- Parse breakdown for technical specifications
- Identify code files to create or modify
- Implement functionality per acceptance criteria
- Follow architecture patterns from plan
- Maintain existing code conventions
- Update imports, dependencies, configurations

### 7. Atomic Commits During Implementation

```bash
# Commit logical units of work during implementation
git add [files]
git commit -m "feat(component): #${TICKET_ID} implement [feature]"

# Record commits in ticket
COMMIT_SHA=$(git rev-parse HEAD)
cat >> tickets/${TICKET_ID}.md <<EOF
- [$COMMIT_SHA]: [commit message]
EOF
```

**Key Actions:**

- Make atomic commits during implementation
- Include ticket ID in commit messages
- Record commit SHAs in ticket markdown
- Maintain clean commit history

### 8. Test Creation and Validation

```bash
# Create tests based on breakdown specifications
# Run tests to validate implementation
uv run pytest tests/ -v

# Check test coverage if applicable
uv run pytest --cov=src tests/
```

**Key Actions:**

- Create comprehensive tests for implemented functionality
- Follow testing patterns from breakdown documentation
- Run test suite to validate implementation
- Ensure all tests pass before marking phase complete
- Handle test failures with automatic fixes where possible

### 9. Request User Confirmation

**Confirmation Prompt:**

```
Ticket AUTH-001 implementation complete:

✓ Code implemented (files: auth.py, jwt_utils.py)
✓ Tests created and passing (test_auth.py)
✓ 3 atomic commits made
✓ Feature branch: feature/auth-001

Acceptance Criteria Met:
✓ JWT validation functional
✓ Token expiration handling
✓ Tests covering edge cases

Confirm completion? [Y/n]
```

**Key Actions:**

- Display implementation summary
- Show acceptance criteria status
- Request user confirmation
- If user confirms → proceed to completion
- If user rejects → ask for rollback or deferral

### 10. Handle Confirmation Response

**If User Confirms:**

```bash
# Mark ticket COMPLETED
# Update tickets/index.json: state = "COMPLETED"
# Update tickets/[ID].md with completion details
# Proceed to finalization
```

**If User Rejects:**

```bash
# Offer options:
# 1. ROLLBACK changes and DEFER ticket
# 2. Keep changes but DEFER ticket (needs more work)
# 3. Continue implementation (back to step 6)

# If rollback chosen:
git reset --hard [pre-implementation-commit]
# Mark ticket DEFERRED with reason
```

**Key Actions:**

- Respect user judgment on completion
- Provide rollback option for failed work
- Allow deferral for tickets needing more time
- Record reason for deferral in ticket notes

### 11. Mark Ticket COMPLETED

```bash
# Update ticket state
# State: IN_PROGRESS → COMPLETED

# Update tickets/index.json
cat tickets/index.json | jq '
  .tickets |= map(
    if .id == "'$TICKET_ID'" then
      .state = "COMPLETED" |
      .updated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    else . end
  )
' > tickets/index.json.tmp && mv tickets/index.json.tmp tickets/index.json

# Update ticket markdown
cat >> tickets/${TICKET_ID}.md <<EOF

## Implementation Complete
**Completed:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Status:** COMPLETED
**Commits:** [list of commit SHAs]
**Branch:** $BRANCH_NAME
**Tests:** All passing
EOF
```

**Key Actions:**

- Update state in `index.json`
- Append completion details to markdown
- Record final commit list
- Mark completion timestamp
- Ready for `/commit` and `/sync`

### 12. Error Handling and Recovery

**Automatic Fixes:**

- Import errors: Add missing imports
- Syntax errors: Fix common syntax issues
- Test failures: Adjust test expectations for implementation changes
- Configuration issues: Update config files for new components

**Defer Ticket on Error:**

- Complex logic errors → DEFERRED
- Architecture conflicts → DEFERRED (needs design review)
- Unmet dependencies → DEFERRED (blocked)
- Test failures after multiple attempts → DEFERRED

**Manual Intervention Required:**

- Breaking API changes (user decision needed)
- Database migration issues (manual review)
- Security concerns (expert review)

## Ticket Clearance Methodology

This implementation follows the state machine defined in `Ticket_Clearance_Methodology.md`:

```
START
  ↓
SELECT_NEXT_UNPROCESSED_TICKET (Step 1)
  ↓
OPEN_TICKET (Step 2: Mark IN_PROGRESS)
  ↓
ANALYZE_REQUIREMENTS (Step 3)
  ↓
CHECK_DEPENDENCIES (Step 4)
  ↓
dependencies_met? --NO--> DEFER_TICKET
  ↓ YES
IMPLEMENT_SOLUTION (Steps 5-6)
  ↓
COMMIT_ATOMIC_CHANGES (Step 7)
  ↓
TEST_THOROUGHLY (Step 8)
  ↓
tests_pass? --NO--> DEBUG_FIX --> TEST_THOROUGHLY
  ↓ YES
REQUEST_USER_CONFIRMATION (Step 9)
  ↓
user_confirms? --NO--> ROLLBACK_CHANGES --> DEFER_TICKET
  ↓ YES
MARK_TICKET_COMPLETED (Step 11)
  ↓
UPDATE_TICKET_WITH_COMMITS
  ↓
CLOSE_TICKET (ready for /commit and /sync)
```

## Integration Points

**Inputs:**

- `tickets/index.json` - Ticket queue and states
- `tickets/[ID].md` - Per-ticket details and acceptance criteria
- `docs/specs/*/spec.md` - Component specifications
- `docs/specs/*/plan.md` - Architecture and dependencies
- `docs/breakdown/*/breakdown.md` - Implementation details
- Current git branch and repository state

**Outputs:**

- Implemented code files following specifications
- Updated `tickets/index.json` with new state (COMPLETED/DEFERRED)
- Updated `tickets/[ID].md` with implementation details
- Feature branch with atomic commits
- Comprehensive test suite
- Ready for `/commit` and `/sync`

**Workflow Position:**

- **After**: `/tasks` (ticket generation) or `/migrate` (initial setup)
- **Called By**: `/stream` (automated loop)
- **Before**: `/commit` (finalize work), `/sync` (push to GitHub)

## Error Scenarios and Recovery

### Missing Dependencies

```bash
# Check if prior phase files exist
test -f src/component.py || echo "Missing dependency: component.py"
```

**Action**: Confirm with user how to proceed with missing dependencies

### Test Failures

```bash
# Attempt automatic test fixes
# Update test expectations based on implementation
# Fix common assertion errors
```

**Action**: Auto-fix common issues, require manual intervention for complex failures

### Git Conflicts

```bash
# Check for merge conflicts
git status | grep -E "both modified|both added"
```

**Action**: Guide user through conflict resolution

### Invalid Phase Specification

```bash
# Show available phases from blueprint
grep -E "^## Phase" docs/blueprint.md
```

**Action**: Display available phases and prompt for valid selection

## Success Criteria

- [ ] Phase correctly identified and validated
- [ ] Appropriate feature branch created/selected
- [ ] All phase tasks implemented according to breakdown specifications
- [ ] Task progress updated with checkboxes and status labels
- [ ] Comprehensive tests created and passing
- [ ] Code follows existing patterns and conventions
- [ ] Phase marked as completed in tracking system
- [ ] Ready for `/commit` command to create PR

## Usage Examples

```bash
# Auto-select and implement next UNPROCESSED ticket
/implement

# Implement specific ticket by ID
/implement AUTH-001

# Resume work on IN_PROGRESS ticket
/implement AUTH-002
```

## Notes

- Follows Ticket Clearance Methodology state machine strictly
- Operates on single ticket (atomic work unit)
- Updates ticket state throughout execution
- Creates feature branch per ticket
- Makes atomic commits with ticket ID references
- Requires user confirmation before marking COMPLETED
- Safely handles interruption (resume from ticket state)
- Integrated into `/stream` for automated execution
- Can be run manually for targeted ticket implementation
