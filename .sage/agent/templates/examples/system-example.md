# System Documentation: Ticket System

**Component Type:** Core Infrastructure
**Created:** 2025-10-11
**Last Updated:** 2025-10-11
**Version:** 2.0
**Owner:** sage-dev team

---

## Purpose

The ticket system provides structured, state-driven task management for the sage-dev workflow, enabling reliable tracking of implementation progress across features, bugs, and technical debt.

**Key Capabilities:**
- Ticket creation, updates, and state transitions
- Dependency management and validation
- JSON-based storage with markdown summaries
- Integration with git workflow
- Automated state tracking and history

**Design Goals:**
- Single source of truth for project state
- Human-readable and machine-parsable
- Support for both ticket-based and traditional workflows
- Atomic state transitions with validation

---

## Architecture Overview

### System Context

```
User/Agent → SlashCommand → TicketSystem → FileSystem (.sage/tickets/)
                                ↓
                         StateValidator ← ValidationFramework
                                ↓
                            GitWorkflow
```

**Description:**
The ticket system serves as the central state management layer, coordinating between user commands, validation framework, and git workflow. All tickets are stored in `.sage/tickets/` with a master index and individual ticket files.

### Component Structure

```
.sage/tickets/
├── index.json          # Master index with all tickets
├── TICKET-001.md       # Individual ticket (optional)
├── TICKET-002.md
└── ...
```

**Key Modules:**

#### index.json
- **Responsibility:** Master ticket registry with full ticket objects
- **Location:** `.sage/tickets/index.json`
- **Key Functions:** Ticket lookup, state queries, dependency resolution

#### Ticket Files (*.md)
- **Responsibility:** Human-readable ticket summaries (optional)
- **Location:** `.sage/tickets/TICKET-ID.md`
- **Key Functions:** Quick reference, git tracking, manual review

#### State Validator
- **Responsibility:** Enforce valid state transitions and ticket integrity
- **Location:** Integrated with validation framework
- **Key Functions:** State transition validation, dependency checking

---

## Interfaces

### Command-Line Interface

#### /implement

**Syntax:**
```bash
/implement [TICKET-ID]
```

**Arguments:**
- `TICKET-ID` (optional) - Specific ticket to implement. Defaults to next UNPROCESSED ticket.

**Options:**
None

**Example:**
```bash
/implement CONTEXT-003
```

**Output:**
```
→ Implementing CONTEXT-003: Create Documentation Templates

[Implementation steps...]

✓ CONTEXT-003 completed successfully
  - Files created: 3
  - Tests passed: 5/5
  - Committed: abc1234
```

---

#### /validate

**Syntax:**
```bash
/validate
```

**Arguments:**
None

**Options:**
None

**Example:**
```bash
/validate
```

**Output:**
```
Validating ticket system...

✓ index.json: Valid JSON structure
✓ State consistency: All states valid
✓ Dependencies: No circular dependencies
⚠ Warning: TICKET-005 references non-existent TICKET-999

Validation complete: 1 warning, 0 errors
```

---

### API Interface

#### GetTicket

**Endpoint:** `jq '.tickets[] | select(.id == "TICKET-ID")' .sage/tickets/index.json`
**Method:** READ

**Request:**
```bash
jq '.tickets[] | select(.id == "CONTEXT-003")' .sage/tickets/index.json
```

**Response:**
```json
{
  "id": "CONTEXT-003",
  "title": "Create Documentation Templates",
  "type": "story",
  "state": "UNPROCESSED",
  "priority": "P0",
  "dependencies": ["CONTEXT-002"],
  "parent": "CONTEXT-001",
  ...
}
```

**Error Codes:**
- `Empty result` - Ticket not found
- `parse error` - Invalid JSON in index.json

---

#### UpdateTicketState

**Endpoint:** `jq` update operation
**Method:** WRITE

**Request:**
```bash
jq '.tickets |= map(if .id == "CONTEXT-003" then .state = "COMPLETED" else . end)' \
  .sage/tickets/index.json > temp.json && mv temp.json .sage/tickets/index.json
```

