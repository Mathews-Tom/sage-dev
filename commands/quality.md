---
allowed-tools: Bash(fd:*), Bash(cat:*), Bash(grep:*), Bash(wc:*), Read, Grep
description: Validate quality of command outputs before proceeding to next phase.
argument-hint: '[--command <specify|plan|tasks>] [--strict] (optional)'
---

## Role

Quality assurance validator ensuring command outputs meet minimum standards before next phase.

## Purpose

Validate quality of documentation outputs to prevent "garbage in, garbage out" by:
- Checking completeness of specifications
- Validating implementation plans
- Verifying task breakdowns
- Scoring output quality
- Blocking next phase if quality insufficient
- Providing actionable improvement suggestions

## Execution

### 0. Parse Arguments

```bash
# Detect which command output to validate
COMMAND_TO_VALIDATE="auto"  # auto-detect or specify
STRICT_MODE=false
TARGET_SCORE=70  # Minimum quality score (0-100)

for arg in "$@"; do
  case $arg in
    --command=*)
      COMMAND_TO_VALIDATE="${arg#*=}"
      ;;
    --strict)
      STRICT_MODE=true
      TARGET_SCORE=90
      ;;
    --score=*)
      TARGET_SCORE="${arg#*=}"
      ;;
  esac
done

echo "================================================"
echo "QUALITY VALIDATION"
echo "================================================"
echo "Mode: $([ "$STRICT_MODE" = true ] && echo "STRICT" || echo "STANDARD")"
echo "Target Score: $TARGET_SCORE/100"
echo ""
```

### 1. Validate /specify Outputs

