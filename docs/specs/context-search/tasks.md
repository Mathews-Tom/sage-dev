# Tasks: Context Search

**From:** `spec.md` + `plan.md`
**Timeline:** 1 week, 1 sprint
**Team:** 1-2 backend engineers
**Created:** 2025-10-14

## Summary
- Total tasks: 11
- Estimated effort: 25 story points (100 hours)
- Critical path duration: 1 week (with parallelization)
- Key risks: Performance with large codebases, index staleness, search relevance accuracy

## Phase Breakdown

### Phase 1: Core Search (Sprint 1, 12 story points)
**Goal:** Multi-source search functionality
**Deliverable:** Working /sage.search command with 5 sources

#### Tasks

**[SEARCH-002] Implement /sage.search Command Structure**

- **Description:** Create commands/sage.search.md with flag parsing (--source, --since, --regex). Implement dispatcher to route queries to source-specific searchers. Aggregate results and format output with top 10 matches.
- **Acceptance:**
  - [ ] commands/sage.search.md created
  - [ ] Accepts: /sage.search <query> [flags]
  - [ ] Flag parsing: --source=<type>, --since=<date>, --regex
  - [ ] Dispatches to appropriate source searchers
  - [ ] Aggregates results from multiple sources
  - [ ] Displays top 10 results by relevance
  - [ ] Format: "Source: <type> | Match: <file>:<line> | Snippet: <text>"
  - [ ] Handles empty results gracefully: "No matches found"
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None (foundation task)
- **Priority:** P0 (Blocker)

**[SEARCH-003] Create Agent Docs Searcher**

- **Description:** Implement .sage/lib/search-agent-docs.sh to search .sage/agent/ directory using ripgrep. Return matches with file paths, line numbers, and snippets.
- **Acceptance:**
  - [ ] .sage/lib/search-agent-docs.sh created
  - [ ] Uses ripgrep (rg) for fast text search
  - [ ] Searches .sage/agent/ recursively
  - [ ] Returns JSON format: [{source, file, line, snippet, modified_time}]
  - [ ] Respects --regex flag (literal vs regex search)
  - [ ] Performance < 100ms for 1000 files
  - [ ] Handles directory not existing (returns empty)
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SEARCH-002
- **Priority:** P0 (Critical)

**[SEARCH-004] Create Tickets Searcher**

- **Description:** Implement .sage/lib/search-tickets.sh to search .sage/tickets/index.json using jq. Query ticket titles, descriptions, and acceptance criteria fields.
- **Acceptance:**
  - [ ] .sage/lib/search-tickets.sh created
  - [ ] Uses jq for JSON querying
  - [ ] Searches fields: title, description, acceptanceCriteria
  - [ ] Returns JSON format: [{source, ticket_id, field, snippet}]
  - [ ] Case-insensitive search
  - [ ] Respects --since flag (filters by ticket created date)
  - [ ] Performance < 50ms for 100 tickets
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SEARCH-002
- **Priority:** P0 (Critical)

**[SEARCH-005] Create Specs Searcher**

- **Description:** Implement .sage/lib/search-specs.sh to search docs/specs/, docs/features/, docs/research/ directories using ripgrep. Focus on markdown and text files.
- **Acceptance:**
  - [ ] .sage/lib/search-specs.sh created
  - [ ] Uses ripgrep on docs/specs/, docs/features/, docs/research/
  - [ ] File types: *.md, *.txt
  - [ ] Returns JSON format: [{source, file, line, snippet, modified_time}]
  - [ ] Handles missing directories gracefully
  - [ ] Performance < 200ms for 5000 files
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SEARCH-002
- **Priority:** P0 (Critical)

**[SEARCH-006] Create Git Searcher**

- **Description:** Implement .sage/lib/search-git.sh to search commit messages using git log --grep. Limit to last 1000 commits by default for performance.
- **Acceptance:**
  - [ ] .sage/lib/search-git.sh created
  - [ ] Uses git log --grep for commit message search
  - [ ] Default: last 1000 commits
  - [ ] Respects --since flag (git log --since=<date>)
  - [ ] Returns JSON format: [{source, commit_hash, author, date, message}]
  - [ ] Handles non-git repo gracefully (returns empty)
  - [ ] Performance < 500ms for 1000 commits
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SEARCH-002
- **Priority:** P0 (Critical)

**[SEARCH-007] Create Patterns Searcher**

- **Description:** Implement .sage/lib/search-patterns.sh to search .sage/agent/examples/ directory using ripgrep. Find code patterns and examples.
- **Acceptance:**
  - [ ] .sage/lib/search-patterns.sh created
  - [ ] Uses ripgrep on .sage/agent/examples/
  - [ ] Returns JSON format: [{source, file, line, snippet}]
  - [ ] Handles directory not existing (returns empty)
  - [ ] Performance < 100ms for 500 files
