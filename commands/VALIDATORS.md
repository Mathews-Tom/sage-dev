# Specialized Validators Implementation Guide

**Purpose:** Detailed implementation specifications for each specialized validator in the sage-dev validation framework.

**Last Updated:** 2025-10-04

---

## Overview

Specialized validators provide type-specific validation strategies with custom auto-fix capabilities. Each validator implements a consistent interface but applies domain-specific logic.

---

## Validator Interface

All validators must implement:

```typescript
interface Validator {
  type: ValidatorType;
  validate(task: Task, context: ValidationContext): ValidationResult;
  autoFix(error: ValidationError, attempt: number): FixResult;
  defer(task: Task, reason: DeferReason): void;
}

type ValidatorType =
  | 'StateFlowValidator'
  | 'ContentValidator'
  | 'InteractiveValidator'
  | 'IntegrationValidator'
  | 'GenericValidator';

interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface FixResult {
  applied: boolean;
  changes: FileChange[];
  commit_message: string;
}
```

---

## 1. StateFlowValidator

### Purpose

Validate stateful behavior chains where state transitions trigger cascading UI changes.

### Use Cases

- Authentication flows (logged_out → logged_in → UI updates)
- User selection cascades (customer selected → projects load → UI filters)
- Theme changes (light → dark → CSS updates → icon switches)
- Wizard flows (step 1 → step 2 → validation → step 3)

### Validation Strategy

**Step 1: Initialize Base State**

```typescript
// Mount component with initial state
render(
  <AuthProvider value={{ isAuthenticated: false, user: null }}>
    <Component />
  </AuthProvider>
);
```

**Step 2: Execute State Transition**

```typescript
// Programmatically trigger state change
act(() => {
  login({ email: 'admin@test.com', password: 'test' });
});
```

**Step 3: Wait for Render Cycle**

```typescript
// React reconciliation, useEffect triggers
await waitFor(() => {
  // Wait for async effects to complete
});
```

**Step 4: Capture Resulting UI State**

```typescript
// Query DOM for expected changes
const adminNav = screen.queryByText('Admin Dashboard');
const protectedRoute = screen.queryByTestId('protected-content');
```

**Step 5: Verify Expected Changes**

```typescript
expect(adminNav).toBeVisible();
expect(protectedRoute).toBeInTheDocument();
expect(vendorCache.isLoaded).toBe(true);
```

### Auto-Fix Patterns

#### Pattern 1: Missing Conditional Rendering

**Error:**

```
Element "Admin Dashboard" not found in document
```

**Root Cause:**

```tsx
// Missing auth check
<AdminNav />
```

**Auto-Fix:**

```tsx
// Add conditional rendering
{isAuthenticated && <AdminNav />}
```

**Implementation:**

```typescript
async autoFix_MissingConditional(error: ValidationError): Promise<FixResult> {
  const element = error.context.element;
  const file = await findComponentFile(element);
  const content = await readFile(file);

  // Find JSX element without auth guard
  const pattern = new RegExp(`<${element}\\s*/>`, 'g');
  const fixed = content.replace(
    pattern,
    `{isAuthenticated && <${element} />}`
  );

  await writeFile(file, fixed);

  return {
    applied: true,
    changes: [{ file, type: 'edit', description: 'Add auth conditional' }],
    commit_message: `fix: add conditional rendering for ${element}`
  };
}
```

#### Pattern 2: Broken useEffect Dependencies

**Error:**

```
Expected cache to be loaded, but vendorCache.isLoaded is false
```

**Root Cause:**

```tsx
useEffect(() => {
  loadVendorCache();
}, []); // Missing dependency: isAuthenticated
```

**Auto-Fix:**

```tsx
useEffect(() => {
  if (isAuthenticated) {
    loadVendorCache();
  }
}, [isAuthenticated]); // Added dependency
```

**Implementation:**

