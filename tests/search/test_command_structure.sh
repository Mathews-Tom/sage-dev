#!/bin/bash
# Unit tests for /sage.search command structure

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
echo "Unit Tests: /sage.search - Command Structure"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Command file exists
echo "Test 1: sage.search command file exists"
run_test
if [ -f "commands/sage.search.md" ]; then
    pass_test "Command file found"
else
    fail_test "commands/sage.search.md not found"
fi

# Test 2: Allowed-tools header present
echo "Test 2: allowed-tools header present"
run_test
if grep -q "^allowed-tools:" commands/sage.search.md; then
    pass_test "allowed-tools header found"
else
    fail_test "Missing allowed-tools header"
fi

# Test 3: Required tools specified
echo "Test 3: Required tools in allowed-tools"
run_test
MISSING_TOOLS=""
for tool in "rg:" "jq:" "git log:" "fd:" "Grep" "Glob" "Read"; do
    if ! grep "^allowed-tools:" commands/sage.search.md | grep -q "$tool"; then
        MISSING_TOOLS="$MISSING_TOOLS $tool"
    fi
done
if [ -z "$MISSING_TOOLS" ]; then
    pass_test "All required tools specified"
else
    fail_test "Missing tools:$MISSING_TOOLS"
fi

# Test 4: Argument hint includes all options
echo "Test 4: Argument hint covers all options"
run_test
MISSING_OPTS=""
for opt in "source" "since" "regex" "limit" "format"; do
    if ! grep "^argument-hint:" commands/sage.search.md | grep -q -- "--$opt"; then
        MISSING_OPTS="$MISSING_OPTS --$opt"
    fi
done
if [ -z "$MISSING_OPTS" ]; then
    pass_test "All options in argument hint"
else
    fail_test "Missing options:$MISSING_OPTS"
fi

# Test 5: Source types documented
echo "Test 5: All 5 source types documented"
run_test
SOURCES="agent tickets specs git patterns"
MISSING_SOURCES=""
for src in $SOURCES; do
    if ! grep -q "\"$src\"" commands/sage.search.md; then
        MISSING_SOURCES="$MISSING_SOURCES $src"
    fi
done
if [ -z "$MISSING_SOURCES" ]; then
    pass_test "All 5 source types documented"
else
    fail_test "Missing sources:$MISSING_SOURCES"
fi

# Test 6: Error handling section
echo "Test 6: Error handling documented"
run_test
if grep -q "Error Handling\|Error:" commands/sage.search.md; then
    pass_test "Error handling section present"
else
    fail_test "Missing error handling documentation"
fi

# Test 7: Examples section
echo "Test 7: Usage examples provided"
run_test
EXAMPLE_COUNT=$(grep -c "^/sage.search" commands/sage.search.md)
if [ "$EXAMPLE_COUNT" -ge 3 ]; then
    pass_test "$EXAMPLE_COUNT usage examples provided"
else
    fail_test "Insufficient examples (found: $EXAMPLE_COUNT, required: 3+)"
fi

# Test 8: Performance requirements documented
echo "Test 8: Performance requirements specified"
run_test
if grep -q "<2s\|2 second\|Performance" commands/sage.search.md; then
    pass_test "Performance requirements documented"
else
    fail_test "Missing performance requirements"
fi

# Test 9: Relevance ranking logic
echo "Test 9: Relevance ranking implemented"
run_test
if grep -q "rank_results\|relevance_score\|Relevance Ranking" commands/sage.search.md; then
    pass_test "Relevance ranking logic present"
else
    fail_test "Missing relevance ranking implementation"
fi

# Test 10: Output formats supported
echo "Test 10: Output format options (compact|detailed|json)"
run_test
FORMATS_OK=true
for fmt in "compact" "detailed" "json"; do
    if ! grep -q "$fmt" commands/sage.search.md; then
        FORMATS_OK=false
    fi
done
if $FORMATS_OK; then
    pass_test "All 3 output formats supported"
else
    fail_test "Missing output format options"
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
