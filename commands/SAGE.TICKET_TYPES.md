# Ticket Types & Validation Framework Reference

**Purpose:** Comprehensive reference for ticket types, validation strategies, and sub-task processing in the sage-dev ticket system.

**Last Updated:** 2025-10-04

---

## Ticket Type System

Tickets are categorized by **type** (what kind of work) and **validation_type** (how to validate the work).

### Ticket Types

#### 1. `implementation`

**Purpose:** Build new features from scratch

**When to use:**

- New component development
- New API endpoints
- New UI pages/screens
- New service integrations

**Example:**

```yaml
id: TICKET-001
type: implementation
title: "Build User Authentication System"
```

#### 2. `enhancement`

**Purpose:** Improve existing features

**When to use:**

- Performance optimizations
- UX improvements
- Feature extensions
- Capability additions

**Example:**

```yaml
id: TICKET-042
type: enhancement
title: "Add OAuth2 support to existing auth system"
```

#### 3. `bugfix`

**Purpose:** Fix defects in existing code

**When to use:**

- Production bugs
- Test failures
- Regression issues
- Error handling improvements

**Example:**

```yaml
id: TICKET-089
type: bugfix
title: "Fix memory leak in session cleanup"
```

#### 4. `refactor`

**Purpose:** Improve code quality without changing behavior

**When to use:**

- Code cleanup
- Architecture improvements
- Dependency updates
- Technical debt reduction

**Example:**

```yaml
id: TICKET-123
type: refactor
title: "Migrate auth module to TypeScript"
```

#### 5. `lightweight` (Migration-Generated)

**Purpose:** Minimal placeholder for completed work (token optimization)

**When to use:**

- **Auto-generated** during `/migrate --mode=optimized`
- COMPLETED tickets that don't need validation configs
- Historical record of completed work
- Token-efficient representation (~90% reduction)

**Characteristics:**

- State: Always COMPLETED
- No validation configs
- No sub-tasks or acceptance criteria
- Git commit references only
- Brief summary

**Example:**

```yaml
id: AUTH-001
type: lightweight
state: COMPLETED
completed_at: "2025-09-15T10:23:00Z"
summary: "Implemented JWT validation with tests"
git:
  commits: ["abc123", "def456"]
```

**Token Savings:** ~500 tokens (vs ~5000 for full detail)

**Usage Notes:**

- ✅ Created automatically by migration in optimized mode
- ✅ Serves as historical record
- ❌ Not execution-ready (no implementation guidance)
- ❌ Cannot be used with `/implement` or `/stream`

#### 6. `legacy` (Git-History Inferred)

**Purpose:** Historical ticket inferred from existing codebase without documentation

**When to use:**

- **Auto-generated** during `/migrate --mode=legacy`
- Codebases without documentation
- Git-history-only migration
- Reverse-engineering existing projects

**Characteristics:**

- State: Always COMPLETED
- Inferred from commit patterns or file changes
- No documentation links
- No validation configs
- Minimal metadata
- May have limited context

**Example:**

```yaml
id: COMP-001
type: legacy
state: COMPLETED
inferred_from: "git-history"
completed_at: "2025-09-15T10:23:00Z"
summary: "Inferred from git history - no documentation"
git:
  commits: ["abc123", "def456"]
notes: "Auto-generated from existing codebase"
```

**Inference Strategy:**

1. Extract from conventional commits: `feat(component):`, `fix(component):`
2. Fallback: Group by directory structure
3. All marked COMPLETED (code exists)

**Limitations:**

- Cannot infer dependencies
- No subtask breakdown
- Historical record only
- Not execution-ready

---

## Validation Type System

Validation types determine **how** a ticket's implementation is verified and validated.

### Validation Types

#### 1. `stateflow`

**Purpose:** Validate stateful behavior chains and UI cascades

**Use Cases:**

- Authentication flows (logged_out → logged_in → UI updates)
- User interaction cascades (selection → data load → UI update)
- Theme/settings changes with downstream effects
- Multi-step wizards with state propagation

**Validation Approach:**

- Programmatic state transitions
- Verify downstream UI changes
- Check cascade effects
- Validate state consistency

**Example Ticket:**

