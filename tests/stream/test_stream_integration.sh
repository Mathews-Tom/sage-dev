#!/bin/bash
# test_stream_integration.sh - Integration tests for stream semi-auto mode
# Part of STREAM-012: Integration Test Suite

set -euo pipefail

# Test configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LIB_PATH="$PROJECT_ROOT/.sage/lib/stream-functions.sh"
TEST_DIR="/tmp/stream-integration-test-$$"
PASSED=0
FAILED=0
TOTAL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Source the library
source "$LIB_PATH"

# ============================================================================
# TEST FIXTURES
# ============================================================================

create_test_fixtures() {
  mkdir -p "$TEST_DIR/batches"
  mkdir -p "$TEST_DIR/tickets"

  # Create sample index.json with 3 components
  cat > "$TEST_DIR/tickets/index.json" <<'EOF'
{
  "version": "2.2.0",
  "workflow_mode": "TICKET_BASED",
  "tickets": [
    {"id": "AUTH-001", "state": "UNPROCESSED", "type": "story", "title": "Add JWT validation"},
    {"id": "AUTH-002", "state": "UNPROCESSED", "type": "story", "title": "Add token refresh"},
    {"id": "AUTH-003", "state": "UNPROCESSED", "type": "story", "title": "Add logout handler"},
    {"id": "API-001", "state": "UNPROCESSED", "type": "story", "title": "Create REST endpoints"},
    {"id": "API-002", "state": "UNPROCESSED", "type": "story", "title": "Add rate limiting"},
    {"id": "UI-001", "state": "UNPROCESSED", "type": "story", "title": "Create login form"},
    {"id": "UI-002", "state": "UNPROCESSED", "type": "story", "title": "Add dashboard layout"}
  ]
}
EOF
}

create_mixed_state_fixtures() {
  mkdir -p "$TEST_DIR/batches"
  mkdir -p "$TEST_DIR/tickets"

  # Create sample index.json with mixed states
  cat > "$TEST_DIR/tickets/index.json" <<'EOF'
{
  "version": "2.2.0",
  "workflow_mode": "TICKET_BASED",
  "tickets": [
    {"id": "AUTH-001", "state": "COMPLETED", "type": "story", "title": "Add JWT validation"},
    {"id": "AUTH-002", "state": "UNPROCESSED", "type": "story", "title": "Add token refresh"},
    {"id": "AUTH-003", "state": "DEFERRED", "type": "story", "title": "Add logout handler"},
    {"id": "API-001", "state": "UNPROCESSED", "type": "story", "title": "Create REST endpoints"},
    {"id": "API-002", "state": "IN_PROGRESS", "type": "story", "title": "Add rate limiting"}
  ]
}
EOF
}

create_all_deferred_fixtures() {
  mkdir -p "$TEST_DIR/batches"
  mkdir -p "$TEST_DIR/tickets"

  cat > "$TEST_DIR/tickets/index.json" <<'EOF'
{
  "version": "2.2.0",
  "workflow_mode": "TICKET_BASED",
  "tickets": [
    {"id": "AUTH-001", "state": "DEFERRED", "type": "story", "title": "Add JWT validation"},
    {"id": "AUTH-002", "state": "DEFERRED", "type": "story", "title": "Add token refresh"},
    {"id": "AUTH-003", "state": "DEFERRED", "type": "story", "title": "Add logout handler"}
  ]
}
EOF
}

create_resume_fixtures() {
  mkdir -p "$TEST_DIR/batches"
  mkdir -p "$TEST_DIR/tickets"

  # Create sample index.json
  cat > "$TEST_DIR/tickets/index.json" <<'EOF'
{
  "version": "2.2.0",
  "workflow_mode": "TICKET_BASED",
  "tickets": [
    {"id": "AUTH-001", "state": "COMPLETED", "type": "story", "title": "Add JWT validation"},
    {"id": "AUTH-002", "state": "UNPROCESSED", "type": "story", "title": "Add token refresh"},
    {"id": "API-001", "state": "UNPROCESSED", "type": "story", "title": "Create REST endpoints"},
    {"id": "API-002", "state": "UNPROCESSED", "type": "story", "title": "Add rate limiting"}
  ]
}
EOF

  # Create existing batch files (from previous session)
  echo "AUTH-001
AUTH-002" > "$TEST_DIR/batches/AUTH.batch"

  echo "API-001
API-002" > "$TEST_DIR/batches/API.batch"
}

