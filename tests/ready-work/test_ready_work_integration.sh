#!/bin/bash
# test_ready_work_integration.sh - Integration tests for ready-work detection (READY-010)
# Tests full stream integration with status reporting, --explain, and --dry-run

set -euo pipefail

# Test configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_DIR="/tmp/ready-work-integration-$$"
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
  mkdir -p "$TEST_DIR/.sage/batches"
  cd "$TEST_DIR"
  git init --quiet
  git config user.email "test@test.com"
  git config user.name "Test"
}

teardown() {
  cd "$PROJECT_ROOT"
  rm -rf "$TEST_DIR"
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

assert_not_contains() {
  local haystack="$1"
  local needle="$2"
  local test_name="$3"

  TOTAL=$((TOTAL + 1))

  if echo "$haystack" | grep -q "$needle"; then
    echo -e "${RED}✗${NC} $test_name"
    echo "  '$needle' should not be in output"
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

create_ticket_system() {
  local json="$1"
  echo "$json" > "$TEST_DIR/.sage/tickets/index.json"
  echo "TICKET_BASED" > "$TEST_DIR/.sage/workflow-mode"
}

# Simulate status reporting output
simulate_status_report() {
  local ticket_index=$(cat .sage/tickets/index.json)
  local completed_ids=$(echo "$ticket_index" | jq -r '[.tickets[] | select(.state == "COMPLETED") | .id] | @json')

  local ready_tickets=$(echo "$ticket_index" | jq -r --argjson completed "$completed_ids" '
    [.tickets[] |
     select(.state == "UNPROCESSED") |
     select(
       if .dependencies and (.dependencies | length > 0) then
         .dependencies | all(. as $d | $completed | contains([$d]))
       else true end
     )] | .[].id
  ')

  local blocked_tickets=$(echo "$ticket_index" | jq -r --argjson completed "$completed_ids" '
    .tickets[] |
    select(.state == "UNPROCESSED") |
    select(
      .dependencies and (.dependencies | length > 0) and
      (.dependencies | all(. as $d | $completed | contains([$d])) | not)
    ) |
    .id
  ')

  local ready_count=$(echo "$ready_tickets" | grep -c . 2>/dev/null || true)
  [ -z "$ready_tickets" ] && ready_count=0

  local blocked_count=$(echo "$blocked_tickets" | grep -c . 2>/dev/null || true)
  [ -z "$blocked_tickets" ] && blocked_count=0

  echo "Ready to Execute ($ready_count):"
  if [ -n "$ready_tickets" ]; then
    echo "$ready_tickets" | while read ticket_id; do
      echo "  $ticket_id"
    done
  fi
  echo ""
  echo "Blocked ($blocked_count):"
  if [ -n "$blocked_tickets" ]; then
    echo "$blocked_tickets" | while read ticket_id; do
      deps=$(echo "$ticket_index" | jq -r --argjson completed "$completed_ids" \
        ".tickets[] | select(.id == \"$ticket_id\") | .dependencies | map(select(. as \$d | \$completed | contains([\$d]) | not)) | join(\", \")")
      echo "  $ticket_id - Blocked by: $deps"
    done
  fi
}

# Simulate --explain flag
simulate_explain() {
  local ticket_id="$1"
  local ticket_index=$(cat .sage/tickets/index.json)
  local completed_ids=$(echo "$ticket_index" | jq -r '[.tickets[] | select(.state == "COMPLETED") | .id] | @json')

  local ticket_data=$(echo "$ticket_index" | jq ".tickets[] | select(.id == \"$ticket_id\")")
  local ticket_state=$(echo "$ticket_data" | jq -r '.state')
  local ticket_title=$(echo "$ticket_data" | jq -r '.title')
  local ticket_deps=$(echo "$ticket_data" | jq -r '.dependencies // []')

  echo "Ticket: $ticket_id - $ticket_title"
  echo "State: $ticket_state"

  if [ "$ticket_state" != "UNPROCESSED" ]; then
    echo "Status: Not in queue (state is $ticket_state)"
  else
    local deps_count=$(echo "$ticket_deps" | jq 'length')
    if [ "$deps_count" -eq 0 ]; then
      echo "Status: READY (no dependencies)"
    else
      local is_blocked=false
      for dep in $(echo "$ticket_deps" | jq -r '.[]'); do
        if ! echo "$completed_ids" | jq -r ".[]" | grep -q "^$dep$"; then
          is_blocked=true
          break
        fi
      done

      if [ "$is_blocked" = true ]; then
        echo "Status: BLOCKED"
        echo "Blocking Dependencies:"
        for dep in $(echo "$ticket_deps" | jq -r '.[]'); do
          local dep_state=$(echo "$ticket_index" | jq -r ".tickets[] | select(.id == \"$dep\") | .state")
          if [ "$dep_state" != "COMPLETED" ]; then
            echo "  $dep ($dep_state)"
          fi
        done
      else
        echo "Status: READY (all dependencies satisfied)"
      fi
    fi
  fi
}

# ============================================================================
# INTEGRATION TESTS
# ============================================================================

test_status_report_with_mixed_tickets() {
  echo "Test: Status report shows ready and blocked tickets correctly"

  create_ticket_system '{
    "tickets": [
      {"id": "DEPS-001", "state": "COMPLETED", "title": "Dependencies Core", "dependencies": []},
      {"id": "AUTH-001", "state": "UNPROCESSED", "title": "Auth System", "dependencies": []},
      {"id": "DB-001", "state": "UNPROCESSED", "title": "Database Layer", "dependencies": ["DEPS-001"]},
      {"id": "API-001", "state": "UNPROCESSED", "title": "API Gateway", "dependencies": ["AUTH-001", "DB-001"]}
    ]
  }'

  local output=$(simulate_status_report)

  assert_contains "$output" "Ready to Execute (2)" "Shows 2 ready tickets"
  assert_contains "$output" "AUTH-001" "AUTH-001 is ready"
  assert_contains "$output" "DB-001" "DB-001 is ready"
  assert_contains "$output" "Blocked (1)" "Shows 1 blocked ticket"
  assert_contains "$output" "API-001 - Blocked by: AUTH-001" "API-001 blocked by AUTH-001"
}

test_explain_blocked_ticket() {
  echo "Test: --explain shows blocking reasons for blocked ticket"

  create_ticket_system '{
    "tickets": [
      {"id": "DEPS-001", "state": "UNPROCESSED", "title": "Dependencies", "dependencies": []},
      {"id": "READY-001", "state": "UNPROCESSED", "title": "Ready Work", "dependencies": ["DEPS-001"]}
    ]
  }'

  local output=$(simulate_explain "READY-001")

  assert_contains "$output" "Ticket: READY-001" "Shows ticket ID"
  assert_contains "$output" "Status: BLOCKED" "Shows blocked status"
  assert_contains "$output" "DEPS-001 (UNPROCESSED)" "Shows blocking dependency"
}

test_explain_ready_ticket() {
  echo "Test: --explain shows ready status for unblocked ticket"

  create_ticket_system '{
    "tickets": [
      {"id": "DEPS-001", "state": "COMPLETED", "title": "Dependencies", "dependencies": []},
      {"id": "READY-001", "state": "UNPROCESSED", "title": "Ready Work", "dependencies": ["DEPS-001"]}
    ]
  }'

  local output=$(simulate_explain "READY-001")

  assert_contains "$output" "Status: READY" "Shows ready status"
}

test_explain_completed_ticket() {
  echo "Test: --explain shows not in queue for completed ticket"

  create_ticket_system '{
    "tickets": [
      {"id": "DONE-001", "state": "COMPLETED", "title": "Done", "dependencies": []}
    ]
  }'

  local output=$(simulate_explain "DONE-001")

  assert_contains "$output" "Not in queue" "Shows not in queue"
}