```typescript
async autoFix_BrokenUseEffect(error: ValidationError): Promise<FixResult> {
  const file = error.context.file;
  const content = await readFile(file);

  // Find useEffect with missing dependency
  const pattern = /useEffect\(\(\) => \{[\s\S]*?loadVendorCache\(\);[\s\S]*?\}, \[\]\)/;
  const fixed = content.replace(
    pattern,
    `useEffect(() => {
  if (isAuthenticated) {
    loadVendorCache();
  }
}, [isAuthenticated])`
  );

  await writeFile(file, fixed);

  return {
    applied: true,
    changes: [{ file, type: 'edit', description: 'Fix useEffect deps' }],
    commit_message: `fix: add isAuthenticated to useEffect dependencies`
  };
}
```

#### Pattern 3: Wrong Event Handler

**Error:**

```
Expected navigation to /admin/dashboard, but pathname is /
```

**Root Cause:**

```tsx
<button onClick={handleLogout}>Admin Dashboard</button>
// Wrong handler - should navigate, not logout
```

**Auto-Fix:**

```tsx
<button onClick={() => navigate('/admin/dashboard')}>Admin Dashboard</button>
```

### Configuration Example

```yaml
validation_type: stateflow
validation_config:
  validator: StateFlowValidator

  state_paths:
    - name: "admin_authentication"
      initial_state:
        auth: false
        user: null
        cache: "empty"

      transition:
        trigger: "login(admin)"
        method: "programmatic"  # vs "user_interaction"

      expected_effects:
        - type: "ui_element"
          action: "appears"
          selector: "text=Admin Dashboard"
          timeout: 2000

        - type: "route"
          action: "accessible"
          path: "/admin/dashboard"

        - type: "state_variable"
          variable: "vendorCache.isLoaded"
          value: true

        - type: "css_class"
          element: "#main-nav"
          class: "admin-mode"

      verification_method: "react-testing-library"

  auto_fix_patterns:
    - pattern: "missing_conditional"
      detection: "Element not found|not in document"
      fix_strategy: "add_auth_guard"

    - pattern: "broken_cascade"
      detection: "cache not loaded|useEffect"
      fix_strategy: "fix_dependencies"

    - pattern: "wrong_handler"
      detection: "pathname|navigate"
      fix_strategy: "update_onClick"

  max_retries: 3
  defer_on_persistent_failure: true
```

---

## 2. ContentValidator

### Purpose

Validate field data, calculations, and displayed values for correctness.

### Use Cases

- Percentage calculations (completion, progress)
- Counter displays (tasks completed, items remaining)
- Aggregated statistics (totals, averages, sums)
- Formatted data (currency, dates, percentages)
- Computed values (derived from multiple sources)

### Validation Strategy

**Step 1: Extract Data Field**

```typescript
const element = screen.getByTestId('completion-percentage');
const displayedValue = element.textContent; // "75.0%"
```

**Step 2: Trace Data Source**

```typescript
// Find variable binding in source code
const binding = await traceBinding(element);
// Result: { variable: 'completionPct', source: 'state' }
```

**Step 3: Extract Calculation Logic**

```typescript
// Find calculation in component
const calculation = await findCalculation('completionPct');
// Result: { formula: '(completed / total) * 100' }
```

**Step 4: Verify Variables Exist**

```typescript
const variables = extractVariables(calculation.formula);
// ['completed', 'total']

for (const v of variables) {
  assert(variableExists(v), `Variable ${v} not found`);
}
```

**Step 5: Validate Formula Correctness**

```typescript
// Check math logic
const expected = (10 / 100) * 100; // 10%
const actual = evaluate(calculation.formula, { completed: 10, total: 100 });
assert(expected === actual, 'Formula incorrect');
```

**Step 6: Check Edge Cases**

```typescript
// Division by zero
const result = evaluate(calculation.formula, { completed: 0, total: 0 });
assert(!isNaN(result), 'Division by zero not handled');
```

### Auto-Fix Patterns

#### Pattern 1: Missing Null Check

**Error:**

```
TypeError: Cannot read property 'length' of undefined
```

**Root Cause:**

```typescript
const count = items.length; // items might be undefined
```

**Auto-Fix:**

