#!/bin/bash
# Unit tests for search index structure

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
echo "Unit Tests: Search Index Structure"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Index file exists
echo "Test 1: Index file exists"
run_test
if [ -f ".sage/search/index.json" ]; then
    pass_test "Index file found at .sage/search/index.json"
else
    fail_test "Index file not found"
fi

# Test 2: Index is valid JSON
echo "Test 2: Index is valid JSON"
run_test
if jq '.' .sage/search/index.json >/dev/null 2>&1; then
    pass_test "Index file is valid JSON"
else
    fail_test "Index file contains invalid JSON"
fi

# Test 3: Version field present
echo "Test 3: Version field present"
run_test
VERSION=$(jq -r '.version' .sage/search/index.json 2>/dev/null)
if [ -n "$VERSION" ] && [ "$VERSION" != "null" ]; then
    pass_test "Version: $VERSION"
else
    fail_test "Missing version field"
fi

# Test 4: All 5 sources defined
echo "Test 4: All 5 source sections defined"
run_test
MISSING_SOURCES=""
for src in agent tickets specs git patterns; do
    if ! jq -e ".sources.$src" .sage/search/index.json >/dev/null 2>&1; then
        MISSING_SOURCES="$MISSING_SOURCES $src"
    fi
done
if [ -z "$MISSING_SOURCES" ]; then
    pass_test "All 5 sources defined"
else
    fail_test "Missing sources:$MISSING_SOURCES"
fi

# Test 5: Each source has required fields
echo "Test 5: Source structure (last_indexed, entries)"
run_test
VALID=true
for src in agent tickets specs git patterns; do
    if ! jq -e ".sources.$src.last_indexed" .sage/search/index.json >/dev/null 2>&1; then
        VALID=false
    fi
    if ! jq -e ".sources.$src.entries" .sage/search/index.json >/dev/null 2>&1; then
        VALID=false
    fi
done
if $VALID; then
    pass_test "All sources have required fields"
else
    fail_test "Sources missing required fields"
fi

# Test 6: Statistics section present
echo "Test 6: Statistics section present"
run_test
if jq -e '.statistics' .sage/search/index.json >/dev/null 2>&1; then
    pass_test "Statistics section found"
else
    fail_test "Missing statistics section"
fi

# Test 7: Statistics has tracking fields
echo "Test 7: Statistics tracking fields"
run_test
MISSING_FIELDS=""
for field in total_searches average_query_time_ms cache_hits; do
    if ! jq -e ".statistics.$field" .sage/search/index.json >/dev/null 2>&1; then
        MISSING_FIELDS="$MISSING_FIELDS $field"
    fi
done
if [ -z "$MISSING_FIELDS" ]; then
    pass_test "All statistics fields present"
else
    fail_test "Missing statistics fields:$MISSING_FIELDS"
fi

# Test 8: Timestamps are ISO 8601 format
echo "Test 8: Timestamps in ISO 8601 format"
run_test
TIMESTAMP=$(jq -r '.created' .sage/search/index.json)
if echo "$TIMESTAMP" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$'; then
    pass_test "Timestamp format valid: $TIMESTAMP"
else
    fail_test "Invalid timestamp format: $TIMESTAMP"
fi

# Test 9: Index size is reasonable
echo "Test 9: Index size reasonable (<10MB)"
run_test
SIZE=$(stat -f %z .sage/search/index.json | tr -d ' ')
SIZE_KB=$((SIZE / 1024))
if [ "$SIZE" -lt 10485760 ]; then
    pass_test "Index size: ${SIZE_KB}KB"
else
    fail_test "Index too large: ${SIZE_KB}KB (max: 10MB)"
fi

# Test 10: sage.search-index command exists
echo "Test 10: Index management command exists"
run_test
if [ -f "commands/sage.search-index.md" ]; then
    pass_test "sage.search-index command file found"
else
    fail_test "Index management command not found"
fi

# Test 11: Index command has rebuild option
echo "Test 11: Index command supports --rebuild"
run_test
if grep -q "\-\-rebuild" commands/sage.search-index.md 2>/dev/null; then
    pass_test "--rebuild option documented"
else
    fail_test "Missing --rebuild option"
fi

# Test 12: Index command has stats option
echo "Test 12: Index command supports --stats"
run_test
if grep -q "\-\-stats" commands/sage.search-index.md 2>/dev/null; then
    pass_test "--stats option documented"
else
    fail_test "Missing --stats option"
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