```bash
# Check docs/specs/*/spec.md files exist and are complete
validate_specifications() {
  echo "Validating Specifications..."
  echo ""

  SPEC_FILES=$(fd -e md 'spec\.md$' docs/specs 2>/dev/null)

  if [ -z "$SPEC_FILES" ]; then
    echo "❌ FAIL: No specification files found"
    echo "Expected: docs/specs/*/spec.md"
    echo ""
    return 1
  fi

  TOTAL_SPECS=0
  PASSED_SPECS=0
  SPEC_SCORE=0

  echo "$SPEC_FILES" | while read spec_file; do
    TOTAL_SPECS=$((TOTAL_SPECS + 1))
    COMPONENT=$(basename $(dirname "$spec_file"))

    echo "Checking: $COMPONENT"

    # Quality checks
    SCORE=0
    MAX_SCORE=100
    ISSUES=()

    # Check 1: Has description (20 points)
    if grep -qi "^## Description\|^## Overview\|^## Summary" "$spec_file"; then
      SCORE=$((SCORE + 20))
      echo "  ✓ Description present"
    else
      ISSUES+=("Missing description section")
      echo "  ✗ Missing description"
    fi

    # Check 2: Has functional requirements (20 points)
    if grep -qi "^## Functional Requirements\|^## Requirements\|^## Features" "$spec_file"; then
      SCORE=$((SCORE + 20))
      echo "  ✓ Functional requirements present"
    else
      ISSUES+=("Missing functional requirements")
      echo "  ✗ Missing functional requirements"
    fi

    # Check 3: Has acceptance criteria (20 points)
    CRITERIA_COUNT=$(grep -ci "^- \[ \]\|^-.*criteri\|^###.*acceptance" "$spec_file")
    if [ "$CRITERIA_COUNT" -ge 3 ]; then
      SCORE=$((SCORE + 20))
      echo "  ✓ Acceptance criteria defined ($CRITERIA_COUNT found)"
    else
      ISSUES+=("Insufficient acceptance criteria (found $CRITERIA_COUNT, need 3+)")
      echo "  ✗ Insufficient acceptance criteria ($CRITERIA_COUNT < 3)"
    fi

    # Check 4: Has non-functional requirements (15 points)
    if grep -qi "^## Non-Functional\|^## Performance\|^## Security\|^## Scalability" "$spec_file"; then
      SCORE=$((SCORE + 15))
      echo "  ✓ Non-functional requirements present"
    else
      ISSUES+=("Missing non-functional requirements")
      echo "  ✗ Missing non-functional requirements"
    fi

    # Check 5: Has dependencies listed (15 points)
    if grep -qi "^## Dependencies\|^## Prerequisites" "$spec_file"; then
      SCORE=$((SCORE + 15))
      echo "  ✓ Dependencies documented"
    else
      ISSUES+=("Missing dependencies section")
      echo "  ✗ Missing dependencies"
    fi

    # Check 6: File size check (10 points) - minimum 500 chars
    FILE_SIZE=$(wc -c < "$spec_file")
    if [ "$FILE_SIZE" -ge 500 ]; then
      SCORE=$((SCORE + 10))
      echo "  ✓ Sufficient detail (${FILE_SIZE} chars)"
    else
      ISSUES+=("Specification too brief (${FILE_SIZE} chars, need 500+)")
      echo "  ✗ Specification too brief (${FILE_SIZE} chars)"
    fi

    echo "  Score: $SCORE/$MAX_SCORE"
    echo ""

    # Aggregate score
    SPEC_SCORE=$((SPEC_SCORE + SCORE))

    if [ "$SCORE" -ge "$TARGET_SCORE" ]; then
      PASSED_SPECS=$((PASSED_SPECS + 1))
    fi
  done

  # Calculate average
  if [ "$TOTAL_SPECS" -gt 0 ]; then
    AVG_SPEC_SCORE=$((SPEC_SCORE / TOTAL_SPECS))
  else
    AVG_SPEC_SCORE=0
  fi

  echo "─────────────────────────────────────────────────"
  echo "Specification Quality Summary:"
  echo "  Total Specs:   $TOTAL_SPECS"
  echo "  Passed:        $PASSED_SPECS"
  echo "  Average Score: $AVG_SPEC_SCORE/100"
  echo ""

  if [ "$AVG_SPEC_SCORE" -ge "$TARGET_SCORE" ]; then
    echo "✅ PASS: Specifications meet quality threshold"
    return 0
  else
    echo "❌ FAIL: Specifications below quality threshold ($AVG_SPEC_SCORE < $TARGET_SCORE)"
    echo ""
    echo "Improvement needed:"
    echo "  - Add missing description sections"
    echo "  - Define at least 3 acceptance criteria per component"
    echo "  - Include non-functional requirements"
    echo "  - Document dependencies"
    return 1
  fi
}
```

### 2. Validate /plan Outputs

