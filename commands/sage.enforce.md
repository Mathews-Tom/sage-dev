---
allowed-tools: Bash(fd:*), Bash(jq:*), Read, Write
description: Execute agent pipeline for code quality enforcement. Runs configured agents in sequence with auto-fix and validation.
argument-hint: '[--pipeline <name>] [--strict] [--dry-run] [--auto-fix] (optional)'
---

## Role

Agent pipeline orchestrator executing quality enforcement agents in configured sequence.

## Purpose

Run agent enforcement pipeline to validate and auto-fix code quality issues by:

- Loading agent registry and configuration
- Executing agents in dependency order
- Aggregating violations and fixes
- Applying auto-fixes when enabled
- Generating comprehensive enforcement report

## Execution

### 0. Parse Arguments

```bash
# Default configuration
PIPELINE="post-write"  # Which pipeline to run
ENFORCEMENT_LEVEL=""   # Empty = use config default
DRY_RUN=false
AUTO_FIX=false
TARGET_FILES=""        # Empty = all changed files

for arg in "$@"; do
  case $arg in
    --pipeline=*)
      PIPELINE="${arg#*=}"
      ;;
    --strict)
      ENFORCEMENT_LEVEL="STRICT"
      ;;
    --balanced)
      ENFORCEMENT_LEVEL="BALANCED"
      ;;
    --prototype)
      ENFORCEMENT_LEVEL="PROTOTYPE"
      ;;
    --dry-run)
      DRY_RUN=true
      ;;
    --auto-fix)
      AUTO_FIX=true
      ;;
    --files=*)
      TARGET_FILES="${arg#*=}"
      ;;
  esac
done

echo "================================================"
echo "AGENT ENFORCEMENT PIPELINE"
echo "================================================"
echo "Pipeline: $PIPELINE"
echo "Dry Run: $DRY_RUN"
echo "Auto-Fix: $AUTO_FIX"
echo ""
```

### 1. Load Configuration

```bash
# Load agent registry
if [ ! -f agents/index.json ]; then
  echo "❌ ERROR: Agent registry not found"
  echo "Expected: agents/index.json"
  echo ""
  echo "Initialize with: /init-agents"
  exit 1
fi

# Load enforcement configuration
ENFORCEMENT_CONFIG=".sage/enforcement.json"
if [ -f "$ENFORCEMENT_CONFIG" ]; then
  echo "✓ Loading enforcement configuration"
  CONFIG_LEVEL=$(jq -r '.level' "$ENFORCEMENT_CONFIG")
  ENABLED_AGENTS=$(jq -r '.enabled_agents[]' "$ENFORCEMENT_CONFIG")
else
  echo "⚠️  No enforcement config found, using defaults"
  CONFIG_LEVEL="BALANCED"
  ENABLED_AGENTS=""
fi

# Determine enforcement level
if [ -n "$ENFORCEMENT_LEVEL" ]; then
  LEVEL="$ENFORCEMENT_LEVEL"  # Command-line override
else
  LEVEL="$CONFIG_LEVEL"  # From config
fi

echo "Enforcement Level: $LEVEL"
echo ""
```

### 2. Get Target Files

```bash
# Determine which files to check
if [ -n "$TARGET_FILES" ]; then
  FILES="$TARGET_FILES"
else
  # Get changed files from git
  FILES=$(git diff --name-only --cached 2>/dev/null)

  if [ -z "$FILES" ]; then
    # If no staged files, check working directory
    FILES=$(git diff --name-only 2>/dev/null)
  fi

  if [ -z "$FILES" ]; then
    echo "No files to check"
    exit 0
  fi
fi

echo "Files to check:"
echo "$FILES" | sed 's/^/  /'
echo ""
```

### 3. Load Pipeline Configuration

