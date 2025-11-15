# Context Search System Specification

## Overview
Multi-source search system for Sage-Dev documentation enabling fast context discovery with relevance ranking.

## Core Requirements

### Search Sources (5 total)
1. **Agent Docs** - `.sage/agent/` (skills, research, examples, templates)
2. **Tickets** - `.sage/tickets/index.json` and ticket markdown files
3. **Specs** - `docs/specs/` and `docs/requirements/`
4. **Git History** - Commit messages, branches, diffs
5. **Patterns** - `.sage/patterns/` code patterns and anti-patterns

### Performance
- <2s for 90% of queries
- Caching for repeated searches
- Incremental indexing

### Command Interface
```bash
/sage.search <query> [options]
```

**Options:**
- `--source <type>` - Filter by source (agent|tickets|specs|git|patterns)
- `--since <date>` - Filter by modification date
- `--regex` - Enable regex pattern matching
- `--limit <n>` - Maximum results (default: 10)
- `--format <type>` - Output format (compact|detailed|json)

## Story Breakdown

### SEARCH-002: Command Structure
**Acceptance Criteria:**
- Command file with allowed-tools header
- Argument parsing for query and all options
- Error handling for invalid options
- Help text with usage examples

### SEARCH-003: Agent Docs Searcher
**Acceptance Criteria:**
- Searches all subdirectories (skills, research, templates, examples)
- Content-based search using ripgrep
- Returns file path, line number, and snippet
- Case-insensitive by default

### SEARCH-004: Tickets Searcher
**Acceptance Criteria:**
- Searches ticket titles and descriptions
- Searches acceptance criteria text
- Returns ticket ID, title, and matching field
- Supports state filtering

### SEARCH-005: Specs Searcher
**Acceptance Criteria:**
- Searches all spec directories
- Returns spec name, section, and snippet
- Supports --since filtering by file modification time

### SEARCH-006: Git Searcher
**Acceptance Criteria:**
- Searches commit messages using `git log --grep`
- Searches branch names
- Returns commit hash, message, and date
- Supports --since filtering

### SEARCH-007: Patterns Searcher
**Acceptance Criteria:**
- Searches pattern files in .sage/patterns/
- Returns pattern name and description
- Categorizes as pattern or anti-pattern

### SEARCH-008: Relevance Ranking
**Acceptance Criteria:**
- Exact title/name matches score highest
- Recent items score higher
- Top 3 results contain best match 90% of time
- Configurable weights

### SEARCH-009: Search Index Structure
**Acceptance Criteria:**
- `.sage/search/index.json` structure defined
- Index contains all 5 sources
- Supports incremental updates
- Index size reasonable (<10MB)

### SEARCH-010: Auto-Update Triggers
**Acceptance Criteria:**
- Index updates when files change
- Git post-commit hook updates git index
- Manual refresh command available

### SEARCH-011: Test Suite
**Acceptance Criteria:**
- Tests for all 5 searchers
- Test relevance ranking accuracy
- Performance benchmark meets <2s goal
- 80%+ test coverage

### SEARCH-012: Documentation
**Acceptance Criteria:**
- README in .sage/search/
- 5+ usage examples
- Troubleshooting section
- Performance tips
