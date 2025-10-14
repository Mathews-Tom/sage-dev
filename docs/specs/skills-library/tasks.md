# Tasks: Skills Library

**From:** `spec.md` + `plan.md`
**Timeline:** 4 weeks, 2 sprints
**Team:** 1 backend engineer
**Created:** 2025-10-14

## Summary
- Total tasks: 11
- Estimated effort: 43 story points (172 hours)
- Critical path duration: 4 weeks
- Key risks: Seed skill quality, community adoption, validation integration complexity

## Phase Breakdown

### Phase 1: Core Structure (Sprint 1, 13 story points)
**Goal:** Skills directory and seed skills
**Deliverable:** Working skills library with 5 validated skills

#### Tasks

**[SKILLS-002] Create Skills Directory Structure**

- **Description:** Create .sage/agent/skills/ directory hierarchy with 5 category subdirectories: testing/, debugging/, refactoring/, collaboration/, architecture/. Initialize with README explaining structure.
- **Acceptance:**
  - [ ] .sage/agent/skills/ directory created
  - [ ] Subdirectories: testing/, debugging/, refactoring/, collaboration/, architecture/
  - [ ] Permissions: 0755 for directories
  - [ ] Base README.md in .sage/agent/skills/ explaining structure
  - [ ] README lists category purposes
  - [ ] .gitignore updated if needed (skills should be committed)
  - [ ] Idempotent (safe to run multiple times)
