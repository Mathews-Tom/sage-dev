# Sage-Dev Agents & Rules Enhancement

**Version:** 2.5.0 (Context Engineering Integration)
**Completed:** 2025-10-12

## Summary

Enhanced sage-dev system with comprehensive **multi-language** agent enforcement and rule framework for automated code quality validation. Supports Python, JavaScript, and TypeScript with language-specific and shared agents.

## 🎯 Cross-Platform Skills (New in v2.6)

**Agents are now portable!** All enforcement agents described in this document are available as **Universal Skills** that work across Claude, ChatGPT, Gemini, and other LLMs.

**Quick Start:**
```bash
./sage-skillify.sh  # Generates portable Skills from agents
# Upload skills/*.zip to your preferred LLM
```

Skills consolidate agents and rules into 8 portable packages:
- **Sage Python Quality Suite** - type-enforcer + doc-validator + test-coverage + import-enforcer
- **Sage Security Guard** - secret-scanner + bs-check + bs-enforce
- And 6 more domain-specific Skills

**Learn More:** See [docs/SKILLS_GUIDE.md](docs/SKILLS_GUIDE.md) for cross-platform usage.

---

## What Was Added

### 1. Multi-Language Architecture

**Multi-language support** (v2.0.0+): Language-specific enforcement with intelligent agent selection.

**Supported Languages:**

- **Python** (3.12+) - Fully supported with 4 language-specific agents
- **JavaScript** (ES2022+) - Framework ready, shared agents available
- **TypeScript** (5.0+) - Framework ready, shared agents available

**Language Selection:**

- Interactive wizard during setup
- Automatic language detection from `.sage/config.json`
- Manual selection via command-line argument

**Agent Organization:**

```
agents/
├── shared/          # Language-agnostic (bs-check, bs-enforce, secret-scanner)
├── python/          # Python-specific (type-enforcer, doc-validator, etc.)
├── javascript/      # JavaScript-specific (future implementation)
└── typescript/      # TypeScript-specific (future implementation)
```

**Configuration:**

- Language preference stored in `.sage/config.json`
- Language-specific execution pipelines
- Per-language enforcement levels
- Automatic tool detection (mypy for Python, tsc for TypeScript, etc.)

See [agents/LANGUAGES.md](agents/LANGUAGES.md) for complete language support guide.

### 2. Agent Registry System (`agents/index.json`)

Central registry cataloging all development enforcement agents with:

- **Language metadata** - Supported languages, file extensions, tool versions
- **Agent categorization** - Language-specific vs shared agents
- **Execution pipelines** - Per-language pipeline configurations
- Agent metadata (name, description, file, model, color)
- Execution phases (pre-write, post-write, pre-commit)
- Priority ordering
- Enabled/disabled status
- Enforcement level definitions (STRICT, BALANCED, PROTOTYPE)
- Category grouping

### 3. Shared Enforcement Agents (All Languages)

**`agents/shared/bs-check.md`** - Bullshit code pattern removal

- Detects fallbacks, mocks, templates
- Error swallowing detection
- Graceful degradation removal
- Language-agnostic patterns
- Works across Python, JavaScript, TypeScript

**`agents/shared/bs-enforce.md`** - No-bullshit enforcement

- Post-write validation
- Blocks bullshit patterns
- Enforces explicit errors
- Language-agnostic rules

**`agents/shared/secret-scanner.md`** - Hardcoded secret detection

- Scans for API keys, passwords, tokens
- Detects AWS, Google, GitHub, OpenAI credentials
- Private key detection (RSA, SSH, PGP)
- Database URL scanning
- Allowlist support with justification
- Immediate blocking on detection

### 4. Python-Specific Enforcement Agents

**`agents/python/type-enforcer.md`** - Python 3.12 typing validation

- Enforces `from __future__ import annotations`
- Converts legacy typing imports (List→list, Optional→|None)
- Validates type annotations completeness
- Runs mypy --strict validation
- Auto-fixes legacy patterns

