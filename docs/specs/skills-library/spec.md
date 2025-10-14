# Skills Library Specification

**Version:** 1.0
**Status:** Draft
**Created:** 2025-10-14
**Component:** Reusable Skills Library and Application System
**Based on:** obra/superpowers skills library analysis
**Phase:** 2 (Near-term enhancement)

---

## 1. Overview

### Purpose
Implement a systematic skills library in Sage-Dev that captures proven development techniques, testing strategies, debugging workflows, and best practices as reusable, validated skills that AI agents and developers can discover, apply, and contribute to.

### Business Value
- **30% Faster Development**: Reuse proven techniques instead of reinventing solutions
- **Consistency**: All team members and AI agents follow established patterns
- **Knowledge Retention**: Capture expertise from experienced developers
- **Quality Improvement**: Skills validated by enforcement agents before application
- **Onboarding**: New developers learn established practices through skills catalog
- **Continuous Improvement**: Community contribution enables skill evolution

### Success Metrics
- Skills library reaches 20+ validated skills within 3 months
- 80%+ of implementations use at least one skill
- Skill application reduces bug rate by 20%
- Search finds relevant skill in <3 seconds
- Community contributes 5+ new skills per quarter

### Target Users
- **Primary**: AI coding agents applying skills during `/sage.implement`
- **Secondary**: Human developers learning and applying best practices
- **Tertiary**: Senior developers contributing validated skills to library

---

## 2. Functional Requirements

### FR-1: Skills Directory Structure

The system **shall** implement structured skills organization in `.sage/agent/skills/`.

#### FR-1.1: Category-Based Organization
```
.sage/agent/skills/
├── testing/
│   ├── tdd-workflow.md
│   ├── async-testing-python.md
│   ├── async-testing-typescript.md
│   ├── integration-testing.md
│   ├── e2e-testing.md
│   └── performance-testing.md
├── debugging/
│   ├── root-cause-analysis.md
│   ├── systematic-debugging.md
│   ├── performance-profiling.md
│   └── memory-leak-detection.md
├── refactoring/
│   ├── safe-refactoring-checklist.md
│   ├── extract-method.md
│   ├── introduce-parameter-object.md
│   └── replace-conditional-with-polymorphism.md
├── collaboration/
│   ├── code-review-checklist.md
│   ├── pr-description-template.md
│   └── pair-programming-protocol.md
├── architecture/
│   ├── dependency-injection.md
│   ├── repository-pattern.md
│   ├── service-layer-pattern.md
│   └── event-driven-design.md
└── shared/
    ├── git-workflow.md
    ├── commit-message-format.md
    └── documentation-standards.md
```

**Business Rule**: Skills organized by workflow phase and domain, not language (language specified in skill metadata)

#### FR-1.2: Skill Template Structure
Every skill **shall** follow standardized markdown template:

```markdown
---
name: TDD Workflow
category: testing
languages: [python, typescript, javascript]
prerequisites:
  tools: [pytest>=7.0, jest>=29.0]
  knowledge: [unit-testing-basics, test-doubles]
evidence:
  - https://martinfowler.com/bliki/TestDrivenDevelopment.html
  - Research: docs/research/tdd-effectiveness-2024.md
validated: true
validated_by: sage.test-coverage, sage.type-enforcer
created: 2025-10-14
updated: 2025-10-14
---

## Purpose
Test-Driven Development (TDD) ensures code correctness through test-first implementation.

**When to use**:
- Implementing new features with clear requirements
- Fixing bugs with reproducible steps
- Refactoring existing code for safety

**When NOT to use**:
- Exploratory prototyping (unclear requirements)
- UI/UX experimentation
- Performance optimization (use profiling instead)

## Prerequisites
- **Tools**: pytest 7.0+ (Python) or Jest 29.0+ (TypeScript/JavaScript)
- **Knowledge**: Understanding of unit tests, mocking, and assertions
- **Project Setup**: Test framework configured, tests runnable

## Algorithm
1. **Write Failing Test**
   - Create test file: `test_<feature>.py` or `<feature>.test.ts`
   - Write test for smallest piece of functionality
   - Run tests → Verify test fails (RED)
   - Commit: `test: add failing test for <feature>`

2. **Implement Minimal Code**
   - Write simplest code to pass test
   - Avoid over-engineering
   - Run tests → Verify test passes (GREEN)
   - Commit: `feat: implement <feature>`

3. **Refactor**
   - Improve code quality without changing behavior
   - Extract functions, rename variables, remove duplication
   - Run tests → Verify tests still pass
   - Commit: `refactor: improve <feature> implementation`

4. **Repeat**
   - Proceed to next piece of functionality
   - Maintain RED → GREEN → REFACTOR cycle

## Validation
- [ ] All tests pass (`pytest` or `npm test`)
- [ ] Code coverage ≥ 80% overall (`coverage report`)
- [ ] Code coverage ≥ 90% for new code
- [ ] No test dependencies (tests run in any order)
- [ ] Tests run in <5 seconds (unit test threshold)

## Common Pitfalls
- **Writing too much code before testing**: Leads to complex debugging
  - **Fix**: Test smallest possible unit
- **Tests that test implementation, not behavior**: Brittle tests
  - **Fix**: Test public interfaces, not private methods
- **Skipping refactor step**: Technical debt accumulates
  - **Fix**: Refactor immediately while context is fresh

## Examples
**Python Example**:
```python
# test_calculator.py
def test_add_two_numbers():
    calc = Calculator()
    result = calc.add(2, 3)
    assert result == 5

