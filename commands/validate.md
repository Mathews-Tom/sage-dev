---
allowed-tools: Bash(cat:*), Bash(jq:*), Read
description: Validate ticket system integrity and identify issues before execution.
---

## Role

Quality assurance engineer validating ticket system integrity.

## Purpose

Ensure ticket system is valid and consistent before destructive operations by:
- Validating schema of .sage/tickets/index.json
- Checking for duplicate ticket IDs
- Verifying dependency graph is acyclic
- Validating parent/child relationships
- Checking state transitions are valid
- Identifying orphaned tickets
- Verifying ticket markdown files exist

## Execution

### 0. Check Ticket System Exists

```bash
# Verify ticket system present
if [ ! -f .sage/tickets/index.json ]; then
  echo "ERROR: No ticket system found"
  echo "Expected: .sage/tickets/index.json"
  echo ""
  echo "To create ticket system:"
  echo "  1. Ensure tasks exist: /specify → /plan → /tasks"
  echo "  2. Run: /migrate"
  exit 1
fi

echo "✓ Ticket system found"
```

### 1. Validate JSON Schema

```bash
# Check .sage/tickets/index.json is valid JSON
if ! jq empty .sage/tickets/index.json 2>/dev/null; then
  echo "❌ CRITICAL: .sage/tickets/index.json is not valid JSON"
  echo ""
  echo "Parse error:"
  jq empty .sage/tickets/index.json 2>&1
  echo ""
  echo "Repair options:"
  echo "  1. Restore from backup: /rollback"
  echo "  2. Recreate: /migrate"
  exit 1
fi

echo "✓ Valid JSON structure"
```

### 2. Validate Required Fields

```bash
# Check all tickets have required fields
MISSING_FIELDS=$(jq -r '
  .tickets[] |
  select(
    .id == null or
    .state == null or
    .priority == null or
    .type == null or
    .title == null or
    .validation_type == null
  ) |
  .id // "UNKNOWN"
' .sage/tickets/index.json)

if [ -n "$MISSING_FIELDS" ]; then
  echo "❌ CRITICAL: Tickets missing required fields:"
  echo "$MISSING_FIELDS"
  echo ""
  echo "Required fields: id, state, priority, type, title, validation_type"
  echo ""
  echo "Run: /repair --fix-fields"
  exit 1
fi

echo "✓ All required fields present"
```

### 3. Check for Duplicate Ticket IDs

```bash
# Find duplicate ticket IDs
DUPLICATES=$(jq -r '
  .tickets |
  group_by(.id) |
  map(select(length > 1)) |
  .[] |
  .[0].id
' .sage/tickets/index.json)

if [ -n "$DUPLICATES" ]; then
  echo "❌ CRITICAL: Duplicate ticket IDs found:"
  echo "$DUPLICATES"
  echo ""
  echo "Each ticket must have unique ID"
  echo ""
  echo "Run: /repair --deduplicate"
  exit 1
fi

echo "✓ No duplicate ticket IDs"
```

### 4. Validate Ticket ID Format

```bash
# Check ticket IDs follow convention: [COMPONENT]-[NUMBER]
INVALID_IDS=$(jq -r '
  .tickets[] |
  select(.id | test("^[A-Z0-9]+-[0-9]+$") | not) |
  .id
' .sage/tickets/index.json)

if [ -n "$INVALID_IDS" ]; then
  echo "⚠️  WARNING: Tickets with invalid ID format:"
  echo "$INVALID_IDS"
  echo ""
  echo "Expected format: COMPONENT-NUMBER (e.g., AUTH-001)"
  echo "This is a warning, not blocking execution"
fi

echo "✓ Ticket IDs follow convention"
```

### 5. Validate State Values

```bash
# Check all states are valid
VALID_STATES="UNPROCESSED IN_PROGRESS COMPLETED DEFERRED"
INVALID_STATES=$(jq -r --arg valid "$VALID_STATES" '
  .tickets[] |
  select([.state] | inside($valid | split(" ")) | not) |
  "\(.id): \(.state)"
' .sage/tickets/index.json)

if [ -n "$INVALID_STATES" ]; then
  echo "❌ ERROR: Tickets with invalid state:"
  echo "$INVALID_STATES"
  echo ""
  echo "Valid states: $VALID_STATES"
  echo ""
  echo "Run: /repair --fix-states"
  exit 1
fi

echo "✓ All states valid"
```

### 6. Check Dependency References

