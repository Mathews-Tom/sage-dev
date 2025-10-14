# Context Search Specification

**Version:** 1.0
**Status:** Draft
**Created:** 2025-10-14
**Component:** Multi-Source Context Search and Conversation Memory
**Based on:** obra/superpowers conversation memory and search analysis

---

## 1. Overview

### Purpose
Implement a comprehensive search capability across all Sage-Dev documentation, tickets, code patterns, and git history, enabling AI agents and developers to quickly find relevant context without manual navigation through multiple directories.

### Business Value
- **80% Faster Context Discovery**: Find relevant information in <2 seconds vs. manual directory navigation
- **Conversation Continuity**: Resume work after interruptions with full context recovery
- **Knowledge Retention**: Historical decisions and patterns discoverable long-term
- **Reduced Context Loss**: AI agents maintain memory across sessions
- **Better Decision Making**: Past solutions inform current work

### Success Metrics
- Search finds relevant results in <2 seconds for 90% of queries
- Search covers 100% of structured documentation sources
- Zero false negatives for exact matches
- Relevance ranking places best match in top 3 results (80%+ accuracy)
- Reduces "where did I see that?" questions by 80%+

### Target Users
- **Primary**: AI coding agents needing historical context during implementation
- **Secondary**: Human developers searching for past decisions and patterns
- **Tertiary**: `/sage.implement` command loading context automatically

---

## 2. Functional Requirements

### FR-1: Multi-Source Search

The system **shall** search across five distinct knowledge sources.

#### FR-1.1: Agent Documentation Search
- **Source**: `.sage/agent/` directory (tasks, system, sops, research, examples)
- **Content**: Markdown files with structured documentation
- **Query**: Full-text search with markdown-aware parsing
- **Result Format**: File path, matching section, relevance score

**As a user story**: "As an AI agent, I want to search agent documentation so that I can find established patterns and procedures"

#### FR-1.2: Ticket System Search
- **Source**: `.sage/tickets/index.json` and `.sage/tickets/*.md` files
- **Fields Searched**: `title`, `description`, `notes`, `acceptanceCriteria`
- **Query**: JSON field matching + full-text markdown search
- **Result Format**: Ticket ID, state, matching field, snippet

**As a user story**: "As a developer, I want to search past tickets so that I can understand what work was done and why"

#### FR-1.3: Specifications Search
- **Source**: `docs/specs/`, `docs/features/`, `docs/research/` directories
- **Content**: Specification documents, feature requests, research outputs
- **Query**: Full-text search with section-aware parsing
- **Result Format**: Document path, matching section header, snippet

**As a user story**: "As an AI agent, I want to search specifications so that I can understand system requirements and design decisions"

#### FR-1.4: Git History Search
- **Source**: Git commit messages and metadata
- **Query**: `git log --all --grep="<pattern>" --pretty=format:"%h %s"`
- **Result Format**: Commit hash, message, author, date, files changed

**As a user story**: "As a developer, I want to search commit history so that I can find when and why changes were made"

#### FR-1.5: Code Pattern Search
- **Source**: `.sage/agent/examples/` directory (language-specific patterns)
- **Content**: Code snippets with annotations
- **Query**: Pattern name, language, code content
- **Result Format**: Pattern file, language, use case, code snippet

**As a user story**: "As an AI agent, I want to search code patterns so that I can follow established coding conventions"

### FR-2: Search Command Interface

The system **shall** provide `/sage.search` command with multiple modes.

#### FR-2.1: Basic Search
```bash
/sage.search "dependency resolution"
```

**Behavior**:
- Searches all sources simultaneously
- Returns top 10 results ranked by relevance
- Groups results by source type
- Displays snippet with highlighting