**Response:**
Updated index.json with new state

**Error Codes:**
- `parse error` - Invalid JSON
- `No such file` - index.json not found

---

### File Interface

#### index.json

**Location:** `.sage/tickets/index.json`
**Format:** JSON
**Permissions:** 0644 (rw-r--r--)

**Schema:**
```json
{
  "version": "string",
  "tickets": [
    {
      "id": "string",
      "title": "string",
      "type": "epic|story|task|bug",
      "validation_type": "generic|git|custom",
      "state": "UNPROCESSED|IN_PROGRESS|COMPLETED|DEFERRED",
      "priority": "P0|P1|P2|P3",
      "created": "ISO8601 timestamp",
      "updated": "ISO8601 timestamp",
      "description": "string",
      "acceptanceCriteria": ["string"],
      "dependencies": ["string"],
      "parent": "string|null",
      "docs": {
        "spec": "path",
        "plan": "path",
        "tasks": "path"
      },
      "git": {
        "branch": "string",
        "commits": ["string"]
      },
      "estimate": {
        "storyPoints": "number",
        "hours": "number",
        "confidence": "low|medium|high"
      },
      "sprint": "number",
      "validation_config": {},
      "state_history": [
        {
          "state": "string",
          "timestamp": "ISO8601"
        }
      ]
    }
  ]
}
```

**Example:**
```json
{
  "version": "2.0",
  "tickets": [
    {
      "id": "CONTEXT-003",
      "title": "Create Documentation Templates",
      "type": "story",
      "validation_type": "generic",
      "state": "UNPROCESSED",
      "priority": "P0",
      "created": "2025-10-09T02:00:00Z",
      "updated": "2025-10-10T22:30:00Z",
      "description": "Design and create 3 documentation templates...",
      "acceptanceCriteria": [
        "Templates created in .sage/agent/templates/",
        "task-template.md with placeholder markers"
      ],
      "dependencies": ["CONTEXT-002"],
      "parent": "CONTEXT-001",
      "estimate": {
        "storyPoints": 3,
        "hours": 12,
        "confidence": "high"
      },
      "sprint": 1
    }
  ]
}
```

**Validation Rules:**
- `id` must be unique across all tickets
- `state` must be one of: UNPROCESSED, IN_PROGRESS, COMPLETED, DEFERRED
- `dependencies` must reference existing ticket IDs
- `parent` must reference existing epic or null
- `created` and `updated` must be valid ISO8601 timestamps

---

#### Ticket Files (*.md)

**Location:** `.sage/tickets/TICKET-ID.md`
**Format:** Markdown
**Permissions:** 0644 (rw-r--r--)

**Schema:**
```markdown
# {{TITLE}}

**ID:** {{TICKET_ID}}
**Type:** {{TYPE}}
**State:** {{STATE}}
**Priority:** {{PRIORITY}}

## Description

{{DESCRIPTION}}

## Acceptance Criteria

- {{CRITERION_1}}
- {{CRITERION_2}}

## Dependencies

- {{DEP_1}}
- {{DEP_2}}

## Related Documentation

- [Spec]({{SPEC_PATH}})
- [Plan]({{PLAN_PATH}})
```

**Example:**
```markdown
# Create Documentation Templates

**ID:** CONTEXT-003
**Type:** story
**State:** UNPROCESSED
**Priority:** P0

## Description

Design and create 3 documentation templates in .sage/agent/templates/...

## Acceptance Criteria

- Templates created in .sage/agent/templates/ directory
- task-template.md: Overview, Objectives, Plan sections
- All templates use {{PLACEHOLDER}} format

## Dependencies

- CONTEXT-002

## Related Documentation

- [Spec](docs/specs/context-engineering/spec.md)
- [Plan](docs/specs/context-engineering/plan.md)
```

**Validation Rules:**
- Must be valid Markdown
- ID in frontmatter must match filename
- Content should match index.json (authoritative source)

---

## Data Models

### Ticket

**Description:** Core ticket object representing a unit of work