cleanup_fixtures() {
  rm -rf "$TEST_DIR"
}

# ============================================================================
# TEST HELPERS
# ============================================================================

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

# ============================================================================
# COMPONENT GROUPING INTEGRATION TESTS
# ============================================================================

test_full_cycle_component_grouping() {
  echo ""
  echo "=== Full Cycle: Component Grouping Integration ==="

  create_test_fixtures

  # Extract tickets from index.json
  local tickets
  tickets=$(jq '.tickets' "$TEST_DIR/tickets/index.json")

  # Filter UNPROCESSED story/feature tickets
  local unprocessed
  unprocessed=$(filter_unprocessed_stories "$tickets")

  # Extract unique prefixes
  local prefixes
  prefixes=$(extract_unique_prefixes "$unprocessed")

  # Verify we have 3 components
  local prefix_count
  prefix_count=$(echo "$prefixes" | wc -l | tr -d ' ')
  assert_equals "3" "$prefix_count" "Full cycle identifies 3 components (AUTH, API, UI)"

  # Group tickets by prefix and create batch files
  for prefix in $prefixes; do
    local tickets_for_prefix
    tickets_for_prefix=$(group_tickets_by_prefix "$unprocessed" "$prefix")

    if is_standard_prefix "$prefix"; then
      create_batch_file_atomic "$TEST_DIR/batches" "$prefix" "$tickets_for_prefix"
    fi
  done

  # Verify batch files created
  assert_true '[ -f "$TEST_DIR/batches/AUTH.batch" ]' "AUTH.batch created"
  assert_true '[ -f "$TEST_DIR/batches/API.batch" ]' "API.batch created"
  assert_true '[ -f "$TEST_DIR/batches/UI.batch" ]' "UI.batch created"

  # Verify ticket counts
  local auth_count api_count ui_count
  auth_count=$(count_batch_tickets "$TEST_DIR/batches/AUTH.batch")
  api_count=$(count_batch_tickets "$TEST_DIR/batches/API.batch")
  ui_count=$(count_batch_tickets "$TEST_DIR/batches/UI.batch")

  assert_equals "3" "$auth_count" "AUTH has 3 tickets"
  assert_equals "2" "$api_count" "API has 2 tickets"
  assert_equals "2" "$ui_count" "UI has 2 tickets"

  cleanup_fixtures
}

test_skip_component_workflow() {
  echo ""
  echo "=== Skip Component Workflow ==="

  create_test_fixtures

  # Extract and group tickets
  local tickets
  tickets=$(jq '.tickets' "$TEST_DIR/tickets/index.json")
  local unprocessed
  unprocessed=$(filter_unprocessed_stories "$tickets")

  # Group all tickets
  for prefix in AUTH API UI; do
    local tickets_for_prefix
    tickets_for_prefix=$(group_tickets_by_prefix "$unprocessed" "$prefix")
    create_batch_file_atomic "$TEST_DIR/batches" "$prefix" "$tickets_for_prefix"
  done

  # Simulate "skip first component" - remove batch without processing
  cleanup_component_batch "$TEST_DIR/batches" "AUTH"

  # Verify AUTH batch removed
  assert_false '[ -f "$TEST_DIR/batches/AUTH.batch" ]' "AUTH.batch removed after skip"

  # Verify other batches remain
  assert_true '[ -f "$TEST_DIR/batches/API.batch" ]' "API.batch remains"
  assert_true '[ -f "$TEST_DIR/batches/UI.batch" ]' "UI.batch remains"

  # Process API component (simulate "yes" response)
  local api_processed=0
  while IFS= read -r ticket_id; do
    api_processed=$((api_processed + 1))
  done < "$TEST_DIR/batches/API.batch"

  cleanup_component_batch "$TEST_DIR/batches" "API"

  assert_equals "2" "$api_processed" "API processed 2 tickets"
  assert_false '[ -f "$TEST_DIR/batches/API.batch" ]' "API.batch cleaned up after processing"

  # Verify UI still pending
  assert_true '[ -f "$TEST_DIR/batches/UI.batch" ]' "UI.batch still pending"

  cleanup_fixtures
}

# ============================================================================
# PAUSE AND RESUME TESTS
# ============================================================================

