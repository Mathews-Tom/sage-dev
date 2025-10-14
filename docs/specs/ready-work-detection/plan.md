# Ready-Work Detection Implementation Blueprint (PRP)

**Format:** Product Requirements Prompt (Context Engineering)
**Generated:** 2025-10-14
**Specification:** `docs/specs/ready-work-detection/spec.md`
**Research Source:** Analysis of steveyegge/beads repository
**Dependency:** DEPS-001 (Enhanced Dependencies) must complete first

---

## 📖 Context & Documentation

### Traceability Chain

**Analysis → Enhanced Dependencies → This Specification → This Plan**

1. **Beads Analysis:** Ready-work detection algorithm (2025-10-14)
   - Automatic identification of unblocked tickets
   - Dependency-aware scheduling
   - ~10-100ms query performance

2. **Dependency:** docs/specs/enhanced-dependencies/spec.md
   - Provides `blockedBy` field required for ready-work detection
   - Cycle detection ensures valid dependency graphs
   - Validation ensures data integrity

3. **This Specification:** docs/specs/ready-work-detection/spec.md
   - Ready-work query algorithm
   - Integration with `/sage.stream`
   - Dynamic re-evaluation after completions

### Related Documentation

**System Context:**
- Stream command: `commands/sage.stream.md`
- Validate command: `commands/sage.validate.md`
- Existing ticket system: `.sage/tickets/index.json`

**Related Specifications:**
- Enhanced Dependencies: `docs/specs/enhanced-dependencies/spec.md` (BLOCKS this)
- Context Search: `docs/specs/context-search/spec.md` (independent)
- Skills Library: `docs/specs/skills-library/spec.md` (independent)

---

## 📊 Executive Summary

### Business Alignment
- **Purpose:** Eliminate manual ticket filtering by automatically identifying ready work
- **Value Proposition:** 80% reduction in manual intervention, zero dependency errors
- **Target Users:** AI agents executing `/sage.stream --dependency-aware`

### Technical Approach
- **Architecture Pattern:** Query-based filtering on existing ticket index
- **Technology Stack:** jq (JSON querying), bash (orchestration)
- **Implementation Strategy:** Opt-in flag for Phase 1, auto-detect for Phase 2

### Key Success Metrics

**Service Level Objectives (SLOs):**
- Query Performance: <50ms for 100 tickets
- Accuracy: 100% (zero false positives/negatives)
- Integration: Works with all `/sage.stream` modes

**Key Performance Indicators (KPIs):**
- 80%+ reduction in manual ticket filtering
- Zero execution of blocked tickets
- 100% accuracy in dependency resolution

---

## 🏗️ Architecture Design

### Integration with `/sage.stream`

**Current Flow (without dependency awareness):**
```
Step 1: Load all UNPROCESSED tickets
Step 2: Display first ticket
Step 3: Confirm and execute
Step 4: Mark COMPLETED
Step 5: Loop to Step 1
```

**Enhanced Flow (with dependency awareness):**
```
Step 0: Mode detection (--dependency-aware flag)
Step 1: Load READY tickets (unblocked UNPROCESSED)
Step 1.5: Display ready vs. blocked status
Step 2: Display first READY ticket
Step 3: Confirm and execute
Step 4: Mark COMPLETED
Step 4.5: Re-evaluate dependencies (recompute blockedBy)
Step 5: Loop to Step 1 (re-query ready tickets)
```

### Component Architecture

**Core Components:**

1. **Ready-Work Query Engine** (`.sage/lib/ready-work-query.sh`)
   - Filters UNPROCESSED tickets
   - Checks `blockedBy` field
   - Validates blocker states (all COMPLETED)
   - Returns ordered list by priority

2. **Dependency Re-Evaluator** (enhancement to existing `.sage/lib/resolve-dependencies.sh`)
   - Recomputes `blockedBy` after ticket completion
   - Identifies newly unblocked tickets
   - Updates queue dynamically

3. **Status Reporter** (`commands/sage.stream.md` enhancement)
   - Shows ready vs. blocked ticket counts
   - Explains why tickets are blocked
   - Displays unblock chain

### Data Flow

**Ready-Work Query Flow:**
```bash
Input: .sage/tickets/index.json

Filter 1: state == "UNPROCESSED"
  ↓
Filter 2: blockedBy == [] OR blockedBy contains only COMPLETED tickets
  ↓
Sort: Priority (P0 > P1 > P2)
  ↓
Output: ["DEPS-001", "SEARCH-001", "CONTEXT-002"]
```

**Dynamic Re-Evaluation:**
```bash
Ticket DEPS-001 marked COMPLETED
  ↓
Recompute blockedBy for all tickets
  ↓
READY-001: blockedBy was ["DEPS-001"], now []
  ↓
Re-query ready work
  ↓
READY-001 now appears in queue
```

