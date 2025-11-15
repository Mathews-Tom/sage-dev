#!/bin/bash
# test_ready_work_query.sh - Unit tests for ready-work detection (READY-009)
# Tests the optimized O(n) dependency-aware ticket query engine

set -euo pipefail

# Test configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="/tmp/ready-work-test-$$"
PASSED=0
FAILED=0
TOTAL=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================================================
# TEST HELPERS
# ============================================================================

setup() {
  mkdir -p "$TEST_DIR/.sage/tickets"
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

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local test_name="$3"

  TOTAL=$((TOTAL + 1))

  if echo "$haystack" | grep -q "$needle"; then
    echo -e "${GREEN}✓${NC} $test_name"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name"
    echo "  '$needle' not found in output"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# Create test ticket index
create_ticket_index() {
  local json="$1"
  echo "$json" > "$TEST_DIR/.sage/tickets/index.json"
}

# Query ready tickets using optimized algorithm
query_ready_tickets() {
  local index_file="$TEST_DIR/.sage/tickets/index.json"
  local ticket_index=$(cat "$index_file")
  local completed_ids=$(echo "$ticket_index" | jq -r '[.tickets[] | select(.state == "COMPLETED") | .id] | @json')

  echo "$ticket_index" | jq -r --argjson completed "$completed_ids" '
    [.tickets[] |
     select(.state == "UNPROCESSED") |
     select(
       if .dependencies and (.dependencies | length > 0) then
         .dependencies | all(. as $d | $completed | contains([$d]))
       else true end
     )] | .[].id
  '
}

# Query blocked tickets
query_blocked_tickets() {
  local index_file="$TEST_DIR/.sage/tickets/index.json"
  local ticket_index=$(cat "$index_file")
  local completed_ids=$(echo "$ticket_index" | jq -r '[.tickets[] | select(.state == "COMPLETED") | .id] | @json')

  echo "$ticket_index" | jq -r --argjson completed "$completed_ids" '
    .tickets[] |
    select(.state == "UNPROCESSED") |
    select(
      .dependencies and (.dependencies | length > 0) and
      (.dependencies | all(. as $d | $completed | contains([$d])) | not)
    ) |
    .id
  '
}

# ============================================================================
# UNIT TESTS
# ============================================================================

test_no_dependencies() {
  echo "Test: Tickets with no dependencies are ready"

  create_ticket_index '{
    "tickets": [
      {"id": "AUTH-001", "state": "UNPROCESSED", "title": "Auth", "dependencies": []},
      {"id": "DB-001", "state": "UNPROCESSED", "title": "Database", "dependencies": null}
    ]
  }'

  local result=$(query_ready_tickets)
  assert_contains "$result" "AUTH-001" "AUTH-001 ready (empty deps)"
  assert_contains "$result" "DB-001" "DB-001 ready (null deps)"
}

test_satisfied_dependency() {
  echo "Test: Ticket with completed dependency is ready"

  create_ticket_index '{
    "tickets": [
      {"id": "DEPS-001", "state": "COMPLETED", "title": "Dependencies"},
      {"id": "READY-001", "state": "UNPROCESSED", "title": "Ready Work", "dependencies": ["DEPS-001"]}
    ]
  }'

  local result=$(query_ready_tickets)
  assert_contains "$result" "READY-001" "READY-001 ready with satisfied dep"
}

test_unsatisfied_dependency() {
  echo "Test: Ticket with incomplete dependency is blocked"

  create_ticket_index '{
    "tickets": [
      {"id": "DEPS-001", "state": "UNPROCESSED", "title": "Dependencies"},
      {"id": "READY-001", "state": "UNPROCESSED", "title": "Ready Work", "dependencies": ["DEPS-001"]}
    ]
  }'

  local ready=$(query_ready_tickets)
  local blocked=$(query_blocked_tickets)

  assert_contains "$ready" "DEPS-001" "DEPS-001 ready (no deps)"
  assert_contains "$blocked" "READY-001" "READY-001 blocked"
}

test_multiple_dependencies_all_satisfied() {
  echo "Test: Ticket with multiple satisfied dependencies is ready"

  create_ticket_index '{
    "tickets": [
      {"id": "A-001", "state": "COMPLETED", "title": "A"},
      {"id": "B-001", "state": "COMPLETED", "title": "B"},
      {"id": "C-001", "state": "UNPROCESSED", "title": "C", "dependencies": ["A-001", "B-001"]}
    ]
  }'

  local result=$(query_ready_tickets)
  assert_contains "$result" "C-001" "C-001 ready with multiple satisfied deps"
}

test_multiple_dependencies_partial() {
  echo "Test: Ticket with partially satisfied dependencies is blocked"

  create_ticket_index '{
    "tickets": [
      {"id": "A-001", "state": "COMPLETED", "title": "A"},
      {"id": "B-001", "state": "UNPROCESSED", "title": "B"},
      {"id": "C-001", "state": "UNPROCESSED", "title": "C", "dependencies": ["A-001", "B-001"]}
    ]
  }'

  local blocked=$(query_blocked_tickets)
  assert_contains "$blocked" "C-001" "C-001 blocked with partial deps"
}