# calculator.py
class Calculator:
    def add(self, a: int, b: int) -> int:
        return a + b
```

**TypeScript Example**:
```typescript
// calculator.test.ts
test('add two numbers', () => {
  const calc = new Calculator();
  expect(calc.add(2, 3)).toBe(5);
});

// calculator.ts
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}
```

## References
- Martin Fowler: [TDD Basics](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- Kent Beck: "Test-Driven Development by Example"
- Research: `docs/research/tdd-effectiveness-2024.md`
```

**As a user story**: "As an AI agent, I want a standardized skill format so that I can reliably extract and apply proven techniques"

### FR-2: Skill Discovery Commands

The system **shall** provide commands for skill discovery and application.

#### FR-2.1: Skill Search
```bash
/sage.skill-search "async testing"
/sage.skill-search --category=refactoring
/sage.skill-search --language=python
```

**Output**:
```
🔍 Skills Matching "async testing" (2 results)

1. async-testing-python.md (testing)
   Languages: Python
   Purpose: Test async functions with pytest-asyncio
   Prerequisites: pytest-asyncio, asyncio knowledge
   Validated: ✅ (sage.test-coverage, sage.type-enforcer)

2. async-testing-typescript.md (testing)
   Languages: TypeScript
   Purpose: Test async functions with Jest
   Prerequisites: Jest 29.0+, async/await knowledge
   Validated: ✅ (test-runner)

Use: /sage.skill <name> to view full skill
```

**As a user story**: "As a developer, I want to search skills by topic so that I can find relevant techniques quickly"

#### FR-2.2: Skill Application
```bash
/sage.skill tdd-workflow
/sage.skill async-testing-python --apply
```

**Behavior**:
- Without `--apply`: Display full skill content
- With `--apply`: Validate prerequisites, then guide through algorithm steps
- Validation failures: Show missing prerequisites with installation instructions

**As a user story**: "As an AI agent, I want to apply skills with prerequisite validation so that I don't fail due to missing dependencies"

#### FR-2.3: Skill Listing
```bash
/sage.skill-list
/sage.skill-list --category=testing
/sage.skill-list --language=python --validated
```

**Output**:
```
📚 Skills Library (23 total)

Testing (6 skills):
  ✅ tdd-workflow.md - Test-Driven Development cycle
  ✅ async-testing-python.md - Async function testing (Python)
  ✅ async-testing-typescript.md - Async function testing (TypeScript)
  ✅ integration-testing.md - Multi-component testing
  ✅ e2e-testing.md - End-to-end testing workflows
  ⚠️  performance-testing.md - Performance benchmarking (unvalidated)

Debugging (4 skills):
  ✅ root-cause-analysis.md - Systematic bug investigation
  ✅ systematic-debugging.md - Step-by-step debugging protocol
  ✅ performance-profiling.md - CPU/memory profiling
  ✅ memory-leak-detection.md - Memory leak diagnosis

...
```

### FR-3: Skill Validation and Quality

The system **shall** enforce quality standards for skills.

