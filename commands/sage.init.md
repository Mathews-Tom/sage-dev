---
allowed-tools: Bash(ls:*), Bash(find:*), Bash(cat:*), Bash(grep:*), Bash(mkdir:*), Bash(tee:*), Bash(file:*), Bash(wc:*), Bash(node:*), Bash(npx:*), SequentialThinking, Grep, Glob, Read, Write
description: Initialize sage-dev system for repository with codebase analysis and pattern extraction (run once per repo).
argument-hint: ''
---

## Role

Repository initialization specialist that analyzes codebases and bootstraps the sage-dev documentation system.

## Purpose

One-time initialization that:

- Analyzes repository structure and codebase
- Detects programming languages and frameworks
- Extracts code patterns into `.sage/agent/examples/`
- Generates baseline system documentation
- Creates directory structure for feature requests and research
- Provides repository-specific recommendations

## Execution

### Step 1: Detect Existing Initialization

```bash
# Check if already initialized
if [ -d ".sage/agent/examples" ] && [ "$(ls -A .sage/agent/examples 2>/dev/null)" ]; then
    echo "✓ sage-dev already initialized"
    echo ""
    echo "Initialization artifacts found:"
    ls -la .sage/agent/examples/
    ls -la .sage/agent/system/
    echo ""
    echo "To reinitialize, delete .sage/agent/examples/ and run again"
    echo "Or proceed to: /sage.workflow"
    exit 0
fi
```

### Step 2: Repository Analysis

```bash
# Detect language from file extensions
echo "🔍 Analyzing repository..."
echo ""

# Language detection
PYTHON_FILES=$(find . -name "*.py" -not -path "*/venv/*" -not -path "*/.venv/*" -not -path "*/node_modules/*" | wc -l)
JS_FILES=$(find . -name "*.js" -not -path "*/node_modules/*" | wc -l)
TS_FILES=$(find . -name "*.ts" -not -path "*/node_modules/*" | wc -l)
GO_FILES=$(find . -name "*.go" | wc -l)
RUST_FILES=$(find . -name "*.rs" | wc -l)

# Framework detection
HAS_REQUIREMENTS=$(test -f requirements.txt && echo "yes" || echo "no")
HAS_PACKAGE_JSON=$(test -f package.json && echo "yes" || echo "no")
HAS_GO_MOD=$(test -f go.mod && echo "yes" || echo "no")
HAS_CARGO=$(test -f Cargo.toml && echo "yes" || echo "no")

# Architecture detection
HAS_SRC=$(test -d src && echo "yes" || echo "no")
HAS_LIB=$(test -d lib && echo "yes" || echo "no")
HAS_API=$(find . -name "*api*" -type d | head -1)
HAS_SERVICES=$(find . -name "*service*" -type d | head -1)

echo "Language Detection:"
echo "  Python files: $PYTHON_FILES"
echo "  JavaScript files: $JS_FILES"
echo "  TypeScript files: $TS_FILES"
echo "  Go files: $GO_FILES"
echo "  Rust files: $RUST_FILES"
echo ""
```

### Step 3: Determine Primary Language

Use **SequentialThinking** to:

- Analyze file counts and project structure
- Identify primary and secondary languages
- Detect frameworks from dependencies
- Determine architecture style (monolith, microservices, library, etc.)
- Identify testing frameworks
- Detect CI/CD configuration

Output format:

```plaintext
Primary Language: Python
Secondary Languages: JavaScript
Framework: FastAPI
Architecture: Microservices
Testing: pytest
CI/CD: GitHub Actions
```

### Step 4: Create Directory Structure

```bash
echo "📁 Creating directory structure..."

# Create sage directories
mkdir -p .sage/agent/examples
mkdir -p .sage/agent/system
mkdir -p .sage/agent/tasks
mkdir -p .sage/agent/sops
mkdir -p .sage/agent/templates
mkdir -p .sage/agent/research
mkdir -p .sage/tickets

# Create docs directories
mkdir -p docs/features
mkdir -p docs/research
mkdir -p docs/specs

echo "✓ Created .sage/agent/ structure"
echo "✓ Created docs/features/ for feature requests"
echo "✓ Created docs/research/ for research outputs"
echo ""
```

### Step 5: Extract Code Patterns (AST-Based)

Use the sage-context-optimizer to perform AST-based pattern extraction:

```bash
echo "🔍 Extracting code patterns using AST analysis..."

# Check if MCP server is available
if [ -d "servers/sage-context-optimizer" ]; then
    # Run AST-based pattern extraction using CLI
    REPO_ROOT="$(pwd)"

    cd servers/sage-context-optimizer

    # Ensure dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "Installing pattern extractor dependencies..."
        npm install --silent
    fi

    # Build if dist doesn't exist
    if [ ! -d "dist" ]; then
        echo "Building pattern extractor..."
        npx tsc
    fi

    # Extract patterns from repository root
    node dist/cli.js \
        --repoPath "$REPO_ROOT" \
        --outputDir "$REPO_ROOT/.sage/agent/examples" \
        --samplePercentage 50 \
        --maxFiles 1000 2>&1 || {
        echo "⚠️  AST extraction failed, falling back to grep-based extraction"
        FALLBACK=true
    }

    cd "$REPO_ROOT"
else
    echo "⚠️  sage-context-optimizer not found, using grep-based extraction"
    FALLBACK=true
fi

# Fallback to grep-based extraction if AST analysis fails
if [ "$FALLBACK" = "true" ]; then
    # Find common patterns using grep (legacy method)
    CLASSES=$(grep -r "^class " --include="*.py" . 2>/dev/null | head -10)
    FUNCTIONS=$(grep -r "^def " --include="*.py" . 2>/dev/null | head -10)
    ASYNC_PATTERNS=$(grep -r "async def\|await " --include="*.py" . 2>/dev/null | head -5)
    DECORATORS=$(grep -r "@" --include="*.py" . 2>/dev/null | grep -v "^[[:space:]]*#" | head -10)
fi

# Create examples directory structure for manual patterns
mkdir -p .sage/agent/examples/python/classes
mkdir -p .sage/agent/examples/python/functions
mkdir -p .sage/agent/examples/python/async
mkdir -p .sage/agent/examples/python/decorators
mkdir -p .sage/agent/examples/python/testing
mkdir -p .sage/agent/examples/python/api
```

**AST Pattern Extraction Features:**

- **Python Analysis**: Function/class naming conventions, type hints, decorators, error handling
- **TypeScript Analysis**: Interface patterns, module system, export styles, testing frameworks
- **Confidence Scoring**: Automatic quality scoring based on pattern consistency (70%+ threshold)
- **Token Optimization**: Patterns stored in format optimized for progressive loading

**Pattern Extraction Categories:**

For **Python**:

- `classes/` - Class definitions with common patterns
- `functions/` - Function patterns (sync/async)
- `async/` - Async/await patterns
- `decorators/` - Decorator usage patterns
- `testing/` - Test patterns (pytest, unittest)
- `api/` - API endpoint patterns (FastAPI, Flask, Django)
- `models/` - Data models (SQLAlchemy, Pydantic)
- `errors/` - Error handling patterns

For **JavaScript/TypeScript**:

- `components/` - Component patterns (React, Vue, etc.)
- `hooks/` - Custom hooks
- `async/` - Promise/async patterns
- `api/` - API route patterns
- `testing/` - Test patterns (Jest, Mocha)
- `types/` - TypeScript type definitions

For **Other Languages**:

- Similar category structure appropriate to language paradigms

### Step 6: Generate Baseline System Documentation

**architecture.md:**

```bash
cat > .sage/agent/system/architecture.md <<'EOF'
# System Architecture

**Generated:** $(date +%Y-%m-%d)
**Status:** Baseline (automatically generated from codebase analysis)

## Overview

This document provides an initial architectural analysis of the repository. Update this as the system evolves.

## Detected Structure

**Primary Language:** [Detected language]
**Architecture Style:** [Monolith | Microservices | Library | CLI Tool]
**Directory Structure:**

\`\`\`
[Tree structure of main directories]
\`\`\`

## Components

Based on directory analysis, the following components were identified:

[List of main components/modules]

## Technology Stack

See tech-stack.md for detailed technology analysis.

## Patterns

See patterns.md for extracted code patterns.

## Next Steps

1. Review and refine this architecture document
2. Add architecture diagrams (Mermaid recommended)
3. Document component interactions
4. Define API contracts between components
5. Run /sage.workflow to choose development approach
EOF
```

**tech-stack.md:**

```bash
cat > .sage/agent/system/tech-stack.md <<'EOF'
# Technology Stack

**Generated:** $(date +%Y-%m-%d)

## Languages

- **Primary:** [Language + Version]
- **Secondary:** [Other languages if detected]

## Frameworks & Libraries

[Detected from requirements.txt, package.json, go.mod, etc.]

### Backend
[Framework name and version]

### Frontend
[If applicable]

### Testing
[Testing frameworks detected]

### Build & Deploy
[CI/CD and build tools detected]

## Development Tools

- Version Control: Git
- Package Manager: [Detected: pip, npm, cargo, etc.]
- Linter: [Detected or recommended]
- Formatter: [Detected or recommended]

## Infrastructure

[If infrastructure-as-code files detected]

## Next Steps

1. Verify detected technologies are current
2. Add missing dependencies
3. Document version requirements
4. Define upgrade strategy
EOF
```

**patterns.md:**

