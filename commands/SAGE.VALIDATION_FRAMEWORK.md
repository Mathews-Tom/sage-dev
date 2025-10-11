# Validation Framework Reference

**Purpose:** Comprehensive guide to the sage-dev validation system, including validation scripts, specialized validators, and auto-fix loops.

**Last Updated:** 2025-10-04

---

## Overview

The validation framework provides:

1. **Validation Scripts** - Automated verification of implementation correctness
2. **Specialized Validators** - Type-specific validation strategies
3. **Auto-Fix Loops** - Autonomous error correction with retry logic
4. **Defer Mechanisms** - Graceful handling of persistent failures

---

## Validation Script System

### Purpose

Validation scripts are executable commands that verify implementation correctness after a task is completed.

### Structure

```yaml
validation_scripts:
  - name: "descriptive_name"
    command: "executable_command"
    success_pattern: "regex_or_string"
    failure_action: "auto_fix | defer | fail"
    timeout: 300  # seconds, optional
    retries: 3    # max retry attempts, optional
```

### Example

```yaml
verification_scripts:
  - name: "unit_tests"
    command: "npm test -- AuthFlow.test.tsx"
    success_pattern: "All tests passed"
    failure_action: "auto_fix"
    timeout: 120
    retries: 3

  - name: "lint_check"
    command: "npm run lint"
    success_pattern: "no errors"
    failure_action: "auto_fix"
    timeout: 60
    retries: 2

  - name: "build_verification"
    command: "npm run build"
    success_pattern: "build successful"
    failure_action: "defer"
    timeout: 300
    retries: 1
```

### Success Pattern Matching

**Exact String Match:**

```yaml
success_pattern: "All tests passed"
```

**Regex Pattern:**

```yaml
success_pattern: "✓.*passed|OK.*tests"
```

**Exit Code Only:**

```yaml
success_pattern: ""  # Empty = check exit code only (0 = success)
```

### Failure Actions

1. **`auto_fix`** - Trigger auto-fix loop (analyze error, generate fix, retry)
2. **`defer`** - Mark task as deferred, log reason, continue to next task
3. **`fail`** - Stop processing, mark ticket as failed

---

## Specialized Validators

### Overview

Validators are type-specific strategies for verifying implementation correctness.

Each validation type has:

- Specific validation checks
- Appropriate auto-fix strategies
- Custom defer logic

### Validator Types

#### 1. StateFlowValidator

**Purpose:** Validate stateful behavior chains and UI cascades

**Validation Checks:**

- State transition execution
- Downstream UI updates
- Cascade effect propagation
- State consistency verification

**Auto-Fix Capabilities:**

- Add missing conditionals (e.g., `isAuthenticated &&`)
- Fix handler references
- Correct useEffect dependencies
- Add missing state updates

**Example Configuration:**

```yaml
validation_type: stateflow
validation_config:
  validator: StateFlowValidator
  state_paths:
    - name: "admin_auth"
      initial_state: "logged_out"
      transitions:
        - trigger: "login(admin)"
          expected_effects:
            - "admin_nav_visible"
            - "protected_routes_accessible"
            - "vendor_cache_loaded"
          verification:
            - check: "element_visible"
              target: "#admin-nav"
            - check: "route_accessible"
              target: "/admin/dashboard"
            - check: "cache_loaded"
              target: "vendorCache.isLoaded"

  verification_methods:
    - "check_element_visibility"    # screen.getByText()
    - "verify_route_access"         # window.location.pathname
    - "validate_cache_state"        # check state variables
    - "verify_class_changes"        # element.classList.contains()

  auto_fix_patterns:
    - pattern: "missing_conditional"
      fix: "add_auth_check"
    - pattern: "broken_cascade"
      fix: "fix_useEffect_deps"
    - pattern: "wrong_handler"
      fix: "update_onClick"

  max_retries: 3
```

**Validation Flow:**

```plaintext
INITIALIZE_BASE_STATE
  ↓
EXECUTE_STATE_TRANSITION (programmatically)
  ↓
WAIT_FOR_RENDER_CYCLE
  ↓
CAPTURE_RESULTING_UI_STATE
  ↓
VERIFY_EXPECTED_CHANGES
  ↓
verification_pass?
  | NO
  ↓
IDENTIFY_PROBLEM (missing element, wrong visibility, broken cascade)
  ↓
FIX_STATE_LOGIC (update handler, fix condition, correct state flow)
  ↓
TEST_FIX
  ↓
fix_works? --NO-→ RETRY (max 3) --FAIL-→ DEFER
  | YES
  ↓
COMMIT_ATOMIC_FIX
  ↓
MARK_TRANSITION_VALIDATED
```