```bash
# Check docs/specs/*/plan.md or implementation_plan.md files
validate_plans() {
  echo "Validating Implementation Plans..."
  echo ""

  PLAN_FILES=$(fd -e md 'plan\.md$|implementation_plan\.md$' docs/specs 2>/dev/null)

  if [ -z "$PLAN_FILES" ]; then
    echo "❌ FAIL: No implementation plan files found"
    echo "Expected: docs/specs/*/plan.md"
    echo ""
    return 1
  fi

  TOTAL_PLANS=0
  PASSED_PLANS=0
  PLAN_SCORE=0

  echo "$PLAN_FILES" | while read plan_file; do
    TOTAL_PLANS=$((TOTAL_PLANS + 1))
    COMPONENT=$(basename $(dirname "$plan_file"))

    echo "Checking: $COMPONENT"

    SCORE=0
    MAX_SCORE=100

    # Check 1: Has technology stack (25 points)
    if grep -qi "^## Technology Stack\|^## Tech Stack\|^## Technologies" "$plan_file"; then
      SCORE=$((SCORE + 25))
      echo "  ✓ Technology stack defined"
    else
      echo "  ✗ Missing technology stack"
    fi

    # Check 2: Has architecture section (25 points)
    if grep -qi "^## Architecture\|^## Design\|^## System Design" "$plan_file"; then
      SCORE=$((SCORE + 25))
      echo "  ✓ Architecture documented"
    else
      echo "  ✗ Missing architecture section"
    fi

    # Check 3: Has risks identified (20 points)
    RISK_COUNT=$(grep -ci "risk\|challenge\|concern" "$plan_file")
    if [ "$RISK_COUNT" -ge 3 ]; then
      SCORE=$((SCORE + 20))
      echo "  ✓ Risks identified ($RISK_COUNT mentions)"
    else
      echo "  ✗ Insufficient risk analysis ($RISK_COUNT < 3)"
    fi

    # Check 4: Has timeline/phases (15 points)
    if grep -qi "^## Timeline\|^## Phases\|^## Milestones\|^## Schedule" "$plan_file"; then
      SCORE=$((SCORE + 15))
      echo "  ✓ Timeline defined"
    else
      echo "  ✗ Missing timeline"
    fi

    # Check 5: Has testing strategy (15 points)
    if grep -qi "^## Testing\|^## Test Strategy\|^## QA" "$plan_file"; then
      SCORE=$((SCORE + 15))
      echo "  ✓ Testing strategy present"
    else
      echo "  ✗ Missing testing strategy"
    fi

    echo "  Score: $SCORE/$MAX_SCORE"
    echo ""

    PLAN_SCORE=$((PLAN_SCORE + SCORE))

    if [ "$SCORE" -ge "$TARGET_SCORE" ]; then
      PASSED_PLANS=$((PASSED_PLANS + 1))
    fi
  done

  if [ "$TOTAL_PLANS" -gt 0 ]; then
    AVG_PLAN_SCORE=$((PLAN_SCORE / TOTAL_PLANS))
  else
    AVG_PLAN_SCORE=0
  fi

  echo "─────────────────────────────────────────────────"
  echo "Implementation Plan Quality Summary:"
  echo "  Total Plans:   $TOTAL_PLANS"
  echo "  Passed:        $PASSED_PLANS"
  echo "  Average Score: $AVG_PLAN_SCORE/100"
  echo ""

  if [ "$AVG_PLAN_SCORE" -ge "$TARGET_SCORE" ]; then
    echo "✅ PASS: Plans meet quality threshold"
    return 0
  else
    echo "❌ FAIL: Plans below quality threshold ($AVG_PLAN_SCORE < $TARGET_SCORE)"
    echo ""
    echo "Improvement needed:"
    echo "  - Define technology stack with justification"
    echo "  - Document system architecture"
    echo "  - Identify at least 3 risks/challenges"
    echo "  - Add timeline with phases"
    echo "  - Include testing strategy"
    return 1
  fi
}
```

### 3. Validate /tasks Outputs

