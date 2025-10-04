# Command Testing Guide

**Last Updated:** 2025-10-03

This document provides guidance for testing sage-dev commands to ensure reliability and prevent regressions.

---

## Testing Philosophy

Commands are **documentation-driven AI workflows**, not traditional executables. Testing focuses on:

1. **Validation** - Input/output quality checks
2. **Integration** - Command interdependencies
3. **Regression Prevention** - Detecting breaking changes

---

## Built-in Validation Commands

The system includes comprehensive validation commands that serve as the primary testing mechanism:

### `/validate`

**Purpose:** Validate ticket system integrity

**Usage:**

```bash
/validate
```

**Validates:**

- JSON schema correctness
- Required fields presence
- No duplicate IDs
- Valid state values
- Dependency references
- No circular dependencies
- Parent relationships
- Ticket file existence
- Priority values
- Type hierarchy

**Exit Codes:**

- 0 = Valid
- 1 = Invalid (critical errors)
- 2 = Warnings only

### `/quality`

**Purpose:** Validate command output quality

**Usage:**

```bash
/quality                    # All outputs
/quality --command=specify  # Specifications only
/quality --command=plan     # Plans only
/quality --command=tasks    # Tasks only
/quality --strict           # Target 90/100
```

**Validates:**

- Specification completeness (100-point scale)
- Implementation plan quality (100-point scale)
- Task breakdown quality (100-point scale)

**Exit Codes:**

- 0 = Quality threshold met
- 1 = Below threshold

### `/repair`

**Purpose:** Fix common ticket system issues

**Usage:**

```bash
/repair                  # Auto-fix all
/repair --dry-run        # Preview repairs
/repair --deduplicate    # Specific fix
```

**Repairs:**

- Duplicate IDs
- Invalid states
- Missing fields
- Invalid dependencies
- Circular dependencies
- Orphaned tickets
- Missing files
- Non-standard priorities

---

## Testing Workflow

### 1. Pre-Command Validation

Before running commands, validate prerequisites:

```bash
# Before /plan
/quality --command=specify
if [ $? -ne 0 ]; then
  echo "Fix specifications before planning"
  exit 1
fi

# Before /tasks
/quality --command=plan
if [ $? -ne 0 ]; then
  echo "Improve plans before creating tasks"
  exit 1
fi

# Before /migrate
/quality --command=tasks
if [ $? -ne 0 ]; then
  echo "Fix task breakdowns before migration"
  exit 1
fi

# Before /stream or /implement
/validate
if [ $? -ne 0 ]; then
  echo "Fix ticket system before execution"
  exit 1
fi
```

### 2. Post-Command Validation

After running commands, validate outputs:

```bash
# After /specify
/quality --command=specify --strict
# Ensures high-quality specifications

# After /plan
/quality --command=plan --strict
# Ensures comprehensive plans

# After /tasks
/quality --command=tasks --strict
# Ensures complete task breakdowns

# After /migrate
/validate
# Ensures valid ticket system

# After /repair
/validate
# Confirms repairs succeeded
```

### 3. Integration Testing

Test command sequences:

```bash
# Traditional workflow test
/specify && \
/quality --command=specify && \
/plan && \
/quality --command=plan && \
/tasks && \
/quality --command=tasks

# Ticket-based workflow test
/migrate && \
/validate && \
/stream --dry-run && \
/validate
```

---

## Manual Testing Checklist

### Testing `/specify`

- [ ] Run with sample docs in `docs/` folder
- [ ] Verify `docs/specs/*/spec.md` created
- [ ] Check all components have specs
- [ ] Run `/quality --command=specify`
- [ ] Score should be ≥70/100 (standard) or ≥90/100 (strict)

### Testing `/plan`

- [ ] Requires valid specifications
- [ ] Run `/quality --command=specify` first
- [ ] Verify `docs/specs/*/plan.md` created
- [ ] Check technology stacks documented
- [ ] Run `/quality --command=plan`
- [ ] Score should be ≥70/100

### Testing `/tasks`

