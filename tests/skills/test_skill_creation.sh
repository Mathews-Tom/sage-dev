#!/bin/bash
# Unit tests for /sage.skill-add command - skill creation

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

cleanup() {
    # Remove test skill if created
    rm -f .sage/agent/skills/testing/test-skill-creation.md 2>/dev/null
}

trap cleanup EXIT

echo "═══════════════════════════════════════════════════════"
echo "Unit Tests: /sage.skill-add - Skill Creation"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Template file exists
echo "Test 1: Skill template exists"
run_test
if [ -f ".sage/agent/templates/skill-template.md" ]; then
    pass_test "Template found at .sage/agent/templates/skill-template.md"
else
    fail_test "Template not found"
fi

# Test 2: Template has placeholders
echo "Test 2: Template contains {{NAME}} placeholder"
run_test
if grep -q "{{NAME}}" .sage/agent/templates/skill-template.md; then
    pass_test "{{NAME}} placeholder found in template"
else
    fail_test "{{NAME}} placeholder missing"
fi

# Test 3: Template has category placeholder
echo "Test 3: Template contains {{CATEGORY}} placeholder"
run_test
if grep -q "{{CATEGORY}}" .sage/agent/templates/skill-template.md; then
    pass_test "{{CATEGORY}} placeholder found in template"
else
    fail_test "{{CATEGORY}} placeholder missing"
fi

# Test 4: Category mapping validation
echo "Test 4: Category mapping (1-5)"
run_test
VALID=true
for i in 1 2 3 4 5; do
    case $i in
        1) CAT="testing" ;;
        2) CAT="debugging" ;;
        3) CAT="refactoring" ;;
        4) CAT="collaboration" ;;
        5) CAT="architecture" ;;
    esac
    if [ ! -d ".sage/agent/skills/$CAT" ]; then
        VALID=false
    fi
done
if $VALID; then
    pass_test "All category mappings valid"
else
    fail_test "Category mapping incomplete"
fi

# Test 5: Skill name slugification
echo "Test 5: Skill name slugification"
run_test
SKILL_NAME="My Test Skill"
SKILL_SLUG=$(echo "$SKILL_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')
if [ "$SKILL_SLUG" = "my-test-skill" ]; then
    pass_test "Slugification: '$SKILL_NAME' -> '$SKILL_SLUG'"
else
    fail_test "Expected 'my-test-skill', got '$SKILL_SLUG'"
fi

# Test 6: Template copy works
echo "Test 6: Template can be copied"
run_test
TEST_FILE="/tmp/test-skill-copy-$$.md"
cp .sage/agent/templates/skill-template.md "$TEST_FILE"
if [ -f "$TEST_FILE" ]; then
    pass_test "Template copy successful"
    rm -f "$TEST_FILE"
else
    fail_test "Template copy failed"
fi

# Test 7: Placeholder substitution with sed
echo "Test 7: Placeholder substitution ({{NAME}})"
run_test
TEST_FILE="/tmp/test-skill-sub-$$.md"
cp .sage/agent/templates/skill-template.md "$TEST_FILE"
sed -i '' "s/{{NAME}}/Test Skill Name/g" "$TEST_FILE"
if grep -q "Test Skill Name" "$TEST_FILE" && ! grep -q "{{NAME}}" "$TEST_FILE"; then
    pass_test "{{NAME}} substitution works"
else
    fail_test "{{NAME}} substitution failed"
fi
rm -f "$TEST_FILE"

# Test 8: Placeholder substitution ({{CATEGORY}})
echo "Test 8: Placeholder substitution ({{CATEGORY}})"
run_test
TEST_FILE="/tmp/test-skill-cat-$$.md"
cp .sage/agent/templates/skill-template.md "$TEST_FILE"
sed -i '' "s/{{CATEGORY}}/testing/g" "$TEST_FILE"
if grep -q "testing" "$TEST_FILE"; then
    pass_test "{{CATEGORY}} substitution works"
else
    fail_test "{{CATEGORY}} substitution failed"
fi
rm -f "$TEST_FILE"

# Test 9: Duplicate skill detection
echo "Test 9: Duplicate skill detection"
run_test
EXISTING_SKILL=".sage/agent/skills/testing/tdd-workflow.md"
if [ -f "$EXISTING_SKILL" ]; then
    pass_test "Can detect existing skill: tdd-workflow"
else
    fail_test "Cannot check for existing skills"
fi

# Test 10: Example template exists
echo "Test 10: Example filled template exists"
run_test
if [ -f ".sage/agent/templates/examples/skill-example.md" ]; then
    pass_test "Example template found for reference"
else
    fail_test "Example template missing"
fi

# Test 11: New skill inherits all required sections
echo "Test 11: Template has all required sections"
run_test
REQUIRED="Purpose Prerequisites Algorithm Validation Pitfalls Examples References Changelog"
MISSING=""
for section in $REQUIRED; do
    if ! grep -q "$section" .sage/agent/templates/skill-template.md; then
        MISSING="$MISSING $section"
    fi
done
if [ -z "$MISSING" ]; then
    pass_test "Template contains all required sections"
else
    fail_test "Template missing sections:$MISSING"
fi

# Test 12: Category directories have write permission
echo "Test 12: Category directories are writable"
run_test
WRITABLE=true
for cat in testing debugging refactoring collaboration architecture; do
    if [ ! -w ".sage/agent/skills/$cat" ]; then
        WRITABLE=false
    fi
done
if $WRITABLE; then
    pass_test "All category directories are writable"
else
    fail_test "Some category directories not writable"
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