```yaml
id: TICKET-050
type: implementation
validation_type: stateflow
title: "Implement Admin Login Flow"
validation_config:
  validator: "StateFlowValidator"
  state_paths:
    - name: "admin_auth"
      transitions:
        - "logged_out → login(admin) → admin_nav_visible"
        - "logged_out → login(admin) → protected_routes_accessible"
        - "logged_out → login(admin) → vendor_cache_loaded"
  verification_methods:
    - "check_element_visibility"
    - "verify_route_access"
    - "validate_cache_state"
  auto_fix: true
  max_retries: 3
```

#### 2. `content`

**Purpose:** Validate field data, calculations, and displayed values

**Use Cases:**

- Percentage calculations
- Counter displays
- Aggregated statistics
- Formatted data fields
- Computed values

**Validation Approach:**

- Trace data sources (variables, API calls, props)
- Verify calculation formulas
- Check variable existence
- Validate edge cases (null, division by zero)

**Example Ticket:**

```yaml
id: TICKET-075
type: implementation
validation_type: content
title: "Add Completion Percentage Display"
validation_config:
  validator: "ContentValidator"
  fields:
    - name: "completion_percentage"
      formula: "(completed / total) * 100"
      variables:
        - "completed"
        - "total"
      edge_cases:
        - "total == 0"
      format: "0.0%"
  verification_scripts:
    - name: "verify_calculation"
      command: "npm test -- CompletionWidget.test"
      success_pattern: "percentage calculation ✓"
  auto_fix: true
  max_retries: 3
```

#### 3. `interactive`

**Purpose:** Validate interactive elements (buttons, links, forms)

**Use Cases:**

- Button click handlers
- Link navigation
- Form submissions
- Event handler wiring
- User input validation

**Validation Approach:**

- Check handler existence (function/route defined)
- Verify target reachability
- Validate parameters/props
- Test event propagation

**Example Ticket:**

```yaml
id: TICKET-092
type: implementation
validation_type: interactive
title: "Add Project Creation Button"
validation_config:
  validator: "InteractiveValidator"
  elements:
    - type: "button"
      id: "create-project-btn"
      handler: "handleCreateProject"
      target: "/api/projects"
      validation:
        - "handler_exists"
        - "endpoint_defined"
        - "params_valid"
  verification_scripts:
    - name: "verify_button_handler"
      command: "npm test -- ProjectButton.test"
      success_pattern: "onClick handler ✓"
  auto_fix: true
  max_retries: 3
```

#### 4. `integration`

**Purpose:** Validate GitHub issue processing and external integrations

**Use Cases:**

- GitHub ticket implementation
- Third-party API integration
- External service connections
- Cross-system synchronization

**Validation Approach:**

- Check dependency availability
- Verify integration points
- Test error handling
- Validate data mapping

**Example Ticket:**

```yaml
id: TICKET-110
type: implementation
validation_type: integration
title: "Implement GitHub Issue Sync"
validation_config:
  validator: "IntegrationValidator"
  integrations:
    - service: "github"
      endpoints:
        - "/repos/{owner}/{repo}/issues"
      auth_required: true
      error_handling:
        - "rate_limit"
        - "auth_failure"
        - "network_timeout"
  verification_scripts:
    - name: "verify_github_sync"
      command: "npm test -- GitHubSync.test"
      success_pattern: "sync complete ✓"
  auto_fix: false  # Manual review required
  max_retries: 3
```

#### 5. `generic`

**Purpose:** Standard implementation validation (default)

**Use Cases:**

- General feature implementation
- Mixed validation requirements
- Custom validation logic
- Non-categorized work

**Validation Approach:**

- Standard test suite execution
- Code syntax and lint checks
- Build verification
- Basic functionality tests

**Example Ticket:**

```yaml
id: TICKET-200
type: implementation
validation_type: generic
title: "Implement User Profile Page"
validation_config:
  validator: "GenericValidator"
  verification_scripts:
    - name: "run_tests"
      command: "npm test"
      success_pattern: "All tests passed"
    - name: "lint_code"
      command: "npm run lint"
      success_pattern: "no errors"
    - name: "build_check"
      command: "npm run build"
      success_pattern: "build successful"
  auto_fix: true
  max_retries: 3
```

---

## Sub-Task System

Tickets can contain **tasks** arrays for fine-grained execution and validation.

### Task Structure