```typescript
const count = items?.length ?? 0; // Add optional chaining and nullish coalescing
```

**Implementation:**

```typescript
async autoFix_MissingNullCheck(error: ValidationError): Promise<FixResult> {
  const file = error.context.file;
  const variable = error.context.variable; // 'items'
  const content = await readFile(file);

  // Find variable usage without null check
  const pattern = new RegExp(`\\b${variable}\\.\\w+`, 'g');
  const fixed = content.replace(
    pattern,
    (match) => {
      const prop = match.split('.')[1];
      return `${variable}?.${prop} ?? 0`;
    }
  );

  await writeFile(file, fixed);

  return {
    applied: true,
    changes: [{ file, type: 'edit', description: 'Add null check' }],
    commit_message: `fix: add null check for ${variable}`
  };
}
```

#### Pattern 2: Wrong Calculation Formula

**Error:**

```text
Expected 75% but got 7500%
```

**Root Cause:**

```typescript
const percentage = completed / total; // Missing * 100
```

**Auto-Fix:**

```typescript
const percentage = (completed / total) * 100; // Correct formula
```

**Implementation:**

```typescript
async autoFix_WrongFormula(error: ValidationError): Promise<FixResult> {
  const file = error.context.file;
  const variable = error.context.variable;
  const content = await readFile(file);

  // Find percentage calculation missing * 100
  const pattern = new RegExp(
    `const\\s+${variable}\\s*=\\s*([^;]+)\\s*/\\s*([^;]+);`
  );

  const fixed = content.replace(
    pattern,
    `const ${variable} = ($1 / $2) * 100;`
  );

  await writeFile(file, fixed);

  return {
    applied: true,
    changes: [{ file, type: 'edit', description: 'Fix percentage formula' }],
    commit_message: `fix: correct percentage calculation for ${variable}`
  };
}
```

#### Pattern 3: Division by Zero

**Error:**

```
Result is NaN (division by zero)
```

**Root Cause:**

```typescript
const percentage = (completed / total) * 100; // No zero check
```

**Auto-Fix:**

```typescript
const percentage = total > 0 ? (completed / total) * 100 : 0;
```

**Implementation:**

```typescript
async autoFix_DivisionByZero(error: ValidationError): Promise<FixResult> {
  const file = error.context.file;
  const formula = error.context.formula;
  const divisor = error.context.divisor; // 'total'
  const content = await readFile(file);

  // Wrap division in ternary with zero check
  const pattern = new RegExp(`(\\([^)]+\\s*/\\s*${divisor}\\s*\\)[^;]*)`);
  const fixed = content.replace(
    pattern,
    `${divisor} > 0 ? $1 : 0`
  );

  await writeFile(file, fixed);

  return {
    applied: true,
    changes: [{ file, type: 'edit', description: 'Add division by zero check' }],
    commit_message: `fix: handle division by zero in calculation`
  };
}
```

### Configuration Example

```yaml
validation_type: content
validation_config:
  validator: ContentValidator

  fields:
    - name: "completion_percentage"
      display_element: "[data-testid='completion-pct']"

      data_source:
        type: "calculated"
        formula: "(completed / total) * 100"
        variables:
          - name: "completed"
            source: "state.completedCount"
            type: "number"
            required: true
          - name: "total"
            source: "state.totalCount"
            type: "number"
            required: true

      edge_cases:
        - condition: "total === 0"
          expected_output: "0%"
          handling_required: true
        - condition: "completed === null"
          expected_output: "0%"
          handling_required: true

      output_format:
        type: "percentage"
        pattern: "\\d+\\.\\d+%"
        example: "75.0%"

      validation_checks:
        - type: "variable_exists"
          variables: ["completed", "total"]
        - type: "formula_correct"
          expected: "(completed / total) * 100"
        - type: "null_check_present"
        - type: "division_by_zero_handled"
        - type: "output_format_matches"

  auto_fix_patterns:
    - pattern: "missing_null_check"
      detection: "undefined|null"
      fix_strategy: "add_optional_chaining"

    - pattern: "wrong_formula"
      detection: "7500%|0\\.75%"
      fix_strategy: "correct_calculation"

    - pattern: "division_by_zero"
      detection: "NaN|Infinity"
      fix_strategy: "add_zero_check"

  max_retries: 3
```

