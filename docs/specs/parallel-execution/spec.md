# Parallel Execution Specification

**Component:** Stream Command
**Feature ID:** PAR-001
**Version:** 1.0
**Last Updated:** 2025-10-06

## Overview

Extend the `/stream` command to support parallel ticket processing, enabling concurrent execution of independent tickets through multiple sub-agents with automatic dependency resolution and commit serialization.

## Objectives

1. **Reduce cycle time** by 2-3× for large ticket queues
2. **Maximize resource utilization** through concurrent API calls
3. **Maintain safety** with dependency validation and commit serialization
4. **Preserve compatibility** with existing sequential workflows

## Architecture

### Component Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                    /stream --auto --parallel=3              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─→ [Mode Detection & Validation]
                              │
                              ├─→ [Dependency Graph Builder]
                              │    (.sage/lib/parallel-scheduler.sh)
                              │    • Build DAG from tickets
                              │    • Detect circular dependencies
                              │    • Calculate critical path
                              │
                              ├─→ [Batch Selector]
                              │    • Find independent tickets
                              │    • Group into batches of N
                              │    • Sort by priority
                              │
                              ├─→ [Parallel Worker Manager]
                              │    ┌─────────┐  ┌─────────┐  ┌─────────┐
                              │    │ Worker 1│  │ Worker 2│  │ Worker 3│
                              │    │ TKT-001 │  │ TKT-002 │  │ TKT-003 │
                              │    └─────────┘  └─────────┘  └─────────┘
                              │         │            │            │
                              │         └────────────┴────────────┘
                              │                     │
                              ├─→ [Commit Queue Manager]
                              │    (.sage/lib/commit-queue.sh)
                              │    • Queue commits from workers
                              │    • File locking (mkdir atomic)
                              │    • Sequential application
                              │    • Conflict detection
                              │
                              └─→ [Progress Aggregator]
                                   • Batch metrics
                                   • Velocity tracking
                                   • Efficiency reporting
```

### Data Flow

```text
1. Ticket Index (.sage/tickets/index.json)
   │
   ├─→ Dependency Graph Builder
   │   └─→ Graph JSON (adjacency list)
   │
   ├─→ Batch Selector
   │   └─→ Batch Array [TKT-001, TKT-002, TKT-003]
   │
   ├─→ Worker Manager (launches sub-agents)
   │   │
   │   ├─→ Worker 1: Task(implement TKT-001)
   │   ├─→ Worker 2: Task(implement TKT-002)
   │   └─→ Worker 3: Task(implement TKT-003)
   │       │
   │       └─→ enqueue_commit(worker_id, ticket_id, message, files)
   │
   └─→ Commit Queue
       └─→ Sequential commits (serialized)
```

## Functional Specification

### FS1: Parallel Mode Activation

**Trigger:** User runs `/stream --auto --parallel=N`

**Preconditions:**

- Workflow mode is TICKET_BASED
- Ticket system exists (`.sage/tickets/index.json`)
- UNPROCESSED tickets with satisfied dependencies exist
- Clean git state

**Validation:**

```bash
# Reject if not in auto mode
if [ "$EXECUTION_MODE" != "auto" ] && [ "$PARALLEL_MODE" = "true" ]; then
  echo "ERROR: --parallel requires --auto mode"
  exit 1
fi

# Validate worker count
if ! [[ "$PARALLEL_WORKERS" =~ ^[0-9]+$|^auto$ ]]; then
  echo "ERROR: Invalid --parallel value"
  exit 1
fi
```

**Outcomes:**

- ✅ Parallel mode enabled with N workers
- ❌ Error if incompatible mode combination

### FS2: Dependency Graph Analysis

**Function:** `build_dependency_graph(tickets_index)`

**Algorithm:**

```python
def build_dependency_graph(tickets):
    graph = {}

    for ticket in tickets:
        graph[ticket.id] = {
            'state': ticket.state,
            'dependencies': ticket.dependencies or [],
            'dependents': []  # Reverse edges
        }

    # Build reverse dependencies
    for ticket_id, node in graph.items():
        for dep in node['dependencies']:
            if dep in graph:
                graph[dep]['dependents'].append(ticket_id)

    return graph
