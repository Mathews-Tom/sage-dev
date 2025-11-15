---
allowed-tools: Bash(rg:*), Bash(fd:*), Bash(grep:*), Bash(yq:*), Bash(head:*), Bash(sort:*), Grep
description: Search skills by query with optional category and language filters.
---

## Role

Skills discovery interface for finding relevant skills by keyword search with filtering capabilities.

## Arguments

```
/sage.skill-search <query> [--category=<type>] [--language=<lang>]
```

- `<query>`: Search term to match in skill content
- `--category=<type>`: Filter by category (testing, debugging, refactoring, collaboration, architecture)
- `--language=<lang>`: Filter by programming language in frontmatter

## Execution

### 1. Parse Arguments

```bash
# Extract query and filters
QUERY="$1"
CATEGORY=""
LANGUAGE=""

# Parse optional flags
for arg in "$@"; do
  case $arg in
    --category=*)
      CATEGORY="${arg#*=}"
      ;;
    --language=*)
      LANGUAGE="${arg#*=}"
      ;;
  esac
done

if [ -z "$QUERY" ]; then
  echo "❌ Usage: /sage.skill-search <query> [--category=type] [--language=lang]"
  echo ""
  echo "Categories: testing, debugging, refactoring, collaboration, architecture"
  echo "Languages: python, typescript, javascript, go, rust, etc."
  exit 1
fi
```

**Actions:**
- Extract search query (required)
- Parse `--category` filter if provided
- Parse `--language` filter if provided
- Show usage if query missing

### 2. Determine Search Path

```bash
# Set search directory based on category filter
if [ -n "$CATEGORY" ]; then
  SEARCH_PATH=".sage/agent/skills/${CATEGORY}/"
  if [ ! -d "$SEARCH_PATH" ]; then
    echo "❌ Invalid category: $CATEGORY"
    echo "Valid categories: testing, debugging, refactoring, collaboration, architecture"
    exit 1
  fi
else
  SEARCH_PATH=".sage/agent/skills/"
fi
```

**Actions:**
- If category specified, search only that subdirectory
- Validate category exists
- Otherwise search all skills

### 3. Search Skill Content

```bash
# Use ripgrep for fast text search
echo "🔍 Searching skills for: '$QUERY'"
if [ -n "$CATEGORY" ]; then
  echo "   Category filter: $CATEGORY"
fi
if [ -n "$LANGUAGE" ]; then
  echo "   Language filter: $LANGUAGE"
fi
echo ""

# Find matching files
MATCHES=$(rg -l -i "$QUERY" "$SEARCH_PATH" --type md 2>/dev/null | sort)

if [ -z "$MATCHES" ]; then
  echo "No skills found matching: '$QUERY'"
  echo ""
  echo "Try broader search terms or check available skills:"
  fd -t f ".md" .sage/agent/skills/ -x basename {} .md | sort
  exit 0
fi
```

**Actions:**
- Use ripgrep (`rg`) for fast content search
- Case-insensitive matching (`-i`)
- List matching files (`-l`)
- Show search parameters

### 4. Filter by Language (if specified)

```bash
if [ -n "$LANGUAGE" ]; then
  # Filter matches by language in frontmatter
  FILTERED_MATCHES=""
  for FILE in $MATCHES; do
    # Check if language exists in YAML frontmatter
    if grep -q "^\s*-\s*$LANGUAGE" "$FILE" 2>/dev/null; then
      FILTERED_MATCHES="$FILTERED_MATCHES $FILE"
    fi
  done
  MATCHES="$FILTERED_MATCHES"

  if [ -z "$MATCHES" ]; then
    echo "No skills found matching '$QUERY' with language '$LANGUAGE'"
    exit 0
  fi
fi
```

**Actions:**
- If language filter provided, check YAML frontmatter
- Match language in `languages:` array
- Keep only files with matching language

### 5. Display Results

