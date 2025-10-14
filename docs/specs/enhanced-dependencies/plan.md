# Enhanced Dependencies Implementation Blueprint (PRP)

**Format:** Product Requirements Prompt (Context Engineering)
**Generated:** 2025-10-14
**Specification:** `docs/specs/enhanced-dependencies/spec.md`
**Research Source:** Analysis of steveyegge/beads repository

---

## 📖 Context & Documentation

### Traceability Chain

**Analysis → Specification → This Plan**

1. **Original Analysis:** Beads repository analysis (2025-10-14)
   - Four dependency types: blocks, related, parent-child, discovered-from
   - Ready-work detection algorithm
   - JSONL + SQLite dual storage model

2. **Formal Specification:** docs/specs/enhanced-dependencies/spec.md
   - Functional requirements for 4 dependency types
   - Validation requirements (cycle detection, existence, state consistency)
   - Performance targets (<100ms for 100 tickets)
   - Backward compatibility with v2.1.0

### Related Documentation

**System Context:**
- Existing ticket system: `.sage/tickets/index.json` v2.1.0
- Validation command: `commands/sage.validate.md`
- Stream command: `commands/sage.stream.md`

**Related Specifications:**
- Ready-Work Detection: `docs/specs/ready-work-detection/spec.md` (depends on this)
- Context Search: `docs/specs/context-search/spec.md` (may query dependencies)

---

## 📊 Executive Summary

### Business Alignment
- **Purpose:** Enable AI agents to understand ticket relationships and determine safe execution order
- **Value Proposition:** 80% reduction in manual ticket filtering, zero dependency errors
- **Target Users:** AI agents executing `/sage.stream`, developers planning projects

### Technical Approach
- **Architecture Pattern:** Schema extension with backward compatibility
- **Technology Stack:** JSON (existing), jq for querying, bash for validation
- **Implementation Strategy:**
  1. Schema extension (v2.1.0 → v2.2.0)
  2. Validation logic (cycle detection, orphan cleanup)
  3. Query helpers for ready-work detection
  4. Integration with existing commands

### Key Success Metrics

**Service Level Objectives (SLOs):**
- Dependency validation: <100ms for 100 tickets
- Ready-work query: <50ms
- Zero false positives in cycle detection

**Key Performance Indicators (KPIs):**
- 80%+ reduction in manual ticket filtering
- 100% accuracy in dependency resolution
- Zero regressions in existing ticket operations

---

## 🏗️ Architecture Design

### Schema Extension

**Current Schema (v2.1.0):**
```json
{
  "version": "2.1.0",
  "tickets": [
    {
      "id": "TICKET-001",
      "dependencies": [],  // General prerequisites
      "parent": "EPIC-001" // Hierarchical parent
    }
  ]
}
```

**Enhanced Schema (v2.2.0):**
```json
{
  "version": "2.2.0",
  "tickets": [
    {
      "id": "TICKET-001",
      "dependencies": [],       // PRESERVE: General prerequisites
      "parent": "EPIC-001",     // PRESERVE: Hierarchical parent

      "blocks": ["TICKET-005"], // NEW: Tickets this blocks
      "blockedBy": [],          // NEW: Computed from others' blocks
      "relatedTo": ["TICKET-008"], // NEW: Related context
      "discoveredFrom": "TICKET-000" // NEW: Discovery origin
    }
  ]
}
```

**Migration Strategy:**
- Existing tickets without new fields remain valid
- New fields default to `[]` (empty arrays) or `null`
- No data loss, full backward compatibility

### Component Architecture

**Core Components:**

1. **Schema Validator** (`.sage/lib/validate-dependencies.sh`)
   - Validates JSON schema compliance
   - Detects cycles using DFS algorithm
   - Checks existence of referenced tickets
   - Enforces state consistency rules

2. **Dependency Resolver** (`.sage/lib/resolve-dependencies.sh`)
   - Computes `blockedBy` from `blocks` relationships
   - Identifies ready-work tickets (unblocked UNPROCESSED)
   - Generates dependency chains for visualization

3. **Query Helpers** (`.sage/lib/dependency-queries.sh`)
   - Get tickets blocked by ID
   - Get tickets this blocks
   - Get ready-work queue
   - Get dependency chain (recursive)

4. **Command Integrations**
   - `/sage.validate` - Runs dependency validation
   - `/sage.stream` - Uses ready-work detection
   - `/sage.sync` - Syncs dependencies to GitHub

### Data Flow

**Dependency Update Flow:**
1. User/agent edits ticket, adds `"blocks": ["TARGET-ID"]`
2. Validation runs:
   - Check TARGET-ID exists
   - Check no cycle created (DFS traversal)
   - Check state consistency
