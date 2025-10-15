#!/usr/bin/env bash
#
# validate-dependencies.sh - Dependency validation for Sage-Dev ticket system
#
# Purpose: Validate ticket dependencies for cycles, orphans, and state consistency
# Version: 1.0.0 (Schema v2.2.0)
# Usage:
#   ./validate-dependencies.sh detect-cycles [index.json]
#   ./validate-dependencies.sh detect-orphans [index.json] [--fix]
#   ./validate-dependencies.sh check-state-consistency [index.json]
#

set -euo pipefail

# Default paths
INDEX_FILE="${1:-.sage/tickets/index.json}"
COMMAND="${1:-detect-cycles}"

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Error tracking
ERRORS_FOUND=0
WARNINGS_FOUND=0

#######################################
# Detect circular dependencies using DFS
# Globals:
#   INDEX_FILE
#   ERRORS_FOUND
# Arguments:
#   None
# Returns:
#   0 if no cycles, 1 if cycles found
#######################################
detect_cycles() {
    local index_file="${1:-$INDEX_FILE}"

    if [ ! -f "$index_file" ]; then
        echo -e "${RED}ERROR: Index file not found: $index_file${NC}" >&2
        return 1
    fi

    echo "🔍 Checking for dependency cycles..."

    # Extract all tickets with blocks relationships
    local tickets_with_blocks
    tickets_with_blocks=$(jq -r '.tickets[] | select((.blocks // []) | length > 0) | .id' "$index_file")

    if [ -z "$tickets_with_blocks" ]; then
        echo -e "${GREEN}✓ No blocks relationships defined - no cycles possible${NC}"
        return 0
    fi

    # DFS-based cycle detection
    # State tracking: white (unvisited), gray (visiting), black (visited)
    local visited_tickets=()
    local visiting_stack=()
    local cycles_detected=()

    # Process each ticket as potential cycle start
    while IFS= read -r ticket_id; do
        if [[ ! " ${visited_tickets[@]} " =~ " ${ticket_id} " ]]; then
            dfs_detect_cycle "$ticket_id" "$index_file" visiting_stack visited_tickets cycles_detected
        fi
    done <<< "$tickets_with_blocks"

    # Report results
    if [ ${#cycles_detected[@]} -gt 0 ]; then
        echo -e "${RED}✗ Dependency cycles detected: ${#cycles_detected[@]}${NC}"
        echo ""
        for cycle in "${cycles_detected[@]}"; do
            echo -e "${RED}  Cycle: $cycle${NC}"
        done
        echo ""
        echo "Action required: Remove one blocking relationship to break cycle."
        ERRORS_FOUND=$((ERRORS_FOUND + ${#cycles_detected[@]}))
        return 1
    else
        echo -e "${GREEN}✓ No dependency cycles detected${NC}"
        return 0
    fi
}

#######################################
# DFS helper for cycle detection
# Arguments:
#   $1 - current ticket ID
#   $2 - index file path
#   $3 - visiting stack (by reference)
#   $4 - visited set (by reference)
#   $5 - cycles found (by reference)
#######################################
dfs_detect_cycle() {
    local current="$1"
    local index_file="$2"
    local -n stack_ref=$3
    local -n visited_ref=$4
    local -n cycles_ref=$5

    # Add to visiting stack (gray node)
    stack_ref+=("$current")

    # Get tickets this one blocks
    local blocked_tickets
    blocked_tickets=$(jq -r ".tickets[] | select(.id == \"$current\") | .blocks[]? // empty" "$index_file")

    # Visit each blocked ticket
    while IFS= read -r blocked_id; do
        [ -z "$blocked_id" ] && continue

        # Check if in visiting stack (cycle detected)
        if [[ " ${stack_ref[@]} " =~ " ${blocked_id} " ]]; then
            # Construct cycle path
            local cycle_path=""
            local found_start=false
            for ticket in "${stack_ref[@]}"; do
                if [ "$ticket" = "$blocked_id" ]; then
                    found_start=true
                fi
                if [ "$found_start" = true ]; then
                    cycle_path="${cycle_path}${ticket} → "
                fi
            done
            cycle_path="${cycle_path}${blocked_id}"
            cycles_ref+=("$cycle_path")
            continue
        fi

        # Check if already visited (black node)
        if [[ " ${visited_ref[@]} " =~ " ${blocked_id} " ]]; then
            continue
        fi

        # Recursive DFS
        dfs_detect_cycle "$blocked_id" "$index_file" stack_ref visited_ref cycles_ref
    done <<< "$blocked_tickets"

    # Mark as visited (black node) and remove from stack
    visited_ref+=("$current")
    unset 'stack_ref[-1]'
}

#######################################
# Detect orphaned dependency references
# Globals:
#   INDEX_FILE
#   WARNINGS_FOUND
# Arguments:
#   $1 - index file path
#   $2 - --fix flag (optional)
# Returns:
#   0 if no orphans, 1 if orphans found
#######################################
detect_orphans() {
    local index_file="${1:-$INDEX_FILE}"
    local fix_mode=false

    if [ "${2:-}" = "--fix" ]; then
        fix_mode=true
    fi

    if [ ! -f "$index_file" ]; then
        echo -e "${RED}ERROR: Index file not found: $index_file${NC}" >&2
        return 1
    fi

    echo "🔍 Checking for orphaned dependency references..."

    # Get all valid ticket IDs
    local valid_tickets
    valid_tickets=$(jq -r '.tickets[].id' "$index_file")

    # Check each dependency field
    local orphans_found=0
    local orphan_reports=()

    # Check blocks field
    while IFS=$'\t' read -r ticket_id blocked_id; do
        if ! echo "$valid_tickets" | grep -q "^${blocked_id}$"; then
            orphan_reports+=("$ticket_id|blocks|$blocked_id")
            orphans_found=$((orphans_found + 1))
        fi
    done < <(jq -r '.tickets[] | select((.blocks // []) | length > 0) | .id as $tid | .blocks[] | "\($tid)\t\(.)"' "$index_file")

    # Check blockedBy field
    while IFS=$'\t' read -r ticket_id blocker_id; do
        if ! echo "$valid_tickets" | grep -q "^${blocker_id}$"; then
            orphan_reports+=("$ticket_id|blockedBy|$blocker_id")
            orphans_found=$((orphans_found + 1))
        fi
    done < <(jq -r '.tickets[] | select((.blockedBy // []) | length > 0) | .id as $tid | .blockedBy[] | "\($tid)\t\(.)"' "$index_file")

    # Check relatedTo field
    while IFS=$'\t' read -r ticket_id related_id; do
        if ! echo "$valid_tickets" | grep -q "^${related_id}$"; then
            orphan_reports+=("$ticket_id|relatedTo|$related_id")
            orphans_found=$((orphans_found + 1))
        fi
    done < <(jq -r '.tickets[] | select((.relatedTo // []) | length > 0) | .id as $tid | .relatedTo[] | "\($tid)\t\(.)"' "$index_file")

    # Check discoveredFrom field
    while IFS=$'\t' read -r ticket_id discovered_from; do
        if [ "$discovered_from" != "null" ] && ! echo "$valid_tickets" | grep -q "^${discovered_from}$"; then
            orphan_reports+=("$ticket_id|discoveredFrom|$discovered_from")
            orphans_found=$((orphans_found + 1))
        fi
    done < <(jq -r '.tickets[] | select(.discoveredFrom != null) | "\(.id)\t\(.discoveredFrom)"' "$index_file")

    # Report results
    if [ $orphans_found -gt 0 ]; then
        echo -e "${YELLOW}⚠ Orphaned dependencies found: $orphans_found${NC}"
        echo ""
        for report in "${orphan_reports[@]}"; do
            IFS='|' read -r ticket field ref_id <<< "$report"
            echo -e "${YELLOW}  Warning: $ticket.$field references non-existent ticket: $ref_id${NC}"
        done
        echo ""

        if [ "$fix_mode" = true ]; then
            echo "Applying fixes..."

            # Remove orphaned references using jq
            jq --argjson orphans "$(printf '%s\n' "${orphan_reports[@]}" | jq -R 'split("|") | {ticket: .[0], field: .[1], ref: .[2]}' | jq -s .)" '
                .tickets |= map(
                    . as $ticket |
                    reduce $orphans[] as $orphan (
                        $ticket;
                        if .id == $orphan.ticket then
                            if $orphan.field == "blocks" then
                                .blocks = (.blocks // [] | map(select(. != $orphan.ref)))
                            elif $orphan.field == "blockedBy" then
                                .blockedBy = (.blockedBy // [] | map(select(. != $orphan.ref)))
                            elif $orphan.field == "relatedTo" then
                                .relatedTo = (.relatedTo // [] | map(select(. != $orphan.ref)))
                            elif $orphan.field == "discoveredFrom" and .discoveredFrom == $orphan.ref then
                                .discoveredFrom = null
                            else
                                .
                            end
                        else
                            .
                        end
                    )
                )
            ' "$index_file" > "${index_file}.tmp" && mv "${index_file}.tmp" "$index_file"

            echo -e "${GREEN}✓ Fixed $orphans_found orphaned references${NC}"
        else
            echo "Run with --fix to automatically remove orphaned references."
        fi

        WARNINGS_FOUND=$((WARNINGS_FOUND + orphans_found))
        return 1
    else
        echo -e "${GREEN}✓ No orphaned dependencies found${NC}"
        return 0
    fi
}

#######################################
# Check state consistency rules
# Globals:
#   INDEX_FILE
#   ERRORS_FOUND
# Arguments:
#   $1 - index file path
# Returns:
#   0 if consistent, 1 if violations found
#######################################
check_state_consistency() {
    local index_file="${1:-$INDEX_FILE}"

    if [ ! -f "$index_file" ]; then
        echo -e "${RED}ERROR: Index file not found: $index_file${NC}" >&2
        return 1
    fi

    echo "🔍 Checking state consistency..."

    local violations=()

    # Rule 1: Tickets with non-empty blockedBy cannot be IN_PROGRESS
    while IFS=$'\t' read -r ticket_id state blockers; do
        if [ "$state" = "IN_PROGRESS" ] && [ "$blockers" != "[]" ] && [ "$blockers" != "null" ]; then
            violations+=("$ticket_id: IN_PROGRESS with active blockers ($blockers)")
        fi
    done < <(jq -r '.tickets[] | "\(.id)\t\(.state)\t\(.blockedBy // [])"' "$index_file")

    # Rule 2: Tickets with DEFERRED/FAILED blockers cannot be COMPLETED
    while IFS=$'\t' read -r ticket_id state; do
        if [ "$state" = "COMPLETED" ]; then
            local blocked_by
            blocked_by=$(jq -r ".tickets[] | select(.id == \"$ticket_id\") | .blockedBy[]? // empty" "$index_file")

            while IFS= read -r blocker_id; do
                [ -z "$blocker_id" ] && continue

                local blocker_state
                blocker_state=$(jq -r ".tickets[] | select(.id == \"$blocker_id\") | .state" "$index_file")

                if [ "$blocker_state" = "DEFERRED" ] || [ "$blocker_state" = "FAILED" ]; then
                    violations+=("$ticket_id: COMPLETED but blocker $blocker_id is $blocker_state")
                fi
            done <<< "$blocked_by"
        fi
    done < <(jq -r '.tickets[] | "\(.id)\t\(.state)"' "$index_file")

    # Report results
    if [ ${#violations[@]} -gt 0 ]; then
        echo -e "${RED}✗ State consistency violations: ${#violations[@]}${NC}"
        echo ""
        for violation in "${violations[@]}"; do
            echo -e "${RED}  Violation: $violation${NC}"
        done
        echo ""
        echo "Action required: Fix ticket states or update blocking relationships."
        ERRORS_FOUND=$((ERRORS_FOUND + ${#violations[@]}))
        return 1
    else
        echo -e "${GREEN}✓ State consistency verified${NC}"
        return 0
    fi
}

#######################################
# Main execution
#######################################
main() {
    case "$COMMAND" in
        detect-cycles)
            detect_cycles "${2:-.sage/tickets/index.json}"
            ;;
        detect-orphans)
            detect_orphans "${2:-.sage/tickets/index.json}" "${3:-}"
            ;;
        check-state-consistency)
            check_state_consistency "${2:-.sage/tickets/index.json}"
            ;;
        all)
            local index="${2:-.sage/tickets/index.json}"
            echo "=== Dependency Validation Suite ==="
            echo ""
            detect_cycles "$index"
            echo ""
            detect_orphans "$index" "${3:-}"
            echo ""
            check_state_consistency "$index"
            echo ""
            echo "==================================="
            if [ $ERRORS_FOUND -gt 0 ] || [ $WARNINGS_FOUND -gt 0 ]; then
                echo -e "${YELLOW}Summary: $ERRORS_FOUND errors, $WARNINGS_FOUND warnings${NC}"
                exit 1
            else
                echo -e "${GREEN}✓ All validations passed${NC}"
                exit 0
            fi
            ;;
        *)
            echo "Usage: $0 {detect-cycles|detect-orphans|check-state-consistency|all} [index.json] [--fix]"
            exit 1
            ;;
    esac
}

# Run if executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