```bash
# Check docs/specs/*/tasks.md files
validate_tasks() {
  echo "Validating Task Breakdowns..."
  echo ""

  TASK_FILES=$(fd -e md 'tasks\.md$' docs/specs 2>/dev/null)

  if [ -z "$TASK_FILES" ]; then
    echo "❌ FAIL: No task breakdown files found"
    echo "Expected: docs/specs/*/tasks.md"
    echo ""
    return 1
  fi

  TOTAL_TASK_FILES=0
  PASSED_TASK_FILES=0
  TASK_SCORE=0

  echo "$TASK_FILES" | while read task_file; do
    TOTAL_TASK_FILES=$((TOTAL_TASK_FILES + 1))
    COMPONENT=$(basename $(dirname "$task_file"))

    echo "Checking: $COMPONENT"

    SCORE=0
    MAX_SCORE=100

    # Check 1: Has tasks defined (20 points)
    TASK_COUNT=$(grep -c "^- \[ \]" "$task_file")
    if [ "$TASK_COUNT" -ge 5 ]; then
      SCORE=$((SCORE + 20))
      echo "  ✓ Tasks defined ($TASK_COUNT tasks)"
    else
      echo "  ✗ Insufficient tasks ($TASK_COUNT < 5)"
    fi

    # Check 2: Tasks have estimates (25 points)
    ESTIMATED_TASKS=$(grep -c "^- \[ \].*([0-9].*h\|[0-9].*d\|[0-9].*m)" "$task_file")
    if [ "$TASK_COUNT" -gt 0 ]; then
      ESTIMATE_PCT=$((ESTIMATED_TASKS * 100 / TASK_COUNT))
      if [ "$ESTIMATE_PCT" -ge 80 ]; then
        SCORE=$((SCORE + 25))
        echo "  ✓ Tasks have estimates ($ESTIMATE_PCT%)"
      else
        echo "  ✗ Insufficient task estimates ($ESTIMATE_PCT% < 80%)"
      fi
    fi

    # Check 3: Dependencies mapped (20 points)
    if grep -qi "depends on\|blocked by\|requires\|after" "$task_file"; then
      SCORE=$((SCORE + 20))
      echo "  ✓ Dependencies mapped"
    else
      echo "  ✗ Missing dependency mapping"
    fi

    # Check 4: Has priorities (15 points)
    if grep -qi "P0\|P1\|P2\|priority.*high\|priority.*low" "$task_file"; then
      SCORE=$((SCORE + 15))
      echo "  ✓ Priorities assigned"
    else
      echo "  ✗ Missing priorities"
    fi

    # Check 5: SMART criteria check (20 points)
    # Tasks should be Specific, Measurable, Achievable, Relevant, Time-bound
    SMART_SCORE=0

    # Specific: Has detailed task descriptions
    if [ "$TASK_COUNT" -ge 5 ]; then
      SMART_SCORE=$((SMART_SCORE + 5))
    fi

    # Measurable: Has acceptance criteria or checkboxes
    if [ "$TASK_COUNT" -gt 0 ]; then
      SMART_SCORE=$((SMART_SCORE + 5))
    fi

    # Time-bound: Has estimates
    if [ "$ESTIMATE_PCT" -ge 50 ]; then
      SMART_SCORE=$((SMART_SCORE + 10))
    fi

    SCORE=$((SCORE + SMART_SCORE))
    echo "  ✓ SMART criteria score: $SMART_SCORE/20"

    echo "  Score: $SCORE/$MAX_SCORE"
    echo ""

    TASK_SCORE=$((TASK_SCORE + SCORE))

    if [ "$SCORE" -ge "$TARGET_SCORE" ]; then
      PASSED_TASK_FILES=$((PASSED_TASK_FILES + 1))
    fi
  done

  if [ "$TOTAL_TASK_FILES" -gt 0 ]; then
    AVG_TASK_SCORE=$((TASK_SCORE / TOTAL_TASK_FILES))
  else
    AVG_TASK_SCORE=0
  fi

  echo "─────────────────────────────────────────────────"
  echo "Task Breakdown Quality Summary:"
  echo "  Total Files:   $TOTAL_TASK_FILES"
  echo "  Passed:        $PASSED_TASK_FILES"
  echo "  Average Score: $AVG_TASK_SCORE/100"
  echo ""

  if [ "$AVG_TASK_SCORE" -ge "$TARGET_SCORE" ]; then
    echo "✅ PASS: Task breakdowns meet quality threshold"
    return 0
  else
    echo "❌ FAIL: Task breakdowns below quality threshold ($AVG_TASK_SCORE < $TARGET_SCORE)"
    echo ""
    echo "Improvement needed:"
    echo "  - Add at least 5 tasks per component"
    echo "  - Provide time estimates for 80%+ tasks"
    echo "  - Map task dependencies"
    echo "  - Assign priorities (P0-P2)"
    echo "  - Ensure tasks follow SMART criteria"
    return 1
  fi
}
```

### 3a. Validate Ticket System Quality