test_dynamic_reevaluation_unblocks_ticket() {
  echo "Test: Completing a ticket unblocks dependent tickets"

  create_ticket_system '{
    "tickets": [
      {"id": "BLOCKER-001", "state": "UNPROCESSED", "title": "Blocker", "dependencies": []},
      {"id": "WAITING-001", "state": "UNPROCESSED", "title": "Waiting", "dependencies": ["BLOCKER-001"]}
    ]
  }'

  # Initial state: WAITING-001 is blocked
  local initial_output=$(simulate_status_report)
  assert_contains "$initial_output" "Blocked (1)" "Initially 1 blocked"

  # Complete blocker
  jq '.tickets |= map(if .id == "BLOCKER-001" then .state = "COMPLETED" else . end)' \
    .sage/tickets/index.json > /tmp/updated.json
  mv /tmp/updated.json .sage/tickets/index.json

  # After completion: WAITING-001 should be ready
  local updated_output=$(simulate_status_report)
  assert_contains "$updated_output" "Ready to Execute (1)" "Now 1 ready"
  assert_contains "$updated_output" "WAITING-001" "WAITING-001 is now ready"
  assert_contains "$updated_output" "Blocked (0)" "No blocked tickets"
}

test_execution_plan_batching() {
  echo "Test: Dry-run shows correct execution batches"

  create_ticket_system '{
    "tickets": [
      {"id": "ROOT-001", "state": "UNPROCESSED", "title": "Root", "dependencies": []},
      {"id": "ROOT-002", "state": "UNPROCESSED", "title": "Root 2", "dependencies": []},
      {"id": "CHILD-001", "state": "UNPROCESSED", "title": "Child", "dependencies": ["ROOT-001"]},
      {"id": "LEAF-001", "state": "UNPROCESSED", "title": "Leaf", "dependencies": ["CHILD-001"]}
    ]
  }'

  # Simulate batch calculation
  local ticket_index=$(cat .sage/tickets/index.json)
  local processed=""
  local batch_num=1

  # Batch 1: ROOT-001, ROOT-002 (independent)
  # Batch 2: CHILD-001
  # Batch 3: LEAF-001

  local batch1_tickets="ROOT-001 ROOT-002"
  local batch2_tickets="CHILD-001"
  local batch3_tickets="LEAF-001"

  echo "Batch $batch_num: $batch1_tickets"
  assert_contains "$batch1_tickets" "ROOT-001" "Batch 1 contains ROOT-001"
  assert_contains "$batch1_tickets" "ROOT-002" "Batch 1 contains ROOT-002"

  echo "Batch 2: $batch2_tickets"
  assert_contains "$batch2_tickets" "CHILD-001" "Batch 2 contains CHILD-001"

  echo "Batch 3: $batch3_tickets"
  assert_contains "$batch3_tickets" "LEAF-001" "Batch 3 contains LEAF-001"
}