---

## 3. InteractiveValidator

### Purpose

Validate interactive elements (buttons, links, forms) have correct handlers and targets.

### Use Cases

- Button click handlers
- Link navigation
- Form submissions
- Event handler wiring
- Route accessibility

### Validation Strategy

**Step 1: Extract Interactive Elements**

```typescript
const buttons = await findElements('[role="button"]');
const links = await findElements('a[href]');
const forms = await findElements('form');
```

**Step 2: Analyze Element Code**

```typescript
for (const button of buttons) {
  const handler = button.getAttribute('onclick');
  const dataHandler = button.getAttribute('data-handler');
  // Extract handler name from React props
}
```

**Step 3: Validate Handler Exists**

```typescript
const handlerName = 'handleCreateProject';
const handlerExists = await grepCodebase(handlerName);
assert(handlerExists, `Handler ${handlerName} not found`);
```

**Step 4: Validate Target Exists**

```typescript
// For navigation
const route = '/admin/projects';
const routeExists = await checkRouteConfig(route);
assert(routeExists, `Route ${route} not defined`);

// For API calls
const endpoint = '/api/projects';
const endpointExists = await checkAPIRoutes(endpoint);
assert(endpointExists, `Endpoint ${endpoint} not found`);
```

**Step 5: Validate Parameters**

```typescript
const handlerSignature = await getHandlerSignature(handlerName);
const expectedSignature = '(e: React.MouseEvent) => void';
assert(handlerSignature === expectedSignature, 'Handler signature mismatch');
```

### Auto-Fix Patterns

#### Pattern 1: Handler Not Found

**Error:**

```
Handler 'handleSubmit' not found in codebase
```

**Auto-Fix:**

```typescript
// Create handler stub
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // TODO: Implement submit logic
};
```

#### Pattern 2: Broken Navigation

**Error:**

```text
Route '/dashbord' not found (typo)
```

**Auto-Fix:**

```tsx
// Fix typo
<Link to="/dashboard">Dashboard</Link>
```

#### Pattern 3: Wrong Event Signature

**Error:**

```text
Expected (e: React.MouseEvent) => void, got (e: MouseEvent) => void
```

**Auto-Fix:**

```typescript
// Update signature
const handleClick = (e: React.MouseEvent) => {
  // ...
};
```

### Configuration Example

```yaml
validation_type: interactive
validation_config:
  validator: InteractiveValidator

  elements:
    - type: "button"
      selector: "[data-testid='create-project']"

      handler:
        name: "handleCreateProject"
        file: "src/components/Projects/ProjectList.tsx"
        signature: "(e: React.MouseEvent) => void"

      target:
        type: "api"
        endpoint: "/api/projects"
        method: "POST"

      validation_checks:
        - "handler_exists"
        - "handler_signature_correct"
        - "endpoint_defined_in_api_routes"
        - "method_allowed"

    - type: "link"
      selector: "a[href='/admin']"

      handler:
        type: "navigation"
        target: "/admin"

      validation_checks:
        - "route_exists_in_router"
        - "route_accessible"
        - "component_exists"

  auto_fix_patterns:
    - pattern: "handler_not_found"
      fix_strategy: "create_handler_stub"

    - pattern: "broken_navigation"
      fix_strategy: "fix_route_typo"

    - pattern: "wrong_signature"
      fix_strategy: "update_handler_type"

  max_retries: 3
```

---

## 4. IntegrationValidator

### Purpose

Validate external integrations (GitHub, APIs, services).

### Use Cases

- GitHub API integration
- Third-party service connections
- External API calls
- Webhook handlers
- OAuth flows

### Validation Strategy

**Step 1: Check Dependencies**

