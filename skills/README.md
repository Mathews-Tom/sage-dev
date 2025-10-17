# Sage-Dev Skills

**Version:** 1.0.0
**Total Skills:** 8
**Total Size:** ~160 KB

Portable expertise packages that bring Sage-Dev capabilities to all LLM platforms - Claude, ChatGPT, Gemini, and more.

---

## Quick Start

### For Claude (claude.ai, Claude Desktop, Claude Code)
1. Open Claude Settings → Capabilities → Skills
2. Upload desired `.zip` files from this folder
3. Enable each Skill via toggle
4. Skills auto-activate based on conversation context

### For ChatGPT / Gemini / Other LLMs
1. Start a new conversation
2. Upload desired `.zip` files
3. Mention the Skill name in your prompt
4. LLM extracts and applies guidance

**📖 Complete Installation Guide:** [../docs/SKILLS_GUIDE.md](../docs/SKILLS_GUIDE.md)

---

## Available Skills

### 🛡️ Enforcement Skills

#### sage-python-quality-suite.zip (16 KB)
**Apply Python 3.12+ typing, docstrings, test coverage, and import standards to code**

**Use when:**
- Writing Python code
- Refactoring Python projects
- Need type safety enforcement
- Require test coverage validation

**Triggers:** `python`, `*.py`, `typing`, `pytest`, `mypy`

**Contains:**
- Python 3.12+ type enforcement (built-in generics, | unions)
- Docstring validation (Google-style)
- Test coverage requirements (80%+ overall, 90%+ new code)
- Import ordering and circular dependency detection

---

#### sage-security-guard.zip (13 KB)
**Detect secrets, enforce security standards, and eliminate bullshit code patterns**

**Use when:**
- Need secret scanning
- Reviewing code for security issues
- Eliminating fallback patterns
- Enforcing fail-fast principles

**Triggers:** `security`, `secrets`, `api keys`, `credentials`

**Contains:**
- Hardcoded secret detection (API keys, passwords, tokens)
- No-bullshit code pattern enforcement
- Security standards validation
- Error handling best practices

---

### 🎓 Domain Expert Skills

#### sage-research-intelligence.zip (13 KB)
**Gather strategic intelligence and analyze market trends for research-driven development**

**Use when:**
- Researching best practices
- Competitive analysis
- Technology evaluation
- Strategic planning

**Triggers:** `research`, `intelligence`, `market analysis`, `best practices`

**Contains:**
- Strategic intelligence gathering workflows
- Market and competitive analysis
- Technology recommendation frameworks
- Best practices research methodologies

---

#### sage-specification-engine.zip (69 KB)
**Generate specifications, technical breakdowns, and system blueprints from requirements**

**Use when:**
- Writing technical specifications
- Creating architecture documents
- Defining system requirements
- Planning technical implementations

**Triggers:** `specification`, `spec`, `requirements`, `architecture`

**Contains:**
- Requirements analysis workflows
- Technical breakdown generation
- System architecture blueprints
- Specification templates and examples

---

#### sage-implementation-planner.zip (8 KB)
**Create PRP-format implementation plans and SMART task breakdowns from specifications**

**Use when:**
- Planning feature implementation
- Breaking down complex tasks
- Creating sprint plans
- Defining execution phases

**Triggers:** `plan`, `planning`, `implementation`, `tasks`

**Contains:**
- PRP-format (Product Requirements Prompt) planning
- SMART task breakdown methodologies
- Phased execution strategies
- Implementation planning templates

---

#### sage-documentation-generator.zip (14 KB)
**Create and update documentation, SOPs, docstrings, and implementation plans**

**Use when:**
- Writing documentation
- Creating Standard Operating Procedures
- Adding code documentation
- Capturing implementation decisions

**Triggers:** `documentation`, `SOP`, `docstring`, `inline docs`

**Contains:**
- Documentation creation workflows
- SOP generation templates
- Code documentation standards (docstrings)
- Implementation plan capture

---

#### sage-context-optimizer.zip (5 KB)
**Compress conversation context and delegate research to sub-agents for token efficiency**

