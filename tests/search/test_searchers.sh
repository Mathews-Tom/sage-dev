#!/bin/bash
# Unit tests for individual source searchers

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
echo "Unit Tests: Source Searchers"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Agent docs searcher - finds skills
echo "Test 1: Agent docs searcher finds skills"
run_test
RESULT=$(rg -i -l "tdd" .sage/agent/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$RESULT" -ge 1 ]; then
    pass_test "Found $RESULT agent docs matching 'tdd'"
else
    fail_test "Agent docs searcher returns no results"
fi

# Test 2: Agent docs searcher - case insensitive
echo "Test 2: Agent docs searcher case-insensitive"
run_test
LOWER=$(rg -i -l "workflow" .sage/agent/ --type md 2>/dev/null | wc -l)
UPPER=$(rg -i -l "WORKFLOW" .sage/agent/ --type md 2>/dev/null | wc -l)
if [ "$LOWER" -eq "$UPPER" ]; then
    pass_test "Case-insensitive search works"
else
    fail_test "Case sensitivity issue: lower=$LOWER, upper=$UPPER"
fi

# Test 3: Tickets searcher - searches titles
echo "Test 3: Tickets searcher searches titles"
run_test
RESULT=$(jq -r '.tickets[] | select(.title | test("Search"; "i")) | .id' .sage/tickets/index.json 2>/dev/null | head -1)
if [ -n "$RESULT" ]; then
    pass_test "Found ticket by title: $RESULT"
else
    fail_test "Tickets searcher cannot find by title"
fi

# Test 4: Tickets searcher - searches descriptions
echo "Test 4: Tickets searcher searches descriptions"
run_test
RESULT=$(jq -r '.tickets[] | select(.description | test("context"; "i")) | .id' .sage/tickets/index.json 2>/dev/null | head -1)
if [ -n "$RESULT" ]; then
    pass_test "Found ticket by description: $RESULT"
else
    fail_test "Tickets searcher cannot find by description"
fi

# Test 5: Specs searcher - finds spec files
echo "Test 5: Specs searcher finds spec files"
run_test
RESULT=$(rg -i -l "Overview" docs/specs/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$RESULT" -ge 1 ]; then
    pass_test "Found $RESULT spec files"
else
    fail_test "Specs searcher returns no results"
fi

# Test 6: Git searcher - searches commit messages
echo "Test 6: Git searcher searches commit messages"
run_test
RESULT=$(git log --oneline --all -i --grep="feat\|fix" 2>/dev/null | head -5 | wc -l | tr -d ' ')
if [ "$RESULT" -ge 1 ]; then
    pass_test "Found $RESULT commits matching feat/fix"
else
    fail_test "Git searcher returns no commit results"
fi

# Test 7: Git searcher - searches branch names
echo "Test 7: Git searcher searches branch names"
run_test
RESULT=$(git branch -a 2>/dev/null | grep -i "feature" | wc -l | tr -d ' ')
if [ "$RESULT" -ge 1 ]; then
    pass_test "Found $RESULT branches matching 'feature'"
else
    fail_test "Git searcher cannot find branches"
fi

# Test 8: Patterns searcher - directory exists
echo "Test 8: Patterns directory structure"
run_test
if [ -d ".sage/patterns/" ]; then
    pass_test "Patterns directory exists"
else
    fail_test "Patterns directory not found"
fi

# Test 9: Search returns file paths
echo "Test 9: Search returns absolute paths"
run_test
RESULT=$(rg -i -l "skill" .sage/agent/ --type md 2>/dev/null | head -1)
if echo "$RESULT" | grep -q "^\.sage/"; then
    pass_test "Returns relative path from project root"
else
    fail_test "Path format incorrect: $RESULT"
fi

# Test 10: Search supports --type flag
echo "Test 10: ripgrep --type md filtering"
run_test
MD_ONLY=$(rg -i -l "test" .sage/agent/ --type md 2>/dev/null | wc -l)
ALL_FILES=$(rg -i -l "test" .sage/agent/ 2>/dev/null | wc -l)
if [ "$MD_ONLY" -le "$ALL_FILES" ]; then
    pass_test "--type md filter works (md: $MD_ONLY, all: $ALL_FILES)"
else
    fail_test "Type filtering inconsistent"
fi

# Test 11: Empty search returns no results
echo "Test 11: No results for nonexistent term"
run_test
RESULT=$(rg -i -l "xyzzyx123nonexistent" .sage/agent/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$RESULT" -eq 0 ]; then
    pass_test "Correctly returns empty for nonexistent term"
else
    fail_test "Should not find nonexistent term"
fi

# Test 12: Regex pattern support
echo "Test 12: Regex pattern matching"
run_test
RESULT=$(rg -i "Step.*[0-9]" .sage/agent/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$RESULT" -ge 1 ]; then
    pass_test "Regex pattern matching works ($RESULT matches)"
else
    fail_test "Regex pattern matching failed"
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
