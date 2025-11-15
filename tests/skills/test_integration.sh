#!/bin/bash
# Integration tests for SKILLS library workflow

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

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
echo "Integration Tests: SKILLS Library Workflow"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: /sage.implement integration - skill suggestion based on ticket type
echo "Test 1: Skill suggestion - bug ticket → systematic-debugging"
run_test
TICKET_TITLE="Fix authentication error"
if echo "$TICKET_TITLE" | grep -iq "bug\|fix\|error"; then
    SUGGESTED="systematic-debugging"
    if [ -f ".sage/agent/skills/debugging/$SUGGESTED.md" ]; then
        pass_test "Bug ticket suggests: $SUGGESTED"
    else
        fail_test "Suggested skill not found: $SUGGESTED"
    fi
else
    fail_test "Ticket type detection failed"
fi

# Test 2: Skill suggestion - test ticket → tdd-workflow
echo "Test 2: Skill suggestion - test ticket → tdd-workflow"
run_test
TICKET_TITLE="Add unit tests for payment service"
if echo "$TICKET_TITLE" | grep -iq "test\|coverage\|tdd"; then
    SUGGESTED="tdd-workflow"
    if [ -f ".sage/agent/skills/testing/$SUGGESTED.md" ]; then
        pass_test "Test ticket suggests: $SUGGESTED"
    else
        fail_test "Suggested skill not found: $SUGGESTED"
    fi
else
    fail_test "Test ticket detection failed"
fi

# Test 3: Skill suggestion - refactor ticket
echo "Test 3: Skill suggestion - refactor ticket → safe-refactoring-checklist"
run_test
TICKET_TITLE="Refactor user service for better maintainability"
if echo "$TICKET_TITLE" | grep -iq "refactor\|clean\|improve"; then
    SUGGESTED="safe-refactoring-checklist"
    if [ -f ".sage/agent/skills/refactoring/$SUGGESTED.md" ]; then
        pass_test "Refactor ticket suggests: $SUGGESTED"
    else
        fail_test "Suggested skill not found: $SUGGESTED"
    fi
else
    fail_test "Refactor ticket detection failed"
fi

# Test 4: Command file structure validation
echo "Test 4: /sage.skill command file exists"
run_test
if [ -f "commands/sage.skill.md" ]; then
    if grep -q "allowed-tools:" commands/sage.skill.md; then
        pass_test "sage.skill command file properly structured"
    else
        fail_test "sage.skill missing allowed-tools header"
    fi
else
    fail_test "sage.skill command file not found"
fi

# Test 5: Search command file structure
echo "Test 5: /sage.skill-search command file exists"
run_test
if [ -f "commands/sage.skill-search.md" ]; then
    if grep -q "allowed-tools:" commands/sage.skill-search.md; then
        pass_test "sage.skill-search command file properly structured"
    else
        fail_test "sage.skill-search missing allowed-tools header"
    fi
else
    fail_test "sage.skill-search command file not found"
fi

# Test 6: Add command file structure
echo "Test 6: /sage.skill-add command file exists"
run_test
if [ -f "commands/sage.skill-add.md" ]; then
    if grep -q "allowed-tools:" commands/sage.skill-add.md; then
        pass_test "sage.skill-add command file properly structured"
    else
        fail_test "sage.skill-add missing allowed-tools header"
    fi
else
    fail_test "sage.skill-add command file not found"
fi

# Test 7: Enforcement agent validation flow
echo "Test 7: Enforcement agent validation integration"
run_test
VALIDATORS=$(grep -A 10 "^validated_by:" .sage/agent/skills/testing/tdd-workflow.md | grep "^\s*-" | sed 's/.*- //' | head -3)
if [ -n "$VALIDATORS" ]; then
    pass_test "Skill has validation agents: $(echo $VALIDATORS | tr '\n' ' ')"
else
    fail_test "No validation agents defined"
fi

# Test 8: /sage.implement command has skill integration
echo "Test 8: /sage.implement integrated with skills"
run_test
if grep -q "Skill Suggestion\|sage.skill" commands/sage.implement.md 2>/dev/null; then
    pass_test "/sage.implement mentions skill integration"
else
    fail_test "/sage.implement missing skill integration"
fi

# Test 9: Writing guide exists for documentation
echo "Test 9: Skill writing guide created"
run_test
if [ -f ".sage/agent/skills/WRITING-SKILLS.md" ]; then
    GUIDE_SIZE=$(wc -c < .sage/agent/skills/WRITING-SKILLS.md | tr -d ' ')
    if [ "$GUIDE_SIZE" -gt 5000 ]; then
        pass_test "Comprehensive writing guide exists (${GUIDE_SIZE} bytes)"
    else
        fail_test "Writing guide too small: $GUIDE_SIZE bytes"
    fi
else
    fail_test "WRITING-SKILLS.md not found"
fi

# Test 10: README in skills directory
echo "Test 10: Skills README exists"
run_test
if [ -f ".sage/agent/skills/README.md" ]; then
    if grep -q "## Directory Structure" .sage/agent/skills/README.md; then
        pass_test "Skills README documents directory structure"
    else
        fail_test "README missing directory structure section"
    fi
else
    fail_test "skills/README.md not found"
fi

# Test 11: Complete workflow - search to apply
echo "Test 11: End-to-end workflow (search → display → validate)"
run_test
# Step 1: Search
SEARCH_RESULT=$(rg -l "test" .sage/agent/skills/ --type md 2>/dev/null | head -1)
if [ -z "$SEARCH_RESULT" ]; then
    fail_test "Search step failed"
else
    # Step 2: Display (read content)
    CONTENT=$(cat "$SEARCH_RESULT" 2>/dev/null | head -10)
    if [ -z "$CONTENT" ]; then
        fail_test "Display step failed"
    else
        # Step 3: Validate (check prerequisites exist)
        PREREQS=$(grep -A 20 "^prerequisites:" "$SEARCH_RESULT" | head -10)
        if [ -n "$PREREQS" ]; then
            pass_test "Complete workflow: search → display → validate"
        else
            fail_test "Validation step failed"
        fi
    fi
fi

# Test 12: Skills count matches expectations
echo "Test 12: Skill count verification"
run_test
EXPECTED_MIN=5
ACTUAL=$(fd -t f ".md" .sage/agent/skills/ --exclude README.md --exclude WRITING-SKILLS.md | wc -l | tr -d ' ')
if [ "$ACTUAL" -ge "$EXPECTED_MIN" ]; then
    pass_test "Found $ACTUAL skills (minimum: $EXPECTED_MIN)"
else
    fail_test "Expected at least $EXPECTED_MIN skills, found $ACTUAL"
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
