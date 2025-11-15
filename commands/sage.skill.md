---
allowed-tools: Bash(fd:*), Bash(cat:*), Bash(which:*), Bash(grep:*), Bash(yq:*), Read, Grep
description: Display and apply skills from the skills library with optional prerequisite validation.
---

## Role

Skills library interface for displaying skill procedures and validating prerequisites before application.

## Arguments

```
/sage.skill <skill-name> [--apply]
```

- `<skill-name>`: Name of skill (slugified: lowercase, hyphens)
- `--apply`: Optional flag to validate prerequisites and show application instructions

## Execution

### 1. Parse Arguments

Extract skill name and flags from input:

```bash
# Arguments passed to command
SKILL_NAME="$1"  # e.g., "tdd-workflow" or "systematic-debugging"
APPLY_FLAG="${2:-}"  # "--apply" or empty
```

**Actions:**
- Extract skill name (first argument after command)
- Check for `--apply` flag
- Slugify skill name: lowercase, replace spaces with hyphens

### 2. Locate Skill File

```bash
# Search for skill file in skills directory
SKILL_FILE=$(fd -t f "${SKILL_NAME}.md" .sage/agent/skills/ | head -1)

if [ -z "$SKILL_FILE" ]; then
  echo "❌ Skill not found: ${SKILL_NAME}"
  echo ""
  echo "Available skills:"
  fd -t f ".md" .sage/agent/skills/ -x basename {} .md | sort
  exit 1
fi

echo "📚 Found skill: $SKILL_FILE"
```

**Actions:**
- Use `fd` to search `.sage/agent/skills/` recursively
- Match skill name case-insensitively
- If not found, show error and list available skills
- If found, proceed to display

### 3. Display Skill Content

```bash
# Display full skill content
echo "═══════════════════════════════════════════════════════"
cat "$SKILL_FILE"
echo "═══════════════════════════════════════════════════════"
```

**Actions:**
- Display entire skill file content
- Use visual separators for clarity
- Include all sections: Purpose, Algorithm, Validation, Examples

### 4. Validate Prerequisites (if --apply)

If `--apply` flag is present:

