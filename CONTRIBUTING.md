# Contributing to Sage-DEV

Welcome! Sage-DEV is a self-hosted development system - we use sage-dev to develop sage-dev itself. This creates a virtuous cycle where every feature validates the methodology.

## Philosophy

**Dogfooding First** - Every new feature must go through the sage-dev workflow:

- Write requirements
- Generate specifications
- Create implementation plans
- Break down into tasks
- Generate tickets
- Implement (manually or automated)
- Commit with ticket references
- Sync to GitHub

This ensures sage-dev works for real projects and continuously improves.

## Development Workflow

### Option 1: Traditional Manual Workflow

For contributors new to sage-dev:

```bash
# 1. Set up your environment
git clone https://github.com/Mathews-Tom/sage-dev.git
cd sage-dev
./sage-setup.sh

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Document requirements
# Create: docs/requirements/your-feature.md
# Include: problem, solution, acceptance criteria

# 4. Generate specification
/specify
# Creates: docs/specs/your-feature/spec.md

# 5. Create implementation plan
/plan
# Creates: docs/specs/your-feature/plan.md

# 6. Break down into tasks
/tasks
# Creates: docs/specs/your-feature/tasks.md

# 7. Implement the feature
# Write code following CLAUDE.md guidelines

# 8. Commit and push
/commit
git push origin feature/your-feature

# 9. Create pull request
# Use GitHub PR template
```

### Option 2: Ticket-Based Automated Workflow

For experienced contributors:

```bash
# 1. Initialize ticket-based workflow (one-time)
/workflow  # Select: TICKET_BASED

# 2. Create requirements document
# docs/requirements/your-feature.md

# 3. Generate full workflow artifacts
/specify  # → spec.md
/plan     # → plan.md
/tasks    # → tasks.md

# 4. Migrate to ticket system
/migrate --mode=optimized
# Creates ticket in .sage/tickets/

# 5. Validate ticket
/validate

# 6. Implement ticket
/implement YOUR-TICKET-ID
# Or use automated stream:
/stream --auto

# 7. Commit with ticket reference
/commit  # Automatically includes ticket ID

# 8. Sync to GitHub
/sync    # Creates GitHub issue, updates state
```

### Option 3: Parallel Development (Advanced)

For multiple independent features:

```bash
# 1. Create multiple requirement documents
docs/requirements/feature-1.md
docs/requirements/feature-2.md
docs/requirements/feature-3.md

# 2. Generate specs/plans/tasks for each
/specify && /plan && /tasks  # Repeat for each

# 3. Migrate all to tickets
/migrate --mode=optimized

# 4. Process in parallel
/stream --auto --parallel=3
# Processes 3 independent tickets concurrently!

# 5. Commit and sync
/commit
/sync
```

## Project Structure

```text
sage-dev/
├── commands/          # Slash command implementations
├── agents/           # Code quality enforcement agents
├── rules/            # Language-specific rules
├── .sage/           # Sage-dev state (gitignored)
│   ├── tickets/     # Ticket system
│   ├── lib/         # Helper libraries
│   └── config.json  # Project config
├── docs/            # Documentation
│   ├── requirements/
│   ├── specs/
│   └── breakdown/
├── src/             # Sage-dev source code
└── CONTRIBUTING.md  # This file
```

## Code Guidelines

### Follow CLAUDE.md Standards

All code must adhere to `.claude/CLAUDE.md` and project `CLAUDE.md`:

- **Environment:** Use `uv` for package management
- **Output Style:** Concise, factual, technical ("only-way" style)
- **File Handling:** Prefer editing over creating
- **Testing:** Use production pipeline, no mocks
- **Typing:** Built-in generics, `|` unions (Python 3.12+)
- **Errors:** Fail fast, no fallbacks
- **Models:** Only GPT-4.1, GPT-4.1-mini, GPT-5, GPT-5-mini

### No Bullshit Code

Run enforcement agents before committing:

```bash
# Check for bullshit patterns
/enforce --pipeline bs-check

# Block bullshit from entering codebase
/enforce --pipeline bs-enforce --auto-fix
```

**Avoid:**

- Fallbacks and graceful degradation
- Mock tests (use production pipeline)
- Template code
- Error swallowing
- Magic defaults

**Prefer:**

- Explicit errors
- Real tests
- Clear, direct code
- Intentional design

## Commit Standards

### Conventional Commits

```text
<type>(<scope>): #TICKET-ID <subject>

<body>

Closes: #TICKET-ID
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Example:**

```text
feat(stream): #PAR-001 add parallel execution support

Implement --parallel flag for concurrent ticket processing:
- Dependency graph analysis
- Batch scheduling
- Commit serialization
- Worker auto-detection

Performance: 2-3× faster for large queues