**Output Format**:
```
🔍 Search Results for "dependency resolution"

📋 Tickets (2 matches):
  1. DEPS-001: Enhanced Dependencies Schema
     → Description: "...implement dependency resolution algorithm..."
     State: COMPLETED | Created: 2025-10-14

  2. READY-001: Ready-Work Detection
     → Acceptance Criteria: "...dependency resolution time..."
     State: UNPROCESSED | Blocked by: DEPS-001

📚 Documentation (1 match):
  3. docs/specs/enhanced-dependencies/spec.md
     → Section: "Dependency Validation"
     "...Detect circular dependencies in blocks/blockedBy chains..."

🔧 Code Patterns (1 match):
  4. .sage/agent/examples/python/dependency-injection.py
     Language: Python | Use Case: Dependency injection pattern

📝 Git History (1 match):
  5. commit a1b2c3d - "feat(deps): add dependency resolution validator"
     Author: Claude | Date: 2025-10-13
```

#### FR-2.2: Source-Filtered Search
```bash
/sage.search "authentication" --source=tickets
/sage.search "TDD workflow" --source=docs
/sage.search "commit message" --source=git
```

**Behavior**: Search only specified source, faster for targeted queries

#### FR-2.3: State-Filtered Search (Tickets)
```bash
/sage.search "bug fix" --state=COMPLETED
/sage.search "performance" --state=UNPROCESSED,IN_PROGRESS
```

**Behavior**: Filter ticket results by state, useful for finding active or completed work

#### FR-2.4: Time-Filtered Search
```bash
/sage.search "refactoring" --since="2025-10-01"
/sage.search "hotfix" --since="7 days ago"
```

**Behavior**: Filter results by creation/modification date

#### FR-2.5: Regex Search Mode
```bash
/sage.search --regex "TICKET-[0-9]{3}"
/sage.search --regex "def\s+\w+_test"
```

**Behavior**: Enable regular expression matching for advanced queries

### FR-3: Relevance Ranking

The system **shall** rank search results by relevance score.

#### FR-3.1: Ranking Algorithm
Relevance score calculated from:
1. **Exact Match Bonus**: +50 points for exact phrase match
2. **Title/Header Match**: +30 points for match in title/header
3. **Word Proximity**: +10 points per word in query found within 5-word window
4. **Recency**: +5 points per day (max 30) for recent documents
5. **Completeness**: Tickets marked COMPLETED get +10 points (authoritative)
6. **Source Priority**:
   - Research outputs: 1.5× multiplier (highest authority)
   - Specifications: 1.3× multiplier
   - Tickets: 1.0× multiplier
   - Code patterns: 1.2× multiplier
   - Git commits: 0.8× multiplier

**Business Rule**: Exact matches always rank higher than partial matches, regardless of other factors

#### FR-3.2: Result Deduplication
- If same content appears in multiple sources (e.g., spec and ticket), show highest-ranking version
- Provide "Also found in" references for transparency

### FR-4: Search Index Management

The system **shall** maintain search index for performance.

#### FR-4.1: Index Structure
```json
{
  "version": "1.0",
  "last_updated": "2025-10-14T10:00:00Z",
  "sources": {
    "agent_docs": {
      "files": 25,
      "last_scan": "2025-10-14T10:00:00Z"
    },
    "tickets": {
      "count": 50,
      "last_scan": "2025-10-14T09:55:00Z"
    },
    "specs": {
      "files": 12,
      "last_scan": "2025-10-14T09:50:00Z"
    },
    "git_commits": {
      "count": 150,
      "last_scan": "2025-10-14T09:45:00Z"
    }
  },
  "index": {
    "terms": 5000,
    "documents": 87
  }
}
```

**Storage**: `.sage/search-index.json`

#### FR-4.2: Index Maintenance
```bash
/sage.search --rebuild-index   # Force full rebuild
/sage.search --update-index    # Incremental update (new/modified files only)
```

**Auto-Update Triggers**:
- After `/sage.update-doc` command
- After `/sage.migrate` command
- After ticket state changes (every 10 updates)
- On `/sage.search` if index older than 1 hour (lazy update)