---

#### 2. ContentValidator

**Purpose:** Validate field data, calculations, and displayed values

**Validation Checks:**

- Data source existence (variable/API/prop defined)
- Calculation correctness (formula validation)
- Variable accessibility
- Edge case handling (null, division by zero)
- Output format matching

**Auto-Fix Capabilities:**

- Fix calculation formulas
- Add missing null checks
- Correct variable references
- Fix division by zero handling

**Example Configuration:**

```yaml
validation_type: content
validation_config:
  validator: ContentValidator
  fields:
    - name: "completion_percentage"
      data_source:
        type: "calculated"
        formula: "(completed / total) * 100"
        variables:
          - name: "completed"
            source: "state.completedCount"
            required: true
          - name: "total"
            source: "state.totalCount"
            required: true
      edge_cases:
        - condition: "total === 0"
          expected_output: "0%"
          handling: "return_zero"
      output_format:
        pattern: "\\d+\\.\\d+%"
        example: "67.5%"
      validation_checks:
        - "variable_exists: completed"
        - "variable_exists: total"
        - "formula_correct: (completed / total) * 100"
        - "null_check_present"
        - "division_by_zero_handled"

  verification_scripts:
    - name: "verify_calculation"
      command: "npm test -- CompletionWidget.test"
      success_pattern: "percentage calculation ✓"

  auto_fix_patterns:
    - pattern: "missing_null_check"
      fix: "add_null_guard"
    - pattern: "wrong_formula"
      fix: "correct_calculation"
    - pattern: "undefined_variable"
      fix: "add_variable_declaration"

  max_retries: 3
```

**Validation Flow:**

```plaintext
EXTRACT_ALL_DATA_FIELDS
  ↓
SELECT_NEXT_FIELD
  ↓
ANALYZE_FIELD_SOURCE (variable binding, calculation logic)
  ↓
TRACE_DATA_SOURCE (API call, state, prop, computed)
  ↓
EXTRACT_CALCULATION_LOGIC
  ↓
VERIFY_LOGIC_CORRECTNESS
  ↓
validation_pass? --NO-→ FIX_CALCULATION → TEST_FIX → RETRY (max 3)
  | YES
  ↓
MARK_FIELD_VALIDATED
```

---

#### 3. InteractiveValidator

**Purpose:** Validate interactive elements (buttons, links, forms)

**Validation Checks:**

- Handler existence (function/route defined in codebase)
- Target reachability (file/component/route exists)
- Parameter correctness (function signature matches)
- Navigation validity (route exists in routing config)
- Event binding correctness

**Auto-Fix Capabilities:**

- Fix handler references
- Update onClick to correct function
- Add missing event handlers
- Correct navigation targets

**Example Configuration:**

```yaml
validation_type: interactive
validation_config:
  validator: InteractiveValidator
  elements:
    - type: "button"
      id: "login-button"
      handler:
        name: "handleLogin"
        file: "src/components/Auth/LoginForm.tsx"
        signature: "(e: React.MouseEvent) => void"
      target:
        type: "api"
        endpoint: "/api/auth/login"
        method: "POST"
      validation_checks:
        - "handler_exists"
        - "handler_signature_correct"
        - "endpoint_defined"
        - "method_allowed"

    - type: "link"
      id: "dashboard-link"
      handler:
        type: "navigation"
        target: "/dashboard"
      validation_checks:
        - "route_exists"
        - "route_accessible"
        - "component_exists"

  verification_scripts:
    - name: "verify_handlers"
      command: "npm test -- InteractiveElements.test"
      success_pattern: "handlers ✓"

  auto_fix_patterns:
    - pattern: "handler_not_found"
      fix: "create_handler_stub"
    - pattern: "wrong_signature"
      fix: "update_handler_signature"
    - pattern: "broken_link"
      fix: "fix_route_reference"

  max_retries: 3
```

**Validation Flow:**

```plaintext
EXTRACT_ALL_INTERACTIVE_ELEMENTS
  ↓
SELECT_NEXT_ELEMENT
  ↓
ANALYZE_ELEMENT_CODE (onClick, href, onSubmit)
  ↓
VALIDATE_TARGET_EXISTS (route/function/endpoint)
  ↓
validation_pass? --NO-→ FIX_ELEMENT → TEST_FIX → RETRY (max 3)
  | YES
  ↓
MARK_ELEMENT_VALIDATED
```

---

#### 4. IntegrationValidator

**Purpose:** Validate external integrations and GitHub issue processing

