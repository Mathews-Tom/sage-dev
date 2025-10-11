# Sage-DEV

![Sage-DEV Cover Image](assets/sage_dev_cover_image.png)

**Version 2.2** - Wisdom-guided software development with language-specific enforcement

Development workflows enriched with collective wisdom. Claude commands that incorporate best practices from thousands of projects, research-backed recommendations, and battle-tested patterns. Build on the shoulders of giants.

## Features

- 🌐 **Multi-Language Support** - Python, JavaScript, TypeScript (more coming soon)
- 🤖 **Intelligent Agents** - Automated code quality enforcement
- 📋 **Development Rules** - Typing, testing, security, and commit standards
- ⚡ **Slash Commands** - Streamlined workflows for rapid development
- 🔒 **Security-First** - Built-in secret scanning and validation
- 🎯 **Configurable Enforcement** - STRICT, BALANCED, or PROTOTYPE modes

## What's New in v2.2

- 🏷️ **Sage Branding** - All commands now use `sage.*` prefix for clear namespace isolation
- 📚 **Context Engineering** - Agent-optimized documentation system in `.sage/agent/` directory
- 🤖 **Documentation Commands** - `/sage.update-doc`, `/sage.gen-sop`, `/sage.docify` for knowledge management
- ⚡ **Semi-Auto Mode** - Component-level automation for `/sage.stream` (3-5× faster execution)
- 🔄 **Resume Support** - Pause and resume ticket processing with automatic state management
- 📖 **Agent Templates** - Reusable documentation templates for tasks, SOPs, and system docs

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Mathews-Tom/sage-dev.git
cd sage-dev
```

### 2. Run Setup

```bash
./sage-setup.sh
```

The setup wizard will:

1. Detect your AI coding agent (Claude Code, Opencode, DROID, etc.)
2. Let you choose your programming language
3. Install commands, agents, and rules
4. Configure enforcement settings

### 3. Select Language

Choose your primary programming language:

```text
🌐 Select your programming language:

   1) Python (default) - Type safety, test coverage, docstring validation
   2) JavaScript       - Code quality, secret scanning
   3) TypeScript       - Type safety, code quality, secret scanning

Enter choice [1-3] (default: 1):
```

Your selection is saved to `.sage/config.json` and determines which enforcement agents are installed.

### 4. Start Developing

Open your AI coding agent and type `/sage.` to see available commands:

```bash
/sage.workflow     # Choose your development workflow
/sage.specify      # Generate specifications from docs
/sage.plan         # Create implementation plans
/sage.tasks        # Break down into SMART tasks
/sage.enforce      # Run enforcement pipeline
/sage.stream       # Automated ticket execution (interactive/semi-auto/auto/parallel)
```

## Supported Languages

### Python (Fully Supported)

**Version:** 3.12+
**Agents:** type-enforcer, doc-validator, test-coverage, import-enforcer + shared
**Tools:** mypy, ruff, pytest

- ✅ Python 3.12 typing validation (built-in generics, | unions)
- ✅ Docstring completeness checking
- ✅ Test coverage enforcement (80%+ overall, 90%+ new code)
- ✅ Import ordering and circular dependency detection
- ✅ Secret scanning
- ✅ No-bullshit code patterns

### JavaScript (Framework Ready)

**Version:** ES2022+
**Agents:** Shared agents only (bs-check, bs-enforce, secret-scanner)
**Tools:** eslint, prettier, jest

- ✅ Secret scanning
- ✅ No-bullshit code patterns
- 🔄 Language-specific agents coming soon

### TypeScript (Framework Ready)

**Version:** 5.0+
**Agents:** Shared agents only (bs-check, bs-enforce, secret-scanner)
**Tools:** eslint, tsc, jest

- ✅ Secret scanning
- ✅ No-bullshit code patterns
- 🔄 Language-specific agents coming soon

See [agents/LANGUAGES.md](agents/LANGUAGES.md) for detailed language support information.

## Installation Options

### Interactive Setup (Recommended)

```bash
./sage-setup.sh
```

Auto-detects your AI agent and prompts for language selection.

### Specify Agent and Language

```bash
# Install for Claude Code with Python
./sage-setup.sh claude-code python

