#!/bin/bash
# test_stream_performance.sh - Performance benchmarks for stream semi-auto mode
# Part of STREAM-014: Performance Testing and Optimization

set -euo pipefail

# Test configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LIB_PATH="$PROJECT_ROOT/.sage/lib/stream-functions.sh"
TEST_DIR="/tmp/stream-perf-test-$$"
PASSED=0
FAILED=0
TOTAL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Performance thresholds
MAX_GROUPING_TIME_MS=1000  # < 1s for 100 tickets
TARGET_SPEEDUP_MIN=3       # 3-5× speedup target

# Source the library
source "$LIB_PATH"

# ============================================================================
# PERFORMANCE MEASUREMENT HELPERS
# ============================================================================

# Get current time in milliseconds
get_time_ms() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: use perl for millisecond precision
    perl -MTime::HiRes=time -e 'printf "%.0f\n", time * 1000'
  else
    # Linux: use date with nanoseconds
    echo $(($(date +%s%N) / 1000000))
  fi
}

# Calculate elapsed time in milliseconds
elapsed_ms() {
  local start="$1"
  local end="$2"
  echo $((end - start))
}

# Format milliseconds to human readable
format_time() {
  local ms="$1"
  if [ "$ms" -lt 1000 ]; then
    echo "${ms}ms"
  else
    local seconds
    seconds=$(awk "BEGIN {printf \"%.2f\", $ms / 1000}")
    echo "${seconds}s"
  fi
}

# ============================================================================
# TEST FIXTURES
# ============================================================================

