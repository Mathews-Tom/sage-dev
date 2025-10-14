# Tasks: Enhanced Dependencies

**From:** `spec.md` + `plan.md`
**Timeline:** 2 weeks, 2 sprints
**Team:** 1-2 backend engineers
**Created:** 2025-10-14

## Summary
- Total tasks: 12
- Estimated effort: 45 story points (180 hours)
- Critical path duration: 2 weeks
- Key risks: Cycle detection complexity, performance at scale, backward compatibility

## Phase Breakdown

### Phase 1: Foundation (Sprint 1, 9 story points)
**Goal:** Schema extension and documentation
**Deliverable:** v2.2.0 schema with backward compatibility

#### Tasks

**[DEPS-002] Schema Extension and Version Bump**

- **Description:** Extend .sage/tickets/index.json schema from v2.1.0 to v2.2.0. Add version field, support new dependency fields (blocks, blockedBy, relatedTo, discoveredFrom). Implement atomic writes for data safety.
- **Acceptance:**
  - [ ] Version field updated to "2.2.0" in index.json
  - [ ] Schema validates successfully with jq
  - [ ] Existing v2.1.0 tickets load without errors
  - [ ] New fields (blocks, blockedBy, relatedTo, discoveredFrom) supported
  - [ ] Empty dependency fields default to [] or null
  - [ ] Atomic write implemented (temp file + mv)
  - [ ] Rollback test passes (corrupt write recovers)
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None (foundation task)
- **Priority:** P0 (Blocker)

**[DEPS-003] Update README with Dependency Types Documentation**

- **Description:** Document all 4 dependency types in .sage/tickets/README.md. Include definitions, use cases, validation rules, and examples for each type. Provide migration guide from v2.1.0.
- **Acceptance:**
  - [ ] Section "Dependency Types" added to README
  - [ ] blocks relationship documented with examples
  - [ ] blockedBy relationship documented (computed field)
  - [ ] relatedTo relationship documented with examples
  - [ ] discoveredFrom relationship documented with examples
  - [ ] Migration guide v2.1.0 → v2.2.0 included
  - [ ] 2+ examples per dependency type
  - [ ] Validation rules explained clearly
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-002
- **Priority:** P0 (Critical)

---

### Phase 2: Validation (Sprint 1, 11 story points)
**Goal:** Dependency graph validation logic
**Deliverable:** Cycle detection, orphan detection, state consistency

#### Tasks

**[DEPS-004] Implement Cycle Detection Algorithm**

- **Description:** Create .sage/lib/validate-dependencies.sh with DFS-based cycle detection for blocks/blockedBy chains. Detect and report circular dependencies with clear error messages showing cycle path.
- **Acceptance:**
  - [ ] .sage/lib/validate-dependencies.sh created
  - [ ] DFS algorithm correctly detects simple cycles (A→B→A)
  - [ ] DFS algorithm correctly detects complex cycles (A→B→C→A)
  - [ ] Returns exit code 0 for acyclic graphs
  - [ ] Returns exit code 1 for cyclic graphs
  - [ ] Error message format: "Dependency cycle detected: TICKET-A → TICKET-B → TICKET-C → TICKET-A"
  - [ ] Performance < 100ms for 100 tickets
  - [ ] Performance < 500ms for 500 tickets