# Install for Opencode with TypeScript
./sage-setup.sh opencode typescript

# Install for all detected agents
./sage-setup.sh all python
```

### Change Language Later

```bash
# Method 1: Re-run setup with different language
./sage-setup.sh claude-code typescript

# Method 2: Delete config and re-run wizard
rm .sage/config.json
./sage-setup.sh
```

## Supported AI Coding Agents

- **Claude Code** → `~/.claude/`
- **Opencode** → `~/.config/opencode/`
- **DROID** → `~/.factory/`

## What Gets Installed

### Commands (35 slash commands)

**Workflow & Planning:**
- `/sage.workflow` - Choose Traditional vs Ticket-Based workflow
- `/sage.specify` - Generate specifications from docs
- `/sage.plan` - Create implementation plans
- `/sage.tasks` - Break down into SMART tasks
- `/sage.breakdown` - Generate technical breakdowns

**Execution & Automation:**
- `/sage.implement` - Execute phased implementation
- `/sage.stream` - Automated ticket execution (interactive/semi-auto/auto/parallel)
- `/sage.enforce` - Run agent enforcement pipeline
- `/sage.commit` - Create semantic commits and PRs

**Documentation & Knowledge Management:**
- `/sage.update-doc` - Create or update agent documentation
- `/sage.gen-sop` - Generate Standard Operating Procedures
- `/sage.save-plan` - Save implementation plans from conversation
- `/sage.docify` - Generate component documentation from code
- `/sage.update-index` - Regenerate documentation index
- `/sage.compact-context` - Compress conversation state (30%+ token reduction)
- `/sage.offload-research` - Delegate research to sub-agents

**Ticket System:**
- `/sage.validate` - Validate ticket system integrity
- `/sage.sync` - Synchronize tickets with GitHub
- `/sage.migrate` - Convert existing documentation to tickets
- `/sage.estimate` - Add time estimates to tickets
- `/sage.repair` - Repair ticket system issues

**Analysis & Intelligence:**
- `/sage.progress` - Analyze project progress
- `/sage.enhance` - Research-driven enhancement analysis
- `/sage.intel` - Strategic intelligence gathering
- `/sage.quality` - Validate quality of command outputs
- `/sage.blueprint` - Generate unified system blueprint

**Utilities:**
- `/sage.rollback` - Rollback last operation
- `/sage.poc` - Generate minimal POC documentation

See [SAGE.COMMANDS.md](commands/SAGE.COMMANDS.md) for complete command reference.

### Agents (Language-Specific)

#### Shared Agents (All Languages)

- **sage.bs-check** - Remove bullshit code patterns
- **sage.bs-enforce** - Enforce no-bullshit principles
- **sage.secret-scanner** - Detect hardcoded secrets

#### Python Agents

- **sage.type-enforcer** - Python 3.12 typing validation
- **sage.doc-validator** - Docstring completeness
- **sage.test-coverage** - Coverage enforcement (80%+)
- **sage.import-enforcer** - Import ordering, circular dependency detection

#### JavaScript/TypeScript Agents

- Framework ready for future implementation

See [AGENTS_AND_RULES.md](AGENTS_AND_RULES.md) for complete agent documentation.

### Rules (Development Standards)

- **typing-standards.md** - Python 3.12 typing requirements
- **test-standards.md** - Test coverage and quality
- **security-standards.md** - Secret management, input validation
- **commit-standards.md** - Conventional commits format
- **enforcement-guide.md** - Quality enforcement principles

## Configuration

### Language Configuration

Stored in `.sage/config.json`:

```json
{
  "language": "python",
  "enforcement_level": "BALANCED",
  "configured_at": "2025-01-15T10:30:00Z"
}
```

### Enforcement Levels

**STRICT:**

- All agents enabled
- Zero tolerance for violations
- Auto-fix enabled
- Best for: Production code

**BALANCED (Default):**

- Core agents enabled
- Warnings for non-critical issues
- Auto-fix enabled
- Best for: Most projects

**PROTOTYPE:**

- Security agents only
- Violations logged, not blocked
- Auto-fix disabled
- Best for: Rapid prototyping

See [.sage/README.md](.sage/README.md) for configuration details.

## Usage Examples

### Run Enforcement Pipeline

```bash
# Run default enforcement
/sage.enforce