- **Effort:** 1 story point (4 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SEARCH-002
- **Priority:** P0 (Critical)

---

### Phase 2: Ranking & Index (Sprint 1, 8 story points)
**Goal:** Relevance ranking and search optimization
**Deliverable:** Ranked results with search index

#### Tasks

**[SEARCH-008] Implement Relevance Ranking Algorithm**

- **Description:** Create ranking algorithm in /sage.search command to score matches. Factors: exact match bonus, title/header match bonus, word proximity, recency (modified time). Sort results by score descending.
- **Acceptance:**
  - [ ] Ranking function added to commands/sage.search.md
  - [ ] Exact match (whole query): +50 points
  - [ ] Title/header match (^# or ^## prefix): +30 points
  - [ ] Word proximity (all words within 5-word window): +20 points
  - [ ] Recency: +1 point per day (max 30 points for <30 days old)
  - [ ] Results sorted by total score descending
  - [ ] Ties broken by filename alphabetically
  - [ ] Score displayed in debug mode: --debug shows "[Score: 85]"
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SEARCH-003, SEARCH-004, SEARCH-005, SEARCH-006, SEARCH-007
- **Priority:** P0 (Critical)

**[SEARCH-009] Create Search Index Structure**

- **Description:** Design and implement .sage/search-index.json schema. Include version, last_updated, sources metadata, and term frequency index for fast lookups. Create index generation script.
- **Acceptance:**
  - [ ] .sage/search-index.json schema defined
  - [ ] Fields: version, last_updated, sources{}, index{}
  - [ ] sources{} tracks: file count, last_scan timestamp per source
  - [ ] index{} maps: term → [file paths]
  - [ ] .sage/lib/generate-search-index.sh created
  - [ ] Index generation < 2s for 1000 documents
  - [ ] Index file size reasonable (< 1MB for 1000 docs)
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SEARCH-002
- **Priority:** P1 (High)

**[SEARCH-010] Implement Auto-Update Triggers**

- **Description:** Add lazy index update logic to /sage.search. Rebuild index if >1 hour old or missing. Create hooks in /sage.update-doc and /sage.migrate to trigger index updates.
- **Acceptance:**
  - [ ] /sage.search checks index age before search
  - [ ] Rebuilds index if >1 hour old (configurable)
  - [ ] Rebuilds index if .sage/search-index.json missing
  - [ ] /sage.update-doc calls generate-search-index.sh after doc changes
  - [ ] /sage.migrate calls generate-search-index.sh after migration
  - [ ] Background index update option (non-blocking)
  - [ ] Index update timestamp logged
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SEARCH-009
- **Priority:** P1 (Medium)

---

### Phase 3: Testing & Documentation (Sprint 1, 5 story points)
**Goal:** Quality assurance and user documentation
**Deliverable:** Test suite and complete docs

#### Tasks

**[SEARCH-011] Create Test Suite**

- **Description:** Write unit tests for each searcher and integration tests for full search workflow. Test filtering (--source, --since, --regex), ranking accuracy, edge cases (empty results, special characters).
- **Acceptance:**
  - [ ] Unit test: Agent docs searcher returns correct results
  - [ ] Unit test: Tickets searcher queries all fields
  - [ ] Unit test: Specs searcher handles missing directories
  - [ ] Unit test: Git searcher limits to 1000 commits
  - [ ] Unit test: Ranking algorithm scores correctly
  - [ ] Integration test: Full search across all sources
  - [ ] Integration test: --source=tickets filters correctly
  - [ ] Integration test: --since=<date> filters by date
  - [ ] Integration test: --regex mode works
  - [ ] Edge case test: Empty query (error message)
  - [ ] Edge case test: No results found (graceful)
  - [ ] Edge case test: Special characters in query
  - [ ] 80%+ code coverage
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SEARCH-008
- **Priority:** P1 (High)

**[SEARCH-012] Create Documentation and Examples**

- **Description:** Document /sage.search command in commands/sage.search.md. Add 5+ examples to EXAMPLES.md covering different use cases (basic search, filtered by source, date range, regex mode). Create troubleshooting guide.
- **Acceptance:**
  - [ ] commands/sage.search.md fully documented
  - [ ] Usage section with syntax and all flags explained
  - [ ] Examples: Basic search ("dependency validation")
  - [ ] Examples: Filter by source (--source=tickets)
  - [ ] Examples: Filter by date (--since=2025-10-01)
  - [ ] Examples: Regex mode (--regex "test.*pattern")
  - [ ] Examples: Combined filters (--source=specs --since=2025-10-01)
  - [ ] Troubleshooting: "Search too slow" → rebuild index
  - [ ] Troubleshooting: "No results" → check query syntax
  - [ ] Integration guide: Using with /sage.implement for context
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SEARCH-010
- **Priority:** P1 (Medium)

---

## Critical Path

```plaintext
SEARCH-002 → SEARCH-003/004/005/006/007 (parallel) → SEARCH-008 → SEARCH-011
  (3d)            (2d each, parallel)                   (3d)         (3d)
                        [11 days sequential]
                        [6 days with parallelization]
```

**Bottlenecks:**
- SEARCH-002: Blocks all searchers (foundation)
- SEARCH-008: Ranking requires all searchers complete
- SEARCH-011: Testing requires full system

**Parallel Tracks:**
- Searchers: SEARCH-003, 004, 005, 006, 007 can all be built in parallel
- Index: SEARCH-009 can be built parallel with searchers
- Auto-update: SEARCH-010 depends on SEARCH-009 only

---

## Quick Wins (Days 1-2)

1. **SEARCH-002 (Command Structure)** - Unblocks all work
2. **SEARCH-004 (Tickets Searcher)** - Most valuable source
3. **SEARCH-005 (Specs Searcher)** - High-value documentation search

---

## Risk Mitigation

| Task | Risk | Mitigation | Contingency |
|------|------|------------|-------------|
| SEARCH-008 | Ranking algorithm inaccurate | User testing, iterative tuning | Simple scoring (exact match only) as fallback |
| SEARCH-009 | Index becomes stale | Auto-update triggers, lazy rebuild | Skip index, do live search (slower but accurate) |
| SEARCH-006 | Git search slow with 10,000+ commits | Limit to 1000 commits, add --max-commits flag | Reduce default to 500 commits |
| SEARCH-011 | Performance degrades with large codebases | Benchmark testing, optimization | Document known limits, suggest narrowing queries |

---

## Testing Strategy

### Automated Testing Tasks
- **SEARCH-011 (Test Suite)** - 3 SP, Sprint 1

### Quality Gates
- Performance <2s for 90% of queries
- Ranking places best match in top 3
- All 5 sources working correctly
- Handles edge cases gracefully

---

## Team Allocation

**Backend (1-2 engineers)**
- Command structure (SEARCH-002)
- Source searchers (SEARCH-003 through 007)
- Ranking algorithm (SEARCH-008)
- Index management (SEARCH-009, 010)
- Testing (SEARCH-011)
- Documentation (SEARCH-012)

**Parallelization Strategy (2 engineers):**
- Engineer 1: SEARCH-002, 003, 005, 008, 011
- Engineer 2: SEARCH-004, 006, 007, 009, 010, 012

---

## Sprint Planning

**1-week sprint, ~25 SP capacity (with 2 engineers)**

| Sprint | Focus | Story Points | Key Deliverables |
|--------|-------|--------------|------------------|
| Sprint 1 | Full implementation | 25 SP | /sage.search command, 5 source searchers, ranking, index, tests, docs |

**Alternative (1 engineer, 2 sprints):**
- Sprint 1: Core (SEARCH-002 through 007) = 12 SP
- Sprint 2: Ranking + Index + Testing (SEARCH-008 through 012) = 13 SP

---

## Task Import Format

CSV export for project management tools:
```csv
ID,Title,Description,Estimate,Priority,Dependencies,Sprint
SEARCH-002,Search Command Structure,Flag parsing and dispatcher,3,P0,,1
SEARCH-003,Agent Docs Searcher,Search .sage/agent/ with rg,2,P0,SEARCH-002,1
SEARCH-004,Tickets Searcher,Search tickets with jq,2,P0,SEARCH-002,1
SEARCH-005,Specs Searcher,Search docs/ with rg,2,P0,SEARCH-002,1
SEARCH-006,Git Searcher,Search commits with git log,2,P0,SEARCH-002,1
SEARCH-007,Patterns Searcher,Search examples with rg,1,P0,SEARCH-002,1
SEARCH-008,Relevance Ranking,Multi-factor scoring algorithm,3,P0,"SEARCH-003,SEARCH-004,SEARCH-005,SEARCH-006,SEARCH-007",1
SEARCH-009,Search Index,Index structure and generation,3,P1,SEARCH-002,1
SEARCH-010,Auto-Update Triggers,Lazy index updates,2,P1,SEARCH-009,1
SEARCH-011,Test Suite,Unit and integration tests,3,P1,SEARCH-008,1
SEARCH-012,Documentation,Command docs and examples,2,P1,SEARCH-010,1
```

---

## Appendix

**Estimation Method:** Planning Poker with reference to existing tickets
**Story Point Scale:** Fibonacci (1,2,3,5,8,13,21)
**Definition of Done:**
- Code reviewed and approved
- Tests written and passing (80%+ coverage)
- Documentation updated
- Performance benchmarks met
- All 5 sources working correctly

**Parent Ticket:** To be created during /sage.migrate as SEARCH-001 (epic)

**Related Specifications:**
- docs/specs/context-search/spec.md
- docs/specs/context-search/plan.md

**Blocks:**
- None (independent component, enables future /sage.implement integration)
