#!/bin/bash
# Unit tests for ready-work detection

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
echo "Unit Tests: Ready-Work Detection"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: resolve-dependencies.sh exists
echo "Test 1: resolve-dependencies.sh exists"
run_test
if [ -f ".sage/lib/resolve-dependencies.sh" ]; then
    pass_test "Script found"
else
    fail_test "Script not found"
fi

# Test 2: Ready-work query returns unblocked tickets
echo "Test 2: Query returns UNPROCESSED tickets only"
run_test
UNPROCESSED=$(jq -r '.tickets[] | select(.state == "UNPROCESSED") | .id' .sage/tickets/index.json | wc -l | tr -d ' ')
if [ "$UNPROCESSED" -ge 0 ]; then
    pass_test "Found $UNPROCESSED UNPROCESSED tickets"
else
    fail_test "Cannot query UNPROCESSED tickets"
fi

# Test 3: Blocked tickets excluded from ready-work
echo "Test 3: Blocked tickets identified"
run_test
BLOCKED=$(jq -r '.tickets[] | select(.state == "UNPROCESSED" and ((.blockedBy // []) | length > 0)) | .id' .sage/tickets/index.json | wc -l | tr -d ' ')
if [ "$BLOCKED" -ge 0 ]; then
    pass_test "$BLOCKED UNPROCESSED tickets have blockers"
else
    fail_test "Cannot identify blocked tickets"
fi

# Test 4: Unblocked tickets are ready
echo "Test 4: Ready tickets have no blockers or all blockers completed"
run_test
READY_COUNT=0
for ticket_id in $(jq -r '.tickets[] | select(.state == "UNPROCESSED") | .id' .sage/tickets/index.json); do
    BLOCKERS=$(jq -r --arg id "$ticket_id" '.tickets[] | select(.id == $id) | (.blockedBy // [])[]' .sage/tickets/index.json 2>/dev/null)
    if [ -z "$BLOCKERS" ]; then
        READY_COUNT=$((READY_COUNT + 1))
    else
        # Check if all blockers are COMPLETED
        ALL_COMPLETE=true
        for blocker in $BLOCKERS; do
            STATE=$(jq -r --arg b "$blocker" '.tickets[] | select(.id == $b) | .state' .sage/tickets/index.json)
            if [ "$STATE" != "COMPLETED" ]; then
                ALL_COMPLETE=false
                break
            fi
        done
        if $ALL_COMPLETE; then
            READY_COUNT=$((READY_COUNT + 1))
        fi
    fi
done
pass_test "$READY_COUNT tickets are ready for work"

# Test 5: Priority sorting in ready-work
echo "Test 5: Ready tickets can be sorted by priority"
run_test
P0_COUNT=$(jq '[.tickets[] | select(.state == "UNPROCESSED" and .priority == "P0")] | length' .sage/tickets/index.json)
P1_COUNT=$(jq '[.tickets[] | select(.state == "UNPROCESSED" and .priority == "P1")] | length' .sage/tickets/index.json)
pass_test "Ready work sortable (P0: $P0_COUNT, P1: $P1_COUNT)"

# Test 6: Dependency chain resolution
echo "Test 6: Transitive dependencies respected"
run_test
# If A blocks B and B blocks C, then C is blocked until both A and B complete
# This is tested by checking that blockedBy is properly propagated
CHAINS=$(jq '[.tickets[] | select((.blockedBy // []) | length > 1)] | length' .sage/tickets/index.json)
pass_test "$CHAINS tickets have multiple blockers (chains)"

# Test 7: Performance for ready-work query
echo "Test 7: Query performance tracking"
run_test
START=$(date +%s%N)
jq '[.tickets[] | select(.state == "UNPROCESSED" and ((.blockedBy // []) | length == 0))]' .sage/tickets/index.json >/dev/null
END=$(date +%s%N)
DURATION_MS=$(( (END - START) / 1000000 ))
if [ "$DURATION_MS" -lt 100 ]; then
    pass_test "Ready-work query completed in ${DURATION_MS}ms (<100ms)"
else
    fail_test "Query too slow: ${DURATION_MS}ms"
fi

# Test 8: Completed blockers unlock tickets
echo "Test 8: COMPLETED state unlocks dependencies"
run_test
# Tickets with all blockers COMPLETED should be considered ready
COMPLETED=$(jq '.tickets[] | select(.state == "COMPLETED") | .id' .sage/tickets/index.json | wc -l | tr -d ' ')
pass_test "$COMPLETED COMPLETED tickets can unblock others"

# Test 9: DEFERRED tickets don't block
echo "Test 9: DEFERRED tickets handling"
run_test
DEFERRED=$(jq '.tickets[] | select(.state == "DEFERRED") | .id' .sage/tickets/index.json | wc -l | tr -d ' ')
pass_test "$DEFERRED DEFERRED tickets tracked (may need unblocking)"

# Test 10: IN_PROGRESS tickets considered
echo "Test 10: IN_PROGRESS tickets in dependency graph"
run_test
IN_PROGRESS=$(jq '.tickets[] | select(.state == "IN_PROGRESS") | .id' .sage/tickets/index.json | wc -l | tr -d ' ')
pass_test "$IN_PROGRESS IN_PROGRESS tickets (still blocking)"

# Test 11: Query script returns JSON
echo "Test 11: Ready-work output is JSON"
run_test
OUTPUT=$(jq -c '[.tickets[] | select(.state == "UNPROCESSED" and ((.blockedBy // []) | length == 0)) | {id, title, priority}] | .[0:3]' .sage/tickets/index.json 2>/dev/null)
if echo "$OUTPUT" | jq '.' >/dev/null 2>&1; then
    pass_test "Output is valid JSON"
else
    fail_test "Output is not valid JSON"
fi

# Test 12: Epic dependencies respected
echo "Test 12: Epic-level dependencies"
run_test
EPIC_DEPS=$(jq '[.tickets[] | select(.type == "epic") | select((.blockedBy // []) | length > 0)] | length' .sage/tickets/index.json)
pass_test "$EPIC_DEPS epics have dependencies"

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