```bash
# Verify all dependencies reference existing tickets
ALL_IDS=$(jq -r '.tickets[].id' .sage/tickets/index.json)

INVALID_DEPS=$(jq -r --arg all_ids "$ALL_IDS" '
  .tickets[] |
  select(.dependencies != null) |
  .dependencies[] as $dep |
  select([$dep] | inside($all_ids | split("\n")) | not) |
  "\(.id) depends on \($dep) (NOT FOUND)"
' .sage/tickets/index.json)

if [ -n "$INVALID_DEPS" ]; then
  echo "❌ ERROR: Invalid dependency references:"
  echo "$INVALID_DEPS"
  echo ""
  echo "All dependencies must reference existing tickets"
  echo ""
  echo "Run: /repair --fix-dependencies"
  exit 1
fi

echo "✓ All dependencies valid"
```

### 7. Detect Circular Dependencies

```bash
# Check for circular dependencies in dependency graph
# Algorithm: Topological sort, detect back edges

CIRCULAR_DEPS=$(jq -r '
  # Build adjacency list
  .tickets |
  map({id: .id, deps: (.dependencies // [])}) |

  # Detect cycles using DFS
  # (Simplified: check if any ticket is in its own transitive dependencies)
  . as $tickets |
  .[] |
  select(
    .deps |
    length > 0 and
    any(
      . as $dep |
      $tickets |
      map(select(.id == $dep).deps // []) |
      flatten |
      any(. == .id)
    )
  ) |
  .id
' .sage/tickets/index.json 2>/dev/null || echo "")

if [ -n "$CIRCULAR_DEPS" ]; then
  echo "❌ ERROR: Circular dependencies detected:"
  echo "$CIRCULAR_DEPS"
  echo ""
  echo "Dependency graph must be acyclic"
  echo ""
  echo "Run: /repair --break-cycles"
  exit 1
fi

echo "✓ No circular dependencies"
```

### 8. Validate Parent Relationships

```bash
# Check parent tickets exist for stories/subtasks
ORPHANED_TICKETS=$(jq -r '
  . as $root |
  .tickets[] |
  select(.parent != null) |
  select(
    [.parent] |
    inside($root.tickets | map(.id)) |
    not
  ) |
  "\(.id) has missing parent: \(.parent)"
' .sage/tickets/index.json)

if [ -n "$ORPHANED_TICKETS" ]; then
  echo "❌ ERROR: Orphaned tickets (parent not found):"
  echo "$ORPHANED_TICKETS"
  echo ""
  echo "Run: /repair --fix-parents"
  exit 1
fi

echo "✓ All parent relationships valid"
```

### 9. Check Ticket Markdown Files

```bash
# Verify ticket markdown files exist for all tickets
MISSING_FILES=$(jq -r '
  .tickets[] |
  ".sage/tickets/\(.id).md"
' .sage/tickets/index.json | while read ticket_file; do
  if [ ! -f "$ticket_file" ]; then
    echo "$ticket_file"
  fi
done)

if [ -n "$MISSING_FILES" ]; then
  echo "⚠️  WARNING: Ticket markdown files missing:"
  echo "$MISSING_FILES"
  echo ""
  echo "Run: /repair --create-missing-files"
fi

echo "✓ All ticket files exist"
```

### 10. Validate Priority Values

```bash
# Check priorities are valid
VALID_PRIORITIES="P0 P1 P2 P3 P4"
INVALID_PRIORITIES=$(jq -r --arg valid "$VALID_PRIORITIES" '
  .tickets[] |
  select([.priority] | inside($valid | split(" ")) | not) |
  "\(.id): \(.priority)"
' .sage/tickets/index.json)

if [ -n "$INVALID_PRIORITIES" ]; then
  echo "⚠️  WARNING: Tickets with non-standard priority:"
  echo "$INVALID_PRIORITIES"
  echo ""
  echo "Standard priorities: $VALID_PRIORITIES"
  echo "This is a warning, not blocking execution"
fi

echo "✓ Priorities valid"
```

### 11. Validate Ticket Type Values

```bash
# Check ticket type is valid enum
VALID_TICKET_TYPES="implementation enhancement bugfix refactor"
INVALID_TICKET_TYPES=$(jq -r --arg valid "$VALID_TICKET_TYPES" '
  .tickets[] |
  select([.type] | inside($valid | split(" ")) | not) |
  "\(.id): \(.type)"
' .sage/tickets/index.json)

if [ -n "$INVALID_TICKET_TYPES" ]; then
  echo "❌ ERROR: Tickets with invalid type:"
  echo "$INVALID_TICKET_TYPES"
  echo ""
  echo "Valid ticket types: $VALID_TICKET_TYPES"
  echo ""
  echo "Run: /repair --fix-ticket-types"
  exit 1
fi

echo "✓ All ticket types valid"
```

### 12. Validate Validation Type Values

