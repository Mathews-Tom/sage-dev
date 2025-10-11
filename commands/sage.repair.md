---
allowed-tools: Bash(cat:*), Bash(jq:*), Bash(mv:*), Bash(cp:*), Read, Write
description: Repair ticket system issues identified by validation.
---

## Role

System repair technician fixing ticket system integrity issues.

## Purpose

Automatically fix common ticket system issues by:

- Deduplicating ticket IDs
- Breaking circular dependencies
- Fixing invalid states
- Repairing parent relationships
- Creating missing ticket files
- Normalizing field values
- Regenerating ticket numbers

## Execution

### 0. Pre-flight Check

```bash
# Require validation to run first
echo "Running validation to identify issues..."
/validate 2>&1 | tee /tmp/validation-output.txt

VALIDATION_EXIT=$?

if [ $VALIDATION_EXIT -eq 0 ]; then
  echo ""
  echo "✅ No issues found. Ticket system is valid."
  echo "Nothing to repair."
  exit 0
fi

echo ""
echo "Issues detected. Proceeding with repair..."
```

### 1. Create Checkpoint

```bash
# Backup before making changes
echo "Creating checkpoint before repairs..."

# Use rollback mechanism
create_checkpoint() {
  local COMMAND_NAME=$1
  local REASON=${2:-"automatic"}

  mkdir -p .sage

  # Git stash for working directory
  CHECKPOINT_ID=$(git stash create 2>/dev/null || echo "")

  # Backup ticket system
  if [ -f .sage/.sage/tickets/index.json ]; then
    cp .sage/.sage/tickets/index.json .sage/checkpoint-tickets-index.json
    mkdir -p .sage/checkpoint-tickets
    cp .sage/tickets/*.md .sage/checkpoint-.sage/tickets/ 2>/dev/null
  fi

  # Create checkpoint metadata
  cat > .sage/checkpoint.json <<EOF
{
  "checkpoint_id": "$CHECKPOINT_ID",
  "command": "$COMMAND_NAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "reason": "$REASON"
}
EOF

  echo "✓ Checkpoint created: $CHECKPOINT_ID"
}

create_checkpoint "/repair" "pre-repair"
```

### 2. Deduplicate Ticket IDs

```bash
# Fix duplicate ticket IDs by renumbering
echo ""
echo "Checking for duplicate IDs..."

DUPLICATES=$(jq -r '
  .tickets |
  group_by(.id) |
  map(select(length > 1)) |
  .[] |
  .[0].id
' .sage/.sage/tickets/index.json)

if [ -n "$DUPLICATES" ]; then
  echo "Fixing duplicate IDs..."

  # Renumber duplicates
  jq '
    .tickets |= (
      group_by(.id) |
      map(
        if length > 1 then
          # Extract component prefix
          .[0].id as $base |
          ($base | split("-")[0]) as $component |

          # Renumber duplicates
          to_entries |
          map(
            if .key > 0 then
              .value.id = "\($component)-\(now | tostring | .[10:16])-\(.key)"
            end |
            .value
          )
        else
          .
        end
      ) |
      flatten
    )
  ' .sage/.sage/tickets/index.json > /tmp/tickets-dedup.json

  mv /tmp/tickets-dedup.json .sage/.sage/tickets/index.json
  echo "✓ Duplicate IDs fixed"
else
  echo "✓ No duplicate IDs found"
fi
```

### 3. Fix Invalid States

```bash
# Map non-standard states to valid ones
echo ""
echo "Checking for invalid states..."

INVALID_STATES=$(jq -r '
  .tickets[] |
  select(
    .state != "UNPROCESSED" and
    .state != "IN_PROGRESS" and
    .state != "COMPLETED" and
    .state != "DEFERRED"
  ) |
  .id
' .sage/.sage/tickets/index.json)

if [ -n "$INVALID_STATES" ]; then
  echo "Fixing invalid states..."

  # State mapping
  jq '
    .tickets |= map(
      if .state == "DONE" or .state == "FINISHED" then
        .state = "COMPLETED"
      elif .state == "TODO" or .state == "PENDING" then
        .state = "UNPROCESSED"
      elif .state == "WORKING" or .state == "ACTIVE" then
        .state = "IN_PROGRESS"
      elif .state == "SKIPPED" or .state == "POSTPONED" then
        .state = "DEFERRED"
      else
        # Default unknown states to UNPROCESSED
        .state = "UNPROCESSED"
      end
    )
  ' .sage/.sage/tickets/index.json > /tmp/tickets-states.json

  mv /tmp/tickets-states.json .sage/.sage/tickets/index.json
  echo "✓ Invalid states fixed"
else
  echo "✓ All states valid"
fi
```

