# Tasks: Ready-Work Detection

**From:** `spec.md` + `plan.md`
**Timeline:** 1 week, 1 sprint (with parallelization)
**Team:** 1-2 backend engineers
**Created:** 2025-10-14

## Summary
- Total tasks: 10
- Estimated effort: 31 story points (124 hours)
- Critical path duration: 1 week (with parallel execution)
- Key risks: Performance at scale, dependency on DEPS-001 completion, complex dry-run logic

## Phase Breakdown

### Phase 1: Core Implementation (Sprint 1, 10 story points)
**Goal:** Ready-work detection integrated with /sage.stream
**Deliverable:** Working --dependency-aware mode

#### Tasks

**[READY-002] Implement Ready-Work Query Engine**

- **Description:** Create .sage/lib/ready-work-query.sh to filter UNPROCESSED tickets with empty blockedBy arrays. Query should check all blockers are COMPLETED if blockedBy is non-empty. Sort results by priority (P0 > P1 > P2).
- **Acceptance:**
  - [ ] .sage/lib/ready-work-query.sh created
  - [ ] Filters tickets where state == "UNPROCESSED"
  - [ ] Excludes tickets with non-empty blockedBy
  - [ ] For non-empty blockedBy, checks all blockers are COMPLETED
  - [ ] Results sorted by priority (P0 first, then P1, P2)
  - [ ] Returns ticket IDs as newline-separated list
  - [ ] Performance < 50ms for 100 tickets
  - [ ] Empty result handled gracefully (returns empty, no errors)
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-001 (Enhanced Dependencies)
- **Priority:** P0 (Blocker)

**[READY-003] Add --dependency-aware Flag to Stream**

- **Description:** Modify commands/sage.stream.md Step 0 to parse --dependency-aware flag. Set DEPENDENCY_AWARE variable and display mode banner. Validate flag compatibility (error if combined with --parallel in Phase 1).
- **Acceptance:**
  - [ ] --dependency-aware flag parsing added to Step 0
  - [ ] DEPENDENCY_AWARE variable set to true/false
  - [ ] Mode banner displays: "Dependency-Aware Mode: Only ready work will be processed"
  - [ ] Error if combined with --parallel: "Error: --dependency-aware not compatible with --parallel in Phase 1"
  - [ ] Compatible with --dry-run, --interactive, --auto modes
  - [ ] Backward compatible (stream works without flag)
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** READY-002
- **Priority:** P0 (Blocker)

**[READY-004] Implement Dynamic Re-Evaluation**

- **Description:** Add Step 4.5 to stream.md to recompute dependencies after ticket completion. Call resolve-dependencies.sh to update blockedBy fields. Detect and display newly unblocked tickets.
- **Acceptance:**
  - [ ] Step 4.5 added after ticket marked COMPLETED
  - [ ] Calls bash .sage/lib/resolve-dependencies.sh
  - [ ] Compares before/after ready-work query results
  - [ ] Displays newly unblocked tickets: "✅ Unblocked: TICKET-ID"
  - [ ] Updates READY_TICKETS queue with new tickets
  - [ ] Performance overhead < 100ms per completion
  - [ ] Handles case where no tickets unblocked (silent)
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** READY-003
- **Priority:** P0 (Critical)

**[READY-005] Implement Status Reporting**

- **Description:** Enhance Step 1 in stream.md to display ready vs blocked ticket counts when --dependency-aware mode is active. Show queue status clearly to user.
- **Acceptance:**
  - [ ] Step 1 displays status when DEPENDENCY_AWARE=true
  - [ ] Format: "📊 Queue Status: N ready, M blocked"
  - [ ] Counts accurate (sums to total UNPROCESSED)
  - [ ] Status updates after dynamic re-evaluation
  - [ ] Handles edge cases: 0 ready, 0 blocked, all ready, all blocked
  - [ ] Does not display in non-dependency-aware mode
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** READY-003
- **Priority:** P0 (Critical)

---

### Phase 2: Enhanced Features (Sprint 1, 11 story points)
**Goal:** Debugging and planning tools
**Deliverable:** --explain and --dry-run modes

#### Tasks

**[READY-006] Implement --explain Flag**

- **Description:** Add --explain <ticket-id> flag to stream.md that displays why a ticket is blocked. Show all blockers with their states and titles. Display dependency chain if deep.
- **Acceptance:**
  - [ ] --explain <ticket-id> flag parsing in Step 0
  - [ ] Displays ticket ID and current state
  - [ ] Status shown: "✅ READY" or "⏸️ BLOCKED"
  - [ ] If blocked, lists all blockers with format: "- BLOCKER-ID (STATE): Title"
  - [ ] Blocker states color-coded (COMPLETED green, others yellow/red)
  - [ ] Exits after displaying explanation (no execution)
  - [ ] Handles non-existent ticket ID gracefully
  - [ ] Handles ticket with no blockers (shows READY status)
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** READY-002
- **Priority:** P1 (High)