# Run specific pipeline
/sage.enforce --pipeline=pre-commit

# Strict mode with auto-fix
/sage.enforce --strict --auto-fix

# Dry run (preview only)
/sage.enforce --dry-run
```

### Automated Ticket Execution

```bash
# Interactive mode (confirm each ticket)
/sage.stream --interactive

# Semi-auto mode (confirm per component, 3-5× faster)
/sage.stream --semi-auto

# Full auto mode (no confirmations)
/sage.stream --auto

# Parallel execution (2-3× faster)
/sage.stream --auto --parallel=3
```

### Generate Specifications

```bash
# Generate specs from docs/
/sage.specify

# For specific component
/sage.specify auth-service
```

### Create Implementation Plan

```bash
# Generate research-backed plan
/sage.plan

# For specific spec
/sage.plan auth-service
```

### Break Down Tasks

```bash
# Generate SMART tasks
/sage.tasks

# For specific phase
/sage.tasks phase-1
```

### Documentation Management

```bash
# Create/update documentation
/sage.update-doc task "Feature Implementation"

# Generate SOP from conversation
/sage.gen-sop "Adding New Command" --from-context

# Save implementation plan
/sage.save-plan "Authentication System"

# Generate component docs from code
/sage.docify src/auth/

# Compress conversation context
/sage.compact-context
```

### Commit Changes

```bash
# Create semantic commit
/sage.commit