- **Effort:** 5 story points (20 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-002
- **Priority:** P0 (Critical)

**[DEPS-005] Implement Orphan Detection**

- **Description:** Add orphan detection to validate-dependencies.sh. Scan all dependency fields (blocks, blockedBy, relatedTo, discoveredFrom) and identify references to non-existent tickets. Provide --fix option to auto-remove invalid references.
- **Acceptance:**
  - [ ] Orphan detection function added to validate-dependencies.sh
  - [ ] Scans all dependency fields for invalid references
  - [ ] Warning message format: "Orphaned dependency: TICKET-999 referenced by TICKET-001 but not found"
  - [ ] --fix flag removes orphaned references
  - [ ] --fix uses atomic writes (no data corruption)
  - [ ] Reports count of orphans found and fixed
  - [ ] Handles empty dependency arrays gracefully
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-004
- **Priority:** P0 (Critical)

**[DEPS-006] Implement State Consistency Validation**

- **Description:** Add state consistency checks to validate-dependencies.sh. Enforce business rules: tickets with non-empty blockedBy cannot be IN_PROGRESS, tickets with DEFERRED/FAILED blockers cannot be COMPLETED.
- **Acceptance:**
  - [ ] State consistency validation function added
  - [ ] Rule enforced: blockedBy non-empty → cannot be IN_PROGRESS
  - [ ] Rule enforced: blockers DEFERRED/FAILED → cannot be COMPLETED
  - [ ] Error messages clearly explain violations
  - [ ] Returns list of violating tickets with reasons
  - [ ] Integration test with mixed ticket states passes
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-004
- **Priority:** P0 (Critical)

---

### Phase 3: Resolution (Sprint 2, 11 story points)
**Goal:** Dependency resolution and ready-work detection
**Deliverable:** blockedBy computation, ready-work queries

#### Tasks

**[DEPS-007] Implement blockedBy Computation**

- **Description:** Create .sage/lib/resolve-dependencies.sh to compute blockedBy fields from blocks relationships. For each ticket, find all tickets that list it in their blocks array and populate its blockedBy field.
- **Acceptance:**
  - [ ] .sage/lib/resolve-dependencies.sh created
  - [ ] Computes inverse relationship from blocks to blockedBy
  - [ ] Multiple blockers handled correctly (array of IDs)
  - [ ] Updates all affected tickets atomically
  - [ ] Empty blocks results in empty blockedBy
  - [ ] Idempotent (safe to run multiple times)
  - [ ] Performance < 50ms for 100 tickets
  - [ ] Success message confirms tickets updated
- **Effort:** 5 story points (20 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-005, DEPS-006
- **Priority:** P0 (Critical)

**[DEPS-008] Implement Ready-Work Query**

- **Description:** Add ready-work query function to resolve-dependencies.sh. Query all UNPROCESSED tickets with empty blockedBy arrays. Return ordered list by priority (P0 > P1 > P2).
- **Acceptance:**
  - [ ] Ready-work query function added
  - [ ] Returns only UNPROCESSED tickets
  - [ ] Filters out tickets with non-empty blockedBy
  - [ ] Results sorted by priority (P0 first)
  - [ ] Returns ticket IDs as newline-separated list
  - [ ] Performance < 50ms for 100 tickets
  - [ ] Empty result handled gracefully (no errors)
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-007
- **Priority:** P0 (Critical)

**[DEPS-009] Create Query Helper Scripts**

- **Description:** Create .sage/lib/dependency-queries.sh with helper functions: get tickets blocked by ID, get tickets this blocks, get dependency chain (recursive traversal), get all blockers for ticket.
- **Acceptance:**
  - [ ] .sage/lib/dependency-queries.sh created
  - [ ] Function: get_blocked_by <ticket-id> (returns tickets blocked by ID)
  - [ ] Function: get_blocks <ticket-id> (returns tickets this blocks)
  - [ ] Function: get_dependency_chain <ticket-id> (recursive, root to leaf)
  - [ ] Function: get_all_blockers <ticket-id> (transitive closure)
  - [ ] All functions use jq for JSON querying
  - [ ] Performance < 100ms for typical queries
  - [ ] Documentation with usage examples
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-007
- **Priority:** P1 (High)

---

### Phase 4: Integration (Sprint 2, 14 story points)
**Goal:** Command integration and testing
**Deliverable:** Working /sage.validate and /sage.stream integration

#### Tasks

**[DEPS-010] Integrate with /sage.validate Command**

- **Description:** Modify commands/sage.validate.md to call validate-dependencies.sh. Display validation results clearly. Support --fix flag to auto-repair orphaned references.
- **Acceptance:**
  - [ ] validate-dependencies.sh called in /sage.validate
  - [ ] Validation results displayed with clear messages
  - [ ] --fix flag passed through to orphan detection
  - [ ] Exit code 1 if validation fails
  - [ ] Exit code 0 if all validations pass
  - [ ] Error summary shows counts (cycles, orphans, state violations)
  - [ ] Integration test passes
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-006
- **Priority:** P0 (Critical)

**[DEPS-011] Add --dependency-aware Flag to /sage.stream**

- **Description:** Modify commands/sage.stream.md to add --dependency-aware flag parsing in Step 0. When enabled, use ready-work query instead of all UNPROCESSED tickets in Step 1. Display ready vs blocked status.
- **Acceptance:**
  - [ ] --dependency-aware flag parsing added to Step 0
  - [ ] DEPENDENCY_AWARE variable set correctly
  - [ ] Mode banner displays "Dependency-Aware Mode: Only ready work processed"
  - [ ] Step 1 calls ready-work query when flag enabled
  - [ ] Status display shows: "N ready, M blocked"
  - [ ] Backward compatible (works without flag)
  - [ ] No regressions in existing stream modes
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-008
- **Priority:** P0 (Critical)

**[DEPS-012] Create Unit Test Suite**

- **Description:** Write unit tests for validation logic, resolution logic, and query helpers. Test cycle detection (simple, complex, none), orphan detection, blockedBy computation, ready-work query. Cover edge cases.
- **Acceptance:**
  - [ ] Test: Cycle detection - simple cycle (A→B→A)
  - [ ] Test: Cycle detection - complex cycle (A→B→C→D→A)
  - [ ] Test: Cycle detection - no cycle (valid graph)
  - [ ] Test: Orphan detection - missing ticket references
  - [ ] Test: Orphan detection - valid references only
  - [ ] Test: blockedBy computation - single blocker
  - [ ] Test: blockedBy computation - multiple blockers
  - [ ] Test: Ready-work query - excludes blocked tickets
  - [ ] Test: Ready-work query - includes unblocked tickets
  - [ ] Test: Edge case - self-referencing ticket
  - [ ] Test: Edge case - empty dependency arrays
  - [ ] 80%+ code coverage
- **Effort:** 5 story points (20 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-009
- **Priority:** P1 (High)

**[DEPS-013] Create Integration Test Suite**

- **Description:** Write end-to-end integration tests for complete workflows. Test adding blocks dependency (verify blockedBy computed), creating cycle (verify validation fails), running /sage.stream --dependency-aware (verify correct execution order).
- **Acceptance:**
  - [ ] Test: Add blocks dependency → blockedBy computed automatically
  - [ ] Test: Create cycle → validation fails with clear error
  - [ ] Test: Update ticket state → state consistency enforced
  - [ ] Test: /sage.stream --dependency-aware → correct tickets processed
  - [ ] Test: Long dependency chain (A→B→C→D→E) → correct order
  - [ ] Test: Multiple tickets blocking one → all must complete
  - [ ] Test: Mixed completion states → handles correctly
  - [ ] Test: Performance with 100 tickets < 500ms total
  - [ ] All integration tests pass
- **Effort:** 8 story points (32 hours)
- **Owner:** Backend Engineer
- **Dependencies:** DEPS-010, DEPS-011
- **Priority:** P1 (High)

---

## Critical Path

```plaintext
DEPS-002 → DEPS-004 → DEPS-007 → DEPS-008 → DEPS-011 → DEPS-013
  (3d)      (5d)        (5d)        (3d)        (2d)        (8d)
                        [26 days / 2 weeks with parallelization]
```

**Bottlenecks:**
- DEPS-004 (Cycle detection): Highest complexity, critical correctness
- DEPS-007 (blockedBy computation): Complex inverse relationship logic
- DEPS-013 (Integration tests): Long validation phase

**Parallel Tracks:**
- Documentation: DEPS-003 can start immediately after DEPS-002
- Validation: DEPS-005, DEPS-006 can run parallel after DEPS-004
- Query helpers: DEPS-009 can run parallel with DEPS-010

---

## Quick Wins (Week 1)

1. **DEPS-002 (Schema Extension)** - Unblocks all other work
2. **DEPS-003 (Documentation)** - Provides clarity for team
3. **DEPS-010 (Validate Integration)** - Early validation capability

---

## Risk Mitigation

| Task | Risk | Mitigation | Contingency |
|------|------|------------|-------------|
| DEPS-004 | Cycle detection algorithm bugs | Code review, comprehensive tests, reference implementation from plan.md | Use simpler BFS if DFS proves too complex |
| DEPS-007 | Performance degrades with 1000+ tickets | Cache ticket lookups, optimize jq queries | Add SQLite query layer in Phase 3 if needed |
| DEPS-011 | Breaking existing /sage.stream behavior | Opt-in flag, backward compatibility tests | Make flag required if issues found |
| DEPS-013 | Integration tests uncover design issues | Early integration testing, fail-fast approach | Defer non-critical features, focus on core functionality |

---

## Testing Strategy

### Automated Testing Tasks
- **DEPS-012 (Unit Tests)** - 5 SP, Sprint 2
- **DEPS-013 (Integration Tests)** - 8 SP, Sprint 2

### Quality Gates
- Zero regressions in existing ticket operations
- All validation rules enforced correctly
- Performance meets SLOs (<100ms for 100 tickets)
- 100% backward compatibility with v2.1.0

---

## Team Allocation

**Backend (1-2 engineers)**
- Schema extension (DEPS-002)
- Validation logic (DEPS-004, 005, 006)
- Resolution logic (DEPS-007, 008, 009)
- Integration (DEPS-010, 011)
- Testing (DEPS-012, 013)

**DevOps (0.25 engineer)**
- Performance benchmarking
- Rollback procedures
- CI/CD validation

---

## Sprint Planning

**2-week sprints, ~20-25 SP per sprint**

| Sprint | Focus | Story Points | Key Deliverables |
|--------|-------|--------------|------------------|
| Sprint 1 | Foundation + Validation | 20 SP | Schema v2.2.0, cycle detection, orphan detection |
| Sprint 2 | Resolution + Integration | 25 SP | blockedBy computation, ready-work query, /sage.validate integration, tests |

---

## Task Import Format

CSV export for project management tools:
```csv
ID,Title,Description,Estimate,Priority,Dependencies,Sprint
DEPS-002,Schema Extension,Extend to v2.2.0 with new fields,3,P0,,1
DEPS-003,README Documentation,Document 4 dependency types,3,P0,DEPS-002,1
DEPS-004,Cycle Detection,DFS algorithm for cycles,5,P0,DEPS-002,1
DEPS-005,Orphan Detection,Find invalid references,3,P0,DEPS-004,1
DEPS-006,State Consistency,Validate business rules,3,P0,DEPS-004,1
DEPS-007,blockedBy Computation,Compute inverse relationships,5,P0,"DEPS-005,DEPS-006",2
DEPS-008,Ready-Work Query,Filter unblocked tickets,3,P0,DEPS-007,2
DEPS-009,Query Helpers,Utility query functions,3,P1,DEPS-007,2
DEPS-010,Validate Integration,Integrate with /sage.validate,2,P0,DEPS-006,2
DEPS-011,Stream Integration,Add --dependency-aware flag,2,P0,DEPS-008,2
DEPS-012,Unit Tests,Test validation and resolution,5,P1,DEPS-009,2
DEPS-013,Integration Tests,End-to-end workflows,8,P1,"DEPS-010,DEPS-011",2
```

---

## Appendix

**Estimation Method:** Planning Poker with reference to existing STREAM tickets
**Story Point Scale:** Fibonacci (1,2,3,5,8,13,21)
**Definition of Done:**
- Code reviewed and approved
- Tests written and passing (80%+ coverage)
- Documentation updated
- Performance benchmarks met
- Backward compatibility verified
- Integrated with existing commands

**Parent Ticket:** To be created during /sage.migrate as DEPS-001 (epic)

**Related Specifications:**
- docs/specs/enhanced-dependencies/spec.md
- docs/specs/enhanced-dependencies/plan.md
- docs/specs/ready-work-detection/spec.md (dependent)