- [ ] Requires valid plans
- [ ] Run `/quality --command=plan` first
- [ ] Verify `docs/specs/*/tasks.md` created
- [ ] Check tasks have estimates
- [ ] Run `/quality --command=tasks`
- [ ] Score should be ≥70/100

### Testing `/migrate`

- [ ] Requires valid task breakdowns
- [ ] Run `/quality --command=tasks` first
- [ ] Creates `tickets/index.json`
- [ ] Creates `tickets/TICKET-*.md` files
- [ ] Sets `.sage/workflow-mode` to TICKET_BASED
- [ ] Run `/validate` after
- [ ] All validation checks pass

### Testing `/validate`

- [ ] Detects duplicate IDs
- [ ] Detects circular dependencies
- [ ] Detects missing parent references
- [ ] Detects invalid states
- [ ] Detects missing required fields
- [ ] Exit code 0 for valid system
- [ ] Exit code 1 for invalid system

### Testing `/repair`

- [ ] Creates checkpoint before repairs
- [ ] Fixes duplicate IDs
- [ ] Fixes invalid states
- [ ] Removes invalid dependencies
- [ ] Creates missing ticket files
- [ ] Runs validation after repair
- [ ] Preserves checkpoint for rollback

### Testing `/quality`

- [ ] Detects missing descriptions
- [ ] Detects insufficient acceptance criteria
- [ ] Detects missing non-functional requirements
- [ ] Detects incomplete plans
- [ ] Detects tasks without estimates
- [ ] Scores correctly (0-100)
- [ ] Standard mode: 70/100 threshold
- [ ] Strict mode: 90/100 threshold

### Testing `/stream`

- [ ] Requires TICKET_BASED mode
- [ ] Validates ticket system first
- [ ] Interactive mode shows 6 confirmations
- [ ] --dry-run shows preview without changes
- [ ] --auto mode skips confirmations
- [ ] Progress visibility shows stats
- [ ] ETA calculations work
- [ ] Velocity logging works
- [ ] Final summary shows metrics

### Testing `/rollback`

- [ ] Requires checkpoint exists
- [ ] Restores git state
- [ ] Restores tickets/index.json
- [ ] Restores ticket files
- [ ] Restores task files
- [ ] Archives checkpoint after use
- [ ] Logs rollback event

---

## Regression Testing

### Command Outputs Should Not Change

When modifying commands, verify outputs remain consistent:

```bash
# Before modification
/specify
cp -r docs/specs docs/specs.before

# After modification
/specify
diff -r docs/specs.before docs/specs

# No unexpected differences
```

### Validation Rules Should Not Change

Quality scores should remain stable:

```bash
# Run validation before changes
/quality > validation-before.txt

# Make changes to validation logic

# Run validation after changes
/quality > validation-after.txt

# Compare scores
diff validation-before.txt validation-after.txt
```

---

## Error Handling Tests

### Test Invalid Inputs

```bash
# Test missing prerequisites
/plan  # Should fail if no specs exist
/tasks  # Should fail if no plans exist
/migrate  # Should fail if no tasks exist

# Test workflow mode mismatch
echo "TRADITIONAL" > .sage/workflow-mode
/stream  # Should fail with clear error

# Test corrupted ticket system
echo "invalid json" > tickets/index.json
/validate  # Should detect and report error
```

### Test Recovery Scenarios

```bash
# Create checkpoint
echo '{"checkpoint_id": "test"}' > .sage/checkpoint.json

# Test rollback
/rollback --force

# Verify restoration works
```

---

## Continuous Integration

### CI/CD Pipeline Example

```yaml
# .github/workflows/test-commands.yml
name: Command Validation Tests

on: [push, pull_request]

jobs:
  test-commands:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Test Specification Quality
        run: |
          # Assuming sample docs in test fixtures
          /quality --command=specify --strict
          if [ $? -ne 0 ]; then
            echo "Specification quality below threshold"
            exit 1
          fi

      - name: Test Ticket System Validation
        run: |
          # Assuming sample ticket system in test fixtures
          /validate
          if [ $? -ne 0 ]; then
            echo "Ticket validation failed"
            exit 1
          fi

      - name: Test Quality Gates
        run: |
          /quality --strict
          if [ $? -ne 0 ]; then
            echo "Quality gates failed"
            exit 1
          fi
```

