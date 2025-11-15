# Sage-Dev Workflows Guide

Complete guide for all development workflows supported by Sage-Dev v2.6+.

## Table of Contents

- [Workflow Overview](#workflow-overview)
- [Context Engineering Workflow](#context-engineering-workflow)
- [Traditional Workflow](#traditional-workflow)
- [Ticket-Based Workflow](#ticket-based-workflow)
- [Stream Execution Modes](#stream-execution-modes)
- [Workflow Comparison](#workflow-comparison)
- [Best Practices](#best-practices)
- [Common Scenarios](#common-scenarios)

---

## Workflow Overview

Sage-Dev supports multiple development workflows optimized for different team sizes, project types, and development styles.

```plaintext
                    ┌─────────────────┐
                    │  /sage.workflow │
                    │  (Entry Point)  │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐       ┌──────────▼──────────┐
    │    Traditional    │       │    Ticket-Based     │
    │    (Manual)       │       │    (Automated)      │
    └─────────┬─────────┘       └──────────┬──────────┘
              │                             │
    Manual execution              ┌─────────┴─────────┐
    of each step                  │                   │
                          ┌───────▼─────┐    ┌───────▼───────┐
                          │ Interactive │    │   Automated   │
                          │   Mode      │    │    Modes      │
                          └─────────────┘    └───────┬───────┘
                                                     │
                                          ┌──────────┴─────────┐
                                          │                    │
                                   ┌──────▼──────┐       ┌─────▼──────┐
                                   │  Semi-Auto  │       │    Auto    │
                                   │ 3-5× faster │       │5-10× faster│
                                   └─────────────┘       └──────┬─────┘
                                                                │
                                                         ┌──────▼──────┐
                                                         │   Parallel  │
                                                         │10-20× faster│
                                                         └─────────────┘
```

---

## Context Engineering Workflow

**New in v2.5+** - Research-driven development with complete traceability.

### When to Use

- New features with unclear requirements
- Complex integrations needing best practices research
- Projects requiring full documentation trail
- Teams that value research-backed decisions

### Workflow Steps

```plaintext
/sage.init (once)
    ↓
/sage.workflow
    ↓
/sage.init-feature <name>
    ↓
/sage.intel (research)
    ↓
/sage.specify (spec)
    ↓
/sage.plan (PRP)
    ↓
/sage.tasks (SMART tasks)
    ↓
/sage.implement (execute)
    ↓
/sage.commit (finalize)
```

### Example Session

```bash
# Initialize repository (once per repo)
User: /sage.init
Claude: Analyzing codebase...
        - Extracted 47 patterns from 23 files
        - Detected TypeScript (ESM) with Vitest
        - Generated baseline documentation
        - Patterns saved to .sage/agent/examples/

# Create feature request
User: /sage.init-feature user-authentication
Claude: Creating feature request...
        - Feature: user-authentication
        - Template generated: docs/features/user-authentication.md
        - Sections: Problem, Solution, Requirements, Success Metrics

# Research best practices
User: /sage.intel
Claude: Researching user-authentication...
        - Analyzed 15 sources on modern auth patterns
        - Best practices: JWT with refresh tokens
        - Recommendations: OAuth 2.0, PKCE flow
        - Research saved: docs/research/user-authentication-intel.md

# Generate specification
User: /sage.specify
Claude: Generating specification from research...
        - Applied patterns: TypeScript conventions
        - Code requirements: ESM imports, Zod validation
        - Security: Secret scanning enabled
        - Spec saved: docs/specs/user-authentication/spec.md

# Create implementation plan
User: /sage.plan
Claude: Creating PRP-format plan...
        - Phase 1: Core auth service
        - Phase 2: Token management
        - Phase 3: OAuth integration
        - Plan saved: docs/specs/user-authentication/plan.md

# Break down into tasks
User: /sage.tasks
Claude: Generating SMART tasks...
        - Created 12 tickets across 3 phases
        - Estimated: 45 story points
        - Dependencies mapped
        - Tasks saved: docs/specs/user-authentication/tasks.md

# Execute implementation
User: /sage.implement AUTH-001
Claude: Loading context for AUTH-001...
        - Feature request: ✓
        - Research findings: ✓
        - Specification: ✓
        - Implementation plan: ✓
        - Repository patterns: ✓
        - Executing task...
```

### Benefits

- **Complete traceability**: Feature → Research → Spec → Plan → Code
- **Research-backed decisions**: Every choice supported by data
- **Pattern compliance**: Code follows repository conventions
- **Context assembly**: All 6 levels of documentation loaded

---

## Traditional Workflow

Manual step-by-step development with explicit control over each phase.

### When to Use

- Small projects with clear requirements
- Solo development or small teams
- When you want manual control over each step
- Prototyping and exploration

### Workflow Steps

```plaintext
/sage.specify
    ↓
/sage.plan
    ↓
/sage.tasks
    ↓
/sage.breakdown (optional)
    ↓
/sage.blueprint (optional)
    ↓
/sage.implement
    ↓
/sage.commit
```

### Example Session

```bash
# Generate specification
User: /sage.specify payment-gateway
Claude: Generating specification...
        - Analyzed docs/features/payment-gateway.md
        - Created technical specification
        - Output: docs/specs/payment-gateway/spec.md

# Create implementation plan
User: /sage.plan payment-gateway
Claude: Creating implementation plan...
        - Phase 1: Gateway abstraction layer
        - Phase 2: Stripe integration
        - Phase 3: PayPal integration
        - Output: docs/specs/payment-gateway/plan.md

# Break down into tasks
User: /sage.tasks payment-gateway
Claude: Generating SMART tasks...
        - Created 8 implementation tasks
        - Estimated: 32 story points
        - Output: docs/specs/payment-gateway/tasks.md

# Implement specific task
User: /sage.implement
Claude: Implementing next task from plan...
        - Loading specification context
        - Executing implementation
        - Tests passing
        - Ready for commit

# Commit changes
User: /sage.commit
Claude: Creating semantic commit...
        - Type: feat
        - Scope: payment-gateway
        - Message: implement gateway abstraction layer
        - PR: Created #123
```

### Benefits

- **Full control**: Decide exactly when to proceed
- **Visibility**: See each step's output before continuing
- **Flexibility**: Modify plans between steps
- **Learning**: Understand the development process

---

## Ticket-Based Workflow

Automated development with state management and ticket tracking.

### When to Use

- Projects with many features/tickets
- Team development with shared state
- When you want automated execution
- Projects requiring audit trails

### Workflow Steps

```plaintext
/sage.specify → /sage.plan → /sage.tasks
    ↓
/sage.migrate (convert to tickets)
    ↓
/sage.validate (verify integrity)
    ↓
/sage.stream (execute tickets)
    ↓
/sage.sync (sync with GitHub)
```

### Ticket System Structure

```plaintext
.sage/tickets/
├── index.json              # Ticket registry
├── EPIC-001.md            # Epic ticket
├── STORY-001.md           # Story ticket
├── TASK-001.md            # Task ticket
└── ...
```

### Example Session

```bash
# Migrate documentation to tickets
User: /sage.migrate
Claude: Converting to ticket system...
        - Parsed docs/specs/payment-gateway/tasks.md
        - Created 1 epic, 3 stories, 8 tasks
        - Dependencies established
        - Index updated: .sage/tickets/index.json

# Validate ticket system
User: /sage.validate
Claude: Validating ticket system...
        - Tickets: 12 total (1 epic, 3 stories, 8 tasks)
        - Status: All UNPROCESSED
        - Dependencies: Valid
        - Schema: Compliant
        - ✓ System valid

# Execute tickets
User: /sage.stream --semi-auto
Claude: Starting semi-auto execution...
        → Processing payment-gateway component...
        - Ticket TASK-001: gateway-abstraction
        - Ticket TASK-002: stripe-client
        - Ticket TASK-003: paypal-client

        Proceed with this batch? [Y/n]: Y

        ✓ TASK-001 completed
        ✓ TASK-002 completed
        ✓ TASK-003 completed

        Component complete. Continue to next? [Y/n]: Y

# Sync with GitHub
User: /sage.sync --github
Claude: Syncing with GitHub...
        - Created issue #45 for EPIC-001
        - Created issue #46-48 for stories
        - Labels applied: saga-dev, payment-gateway
        - Status synced
```

### Ticket States

| State | Description | Next States |
|-------|-------------|-------------|
| `UNPROCESSED` | Not yet started | IN_PROGRESS |
| `IN_PROGRESS` | Currently executing | COMPLETED, DEFERRED |
| `COMPLETED` | Successfully finished | (terminal) |
| `DEFERRED` | Postponed for later | UNPROCESSED |
| `BLOCKED` | Waiting on dependency | UNPROCESSED |

---

## Stream Execution Modes

The `/sage.stream` command supports multiple execution modes for different needs.

### Interactive Mode (Default)

```bash
/sage.stream --interactive
```

**Confirmations at every step:**

- Proceed with ticket? Y/n
- Confirm implementation complete? Y/n
- Review diff? Y/n
- Commit changes? Y/n

**Best for:**

- Learning the system
- Critical production code
- Careful review needed
- First-time users

**Example:**

```plaintext
User: /sage.stream --interactive

Claude: Starting interactive mode...

┌─────────────────────────────────────┐
│ Next ticket: TASK-001               │
│ Title: Implement gateway abstraction│
│ Priority: P1                        │
│ Estimate: 4h                        │
└─────────────────────────────────────┘

Proceed with this ticket? [Y/n]: Y

→ Implementing TASK-001...
  - Loading specification context
  - Applying repository patterns
  - Writing code...
  - Running tests...

Implementation complete. Tests passing.
Confirm completion? [Y/n]: Y

Review diff? [Y/n]: Y
[Shows git diff]

Commit changes? [Y/n]: Y
✓ Committed: feat(payment): implement gateway abstraction

Continue to next ticket? [Y/n]: Y
```

### Semi-Auto Mode (3-5× faster)

```bash
/sage.stream --semi-auto
```

**Confirmations at component level:**

- Proceed with component batch? Y/n
- Continue after component complete? Y/n

**Skips:**

- Individual ticket confirmations
- Diff reviews (auto-commit)
- Completion confirmations (auto-accept)

**Best for:**

- Trusted ticket definitions
- Rapid development cycles
- Component-focused work
- Experienced users

**Example:**

```plaintext
User: /sage.stream --semi-auto

Claude: Starting semi-auto mode...

Component: payment-gateway (3 tickets)
- TASK-001: gateway-abstraction
- TASK-002: stripe-client
- TASK-003: paypal-client

Proceed with this batch? [Y/n]: Y

→ Processing TASK-001...
✓ Completed TASK-001 (2m 34s)

→ Processing TASK-002...
✓ Completed TASK-002 (3m 12s)

→ Processing TASK-003...
✓ Completed TASK-003 (2m 58s)

Component complete: payment-gateway
Time: 8m 44s | Velocity: 0.34 tickets/min

Continue to next component? [Y/n]: Y
```

### Auto Mode (5-10× faster)

```bash
/sage.stream --auto
```

**No confirmations:**

- All tickets executed automatically
- Commits created automatically
- Stops only on errors

**Best for:**

- Well-defined tickets
- Batch processing
- CI/CD pipelines
- Overnight execution

**Example:**

```plaintext
User: /sage.stream --auto

Claude: Starting auto mode...

Processing 12 tickets...

✓ TASK-001 gateway-abstraction (2m 34s)
✓ TASK-002 stripe-client (3m 12s)
✓ TASK-003 paypal-client (2m 58s)
✓ TASK-004 error-handling (1m 45s)
✓ TASK-005 retry-logic (2m 21s)
✓ TASK-006 unit-tests (4m 12s)
✓ TASK-007 integration-tests (5m 33s)
✓ TASK-008 documentation (1m 56s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Execution Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total tickets: 12
Completed: 12
Deferred: 0
Failed: 0
Total time: 24m 31s
Velocity: 0.49 tickets/min
```

### Parallel Mode (10-20× faster)

```bash
/sage.stream --auto --parallel=3
```

**Multiple sub-agents:**

- Parallel ticket execution
- Independent components processed simultaneously
- Automatic dependency resolution

**Best for:**

- Large projects
- Independent components
- Maximum throughput
- Resource-rich environments

**Example:**

```plaintext
User: /sage.stream --auto --parallel=3

Claude: Starting parallel mode (3 agents)...

Agent 1: payment-gateway
Agent 2: user-auth
Agent 3: notifications

[AGENT-1] ✓ TASK-001 (2m 34s)
[AGENT-2] ✓ AUTH-001 (3m 12s)
[AGENT-3] ✓ NOTIF-001 (1m 45s)
[AGENT-1] ✓ TASK-002 (3m 12s)
[AGENT-2] ✓ AUTH-002 (2m 58s)
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Parallel Execution Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total tickets: 36
Completed: 36
Wall clock time: 12m 45s
Effective throughput: 2.82 tickets/min
Speedup vs sequential: 15.2×
```

### Dry Run Mode

```bash
/sage.stream --dry-run
```

**Preview without execution:**

- Shows execution plan
- Validates ticket system
- Estimates time
- No actual changes

**Best for:**

- Planning sessions
- Validating before execution
- Understanding scope
- Team reviews

**Example:**

```plaintext
User: /sage.stream --dry-run

Claude: Dry run mode (no changes will be made)...

Execution Plan:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. TASK-001 gateway-abstraction (est: 4h)
2. TASK-002 stripe-client (est: 3h)
3. TASK-003 paypal-client (est: 3h)
...

Total tickets: 12
Estimated time: 45h
Recommended mode: semi-auto
Dependencies: All satisfied
Blockers: None

Ready to execute with:
/sage.stream --semi-auto
```

---

## Workflow Comparison

| Feature | Traditional | Ticket Interactive | Ticket Semi-Auto | Ticket Auto | Ticket Parallel |
|---------|-------------|-------------------|------------------|-------------|-----------------|
| Speed | Slowest | Slow | Medium | Fast | Fastest |
| Control | Full | Full | Component-level | None | None |
| Confirmations | Manual | Every step | Per component | None | None |
| Best for | Learning | Critical code | Rapid dev | Batch jobs | Large projects |
| Audit trail | Manual | Full | Full | Full | Full |
| Resume support | No | Yes | Yes | Yes | Yes |
| GitHub sync | Manual | Optional | Optional | Optional | Optional |

### Speed Comparison

```plaintext
Traditional:     ████████████████████ 100% (baseline)
Interactive:     ██████████████████ 90% (ticket overhead)
Semi-Auto:       █████ 25% (3-5× faster)
Auto:            ███ 15% (5-10× faster)
Parallel (3):    █ 5% (10-20× faster)
```

---

## Best Practices

### 1. Start with Interactive Mode

```bash
# Learn the system first
/sage.stream --interactive

# Then graduate to semi-auto
/sage.stream --semi-auto
```

### 2. Validate Before Execution

```bash
# Always validate ticket system first
/sage.validate --strict

# Then start execution
/sage.stream --semi-auto
```

### 3. Use Dry Run for Planning

```bash
# Preview execution plan
/sage.stream --dry-run

# Review and adjust if needed
# Then execute
/sage.stream --auto
```

### 4. Component-Based Development

```bash
# Group tickets by component
/sage.migrate --component-grouping

# Execute per component
/sage.stream --semi-auto
# Confirms once per component, not per ticket
```

### 5. Sync with GitHub Regularly

```bash
# After each session
/sage.sync --github

# Keep issues and tickets aligned
```

### 6. Monitor Velocity

```bash
# Check project progress
/sage.progress

# View velocity metrics
# Adjust estimates based on actual performance
```

---

## Common Scenarios

### Scenario 1: New Feature Development

```bash
# Research-driven approach
/sage.init-feature user-preferences
/sage.intel
/sage.specify
/sage.plan
/sage.tasks --github
/sage.stream --semi-auto
/sage.commit
```

### Scenario 2: Bug Fix Sprint

```bash
# Quick iteration
/sage.validate
/sage.stream --interactive  # Careful review of each fix
/sage.sync --github
```

### Scenario 3: Large Refactoring

```bash
# Parallel execution
/sage.specify refactoring
/sage.plan
/sage.tasks
/sage.migrate
/sage.stream --auto --parallel=4
/sage.commit
```

### Scenario 4: Prototyping

```bash
# Traditional workflow, minimal overhead
/sage.specify
/sage.implement  # Direct implementation
# No ticket system needed
```

### Scenario 5: Team Handoff

```bash
# Complete documentation trail
/sage.init-feature new-feature
/sage.intel
/sage.specify
/sage.plan
/sage.tasks --github  # Create GitHub issues
/sage.sync --github   # Team can see all tickets
```

---

## Workflow Selection Guide

```plaintext
Q: Is this a new feature with unclear requirements?
  → Yes: Context Engineering Workflow
  → No: Continue below

Q: Do you need automated execution and state tracking?
  → Yes: Ticket-Based Workflow
  → No: Traditional Workflow

Q: How fast do you need to move? (Ticket-Based)
  → Careful review: Interactive Mode
  → Balanced speed/control: Semi-Auto Mode
  → Maximum speed: Auto Mode
  → Large project: Parallel Mode
```

---

## Next Steps

- [Installation Guide](INSTALLATION.md) - Setup and configuration
- [Command Reference](../commands/SAGE.COMMANDS.md) - All 37 commands
- [MCP Server Setup](MCP_SETUP.md) - Advanced pattern extraction
- [Skills Guide](SKILLS_GUIDE.md) - Cross-platform portable skills
