#!/usr/bin/env bash
#
# resolve-dependencies.sh - Dependency resolution for Sage-Dev ticket system
#
# Purpose: Compute blockedBy fields and identify ready work
# Version: 1.0.0 (Schema v2.2.0)
# Usage:
#   ./resolve-dependencies.sh compute-blocked-by [index.json]
#   ./resolve-dependencies.sh ready-work [index.json]
#

set -euo pipefail

# Default paths
INDEX_FILE="${1:-.sage/tickets/index.json}"
COMMAND="${1:-compute-blocked-by}"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

#######################################
# Compute blockedBy fields from blocks relationships
# Globals:
#   INDEX_FILE
# Arguments:
#   $1 - index file path
# Returns:
#   0 on success
#######################################
compute_blocked_by() {
    local index_file="${1:-$INDEX_FILE}"

    if [ ! -f "$index_file" ]; then
        echo "ERROR: Index file not found: $index_file" >&2
        return 1
    fi

    echo "🔧 Computing blockedBy fields from blocks relationships..."

    # Create temporary file for atomic update
    local temp_file="${index_file}.tmp"

    # Use jq to compute inverse relationships
    jq '
        # First, reset all blockedBy fields
        .tickets |= map(.blockedBy = []) |

        # Then, for each ticket with blocks, update blockedBy of blocked tickets
        .tickets as $all_tickets |
        .tickets |= map(
            . as $current |
            .blockedBy = [
                $all_tickets[] |
                select((.blocks // []) | contains([$current.id])) |
                .id
            ]
        )
    ' "$index_file" > "$temp_file"

    # Validate JSON before replacing
    if jq empty "$temp_file" 2>/dev/null; then
        mv "$temp_file" "$index_file"

        # Count updates
        local blocked_count
        blocked_count=$(jq '[.tickets[] | select((.blockedBy // []) | length > 0)] | length' "$index_file")

        echo -e "${GREEN}✓ blockedBy computation complete${NC}"
        echo "  Tickets with blockers: $blocked_count"
        return 0
    else
        rm -f "$temp_file"
        echo "ERROR: Invalid JSON generated during computation" >&2
        return 1
    fi
}

#######################################
# Query for ready work (unblocked UNPROCESSED tickets)
# Globals:
#   INDEX_FILE
# Arguments:
#   $1 - index file path
# Returns:
#   0 on success, prints ticket IDs
#######################################
ready_work() {
    local index_file="${1:-$INDEX_FILE}"

    if [ ! -f "$index_file" ]; then
        echo "ERROR: Index file not found: $index_file" >&2
        return 1
    fi

    echo "🔍 Finding ready work (unblocked UNPROCESSED tickets)..."
    echo ""

    # Query for UNPROCESSED tickets with empty blockedBy
    local ready_tickets
    ready_tickets=$(jq -r '
        [.tickets[] |
         select(.state == "UNPROCESSED") |
         select((.blockedBy // []) | length == 0)] |
        sort_by(
            if .priority == "P0" then 0
            elif .priority == "P1" then 1
            elif .priority == "P2" then 2
            else 3 end
        ) |
        .[] | .id
    ' "$index_file")

    if [ -z "$ready_tickets" ]; then
        echo "No ready work found (all UNPROCESSED tickets are blocked)"
        return 0
    fi

    # Display ready tickets
    local count=0
    echo "Ready Tickets:"
    while IFS= read -r ticket_id; do
        count=$((count + 1))
        local title
        title=$(jq -r ".tickets[] | select(.id == \"$ticket_id\") | .title" "$index_file")
        local priority
        priority=$(jq -r ".tickets[] | select(.id == \"$ticket_id\") | .priority" "$index_file")
        echo -e "  ${BLUE}[$priority]${NC} $ticket_id: $title"
    done <<< "$ready_tickets"

    echo ""
    echo -e "${GREEN}✓ Found $count ready tickets${NC}"
    echo ""

    # Return ticket IDs for programmatic use
    echo "$ready_tickets"
    return 0
}

#######################################
# Get tickets blocked by a specific ticket
# Arguments:
#   $1 - ticket ID
#   $2 - index file path
#######################################
get_blocked_by() {
    local ticket_id="$1"
    local index_file="${2:-.sage/tickets/index.json}"

    jq -r ".tickets[] | select(.blockedBy[]? == \"$ticket_id\") | .id" "$index_file"
}

#######################################
# Get tickets that a specific ticket blocks
# Arguments:
#   $1 - ticket ID
#   $2 - index file path
#######################################
get_blocks() {
    local ticket_id="$1"
    local index_file="${2:-.sage/tickets/index.json}"

    jq -r ".tickets[] | select(.id == \"$ticket_id\") | .blocks[]? // empty" "$index_file"
}

#######################################
# Get all blockers for a ticket (transitive closure)
# Arguments:
#   $1 - ticket ID
#   $2 - index file path
#######################################
get_all_blockers() {
    local ticket_id="$1"
    local index_file="${2:-.sage/tickets/index.json}"

    local visited=()
    local to_visit=("$ticket_id")
    local all_blockers=()

    while [ ${#to_visit[@]} -gt 0 ]; do
        local current="${to_visit[0]}"
        to_visit=("${to_visit[@]:1}")

        # Mark as visited
        visited+=("$current")

        # Get direct blockers
        local blockers
        blockers=$(jq -r ".tickets[] | select(.id == \"$current\") | .blockedBy[]? // empty" "$index_file")

        while IFS= read -r blocker; do
            [ -z "$blocker" ] && continue

            # Add to all_blockers if not already there
            if [[ ! " ${all_blockers[@]} " =~ " ${blocker} " ]]; then
                all_blockers+=("$blocker")
            fi

            # Add to visit queue if not visited
            if [[ ! " ${visited[@]} " =~ " ${blocker} " ]]; then
                to_visit+=("$blocker")
            fi
        done <<< "$blockers"
    done

    # Print results
    printf '%s\n' "${all_blockers[@]}"
}

#######################################
# Get dependency chain (recursive traversal)
# Arguments:
#   $1 - ticket ID
#   $2 - index file path
#######################################
get_dependency_chain() {
    local ticket_id="$1"
    local index_file="${2:-.sage/tickets/index.json}"

    echo "Dependency chain for $ticket_id:"
    _traverse_chain "$ticket_id" "$index_file" 0
}

_traverse_chain() {
    local ticket_id="$1"
    local index_file="$2"
    local depth="$3"

    local indent=""
    for ((i=0; i<depth; i++)); do
        indent="$indent  "
    done

    echo "${indent}└─ $ticket_id"

    # Get tickets this blocks
    local blocked
    blocked=$(jq -r ".tickets[] | select(.id == \"$ticket_id\") | .blocks[]? // empty" "$index_file")

    while IFS= read -r blocked_id; do
        [ -z "$blocked_id" ] && continue
        _traverse_chain "$blocked_id" "$index_file" $((depth + 1))
    done <<< "$blocked"
}

#######################################
# Main execution
#######################################
main() {
    case "$COMMAND" in
        compute-blocked-by)
            compute_blocked_by "${2:-.sage/tickets/index.json}"
            ;;
        ready-work)
            ready_work "${2:-.sage/tickets/index.json}"
            ;;
        get-blocked-by)
            if [ -z "${2:-}" ]; then
                echo "Usage: $0 get-blocked-by <ticket-id> [index.json]"
                exit 1
            fi
            get_blocked_by "$2" "${3:-.sage/tickets/index.json}"
            ;;
        get-blocks)
            if [ -z "${2:-}" ]; then
                echo "Usage: $0 get-blocks <ticket-id> [index.json]"
                exit 1
            fi
            get_blocks "$2" "${3:-.sage/tickets/index.json}"
            ;;
        get-all-blockers)
            if [ -z "${2:-}" ]; then
                echo "Usage: $0 get-all-blockers <ticket-id> [index.json]"
                exit 1
            fi
            get_all_blockers "$2" "${3:-.sage/tickets/index.json}"
            ;;
        get-dependency-chain)
            if [ -z "${2:-}" ]; then
                echo "Usage: $0 get-dependency-chain <ticket-id> [index.json]"
                exit 1
            fi
            get_dependency_chain "$2" "${3:-.sage/tickets/index.json}"
            ;;
        *)
            echo "Usage: $0 {compute-blocked-by|ready-work|get-blocked-by|get-blocks|get-all-blockers|get-dependency-chain} [args...]"
            exit 1
            ;;
    esac
}

# Run if executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