- **Effort:** 2 story points (8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** CONTEXT-002 (Initialize .sage/agent/ Directory)
- **Priority:** P0 (Blocker)

**[SKILLS-003] Design Skill Template**

- **Description:** Create skill-template.md in .sage/agent/templates/ with YAML frontmatter structure and markdown sections. Include all required fields: name, category, languages, prerequisites, evidence, validated, validated_by. Define placeholder markers ({{NAME}}, {{CATEGORY}}).
- **Acceptance:**
  - [ ] .sage/agent/templates/skill-template.md created
  - [ ] YAML frontmatter includes all required fields
  - [ ] Frontmatter fields: name, category, languages[], prerequisites{tools[], knowledge[]}, evidence[], validated (boolean), validated_by[]
  - [ ] Markdown sections: Purpose, Prerequisites, Algorithm, Validation, Common Pitfalls, Examples
  - [ ] Placeholders: {{NAME}}, {{CATEGORY}}
  - [ ] Template validates as valid markdown
  - [ ] Includes inline comments explaining each section
  - [ ] Example filled template provided for reference
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILLS-002
- **Priority:** P0 (Critical)

**[SKILLS-004] Create 5 Seed Skills**

- **Description:** Research and write 5 high-quality seed skills using the template: tdd-workflow.md, systematic-debugging.md, safe-refactoring-checklist.md, code-review-checklist.md, dependency-injection.md. Each skill must include evidence links, clear procedures, and validation checklists.
- **Acceptance:**
  - [ ] testing/tdd-workflow.md created with TDD procedure
  - [ ] debugging/systematic-debugging.md created with step-by-step debugging
  - [ ] refactoring/safe-refactoring-checklist.md created with risk mitigation
  - [ ] collaboration/code-review-checklist.md created with review criteria
  - [ ] architecture/dependency-injection.md created with DI pattern
  - [ ] All skills follow template structure exactly
  - [ ] All skills include 2+ evidence links (articles, books, docs)
  - [ ] All skills have clear "When to use" and "When NOT to use" sections
  - [ ] All skills validated by team review
  - [ ] Multi-language examples (Python, TypeScript) where applicable
- **Effort:** 8 story points (32 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILLS-003
- **Priority:** P0 (Critical)

---

### Phase 2: Skill Commands (Sprint 1-2, 14 story points)
**Goal:** Command interface for skill management
**Deliverable:** Working /sage.skill, /sage.skill-search, /sage.skill-add commands

#### Tasks

**[SKILLS-005] Implement /sage.skill Command**

- **Description:** Create commands/sage.skill.md to display and apply skills. Parse skill name, find file using find, display contents. With --apply flag, validate prerequisites (check tools installed with which).
- **Acceptance:**
  - [ ] commands/sage.skill.md created
  - [ ] Accepts: /sage.skill <name> [--apply]
  - [ ] Name slugified for lookup (lowercase, hyphens)
  - [ ] Uses find to locate skill file in .sage/agent/skills/
  - [ ] Displays full skill content with cat
  - [ ] Error if skill not found: "❌ Skill not found: <name>"
  - [ ] --apply flag triggers prerequisite validation
  - [ ] Prerequisite validation checks tools exist with which
  - [ ] Displays validation results: "✅ Prerequisites validated" or "⚠️ Missing: <tool>"
  - [ ] Instructions: "Follow the Algorithm section above to apply this skill"
- **Effort:** 5 story points (20 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILLS-004
- **Priority:** P0 (Critical)

**[SKILLS-006] Implement /sage.skill-search Command**

- **Description:** Create commands/sage.skill-search.md to search skills by query with filters. Use ripgrep for fast text search across .sage/agent/skills/. Support --category and --language filters. Parse YAML frontmatter with yq for metadata.
- **Acceptance:**
  - [ ] commands/sage.skill-search.md created
  - [ ] Accepts: /sage.skill-search <query> [--category=type] [--language=lang]
  - [ ] Uses ripgrep (rg) for text search
  - [ ] Searches all skills in .sage/agent/skills/ recursively
  - [ ] --category filter: searches only specified category directory
  - [ ] --language filter: matches language in frontmatter with yq
  - [ ] Output format: "<filename> (<category>)\n  Languages: <list>\n  Purpose: <first line>"
  - [ ] Results sorted alphabetically by category then name
  - [ ] Handles no results gracefully: "No skills found matching: <query>"
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILLS-004
- **Priority:** P0 (Critical)

**[SKILLS-007] Implement /sage.skill-add Command**

- **Description:** Create commands/sage.skill-add.md to create new skills from template. Interactive category selection, copy template, substitute placeholders ({{NAME}}, {{CATEGORY}}), open for editing.
- **Acceptance:**
  - [ ] commands/sage.skill-add.md created
  - [ ] Accepts: /sage.skill-add <name>
  - [ ] Prompts for category with menu: testing, debugging, refactoring, collaboration, architecture
  - [ ] Validates category selection (1-5)
  - [ ] Creates skill file: .sage/agent/skills/<category>/<name>.md
  - [ ] Copies from .sage/agent/templates/skill-template.md
  - [ ] Substitutes {{NAME}} with provided name
  - [ ] Substitutes {{CATEGORY}} with selected category
  - [ ] Success message: "✅ Created: <path>\nEdit the file to complete the skill definition."
  - [ ] Error if file already exists: "❌ Skill already exists: <name>"
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILLS-003
- **Priority:** P0 (Critical)

**[SKILLS-008] Implement Prerequisite Validation**

- **Description:** Enhance /sage.skill --apply with detailed prerequisite validation. Check tool versions using which and --version. Validate knowledge prerequisites (check if referenced docs exist).
- **Acceptance:**
  - [ ] Extracts prerequisites.tools[] from YAML frontmatter with yq
  - [ ] Extracts prerequisites.knowledge[] from YAML frontmatter
  - [ ] For each tool: checks existence with which <tool-name>
  - [ ] For each tool: attempts version check with <tool> --version
  - [ ] Parses tool version requirements (e.g., pytest>=7.0)
  - [ ] Compares installed version with required version
  - [ ] For knowledge: checks if referenced skill files exist
  - [ ] Reports: "✅ All prerequisites met" or "⚠️ Missing: <tool> (required: >=7.0, found: 6.5)"
  - [ ] Exit code 0 if all met, exit code 1 if any missing
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILLS-005
- **Priority:** P1 (High)

---

### Phase 3: Validation Integration (Sprint 2, 8 story points)
**Goal:** Integration with workflow commands
**Deliverable:** Skills suggested in /sage.implement, enforcement agent validation

#### Tasks

**[SKILLS-009] Integrate with /sage.implement Command**

- **Description:** Modify commands/sage.implement.md to suggest relevant skills based on ticket type (story, epic, bug). Display skill menu after loading ticket, before implementation. Allow optional skill application.
- **Acceptance:**
  - [ ] After loading ticket in /sage.implement, display skill suggestions
  - [ ] Skill suggestions based on ticket type: story/epic → tdd-workflow, safe-refactoring; bug → systematic-debugging
  - [ ] Display menu: "🎯 Suggested Skills:\n  1. tdd-workflow - Test-first development\n  2. safe-refactoring-checklist - Quality assurance\n  \nApply skill? (1/2/none):"
  - [ ] User input validation (1, 2, none)
  - [ ] If skill selected, calls /sage.skill <name> --apply
  - [ ] Proceeds to implementation after skill application (or skip)
  - [ ] Integration does not block if no skills found
  - [ ] Logging: records which skill applied (if any) in ticket notes
- **Effort:** 5 story points (20 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILLS-005
- **Priority:** P1 (High)

**[SKILLS-010] Implement Enforcement Agent Validation**

- **Description:** After skill application in /sage.implement, automatically run enforcement agents specified in skill's validated_by field. Call /sage.enforce for each agent, display results, fail if validation fails.
- **Acceptance:**
  - [ ] Extracts validated_by[] from skill YAML frontmatter with yq
  - [ ] After skill applied, displays: "Running validation agents..."
  - [ ] For each agent in validated_by[]: calls /sage.enforce --pipeline=<agent>
  - [ ] Displays: "→ <agent>" before running
  - [ ] Displays agent output (pass/fail)
  - [ ] If any agent fails: displays error, offers retry or skip
  - [ ] If all agents pass: displays "✅ Validation passed"
  - [ ] Continues to implementation only if validation passes or user skips
  - [ ] Logs validation results in ticket metadata
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILLS-005
- **Priority:** P1 (High)

---

### Phase 4: Testing & Documentation (Sprint 2, 8 story points)
**Goal:** Quality assurance and user documentation
**Deliverable:** Test suite and comprehensive docs

#### Tasks

**[SKILLS-011] Create Test Suite**

- **Description:** Write unit tests for skill commands and integration tests for workflows. Test skill display, search (with filters), creation, prerequisite validation, enforcement integration. Cover edge cases (missing skills, invalid categories, missing tools).
- **Acceptance:**
  - [ ] Unit test: /sage.skill displays skill correctly
  - [ ] Unit test: /sage.skill --apply validates prerequisites
  - [ ] Unit test: /sage.skill-search finds skills by query
  - [ ] Unit test: /sage.skill-search --category filters correctly
  - [ ] Unit test: /sage.skill-search --language filters correctly
  - [ ] Unit test: /sage.skill-add creates skill from template
  - [ ] Unit test: Placeholder substitution works
  - [ ] Integration test: /sage.implement suggests skills based on ticket type
  - [ ] Integration test: Enforcement agents run after skill application
  - [ ] Edge case test: Skill not found (clear error)
  - [ ] Edge case test: Invalid category in /sage.skill-add
  - [ ] Edge case test: Missing prerequisite tools
  - [ ] 80%+ code coverage
- **Effort:** 5 story points (20 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILLS-010
- **Priority:** P1 (High)

**[SKILLS-012] Create Documentation and Skill Writing Guide**

- **Description:** Document all 3 skill commands in individual command files. Create skill writing guide explaining template structure, evidence requirements, validation setup. Add examples for each command. Document integration with /sage.implement.
- **Acceptance:**
  - [ ] commands/sage.skill.md fully documented with usage examples
  - [ ] commands/sage.skill-search.md fully documented
  - [ ] commands/sage.skill-add.md fully documented
  - [ ] Skill writing guide created: .sage/agent/skills/WRITING-SKILLS.md
  - [ ] Writing guide covers: Template structure, evidence sources, validation setup, common pitfalls
  - [ ] 3+ examples per command in documentation
  - [ ] Integration with /sage.implement documented
  - [ ] Best practices: When to create new skills vs use existing
  - [ ] Contribution guide for community skills
  - [ ] FAQ section covering common questions
- **Effort:** 3 story points (12 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILLS-009
- **Priority:** P1 (Medium)

---

## Critical Path

```plaintext
CONTEXT-002 → SKILLS-002 → SKILLS-003 → SKILLS-004 → SKILLS-005 → SKILLS-009 → SKILLS-011
              (2d)         (3d)          (8d)          (5d)          (5d)          (5d)
                                    [28 days / 4 weeks]
```

**Bottlenecks:**
- CONTEXT-002: External dependency (blocks start)
- SKILLS-004: Highest effort (8 SP), quality-critical
- SKILLS-005: Blocks integration work
- SKILLS-009: Complex integration logic

**Parallel Tracks:**
- Commands: SKILLS-005, 006, 007 can be built in parallel after SKILLS-004
- Validation: SKILLS-008 can run parallel with command development
- Integration: SKILLS-010 can run parallel with SKILLS-009 if interfaces defined

---

## Quick Wins (Week 1)

1. **SKILLS-002 (Directory Structure)** - Unblocks all work
2. **SKILLS-003 (Template)** - Enables parallel skill creation
3. **SKILLS-006 (Search)** - Quick value, independent

---

## Risk Mitigation

| Task | Risk | Mitigation | Contingency |
|------|------|------------|-------------|
| SKILLS-004 | Seed skills low quality | Peer review, iterate with team feedback | Start with 3 skills instead of 5, add more later |
| SKILLS-009 | Integration breaks /sage.implement | Careful testing, make suggestions optional | Make skill suggestions manual command, defer integration |
| SKILLS-010 | Enforcement agents not available | Check agent availability before validation | Skip validation if agents missing, log warning |
| SKILLS-011 | Community adoption low | Focus on internal value first, marketing later | Document internal wins, share externally when mature |

---

## Testing Strategy

### Automated Testing Tasks
- **SKILLS-011 (Test Suite)** - 5 SP, Sprint 2

### Quality Gates
- All 5 seed skills peer-reviewed and validated
- All 3 commands working correctly
- Integration with /sage.implement tested
- 80%+ code coverage

---

## Team Allocation

**Backend (1 engineer)**
- Directory structure (SKILLS-002)
- Template design (SKILLS-003)
- Seed skills (SKILLS-004)
- Commands (SKILLS-005, 006, 007)
- Prerequisite validation (SKILLS-008)
- Integration (SKILLS-009, 010)
- Testing (SKILLS-011)
- Documentation (SKILLS-012)

**Optional: Content Contributor (0.5 engineer)**
- Help research and write seed skills (SKILLS-004)
- Review skills for quality and accuracy

---

## Sprint Planning

**2-week sprints, ~22 SP per sprint (for 1 engineer)**

| Sprint | Focus | Story Points | Key Deliverables |
|--------|-------|--------------|------------------|
| Sprint 1 (Week 1-2) | Foundation + Commands | 27 SP | Directory structure, template, 5 seed skills, 3 commands, prerequisite validation |
| Sprint 2 (Week 3-4) | Integration + Quality | 16 SP | /sage.implement integration, enforcement validation, tests, docs |

**Note:** Sprint 1 is over-allocated (27 SP). Either:
- Extend to 3 weeks total
- Reduce seed skills from 5 to 3 in Sprint 1, add 2 more in Sprint 2
- Add 0.5 engineer for skill creation in Sprint 1

---

## Task Import Format

CSV export for project management tools:
```csv
ID,Title,Description,Estimate,Priority,Dependencies,Sprint
SKILLS-002,Skills Directory,Create skills directory structure,2,P0,CONTEXT-002,1
SKILLS-003,Skill Template,Design skill template with YAML,3,P0,SKILLS-002,1
SKILLS-004,Seed Skills,Create 5 high-quality seed skills,8,P0,SKILLS-003,1
SKILLS-005,Skill Command,Display and apply skills,5,P0,SKILLS-004,1
SKILLS-006,Skill Search,Search skills with filters,3,P0,SKILLS-004,1
SKILLS-007,Skill Add,Create new skills from template,3,P0,SKILLS-003,1
SKILLS-008,Prerequisite Validation,Validate tool and knowledge prerequisites,3,P1,SKILLS-005,1
SKILLS-009,Implement Integration,Suggest skills in /sage.implement,5,P1,SKILLS-005,2
SKILLS-010,Enforcement Validation,Run enforcement agents after skill,3,P1,SKILLS-005,2
SKILLS-011,Test Suite,Unit and integration tests,5,P1,SKILLS-010,2
SKILLS-012,Documentation,Command docs and writing guide,3,P1,SKILLS-009,2
```

---

## Appendix

**Estimation Method:** Planning Poker with reference to existing tickets
**Story Point Scale:** Fibonacci (1,2,3,5,8,13,21)
**Definition of Done:**
- Code reviewed and approved
- Tests written and passing (80%+ coverage)
- Documentation updated
- All seed skills peer-reviewed
- Integration with /sage.implement validated

**Parent Ticket:** To be created during /sage.migrate as SKILLS-001 (epic)

**Related Specifications:**
- docs/specs/skills-library/spec.md
- docs/specs/skills-library/plan.md

**Blocks:**
- None (Phase 2 feature, enables better development practices)

**Blocked By:**
- CONTEXT-002 (Initialize .sage/agent/ Directory)
