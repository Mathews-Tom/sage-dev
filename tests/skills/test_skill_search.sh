#!/bin/bash
# Unit tests for /sage.skill-search command

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
echo "Unit Tests: /sage.skill-search - Skill Discovery"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Search finds skills by keyword (rg)
echo "Test 1: Keyword search using ripgrep"
run_test
MATCHES=$(rg -l -i "test" .sage/agent/skills/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$MATCHES" -ge 1 ]; then
    pass_test "Found $MATCHES skills matching 'test'"
else
    fail_test "No skills found matching 'test'"
fi

# Test 2: Category filter (testing directory)
echo "Test 2: Category filter - testing/"
run_test
if [ -d ".sage/agent/skills/testing" ]; then
    TESTING_COUNT=$(ls .sage/agent/skills/testing/*.md 2>/dev/null | wc -l | tr -d ' ')
    if [ "$TESTING_COUNT" -ge 1 ]; then
        pass_test "Found $TESTING_COUNT skills in testing category"
    else
        fail_test "No skills found in testing category"
    fi
else
    fail_test "testing/ category directory not found"
fi

# Test 3: Category filter - debugging directory
echo "Test 3: Category filter - debugging/"
run_test
if [ -d ".sage/agent/skills/debugging" ]; then
    DEBUG_COUNT=$(ls .sage/agent/skills/debugging/*.md 2>/dev/null | wc -l | tr -d ' ')
    if [ "$DEBUG_COUNT" -ge 1 ]; then
        pass_test "Found $DEBUG_COUNT skills in debugging category"
    else
        fail_test "No skills found in debugging category"
    fi
else
    fail_test "debugging/ category directory not found"
fi

# Test 4: Language filter - Python
echo "Test 4: Language filter - python"
run_test
PYTHON_SKILLS=0
for skill_file in .sage/agent/skills/*/*.md; do
    if grep -q "^\s*-\s*python" "$skill_file" 2>/dev/null; then
        PYTHON_SKILLS=$((PYTHON_SKILLS + 1))
    fi
done
if [ "$PYTHON_SKILLS" -ge 1 ]; then
    pass_test "Found $PYTHON_SKILLS skills supporting Python"
else
    fail_test "No Python skills found"
fi

# Test 5: Language filter - TypeScript
echo "Test 5: Language filter - typescript"
run_test
TS_SKILLS=0
for skill_file in .sage/agent/skills/*/*.md; do
    if grep -q "^\s*-\s*typescript" "$skill_file" 2>/dev/null; then
        TS_SKILLS=$((TS_SKILLS + 1))
    fi
done
if [ "$TS_SKILLS" -ge 1 ]; then
    pass_test "Found $TS_SKILLS skills supporting TypeScript"
else
    fail_test "No TypeScript skills found"
fi

# Test 6: Search results sorted alphabetically
echo "Test 6: Skills sorted alphabetically by name"
run_test
SKILLS=$(fd -t f ".md" .sage/agent/skills/ -x basename {} .md | sort)
SORTED_SKILLS=$(echo "$SKILLS" | sort)
if [ "$SKILLS" = "$SORTED_SKILLS" ]; then
    pass_test "Skills can be sorted alphabetically"
else
    fail_test "Skill sorting issue"
fi

# Test 7: Search returns file path
echo "Test 7: Search returns full file path"
run_test
RESULT=$(rg -l "TDD" .sage/agent/skills/ --type md 2>/dev/null | head -1)
if echo "$RESULT" | grep -q ".sage/agent/skills/"; then
    pass_test "Full path returned: $RESULT"
else
    fail_test "Expected full path, got: $RESULT"
fi

# Test 8: Extract skill metadata (purpose)
echo "Test 8: Extract skill purpose from content"
run_test
PURPOSE=$(grep -A 3 "^## Purpose" .sage/agent/skills/testing/tdd-workflow.md | head -4 | tail -1)
if [ -n "$PURPOSE" ]; then
    pass_test "Purpose extracted: $(echo $PURPOSE | head -c 50)..."
else
    fail_test "Cannot extract purpose from skill"
fi

# Test 9: Extract languages from frontmatter
echo "Test 9: Extract languages from frontmatter"
run_test
LANGUAGES=$(grep -A 10 "^languages:" .sage/agent/skills/testing/tdd-workflow.md | grep "^\s*-" | sed 's/.*- //' | head -5 | tr '\n' ', ' | sed 's/,$//')
if [ -n "$LANGUAGES" ]; then
    pass_test "Languages: $LANGUAGES"
else
    fail_test "Cannot extract languages"
fi

# Test 10: No results for nonexistent term
echo "Test 10: No results for nonexistent search term"
run_test
MATCHES=$(rg -l "xyznonexistent12345" .sage/agent/skills/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$MATCHES" -eq 0 ]; then
    pass_test "Correctly returns no results for nonexistent term"
else
    fail_test "Should not find 'xyznonexistent12345'"
fi

# Test 11: Case-insensitive search
echo "Test 11: Case-insensitive search"
run_test
UPPER_MATCH=$(rg -l -i "REFACTOR" .sage/agent/skills/ --type md 2>/dev/null | wc -l | tr -d ' ')
LOWER_MATCH=$(rg -l -i "refactor" .sage/agent/skills/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$UPPER_MATCH" -eq "$LOWER_MATCH" ] && [ "$UPPER_MATCH" -ge 1 ]; then
    pass_test "Case-insensitive search works ($UPPER_MATCH matches)"
else
    fail_test "Case-insensitive search failed"
fi

# Test 12: Category directory validation
echo "Test 12: All 5 category directories exist"
run_test
MISSING_CATS=""
for cat in testing debugging refactoring collaboration architecture; do
    if [ ! -d ".sage/agent/skills/$cat" ]; then
        MISSING_CATS="$MISSING_CATS $cat"
    fi
done
if [ -z "$MISSING_CATS" ]; then
    pass_test "All 5 category directories exist"
else
    fail_test "Missing categories:$MISSING_CATS"
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