```json
{
  "id": "TICKET-001",
  "title": "Implement Authentication System",
  "type": "implementation",
  "validation_type": "stateflow",
  "tasks": [
    {
      "id": "TASK-001-1",
      "type": "interactive",
      "description": "Implement login button handler",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- LoginButton.test",
      "auto_fix": true,
      "max_retries": 3
    },
    {
      "id": "TASK-001-2",
      "type": "stateflow",
      "description": "Validate auth state cascade",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- AuthFlow.test",
      "auto_fix": true,
      "max_retries": 3
    },
    {
      "id": "TASK-001-3",
      "type": "content",
      "description": "Display user profile data",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- ProfileWidget.test",
      "auto_fix": true,
      "max_retries": 3
    }
  ]
}
```

### Task Processing Flow

```plaintext
SELECT_NEXT_TASK (status: UNPROCESSED)
  ↓
IMPLEMENT_TASK
  ↓
RUN_VALIDATION_SCRIPT
  ↓
validation_pass?
  | NO
  ↓
AUTO_FIX_LOOP (if auto_fix: true)
  ↓
  Attempt 1 → fix → validate
  Attempt 2 → fix → validate
  Attempt 3 → fix → validate
  ↓
  still_failing?
    | YES
    ↓
    DEFER_TASK (log reason, continue to next)
    |
  NO
  ↓
COMMIT_TASK (atomic commit)
  ↓
MARK_TASK_COMPLETE
  ↓
NEXT_TASK (repeat until all complete)
  ↓
FINAL_TICKET_COMMIT
```

---

## Component Grouping System

Tickets can group related work into **components** for checkpoint-based rollback.

### Component Structure

```json
{
  "id": "TICKET-001",
  "components": [
    {
      "name": "AuthModule",
      "description": "Authentication logic and state management",
      "checkpoint_id": "cp_auth_001",
      "status": "UNPROCESSED",
      "tasks": ["TASK-001-1", "TASK-001-2"]
    },
    {
      "name": "LoginUI",
      "description": "Login form and UI components",
      "checkpoint_id": "cp_ui_001",
      "status": "UNPROCESSED",
      "tasks": ["TASK-001-3", "TASK-001-4"]
    }
  ]
}
```

### Component Processing Flow (Interactive Mode)

```plaintext
PROCESS_COMPONENT_A
  ↓
  Execute all tasks for component
  Atomic commits per task
  ↓
CREATE_COMPONENT_CHECKPOINT
  ↓
REQUEST_USER_CONFIRMATION
  ↓
  user_confirms?
    | NO
    ↓
    ROLLBACK_COMPONENT (restore checkpoint)
    DEFER_COMPONENT
    |
  YES
  ↓
MARK_COMPONENT_COMPLETE
  ↓
PROCESS_NEXT_COMPONENT
  ↓
FINAL_TICKET_COMMIT
```

---

## Validation Configuration Reference

### Full Schema Example

```json
{
  "id": "TICKET-042",
  "title": "Implement Advanced Search",
  "type": "implementation",
  "validation_type": "interactive",
  "state": "UNPROCESSED",
  "priority": "P1",

  "tasks": [
    {
      "id": "TASK-042-1",
      "type": "interactive",
      "description": "Search input handler",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- SearchInput.test",
      "auto_fix": true,
      "max_retries": 3
    }
  ],

  "validation_config": {
    "validator": "InteractiveValidator",
    "auto_fix": true,
    "max_retries": 3,
    "verification_scripts": [
      {
        "name": "unit_tests",
        "command": "npm test -- Search.test",
        "success_pattern": "All tests passed",
        "failure_action": "auto_fix"
      },
      {
        "name": "integration_test",
        "command": "npm run test:integration",
        "success_pattern": "integration ✓",
        "failure_action": "defer"
      }
    ],
    "defer_on_failure": true,
    "defer_reason_category": "persistent_test_failure"
  },

  "components": [
    {
      "name": "SearchModule",
      "checkpoint_id": "cp_search_001",
      "status": "UNPROCESSED",
      "tasks": ["TASK-042-1"]
    }
  ]
}
```

---

## Defer Reason Categories

When a task/ticket cannot be completed after max retries, it's deferred with a categorized reason:

### Categories

1. **`missing_dependencies`**
   - Required files/modules not found
   - External libraries not installed
   - API endpoints not yet available

