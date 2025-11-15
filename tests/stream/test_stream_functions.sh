#!/bin/bash
# test_stream_functions.sh - Unit tests for stream-functions.sh
# Part of STREAM-011: Unit Test Suite

set -euo pipefail

# Test configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LIB_PATH="$PROJECT_ROOT/.sage/lib/stream-functions.sh"
TEST_DIR="/tmp/stream-test-$$"
PASSED=0
FAILED=0
TOTAL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Source the library
source "$LIB_PATH"

# ============================================================================
# TEST HELPERS
# ============================================================================

setup() {
  mkdir -p "$TEST_DIR/batches"
}

teardown() {
  rm -rf "$TEST_DIR"
}

assert_equals() {
  local expected="$1"
  local actual="$2"
  local test_name="$3"

  TOTAL=$((TOTAL + 1))

  if [ "$expected" = "$actual" ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name"
    echo "  Expected: '$expected'"
    echo "  Actual:   '$actual'"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

assert_true() {
  local cmd="$1"
  local test_name="$2"

  TOTAL=$((TOTAL + 1))

  if eval "$cmd"; then
    echo -e "${GREEN}✓${NC} $test_name"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name"
    echo "  Command failed: $cmd"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

assert_false() {
  local cmd="$1"
  local test_name="$2"

  TOTAL=$((TOTAL + 1))

  if eval "$cmd"; then
    echo -e "${RED}✗${NC} $test_name"
    echo "  Command should have failed: $cmd"
    FAILED=$((FAILED + 1))
    return 1
  else
    echo -e "${GREEN}✓${NC} $test_name"
    PASSED=$((PASSED + 1))
    return 0
  fi
}

assert_file_exists() {
  local file_path="$1"
  local test_name="$2"

  TOTAL=$((TOTAL + 1))

  if [ -f "$file_path" ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name"
    echo "  File not found: $file_path"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

assert_file_not_exists() {
  local file_path="$1"
  local test_name="$2"

  TOTAL=$((TOTAL + 1))

  if [ ! -f "$file_path" ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name"
    echo "  File should not exist: $file_path"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# ============================================================================
# COMPONENT PREFIX EXTRACTION TESTS
# ============================================================================

test_extract_component_prefix() {
  echo ""
  echo "=== Component Prefix Extraction Tests ==="

  local result

  result=$(extract_component_prefix "AUTH-001")
  assert_equals "AUTH" "$result" "extract_component_prefix AUTH-001"

  result=$(extract_component_prefix "API-002")
  assert_equals "API" "$result" "extract_component_prefix API-002"

  result=$(extract_component_prefix "UI-123")
  assert_equals "UI" "$result" "extract_component_prefix UI-123"

  result=$(extract_component_prefix "STREAM-014")
  assert_equals "STREAM" "$result" "extract_component_prefix STREAM-014"

  result=$(extract_component_prefix "abc-999")
  assert_equals "abc" "$result" "extract_component_prefix lowercase abc-999"

  result=$(extract_component_prefix "123-001")
  assert_equals "123" "$result" "extract_component_prefix numeric 123-001"

  result=$(extract_component_prefix "A-1")
  assert_equals "A" "$result" "extract_component_prefix single char A-1"
}

# ============================================================================
# STANDARD PREFIX VALIDATION TESTS
# ============================================================================

test_is_standard_prefix() {
  echo ""
  echo "=== Standard Prefix Validation Tests ==="

  assert_true 'is_standard_prefix "AUTH"' "is_standard_prefix AUTH (uppercase)"
  assert_true 'is_standard_prefix "API"' "is_standard_prefix API (uppercase)"
  assert_true 'is_standard_prefix "UI"' "is_standard_prefix UI (uppercase)"
  assert_true 'is_standard_prefix "A"' "is_standard_prefix A (single char)"

  assert_false 'is_standard_prefix "auth"' "is_standard_prefix auth (lowercase)"
  assert_false 'is_standard_prefix "Auth"' "is_standard_prefix Auth (mixed case)"
  assert_false 'is_standard_prefix "123"' "is_standard_prefix 123 (numeric)"
  assert_false 'is_standard_prefix "AUTH1"' "is_standard_prefix AUTH1 (alphanumeric)"
  assert_false 'is_standard_prefix "AUTH-"' "is_standard_prefix AUTH- (with dash)"
  assert_false 'is_standard_prefix ""' "is_standard_prefix empty string"
}

# ============================================================================
# MISC GROUPING TESTS (Non-Standard Prefixes)
# ============================================================================

test_misc_grouping() {
  echo ""
  echo "=== MISC Grouping Tests (Non-Standard Prefixes) ==="

  # Test that non-standard prefixes are identified
  assert_false 'is_standard_prefix "abc"' "Non-standard: lowercase prefix"
  assert_false 'is_standard_prefix "Auth"' "Non-standard: mixed case prefix"
  assert_false 'is_standard_prefix "123"' "Non-standard: numeric prefix"
  assert_false 'is_standard_prefix "AUTH1"' "Non-standard: alphanumeric prefix"

  # These should be grouped into MISC batch
  assert_true 'is_standard_prefix "AUTH"' "Standard: AUTH"
  assert_true 'is_standard_prefix "API"' "Standard: API"
  assert_true 'is_standard_prefix "UI"' "Standard: UI"
  assert_true 'is_standard_prefix "MISC"' "Standard: MISC itself"
}

# ============================================================================
# BATCH FILE ATOMIC OPERATIONS TESTS
# ============================================================================

test_create_batch_file_atomic() {
  echo ""
  echo "=== Batch File Atomic Operations Tests ==="

  setup

  # Test successful atomic creation
  local ticket_list="AUTH-001
AUTH-002
AUTH-003"

  assert_true 'create_batch_file_atomic "$TEST_DIR/batches" "AUTH" "$ticket_list"' \
    "create_batch_file_atomic creates file successfully"

  assert_file_exists "$TEST_DIR/batches/AUTH.batch" "AUTH.batch file exists after creation"

  local content
  content=$(cat "$TEST_DIR/batches/AUTH.batch")
  assert_equals "$ticket_list" "$content" "Batch file content matches input"

  # Test that temp file is cleaned up (atomic operation)
  assert_file_not_exists "/tmp/AUTH.batch.tmp.$$" "Temp file cleaned up after mv"

  # Test creating second batch
  local api_tickets="API-001
API-002"
  create_batch_file_atomic "$TEST_DIR/batches" "API" "$api_tickets"
  assert_file_exists "$TEST_DIR/batches/API.batch" "API.batch created"

  # Test MISC batch creation
  local misc_tickets="abc-001
123-002"
  create_batch_file_atomic "$TEST_DIR/batches" "MISC" "$misc_tickets"
  assert_file_exists "$TEST_DIR/batches/MISC.batch" "MISC.batch created"

  teardown
}

test_batch_file_validation() {
  echo ""
  echo "=== Batch File Validation Tests ==="

  setup

  # Create batch file with mixed states
  echo "AUTH-001
AUTH-002
AUTH-003" > "$TEST_DIR/batches/AUTH.batch"

  # Create mock index.json
  local index_json='{
    "tickets": [
      {"id": "AUTH-001", "state": "UNPROCESSED"},
      {"id": "AUTH-002", "state": "COMPLETED"},
      {"id": "AUTH-003", "state": "UNPROCESSED"}
    ]
  }'

  local invalid_count
  invalid_count=$(validate_batch_file "$TEST_DIR/batches/AUTH.batch" "$index_json")

  assert_equals "1" "$invalid_count" "validate_batch_file removes 1 invalid ticket (COMPLETED)"

  # Check that only UNPROCESSED tickets remain
  local remaining
  remaining=$(cat "$TEST_DIR/batches/AUTH.batch" | wc -l | tr -d ' ')
  assert_equals "2" "$remaining" "2 UNPROCESSED tickets remain after validation"

  # Verify correct tickets remain
  assert_true 'grep -q "AUTH-001" "$TEST_DIR/batches/AUTH.batch"' "AUTH-001 (UNPROCESSED) remains"
  assert_false 'grep -q "AUTH-002" "$TEST_DIR/batches/AUTH.batch"' "AUTH-002 (COMPLETED) removed"
  assert_true 'grep -q "AUTH-003" "$TEST_DIR/batches/AUTH.batch"' "AUTH-003 (UNPROCESSED) remains"

  teardown
}

test_batch_file_cleanup() {
  echo ""
  echo "=== Batch File Cleanup Tests ==="

  setup

  # Create batch file
  echo "AUTH-001" > "$TEST_DIR/batches/AUTH.batch"
  assert_file_exists "$TEST_DIR/batches/AUTH.batch" "Batch file exists before cleanup"

  # Cleanup
  cleanup_component_batch "$TEST_DIR/batches" "AUTH"
  assert_file_not_exists "$TEST_DIR/batches/AUTH.batch" "Batch file removed after cleanup"

  # Cleanup non-existent file should not error
  assert_true 'cleanup_component_batch "$TEST_DIR/batches" "NONEXISTENT"' \
    "cleanup_component_batch succeeds for non-existent file"

  teardown
}

# ============================================================================
# SINGLE-TICKET COMPONENT TESTS
# ============================================================================

test_single_ticket_component() {
  echo ""
  echo "=== Single-Ticket Component Tests ==="

  setup

  # Create single-ticket batch
  echo "AUTH-001" > "$TEST_DIR/batches/AUTH.batch"

  assert_true 'is_single_ticket_component "$TEST_DIR/batches/AUTH.batch"' \
    "is_single_ticket_component returns true for 1 ticket"

  local count
  count=$(count_batch_tickets "$TEST_DIR/batches/AUTH.batch")
  assert_equals "1" "$count" "count_batch_tickets returns 1 for single ticket"

  # Create multi-ticket batch
  echo "API-001
API-002" > "$TEST_DIR/batches/API.batch"

  assert_false 'is_single_ticket_component "$TEST_DIR/batches/API.batch"' \
    "is_single_ticket_component returns false for 2 tickets"

  count=$(count_batch_tickets "$TEST_DIR/batches/API.batch")
  assert_equals "2" "$count" "count_batch_tickets returns 2"

  teardown
}

# ============================================================================
# EMPTY COMPONENT HANDLING TESTS
# ============================================================================

test_empty_component_handling() {
  echo ""
  echo "=== Empty Component Handling Tests ==="

  setup

  # Create empty batch file
  touch "$TEST_DIR/batches/EMPTY.batch"

  assert_true 'is_batch_empty "$TEST_DIR/batches/EMPTY.batch"' \
    "is_batch_empty returns true for empty file"

  assert_true 'should_skip_component "$TEST_DIR/batches/EMPTY.batch"' \
    "should_skip_component returns true for empty batch"

  local count
  count=$(count_batch_tickets "$TEST_DIR/batches/EMPTY.batch")
  assert_equals "0" "$count" "count_batch_tickets returns 0 for empty file"

  # Non-existent file
  assert_true 'is_batch_empty "$TEST_DIR/batches/NONEXISTENT.batch"' \
    "is_batch_empty returns true for non-existent file"

  assert_true 'should_skip_component "$TEST_DIR/batches/NONEXISTENT.batch"' \
    "should_skip_component returns true for non-existent file"

  count=$(count_batch_tickets "$TEST_DIR/batches/NONEXISTENT.batch")
  assert_equals "0" "$count" "count_batch_tickets returns 0 for non-existent file"

  # Non-empty file
  echo "AUTH-001" > "$TEST_DIR/batches/AUTH.batch"

  assert_false 'is_batch_empty "$TEST_DIR/batches/AUTH.batch"' \
    "is_batch_empty returns false for non-empty file"

  assert_false 'should_skip_component "$TEST_DIR/batches/AUTH.batch"' \
    "should_skip_component returns false for non-empty batch"

  teardown
}

# ============================================================================
# TICKET ID VALIDATION TESTS
# ============================================================================

test_validate_ticket_id() {
  echo ""
  echo "=== Ticket ID Validation Tests ==="

  assert_true 'validate_ticket_id "AUTH-001"' "validate_ticket_id AUTH-001 (valid)"
  assert_true 'validate_ticket_id "API-123"' "validate_ticket_id API-123 (valid)"
  assert_true 'validate_ticket_id "UI-1"' "validate_ticket_id UI-1 (valid, single digit)"
  assert_true 'validate_ticket_id "A-1"' "validate_ticket_id A-1 (valid, single char)"
  assert_true 'validate_ticket_id "STREAM-014"' "validate_ticket_id STREAM-014 (valid)"
  assert_true 'validate_ticket_id "abc-999"' "validate_ticket_id abc-999 (valid, lowercase)"
  assert_true 'validate_ticket_id "Auth123-456"' "validate_ticket_id Auth123-456 (valid, mixed)"

  assert_false 'validate_ticket_id "AUTH"' "validate_ticket_id AUTH (missing number)"
  assert_false 'validate_ticket_id "001"' "validate_ticket_id 001 (missing prefix)"
  assert_false 'validate_ticket_id "AUTH-"' "validate_ticket_id AUTH- (missing number)"
  assert_false 'validate_ticket_id "-001"' "validate_ticket_id -001 (missing prefix)"
  assert_false 'validate_ticket_id "AUTH_001"' "validate_ticket_id AUTH_001 (underscore)"
  assert_false 'validate_ticket_id ""' "validate_ticket_id empty string"
}

# ============================================================================
# SLUG GENERATION TESTS
# ============================================================================

test_generate_component_slug() {
  echo ""
  echo "=== Slug Generation Tests ==="

  local result

  result=$(generate_component_slug "Authentication Service")
  assert_equals "authentication-service" "$result" "generate_component_slug spaces to dashes"

  result=$(generate_component_slug "API Gateway")
  assert_equals "api-gateway" "$result" "generate_component_slug uppercase to lowercase"

  result=$(generate_component_slug "User-Interface")
  assert_equals "user-interface" "$result" "generate_component_slug already has dashes"

  result=$(generate_component_slug "AUTH")
  assert_equals "auth" "$result" "generate_component_slug simple uppercase"

  result=$(generate_component_slug "My_Special_Component!")
  assert_equals "my-special-component" "$result" "generate_component_slug special chars"

  result=$(generate_component_slug "  Leading and Trailing  ")
  assert_equals "leading-and-trailing" "$result" "generate_component_slug trims spaces"

  result=$(generate_component_slug "Multiple---Dashes")
  assert_equals "multiple-dashes" "$result" "generate_component_slug collapses dashes"
}

# ============================================================================
# COMPONENT STATISTICS TESTS
# ============================================================================

test_get_component_stats() {
  echo ""
  echo "=== Component Statistics Tests ==="

  setup

  # Create multiple batch files
  echo "AUTH-001
AUTH-002
AUTH-003" > "$TEST_DIR/batches/AUTH.batch"

  echo "API-001
API-002" > "$TEST_DIR/batches/API.batch"

  echo "UI-001" > "$TEST_DIR/batches/UI.batch"

  local stats
  stats=$(get_component_stats "$TEST_DIR/batches")

  assert_true 'echo "$stats" | grep -q "AUTH:3"' "AUTH has 3 tickets"
  assert_true 'echo "$stats" | grep -q "API:2"' "API has 2 tickets"
  assert_true 'echo "$stats" | grep -q "UI:1"' "UI has 1 ticket"

  local line_count
  line_count=$(echo "$stats" | wc -l | tr -d ' ')
  assert_equals "3" "$line_count" "3 components in stats"

  teardown
}

# ============================================================================
# JSON FILTERING TESTS
# ============================================================================

test_filter_unprocessed_stories() {
  echo ""
  echo "=== JSON Filtering Tests ==="

  local tickets='[
    {"id": "AUTH-001", "state": "UNPROCESSED", "type": "story"},
    {"id": "AUTH-002", "state": "COMPLETED", "type": "story"},
    {"id": "AUTH-003", "state": "UNPROCESSED", "type": "feature"},
    {"id": "AUTH-004", "state": "UNPROCESSED", "type": "bug"},
    {"id": "AUTH-005", "state": "IN_PROGRESS", "type": "story"}
  ]'

  local filtered
  filtered=$(filter_unprocessed_stories "$tickets")

  local count
  count=$(echo "$filtered" | jq '. | length')
  assert_equals "2" "$count" "filter_unprocessed_stories returns 2 (story/feature only)"

  assert_true 'echo "$filtered" | jq -e ".[] | select(.id == \"AUTH-001\")" > /dev/null' \
    "AUTH-001 (UNPROCESSED story) included"

  assert_true 'echo "$filtered" | jq -e ".[] | select(.id == \"AUTH-003\")" > /dev/null' \
    "AUTH-003 (UNPROCESSED feature) included"

  assert_false 'echo "$filtered" | jq -e ".[] | select(.id == \"AUTH-002\")" > /dev/null 2>&1' \
    "AUTH-002 (COMPLETED) excluded"

  assert_false 'echo "$filtered" | jq -e ".[] | select(.id == \"AUTH-004\")" > /dev/null 2>&1' \
    "AUTH-004 (bug type) excluded"
}

test_group_tickets_by_prefix() {
  echo ""
  echo "=== Group Tickets by Prefix Tests ==="

  local tickets='[
    {"id": "AUTH-001", "state": "UNPROCESSED", "type": "story"},
    {"id": "AUTH-002", "state": "UNPROCESSED", "type": "feature"},
    {"id": "API-001", "state": "UNPROCESSED", "type": "story"},
    {"id": "AUTH-003", "state": "COMPLETED", "type": "story"}
  ]'

  local auth_tickets
  auth_tickets=$(group_tickets_by_prefix "$tickets" "AUTH")

  local count
  count=$(echo "$auth_tickets" | grep -c "AUTH" || echo "0")
  assert_equals "2" "$count" "2 UNPROCESSED AUTH tickets"

  assert_true 'echo "$auth_tickets" | grep -q "AUTH-001"' "AUTH-001 included"
  assert_true 'echo "$auth_tickets" | grep -q "AUTH-002"' "AUTH-002 included"
  assert_false 'echo "$auth_tickets" | grep -q "AUTH-003"' "AUTH-003 (COMPLETED) excluded"

  local api_tickets
  api_tickets=$(group_tickets_by_prefix "$tickets" "API")
  count=$(echo "$api_tickets" | grep -c "API" || echo "0")
  assert_equals "1" "$count" "1 UNPROCESSED API ticket"
}

# ============================================================================
# EDGE CASE TESTS
# ============================================================================

test_edge_cases() {
  echo ""
  echo "=== Edge Case Tests ==="

  setup

  # Very long ticket ID
  local long_prefix="VERYLONGCOMPONENTNAME"
  result=$(extract_component_prefix "${long_prefix}-001")
  assert_equals "$long_prefix" "$result" "extract_component_prefix handles long prefix"

  # Numeric ticket numbers
  result=$(extract_component_prefix "AUTH-99999")
  assert_equals "AUTH" "$result" "extract_component_prefix handles large numbers"

  # Empty batch directory
  local empty_stats
  empty_stats=$(get_component_stats "$TEST_DIR/empty-batches")
  assert_equals "" "$empty_stats" "get_component_stats returns empty for empty dir"

  # Create batch file with missing inputs should fail
  assert_false 'create_batch_file_atomic "" "AUTH" "AUTH-001"' \
    "create_batch_file_atomic fails with empty dir"

  assert_false 'create_batch_file_atomic "$TEST_DIR/batches" "" "AUTH-001"' \
    "create_batch_file_atomic fails with empty component"

  assert_false 'create_batch_file_atomic "$TEST_DIR/batches" "AUTH" ""' \
    "create_batch_file_atomic fails with empty ticket list"

  teardown
}

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

run_tests() {
  echo "================================================"
  echo "  STREAM-011: Unit Test Suite"
  echo "  Testing: .sage/lib/stream-functions.sh"
  echo "================================================"

  # Run all test suites
  test_extract_component_prefix
  test_is_standard_prefix
  test_misc_grouping
  test_create_batch_file_atomic
  test_batch_file_validation
  test_batch_file_cleanup
  test_single_ticket_component
  test_empty_component_handling
  test_validate_ticket_id
  test_generate_component_slug
  test_get_component_stats
  test_filter_unprocessed_stories
  test_group_tickets_by_prefix
  test_edge_cases

  # Summary
  echo ""
  echo "================================================"
  echo "  TEST SUMMARY"
  echo "================================================"
  echo ""
  echo -e "Total Tests: ${YELLOW}$TOTAL${NC}"
  echo -e "Passed:      ${GREEN}$PASSED${NC}"
  echo -e "Failed:      ${RED}$FAILED${NC}"

  local coverage
  coverage=$(awk "BEGIN {printf \"%.1f\", ($PASSED / $TOTAL) * 100}")
  echo -e "Coverage:    ${YELLOW}${coverage}%${NC}"

  if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
  else
    echo ""
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
  fi
}

# Run tests
run_tests
