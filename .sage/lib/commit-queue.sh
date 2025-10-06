#!/bin/bash

# Commit Queue Library
# Purpose: Serialize git commits from parallel workers to avoid conflicts
# Used by: /stream --auto --parallel

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

COMMIT_LOCK_FILE="${COMMIT_LOCK_FILE:-.sage/commit.lock}"
COMMIT_QUEUE_DIR="${COMMIT_QUEUE_DIR:-.sage/commit-queue}"
COMMIT_TIMEOUT="${COMMIT_TIMEOUT:-300}"  # 5 minutes

# ============================================================================
# LOCK MANAGEMENT
# ============================================================================

# Acquire exclusive commit lock with timeout
# Args: $1 = worker_id (for logging)
# Returns: 0 on success, 1 on timeout
acquire_commit_lock() {
    local worker_id="$1"
    local start_time=$(date +%s)
    local lock_acquired=false

    while [ "$lock_acquired" = "false" ]; do
        # Try to create lock file atomically
        if mkdir "$COMMIT_LOCK_FILE" 2>/dev/null; then
            echo "$worker_id" > "$COMMIT_LOCK_FILE/owner"
            echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$COMMIT_LOCK_FILE/acquired_at"
            lock_acquired=true
            echo "[Worker $worker_id] Commit lock acquired" >&2
            return 0
        fi

        # Check timeout
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))

        if [ "$elapsed" -ge "$COMMIT_TIMEOUT" ]; then
            echo "[Worker $worker_id] ERROR: Commit lock timeout after ${COMMIT_TIMEOUT}s" >&2

            # Check for stale lock (older than timeout)
            if [ -f "$COMMIT_LOCK_FILE/acquired_at" ]; then
                local lock_time=$(cat "$COMMIT_LOCK_FILE/acquired_at")
                local lock_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$lock_time" +%s 2>/dev/null || echo "0")
                local lock_age=$((current_time - lock_epoch))

                if [ "$lock_age" -gt "$COMMIT_TIMEOUT" ]; then
                    echo "[Worker $worker_id] Detected stale lock, forcing cleanup" >&2
                    release_commit_lock "$worker_id" "force"
                    continue
                fi
            fi

            return 1
        fi

        # Wait and retry
        sleep 1
    done
}

# Release commit lock
# Args: $1 = worker_id, $2 = mode ("normal" or "force")
# Returns: 0 on success
release_commit_lock() {
    local worker_id="$1"
    local mode="${2:-normal}"

    if [ -d "$COMMIT_LOCK_FILE" ]; then
        # Verify ownership unless forcing
        if [ "$mode" != "force" ]; then
            if [ -f "$COMMIT_LOCK_FILE/owner" ]; then
                local owner=$(cat "$COMMIT_LOCK_FILE/owner")
                if [ "$owner" != "$worker_id" ]; then
                    echo "[Worker $worker_id] WARNING: Lock owned by $owner, not releasing" >&2
                    return 1
                fi
            fi
        fi

        rm -rf "$COMMIT_LOCK_FILE"
        echo "[Worker $worker_id] Commit lock released" >&2
        return 0
    fi

    return 0  # No lock to release
}

# ============================================================================
# QUEUE MANAGEMENT
# ============================================================================

# Initialize commit queue directory
initialize_commit_queue() {
    mkdir -p "$COMMIT_QUEUE_DIR"
    echo "Commit queue initialized at $COMMIT_QUEUE_DIR" >&2
}

# Enqueue a commit request from worker
# Args: $1 = worker_id, $2 = ticket_id, $3 = commit_message, $4 = file_list
# Returns: queue entry ID
enqueue_commit() {
    local worker_id="$1"
    local ticket_id="$2"
    local commit_message="$3"
    local file_list="$4"

    # Generate queue entry ID
    local timestamp=$(date +%s%N)  # nanoseconds for uniqueness
    local queue_id="${worker_id}_${timestamp}"
    local queue_file="$COMMIT_QUEUE_DIR/${queue_id}.json"

    # Create queue entry
    jq -n \
        --arg worker_id "$worker_id" \
        --arg ticket_id "$ticket_id" \
        --arg message "$commit_message" \
        --arg files "$file_list" \
        --arg queued_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        '{
            queue_id: "'$queue_id'",
            worker_id: $worker_id,
            ticket_id: $ticket_id,
            commit_message: $message,
            files: ($files | split("\n")),
            status: "queued",
            queued_at: $queued_at
        }' > "$queue_file"

    echo "$queue_id"
}

