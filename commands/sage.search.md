---
name: sage.search
description: Multi-source context search across Sage-Dev documentation with relevance ranking
argument-hint: <query> [--source <agent|tickets|specs|git|patterns>] [--since <date>] [--regex] [--limit <n>] [--format <compact|detailed|json>]
allowed-tools: Bash(rg:*), Bash(jq:*), Bash(git log:*), Bash(git branch:*), Bash(fd:*), Bash(date:*), Grep, Glob, Read
---

# Context Search Command

Search across 5 sources: agent docs, tickets, specs, git history, and patterns.

## Usage

```bash
/sage.search <query> [options]
```

## Argument Parsing

```bash
# Parse arguments
QUERY=""
SOURCE=""
SINCE=""
REGEX=false
LIMIT=10
FORMAT="compact"

# Extract query (first non-flag argument)
for arg in $ARGUMENTS; do
    case "$arg" in
        --source) shift; SOURCE="$1" ;;
        --since) shift; SINCE="$1" ;;
        --regex) REGEX=true ;;
        --limit) shift; LIMIT="$1" ;;
        --format) shift; FORMAT="$1" ;;
        --*) echo "Unknown option: $arg"; exit 1 ;;
        *) [ -z "$QUERY" ] && QUERY="$arg" ;;
    esac
done

if [ -z "$QUERY" ]; then
    echo "Error: Query required"
    echo "Usage: /sage.search <query> [options]"
    exit 1
fi
```

## Search Execution

### 1. Initialize Results Collection

Create temporary file for aggregating results:
```bash
RESULTS_FILE="/tmp/sage-search-results-$$.json"
echo '{"results": [], "metadata": {"query": "'$QUERY'", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}' > "$RESULTS_FILE"
```

### 2. Execute Source Searches

Run searches based on --source filter (or all if not specified):

#### Agent Docs Search (if SOURCE is empty or "agent")
```bash
search_agent_docs() {
    local query="$1"
    local since="$2"
    local use_regex="$3"
    
    local rg_opts="-i -l --type md"
    [ "$use_regex" = "true" ] || rg_opts="$rg_opts -F"
    
    # Search .sage/agent/ recursively
    rg $rg_opts "$query" .sage/agent/ 2>/dev/null | while read -r file; do
        # Get matching lines with context
        local matches=$(rg -i -n -C 1 "$query" "$file" | head -10)
        local modified=$(stat -f %Sm -t %Y-%m-%dT%H:%M:%SZ "$file")
        
        # Apply since filter if specified
        if [ -n "$since" ]; then
            local since_ts=$(date -j -f %Y-%m-%d "$since" +%s 2>/dev/null || echo 0)
            local file_ts=$(stat -f %m "$file")
            [ "$file_ts" -lt "$since_ts" ] && continue
        fi
        
        echo "{\"source\": \"agent\", \"path\": \"$file\", \"modified\": \"$modified\", \"matches\": \"$(echo "$matches" | head -5 | tr '\n' ' ')\"}"
    done
}
```

#### Tickets Search (if SOURCE is empty or "tickets")
```bash
search_tickets() {
    local query="$1"
    
    # Search index.json for matching tickets
    jq -r --arg q "$query" '
        .tickets[] | 
        select(
            (.title | test($q; "i")) or 
            (.description | test($q; "i")) or 
            (.acceptanceCriteria[]? | test($q; "i"))
        ) | 
        {
            source: "tickets",
            id: .id,
            title: .title,
            state: .state,
            match_field: (
                if .title | test($q; "i") then "title"
                elif .description | test($q; "i") then "description"
                else "acceptanceCriteria"
                end
            )
        }
    ' .sage/tickets/index.json 2>/dev/null
}
```

#### Specs Search (if SOURCE is empty or "specs")
```bash
search_specs() {
    local query="$1"
    local since="$2"
    local use_regex="$3"
    
    local rg_opts="-i -l --type md"
    [ "$use_regex" = "true" ] || rg_opts="$rg_opts -F"
    
    # Search docs/specs/ and docs/requirements/
    rg $rg_opts "$query" docs/specs/ docs/requirements/ 2>/dev/null | while read -r file; do
        local matches=$(rg -i -n "$query" "$file" | head -5)
        local modified=$(stat -f %Sm -t %Y-%m-%dT%H:%M:%SZ "$file")
        
        if [ -n "$since" ]; then
            local since_ts=$(date -j -f %Y-%m-%d "$since" +%s 2>/dev/null || echo 0)
            local file_ts=$(stat -f %m "$file")
            [ "$file_ts" -lt "$since_ts" ] && continue
        fi
        
        echo "{\"source\": \"specs\", \"path\": \"$file\", \"modified\": \"$modified\", \"snippet\": \"$(echo "$matches" | head -3 | tr '\n' ' ')\"}"
    done
}
```