```typescript
const dependencies = ['octokit', '@octokit/rest'];
for (const dep of dependencies) {
  assert(await packageInstalled(dep), `Dependency ${dep} missing`);
}
```

**Step 2: Validate Configuration**

```typescript
const config = await readConfig();
assert(config.github.token, 'GitHub token not configured');
assert(config.github.owner, 'GitHub owner not configured');
```

**Step 3: Test Connection**

```typescript
const client = new Octokit({ auth: config.github.token });
const response = await client.rest.repos.get({
  owner: config.github.owner,
  repo: config.github.repo
});
assert(response.status === 200, 'GitHub API connection failed');
```

**Step 4: Validate Error Handling**

```typescript
const code = await readFile('src/services/github.ts');
assert(code.includes('rate_limit'), 'Rate limit handling missing');
assert(code.includes('catch'), 'Error handling missing');
```

### Auto-Fix: Limited

Integration validators have **limited auto-fix** capabilities:

- Can add missing error handlers
- Can add retry logic
- Cannot fix authentication issues (require manual review)

### Configuration Example

```yaml
validation_type: integration
validation_config:
  validator: IntegrationValidator

  integrations:
    - service: "github"
      dependencies:
        - "octokit"
        - "@octokit/rest"

      configuration:
        - key: "GITHUB_TOKEN"
          env: true
          required: true
        - key: "GITHUB_OWNER"
          env: true
          required: true

      endpoints:
        - path: "/repos/{owner}/{repo}/issues"
          method: "GET"
          auth: "bearer"

      error_handling_required:
        - type: "rate_limit"
          strategy: "exponential_backoff"
        - type: "auth_failure"
          strategy: "throw_error"
        - type: "network_timeout"
          strategy: "retry_3x"

  verification_scripts:
    - name: "test_github_connection"
      command: "npm test -- GitHubIntegration.test"

  auto_fix: false
  max_retries: 1
  defer_on_failure: true
```

---

## 5. GenericValidator

### Purpose

Standard implementation validation for general tasks.

### Validation Strategy

**Step 1: Run Test Suite**

```bash
npm test
```

**Step 2: Lint Code**

```bash
npm run lint
```

**Step 3: Type Check**

```bash
npm run type-check
```

**Step 4: Build Verification**

```bash
npm run build
```

### Auto-Fix Capabilities

- Fix lint errors (via `eslint --fix`)
- Fix formatting (via `prettier --write`)
- Add missing imports
- Fix type errors (basic cases)

### Configuration Example

```yaml
validation_type: generic
validation_config:
  validator: GenericValidator

  verification_scripts:
    - name: "tests"
      command: "npm test"
      success_pattern: "All tests passed"

    - name: "lint"
      command: "npm run lint"
      success_pattern: "no errors"
      auto_fix_command: "npm run lint:fix"

    - name: "types"
      command: "npm run type-check"
      success_pattern: "no errors"

    - name: "build"
      command: "npm run build"
      success_pattern: "build successful"

  auto_fix: true
  max_retries: 3
```

---

## Summary

**Validator Capabilities:**

| Validator | Auto-Fix | Complexity | Use Cases |
|-----------|----------|------------|-----------|
| StateFlowValidator | ✅ High | High | Auth flows, UI cascades, state transitions |
| ContentValidator | ✅ High | Medium | Calculations, data fields, percentages |
| InteractiveValidator | ✅ Medium | Medium | Buttons, links, forms, handlers |
| IntegrationValidator | ⚠️ Limited | High | GitHub API, external services |
| GenericValidator | ✅ Medium | Low | General implementation, builds, tests |

**Implementation Priorities:**

1. GenericValidator - Foundational (easiest to implement)
2. ContentValidator - High value (common use case)
3. InteractiveValidator - High value (common use case)
4. StateFlowValidator - Advanced (complex but powerful)
5. IntegrationValidator - Specialized (case-by-case basis)

---

For usage, see:

- `TICKET_TYPES.md` - Ticket type reference
- `VALIDATION_FRAMEWORK.md` - Validation system overview
- `/stream` - Command that executes validators