```bash
# Check validation_type is valid enum
VALID_VALIDATION_TYPES="stateflow content interactive integration generic"
INVALID_VALIDATION_TYPES=$(jq -r --arg valid "$VALID_VALIDATION_TYPES" '
  .tickets[] |
  select([.validation_type] | inside($valid | split(" ")) | not) |
  "\(.id): \(.validation_type)"
' .sage/tickets/index.json)

if [ -n "$INVALID_VALIDATION_TYPES" ]; then
  echo "❌ ERROR: Tickets with invalid validation_type:"
  echo "$INVALID_VALIDATION_TYPES"
  echo ""
  echo "Valid validation types: $VALID_VALIDATION_TYPES"
  echo ""
  echo "Run: /repair --fix-validation-types"
  exit 1
fi

echo "✓ All validation types valid"
```

### 13. Validate Sub-Task Schema

```bash
# Check sub-task arrays have valid structure
INVALID_TASKS=$(jq -r '
  .tickets[] |
  select(.tasks != null) |
  select(
    .tasks |
    any(
      .id == null or
      .type == null or
      .description == null or
      .status == null
    )
  ) |
  .id
' .sage/tickets/index.json)

if [ -n "$INVALID_TASKS" ]; then
  echo "❌ ERROR: Tickets with invalid sub-task schema:"
  echo "$INVALID_TASKS"
  echo ""
  echo "Sub-tasks must have: id, type, description, status"
  echo ""
  echo "Run: /repair --fix-task-schema"
  exit 1
fi

echo "✓ Sub-task schema valid"
```

### 14. Validate Validation Scripts

```bash
# Check validation scripts are well-formed
INVALID_SCRIPTS=$(jq -r '
  .tickets[] |
  select(.tasks != null) |
  .id as $ticket_id |
  .tasks[] |
  select(.validation_script != null) |
  select(.validation_script | length == 0) |
  "\($ticket_id) / \(.id): empty validation_script"
' .sage/tickets/index.json)

if [ -n "$INVALID_SCRIPTS" ]; then
  echo "⚠️  WARNING: Tasks with empty validation scripts:"
  echo "$INVALID_SCRIPTS"
  echo ""
  echo "Validation scripts should not be empty strings"
  echo "This is a warning, not blocking execution"
fi

echo "✓ Validation scripts well-formed"
```

### 15. Check Component Checkpoints

```bash
# Verify component checkpoints reference valid git states (if set)
INVALID_CHECKPOINTS=$(jq -r '
  .tickets[] |
  select(.components != null) |
  .id as $ticket_id |
  .components[] |
  select(.checkpoint_id != null and .checkpoint_id != "") |
  "\($ticket_id) / \(.name): \(.checkpoint_id)"
' .sage/tickets/index.json)

if [ -n "$INVALID_CHECKPOINTS" ]; then
  echo "Checking component checkpoints..."

  # Verify each checkpoint exists in git
  echo "$INVALID_CHECKPOINTS" | while IFS=':' read ticket_component checkpoint_id; do
    # Trim whitespace
    checkpoint_id=$(echo "$checkpoint_id" | xargs)

    # Check if checkpoint exists in git
    if ! git rev-parse "$checkpoint_id" >/dev/null 2>&1; then
      echo "⚠️  WARNING: Invalid checkpoint: $ticket_component -> $checkpoint_id"
    fi
  done
fi

echo "✓ Component checkpoints valid"
```

### 16. Generate Validation Report