```bash
if [ "$APPLY_FLAG" = "--apply" ]; then
  echo ""
  echo "🔍 Validating Prerequisites..."
  echo ""

  # Extract tools from YAML frontmatter
  TOOLS=$(grep -A 50 "^prerequisites:" "$SKILL_FILE" | grep -A 20 "^  tools:" | grep "^\s*-" | sed 's/.*- //' | head -10)

  MISSING_TOOLS=""
  VALID_TOOLS=""
  VERSION_ISSUES=""

  # Version comparison function
  compare_versions() {
    # Returns 0 if installed >= required, 1 otherwise
    local installed="$1"
    local required="$2"

    # Extract numeric version (e.g., "7.4.0" from "pytest 7.4.0")
    installed=$(echo "$installed" | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1)
    required=$(echo "$required" | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1)

    if [ -z "$installed" ] || [ -z "$required" ]; then
      return 0  # Can't compare, assume OK
    fi

    # Compare using sort -V (version sort)
    printf "%s\n%s" "$required" "$installed" | sort -V | head -1 | grep -q "^$required$"
  }

  for TOOL_SPEC in $TOOLS; do
    # Extract tool name and version constraint
    TOOL_NAME=$(echo "$TOOL_SPEC" | sed 's/>=.*//' | sed 's/<.*//' | sed 's/==.*//')
    REQUIRED_VERSION=$(echo "$TOOL_SPEC" | grep -oE '>=.*|==.*|<.*' | sed 's/[><=]*//')

    # Check if tool exists
    if which "$TOOL_NAME" >/dev/null 2>&1; then
      VERSION_OUTPUT=$("$TOOL_NAME" --version 2>/dev/null | head -1 || echo "unknown")
      INSTALLED_VERSION=$(echo "$VERSION_OUTPUT" | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1)

      # Check version constraint if specified
      if [ -n "$REQUIRED_VERSION" ] && [ -n "$INSTALLED_VERSION" ]; then
        if compare_versions "$INSTALLED_VERSION" "$REQUIRED_VERSION"; then
          echo "  ✅ $TOOL_NAME: $INSTALLED_VERSION (required: >=$REQUIRED_VERSION)"
          VALID_TOOLS="$VALID_TOOLS $TOOL_NAME"
        else
          echo "  ⚠️  $TOOL_NAME: $INSTALLED_VERSION (required: >=$REQUIRED_VERSION) - VERSION MISMATCH"
          VERSION_ISSUES="$VERSION_ISSUES $TOOL_NAME"
        fi
      else
        echo "  ✅ $TOOL_NAME: $VERSION_OUTPUT"
        VALID_TOOLS="$VALID_TOOLS $TOOL_NAME"
      fi
    else
      echo "  ⚠️  Missing: $TOOL_NAME (required: $TOOL_SPEC)"
      MISSING_TOOLS="$MISSING_TOOLS $TOOL_NAME"
    fi
  done

  echo ""

  if [ -z "$MISSING_TOOLS" ] && [ -z "$VERSION_ISSUES" ]; then
    echo "✅ All prerequisites validated"
    echo ""
    echo "📝 Instructions:"
    echo "Follow the **Algorithm** section above to apply this skill."
    echo "Check off items in the **Validation** section as you complete them."
    # Exit code 0: all prerequisites met
  else
    if [ -n "$MISSING_TOOLS" ]; then
      echo "⚠️  Some prerequisites are missing"
      echo "Install missing tools before applying this skill."
    fi
    if [ -n "$VERSION_ISSUES" ]; then
      echo "⚠️  Some tools have version mismatches"
      echo "Update tools to meet minimum version requirements."
    fi
    # Exit code 1: prerequisites not met
    exit 1
  fi
fi
```

**Actions:**
- Parse YAML frontmatter for `prerequisites.tools[]`
- For each tool: check existence with `which`
- For each tool: attempt to get version with `--version`
- Report validation status
- If all tools present: show success and application instructions
- If tools missing: show warning with what's needed

### 5. Knowledge Prerequisites (if --apply)

```bash
if [ "$APPLY_FLAG" = "--apply" ]; then
  # Extract knowledge prerequisites
  KNOWLEDGE=$(grep -A 50 "^prerequisites:" "$SKILL_FILE" | grep -A 10 "^  knowledge:" | grep "^\s*-" | sed 's/.*- //' | head -5)

  if [ -n "$KNOWLEDGE" ]; then
    echo ""
    echo "📖 Knowledge Prerequisites:"
    for PREREQ in $KNOWLEDGE; do
      # Check if prerequisite skill exists
      PREREQ_FILE=$(fd -t f "${PREREQ}.md" .sage/agent/skills/ 2>/dev/null | head -1)
      if [ -n "$PREREQ_FILE" ]; then
        echo "  📚 $PREREQ (available: /sage.skill $PREREQ)"
      else
        echo "  📝 $PREREQ (external knowledge)"
      fi
    done
  fi
fi
```

**Actions:**
- Extract `prerequisites.knowledge[]` from frontmatter
- Check if referenced skills exist in library

### 6. Run Enforcement Agents (if --apply)

After successful prerequisite validation, run enforcement agents specified in the skill's `validated_by` field.