**Performance**: Index rebuild <5 seconds for 100 documents

---

## 3. Non-Functional Requirements

### NFR-1: Performance
- Search query response: <2 seconds for 90% of queries
- Search query response: <5 seconds for 100% of queries
- Index rebuild: <5 seconds for 100 documents
- Index rebuild: <30 seconds for 1000 documents
- Incremental update: <1 second for 10 new documents

### NFR-2: Accuracy
- Exact phrase matches: 100% recall (zero false negatives)
- Partial matches: 80%+ precision (relevant results)
- Relevance ranking: Top 3 results contain best match 80%+ of the time
- No crashes on malformed queries (graceful error handling)

### NFR-3: Usability
- Clear, color-coded output with source icons
- Snippet length: 150-200 characters (context without overwhelm)
- Highlighting of matched terms in snippets
- Result count and search time displayed
- Help text available via `/sage.search --help`

### NFR-4: Scalability
- Supports 1000+ documents without performance degradation
- Index size <1MB for 100 documents
- Index size <10MB for 1000 documents
- Graceful degradation if index unavailable (slower direct search)

---

## 4. Features & Flows

### Feature 1: Full-Text Search Across Sources (Priority: P0)

**Flow: Multi-Source Search**
1. User runs: `/sage.search "dependency validation"`
2. System loads search index (or builds if missing)
3. System queries each source:
   - Agent docs: `rg -i "dependency validation" .sage/agent/`
   - Tickets: `jq` query + `rg` on ticket markdown files
   - Specs: `rg -i "dependency validation" docs/specs/ docs/features/ docs/research/`
   - Git: `git log --all --grep="dependency validation"`
   - Patterns: `rg -i "dependency validation" .sage/agent/examples/`
4. System collects all matches
5. System ranks by relevance algorithm
6. System deduplicates results
7. System formats output with snippets
8. System displays top 10 results grouped by source

**Input**: Query string "dependency validation"
**Output**: Ranked, grouped search results

### Feature 2: Ticket-Specific Search (Priority: P0)

**Flow: Finding Related Work**
1. Developer asks: "Have we dealt with authentication before?"
2. Developer runs: `/sage.search "authentication" --source=tickets`
3. System searches only ticket index
4. Results filtered by ticket state (default: all states)
5. System shows:
   - Ticket ID and title
   - State (COMPLETED, IN_PROGRESS, UNPROCESSED, DEFERRED)
   - Matching snippet from description/notes
   - Related tickets (via `relatedTo` field)

**Use Case**: Avoid duplicate work, learn from past implementations

### Feature 3: Historical Decision Search (Priority: P1)

**Flow: Understanding Past Decisions**
1. AI agent needs to understand why decision was made
2. Agent runs: `/sage.search "SQLite vs JSON" --source=git,docs`
3. System searches commit messages and specification documents
4. Results show:
   - Commits discussing trade-offs
   - Specification sections with rationale
   - Research outputs comparing options
5. Agent reads context, makes informed decision

**Use Case**: Maintain consistency with past architectural decisions

### Feature 4: Pattern Discovery (Priority: P1)

**Flow: Finding Coding Patterns**
1. AI agent implementing new feature
2. Agent runs: `/sage.search "async testing" --source=patterns`
3. System searches `.sage/agent/examples/` directory
4. Results show:
   - Pattern file path
   - Language (Python, TypeScript, etc.)
   - Use case description
   - Code snippet preview
5. Agent reads full pattern, applies to current work

**Use Case**: Follow established coding conventions

### Feature 5: Automated Context Loading (Priority: P2)

**Flow: Implementation Context Assembly**
1. `/sage.implement TICKET-001` command runs
2. System automatically searches for:
   - Related tickets (via dependencies, `relatedTo`)
   - Relevant specifications (from ticket `docs` field)
   - Code patterns matching component prefix
   - Recent commits in same component
3. System assembles context package
4. Context loaded into agent prompt before implementation
5. Agent has full historical context without manual search

