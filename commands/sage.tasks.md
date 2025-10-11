---
allowed-tools: Bash(find:*), Bash(cat:*), Bash(head:*), Bash(tee:*), WebSearch, SequentialThinking
description: Generate SMART task breakdowns from specifications and implementation plans.
---

## Role

Senior project manager creating actionable, estimable task breakdowns.

## Execution

1. **Discover**:

   ```bash
   find docs/specs -type f \( -name "spec.md" -o -name "plan.md" \)
   ```

2. **Analyze**:
   - `cat` spec.md and plan.md files
   - `head -n 50` to preview each file
   - Use `SequentialThinking` to identify dependencies and critical path

3. **Research**: `WebSearch` for:
   - Estimation benchmarks for similar features
   - Common implementation risks and mitigation
   - Team velocity data for technology stack

4. **Generate Task Breakdown**: `tee docs/specs/<component>/tasks.md` per component

5. **Generate Story and Subtask Tickets**:

   ```bash
   # Load .sage/tickets/index.json
   cat .sage/tickets/index.json

   # For each task in tasks.md, create story/subtask ticket
   PARENT_TICKET="AUTH-001"  # Epic from /specify
   TASK_NUMBER="002"
   TICKET_ID="AUTH-${TASK_NUMBER}"

   # Generate story ticket markdown
   tee .sage/tickets/${TICKET_ID}.md <<EOF
   # ${TICKET_ID}: [Task Title]

   **State:** UNPROCESSED
   **Priority:** P0
   **Type:** Story

   ## Description
   [Task description from tasks.md]

   ## Acceptance Criteria
   - [ ] [Criterion from task]
   - [ ] [Criterion from task]

   ## Dependencies
   - #${PARENT_TICKET} (parent epic)
   - #[OTHER-TICKET] (if task depends on another task)

   ## Context
   **Specs:** docs/specs/[component]/spec.md
   **Plans:** docs/specs/[component]/plan.md
   **Tasks:** docs/specs/[component]/tasks.md

   ## Effort
   **Story Points:** [from tasks.md]
   **Estimated Duration:** [from tasks.md]

   ## Progress
   **Notes:** Generated from /tasks command
   EOF

   # Update index.json with:
   # - New ticket entry
   # - parent: PARENT_TICKET
   # - Add ticket ID to parent's children array
   # - dependencies from task breakdown
   ```

6. **Maintain Hierarchy**:
   - Epic (from /specify) → Story (from /tasks) → Subtask (detailed tasks)
   - Update parent epic with children array
   - Link dependencies between related tasks

7. **Validate**: Ensure all phases have measurable deliverables and corresponding tickets

## Task Template

````markdown
# Tasks: [Component Name]

**From:** `spec.md` + `plan.md`  
**Timeline:** [X weeks, Y sprints]  
**Team:** [Size and composition]  
**Created:** <YYYY-MM-DD>

## Summary
- Total tasks: [count]
- Estimated effort: [story points or hours]
- Critical path duration: [weeks]
- Key risks: [top 3]

## Phase Breakdown

### Phase 1: [Name] (Sprint 1-2, X story points)
**Goal:** [Primary objective]  
**Deliverable:** [What gets shipped]

#### Tasks

**[COMP-001] Setup Development Environment**

- **Description:** Configure local dev environment with Docker, dependencies
- **Acceptance:** 
  - [ ] All devs can run app locally
  - [ ] CI pipeline validates setup
- **Effort:** 3 story points (2-3 days)
- **Owner:** DevOps
- **Dependencies:** None
- **Priority:** P0 (Blocker)

**[COMP-002] Database Schema Design**

- **Description:** Implement core data models with migrations
- **Acceptance:**
  - [ ] Migrations run successfully
  - [ ] Seed data loads
  - [ ] Indexes optimized
- **Effort:** 5 story points (3-5 days)
- **Owner:** Backend Engineer
- **Dependencies:** COMP-001
- **Priority:** P0 (Critical)

[Continue pattern for all tasks...]

### Phase 2: [Name] (Sprint 3-4, Y story points)

[Repeat structure...]

## Critical Path

```plaintext
COMP-001 → COMP-002 → COMP-008 → COMP-015 → COMP-023
  (3d)      (5d)        (8d)        (5d)        (3d)
                    [24 days total]
```