**Schema:**
```json
{
  "id": "string",
  "title": "string",
  "type": "epic|story|task|bug",
  "validation_type": "generic|git|custom",
  "state": "UNPROCESSED|IN_PROGRESS|COMPLETED|DEFERRED",
  "priority": "P0|P1|P2|P3",
  "created": "ISO8601",
  "updated": "ISO8601",
  "description": "string",
  "acceptanceCriteria": ["string"],
  "dependencies": ["string"],
  "parent": "string|null",
  "docs": {},
  "git": {},
  "estimate": {},
  "sprint": "number",
  "validation_config": {},
  "state_history": []
}
```

**Fields:**
- `id` (string): Unique identifier (e.g., "CONTEXT-003")
  - Required: Yes
  - Default: None
  - Constraints: Uppercase, alphanumeric + hyphen, unique

- `state` (enum): Current ticket state
  - Required: Yes
  - Default: "UNPROCESSED"
  - Constraints: One of UNPROCESSED, IN_PROGRESS, COMPLETED, DEFERRED

- `dependencies` (array): Ticket IDs that must complete before this ticket
  - Required: No
  - Default: []
  - Constraints: Each element must reference existing ticket ID

**Example:**
```json
{
  "id": "CONTEXT-003",
  "title": "Create Documentation Templates",
  "type": "story",
  "state": "UNPROCESSED",
  "dependencies": ["CONTEXT-002"],
  "parent": "CONTEXT-001"
}
```

---

### StateHistory

**Description:** Audit trail of state transitions for a ticket

**Schema:**
```json
{
  "state": "string",
  "timestamp": "ISO8601"
}
```

**Fields:**
- `state` (string): State transitioned to
  - Required: Yes
  - Default: None
  - Constraints: Valid ticket state

- `timestamp` (string): When transition occurred
  - Required: Yes
  - Default: Current time
  - Constraints: ISO8601 format

**Example:**
```json
[
  {
    "state": "UNPROCESSED",
    "timestamp": "2025-10-09T02:00:00Z"
  },
  {
    "state": "IN_PROGRESS",
    "timestamp": "2025-10-11T06:00:00Z"
  },
  {
    "state": "COMPLETED",
    "timestamp": "2025-10-11T08:30:00Z"
  }
]
```

---

## Dependencies

### Internal Dependencies

| Dependency | Version | Purpose | Location |
|------------|---------|---------|----------|
| Validation Framework | 2.0 | State validation | .sage/validators/ |
| Git Workflow | N/A | Commit tracking | Built-in |
| Slash Commands | N/A | User interface | commands/ |

### External Dependencies

| Dependency | Version | Purpose | Installation |
|------------|---------|---------|--------------|
| jq | 1.6+ | JSON processing | `brew install jq` |
| git | 2.0+ | Version control | Pre-installed |
| bash | 4.0+ | Script execution | Pre-installed |

### Integration Points

#### Upstream Dependencies
- User commands (/implement, /validate, /migrate) trigger ticket operations
- Validation framework validates ticket integrity

#### Downstream Consumers
- /stream command reads UNPROCESSED tickets for execution
- /progress command analyzes ticket states for reporting
- Git workflow tracks commits per ticket

---

## Usage

### Common Use Cases

#### Use Case 1: Create New Ticket

**Scenario:** Developer needs to track a new feature implementation

**Steps:**
1. Create ticket object with required fields
2. Add to index.json tickets array
3. Optionally create TICKET-ID.md summary file
4. Run /validate to verify ticket integrity

**Example:**
```bash
# Edit .sage/tickets/index.json
jq '.tickets += [{
  "id": "FEATURE-001",
  "title": "Add Export Functionality",
  "type": "story",
  "state": "UNPROCESSED",
  "priority": "P1",
  "created": "2025-10-11T10:00:00Z",
  "updated": "2025-10-11T10:00:00Z",
  "dependencies": [],
  "parent": null
}]' .sage/tickets/index.json > temp.json && mv temp.json .sage/tickets/index.json

# Validate
/validate
```