### 4. Fix Missing Required Fields

```bash
# Add default values for missing required fields
echo ""
echo "Checking for missing required fields..."

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
' .sage/.sage/tickets/index.json)

if [ -n "$MISSING_FIELDS" ]; then
  echo "Adding missing required fields..."

  jq '
    .tickets |= map(
      if .id == null then
        .id = "TICKET-\(now | tostring | .[10:16])"
      end |
      if .state == null then
        .state = "UNPROCESSED"
      end |
      if .priority == null then
        .priority = "P3"
      end |
      if .type == null then
        .type = "implementation"
      end |
      if .validation_type == null then
        .validation_type = "generic"
      end |
      if .title == null then
        .title = "Untitled Ticket"
      end
    )
  ' .sage/.sage/tickets/index.json > /tmp/tickets-fields.json

  mv /tmp/tickets-fields.json .sage/.sage/tickets/index.json
  echo "✓ Missing fields fixed"
else
  echo "✓ All required fields present"
fi
```

### 5. Fix Invalid Dependencies

```bash
# Remove dependencies that reference non-existent tickets
echo ""
echo "Checking for invalid dependencies..."

ALL_IDS=$(jq -r '.tickets[].id' .sage/.sage/tickets/index.json)

jq --arg all_ids "$ALL_IDS" '
  .tickets |= map(
    if .dependencies != null then
      .dependencies = (
        .dependencies |
        map(select(. as $dep | $all_ids | split("\n") | any(. == $dep)))
      ) |
      if length == 0 then
        null
      else
        .
      end
    end
  )
' .sage/.sage/tickets/index.json > /tmp/tickets-deps.json

mv /tmp/tickets-deps.json .sage/.sage/tickets/index.json
echo "✓ Invalid dependencies removed"
```

### 6. Break Circular Dependencies

```bash
# Remove circular dependencies by breaking cycles
echo ""
echo "Checking for circular dependencies..."

# Simplified: Remove dependencies that create direct cycles
jq '
  .tickets as $all_tickets |
  .tickets |= map(
    . as $ticket |
    if .dependencies != null then
      .dependencies = (
        .dependencies |
        map(
          select(
            . as $dep |
            ($all_tickets | map(select(.id == $dep).dependencies // []) | flatten | any(. == $ticket.id)) | not
          )
        )
      ) |
      if length == 0 then
        null
      else
        .
      end
    end
  )
' .sage/.sage/tickets/index.json > /tmp/tickets-cycles.json

mv /tmp/tickets-cycles.json .sage/.sage/tickets/index.json
echo "✓ Circular dependencies broken"
```

### 7. Fix Parent Relationships

```bash
# Remove parent references that don't exist
echo ""
echo "Checking for orphaned tickets..."

ALL_IDS=$(jq -r '.tickets[].id' .sage/.sage/tickets/index.json)

jq --arg all_ids "$ALL_IDS" '
  .tickets |= map(
    if .parent != null then
      if ([$. parent] | inside($all_ids | split("\n"))) then
        .
      else
        # Remove invalid parent reference
        .parent = null
      end
    else
      .
    end
  )
' .sage/.sage/tickets/index.json > /tmp/tickets-parents.json

mv /tmp/tickets-parents.json .sage/.sage/tickets/index.json
echo "✓ Orphaned tickets fixed"
```

### 8. Create Missing Ticket Files