**Bottlenecks:**

- COMP-008: Complex integration (highest risk)
- COMP-015: External API dependency

**Parallel Tracks:**

- Frontend: COMP-010, COMP-011, COMP-012
- Testing: COMP-020, COMP-021

## Quick Wins (Week 1-2)

1. **[COMP-003] API Scaffolding** - Unblocks frontend
2. **[COMP-005] Authentication** - Early security validation
3. **[COMP-007] Core Model CRUD** - Demonstrates progress

## Risk Mitigation

| Task | Risk | Mitigation | Contingency |
|------|------|------------|-------------|
| COMP-008 | Third-party API unreliable | Mock data layer, contract testing | Alternative provider researched |
| COMP-015 | Performance issues | Load testing in staging | Caching layer designed |

## Testing Strategy

### Automated Testing Tasks

- **[COMP-050] Unit Test Framework** (2 SP) - Sprint 1
- **[COMP-051] Integration Tests** (5 SP) - Sprint 2-3
- **[COMP-052] E2E Test Suite** (8 SP) - Sprint 3-4

### Quality Gates

- 80% code coverage required
- All critical paths have E2E tests
- Performance tests validate SLOs

## Team Allocation

**Backend (2 engineers)**

- Core API development (COMP-002, COMP-008, COMP-015)
- Database optimization (COMP-022, COMP-023)

**Frontend (1 engineer)**

- UI components (COMP-010-014)
- Integration (COMP-016-018)

**QA (1 engineer)**

- Test automation (COMP-050-052)
- Quality validation (ongoing)

**DevOps (0.5 engineer)**

- Infrastructure (COMP-001, COMP-030)
- CI/CD (COMP-031-033)

## Sprint Planning

**2-week sprints, 40 SP velocity**

| Sprint | Focus | Story Points | Key Deliverables |
|--------|-------|--------------|------------------|
| Sprint 1 | Foundation | 38 SP | Dev env, data models |
| Sprint 2 | Core Features | 42 SP | API endpoints, auth |
| Sprint 3 | Integration | 45 SP | External APIs, frontend |
| Sprint 4 | Hardening | 35 SP | Testing, optimization |

## Task Import Format

CSV export for project management tools:
```csv
ID,Title,Description,Estimate,Priority,Assignee,Dependencies,Sprint
COMP-001,Setup Dev Environment,Configure Docker...,3,P0,DevOps,,1
COMP-002,Database Schema,Implement models...,5,P0,Backend,COMP-001,1
```

## Appendix

**Estimation Method:** Planning Poker with team  
**Story Point Scale:** Fibonacci (1,2,3,5,8,13,21)  
**Definition of Done:**
- Code reviewed and approved
- Tests written and passing
- Documentation updated
- Deployed to staging
````

## Estimation Guidelines

- Use story points (Fibonacci) for agile teams
- Include 20% buffer for unknowns
- Research similar feature estimates
- Front-load risky tasks for early validation

## Ticket Generation Strategy

**Hierarchy:**

```plaintext
Epic (AUTH-001) [from /specify]
  ├─ Story (AUTH-002) [from /tasks - Phase 1, Task 1]
  ├─ Story (AUTH-003) [from /tasks - Phase 1, Task 2]
  │   ├─ Subtask (AUTH-004) [if task needs breakdown]
  │   └─ Subtask (AUTH-005) [if task needs breakdown]
  └─ Story (AUTH-006) [from /tasks - Phase 2, Task 1]
```

**Ticket Attributes:**

- **ID**: Sequential within component (AUTH-002, AUTH-003, etc.)
- **Type**: Story for main tasks, Subtask for detailed breakdowns
- **Parent**: Reference to epic ticket ID
- **Dependencies**: Inter-task dependencies from critical path
- **Priority**: Inherited from epic, adjusted per task importance
- **Effort**: Story points and estimated duration from tasks.md
- **Context**: Links to spec.md, plan.md, tasks.md

**Integration with /implement:**

- `/implement` processes leaf tickets (stories/subtasks without children)
- Dependencies ensure correct execution order
- Completed tickets update parent epic progress
- `/stream` uses ticket graph to auto-sequence work

**Benefits:**

- Atomic work units from SMART task breakdown
- Clear parent-child traceability
- Dependency graph for automated execution
- Progress tracking at epic and story level
