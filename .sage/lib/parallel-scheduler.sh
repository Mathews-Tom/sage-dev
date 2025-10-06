#!/bin/bash

# Parallel Scheduler Library
# Purpose: Dependency graph analysis and parallel batch scheduling for ticket execution
# Used by: /stream --auto --parallel

set -euo pipefail

# ============================================================================
# DEPENDENCY GRAPH BUILDER
# ============================================================================

# Build dependency graph from ticket index
# Returns: JSON DAG structure with tickets and their dependencies
build_dependency_graph() {
    local tickets_index="$1"

    if [ ! -f "$tickets_index" ]; then
        echo "ERROR: Ticket index not found: $tickets_index" >&2
        return 1
    fi

    # Build adjacency list representation
    # Format: {ticket_id: {deps: [...], dependents: [...], state: "..."}}
    jq '
        .tickets |
        map({
            id: .id,
            state: .state,
            priority: .priority,
            dependencies: (.dependencies // []),
            dependents: []
        }) |
        # Compute reverse dependencies (who depends on me)
        reduce .[] as $ticket (
            .;
            reduce $ticket.dependencies[] as $dep (
                .;
                map(
                    if .id == $dep then
                        .dependents += [$ticket.id]
                    else
                        .
                    end
                )
            )
        ) |
        {
            graph: map({(.id): .}) | add,
            stats: {
                total: length,
                unprocessed: map(select(.state == "UNPROCESSED")) | length,
                completed: map(select(.state == "COMPLETED")) | length
            }
        }
    ' "$tickets_index"
}

# Detect circular dependencies in graph
# Args: $1 = dependency graph JSON
# Returns: 0 if no cycles, 1 if cycles detected
detect_circular_dependencies() {
    local graph_json="$1"

    echo "$graph_json" | jq -e '
        .graph |
        # DFS cycle detection
        def has_cycle($visited; $stack):
            . as $graph |
            ($stack | keys[0]) as $node |
            if ($stack | length) == 0 then
                false
            elif $visited[$node] and $stack[$node] then
                true
            else
                ($visited + {($node): true}) as $new_visited |
                (($graph[$node].dependencies // []) |
                 map({(.): true}) |
                 add // {}) as $neighbors |
                ($stack + $neighbors) as $new_stack |
                has_cycle($new_visited; $new_stack)
            end;

        [to_entries[] | select(.value.state == "UNPROCESSED")] |
        map(has_cycle({}; {(.key): true})) |
        any
    ' > /dev/null

    return $?
}

# ============================================================================
# BATCH SELECTOR
# ============================================================================

# Find next batch of independent tickets for parallel execution
# Args: $1 = dependency graph JSON, $2 = batch size (max workers)
# Returns: JSON array of ticket IDs that can run in parallel
find_parallel_batch() {
    local graph_json="$1"
    local batch_size="${2:-3}"

    echo "$graph_json" | jq -r \
        --argjson batch_size "$batch_size" '
        .graph |
        # Find UNPROCESSED tickets with all dependencies COMPLETED
        to_entries |
        map(select(
            .value.state == "UNPROCESSED" and
            (
                (.value.dependencies | length) == 0 or
                all(.value.dependencies[]; . as $dep |
                    $graph[.].state == "COMPLETED"
                )
            )
        )) |
        # Sort by priority (P0 > P1 > P2)
        sort_by(.value.priority) |
        # Check for shared dependencies (tickets that can run truly in parallel)
        # For now, simple approach: take first N tickets
        # TODO: Advanced - analyze for file conflicts
        map(.key) |
        .[:$batch_size]
    '
}

# Check if two tickets have overlapping file dependencies
# Args: $1 = ticket_id_1, $2 = ticket_id_2, $3 = tickets_index
# Returns: 0 if independent, 1 if overlapping
check_file_independence() {
    local ticket1="$1"
    local ticket2="$2"
    local tickets_index="$3"

    # Extract file paths from specs/plans for both tickets
    local files1=$(jq -r \
        --arg id "$ticket1" '
        .tickets[] |
        select(.id == $id) |
        .docs |
        to_entries |
        map(.value) |
        .[]
    ' "$tickets_index" 2>/dev/null || echo "")

    local files2=$(jq -r \
        --arg id "$ticket2" '
        .tickets[] |
        select(.id == $id) |
        .docs |
        to_entries |
        map(.value) |
        .[]
    ' "$tickets_index" 2>/dev/null || echo "")

    # Simple heuristic: if both reference same spec/plan, likely dependent
    if [ -n "$files1" ] && [ -n "$files2" ]; then
        for f1 in $files1; do
            for f2 in $files2; do
                if [ "$f1" == "$f2" ]; then
                    return 1  # Overlapping
                fi
            done
        done
    fi

    return 0  # Independent
}

# ============================================================================
# CRITICAL PATH ANALYSIS
# ============================================================================

# Calculate critical path through dependency graph
# Args: $1 = dependency graph JSON
# Returns: JSON with critical path info
calculate_critical_path() {
    local graph_json="$1"

    echo "$graph_json" | jq '
        .graph |
        # Topological sort + longest path
        def longest_path:
            . as $graph |
            to_entries |
            reduce .[] as $entry (
                {};
                . + {
                    ($entry.key): (
                        if ($entry.value.dependencies | length) == 0 then
                            1
                        else
                            [$entry.value.dependencies[] | $graph[.].longest_path // 0] |
                            max + 1
                        end
                    )
                }
            );

        {
            longest_path: longest_path,
            critical_tickets: (
                longest_path |
                to_entries |
                max_by(.value) |
                .key
            ),
            max_depth: (
                longest_path |
                to_entries |
                map(.value) |
                max
            )
        }
    '
}

# ============================================================================
# WORKER ALLOCATION
# ============================================================================

# Determine optimal worker count
# Args: $1 = requested workers ("auto" or number), $2 = available tickets
# Returns: optimal worker count
determine_worker_count() {
    local requested="$1"
    local available_tickets="$2"

    if [ "$requested" == "auto" ]; then
        # Auto-detect based on CPU cores, capped at tickets available
        local cpu_cores=$(sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo "4")
        local optimal=$((cpu_cores / 2))  # Conservative: half of cores

        # Cap at available tickets
        if [ "$optimal" -gt "$available_tickets" ]; then
            optimal="$available_tickets"
        fi

        # Minimum 1, maximum 8 (to avoid API rate limits)
        if [ "$optimal" -lt 1 ]; then
            optimal=1
        elif [ "$optimal" -gt 8 ]; then
            optimal=8
        fi

        echo "$optimal"
    else
        # Validate requested is a number
        if ! [[ "$requested" =~ ^[0-9]+$ ]]; then
            echo "ERROR: Invalid worker count: $requested" >&2
            echo "1"
            return 1
        fi

        # Cap at available tickets
        if [ "$requested" -gt "$available_tickets" ]; then
            echo "$available_tickets"
        else
            echo "$requested"
        fi
    fi
}

# ============================================================================
# BATCH STATISTICS
# ============================================================================

# Calculate batch statistics
# Args: $1 = dependency graph JSON, $2 = worker count
# Returns: JSON with batch scheduling stats
calculate_batch_statistics() {
    local graph_json="$1"
    local worker_count="$2"

    local total_unprocessed=$(echo "$graph_json" | jq '.stats.unprocessed')
    local batches=$((total_unprocessed / worker_count))
    local remainder=$((total_unprocessed % worker_count))

    if [ "$remainder" -gt 0 ]; then
        batches=$((batches + 1))
    fi

    jq -n \
        --argjson workers "$worker_count" \
        --argjson total "$total_unprocessed" \
        --argjson batches "$batches" \
        '{
            workers: $workers,
            total_tickets: $total,
            estimated_batches: $batches,
            tickets_per_batch: $workers,
            last_batch_size: (if ($total % $workers) == 0 then $workers else ($total % $workers) end)
        }'
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

# Pretty print dependency graph
print_dependency_graph() {
    local graph_json="$1"

    echo "┌─ Dependency Graph ─────────────────────────────┐"
    echo "$graph_json" | jq -r '
        .graph |
        to_entries |
        sort_by(.value.priority) |
        .[] |
        "│ \(.key) [\(.value.state)]" +
        (if (.value.dependencies | length) > 0 then
            " → deps: \(.value.dependencies | join(", "))"
        else
            ""
        end) +
        (if (.value.dependents | length) > 0 then
            " ← dependents: \(.value.dependents | join(", "))"
        else
            ""
        end)
    '
    echo "└────────────────────────────────────────────────┘"
}

# Export functions for use in other scripts
export -f build_dependency_graph
export -f detect_circular_dependencies
export -f find_parallel_batch
export -f check_file_independence
export -f calculate_critical_path
export -f determine_worker_count
export -f calculate_batch_statistics
export -f print_dependency_graph
