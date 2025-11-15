# Context Search System

Multi-source search across Sage-Dev documentation with relevance ranking.

## Quick Start

```bash
# Search all sources for a term
/sage.search authentication

# Search specific source
/sage.search "bug fix" --source tickets

# Filter by date
/sage.search performance --since 2025-11-01

# Limit results
/sage.search refactor --limit 5
```

## Features

- **5 Search Sources**: Agent docs, tickets, specs, git history, patterns
- **Relevance Ranking**: Exact matches and recent items ranked higher
- **Flexible Filtering**: By source, date, or regex patterns
- **Performance**: <2s for 90% of queries
- **Multiple Formats**: Compact, detailed, or JSON output

## Commands

### /sage.search

Main search command for context discovery.

```bash
/sage.search <query> [options]

Options:
  --source <type>   Filter by source (agent|tickets|specs|git|patterns)
  --since <date>    Filter by modification date (YYYY-MM-DD)
  --regex           Enable regex pattern matching
  --limit <n>       Maximum results (default: 10)
  --format <type>   Output format (compact|detailed|json)
```

### /sage.search-index

Manage the search index for optimized queries.

```bash
/sage.search-index [options]

Options:
  --rebuild         Force complete index rebuild
  --source <type>   Index specific source only
  --stats           Display index statistics
```

## Search Sources

### 1. Agent Docs (`.sage/agent/`)
- Skills library and templates
- Research documents
- Code examples
- Best practices

### 2. Tickets (`.sage/tickets/`)
- Ticket titles and descriptions
- Acceptance criteria
- State filtering (COMPLETED, DEFERRED, etc.)

### 3. Specs (`docs/specs/`)
- Technical specifications
- Requirements documents
- Implementation plans

### 4. Git History
- Commit messages
- Branch names
- Change history

### 5. Patterns (`.sage/patterns/`)
- Code patterns
- Anti-patterns to avoid

## Examples

### Example 1: Find TDD-related content
```bash
/sage.search tdd

Results:
[1] agent  | .sage/agent/skills/testing/tdd-workflow.md (Score: 170)
[2] tickets| SKILLS-004: Create 5 Seed Skills (Score: 130)
[3] specs  | docs/specs/context-search/spec.md (Score: 125)
```

### Example 2: Search tickets only
```bash
/sage.search "dependency" --source tickets

Results:
[1] DEPS-001: Enhanced Ticket Dependency System
[2] DEPS-012: Create Unit Test Suite
[3] READY-001: Ready-Work Detection System
```

### Example 3: Recent git commits
```bash
/sage.search "feat:" --source git --since 2025-11-01

Results:
[1] 773a8c0 - docs(mcp): update Phase 2 results
[2] 96b5146 - feat(tasks): integrate pattern-based complexity
[3] 3205692 - feat(plan): integrate pattern-aware architecture
```

### Example 4: Regex pattern search
```bash
/sage.search "Step.*[0-9]" --regex --source agent

Results:
[1] .sage/agent/skills/testing/tdd-workflow.md:85
    ### Step 1: Write Failing Test (Red)
[2] .sage/agent/skills/debugging/systematic-debugging.md:45
    ### Step 2: Reproduce Consistently
```

### Example 5: JSON output for scripting
```bash
/sage.search performance --format json --limit 3

{
  "query": "performance",
  "total_results": 15,
  "results": [
    {
      "source": "specs",
      "path": "docs/specs/context-search/spec.md",
      "relevance_score": 145
    },
    ...
  ]
}
```

## Relevance Ranking

Results are scored based on:

1. **Exact Match** (+100 points)
   - Query matches title or filename exactly

2. **Recency** (+50 points)
   - Modified in the last 7 days

3. **Source Priority**
   - Tickets: +30
   - Specs: +25
   - Agent docs: +20
   - Git: +15
   - Patterns: +10

## Performance Tuning

### Index Management

Build index for faster repeated searches:
```bash
/sage.search-index --rebuild
```

View index statistics:
```bash
/sage.search-index --stats
```

### Optimization Tips

1. **Use source filtering** when you know the domain
2. **Build index** before intensive search sessions
3. **Limit results** for faster response
4. **Use specific queries** rather than broad terms

## Troubleshooting

### No Results Found
- Check spelling
- Try alternative terms
- Remove filters to broaden search
- Verify source directories exist

### Slow Performance
- Rebuild index: `/sage.search-index --rebuild`
- Use `--source` filter
- Reduce `--limit` value
- Check for large binary files in search paths

### Invalid Source Error
Valid sources: `agent`, `tickets`, `specs`, `git`, `patterns`

### Date Filter Not Working
Use ISO format: `YYYY-MM-DD` (e.g., `2025-11-15`)

## File Structure

```
.sage/search/
├── index.json      # Search index
└── README.md       # This file

.sage/patterns/
├── good/           # Recommended patterns
├── anti/           # Anti-patterns
└── README.md       # Pattern library docs
```

## Integration with Sage-Dev

The context search system integrates with:

- **/sage.implement**: Find related tickets and patterns
- **/sage.plan**: Research existing solutions
- **/sage.intel**: Gather strategic intelligence

## Technical Details

### Index Structure

```json
{
  "version": "1.0.0",
  "sources": {
    "agent": { "entries": [...], "total_files": 42 },
    "tickets": { "entries": [...], "total_tickets": 91 },
    "specs": { "entries": [...], "total_files": 28 },
    "git": { "entries": [...], "total_commits": 100 },
    "patterns": { "entries": [...], "total_patterns": 5 }
  },
  "statistics": {
    "total_searches": 0,
    "average_query_time_ms": 0,
    "cache_hits": 0
  }
}
```

### Dependencies

- **ripgrep (rg)**: Fast text search
- **jq**: JSON processing
- **git**: Git history access
- **fd**: File discovery
