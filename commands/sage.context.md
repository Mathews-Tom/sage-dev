---
allowed-tools: Bash(cat:*), Bash(test:*), Bash(grep:*), Bash(jq:*), Read, Write, Edit, Glob, SequentialThinking
description: Generate or update .sage/context.md with project context (tech stack, architecture, code style, key files).
argument-hint: '[--regenerate] (optional, regenerates from scratch)'
---

## Role

Project context engineer that creates and maintains `.sage/context.md` - the single source of truth for project-level information that informs all ticket creation and implementation.

## Purpose

Generate comprehensive project context documentation that includes:

- **Tech Stack**: Languages, frameworks, databases, tools
- **Architecture Decisions**: Key patterns and why they were chosen
- **Code Style Preferences**: Naming conventions, file organization, testing patterns
- **Key File References**: Critical files and their purposes
- **Project Conventions**: Ticket naming, branching, commit messages

This context is automatically referenced during:
- Ticket creation (`/sage.specify`, `/sage.tasks`)
- Implementation (`/sage.implement`)
- Code generation (`/sage.plan`)

## Execution

### Step 1: Check Existing Context

```bash
# Check if context file already exists
if [ -f ".sage/context.md" ] && [ "$1" != "--regenerate" ]; then
    echo "✓ .sage/context.md already exists"
    echo ""
    cat .sage/context.md
    echo ""
    echo "To regenerate from scratch: /sage.context --regenerate"
    echo "To edit manually: open .sage/context.md"
    exit 0
fi
```

**Key Actions:**
- Exit early if context exists (unless --regenerate)
- Show current context if it exists
- Provide guidance for updates

### Step 2: Analyze Project Structure

```bash
echo "🔍 Analyzing project structure..."
echo ""

# Read config if it exists
if [ -f ".sage/config.json" ]; then
    PRIMARY_LANG=$(jq -r '.language' .sage/config.json)
    ENFORCEMENT=$(jq -r '.enforcement_level // "BALANCED"' .sage/config.json)
fi

# Detect languages and frameworks
PYTHON_FILES=$(fd -e py -t f | wc -l)
JS_FILES=$(fd -e js -t f | wc -l)
TS_FILES=$(fd -e ts -t f | wc -l)

# Detect frameworks
HAS_FASTAPI=$(grep -r "from fastapi" . --include="*.py" | head -1)
HAS_DJANGO=$(test -f manage.py && echo "yes" || echo "no")
HAS_FLASK=$(grep -r "from flask" . --include="*.py" | head -1)
HAS_REACT=$(grep "react" package.json 2>/dev/null)
HAS_NEXT=$(grep "next" package.json 2>/dev/null)

# Detect databases
HAS_POSTGRES=$(grep -r "postgres\|psycopg" . --include="*.py" --include="*.js" --include="*.ts" | head -1)
HAS_MONGO=$(grep -r "mongodb\|pymongo" . --include="*.py" --include="*.js" --include="*.ts" | head -1)
HAS_REDIS=$(grep -r "redis" . --include="*.py" --include="*.js" --include="*.ts" | head -1)

# Detect testing frameworks
HAS_PYTEST=$(grep "pytest" requirements.txt pyproject.toml 2>/dev/null || grep "pytest" uv.lock 2>/dev/null)
HAS_JEST=$(grep "jest" package.json 2>/dev/null)

# Check for key documentation
HAS_ARCHITECTURE=$(test -f ".sage/agent/system/architecture.md" && echo "yes" || echo "no")
HAS_TECH_STACK=$(test -f ".sage/agent/system/tech-stack.md" && echo "yes" || echo "no")
HAS_PATTERNS=$(test -f ".sage/agent/system/patterns.md" && echo "yes" || echo "no")
```

**Key Actions:**
- Read existing configuration
- Detect languages, frameworks, databases
- Identify testing frameworks
- Check for existing documentation

### Step 3: Extract Architecture Information

Use **SequentialThinking** to analyze:

1. **Tech Stack Analysis**
   - Primary language(s) and versions
   - Frameworks and their versions
   - Database technologies
   - Testing frameworks
   - Build tools and package managers

2. **Architecture Pattern Detection**
   - Directory structure (monolith, microservices, modules)
   - API patterns (REST, GraphQL, gRPC)
   - State management (if frontend)
   - Authentication/authorization patterns
   - Data flow patterns

3. **Code Style Inference**
   - Import organization (from existing files)
   - Naming conventions (camelCase, snake_case, PascalCase)
   - File organization patterns
   - Test file naming
   - Export patterns (default vs named)

4. **Key Files Identification**
   - Configuration files
   - Entry points (main.py, index.ts, etc.)
   - Core modules/services
   - Database models/schemas
   - API route definitions

### Step 4: Read Existing Documentation

```bash
echo "📚 Reading existing documentation..."
echo ""

# Read architecture docs if they exist
ARCHITECTURE_CONTENT=""
if [ "$HAS_ARCHITECTURE" = "yes" ]; then
    ARCHITECTURE_CONTENT=$(cat .sage/agent/system/architecture.md)
fi

TECH_STACK_CONTENT=""
if [ "$HAS_TECH_STACK" = "yes" ]; then
    TECH_STACK_CONTENT=$(cat .sage/agent/system/tech-stack.md)
fi

PATTERNS_CONTENT=""
if [ "$HAS_PATTERNS" = "yes" ]; then
    PATTERNS_CONTENT=$(cat .sage/agent/system/patterns.md)
fi

# Read code examples
EXAMPLES_COUNT=$(fd . .sage/agent/examples -t f | wc -l)
if [ "$EXAMPLES_COUNT" -gt 0 ]; then
    echo "Found $EXAMPLES_COUNT code examples in .sage/agent/examples/"
    # Sample 2-3 examples to understand patterns
fi
```

