# Enhanced Ticket System - Examples & Testing Guide

**Purpose:** Practical examples demonstrating the enhanced ticket system with validation types, sub-task processing, auto-fix loops, and component-level checkpointing.

**Last Updated:** 2025-10-04

---

## Table of Contents

1. [Complete Workflow Examples](#complete-workflow-examples)
2. [Validation Type Examples](#validation-type-examples)
3. [Sub-Task Processing Examples](#sub-task-processing-examples)
4. [Auto-Fix Loop Examples](#auto-fix-loop-examples)
5. [Component Rollback Examples](#component-rollback-examples)
6. [Testing Scenarios](#testing-scenarios)

---

## Complete Workflow Examples

### Example 1: Authentication System (StateFlow)

**Scenario:** Implement a complete authentication system with login, logout, and state management.

#### Step 1: Create Specification

```bash
# Create docs/auth-requirements.md with requirements
/specify
```

**Result:** `docs/specs/authentication/spec.md`

#### Step 2: Create Implementation Plan

```bash
/plan
```

**Result:** `docs/specs/authentication/plan.md`

#### Step 3: Break Down into Tasks

```bash
/tasks
```

**Result:** `docs/specs/authentication/tasks.md`

```markdown
# Authentication Tasks

- [ ] Implement login form with email/password fields
- [ ] Add login button click handler to submit credentials
- [ ] Create authentication state management (logged_out → logged_in)
- [ ] Add protected route guards based on auth state
- [ ] Display user profile data when authenticated
- [ ] Implement logout functionality
- [ ] Add session persistence with localStorage
```

#### Step 4: Migrate to Enhanced Ticket System

```bash
/migrate
```

**Result:** `tickets/AUTH-001.md` and `.sage/tickets/index.json`

**Generated Ticket (Enhanced Schema):**

```json
{
  "id": "AUTH-001",
  "title": "Implement Authentication System",
  "type": "implementation",
  "validation_type": "stateflow",
  "state": "UNPROCESSED",
  "priority": "P0",

  "tasks": [
    {
      "id": "TASK-001-1",
      "type": "interactive",
      "description": "Implement login form with email/password fields",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- LoginForm.test",
      "auto_fix": true,
      "max_retries": 3
    },
    {
      "id": "TASK-001-2",
      "type": "interactive",
      "description": "Add login button click handler",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- LoginButton.test",
      "auto_fix": true,
      "max_retries": 3
    },
    {
      "id": "TASK-001-3",
      "type": "stateflow",
      "description": "Create authentication state management",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- AuthState.test",
      "auto_fix": true,
      "max_retries": 3
    },
    {
      "id": "TASK-001-4",
      "type": "stateflow",
      "description": "Add protected route guards",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- RouteGuards.test",
      "auto_fix": true,
      "max_retries": 3
    },
    {
      "id": "TASK-001-5",
      "type": "content",
      "description": "Display user profile data",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- UserProfile.test",
      "auto_fix": true,
      "max_retries": 3
    }
  ],

  "components": [
    {
      "name": "AuthModule",
      "description": "Core authentication logic and state management",
      "checkpoint_id": "",
      "status": "UNPROCESSED",
      "tasks": ["TASK-001-1", "TASK-001-2", "TASK-001-3"]
    },
    {
      "name": "AuthUI",
      "description": "Authentication UI components and user profile",
      "checkpoint_id": "",
      "status": "UNPROCESSED",
      "tasks": ["TASK-001-4", "TASK-001-5"]
    }
  ],

  "validation_config": {
    "validator": "StateFlowValidator",
    "auto_fix": true,
    "max_retries": 3,
    "state_paths": [
      {
        "name": "login_flow",
        "transitions": [
          "logged_out → login(credentials) → logged_in",
          "logged_in → profile_visible",
          "logged_in → protected_routes_accessible"
        ]
      }
    ],
    "verification_scripts": [
      {
        "name": "auth_integration",
        "command": "npm test -- AuthFlow.integration.test",
        "success_pattern": "All auth flows ✓"
      }
    ]
  }
}
```

#### Step 5: Execute with /stream

```bash
/stream
```

**Execution Flow:**

```
================================================
PROCESSING TICKET: AUTH-001
================================================

Ticket has 5 sub-tasks to process
Component-based processing enabled

─────────────────────────────────────────────────
Component 1/2: AuthModule
─────────────────────────────────────────────────

Processing TASK-001-1: Implement login form
  → Spawning implementation sub-agent...
  → Implementation complete
  → Running validation: npm test -- LoginForm.test
  ✓ Validation passed
  → Committing changes: feat: implement login form
  ✓ TASK-001-1 COMPLETED

Processing TASK-001-2: Add login button click handler
  → Spawning implementation sub-agent...
  → Implementation complete
  → Running validation: npm test -- LoginButton.test
  ✗ Validation failed: onClick handler not wired

  Auto-fix Attempt 1/3:
    → Analyzing error: Missing event handler connection
    → Applying fix: Wire onClick to handleLogin
    → Re-running validation...
    ✓ Validation passed
  → Committing changes: feat: add login button handler
  ✓ TASK-001-2 COMPLETED

Processing TASK-001-3: Create authentication state management
  → Spawning implementation sub-agent...
  → Implementation complete
  → Running validation: npm test -- AuthState.test
  ✓ Validation passed
  → Committing changes: feat: add auth state management
  ✓ TASK-001-3 COMPLETED

─────────────────────────────────────────────────
Component AuthModule: COMPLETED
Files modified: 5
Tests passed: ✓
─────────────────────────────────────────────────

Creating component checkpoint...
✓ Checkpoint created: abc123def

Options:
  [c] Continue to next component
  [r] Rollback this component
  [q] Quit (save checkpoint)

Your choice: c

─────────────────────────────────────────────────
Component 2/2: AuthUI
─────────────────────────────────────────────────

Processing TASK-001-4: Add protected route guards
  → Spawning implementation sub-agent...
  → Implementation complete
  → Running validation: npm test -- RouteGuards.test
  ✓ Validation passed
  → Committing changes: feat: add route guards
  ✓ TASK-001-4 COMPLETED

Processing TASK-001-5: Display user profile data
  → Spawning implementation sub-agent...
  → Implementation complete
  → Running validation: npm test -- UserProfile.test
  ✓ Validation passed
  → Committing changes: feat: display user profile
  ✓ TASK-001-5 COMPLETED

─────────────────────────────────────────────────
Component AuthUI: COMPLETED
Files modified: 3
Tests passed: ✓
─────────────────────────────────────────────────

Creating component checkpoint...
✓ Checkpoint created: def456ghi

Options:
  [c] Continue to next component
  [r] Rollback this component
  [q] Quit (save checkpoint)

Your choice: c

================================================
TICKET AUTH-001: COMPLETED
================================================

Summary:
  Total tasks: 5
  Completed: 5
  Deferred: 0
  Components: 2/2 completed

All tasks completed successfully!
```

---

### Example 2: Statistics Dashboard (Content Validation)

**Scenario:** Implement a dashboard displaying project completion statistics with percentage calculations.

#### Generated Ticket

```json
{
  "id": "STATS-001",
  "title": "Add Project Completion Statistics",
  "type": "implementation",
  "validation_type": "content",
  "state": "UNPROCESSED",
  "priority": "P1",

  "tasks": [
    {
      "id": "TASK-002-1",
      "type": "content",
      "description": "Calculate completion percentage",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- CompletionCalc.test",
      "auto_fix": true,
      "max_retries": 3
    },
    {
      "id": "TASK-002-2",
      "type": "content",
      "description": "Display formatted statistics (completed/total)",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- StatsDisplay.test",
      "auto_fix": true,
      "max_retries": 3
    },
    {
      "id": "TASK-002-3",
      "type": "interactive",
      "description": "Add refresh button to update stats",
      "status": "UNPROCESSED",
      "validation_script": "npm test -- RefreshButton.test",
      "auto_fix": true,
      "max_retries": 3
    }
  ],

  "validation_config": {
    "validator": "ContentValidator",
    "auto_fix": true,
    "max_retries": 3,
    "fields": [
      {
        "name": "completion_percentage",
        "formula": "(completed / total) * 100",
        "variables": ["completed", "total"],
        "edge_cases": ["total == 0"],
        "format": "0.0%"
      },
      {
        "name": "completed_count",
        "source": "tasks.filter(t => t.status === 'COMPLETED').length"
      },
      {
        "name": "total_count",
        "source": "tasks.length"
      }
    ]
  }
}
```

#### Execution with Auto-Fix

```bash
/stream
```

**Auto-Fix Example:**

```
Processing TASK-002-1: Calculate completion percentage
  → Implementation complete
  → Running validation: npm test -- CompletionCalc.test
  ✗ Validation failed: Division by zero error

  Auto-fix Attempt 1/3:
    → Analyzing error: No null check for total === 0
    → Applying fix: Add edge case handling

    Before:
      const percentage = (completed / total) * 100;

    After:
      const percentage = total === 0 ? 0 : (completed / total) * 100;

    → Re-running validation...
    ✓ Validation passed

  → Committing fix: fix: handle division by zero in completion calc
  ✓ TASK-002-1 COMPLETED
```

---

## Validation Type Examples

### StateFlow Example: Admin Login Flow

**Ticket Configuration:**

```yaml
id: AUTH-ADMIN-001
type: implementation
validation_type: stateflow
title: "Implement Admin Login Flow"

validation_config:
  validator: StateFlowValidator
  state_paths:
    - name: "admin_auth"
      transitions:
        - "logged_out → login(admin) → admin_nav_visible"
        - "logged_out → login(admin) → protected_routes_accessible"
        - "logged_out → login(admin) → vendor_cache_loaded"
```

**StateFlowValidator Auto-Fix Patterns:**

```typescript
// Pattern 1: Missing conditional rendering
// Error: Element visible in logged_out state
// Fix: Add conditional rendering

// Before:
<AdminNav />

// After:
{isAdmin && <AdminNav />}

// Pattern 2: Missing useEffect dependency
// Error: State not propagating to child components
// Fix: Add missing dependency

// Before:
useEffect(() => {
  loadVendorCache();
}, []);

// After:
useEffect(() => {
  if (isAdmin) {
    loadVendorCache();
  }
}, [isAdmin]);
```

---

### Content Example: Counter Display

**Ticket Configuration:**

```yaml
id: UI-COUNTER-001
type: implementation
validation_type: content
title: "Add Task Counter Widget"

validation_config:
  validator: ContentValidator
  fields:
    - name: "completed_count"
      source: "tasks.filter(t => t.status === 'COMPLETED').length"
      edge_cases: ["tasks undefined", "tasks empty array"]
```

**ContentValidator Auto-Fix Patterns:**

```typescript
// Pattern 1: Missing null check
// Error: Cannot read property 'filter' of undefined
// Fix: Add null/undefined guard

// Before:
const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

// After:
const completedCount = tasks?.filter(t => t.status === 'COMPLETED').length ?? 0;

// Pattern 2: Incorrect calculation formula
// Error: Percentage shows as NaN
// Fix: Add proper null handling and formatting

// Before:
const percentage = (completed / total) * 100;

// After:
const percentage = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
```

---

### Interactive Example: Search Button

**Ticket Configuration:**

```yaml
id: UI-SEARCH-001
type: implementation
validation_type: interactive
title: "Add Search Functionality"

validation_config:
  validator: InteractiveValidator
  elements:
    - type: "button"
      id: "search-btn"
      handler: "handleSearch"
      target: "/api/search"
```

**InteractiveValidator Auto-Fix Patterns:**

```typescript
// Pattern 1: Handler not wired
// Error: onClick undefined
// Fix: Wire handler to button

// Before:
<button id="search-btn">Search</button>

// After:
<button id="search-btn" onClick={handleSearch}>Search</button>

// Pattern 2: Missing handler definition
// Error: handleSearch is not defined
// Fix: Create handler function

// After:
const handleSearch = () => {
  fetch('/api/search', { method: 'POST', body: searchQuery })
    .then(res => res.json())
    .then(setResults);
};
```

---

## Sub-Task Processing Examples

### Example: Multi-Step Form Implementation

**Ticket with Sub-Tasks:**

```json
{
  "id": "FORM-001",
  "title": "Implement Multi-Step Registration Form",
  "type": "implementation",
  "validation_type": "interactive",

  "tasks": [
    {
      "id": "TASK-FORM-1",
      "description": "Step 1: Personal information fields",
      "validation_script": "npm test -- PersonalInfoStep.test"
    },
    {
      "id": "TASK-FORM-2",
      "description": "Step 2: Account credentials fields",
      "validation_script": "npm test -- CredentialsStep.test"
    },
    {
      "id": "TASK-FORM-3",
      "description": "Step 3: Preferences and settings",
      "validation_script": "npm test -- PreferencesStep.test"
    },
    {
      "id": "TASK-FORM-4",
      "description": "Add navigation buttons (Next/Back)",
      "validation_script": "npm test -- FormNavigation.test"
    },
    {
      "id": "TASK-FORM-5",
      "description": "Add form validation across all steps",
      "validation_script": "npm test -- FormValidation.test"
    }
  ]
}
```

**Execution Timeline:**

```
09:00 - Start /stream
09:02 - TASK-FORM-1 completed (2 min)
09:05 - TASK-FORM-2 completed (3 min)
09:07 - TASK-FORM-3 completed (2 min)
09:10 - TASK-FORM-4 failed validation
09:11 - Auto-fix attempt 1 → still failing
09:12 - Auto-fix attempt 2 → still failing
09:13 - Auto-fix attempt 3 → still failing
09:13 - TASK-FORM-4 DEFERRED (reason: persistent_test_failure)
09:16 - TASK-FORM-5 completed (3 min)

Result:
  Completed: 4/5
  Deferred: 1/5 (TASK-FORM-4)
  Ticket Status: IN_PROGRESS (requires manual intervention)
```

**Defer Log Entry:**

```json
{
  "id": "TASK-FORM-4",
  "status": "DEFERRED",
  "defer_reason": {
    "category": "persistent_test_failure",
    "message": "Navigation buttons test failed after 3 fix attempts",
    "attempts": 3,
    "last_error": "Expected 'Next' button to be enabled, but was disabled",
    "deferred_at": "2025-10-04T09:13:00Z",
    "failed_validations": [
      "npm test -- FormNavigation.test (exit code 1)"
    ]
  }
}
```

---

## Auto-Fix Loop Examples

### Example 1: Missing Import Auto-Fix

**Initial Error:**

```
TASK-UI-001: Add Dashboard Component
  → Running validation: npm test -- Dashboard.test
  ✗ Test failed:
     ReferenceError: Card is not defined
     at Dashboard.tsx:15:10
```

**Auto-Fix Sequence:**

```
Auto-fix Attempt 1/3:
  → Analyzing error: Missing import for 'Card'
  → Searching codebase for Card component...
  → Found: src/components/Card.tsx
  → Applying fix: Add import statement

  Diff:
  + import { Card } from './components/Card';

  → Committing: fix: add missing Card import
  → Re-running validation...
  ✓ Validation passed
```

---

### Example 2: Type Error Auto-Fix

**Initial Error:**

```
TASK-DATA-001: Add User Stats Calculation
  → Running validation: npm test -- UserStats.test
  ✗ Type error:
     Property 'name' does not exist on type 'User | undefined'
     at UserStats.tsx:22:15
```

**Auto-Fix Sequence:**

```
Auto-fix Attempt 1/3:
  → Analyzing error: Accessing property on potentially undefined object
  → Applying fix: Add optional chaining

  Diff:
  - const userName = user.name;
  + const userName = user?.name ?? 'Unknown';

  → Re-running validation...
  ✓ Validation passed
```

---

### Example 3: Failed Auto-Fix (Deferred)

**Initial Error:**

```
TASK-API-001: Implement GitHub Sync
  → Running validation: npm test -- GitHubSync.test
  ✗ Test failed: Network request failed (ECONNREFUSED)
```

**Auto-Fix Sequence:**

```
Auto-fix Attempt 1/3:
  → Analyzing error: External service connection failed
  → Applying fix: Add retry logic with exponential backoff
  → Re-running validation...
  ✗ Still failing: Network request failed

Auto-fix Attempt 2/3:
  → Analyzing error: GitHub API not accessible
  → Applying fix: Add timeout and error handling
  → Re-running validation...
  ✗ Still failing: Network request failed

Auto-fix Attempt 3/3:
  → Analyzing error: External dependency unavailable
  → Cannot fix: External service issue
  → Re-running validation...
  ✗ Still failing: Network request failed

✗ TASK-API-001 DEFERRED
Reason: external_blocker
Message: GitHub API unavailable during validation
Recommendation: Retry when external service is available
```

---

## Component Rollback Examples

### Example 1: Selective Component Rollback

**Scenario:** AUTH-001 has AuthModule (✓) and AuthUI (✗). AuthUI has layout bugs.

```bash
# Check component status
/stream  # Completes AuthModule, AuthUI has issues

# List component checkpoints
jq '.tickets[] | select(.id == "AUTH-001") | .components' .sage/tickets/index.json

# Output:
# [
#   {
#     "name": "AuthModule",
#     "checkpoint_id": "abc123",
#     "status": "COMPLETED"
#   },
#   {
#     "name": "AuthUI",
#     "checkpoint_id": "def456",
#     "status": "COMPLETED"
#   }
# ]

# Rollback only AuthUI
/rollback --component=AuthUI

# Output:
# ================================================
# ROLLBACK: Component-Level
# ================================================
# Component: AuthUI
# Checkpoint: def456
#
# This will restore:
#   - Files: src/components/AuthUI.tsx
#            src/styles/auth.css
#   - Tasks: TASK-001-4, TASK-001-5
#
# Proceed? yes
#
# ✓ Files restored from checkpoint def456
# ✓ Component status reset to UNPROCESSED
# ✓ Associated tasks reset to UNPROCESSED
# ✓ AuthModule preserved (still COMPLETED)

# Verify AuthModule still intact
git log --oneline -1 src/auth/module.ts
# abc123 feat: implement auth module

# Re-implement AuthUI with fixes
/stream --ticket=AUTH-001
# Only processes AuthUI component (AuthModule skipped)
```

---

### Example 2: Progressive Rollback

**Scenario:** Three components completed, but Component 2 and 3 need fixes.

```bash
# Initial state
# Component 1: AuthModule (COMPLETED) ✓
# Component 2: AuthUI (COMPLETED) ✗ (has bugs)
# Component 3: AuthIntegration (COMPLETED) ✗ (depends on Component 2)

# Rollback Component 3 first
/rollback --component=AuthIntegration --force

# Then rollback Component 2
/rollback --component=AuthUI --force

# Current state
# Component 1: AuthModule (COMPLETED) ✓
# Component 2: AuthUI (UNPROCESSED)
# Component 3: AuthIntegration (UNPROCESSED)

# Re-implement Components 2 and 3
/stream --ticket=AUTH-001
# Skips Component 1, processes Components 2 and 3
```

---

## Testing Scenarios

### Test Case 1: StateFlow Validation

**Setup:**

```bash
# Create test ticket
cat > .sage/tickets/TEST-STATEFLOW.json <<EOF
{
  "id": "TEST-001",
  "validation_type": "stateflow",
  "tasks": [
    {
      "id": "TEST-001-1",
      "description": "Login flow test",
      "validation_script": "npm test -- LoginFlow.test"
    }
  ]
}
EOF
```

**Test Execution:**

```bash
/stream --ticket=TEST-001
```

**Expected Behavior:**

1. Implement login flow
2. Run validation: `npm test -- LoginFlow.test`
3. If missing conditional: Auto-fix adds `{isLoggedIn && ...}`
4. Re-run validation → Pass
5. Commit with message: `feat: implement login flow`

---

### Test Case 2: Content Validation with Edge Case

**Setup:**

```bash
# Create ticket with division by zero edge case
cat > .sage/tickets/TEST-CONTENT.json <<EOF
{
  "id": "TEST-002",
  "validation_type": "content",
  "tasks": [
    {
      "id": "TEST-002-1",
      "description": "Percentage calculation",
      "validation_script": "npm test -- Percentage.test"
    }
  ],
  "validation_config": {
    "fields": [
      {
        "name": "completion_pct",
        "formula": "(completed / total) * 100",
        "edge_cases": ["total == 0"]
      }
    ]
  }
}
EOF
```

**Test Execution:**

```bash
/stream --ticket=TEST-002
```

**Expected Auto-Fix:**

```typescript
// Before (causes division by zero)
const percentage = (completed / total) * 100;

// After (auto-fixed)
const percentage = total === 0 ? 0 : (completed / total) * 100;
```

---

### Test Case 3: Defer Mechanism

**Setup:**

```bash
# Create ticket that will fail validation persistently
cat > .sage/tickets/TEST-DEFER.json <<EOF
{
  "id": "TEST-003",
  "tasks": [
    {
      "id": "TEST-003-1",
      "description": "External API integration",
      "validation_script": "npm test -- ExternalAPI.test",
      "auto_fix": true,
      "max_retries": 3
    }
  ]
}
EOF

# Create test that always fails (simulates external service down)
cat > tests/ExternalAPI.test.ts <<EOF
test('External API connection', async () => {
  const response = await fetch('http://unavailable-service.com');
  expect(response.ok).toBe(true); // Always fails
});
EOF
```

**Test Execution:**

```bash
/stream --ticket=TEST-003
```

**Expected Behavior:**

```
Processing TEST-003-1...
  → Validation failed
  → Auto-fix attempt 1/3 → Failed
  → Auto-fix attempt 2/3 → Failed
  → Auto-fix attempt 3/3 → Failed
  ✗ TASK DEFERRED

Defer Reason:
  Category: external_blocker
  Message: External service unavailable
  Attempts: 3
```

---

### Test Case 4: Component-Level Rollback

**Setup:**

```bash
# Create ticket with two components
/migrate  # Generates AUTH-001 with AuthModule + AuthUI components

# Run stream and accept AuthModule, reject AuthUI
/stream --ticket=AUTH-001
# At AuthModule confirmation: Press 'c' (continue)
# At AuthUI confirmation: Press 'r' (rollback)
```

**Expected Behavior:**

```
Component AuthModule: COMPLETED
  Options: [c]ontinue / [r]ollback / [q]uit
  Choice: c
  ✓ AuthModule checkpoint saved

Component AuthUI: COMPLETED
  Options: [c]ontinue / [r]ollback / [q]uit
  Choice: r

  Rolling back component AuthUI...
  ✓ Files restored from checkpoint
  ✓ Component status: UNPROCESSED
  ✓ Tasks reset: TASK-001-4, TASK-001-5

Final State:
  AuthModule: COMPLETED
  AuthUI: UNPROCESSED

Ticket Status: IN_PROGRESS
```

---

## Parallel Execution Examples

### Example 1: Parallel Auto Mode with 3 Workers

**Scenario:** Process 9 independent tickets concurrently using 3 workers

**Setup:**

```bash
# Tickets available (all independent, no dependencies):
# - AUTH-001: Implement login form
# - AUTH-002: Implement logout button
# - UI-001: Add dashboard layout
# - UI-002: Add settings page
# - UI-003: Add profile widget
# - API-001: Create user endpoint
# - API-002: Create project endpoint
# - API-003: Create task endpoint
# - DB-001: Add user migrations
```

**Execute with Parallel Mode:**

```bash
/stream --auto --parallel=3
```

**Execution Flow:**

```
================================================
DEVSTREAM EXECUTION MODE: auto
PARALLEL EXECUTION: 3 workers
================================================
⚠️  AUTO MODE: No confirmations, fully automated
⚡ PARALLEL: Processing multiple tickets concurrently
   Workers: 3
   ⚠️  High token usage - ensure adequate API limits
================================================

Building dependency graph for parallel execution...
✓ Dependency graph built successfully
  Workers allocated: 3
  Tickets available: 9

Parallel Execution Plan:
  Estimated batches: 3
  Tickets/batch:     3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BATCH 1/3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ Parallel Batch Selected ──────────────────────┐
│ Batch size: 3 tickets
│ Tickets: AUTH-001 AUTH-002 UI-001
└─────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│     LAUNCHING PARALLEL WORKER BATCH            │
└────────────────────────────────────────────────┘

→ Launching Worker 1 for ticket AUTH-001...
  ✓ Worker 1 started (PID: 45231)

→ Launching Worker 2 for ticket AUTH-002...
  ✓ Worker 2 started (PID: 45232)

→ Launching Worker 3 for ticket UI-001...
  ✓ Worker 3 started (PID: 45233)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All 3 workers launched, monitoring progress...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Worker 1 completed: AUTH-001 (Duration: 4m 32s)
✅ Worker 3 completed: UI-001 (Duration: 5m 12s)
✅ Worker 2 completed: AUTH-002 (Duration: 5m 45s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Batch Execution Complete:
  Completed: 3
  Deferred:  0
  Duration:  5m 45s (wall time)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Processing commit queue (serializing commits)...
┌─ Processing Commit Queue ──────────────────────┐
│ Processed: 3 commits
│ Failed:    0 commits
└────────────────────────────────────────────────┘
✓ 3 commits applied

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BATCH 2/3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[... similar output for UI-002, UI-003, API-001 ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BATCH 3/3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[... similar output for API-002, API-003, DB-001 ...]

╔════════════════════════════════════════════════╗
║      DEVELOPMENT CYCLE COMPLETE ✅             ║
╚════════════════════════════════════════════════╝

Cycle Duration: 18m 32s (wall time)

┌─ Ticket Summary ───────────────────────────────┐
│                                                │
│  Total Tickets:    9
│  Completed:        9 (100%)
│  In Progress:      0
│  Deferred:         0
│  Unprocessed:      0
│                                                │
└────────────────────────────────────────────────┘

┌─ Parallel Execution Metrics ───────────────────┐
│                                                │
│  Workers:          3
│  Total Batches:    3
│  Avg Batch Time:   6m 11s
│  Commits Applied:  9
│                                                │
│  Time Saved:       ~37 minutes
│  Efficiency:       2.5× faster than sequential
│                                                │
└────────────────────────────────────────────────┘

Completed This Cycle:
  ✅ AUTH-001: Implement login form (4m 32s)
  ✅ AUTH-002: Implement logout button (5m 45s)
  ✅ UI-001: Add dashboard layout (5m 12s)
  ✅ UI-002: Add settings page (6m 03s)
  ✅ UI-003: Add profile widget (5m 54s)
  ✅ API-001: Create user endpoint (6m 22s)
  ✅ API-002: Create project endpoint (6m 45s)
  ✅ API-003: Create task endpoint (5m 58s)
  ✅ DB-001: Add user migrations (4m 21s)
```

**Performance Comparison:**

| Metric | Sequential | Parallel (3 workers) | Improvement |
|--------|-----------|---------------------|-------------|
| Total time | ~55 minutes | ~18.5 minutes | 2.97× faster |
| Tickets/hour | 9.8 | 29.2 | 2.97× |
| Token usage | 1× | 3× peak | N/A |

### Example 2: Auto-Detect Worker Count

**Scenario:** Let system auto-detect optimal worker count based on CPU

**Execute:**

```bash
/stream --auto --parallel=auto
```

**Output:**

```
Building dependency graph for parallel execution...
✓ Dependency graph built successfully
  Workers allocated: 4 (auto-detected from 8 CPU cores)
  Tickets available: 15

Parallel Execution Plan:
  Estimated batches: 4
  Tickets/batch:     4 (last batch: 3)
```

### Example 3: Handling Dependencies in Parallel Mode

**Scenario:** Mixed dependent and independent tickets

**Ticket Structure:**

```
AUTH-001 (no dependencies)
AUTH-002 (no dependencies)
UI-001 (depends on AUTH-001)
UI-002 (no dependencies)
API-001 (depends on AUTH-001, AUTH-002)
```

**Execute:**

```bash
/stream --auto --parallel=3
```

**Dependency Resolution:**

```
BATCH 1: AUTH-001, AUTH-002, UI-002  (3 independent tickets)
  → AUTH-001 and AUTH-002 must complete before UI-001 and API-001

BATCH 2: UI-001, API-001  (2 tickets, dependencies now satisfied)
  → Runs with 2 workers (no 3rd independent ticket available)
```

**Key Insight:** Parallel mode automatically handles dependencies by batching only independent tickets.

### Example 4: Partial Batch with Deferrals

**Scenario:** One worker fails, others succeed

**Execute:**

```bash
/stream --auto --parallel=3
```

**Output:**

```
┌─ Parallel Batch Selected ──────────────────────┐
│ Batch size: 3 tickets
│ Tickets: TEST-001 TEST-002 TEST-003
└─────────────────────────────────────────────────┘

✅ Worker 1 completed: TEST-001
⚠️  Worker 2 deferred: TEST-002 (persistent_test_failure)
✅ Worker 3 completed: TEST-003

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Batch Execution Complete:
  Completed: 2
  Deferred:  1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Processing commit queue (serializing commits)...
✓ 2 commits applied

Deferred Tickets (Need Review):
  ⚠️  TEST-002: Validation failed after 3 retries
```

**Outcome:** Successful tickets committed, deferred ticket logged for manual review.

---

## Summary

This examples document demonstrates:

✅ **Complete Workflows**: End-to-end examples from /specify to /stream completion

✅ **Validation Types**: Real-world examples of all 5 validation types

✅ **Sub-Task Processing**: Multi-task tickets with atomic commits

✅ **Auto-Fix Loops**: Successful and failed auto-fix scenarios

✅ **Component Rollback**: Granular rollback preserving working components

✅ **Testing Scenarios**: Reproducible test cases for validation

✅ **Error Handling**: Defer mechanism with categorized reasons

✅ **Parallel Execution**: Concurrent ticket processing with auto/manual worker allocation

For detailed reference documentation, see:
- `TICKET_TYPES.md` - Ticket type system reference
- `VALIDATION_FRAMEWORK.md` - Validation architecture
- `VALIDATORS.md` - Validator implementations
- Command-specific docs: `migrate.md`, `stream.md`, `validate.md`, `quality.md`, `repair.md`, `rollback.md`