```bash
cat > .sage/agent/system/patterns.md <<'EOF'
# Code Patterns

**Generated:** $(date +%Y-%m-%d)

## Overview

Common code patterns extracted from codebase. Use these as reference when implementing new features.

## Pattern Categories

### [Language] Patterns

Examples extracted to: .sage/agent/examples/[language]/

**Classes:**
- [Number] class definitions found
- Common patterns: [Identified patterns]

**Functions:**
- [Number] function definitions found
- Common patterns: [Sync, async, decorators, etc.]

**Testing:**
- [Number] test files found
- Framework: [Detected testing framework]
- Patterns: [Test structure patterns]

## Recommendations

Based on codebase analysis:

1. **Consistency:** Follow existing patterns in .sage/agent/examples/
2. **Testing:** Maintain [detected test coverage] coverage level
3. **Style:** Use detected code style ([PEP 8, Standard JS, etc.])
4. **Documentation:** Follow docstring patterns from examples

## Next Steps

1. Review extracted patterns in .sage/agent/examples/
2. Add additional patterns as needed
3. Document pattern decisions
4. Run /sage.workflow to begin development
EOF
```

### Step 7: Generate Example Pattern Files

For each major pattern category, create example files:

```bash
# Example: Create a sample Python class pattern file
cat > .sage/agent/examples/python/classes/example-class.md <<'EOF'
# Python Class Pattern Example

**Extracted from:** [source file path]

## Pattern

\`\`\`python
class ExampleClass:
    """Example class pattern from codebase.

    This shows the common class structure used in this project.
    """

    def __init__(self, arg1: str, arg2: int):
        self.arg1 = arg1
        self.arg2 = arg2

    def method_example(self) -> str:
        """Example method pattern."""
        return f"{self.arg1}: {self.arg2}"
\`\`\`

## Usage

[How this pattern is typically used]

## Related Patterns

- [Links to related pattern examples]
EOF
```

### Step 8: Create Initial Configuration

```bash
# Create or update .sage/config.json if not exists
if [ ! -f ".sage/config.json" ]; then
    cat > .sage/config.json <<EOF
{
  "language": "[detected_primary_language]",
  "enforcement_level": "BALANCED",
  "configured_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "initialized": true,
  "initialization_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "cache": {
    "enabled": true,
    "maxAge": 86400,
    "maxSize": "100MB",
    "researchPath": ".sage/agent/research",
    "patternsPath": ".sage/agent/examples"
  },
  "patternExtraction": {
    "enabled": true,
    "samplePercentage": 50,
    "maxFilesPerLanguage": 1000,
    "timeoutPerFile": 5000,
    "confidenceThreshold": 0.7
  },
  "progressiveLoading": {
    "enabled": true,
    "levels": ["critical", "core", "extended"],
    "defaultLevel": "core"
  }
}
EOF
    echo "✓ Created .sage/config.json with pattern extraction settings"
fi
```

### Step 9: Update .gitignore

```bash
# Add .sage/ to .gitignore if not present
if [ -f ".gitignore" ]; then
    grep -q "^\.sage/$" .gitignore || echo ".sage/" >> .gitignore
    echo "✓ Updated .gitignore"
else
    echo ".sage/" > .gitignore
    echo "✓ Created .gitignore"
fi
```

### Step 10: Generate Initialization Report

```bash
cat <<'EOF'

═══════════════════════════════════════════════════════════════════
                    SAGE-DEV INITIALIZATION COMPLETE
═══════════════════════════════════════════════════════════════════

📊 Repository Analysis Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Primary Language:     [Detected Language]
  Secondary Languages:  [If any]
  Framework:            [Detected Framework]
  Architecture:         [Architecture Style]
  Testing Framework:    [If detected]

  Code Statistics:
    • [Language] files:  [Count]
    • Test files:        [Count]
    • Total LOC:         [Estimate if available]

📁 Created Structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  .sage/agent/
    ├── examples/                AST-based patterns extracted
    │   └── repository-patterns.ts  Validated patterns with confidence scores
    ├── system/                 Baseline documentation generated
    ├── tasks/                  Ready for implementation plans
    ├── sops/                   Ready for procedures
    ├── templates/              Standard templates
    └── research/               Ready for research outputs (TTL caching)

  docs/
    ├── features/               Feature request location
    ├── research/               Research output location
    └── specs/                  Specifications location

🔬 AST Pattern Extraction Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Python Patterns:
    • Files analyzed: [Count]
    • Confidence score: [Score]%
    • Naming conventions: [Pattern]
    • Type hint coverage: [Coverage]%
    • Test framework: [Framework]

  TypeScript Patterns:
    • Files analyzed: [Count]
    • Confidence score: [Score]%
    • Module system: [ESM/CJS]
    • Export style: [Named/Default]
    • Test framework: [Framework]

  Token Optimization:
    • Progressive loading enabled
    • Default level: core
    • Estimated reduction: 60-80%

📚 Generated Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓ .sage/agent/system/architecture.md    System architecture baseline
  ✓ .sage/agent/system/tech-stack.md      Technology stack analysis
  ✓ .sage/agent/system/patterns.md        Code pattern documentation
  ✓ .sage/agent/examples/repository-patterns.ts  AST-extracted patterns
  ✓ .sage/config.json                      Pattern extraction configuration

🎯 Next Steps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Review generated documentation:
     • .sage/agent/system/architecture.md
     • .sage/agent/system/tech-stack.md
     • .sage/agent/system/patterns.md
     • .sage/agent/examples/[language]/

  2. Run workflow selector:

     /sage.workflow

     This will help you choose between Traditional and Ticket-Based workflows.

  3. Once workflow is selected, you can start with:

     /sage.init-feature <feature-name>    Create feature request
     /sage.intel                           Research and analyze
     /sage.specify                         Generate specifications

📖 Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  • Full workflow guide: commands/SAGE.WORKFLOW_GUIDE.md
  • Command reference: commands/SAGE.COMMANDS.md
  • Agent documentation: .sage/agent/README.md

═══════════════════════════════════════════════════════════════════

EOF
```

