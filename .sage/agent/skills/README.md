# Skills Library

Curated collection of validated engineering skills for AI-assisted development.

## Directory Structure

```
skills/
├── testing/          # Test strategies, TDD workflows, coverage patterns
├── debugging/        # Systematic debugging, root cause analysis
├── refactoring/      # Safe refactoring patterns, code transformations
├── collaboration/    # Code review, pair programming, team practices
└── architecture/     # Design patterns, system design, dependency management
```

## Category Purposes

### testing/
Test-first development workflows, test design patterns, coverage strategies, and quality assurance practices.

### debugging/
Systematic approaches to finding and fixing bugs, performance profiling, log analysis, and root cause identification.

### refactoring/
Safe code transformation techniques, technical debt reduction, and codebase improvement patterns with risk mitigation.

### collaboration/
Team development practices including code review standards, pair programming protocols, and communication patterns.

### architecture/
Software design patterns, system architecture principles, dependency injection, and structural organization.

## Skill Structure

Each skill is a Markdown file with:
- **YAML frontmatter**: Metadata (name, category, languages, prerequisites, evidence, validation)
- **Purpose**: When and why to use this skill
- **Algorithm**: Step-by-step procedure
- **Validation**: How to verify correct application
- **Examples**: Language-specific implementations

## Usage

```bash
# Display a skill
/sage.skill tdd-workflow

# Apply a skill with prerequisite validation
/sage.skill systematic-debugging --apply

# Search for skills
/sage.skill-search "test coverage"

# Create a new skill
/sage.skill-add my-new-skill
```

## Contributing

1. Use the skill template: `.sage/agent/templates/skill-template.md`
2. Place in appropriate category directory
3. Include evidence links (articles, books, documentation)
4. Define clear prerequisites (tools, knowledge)
5. Provide multi-language examples where applicable
6. Get peer review before validation

## Validation

Skills are validated by:
- Peer review for correctness
- Evidence links verified
- Prerequisites testable
- Enforcement agents integration (optional)