**Validation Checks:**

- Dependency availability (modules, services, APIs)
- Integration point existence
- Authentication configuration
- Error handling completeness
- Data mapping correctness

**Auto-Fix Capabilities:**

- Limited (most integrations require manual review)
- Can fix missing error handlers
- Can add basic retry logic
- Can correct data mapping

**Example Configuration:**

```yaml
validation_type: integration
validation_config:
  validator: IntegrationValidator
  integrations:
    - service: "github"
      endpoints:
        - path: "/repos/{owner}/{repo}/issues"
          method: "GET"
          auth: "bearer_token"
      dependencies:
        - "octokit"
        - "@octokit/rest"
      error_handling:
        - type: "rate_limit"
          strategy: "exponential_backoff"
        - type: "auth_failure"
          strategy: "throw_error"
        - type: "network_timeout"
          strategy: "retry_3x"
      data_mapping:
        - source: "github.issue.title"
          target: "ticket.title"
        - source: "github.issue.body"
          target: "ticket.description"

  verification_scripts:
    - name: "verify_integration"
      command: "npm test -- GitHubIntegration.test"
      success_pattern: "integration ✓"

  auto_fix: false  # Manual review required for integrations
  max_retries: 1
```

**Validation Flow:**

```plaintext
CHECK_DEPENDENCIES
  ↓
dependencies_met? --NO-→ DEFER (missing_dependencies)
  | YES
  ↓
VALIDATE_INTEGRATION_POINTS
  ↓
TEST_ERROR_HANDLING
  ↓
VERIFY_DATA_MAPPING
  ↓
validation_pass? --NO-→ DEFER (requires manual review)
  | YES
  ↓
MARK_INTEGRATION_VALIDATED
```

---

#### 5. GenericValidator

**Purpose:** Standard implementation validation (default)

**Validation Checks:**

- Test suite execution
- Code syntax and lint checks
- Build verification
- Basic functionality tests

**Auto-Fix Capabilities:**

- Fix lint errors
- Correct syntax issues
- Update import statements
- Fix type errors

**Example Configuration:**

```yaml
validation_type: generic
validation_config:
  validator: GenericValidator
  verification_scripts:
    - name: "run_tests"
      command: "npm test"
      success_pattern: "All tests passed"
      failure_action: "auto_fix"

    - name: "lint_check"
      command: "npm run lint"
      success_pattern: "no errors"
      failure_action: "auto_fix"

    - name: "type_check"
      command: "npm run type-check"
      success_pattern: "no errors"
      failure_action: "auto_fix"

    - name: "build"
      command: "npm run build"
      success_pattern: "build successful"
      failure_action: "defer"

  auto_fix: true
  max_retries: 3
```

---

## Auto-Fix Loop

### Purpose

Automatically analyze failures, generate fixes, and retry validation without manual intervention.

### Flow

```plaintext
IMPLEMENT_TASK
  ↓
RUN_VALIDATION_SCRIPTS
  ↓
all_scripts_pass?
  | NO
  ↓
COLLECT_FAILURE_DATA
  (error messages, stack traces, test output)
  ↓
ANALYZE_FAILURE
  (identify root cause, determine fix strategy)
  ↓
GENERATE_FIX
  (code changes based on error analysis)
  ↓
APPLY_FIX
  (edit files, update code)
  ↓
COMMIT_FIX
  (atomic commit with fix description)
  ↓
RERUN_VALIDATION_SCRIPTS
  ↓
all_scripts_pass?
  | NO
  ↓
retry_count < max_retries? (default: 3)
  | YES → loop back to ANALYZE_FAILURE
  | NO
  ↓
DEFER_TASK
  (log reason: persistent_test_failure)
  ↓
CONTINUE_NEXT_TASK
```

### Example Auto-Fix Scenarios

#### Scenario 1: Missing Import

**Error:**

```
ReferenceError: useState is not defined
```

**Auto-Fix:**

```typescript
// Before
const [count, setCount] = useState(0);

// After
import { useState } from 'react';
const [count, setCount] = useState(0);
```

**Commit:**

```plaintext
fix(TASK-001-1): add missing React import

Auto-fixed: Added useState import from react

Retry: 1/3
```

#### Scenario 2: Broken Conditional

**Error:**

```plaintext
TypeError: Cannot read property 'isAuthenticated' of undefined
```

**Auto-Fix:**

```typescript
// Before
{isAuthenticated && <AdminNav />}

// After
{user?.isAuthenticated && <AdminNav />}
```

**Commit:**

```plaintext
fix(TASK-001-2): add optional chaining for user object

Auto-fixed: Prevent null reference error

Retry: 1/3
```

