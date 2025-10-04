---
allowed-tools: Bash(find:*), Bash(cat:*), Bash(grep:*), Bash(fd:*), Bash(git:*), Bash(ls:*), SequentialThinking
description: Analyze project progress across documentation, phases, and codebase to report completed, in-progress, and not-yet-started work.
---

## Role

Project analyst generating comprehensive progress reports from documentation, tasks, and codebase state.

## Purpose

Provide high-level visibility into project status by analyzing:

- **Ticket State Distribution**: Aggregate by UNPROCESSED/IN_PROGRESS/DEFERRED/COMPLETED
- **Component Health**: Per-component ticket completion metrics
- **Velocity Metrics**: Tickets completed per timeframe
- **Dependency Analysis**: Blocked tickets and dependency chains
- **Deferred Tickets**: Tickets needing attention with reasons
- **Next Actions**: Prioritized recommendations based on ticket queue

## Execution

### 1. Load Ticket System

```bash
# Verify ticket system exists
test -f tickets/index.json || echo "ERROR: No ticket system found"

# Load ticket index
cat tickets/index.json

# Count ticket markdown files
ls tickets/*.md | wc -l
```

**Key Actions:**
- Verify `tickets/index.json` exists
- Load full ticket graph
- Validate ticket structure
- Prepare for analysis

### 2. Aggregate Ticket States

```bash
# Count tickets by state
cat tickets/index.json | jq -r '
  .tickets |
  group_by(.state) |
  map({state: .[0].state, count: length}) |
  .[]
'

# Calculate percentages
TOTAL=$(cat tickets/index.json | jq '.tickets | length')
COMPLETED=$(cat tickets/index.json | jq '[.tickets[] | select(.state == "COMPLETED")] | length')
IN_PROGRESS=$(cat tickets/index.json | jq '[.tickets[] | select(.state == "IN_PROGRESS")] | length')
DEFERRED=$(cat tickets/index.json | jq '[.tickets[] | select(.state == "DEFERRED")] | length')
UNPROCESSED=$(cat tickets/index.json | jq '[.tickets[] | select(.state == "UNPROCESSED")] | length')
```

**Key Actions:**
- Count tickets by state
- Calculate state distribution percentages
- Identify overall completion rate
- Detect bottlenecks (high IN_PROGRESS or DEFERRED counts)

### 3. Component Analysis

```bash
# Group tickets by component (first part of ID)
cat tickets/index.json | jq -r '
  .tickets |
  group_by(.id | split("-")[0]) |
  map({
    component: .[0].id | split("-")[0],
    total: length,
    completed: [.[] | select(.state == "COMPLETED")] | length
  }) |
  .[]
'
```

**Key Actions:**
- Extract component prefix from ticket IDs (AUTH, DB, UI, etc.)
- Count total tickets per component
- Calculate completion rate per component
- Identify components with no progress
- Highlight fully completed components

### 4. Analyze Dependencies and Blockers

```bash
# Find UNPROCESSED tickets with unmet dependencies
cat tickets/index.json | jq -r '
  .tickets[] |
  select(.state == "UNPROCESSED") |
  select(.dependencies | length > 0) |
  select(
    any(.dependencies[];  . as $dep |
      any($index.tickets[]; .id == $dep and .state != "COMPLETED")
    )
  ) |
  .id
'

# List DEFERRED tickets with reasons
cat tickets/index.json | jq -r '
  .tickets[] |
  select(.state == "DEFERRED") |
  "\(.id): \(.title) - \(.notes // "No reason provided")"
'
```

**Key Actions:**
- Identify blocked UNPROCESSED tickets
- Extract dependency chains
- List DEFERRED tickets with deferral reasons
- Calculate critical path impact

### 5. Calculate Velocity Metrics

```bash
# Tickets completed in last 7 days
cat tickets/index.json | jq -r '
  .tickets[] |
  select(.state == "COMPLETED") |
  select(.updated >= (now - 604800 | strftime("%Y-%m-%dT%H:%M:%SZ"))) |
  .id
' | wc -l

# Average ticket duration (completed tickets only)
# Parse created and updated timestamps, calculate delta
```

