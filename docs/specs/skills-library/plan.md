# Skills Library Implementation Blueprint (PRP)

**Format:** Product Requirements Prompt (Context Engineering)
**Generated:** 2025-10-14
**Specification:** `docs/specs/skills-library/spec.md`
**Research Source:** Analysis of obra/superpowers repository (skills library concept)
**Phase:** 2 (Near-term, after Phase 1 components)

---

## 📖 Context & Documentation

**Traceability:** Superpowers Analysis → Specification → This Plan

**Research Source:** obra/superpowers skills library
- Reusable skills (testing, debugging, collaboration, meta-skills)
- Systematic over ad-hoc development philosophy
- Evidence-based validation

**Specification:** docs/specs/skills-library/spec.md
- Skill directory structure (`.sage/agent/skills/`)
- Skill template with validation
- Commands: `/sage.skill`, `/sage.skill-search`, `/sage.skill-add`
- Integration with enforcement agents

**Dependencies:**
- CONTEXT-002 (Initialize .sage/agent/ Directory) - Directory structure required

---

## 📊 Executive Summary

**Purpose:** Capture and share proven development techniques as reusable, validated skills

**Value:** 30% faster development, consistency across team, knowledge retention

**Target Users:** AI agents applying skills during `/sage.implement`, developers learning best practices

**Technical Approach:**
- Markdown-based skill files in `.sage/agent/skills/`
- Standardized template with evidence field
- Validation via enforcement agents
- Git-based versioning and contribution

---

## 🏗️ Architecture Design

**Directory Structure:**
```
.sage/agent/skills/
├── testing/
│   ├── tdd-workflow.md
│   ├── async-testing-python.md
│   └── integration-testing.md
├── debugging/
│   ├── root-cause-analysis.md
│   └── systematic-debugging.md
├── refactoring/
│   └── safe-refactoring-checklist.md
├── collaboration/
│   └── code-review-checklist.md
└── architecture/
    └── dependency-injection.md
```

**Skill Template Structure:**
```markdown
---
name: TDD Workflow
category: testing
languages: [python, typescript]
prerequisites:
  tools: [pytest>=7.0]
  knowledge: [unit-testing-basics]
evidence:
  - https://martinfowler.com/bliki/TestDrivenDevelopment.html
validated: true
validated_by: [sage.test-coverage, sage.type-enforcer]
---

## Purpose
[When to use, when NOT to use]

## Prerequisites
[Tools, knowledge, project setup]

## Algorithm
1. Step-by-step procedure
2. ...

## Validation
- [ ] Checklist

## Common Pitfalls
[Anti-patterns and fixes]

## Examples
[Code snippets]
```

---

## 💻 Implementation Details

### Phase 1: Core Structure (Week 1-2)

**Create:** `.sage/agent/skills/` directory with categories

**Create:** Skill template (`.sage/agent/templates/skill-template.md`)

**Initial Skills (5 seed skills):**
1. `testing/tdd-workflow.md` - Test-Driven Development
2. `debugging/systematic-debugging.md` - Step-by-step debugging
3. `refactoring/safe-refactoring-checklist.md` - Risk mitigation
4. `collaboration/code-review-checklist.md` - Quality assurance
5. `architecture/dependency-injection.md` - Common pattern

### Phase 2: Skill Commands (Week 2-3)

**Create:** `commands/sage.skill.md`

```bash
#!/bin/bash
# /sage.skill <name> [--apply]

SKILL_NAME="$1"
APPLY_MODE=false

[[ "$2" == "--apply" ]] && APPLY_MODE=true

# Find skill file
SKILL_FILE=$(find .sage/agent/skills -name "$SKILL_NAME.md" -type f 2>/dev/null | head -1)

if [[ -z "$SKILL_FILE" ]]; then
  echo "❌ Skill not found: $SKILL_NAME"
  exit 1
fi

# Display skill
cat "$SKILL_FILE"

if [[ "$APPLY_MODE" == "true" ]]; then
  # Validate prerequisites
  echo ""
  echo "Checking prerequisites..."

  # Extract prerequisites from frontmatter
  TOOLS=$(yq e '.prerequisites.tools[]' "$SKILL_FILE" 2>/dev/null)

  # Validate each tool
  for tool in $TOOLS; do
    # Check if tool installed
    which "${tool%%>=*}" >/dev/null 2>&1 || echo "⚠️  Missing: $tool"
  done

  echo ""
  echo "✅ Prerequisites validated"
  echo "Follow the Algorithm section above to apply this skill."
fi
```

**Create:** `commands/sage.skill-search.md`

```bash
#!/bin/bash
# /sage.skill-search <query> [--category=type] [--language=lang]

QUERY="$1"
CATEGORY_FILTER=""
LANGUAGE_FILTER=""

# Parse filters
shift
while [[ $# -gt 0 ]]; do
  case $1 in
    --category=*)
      CATEGORY_FILTER="${1#*=}"
      ;;
    --language=*)
      LANGUAGE_FILTER="${1#*=}"
      ;;
  esac
  shift
done

# Search skills
if [[ -n "$CATEGORY_FILTER" ]]; then
  SEARCH_PATH=".sage/agent/skills/$CATEGORY_FILTER"
else
  SEARCH_PATH=".sage/agent/skills"
fi

# Use ripgrep for fast search
rg -i "$QUERY" "$SEARCH_PATH" --files-with-matches | while read skill_file; do
  # Extract metadata
  name=$(yq e '.name' "$skill_file")
  category=$(dirname "$skill_file" | xargs basename)
  languages=$(yq e '.languages[]' "$skill_file" | tr '\n' ', ')

  # Language filter
  if [[ -n "$LANGUAGE_FILTER" ]]; then
    echo "$languages" | grep -q "$LANGUAGE_FILTER" || continue
  fi

  echo "$(basename $skill_file) ($category)"
  echo "  Languages: $languages"
  echo "  Purpose: $(yq e '.Purpose' "$skill_file" | head -1)"
  echo ""
done
```