2. **`persistent_test_failure`**
   - Tests fail after 3 fix attempts
   - Validation scripts return non-zero exit code
   - Success pattern not matched

3. **`validation_script_error`**
   - Validation command itself failed
   - Script not found or not executable
   - Syntax error in validation command

4. **`external_blocker`**
   - External service unavailable
   - API rate limit exceeded
   - Network timeout

5. **`user_rejected`**
   - Component rejected in interactive mode
   - Manual review required
   - User intervention needed

### Defer Logging

```json
{
  "id": "TASK-042-1",
  "status": "DEFERRED",
  "defer_reason": {
    "category": "persistent_test_failure",
    "message": "Unit tests failed after 3 fix attempts",
    "attempts": 3,
    "last_error": "TypeError: Cannot read property 'value' of null",
    "deferred_at": "2025-10-04T14:23:00Z"
  }
}
```

---

## Best Practices

### 1. Choose Appropriate Validation Type

✅ **Good:**

```yaml
# Auth flow with UI cascades
validation_type: stateflow
```

❌ **Bad:**

```yaml
# Auth flow with UI cascades
validation_type: generic  # Too generic, misses cascade validation
```

### 2. Break Down Complex Tickets

✅ **Good:**

```json
{
  "tasks": [
    {"id": "TASK-1", "description": "Login button"},
    {"id": "TASK-2", "description": "Logout button"},
    {"id": "TASK-3", "description": "Auth state cascade"}
  ]
}
```

❌ **Bad:**

```json
{
  "tasks": [
    {"id": "TASK-1", "description": "All auth functionality"}
  ]
}
```

### 3. Enable Auto-Fix for Appropriate Types

✅ **Enable auto-fix:**

- `stateflow` - UI cascade fixes
- `content` - Calculation corrections
- `interactive` - Handler wiring fixes

❌ **Disable auto-fix:**

- Security-sensitive code
- Production data migrations
- External API integrations (manual review)

### 4. Use Component Grouping Wisely

✅ **Good grouping:**

```json
"components": [
  {"name": "AuthLogic", "tasks": ["TASK-1", "TASK-2"]},
  {"name": "AuthUI", "tasks": ["TASK-3", "TASK-4"]}
]
```

❌ **Bad grouping:**

```json
"components": [
  {"name": "Everything", "tasks": ["TASK-1", "TASK-2", "TASK-3", "TASK-4"]}
]
```

---

## Integration with Commands

### `/migrate` Command

- Detects validation type from task descriptions
- Generates tasks array from task breakdowns
- Creates component groupings based on specs
- Adds validation scripts based on project type

### `/stream` Command

- Processes tasks sequentially within each ticket
- Runs validation scripts after implementation
- Executes auto-fix loop on failures
- Creates component checkpoints
- Requests confirmation per component (interactive mode)

### `/validate` Command

- Validates ticket type is valid enum
- Checks validation_type is valid enum
- Verifies tasks array schema
- Validates validation scripts are well-formed
- Checks component checkpoints exist

### `/quality` Command

- Ensures sub-tasks have descriptions
- Verifies validation scripts exist
- Checks auto-fix is appropriate for type
- Validates component groupings are logical

### `/repair` Command

- Fixes missing validation types (defaults to 'generic')
- Regenerates tasks array from task files
- Repairs invalid validation scripts
- Cleans orphaned component checkpoints

---

## Examples

### Example 1: StateFlow Ticket

```yaml
id: TICKET-AUTH-001
type: implementation
validation_type: stateflow
title: "Implement Admin Authentication Flow"

tasks:
  - id: TASK-AUTH-001-1
    type: interactive
    description: "Login form submission handler"
    validation_script: "npm test -- LoginForm.test"

  - id: TASK-AUTH-001-2
    type: stateflow
    description: "Validate auth state cascade to admin dashboard"
    validation_script: "npm test -- AdminAuthFlow.test"

  - id: TASK-AUTH-001-3
    type: content
    description: "Display admin user profile data"
    validation_script: "npm test -- AdminProfile.test"

validation_config:
  validator: StateFlowValidator
  auto_fix: true
  max_retries: 3
  state_paths:
    - "logged_out → login(admin) → admin_nav_visible"
    - "logged_out → login(admin) → protected_routes_accessible"

components:
  - name: "AuthModule"
    tasks: ["TASK-AUTH-001-1", "TASK-AUTH-001-2"]
  - name: "AdminUI"
    tasks: ["TASK-AUTH-001-3"]
```