**Key Actions:**
- Count tickets completed in last 7 days
- Calculate average ticket completion time
- Determine velocity trend (increasing/decreasing)
- Project completion date for remaining tickets

### 6. Progress Report Generation

Using `SequentialThinking` to:
- Synthesize all collected data
- Calculate overall completion percentage
- Identify critical path blockers
- Determine next UNPROCESSED ticket to work on
- Generate actionable recommendations

**Output:** `TEMP_DOCS/PROGRESS_REPORT.md`

## Report Template

````markdown
# Project Progress Report

**Generated:** <YYYY-MM-DD HH:MM>
**Project:** [Project Name]
**Overall Progress:** [XX%] ✅ COMPLETED | [XX%] 🔄 IN_PROGRESS | [XX%] ⚠️ DEFERRED | [XX%] 📋 UNPROCESSED

---

## 📊 Executive Summary

**Status:** [On Track | At Risk | Delayed]

**Ticket Metrics:**
- Total Tickets: [count]
- COMPLETED: [count] ✅ ([XX%])
- IN_PROGRESS: [count] 🔄 ([XX%])
- DEFERRED: [count] ⚠️ ([XX%])
- UNPROCESSED: [count] 📋 ([XX%])

**Velocity:**
- Last 7 Days: [X] tickets completed
- Average Duration: [Y] hours per ticket
- Projected Completion: [Date] (based on current velocity)

**Current Focus:** [Tickets currently IN_PROGRESS]

**Top Achievements:**
1. [Recent completed tickets]
2. [Component milestones]
3. [Unblocked dependencies]

**Critical Blockers:**
1. [DEFERRED tickets]
2. [Blocked UNPROCESSED tickets]

---

## 🎯 Phase Progress

### Phase 0: Foundation
**Status:** ✅ Completed | 🔄 In Progress | 📋 Not Started | ⚠️ Blocked
**Progress:** [XX%] ([X]/[Y] tasks completed)
**Timeline:** Week 1-3 | **Actual:** [status]

**Completed:**
- ✅ Task 1
- ✅ Task 2

**In Progress:**
- 🔄 Task 3 (Owner: [name], Since: [date])

**Not Started:**
- 📋 Task 4
- 📋 Task 5

**Implementation Status:**
- Branch: `feature/foundation` | Commits: [count] | Tests: [passing/total]

---

### Phase 1: Core MVP
**Status:** 🔄 In Progress
**Progress:** [XX%] ([X]/[Y] tasks completed)
**Timeline:** Week 4-10 | **Actual:** Week 5 (on track)

[Similar structure as Phase 0]

---

[Repeat for all phases...]

---

## 🔧 Component Progress

### Component A: [Name]
📁 [Spec](docs/specs/component-a/spec.md) | [Plan](docs/specs/component-a/plan.md) | [Tasks](docs/specs/component-a/tasks.md)

**Status:** 🔄 In Progress ([XX%] complete)
**Tasks:** [X]/[Y] completed
**Phase:** Phase 1 - Core MVP

**Progress Details:**
- ✅ [Completed task 1]
- ✅ [Completed task 2]
- 🔄 [In-progress task] (Since: [date])
- 📋 [Not started task]

**Implementation:**
- Files Implemented: [X]/[Y]
- Tests: [X]/[Y] passing
- Branch: `feature/component-a`

**Blockers:**
- ⚠️ [Blocker description] (Blocking: [task ID])

---

### Component B: [Name]
[Similar structure as Component A]

---

[Repeat for all components...]

---

## 📈 Task Completion Trends

**Last 7 Days:**
- Tasks Completed: [count]
- Average Velocity: [X] tasks/day

**By Priority:**
- P0 (Critical): [X]/[Y] completed ([XX%])
- P1 (High): [X]/[Y] completed ([XX%])
- P2 (Medium): [X]/[Y] completed ([XX%])
- P3 (Low): [X]/[Y] completed ([XX%])

**By Component:**
```
Component A  ████████████░░░░░░░░  60%
Component B  ███████████████░░░░░  75%
Component C  ████░░░░░░░░░░░░░░░░  20%
Component D  ██████████████████░░  90%
```

