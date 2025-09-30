---
allowed-tools: Bash(find:*), Bash(cat:*), Bash(grep:*), Bash(fd:*), Bash(git:*), Bash(ls:*), SequentialThinking
description: Analyze project progress across documentation, phases, and codebase to report completed, in-progress, and not-yet-started work.
---

## Role

Project analyst generating comprehensive progress reports from documentation, tasks, and codebase state.

## Purpose

Provide high-level visibility into project status by analyzing:

- **Documentation Progress**: Phase completion from roadmap
- **Task Completion**: Checkbox tracking across all task files
- **Implementation Status**: Code completion via git branches and commits
- **Component Health**: Per-component progress metrics
- **Blockers & Risks**: Incomplete dependencies and stalled work
- **Next Actions**: Prioritized recommendations

## Execution

### 1. Documentation Discovery

```bash
# Find roadmap for phase structure
fd -t f "roadmap.md" docs/

# Find all task files
fd -t f "tasks.md" docs/specs/

# Find all spec files
fd -t f "spec.md" docs/specs/

# Find breakdown files
fd -t f "breakdown.md" docs/breakdown/
```

**Key Actions:**

- Locate `docs/roadmap.md` for phase definitions
- Discover all component task files
- Identify specification and breakdown files
- Build inventory of project documentation

### 2. Phase Analysis

```bash
# Extract phase definitions and status from roadmap
cat docs/roadmap.md | grep -E "^## Phase|^###|^- \[[ x]\]"

# Count total phases
grep -c "^## Phase" docs/roadmap.md
```

**Key Actions:**

- Parse phase names and descriptions
- Extract phase milestones and deliverables
- Identify phase dependencies
- Calculate phase completion percentages

### 3. Task Progress Analysis

```bash
# Count completed tasks across all task files
find docs/specs -name "tasks.md" -exec grep -c "\[x\]" {} \; | awk '{sum+=$1} END {print sum}'

# Count incomplete tasks
find docs/specs -name "tasks.md" -exec grep -c "\[ \]" {} \; | awk '{sum+=$1} END {print sum}'

# Find tasks marked as in progress
grep -r "(In Progress)" docs/specs/*/tasks.md

# Find completed tasks
grep -r "(Completed)" docs/specs/*/tasks.md
```

**Key Actions:**

- Count completed vs incomplete tasks
- Identify tasks with status labels
- Calculate completion percentages per component
- Detect stalled tasks (no recent updates)

### 4. Component Analysis

```bash
# List all components
ls -1 docs/specs/

# Per-component task analysis
for dir in docs/specs/*/; do
  component=$(basename "$dir")
  total=$(grep -c "\[" "$dir/tasks.md" 2>/dev/null || echo 0)
  done=$(grep -c "\[x\]" "$dir/tasks.md" 2>/dev/null || echo 0)
  echo "$component: $done/$total tasks completed"
done
```

**Key Actions:**

- List all components with task counts
- Calculate per-component completion rates
- Identify components with no progress
- Highlight fully completed components

### 5. Implementation Status

```bash
# List all feature branches
git branch -a | grep "feature/"

# Get recent commits
git log --oneline --since="1 week ago"

# Check current branch
git branch --show-current

# Find unmerged branches
git branch --no-merged main
```

**Key Actions:**

- Map feature branches to phases
- Identify active implementation work
- Check for stale branches
- Validate merged vs pending work

### 6. Codebase Validation

```bash
# Check if implementation files exist from breakdowns
find docs/breakdown -name "breakdown.md" -exec grep -h "File:" {} \;

# Verify existence of specified files
# (Extract file paths from breakdowns and check if they exist)
```

**Key Actions:**

- Extract expected file paths from breakdowns
- Verify which files are implemented
- Identify missing implementations
- Cross-reference with git history

### 7. Progress Report Generation

Using `SequentialThinking` to:

- Synthesize all collected data
- Calculate overall completion percentage
- Identify critical path blockers
- Determine next highest-priority actions
- Generate actionable recommendations

**Output:** `TEMP_DOCS/PROGRESS_REPORT.md`

## Report Template

````markdown
# Project Progress Report

**Generated:** <YYYY-MM-DD HH:MM>
**Project:** [Project Name]
**Overall Progress:** [XX%] ✅ Completed | [XX%] 🔄 In Progress | [XX%] 📋 Not Started

---

## 📊 Executive Summary

**Status:** [On Track | At Risk | Delayed]

**Key Metrics:**
- Total Phases: [count]
- Completed Phases: [count] ✅
- In-Progress Phases: [count] 🔄
- Total Tasks: [count]
- Completed Tasks: [count] ([XX%])
- Active Feature Branches: [count]

**Current Focus:** [Phase name and key activities]

**Top Achievements:**
1. [Achievement 1]
2. [Achievement 2]
3. [Achievement 3]

**Critical Blockers:**
1. [Blocker 1]
2. [Blocker 2]

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
- ✅ System Roadmap (`docs/roadmap.md`)
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

# Generate updated roadmap
/devflow
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

## Integration Points

**Inputs:**

- `docs/roadmap.md` - Phase structure and milestones
- `docs/specs/*/tasks.md` - Task completion tracking
- `docs/specs/*/spec.md` - Component definitions
- `docs/breakdown/*/breakdown.md` - Implementation expectations
- Git repository state - Branches, commits, merges

**Outputs:**

- `TEMP_DOCS/PROGRESS_REPORT.md` - Comprehensive progress report

**Workflow Position:**

- **After:** `/implement` (track implementation progress)
- **Before:** Sprint planning, status meetings, stakeholder updates
- **Frequency:** Daily, weekly, or on-demand

## Error Scenarios and Recovery

### Missing Roadmap

```bash
# Check if roadmap exists
test -f docs/roadmap.md || echo "No roadmap found"
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