**Use when:**
- Long conversations consuming tokens
- Need context compression
- Want to offload research tasks
- Optimizing token usage

**Triggers:** `context`, `compression`, `token optimization`

**Contains:**
- Context compression techniques (30%+ token reduction)
- Research delegation workflows
- Token optimization strategies

---

### 🔧 Utility Skills

#### sage-ticket-manager.zip (23 KB)
**Validate, sync, migrate, estimate, and repair ticket system integrity**

**Use when:**
- Managing ticket systems
- Syncing with GitHub
- Migrating documentation to tickets
- Estimating work and tracking velocity

**Triggers:** `ticket`, `tickets`, `validation`, `sync`

**Contains:**
- Ticket system validation
- GitHub synchronization workflows
- Documentation-to-ticket migration
- Time estimation and velocity tracking

---

## Skill Format

All Skills follow the official Claude Skills format:

```
sage-python-quality-suite.zip
└── sage-python-quality-suite/
    ├── Skill.md          (YAML frontmatter + markdown body)
    └── resources/        (bundled rules, templates, examples)
```

**Skill.md structure:**
```yaml
---
name: Sage Python Quality Suite
description: Apply Python 3.12+ typing, docstrings, test coverage, and import standards to code
version: 1.0.0
---

# Sage Python Quality Suite

[... instructions for Claude ...]
```

---

## Recommended Combinations

### Python Development
- `sage-python-quality-suite.zip` (typing + tests + docs)
- `sage-security-guard.zip` (secrets + security)

### Feature Planning
- `sage-research-intelligence.zip` (research best practices)
- `sage-specification-engine.zip` (create spec)
- `sage-implementation-planner.zip` (execution plan)

### Code Review
- `sage-python-quality-suite.zip` (or language-specific)
- `sage-security-guard.zip` (security validation)
- `sage-documentation-generator.zip` (doc updates)

### Documentation Tasks
- `sage-documentation-generator.zip` (create docs/SOPs)

---

## Platform-Specific Notes

### Claude
- ✅ Skills persist across conversations
- ✅ Auto-discovery works seamlessly
- ✅ Multiple Skills compose automatically
- Upload once in Settings → Capabilities

### ChatGPT
- ⚠️ Skills must be re-uploaded per conversation
- ⚠️ May need to explicitly reference Skill names
- 💡 Tip: Upload 2-3 task-specific Skills per chat

### Gemini
- ⚠️ Skills must be re-uploaded per conversation
- ⚠️ Auto-discovery may vary
- 💡 Tip: Test with single Skills first

---

## Regenerating Skills

If you modify source files or want to rebuild Skills:

```bash
cd ..  # Return to sage-dev root
./sage-skillify.sh
```

This will regenerate all Skills from:
- `commands/*.md` - Slash command definitions
- `agents/python/*.md` - Python-specific agents
- `agents/shared/*.md` - Language-agnostic agents
- `rules/*.md` - Development standards

---

## File Sizes

| Skill | Size | Files |
|-------|------|-------|
| sage-context-optimizer.zip | 5 KB | 1 Skill.md |
| sage-implementation-planner.zip | 8 KB | 1 Skill.md + templates |
| sage-security-guard.zip | 13 KB | 1 Skill.md + rules |
| sage-research-intelligence.zip | 13 KB | 1 Skill.md + templates |
| sage-documentation-generator.zip | 14 KB | 1 Skill.md + templates |
| sage-python-quality-suite.zip | 16 KB | 1 Skill.md + rules |
| sage-ticket-manager.zip | 23 KB | 1 Skill.md |
| sage-specification-engine.zip | 69 KB | 1 Skill.md + examples |

---

## Support

- **Documentation:** [../docs/SKILLS_GUIDE.md](../docs/SKILLS_GUIDE.md) - Complete installation guide
- **Commands Reference:** [../commands/SAGE.COMMANDS.md](../commands/SAGE.COMMANDS.md) - Slash commands
- **Issues:** [GitHub Issues](https://github.com/Mathews-Tom/sage-dev/issues)

---

**Build with wisdom. Skills bring Sage-Dev to every developer, on every platform.** 🚀