#### FR-3.1: Prerequisite Validation
Before skill application, system **shall** check:
1. **Tool Prerequisites**: Verify required tools installed and meet version requirements
2. **Knowledge Prerequisites**: Check for related skills or documentation
3. **Project Setup**: Validate project structure supports skill (e.g., test framework configured)

**Example Validation (TDD Workflow)**:
```bash
# Checking prerequisites for tdd-workflow...
✅ pytest 7.4.0 installed (requires 7.0+)
✅ Knowledge prerequisite met: unit-testing-basics skill completed
✅ Project setup: pytest.ini found
⚠️  Code coverage tool not configured (recommended: pytest-cov)

Prerequisites: 3/3 required, 1/1 recommended warning
Proceed with skill application? (yes/no): _
```

#### FR-3.2: Evidence-Based Validation
Skills **shall** include evidence field linking to:
- Peer-reviewed research papers
- Industry best practices documentation (Martin Fowler, Kent Beck, etc.)
- Internal research outputs (`docs/research/`)
- Performance benchmarks demonstrating effectiveness

**Business Rule**: Skills without evidence marked as "unvalidated", lower priority in search results

#### FR-3.3: Enforcement Agent Validation
Skills tagged with `validated_by` field **shall** run relevant enforcement agents on skill application:

```yaml
validated_by:
  - sage.test-coverage  # Validates test coverage meets thresholds
  - sage.type-enforcer  # Validates type annotations
  - sage.bs-check       # Validates no bullshit patterns
```

**Validation Flow**:
1. Skill applied
2. Code generated following skill algorithm
3. Enforcement agents run automatically
4. If agents pass → Skill application successful
5. If agents fail → Show violations, skill application incomplete

### FR-4: Skill Contribution Workflow

The system **shall** enable skill contribution and community growth.

#### FR-4.1: Skill Creation
```bash
/sage.skill-add "dependency-injection-python"
```

**Behavior**:
1. Prompts for category selection
2. Creates skill file from template in `.sage/agent/skills/<category>/`
3. Opens file for editing
4. Validates markdown structure
5. Adds to skill index

**As a user story**: "As a senior developer, I want to contribute new skills so that the team benefits from my expertise"

#### FR-4.2: Skill Validation Process
New skills **shall** go through validation:
1. **Structure Validation**: Markdown follows template
2. **Content Validation**: All sections filled (Purpose, Prerequisites, Algorithm, Validation, Examples)
3. **Evidence Validation**: At least one evidence link provided
4. **Enforcement Validation**: Specify which agents validate this skill
5. **Peer Review**: Optional GitHub PR for team review

**Validation Statuses**:
- `validated: true` - Passed all checks, approved for use
- `validated: false` - Draft, not yet validated
- `deprecated: true` - Outdated, replaced by newer skill

#### FR-4.3: Skill Versioning
Skills stored in git **shall** maintain version history:
```bash
git log .sage/agent/skills/testing/tdd-workflow.md
```

Skill updates create commits with:
- `docs(skill): update tdd-workflow - add TypeScript example`
- `docs(skill): deprecate old-pattern - replaced by new-pattern`

### FR-5: Integration with Workflows

The system **shall** integrate skills with existing Sage-Dev workflows.

#### FR-5.1: Implementation Integration
`/sage.implement` command **shall** suggest relevant skills:

**Flow**:
1. Ticket TICKET-001 loaded
2. System analyzes ticket type, component, language
3. System searches skills matching context
4. System suggests top 3 relevant skills
5. Agent selects skill or proceeds without

**Example**:
```
📋 Implementing TICKET-001: Add User Authentication

🎯 Relevant Skills (3 suggestions):
  1. tdd-workflow.md - Recommended for new feature implementation
  2. repository-pattern.md - Data access pattern for user storage
  3. integration-testing.md - Test auth flow end-to-end

Apply skill? (1/2/3/none): _
```

#### FR-5.2: Planning Integration
`/sage.plan` command **shall** reference skills in implementation plans:

**Example Plan Section**:
```markdown
## Implementation Approach
**Skills to Apply**:
- `tdd-workflow.md` - Test-first development
- `dependency-injection.md` - Decouple authentication service
- `code-review-checklist.md` - PR quality assurance

## Phase 1: Core Authentication
Using `tdd-workflow.md`:
1. Write failing test for login endpoint
2. Implement minimal authentication logic
3. Refactor for clarity
...
```