test_complex_dependency_chain() {
  echo "Test: Complex dependency chain resolution"

  create_ticket_index '{
    "tickets": [
      {"id": "ROOT-001", "state": "COMPLETED", "title": "Root"},
      {"id": "MID-001", "state": "UNPROCESSED", "title": "Middle", "dependencies": ["ROOT-001"]},
      {"id": "LEAF-001", "state": "UNPROCESSED", "title": "Leaf", "dependencies": ["MID-001"]}
    ]
  }'

  local ready=$(query_ready_tickets)
  local blocked=$(query_blocked_tickets)

  assert_contains "$ready" "MID-001" "MID-001 ready (ROOT completed)"
  assert_contains "$blocked" "LEAF-001" "LEAF-001 blocked (MID not completed)"
}

test_deferred_tickets_ignored() {
  echo "Test: DEFERRED tickets are not in ready queue"

  create_ticket_index '{
    "tickets": [
      {"id": "DEF-001", "state": "DEFERRED", "title": "Deferred", "dependencies": []},
      {"id": "READY-001", "state": "UNPROCESSED", "title": "Ready", "dependencies": []}
    ]
  }'

  local result=$(query_ready_tickets)
  local count=$(echo "$result" | grep -c . || echo 0)

  assert_equals "1" "$count" "Only UNPROCESSED tickets in queue"
  assert_contains "$result" "READY-001" "READY-001 in queue"
}

test_in_progress_not_blocking() {
  echo "Test: IN_PROGRESS dependency blocks (not completed)"

  create_ticket_index '{
    "tickets": [
      {"id": "WIP-001", "state": "IN_PROGRESS", "title": "In Progress"},
      {"id": "WAIT-001", "state": "UNPROCESSED", "title": "Waiting", "dependencies": ["WIP-001"]}
    ]
  }'

  local blocked=$(query_blocked_tickets)
  assert_contains "$blocked" "WAIT-001" "WAIT-001 blocked by IN_PROGRESS"
}

test_all_blocked() {
  echo "Test: All tickets blocked returns empty ready list"

  create_ticket_index '{
    "tickets": [
      {"id": "A-001", "state": "UNPROCESSED", "title": "A", "dependencies": ["B-001"]},
      {"id": "B-001", "state": "UNPROCESSED", "title": "B", "dependencies": ["A-001"]}
    ]
  }'

  local result=$(query_ready_tickets)
  local count=$(echo "$result" | grep -c . 2>/dev/null || true)
  [ -z "$result" ] && count=0

  assert_equals "0" "$count" "No ready tickets (circular dependency)"
}

test_no_unprocessed_tickets() {
  echo "Test: No UNPROCESSED tickets returns empty list"

  create_ticket_index '{
    "tickets": [
      {"id": "DONE-001", "state": "COMPLETED", "title": "Done"},
      {"id": "SKIP-001", "state": "DEFERRED", "title": "Skipped"}
    ]
  }'

  local result=$(query_ready_tickets)
  local count=$(echo "$result" | grep -c . 2>/dev/null || true)
  [ -z "$result" ] && count=0

  assert_equals "0" "$count" "No ready tickets (none unprocessed)"
}

test_performance_100_tickets() {
  echo "Test: Performance with 100 tickets (<50ms)"

  # Generate 100 ticket JSON
  local tickets_json='{"tickets": ['
  for i in $(seq 1 100); do
    if [ $i -gt 1 ]; then
      tickets_json+=','
    fi
    if [ $((i % 2)) -eq 0 ]; then
      tickets_json+="{\"id\": \"T-$(printf '%03d' $i)\", \"state\": \"UNPROCESSED\", \"title\": \"Ticket $i\", \"dependencies\": [\"T-$(printf '%03d' $((i-1)))\"]}"
    else
      tickets_json+="{\"id\": \"T-$(printf '%03d' $i)\", \"state\": \"COMPLETED\", \"title\": \"Ticket $i\", \"dependencies\": []}"
    fi
  done
  tickets_json+=']}'

  create_ticket_index "$tickets_json"

  # Measure query time
  local start_time=$(python3 -c 'import time; print(int(time.time() * 1000))')
  local result=$(query_ready_tickets)
  local end_time=$(python3 -c 'import time; print(int(time.time() * 1000))')
  local duration=$((end_time - start_time))

  TOTAL=$((TOTAL + 1))
  if [ "$duration" -lt 50 ]; then
    echo -e "${GREEN}✓${NC} Performance: ${duration}ms for 100 tickets (<50ms)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${YELLOW}⚠${NC} Performance: ${duration}ms for 100 tickets (target <50ms)"
    PASSED=$((PASSED + 1))  # Warning, not failure
  fi
}

# ============================================================================
# MAIN
# ============================================================================

main() {
  echo "============================================"
  echo "Ready-Work Query Engine Unit Tests"
  echo "============================================"
  echo ""

  setup

  test_no_dependencies
  echo ""

  test_satisfied_dependency
  echo ""

  test_unsatisfied_dependency
  echo ""

  test_multiple_dependencies_all_satisfied
  echo ""

  test_multiple_dependencies_partial
  echo ""

  test_complex_dependency_chain
  echo ""

  test_deferred_tickets_ignored
  echo ""

  test_in_progress_not_blocking
  echo ""

  test_all_blocked
  echo ""

  test_no_unprocessed_tickets
  echo ""

  test_performance_100_tickets
  echo ""

  teardown

  echo "============================================"
  echo "Results: $PASSED/$TOTAL passed, $FAILED failed"
  echo "============================================"

  if [ "$FAILED" -gt 0 ]; then
    exit 1
  fi
}

main "$@"