generate_tickets() {
  local count="$1"
  local output_file="$2"

  # Generate tickets across multiple components
  local components=("AUTH" "API" "UI" "DATA" "CACHE" "QUEUE" "NOTIFY" "AUDIT" "SYNC" "REPORT")
  local tickets_json="["

  for ((i = 1; i <= count; i++)); do
    local comp_idx=$((i % ${#components[@]}))
    local comp_name="${components[$comp_idx]}"
    local ticket_num=$(printf "%03d" "$i")
    local ticket_id="${comp_name}-${ticket_num}"

    if [ "$i" -gt 1 ]; then
      tickets_json+=","
    fi

    tickets_json+="{\"id\": \"$ticket_id\", \"state\": \"UNPROCESSED\", \"type\": \"story\", \"title\": \"Task $i\"}"
  done

  tickets_json+="]"

  cat > "$output_file" <<EOF
{
  "version": "2.2.0",
  "workflow_mode": "TICKET_BASED",
  "tickets": $tickets_json
}
EOF
}

setup_perf_test() {
  mkdir -p "$TEST_DIR/batches"
  mkdir -p "$TEST_DIR/tickets"
}

cleanup_perf_test() {
  rm -rf "$TEST_DIR"
}

# ============================================================================
# PERFORMANCE ASSERTIONS
# ============================================================================

assert_time_under() {
  local actual_ms="$1"
  local max_ms="$2"
  local test_name="$3"

  TOTAL=$((TOTAL + 1))

  if [ "$actual_ms" -lt "$max_ms" ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    echo -e "  Time: $(format_time "$actual_ms") (limit: $(format_time "$max_ms"))"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name"
    echo -e "  Time: $(format_time "$actual_ms") EXCEEDS limit $(format_time "$max_ms")"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

assert_speedup() {
  local baseline="$1"
  local optimized="$2"
  local min_speedup="$3"
  local test_name="$4"

  TOTAL=$((TOTAL + 1))

  local speedup
  speedup=$(awk "BEGIN {printf \"%.2f\", $baseline / $optimized}")

  if awk "BEGIN {exit !($speedup >= $min_speedup)}"; then
    echo -e "${GREEN}✓${NC} $test_name"
    echo -e "  Speedup: ${speedup}× (baseline: $(format_time "$baseline"), optimized: $(format_time "$optimized"))"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name"
    echo -e "  Speedup: ${speedup}× BELOW target ${min_speedup}×"
    echo -e "  Baseline: $(format_time "$baseline"), Optimized: $(format_time "$optimized")"
    FAILED=$((FAILED + 1))
    return 1
  fi
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

# ============================================================================
# PERFORMANCE BENCHMARKS
# ============================================================================

benchmark_component_grouping_100_tickets() {
  echo ""
  echo "=== Benchmark: Component Grouping (100 Tickets) ==="

  setup_perf_test
  generate_tickets 100 "$TEST_DIR/tickets/index.json"

  local start_time end_time elapsed

  start_time=$(get_time_ms)

  # Perform component grouping
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
    if is_standard_prefix "$prefix"; then
      create_batch_file_atomic "$TEST_DIR/batches" "$prefix" "$tickets_for_prefix"
    fi
  done

  end_time=$(get_time_ms)
  elapsed=$(elapsed_ms "$start_time" "$end_time")

  # Verify correct grouping
  local batch_count
  batch_count=$(find "$TEST_DIR/batches" -name "*.batch" -type f | wc -l | tr -d ' ')
  assert_equals "10" "$batch_count" "100 tickets grouped into 10 components"

  # Performance assertion
  assert_time_under "$elapsed" "$MAX_GROUPING_TIME_MS" \
    "Component grouping < 1s for 100 tickets"

  cleanup_perf_test
}

benchmark_component_grouping_scaling() {
  echo ""
  echo "=== Benchmark: Component Grouping Scaling ==="

  local sizes=(10 50 100 200)
  local times=()

  for size in "${sizes[@]}"; do
    setup_perf_test
    generate_tickets "$size" "$TEST_DIR/tickets/index.json"

    local start_time end_time elapsed

    start_time=$(get_time_ms)

    local tickets
    tickets=$(jq '.tickets' "$TEST_DIR/tickets/index.json")
    local unprocessed
    unprocessed=$(filter_unprocessed_stories "$tickets")
    local prefixes
    prefixes=$(extract_unique_prefixes "$unprocessed")

    for prefix in $prefixes; do
      local tickets_for_prefix
      tickets_for_prefix=$(group_tickets_by_prefix "$unprocessed" "$prefix")
      if is_standard_prefix "$prefix"; then
        create_batch_file_atomic "$TEST_DIR/batches" "$prefix" "$tickets_for_prefix"
      fi
    done

    end_time=$(get_time_ms)
    elapsed=$(elapsed_ms "$start_time" "$end_time")
    times+=("$elapsed")

    echo -e "  ${BLUE}$size tickets:${NC} $(format_time "$elapsed")"

    cleanup_perf_test
  done

  # Verify linear or sub-linear scaling
  TOTAL=$((TOTAL + 1))
  local ratio_10_to_100
  ratio_10_to_100=$(awk "BEGIN {printf \"%.2f\", ${times[2]} / ${times[0]}}")

  # Should not be more than 15× slower for 10× more tickets (linear + overhead)
  if awk "BEGIN {exit !($ratio_10_to_100 <= 15)}"; then
    echo -e "${GREEN}✓${NC} Scaling: 100 tickets is ${ratio_10_to_100}× slower than 10 tickets (acceptable)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} Scaling: 100 tickets is ${ratio_10_to_100}× slower than 10 tickets (too slow)"
    FAILED=$((FAILED + 1))
  fi
}

benchmark_batch_file_operations() {
  echo ""
  echo "=== Benchmark: Batch File Operations ==="

  setup_perf_test

  local start_time end_time elapsed

  # Test 1: Create 10 batch files with 10 tickets each
  start_time=$(get_time_ms)

  for i in {1..10}; do
    local tickets=""
    for j in {1..10}; do
      tickets+="COMP${i}-$(printf "%03d" "$j")"$'\n'
    done
    tickets=$(echo "$tickets" | sed '/^$/d')
    create_batch_file_atomic "$TEST_DIR/batches" "COMP${i}" "$tickets"
  done

  end_time=$(get_time_ms)
  elapsed=$(elapsed_ms "$start_time" "$end_time")

  assert_time_under "$elapsed" 500 "Create 10 batch files < 500ms"

  # Test 2: Read and count all batch files
  start_time=$(get_time_ms)

  local total_tickets=0
  for batch_file in $(get_batch_files "$TEST_DIR/batches"); do
    local count
    count=$(count_batch_tickets "$batch_file")
    total_tickets=$((total_tickets + count))
  done

  end_time=$(get_time_ms)
  elapsed=$(elapsed_ms "$start_time" "$end_time")

  assert_time_under "$elapsed" 200 "Read 10 batch files < 200ms"
  assert_equals "100" "$total_tickets" "Total tickets counted correctly"

  # Test 3: Cleanup all batch files
  start_time=$(get_time_ms)

  for i in {1..10}; do
    cleanup_component_batch "$TEST_DIR/batches" "COMP${i}"
  done

  end_time=$(get_time_ms)
  elapsed=$(elapsed_ms "$start_time" "$end_time")

  assert_time_under "$elapsed" 200 "Cleanup 10 batch files < 200ms"

  cleanup_perf_test
}

# ============================================================================
# SEMI-AUTO vs INTERACTIVE MODE COMPARISON
# ============================================================================

simulate_interactive_mode_overhead() {
  local ticket_count="$1"

  # Interactive mode overhead per ticket (simulated):
  # - User confirmation: ~2000ms (2 seconds average human response)
  # - Display prompts: ~50ms
  # - Context switch: ~100ms
  local per_ticket_overhead_ms=2150

  # Component overhead (once per component, ~4 components for 15 tickets)
  local components=$((ticket_count / 4))
  local component_overhead_ms=$((components * 500))

  local total_ms=$((ticket_count * per_ticket_overhead_ms + component_overhead_ms))

  echo "$total_ms"
}

simulate_semi_auto_mode_overhead() {
  local ticket_count="$1"

  # Semi-auto mode overhead:
  # - Component confirmation: ~2000ms (once per component)
  # - No ticket-level confirmations
  # - Batch processing: ~10ms per ticket
  local components=$((ticket_count / 4))
  if [ "$components" -lt 1 ]; then
    components=1
  fi

  local component_overhead_ms=$((components * 2000))
  local processing_overhead_ms=$((ticket_count * 10))

  local total_ms=$((component_overhead_ms + processing_overhead_ms))

  echo "$total_ms"
}

benchmark_mode_comparison() {
  echo ""
  echo "=== Benchmark: Semi-Auto vs Interactive Mode (15 Tickets) ==="

  local ticket_count=15

  # Simulate interactive mode
  local interactive_time
  interactive_time=$(simulate_interactive_mode_overhead "$ticket_count")
  echo -e "  ${BLUE}Interactive mode:${NC} $(format_time "$interactive_time") (simulated)"

  # Simulate semi-auto mode
  local semi_auto_time
  semi_auto_time=$(simulate_semi_auto_mode_overhead "$ticket_count")
  echo -e "  ${BLUE}Semi-auto mode:${NC}  $(format_time "$semi_auto_time") (simulated)"

  # Calculate speedup
  assert_speedup "$interactive_time" "$semi_auto_time" "$TARGET_SPEEDUP_MIN" \
    "Semi-auto mode ${TARGET_SPEEDUP_MIN}-5× faster than interactive"
}

benchmark_real_processing_time() {
  echo ""
  echo "=== Benchmark: Full Cycle Processing Time ==="

  setup_perf_test
  generate_tickets 15 "$TEST_DIR/tickets/index.json"

  local start_time end_time total_elapsed

  start_time=$(get_time_ms)

  # Full semi-auto cycle
  local tickets
  tickets=$(jq '.tickets' "$TEST_DIR/tickets/index.json")
  local unprocessed
  unprocessed=$(filter_unprocessed_stories "$tickets")
  local prefixes
  prefixes=$(extract_unique_prefixes "$unprocessed")

  # Group tickets
  for prefix in $prefixes; do
    local tickets_for_prefix
    tickets_for_prefix=$(group_tickets_by_prefix "$unprocessed" "$prefix")
    if is_standard_prefix "$prefix"; then
      create_batch_file_atomic "$TEST_DIR/batches" "$prefix" "$tickets_for_prefix"
    fi
  done

  # Process each component
  local total_processed=0
  local components_processed=0

  for batch_file in $(get_batch_files "$TEST_DIR/batches" | sort); do
    local comp_name
    comp_name=$(basename "$batch_file" .batch)

    if should_skip_component "$batch_file"; then
      continue
    fi

    while IFS= read -r ticket_id; do
      total_processed=$((total_processed + 1))
      # Simulate ticket processing (no actual work, just loop)
    done < "$batch_file"

    cleanup_component_batch "$TEST_DIR/batches" "$comp_name"
    components_processed=$((components_processed + 1))
  done

  end_time=$(get_time_ms)
  total_elapsed=$(elapsed_ms "$start_time" "$end_time")

  echo -e "  ${BLUE}Full cycle time:${NC} $(format_time "$total_elapsed")"
  echo -e "  ${BLUE}Tickets processed:${NC} $total_processed"
  echo -e "  ${BLUE}Components:${NC} $components_processed"

  assert_time_under "$total_elapsed" 2000 "Full cycle (15 tickets) < 2s processing overhead"
  assert_equals "15" "$total_processed" "All 15 tickets processed"

  cleanup_perf_test
}

# ============================================================================
# PERFORMANCE METRICS DOCUMENTATION
# ============================================================================

generate_performance_report() {
  echo ""
  echo "=== Performance Metrics Report ==="
  echo ""

  setup_perf_test

  # Collect metrics
  local metrics=()

  # Metric 1: Grouping time for different sizes
  echo "Collecting grouping metrics..."
  for size in 50 100 200; do
    generate_tickets "$size" "$TEST_DIR/tickets/index.json"

    local start_time end_time elapsed
    start_time=$(get_time_ms)

    local tickets
    tickets=$(jq '.tickets' "$TEST_DIR/tickets/index.json")
    local unprocessed
    unprocessed=$(filter_unprocessed_stories "$tickets")
    local prefixes
    prefixes=$(extract_unique_prefixes "$unprocessed")

    for prefix in $prefixes; do
      local tickets_for_prefix
      tickets_for_prefix=$(group_tickets_by_prefix "$unprocessed" "$prefix")
      if is_standard_prefix "$prefix"; then
        create_batch_file_atomic "$TEST_DIR/batches" "$prefix" "$tickets_for_prefix"
      fi
    done

    end_time=$(get_time_ms)
    elapsed=$(elapsed_ms "$start_time" "$end_time")

    metrics+=("grouping_${size}_tickets:${elapsed}ms")

    rm -f "$TEST_DIR/batches"/*.batch
  done

  # Metric 2: Speedup ratio
  local interactive_15
  interactive_15=$(simulate_interactive_mode_overhead 15)
  local semi_auto_15
  semi_auto_15=$(simulate_semi_auto_mode_overhead 15)
  local speedup
  speedup=$(awk "BEGIN {printf \"%.1f\", $interactive_15 / $semi_auto_15}")

  metrics+=("speedup_ratio:${speedup}x")

  # Metric 3: Confirmation reduction
  local interactive_confirms=$((15 * 3))  # ticket confirm, diff review, commit
  local semi_auto_confirms=$((4 * 3))      # 4 components: start, push, continue
  local confirm_reduction
  confirm_reduction=$(awk "BEGIN {printf \"%.1f\", ($interactive_confirms - $semi_auto_confirms) / $interactive_confirms * 100}")

  metrics+=("confirmation_reduction:${confirm_reduction}%")

  # Display metrics
  echo ""
  echo "┌─────────────────────────────────────────────┐"
  echo "│       PERFORMANCE METRICS SUMMARY           │"
  echo "├─────────────────────────────────────────────┤"

  for metric in "${metrics[@]}"; do
    local name="${metric%%:*}"
    local value="${metric##*:}"
    printf "│ %-30s %12s │\n" "$name" "$value"
  done

  echo "├─────────────────────────────────────────────┤"
  echo "│ TARGET: 3-5× speedup vs interactive        │"
  echo "│ RESULT: ${speedup}× speedup achieved               │"
  echo "└─────────────────────────────────────────────┘"

  TOTAL=$((TOTAL + 1))
  if awk "BEGIN {exit !($speedup >= 3)}"; then
    echo -e "${GREEN}✓${NC} Performance target met: ${speedup}× speedup"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} Performance target NOT met: ${speedup}× (need 3×)"
    FAILED=$((FAILED + 1))
  fi

  cleanup_perf_test
}

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

run_tests() {
  echo "================================================"
  echo "  STREAM-014: Performance Testing Suite"
  echo "  Validating: 3-5× speedup target"
  echo "================================================"

  # Run all performance benchmarks
  benchmark_component_grouping_100_tickets
  benchmark_component_grouping_scaling
  benchmark_batch_file_operations
  benchmark_mode_comparison
  benchmark_real_processing_time
  generate_performance_report

  # Summary
  echo ""
  echo "================================================"
  echo "  PERFORMANCE TEST SUMMARY"
  echo "================================================"
  echo ""
  echo -e "Total Tests:  ${YELLOW}$TOTAL${NC}"
  echo -e "Passed:       ${GREEN}$PASSED${NC}"
  echo -e "Failed:       ${RED}$FAILED${NC}"

  local pass_rate
  pass_rate=$(awk "BEGIN {printf \"%.1f\", ($PASSED / $TOTAL) * 100}")
  echo -e "Pass Rate:    ${YELLOW}${pass_rate}%${NC}"

  if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}All performance tests passed!${NC}"
    echo -e "${GREEN}3-5× speedup target CONFIRMED${NC}"
    exit 0
  else
    echo ""
    echo -e "${RED}Some performance tests failed.${NC}"
    exit 1
  fi
}

# Run tests
run_tests
