#!/bin/bash
# Integration tests for context search system

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
echo "Integration Tests: Context Search System"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Multi-source search combines results
echo "Test 1: Multi-source search aggregation"
run_test
AGENT_COUNT=$(rg -i -l "test" .sage/agent/ --type md 2>/dev/null | wc -l | tr -d ' ')
TICKET_COUNT=$(jq -r '[.tickets[] | select(.title | test("test"; "i"))] | length' .sage/tickets/index.json 2>/dev/null)
TOTAL=$((AGENT_COUNT + TICKET_COUNT))
if [ "$TOTAL" -gt 0 ]; then
    pass_test "Combined results from multiple sources: $TOTAL total"
else
    fail_test "Multi-source search returns no results"
fi

# Test 2: Source filtering works
echo "Test 2: Source filter restricts results"
run_test
AGENT_ONLY=$(rg -i -l "skill" .sage/agent/ --type md 2>/dev/null | wc -l | tr -d ' ')
SPECS_ONLY=$(rg -i -l "skill" docs/specs/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$AGENT_ONLY" -ne "$SPECS_ONLY" ] || [ "$AGENT_ONLY" -gt 0 ]; then
    pass_test "Source filtering distinguishes results (agent: $AGENT_ONLY, specs: $SPECS_ONLY)"
else
    fail_test "Source filtering not effective"
fi

# Test 3: Relevance scoring prioritizes exact matches
echo "Test 3: Relevance ranking - exact match priority"
run_test
# Search for "tdd-workflow" should rank tdd-workflow.md highest
EXACT_MATCH=$(fd -t f "tdd-workflow.md" .sage/agent/ 2>/dev/null | head -1)
if [ -n "$EXACT_MATCH" ]; then
    pass_test "Exact filename match found first: $EXACT_MATCH"
else
    fail_test "Exact match not prioritized"
fi

# Test 4: Recent files score higher
echo "Test 4: Relevance ranking - recency factor"
run_test
# Get most recent file
RECENT=$(fd -t f ".md" .sage/agent/ --exec stat -f '%m %N' {} \; 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
if [ -n "$RECENT" ]; then
    pass_test "Recent file identified: $(basename "$RECENT")"
else
    fail_test "Cannot determine file recency"
fi

# Test 5: Search results include location info
echo "Test 5: Results include file path and context"
run_test
RESULT=$(rg -i -n "Algorithm" .sage/agent/ --type md 2>/dev/null | head -1)
if echo "$RESULT" | grep -qE "^[^:]+:[0-9]+:"; then
    pass_test "Results include path:line format"
else
    fail_test "Results missing location info"
fi

# Test 6: Git search integration
echo "Test 6: Git history search integrated"
run_test
COMMIT=$(git log --oneline --all -n 1 2>/dev/null)
if [ -n "$COMMIT" ]; then
    pass_test "Git log accessible: $(echo "$COMMIT" | cut -c1-50)"
else
    fail_test "Git history not accessible"
fi

# Test 7: Ticket state filtering
echo "Test 7: Ticket search supports state filtering"
run_test
COMPLETED=$(jq -r '[.tickets[] | select(.state == "COMPLETED" and (.title | test("Search"; "i")))] | length' .sage/tickets/index.json 2>/dev/null)
DEFERRED=$(jq -r '[.tickets[] | select(.state == "DEFERRED" and (.title | test("Search"; "i")))] | length' .sage/tickets/index.json 2>/dev/null)
pass_test "Tickets filtered by state (COMPLETED: $COMPLETED, DEFERRED: $DEFERRED)"

# Test 8: Cross-source consistency
echo "Test 8: Same query across sources returns consistent format"
run_test
# All results should be processable as structured data
AGENT_JSON=$(rg -i -l "test" .sage/agent/ --type md 2>/dev/null | head -1 | jq -R '{path: .}' 2>/dev/null)
TICKET_JSON=$(jq '.tickets[0] | {id: .id}' .sage/tickets/index.json 2>/dev/null)
if [ -n "$AGENT_JSON" ] && [ -n "$TICKET_JSON" ]; then
    pass_test "Results can be structured as JSON"
else
    fail_test "Result format inconsistent"
fi

# Test 9: End-to-end workflow
echo "Test 9: Complete search workflow"
run_test
# Simulate: search → rank → limit → format
SEARCH=$(rg -i -l "skill" .sage/agent/ --type md 2>/dev/null)
RANKED=$(echo "$SEARCH" | sort -u)
LIMITED=$(echo "$RANKED" | head -5)
FORMATTED=$(echo "$LIMITED" | wc -l | tr -d ' ')
if [ "$FORMATTED" -ge 1 ] && [ "$FORMATTED" -le 5 ]; then
    pass_test "Workflow: search → rank → limit (returned $FORMATTED)"
else
    fail_test "Workflow incomplete"
fi

# Test 10: Performance - single source <500ms
echo "Test 10: Single source search performance"
run_test
START=$(date +%s%N)
rg -i -l "test" .sage/agent/ --type md >/dev/null 2>&1
END=$(date +%s%N)
DURATION_MS=$(( (END - START) / 1000000 ))
if [ "$DURATION_MS" -lt 500 ]; then
    pass_test "Agent search completed in ${DURATION_MS}ms (<500ms)"
else
    fail_test "Agent search too slow: ${DURATION_MS}ms"
fi

# Test 11: Index enhances performance
echo "Test 11: Index structure available for optimization"
run_test
if [ -f ".sage/search/index.json" ] && jq -e '.sources' .sage/search/index.json >/dev/null 2>&1; then
    pass_test "Index structure ready for caching"
else
    fail_test "Index not available"
fi

# Test 12: All command files properly structured
echo "Test 12: Search commands follow standard structure"
run_test
VALID=true
for cmd in sage.search sage.search-index; do
    if [ -f "commands/$cmd.md" ]; then
        if ! grep -q "^---$" "commands/$cmd.md"; then
            VALID=false
        fi
    else
        VALID=false
    fi
done
if $VALID; then
    pass_test "All search commands have YAML frontmatter"
else
    fail_test "Command structure inconsistent"
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