**`agents/python/doc-validator.md`** - Docstring completeness checker

- Validates Google-style docstrings
- Checks function/class documentation
- Verifies Args, Returns, Raises sections
- Ensures all parameters documented
- Auto-generates docstring templates
- Python-specific documentation standards

**`agents/python/test-coverage.md`** - Coverage threshold enforcement

- Minimum overall coverage: 80%
- New code coverage: 90%
- Critical files: 95%
- Blocks commits below threshold
- Tracks coverage history using pytest-cov
- Detects coverage regression
- Python-specific test validation

**`agents/python/import-enforcer.md`** - Import validation

- PEP 8 import ordering
- Absolute imports only (no relative)
- Alphabetical sorting within groups
- Detects circular dependencies
- Auto-fixes ordering violations
- Generates import dependency graph
- Python-specific import rules

### 5. Enhanced Rules Framework

**`rules/typing-standards.md`** - Python 3.12 typing standards

- Built-in generics only (list[T], dict[K,V])
- | unions only (T | None)
- Type annotation requirements
- mypy configuration
- Auto-fix transformations

**`rules/test-standards.md`** - Test coverage and quality

- Coverage thresholds
- Test organization standards
- AAA pattern enforcement
- Anti-pattern detection
- Fixture best practices
- Parametrized testing

**`rules/security-standards.md`** - Security and secret management

- Zero tolerance secret policy
- Input validation (SQL injection, XSS, path traversal)
- Authentication standards (password hashing, JWT)
- HTTPS/TLS requirements
- File upload security
- Secret rotation procedures

**`rules/commit-standards.md`** - Conventional commits

- Commit format: type(scope): subject
- Commit types (feat, fix, docs, etc.)
- Subject line rules
- Breaking changes notation
- Issue references
- Pre-commit validation

### 6. Agent Pipeline Executor

**`commands/enforce.md`** - Pipeline orchestration command

- Executes agents in configured sequence
- Supports multiple pipelines (pre-write, post-write, pre-commit, full-validation)
- Auto-fix capabilities
- Dry-run mode
- Enforcement level support (STRICT/BALANCED/PROTOTYPE)
- Aggregated reporting

### 7. Enforcement Configuration

**`.sage/config.json`** - Language and setup configuration

- Selected programming language (python/javascript/typescript)
- Enforcement level (STRICT/BALANCED/PROTOTYPE)
- Configuration timestamp
- Auto-generated during setup

**`.sage/enforcement.json.template`** - Configuration template

- Enforcement level selection
- Agent enable/disable
- Auto-fix settings
- Git hooks configuration
- Path/file exemptions
- Thresholds and notifications

**`.sage/README.md`** - Configuration guide

- Setup instructions
- Enforcement level explanations
- Agent configuration
- Git hooks setup
- Troubleshooting guide

### 8. Updated Installation Script

**`sage-setup.sh`** (renamed from `install-sage-commands.sh`) - Multi-language setup

- **NEW:** Interactive language selection wizard
- **NEW:** Language-specific agent installation
- Auto-detects AI coding agents
- Installs commands, agents (shared + language-specific), and rules
- Copies agent registry (index.json)
- Creates `.sage/config.json` with language preference
- Creates agent and rule directories
- Updated summary with language info

## File Structure