#### FR-5.3: Enforcement Integration
Skills **shall** run enforcement agents post-application:

**Example**:
```
✅ Skill Applied: tdd-workflow.md

Running validation agents:
  → sage.test-coverage...
    ✅ Overall coverage: 85% (threshold: 80%)
    ✅ New code coverage: 95% (threshold: 90%)
  → sage.type-enforcer...
    ✅ All functions have type hints
    ✅ No legacy typing imports
  → sage.bs-check...
    ✅ No fallback patterns detected

Skill validation: PASSED
```

---

## 3. Non-Functional Requirements

### NFR-1: Performance
- Skill search: <3 seconds for 100 skills
- Skill rendering: <1 second for display
- Prerequisite validation: <5 seconds
- Enforcement agent validation: Depends on agents (typically <30 seconds)

### NFR-2: Quality Standards
- All validated skills **must** have evidence field
- All validated skills **must** have at least one example
- All validated skills **must** specify validation approach
- All validated skills **must** list enforcement agents (if applicable)
- Skills without evidence marked as "draft" or "unvalidated"

### NFR-3: Usability
- Clear skill categories (no ambiguity where skill belongs)
- Consistent markdown structure across all skills
- Human-readable skill names (no technical jargon in filenames)
- Search results ranked by validation status (validated > unvalidated)
- Help text for all skill commands

### NFR-4: Scalability
- Supports 100+ skills without performance degradation
- Supports multi-language skills (one skill, multiple language examples)
- Supports skill dependencies (Skill A requires Skill B)
- Git-based versioning for audit trail

---

## 4. Features & Flows

### Feature 1: Skill Discovery and Learning (Priority: P0)

**Flow: Finding a Skill**
1. Developer needs to implement async testing
2. Developer runs: `/sage.skill-search "async testing"`
3. System searches `.sage/agent/skills/` directory
4. Results show 2 skills: Python and TypeScript variants
5. Developer runs: `/sage.skill async-testing-python`
6. System displays full skill with examples
7. Developer applies technique to implementation

**Use Case**: Learn proven technique for unfamiliar task

### Feature 2: Skill Application with Validation (Priority: P0)

**Flow: Applying Skill with Prerequisites**
1. AI agent runs: `/sage.skill tdd-workflow --apply`
2. System validates prerequisites:
   - pytest installed? ✅
   - Test directory exists? ✅
   - Unit testing knowledge? ✅ (completed skill)
3. System guides through algorithm:
   - "Step 1: Write failing test"
   - Agent writes test
   - "Run tests to verify failure"
   - Agent runs tests → RED
4. Continue through GREEN and REFACTOR steps
5. System runs enforcement agents
6. All validations pass → Skill application complete

**Use Case**: AI agent applies proven workflow with safety checks

### Feature 3: Skill Contribution (Priority: P1)

**Flow: Adding New Skill**
1. Senior developer discovers new pattern
2. Developer runs: `/sage.skill-add "hexagonal-architecture"`
3. System prompts: "Category? (architecture/testing/debugging/refactoring/etc.)"
4. Developer selects: "architecture"
5. System creates: `.sage/agent/skills/architecture/hexagonal-architecture.md`
6. System opens file with template pre-filled
7. Developer fills sections:
   - Purpose, Prerequisites, Algorithm, Validation, Examples, Evidence
8. Developer sets: `validated: false` (draft)
9. Developer commits: `docs(skill): add hexagonal-architecture pattern`
10. Team reviews in PR, sets `validated: true` on approval

**Use Case**: Capture organizational knowledge as reusable skill

### Feature 4: Multi-Language Skill Support (Priority: P1)

**Flow: Language-Specific Examples**
1. Skill `tdd-workflow.md` supports Python, TypeScript, JavaScript
2. Agent runs: `/sage.skill tdd-workflow --language=python`
3. System displays skill with Python-specific:
   - Tool prerequisites (pytest)
   - Code examples (Python syntax)
   - Validation commands (`pytest`, `coverage`)
4. Same skill, different language → different examples, same algorithm

**Use Case**: Reuse same technique across different languages

---

## 5. Acceptance Criteria

### AC-1: Skills Directory Structure
- [ ] `.sage/agent/skills/` directory created with categories
- [ ] Skill template defined and documented
- [ ] 5+ initial skills added across testing, debugging, refactoring categories
- [ ] All skills follow consistent markdown structure