# Process next commit in queue
# Returns: 0 on success, 1 if queue empty, 2 on commit failure
process_next_commit() {
    # Find oldest queued commit
    local next_commit=$(ls -1t "$COMMIT_QUEUE_DIR"/*.json 2>/dev/null | \
                       grep -v ".completed" | \
                       tail -n 1)

    if [ -z "$next_commit" ]; then
        return 1  # Queue empty
    fi

    local queue_id=$(basename "$next_commit" .json)
    local worker_id=$(jq -r '.worker_id' "$next_commit")
    local ticket_id=$(jq -r '.ticket_id' "$next_commit")
    local commit_message=$(jq -r '.commit_message' "$next_commit")
    local files=$(jq -r '.files[]' "$next_commit")

    echo "[Queue] Processing commit for ticket $ticket_id from worker $worker_id" >&2

    # Acquire lock
    if ! acquire_commit_lock "$worker_id"; then
        echo "[Queue] Failed to acquire lock for commit" >&2
        return 2
    fi

    # Stage files
    local staged=0
    for file in $files; do
        if [ -f "$file" ]; then
            git add "$file" 2>&1 && staged=$((staged + 1))
        else
            echo "[Queue] WARNING: File not found: $file" >&2
        fi
    done

    if [ "$staged" -eq 0 ]; then
        echo "[Queue] ERROR: No files staged for commit" >&2
        release_commit_lock "$worker_id"
        return 2
    fi

    # Create commit
    if git commit -m "$commit_message" 2>&1; then
        echo "[Queue] ✓ Commit successful for ticket $ticket_id" >&2

        # Mark as completed
        jq '.status = "completed" | .completed_at = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
            "$next_commit" > "${next_commit}.completed"
        rm "$next_commit"

        release_commit_lock "$worker_id"
        return 0
    else
        echo "[Queue] ✗ Commit failed for ticket $ticket_id" >&2

        # Mark as failed
        jq '.status = "failed" | .failed_at = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
            "$next_commit" > "${next_commit}.failed"
        rm "$next_commit"

        release_commit_lock "$worker_id"
        return 2
    fi
}

# Process entire commit queue
# Returns: number of commits processed
process_commit_queue() {
    local processed=0
    local failed=0

    echo "┌─ Processing Commit Queue ──────────────────────┐" >&2

    while true; do
        process_next_commit
        local result=$?

        if [ "$result" -eq 1 ]; then
            # Queue empty
            break
        elif [ "$result" -eq 0 ]; then
            processed=$((processed + 1))
        else
            failed=$((failed + 1))
        fi
    done

    echo "│ Processed: $processed commits" >&2
    echo "│ Failed:    $failed commits" >&2
    echo "└────────────────────────────────────────────────┘" >&2

    echo "$processed"
}

# ============================================================================
# CONFLICT HANDLING
# ============================================================================

# Handle merge conflicts during commit
# Args: $1 = worker_id, $2 = ticket_id
# Returns: 0 if resolved, 1 if manual intervention needed
handle_commit_conflict() {
    local worker_id="$1"
    local ticket_id="$2"

    echo "[Worker $worker_id] Handling commit conflict for ticket $ticket_id" >&2

    # Check for conflicted files
    local conflicts=$(git diff --name-only --diff-filter=U)

    if [ -z "$conflicts" ]; then
        echo "[Worker $worker_id] No conflicts detected" >&2
        return 0
    fi

    echo "[Worker $worker_id] Conflicts detected in:" >&2
    echo "$conflicts" >&2

    # Strategy: Abort and defer ticket
    git reset --hard HEAD 2>&1
    echo "[Worker $worker_id] Conflict resolution: Ticket $ticket_id deferred" >&2

    return 1
}

# Retry failed commit with backoff
# Args: $1 = queue_id, $2 = max_retries
# Returns: 0 on success, 1 on failure
retry_failed_commit() {
    local queue_id="$1"
    local max_retries="${2:-3}"
    local retry_count=0

    local queue_file="$COMMIT_QUEUE_DIR/${queue_id}.json.failed"

    if [ ! -f "$queue_file" ]; then
        echo "ERROR: Failed commit not found: $queue_id" >&2
        return 1
    fi

    while [ "$retry_count" -lt "$max_retries" ]; do
        retry_count=$((retry_count + 1))
        echo "[Retry $retry_count/$max_retries] Retrying commit: $queue_id" >&2

        # Restore to queue
        mv "$queue_file" "$COMMIT_QUEUE_DIR/${queue_id}.json"

        # Process
        process_next_commit
        local result=$?

        if [ "$result" -eq 0 ]; then
            echo "[Retry] ✓ Commit succeeded on attempt $retry_count" >&2
            return 0
        fi

        # Exponential backoff
        local wait_time=$((2 ** retry_count))
        echo "[Retry] Waiting ${wait_time}s before retry..." >&2
        sleep "$wait_time"
    done

    echo "[Retry] ✗ Commit failed after $max_retries attempts" >&2
    return 1
}

# ============================================================================
# QUEUE STATISTICS
# ============================================================================

# Get queue statistics
get_queue_stats() {
    local queued=$(ls -1 "$COMMIT_QUEUE_DIR"/*.json 2>/dev/null | grep -v -E "\.(completed|failed)$" | wc -l | tr -d ' ')
    local completed=$(ls -1 "$COMMIT_QUEUE_DIR"/*.json.completed 2>/dev/null | wc -l | tr -d ' ')
    local failed=$(ls -1 "$COMMIT_QUEUE_DIR"/*.json.failed 2>/dev/null | wc -l | tr -d ' ')

    jq -n \
        --argjson queued "$queued" \
        --argjson completed "$completed" \
        --argjson failed "$failed" \
        '{
            queued: $queued,
            completed: $completed,
            failed: $failed,
            total: ($queued + $completed + $failed)
        }'
}

# Cleanup completed queue entries
cleanup_queue() {
    local keep_completed="${1:-10}"  # Keep last N completed for audit

    # Remove old completed entries
    ls -1t "$COMMIT_QUEUE_DIR"/*.json.completed 2>/dev/null | \
        tail -n +$((keep_completed + 1)) | \
        xargs rm -f 2>/dev/null || true

    echo "Queue cleanup complete" >&2
}

# ============================================================================
# EXPORTS
# ============================================================================

export -f acquire_commit_lock
export -f release_commit_lock
export -f initialize_commit_queue
export -f enqueue_commit
export -f process_next_commit
export -f process_commit_queue
export -f handle_commit_conflict
export -f retry_failed_commit
export -f get_queue_stats
export -f cleanup_queue