---

## 💻 Implementation Details

### Phase 1: Ready-Work Query Engine (Week 1)

**Create:** `.sage/lib/ready-work-query.sh`

```bash
#!/bin/bash
# Query for tickets ready to execute

TICKET_INDEX="${1:-.sage/tickets/index.json}"

# Ready tickets: UNPROCESSED + no active blockers
jq -r '
  .tickets[] |
  select(
    .state == "UNPROCESSED" and
    (
      (.blockedBy // []) as $blockers |
      if ($blockers | length) == 0 then
        true
      else
        # Check all blockers are COMPLETED
        $blockers | map(
          . as $blocker_id |
          (input.tickets | map(select(.id == $blocker_id and .state == "COMPLETED")) | length > 0)
        ) | all
      end
    )
  ) |
  # Sort by priority (P0 > P1 > P2)
  .id
' "$TICKET_INDEX" | jq -s 'sort_by(.priority)'
```

**Performance Optimization:**
```bash
# For 100+ tickets, cache blocker states
declare -A BLOCKER_STATES

while read ticket_id; do
  state=$(jq -r ".tickets[] | select(.id == \"$ticket_id\") | .state" "$TICKET_INDEX")
  BLOCKER_STATES["$ticket_id"]="$state"
done < <(jq -r '.tickets[].id' "$TICKET_INDEX")

# Use cache in ready-work query
for blocker in "${blockers[@]}"; do
  [[ "${BLOCKER_STATES[$blocker]}" == "COMPLETED" ]] || is_blocked=true
done
```

### Phase 2: Stream Integration (Week 1)

**Modify:** `commands/sage.stream.md`

**Step 0: Mode Detection**
```bash
# Parse --dependency-aware flag
DEPENDENCY_AWARE=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --dependency-aware)
      DEPENDENCY_AWARE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Display mode
if [[ "$DEPENDENCY_AWARE" == "true" ]]; then
  echo "🔄 Dependency-Aware Mode: Only ready work will be processed"
fi
```

**Step 1: Load Tickets (Enhanced)**
```bash
if [[ "$DEPENDENCY_AWARE" == "true" ]]; then
  # Use ready-work query
  TICKET_QUEUE=$(bash .sage/lib/ready-work-query.sh)
  READY_COUNT=$(echo "$TICKET_QUEUE" | wc -l)

  # Count blocked tickets
  TOTAL_UNPROCESSED=$(jq '[.tickets[] | select(.state == "UNPROCESSED")] | length' .sage/tickets/index.json)
  BLOCKED_COUNT=$((TOTAL_UNPROCESSED - READY_COUNT))

  echo "📊 Queue Status: $READY_COUNT ready, $BLOCKED_COUNT blocked"
else
  # Current behavior: all UNPROCESSED
  TICKET_QUEUE=$(jq -r '.tickets[] | select(.state == "UNPROCESSED") | .id' .sage/tickets/index.json)
fi
```

**Step 4.5: Dynamic Re-Evaluation (New)**
```bash
# After marking ticket COMPLETED
echo "→ Recomputing dependencies..."
bash .sage/lib/resolve-dependencies.sh

# Show newly unblocked tickets
NEWLY_READY=$(comm -13 \
  <(echo "$PREVIOUS_READY" | sort) \
  <(bash .sage/lib/ready-work-query.sh | sort))

if [[ -n "$NEWLY_READY" ]]; then
  echo "✅ Unblocked: $NEWLY_READY"
fi
```

### Phase 3: Status Reporting (Week 1)

**Add:** `--explain` flag to stream

```bash
# /sage.stream --explain SKILLS-003
if [[ -n "$EXPLAIN_TICKET" ]]; then
  TICKET_DATA=$(jq ".tickets[] | select(.id == \"$EXPLAIN_TICKET\")" .sage/tickets/index.json)
  STATE=$(echo "$TICKET_DATA" | jq -r '.state')
  BLOCKERS=$(echo "$TICKET_DATA" | jq -r '.blockedBy[]?' 2>/dev/null)

  echo "📋 Ticket: $EXPLAIN_TICKET"
  echo "State: $STATE"

  if [[ -n "$BLOCKERS" ]]; then
    echo "Status: ⏸️  BLOCKED"
    echo ""
    echo "Blocking Dependencies:"
    for blocker in $BLOCKERS; do
      blocker_state=$(jq -r ".tickets[] | select(.id == \"$blocker\") | .state" .sage/tickets/index.json)
      blocker_title=$(jq -r ".tickets[] | select(.id == \"$blocker\") | .title" .sage/tickets/index.json)
      echo "  - $blocker ($blocker_state): $blocker_title"
    done
  else
    echo "Status: ✅ READY"
  fi

  exit 0
fi
```

