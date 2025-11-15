---
allowed-tools: Bash(git:*), Bash(cat:*), Bash(jq:*), Bash(grep:*), Bash(test:*), Bash(node:*), Bash(npx:*), Bash(fd:*), Bash(which:*), Read, Write, Edit, SequentialThinking, SlashCommand(/sage.skill:*)
description: Execute ticket-based implementation following Ticket Clearance Methodology with automatic state management and test validation.
argument-hint: '[ticket-id] [--compact] (optional ticket ID, --compact loads only targetFiles)'
---

## Role

Implementation engineer executing ticket-based development following the Ticket Clearance Methodology.

## Purpose

Transform tickets into working code through systematic implementation:

- **Ticket Selection**: Automatically select next UNPROCESSED ticket with satisfied dependencies
- **State Management**: Follow ticket state machine (UNPROCESSED → IN_PROGRESS → COMPLETED/DEFERRED)
- **Branch Management**: Create and manage feature branches per ticket
- **Code Implementation**: Generate code based on ticket context (spec, plan, breakdown)
- **Compact Mode** (NEW v2.3.0): Optional `--compact` flag loads only targetFiles (60-80% less context)
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
test -f .sage/tickets/index.json || {
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
  TICKET_ID=$(cat .sage/tickets/index.json | jq -r '
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
TICKET_DATA=$(cat .sage/tickets/index.json | jq ".tickets[] | select(.id == \"$TICKET_ID\")")
```

**Key Actions:**

- Accept optional ticket ID argument or auto-select
- Query `.sage/tickets/index.json` for UNPROCESSED tickets
- Filter by satisfied dependencies (all dependencies COMPLETED)
- Sort by priority (P0 > P1 > P2)
- Validate ticket exists and is actionable

### 1.5 Skill Suggestion (Optional)

After loading the ticket, suggest relevant skills based on ticket type.

```bash
# Extract ticket type from ID or title
TICKET_TYPE=$(echo "$TICKET_ID" | grep -oE '^[A-Z]+' | head -1)

# Map ticket type/content to relevant skills
SUGGESTED_SKILLS=""

# Determine skill suggestions based on ticket characteristics
if echo "$TICKET_DATA" | jq -r '.title' | grep -iq "test\|coverage\|tdd"; then
  SUGGESTED_SKILLS="tdd-workflow"
elif echo "$TICKET_DATA" | jq -r '.title' | grep -iq "bug\|fix\|error\|debug"; then
  SUGGESTED_SKILLS="systematic-debugging"
elif echo "$TICKET_DATA" | jq -r '.title' | grep -iq "refactor\|clean\|improve"; then
  SUGGESTED_SKILLS="safe-refactoring-checklist"
elif echo "$TICKET_DATA" | jq -r '.title' | grep -iq "review\|pr\|merge"; then
  SUGGESTED_SKILLS="code-review-checklist"
else
  # Default suggestions for story/epic tickets
  SUGGESTED_SKILLS="tdd-workflow safe-refactoring-checklist"
fi

# Check if skills exist in library
if [ -d ".sage/agent/skills" ] && [ -n "$SUGGESTED_SKILLS" ]; then
  echo ""
  echo "🎯 Suggested Skills for this ticket:"
  echo ""

  SKILL_NUM=1
  AVAILABLE_SKILLS=""

  for SKILL in $SUGGESTED_SKILLS; do
    SKILL_FILE=$(fd -t f "${SKILL}.md" .sage/agent/skills/ 2>/dev/null | head -1)
    if [ -n "$SKILL_FILE" ]; then
      # Extract skill purpose
      PURPOSE=$(grep -A 3 "^## Purpose" "$SKILL_FILE" | head -4 | tail -1 | sed 's/\*\*When to use:\*\*//' | head -c 60)
      echo "  $SKILL_NUM. $SKILL"
      echo "     $PURPOSE..."
      AVAILABLE_SKILLS="$AVAILABLE_SKILLS $SKILL"
      SKILL_NUM=$((SKILL_NUM + 1))
    fi
  done

  if [ -n "$AVAILABLE_SKILLS" ]; then
    echo ""
    echo "Apply skill? (enter number, or 'none' to skip):"
    read -r SKILL_CHOICE

    if [ "$SKILL_CHOICE" != "none" ] && [ "$SKILL_CHOICE" != "" ]; then
      # Get selected skill name
      SELECTED_SKILL=$(echo "$AVAILABLE_SKILLS" | tr ' ' '\n' | sed -n "${SKILL_CHOICE}p")
      if [ -n "$SELECTED_SKILL" ]; then
        echo ""
        echo "📚 Applying skill: $SELECTED_SKILL"

        # Apply skill with prerequisite validation
        # This displays the skill and validates prerequisites
        /sage.skill "$SELECTED_SKILL" --apply

        # Log skill application in ticket notes
        echo "Applied skill: $SELECTED_SKILL" >> .sage/tickets/${TICKET_ID}-notes.md
      fi
    else
      echo "Skipping skill application."
    fi
  fi
fi
```

**Key Actions:**

- Analyze ticket type from ID prefix or title keywords
- Map ticket characteristics to relevant skills:
  - Bug/fix/error tickets → `systematic-debugging`
  - Test/coverage tickets → `tdd-workflow`
  - Refactor/clean tickets → `safe-refactoring-checklist`
  - Review/PR tickets → `code-review-checklist`
  - General story/epic → `tdd-workflow`, `safe-refactoring-checklist`
- Display available skills with brief descriptions
- Allow user to select skill or skip
- Apply selected skill with `/sage.skill --apply`
- Log skill application in ticket notes

### 2. Mark Ticket IN_PROGRESS

```bash
# Update ticket state in index.json
# State: UNPROCESSED → IN_PROGRESS

# Update ticket markdown
cat >> .sage/tickets/${TICKET_ID}.md <<EOF

## Implementation Started
**Started:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Status:** IN_PROGRESS
EOF

# Record updated timestamp in index.json
```

**Key Actions:**

- Update `.sage/tickets/index.json`: state = "IN_PROGRESS"
- Append status to `.sage/tickets/[ID].md`
- Record start timestamp
- This ensures resumption safety if interrupted

### 3. Comprehensive Context Assembly

**Context Engineering: Load ALL relevant documentation before implementation**

```bash
# ========================================
# Check for Compact Mode (NEW v2.3.0)
# ========================================
COMPACT_MODE=false
if [ "$2" = "--compact" ] || [ "$1" = "--compact" ]; then
  COMPACT_MODE=true
fi

# Check if ticket has targetFiles
TARGET_FILES_COUNT=$(echo $TICKET_DATA | jq -r '.targetFiles // [] | length')

if [ "$COMPACT_MODE" = "true" ] && [ "$TARGET_FILES_COUNT" -gt 0 ]; then
  echo "📦 Compact Mode: Loading only target files..."
  echo ""
  echo "Target files detected: $TARGET_FILES_COUNT"
  echo ""

  # Load targetFiles from ticket
  TARGET_FILES=$(echo $TICKET_DATA | jq -r '.targetFiles[]')

  # For each target file, load it
  echo $TICKET_DATA | jq -r '.targetFiles[] | @json' | while read -r TARGET_FILE_JSON; do
    FILE_PATH=$(echo $TARGET_FILE_JSON | jq -r '.path')
    ACTION=$(echo $TARGET_FILE_JSON | jq -r '.action')
    LINE_RANGE=$(echo $TARGET_FILE_JSON | jq -r '.lineRange // empty')
    PURPOSE=$(echo $TARGET_FILE_JSON | jq -r '.purpose')

    echo "📄 $FILE_PATH ($ACTION)"
    echo "   Purpose: $PURPOSE"

    if [ "$ACTION" = "modify" ] || [ "$ACTION" = "delete" ]; then
      # File should exist
      if [ -f "$FILE_PATH" ]; then
        if [ -n "$LINE_RANGE" ]; then
          START_LINE=$(echo $LINE_RANGE | cut -d'-' -f1)
          END_LINE=$(echo $LINE_RANGE | cut -d'-' -f2)
          echo "   Lines: $START_LINE-$END_LINE"
          sed -n "${START_LINE},${END_LINE}p" "$FILE_PATH"
        else
          echo "   Full file:"
          cat "$FILE_PATH"
        fi
      else
        echo "   ⚠️  File not found (may need to search codebase)"
      fi
    elif [ "$ACTION" = "create" ]; then
      echo "   Will create new file"
    fi
    echo ""
  done

  # Load minimal context: just ticket docs and .sage/context.md
  echo "📚 Loading ticket documentation..."

  SPEC_PATH=$(echo $TICKET_DATA | jq -r '.docs.spec')
  PLAN_PATH=$(echo $TICKET_DATA | jq -r '.docs.plan')

  test -f "$SPEC_PATH" && cat "$SPEC_PATH"
  test -f "$PLAN_PATH" && cat "$PLAN_PATH"

  # Load project context if available
  if [ -f ".sage/context.md" ]; then
    echo "📋 Loading project context..."
    cat .sage/context.md
  fi

  echo ""
  echo "═══════════════════════════════════════"
  echo "   COMPACT CONTEXT ASSEMBLY COMPLETE"
  echo "═══════════════════════════════════════"
  echo ""
  echo "Loaded:"
  echo "  ✓ Target files: $TARGET_FILES_COUNT"
  echo "  ✓ Ticket documentation"
  echo "  ✓ Project context (.sage/context.md)"
  echo ""
  echo "Benefits: 60-80% less context, faster execution"
  echo "═══════════════════════════════════════"
  echo ""

  # Skip to Step 4 (implementation)
  # The rest of Step 3 is skipped in compact mode

else
  # Standard mode: load full context
  if [ "$COMPACT_MODE" = "true" ]; then
    echo "⚠️  Compact mode requested but no targetFiles found in ticket"
    echo "   Falling back to standard context loading..."
    echo ""
  fi

  echo "📚 Assembling Implementation Context..."
  echo ""

  # ========================================
  # PRIORITY 1: Ticket Documentation (Required)
  # ========================================
  echo "Loading ticket context..."

# Load ticket-linked documents
SPEC_PATH=$(echo $TICKET_DATA | jq -r '.docs.spec')
PLAN_PATH=$(echo $TICKET_DATA | jq -r '.docs.plan')
BREAKDOWN_PATH=$(echo $TICKET_DATA | jq -r '.docs.breakdown // empty')
TASKS_PATH=$(echo $TICKET_DATA | jq -r '.docs.tasks // empty')

# Read ticket documents
test -f "$SPEC_PATH" && cat "$SPEC_PATH"
test -f "$PLAN_PATH" && cat "$PLAN_PATH"
test -f "$BREAKDOWN_PATH" && cat "$BREAKDOWN_PATH"
test -f "$TASKS_PATH" && cat "$TASKS_PATH"

# Extract acceptance criteria from ticket
echo $TICKET_DATA | jq -r '.acceptanceCriteria[]'

echo "✓ Ticket documentation loaded"
echo ""

# ========================================
# PRIORITY 2: Research & Intelligence
# ========================================
echo "Loading research and intelligence..."

# Extract component name from spec path (e.g., docs/specs/auth/spec.md → auth)
COMPONENT=$(echo "$SPEC_PATH" | sed 's|docs/specs/||' | sed 's|/spec.md||')

# Try to find related research from feature name in plan
RESEARCH_FILES=$(find docs/research -type f -name "*.md" 2>/dev/null | \
  grep -i "$COMPONENT" || echo "")

if [ -n "$RESEARCH_FILES" ]; then
  echo "$RESEARCH_FILES" | while read RESEARCH_FILE; do
    echo "  Loading: $RESEARCH_FILE"
    cat "$RESEARCH_FILE"
  done
  echo "✓ Research documentation loaded"
else
  echo "ℹ️  No research documentation found for component: $COMPONENT"
fi
echo ""

# ========================================
# PRIORITY 3: Original Feature Requests
# ========================================
echo "Loading feature requests..."

# Find related feature requests
FEATURE_FILES=$(find docs/features -type f -name "*.md" 2>/dev/null | \
  grep -i "$COMPONENT" || echo "")

if [ -n "$FEATURE_FILES" ]; then
  echo "$FEATURE_FILES" | while read FEATURE_FILE; do
    echo "  Loading: $FEATURE_FILE"
    cat "$FEATURE_FILE"
  done
  echo "✓ Feature requests loaded"
else
  echo "ℹ️  No feature requests found for component: $COMPONENT"
fi
echo ""

# ========================================
# PRIORITY 4: Code Examples & Patterns
# ========================================
echo "Loading code patterns..."

# Extract target files from ticket for context-aware pattern loading
TARGET_FILES=$(echo $TICKET_DATA | jq -r '.targetFiles[]? // empty')

# Use progressive loader if MCP server is available
PATTERNS_DIR=".sage/agent/examples"
if [ -d "servers/sage-context-optimizer/dist" ] && [ -f "$PATTERNS_DIR/repository-patterns.ts" ]; then
  echo "  Using progressive pattern loader..."

  # Determine loading level based on ticket complexity
  TICKET_PRIORITY=$(echo $TICKET_DATA | jq -r '.priority // "P1"')
  case "$TICKET_PRIORITY" in
    "P0") LOADING_LEVEL="extended" ;;
    "P1") LOADING_LEVEL="core" ;;
    *)    LOADING_LEVEL="critical" ;;
  esac

  echo "  Loading level: $LOADING_LEVEL (based on priority: $TICKET_PRIORITY)"

  # Load patterns for first target file or component entry point
  if [ -n "$TARGET_FILES" ]; then
    CONTEXT_FILE=$(echo "$TARGET_FILES" | head -1)
  else
    CONTEXT_FILE="src/${COMPONENT}/index.ts"
  fi

  # Get pattern summary for implementation
  cd servers/sage-context-optimizer
  PATTERN_JSON=$(node -e "
    import { ProgressiveLoader } from './dist/progressive-loader.js';
    const loader = new ProgressiveLoader({ patternsDir: '../../$PATTERNS_DIR' });
    loader.loadForContext('../../$CONTEXT_FILE', '$LOADING_LEVEL')
      .then(result => {
        console.log(JSON.stringify({
          context: result.context,
          patterns: result.patterns,
          tokenCount: result.tokenCount,
          reduction: result.reductionPercentage
        }, null, 2));
      })
      .catch(err => console.error('Pattern loading error:', err.message));
  " 2>/dev/null)
  cd ../..

  if [ -n "$PATTERN_JSON" ]; then
    echo "  ✓ Context-aware patterns loaded"
    echo "    File type: $(echo "$PATTERN_JSON" | jq -r '.context.fileType')"
    echo "    Feature: $(echo "$PATTERN_JSON" | jq -r '.context.feature')"
    echo "    Domain: $(echo "$PATTERN_JSON" | jq -r '.context.domain')"
    echo "    Token reduction: $(echo "$PATTERN_JSON" | jq -r '.reduction')%"
    echo ""

    # Store patterns for implementation step
    LOADED_PATTERNS="$PATTERN_JSON"

    # Also get formatted markdown summary for reference
    PATTERN_SUMMARY=$(node servers/sage-context-optimizer/dist/format-patterns-for-spec.js \
        --dir "$PATTERNS_DIR" --format markdown 2>/dev/null)

    if [ -n "$PATTERN_SUMMARY" ]; then
      echo "  Pattern requirements to follow:"
      echo "$PATTERN_SUMMARY" | head -30
    fi
  else
    echo "  ⚠️  Failed to load patterns progressively, using static patterns"
    LOADED_PATTERNS=""
  fi
else
  # Fallback: Load static patterns if progressive loader not available
  echo "  Progressive loader not available, using static patterns..."

  # Detect primary language from existing codebase
  PRIMARY_LANG=$(find . -name "*.py" -not -path "*/venv/*" -not -path "*/.venv/*" | head -1 && echo "python" || \
                 find . -name "*.js" -not -path "*/node_modules/*" | head -1 && echo "javascript" || \
                 find . -name "*.go" | head -1 && echo "go" || \
                 echo "unknown")

  if [ "$PRIMARY_LANG" != "unknown" ] && [ -d "$PATTERNS_DIR/$PRIMARY_LANG" ]; then
    echo "  Primary language: $PRIMARY_LANG"

    # List available pattern categories
    PATTERN_CATEGORIES=$(find "$PATTERNS_DIR/$PRIMARY_LANG" -type d -mindepth 1 -maxdepth 1 2>/dev/null)

    if [ -n "$PATTERN_CATEGORIES" ]; then
      echo "  Available patterns:"
      echo "$PATTERN_CATEGORIES" | while read PATTERN_DIR; do
        CATEGORY=$(basename "$PATTERN_DIR")
        PATTERN_COUNT=$(find "$PATTERN_DIR" -type f -name "*.md" | wc -l)
        echo "    - $CATEGORY ($PATTERN_COUNT patterns)"

        # Load relevant patterns for this component
        find "$PATTERN_DIR" -type f -name "*.md" | head -3 | while read PATTERN_FILE; do
          echo "      Loading: $(basename $PATTERN_FILE)"
          cat "$PATTERN_FILE"
        done
      done
      echo "✓ Code patterns loaded"
    else
      echo "ℹ️  No code patterns found"
    fi
  else
    echo "ℹ️  No code examples available (run /sage.init to extract patterns)"
  fi
  LOADED_PATTERNS=""
fi
echo ""

# ========================================
# PRIORITY 5: System Documentation
# ========================================
echo "Loading system context..."

# Architecture context
if [ -f ".sage/agent/system/architecture.md" ]; then
  echo "  Loading: architecture.md"
  cat .sage/agent/system/architecture.md
fi

# Tech stack context
if [ -f ".sage/agent/system/tech-stack.md" ]; then
  echo "  Loading: tech-stack.md"
  cat .sage/agent/system/tech-stack.md
fi

# Pattern documentation
if [ -f ".sage/agent/system/patterns.md" ]; then
  echo "  Loading: patterns.md"
  cat .sage/agent/system/patterns.md
fi

if [ -f ".sage/agent/system/architecture.md" ] || \
   [ -f ".sage/agent/system/tech-stack.md" ] || \
   [ -f ".sage/agent/system/patterns.md" ]; then
  echo "✓ System documentation loaded"
else
  echo "ℹ️  No system documentation (run /sage.init to generate)"
fi
echo ""

# ========================================
# PRIORITY 6: Project Standards
# ========================================
echo "Loading project standards..."

# Load CLAUDE.md if exists
if [ -f "CLAUDE.md" ]; then
  echo "  Loading: CLAUDE.md"
  cat CLAUDE.md
  echo "✓ Project standards loaded"
else
  echo "ℹ️  No CLAUDE.md found"
fi
echo ""

# ========================================
# Context Assembly Summary
# ========================================
echo "═══════════════════════════════════════"
echo "        CONTEXT ASSEMBLY COMPLETE"
echo "═══════════════════════════════════════"
echo ""
echo "Loaded Context:"
echo "  ✓ Ticket: $TICKET_ID"
echo "  ✓ Component: $COMPONENT"
echo "  ✓ Spec: $SPEC_PATH"
echo "  ✓ Plan: $PLAN_PATH"
[ -f "$BREAKDOWN_PATH" ] && echo "  ✓ Breakdown: $BREAKDOWN_PATH"
[ -f "$TASKS_PATH" ] && echo "  ✓ Tasks: $TASKS_PATH"
[ -n "$RESEARCH_FILES" ] && echo "  ✓ Research: $(echo "$RESEARCH_FILES" | wc -l) files"
[ -n "$FEATURE_FILES" ] && echo "  ✓ Features: $(echo "$FEATURE_FILES" | wc -l) files"
if [ -n "$LOADED_PATTERNS" ]; then
  echo "  ✓ Code Patterns: Progressive ($LOADING_LEVEL level)"
  echo "    Token reduction: $(echo "$LOADED_PATTERNS" | jq -r '.reduction')%"
else
  [ "$PRIMARY_LANG" != "unknown" ] && echo "  ✓ Code Patterns: $PRIMARY_LANG"
fi
[ -f ".sage/agent/system/architecture.md" ] && echo "  ✓ System Architecture"
[ -f "CLAUDE.md" ] && echo "  ✓ Project Standards"
echo ""
echo "Ready for implementation with full context"
echo "═══════════════════════════════════════"
echo ""

fi  # End of compact mode check
```

**Key Actions:**

**Compact Mode (--compact flag + targetFiles present):**
- Load only targetFiles specified in ticket (60-80% less context)
- Load ticket documentation (spec, plan)
- Load project context (.sage/context.md)
- Skip research, code examples, system docs (focused implementation)

**Standard Mode (default):**
- **Priority 1:** Load ticket documentation (spec, plan, breakdown, tasks)
- **Priority 2:** Load research and intelligence for component
- **Priority 3:** Load original feature requests
- **Priority 4:** Load code examples and patterns from repository
  - **Progressive loading:** Use context-aware pattern loader when available
  - Determine loading level based on ticket priority (P0→extended, P1→core, P2→critical)
  - Extract patterns for target files (naming, typing, testing, error handling)
  - Calculate token reduction percentage for efficient context usage
  - Fall back to static patterns if progressive loader unavailable
- **Priority 5:** Load system documentation (architecture, tech-stack, patterns)
- **Priority 6:** Load project standards (CLAUDE.md)

**Both Modes:**
- Use SequentialThinking with available context to understand requirements
- Identify files to create/modify (from targetFiles or spec analysis)
- Determine testing approach from research and patterns
- Apply repository patterns and system conventions
- Track pattern compliance during implementation

### 4. Check Dependencies

```bash
# Verify all dependencies are COMPLETED
DEPENDENCIES=$(echo $TICKET_DATA | jq -r '.dependencies[]?')

for DEP in $DEPENDENCIES; do
  DEP_STATE=$(cat .sage/tickets/index.json | jq -r ".tickets[] | select(.id == \"$DEP\") | .state")

  if [ "$DEP_STATE" != "COMPLETED" ]; then
    echo "ERROR: Dependency $DEP not satisfied (state: $DEP_STATE)"
    # Mark ticket DEFERRED
    # Update .sage/tickets/index.json and .sage/tickets/[ID].md
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
cat >> .sage/tickets/${TICKET_ID}.md <<EOF
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
# - Repository patterns (from progressive loader)
# - Existing codebase conventions

# If progressive patterns were loaded, extract key requirements
if [ -n "$LOADED_PATTERNS" ]; then
  echo "📝 Applying repository patterns to implementation..."

  # Extract pattern constraints
  FILE_TYPE=$(echo "$LOADED_PATTERNS" | jq -r '.context.fileType')
  NAMING_PATTERNS=$(echo "$LOADED_PATTERNS" | jq -r '.patterns.naming // empty')
  TYPING_PATTERNS=$(echo "$LOADED_PATTERNS" | jq -r '.patterns.typing // empty')
  TESTING_PATTERNS=$(echo "$LOADED_PATTERNS" | jq -r '.patterns.testing // empty')

  echo "  File type: $FILE_TYPE"
  echo "  Naming conventions: $(echo "$NAMING_PATTERNS" | jq -r '.functions.pattern // "camelCase"')"
  echo "  Testing framework: $(echo "$TESTING_PATTERNS" | jq -r '.framework // "vitest"')"
  echo ""

  # Generate pattern-aware implementation checklist
  cat <<EOF
Pattern Compliance Checklist:
- [ ] Function names follow $(echo "$NAMING_PATTERNS" | jq -r '.functions.pattern // "camelCase"') convention
- [ ] Class names follow $(echo "$NAMING_PATTERNS" | jq -r '.classes.pattern // "PascalCase"') convention
- [ ] Type coverage meets $(echo "$TYPING_PATTERNS" | jq -r '.typeHintCoverage // 80')% threshold
- [ ] Error handling uses explicit throws (no silent failures)
- [ ] Tests use $(echo "$TESTING_PATTERNS" | jq -r '.framework // "vitest"') framework
EOF
fi
```

**Key Actions:**

- Parse breakdown for technical specifications
- Identify code files to create or modify
- Implement functionality per acceptance criteria
- Follow architecture patterns from plan
- **Apply repository patterns from progressive loader:**
  - Use detected naming conventions (camelCase functions, PascalCase classes)
  - Follow type safety requirements (union syntax, generics style)
  - Implement error handling per repository standards
  - Use detected testing framework (Vitest, pytest, etc.)
- Maintain existing code conventions
- Update imports, dependencies, configurations
- Validate pattern compliance during implementation

### 7. Atomic Commits During Implementation

```bash
# Commit logical units of work during implementation
git add [files]
git commit -m "feat(component): #${TICKET_ID} implement [feature]"

# Record commits in ticket
COMMIT_SHA=$(git rev-parse HEAD)
cat >> .sage/tickets/${TICKET_ID}.md <<EOF
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

### 9. Quality Gates (NEW v2.3.0)

Run automated quality checks before marking ticket as COMPLETED. This catches 80% of issues automatically and enforces NO BULLSHIT CODE principles.

```bash
echo "🔍 Running Quality Gates..."
echo ""

GATE_FAILED=false
CHANGED_FILES=$(git diff --name-only HEAD)

# Detect primary language
if echo "$CHANGED_FILES" | grep -q "\.py$"; then
  PRIMARY_LANG="python"
elif echo "$CHANGED_FILES" | grep -q "\.\(js\|ts\)$"; then
  PRIMARY_LANG="javascript"
else
  PRIMARY_LANG="unknown"
fi

# ========================================
# Gate 1: Linting
# ========================================
echo "Gate 1: Linting..."

if [ "$PRIMARY_LANG" = "python" ]; then
  if command -v ruff &> /dev/null; then
    if ! uv run ruff check $CHANGED_FILES; then
      echo "❌ Linting failed"
      GATE_FAILED=true
    else
      echo "✓ Linting passed"
    fi
  else
    echo "ℹ️  ruff not installed, skipping lint check"
  fi
elif [ "$PRIMARY_LANG" = "javascript" ]; then
  if command -v eslint &> /dev/null; then
    if ! npx eslint $CHANGED_FILES; then
      echo "❌ Linting failed"
      GATE_FAILED=true
    else
      echo "✓ Linting passed"
    fi
  else
    echo "ℹ️  eslint not found, skipping lint check"
  fi
fi
echo ""

# ========================================
# Gate 2: Type Checking
# ========================================
echo "Gate 2: Type Checking..."

if [ "$PRIMARY_LANG" = "python" ]; then
  if command -v mypy &> /dev/null; then
    if ! uv run mypy $CHANGED_FILES; then
      echo "❌ Type checking failed"
      GATE_FAILED=true
    else
      echo "✓ Type checking passed"
    fi
  else
    echo "ℹ️  mypy not installed, skipping type check"
  fi
elif [ "$PRIMARY_LANG" = "javascript" ]; then
  if [ -f "tsconfig.json" ]; then
    if ! npx tsc --noEmit; then
      echo "❌ Type checking failed"
      GATE_FAILED=true
    else
      echo "✓ Type checking passed"
    fi
  else
    echo "ℹ️  No tsconfig.json, skipping type check"
  fi
fi
echo ""

# ========================================
# Gate 3: Tests
# ========================================
echo "Gate 3: Test Suite..."

if [ "$PRIMARY_LANG" = "python" ]; then
  if ! uv run pytest tests/ -v; then
    echo "❌ Tests failed"
    GATE_FAILED=true
  else
    echo "✓ All tests passed"
  fi
elif [ "$PRIMARY_LANG" = "javascript" ]; then
  if [ -f "package.json" ] && grep -q "jest" package.json; then
    if ! npm test; then
      echo "❌ Tests failed"
      GATE_FAILED=true
    else
      echo "✓ All tests passed"
    fi
  else
    echo "ℹ️  No test framework detected, skipping tests"
  fi
fi
echo ""

# ========================================
# Gate 4: NO BULLSHIT CODE Check
# ========================================
echo "Gate 4: NO BULLSHIT CODE Check..."

if [ -f ".claude/agents/bs-check.md" ] || [ -f ".claude/agents/sage.bs-check.md" ]; then
  echo "Running bs-check agent on changed files..."

  # Check for bullshit patterns
  BULLSHIT_FOUND=false

  for file in $CHANGED_FILES; do
    # Check for fallbacks
    if grep -q "except.*pass\|try.*except.*:" "$file" 2>/dev/null; then
      echo "⚠️  $file: Error swallowing detected"
      BULLSHIT_FOUND=true
    fi

    # Check for magic defaults
    if grep -q "or \[\]\|or {}\|or ''" "$file" 2>/dev/null; then
      echo "⚠️  $file: Magic defaults detected"
      BULLSHIT_FOUND=true
    fi

    # Check for graceful degradation
    if grep -q "graceful\|fallback" "$file" 2>/dev/null; then
      echo "⚠️  $file: Graceful degradation pattern detected"
      BULLSHIT_FOUND=true
    fi
  done

  if [ "$BULLSHIT_FOUND" = "true" ]; then
    echo "❌ NO BULLSHIT CODE check failed"
    GATE_FAILED=true
  else
    echo "✓ NO BULLSHIT CODE check passed"
  fi
else
  echo "ℹ️  bs-check agent not configured, skipping"
fi
echo ""

# ========================================
# Gate Results
# ========================================
if [ "$GATE_FAILED" = "true" ]; then
  echo "═══════════════════════════════════════"
  echo "    ❌ QUALITY GATES FAILED"
  echo "═══════════════════════════════════════"
  echo ""
  echo "One or more quality gates failed."
  echo ""
  echo "Options:"
  echo "  1. Fix issues and re-run /sage.implement"
  echo "  2. Defer ticket for later (DEFERRED state)"
  echo "  3. Override and continue (not recommended)"
  echo ""
  read -p "Action [1=fix/2=defer/3=override]: " ACTION

  if [ "$ACTION" = "2" ]; then
    echo "Deferring ticket..."
    # Mark ticket as DEFERRED
    cat .sage/tickets/index.json | jq '
      .tickets |= map(
        if .id == "'$TICKET_ID'" then
          .state = "DEFERRED" |
          .updated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'" |
          .deferredReason = "Quality gates failed"
        else . end
      )
    ' > .sage/tickets/index.json.tmp && mv .sage/tickets/index.json.tmp .sage/tickets/index.json
    exit 1
  elif [ "$ACTION" = "3" ]; then
    echo "⚠️  Overriding quality gates (not recommended)"
    echo "Proceeding to user confirmation..."
  else
    echo "Please fix the issues and re-run /sage.implement"
    exit 1
  fi
else
  echo "═══════════════════════════════════════"
  echo "    ✓ ALL QUALITY GATES PASSED"
  echo "═══════════════════════════════════════"
  echo ""
fi
```

**Key Actions:**

- **Gate 1 - Linting**: Run ruff (Python) or eslint (JavaScript/TypeScript)
- **Gate 2 - Type Checking**: Run mypy (Python) or tsc (TypeScript)
- **Gate 3 - Tests**: Run pytest (Python) or jest (JavaScript)
- **Gate 4 - NO BULLSHIT CODE**: Check for forbidden patterns (fallbacks, mocks, error swallowing)
- Fail ticket if any gate fails
- Offer defer or override options
- Enforce quality before marking COMPLETED

**Benefits:**

- Catches 80% of issues automatically (per ticket-enhancement.md analysis)
- Enforces CLAUDE.md "NO BULLSHIT CODE" principles
- Prevents broken code from being marked COMPLETED
- Reduces review cycles
- Maintains codebase quality

### 10. Request User Confirmation

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

### 11. Handle Confirmation Response

**If User Confirms:**

```bash
# Mark ticket COMPLETED
# Update .sage/tickets/index.json: state = "COMPLETED"
# Update .sage/tickets/[ID].md with completion details
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

### 12. Mark Ticket COMPLETED

```bash
# Update ticket state
# State: IN_PROGRESS → COMPLETED

# Update .sage/tickets/index.json
cat .sage/tickets/index.json | jq '
  .tickets |= map(
    if .id == "'$TICKET_ID'" then
      .state = "COMPLETED" |
      .updated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    else . end
  )
' > .sage/tickets/index.json.tmp && mv .sage/tickets/index.json.tmp .sage/tickets/index.json

# Update ticket markdown
cat >> .sage/tickets/${TICKET_ID}.md <<EOF

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

- `.sage/tickets/index.json` - Ticket queue and states
- `.sage/tickets/[ID].md` - Per-ticket details and acceptance criteria
- `docs/specs/*/spec.md` - Component specifications
- `docs/specs/*/plan.md` - Architecture and dependencies
- `docs/breakdown/*/breakdown.md` - Implementation details
- Current git branch and repository state

**Outputs:**

- Implemented code files following specifications
- Updated `.sage/tickets/index.json` with new state (COMPLETED/DEFERRED)
- Updated `.sage/tickets/[ID].md` with implementation details
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