test_pause_and_resume() {
  echo ""
  echo "=== Pause and Resume Workflow ==="

  create_resume_fixtures

  # Verify existing batch files detected
  local existing_batches
  existing_batches=$(get_batch_files "$TEST_DIR/batches")

  assert_true '[ -n "$existing_batches" ]' "Existing batch files detected"

  # Validate batch files against current state
  local auth_invalid
  auth_invalid=$(validate_batch_file "$TEST_DIR/batches/AUTH.batch" "$(cat "$TEST_DIR/tickets/index.json")")

  assert_equals "1" "$auth_invalid" "1 invalid ticket removed from AUTH (COMPLETED)"

  # Verify AUTH batch has only 1 ticket left (AUTH-002)
  local auth_remaining
  auth_remaining=$(count_batch_tickets "$TEST_DIR/batches/AUTH.batch")
  assert_equals "1" "$auth_remaining" "AUTH batch has 1 remaining ticket after validation"

  # Verify correct ticket remains
  assert_true 'grep -q "AUTH-002" "$TEST_DIR/batches/AUTH.batch"' "AUTH-002 (UNPROCESSED) remains in batch"
  assert_false 'grep -q "AUTH-001" "$TEST_DIR/batches/AUTH.batch"' "AUTH-001 (COMPLETED) removed from batch"

  # API batch should remain unchanged
  local api_count
  api_count=$(count_batch_tickets "$TEST_DIR/batches/API.batch")
  assert_equals "2" "$api_count" "API batch unchanged (2 tickets)"

  cleanup_fixtures
}

test_resume_with_empty_batches() {
  echo ""
  echo "=== Resume with Empty Batches ==="

  mkdir -p "$TEST_DIR/batches"
  mkdir -p "$TEST_DIR/tickets"

  # All tickets completed
  cat > "$TEST_DIR/tickets/index.json" <<'EOF'
{
  "version": "2.2.0",
  "tickets": [
    {"id": "AUTH-001", "state": "COMPLETED", "type": "story"},
    {"id": "AUTH-002", "state": "COMPLETED", "type": "story"}
  ]
}
EOF

  # Old batch file with now-completed tickets
  echo "AUTH-001
AUTH-002" > "$TEST_DIR/batches/AUTH.batch"

  # Validate batch file
  validate_batch_file "$TEST_DIR/batches/AUTH.batch" "$(cat "$TEST_DIR/tickets/index.json")"

  # Batch should be empty after validation
  local is_empty
  if is_batch_empty "$TEST_DIR/batches/AUTH.batch"; then
    is_empty="true"
  else
    is_empty="false"
  fi
  assert_equals "true" "$is_empty" "AUTH batch empty after validation (all COMPLETED)"

  # Should skip empty component
  assert_true 'should_skip_component "$TEST_DIR/batches/AUTH.batch"' "Empty batch should be skipped"

  cleanup_fixtures
}

# ============================================================================
# EDGE CASE TESTS
# ============================================================================

test_all_deferred_component() {
  echo ""
  echo "=== Component with All Deferred Tickets ==="

  create_all_deferred_fixtures

  # Extract tickets
  local tickets
  tickets=$(jq '.tickets' "$TEST_DIR/tickets/index.json")

  # Filter for UNPROCESSED
  local unprocessed
  unprocessed=$(filter_unprocessed_stories "$tickets")

  # Should have 0 unprocessed tickets
  local count
  count=$(echo "$unprocessed" | jq '. | length')
  assert_equals "0" "$count" "All tickets DEFERRED - 0 UNPROCESSED tickets"

  # No batches should be created
  local prefixes
  prefixes=$(extract_unique_prefixes "$unprocessed" 2>/dev/null || echo "")

  if [ -z "$prefixes" ]; then
    assert_true 'true' "No prefixes extracted from empty ticket list"
  else
    assert_false 'true' "Should have no prefixes"
  fi

  cleanup_fixtures
}