**Key Actions:**
- Read existing system documentation
- Sample code examples to understand patterns
- Extract conventions from documentation

### Step 5: Generate Context Document

```bash
echo "📝 Generating .sage/context.md..."
echo ""

# Create context document with all gathered information
cat > .sage/context.md <<'EOF'
# Project Context

> Auto-generated by /sage.context
> Last updated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Tech Stack

### Languages
- **Primary:** [Detected primary language + version]
- **Secondary:** [Other languages if applicable]

### Frameworks
- [Framework name]: [Purpose, e.g., "FastAPI - REST API server"]
- [Framework name]: [Purpose]

### Databases
- [Database]: [Purpose and usage]

### Testing
- [Test framework]: [Coverage target, patterns]

### Build & Package Management
- [Tool]: [Usage, e.g., "uv - Python package manager"]

---

## Architecture Decisions

### Overall Pattern
[Monolith | Microservices | Modular Monolith | Library]

**Rationale:** [Why this pattern was chosen]

### API Design
- **Style:** [REST | GraphQL | gRPC]
- **Versioning:** [Strategy]
- **Authentication:** [Method, e.g., JWT, OAuth2]

### Data Flow
[Description of how data moves through the system]

### Key Patterns
1. **[Pattern name]**: [Description and usage]
2. **[Pattern name]**: [Description and usage]

---

## Code Style Preferences

### File Organization
```
[Project structure example]
src/
  components/    # [Purpose]
  services/      # [Purpose]
  utils/         # [Purpose]
```

### Naming Conventions
- **Files:** [Convention, e.g., "kebab-case.ts"]
- **Classes:** [Convention, e.g., "PascalCase"]
- **Functions:** [Convention, e.g., "camelCase"]
- **Variables:** [Convention, e.g., "snake_case"]
- **Constants:** [Convention, e.g., "UPPER_SNAKE_CASE"]

### Import Style
- [Convention, e.g., "Use named exports, avoid default exports"]
- [Import ordering rules]

### Testing Patterns
- **Test files:** [Naming, e.g., "test_*.py or *.test.ts"]
- **Coverage target:** [e.g., "80% minimum"]
- **Mocking:** [Strategy]

### Error Handling
- [Fail fast | Graceful degradation]
- [Exception patterns]

---

## Key File References

### Configuration
- `[file]`: [Purpose]

### Entry Points
- `[file]`: [Purpose]

### Core Modules
- `[path/to/file]`: [Purpose and key responsibilities]

### Database Layer
- `[file]`: [Models/schemas/migrations]

### API Layer
- `[file]`: [Route definitions, controllers]

---

## Project Conventions

### Ticket Naming
- Format: `<COMPONENT>-<NUMBER>`
- Components: [List common components, e.g., AUTH, API, UI, DB]

### Git Workflow
- **Branching:** [Strategy, e.g., "feature/TICKET-ID-description"]
- **Commits:** [Style, e.g., "Conventional Commits"]
- **Main branch:** [main | master]

### Documentation
- [Where docs live, e.g., "docs/ for specs, .sage/agent/ for system docs"]
- [Update policy]

---

## Notes

[Any additional context, special considerations, or project-specific information]

EOF
```

**Key Actions:**
- Generate comprehensive context document
- Include all detected information
- Use clear structure with sections
- Add timestamp and auto-generation notice

### Step 6: Manual Review Prompt

```bash
echo "✓ Generated .sage/context.md"
echo ""
echo "📋 Next steps:"
echo "  1. Review .sage/context.md for accuracy"
echo "  2. Edit manually to add project-specific details"
echo "  3. Update 'Architecture Decisions' with design rationale"
echo "  4. Add any special conventions or constraints"
echo ""
echo "This context will be automatically referenced in:"
echo "  - /sage.specify (ticket creation)"
echo "  - /sage.plan (implementation planning)"
echo "  - /sage.tasks (task breakdown)"
echo "  - /sage.implement (code generation)"
echo ""
echo "To regenerate: /sage.context --regenerate"
```

**Key Actions:**
- Inform user of next steps
- Explain where context is used
- Provide regeneration instructions

## Integration Points

### Commands that reference `.sage/context.md`:

1. **`/sage.specify`** - Step 3 (Context Assembly)
   - Read context before generating specs
   - Apply tech stack and patterns to specs

2. **`/sage.plan`** - Step 3 (Context Engineering)
   - Include context in planning
   - Ensure architecture alignment

3. **`/sage.tasks`** - Step 2 (Context Loading)
   - Reference context for task breakdown
   - Apply conventions to task definitions

4. **`/sage.implement`** - Step 3 (Context Assembly)
   - Load context before implementation
   - Apply code style and patterns

## Usage Examples

```bash
# First time setup
/sage.context

# Regenerate after major architecture changes
/sage.context --regenerate

# View current context
cat .sage/context.md
```

## Benefits

1. **Consistency**: Single source of truth for project information
2. **Onboarding**: New tickets automatically use correct patterns
3. **Quality**: Implementations follow established conventions
4. **Efficiency**: No need to repeat context in every prompt
5. **Evolution**: Easy to update as project evolves