```

**Circular Dependency Detection:**

```python
def detect_cycles(graph):
    visited = set()
    rec_stack = set()

    def dfs(node):
        visited.add(node)
        rec_stack.add(node)

        for neighbor in graph[node]['dependencies']:
            if neighbor not in visited:
                if dfs(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True  # Cycle detected

        rec_stack.remove(node)
        return False

    for node in graph:
        if node not in visited:
            if dfs(node):
                return True  # Cycle found

    return False  # No cycles
```

**Output:**

```json
{
  "graph": {
    "TKT-001": {
      "state": "UNPROCESSED",
      "dependencies": [],
      "dependents": ["TKT-003"]
    },
    "TKT-002": {
      "state": "UNPROCESSED",
      "dependencies": [],
      "dependents": ["TKT-003"]
    },
    "TKT-003": {
      "state": "UNPROCESSED",
      "dependencies": ["TKT-001", "TKT-002"],
      "dependents": []
    }
  },
  "stats": {
    "total": 3,
    "unprocessed": 3,
    "completed": 0
  }
}
```

### FS3: Batch Selection

**Function:** `find_parallel_batch(graph, batch_size)`

**Selection Criteria:**

1. State = UNPROCESSED
2. All dependencies COMPLETED
3. No mutual dependencies within batch
4. Sort by priority (P0 > P1 > P2)

**Algorithm:**

```python
def find_parallel_batch(graph, batch_size):
    candidates = []

    # Find tickets with satisfied dependencies
    for ticket_id, node in graph.items():
        if node['state'] != 'UNPROCESSED':
            continue

        # Check all dependencies are completed
        deps_satisfied = all(
            graph[dep]['state'] == 'COMPLETED'
            for dep in node['dependencies']
        )

        if deps_satisfied:
            candidates.append(ticket_id)

    # Sort by priority
    candidates.sort(key=lambda t: graph[t]['priority'])

    # Return first N
    return candidates[:batch_size]
```

**Output:**

```json
["TKT-001", "TKT-002", "UI-005"]
```

### FS4: Worker Allocation

**Function:** `determine_worker_count(requested, available)`

**Auto-Detection:**

```bash
# Get CPU cores (macOS)
cpu_cores=$(sysctl -n hw.ncpu)

# Conservative allocation: half of cores
optimal=$((cpu_cores / 2))

# Cap at 8 (API rate limit safety)
if [ "$optimal" -gt 8 ]; then
  optimal=8
fi

# Cap at available tickets
if [ "$optimal" -gt "$available_tickets" ]; then
  optimal="$available_tickets"
fi

# Minimum 1
if [ "$optimal" -lt 1 ]; then
  optimal=1
fi
```

**Manual Override:**

```bash
# Use exactly N workers if specified
if [[ "$requested" =~ ^[0-9]+$ ]]; then
  workers=$requested

  # Still cap at available
  if [ "$workers" -gt "$available_tickets" ]; then
    workers="$available_tickets"
  fi
fi
```

### FS5: Parallel Worker Execution

**Worker Prompt Template:**

```markdown
Execute implementation for ticket: {TICKET_ID}

**Worker Context:**
- Worker ID: {WORKER_ID}
- Parallel Batch Mode: ENABLED
- Commit Strategy: Queue for serialization

**Ticket Details:**
[Load from .sage/tickets/index.json]

**Critical Instructions:**
1. Mark ticket IN_PROGRESS
2. Read context documents (spec, plan, breakdown)
3. Follow Ticket Clearance Methodology
4. DO NOT commit directly - use commit queue:
   source .sage/lib/commit-queue.sh
   enqueue_commit "$WORKER_ID" "$TICKET_ID" "message" "files"
5. Update ticket state: COMPLETED or DEFERRED
6. Return outcome summary

**Important:**
- Only work on ticket {TICKET_ID}
- Do not interfere with other workers
- Use .sage/workers/{WORKER_ID}/ for temporary files
```

**Spawning:**

```bash
for TICKET_ID in "${TICKET_BATCH[@]}"; do
  WORKER_ID="worker-${WORKER_NUM}"

  # Launch in background
  (
    RESULT=$(Task \
      description="Implement $TICKET_ID" \
      prompt="$(cat worker-prompt.txt)" \
      subagent_type="general-purpose")

    echo "$RESULT" > "$WORKER_DIR/${WORKER_ID}-result.txt"
  ) &

  WORKER_PID=$!
  WORKER_PIDS+=("$WORKER_PID")
done
```

### FS6: Commit Queue Management

**Queue Entry Format:**

```json
{
  "queue_id": "worker-1_1696634567890",
  "worker_id": "worker-1",
  "ticket_id": "TKT-001",
  "commit_message": "feat(auth): implement login form\n\nCloses: #TKT-001",
  "files": ["src/auth/login.ts", "src/auth/login.test.ts"],
  "status": "queued",
  "queued_at": "2025-10-06T12:34:56Z"
}
```

**File Locking:**

```bash
# Atomic lock acquisition (macOS compatible)
acquire_commit_lock() {
  local worker_id="$1"

  # mkdir is atomic
  if mkdir "$COMMIT_LOCK_FILE" 2>/dev/null; then
    echo "$worker_id" > "$COMMIT_LOCK_FILE/owner"
    return 0
  fi

  # Lock held by another worker, wait
  return 1
}
```

**Sequential Processing:**

```bash
process_commit_queue() {
  while [ -n "$(ls $COMMIT_QUEUE_DIR/*.json 2>/dev/null)" ]; do
    NEXT=$(ls -1t $COMMIT_QUEUE_DIR/*.json | tail -n 1)

    # Acquire lock
    acquire_commit_lock "queue-processor"

    # Apply commit
    git add $(jq -r '.files[]' "$NEXT")
    git commit -m "$(jq -r '.commit_message' "$NEXT")"

    # Release lock
    release_commit_lock "queue-processor"

    # Mark complete
    mv "$NEXT" "${NEXT}.completed"
  done
}
```

## Non-Functional Specification

### NFS1: Performance

**Targets:**

- Graph build: < 1s for 100 tickets
- Batch selection: < 500ms
- Commit serialization: < 2s per commit
- Total overhead: < 5s per batch

**Metrics:**

```bash
# Track in .sage/stream-velocity.log
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $BATCH_DURATION batch-$BATCH_NUM $WORKER_COUNT" \
  >> .sage/stream-velocity.log
```

### NFS2: Reliability

**Error Handling:**

- Worker failure: Continue with other workers, defer failed ticket
- Lock timeout: 5 minutes, then force-break stale locks
- API throttling: Fail gracefully, report to user
- Circular deps: Detect before execution, fail fast

**Rollback Support:**

```bash
# On failure, tickets remain IN_PROGRESS
# User can:
/rollback  # Restore to pre-cycle state
/implement TKT-001  # Retry individual ticket
```

### NFS3: Observability

**Progress Display:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All 3 workers launched, monitoring progress...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Worker 1 completed: TKT-001 (4m 32s)
✅ Worker 3 completed: TKT-003 (5m 12s)
✅ Worker 2 completed: TKT-002 (5m 45s)
```

**Metrics Reporting:**

```
┌─ Parallel Execution Metrics ───────────────────┐
│  Workers:          3
│  Total Batches:    3
│  Avg Batch Time:   6m 11s
│  Commits Applied:  9
│  Time Saved:       ~37 minutes
│  Efficiency:       2.5× faster than sequential
└────────────────────────────────────────────────┘
```

## Interface Specification

### Command Interface

```bash
# Parallel with manual worker count
/stream --auto --parallel=3

# Parallel with auto-detection
/stream --auto --parallel=auto

# Sequential (default, unchanged)
/stream --auto
```

### Library Interface

**parallel-scheduler.sh:**

```bash
# Exported functions
build_dependency_graph(tickets_index) → graph_json
detect_circular_dependencies(graph_json) → exit_code
find_parallel_batch(graph_json, batch_size) → ticket_ids[]
determine_worker_count(requested, available) → worker_count
calculate_batch_statistics(graph_json, workers) → stats_json
```

**commit-queue.sh:**

```bash
# Exported functions
initialize_commit_queue() → void
acquire_commit_lock(worker_id) → exit_code
release_commit_lock(worker_id) → void
enqueue_commit(worker_id, ticket_id, message, files) → queue_id
process_commit_queue() → commits_processed
```

## Validation Specification

### Input Validation

```bash
# Parallel mode prerequisites
✓ jq installed
✓ .sage/lib/parallel-scheduler.sh exists and valid
✓ .sage/lib/commit-queue.sh exists and valid
✓ Execution mode is auto
✓ Worker count is number or "auto"
✓ Ticket system exists
```

### Output Validation

```bash
# Post-execution checks
✓ All batch tickets marked COMPLETED or DEFERRED
✓ All commits applied sequentially
✓ No orphaned worker processes
✓ No stale locks in .sage/commit.lock
✓ Velocity data logged to .sage/stream-velocity.log
```

## Edge Cases

### EC1: Single Independent Ticket

- Batch size = 1
- Sequential execution
- No parallelization overhead

### EC2: All Tickets Dependent

- Only first ticket executable
- Subsequent batches process sequentially
- Graceful degradation to sequential

### EC3: Mixed Batch Sizes

- Last batch may have < N workers
- Example: 10 tickets, 3 workers → batches of [3, 3, 3, 1]
- System handles variable batch sizes

### EC4: Worker Count > Available Tickets

- Cap workers at ticket count
- Example: `--parallel=5` with 2 tickets → 2 workers

## Security Considerations

**SC1: Command Injection**

- Sanitize ticket IDs (alphanumeric + dash only)
- Quote all file paths in commits
- Validate commit messages (no shell metacharacters)

**SC2: Race Conditions**

- File locking prevents concurrent commits
- Atomic mkdir for lock acquisition
- Timeout prevents deadlocks

**SC3: Resource Exhaustion**

- Cap workers at 8 (prevent API abuse)
- Lock timeout at 5 minutes
- Worker monitoring prevents zombie processes

## Acceptance Tests

```bash
# AT1: Basic parallel execution
/stream --auto --parallel=3
# Expected: 3 tickets processed concurrently

# AT2: Auto worker detection
/stream --auto --parallel=auto
# Expected: Workers = CPU/2, capped 1-8

# AT3: Dependency handling
# Setup: TKT-001, TKT-002 independent; TKT-003 depends on both
/stream --auto --parallel=3
# Expected: Batch 1 = [TKT-001, TKT-002], Batch 2 = [TKT-003]

# AT4: Circular dependency rejection
# Setup: TKT-001 → TKT-002 → TKT-001
/stream --auto --parallel=3
# Expected: ERROR with circular dependency message

# AT5: Commit serialization
# Setup: 3 tickets modifying same file
# Expected: All commits applied sequentially, no conflicts
```

## Appendix: Configuration

### Environment Variables

```bash
# Optional tuning
export COMMIT_LOCK_FILE=".sage/commit.lock"
export COMMIT_QUEUE_DIR=".sage/commit-queue"
export COMMIT_TIMEOUT="300"  # 5 minutes
```

### Feature Flags

```bash
# Future: Add to .sage/config.json
{
  "parallel": {
    "enabled": true,
    "max_workers": 8,
    "default_mode": "auto",
    "graph_cache_ttl": 300
  }
}
```