---

## 🚧 Active Implementation

**Current Feature Branches:**
- `feature/authentication` - Last commit: [date] ([commit message])
- `feature/user-management` - Last commit: [date] ([commit message])

**Recent Commits (Last 7 Days):**
1. `[hash]` - [commit message] ([author], [date])
2. `[hash]` - [commit message] ([author], [date])

**Merged This Week:**
- ✅ `feature/foundation` → main ([X] tasks)
- ✅ `feature/ci-setup` → main ([X] tasks)

**Stale Branches (>2 weeks without commits):**
- ⚠️ `feature/old-feature` - Last commit: [date]

---

## ⚠️ Blockers & Risks

### Critical Blockers
| Blocker | Impact | Component | Blocking Tasks | Owner | Since |
|---------|--------|-----------|----------------|-------|-------|
| [Description] | High | Component A | [Task IDs] | [Owner] | [Date] |

### At-Risk Items
| Item | Risk Level | Reason | Mitigation |
|------|------------|--------|------------|
| Phase 2 Timeline | Medium | Dependency delays | [Action plan] |

### Dependencies
| Component | Depends On | Status | ETA |
|-----------|------------|--------|-----|
| Component B | Component A - Task 1.3 | 🔄 In Progress | [Date] |

---

## 🎯 Recommendations

### Immediate Actions (Next 3 Days)
1. **[Action 1]** - Unblock [task/component] by [specific action]
2. **[Action 2]** - Complete [critical task] to stay on timeline
3. **[Action 3]** - Review and merge [feature branch]

### Short-Term Actions (Next 2 Weeks)
1. **[Action 1]** - Begin Phase X implementation
2. **[Action 2]** - Address technical debt in [component]
3. **[Action 3]** - Update documentation for [area]

### Next Phase to Start
**Phase [X]: [Name]**
- Prerequisites: [List dependencies]
- Ready to Start: [Yes/No]
- Recommended Start Date: [Date]
- Run: `/implement [phase-name]`

---

## 📋 Documentation Status

**Available Documentation:**
- ✅ System Blueprint (`docs/blueprint.md`)
- ✅ Component Specifications ([count] files)
- ✅ Implementation Plans ([count] files)
- ✅ Task Breakdowns ([count] files)
- ✅ Technical Breakdowns ([count] files)

**Missing Documentation:**
- ⚠️ [Component X] - Missing breakdown
- ⚠️ [Component Y] - Tasks need update

---

## 🔄 Next Steps

**To Continue Development:**
```bash
# Start next phase
/implement [next-phase-name]

# Update specific component
/specify && /plan && /tasks

# Commit completed work
/commit

# Generate updated blueprint
/blueprint
```

**To Address Blockers:**
1. [Specific action for blocker 1]
2. [Specific action for blocker 2]

**To Improve Velocity:**
1. [Recommendation 1]
2. [Recommendation 2]

---

## 📅 Timeline Health

**Original Estimate:** [X] weeks
**Current Progress:** Week [Y]
**Projected Completion:** Week [Z]
**Variance:** [+/- X weeks] ([On Track | Ahead | Behind])

**Critical Path Status:** [On Track | At Risk | Delayed]

---

## 🎉 Recent Wins

- ✅ [Accomplishment 1] ([date])
- ✅ [Accomplishment 2] ([date])
- ✅ [Accomplishment 3] ([date])

---

## 📊 Appendix

**Component Summary:**
- Total Components: [count]
- Completed: [count] ✅
- In Progress: [count] 🔄
- Not Started: [count] 📋

**Task Summary:**
- Total Tasks: [count]
- Completed: [count] ([XX%])
- In Progress: [count] ([XX%])
- Not Started: [count] ([XX%])
- Blocked: [count] ([XX%])

**Git Summary:**
- Total Commits: [count]
- Feature Branches: [count]
- Merged PRs: [count]
- Pending PRs: [count]
````

## Progress Categories

### Status Indicators

