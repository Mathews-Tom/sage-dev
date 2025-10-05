# Sage-DEV

**Wisdom-guided software development with language-specific enforcement**

Development workflows enriched with collective wisdom. Claude commands that incorporate best practices from thousands of projects, research-backed recommendations, and battle-tested patterns. Build on the shoulders of giants.

## Features

- 🌐 **Multi-Language Support** - Python, JavaScript, TypeScript (more coming soon)
- 🤖 **Intelligent Agents** - Automated code quality enforcement
- 📋 **Development Rules** - Typing, testing, security, and commit standards
- ⚡ **Slash Commands** - Streamlined workflows for rapid development
- 🔒 **Security-First** - Built-in secret scanning and validation
- 🎯 **Configurable Enforcement** - STRICT, BALANCED, or PROTOTYPE modes

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/sage-dev.git
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

```
🌐 Select your programming language:

   1) Python (default) - Type safety, test coverage, docstring validation
   2) JavaScript       - Code quality, secret scanning
   3) TypeScript       - Type safety, code quality, secret scanning

Enter choice [1-3] (default: 1):
```

Your selection is saved to `.sage/config.json` and determines which enforcement agents are installed.

### 4. Start Developing

Open your AI coding agent and type `/` to see available commands:

```bash
/workflow          # Choose your development workflow
/specify           # Generate specifications from docs
/plan              # Create implementation plans
/tasks             # Break down into SMART tasks
/enforce           # Run enforcement pipeline
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

### Commands (13 slash commands)

Development workflow automation:

- `/workflow` - Choose Traditional vs Ticket-Based workflow
- `/specify` - Generate specifications from docs
- `/plan` - Create implementation plans
- `/tasks` - Break down into SMART tasks
- `/implement` - Execute phased implementation
- `/enforce` - Run agent enforcement pipeline
- `/commit` - Create semantic commits and PRs
- And more...

See [SAGE_DEV_COMMANDS.md](commands/SAGE_DEV_COMMANDS.md) for complete command reference.

### Agents (Language-Specific)

#### Shared Agents (All Languages)

- **bs-check** - Remove bullshit code patterns
- **bs-enforce** - Enforce no-bullshit principles
- **secret-scanner** - Detect hardcoded secrets

#### Python Agents

- **type-enforcer** - Python 3.12 typing validation
- **doc-validator** - Docstring completeness
- **test-coverage** - Coverage enforcement (80%+)
- **import-enforcer** - Import ordering, circular dependency detection

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
/enforce

# Run specific pipeline
/enforce --pipeline=pre-commit

# Strict mode with auto-fix
/enforce --strict --auto-fix

# Dry run (preview only)
/enforce --dry-run
```

### Generate Specifications

```bash
# Generate specs from docs/
/specify

# For specific component
/specify auth-service
```

### Create Implementation Plan

```bash
# Generate research-backed plan
/plan

# For specific spec
/plan auth-service
```

### Break Down Tasks

```bash
# Generate SMART tasks
/tasks

# For specific phase
/tasks phase-1
```

### Commit Changes

```bash
# Create semantic commit
/commit

# Create commit and PR
/commit --pr
```

## Project Structure

```
sage-dev/
├── commands/              # Slash commands
│   ├── workflow.md
│   ├── specify.md
│   ├── plan.md
│   ├── tasks.md
│   ├── implement.md
│   ├── enforce.md
│   └── ...
│
├── agents/               # Enforcement agents
│   ├── index.json       # Agent registry
│   ├── LANGUAGES.md     # Language support guide
│   │
│   ├── shared/          # Language-agnostic
│   │   ├── bs-check.md
│   │   ├── bs-enforce.md
│   │   └── secret-scanner.md
│   │
│   ├── python/          # Python-specific
│   │   ├── type-enforcer.md
│   │   ├── doc-validator.md
│   │   ├── test-coverage.md
│   │   └── import-enforcer.md
│   │
│   ├── javascript/      # JavaScript-specific
│   └── typescript/      # TypeScript-specific
│
├── rules/               # Development standards
│   ├── typing-standards.md
│   ├── test-standards.md
│   ├── security-standards.md
│   ├── commit-standards.md
│   └── enforcement-guide.md
│
├── .sage/               # Configuration
│   ├── config.json      # Language & enforcement config
│   ├── enforcement.json # Agent configuration
│   └── README.md        # Config documentation
│
├── sage-setup.sh        # Installation script
├── AGENTS_AND_RULES.md  # Agent documentation
└── README.md            # This file
```

## Documentation

- **[SAGE_DEV_WORKFLOW.md](commands/SAGE_DEV_WORKFLOW.md)** - Complete workflow guide
- **[SAGE_DEV_COMMANDS.md](commands/SAGE_DEV_COMMANDS.md)** - Command reference
- **[AGENTS_AND_RULES.md](AGENTS_AND_RULES.md)** - Agent and rule documentation
- **[agents/LANGUAGES.md](agents/LANGUAGES.md)** - Multi-language support guide
- **[.sage/README.md](.sage/README.md)** - Configuration guide

## Development Workflows

### Traditional Workflow

Specification → Plan → Tasks → Implementation → Validation

### Ticket-Based Workflow

Strategic Intelligence → Breakdown → Roadmap → Ticket System → Phased Implementation

See [SAGE_DEV_WORKFLOW.md](commands/SAGE_DEV_WORKFLOW.md) for detailed workflow documentation.

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
2. Follow frontmatter format:
   ```markdown
   ---
   name: custom-agent
   description: Agent description
   model: sonnet
   color: purple
   ---

   Algorithm:
     # Implementation
   ```
3. Add to `agents/index.json` registry
4. Test with `/enforce`

## FAQ

**Q: Which AI agents are supported?**

A: Claude Code, Opencode, DROID. The setup script auto-detects installed agents.

**Q: Can I use multiple languages in one project?**

A: Currently one language per project. Multi-language support planned for future release.

**Q: How do I disable specific agents?**

A: Edit `.sage/enforcement.json` and set `"enabled": false` for the agent.

**Q: What's the difference between commands and agents?**

A: Commands are user-invoked workflows (e.g., `/specify`). Agents are automated enforcement checks (e.g., `type-enforcer`).

**Q: How do I update Sage-Dev?**

A: `cd sage-dev && git pull && ./sage-setup.sh [agent] [language]`

**Q: Can I customize enforcement rules?**

A: Yes! Edit files in `rules/` and `.sage/enforcement.json` to customize standards and thresholds.

## Support

- **Issues:** [GitHub Issues](https://github.com/your-org/sage-dev/issues)
- **Documentation:** See `commands/`, `agents/`, and `rules/` directories
- **Ask your AI agent:** "How do I use /workflow?" or "Explain the ticket system"

## License

[Your License Here]

---

**Build with wisdom. Develop with Sage-Dev.** 🚀