```plaintext
sage-dev/
├── agents/
│   ├── index.json              # Agent registry v2.1.0 (UPDATED - multi-language)
│   ├── LANGUAGES.md            # Language support guide
│   │
│   ├── shared/                 # Language-agnostic agents
│   │   ├── bs-check.md         # Moved from agents/
│   │   ├── bs-enforce.md       # Moved from agents/
│   │   └── secret-scanner.md   # NEW
│   │
│   ├── python/                 # Python-specific agents
│   │   ├── type-enforcer.md
│   │   ├── doc-validator.md
│   │   ├── test-coverage.md
│   │   └── import-enforcer.md
│   │
│   ├── javascript/             # JavaScript-specific (future)
│   │
│   └── typescript/             # TypeScript-specific (future)
│
├── rules/
│   ├── enforcement-guide.md    # Existing
│   ├── typing-standards.md     # Python 3.12 typing
│   ├── test-standards.md       # Test coverage
│   ├── security-standards.md   # Security & secrets
│   └── commit-standards.md     # Conventional commits
│
├── commands/
│   └── enforce.md              # Pipeline executor
│
├── .sage/
│   ├── config.json             # Language & enforcement level
│   ├── enforcement.json.template  # Agent configuration
│   └── README.md               # UPDATED - Config + language info
│
├── sage-setup.sh               # RENAMED & UPDATED - Multi-language setup
└── README.md                   # UPDATED - Language selection guide
```

## Usage

### 1. Run Setup with Language Selection

```bash
# Interactive setup (recommended)
./sage-setup.sh

# Or specify agent and language
./sage-setup.sh claude-code python
./sage-setup.sh cline typescript
./sage-setup.sh all javascript
```

The wizard will:

1. Detect your AI coding agent
2. Prompt for language selection (Python/JavaScript/TypeScript)
3. Install commands, shared agents, and language-specific agents
4. Create `.sage/config.json` with your preferences

Installs to (example for Claude Code + Python):

- `~/.claude/commands/` - Commands (13 files)
- `~/.claude/agents/` - Agents (3 shared + 4 Python-specific + registry)
- `~/.claude/rules/` - Rules (5 files)

### 2. Configure Enforcement

```bash
# Copy template
cp .sage/enforcement.json.template .sage/enforcement.json

# Edit configuration
# Set level: STRICT, BALANCED, or PROTOTYPE
# Enable/disable agents
# Configure auto-fix
```

### 3. Run Enforcement

```bash
# Run default pipeline
/enforce

# Run specific pipeline
/enforce --pipeline=pre-commit

# Strict mode with auto-fix
/enforce --strict --auto-fix

# Dry run (preview only)
/enforce --dry-run
```

### 4. Enable Git Hooks

```bash
# Pre-commit hook
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/bash
/enforce --pipeline=pre-commit
exit $?
EOF
chmod +x .git/hooks/pre-commit
```

## Enforcement Levels

### STRICT

- All agents enabled
- Auto-fix enabled
- Fail-fast: true
- Blocks on any violation
- Best for: Production code

### BALANCED (Default)

- Core agents enabled
- Auto-fix enabled
- Fail-fast: false
- Blocks on critical violations only
- Best for: Standard development

### PROTOTYPE

- Security agents only
- Auto-fix disabled
- Fail-fast: false
- Logs violations, no blocking
- Best for: Rapid prototyping

## Agent Pipelines

**Note:** Pipelines are language-specific. Example shown for Python.

### Python Pipelines

#### pre-write

Runs before code is written:

- bs-check (shared)

#### post-write

Runs after code is written:

- type-enforcer (Python)
- import-enforcer (Python)
- bs-enforce (shared)

#### pre-commit

Runs before git commit:

- secret-scanner (shared)
- test-coverage (Python)

#### full-validation

Complete suite (all enabled agents):

- bs-check (shared)
- type-enforcer (Python)
- import-enforcer (Python)
- bs-enforce (shared)
- secret-scanner (shared)

### JavaScript/TypeScript Pipelines

Currently use shared agents only:

- **pre-write:** bs-check
- **post-write:** bs-enforce
- **pre-commit:** secret-scanner

Language-specific agents coming soon.

## Key Features