3. If valid:
   - Update index.json atomically (temp + rename)
   - Compute blockedBy for TARGET-ID
   - Update TARGET-ID entry
4. If invalid:
   - Reject operation
   - Show clear error message

**Ready-Work Query Flow:**
1. Load index.json
2. Filter: state == "UNPROCESSED"
3. For each ticket:
   - Check blockedBy field
   - If empty → READY
   - If non-empty → Check all blockers are COMPLETED
   - If any blocker not COMPLETED → BLOCKED
4. Return ready tickets sorted by priority

---

## 💻 Implementation Details

### Phase 1: Schema Extension (Week 1)

**Files to Modify:**
- `.sage/tickets/index.json` - Add version field, update schema
- `.sage/tickets/README.md` - Document new dependency types

**Implementation:**
```bash
# Update schema version
jq '.version = "2.2.0"' .sage/tickets/index.json > temp.json
mv temp.json .sage/tickets/index.json

# New tickets get default fields
# Existing tickets: fields added on first access, default to []
```

**Validation:**
```bash
# Verify schema loads
jq '.' .sage/tickets/index.json >/dev/null || echo "Invalid JSON"

# Verify version updated
jq -r '.version' .sage/tickets/index.json  # Should output: 2.2.0
```

### Phase 2: Validation Logic (Week 1-2)

**Create:** `.sage/lib/validate-dependencies.sh`

**Cycle Detection (DFS Algorithm):**
```bash
#!/bin/bash
# Detect cycles in dependency graph

detect_cycle() {
  local ticket_id="$1"
  local visited="$2"
  local rec_stack="$3"

  # Mark as visiting
  rec_stack="$rec_stack $ticket_id"

  # Get tickets this blocks
  local blocks=$(jq -r ".tickets[] | select(.id == \"$ticket_id\") | .blocks[]?" .sage/tickets/index.json)

  for blocked in $blocks; do
    # If in recursion stack → cycle detected
    if echo "$rec_stack" | grep -q "$blocked"; then
      echo "CYCLE: $rec_stack → $blocked"
      return 1
    fi

    # Recursively check
    if ! echo "$visited" | grep -q "$blocked"; then
      detect_cycle "$blocked" "$visited $ticket_id" "$rec_stack"
      [[ $? -ne 0 ]] && return 1
    fi
  done

  return 0
}

# Run cycle detection on all tickets
all_tickets=$(jq -r '.tickets[].id' .sage/tickets/index.json)
for ticket in $all_tickets; do
  detect_cycle "$ticket" "" ""
  if [[ $? -ne 0 ]]; then
    echo "ERROR: Dependency cycle detected"
    exit 1
  fi
done

echo "✓ No cycles detected"
```

**Orphan Detection:**
```bash
#!/bin/bash
# Find orphaned dependency references

orphans=()

# Check all dependency fields
jq -r '.tickets[] | . as $t |
  ((.blocks // []) + (.blockedBy // []) + (.relatedTo // []) + [.discoveredFrom // ""]) |
  .[] |
  select(length > 0) |
  [$t.id, .] | @tsv' .sage/tickets/index.json | \
while IFS=$'\t' read ticket_id ref_id; do
  # Check if ref_id exists
  if ! jq -e ".tickets[] | select(.id == \"$ref_id\")" .sage/tickets/index.json >/dev/null 2>&1; then
    echo "WARNING: Ticket $ticket_id references non-existent $ref_id"
    orphans+=("$ticket_id:$ref_id")
  fi
done

[[ ${#orphans[@]} -eq 0 ]] && echo "✓ No orphaned references"
```

### Phase 3: Dependency Resolver (Week 2)

**Create:** `.sage/lib/resolve-dependencies.sh`

**Compute blockedBy Fields:**
```bash
#!/bin/bash
# Compute blockedBy from blocks relationships

# For each ticket
jq -r '.tickets[].id' .sage/tickets/index.json | while read ticket_id; do
  # Find all tickets that block this one
  blockers=$(jq -r ".tickets[] | select(.blocks[]? == \"$ticket_id\") | .id" .sage/tickets/index.json)

  # Update blockedBy field
  blocker_array=$(echo "$blockers" | jq -R -s 'split("\n") | map(select(length > 0))')
  jq "(.tickets[] | select(.id == \"$ticket_id\") | .blockedBy) = $blocker_array" \
    .sage/tickets/index.json > temp.json
  mv temp.json .sage/tickets/index.json
done

echo "✓ blockedBy fields computed"
```

**Ready-Work Query:**
```bash
#!/bin/bash
# Find tickets ready for execution

jq -r '.tickets[] |
  select(
    .state == "UNPROCESSED" and
    ((.blockedBy // []) | length == 0)
  ) | .id' .sage/tickets/index.json
```

