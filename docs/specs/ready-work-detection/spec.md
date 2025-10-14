# Ready-Work Detection Specification

**Version:** 1.0
**Status:** Draft
**Created:** 2025-10-14
**Component:** Dependency-Aware Work Queue Scheduler
**Based on:** steveyegge/beads ready-work detection algorithm analysis

---

## 1. Overview

### Purpose
Implement automatic ready-work detection in Sage-Dev's `/sage.stream` command, enabling AI agents to automatically identify and execute tickets in dependency-safe order without manual filtering or intervention.

### Business Value
- **80% Reduction** in manual ticket filtering and ordering
- **Zero Dependency Errors**: Prevents execution of tickets with unmet dependencies
- **Optimal Execution Order**: Maximizes parallelization opportunities while respecting constraints
- **Developer Productivity**: AI agents work autonomously on correct tickets
- **Audit Trail**: Clear reasoning for ticket execution order

### Success Metrics
- Ready-work query identifies 100% of eligible tickets
- Zero false positives (blocked tickets marked as ready)
- Execution order respects all dependency constraints
- Performance: <50ms query time for 100 tickets
- Reduces `/sage.stream` manual intervention by 80%+

### Target Users
- **Primary**: AI coding agents executing `/sage.stream` workflows
- **Secondary**: Human developers reviewing automated execution plans
- **Tertiary**: Project managers tracking ticket readiness status

---

## 2. Functional Requirements

### FR-1: Ready-Work Identification

The system **shall** automatically identify tickets eligible for immediate execution.

#### FR-1.1: Ready-Work Criteria
A ticket is "ready" when ALL conditions are met:
1. `state == "UNPROCESSED"`
2. `blockedBy` field is empty OR all tickets in `blockedBy` have `state == "COMPLETED"`
3. If `parent` exists, parent ticket is not `DEFERRED` or `FAILED`
4. Ticket has no dependency cycles (validated separately)

**As a user story**: "As an AI agent, I want to automatically know which tickets I can work on right now so that I don't waste time on blocked work"

#### FR-1.2: Ready-Work Query
```bash
# Core algorithm
jq -r '.tickets[] |
  select(
    .state == "UNPROCESSED" and
    ((.blockedBy // []) as $blocked |
      if ($blocked | length) == 0 then true
      else
        $blocked | map(. as $bid |
          $tickets | map(select(.id == $bid and .state == "COMPLETED")) | length > 0
        ) | all
      end
    )
  ) | .id' .sage/tickets/index.json
```

**Input**: `.sage/tickets/index.json`
**Output**: Array of ticket IDs ready for execution, ordered by priority

#### FR-1.3: Execution Order Calculation
The system **shall** compute optimal execution order using:
1. **Priority Sorting**: P0 before P1 before P2
2. **Dependency Depth**: Tickets with more dependents execute first
3. **Component Grouping**: Same-component tickets batched together (for semi-auto mode)
4. **Estimation-Based**: Shorter tasks interleaved for pipeline efficiency (optional)

**Business Rule**: Priority overrides all other ordering factors

### FR-2: Dependency-Aware Streaming

The system **shall** enhance `/sage.stream` with dependency awareness.

#### FR-2.1: Mode Detection
```bash
# New flag: --dependency-aware (opt-in for Phase 1)
/sage.stream --dependency-aware
/sage.stream --auto --dependency-aware
/sage.stream --semi-auto --dependency-aware
```

**Behavior Changes**:
- **Without flag**: Current behavior (process all UNPROCESSED tickets in ID order)
- **With flag**: Process only ready-work tickets in dependency order

#### FR-2.2: Dynamic Re-evaluation
After each ticket completion, system **shall**:
1. Update ticket state to COMPLETED
2. Recompute `blockedBy` for all tickets
3. Re-run ready-work query
4. Update execution queue with newly unblocked tickets

**Example Flow**:
```
Initial: DEPS-001 blocks READY-001
Queue: [DEPS-001]
After DEPS-001 completion:
  → Recompute blockedBy for READY-001 (now empty)
  → Ready-work query finds READY-001
  → Queue: [READY-001]
```

