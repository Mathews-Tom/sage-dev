#!/bin/bash
# Unit tests for /sage.skill --apply prerequisite validation

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
echo "Unit Tests: /sage.skill --apply - Prerequisite Validation"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Prerequisites.tools field exists
echo "Test 1: Prerequisites.tools field parsing"
run_test
TOOLS=$(grep -A 20 "^prerequisites:" .sage/agent/skills/testing/tdd-workflow.md | grep -A 10 "^  tools:" | grep "^\s*-" | sed 's/.*- //' | head -5)
if [ -n "$TOOLS" ]; then
    pass_test "Tools extracted: $(echo $TOOLS | tr '\n' ' ')"
else
    fail_test "Cannot extract prerequisites.tools from frontmatter"
fi

# Test 2: Tool name extraction (without version)
echo "Test 2: Tool name extraction from version constraint"
run_test
TOOL_SPEC="pytest>=7.0"
TOOL_NAME=$(echo "$TOOL_SPEC" | sed 's/>=.*//' | sed 's/<.*//' | sed 's/==.*//')
if [ "$TOOL_NAME" = "pytest" ]; then
    pass_test "Tool name extracted correctly: $TOOL_NAME"
else
    fail_test "Tool name extraction failed: expected 'pytest', got '$TOOL_NAME'"
fi

# Test 3: Version constraint extraction
echo "Test 3: Version constraint extraction"
run_test
TOOL_SPEC="git>=2.0"
REQUIRED_VERSION=$(echo "$TOOL_SPEC" | grep -oE '>=.*|==.*|<.*' | sed 's/[><=]*//')
if [ "$REQUIRED_VERSION" = "2.0" ]; then
    pass_test "Version constraint extracted: $REQUIRED_VERSION"
else
    fail_test "Version extraction failed: expected '2.0', got '$REQUIRED_VERSION'"
fi

# Test 4: Tool existence check (which command)
echo "Test 4: Tool existence verification (git)"
run_test
if which git >/dev/null 2>&1; then
    pass_test "git found via 'which' command"
else
    fail_test "git not found (should exist on development machine)"
fi

# Test 5: Tool version retrieval
echo "Test 5: Tool version retrieval (git --version)"
run_test
GIT_VERSION=$(git --version 2>/dev/null | head -1)
if echo "$GIT_VERSION" | grep -qE '[0-9]+\.[0-9]+'; then
    pass_test "Git version retrieved: $GIT_VERSION"
else
    fail_test "Cannot retrieve git version"
fi

# Test 6: Version comparison logic
echo "Test 6: Version comparison (installed >= required)"
run_test
# Simulate version comparison
INSTALLED="2.42.0"
REQUIRED="2.0"
# Using sort -V for version comparison
RESULT=$(printf "%s\n%s" "$REQUIRED" "$INSTALLED" | sort -V | head -1)
if [ "$RESULT" = "$REQUIRED" ]; then
    pass_test "Version comparison: $INSTALLED >= $REQUIRED"
else
    fail_test "Version comparison failed"
fi

# Test 7: Knowledge prerequisites parsing
echo "Test 7: Knowledge prerequisites extraction"
run_test
KNOWLEDGE=$(grep -A 50 "^prerequisites:" .sage/agent/skills/testing/tdd-workflow.md | grep -A 10 "^  knowledge:" | grep "^\s*-" | sed 's/.*- //' | head -5)
if [ -n "$KNOWLEDGE" ]; then
    pass_test "Knowledge prerequisites: $(echo $KNOWLEDGE | tr '\n' ' ')"
else
    fail_test "Cannot extract prerequisites.knowledge"
fi

# Test 8: Validation agents parsing
echo "Test 8: Validation agents (validated_by) extraction"
run_test
VALIDATORS=$(grep -A 10 "^validated_by:" .sage/agent/skills/testing/tdd-workflow.md | grep "^\s*-" | sed 's/.*- //' | head -5)
if [ -n "$VALIDATORS" ]; then
    pass_test "Validation agents: $(echo $VALIDATORS | tr '\n' ' ')"
else
    fail_test "Cannot extract validated_by field"
fi

# Test 9: Missing tool detection
echo "Test 9: Missing tool detection"
run_test
if ! which nonexistent-tool-12345 >/dev/null 2>&1; then
    pass_test "Correctly identifies missing tool"
else
    fail_test "Should not find nonexistent-tool-12345"
fi

# Test 10: Multiple tools validation
echo "Test 10: Multiple tools in prerequisites"
run_test
TOOL_COUNT=$(grep -A 20 "^prerequisites:" .sage/agent/skills/testing/tdd-workflow.md | grep -A 10 "^  tools:" | grep "^\s*-" | wc -l | tr -d ' ')
if [ "$TOOL_COUNT" -ge 2 ]; then
    pass_test "Multiple tools defined: $TOOL_COUNT tools"
else
    fail_test "Expected multiple tools, found: $TOOL_COUNT"
fi

# Test 11: Version mismatch detection
echo "Test 11: Version mismatch detection logic"
run_test
# Test that 1.0 < 7.0 (version mismatch)
INSTALLED="1.0"
REQUIRED="7.0"
RESULT=$(printf "%s\n%s" "$REQUIRED" "$INSTALLED" | sort -V | head -1)
if [ "$RESULT" = "$INSTALLED" ]; then
    pass_test "Correctly detects version mismatch: $INSTALLED < $REQUIRED"
else
    fail_test "Version mismatch detection failed"
fi

# Test 12: All skills have prerequisites defined
echo "Test 12: All seed skills have prerequisites"
run_test
MISSING_PREREQS=""
for skill_file in .sage/agent/skills/*/*.md; do
    if ! grep -q "^prerequisites:" "$skill_file"; then
        MISSING_PREREQS="$MISSING_PREREQS $(basename $skill_file)"
    fi
done
if [ -z "$MISSING_PREREQS" ]; then
    pass_test "All skills have prerequisites defined"
else
    fail_test "Skills missing prerequisites:$MISSING_PREREQS"
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