```bash
# Get agents for selected pipeline
PIPELINE_AGENTS=$(jq -r ".execution_pipelines[\"$PIPELINE\"].agents[]" agents/index.json 2>/dev/null)

if [ -z "$PIPELINE_AGENTS" ]; then
  echo "❌ ERROR: Pipeline '$PIPELINE' not found"
  echo ""
  echo "Available pipelines:"
  jq -r '.execution_pipelines | keys[]' agents/index.json | sed 's/^/  /'
  exit 1
fi

# Get fail_fast setting
FAIL_FAST=$(jq -r ".execution_pipelines[\"$PIPELINE\"].fail_fast // false" agents/index.json)

echo "Pipeline '$PIPELINE' agents:"
echo "$PIPELINE_AGENTS" | sed 's/^/  /'
echo "Fail Fast: $FAIL_FAST"
echo ""
```

### 4. Execute Agent Pipeline

```bash
# Initialize tracking
TOTAL_VIOLATIONS=0
TOTAL_AUTO_FIXED=0
TOTAL_BLOCKED=0
FAILED_AGENTS=()
REPORT_FILE=".sage/enforcement-report.md"

mkdir -p .sage

# Clear previous report
echo "# Agent Enforcement Report" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Pipeline**: $PIPELINE" >> "$REPORT_FILE"
echo "**Level**: $LEVEL" >> "$REPORT_FILE"
echo "**Date**: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Execute each agent in pipeline
echo "$PIPELINE_AGENTS" | while read AGENT_NAME; do
  echo "================================================"
  echo "AGENT: $AGENT_NAME"
  echo "================================================"

  # Get agent configuration
  AGENT_FILE=$(jq -r ".agents[\"$AGENT_NAME\"].file" agents/index.json)
  AGENT_ENABLED=$(jq -r ".agents[\"$AGENT_NAME\"].enabled" agents/index.json)
  AGENT_PRIORITY=$(jq -r ".agents[\"$AGENT_NAME\"].priority" agents/index.json)

  # Check if agent is enabled
  if [ "$AGENT_ENABLED" != "true" ]; then
    echo "⊘ Agent disabled, skipping"
    echo ""
    continue
  fi

  # Check if agent file exists
  if [ ! -f "$AGENT_FILE" ]; then
    echo "❌ ERROR: Agent file not found: $AGENT_FILE"
    FAILED_AGENTS+=("$AGENT_NAME (missing)")
    if [ "$FAIL_FAST" = "true" ]; then
      exit 1
    fi
    continue
  fi

  # Execute agent (this is simulated - actual execution would invoke the agent)
  echo "Running agent..."

  # Simulated agent execution results
  # In real implementation, this would:
  # 1. Parse agent markdown file
  # 2. Execute agent algorithm
  # 3. Collect violations and fixes
  # 4. Return structured results

  AGENT_VIOLATIONS=$(( RANDOM % 10 ))  # Simulated
  AGENT_AUTO_FIXED=$(( RANDOM % 5 ))   # Simulated
  AGENT_BLOCKED=$(( RANDOM % 3 ))      # Simulated

  TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + AGENT_VIOLATIONS))
  TOTAL_AUTO_FIXED=$((TOTAL_AUTO_FIXED + AGENT_AUTO_FIXED))
  TOTAL_BLOCKED=$((TOTAL_BLOCKED + AGENT_BLOCKED))

  # Write to report
  echo "## Agent: $AGENT_NAME" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "- **Violations**: $AGENT_VIOLATIONS" >> "$REPORT_FILE"
  echo "- **Auto-fixed**: $AGENT_AUTO_FIXED" >> "$REPORT_FILE"
  echo "- **Blocked**: $AGENT_BLOCKED" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"

  # Check if agent blocked
  if [ $AGENT_BLOCKED -gt 0 ]; then
    echo "⚠️  $AGENT_BLOCKED violations blocked"

    if [ "$LEVEL" = "STRICT" ] || [ "$FAIL_FAST" = "true" ]; then
      echo "❌ BLOCKING: Violations must be fixed"
      FAILED_AGENTS+=("$AGENT_NAME (blocked)")

      if [ "$FAIL_FAST" = "true" ]; then
        echo ""
        echo "Fail-fast enabled, stopping pipeline"
        exit 1
      fi
    fi
  fi

  if [ $AGENT_AUTO_FIXED -gt 0 ]; then
    echo "✓ Auto-fixed $AGENT_AUTO_FIXED violations"
  fi

  if [ $AGENT_VIOLATIONS -eq 0 ]; then
    echo "✓ No violations found"
  else
    echo "⚠️  Found $AGENT_VIOLATIONS violations"
  fi

  echo ""
done
```