```bash
# Check .sage/tickets/index.json for quality (new)
validate_tickets() {
  echo "Validating Ticket System Quality..."
  echo ""

  if [ ! -f .sage/tickets/index.json ]; then
    echo "⚠️  INFO: No ticket system found (run /migrate first)"
    echo ""
    return 0
  fi

  TOTAL_TICKETS=$(jq '.tickets | length' .sage/tickets/index.json)

  if [ "$TOTAL_TICKETS" -eq 0 ]; then
    echo "⚠️  INFO: No tickets in system"
    echo ""
    return 0
  fi

  TICKET_SCORE=0
  MAX_SCORE=100

  echo "Checking ticket quality..."
  echo ""

  # Check 1: Sub-tasks have descriptions (10 points)
  TICKETS_WITH_TASKS=$(jq '[.tickets[] | select(.tasks != null and (.tasks | length > 0))] | length' .sage/tickets/index.json)
  TASKS_WITH_DESCRIPTIONS=$(jq '
    [.tickets[] | select(.tasks != null) | .tasks[] | select(.description != null and (.description | length > 10))] | length
  ' .sage/tickets/index.json)

  TOTAL_TASKS=$(jq '[.tickets[] | select(.tasks != null) | .tasks[] ] | length' .sage/tickets/index.json)

  if [ "$TOTAL_TASKS" -gt 0 ]; then
    DESC_PCT=$((TASKS_WITH_DESCRIPTIONS * 100 / TOTAL_TASKS))
    if [ "$DESC_PCT" -ge 90 ]; then
      TICKET_SCORE=$((TICKET_SCORE + 10))
      echo "  ✓ Sub-tasks have descriptions ($DESC_PCT%)"
    else
      echo "  ✗ Insufficient sub-task descriptions ($DESC_PCT% < 90%)"
    fi
  fi

  # Check 2: Validation scripts exist for validation types (10 points)
  TICKETS_WITH_VALIDATION=$(jq '
    [.tickets[] | select(.validation_type != "generic" and .validation_config != null)] | length
  ' .sage/tickets/index.json)

  TICKETS_NEED_VALIDATION=$(jq '
    [.tickets[] | select(.validation_type != "generic")] | length
  ' .sage/tickets/index.json)

  if [ "$TICKETS_NEED_VALIDATION" -gt 0 ]; then
    VALIDATION_PCT=$((TICKETS_WITH_VALIDATION * 100 / TICKETS_NEED_VALIDATION))
    if [ "$VALIDATION_PCT" -ge 80 ]; then
      TICKET_SCORE=$((TICKET_SCORE + 10))
      echo "  ✓ Validation scripts exist ($VALIDATION_PCT%)"
    else
      echo "  ✗ Missing validation scripts ($VALIDATION_PCT% < 80%)"
    fi
  fi

  # Check 3: Auto-fix enabled appropriately (10 points)
  APPROPRIATE_AUTOFIX=$(jq '
    [
      .tickets[] |
      select(.validation_type == "stateflow" or .validation_type == "content" or .validation_type == "interactive") |
      select(.validation_config.auto_fix == true)
    ] | length
  ' .sage/tickets/index.json)

  SHOULD_HAVE_AUTOFIX=$(jq '
    [
      .tickets[] |
      select(.validation_type == "stateflow" or .validation_type == "content" or .validation_type == "interactive")
    ] | length
  ' .sage/tickets/index.json)

  if [ "$SHOULD_HAVE_AUTOFIX" -gt 0 ]; then
    AUTOFIX_PCT=$((APPROPRIATE_AUTOFIX * 100 / SHOULD_HAVE_AUTOFIX))
    if [ "$AUTOFIX_PCT" -ge 80 ]; then
      TICKET_SCORE=$((TICKET_SCORE + 10))
      echo "  ✓ Auto-fix appropriately enabled ($AUTOFIX_PCT%)"
    else
      echo "  ✗ Auto-fix not enabled where appropriate ($AUTOFIX_PCT% < 80%)"
    fi
  fi

  # Check 4: Component groupings are logical (5 points)
  TICKETS_WITH_COMPONENTS=$(jq '
    [.tickets[] | select(.components != null and (.components | length > 0))] | length
  ' .sage/tickets/index.json)

  WELL_GROUPED=$(jq '
    [
      .tickets[] |
      select(.components != null) |
      select(.components | length >= 2 and length <= 5)
    ] | length
  ' .sage/tickets/index.json)

  if [ "$TICKETS_WITH_COMPONENTS" -gt 0 ]; then
    GROUPING_PCT=$((WELL_GROUPED * 100 / TICKETS_WITH_COMPONENTS))
    if [ "$GROUPING_PCT" -ge 70 ]; then
      TICKET_SCORE=$((TICKET_SCORE + 5))
      echo "  ✓ Logical component groupings ($GROUPING_PCT%)"
    else
      echo "  ✗ Suboptimal component groupings ($GROUPING_PCT% < 70%)"
    fi
  fi

  # Check 5: Validation types match ticket content (15 points)
  APPROPRIATE_VALIDATION_TYPES=$(jq '
    [
      .tickets[] |
      select(
        (.validation_type == "stateflow" and (.title | test("auth|login|state|flow|cascade"; "i"))) or
        (.validation_type == "content" and (.title | test("percentage|calculation|counter|total|stat"; "i"))) or
        (.validation_type == "interactive" and (.title | test("button|click|form|link|handler"; "i"))) or
        (.validation_type == "integration" and (.title | test("github|api|integration|external"; "i"))) or
        (.validation_type == "generic")
      )
    ] | length
  ' .sage/tickets/index.json)

  if [ "$TOTAL_TICKETS" -gt 0 ]; then
    TYPE_MATCH_PCT=$((APPROPRIATE_VALIDATION_TYPES * 100 / TOTAL_TICKETS))
    if [ "$TYPE_MATCH_PCT" -ge 80 ]; then
      TICKET_SCORE=$((TICKET_SCORE + 15))
      echo "  ✓ Validation types appropriate ($TYPE_MATCH_PCT%)"
    else
      echo "  ✗ Validation types may not match content ($TYPE_MATCH_PCT% < 80%)"
    fi
  fi

  echo ""
  echo "  Score: $TICKET_SCORE/$MAX_SCORE"
  echo ""
  echo "─────────────────────────────────────────────────"
  echo "Ticket System Quality Summary:"
  echo "  Total Tickets:  $TOTAL_TICKETS"
  echo "  Score:          $TICKET_SCORE/100"
  echo ""

  if [ "$TICKET_SCORE" -ge "$TARGET_SCORE" ]; then
    echo "✅ PASS: Ticket system meets quality threshold"
    return 0
  else
    echo "❌ FAIL: Ticket system below quality threshold ($TICKET_SCORE < $TARGET_SCORE)"
    echo ""
    echo "Improvement needed:"
    echo "  - Add descriptions to all sub-tasks (10+ chars)"
    echo "  - Add validation scripts for non-generic validation types"
    echo "  - Enable auto-fix for stateflow/content/interactive types"
    echo "  - Group components logically (2-5 components per ticket)"
    echo "  - Ensure validation types match ticket content"
    return 1
  fi
}
```

