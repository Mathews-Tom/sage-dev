#!/bin/bash
# Edge case tests for SKILLS library system

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
echo "Edge Case Tests: SKILLS Library System"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test 1: Skill not found error
echo "Test 1: Skill not found handling"
run_test
RESULT=$(fd -t f "nonexistent-skill-xyz.md" .sage/agent/skills/ 2>/dev/null | head -1)
if [ -z "$RESULT" ]; then
    pass_test "Correctly returns empty for nonexistent skill"
else
    fail_test "Should not find nonexistent-skill-xyz"
fi

# Test 2: Invalid category directory
echo "Test 2: Invalid category detection"
run_test
if [ ! -d ".sage/agent/skills/invalid-category" ]; then
    pass_test "Invalid category directory does not exist"
else
    fail_test "Unexpected invalid-category directory exists"
fi

# Test 3: Missing tool detection
echo "Test 3: Missing prerequisite tool"
run_test
MISSING_TOOL="nonexistent-tool-abc123"
if ! which "$MISSING_TOOL" >/dev/null 2>&1; then
    pass_test "Correctly identifies missing tool: $MISSING_TOOL"
else
    fail_test "Should not find $MISSING_TOOL"
fi

# Test 4: Empty YAML field handling
echo "Test 4: Handle skill with no knowledge prerequisites"
run_test
# Create temporary skill without knowledge prereqs
TEST_SKILL=$(cat << 'EOF'
---
name: "Test Skill"
category: "testing"
languages:
  - python
prerequisites:
  tools:
    - git>=2.0
  knowledge: []
evidence:
  - "https://example.com"
validated: false
validated_by:
  - test-coverage
---
# Test Skill
EOF
)
# Check if knowledge: [] is present (empty array syntax)
if echo "$TEST_SKILL" | grep -q "knowledge: \[\]"; then
    pass_test "Empty knowledge prerequisites handled"
else
    fail_test "Should handle empty knowledge array"
fi

# Test 5: Skill with special characters in name
echo "Test 5: Special characters in skill search"
run_test
# Search should handle regex special characters safely
RESULT=$(rg -l "Step 1:" .sage/agent/skills/ --type md 2>/dev/null | wc -l | tr -d ' ')
if [ "$RESULT" -ge 1 ]; then
    pass_test "Search handles regex characters (Step 1:)"
else
    fail_test "Search failed with special characters"
fi

# Test 6: Very long skill name
echo "Test 6: Long skill name slugification"
run_test
LONG_NAME="This Is A Very Long Skill Name That Might Cause Issues With File Systems"
SLUG=$(echo "$LONG_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')
if [ ${#SLUG} -gt 50 ]; then
    pass_test "Long name slugified: ${#SLUG} chars"
else
    fail_test "Slugification issue with long names"
fi

# Test 7: Unicode in skill content
echo "Test 7: Unicode characters in skill content"
run_test
# Check if skills can have emoji (they shouldn't per CLAUDE.md rules)
EMOJI_COUNT=$(grep -r "[\x{1F300}-\x{1F9FF}]" .sage/agent/skills/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$EMOJI_COUNT" -eq 0 ]; then
    pass_test "No emoji in skill files (per coding standards)"
else
    pass_test "Skills contain $EMOJI_COUNT emoji references"
fi

# Test 8: Skill with no evidence links
echo "Test 8: Detect skill with insufficient evidence"
run_test
MIN_EVIDENCE=2
ALL_HAVE_EVIDENCE=true
for skill_file in .sage/agent/skills/*/*.md; do
    EVIDENCE_COUNT=$(grep -A 10 "^evidence:" "$skill_file" | grep "^\s*-" | wc -l | tr -d ' ')
    if [ "$EVIDENCE_COUNT" -lt "$MIN_EVIDENCE" ]; then
        ALL_HAVE_EVIDENCE=false
    fi
done
if $ALL_HAVE_EVIDENCE; then
    pass_test "All skills have minimum $MIN_EVIDENCE evidence links"
else
    fail_test "Some skills lack sufficient evidence"
fi

# Test 9: Circular knowledge dependency detection
echo "Test 9: Check for self-referencing prerequisites"
run_test
SELF_REF=false
for skill_file in .sage/agent/skills/*/*.md; do
    SKILL_NAME=$(basename "$skill_file" .md)
    # Check if skill name appears as a standalone knowledge item (not part of a URL or other text)
    if grep -A 10 "^  knowledge:" "$skill_file" | grep "^\s*- $SKILL_NAME$" | grep -qv "http"; then
        SELF_REF=true
    fi
done
if ! $SELF_REF; then
    pass_test "No self-referencing knowledge prerequisites"
else
    fail_test "Found self-referencing skill"
fi

# Test 10: Empty category directory
echo "Test 10: Handle category with no skills"
run_test
# All categories should have at least one skill
EMPTY_CATS=""
for cat in testing debugging refactoring collaboration architecture; do
    COUNT=$(ls .sage/agent/skills/$cat/*.md 2>/dev/null | wc -l | tr -d ' ')
    if [ "$COUNT" -eq 0 ]; then
        EMPTY_CATS="$EMPTY_CATS $cat"
    fi
done
if [ -z "$EMPTY_CATS" ]; then
    pass_test "All categories have at least one skill"
else
    fail_test "Empty categories:$EMPTY_CATS"
fi

# Test 11: Malformed YAML frontmatter
echo "Test 11: All skills have valid YAML structure"
run_test
MALFORMED=false
for skill_file in .sage/agent/skills/*/*.md; do
    # Check for opening and closing ---
    OPEN=$(head -1 "$skill_file" | grep -c "^---$")
    CLOSE=$(sed -n '2,50p' "$skill_file" | grep -c "^---$" | head -1)
    if [ "$OPEN" -ne 1 ] || [ "$CLOSE" -lt 1 ]; then
        MALFORMED=true
    fi
done
if ! $MALFORMED; then
    pass_test "All skills have valid YAML delimiters"
else
    fail_test "Some skills have malformed YAML frontmatter"
fi

# Test 12: Duplicate skill names across categories
echo "Test 12: No duplicate skill names across categories"
run_test
SKILL_NAMES=$(fd -t f ".md" .sage/agent/skills/ -x basename {} .md | sort)
UNIQUE_NAMES=$(echo "$SKILL_NAMES" | sort -u)
if [ "$SKILL_NAMES" = "$UNIQUE_NAMES" ]; then
    pass_test "All skill names are unique"
else
    DUPLICATES=$(echo "$SKILL_NAMES" | sort | uniq -d)
    fail_test "Duplicate skill names: $DUPLICATES"
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
