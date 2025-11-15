# Code Patterns Library

Repository of code patterns and anti-patterns for the Sage-Dev system.

## Directory Structure

```
.sage/patterns/
├── good/           # Recommended patterns
├── anti/           # Anti-patterns to avoid
└── README.md       # This file
```

## Pattern Format

Each pattern file is markdown with:
- Name and description
- When to use
- Code examples
- Related patterns

## Search Integration

Patterns are searchable via `/sage.search`:
```bash
/sage.search singleton --source patterns
```