# Create commit and PR
/sage.commit --pr
```

## Project Structure

```text
sage-dev/
├── commands/                    # Slash commands (sage.* prefix)
│   ├── sage.workflow.md
│   ├── sage.specify.md
│   ├── sage.plan.md
│   ├── sage.tasks.md
│   ├── sage.implement.md
│   ├── sage.stream.md
│   ├── sage.enforce.md
│   ├── sage.commit.md
│   ├── sage.update-doc.md       # Documentation management
│   ├── sage.gen-sop.md          # SOP generation
│   ├── sage.docify.md           # Code documentation
│   ├── sage.compact-context.md  # Context compression
│   ├── SAGE.COMMANDS.md         # Command reference (uppercase)
│   ├── SAGE.WORKFLOW.md         # Workflow guide
│   └── ...
│
├── agents/                      # Enforcement agents (sage.* prefix)
│   ├── index.json              # Agent registry
│   ├── LANGUAGES.md            # Language support guide
│   │
│   ├── shared/                 # Language-agnostic
│   │   ├── bs-check.md         # name: sage.bs-check
│   │   ├── bs-enforce.md       # name: sage.bs-enforce
│   │   └── secret-scanner.md   # name: sage.secret-scanner
│   │
│   ├── python/                 # Python-specific
│   │   ├── type-enforcer.md    # name: sage.type-enforcer
│   │   ├── doc-validator.md    # name: sage.doc-validator
│   │   ├── test-coverage.md    # name: sage.test-coverage
│   │   └── import-enforcer.md  # name: sage.import-enforcer
│   │
│   ├── javascript/             # JavaScript-specific
│   └── typescript/             # TypeScript-specific
│
├── rules/                      # Development standards
│   ├── typing-standards.md
│   ├── test-standards.md
│   ├── security-standards.md
│   ├── commit-standards.md
│   └── enforcement-guide.md
│
├── .sage/                      # Configuration & tooling state
│   ├── config.json             # Language & enforcement config
│   ├── enforcement.json        # Agent configuration
│   │
│   ├── tickets/                # Ticket system (v2.1+)
│   │   ├── index.json          # Ticket registry
│   │   └── *.md                # Individual ticket files
│   │
│   ├── agent/                  # Agent documentation system (v2.2+)
│   │   ├── README.md           # Documentation index
│   │   ├── tasks/              # Feature plans & PRDs
│   │   ├── system/             # Architecture & specs
│   │   ├── sops/               # Standard Operating Procedures
│   │   ├── templates/          # Documentation templates
│   │   │   ├── task-template.md
│   │   │   ├── sop-template.md
│   │   │   ├── system-template.md
│   │   │   └── examples/       # Template examples
│   │   └── research/           # Offloaded research results
│   │
│   └── README.md               # Config documentation
│
├── assets/                     # Project assets
│   └── sage_dev_cover_image.png
│
├── sage-setup.sh               # Installation script
├── AGENTS_AND_RULES.md         # Agent documentation
└── README.md                   # This file
```

## Documentation

- **[SAGE.WORKFLOW.md](commands/sage.workflow.md)** - Complete workflow guide
- **[SAGE.COMMANDS.md](commands/SAGE.COMMANDS.md)** - Command reference (35 commands)
- **[AGENTS_AND_RULES.md](AGENTS_AND_RULES.md)** - Agent and rule documentation
- **[agents/LANGUAGES.md](agents/LANGUAGES.md)** - Multi-language support guide
- **[.sage/README.md](.sage/README.md)** - Configuration guide
- **[.sage/agent/README.md](.sage/agent/README.md)** - Agent documentation system

## Development Workflows

### Traditional Workflow

Specification → Plan → Tasks → Implementation → Validation

### Ticket-Based Workflow

Strategic Intelligence → Breakdown → Roadmap → Ticket System → Phased Implementation

See [sage.workflow.md](commands/sage.workflow.md) for detailed workflow documentation.

## Contributing

### Adding a New Language

1. Create directory: `agents/[language]/`
2. Add agents following template format
3. Update `agents/index.json` with language metadata
4. Create `rules/[language]-standards.md`
5. Update `sage-setup.sh` wizard
6. Test installation: `./sage-setup.sh claude-code [language]`

See [agents/LANGUAGES.md](agents/LANGUAGES.md) for detailed contribution guide.

### Creating Custom Agents

1. Create agent file: `agents/[language]/custom-agent.md`
2. Follow frontmatter format with `sage.*` prefix:

   ```markdown
   ---
   name: sage.custom-agent
   description: Agent description
   model: sonnet
   color: purple
   ---

   Algorithm:
     # Implementation
   ```

3. Add to `agents/index.json` registry
4. Test with `/sage.enforce`

## FAQ

**Q: Which AI agents are supported?**

A: Claude Code, Opencode, DROID. The setup script auto-detects installed agents.

**Q: Can I use multiple languages in one project?**

A: Currently one language per project. Multi-language support planned for future release.

**Q: How do I disable specific agents?**

A: Edit `.sage/enforcement.json` and set `"enabled": false` for the agent.

**Q: What's the difference between commands and agents?**

A: Commands are user-invoked workflows (e.g., `/sage.specify`). Agents are automated enforcement checks (e.g., `sage.type-enforcer`).

**Q: How do I update Sage-Dev?**

A: `cd sage-dev && git pull && ./sage-setup.sh [agent] [language]`

**Q: Can I customize enforcement rules?**

A: Yes! Edit files in `rules/` and `.sage/enforcement.json` to customize standards and thresholds.

## Support

- **Issues:** [GitHub Issues](https://github.com/Mathews-Tom/sage-dev/issues)
- **Documentation:** See `commands/`, `agents/`, and `rules/` directories
- **Ask your AI agent:** "How do I use /sage.workflow?" or "Explain the ticket system"

## Acknowledgments

**Special Thanks:**

- **[Sydney Lewis](https://www.linkedin.com/in/sydches/)** - For the motivation, guidance, and wisdom that inspired this project

Sage-Dev represents a distillation of collective software development experience from great developers across the industry. This tool embodies research-backed practices, battle-tested patterns, and community wisdom.

## License

[Your License Here]

---

**Build with wisdom. Enforce with intelligence. Develop with Sage-Dev.** 🚀
