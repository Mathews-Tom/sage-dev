# Multi-Language Support

Sage-Dev supports language-specific enforcement agents while maintaining a core set of shared agents that work across all languages.

## Supported Languages

### Python (Default)

**Status:** Fully supported
**Version:** 3.12+
**File Extensions:** `*.py`

**Available Agents:**

- **Shared:**
  - `bs-check` - Remove bullshit code patterns
  - `bs-enforce` - Enforce no-bullshit principles
  - `secret-scanner` - Detect hardcoded secrets

- **Python-Specific:**
  - `type-enforcer` - Python 3.12 typing validation
  - `doc-validator` - Docstring completeness and quality
  - `test-coverage` - Test coverage enforcement
  - `import-enforcer` - Import ordering and circular dependency detection

**Tools:**

- Linter: `ruff`
- Type Checker: `mypy`
- Test Framework: `pytest`

### JavaScript

**Status:** Framework ready, agents pending implementation
**Version:** ES2022+
**File Extensions:** `*.js`, `*.jsx`

**Available Agents:**

- **Shared:**
  - `bs-check` - Remove bullshit code patterns
  - `bs-enforce` - Enforce no-bullshit principles
  - `secret-scanner` - Detect hardcoded secrets

- **JavaScript-Specific:** (Available for future implementation)

**Tools:**

- Linter: `eslint`
- Formatter: `prettier`
- Test Framework: `jest`

### TypeScript

**Status:** Framework ready, agents pending implementation
**Version:** 5.0+
**File Extensions:** `*.ts`, `*.tsx`

**Available Agents:**

- **Shared:**
  - `bs-check` - Remove bullshit code patterns
  - `bs-enforce` - Enforce no-bullshit principles
  - `secret-scanner` - Detect hardcoded secrets

- **TypeScript-Specific:** (Available for future implementation)

**Tools:**

- Linter: `eslint`
- Type Checker: `tsc`
- Test Framework: `jest`

---

## Directory Structure

```text
agents/
├── index.json                 # Agent registry with language metadata
├── LANGUAGES.md              # This file
│
├── shared/                   # Language-agnostic agents
│   ├── bs-check.md
│   ├── bs-enforce.md
│   └── secret-scanner.md
│
├── python/                   # Python-specific agents
│   ├── type-enforcer.md
│   ├── doc-validator.md
│   ├── test-coverage.md
│   └── import-enforcer.md
│
├── javascript/               # JavaScript-specific agents
│   └── (future implementation)
│
└── typescript/               # TypeScript-specific agents
    └── (future implementation)
```

---

## Language Selection

### During Setup

Run the setup script to select your language:

```bash
./sage-setup.sh
```

The wizard will prompt:

```
🌐 Select your programming language:

   1) Python (default) - Type safety, test coverage, docstring validation
   2) JavaScript       - Code quality, secret scanning
   3) TypeScript       - Type safety, code quality, secret scanning

Enter choice [1-3] (default: 1):
```

### Specify Language via Command Line

```bash
# Install for Python
./sage-setup.sh claude-code python

# Install for JavaScript
./sage-setup.sh claude-code javascript

# Install for TypeScript
./sage-setup.sh claude-code typescript
```

### Change Language Later

```bash
# Method 1: Re-run setup with different language
./sage-setup.sh claude-code typescript

# Method 2: Delete config and re-run wizard
rm .sage/config.json
./sage-setup.sh
```

---

## Configuration

Language preference is stored in `.sage/config.json`:

```json
{
  "language": "python",
  "enforcement_level": "BALANCED",
  "configured_at": "2025-01-15T10:30:00Z"
}
```

---

## Agent Registry

The `agents/index.json` file contains language-specific metadata:

```json
{
  "languages": {
    "python": {
      "name": "Python",
      "version": "3.12+",
      "default": true,
      "file_extensions": ["*.py"],
      "agents": ["type-enforcer", "doc-validator", "test-coverage", "import-enforcer"],
      "shared_agents": ["bs-check", "bs-enforce", "secret-scanner"],
      "test_framework": "pytest",
      "linter": "ruff",
      "type_checker": "mypy"
    }
  }
}
```

---

## Execution Pipelines

Each language has its own execution pipeline in `agents/index.json`:

### Python Pipeline

```json
"execution_pipelines": {
  "python": {
    "pre-write": {
      "description": "Agents that run before code is written",
      "agents": ["bs-check"],
      "fail_fast": true
    },
    "post-write": {
      "description": "Agents that run after code is written",
      "agents": ["type-enforcer", "import-enforcer", "bs-enforce"],
      "fail_fast": false
    },
    "pre-commit": {
      "description": "Agents that run before git commit",
      "agents": ["secret-scanner", "test-coverage"],
      "fail_fast": true
    }
  }
}
```

### JavaScript/TypeScript Pipelines

Similar structure, but with language-specific agents when implemented.

---

## Adding a New Language

### 1. Create Language Directory