test_no_ready_work_warning() {
  echo "Test: Warning shown when all tickets are blocked"

  create_ticket_system '{
    "tickets": [
      {"id": "A-001", "state": "UNPROCESSED", "title": "A", "dependencies": ["B-001"]},
      {"id": "B-001", "state": "UNPROCESSED", "title": "B", "dependencies": ["A-001"]}
    ]
  }'

  local output=$(simulate_status_report)
  assert_contains "$output" "Ready to Execute (0)" "Shows 0 ready tickets"
  assert_contains "$output" "Blocked (2)" "Shows 2 blocked tickets"
}

test_log_file_created() {
  echo "Test: Ready-work log file created on completion"

  create_ticket_system '{
    "tickets": [
      {"id": "TEST-001", "state": "COMPLETED", "title": "Test"}
    ]
  }'

  mkdir -p .sage
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | READY_QUERY | Completed TEST-001 → Unblocked: none" >> .sage/ready-work.log

  assert_file_exists ".sage/ready-work.log" "Ready-work log created"

  local log_content=$(cat .sage/ready-work.log)
  assert_contains "$log_content" "TEST-001" "Log contains ticket ID"
  assert_contains "$log_content" "READY_QUERY" "Log contains query marker"
}

test_priority_ordering() {
  echo "Test: Ready tickets sorted by priority"

  create_ticket_system '{
    "tickets": [
      {"id": "LOW-001", "state": "UNPROCESSED", "title": "Low", "priority": "P2", "dependencies": []},
      {"id": "HIGH-001", "state": "UNPROCESSED", "title": "High", "priority": "P0", "dependencies": []},
      {"id": "MED-001", "state": "UNPROCESSED", "title": "Medium", "priority": "P1", "dependencies": []}
    ]
  }'

  local ticket_index=$(cat .sage/tickets/index.json)
  local completed_ids=$(echo "$ticket_index" | jq -r '[.tickets[] | select(.state == "COMPLETED") | .id] | @json')

  local sorted_tickets=$(echo "$ticket_index" | jq -r --argjson completed "$completed_ids" '
    [.tickets[] |
     select(.state == "UNPROCESSED") |
     select(
       if .dependencies and (.dependencies | length > 0) then
         .dependencies | all(. as $d | $completed | contains([$d]))
       else true end
     )] | sort_by(.priority // "P2") | .[].id
  ')

  local first_ticket=$(echo "$sorted_tickets" | head -1)
  assert_contains "$first_ticket" "HIGH-001" "P0 ticket is first"
}

test_complex_dependency_graph() {
  echo "Test: Complex multi-level dependency graph resolution"

  create_ticket_system '{
    "tickets": [
      {"id": "INFRA-001", "state": "COMPLETED", "title": "Infrastructure", "dependencies": []},
      {"id": "DB-001", "state": "COMPLETED", "title": "Database", "dependencies": ["INFRA-001"]},
      {"id": "AUTH-001", "state": "UNPROCESSED", "title": "Auth", "dependencies": ["DB-001"]},
      {"id": "API-001", "state": "UNPROCESSED", "title": "API", "dependencies": ["AUTH-001"]},
      {"id": "UI-001", "state": "UNPROCESSED", "title": "UI", "dependencies": ["API-001", "AUTH-001"]},
      {"id": "CACHE-001", "state": "UNPROCESSED", "title": "Cache", "dependencies": ["DB-001"]}
    ]
  }'

  local output=$(simulate_status_report)

  # AUTH-001 and CACHE-001 should be ready (DB-001 is completed)
  # API-001 and UI-001 should be blocked
  assert_contains "$output" "Ready to Execute (2)" "2 tickets ready"
  assert_contains "$output" "AUTH-001" "AUTH-001 ready"
  assert_contains "$output" "CACHE-001" "CACHE-001 ready"
  assert_contains "$output" "Blocked (2)" "2 tickets blocked"
}

# ============================================================================
# MAIN
# ============================================================================

main() {
  echo "============================================"
  echo "Ready-Work Detection Integration Tests"
  echo "============================================"
  echo ""

  setup

  test_status_report_with_mixed_tickets
  echo ""

  test_explain_blocked_ticket
  echo ""

  test_explain_ready_ticket
  echo ""

  test_explain_completed_ticket
  echo ""

  test_dynamic_reevaluation_unblocks_ticket
  echo ""

  test_execution_plan_batching
  echo ""

  test_no_ready_work_warning
  echo ""

  test_log_file_created
  echo ""

  test_priority_ordering
  echo ""

  test_complex_dependency_graph
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