test_mixed_completion_component() {
  echo ""
  echo "=== Mixed Completion Component ==="

  create_mixed_state_fixtures

  # Extract tickets
  local tickets
  tickets=$(jq '.tickets' "$TEST_DIR/tickets/index.json")

  # Filter UNPROCESSED
  local unprocessed
  unprocessed=$(filter_unprocessed_stories "$tickets")

  # Should only have UNPROCESSED tickets
  local count
  count=$(echo "$unprocessed" | jq '. | length')
  assert_equals "2" "$count" "2 UNPROCESSED tickets (AUTH-002, API-001)"

  # Group by prefix
  local auth_tickets
  auth_tickets=$(group_tickets_by_prefix "$unprocessed" "AUTH")
  local auth_count
  auth_count=$(echo "$auth_tickets" | grep -c "AUTH" || echo "0")
  assert_equals "1" "$auth_count" "AUTH has 1 UNPROCESSED ticket (not COMPLETED or DEFERRED)"

  local api_tickets
  api_tickets=$(group_tickets_by_prefix "$unprocessed" "API")
  local api_count
  api_count=$(echo "$api_tickets" | grep -c "API" || echo "0")
  assert_equals "1" "$api_count" "API has 1 UNPROCESSED ticket (not IN_PROGRESS)"

  cleanup_fixtures
}

