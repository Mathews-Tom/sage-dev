# Context Search Implementation Blueprint (PRP)

**Format:** Product Requirements Prompt (Context Engineering)
**Generated:** 2025-10-14
**Specification:** `docs/specs/context-search/spec.md`
**Research Source:** Analysis of obra/superpowers repository (conversation memory/search)

---

## 📖 Context & Documentation

**Traceability:** Superpowers Analysis → Specification → This Plan

**Research Source:** obra/superpowers conversation memory and skills search
- Multi-source search across documentation
- Conversation continuity features
- Skills discovery functionality

**Specification:** docs/specs/context-search/spec.md
- 5 search sources (agent docs, tickets, specs, git, patterns)
- Search command interface with filtering
- Performance targets (<2s for 90% of queries)

---

## 📊 Executive Summary

**Purpose:** Enable fast context discovery across all Sage-Dev documentation sources

**Value:** 80% faster context discovery, conversation continuity, zero manual navigation

**Target Users:** AI agents needing historical context, developers searching past decisions

**Technical Approach:**
- Multi-source aggregation using existing tools (rg, jq, git)
- Simple search index (.sage/search-index.json) for performance
- `/sage.search` command with filtering and ranking

---

## 🏗️ Architecture Design

**Core Components:**

1. **Search Command** (`commands/sage.search.md`)
   - Parse query and filters
   - Dispatch to source-specific searchers
   - Aggregate and rank results
   - Format output

2. **Source Searchers** (`.sage/lib/search-*.sh`)
   - `search-agent-docs.sh` - Search `.sage/agent/`
   - `search-tickets.sh` - Search `.sage/tickets/`
   - `search-specs.sh` - Search `docs/specs/`, `docs/features/`, `docs/research/`
   - `search-git.sh` - Search commit messages
   - `search-patterns.sh` - Search `.sage/agent/examples/`

3. **Search Index** (`.sage/search-index.json`)
   - Term frequency index for fast lookup
   - Document metadata (path, modified time)
   - Lazy update (rebuild if >1 hour old)

**Data Flow:**
```
User: /sage.search "dependency validation"
  ↓
Parse query + filters (--source, --since, --regex)
  ↓
Load index (or rebuild if stale)
  ↓
Query each source in parallel
  ↓
Collect results: [
  {source: "tickets", match: "DEPS-001", snippet: "..."},
  {source: "docs", match: "spec.md", snippet: "..."}
]
  ↓
Rank by relevance (exact match > partial, recent > old)
  ↓
Format and display top 10
```

---

## 💻 Implementation Details

### Phase 1: Core Search (Week 1)

**Create:** `commands/sage.search.md`

```bash
#!/bin/bash
# /sage.search <query> [--source=type] [--since=date] [--regex]

QUERY="$1"
SOURCE_FILTER=""
SINCE_FILTER=""
REGEX_MODE=false

# Parse flags
shift
while [[ $# -gt 0 ]]; do
  case $1 in
    --source=*)
      SOURCE_FILTER="${1#*=}"
      ;;
    --since=*)
      SINCE_FILTER="${1#*=}"
      ;;
    --regex)
      REGEX_MODE=true
      ;;
  esac
  shift
done

# Search sources
results=()

if [[ -z "$SOURCE_FILTER" || "$SOURCE_FILTER" == "docs" ]]; then
  # Search agent documentation
  rg -i "$QUERY" .sage/agent/ --json | while read line; do
    # Parse and collect
  done
fi

if [[ -z "$SOURCE_FILTER" || "$SOURCE_FILTER" == "tickets" ]]; then
  # Search tickets
  jq -r ".tickets[] | select(.title + .description | test(\"$QUERY\"; \"i\"))" .sage/tickets/index.json
fi

# ... other sources

# Rank and display
echo "$results" | jq 'sort_by(.relevance) | reverse | .[0:10]'
```

**Performance:** Use `ripgrep` (`rg`) for fast text search (<100ms for 1000 files)

### Phase 2: Ranking Algorithm (Week 1)

```bash
# Relevance scoring
calculate_relevance() {
  local match="$1"
  local query="$2"
  local score=0

  # Exact match bonus
  [[ "$match" == *"$query"* ]] && ((score += 50))

  # Title/header match
  [[ "$match" =~ ^#.*"$query" ]] && ((score += 30))

  # Word proximity (words within 5-word window)
  # ... proximity calculation

  # Recency (max 30 points)
  local age_days=$(( ($(date +%s) - $(stat -f %m "$file")) / 86400 ))
  ((score += (30 - age_days > 0 ? 30 - age_days : 0)))

  echo "$score"
}
```

### Phase 3: Index Management (Week 1)

**Create:** `.sage/search-index.json`

```json
{
  "version": "1.0",
  "last_updated": "2025-10-14T10:00:00Z",
  "sources": {
    "agent_docs": {"files": 25, "last_scan": "2025-10-14T10:00:00Z"},
    "tickets": {"count": 50, "last_scan": "2025-10-14T09:55:00Z"}
  },
  "index": {
    "dependency": ["DEPS-001.md", "spec.md", ...],
    "validation": ["validate.md", "DEPS-001.md", ...]
  }
}
```

**Auto-update triggers:**
- On search if index >1 hour old
- After `/sage.update-doc`
- After `/sage.migrate`

---

## 🔧 Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Text Search | ripgrep (rg) | Fast, already in use, regex support |
| JSON Query | jq | Ticket search, already in use |
| Git Search | git log --grep | Built-in, no new dependencies |
| Index Storage | JSON | Simple, human-readable |

---

## ⚙️ Implementation Roadmap

**Week 1:**
- [ ] `/sage.search` command with basic multi-source search
- [ ] Source-specific searchers (docs, tickets, git)
- [ ] Relevance ranking algorithm
- [ ] Search index structure and auto-update
- [ ] Filtering (--source, --since, --regex)
- [ ] Documentation and examples

---

## ⚠️ Risk Management

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Search performance degrades with 10,000+ commits | Medium | Medium | Limit git search to last 1000 commits by default |
| Index becomes stale | Low | High | Auto-update on search if >1 hour old |
| Complex queries break search | Low | Low | Input validation, graceful error handling |

---

## 📚 References & Traceability

**Research:** obra/superpowers conversation memory/search analysis

**Specification:** docs/specs/context-search/spec.md

**Dependencies:** None (independent component)

**Integrations:** May integrate with `/sage.implement` for automated context loading (Phase 2)

---

## ✅ Acceptance Criteria

- [ ] Searches 5 sources (agent docs, tickets, specs, git, patterns)
- [ ] Performance <2s for 90% of queries
- [ ] Filtering works (--source, --since, --regex)
- [ ] Relevance ranking places best match in top 3
- [ ] Documentation with examples

**Duration:** 1 week | **Priority:** P1 | **Blocks:** None