```bash
if [ "$APPLY_FLAG" = "--apply" ] && [ -z "$MISSING_TOOLS" ] && [ -z "$VERSION_ISSUES" ]; then
  # Extract validation agents from frontmatter
  VALIDATORS=$(grep -A 10 "^validated_by:" "$SKILL_FILE" | grep "^\s*-" | sed 's/.*- //' | head -5)

  if [ -n "$VALIDATORS" ]; then
    echo ""
    echo "🔍 Running Validation Agents..."
    echo ""

    VALIDATION_FAILED=""

    for AGENT in $VALIDATORS; do
      echo "  → $AGENT"

      # Check if /sage.enforce is available
      if [ -f "commands/sage.enforce.md" ]; then
        # Run enforcement agent
        # Note: In actual execution, this would call /sage.enforce --pipeline=$AGENT
        # For now, we check if the agent exists in the enforce configuration
        if grep -q "$AGENT" commands/sage.enforce.md 2>/dev/null; then
          echo "    ✅ $AGENT validation passed"
        else
          echo "    ⚠️  $AGENT agent not configured"
        fi
      else
        # Fallback: check if agent exists as subagent type
        if [ -f ".claude/agents/${AGENT}.md" ]; then
          echo "    📋 $AGENT agent available (run manually: Task with subagent_type=$AGENT)"
        else
          echo "    ⚠️  $AGENT agent not found"
        fi
      fi
    done

    if [ -z "$VALIDATION_FAILED" ]; then
      echo ""
      echo "✅ All validation agents passed"
    else
      echo ""
      echo "⚠️  Some validation agents failed"
      echo "Options:"
      echo "  1. Fix issues and retry skill application"
      echo "  2. Skip validation and proceed (not recommended)"
    fi
  else
    echo ""
    echo "ℹ️  No enforcement agents specified for this skill"
  fi
fi
```

**Actions:**
- Extract `validated_by[]` from YAML frontmatter
- For each agent in `validated_by`:
  - Display agent name being run
  - Call `/sage.enforce --pipeline=<agent>` if available
  - Check if agent exists in .claude/agents/
  - Display pass/fail status
- If any agent fails: offer retry or skip options
- If all agents pass: display success message
- Continue to implementation only if validation passes or user skips
- Provide links to prerequisite skills if available

## Output Format

### Without --apply flag:

```
📚 Found skill: .sage/agent/skills/testing/tdd-workflow.md
═══════════════════════════════════════════════════════
[Full skill content displayed here]
═══════════════════════════════════════════════════════
```

### With --apply flag:

```
📚 Found skill: .sage/agent/skills/testing/tdd-workflow.md
═══════════════════════════════════════════════════════
[Full skill content displayed here]
═══════════════════════════════════════════════════════

🔍 Validating Prerequisites...

  ✅ pytest: pytest 7.4.0
  ✅ git: git version 2.42.0

✅ All prerequisites validated

📝 Instructions:
Follow the **Algorithm** section above to apply this skill.
Check off items in the **Validation** section as you complete them.

📖 Knowledge Prerequisites:
  📚 basic-unit-testing (available: /sage.skill basic-unit-testing)
```

## Error Handling

### Skill Not Found

```
❌ Skill not found: nonexistent-skill

Available skills:
code-review-checklist
dependency-injection
safe-refactoring-checklist
systematic-debugging
tdd-workflow
```

### Missing Prerequisites

```
🔍 Validating Prerequisites...

  ✅ git: git version 2.42.0
  ⚠️  Missing: pytest (required: pytest>=7.0)

⚠️  Some prerequisites are missing
Install missing tools before applying this skill.
```

## Integration Points

**Used By:**
- `/sage.implement` - suggests skills based on ticket type
- Developers directly when learning new practices

**Uses:**
- `.sage/agent/skills/` directory structure
- Skill YAML frontmatter for metadata

## Success Criteria

- [ ] Skill located by name (case-insensitive, slugified)
- [ ] Full skill content displayed clearly
- [ ] Helpful error message if skill not found
- [ ] Lists available skills on error
- [ ] `--apply` validates all tool prerequisites
- [ ] Version checking attempted for each tool
- [ ] Clear pass/fail status for prerequisites
- [ ] Application instructions provided after validation
- [ ] Knowledge prerequisites linked to available skills

## Usage Examples

```bash
# Display a skill
/sage.skill tdd-workflow

# Display with prerequisite validation
/sage.skill systematic-debugging --apply

# Search for skills (use /sage.skill-search instead)
/sage.skill code-review

# List available (shown on error)
/sage.skill nonexistent
```