#### Scenario 3: Calculation Error

**Error:**

```plaintext
Expected "75.0%" but got "NaN%"
```

**Auto-Fix:**

```typescript
// Before
const percentage = (completed / total) * 100;

// After
const percentage = total > 0 ? (completed / total) * 100 : 0;
```

**Commit:**

```plaintext
fix(TASK-042-1): add division by zero check

Auto-fixed: Handle edge case when total is 0

Retry: 1/3
```

---

## Defer Mechanism

### When to Defer

A task is deferred when:

1. Auto-fix attempts exhausted (max_retries reached)
2. Validation script itself fails to execute
3. External dependencies unavailable
4. User rejects component (interactive mode)

### Defer Categories

```yaml
defer_reason:
  category: "persistent_test_failure"
  message: "Unit tests failed after 3 fix attempts"
  attempts: 3
  last_error: "TypeError: Cannot read property 'value' of null"
  validation_output: |
    FAIL src/components/Search.test.tsx
      ● Search › handles input change
        TypeError: Cannot read property 'value' of null
          at SearchInput.tsx:42:15
  deferred_at: "2025-10-04T14:23:00Z"
  retry_after: "manual_review"
```

### Defer Logging

Defers are logged to:

1. Ticket JSON (`state: DEFERRED`, `defer_reason: {...}`)
2. Task status (`status: DEFERRED`)
3. `.sage/defer-log.json` (aggregate defer history)

---

## Best Practices

### 1. Choose Appropriate Validators

✅ **Match validation type to work type:**

```yaml
# Auth flow with cascades
validation_type: stateflow

# Percentage calculations
validation_type: content

# Button handlers
validation_type: interactive
```

### 2. Write Specific Validation Scripts

✅ **Good:**

```yaml
verification_scripts:
  - name: "login_flow_test"
    command: "npm test -- LoginFlow.test.tsx"
    success_pattern: "auth cascade ✓"
```

❌ **Bad:**

```yaml
verification_scripts:
  - name: "tests"
    command: "npm test"
    success_pattern: ""
```

### 3. Enable Auto-Fix Appropriately

✅ **Enable for:**

- Lint errors
- Type errors
- Missing imports
- Syntax errors
- UI cascade fixes

❌ **Disable for:**

- Security-sensitive code
- Data migrations
- External integrations
- Production deployments

### 4. Set Realistic Retry Limits

✅ **Good:**

```yaml
max_retries: 3  # Standard for most tasks
max_retries: 1  # For integrations (manual review)
max_retries: 5  # For flaky tests (with caution)
```

### 5. Use Clear Success Patterns

✅ **Good:**

```yaml
success_pattern: "All tests passed|✓.*passed"
```

❌ **Bad:**

```yaml
success_pattern: ".*"  # Too broad, matches everything
```

---

## Integration with Commands

### `/stream` Command

Executes validation framework during ticket processing:

1. Process task → Run validation scripts
2. If fail → Auto-fix loop (max retries)
3. If still fail → Defer task
4. Continue to next task

### `/validate` Command

Validates the validation configuration:

- Checks validator types are valid
- Verifies scripts are well-formed
- Validates success patterns are regex-compatible
- Ensures failure actions are valid enums

### `/quality` Command

Scores validation configuration quality:

- Verification scripts exist (10 pts)
- Success patterns are specific (10 pts)
- Auto-fix enabled appropriately (10 pts)
- Max retries set reasonably (5 pts)

### `/repair` Command

Fixes broken validation config:

- Adds missing validators (default: GenericValidator)
- Fixes malformed scripts
- Corrects invalid success patterns
- Sets default max_retries (3)

---

## Summary

**Validation Framework Components:**

1. **Validation Scripts** - Executable commands with success/failure patterns
2. **Specialized Validators** - Type-specific validation strategies (5 types)
3. **Auto-Fix Loops** - Autonomous error correction (max 3 retries)
4. **Defer Mechanisms** - Graceful failure handling with categorization

**Validator Types:**

- StateFlowValidator - State transitions & UI cascades
- ContentValidator - Field data & calculations
- InteractiveValidator - Buttons, links, forms
- IntegrationValidator - External integrations
- GenericValidator - Standard implementation

**Key Features:**

- Atomic commits per fix
- Retry limits prevent infinite loops
- Categorized defer reasons
- Extensible validator system

---

For detailed usage, see:

- `TICKET_TYPES.md` - Ticket and validation type reference
- `VALIDATORS.md` - Validator implementation details
- `/stream` - Command that executes validation framework