#### Git Search (if SOURCE is empty or "git")
```bash
search_git() {
    local query="$1"
    local since="$2"
    
    local git_opts="--oneline --all -i"
    [ -n "$since" ] && git_opts="$git_opts --since=$since"
    
    # Search commit messages
    git log $git_opts --grep="$query" --format='{"source": "git", "type": "commit", "hash": "%h", "message": "%s", "date": "%ai"}' 2>/dev/null | head -20
    
    # Search branch names
    git branch -a 2>/dev/null | grep -i "$query" | while read -r branch; do
        echo "{\"source\": \"git\", \"type\": \"branch\", \"name\": \"$branch\"}"
    done
}
```

#### Patterns Search (if SOURCE is empty or "patterns")
```bash
search_patterns() {
    local query="$1"
    
    # Search .sage/patterns/ if exists
    [ -d ".sage/patterns/" ] || return
    
    rg -i -l "$query" .sage/patterns/ 2>/dev/null | while read -r file; do
        local pattern_type="pattern"
        echo "$file" | grep -qi "anti" && pattern_type="anti-pattern"
        local matches=$(rg -i -n "$query" "$file" | head -3)
        
        echo "{\"source\": \"patterns\", \"path\": \"$file\", \"type\": \"$pattern_type\", \"snippet\": \"$(echo "$matches" | tr '\n' ' ')\"}"
    done
}
```

### 3. Aggregate Results

Collect results from all sources and apply relevance ranking:

```bash
aggregate_results() {
    local query="$1"
    local results=()
    
    # Run selected searchers
    case "$SOURCE" in
        "agent") results+=($(search_agent_docs "$query" "$SINCE" "$REGEX")) ;;
        "tickets") results+=($(search_tickets "$query")) ;;
        "specs") results+=($(search_specs "$query" "$SINCE" "$REGEX")) ;;
        "git") results+=($(search_git "$query" "$SINCE")) ;;
        "patterns") results+=($(search_patterns "$query")) ;;
        *)
            # Search all sources
            results+=($(search_agent_docs "$query" "$SINCE" "$REGEX"))
            results+=($(search_tickets "$query"))
            results+=($(search_specs "$query" "$SINCE" "$REGEX"))
            results+=($(search_git "$query" "$SINCE"))
            results+=($(search_patterns "$query"))
            ;;
    esac
    
    printf '%s\n' "${results[@]}"
}
```

### 4. Apply Relevance Ranking

Score and sort results:

```bash
rank_results() {
    local query="$1"
    
    # Read results and calculate scores
    while IFS= read -r result; do
        local score=0
        
        # Exact match in title/name: +100
        echo "$result" | grep -qi "\"title\".*$query" && score=$((score + 100))
        echo "$result" | grep -qi "\"name\".*$query" && score=$((score + 100))
        
        # Recent modification: +50 for items modified in last 7 days
        local modified=$(echo "$result" | jq -r '.modified // .date // ""' 2>/dev/null)
        if [ -n "$modified" ]; then
            local mod_ts=$(date -j -f %Y-%m-%dT%H:%M:%SZ "$modified" +%s 2>/dev/null || echo 0)
            local week_ago=$(($(date +%s) - 604800))
            [ "$mod_ts" -gt "$week_ago" ] && score=$((score + 50))
        fi
        
        # Source priority: tickets +30, specs +25, agent +20, git +15, patterns +10
        case $(echo "$result" | jq -r '.source' 2>/dev/null) in
            "tickets") score=$((score + 30)) ;;
            "specs") score=$((score + 25)) ;;
            "agent") score=$((score + 20)) ;;
            "git") score=$((score + 15)) ;;
            "patterns") score=$((score + 10)) ;;
        esac
        
        # Add score to result
        echo "$result" | jq --argjson s "$score" '. + {relevance_score: $s}'
    done | jq -s 'sort_by(-.relevance_score)'
}
```

### 5. Format Output

Display results based on --format option:

#### Compact Format (default)
```
Source | Location | Match
-------|----------|------
agent  | .sage/agent/skills/testing/tdd-workflow.md:45 | "test-driven development"
tickets| SKILLS-004 | title: "Create 5 Seed Skills"
```

#### Detailed Format
```
[1] Source: agent (Score: 170)
    Path: .sage/agent/skills/testing/tdd-workflow.md
    Modified: 2025-11-15T00:00:00Z
    Match: Line 45: "test-driven development workflow"
    Context: ...
```

#### JSON Format
```json
{
  "query": "tdd",
  "total_results": 15,
  "results": [...]
}
```

### 6. Apply Limit

```bash
# Limit results
FINAL_RESULTS=$(echo "$RANKED_RESULTS" | jq ".[:$LIMIT]")
```

## Error Handling

- Invalid --source value: List valid options and exit
- No results found: Display "No results for '$QUERY'" message
- Search timeout: Warn if individual search exceeds 2s

## Examples

```bash
# Search all sources for "tdd"
/sage.search tdd

# Search only tickets
/sage.search authentication --source tickets

# Search specs modified in last week
/sage.search performance --source specs --since 2025-11-08

# Regex search with detailed output
/sage.search "test.*workflow" --regex --format detailed

# Limit to top 5 results
/sage.search refactor --limit 5
```

## Performance Requirements

- Total search time <2s for 90% of queries
- Individual source search <500ms
- Results displayed incrementally if >1s