**[READY-007] Implement --dry-run Execution Plan**

- **Description:** Add --dry-run mode that previews execution order in dependency-aware mode. Simulate ticket completions and show batches by dependency level without executing any tickets.
- **Acceptance:**
  - [ ] --dry-run flag works with --dependency-aware
  - [ ] Displays "🔍 Execution Plan (Dry Run)" header
  - [ ] Groups tickets into batches by dependency level
  - [ ] Batch 1: Currently ready tickets
  - [ ] Batch 2: Tickets ready after Batch 1 completes
  - [ ] Continues until all tickets scheduled
  - [ ] Format: "Batch N (Ready Now): TICKET-ID - Title"
  - [ ] Footer: "No tickets will be executed (dry-run mode)"
  - [ ] Exits after displaying plan (exit code 0)
  - [ ] Handles circular dependencies (should not occur if validation passed)
- **Effort:** 5 story points (20 hours)
- **Owner:** Backend Engineer
- **Dependencies:** READY-002
- **Priority:** P1 (High)

**[READY-008] Performance Optimization**

- **Description:** Optimize ready-work query for large ticket sets (100-500 tickets). Implement blocker state caching using bash associative arrays to avoid repeated jq queries.
- **Acceptance:**
  - [ ] Blocker states cached in associative array
  - [ ] Cache populated once per query
  - [ ] Ready-work query reuses cached states
  - [ ] Performance < 50ms for 100 tickets (baseline)
  - [ ] Performance < 200ms for 500 tickets (optimized)
  - [ ] Memory usage reasonable (< 10MB for 500 tickets)
  - [ ] Cache invalidated after dependency updates
  - [ ] Benchmark results documented
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** READY-004
- **Priority:** P1 (Medium)

---

### Phase 3: Testing & Documentation (Sprint 1, 10 story points)
**Goal:** Comprehensive testing and user documentation
**Deliverable:** Test suite, updated docs

#### Tasks

**[READY-009] Create Unit Test Suite**

- **Description:** Write unit tests for ready-work query logic. Test filtering, blocker state checking, priority sorting, and edge cases (empty blockedBy, all blockers COMPLETED, mixed states).
- **Acceptance:**
  - [ ] Test: Ready-work query with no blockers → all UNPROCESSED returned
  - [ ] Test: Ready-work query with active blockers → blocked tickets excluded
  - [ ] Test: Ready-work query with COMPLETED blockers → unblocked tickets included
  - [ ] Test: Priority sorting → P0 before P1 before P2
  - [ ] Test: Mixed blocker states → only all-COMPLETED tickets ready
  - [ ] Test: Empty UNPROCESSED set → empty result
  - [ ] Test: All tickets blocked → empty result
  - [ ] Test: Performance with 100 tickets < 50ms
  - [ ] 80%+ code coverage for ready-work-query.sh
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** READY-002
- **Priority:** P1 (High)

**[READY-010] Create Integration Test Suite**

- **Description:** Write end-to-end integration tests for /sage.stream --dependency-aware workflows. Test complete DEPS-001 unblocking READY-001, multiple blockers, long dependency chains, and re-evaluation.
- **Acceptance:**
  - [ ] Test: Complete DEPS-001 → READY-001 appears in ready-work queue
  - [ ] Test: Multiple blockers → ticket ready only when all COMPLETED
  - [ ] Test: Long dependency chain (A→B→C→D→E) → correct execution order
  - [ ] Test: Dynamic re-evaluation → newly unblocked tickets processed
  - [ ] Test: --explain shows correct blocking reasons
  - [ ] Test: --dry-run displays correct execution plan
  - [ ] Test: Mixed states (COMPLETED, IN_PROGRESS, DEFERRED) handled correctly
  - [ ] Test: All tickets blocked → clear message, exits gracefully
  - [ ] Test: /sage.stream --dependency-aware completes full cycle
  - [ ] All integration tests pass
- **Effort:** 5 story points (20 hours)
- **Owner:** Backend Engineer
- **Dependencies:** READY-004, READY-006, READY-007
- **Priority:** P1 (High)

**[READY-011] Update Documentation**

- **Description:** Update commands/sage.stream.md with --dependency-aware section. Add examples to EXAMPLES.md. Update mode comparison table. Document --explain and --dry-run flags.
- **Acceptance:**
  - [ ] stream.md documents --dependency-aware mode
  - [ ] stream.md documents --explain flag with example
  - [ ] stream.md documents --dry-run with --dependency-aware
  - [ ] Argument hint updated: "[--interactive | --dependency-aware | --auto | --dry-run]"
  - [ ] Mode comparison table includes dependency-aware row
  - [ ] 3+ examples in EXAMPLES.md (basic, explain, dry-run)
  - [ ] Troubleshooting section: "What if all tickets blocked?"
  - [ ] User guide: When to use dependency-aware vs other modes
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** READY-005
- **Priority:** P1 (Medium)