### Example 2: Content Validation Ticket

```yaml
id: TICKET-STATS-042
type: implementation
validation_type: content
title: "Add Project Completion Statistics"

tasks:
  - id: TASK-STATS-042-1
    description: "Calculate completion percentage"
    validation_script: "npm test -- StatsCalc.test"

  - id: TASK-STATS-042-2
    description: "Display formatted statistics"
    validation_script: "npm test -- StatsWidget.test"

validation_config:
  validator: ContentValidator
  auto_fix: true
  max_retries: 3
  fields:
    - name: "completion_pct"
      formula: "(completed / total) * 100"
      variables: ["completed", "total"]
      edge_cases: ["total == 0"]
```

---

## Summary

**Ticket Types:** implementation, enhancement, bugfix, refactor, lightweight, legacy

**Validation Types:** stateflow, content, interactive, integration, generic

**Sub-Tasks:** Fine-grained execution units within tickets

**Components:** Logical groupings for checkpoint-based rollback

**Auto-Fix:** Autonomous retry loop (max 3 attempts)

**Defer Categories:** missing_dependencies, persistent_test_failure, validation_script_error, external_blocker, user_rejected

---

## Migration Modes

The `/migrate` command supports three modes that determine ticket generation strategy:

### 1. Optimized Mode (Default) - `--mode=optimized`

**Best for:** Production use, token efficiency, existing codebases with documentation

**Behavior:**
- **COMPLETED tickets:** Lightweight placeholders (~500 tokens)
  - Git commits + summary only
  - No validation configs or sub-tasks
  - Historical record
- **UNPROCESSED/IN_PROGRESS tickets:** Full detail (~5000 tokens)
  - Complete validation configs
  - Sub-task breakdowns
  - Acceptance criteria
  - Ready for `/implement` and `/stream`

**Token Savings:** 80-90% for completed work

**Example Output:**
```
110 tickets generated:
- 23 COMPLETED (lightweight): 11,500 tokens
- 87 UNPROCESSED (full): 435,000 tokens
Total: 446,500 tokens (vs 550,000 in full mode = 19% savings)
```

### 2. Full Mode - `--mode=full`

**Best for:** Maximum historical context, archival purposes

**Behavior:**
- All tickets (COMPLETED + UNPROCESSED) get full detail
- Complete validation configs for all states
- Maximum context preservation
- Highest token usage

**Use When:**
- Need detailed historical record
- Archiving project documentation
- Deep analysis of completed work

### 3. Legacy Mode - `--mode=legacy`

**Best for:** Undocumented codebases, reverse engineering, git-history-only migration

**Behavior:**
- **Auto-activated** when no documentation found
- Infers tickets from git commit patterns
- All tickets marked COMPLETED (historical)
- Minimal metadata (git only)

**Inference Strategy:**
1. Extract components from conventional commits: `feat(auth):`, `fix(db):`
2. Fallback: Group by directory structure
3. Create one ticket per component

**Limitations:**
- Cannot infer dependencies
- No subtask breakdown
- Historical record only (not execution-ready)

**Example:**
```bash
# Auto-detect legacy codebase
/migrate

# Output:
⚠️  Legacy codebase detected - no documentation found
Switching to LEGACY mode for git-history-only migration

Generated 15 legacy tickets from git history:
- AUTH-001: auth Implementation (COMPLETED)
- DB-001: database Implementation (COMPLETED)
- UI-001: ui Implementation (COMPLETED)
...
```

### Mode Comparison

| Aspect | Full | Optimized | Legacy |
|--------|------|-----------|--------|
| **COMPLETED tickets** | Full detail | Lightweight | Minimal |
| **UNPROCESSED tickets** | Full detail | Full detail | N/A |
| **Token usage** | Highest | Medium | Lowest |
| **Requires docs** | Yes | Yes | No |
| **Execution-ready** | Yes | Partial | No |
| **Best for** | Archival | Production | Legacy codebases |

---

For detailed command usage, see:

- `/migrate` - Generate tickets with validation types (supports --mode flag)
- `/stream` - Execute tickets with sub-task processing
- `/validate` - Validate ticket system integrity
- `/quality` - Check ticket quality scores
- `/repair` - Fix ticket system issues
