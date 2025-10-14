# Enhanced Dependencies Specification

**Version:** 1.0
**Status:** Draft
**Created:** 2025-10-14
**Component:** Enhanced Ticket Dependency System
**Based on:** steveyegge/beads dependency model analysis

---

## 1. Overview

### Purpose
Enhance Sage-Dev's ticket system with a rich dependency model inspired by the Beads issue tracker, enabling AI agents to understand complex relationships between tickets, detect blocking conditions, and automatically identify ready work.

### Business Value
- **Improved Automation**: AI agents can automatically determine ticket execution order based on dependency resolution
- **Better Planning**: Developers can visualize and manage complex project dependencies
- **Reduced Errors**: Prevents execution of tickets with unmet dependencies
- **Enhanced Traceability**: Track how work items relate beyond simple parent-child relationships

### Success Metrics
- Dependency graph correctly resolves execution order in 100% of test cases
- Cycle detection prevents invalid dependency configurations
- Ready-work detection reduces manual ticket filtering by 80%+
- `/sage.validate` catches all dependency violations before execution
- Zero regression in existing ticket functionality

### Target Users
- **Primary**: AI coding agents (Claude Code, Opencode, DROID) executing `/sage.stream` workflows
- **Secondary**: Human developers using ticket system for project planning
- **Tertiary**: `/sage.sync` integration with GitHub Issues

---

## 2. Functional Requirements

### FR-1: Four Dependency Types

The system **shall** support four distinct dependency relationship types:

#### FR-1.1: Parent-Child Relationship (Existing - Preserve)
- **Definition**: Hierarchical decomposition where child tickets implement portions of parent epic/story
- **Schema**: Existing `parent` field in ticket structure
- **Validation**: Child cannot be marked COMPLETED if parent is DEFERRED or FAILED
- **Example**: STREAM-001 (epic) ← STREAM-002, STREAM-003 (stories)

#### FR-1.2: Blocks Relationship (New)
- **Definition**: Ticket A blocks ticket B means B cannot start until A is COMPLETED
- **Schema**:
  - `blocks: string[]` - Array of ticket IDs this ticket blocks
  - `blockedBy: string[]` - Array of ticket IDs blocking this ticket (computed)
- **Validation**: Tickets with non-empty `blockedBy` cannot transition to IN_PROGRESS
- **Use Case**: DEPS-001 (schema update) blocks READY-001 (ready-work detection)
- **As a user story**: "As an AI agent, I want to know which tickets block my current work so that I don't attempt impossible implementations"

#### FR-1.3: Related-To Relationship (New)
- **Definition**: Informational link between tickets that share context but don't block each other
- **Schema**: `relatedTo: string[]` - Array of ticket IDs with shared context
- **Validation**: No execution constraints, informational only
- **Use Case**: UI-005 (login form) related to AUTH-003 (session management) - both touch authentication
- **As a user story**: "As a developer, I want to see related tickets so that I can understand the full context of a feature area"

#### FR-1.4: Discovered-From Relationship (New)
- **Definition**: Tracks tickets created during implementation of another ticket (e.g., bugs, sub-tasks found during work)
- **Schema**: `discoveredFrom: string` - Single ticket ID that led to this ticket's creation
- **Validation**: Referenced ticket must exist
- **Use Case**: BUG-015 discovered from STREAM-006 implementation
- **As a user story**: "As an AI agent, I want to track which ticket led me to discover new work so that I can maintain audit trail"

### FR-2: Dependency Validation

The system **shall** implement comprehensive dependency validation:

#### FR-2.1: Cycle Detection
- Detect circular dependencies in `blocks`/`blockedBy` chains
- Validation runs on ticket creation, update, and via `/sage.validate`
- Error format: "Dependency cycle detected: TICKET-A → TICKET-B → TICKET-C → TICKET-A"
- **Business Rule**: Cycles are invalid and must be resolved before ticket system can be used

#### FR-2.2: Existence Validation
- All ticket IDs in dependency fields must reference existing tickets
- Orphaned references flagged as warnings in `/sage.validate`
- Auto-cleanup option to remove invalid references

#### FR-2.3: State Consistency
- Tickets cannot be IN_PROGRESS if `blockedBy` contains non-COMPLETED tickets
- Tickets transitioning to COMPLETED must not have DEFERRED/FAILED blocking dependencies
- `/sage.stream` enforces these rules before ticket execution

### FR-3: Dependency Query Operations

The system **shall** provide dependency query capabilities:

#### FR-3.1: Get Blocked Tickets
```bash
# Query: Find all tickets blocked by TICKET-ID
jq '.tickets[] | select(.blockedBy[]? == "TICKET-ID")' .sage/tickets/index.json
```

#### FR-3.2: Get Blocking Tickets
```bash
# Query: Find all tickets that TICKET-ID blocks
jq '.tickets[] | select(.id == "TICKET-ID") | .blocks[]?' .sage/tickets/index.json
```

#### FR-3.3: Get Ready Work
```bash
# Query: Find all UNPROCESSED tickets with no active blockers
jq '.tickets[] | select(
  .state=="UNPROCESSED" and
  (.blockedBy // [] | length == 0)
)' .sage/tickets/index.json
```

#### FR-3.4: Get Dependency Chain
- Recursive traversal of `blocks` relationships
- Output: Ordered list from root to leaf tickets
- Used by ready-work detection to determine execution order

### FR-4: Schema Updates

The system **shall** extend `.sage/tickets/index.json` schema:

```json
{
  "version": "2.2.0",
  "created": "timestamp",
  "updated": "timestamp",
  "workflow_mode": "TICKET_BASED",
  "tickets": [
    {
      "id": "TICKET-001",
      "dependencies": [],  // Existing: general prerequisites
      "parent": "EPIC-001", // Existing: hierarchical parent

      // NEW FIELDS
      "blocks": ["TICKET-005", "TICKET-006"],
      "blockedBy": [],  // Computed from other tickets' blocks fields
      "relatedTo": ["TICKET-008", "TICKET-009"],
      "discoveredFrom": "TICKET-001"
    }
  ]
}
```

**Backward Compatibility**: Existing tickets without new fields remain valid, fields default to empty arrays.

---

## 3. Non-Functional Requirements

### NFR-1: Performance
- Dependency validation completes in <100ms for 100 tickets
- Dependency validation completes in <500ms for 500 tickets
- Cycle detection uses efficient graph algorithms (DFS, O(V+E) complexity)
- Ready-work queries execute in <50ms

### NFR-2: Data Integrity
- All dependency updates are atomic (write to temp file, then rename)
- Validation runs before any schema modification
- Rollback capability via `/sage.rollback` for failed updates
- Concurrent modification detection (timestamp-based)

### NFR-3: Compatibility
- Schema version bump: 2.1.0 → 2.2.0
- Backward compatible with v2.1.0 tickets (missing fields treated as empty arrays)
- `/sage.sync` GitHub integration preserves dependency metadata in issue labels
- Export/import maintains all dependency relationships

### NFR-4: Usability
- Clear error messages for dependency violations
- Visual dependency graph generation option (Graphviz/Mermaid format)
- Human-readable dependency summaries in ticket views
- Auto-suggest related tickets based on component prefixes

---

## 4. Features & Flows

### Feature 1: Dependency Definition (Priority: P0)

**Flow: Adding Block Dependency**
1. User/agent edits ticket DEPS-001
2. Adds `"blocks": ["READY-001"]` to ticket JSON
3. System computes `blockedBy` for READY-001
4. Validation checks for cycles
5. If valid, updates index.json atomically
6. READY-001 now shows `"blockedBy": ["DEPS-001"]`

**Flow: Marking Ticket as Related**
1. Agent discovers UI-005 relates to AUTH-003
2. Adds `"relatedTo": ["AUTH-003"]` to UI-005
3. Optionally adds reciprocal link to AUTH-003
4. No execution constraints applied
5. Both tickets display relationship in metadata

**Flow: Recording Discovery**
1. While implementing STREAM-006, agent finds bug
2. Creates new ticket BUG-015
3. Sets `"discoveredFrom": "STREAM-006"` in BUG-015
4. STREAM-006 can later query all discovered tickets
5. Audit trail preserved for retrospectives

### Feature 2: Dependency Validation (Priority: P0)

**Flow: Cycle Detection**
1. User attempts to add TICKET-C blocks TICKET-A
2. System detects existing chain: A blocks B blocks C
3. Creates cycle: A → B → C → A
4. Validation fails with error message
5. Operation rejected, index.json unchanged

**Flow: Orphan Detection**
1. `/sage.validate` command runs
2. Scans all dependency fields
3. Finds TICKET-999 referenced in `blocks` but doesn't exist
4. Flags as warning: "Orphaned dependency: TICKET-999 not found"
5. Offers cleanup: `--fix` removes invalid references