1. **Multi-Language Support** - Python, JavaScript, TypeScript (more coming)
2. **Language-Specific Agents** - Tailored enforcement per language
3. **Shared Agents** - Universal quality checks (bs-check, secret-scanner)
4. **Automated Quality Enforcement** - Agents run automatically
5. **Configurable Strictness** - STRICT/BALANCED/PROTOTYPE levels
6. **Auto-Fix Capabilities** - Automatic correction of violations
7. **Git Hook Integration** - Pre-commit/pre-push enforcement
8. **Comprehensive Reporting** - Detailed violation reports
9. **Rule Documentation** - Standards clearly documented
10. **Agent Registry** - Centralized agent management with language metadata
11. **Pipeline Orchestration** - Language-aware sequential execution
12. **Interactive Setup** - Language selection wizard

## Integration with Existing Workflow

The agent system integrates seamlessly with existing sage-dev commands:

```bash
# Traditional workflow
/specify → /plan → /tasks → /enforce → /commit

# Ticket-based workflow
/migrate → /estimate → /stream → /enforce → /sync → /commit

# Manual enforcement
/enforce --pipeline=full-validation
```

## Benefits

1. **Language Flexibility** - Support for multiple programming languages
2. **Intelligent Agent Selection** - Only relevant agents run for your language
3. **Consistency** - Automated enforcement across codebase
4. **Quality** - Prevents bad patterns from entering code
5. **Security** - Universal secret scanning across all languages
6. **Type Safety** - Language-specific type checking (Python 3.12, TypeScript)
7. **Documentation** - Ensures code is documented (Python docstrings)
8. **Test Coverage** - Maintains coverage thresholds per language
9. **Standards** - Enforces language-specific and universal conventions
10. **Automation** - Reduces manual review burden
11. **Extensibility** - Easy to add new languages and agents
12. **Configuration** - Language preference persisted across sessions

## Next Steps

1. **Run setup wizard**:

   ```bash
   ./sage-setup.sh
   ```

   - Select your AI coding agent
   - Choose your programming language
   - Installation happens automatically

2. **Verify installation**:

   ```bash
   # Check language config
   cat .sage/config.json

   # List installed agents
   ls ~/.claude/agents/
   ```

3. **Configure enforcement** (optional):

   ```bash
   cp .sage/enforcement.json.template .sage/enforcement.json
   # Edit enforcement level, enable/disable agents, set thresholds
   ```

4. **Test enforcement**:

   ```bash
   /enforce --dry-run
   ```

5. **Enable git hooks** (recommended):

   ```bash
   # Add pre-commit hook for automatic enforcement
   cat > .git/hooks/pre-commit <<'EOF'
   #!/bin/bash
   /enforce --pipeline=pre-commit
   exit $?
   EOF
   chmod +x .git/hooks/pre-commit
   ```

6. **Customize for your project**:
   - Change language: `./sage-setup.sh [agent] [language]`
   - Enable/disable agents in `.sage/enforcement.json`
   - Adjust thresholds
   - Add exemptions
   - Configure pipelines

7. **Explore language-specific features**:
   - Python: Check typing with `/enforce --pipeline=post-write`
   - All: Scan secrets with `secret-scanner`
   - See [agents/LANGUAGES.md](agents/LANGUAGES.md) for details

## Files Changed

**Version 2.0.0 (Multi-Language Support):**

- **Created**: 15 new files
  - `agents/LANGUAGES.md` - Language support guide
  - `agents/shared/bs-check.md` - Moved from agents/
  - `agents/shared/bs-enforce.md` - Moved from agents/
  - `agents/shared/secret-scanner.md` - New
  - `agents/python/type-enforcer.md` - Moved from agents/
  - `agents/python/doc-validator.md` - Moved from agents/
  - `agents/python/test-coverage.md` - Moved from agents/
  - `agents/python/import-enforcer.md` - Moved from agents/
  - `rules/typing-standards.md`
  - `rules/test-standards.md`
  - `rules/security-standards.md`
  - `rules/commit-standards.md`
  - `commands/enforce.md`
  - `.sage/enforcement.json.template`
  - `.sage/config.json` (template, generated on setup)