---

## Critical Path

```plaintext
DEPS-001 → READY-002 → READY-003 → READY-004 → READY-010
            (3d)         (2d)         (3d)         (5d)
                        [13 days sequential]
                        [5 days with parallelization]
```

**Bottlenecks:**
- DEPS-001: BLOCKS all ready-work tasks (external dependency)
- READY-007: Dry-run logic most complex (5 SP)
- READY-010: Integration tests require all features complete

**Parallel Tracks:**
- Enhanced features: READY-006, READY-007 can start after READY-002
- Testing: READY-009 can start immediately after READY-002
- Optimization: READY-008 can run parallel with testing
- Documentation: READY-011 can start after READY-005

---

## Quick Wins (Days 1-2)

1. **READY-002 (Query Engine)** - Unblocks all other work
2. **READY-003 (Flag Parsing)** - Enables basic mode
3. **READY-009 (Unit Tests)** - Early quality validation

---

## Risk Mitigation

| Task | Risk | Mitigation | Contingency |
|------|------|------------|-------------|
| DEPS-001 | Blocking dependency not ready | Coordinate with DEPS team, parallelize where possible | Stub blockedBy field for development, integrate later |
| READY-007 | Dry-run logic too complex | Simplify to single-level preview, defer multi-level | Reduce scope to "next ready tickets" only |
| READY-008 | Performance issues at 1000+ tickets | Implement caching, optimize jq queries | Add note to use SQLite in Phase 3, defer optimization |
| READY-010 | Integration tests find design issues | Early integration testing, fail-fast | Adjust design based on test findings, iterate quickly |

---

## Testing Strategy

### Automated Testing Tasks
- **READY-009 (Unit Tests)** - 3 SP, Sprint 1
- **READY-010 (Integration Tests)** - 5 SP, Sprint 1

### Quality Gates
- Zero false positives in ready-work detection
- Zero false negatives (blocked tickets never executed)
- Performance meets SLOs (<50ms for 100 tickets)
- Backward compatible with existing stream modes

---

## Team Allocation

**Backend (1-2 engineers)**
- Query engine (READY-002)
- Stream integration (READY-003, 004, 005)
- Enhanced features (READY-006, 007)
- Optimization (READY-008)
- Testing (READY-009, 010)
- Documentation (READY-011)

**Coordination:**
- Depends on DEPS team completing DEPS-001 (Enhanced Dependencies)

---

## Sprint Planning

**1-week sprint, ~30 SP capacity (with 2 engineers and parallelization)**

| Sprint | Focus | Story Points | Key Deliverables |
|--------|-------|--------------|------------------|
| Sprint 1 | Core + Enhanced + Testing | 31 SP | Ready-work query, --dependency-aware mode, --explain, --dry-run, tests, docs |

**Note:** Aggressive timeline requires:
- 2 backend engineers working in parallel
- DEPS-001 completes early in sprint
- Minimal blockers/interruptions

**Alternative:** Split into 2 sprints if single engineer:
- Sprint 1: Core (READY-002, 003, 004, 005, 009) = 13 SP
- Sprint 2: Enhanced + Docs (READY-006, 007, 008, 010, 011) = 18 SP

---

## Task Import Format

CSV export for project management tools:
```csv
ID,Title,Description,Estimate,Priority,Dependencies,Sprint
READY-002,Ready-Work Query Engine,Filter unblocked tickets,3,P0,DEPS-001,1
READY-003,Stream Flag Parsing,Add --dependency-aware,2,P0,READY-002,1
READY-004,Dynamic Re-Evaluation,Recompute after completion,3,P0,READY-003,1
READY-005,Status Reporting,Display ready vs blocked,2,P0,READY-003,1
READY-006,Explain Flag,Show blocking reasons,3,P1,READY-002,1
READY-007,Dry-Run Mode,Execution plan preview,5,P1,READY-002,1
READY-008,Performance Optimization,Cache blocker states,3,P1,READY-004,1
READY-009,Unit Tests,Test query logic,3,P1,READY-002,1
READY-010,Integration Tests,End-to-end workflows,5,P1,"READY-004,READY-006,READY-007",1
READY-011,Documentation,Update stream.md and examples,2,P1,READY-005,1
```

---

## Appendix

**Estimation Method:** Planning Poker with reference to STREAM and DEPS tickets
**Story Point Scale:** Fibonacci (1,2,3,5,8,13,21)
**Definition of Done:**
- Code reviewed and approved
- Tests written and passing (80%+ coverage)
- Documentation updated
- Performance benchmarks met
- Integration with /sage.stream validated
- Backward compatibility verified

**Parent Ticket:** To be created during /sage.migrate as READY-001 (epic)

**Related Specifications:**
- docs/specs/ready-work-detection/spec.md
- docs/specs/ready-work-detection/plan.md
- docs/specs/enhanced-dependencies/spec.md (dependency)

**Blocks:**
- None (enables better automation but not blocking other features)