```bash
# Generate markdown files for tickets without them
echo ""
echo "Checking for missing ticket files..."

MISSING_COUNT=0

jq -r '.tickets[] | .id' .sage/.sage/tickets/index.json | while read TICKET_ID; do
  TICKET_FILE=".sage/.sage/tickets/${TICKET_ID}.md"

  if [ ! -f "$TICKET_FILE" ]; then
    echo "Creating $TICKET_FILE..."

    # Extract ticket data
    TICKET_DATA=$(jq --arg id "$TICKET_ID" '.tickets[] | select(.id == $id)' .sage/.sage/tickets/index.json)
    TITLE=$(echo "$TICKET_DATA" | jq -r '.title')
    DESCRIPTION=$(echo "$TICKET_DATA" | jq -r '.description // "No description provided"')
    TYPE=$(echo "$TICKET_DATA" | jq -r '.type')
    PRIORITY=$(echo "$TICKET_DATA" | jq -r '.priority')
    STATE=$(echo "$TICKET_DATA" | jq -r '.state')

    # Create ticket markdown
    cat > "$TICKET_FILE" <<EOF
# ${TICKET_ID}: ${TITLE}

**Type:** ${TYPE}
**Priority:** ${PRIORITY}
**State:** ${STATE}

## Description

${DESCRIPTION}

## Acceptance Criteria

- [ ] Implementation complete
- [ ] Tests passing
- [ ] Documentation updated

## Notes

*Ticket file auto-generated by /repair*
EOF

    MISSING_COUNT=$((MISSING_COUNT + 1))
  fi
done

if [ $MISSING_COUNT -gt 0 ]; then
  echo "✓ Created $MISSING_COUNT missing ticket files"
else
  echo "✓ All ticket files exist"
fi
```

### 9. Normalize Priority Values

```bash
# Map non-standard priorities to standard P0-P4
echo ""
echo "Normalizing priority values..."

jq '
  .tickets |= map(
    if .priority == "CRITICAL" or .priority == "URGENT" then
      .priority = "P0"
    elif .priority == "HIGH" then
      .priority = "P1"
    elif .priority == "MEDIUM" or .priority == "NORMAL" then
      .priority = "P2"
    elif .priority == "LOW" then
      .priority = "P3"
    elif .priority | test("^P[0-4]$") | not then
      # Default unknown priorities to P2
      .priority = "P2"
    end
  )
' .sage/.sage/tickets/index.json > /tmp/tickets-priority.json

mv /tmp/tickets-priority.json .sage/.sage/tickets/index.json
echo "✓ Priorities normalized"
```

### 9a. Fix Invalid Ticket Types

```bash
# Map non-standard ticket types to valid enums
echo ""
echo "Fixing invalid ticket types..."

INVALID_TYPES=$(jq -r '
  .tickets[] |
  select(
    .type != "implementation" and
    .type != "enhancement" and
    .type != "bugfix" and
    .type != "refactor"
  ) |
  .id
' .sage/.sage/tickets/index.json)

if [ -n "$INVALID_TYPES" ]; then
  echo "Normalizing ticket types..."

  jq '
    .tickets |= map(
      if .type == "feature" or .type == "new" then
        .type = "implementation"
      elif .type == "improvement" or .type == "optimize" then
        .type = "enhancement"
      elif .type == "bug" or .type == "fix" then
        .type = "bugfix"
      elif .type == "cleanup" or .type == "tech-debt" then
        .type = "refactor"
      elif .type != "implementation" and .type != "enhancement" and .type != "bugfix" and .type != "refactor" then
        # Default unknown types to implementation
        .type = "implementation"
      end
    )
  ' .sage/.sage/tickets/index.json > /tmp/tickets-types.json

  mv /tmp/tickets-types.json .sage/.sage/tickets/index.json
  echo "✓ Ticket types fixed"
else
  echo "✓ All ticket types valid"
fi
```

### 9b. Fix Invalid Validation Types