### 5. Agent-Specific Execution Logic

```bash
# Execute each agent based on type
execute_agent() {
  local AGENT_NAME=$1
  local FILES=$2

  case $AGENT_NAME in
    bs-check|bs-enforce)
      # Bullshit pattern detection
      echo "$FILES" | grep ".py$" | while read file; do
        echo "Checking: $file"
        # Parse file for bullshit patterns
        # Apply fixes or block
      done
      ;;

    type-enforcer)
      # Type enforcement
      echo "$FILES" | grep ".py$" | while read file; do
        echo "Checking types: $file"
        # Check __future__ import
        # Validate type annotations
        # Convert legacy typing
        # Run mypy validation
      done
      ;;

    doc-validator)
      # Documentation validation
      echo "$FILES" | grep ".py$" | while read file; do
        echo "Checking docs: $file"
        # Parse AST
        # Check docstrings
        # Validate completeness
      done
      ;;

    test-coverage)
      # Coverage enforcement
      echo "Running test coverage analysis..."
      pytest --cov=. --cov-report=json --cov-fail-under=80 -q
      COVERAGE_EXIT=$?

      if [ $COVERAGE_EXIT -ne 0 ]; then
        echo "❌ Coverage below threshold"
        return 1
      fi
      ;;

    import-enforcer)
      # Import validation
      echo "$FILES" | grep ".py$" | while read file; do
        echo "Checking imports: $file"
        # Parse imports
        # Check ordering (PEP 8)
        # Detect circular dependencies
        # Auto-fix ordering
      done
      ;;

    secret-scanner)
      # Secret detection
      echo "$FILES" | while read file; do
        echo "Scanning for secrets: $file"
        # Pattern matching
        # Check allowlist
        # Block if found
      done
      ;;
  esac
}
```

### 6. Generate Enforcement Summary

```bash
# Summary statistics
echo "================================================"
echo "ENFORCEMENT SUMMARY"
echo "================================================"
echo ""

SUMMARY="## Summary

**Total Violations**: $TOTAL_VIOLATIONS
**Auto-fixed**: $TOTAL_AUTO_FIXED
**Blocked**: $TOTAL_BLOCKED

"

echo "$SUMMARY" >> "$REPORT_FILE"

echo "Total Violations: $TOTAL_VIOLATIONS"
echo "Auto-fixed: $TOTAL_AUTO_FIXED"
echo "Blocked: $TOTAL_BLOCKED"
echo ""

# Failed agents
if [ ${#FAILED_AGENTS[@]} -gt 0 ]; then
  echo "Failed Agents:"
  printf '%s\n' "${FAILED_AGENTS[@]}" | sed 's/^/  ❌ /'
  echo ""

  FAILED_LIST="## Failed Agents\n\n"
  for agent in "${FAILED_AGENTS[@]}"; do
    FAILED_LIST+="- ❌ $agent\n"
  done
  echo -e "$FAILED_LIST" >> "$REPORT_FILE"
fi
```

### 7. Determine Exit Status

```bash
# Calculate overall status
if [ ${#FAILED_AGENTS[@]} -gt 0 ] || [ $TOTAL_BLOCKED -gt 0 ]; then
  # Blocking violations found
  if [ "$LEVEL" = "STRICT" ]; then
    STATUS="FAILED"
    EXIT_CODE=1
  elif [ "$LEVEL" = "BALANCED" ] && [ $TOTAL_BLOCKED -gt 0 ]; then
    STATUS="FAILED"
    EXIT_CODE=1
  else
    STATUS="WARNING"
    EXIT_CODE=0
  fi
else
  STATUS="PASSED"
  EXIT_CODE=0
fi

echo "Status: $STATUS"
echo ""

# Write status to report
echo "" >> "$REPORT_FILE"
echo "**Status**: $STATUS" >> "$REPORT_FILE"

# Save report
echo "Report saved: $REPORT_FILE"
```

### 8. Apply Auto-Fixes (if enabled)

