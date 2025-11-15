# Contributing to Sage-DEV

Thank you for contributing to Sage-DEV! This guide explains how to contribute to the project.

## Philosophy

**Dogfooding First** - We use sage-dev to develop sage-dev. Every feature goes through our own workflow to validate the methodology.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/sage-dev.git`
3. **Choose your setup:**
   - **Claude Code CLI:** Run `./sage-setup.sh` for slash commands
   - **Other LLMs (ChatGPT, Gemini):** Run `./sage-skillify.sh` and upload skills/*.zip files
4. Create feature branch: `git checkout -b feature/your-feature`

**Note:** Skills provide the same capabilities as slash commands but work across all LLM platforms. See [docs/SKILLS_GUIDE.md](docs/SKILLS_GUIDE.md) for details.

## Contribution Workflow

Choose based on your familiarity:

### Quick Contribution (Simple Changes)

```bash
# Make your changes
# Commit following standards below
git commit -m "type(scope): description"
git push origin feature/your-feature
```

### Full Workflow (New Features)

```bash
# 1. Document in docs/requirements/feature.md
# 2. Generate artifacts
/sage.specify && /sage.plan && /sage.tasks
# 3. Implement changes
# 4. Commit
/sage.commit
```

## What to Contribute

### Language Support (High Priority)

Add JavaScript/TypeScript agents:

1. Create `agents/[language]/agent-name.md`
2. Update `agents/index.json`
3. Add `rules/[language]-standards.md`
4. Update `sage-setup.sh`

### New Agents

Create enforcement agents with `sage.*` prefix:

```markdown
---
name: sage.agent-name
description: What it enforces
model: sonnet
color: purple
---

Algorithm:
1. Detection logic
2. Validation rules
3. Auto-fix procedures
```

### New Commands

Add slash commands with `sage.*` prefix in `commands/`

### Bug Fixes

Reference issue number in PR

### Documentation

Update relevant docs in `commands/`, `agents/`, or `rules/`

## Standards

### Code Quality

- Follow `CLAUDE.md` guidelines
- No bullshit code patterns (no fallbacks, mocks, templates, error swallowing)
- Fail fast with explicit errors
- Use production pipeline for tests
- Python 3.12+ typing (built-in generics, `|` unions)

Run before committing:

```bash
/sage.enforce --strict
```

### Commit Format

```plaintext
<type>(<scope>): <description>

[optional body]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Example:**

```plaintext
feat(agents): add sage.perf-checker for JavaScript

- Detects performance anti-patterns
- Validates bundle size limits
- Auto-fix suggestions included
```

Use `/sage.commit` for automatic formatting.

## Testing

```bash
# Test commands
./sage-setup.sh

# Run enforcement
/sage.enforce --strict

# Validate changes
/sage.validate  # If using tickets
```

## Pull Request

```bash
git push origin feature/your-feature
gh pr create --title "type(scope): description"
```

**PR Checklist:**

- [ ] Follows CLAUDE.md standards
- [ ] No bullshit code patterns
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Conventional commits used

Maintainers review within 3-5 business days.

## Getting Help

- **Issues:** <https://github.com/Mathews-Tom/sage-dev/issues>
- **Quickstart:** See [docs/QUICKSTART.md](docs/QUICKSTART.md)
- **Installation:** See [docs/INSTALLATION.md](docs/INSTALLATION.md)
- **Workflows:** See [docs/WORKFLOWS.md](docs/WORKFLOWS.md)
- **MCP Servers:** See [docs/MCP_SETUP.md](docs/MCP_SETUP.md)
- **Command Reference:** See [commands/SAGE.COMMANDS.md](commands/SAGE.COMMANDS.md)

## Acknowledgments

**Special Thanks:**

- **[Sydney Lewis](https://www.linkedin.com/in/sydches/)** - For the motivation, guidance, and wisdom that inspired this project

---

Every contribution makes sage-dev better. Thank you!