```bash
# Summary statistics
TOTAL_TICKETS=$(jq '.tickets | length' .sage/tickets/index.json)
UNPROCESSED=$(jq '[.tickets[] | select(.state == "UNPROCESSED")] | length' .sage/tickets/index.json)
IN_PROGRESS=$(jq '[.tickets[] | select(.state == "IN_PROGRESS")] | length' .sage/tickets/index.json)
COMPLETED=$(jq '[.tickets[] | select(.state == "COMPLETED")] | length' .sage/tickets/index.json)
DEFERRED=$(jq '[.tickets[] | select(.state == "DEFERRED")] | length' .sage/tickets/index.json)

# New statistics
WITH_SUBTASKS=$(jq '[.tickets[] | select(.tasks != null and (.tasks | length > 0))] | length' .sage/tickets/index.json)
WITH_VALIDATION=$(jq '[.tickets[] | select(.validation_config != null)] | length' .sage/tickets/index.json)
WITH_COMPONENTS=$(jq '[.tickets[] | select(.components != null and (.components | length > 0))] | length' .sage/tickets/index.json)

echo ""
echo "================================================"
echo "✅ TICKET SYSTEM VALIDATION PASSED"
echo "================================================"
echo ""
echo "Total Tickets: $TOTAL_TICKETS"
echo ""
echo "By State:"
echo "  UNPROCESSED:  $UNPROCESSED"
echo "  IN_PROGRESS:  $IN_PROGRESS"
echo "  COMPLETED:    $COMPLETED"
echo "  DEFERRED:     $DEFERRED"
echo ""
echo "Enhanced Features:"
echo "  With Sub-Tasks:      $WITH_SUBTASKS"
echo "  With Validation:     $WITH_VALIDATION"
echo "  With Components:     $WITH_COMPONENTS"
echo ""
echo "Validation Checks:"
echo "  ✓ Valid JSON schema"
echo "  ✓ No duplicate IDs"
echo "  ✓ All required fields present"
echo "  ✓ Ticket ID format valid"
echo "  ✓ State values valid"
echo "  ✓ Ticket type values valid"
echo "  ✓ Validation type values valid"
echo "  ✓ Sub-task schema valid"
echo "  ✓ Validation scripts well-formed"
echo "  ✓ Component checkpoints valid"
echo "  ✓ Dependencies valid"
echo "  ✓ No circular dependencies"
echo "  ✓ Parent relationships valid"
echo "  ✓ Ticket files exist"
echo "  ✓ Priority values valid"
echo ""
echo "Safe to run:"
echo "  - /stream"
echo "  - /implement <ticket-id>"
echo "  - /sync"
echo "================================================"
```

## Validation Modes

### Quick Validation

```bash
/validate
# Default: Run all critical checks only
# Skips warnings, only fails on errors
```

### Strict Validation

```bash
/validate --strict
# Fail on warnings too
# Enforce all best practices
```

### Verbose Validation

```bash
/validate --verbose
# Show detailed information for each check
# List all tickets checked
```

### Specific Checks

```bash
/validate --check=dependencies
# Only run dependency validation

/validate --check=duplicates
# Only check for duplicate IDs

/validate --check=schema
# Only validate JSON schema
```

## Integration with Other Commands

### Pre-flight Validation

Commands should validate before execution:

```bash
# /stream integration
### 0. Pre-flight Validation
/validate
if [ $? -ne 0 ]; then
  echo "Ticket validation failed. Fix issues before running /stream"
  exit 1
fi

# /sync integration
### 0. Validate Before Sync
/validate
if [ $? -ne 0 ]; then
  echo "Cannot sync invalid ticket system"
  exit 1
fi
```

### Post-migration Validation

```bash
# After /migrate
/migrate
/validate  # Verify migration succeeded

# After /repair
/repair --fix-all
/validate  # Verify repairs worked
```

## Common Validation Errors

### Error: Duplicate Ticket IDs

```text
❌ CRITICAL: Duplicate ticket IDs found:
AUTH-001

Solution: /repair --deduplicate
```

**Cause:** Same ticket ID assigned multiple times
**Fix:** Repair command renumbers duplicates

### Error: Circular Dependencies

```text
❌ ERROR: Circular dependencies detected:
AUTH-001
AUTH-002

Solution: /repair --break-cycles
```

**Cause:** Ticket A depends on B, B depends on A
**Fix:** Repair command removes circular edges

### Error: Invalid State

```text
❌ ERROR: Tickets with invalid state:
AUTH-001: DONE

Valid states: UNPROCESSED IN_PROGRESS COMPLETED DEFERRED

Solution: /repair --fix-states
```

**Cause:** State changed manually to non-standard value
**Fix:** Repair maps non-standard states to valid ones

### Error: Missing Parent

```text
❌ ERROR: Orphaned tickets (parent not found):
AUTH-002 has missing parent: AUTH-999

Solution: /repair --fix-parents
```

**Cause:** Parent ticket deleted but child still references it
**Fix:** Repair removes parent reference or reassigns

## Exit Codes

- **0** - Validation passed, ticket system valid
- **1** - Critical errors found, ticket system invalid
- **2** - Warnings only, ticket system usable but not ideal

## Success Criteria

- [ ] .sage/tickets/index.json is valid JSON
- [ ] All required fields present
- [ ] No duplicate ticket IDs
- [ ] Ticket IDs follow convention
- [ ] All states are valid
- [ ] Dependencies reference existing tickets
- [ ] No circular dependencies
- [ ] Parent relationships valid
- [ ] All ticket markdown files exist
- [ ] Priorities valid
- [ ] Type hierarchy correct

## Notes

- Validation is non-destructive (read-only)
- Use `/repair` to fix detected issues
- Some checks are warnings (non-blocking)
- Critical checks block execution
- Integration with checkpoint system (no checkpoint needed for validation)
- Safe to run multiple times
- Run before any destructive ticket operation
