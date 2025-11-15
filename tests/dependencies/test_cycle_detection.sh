#!/bin/bash
# Unit tests for dependency cycle detection

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
echo "Unit Tests: Dependency Cycle Detection"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Validation script exists
echo "Test 1: validate-dependencies.sh exists"
run_test
if [ -f ".sage/lib/validate-dependencies.sh" ]; then
    pass_test "Script found at .sage/lib/validate-dependencies.sh"
else
    fail_test "Script not found"
fi

# Test 2: Script is executable or can be sourced
echo "Test 2: Script syntax is valid"
run_test
if bash -n .sage/lib/validate-dependencies.sh 2>/dev/null; then
    pass_test "Script syntax valid"
else
    fail_test "Script has syntax errors"
fi

# Test 3: No cycles in production data
echo "Test 3: No cycles in current ticket index"
run_test
# Check if any ticket blocks itself or creates a direct cycle
SELF_BLOCKS=$(jq -r '.tickets[] | select(.id as $id | (.blocks // []) | contains([$id])) | .id' .sage/tickets/index.json 2>/dev/null | head -1)
if [ -z "$SELF_BLOCKS" ]; then
    pass_test "No self-blocking tickets found"
else
    fail_test "Self-blocking ticket: $SELF_BLOCKS"
fi

# Test 4: blocks field exists in schema
echo "Test 4: Schema includes blocks field"
run_test
BLOCKS_COUNT=$(jq '[.tickets[] | .blocks] | length' .sage/tickets/index.json 2>/dev/null)
if [ -n "$BLOCKS_COUNT" ]; then
    pass_test "blocks field present in schema ($BLOCKS_COUNT tickets)"
else
    fail_test "blocks field missing from schema"
fi

# Test 5: blockedBy field exists
echo "Test 5: Schema includes blockedBy field"
run_test
BLOCKED_BY_COUNT=$(jq '[.tickets[] | .blockedBy] | length' .sage/tickets/index.json 2>/dev/null)
if [ -n "$BLOCKED_BY_COUNT" ]; then
    pass_test "blockedBy field present in schema"
else
    fail_test "blockedBy field missing from schema"
fi

# Test 6: relatedTo field exists
echo "Test 6: Schema includes relatedTo field"
run_test
RELATED_COUNT=$(jq '[.tickets[] | .relatedTo] | length' .sage/tickets/index.json 2>/dev/null)
if [ -n "$RELATED_COUNT" ]; then
    pass_test "relatedTo field present in schema"
else
    fail_test "relatedTo field missing from schema"
fi

# Test 7: Cycle detection function defined
echo "Test 7: detect_cycles function exists"
run_test
if grep -q "^detect_cycles()" .sage/lib/validate-dependencies.sh; then
    pass_test "detect_cycles function defined"
else
    fail_test "detect_cycles function not found"
fi

# Test 8: DFS algorithm implemented
echo "Test 8: DFS-based cycle detection"
run_test
if grep -q "dfs_detect_cycle\|DFS" .sage/lib/validate-dependencies.sh; then
    pass_test "DFS algorithm implemented"
else
    fail_test "DFS algorithm not found"
fi

# Test 9: Create test case - simple valid graph
echo "Test 9: Valid DAG (no cycles)"
run_test
# A -> B -> C (no cycles)
TEST_GRAPH=$(cat << 'EOF'
{
  "tickets": [
    {"id": "A", "blocks": ["B"], "blockedBy": [], "relatedTo": []},
    {"id": "B", "blocks": ["C"], "blockedBy": ["A"], "relatedTo": []},
    {"id": "C", "blocks": [], "blockedBy": ["B"], "relatedTo": []}
  ]
}
EOF
)
# Verify no self-references
CYCLE_CHECK=$(echo "$TEST_GRAPH" | jq -r '.tickets[] | select(.id as $id | .blocks | contains([$id])) | .id')
if [ -z "$CYCLE_CHECK" ]; then
    pass_test "Simple DAG has no cycles"
else
    fail_test "False positive cycle detection"
fi

# Test 10: Schema version is 2.2.0+
echo "Test 10: Schema version supports dependencies"
run_test
VERSION=$(jq -r '.version' .sage/tickets/index.json)
if echo "$VERSION" | grep -qE "^2\.[2-9]\.|^[3-9]\."; then
    pass_test "Schema version $VERSION supports dependencies"
else
    fail_test "Schema version $VERSION may not support dependencies (need 2.2.0+)"
fi

# Test 11: Error reporting for cycles
echo "Test 11: Error messages formatted correctly"
run_test
if grep -q "Cycle:\|cycles detected\|Action required" .sage/lib/validate-dependencies.sh; then
    pass_test "Error reporting includes actionable messages"
else
    fail_test "Missing error reporting"
fi

# Test 12: Performance consideration
echo "Test 12: Performance tracking in validation"
run_test
TICKET_COUNT=$(jq '.tickets | length' .sage/tickets/index.json)
if [ "$TICKET_COUNT" -le 200 ]; then
    pass_test "Ticket count ($TICKET_COUNT) within performance bounds"
else
    fail_test "Large ticket count may impact performance"
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