#### FR-2.3: Blocked Ticket Reporting
At workflow start, system **shall** report:
```
📊 Ticket Queue Status

Ready to Execute (3):
  ✅ DEPS-001 (P0) - No blockers
  ✅ SEARCH-001 (P1) - No blockers
  ✅ CONTEXT-002 (P1) - No blockers

Blocked (2):
  ⏸️  READY-001 (P0) - Blocked by: DEPS-001
  ⏸️  SKILLS-003 (P1) - Blocked by: CONTEXT-002, READY-001

Total: 5 tickets (3 ready, 2 blocked)
```

### FR-3: Parallel Execution Integration

The system **shall** integrate with existing `/sage.stream --parallel` mode.

#### FR-3.1: Parallel-Safe Batching
When `--dependency-aware --parallel=N` flags combined:
1. Identify ready-work tickets
2. Build dependency graph
3. Find independent ticket sets (no mutual dependencies)
4. Execute up to N independent tickets concurrently
5. Wait for batch completion before next batch

**Example**:
```
Ready tickets: DEPS-001, SEARCH-001, CONTEXT-002
Dependencies: DEPS-001 → READY-001 → SKILLS-003
              SEARCH-001 (independent)
              CONTEXT-002 (independent)

Batch 1 (parallel): [DEPS-001, SEARCH-001, CONTEXT-002]
Batch 2 (sequential): [READY-001]
Batch 3 (sequential): [SKILLS-003]
```

#### FR-3.2: Dependency Conflict Prevention
System **shall** never execute tickets in parallel if:
- One blocks the other (direct or transitive)
- Both modify same files (detected via component prefix heuristic)
- One is parent of the other

### FR-4: Status Tracking

The system **shall** maintain ready-work execution metadata.

#### FR-4.1: Execution Log
```bash
# .sage/ready-work.log
2025-10-14T10:00:00Z | READY_QUERY | Found 3 ready tickets: DEPS-001, SEARCH-001, CONTEXT-002
2025-10-14T10:05:00Z | EXECUTING | DEPS-001 (P0)
2025-10-14T10:15:00Z | COMPLETED | DEPS-001 → Unblocked: READY-001
2025-10-14T10:15:01Z | READY_QUERY | Found 3 ready tickets: SEARCH-001, CONTEXT-002, READY-001
2025-10-14T10:15:02Z | EXECUTING | READY-001 (P0)
```

#### FR-4.2: Velocity Metrics
Track and report:
- Time from "blocked" → "ready" (dependency resolution time)
- Time from "ready" → "started" (queue wait time)
- Time from "started" → "completed" (execution time)
- Number of tickets unblocked per completion

**Output**: `.sage/dependency-velocity.json`

---

## 3. Non-Functional Requirements

### NFR-1: Performance
- Ready-work query: <50ms for 100 tickets
- Ready-work query: <200ms for 500 tickets
- Dependency graph construction: <100ms for 100 tickets
- Re-evaluation after ticket completion: <100ms
- No performance degradation vs. non-dependency-aware mode for tickets without dependencies

### NFR-2: Correctness
- **Zero false positives**: Never mark blocked ticket as ready
- **Zero false negatives**: Never skip ready ticket (unless explicitly deferred)
- **Cycle safety**: Detect and reject cyclic dependencies before execution
- **State consistency**: Execution order provably satisfies all dependency constraints

### NFR-3: Usability
- Clear status reporting (ready vs. blocked tickets)
- Human-readable explanations for why tickets are blocked
- `--dry-run` mode shows execution order without running tickets
- `--explain <ticket-id>` shows dependency chain and blocking reasons

### NFR-4: Compatibility
- Backward compatible with existing `/sage.stream` workflows
- Opt-in via `--dependency-aware` flag (Phase 1)
- Defaults to dependency-aware mode in Phase 2 (auto-detect)
- Works with all existing modes: interactive, semi-auto, auto, parallel, dry-run

---

## 4. Features & Flows