**Use Case**: Zero-effort context assembly for implementations

---

## 5. Acceptance Criteria

### AC-1: Search Coverage
- [ ] Searches `.sage/agent/` documentation
- [ ] Searches `.sage/tickets/` ticket system
- [ ] Searches `docs/specs/`, `docs/features/`, `docs/research/`
- [ ] Searches git commit history
- [ ] Searches `.sage/agent/examples/` code patterns

### AC-2: Search Accuracy
- [ ] Exact matches found 100% of the time
- [ ] Partial matches found with 80%+ precision
- [ ] Relevance ranking places best match in top 3 results
- [ ] No false positives from unrelated sources

### AC-3: Performance
- [ ] Search completes in <2 seconds for 90% of queries
- [ ] Index rebuild completes in <5 seconds for 100 documents
- [ ] No performance regression for projects with 1000+ documents

### AC-4: User Experience
- [ ] Clear, grouped output by source type
- [ ] Snippets show context around matches
- [ ] Matched terms highlighted in output
- [ ] Result count and search time displayed
- [ ] Help text available via `--help`

### AC-5: Filtering
- [ ] `--source` flag filters by source type
- [ ] `--state` flag filters tickets by state
- [ ] `--since` flag filters by date
- [ ] `--regex` flag enables regex matching

---

## 6. Dependencies

### Technical Dependencies
- **Requires**: `ripgrep` (`rg`) for fast text search (already in Sage-Dev)
- **Requires**: `jq` for JSON querying (already in Sage-Dev)
- **Requires**: `git` for history search
- **Optional**: `fzf` for interactive result selection (Phase 2)

### Component Dependencies
- **Related**: DEPS-001 (Enhanced Dependencies) - May search dependency metadata
- **Related**: READY-001 (Ready-Work Detection) - May search for blocked tickets
- **Related**: CONTEXT-001 (Context Engineering) - Searches `.sage/agent/` structure
- **Integration**: `/sage.implement` - Automated context loading

### External Integrations
- **Git**: Searches commit messages and metadata
- **File System**: Reads markdown and JSON files across multiple directories

### Assumptions
- All documentation stored in UTF-8 text files
- Markdown files follow consistent structure (headers for sections)
- Git history is accessible and not corrupted
- File system supports efficient directory traversal

### Risks & Mitigations
- **Risk**: Search performance degrades with 10,000+ commits
  - **Mitigation**: Limit git search to last 1000 commits by default, `--all-history` flag for exhaustive search
- **Risk**: Index becomes stale, results miss recent changes
  - **Mitigation**: Auto-update index on search if >1 hour old, manual rebuild available
- **Risk**: Queries with special characters break search
  - **Mitigation**: Escape special characters, clear error messages for invalid regex

---

## 7. Source Traceability

**Research Source**: Analysis of obra/superpowers repository (2025-10-14)
- Superpowers conversation memory and search feature
- Skills discovery and search functionality
- Gap tracking system for capability evolution

**Alignment with Sage-Dev**:
- Integrates with existing `.sage/agent/` context engineering structure (v2.5)
- Searches ticket system introduced in v2.1
- Supports research-driven workflow (searches research outputs)
- Enables conversation continuity across sessions
- Follows fail-fast philosophy (errors on invalid queries, clear messages)

**Related Specifications**:
- Enhanced Dependencies: `docs/specs/enhanced-dependencies/spec.md` (may search dependency metadata)
- Ready-Work Detection: `docs/specs/ready-work-detection/spec.md` (may search blocked tickets)
- Skills Library: `docs/specs/skills-library/spec.md` (searches skills catalog)
- Context Engineering: Existing `.sage/agent/` system (primary search target)

**Implementation Strategy**:
- Phase 1: Core search command with multi-source support
- Phase 2: Automated context loading for `/sage.implement`
- Phase 3: Interactive result selection with `fzf`, visual search interface