---

## Test Fixtures

### Sample Documentation Structure

```text
test-fixtures/
├── docs/
│   ├── auth-spec.md           # Sample authentication docs
│   ├── db-spec.md             # Sample database docs
│   └── api-spec.md            # Sample API docs
├── expected-specs/
│   ├── auth/spec.md           # Expected /specify output
│   ├── db/spec.md
│   └── api/spec.md
├── expected-plans/
│   ├── auth/plan.md           # Expected /plan output
│   └── ...
├── expected-tasks/
│   ├── auth/tasks.md          # Expected /tasks output
│   └── ...
└── sample-tickets/
    ├── index.json             # Sample valid ticket system
    ├── TICKET-001.md
    └── TICKET-002.md
```

---

## Known Limitations

### What Cannot Be Tested

1. **AI Variability** - LLM outputs vary between runs
2. **External Dependencies** - GitHub API, web search results
3. **User Interaction** - Interactive mode confirmations
4. **Execution Time** - Velocity varies by complexity

### Testing Strategies

1. **Focus on Structure** - Validate format, not exact content
2. **Use Quality Scores** - Objective metrics over exact matches
3. **Test Validation Logic** - Ensure validators work correctly
4. **Test Error Paths** - Verify failure handling

---

## Success Metrics

### Command Validation Coverage

- [x] `/validate` - Comprehensive ticket validation
- [x] `/quality` - Output quality validation
- [x] `/repair` - Automated repair with validation
- [x] `/rollback` - State restoration with verification
- [x] `/stream` - Progress tracking and velocity metrics
- [ ] `/specify` - (validated via /quality)
- [ ] `/plan` - (validated via /quality)
- [ ] `/tasks` - (validated via /quality)

### Validation Completeness

- ✅ Ticket system integrity (11 checks)
- ✅ Specification quality (6 checks)
- ✅ Plan quality (5 checks)
- ✅ Task quality (5 checks)
- ✅ Workflow mode validation
- ✅ Checkpoint/rollback safety

---

## Future Enhancements

### Potential Test Additions

1. **Automated Regression Suite**
   - Baseline outputs for comparison
   - Detect unexpected changes
   - CI/CD integration

2. **Performance Tests**
   - Velocity tracking validation
   - ETA accuracy measurement
   - Large-scale ticket processing

3. **Integration Tests**
   - End-to-end workflow tests
   - Multi-command sequences
   - Error propagation

4. **Mock/Stub Framework**
   - Simulate LLM responses
   - Test deterministic paths
   - Reduce test flakiness

---

## Recommendations

### For Developers

1. **Always run validation** after modifying commands
2. **Use strict mode** for production-critical work
3. **Create checkpoints** before experimental changes
4. **Test error paths** explicitly

### For Users

1. **Run /quality** before phase transitions
2. **Run /validate** before /stream
3. **Use --dry-run** for preview
4. **Keep checkpoints** until confident

### For CI/CD

1. **Gate on validation** - Block merges if validation fails
2. **Track quality scores** - Trend analysis over time
3. **Archive test outputs** - For regression comparison
4. **Fail fast** - Validate early in pipeline

---

## Conclusion

The sage-dev command system uses **validation-driven testing** rather than traditional unit tests. The comprehensive validation commands (`/validate`, `/quality`, `/repair`) provide:

- ✅ Objective quality scoring
- ✅ Automated validation
- ✅ Actionable feedback
- ✅ Integration testing support
- ✅ CI/CD compatibility

This approach is appropriate for documentation-driven AI workflows where exact output cannot be predetermined but quality standards can be enforced.

---

**For detailed validation criteria, see:**

- `commands/validate.md`
- `commands/quality.md`
- `commands/repair.md`