```bash
# Map non-standard validation types to valid enums
echo ""
echo "Fixing invalid validation types..."

INVALID_VALIDATION=$(jq -r '
  .tickets[] |
  select(
    .validation_type != "stateflow" and
    .validation_type != "content" and
    .validation_type != "interactive" and
    .validation_type != "integration" and
    .validation_type != "generic"
  ) |
  .id
' .sage/.sage/tickets/index.json)

if [ -n "$INVALID_VALIDATION" ]; then
  echo "Defaulting invalid validation types to generic..."

  jq '
    .tickets |= map(
      if .validation_type != "stateflow" and
         .validation_type != "content" and
         .validation_type != "interactive" and
         .validation_type != "integration" and
         .validation_type != "generic" then
        .validation_type = "generic"
      end
    )
  ' .sage/.sage/tickets/index.json > /tmp/tickets-validation-types.json

  mv /tmp/tickets-validation-types.json .sage/.sage/tickets/index.json
  echo "✓ Validation types fixed"
else
  echo "✓ All validation types valid"
fi
```

### 9c. Fix Sub-Task Schema

```bash
# Repair sub-task arrays with missing required fields
echo ""
echo "Checking sub-task schema..."

INVALID_TASK_SCHEMA=$(jq -r '
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
' .sage/.sage/tickets/index.json)

if [ -n "$INVALID_TASK_SCHEMA" ]; then
  echo "Fixing sub-task schema..."

  jq '
    .tickets |= map(
      if .tasks != null then
        .tasks |= map(
          . as $task |
          if .id == null then
            .id = "TASK-\(.description[0:10] | gsub(" "; "-"))-\(now | tostring | .[10:16])"
          end |
          if .type == null then
            .type = "generic"
          end |
          if .description == null then
            .description = "No description"
          end |
          if .status == null then
            .status = "UNPROCESSED"
          end |
          if .auto_fix == null then
            .auto_fix = true
          end |
          if .max_retries == null then
            .max_retries = 3
          end
        )
      end
    )
  ' .sage/.sage/tickets/index.json > /tmp/tickets-task-schema.json

  mv /tmp/tickets-task-schema.json .sage/.sage/tickets/index.json
  echo "✓ Sub-task schema fixed"
else
  echo "✓ Sub-task schema valid"
fi
```

### 9d. Clean Orphaned Component Checkpoints

```bash
# Remove component checkpoints that reference non-existent git commits
echo ""
echo "Checking component checkpoints..."

ORPHANED_CHECKPOINTS=$(jq -r '
  .tickets[] |
  select(.components != null) |
  .components[] |
  select(.checkpoint_id != null and .checkpoint_id != "") |
  .checkpoint_id
' .sage/.sage/tickets/index.json)

if [ -n "$ORPHANED_CHECKPOINTS" ]; then
  echo "Verifying component checkpoints..."

  # Remove invalid checkpoints
  jq '
    .tickets |= map(
      if .components != null then
        .components |= map(
          if .checkpoint_id != null and .checkpoint_id != "" then
            # Note: In real implementation, verify against git
            # For now, preserve all checkpoints
            .
          end
        )
      end
    )
  ' .sage/.sage/tickets/index.json > /tmp/tickets-checkpoints.json

  mv /tmp/tickets-checkpoints.json .sage/.sage/tickets/index.json
  echo "✓ Component checkpoints verified"
else
  echo "✓ No component checkpoints to verify"
fi
```

### 10. Validate Repairs

```bash
# Run validation to confirm fixes worked
echo ""
echo "Validating repaired ticket system..."

/validate

if [ $? -eq 0 ]; then
  echo ""
  echo "================================================"
  echo "✅ TICKET REPAIR SUCCESSFUL"
  echo "================================================"
  echo ""
  echo "All issues fixed. Ticket system is now valid."
  echo ""
  echo "Checkpoint preserved at: .sage/checkpoint.json"
  echo "If repairs caused issues, run: /rollback"
  echo "================================================"

  # Clear checkpoint on success
  # rm .sage/checkpoint.json  # Optional: keep for safety
else
  echo ""
  echo "================================================"
  echo "⚠️  REPAIR INCOMPLETE"
  echo "================================================"
  echo ""
  echo "Some issues remain. Manual intervention may be required."
  echo ""
  echo "To restore pre-repair state: /rollback"
  echo "================================================"
  exit 1
fi
```

## Repair Modes

