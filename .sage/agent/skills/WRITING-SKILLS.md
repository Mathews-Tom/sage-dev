# Skill Writing Guide

Complete guide for creating high-quality skills that capture validated engineering practices.

## Purpose

Skills codify proven engineering practices into reusable, validated procedures. A well-written skill:

- Captures expert knowledge in actionable form
- Provides step-by-step procedures anyone can follow
- Includes evidence from industry research
- Validates correct application through enforcement agents
- Prevents common mistakes through documented pitfalls

## Quick Start

```bash
# 1. Create skill from template
/sage.skill-add my-new-skill
# Select category (1-5)

# 2. Edit the generated file
# File created at: .sage/agent/skills/<category>/my-new-skill.md

# 3. Test your skill
/sage.skill my-new-skill
/sage.skill my-new-skill --apply

# 4. Search for it
/sage.skill-search my-new
```

## Skill Template Structure

Every skill follows this structure:

```markdown
---
name: "Skill Display Name"
category: "category-name"
languages:
  - python
  - typescript
prerequisites:
  tools:
    - tool-name>=version
  knowledge:
    - prerequisite-skill
evidence:
  - "https://link-to-research"
validated: false
validated_by:
  - enforcement-agent
---

# Skill Display Name

## Purpose
## Prerequisites
## Algorithm
## Validation
## Common Pitfalls
## Examples
## References
## Changelog
```

## Writing Each Section

### YAML Frontmatter

**name**: Human-readable title (Title Case with spaces)
```yaml
name: "Safe Refactoring Checklist"
```

**category**: One of the 5 category directories
```yaml
category: "refactoring"  # testing | debugging | refactoring | collaboration | architecture
```

**languages**: Programming languages this skill applies to
```yaml
languages:
  - python
  - typescript
  - go
```

**prerequisites.tools**: CLI tools required with optional version constraints
```yaml
prerequisites:
  tools:
    - pytest>=7.0       # With minimum version
    - git>=2.0
    - docker            # Any version OK
```

**prerequisites.knowledge**: Other skills or concepts to understand first
```yaml
prerequisites:
  knowledge:
    - basic-git-workflow     # Reference another skill
    - unit-testing-basics    # External concept
```

**evidence**: Sources validating this skill's effectiveness
```yaml
evidence:
  - "https://martinfowler.com/articles/..."
  - "Book: Title by Author"
  - "https://research-paper.pdf"
```
**Minimum**: 2 evidence links per skill

**validated**: Boolean indicating peer review status
```yaml
validated: false  # Set to true after team review
```

**validated_by**: Enforcement agents that check skill application
```yaml
validated_by:
  - type-enforcer      # Checks Python typing
  - test-coverage      # Ensures adequate tests
  - bs-enforce         # No bullshit patterns
```

### Purpose Section

Explain WHEN and WHY to use this skill.

```markdown
## Purpose

**When to use:**
- Specific situation where this skill applies
- Another scenario where it's beneficial
- Problem it solves

**When NOT to use:**
- Situation where this skill is inappropriate
- Scenario where overhead outweighs benefits
- Anti-patterns to avoid

**Benefits:**
- Measurable outcome 1
- Concrete benefit 2
- Specific improvement 3
```

**Tips:**
- Be specific about scenarios
- Include negative cases (when NOT to use)
- Quantify benefits where possible

### Prerequisites Section

Document what must be in place before applying the skill.

```markdown
## Prerequisites

### Tools Required

\```bash
# Verify installation
which tool-name && tool-name --version
\```

### Knowledge Required

- Understanding of [concept 1]
- Familiarity with [concept 2]
- Experience with [technique]
```

**Tips:**
- Provide verification commands
- Link to prerequisite skills
- Be honest about required expertise

### Algorithm Section (Most Important!)

Step-by-step procedure to apply the skill. This is the core of your skill.

```markdown
## Algorithm

### Step 1: [Action Name]

**What:** Brief description of what to do
**Why:** Reason this step matters
**How:**
\```bash
# Command or code example
actual-command --with-flags
\```

**Verification:** How to know this step succeeded
```

**Tips:**
- Each step should be independently verifiable
- Include exact commands or code
- Explain WHY, not just WHAT
- Keep steps atomic (one action per step)
- Number steps sequentially (Step 1, Step 2, etc.)
- Provide verification criteria for each step

**Example from TDD Workflow:**
```markdown
### Step 1: Write Failing Test (RED)

**What:** Write a test that describes expected behavior
**Why:** Forces you to think about API design and requirements first
**How:**
\```python
def test_add_returns_sum_of_two_numbers():
    result = add(2, 3)
    assert result == 5
\```

**Verification:** Test fails with clear error message about missing implementation
```

### Validation Section

Define how to verify the skill was applied correctly.

```markdown
## Validation

### Success Criteria

- [ ] Criterion 1: Specific measurable outcome
- [ ] Criterion 2: Another verifiable result
- [ ] Criterion 3: Final quality gate

### Automated Validation

\```bash
# Commands to verify skill application
pytest --cov=src --cov-fail-under=80
\```

### Manual Verification

1. Check for [specific artifact]
2. Verify [behavior or property]
3. Confirm [quality attribute]
```

**Tips:**
- Use checkboxes for success criteria
- Include both automated and manual checks
- Be specific about what "success" looks like

### Common Pitfalls Section

Mistakes to avoid when applying this skill.

```markdown
## Common Pitfalls

### Pitfall 1: [Descriptive Name]

**Symptom:** What goes wrong
**Cause:** Why it happens
**Solution:** How to avoid or fix it

### Pitfall 2: [Descriptive Name]

**Symptom:** What goes wrong
**Cause:** Why it happens
**Solution:** How to avoid or fix it
```

