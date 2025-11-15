#!/bin/bash
# Unit tests for /sage.skill command - skill display functionality

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test helper functions
pass_test() {
    echo "  ✅ PASS: $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail_test() {
    echo "  ❌ FAIL: $1"
    echo "       $2"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

run_test() {
    TESTS_RUN=$((TESTS_RUN + 1))
}

echo "═══════════════════════════════════════════════════════"
echo "Unit Tests: /sage.skill - Skill Display"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Skill file exists for each seed skill
echo "Test 1: Verify seed skills exist"
run_test
SEED_SKILLS="tdd-workflow systematic-debugging safe-refactoring-checklist code-review-checklist dependency-injection"
MISSING=""
for skill in $SEED_SKILLS; do
    if ! fd -t f "${skill}.md" .sage/agent/skills/ | head -1 | grep -q .; then
        MISSING="$MISSING $skill"
    fi
done
if [ -z "$MISSING" ]; then
    pass_test "All 5 seed skills exist"
else
    fail_test "Missing seed skills: $MISSING"
fi

# Test 2: Skill can be located by name
echo "Test 2: Skill location by name (case-insensitive)"
run_test
SKILL_FILE=$(fd -t f "tdd-workflow.md" .sage/agent/skills/ | head -1)
if [ -n "$SKILL_FILE" ] && [ -f "$SKILL_FILE" ]; then
    pass_test "tdd-workflow.md found at $SKILL_FILE"
else
    fail_test "Cannot locate tdd-workflow.md"
fi

# Test 3: Skill content displays correctly
echo "Test 3: Skill content readable"
run_test
CONTENT=$(cat .sage/agent/skills/testing/tdd-workflow.md 2>/dev/null | head -20)
if echo "$CONTENT" | grep -q "^---$"; then
    pass_test "Skill file contains YAML frontmatter delimiter"
else
    fail_test "Missing YAML frontmatter in skill file"
fi

# Test 4: Skill has required sections
echo "Test 4: Required sections present"
run_test
# Check for each required section header
MISSING_SECTIONS=""
if ! grep -q "^## Purpose" .sage/agent/skills/testing/tdd-workflow.md; then
    MISSING_SECTIONS="$MISSING_SECTIONS Purpose"
fi
if ! grep -q "^## Prerequisites" .sage/agent/skills/testing/tdd-workflow.md; then
    MISSING_SECTIONS="$MISSING_SECTIONS Prerequisites"
fi
if ! grep -q "^## Algorithm" .sage/agent/skills/testing/tdd-workflow.md; then
    MISSING_SECTIONS="$MISSING_SECTIONS Algorithm"
fi
if ! grep -q "^## Validation" .sage/agent/skills/testing/tdd-workflow.md; then
    MISSING_SECTIONS="$MISSING_SECTIONS Validation"
fi
if ! grep -q "^## Common Pitfalls" .sage/agent/skills/testing/tdd-workflow.md; then
    MISSING_SECTIONS="$MISSING_SECTIONS CommonPitfalls"
fi
if ! grep -q "^## Examples" .sage/agent/skills/testing/tdd-workflow.md; then
    MISSING_SECTIONS="$MISSING_SECTIONS Examples"
fi
if [ -z "$MISSING_SECTIONS" ]; then
    pass_test "All required sections present"
else
    fail_test "Missing sections:$MISSING_SECTIONS"
fi

# Test 5: YAML frontmatter has required fields
echo "Test 5: YAML frontmatter fields"
run_test
REQUIRED_FIELDS="name category languages prerequisites evidence validated validated_by"
MISSING_FIELDS=""
for field in $REQUIRED_FIELDS; do
    if ! grep -q "^${field}:" .sage/agent/skills/testing/tdd-workflow.md; then
        MISSING_FIELDS="$MISSING_FIELDS $field"
    fi
done
if [ -z "$MISSING_FIELDS" ]; then
    pass_test "All required YAML fields present"
else
    fail_test "Missing YAML fields:$MISSING_FIELDS"
fi

# Test 6: Skill name matches expected format
echo "Test 6: Skill name format"
run_test
NAME=$(grep "^name:" .sage/agent/skills/testing/tdd-workflow.md | sed 's/name: "//' | sed 's/"$//')
if echo "$NAME" | grep -q "TDD Workflow\|Workflow"; then
    pass_test "Skill name is human-readable: $NAME"
else
    fail_test "Skill name format incorrect: $NAME"
fi

# Test 7: Evidence links present
echo "Test 7: Evidence links exist"
run_test
EVIDENCE_COUNT=$(grep -A 10 "^evidence:" .sage/agent/skills/testing/tdd-workflow.md | grep "^\s*-" | wc -l | tr -d ' ')
if [ "$EVIDENCE_COUNT" -ge 2 ]; then
    pass_test "At least 2 evidence links present ($EVIDENCE_COUNT found)"
else
    fail_test "Insufficient evidence links (found: $EVIDENCE_COUNT, required: 2+)"
fi

# Test 8: Multi-language examples
echo "Test 8: Multi-language examples"
run_test
HAS_PYTHON=$(grep -c "### Python Example" .sage/agent/skills/testing/tdd-workflow.md)
HAS_TYPESCRIPT=$(grep -c "### TypeScript Example" .sage/agent/skills/testing/tdd-workflow.md)
if [ "$HAS_PYTHON" -ge 1 ] && [ "$HAS_TYPESCRIPT" -ge 1 ]; then
    pass_test "Both Python and TypeScript examples present"
else
    fail_test "Missing language examples (Python: $HAS_PYTHON, TypeScript: $HAS_TYPESCRIPT)"
fi

# Test 9: Algorithm has numbered steps
echo "Test 9: Algorithm has numbered steps"
run_test
STEP_COUNT=$(grep -c "^### Step [0-9]" .sage/agent/skills/testing/tdd-workflow.md)
if [ "$STEP_COUNT" -ge 3 ]; then
    pass_test "Algorithm has $STEP_COUNT steps (minimum 3)"
else
    fail_test "Insufficient algorithm steps (found: $STEP_COUNT, required: 3+)"
fi

# Test 10: Skills are in correct category directories
echo "Test 10: Skills in correct category directories"
run_test
MISPLACED=""
if [ ! -f ".sage/agent/skills/testing/tdd-workflow.md" ]; then
    MISPLACED="$MISPLACED tdd-workflow"
fi
if [ ! -f ".sage/agent/skills/debugging/systematic-debugging.md" ]; then
    MISPLACED="$MISPLACED systematic-debugging"
fi
if [ ! -f ".sage/agent/skills/refactoring/safe-refactoring-checklist.md" ]; then
    MISPLACED="$MISPLACED safe-refactoring-checklist"
fi
if [ ! -f ".sage/agent/skills/collaboration/code-review-checklist.md" ]; then
    MISPLACED="$MISPLACED code-review-checklist"
fi
if [ ! -f ".sage/agent/skills/architecture/dependency-injection.md" ]; then
    MISPLACED="$MISPLACED dependency-injection"
fi
if [ -z "$MISPLACED" ]; then
    pass_test "All skills in correct category directories"
else
    fail_test "Misplaced skills:$MISPLACED"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════"
echo "Test Summary"
echo "═══════════════════════════════════════════════════════"
echo "Total tests: $TESTS_RUN"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