### Feature 3: Ready-Work Detection (Priority: P0)

**Flow: Automatic Ready-Work Identification**
1. `/sage.stream --dependency-aware` command runs
2. Query: All UNPROCESSED tickets
3. Filter: Remove tickets with non-empty `blockedBy`
4. Filter: Remove tickets where `blockedBy` contains non-COMPLETED tickets
5. Result: Only unblocked tickets eligible for execution
6. Stream processes in dependency-safe order

**Input**: `.sage/tickets/index.json` with dependency metadata
**Output**: Ordered list of ticket IDs ready for execution

### Feature 4: GitHub Integration (Priority: P1)

**Flow: Sync Dependencies to GitHub**
1. `/sage.sync` command runs
2. For each ticket with dependencies:
   - Adds labels: `blocks:TICKET-ID`, `blocked-by:TICKET-ID`
   - Updates issue body with dependency section
   - Creates issue links for `relatedTo` tickets
3. GitHub Issues reflect Sage-Dev dependency model
4. Bi-directional sync preserves metadata

---

## 5. Acceptance Criteria

### AC-1: Schema Extension
- [ ] `.sage/tickets/index.json` supports `blocks`, `blockedBy`, `relatedTo`, `discoveredFrom` fields
- [ ] Schema version updated to 2.2.0
- [ ] Existing v2.1.0 tickets load without errors
- [ ] Empty dependency fields default to `[]` or `null`

### AC-2: Dependency Operations
- [ ] Setting `blocks` automatically computes `blockedBy` in referenced tickets
- [ ] Cycle detection prevents invalid dependency graphs
- [ ] Orphan detection identifies non-existent ticket references
- [ ] Ready-work query returns only unblocked UNPROCESSED tickets

### AC-3: Validation Integration
- [ ] `/sage.validate` checks dependency consistency
- [ ] `/sage.validate --fix` removes orphaned references
- [ ] Validation errors prevent ticket state transitions
- [ ] Clear error messages guide users to fix issues

### AC-4: Performance
- [ ] Dependency validation <100ms for 100 tickets
- [ ] Ready-work query <50ms
- [ ] No performance regression in existing ticket operations

### AC-5: Documentation
- [ ] Updated `.sage/tickets/README.md` with dependency types
- [ ] Examples for each dependency type
- [ ] Migration guide from v2.1.0 → v2.2.0
- [ ] `/sage.validate` usage documentation

---

## 6. Dependencies

### Technical Dependencies
- **Requires**: `.sage/tickets/index.json` v2.1.0 structure
- **Requires**: `jq` for JSON querying (already in use)
- **Optional**: Graphviz for dependency graph visualization

### Component Dependencies
- **Blocks**: READY-001 (Ready-Work Detection) - depends on this schema
- **Blocks**: SEARCH-001 (Context Search) - may query dependency relationships
- **Related**: `/sage.validate` command enhancement
- **Related**: `/sage.sync` GitHub integration enhancement

### External Integrations
- **GitHub Issues API**: Sync dependency metadata via labels and links
- **Git**: Commit dependency graph changes with traceability

### Assumptions
- Ticket IDs remain stable (no renaming after creation)
- Index.json is the single source of truth for tickets
- Concurrent modifications handled via file locking or timestamp checks

### Risks & Mitigations
- **Risk**: Performance degrades with 1000+ tickets
  - **Mitigation**: Implement SQLite query layer in Phase 3
- **Risk**: Dependency cycles created by mistake
  - **Mitigation**: Validation prevents cycles, clear error messages
- **Risk**: Complexity overwhelms users
  - **Mitigation**: Dependency fields optional, defaults provide safety

---

## 7. Source Traceability

**Research Source**: Analysis of steveyegge/beads repository (2025-10-14)
- Beads dependency types: blocks, related, parent-child, discovered-from
- Beads dual storage model: JSONL (source) + SQLite (query)
- Beads ready-work detection algorithm

**Alignment with Sage-Dev**:
- Preserves existing `parent` and `dependencies` fields
- Extends ticket system without breaking changes
- Supports `/sage.stream` automation workflow
- Integrates with `/sage.validate` quality checks
- Follows fail-fast, explicit error philosophy

**Related Specifications**:
- Ready-Work Detection: `docs/specs/ready-work-detection/spec.md` (pending)
- Context Search: `docs/specs/context-search/spec.md` (pending)
- Skills Library: `docs/specs/skills-library/spec.md` (pending)