### Feature 1: Ready-Work Query Engine (Priority: P0)

**Flow: Identifying Ready Tickets**
1. Load `.sage/tickets/index.json`
2. Filter tickets: `state == "UNPROCESSED"`
3. For each filtered ticket:
   a. Check `blockedBy` field
   b. If empty → READY
   c. If non-empty → Verify all blockers are COMPLETED
   d. If any blocker not COMPLETED → BLOCKED
4. Sort ready tickets by priority (P0 > P1 > P2)
5. Return ordered list

**Input**: Ticket index with dependency metadata
**Output**: `["DEPS-001", "SEARCH-001", "CONTEXT-002"]`

**Edge Cases**:
- All tickets blocked → Return empty list, report blocked status
- No UNPROCESSED tickets → Return empty list, report "All work complete"
- Cyclic dependencies → Error before reaching this stage (validation catches)

### Feature 2: Dependency-Aware Stream Execution (Priority: P0)

**Flow: Stream with Dependency Awareness**
1. User runs: `/sage.stream --dependency-aware`
2. System runs ready-work query
3. If no ready tickets:
   - Report blocked tickets with reasons
   - Exit with message: "No ready work. Resolve blockers first."
4. If ready tickets found:
   - Display execution plan
   - Confirm with user (interactive/semi-auto) or proceed (auto)
   - Execute first ready ticket
   - On completion:
     a. Mark ticket COMPLETED
     b. Re-run ready-work query
     c. Continue with next ready ticket
5. Repeat until no ready tickets remain

**User Interaction (Interactive Mode)**:
```
📊 Ready-Work Queue (3 tickets)

Next ticket: DEPS-001 (P0) - Enhanced Dependencies Schema
  Blockers: None
  Will unblock: READY-001

Proceed with DEPS-001? (yes/no/skip): _
```

**User Interaction (Semi-Auto Mode)**:
```
🔄 Component: DEPS (1 ticket)
  ✅ DEPS-001 (P0) - Ready

Start component DEPS? (yes/no/skip): yes

→ Processing DEPS-001...
✅ DEPS-001 completed (unblocked: READY-001)

Continue to READY component? (yes/no/pause): _
```

### Feature 3: Execution Explanation (Priority: P1)

**Flow: Explaining Blocked Ticket**
```bash
/sage.stream --explain SKILLS-003
```

**Output**:
```
📋 Ticket: SKILLS-003 - Skills Library Framework
State: UNPROCESSED
Status: ⏸️  BLOCKED

Blocking Dependencies (2):
  1. CONTEXT-002 (P1) - Initialize .sage/agent/ Directory
     Status: UNPROCESSED (not started)

  2. READY-001 (P0) - Ready-Work Detection
     Status: UNPROCESSED (blocked by DEPS-001)
     Chain: DEPS-001 → READY-001 → SKILLS-003

Dependency Chain:
  DEPS-001 (root) → READY-001 → SKILLS-003 (leaf)
  CONTEXT-002 (root) → SKILLS-003 (leaf)

To unblock SKILLS-003:
  1. Complete DEPS-001 (will unblock READY-001)
  2. Complete READY-001
  3. Complete CONTEXT-002

Estimated ready time: After 3 tickets complete
```

### Feature 4: Dry-Run Mode (Priority: P1)

**Flow: Preview Execution Order**
```bash
/sage.stream --dependency-aware --dry-run
```

**Output**:
```
🔍 Execution Plan (Dry Run)

Batch 1 (Parallel possible: 3 independent tickets):
  1. DEPS-001 (P0) - Enhanced Dependencies
  2. SEARCH-001 (P1) - Context Search
  3. CONTEXT-002 (P1) - Agent Directory Structure

Batch 2 (Sequential: 1 ticket):
  4. READY-001 (P0) - Ready-Work Detection
     └─ Depends on: DEPS-001

Batch 3 (Sequential: 1 ticket):
  5. SKILLS-003 (P1) - Skills Library
     └─ Depends on: READY-001, CONTEXT-002

Total: 5 tickets in 3 batches
Estimated time: 4 weeks (sequential) or 2.5 weeks (parallel)

No tickets will be executed (dry-run mode).
```