### 4. Run Validation Based on Command

```bash
# Auto-detect or run specific validation
VALIDATION_PASSED=true

if [ "$COMMAND_TO_VALIDATE" = "auto" ] || [ "$COMMAND_TO_VALIDATE" = "specify" ]; then
  if [ -d docs/specs ]; then
    validate_specifications || VALIDATION_PASSED=false
    echo ""
  fi
fi

if [ "$COMMAND_TO_VALIDATE" = "auto" ] || [ "$COMMAND_TO_VALIDATE" = "plan" ]; then
  if [ -d docs/specs ]; then
    validate_plans || VALIDATION_PASSED=false
    echo ""
  fi
fi

if [ "$COMMAND_TO_VALIDATE" = "auto" ] || [ "$COMMAND_TO_VALIDATE" = "tasks" ]; then
  if [ -d docs/specs ]; then
    validate_tasks || VALIDATION_PASSED=false
    echo ""
  fi
fi

if [ "$COMMAND_TO_VALIDATE" = "auto" ] || [ "$COMMAND_TO_VALIDATE" = "tickets" ]; then
  if [ -f .sage/tickets/index.json ]; then
    validate_tickets || VALIDATION_PASSED=false
    echo ""
  fi
fi
```

### 5. Final Report and Exit

```bash
echo "================================================"
if [ "$VALIDATION_PASSED" = true ]; then
  echo "✅ QUALITY VALIDATION PASSED"
  echo "================================================"
  echo ""
  echo "All outputs meet quality standards."
  echo "Safe to proceed to next phase."
  echo ""
  exit 0
else
  echo "❌ QUALITY VALIDATION FAILED"
  echo "================================================"
  echo ""
  echo "Quality threshold not met. Improvements required."
  echo ""
  echo "Options:"
  echo "  1. Review and improve failing outputs"
  echo "  2. Re-run commands with better inputs"
  echo "  3. Use --force to bypass (not recommended)"
  echo ""
  echo "To see detailed breakdown:"
  echo "  /quality --command=specify"
  echo "  /quality --command=plan"
  echo "  /quality --command=tasks"
  echo ""
  exit 1
fi
```