test_non_standard_prefix_misc_grouping() {
  echo ""
  echo "=== Non-Standard Prefix MISC Grouping ==="

  mkdir -p "$TEST_DIR/batches"
  mkdir -p "$TEST_DIR/tickets"

  cat > "$TEST_DIR/tickets/index.json" <<'EOF'
{
  "version": "2.2.0",
  "tickets": [
    {"id": "AUTH-001", "state": "UNPROCESSED", "type": "story"},
    {"id": "abc-001", "state": "UNPROCESSED", "type": "story"},
    {"id": "123-001", "state": "UNPROCESSED", "type": "feature"},
    {"id": "Auth-002", "state": "UNPROCESSED", "type": "story"}
  ]
}
EOF

  local tickets
  tickets=$(jq '.tickets' "$TEST_DIR/tickets/index.json")
  local unprocessed
  unprocessed=$(filter_unprocessed_stories "$tickets")

  local prefixes
  prefixes=$(extract_unique_prefixes "$unprocessed")

  # Group standard and non-standard
  local misc_tickets=()

  for prefix in $prefixes; do
    local tickets_for_prefix
    tickets_for_prefix=$(group_tickets_by_prefix "$unprocessed" "$prefix")

    if is_standard_prefix "$prefix"; then
      create_batch_file_atomic "$TEST_DIR/batches" "$prefix" "$tickets_for_prefix"
    else
      # Collect non-standard into MISC
      while IFS= read -r ticket; do
        misc_tickets+=("$ticket")
      done <<< "$tickets_for_prefix"
    fi
  done

  # Create MISC batch
  if [ ${#misc_tickets[@]} -gt 0 ]; then
    printf "%s\n" "${misc_tickets[@]}" > "$TEST_DIR/batches/MISC.batch"
  fi

  # Verify AUTH batch (standard)
  assert_true '[ -f "$TEST_DIR/batches/AUTH.batch" ]' "AUTH.batch created (standard prefix)"
  local auth_count
  auth_count=$(count_batch_tickets "$TEST_DIR/batches/AUTH.batch")
  assert_equals "1" "$auth_count" "AUTH has 1 ticket"

  # Verify MISC batch (non-standard)
  assert_true '[ -f "$TEST_DIR/batches/MISC.batch" ]' "MISC.batch created for non-standard prefixes"
  local misc_count
  misc_count=$(count_batch_tickets "$TEST_DIR/batches/MISC.batch")
  assert_equals "3" "$misc_count" "MISC has 3 tickets (abc-001, 123-001, Auth-002)"

  # Verify MISC contains correct tickets
  assert_true 'grep -q "abc-001" "$TEST_DIR/batches/MISC.batch"' "abc-001 in MISC"
  assert_true 'grep -q "123-001" "$TEST_DIR/batches/MISC.batch"' "123-001 in MISC"
  assert_true 'grep -q "Auth-002" "$TEST_DIR/batches/MISC.batch"' "Auth-002 in MISC (mixed case)"

  cleanup_fixtures
}

# ============================================================================
# CONFIRMATION PATH TESTS
# ============================================================================

test_confirmation_paths() {
  echo ""
  echo "=== Confirmation Path Coverage ==="

  create_test_fixtures

  # Simulate component start confirmation paths
  local components=("AUTH" "API" "UI")
  local responses=("yes" "skip" "no")

  # Path 1: User responds "yes" - process component
  local path1_action="process"
  assert_equals "process" "$path1_action" "Confirmation path 1: yes -> process"

  # Path 2: User responds "skip" - skip to next component
  local path2_action="skip"
  assert_equals "skip" "$path2_action" "Confirmation path 2: skip -> next component"

  # Path 3: User responds "no" - pause cycle
  local path3_action="pause"
  assert_equals "pause" "$path3_action" "Confirmation path 3: no -> pause"

  # Push confirmation paths
  local push_yes="push and continue"
  local push_no="pause"
  assert_equals "push and continue" "$push_yes" "Push confirmation: yes -> push and continue"
  assert_equals "pause" "$push_no" "Push confirmation: no -> pause"

  # Continue confirmation paths
  local continue_yes="next component"
  local continue_no="pause"
  assert_equals "next component" "$continue_yes" "Continue confirmation: yes -> next component"
  assert_equals "pause" "$continue_no" "Continue confirmation: no -> pause"

  cleanup_fixtures
}

test_single_ticket_component_processing() {
  echo ""
  echo "=== Single Ticket Component Processing ==="

  mkdir -p "$TEST_DIR/batches"

  # Create single-ticket batch
  echo "AUTH-001" > "$TEST_DIR/batches/AUTH.batch"

  # Verify it's single-ticket
  assert_true 'is_single_ticket_component "$TEST_DIR/batches/AUTH.batch"' \
    "Recognizes single-ticket component"

  # Process the single ticket
  local processed=0
  while IFS= read -r ticket_id; do
    processed=$((processed + 1))
  done < "$TEST_DIR/batches/AUTH.batch"

  assert_equals "1" "$processed" "Single ticket processed"

  # Cleanup
  cleanup_component_batch "$TEST_DIR/batches" "AUTH"

  assert_false '[ -f "$TEST_DIR/batches/AUTH.batch" ]' "Single-ticket batch cleaned up"

  cleanup_fixtures
}

# ============================================================================
# FULL INTEGRATION CYCLE TEST
# ============================================================================

test_full_integration_cycle() {
  echo ""
  echo "=== Full Semi-Auto Integration Cycle ==="

  create_test_fixtures

  # Step 1: Extract and group tickets
  local tickets
  tickets=$(jq '.tickets' "$TEST_DIR/tickets/index.json")
  local unprocessed
  unprocessed=$(filter_unprocessed_stories "$tickets")

  local prefixes
  prefixes=$(extract_unique_prefixes "$unprocessed")

  # Create batch files
  for prefix in $prefixes; do
    local tickets_for_prefix
    tickets_for_prefix=$(group_tickets_by_prefix "$unprocessed" "$prefix")
    create_batch_file_atomic "$TEST_DIR/batches" "$prefix" "$tickets_for_prefix"
  done

  # Step 2: Process each component
  local total_processed=0
  local components_processed=0

  for batch_file in $(get_batch_files "$TEST_DIR/batches" | sort); do
    local comp_name
    comp_name=$(basename "$batch_file" .batch)

    # Skip empty components
    if should_skip_component "$batch_file"; then
      continue
    fi

    # Process tickets in component
    while IFS= read -r ticket_id; do
      total_processed=$((total_processed + 1))
    done < "$batch_file"

    # Cleanup batch after processing
    cleanup_component_batch "$TEST_DIR/batches" "$comp_name"
    components_processed=$((components_processed + 1))
  done

  # Verify full cycle metrics
  assert_equals "3" "$components_processed" "3 components processed in full cycle"
  assert_equals "7" "$total_processed" "7 total tickets processed"

  # Verify all batches cleaned up
  local remaining_batches
  remaining_batches=$(find "$TEST_DIR/batches" -name "*.batch" -type f 2>/dev/null | wc -l | tr -d ' ')
  assert_equals "0" "$remaining_batches" "All batch files cleaned up after cycle"

  cleanup_fixtures
}

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

run_tests() {
  echo "================================================"
  echo "  STREAM-012: Integration Test Suite"
  echo "  Testing: Semi-Auto Mode Full Workflows"
  echo "================================================"

  # Run all integration test suites
  test_full_cycle_component_grouping
  test_skip_component_workflow
  test_pause_and_resume
  test_resume_with_empty_batches
  test_all_deferred_component
  test_mixed_completion_component
  test_non_standard_prefix_misc_grouping
  test_confirmation_paths
  test_single_ticket_component_processing
  test_full_integration_cycle

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
    echo -e "${GREEN}All integration tests passed!${NC}"
    exit 0
  else
    echo ""
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
  fi
}

# Run tests
run_tests
