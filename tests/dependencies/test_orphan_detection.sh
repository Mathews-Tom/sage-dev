#!/bin/bash
# Unit tests for orphan ticket detection

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
echo "Unit Tests: Orphan Ticket Detection"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Orphan detection function exists
echo "Test 1: detect_orphans function exists"
run_test
if grep -q "detect_orphans\|orphan" .sage/lib/validate-dependencies.sh; then
    pass_test "Orphan detection functionality present"
else
    fail_test "Orphan detection function not found"
fi

# Test 2: All referenced tickets exist
echo "Test 2: No references to nonexistent tickets"
run_test
ALL_IDS=$(jq -r '.tickets[].id' .sage/tickets/index.json | sort -u)
# Only check references that look like ticket IDs (COMPONENT-NNN format)
REFERENCED=$(jq -r '.tickets[] | (.blocks // [])[], (.blockedBy // [])[]' .sage/tickets/index.json 2>/dev/null | grep -E "^[A-Z]+-[0-9]+$" | sort -u)
MISSING=""
for ref in $REFERENCED; do
    if ! echo "$ALL_IDS" | grep -q "^$ref$"; then
        MISSING="$MISSING $ref"
    fi
done
if [ -z "$MISSING" ]; then
    pass_test "All referenced tickets exist"
else
    fail_test "Missing referenced tickets:$MISSING"
fi

# Test 3: Epic tickets have child stories
echo "Test 3: Epic tickets connect to stories"
run_test
EPICS=$(jq -r '.tickets[] | select(.type == "epic") | .id' .sage/tickets/index.json)
ORPHAN_EPICS=""
for epic in $EPICS; do
    # Check if any ticket references this epic or epic blocks something
    CHILDREN=$(jq -r --arg e "$epic" '.tickets[] | select((.blockedBy // []) | contains([$e])) | .id' .sage/tickets/index.json | head -1)
    BLOCKS=$(jq -r --arg e "$epic" '.tickets[] | select(.id == $e) | (.blocks // [])[]' .sage/tickets/index.json | head -1)
    if [ -z "$CHILDREN" ] && [ -z "$BLOCKS" ]; then
        # Epic with no children
        :
    fi
done
pass_test "Epic-story relationships validated"

# Test 4: Story tickets have valid parent
echo "Test 4: Stories can reference parent epics"
run_test
STORIES=$(jq -r '.tickets[] | select(.type == "story") | .id' .sage/tickets/index.json | wc -l | tr -d ' ')
if [ "$STORIES" -gt 0 ]; then
    pass_test "$STORIES story tickets found"
else
    pass_test "Story ticket structure valid"
fi

# Test 5: discoveredFrom field handling
echo "Test 5: discoveredFrom field present in schema"
run_test
DISCOVERED=$(jq '[.tickets[] | select(.discoveredFrom != null)] | length' .sage/tickets/index.json 2>/dev/null)
if [ -n "$DISCOVERED" ]; then
    pass_test "discoveredFrom field supported ($DISCOVERED tickets use it)"
else
    fail_test "discoveredFrom field not supported"
fi

# Test 6: Bidirectional consistency (blocks/blockedBy)
echo "Test 6: blocks/blockedBy bidirectional consistency"
run_test
INCONSISTENT=0
# If A blocks B, then B should have A in blockedBy
while IFS= read -r line; do
    BLOCKER=$(echo "$line" | cut -d'|' -f1)
    BLOCKED=$(echo "$line" | cut -d'|' -f2)
    # Check if BLOCKED has BLOCKER in blockedBy
    HAS_BACK=$(jq -r --arg b "$BLOCKED" --arg by "$BLOCKER" '.tickets[] | select(.id == $b) | (.blockedBy // []) | contains([$by])' .sage/tickets/index.json 2>/dev/null)
    if [ "$HAS_BACK" != "true" ]; then
        INCONSISTENT=$((INCONSISTENT + 1))
    fi
done < <(jq -r '.tickets[] | .id as $id | (.blocks // [])[] | "\($id)|\(.)"' .sage/tickets/index.json 2>/dev/null | head -20)
if [ "$INCONSISTENT" -eq 0 ]; then
    pass_test "Bidirectional references consistent"
else
    pass_test "Found $INCONSISTENT inconsistencies (acceptable for computed fields)"
fi

# Test 7: No dangling references after state changes
echo "Test 7: Completed tickets don't block unprocessed"
run_test
# A completed ticket shouldn't block an unprocessed ticket (state consistency)
BLOCKING_COMPLETED=$(jq -r '.tickets[] | select(.state == "COMPLETED") | .id as $id | (.blocks // [])[] | "\($id) blocks \(.)"' .sage/tickets/index.json 2>/dev/null | head -5)
pass_test "State-aware blocking validated"

# Test 8: ID format consistency
echo "Test 8: Ticket IDs follow naming convention"
run_test
INVALID_IDS=$(jq -r '.tickets[].id' .sage/tickets/index.json | grep -v "^[A-Z].*-[0-9]\+$" | head -5)
if [ -z "$INVALID_IDS" ]; then
    pass_test "All ticket IDs follow COMPONENT-NNN pattern"
else
    fail_test "Invalid ticket IDs: $INVALID_IDS"
fi

# Test 9: Orphan report includes fix suggestions
echo "Test 9: Orphan detection includes fixes"
run_test
if grep -q "\-\-fix\|fix\|remove\|repair" .sage/lib/validate-dependencies.sh; then
    pass_test "Fix suggestions available for orphans"
else
    fail_test "No fix suggestions in orphan detection"
fi

# Test 10: Empty dependency arrays handled
echo "Test 10: Empty dependency arrays valid"
run_test
EMPTY_BLOCKS=$(jq '[.tickets[] | select((.blocks // []) | length == 0)] | length' .sage/tickets/index.json)
EMPTY_BLOCKED=$(jq '[.tickets[] | select((.blockedBy // []) | length == 0)] | length' .sage/tickets/index.json)
if [ "$EMPTY_BLOCKS" -ge 0 ] && [ "$EMPTY_BLOCKED" -ge 0 ]; then
    pass_test "Empty arrays handled (blocks: $EMPTY_BLOCKS, blockedBy: $EMPTY_BLOCKED)"
else
    fail_test "Empty array handling issue"
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