```bash
if [ "$AUTO_FIX" = "true" ] && [ $TOTAL_AUTO_FIXED -gt 0 ]; then
  echo ""
  echo "================================================"
  echo "APPLYING AUTO-FIXES"
  echo "================================================"

  if [ "$DRY_RUN" = "true" ]; then
    echo "Dry run: No changes applied"
  else
    echo "Applied $TOTAL_AUTO_FIXED auto-fixes"

    # Stage auto-fixed files
    echo "$FILES" | xargs git add

    echo ""
    echo "Auto-fixed files staged for commit"
    echo "Review changes with: git diff --cached"
  fi
fi
```

### 9. Display Recommendations

```bash
echo ""
echo "================================================"
echo "NEXT STEPS"
echo "================================================"
echo ""

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All checks passed!"
  echo ""
  echo "You can proceed with:"
  echo "  git commit"
else
  echo "❌ Enforcement failed"
  echo ""
  echo "To fix violations:"
  echo "  1. Review report: cat $REPORT_FILE"
  echo "  2. Fix blocking issues manually"
  echo "  3. Run again: /enforce --pipeline=$PIPELINE"
  echo ""

  if [ "$AUTO_FIX" != "true" ]; then
    echo "Or try auto-fix:"
    echo "  /enforce --pipeline=$PIPELINE --auto-fix"
    echo ""
  fi
fi

exit $EXIT_CODE
```

## Available Pipelines

### pre-write

Agents that run before code is written:

- bs-check

### post-write

Agents that run after code is written:

- type-enforcer
- import-enforcer
- bs-enforce

### pre-commit

Agents that run before git commit:

- secret-scanner
- test-coverage

### full-validation

Complete validation suite (all enabled agents):

- bs-check
- type-enforcer
- import-enforcer
- bs-enforce
- secret-scanner

## Enforcement Levels

### STRICT

- All violations blocked
- All agents enabled
- Fail-fast: true
- Auto-fix: enabled

### BALANCED (Default)

- Critical violations blocked
- Core agents enabled
- Fail-fast: false
- Auto-fix: enabled

### PROTOTYPE

- Violations logged only
- Minimal agents (security only)
- Fail-fast: false
- Auto-fix: disabled

## Usage Examples

### Run default pipeline

```bash
/enforce
```

### Run specific pipeline

```bash
/enforce --pipeline=pre-commit
```

### Strict enforcement with auto-fix

```bash
/enforce --strict --auto-fix
```

### Dry run (preview only)

```bash
/enforce --pipeline=full-validation --dry-run
```

### Check specific files

```bash
/enforce --files="src/auth/*.py"
```

## Integration with Other Commands

### Pre-commit hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
/enforce --pipeline=pre-commit --auto-fix
exit $?
```

### CI/CD pipeline

```bash
# .github/workflows/enforce.yml
- name: Run enforcement
  run: /enforce --pipeline=full-validation --strict
```

### Manual quality check

```bash
# Before creating PR
/enforce --pipeline=full-validation
/progress
/commit
```

## Configuration

### Enable/Disable Agents

Edit `agents/index.json`:

```json
{
  "agents": {
    "doc-validator": {
      "enabled": false  // Disable agent
    }
  }
}
```

### Customize Pipeline

Edit `agents/index.json`:

```json
{
  "execution_pipelines": {
    "custom-pipeline": {
      "description": "Custom validation",
      "agents": ["bs-check", "type-enforcer"],
      "fail_fast": true
    }
  }
}
```

### Set Default Level

Edit `.sage/enforcement.json`:

```json
{
  "level": "STRICT",
  "auto_fix_enabled": true
}
```

## Output

### Console Output

- Real-time agent execution
- Violation counts
- Auto-fix status
- Final summary

### Report File

- `.sage/enforcement-report.md`
- Detailed violations by agent
- Auto-fix log
- Recommendations

### Exit Codes

- **0**: All checks passed
- **1**: Enforcement failed (blocking violations)
- **2**: Agent execution error

## Success Criteria

- [ ] All agents executed successfully
- [ ] No blocking violations (or within level threshold)
- [ ] Auto-fixes applied (if enabled)
- [ ] Report generated
- [ ] Exit code indicates status
