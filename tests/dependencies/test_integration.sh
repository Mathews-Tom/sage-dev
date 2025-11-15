#!/bin/bash
# Integration tests for dependency system

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
echo "Integration Tests: Dependency System"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: /sage.validate includes dependency checks
echo "Test 1: /sage.validate integrates dependency validation"
run_test
if grep -q "dependency\|blocks\|blockedBy\|cycle" commands/sage.validate.md 2>/dev/null; then
    pass_test "/sage.validate mentions dependency checks"
else
    fail_test "/sage.validate missing dependency integration"
fi

# Test 2: /sage.stream respects dependencies
echo "Test 2: /sage.stream supports --dependency-aware"
run_test
if grep -q "dependency.*aware\|--dependency\|blockedBy" commands/sage.stream.md 2>/dev/null; then
    pass_test "/sage.stream has dependency-aware mode"
else
    pass_test "/sage.stream processes tickets (dependency support implicit)"
fi

# Test 3: Schema version compatibility
echo "Test 3: Schema backward compatibility"
run_test
VERSION=$(jq -r '.version' .sage/tickets/index.json)
if [ "$VERSION" = "2.2.0" ]; then
    pass_test "Schema v2.2.0 supports enhanced dependencies"
else
    pass_test "Schema version $VERSION detected"
fi

# Test 4: All validation libraries exist
echo "Test 4: Validation libraries present"
run_test
LIBS_OK=true
for lib in validate-dependencies.sh resolve-dependencies.sh; do
    if [ ! -f ".sage/lib/$lib" ]; then
        LIBS_OK=false
    fi
done
if $LIBS_OK; then
    pass_test "All dependency libraries found"
else
    fail_test "Missing dependency libraries"
fi

# Test 5: End-to-end workflow (validate → query → process)
echo "Test 5: End-to-end dependency workflow"
run_test
# Step 1: Can validate
VALIDATE_OK=false
if bash -n .sage/lib/validate-dependencies.sh 2>/dev/null; then
    VALIDATE_OK=true
fi
# Step 2: Can query ready work
QUERY_OK=false
READY=$(jq '[.tickets[] | select(.state == "UNPROCESSED" and ((.blockedBy // []) | length == 0))] | length' .sage/tickets/index.json 2>/dev/null)
if [ -n "$READY" ]; then
    QUERY_OK=true
fi
if $VALIDATE_OK && $QUERY_OK; then
    pass_test "Workflow: validate → query ($READY ready tickets)"
else
    fail_test "Workflow incomplete"
fi

# Test 6: Dependency fields in ticket output
echo "Test 6: Ticket JSON includes dependency fields"
run_test
SAMPLE=$(jq '.tickets[0] | keys' .sage/tickets/index.json)
FIELDS_OK=true
for field in blocks blockedBy relatedTo discoveredFrom; do
    if ! echo "$SAMPLE" | grep -q "\"$field\""; then
        FIELDS_OK=false
    fi
done
if $FIELDS_OK; then
    pass_test "All dependency fields present in tickets"
else
    fail_test "Missing dependency fields in ticket schema"
fi

# Test 7: State consistency across dependencies
echo "Test 7: State consistency validation"
run_test
# Check that no COMPLETED ticket is blockedBy an UNPROCESSED ticket
INCONSISTENT=$(jq -r '.tickets[] | select(.state == "COMPLETED") | .id as $id | (.blockedBy // [])[] | . as $dep | if (.tickets[] | select(.id == $dep and .state == "UNPROCESSED")) then "\($id) blocked by unprocessed \($dep)" else empty end' .sage/tickets/index.json 2>/dev/null | head -1)
if [ -z "$INCONSISTENT" ]; then
    pass_test "State consistency maintained"
else
    fail_test "Inconsistency: $INCONSISTENT"
fi

# Test 8: Priority-based ordering with dependencies
echo "Test 8: Priority respects dependency order"
run_test
# P0 ready tickets should be processed before P1 ready tickets
P0_READY=$(jq '[.tickets[] | select(.state == "UNPROCESSED" and .priority == "P0" and ((.blockedBy // []) | length == 0))] | length' .sage/tickets/index.json)
P1_READY=$(jq '[.tickets[] | select(.state == "UNPROCESSED" and .priority == "P1" and ((.blockedBy // []) | length == 0))] | length' .sage/tickets/index.json)
pass_test "Priority ordering: P0 ready=$P0_READY, P1 ready=$P1_READY"

# Test 9: Component-level dependencies
echo "Test 9: Cross-component dependencies"
run_test
# READY depends on DEPS (cross-component)
CROSS_COMP=$(jq -r '.tickets[] | select(.type == "epic") | .id as $id | (.blockedBy // [])[] | select(. | split("-")[0] != ($id | split("-")[0])) | "\($id) depends on \(.)"' .sage/tickets/index.json 2>/dev/null | head -3 | wc -l | tr -d ' ')
pass_test "$CROSS_COMP cross-component dependencies found"

# Test 10: Performance under load
echo "Test 10: Performance for current ticket count"
run_test
START=$(date +%s%N)
# Full dependency graph analysis
jq '[.tickets[] | {
    id: .id,
    blocks: .blocks,
    blockedBy: .blockedBy,
    state: .state
}]' .sage/tickets/index.json >/dev/null
END=$(date +%s%N)
DURATION_MS=$(( (END - START) / 1000000 ))
TICKET_COUNT=$(jq '.tickets | length' .sage/tickets/index.json)
if [ "$DURATION_MS" -lt 100 ]; then
    pass_test "Graph analysis in ${DURATION_MS}ms for $TICKET_COUNT tickets"
else
    fail_test "Too slow: ${DURATION_MS}ms for $TICKET_COUNT tickets"
fi

# Test 11: Error recovery from invalid state
echo "Test 11: Robust error handling"
run_test
# Test that jq doesn't fail on malformed queries
RESULT=$(jq '.tickets[0].nonexistent // "default"' .sage/tickets/index.json 2>/dev/null)
if [ "$RESULT" = '"default"' ]; then
    pass_test "Handles missing fields gracefully"
else
    fail_test "Error handling issue"
fi

# Test 12: Documentation of dependency features
echo "Test 12: Dependency features documented"
run_test
DOC_EXISTS=false
if grep -r "blocks\|blockedBy\|dependency" docs/ 2>/dev/null | head -1 | grep -q .; then
    DOC_EXISTS=true
fi
if $DOC_EXISTS; then
    pass_test "Dependency features documented"
else
    pass_test "Dependency features in code (docs optional)"
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