**Expected Outcome:** New ticket appears in system, ready for implementation

---

#### Use Case 2: Implement Ticket

**Scenario:** Developer ready to work on next ticket

**Steps:**
1. Run /implement to start next UNPROCESSED ticket
2. System transitions ticket to IN_PROGRESS
3. Complete implementation and tests
4. System transitions ticket to COMPLETED with commit

**Example:**
```bash
/implement CONTEXT-003
```

**Expected Outcome:** Ticket implemented, state updated to COMPLETED, changes committed

---

#### Use Case 3: Check Ticket Dependencies

**Scenario:** Verify if ticket dependencies are satisfied

**Steps:**
1. Query ticket from index.json
2. Check dependencies array
3. Verify all dependency tickets are COMPLETED

**Example:**
```bash
# Get ticket
jq '.tickets[] | select(.id == "CONTEXT-003")' .sage/tickets/index.json

# Check dependency states
jq '.tickets[] | select(.id == "CONTEXT-002") | .state' .sage/tickets/index.json
# Output: "COMPLETED"
```

**Expected Outcome:** Confirmation that dependencies are satisfied

---

### Code Examples

#### Example 1: Query Tickets by State

```bash
# Get all UNPROCESSED tickets
jq '.tickets[] | select(.state == "UNPROCESSED") | {id, title}' \
  .sage/tickets/index.json
```

**Description:** Lists all tickets ready for implementation

---

#### Example 2: Update Ticket State

```bash
# Transition CONTEXT-003 to COMPLETED
jq '(.tickets[] | select(.id == "CONTEXT-003") | .state) = "COMPLETED" |
    (.tickets[] | select(.id == "CONTEXT-003") | .updated) = "2025-10-11T09:00:00Z"' \
  .sage/tickets/index.json > temp.json && mv temp.json .sage/tickets/index.json
```

**Description:** Updates ticket state and timestamp atomically

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| SAGE_TICKETS_DIR | No | .sage/tickets | Location of ticket storage |
| SAGE_WORKFLOW_MODE | No | TICKET_BASED | Workflow mode (TICKET_BASED or TRADITIONAL) |

### Configuration Files

#### .sage/workflow-mode

**Location:** `.sage/workflow-mode`
**Format:** Plain text

**Schema:**
```
TICKET_BASED|TRADITIONAL
```

**Example:**
```
TICKET_BASED
```

---

## Operational Concerns

### Performance

**Benchmarks:**
- Ticket query (by ID): < 100ms for 1000 tickets
- State update: < 200ms
- Dependency validation: < 500ms for 50 dependencies

**Resource Requirements:**
- CPU: Minimal (jq operations)
- Memory: < 10MB for 1000 tickets
- Disk: ~5KB per ticket average
- Network: None (local filesystem)

### Monitoring

**Key Metrics:**
- Ticket throughput: Tickets/day completed
- State distribution: Count by state (UNPROCESSED, IN_PROGRESS, etc.)
- Dependency violations: Count of invalid dependencies

**Health Checks:**
```bash
/validate
```

**Expected Output:**
```
Validation complete: 0 warnings, 0 errors
```

### Logging

**Log Locations:**
- System logs: `.sage/*.log`
- Git logs: `.git/logs/`

**Log Levels:**
- ERROR: Invalid state transitions, missing dependencies
- WARN: Deprecated fields, optional validation failures
- INFO: State transitions, ticket updates
- DEBUG: jq queries, file operations

**Log Format:**
```
[TIMESTAMP] [LEVEL] [COMPONENT] Message
```

### Security

**Authentication:**
Filesystem-based, relies on OS user permissions

**Authorization:**
File permissions control read/write access to .sage/tickets/

**Data Protection:**
- Tickets stored in plain text JSON (no encryption)
- No sensitive data should be in tickets
- Git history provides audit trail

**Security Considerations:**
- Validate all user input before ticket creation
- Prevent arbitrary code execution via ticket fields
- Sanitize ticket IDs to prevent path traversal

---

## Troubleshooting