### AC-2: Skill Discovery
- [ ] `/sage.skill-search <query>` finds relevant skills
- [ ] `/sage.skill-list` lists all skills with metadata
- [ ] `/sage.skill <name>` displays full skill content
- [ ] Search filters by category, language, validation status

### AC-3: Skill Validation
- [ ] Prerequisite validation checks tools, knowledge, project setup
- [ ] Evidence field links to research or authoritative sources
- [ ] Enforcement agents run automatically after skill application
- [ ] Validation failures show clear error messages with remediation

### AC-4: Skill Contribution
- [ ] `/sage.skill-add <name>` creates new skill from template
- [ ] Skill validation checks structure and content completeness
- [ ] Git commits track skill creation and updates
- [ ] Validated skills marked clearly in search results

### AC-5: Workflow Integration
- [ ] `/sage.implement` suggests relevant skills for tickets
- [ ] `/sage.plan` references skills in implementation strategy
- [ ] Skills run enforcement agents post-application
- [ ] Multi-language support works for Python, TypeScript, JavaScript

---

## 6. Dependencies

### Technical Dependencies
- **Requires**: `.sage/agent/` directory structure (from CONTEXT-001 Context Engineering)
- **Requires**: Enforcement agents (sage.test-coverage, sage.type-enforcer, etc.)
- **Requires**: `rg` (ripgrep) for skill search
- **Optional**: `/sage.search` command for enhanced skill discovery

### Component Dependencies
- **Depends On**: CONTEXT-002 (Initialize .sage/agent/ Directory) - Directory must exist
- **Related**: READY-001 (Ready-Work Detection) - May validate skill prerequisites
- **Related**: SEARCH-001 (Context Search) - Searches skills catalog
- **Integration**: `/sage.implement`, `/sage.plan` - Suggest skills during workflows

### External Integrations
- **Git**: Skill versioning and contribution workflow
- **Enforcement Agents**: Post-application validation
- **Markdown Renderer**: Display skills with formatting

### Assumptions
- Skills stored as markdown files in git
- Skill names unique within category
- Evidence links remain accessible (papers, documentation)
- Multi-language skills use consistent algorithm across languages

### Risks & Mitigations
- **Risk**: Skills become outdated as practices evolve
  - **Mitigation**: Version tracking, deprecation workflow, regular review cycles
- **Risk**: Too many skills overwhelm users
  - **Mitigation**: Category organization, validation status filtering, relevance ranking
- **Risk**: Skills conflict with project-specific practices
  - **Mitigation**: Skills are guidelines not mandates, allow local overrides

---

## 7. Source Traceability

**Research Source**: Analysis of obra/superpowers repository (2025-10-14)
- Superpowers skills library concept (testing, debugging, collaboration, meta skills)
- Skills discovery and search functionality
- Systematic over ad-hoc development philosophy
- Evidence-based validation approach

**Alignment with Sage-Dev**:
- Integrates with `.sage/agent/` context engineering structure (v2.5)
- Validates skills via enforcement agents (no-bullshit principle)
- Evidence-based requirements align with research-driven workflow
- Multi-language support matches Sage-Dev's multi-language framework
- Git-based contribution aligns with git-distributed philosophy

**Related Specifications**:
- Context Engineering: `.sage/agent/` directory (foundation for skills)
- Enhanced Dependencies: `docs/specs/enhanced-dependencies/spec.md` (skill prerequisites)
- Ready-Work Detection: `docs/specs/ready-work-detection/spec.md` (prerequisite validation)
- Context Search: `docs/specs/context-search/spec.md` (skill discovery)

**Implementation Strategy**:
- Phase 1: Core skill structure and 5-10 seed skills
- Phase 2: Skill contribution workflow and validation pipeline
- Phase 3: Workflow integration (suggest skills in `/sage.implement`)
- Phase 4: Community contribution and skill marketplace

**Initial Skills to Implement** (Priority order):
1. tdd-workflow.md (testing) - Most universally applicable
2. systematic-debugging.md (debugging) - High-value technique
3. safe-refactoring-checklist.md (refactoring) - Risk mitigation
4. code-review-checklist.md (collaboration) - Quality assurance
5. dependency-injection.md (architecture) - Common pattern