**Tips:**
- Draw from real experience
- Be specific about symptoms
- Provide actionable solutions
- Include at least 2-3 common pitfalls

### Examples Section

Concrete implementations in multiple languages.

```markdown
## Examples

### Python Example

**Scenario:** Brief context for this example

\```python
# Complete working example
def apply_skill():
    # Step 1: ...
    # Step 2: ...
    # Step 3: ...
    pass
\```

**Key Points:**
- Important aspect of this implementation
- Language-specific consideration

### TypeScript Example

**Scenario:** Brief context

\```typescript
// Complete working example
function applySkill(): void {
  // Steps...
}
\```

**Key Points:**
- Language-specific consideration
```

**Tips:**
- Examples should be complete and runnable
- Match examples to skill steps
- Highlight language-specific considerations
- Use real-world scenarios, not toy examples

### References Section

Additional resources for deeper understanding.

```markdown
## References

- [Resource Name](https://link) - Brief description
- Book: "Title" by Author - Relevant chapters
- [Another Resource](https://link) - Description
```

**Tips:**
- Quality over quantity
- Include books, papers, blog posts
- Brief descriptions of what each offers

### Changelog Section

Track skill evolution.

```markdown
## Changelog

- **v1.0** (2025-11-15): Initial version
- **v1.1** (2025-12-01): Added TypeScript examples
- **v2.0** (2025-12-15): Revised algorithm based on feedback
```

## Quality Checklist

Before marking `validated: true`, verify:

### Content Quality
- [ ] Purpose clearly states when to use and when NOT to use
- [ ] Algorithm has 3+ concrete steps with verification
- [ ] Each step has What/Why/How/Verification
- [ ] At least 2 evidence links (research, books, docs)
- [ ] At least 2 common pitfalls documented
- [ ] Examples in at least 2 languages
- [ ] Examples are complete and runnable

### Technical Accuracy
- [ ] Algorithm steps are correct and tested
- [ ] Tool versions are accurate
- [ ] Code examples compile/run without errors
- [ ] Evidence links are valid and accessible

### Usability
- [ ] Skill can be found with `/sage.skill-search`
- [ ] Prerequisites can be validated with `--apply`
- [ ] Instructions are clear enough for junior developers
- [ ] Language is concise and actionable

### Review Process
- [ ] Peer reviewed by at least one team member
- [ ] Tested on real project scenario
- [ ] Feedback incorporated
- [ ] Validated by specified enforcement agents

## Best Practices

### DO:
- Research before writing (read 3+ sources)
- Test your algorithm on a real problem
- Get peer review before marking validated
- Update skills as practices evolve
- Include negative cases (when NOT to use)
- Be honest about prerequisites

### DON'T:
- Copy from single source without verification
- Skip the "Why" explanations
- Use toy examples that don't reflect reality
- Assume reader expertise
- Forget to update changelog
- Mark validated without peer review

## Common Skill Patterns

### Workflow Skills
Skills that define a complete process (TDD, Code Review):
- Multiple sequential steps
- Cycles or iterations
- State transitions
- Checkpoints

### Checklist Skills
Skills for quality assurance (Safe Refactoring):
- Verification steps
- Quality gates
- Risk mitigation
- Rollback procedures

### Pattern Skills
Skills for applying design patterns (Dependency Injection):
- Structure definition
- Implementation steps
- Variation handling
- Trade-offs

### Analysis Skills
Skills for investigation (Systematic Debugging):
- Information gathering
- Hypothesis formation
- Testing procedures
- Documentation

## Integration with Workflow

Skills integrate with sage-dev workflow:

```bash
# During /sage.implement
# Skills are suggested based on ticket type
# Bug ticket → systematic-debugging
# Feature ticket → tdd-workflow
# Refactor ticket → safe-refactoring-checklist

# Prerequisite validation
/sage.skill my-skill --apply
# Checks tools are installed
# Validates versions meet requirements
# Runs enforcement agents

# Skill discovery
/sage.skill-search "test coverage"
# Finds relevant skills by keyword
```

## Contributing New Skills

1. **Identify Need**: Recognize a repeatable engineering practice
2. **Research**: Find 3+ sources validating the practice
3. **Draft**: Create skill from template using `/sage.skill-add`
4. **Test**: Apply skill to real project scenario
5. **Review**: Get peer feedback on clarity and accuracy
6. **Validate**: Mark as validated after successful review
7. **Share**: Commit to skills library for team use

## Frequently Asked Questions

**Q: How specific should a skill be?**
A: Specific enough to be actionable, general enough to be reusable. "TDD Workflow" is good; "Write Jest Tests for React Components" is too specific.

**Q: How many skills should I have per category?**
A: Start with 3-5 essential skills per category. Quality matters more than quantity.

**Q: Can skills reference other skills?**
A: Yes! Use `prerequisites.knowledge` to reference prerequisite skills. This creates a learning path.

**Q: What if my tool doesn't have --version?**
A: The version checking will gracefully handle this. Just specify the tool name without version constraint.

**Q: Should I include every edge case in Examples?**
A: Focus on the most common scenarios. Use Common Pitfalls for edge cases.

**Q: How often should skills be updated?**
A: Review quarterly or when underlying tools/practices change significantly.

## Resources

- Template: `.sage/agent/templates/skill-template.md`
- Example: `.sage/agent/templates/examples/skill-example.md`
- Existing Skills: `.sage/agent/skills/`
- Commands: `/sage.skill`, `/sage.skill-search`, `/sage.skill-add`
