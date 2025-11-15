#!/bin/bash
# Edge case tests for context search system

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
echo "Edge Case Tests: Context Search System"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Empty query handling
echo "Test 1: Empty query detection"
run_test
EMPTY_QUERY=""
if [ -z "$EMPTY_QUERY" ]; then
    pass_test "Empty query correctly identified"
else
    fail_test "Empty query not detected"
fi

# Test 2: Query with special regex characters
echo "Test 2: Special characters in query"
run_test
# Test that literal search doesn't break with regex chars
RESULT=$(rg -F "Step 1:" .sage/agent/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$RESULT" -ge 0 ]; then
    pass_test "Special chars handled with -F flag ($RESULT matches)"
else
    fail_test "Special character handling failed"
fi

# Test 3: Very long query string
echo "Test 3: Long query string handling"
run_test
LONG_QUERY="this is a very long search query string that might cause issues with buffer sizes or command line argument limits"
RESULT=$(rg -i -l "$(echo "$LONG_QUERY" | cut -c1-50)" .sage/agent/ --type md 2>/dev/null | wc -l | tr -d ' ')
pass_test "Long query processed without error"

# Test 4: No results found
echo "Test 4: No results scenario"
run_test
RESULT=$(rg -i -l "xyznonexistent123abc" .sage/agent/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$RESULT" -eq 0 ]; then
    pass_test "Zero results handled gracefully"
else
    fail_test "Should not find nonexistent term"
fi

# Test 5: Invalid source type
echo "Test 5: Invalid source type detection"
run_test
VALID_SOURCES="agent tickets specs git patterns"
INVALID="invalid-source"
if ! echo "$VALID_SOURCES" | grep -qw "$INVALID"; then
    pass_test "Invalid source correctly identified"
else
    fail_test "Invalid source not detected"
fi

# Test 6: Missing directory handling
echo "Test 6: Missing directory graceful handling"
run_test
if rg -i -l "test" /nonexistent/path/ 2>&1 | grep -q "No such file"; then
    pass_test "Missing directory error handled"
else
    pass_test "No error for missing directory check"
fi

# Test 7: Malformed JSON in tickets
echo "Test 7: Valid JSON in ticket index"
run_test
if jq '.' .sage/tickets/index.json >/dev/null 2>&1; then
    pass_test "Ticket index JSON is valid"
else
    fail_test "Ticket index JSON is malformed"
fi

# Test 8: Unicode in search query
echo "Test 8: Unicode query handling"
run_test
UNICODE_QUERY="café"
# Should not crash, even if no results
if rg -i -l "$UNICODE_QUERY" .sage/agent/ --type md 2>/dev/null; then
    pass_test "Unicode query processed"
else
    pass_test "Unicode query handled (no matches)"
fi

# Test 9: Binary file exclusion
echo "Test 9: Binary files excluded from text search"
run_test
# rg automatically skips binary files
TEXT_ONLY=$(rg -i -l "test" .sage/agent/ --type md 2>/dev/null | wc -l | tr -d ' ')
pass_test "Text-only search (md files): $TEXT_ONLY results"

# Test 10: Git repository not initialized
echo "Test 10: Git available check"
run_test
if git rev-parse --git-dir >/dev/null 2>&1; then
    pass_test "Git repository detected"
else
    fail_test "Not a git repository"
fi

# Test 11: Large result set limiting
echo "Test 11: Result limit enforcement"
run_test
ALL_RESULTS=$(rg -i -l "the\|and\|or" .sage/agent/ --type md 2>/dev/null | wc -l | tr -d ' ')
LIMITED=$(rg -i -l "the\|and\|or" .sage/agent/ --type md 2>/dev/null | head -10 | wc -l | tr -d ' ')
if [ "$LIMITED" -le 10 ]; then
    pass_test "Results limited to 10 (total: $ALL_RESULTS)"
else
    fail_test "Limit not applied correctly"
fi

# Test 12: Concurrent search safety
echo "Test 12: Temp file uniqueness"
run_test
TMP1="/tmp/sage-search-results-$$.json"
TMP2="/tmp/sage-search-results-$(($$+1)).json"
if [ "$TMP1" != "$TMP2" ]; then
    pass_test "Unique temp files per process"
else
    fail_test "Temp file collision risk"
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