### Phase 4: Dry-Run Preview (Week 1)

**Add:** `--dry-run` mode with execution plan

```bash
# /sage.stream --dependency-aware --dry-run
if [[ "$DRY_RUN" == "true" ]]; then
  echo "🔍 Execution Plan (Dry Run)"
  echo ""

  # Show batches by dependency level
  level=1
  while [[ -n "$READY_TICKETS" ]]; do
    echo "Batch $level (Ready Now):"
    echo "$READY_TICKETS" | while read ticket_id; do
      title=$(jq -r ".tickets[] | select(.id == \"$ticket_id\") | .title" .sage/tickets/index.json)
      echo "  $level. $ticket_id - $title"
    done

    # Simulate completion, find next ready
    # (Increment level, continue until no tickets remain)
    ((level++))
  done

  echo ""
  echo "No tickets will be executed (dry-run mode)."
  exit 0
fi
```

---

## 🔧 Technology Stack

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Query Engine | jq | 1.6+ | JSON querying, already in use |
| Orchestration | Bash | 5.0+ | Consistent with existing commands |
| Dependency Resolution | From DEPS-001 | - | Reuses enhanced-dependencies logic |

**Key Technology Decisions:**
- **jq for queries:** Fast, expressive, no new dependencies
- **Bash for integration:** Seamless integration with existing `/sage.stream`
- **No new storage:** Uses existing `.sage/tickets/index.json`

---

## ⚙️ Implementation Roadmap

### Week 1: Core Implementation
- [ ] Ready-work query engine (`.sage/lib/ready-work-query.sh`)
- [ ] `--dependency-aware` flag parsing in `/sage.stream`
- [ ] Dynamic re-evaluation after completions
- [ ] Status reporting (ready vs. blocked counts)

### Week 1: Enhanced Features
- [ ] `--explain <ticket-id>` for blocking reasons
- [ ] `--dry-run` execution plan preview
- [ ] Performance optimization (caching)
- [ ] Documentation updates

---

## ⚠️ Risk Management

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Query performance degrades with 1000+ tickets | High | Medium | Cache blocker states, optimize jq queries, SQLite in Phase 3 |
| False positives (blocked tickets marked ready) | Critical | Low | Comprehensive testing, validation before release |
| Complex dependency graphs confuse users | Medium | Medium | `--explain` flag, visual graphs (future), clear docs |
| Breaking existing workflows | High | Low | Opt-in flag, backward compatible, no changes without flag |

---

## 🧪 Testing Strategy

### Unit Tests
- Ready-work query with no blockers → All UNPROCESSED returned
- Ready-work query with active blockers → Blocked tickets excluded
- Ready-work query with COMPLETED blockers → Unblocked tickets included
- Priority sorting → P0 before P1 before P2

### Integration Tests
- Complete DEPS-001 → READY-001 appears in ready-work queue
- Multiple blockers → Ticket ready only when all COMPLETED
- Mixed states → Handles COMPLETED, IN_PROGRESS, DEFERRED blockers correctly

### Edge Cases
- All tickets blocked → Empty queue, clear message
- No UNPROCESSED tickets → Empty queue, "All work complete" message
- Ticket blocks itself → Caught by DEPS-001 validation
- Long dependency chain (A→B→C→D→E) → Correct execution order

---

## 📚 References & Traceability

### Source Documentation

**Research:**
- Beads repository analysis (2025-10-14)
  - Ready-work detection algorithm
  - ~10-100ms query benchmarks

**Specification:**
- docs/specs/ready-work-detection/spec.md
  - Ready-work criteria (FR-1)
  - Stream integration (FR-2)
  - Performance targets (<50ms)

### Related Components

**Dependencies:**
- Enhanced Dependencies: docs/specs/enhanced-dependencies/spec.md (BLOCKS this - must complete first)

**Dependents:**
- None (other components can develop in parallel)

**Integrations:**
- `/sage.stream` - Primary integration point
- `.sage/lib/resolve-dependencies.sh` - Dependency resolution

---

## ✅ Acceptance Criteria

- [ ] Ready-work query identifies all unblocked UNPROCESSED tickets
- [ ] `--dependency-aware` flag activates ready-work mode
- [ ] Dynamic re-evaluation after each completion
- [ ] `--explain` shows blocking reasons clearly
- [ ] `--dry-run` previews execution order
- [ ] Performance <50ms for 100 tickets
- [ ] Backward compatible (works without flag)
- [ ] Documentation with examples

**Implementation Duration:** 1 week
**Priority:** P0 (depends on DEPS-001)
**Blocks:** None (enables better automation)
