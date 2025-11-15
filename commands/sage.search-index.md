---
name: sage.search-index
description: Build and update the context search index for faster queries
argument-hint: [--rebuild] [--source <agent|tickets|specs|git|patterns>] [--stats]
allowed-tools: Bash(jq:*), Bash(fd:*), Bash(git:*), Bash(stat:*), Bash(wc:*), Bash(date:*), Read, Glob
---

# Search Index Management

Build and maintain the search index for optimized context discovery.

## Usage

```bash
/sage.search-index [options]
```

**Options:**
- `--rebuild` - Force complete index rebuild
- `--source <type>` - Index specific source only
- `--stats` - Display index statistics

## Index Building

### 1. Index Agent Docs

```bash
index_agent_docs() {
    local entries='[]'
    
    fd -t f ".md" .sage/agent/ | while read -r file; do
        local modified=$(stat -f %Sm -t %Y-%m-%dT%H:%M:%SZ "$file")
        local size=$(stat -f %z "$file")
        local keywords=$(grep -oE '\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b|\b[a-z]{5,}\b' "$file" | sort -u | head -20 | tr '\n' ',' | sed 's/,$//')
        
        echo "{\"path\": \"$file\", \"modified\": \"$modified\", \"size\": $size, \"keywords\": \"$keywords\"}"
    done | jq -s '.'
}
```

### 2. Index Tickets

```bash
index_tickets() {
    jq '[.tickets[] | {
        id: .id,
        title: .title,
        state: .state,
        type: .type,
        updated: .updated,
        keywords: ((.title + " " + (.description // "")) | split(" ") | map(select(length > 4)) | unique | join(","))
    }]' .sage/tickets/index.json
}
```

### 3. Index Specs

```bash
index_specs() {
    fd -t f ".md" docs/specs/ docs/requirements/ | while read -r file; do
        local modified=$(stat -f %Sm -t %Y-%m-%dT%H:%M:%SZ "$file")
        local title=$(head -5 "$file" | grep "^#" | head -1 | sed 's/^#* //')
        
        echo "{\"path\": \"$file\", \"title\": \"$title\", \"modified\": \"$modified\"}"
    done | jq -s '.'
}
```

### 4. Index Git History

```bash
index_git() {
    local head=$(git rev-parse HEAD)
    
    git log --oneline -100 --format='{
        "hash": "%h",
        "message": "%s",
        "author": "%an",
        "date": "%aI"
    }' | jq -s '.'
}
```

### 5. Index Patterns

```bash
index_patterns() {
    [ -d ".sage/patterns/" ] || echo '[]' && return
    
    fd -t f ".md" .sage/patterns/ | while read -r file; do
        local type="pattern"
        echo "$file" | grep -qi "anti" && type="anti-pattern"
        local modified=$(stat -f %Sm -t %Y-%m-%dT%H:%M:%SZ "$file")
        
        echo "{\"path\": \"$file\", \"type\": \"$type\", \"modified\": \"$modified\"}"
    done | jq -s '.'
}
```

### 6. Update Index File

```bash
update_index() {
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    jq --argjson agent "$(index_agent_docs)" \
       --argjson tickets "$(index_tickets)" \
       --argjson specs "$(index_specs)" \
       --argjson git "$(index_git)" \
       --argjson patterns "$(index_patterns)" \
       --arg ts "$timestamp" '
        .updated = $ts |
        .sources.agent.entries = $agent |
        .sources.agent.total_files = ($agent | length) |
        .sources.agent.last_indexed = $ts |
        .sources.tickets.entries = $tickets |
        .sources.tickets.total_tickets = ($tickets | length) |
        .sources.tickets.last_indexed = $ts |
        .sources.specs.entries = $specs |
        .sources.specs.total_files = ($specs | length) |
        .sources.specs.last_indexed = $ts |
        .sources.git.entries = $git |
        .sources.git.total_commits = ($git | length) |
        .sources.git.last_indexed = $ts |
        .sources.patterns.entries = $patterns |
        .sources.patterns.total_patterns = ($patterns | length) |
        .sources.patterns.last_indexed = $ts
    ' .sage/search/index.json > /tmp/search-index-$$.json
    
    mv /tmp/search-index-$$.json .sage/search/index.json
}
```

## Statistics Display

```bash
show_stats() {
    jq '{
        "Index Updated": .updated,
        "Agent Docs": .sources.agent.total_files,
        "Tickets": .sources.tickets.total_tickets,
        "Specs": .sources.specs.total_files,
        "Git Commits": .sources.git.total_commits,
        "Patterns": .sources.patterns.total_patterns,
        "Total Searches": .statistics.total_searches,
        "Avg Query Time": "\(.statistics.average_query_time_ms)ms",
        "Cache Hits": .statistics.cache_hits
    }' .sage/search/index.json
}
```

## Execution

1. Parse --rebuild, --source, --stats flags
2. If --stats, display statistics and exit
3. If --source specified, index only that source
4. Otherwise, index all sources
5. Update timestamp and statistics
6. Report completion

## Example Output

```
Indexing context search sources...

Agent Docs:    42 files indexed
Tickets:       91 tickets indexed
Specs:         28 files indexed
Git History:   100 commits indexed
Patterns:      5 patterns indexed

Index updated: 2025-11-15T12:00:00Z
Index size: 245KB
```