## Validation Modes

### Standard Mode (Default)

```bash
/quality
# Target score: 70/100
# Validates all command outputs
```

### Strict Mode

```bash
/quality --strict
# Target score: 90/100
# Higher standards for production use
```

### Specific Command

```bash
/quality --command=specify
# Only validate specifications

/quality --command=plan
# Only validate implementation plans

/quality --command=tasks
# Only validate task breakdowns
```

### Custom Score Threshold

```bash
/quality --score=80
# Custom quality threshold
```

## Quality Scoring System

### Specifications (100 points)
- Description present (20 pts)
- Functional requirements (20 pts)
- Acceptance criteria ≥3 (20 pts)
- Non-functional requirements (15 pts)
- Dependencies documented (15 pts)
- Sufficient detail ≥500 chars (10 pts)

### Implementation Plans (100 points)
- Technology stack defined (25 pts)
- Architecture documented (25 pts)
- Risks identified ≥3 (20 pts)
- Timeline/phases present (15 pts)
- Testing strategy (15 pts)

### Task Breakdowns (100 points)
- Tasks defined ≥5 (20 pts)
- Estimates on 80%+ tasks (25 pts)
- Dependencies mapped (20 pts)
- Priorities assigned (15 pts)
- SMART criteria (20 pts)

## Integration with Other Commands

### Before /plan

```bash
/specify
/quality --command=specify

if [ $? -ne 0 ]; then
  echo "Fix specifications before running /plan"
  exit 1
fi

/plan
```

### Before /tasks

```bash
/plan
/quality --command=plan

if [ $? -ne 0 ]; then
  echo "Improve plans before breaking down tasks"
  exit 1
fi

/tasks
```

### Before /migrate

```bash
/tasks
/quality --command=tasks

if [ $? -ne 0 ]; then
  echo "Quality check failed. Fix tasks before migration"
  exit 1
fi

/migrate
```

## Exit Codes

- **0** - Quality validation passed
- **1** - Quality validation failed (below threshold)

## Success Criteria

- [ ] All spec files have descriptions
- [ ] Acceptance criteria ≥3 per component
- [ ] Non-functional requirements included
- [ ] Technology stacks justified
- [ ] Architecture documented
- [ ] Risks identified (≥3 per plan)
- [ ] Tasks have time estimates (80%+)
- [ ] Dependencies mapped
- [ ] Average quality score ≥ target threshold

## Notes

- Non-destructive validation (read-only)
- Does not modify any files
- Can be run multiple times
- Useful before phase transitions
- Prevents low-quality outputs from propagating
- Scoring is objective and consistent
- Use --force flags on subsequent commands to bypass if needed