### Phase 4: Command Integration (Week 2)

**Update `/sage.validate`:**
```bash
# Add dependency validation step
echo "Validating dependencies..."
bash .sage/lib/validate-dependencies.sh || exit 1
```

**Update `/sage.stream` (for dependency-aware mode):**
```bash
# In Step 1: Load Tickets
if [[ "$DEPENDENCY_AWARE" == "true" ]]; then
  # Use ready-work query instead of all UNPROCESSED
  READY_TICKETS=$(bash .sage/lib/resolve-dependencies.sh | grep "UNPROCESSED")
  echo "Ready work: $READY_TICKETS"
else
  # Current behavior: all UNPROCESSED
  READY_TICKETS=$(jq -r '.tickets[] | select(.state == "UNPROCESSED") | .id' .sage/tickets/index.json)
fi
```

---

## 🔧 Technology Stack

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Storage | JSON | - | Existing format, human-readable |
| Query Engine | jq | 1.6+ | Already in use, powerful JSON queries |
| Validation | Bash scripts | 5.0+ | Existing tooling, simple integration |
| Graph Algorithm | DFS (bash) | - | O(V+E) complexity, efficient for <1000 tickets |

**Key Technology Decisions:**
- **JSON over SQLite (Phase 1):** Maintain simplicity, add SQLite in Phase 3 if needed
- **jq for queries:** Already used throughout Sage-Dev, no new dependencies
- **Bash for validation:** Consistent with existing command structure

---

## ⚙️ Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Schema extension (v2.1.0 → v2.2.0)
- [ ] Update README with dependency types
- [ ] Backward compatibility testing

### Phase 2: Validation (Week 1-2)
- [ ] Cycle detection algorithm
- [ ] Orphan detection
- [ ] State consistency checks
- [ ] Integration with `/sage.validate`

### Phase 3: Resolution (Week 2)
- [ ] blockedBy computation
- [ ] Ready-work query
- [ ] Dependency chain traversal
- [ ] Query helper scripts

### Phase 4: Integration (Week 2)
- [ ] `/sage.stream --dependency-aware` flag
- [ ] `/sage.validate` enhancement
- [ ] Documentation updates
- [ ] Example tickets with dependencies

---

## ⚠️ Risk Management

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Performance degradation with 1000+ tickets | High | Medium | Use efficient DFS, consider SQLite in Phase 3 |
| Accidental dependency cycles | High | Low | Validation prevents cycles, clear error messages |
| Complexity overwhelms users | Medium | Medium | Optional fields, sensible defaults, good docs |
| Breaking existing workflows | High | Low | Backward compatible schema, existing tickets unchanged |

---

## 🧪 Testing Strategy

### Unit Tests
- Schema validation (valid/invalid JSON)
- Cycle detection (simple cycle, complex cycle, no cycle)
- Orphan detection (missing tickets, valid references)
- Ready-work query (blocked tickets excluded, ready tickets included)

### Integration Tests
- Add blocks dependency, verify blockedBy computed
- Create cycle, verify validation fails
- Update ticket state, verify state consistency enforced
- Run `/sage.stream --dependency-aware`, verify correct tickets processed

### Edge Cases
- Empty dependency arrays
- Self-referencing ticket (A blocks A)
- Long dependency chains (A→B→C→D→E)
- Multiple tickets blocking one (A,B,C all block D)

---

## 📚 References & Traceability

### Source Documentation

**Research:**
- Beads repository analysis (2025-10-14)
  - Four dependency types model
  - Ready-work detection algorithm
  - Performance benchmarks (~10-100ms)

**Specification:**
- docs/specs/enhanced-dependencies/spec.md
  - Functional requirements (FR-1 through FR-4)
  - Non-functional requirements (performance, compatibility)
  - Acceptance criteria

### Related Components

**Dependencies:**
- None (foundation component)

**Dependents:**
- Ready-Work Detection: docs/specs/ready-work-detection/spec.md (blocked by this)
- Context Search: docs/specs/context-search/spec.md (may query dependencies)

---

## ✅ Acceptance Criteria

- [ ] Schema v2.2.0 with new dependency fields
- [ ] Cycle detection prevents invalid graphs
- [ ] Orphan detection identifies missing tickets
- [ ] Ready-work query returns only unblocked tickets
- [ ] `/sage.validate` runs dependency checks
- [ ] Performance <100ms for 100 tickets
- [ ] Backward compatible with v2.1.0 tickets
- [ ] Documentation updated with examples

**Implementation Duration:** 2 weeks
**Priority:** P0 (blocks other enhancements)