```bash
mkdir -p agents/new-language
```

### 2. Add Language to Registry

Edit `agents/index.json`:

```json
{
  "languages": {
    "new-language": {
      "name": "NewLanguage",
      "version": "1.0+",
      "default": false,
      "file_extensions": ["*.new"],
      "agents": ["new-lang-agent"],
      "shared_agents": ["bs-check", "bs-enforce", "secret-scanner"],
      "test_framework": "new-test",
      "linter": "new-lint"
    }
  }
}
```

### 3. Create Language-Specific Agents

Create agent files in `agents/new-language/`:

```markdown
---
name: new-lang-agent
description: Agent description
model: sonnet
color: purple
---

Algorithm:
  # Agent implementation
```

### 4. Define Execution Pipeline

Add to `agents/index.json`:

```json
"execution_pipelines": {
  "new-language": {
    "pre-write": {
      "description": "Pre-write validation",
      "agents": ["bs-check"],
      "fail_fast": true
    },
    "post-write": {
      "description": "Post-write validation",
      "agents": ["new-lang-agent", "bs-enforce"],
      "fail_fast": false
    },
    "pre-commit": {
      "description": "Pre-commit checks",
      "agents": ["secret-scanner"],
      "fail_fast": true
    }
  }
}
```

### 5. Update Setup Script

Add language to `sage-setup.sh`:

```bash
SUPPORTED_LANGUAGES=("python" "javascript" "typescript" "new-language")
```

And add wizard entry:

```bash
echo "   4) NewLanguage - Description"
```

### 6. Create Language-Specific Rules

Add rules in `rules/new-language-standards.md`:

```markdown
---
description: Standards for NewLanguage development
---

# NewLanguage Standards

## Language Requirements

...
```

### 7. Test Installation

```bash
./sage-setup.sh claude-code new-language
```

---

## Enforcement Levels by Language

Each language can have different enforcement configurations:

### STRICT Mode

All agents enabled, zero tolerance.

**Python:**

- bs-check, bs-enforce
- type-enforcer (mypy --strict)
- doc-validator (all docstrings)
- test-coverage (90%+ new code)
- import-enforcer (PEP 8)
- secret-scanner

**JavaScript/TypeScript:**

- bs-check, bs-enforce
- secret-scanner
- (Future: ESLint strict, type checking)

### BALANCED Mode (Default)

Core quality checks.

**Python:**

- bs-check, bs-enforce
- type-enforcer
- secret-scanner

**JavaScript/TypeScript:**

- bs-check, bs-enforce
- secret-scanner

### PROTOTYPE Mode

Minimal checks, rapid development.

**All Languages:**

- secret-scanner only

---

## Best Practices

1. **Use Python as reference** - Most complete implementation
2. **Start with shared agents** - bs-check, bs-enforce, secret-scanner work everywhere
3. **Add language-specific gradually** - Implement one agent at a time
4. **Test with small projects** - Validate before large-scale adoption
5. **Document standards** - Create `rules/[language]-standards.md`
6. **Follow naming conventions** - `[category]-[action].md` (e.g., `type-enforcer.md`)
7. **Use execution phases** - pre-write, post-write, pre-commit
8. **Version your tools** - Specify minimum versions in registry

---

## Future Roadmap

### Planned Language Support

- **Go** - Type safety, formatting, testing
- **Rust** - Clippy integration, cargo checks
- **Ruby** - RuboCop, type checking (Sorbet)
- **Java** - SpotBugs, checkstyle
- **C#** - Roslyn analyzers

### Planned Shared Agents

- **license-validator** - Ensure proper licensing
- **dependency-auditor** - Check for vulnerabilities
- **code-complexity** - Cyclomatic complexity checks
- **performance-linter** - Detect performance anti-patterns

---

## FAQ

**Q: Can I use multiple languages in one project?**

A: Currently, one language per project. Multi-language support planned for future release.

**Q: How do I disable language-specific agents?**

A: Edit `.sage/enforcement.json` and set `"enabled": false` for specific agents.

**Q: Can I create custom agents?**

A: Yes! Create `.md` files in `agents/[language]/` following the agent template format.

**Q: What if my language isn't supported?**

A: Use shared agents (bs-check, bs-enforce, secret-scanner) and contribute language-specific agents!

**Q: How do I contribute a new language?**

A: Follow the "Adding a New Language" section and submit a PR with:

- Language directory with agents
- Updated `index.json`
- Language-specific rules
- Documentation

---

## Resources

- **Agent Template:** See existing agents in `agents/python/` for reference
- **Registry Schema:** `agents/index.json` for structure
- **Rules Template:** `rules/typing-standards.md` for example
- **Setup Script:** `sage-setup.sh` for installation logic

---

## Support

For questions or contributions:

1. Check existing agents for patterns
2. Review `agents/index.json` for registry format
3. Test with `./sage-setup.sh` before submitting
4. Open issue/PR with language proposal

**Happy coding with Sage-Dev!** 🚀