---

## 5. Acceptance Criteria

### AC-1: Ready-Work Query Accuracy
- [ ] Query identifies all UNPROCESSED tickets with no blockers
- [ ] Query excludes all tickets with active blockers
- [ ] Query handles empty `blockedBy` fields correctly
- [ ] Query respects parent ticket state constraints
- [ ] Query performance <50ms for 100 tickets

### AC-2: Stream Integration
- [ ] `--dependency-aware` flag activates ready-work mode
- [ ] Non-ready tickets skipped during execution
- [ ] Dynamic re-evaluation after each ticket completion
- [ ] Clear status reporting for ready vs. blocked tickets
- [ ] Backward compatible with existing `/sage.stream` flags

### AC-3: Execution Order
- [ ] Priority sorting (P0 > P1 > P2) enforced
- [ ] Dependency constraints satisfied in execution order
- [ ] Parallel mode executes only independent tickets concurrently
- [ ] No ticket executes before its blockers complete

### AC-4: User Experience
- [ ] `--explain` shows clear blocking reasons
- [ ] `--dry-run` previews execution order without changes
- [ ] Error messages guide users to resolve blockers
- [ ] Execution log tracks dependency resolution

### AC-5: Edge Cases
- [ ] Handles all tickets blocked gracefully
- [ ] Handles no UNPROCESSED tickets gracefully
- [ ] Handles mix of blocked and ready tickets correctly
- [ ] Handles tickets with multiple blockers correctly

---

## 6. Dependencies

### Technical Dependencies
- **Requires**: DEPS-001 (Enhanced Dependencies) - `blockedBy` field must exist
- **Requires**: `jq` for JSON querying
- **Requires**: Existing `/sage.stream` command infrastructure

### Component Dependencies
- **Blocked By**: DEPS-001 (Enhanced Dependencies Schema) - Must complete first
- **Blocks**: None - Other components can develop in parallel
- **Related**: SEARCH-001 (Context Search) - May query dependency metadata
- **Related**: SKILLS-003 (Skills Library) - May use ready-work for skill prerequisites

### External Integrations
- **Git**: Execution commits reference dependency resolution
- **GitHub**: `/sage.sync` may sync ready-work status

### Assumptions
- `.sage/tickets/index.json` is accessible and well-formed
- Dependency metadata follows schema from DEPS-001
- Tickets don't change state during query execution (atomic reads)
- File system supports atomic file operations

### Risks & Mitigations
- **Risk**: Query performance degrades with 1000+ tickets
  - **Mitigation**: Optimize jq queries, consider SQLite in Phase 3
- **Risk**: Complex dependency graphs confuse users
  - **Mitigation**: Visual dependency graph generation (optional enhancement)
- **Risk**: Race conditions in parallel mode
  - **Mitigation**: Lock-based ticket state transitions, serial commits

---

## 7. Source Traceability

**Research Source**: Analysis of steveyegge/beads repository (2025-10-14)
- Beads automatic ready-work detection algorithm
- Beads dependency resolution (blocks, blocked-by relationships)
- Beads ~10-100ms query performance benchmarks

**Alignment with Sage-Dev**:
- Integrates with existing `/sage.stream` automation
- Preserves all stream modes (interactive, semi-auto, auto, parallel)
- Supports fail-fast philosophy (prevents invalid execution)
- Maintains git-based audit trail
- Opt-in design for Phase 1 rollout

**Related Specifications**:
- Enhanced Dependencies: `docs/specs/enhanced-dependencies/spec.md` (dependency)
- Context Search: `docs/specs/context-search/spec.md` (may query dependencies)
- Skills Library: `docs/specs/skills-library/spec.md` (may use ready-work logic)

**Implementation Strategy**:
- Phase 1: Opt-in via `--dependency-aware` flag
- Phase 2: Auto-detect dependency usage, default to dependency-aware
- Phase 3: SQLite query optimization for 1000+ ticket projects