### Common Issues

#### Issue 1: Invalid JSON in index.json

**Symptoms:** jq parse errors, /validate fails

**Diagnosis:**
```bash
jq '.' .sage/tickets/index.json
```

**Solution:** Fix JSON syntax errors or restore from git backup:
```bash
git checkout .sage/tickets/index.json
```

---

#### Issue 2: Circular Dependency Detected

**Symptoms:** /validate reports circular dependency warning

**Diagnosis:**
```bash
/validate
```

**Solution:** Manually edit index.json to remove circular dependency link

---

#### Issue 3: Ticket State Transition Failed

**Symptoms:** Ticket remains in old state after /implement

**Diagnosis:**
```bash
jq '.tickets[] | select(.id == "TICKET-ID") | .state' .sage/tickets/index.json
```

**Solution:** Check validation logs, manually update state if needed

---

## Design Patterns

### Pattern 1: State Machine

**Intent:** Enforce valid state transitions with validation

**Applicability:** Any ticket state change

**Implementation:**
```bash
# Valid transitions:
# UNPROCESSED → IN_PROGRESS → COMPLETED
# UNPROCESSED → IN_PROGRESS → DEFERRED
# IN_PROGRESS → UNPROCESSED (rollback)

validate_transition() {
  local current_state=$1
  local new_state=$2

  case "$current_state:$new_state" in
    UNPROCESSED:IN_PROGRESS) return 0 ;;
    IN_PROGRESS:COMPLETED) return 0 ;;
    IN_PROGRESS:DEFERRED) return 0 ;;
    IN_PROGRESS:UNPROCESSED) return 0 ;;
    *) return 1 ;;
  esac
}
```

**Consequences:**
- Prevents invalid state transitions
- Maintains system integrity
- Requires explicit rollback logic

---

### Pattern 2: Command Pattern

**Intent:** Encapsulate ticket operations as commands

**Applicability:** All ticket modifications

**Implementation:**
```bash
# Each operation is a command:
# /implement TICKET-ID → ImplementCommand
# /validate → ValidateCommand
# /migrate → MigrateCommand

execute_command() {
  local command=$1
  shift

  case "$command" in
    implement) implement_ticket "$@" ;;
    validate) validate_tickets "$@" ;;
    migrate) migrate_to_tickets "$@" ;;
  esac
}
```

**Consequences:**
- Uniform interface for all operations
- Easy to add new commands
- Supports undo/redo via git

---

## Evolution and Versioning

### Version History

#### Version 2.0
- Added validation_type field for flexible validators
- Added state_history for audit trail
- Added estimate and sprint fields
- Improved dependency resolution

**Released:** 2025-10-09
**Breaking Changes:** New required fields (validation_type)

---

#### Version 1.0
- Initial ticket system with index.json
- Basic state machine (UNPROCESSED → COMPLETED)
- Dependency tracking

**Released:** 2025-09-15
**Breaking Changes:** N/A (initial release)

---

### Deprecation Policy

Fields marked as deprecated will be supported for 2 major versions before removal. Warnings will be issued when deprecated fields are used.

### Migration Guides

- [Migrating from v1.0 to v2.0](migration-v1-to-v2.md)

---

## References

### Internal Documentation
- [SAGE.TICKET_TYPES.md](../../../commands/SAGE.TICKET_TYPES.md)
- [SAGE.VALIDATION_FRAMEWORK.md](../../../commands/SAGE.VALIDATION_FRAMEWORK.md)
- [SAGE.WORKFLOW.md](../../../commands/SAGE.WORKFLOW.md)

### External Resources
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [JSON Schema](https://json-schema.org/)

### Related Components
- Validation Framework
- Stream Command
- Progress Reporting

---

## Contributing

**Maintainers:**
- sage-dev team

**Contribution Guidelines:**
All changes to ticket schema must maintain backward compatibility or provide migration path.

**Code Review Process:**
Changes to index.json structure require review and /validate passing.

---

*Last Updated: 2025-10-11*
*Document Version: 2.0*