Closes: #PAR-001
```

### Using /commit Command

```bash
# Automatic commit with ticket reference
/commit

# The command will:
# 1. Identify active ticket from branch
# 2. Analyze changes
# 3. Generate semantic commit message
# 4. Include ticket reference
# 5. Add Claude attribution
```

## Testing

### Manual Testing

```bash
# Test your changes
uv run python -m sage_dev [command]

# Validate syntax
bash -n commands/your-command.md

# Check ticket system (if applicable)
/validate
```

### Automated Testing

```bash
# Run enforcement pipeline
/enforce --strict

# Agents run:
# - bs-check (no bullshit patterns)
# - bs-enforce (block new bullshit)
# - type-enforcer (Python 3.12 typing)
# - doc-validator (docstring completeness)
# - test-coverage (80%+ overall, 90%+ new)
# - import-enforcer (PEP 8 imports)
# - secret-scanner (no hardcoded secrets)
```

## Example: PAR-001 (Parallel Execution)

This feature was the first self-hosted implementation:

### 1. Requirements

```markdown
# docs/requirements/parallel-execution-feature.md
Problem: Sequential ticket processing too slow
Solution: Parallel execution with dependency resolution
```

### 2. Specification

```bash
/specify
# Generated: docs/specs/parallel-execution/spec.md
```

### 3. Implementation Plan

```bash
/plan
# Generated: docs/specs/parallel-execution/plan.md
```

### 4. Task Breakdown

```bash
/tasks
# Generated: docs/specs/parallel-execution/tasks.md
```

### 5. Ticket Creation

```bash
/migrate --mode=optimized
# Created: .sage/tickets/PAR-001.md
# Created: .sage/tickets/index.json
```

### 6. Implementation

```bash
# Manual implementation (already done)
# Files: .sage/lib/*.sh, commands/*.md updates
```

### 7. Commit

```bash
/commit
# Created semantic commit with #PAR-001 reference
```

### 8. Sync

```bash
/sync
# Creates GitHub issue
# Links ticket to PR
```

## Pull Request Process

### 1. Create PR from Feature Branch

```bash
git push origin feature/your-feature
gh pr create --title "feat: Your feature" --body "$(cat .docs/PR_DESCRIPTION.md)"
```

### 2. PR Template

```markdown
## Summary
Brief description of changes

## Ticket Reference
Closes #TICKET-ID

## Changes Made
- File 1: Description
- File 2: Description

## Testing
- [ ] Manual testing completed
- [ ] Enforcement pipeline passed
- [ ] Documentation updated

## Checklist
- [ ] Follows CLAUDE.md standards
- [ ] No bullshit code patterns
- [ ] Tests added/updated
- [ ] Ticket reference in commits
```

### 3. Review Process

1. Automated checks run (if CI/CD configured)
2. Maintainer reviews changes
3. Feedback addressed
4. Approved and merged

## Common Tasks

### Add a New Slash Command

```bash
# 1. Requirements
echo "Add /debug command for troubleshooting" > docs/requirements/debug-command.md

# 2. Workflow
/specify && /plan && /tasks && /migrate

# 3. Implement
/implement DEBUG-001

# 4. Deliver
/commit && /sync
```

### Add a New Agent

```bash
# 1. Requirements
# docs/requirements/perf-checker-agent.md

# 2. Workflow
/specify && /plan && /tasks && /migrate

# 3. Implement
# Create: agents/perf-checker.md

# 4. Test
/enforce --pipeline perf-check --dry-run

# 5. Deliver
/commit && /sync
```

### Update Documentation

```bash
# 1. Make changes
# Edit: commands/SAGE_DEV_COMMANDS.md

# 2. Commit (no ticket needed for docs-only)
git add commands/SAGE_DEV_COMMANDS.md
git commit -m "docs(commands): update parallel execution examples"

# 3. Push
git push origin docs/update-examples
```

## Getting Help

- **Documentation:** `/help` in Claude Code
- **Issues:** <https://github.com/Mathews-Tom/sage-dev/issues>
- **Commands Reference:** `commands/SAGE_DEV_COMMANDS.md`
- **Examples:** `commands/EXAMPLES.md`

## Versioning

Sage-DEV follows semantic versioning:

- **Major (X.0.0):** Breaking changes to workflow
- **Minor (x.X.0):** New features (backward compatible)
- **Patch (x.x.X):** Bug fixes

Current version: **2.1.0**

## License

See LICENSE file in repository root.

## Acknowledgments

Sage-DEV is built on the shoulders of giants:

- Research-backed development practices
- Battle-tested patterns from thousands of projects
- Community wisdom and feedback

By contributing, you're adding to this collective knowledge base.

---

**Remember:** Every contribution makes sage-dev better, which makes your future contributions easier. It's a virtuous cycle! 🔄