**Create:** `commands/sage.skill-add.md`

```bash
#!/bin/bash
# /sage.skill-add <name>

SKILL_NAME="$1"

# Prompt for category
echo "Select category:"
echo "  1) testing"
echo "  2) debugging"
echo "  3) refactoring"
echo "  4) collaboration"
echo "  5) architecture"
read -p "Choice: " CATEGORY_CHOICE

case $CATEGORY_CHOICE in
  1) CATEGORY="testing" ;;
  2) CATEGORY="debugging" ;;
  3) CATEGORY="refactoring" ;;
  4) CATEGORY="collaboration" ;;
  5) CATEGORY="architecture" ;;
  *) echo "Invalid choice"; exit 1 ;;
esac

# Create skill file from template
SKILL_FILE=".sage/agent/skills/$CATEGORY/${SKILL_NAME}.md"
cp .sage/agent/templates/skill-template.md "$SKILL_FILE"

# Replace placeholders
sed -i '' "s/{{NAME}}/$SKILL_NAME/g" "$SKILL_FILE"
sed -i '' "s/{{CATEGORY}}/$CATEGORY/g" "$SKILL_FILE"

echo "✅ Created: $SKILL_FILE"
echo "Edit the file to complete the skill definition."
```

### Phase 3: Validation Integration (Week 3-4)

**Integrate with `/sage.implement`:**

```bash
# In /sage.implement, suggest relevant skills

TICKET_ID="$1"
TICKET_DATA=$(jq ".tickets[] | select(.id == \"$TICKET_ID\")" .sage/tickets/index.json)
TICKET_TYPE=$(echo "$TICKET_DATA" | jq -r '.type')

# Suggest skills based on ticket type
if [[ "$TICKET_TYPE" == "story" || "$TICKET_TYPE" == "epic" ]]; then
  echo "🎯 Suggested Skills:"
  echo "  1. tdd-workflow - Test-first development"
  echo "  2. safe-refactoring-checklist - Quality assurance"
  echo ""
  read -p "Apply skill? (1/2/none): " SKILL_CHOICE

  case $SKILL_CHOICE in
    1) /sage.skill tdd-workflow --apply ;;
    2) /sage.skill safe-refactoring-checklist --apply ;;
  esac
fi
```

**Enforcement Agent Validation:**

After skill application, run specified enforcement agents:

```bash
# Extract validated_by agents from skill
AGENTS=$(yq e '.validated_by[]' "$SKILL_FILE")

echo "Running validation agents..."
for agent in $AGENTS; do
  echo "→ $agent"
  # Run agent (use existing /sage.enforce mechanism)
  /sage.enforce --pipeline="$agent"
done
```

---

## 🔧 Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Storage | Markdown files | Human-readable, git-versionable |
| Metadata | YAML frontmatter | Standard format, parseable with yq |
| Search | ripgrep (rg) | Fast text search |
| Validation | Enforcement agents | Reuse existing validation infrastructure |

**Key Technology Decisions:**
- **Markdown over database:** Simple, no schema migrations, git-friendly
- **YAML frontmatter:** Standard in static site generators, easy parsing
- **Enforcement agents for validation:** Ensures skills meet quality standards

---

## ⚙️ Implementation Roadmap

**Week 1-2: Foundation**
- [ ] `.sage/agent/skills/` directory structure
- [ ] Skill template design
- [ ] 5 seed skills created (tdd, debugging, refactoring, review, DI)

**Week 2-3: Commands**
- [ ] `/sage.skill` command (display + apply)
- [ ] `/sage.skill-search` command (query + filter)
- [ ] `/sage.skill-add` command (create new)
- [ ] Prerequisite validation logic

**Week 3-4: Integration**
- [ ] `/sage.implement` integration (skill suggestions)
- [ ] `/sage.plan` integration (reference skills)
- [ ] Enforcement agent validation
- [ ] Documentation and examples

---

## ⚠️ Risk Management

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Skills become outdated | Medium | High | Git versioning, regular review cycles, deprecation workflow |
| Too many skills overwhelm users | Medium | Medium | Category organization, validation status filtering, relevance ranking |
| Skills conflict with project practices | Low | Low | Skills are guidelines not mandates, local overrides allowed |
| Lack of community contributions | Medium | Medium | Seed library with 20+ high-quality skills, clear contribution process |

---

## 📚 References & Traceability

**Research:** obra/superpowers skills library analysis

**Specification:** docs/specs/skills-library/spec.md

**Dependencies:**
- CONTEXT-002 (Initialize .sage/agent/ Directory) - BLOCKS this

**Integrations:**
- `/sage.implement` - Suggest skills during implementation
- `/sage.plan` - Reference skills in plans
- Enforcement agents - Validate skill application

---

## ✅ Acceptance Criteria

- [ ] `.sage/agent/skills/` with 5+ categories
- [ ] Skill template defined
- [ ] 5+ seed skills created
- [ ] `/sage.skill`, `/sage.skill-search`, `/sage.skill-add` commands
- [ ] Prerequisite validation works
- [ ] Enforcement agent integration
- [ ] Multi-language support (Python, TypeScript examples)

**Duration:** 4 weeks | **Priority:** P1 (Phase 2) | **Depends On:** CONTEXT-002
