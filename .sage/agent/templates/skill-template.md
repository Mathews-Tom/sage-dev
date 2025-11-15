---
# Skill Metadata (YAML Frontmatter)
# All fields are required unless marked optional

name: "{{NAME}}"
# Human-readable skill name (e.g., "TDD Workflow", "Systematic Debugging")

category: "{{CATEGORY}}"
# One of: testing, debugging, refactoring, collaboration, architecture

languages:
  - python
  - typescript
# Programming languages this skill applies to

prerequisites:
  tools:
    - pytest>=7.0
    - git>=2.0
  # Required CLI tools with optional version constraints
  # Format: tool-name or tool-name>=version

  knowledge:
    - basic-git-workflow
  # Other skills or concepts that should be understood first
  # Reference skill files or external concepts

evidence:
  - "https://example.com/research-paper"
  - "Book: Clean Code by Robert C. Martin"
# Sources validating this skill's effectiveness
# Include URLs, book references, or documentation links

validated: false
# Set to true after peer review and testing

validated_by:
  - type-enforcer
  - test-coverage
# Enforcement agents that validate this skill's application
# These run automatically when skill is applied with --apply flag
---

# {{NAME}}

<!-- Skill Title - Replace {{NAME}} with actual skill name -->

## Purpose

<!-- WHY use this skill? What problem does it solve? -->

**When to use:**
- Situation where this skill applies
- Another scenario where it's beneficial

**When NOT to use:**
- Situation where this skill is inappropriate
- Scenario where overhead outweighs benefits

**Benefits:**
- Specific measurable benefit
- Another concrete outcome

## Prerequisites

<!-- What must be in place before applying this skill? -->

### Tools Required

```bash
# Verify tool installation
which pytest && pytest --version
which git && git --version
```

### Knowledge Required

- Understanding of [concept from prerequisites.knowledge]
- Familiarity with [relevant domain knowledge]

## Algorithm

<!-- STEP-BY-STEP procedure to apply this skill -->
<!-- Be precise and actionable - each step should be verifiable -->

### Step 1: [Action Name]

**What:** Brief description of what to do
**Why:** Reason this step matters
**How:**
```bash
# Command or code example
command --flag argument
```

**Verification:** How to know this step succeeded

### Step 2: [Action Name]

**What:** Brief description
**Why:** Reason this matters
**How:**
```python
# Python example
def example():
    pass
```

**Verification:** Success criteria

### Step 3: [Action Name]

**What:** Brief description
**Why:** Reason this matters
**How:**
```typescript
// TypeScript example
function example(): void {
  // implementation
}
```

**Verification:** Success criteria

<!-- Add more steps as needed -->

## Validation

<!-- How to verify the skill was applied correctly -->

### Success Criteria

- [ ] Criterion 1: Specific measurable outcome
- [ ] Criterion 2: Another verifiable result
- [ ] Criterion 3: Final quality gate

### Automated Validation

```bash
# Commands to verify skill application
enforcement-agent --validate
```

### Manual Verification

1. Check for [specific artifact]
2. Verify [behavior or property]
3. Confirm [quality attribute]

## Common Pitfalls

<!-- Mistakes to avoid when applying this skill -->

### Pitfall 1: [Name]

**Symptom:** What goes wrong
**Cause:** Why it happens
**Solution:** How to avoid or fix it

### Pitfall 2: [Name]

**Symptom:** What goes wrong
**Cause:** Why it happens
**Solution:** How to avoid or fix it

## Examples

<!-- Concrete implementations in different languages -->

### Python Example

**Scenario:** Brief context for this example

```python
# Complete working example
def apply_skill():
    """
    Demonstrates the skill in Python.
    """
    # Step 1: Initial setup
    setup_result = prepare()

    # Step 2: Core action
    result = execute_skill(setup_result)

    # Step 3: Validation
    assert validate(result), "Skill application failed"

    return result
```

**Key Points:**
- Important aspect of this implementation
- Language-specific consideration

### TypeScript Example

**Scenario:** Brief context for this example

```typescript
// Complete working example
function applySkill(): Result {
  // Step 1: Initial setup
  const setupResult = prepare();

  // Step 2: Core action
  const result = executeSkill(setupResult);

  // Step 3: Validation
  if (!validate(result)) {
    throw new Error("Skill application failed");
  }

  return result;
}
```

**Key Points:**
- Important aspect of this implementation
- Language-specific consideration

## References

<!-- Additional resources for deeper understanding -->

- [Evidence Link 1](https://example.com) - Brief description
- [Evidence Link 2](https://example.com) - Brief description
- Book: "Title" by Author - Relevant chapters

## Changelog

<!-- Track skill evolution -->

- **v1.0** (YYYY-MM-DD): Initial version
