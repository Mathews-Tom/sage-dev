---
allowed-tools: Bash(git:*), Bash(find:*), Bash(cat:*), Bash(grep:*), Bash(mkdir:*), Bash(tee:*), Bash(ls:*), Bash(test:*), Read, Write, Edit, MultiEdit, SequentialThinking
description: Execute phased system implementation with automatic progress tracking, branch management, and test validation.
argument-hint: '[phase-name] (optional, defaults to next incomplete phase)'
---

## Role

Implementation engineer executing phased development from specifications, breakdowns, and roadmaps with comprehensive progress tracking and test validation.

## Purpose

Transform technical documentation into working code through systematic phased implementation:

- **Phase Detection**: Automatically identify next incomplete phase from roadmap or accept user-specified phase
- **Branch Management**: Create and manage feature branches with standardized naming
- **Progress Tracking**: Update task status with checkboxes and labels in real-time
- **Code Implementation**: Generate code based on breakdown specifications
- **Test Creation**: Create and validate tests as success criteria
- **Error Recovery**: Automatic fixes with manual intervention fallback
- **Resumption Support**: Continue from interrupted progress seamlessly

## Execution

### 1. Phase Detection and Validation

```bash
# Parse roadmap.md to identify phases and current status
find docs -name "roadmap.md" -exec cat {} \;

# If user specified phase, validate it exists
# If no phase specified, identify next incomplete phase
grep -E "^## Phase|^\- \[[ x]\]" docs/roadmap.md

# Check for required documentation
find docs/specs -name "tasks.md"
find docs/breakdown -name "breakdown.md"
```

**Key Actions:**
- Parse `docs/roadmap.md` for phase structure and completion status
- Accept optional phase argument or auto-detect next phase
- Validate required documentation exists (specs, breakdown, tasks)
- Confirm phase selection with user if ambiguous

### 2. Branch Management

```bash
# Check current branch
git branch --show-current

# Create feature branch if needed
git checkout -b feature/[phase-name]
```

**Key Actions:**
- Check if current branch is main/master or wrong phase branch
- Generate branch name using `feature/[phase-name]` convention
- Confirm branch name with user before creation
- Switch to appropriate branch for phase implementation

### 3. Progress Analysis and Resumption

```bash
# Parse task files for the phase
find docs/specs -name "tasks.md" -exec grep -l "phase-name" {} \;

# Analyze task completion status
grep -E "\[[ x]\]|\(In Progress\)|\(Completed\)" docs/specs/*/tasks.md
```

**Key Actions:**
- Read relevant `tasks.md` files for the current phase
- Parse existing task completion status (checkboxes and labels)
- Generate progress summary (completed vs remaining tasks)
- Confirm with user which tasks to work on if resuming

### 4. Implementation Logic

```bash
# Read breakdown documentation for implementation guidance
find docs/breakdown -name "breakdown.md" -exec cat {} \;

# Identify files to create/modify based on breakdown
grep -E "File:|API:|Interface:" docs/breakdown/*/breakdown.md
```

**Key Actions:**
- Parse breakdown documentation for technical specifications
- Identify code files to create or modify
- Implement code following breakdown architecture and patterns
- Update imports, dependencies, and configurations as needed
- Follow existing code conventions and patterns

### 5. Task Progress Tracking

```bash
# Update task status in tasks.md files
# Convert [ ] to [x] for completed tasks
# Add status labels: (In Progress), (Completed)
```

**Key Actions:**
- Update task checkboxes: `[ ]` → `[x]` for completed tasks
- Add status labels: `(In Progress)` for current tasks, `(Completed)` for finished tasks
- Preserve existing task structure and formatting
- Track sub-task completion within larger tasks

### 6. Test Creation and Validation

```bash
# Create tests based on breakdown specifications
# Run tests to validate implementation
uv run pytest tests/ -v

# Check test coverage if applicable
uv run pytest --cov=src tests/
```

**Key Actions:**
- Create comprehensive tests for implemented functionality
- Follow testing patterns from breakdown documentation
- Run test suite to validate implementation
- Ensure all tests pass before marking phase complete
- Handle test failures with automatic fixes where possible

### 7. Error Handling and Recovery

**Automatic Fixes:**
- Import errors: Add missing imports
- Syntax errors: Fix common syntax issues
- Test failures: Adjust test expectations for implementation changes
- Configuration issues: Update config files for new components

**Manual Intervention Required:**
- Complex logic errors
- Architecture conflicts
- Breaking API changes
- Database migration issues

### 8. Phase Completion Validation

```bash
# Final validation of phase completion
# Ensure all tasks marked complete
grep -c "\[x\]" docs/specs/*/tasks.md
grep -c "\[ \]" docs/specs/*/tasks.md

# Run full test suite
uv run pytest tests/ -v
```

**Key Actions:**
- Verify all phase tasks are marked as completed
- Confirm all tests pass for the phase
- Validate code quality and adherence to specifications
- Prepare summary of implemented functionality

## Integration Points

**Inputs:**
- `docs/roadmap.md` - Phase structure and completion status
- `docs/specs/*/tasks.md` - Task breakdown and current progress
- `docs/breakdown/*/breakdown.md` - Technical implementation specifications
- Current git branch and repository state

**Outputs:**
- Implemented code files following breakdown specifications
- Updated `tasks.md` files with current progress tracking
- Comprehensive test suite for implemented functionality
- Feature branch ready for review and integration

**Workflow Position:**
- **After**: `/devflow` (roadmap creation)
- **Before**: `/commit` (git operations and PR creation)

## Error Scenarios and Recovery

### Missing Dependencies
```bash
# Check if prior phase files exist
test -f src/component.py || echo "Missing dependency: component.py"
```
**Action**: Confirm with user how to proceed with missing dependencies

### Test Failures
```bash
# Attempt automatic test fixes
# Update test expectations based on implementation
# Fix common assertion errors
```
**Action**: Auto-fix common issues, require manual intervention for complex failures

### Git Conflicts
```bash
# Check for merge conflicts
git status | grep -E "both modified|both added"
```
**Action**: Guide user through conflict resolution

### Invalid Phase Specification
```bash
# Show available phases from roadmap
grep -E "^## Phase" docs/roadmap.md
```
**Action**: Display available phases and prompt for valid selection

## Success Criteria

- [ ] Phase correctly identified and validated
- [ ] Appropriate feature branch created/selected
- [ ] All phase tasks implemented according to breakdown specifications
- [ ] Task progress updated with checkboxes and status labels
- [ ] Comprehensive tests created and passing
- [ ] Code follows existing patterns and conventions
- [ ] Phase marked as completed in tracking system
- [ ] Ready for `/commit` command to create PR

## Usage Examples

```bash
# Auto-detect and implement next phase
/implement

# Implement specific phase
/implement authentication-phase

# Resume implementation of current phase
/implement user-management-phase
```