- **Updated**: 4 files
  - `agents/index.json` - v2.1.0 with language metadata
  - `sage-setup.sh` - Renamed from install-sage-commands.sh, language wizard added
  - `.sage/README.md` - Language configuration documented
  - `README.md` - Multi-language setup guide

- **Restructured**: Agent directory organization
  - Old: `agents/*.md` (flat)
  - New: `agents/shared/`, `agents/python/`, `agents/javascript/`, `agents/typescript/`

- **Total**: 19 files created/modified/moved

## Documentation

- **Language Support**: `agents/LANGUAGES.md` - Multi-language guide
- **Agent Specs**:
  - Shared: `agents/shared/*.md`
  - Python: `agents/python/*.md`
  - JavaScript: `agents/javascript/*.md` (future)
  - TypeScript: `agents/typescript/*.md` (future)
- **Rules**: `rules/*.md` - Development standards
- **Command**: `commands/enforce.md` - Pipeline executor
- **Configuration**: `.sage/README.md` - Setup and config guide
- **Setup Guide**: `README.md` - Installation and language selection
- **This Document**: `AGENTS_AND_RULES.md` - Enhancement summary

## Version History

### v2.1.0 (2025-10-06) - Improved Organization

- Moved ticket system to `.sage/tickets/` for better organization
- All tickets now stored in `.sage/tickets/index.json` and `.sage/tickets/*.md`
- Updated all commands to reference new ticket location
- Improved separation between project code and tooling state

### v2.0.0 (2025-10-04) - Multi-Language Support

- Added support for Python, JavaScript, TypeScript
- Restructured agents into language-specific directories
- Created shared agent category for language-agnostic checks
- Added interactive language selection wizard
- Implemented language-aware execution pipelines
- Created `.sage/config.json` for language persistence
- Added `agents/LANGUAGES.md` documentation
- Renamed setup script to `sage-setup.sh`
- Updated all documentation for multi-language architecture

### v1.0.0 (Initial Release)

- Agent registry system (`agents/index.json`)
- 5 new enforcement agents (Python-focused)
- 4 new rule sets
- Pipeline orchestrator command (`/enforce`)
- Enforcement configuration system
- Git hooks integration
- Auto-fix capabilities
- STRICT/BALANCED/PROTOTYPE modes

## Summary

Sage-Dev v2.1.0 brings **improved organization** with ticket system relocation to `.sage/tickets/` alongside existing multi-language support. The system intelligently selects and runs the appropriate agents based on your chosen programming language, while maintaining universal security and quality checks through shared agents.

**Key Improvements:**

- 🌐 Multi-language architecture (Python, JavaScript, TypeScript)
- 🎯 Language-specific agent selection
- 🔄 Interactive setup wizard with language selection
- 📋 Language preference persistence
- 🛠️ Per-language execution pipelines
- 📚 Comprehensive language support documentation

**For Python Developers:**

- Full type safety with Python 3.12 modern typing
- Docstring validation
- Test coverage enforcement (80%+ overall, 90%+ new code)
- Import ordering and circular dependency detection
- Plus all shared agents (bs-check, bs-enforce, secret-scanner)

**For JavaScript/TypeScript Developers:**

- Shared quality agents (bs-check, bs-enforce)
- Secret scanning
- Framework ready for language-specific agents

**Getting Started:**

```bash
./sage-setup.sh
# Follow the wizard to select your language and AI agent
# Start developing with /enforce for automated quality checks
```

**Next Steps:**

- Add more language-specific agents for JavaScript/TypeScript
- Implement Go, Rust, Ruby language support
- Expand shared agent library
- Enhance auto-fix capabilities

**Documentation:**

- [agents/LANGUAGES.md](agents/LANGUAGES.md) - Language support guide
- [README.md](README.md) - Installation and setup
- [.sage/README.md](.sage/README.md) - Configuration reference

---

**Build with wisdom. Enforce with intelligence. Develop with Sage-Dev.** 🚀