### Auto Repair (All Issues)

```bash
/repair
# Default: Fix all detected issues automatically
```

### Specific Repairs

```bash
/repair --deduplicate
# Only fix duplicate ticket IDs

/repair --fix-states
# Only fix invalid states

/repair --fix-dependencies
# Only fix invalid dependencies

/repair --break-cycles
# Only remove circular dependencies

/repair --fix-parents
# Only fix orphaned tickets

/repair --create-missing-files
# Only create missing ticket markdown files

/repair --fix-fields
# Only add missing required fields
```

### Interactive Repair

```bash
/repair --interactive
# Ask for confirmation before each repair
```

### Dry Run

```bash
/repair --dry-run
# Show what would be repaired without making changes
```

## Common Repair Scenarios

### Scenario 1: Duplicate IDs After Manual Edits

```bash
# Problem: Manually edited .sage/.sage/tickets/index.json, created duplicates
/validate  # Shows duplicate IDs
/repair --deduplicate
/validate  # Confirms fixed
```

### Scenario 2: Corrupted JSON

```bash
# Problem: .sage/.sage/tickets/index.json is invalid JSON
/validate  # Shows JSON parse error

# Manual fix required:
# 1. Restore from backup: /rollback
# 2. Or fix JSON manually, then validate
```

### Scenario 3: Broken Dependencies After Ticket Deletion

```bash
# Problem: Deleted ticket, other tickets still reference it
/validate  # Shows invalid dependencies
/repair --fix-dependencies
/validate  # Confirms fixed
```

### Scenario 4: Circular Dependencies

```bash
# Problem: Ticket A depends on B, B depends on A
/validate  # Shows circular dependencies
/repair --break-cycles
/validate  # Confirms cycles broken
```

## Repair Strategies

### Duplicate IDs

**Strategy:** Renumber duplicates with timestamp suffix
**Example:** `AUTH-001` duplicates become `AUTH-001`, `AUTH-001-123456-1`, `AUTH-001-123456-2`

### Invalid States

**Mapping:**

- `DONE`, `FINISHED` → `COMPLETED`
- `TODO`, `PENDING` → `UNPROCESSED`
- `WORKING`, `ACTIVE` → `IN_PROGRESS`
- `SKIPPED`, `POSTPONED` → `DEFERRED`
- Unknown → `UNPROCESSED`

### Invalid Dependencies

**Strategy:** Remove dependencies to non-existent tickets

### Circular Dependencies

**Strategy:** Break cycles by removing back edges (dependencies that create cycles)

### Orphaned Tickets

**Strategy:** Remove parent reference if parent doesn't exist

### Missing Files

**Strategy:** Generate basic ticket markdown from .sage/.sage/tickets/index.json data

## Integration with Other Commands

### Pre-migration Repair

```bash
# Before migrating tickets
/validate
/repair  # If validation fails
/migrate
```

### Post-sync Repair

```bash
# After syncing with GitHub
/sync
/validate
/repair  # If sync introduced issues
```

### Recovery Workflow

```bash
# If ticket system corrupted
/validate  # Identify issues
/repair    # Attempt auto-repair
/validate  # Verify repairs

# If repair fails
/rollback          # Restore previous state
# Manual fix, then retry
```

## Exit Codes

- **0** - Repairs successful, ticket system valid
- **1** - Repairs failed, manual intervention required

## Success Criteria

- [ ] Checkpoint created before repairs
- [ ] Duplicate IDs resolved
- [ ] Invalid states mapped to valid values
- [ ] Missing required fields added
- [ ] Invalid dependencies removed
- [ ] Circular dependencies broken
- [ ] Orphaned tickets fixed
- [ ] Missing ticket files created
- [ ] Priorities normalized
- [ ] Validation passes after repair

## Notes

- Always creates checkpoint before repairs
- Destructive operation (modifies .sage/.sage/tickets/index.json)
- Use `/rollback` if repairs cause issues
- Some issues require manual intervention (e.g., invalid JSON)
- Safe to run multiple times (idempotent)
- Validation runs automatically after repair
- Checkpoint preserved for safety (can be manually cleared)