```bash
echo "📚 Found $(echo "$MATCHES" | wc -w | tr -d ' ') skill(s):"
echo ""

for FILE in $MATCHES; do
  # Extract skill metadata
  SKILL_NAME=$(basename "$FILE" .md)
  CATEGORY_DIR=$(dirname "$FILE" | xargs basename)

  # Extract purpose (first line after "## Purpose")
  PURPOSE=$(grep -A 2 "^## Purpose" "$FILE" | tail -1 | sed 's/^\*\*//' | sed 's/\*\*$//' | head -c 80)

  # Extract languages from frontmatter
  LANGUAGES=$(grep -A 10 "^languages:" "$FILE" | grep "^\s*-" | sed 's/.*- //' | head -5 | tr '\n' ', ' | sed 's/,$//')

  # Display formatted result
  echo "📄 $SKILL_NAME ($CATEGORY_DIR)"
  echo "   Languages: $LANGUAGES"
  if [ -n "$PURPOSE" ]; then
    echo "   ${PURPOSE}..."
  fi
  echo ""
done

echo "Use '/sage.skill <name>' to view full skill details"
echo "Use '/sage.skill <name> --apply' to validate prerequisites"
```

**Actions:**
- Count total matches
- For each match:
  - Extract skill name from filename
  - Extract category from directory
  - Parse languages from YAML
  - Extract purpose/description
- Display in readable format
- Provide next actions

## Output Format

### Basic Search

```
🔍 Searching skills for: 'test'

📚 Found 2 skill(s):

📄 tdd-workflow (testing)
   Languages: python, typescript
   When to use:...

📄 safe-refactoring-checklist (refactoring)
   Languages: python, typescript
   When to use:...

Use '/sage.skill <name>' to view full skill details
Use '/sage.skill <name> --apply' to validate prerequisites
```

### Filtered Search

```
🔍 Searching skills for: 'validation'
   Category filter: testing
   Language filter: python

📚 Found 1 skill(s):

📄 tdd-workflow (testing)
   Languages: python, typescript
   When to use:...

Use '/sage.skill <name>' to view full skill details
Use '/sage.skill <name> --apply' to validate prerequisites
```

### No Results

```
🔍 Searching skills for: 'nonexistent'

No skills found matching: 'nonexistent'

Try broader search terms or check available skills:
code-review-checklist
dependency-injection
safe-refactoring-checklist
systematic-debugging
tdd-workflow
```

## Error Handling

### Missing Query

```
❌ Usage: /sage.skill-search <query> [--category=type] [--language=lang]

Categories: testing, debugging, refactoring, collaboration, architecture
Languages: python, typescript, javascript, go, rust, etc.
```

### Invalid Category

```
❌ Invalid category: invalid-cat
Valid categories: testing, debugging, refactoring, collaboration, architecture
```

## Integration Points

**Used By:**
- Developers discovering relevant skills
- `/sage.implement` for skill suggestions

**Uses:**
- `.sage/agent/skills/` directory hierarchy
- Skill YAML frontmatter for metadata
- Ripgrep for fast text search

## Success Criteria

- [ ] Searches all skills recursively in `.sage/agent/skills/`
- [ ] Case-insensitive text matching with ripgrep
- [ ] `--category` filter restricts to specific category directory
- [ ] `--language` filter matches language in frontmatter
- [ ] Results show: filename, category, languages, purpose snippet
- [ ] Results sorted alphabetically by category then name
- [ ] No results shows helpful message with available skills
- [ ] Clear next actions provided (view skill, apply skill)

## Usage Examples

```bash
# Search for any skill mentioning "test"
/sage.skill-search test

# Search only in testing category
/sage.skill-search coverage --category=testing

# Search for Python-specific skills
/sage.skill-search refactor --language=python

# Combined filters
/sage.skill-search dependency --category=architecture --language=typescript

# Search for debugging techniques
/sage.skill-search "root cause"
```
