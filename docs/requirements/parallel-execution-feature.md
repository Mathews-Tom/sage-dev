# Parallel Execution Feature Requirements

**Feature ID:** PAR-001
**Created:** 2025-10-06
**Status:** Implemented
**Priority:** High

## Background

When running `/stream --dry-run`, the system recommends:

```
🎯 Recommended Next Actions
  4. Parallel development:
    - Team 1: Agent Runtime (ART-*)
    - Team 2: CLI Layer (CLI-*)
    - Team 3: Gateway/Integration/Orchestration
```

However, the system only supports sequential ticket processing. For large ticket queues (20+ tickets), this creates a bottleneck where independent tickets must wait unnecessarily.

## Problem Statement

The `/stream` command processes tickets one at a time, even when multiple tickets have:

- No interdependencies
- Independent file changes
- Satisfied or no dependencies

This results in:

- **Long cycle times**: 10-20 tickets taking 2-4 hours
- **Underutilized resources**: CPU and API capacity unused
- **Delayed delivery**: Sequential bottleneck for parallel-safe work

## User Story

**As a** developer with a large ticket queue
**I want to** process multiple independent tickets concurrently
**So that** I can reduce development cycle time by 2-3×

## Functional Requirements

### FR1: Parallel Mode Flag

- `/stream` accepts `--parallel=N` flag (N = worker count)
- `/stream` accepts `--parallel=auto` for auto-detection
- Parallel mode requires `--auto` mode (not compatible with interactive)
- Default behavior remains sequential (backward compatible)

### FR2: Dependency Graph Analysis

- Build dependency graph from `.sage/tickets/index.json`
- Detect circular dependencies (fail fast if found)
- Identify tickets with satisfied dependencies
- Group independent tickets into parallel-safe batches

### FR3: Batch Execution

- Launch N sub-agents concurrently (one per ticket)
- Monitor worker progress in real-time
- Aggregate results (completed/deferred counts)
- Process commits sequentially after batch completes

### FR4: Commit Serialization

- Queue commits from parallel workers
- Apply commits sequentially to avoid conflicts
- Use file locking to prevent race conditions
- Handle merge conflicts gracefully

### FR5: Worker Allocation

- Manual: `--parallel=3` uses exactly 3 workers
- Auto: `--parallel=auto` detects CPU count (CPU/2, capped 1-8)
- Cap at available unprocessed tickets
- Validate worker count is reasonable

## Non-Functional Requirements

### NFR1: Performance

- Target: 2-3× faster than sequential for 10+ tickets
- Overhead: < 5s for dependency graph analysis
- Commit serialization: < 2-5s per batch

### NFR2: Reliability

- No data loss on worker failure
- Graceful degradation to sequential on errors
- Preserve all sequential mode guarantees

### NFR3: Compatibility

- Backward compatible with existing workflows
- No changes to ticket schema required
- Works with all existing validation types

### NFR4: Observability

- Display batch progress in real-time
- Show worker allocation and status
- Report parallelization efficiency metrics
- Log velocity improvements

## Technical Constraints

### TC1: API Rate Limits

- Concurrent API calls may hit rate limits
- System must handle throttling gracefully
- Token usage N× higher in parallel mode

### TC2: File System Locks

- Commit queue requires file locking
- macOS/Linux compatible locking mechanism
- Lock timeout: 5 minutes max

### TC3: Dependency Resolution

- Must handle complex dependency graphs
- Topological sort for batch ordering
- No false positives (over-serialization acceptable)

## Success Criteria

✅ **Functional:**

- Process 9 independent tickets in ~18 minutes (vs ~55 sequential)
- Handle dependency graphs correctly
- Serialize commits without conflicts
- Auto-detect optimal worker count

✅ **Quality:**

- Pass all existing tests
- No regressions in sequential mode
- Validate parallel prerequisites on `/validate`
- Comprehensive documentation and examples

✅ **User Experience:**

- Clear error messages for invalid usage
- Progress indicators during execution
- Efficiency metrics in final summary
- Warnings for high token usage

## Out of Scope

❌ Interactive mode parallel execution (requires sequential for confirmations)
❌ Cross-machine distributed execution
❌ Automatic retry on API rate limit errors
❌ Parallel execution within single ticket (sub-task parallelization)

## Acceptance Criteria

1. `/ stream --auto --parallel=3` processes 3 tickets concurrently
2. `/stream --auto --parallel=auto` auto-detects worker count
3. Dependency graph correctly identifies independent tickets
4. Commits are applied sequentially without conflicts
5. `/validate` checks for parallel mode prerequisites
6. Documentation includes 4+ examples of parallel usage
7. Performance improvement 2-3× for independent ticket queues

## Dependencies

- **Requires:** jq (JSON processing)
- **Requires:** bash 4+ (associative arrays)
- **Requires:** File locking support (flock or mkdir atomic)
- **Uses:** Existing Task tool for sub-agent spawning

## Implementation Notes

- Two new library files: `parallel-scheduler.sh`, `commit-queue.sh`
- Updates to: `stream.md`, `EXAMPLES.md`, `SAGE_DEV_COMMANDS.md`, `validate.md`
- New sections in `stream.md` for parallel execution flow
- Validation rules for parallel mode compatibility

## References

- Issue: `/stream --dry-run` recommendation for parallel development
- Related: Ticket Clearance Methodology
- Related: Dependency validation system
- Similar: CI/CD parallel job execution patterns