- ✅ **Completed:** All tasks done, tests passing, merged to main
- 🔄 **In Progress:** Tasks started, feature branch exists, implementation underway
- 📋 **Not Started:** No tasks completed, no implementation begun
- ⚠️ **Blocked:** Dependencies incomplete, waiting on external factors
- 🔴 **At Risk:** Behind schedule, missing dependencies, stalled

### Completion Calculation

- **Phase:** (Completed Tasks / Total Tasks) × 100
- **Component:** (Completed Tasks / Total Component Tasks) × 100
- **Overall:** (Completed Tasks Across All Components / Total Tasks) × 100

### Velocity Metrics

- **Daily Velocity:** Tasks completed per day (7-day average)
- **Sprint Velocity:** Tasks completed per sprint
- **Trend:** Increasing, Stable, or Decreasing velocity

## Ticket-Based Progress Metrics

**Key Additions for Ticket System:**

### State Distribution
```
COMPLETED   ████████████░░░░░░░░  60%
IN_PROGRESS ███░░░░░░░░░░░░░░░░░  15%
DEFERRED    ██░░░░░░░░░░░░░░░░░░  10%
UNPROCESSED ███░░░░░░░░░░░░░░░░░  15%
```

### Component Breakdown
```
AUTH  ████████████████░░░░  80% (8/10 tickets)
DB    ████████████████████  100% (5/5 tickets)
UI    ████████░░░░░░░░░░░░  40% (4/10 tickets)
API   ██████░░░░░░░░░░░░░░  30% (3/10 tickets)
```

### Dependency Graph Visualization
```
DB-001 (COMPLETED)
  ↓
AUTH-001 (COMPLETED)
  ↓
AUTH-002 (IN_PROGRESS)
  ├→ UI-001 (UNPROCESSED - blocked)
  └→ API-001 (UNPROCESSED - blocked)

UI-003 (DEFERRED - missing design assets)
```

## Integration Points

**Inputs:**
- `tickets/index.json` - Ticket states and metadata
- `tickets/*.md` - Per-ticket details
- Git repository state - Branches, commits for tickets

**Outputs:**
- `TEMP_DOCS/PROGRESS_REPORT.md` - Comprehensive progress report with ticket metrics

**Workflow Position:**
- **After:** `/implement` (track ticket completion)
- **During:** `/stream` (cycle progress updates)
- **Before:** `/commit`, sprint planning, stakeholder updates
- **Frequency:** After each ticket completion, daily, or on-demand

## Error Scenarios and Recovery

### Missing Blueprint

```bash
# Check if blueprint exists
test -f docs/blueprint.md || echo "No blueprint found"
```

**Action:** Report warning, analyze components individually

### No Task Files

```bash
# Check for task files
fd -t f "tasks.md" docs/specs/ | wc -l
```

**Action:** Report progress based on git commits and branches only

### Git Repository Issues

```bash
# Verify git repo
git rev-parse --git-dir 2>/dev/null
```

**Action:** Skip git-based metrics, focus on documentation analysis

### Empty Documentation

```bash
# Check for any specs
ls docs/specs/ 2>/dev/null | wc -l
```

**Action:** Report that project documentation needs initialization

## Success Criteria

- [ ] All phases identified and analyzed
- [ ] Task completion accurately calculated
- [ ] Component progress clearly reported
- [ ] Git implementation status included
- [ ] Blockers and risks highlighted
- [ ] Actionable recommendations provided
- [ ] Visual progress indicators clear
- [ ] Report generated in TEMP_DOCS/

## Usage Examples

```bash
# Generate current progress report
/progress

# After implementing a phase
/implement authentication-phase
/progress  # See updated progress

# Before sprint planning
/progress  # Review what's completed and what's next

# Weekly status check
/progress  # Track velocity and identify blockers
```

## Key Features

- **Automated Analysis:** No manual status updates needed
- **Multi-Source Data:** Combines docs, tasks, git, and code
- **Actionable Output:** Clear next steps and priorities
- **Visual Progress:** Progress bars and status indicators
- **Blocker Detection:** Identifies stalled work and dependencies
- **Trend Analysis:** Velocity and completion trends
- **Executive-Friendly:** High-level summary for stakeholders
- **Developer-Friendly:** Detailed task and implementation status