### Step 11: Automatically Recommend /sage.workflow

```bash
echo "🚀 RECOMMENDED NEXT COMMAND: /sage.workflow"
echo ""
echo "This will help you choose the optimal development workflow for your project."
echo ""
echo "Run: /sage.workflow"
```

## Pattern Extraction Logic

Use **SequentialThinking** to intelligently extract patterns:

1. **Identify Representative Files**
   - Find files with common patterns
   - Avoid test-only or generated code
   - Prioritize well-structured examples

2. **Extract Pattern Categories**
   - Group by language feature (classes, functions, async, etc.)
   - Identify framework-specific patterns (routes, models, etc.)
   - Extract testing patterns

3. **Create Example Documentation**
   - Document each pattern with context
   - Include usage examples
   - Link related patterns

4. **Quality Filtering**
   - Exclude trivial patterns
   - Focus on reusable patterns
   - Ensure patterns follow project conventions

## Language-Specific Extraction

### Python

- Classes with `__init__`, properties, methods
- Async functions with `async/await`
- Decorators (@property, @classmethod, custom)
- FastAPI/Flask routes
- Pydantic models
- pytest fixtures and test patterns
- SQLAlchemy models
- Error handling patterns

### JavaScript/TypeScript

- React components (functional, class)
- Custom hooks
- API routes (Express, Next.js)
- Async patterns (Promises, async/await)
- TypeScript interfaces and types
- Jest/Mocha test patterns
- Redux/state management patterns

### Go

- Struct definitions
- Interface implementations
- Goroutine patterns
- HTTP handler patterns
- Testing patterns
- Error handling patterns

### Rust

- Struct and enum definitions
- Trait implementations
- Error handling (Result, Option)
- Async patterns (tokio)
- Testing patterns
- Ownership patterns

## Output Quality

- **Comprehensive:** Extract diverse pattern categories
- **Representative:** Show actual project patterns, not generic examples
- **Documented:** Each pattern explained with context
- **Organized:** Clear directory structure by language and category
- **Actionable:** Patterns ready to reference during implementation

## Error Handling

### No Language Detected

```plaintext
⚠️  Could not detect primary programming language

No source files found in common locations.

Options:
1. Ensure source code is in standard locations (src/, lib/, etc.)
2. Run /sage.init after adding source code
3. Manually create .sage/ structure

Would you like to create minimal structure anyway? [Y/n]
```

### Permission Issues

```plaintext
❌ ERROR: Cannot create .sage/ directory

Permission denied. Try:
  sudo chown -R $USER .
  chmod -R u+w .

Or run with appropriate permissions.
```

### Already Initialized

```plaintext
✓ sage-dev already initialized

Found existing initialization:
  • .sage/agent/examples/ (populated)
  • .sage/agent/system/ (documented)

To reinitialize:
  1. Backup: mv .sage/agent .sage/agent.backup
  2. Rerun: /sage.init

To continue: /sage.workflow
```

## Success Criteria

- [x] Repository analyzed successfully
- [x] Primary language detected
- [x] Directory structure created
- [x] Code patterns extracted to .sage/agent/examples/
- [x] Baseline documentation generated
- [x] Configuration created
- [x] .gitignore updated
- [x] Initialization report displayed
- [x] /sage.workflow recommended

## Notes

- Run only ONCE per repository
- Safe to rerun (will detect existing initialization)
- Non-destructive (creates new directories and files)
- Extracts patterns without modifying source code
- Automatically recommends /sage.workflow as next step
- Foundation for all subsequent sage-dev commands
