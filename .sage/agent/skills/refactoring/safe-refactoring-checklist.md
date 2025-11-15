---
name: "Safe Refactoring Checklist"
category: "refactoring"
languages:
  - python
  - typescript
prerequisites:
  tools:
    - git>=2.0
    - pytest>=7.0
  knowledge:
    - tdd-workflow
    - basic-git-workflow
evidence:
  - "https://refactoring.com/"
  - "Book: Refactoring by Martin Fowler"
  - "https://martinfowler.com/articles/workflowsOfRefactoring/"
validated: true
validated_by:
  - test-coverage
  - type-enforcer
---

# Safe Refactoring Checklist

## Purpose

**When to use:**
- Improving code readability without changing behavior
- Reducing technical debt in existing codebase
- Preparing code for new features
- Consolidating duplicate code
- Simplifying complex functions

**When NOT to use:**
- Adding new features (that's enhancement, not refactoring)
- Fixing bugs (that changes behavior)
- Performance optimization without tests (risk of behavioral changes)
- Code you don't understand yet (understand first, then refactor)

**Benefits:**
- Maintains working software while improving structure
- Reduces risk of introducing bugs
- Creates audit trail of changes
- Enables confident, incremental improvements
- Builds codebase knowledge

## Prerequisites

### Tools Required

```bash
which git && git --version
which pytest && pytest --version
```

### Knowledge Required

- TDD workflow for maintaining test coverage
- Git for version control and rollback
- Understanding of code smells and refactoring patterns

## Algorithm

### Step 1: Verify Test Coverage

**What:** Ensure code under refactoring has adequate test coverage
**Why:** Tests are your safety net; no tests = no safety
**How:**
```bash
pytest --cov=module_to_refactor --cov-report=term-missing
# Target: 80%+ coverage on refactoring target

# If coverage insufficient:
# Write characterization tests first (tests that document current behavior)
```

**Verification:**
- Coverage report shows 80%+ on target code
- All tests pass before starting
- Tests cover main execution paths

### Step 2: Create Refactoring Branch

**What:** Isolate refactoring work in dedicated branch
**Why:** Easy rollback, clear history, enables review
**How:**
```bash
git checkout -b refactor/extract-payment-logic
git status  # Clean working directory
```

**Verification:**
- Branch created from latest main/develop
- No uncommitted changes
- Branch name describes refactoring intent

### Step 3: Make Single Refactoring Change

**What:** Apply ONE refactoring pattern at a time
**Why:** Small changes are easier to verify and rollback
**How:**
```python
# BEFORE: Long method with multiple responsibilities
def process_order(order):
    # Calculate totals
    subtotal = sum(item.price * item.quantity for item in order.items)
    tax = subtotal * 0.10
    total = subtotal + tax

    # Validate payment
    if not order.payment.is_valid():
        raise PaymentError("Invalid payment")

    # Process payment
    charge_result = payment_gateway.charge(order.payment, total)
    if not charge_result.success:
        raise PaymentError(charge_result.error)

    # Update inventory
    for item in order.items:
        inventory.decrement(item.product_id, item.quantity)

    return OrderResult(total=total, transaction_id=charge_result.id)

# AFTER: Extract Method refactoring
def process_order(order):
    total = calculate_order_total(order)
    validate_payment(order.payment)
    transaction_id = charge_payment(order.payment, total)
    update_inventory(order.items)
    return OrderResult(total=total, transaction_id=transaction_id)

def calculate_order_total(order):
    subtotal = sum(item.price * item.quantity for item in order.items)
    tax = subtotal * 0.10
    return subtotal + tax

def validate_payment(payment):
    if not payment.is_valid():
        raise PaymentError("Invalid payment")

def charge_payment(payment, amount):
    result = payment_gateway.charge(payment, amount)
    if not result.success:
        raise PaymentError(result.error)
    return result.id

def update_inventory(items):
    for item in items:
        inventory.decrement(item.product_id, item.quantity)
```

**Verification:**
- Only one refactoring pattern applied (e.g., Extract Method)
- Behavior unchanged (same inputs produce same outputs)
- Code compiles/parses without errors

### Step 4: Run Tests

**What:** Execute full test suite after each refactoring
**Why:** Immediate feedback if refactoring broke something
**How:**
```bash
pytest tests/ -x --tb=short
# -x: Stop on first failure
# --tb=short: Concise tracebacks
```

**Verification:**
- All tests pass (green)
- No new warnings introduced
- Test execution time similar to before

### Step 5: Commit Atomic Change

**What:** Commit single refactoring with descriptive message
**Why:** Enables precise rollback, documents intent
**How:**
```bash
git add -A
git commit -m "refactor: extract payment processing into separate functions

- Extract calculate_order_total() for clarity
- Extract validate_payment() for single responsibility
- Extract charge_payment() for isolation
- Extract update_inventory() for readability

No behavioral changes. All tests pass."
```

**Verification:**
- Commit message explains what and why
- One commit per refactoring operation
- Tests pass at this commit

### Step 6: Repeat or Complete

**What:** Apply next refactoring or finalize
**Why:** Build up improvements incrementally
**How:**
```bash
# More refactoring needed?
# Repeat Steps 3-5

# Done refactoring?
git log --oneline  # Review refactoring history
pytest --cov=module_to_refactor  # Verify coverage maintained
git push origin refactor/extract-payment-logic
# Create PR for review
```

**Verification:**
- Each commit is self-contained and tests pass
- Overall refactoring improves code quality metrics
- No behavior changes across all commits

## Validation

### Success Criteria

- [ ] Test coverage 80%+ before starting
- [ ] All tests pass after each change
- [ ] One refactoring pattern per commit
- [ ] Branch created for isolation
- [ ] Commits have descriptive messages
- [ ] No behavior changes (same inputs → same outputs)
- [ ] Code quality improved (reduced complexity, better names, etc.)

### Automated Validation

```bash
pytest --cov=src --cov-fail-under=80
git log --oneline | head -20
python -m radon cc src/ --average  # Cyclomatic complexity
```

### Manual Verification

1. PR review confirms behavior unchanged
2. Code is more readable/maintainable
3. Duplication reduced
4. Function/class responsibilities clearer

## Common Pitfalls

### Pitfall 1: Refactoring Without Tests

**Symptom:** Bug discovered after refactoring deployed
**Cause:** No safety net to catch behavioral changes
**Solution:** Write characterization tests first if coverage insufficient

### Pitfall 2: Big Bang Refactoring

**Symptom:** Massive PR with hundreds of changes
**Cause:** Attempting to fix everything at once
**Solution:** One refactoring pattern per commit; keep PRs small

### Pitfall 3: Mixing Refactoring with Feature Changes

**Symptom:** "Refactoring" commit adds new functionality
**Cause:** Temptation to "improve" while refactoring
**Solution:** Separate concerns; refactor first, then add features

### Pitfall 4: Not Committing Frequently

**Symptom:** Lost work when refactoring goes wrong
**Cause:** Working too long without saving progress
**Solution:** Commit after each successful refactoring; easy rollback

## Examples

### Python Example

**Scenario:** Refactoring duplicate validation logic

```python
# BEFORE: Duplicated validation
class UserService:
    def create_user(self, email, password):
        # Validation duplicated
        if not email or "@" not in email:
            raise ValueError("Invalid email")
        if len(password) < 8:
            raise ValueError("Password too short")
        # ... create user

    def update_email(self, user_id, email):
        # Same validation duplicated
        if not email or "@" not in email:
            raise ValueError("Invalid email")
        # ... update email

    def reset_password(self, user_id, password):
        # Same validation duplicated
        if len(password) < 8:
            raise ValueError("Password too short")
        # ... reset password

# Step 1: Verify tests exist for all three methods
# pytest --cov=user_service --cov-report=term-missing

# Step 2: Create branch
# git checkout -b refactor/extract-validation

# Step 3: Extract Method refactoring
class UserService:
    def create_user(self, email: str, password: str) -> User:
        self._validate_email(email)
        self._validate_password(password)
        # ... create user

    def update_email(self, user_id: str, email: str) -> None:
        self._validate_email(email)
        # ... update email

    def reset_password(self, user_id: str, password: str) -> None:
        self._validate_password(password)
        # ... reset password

    def _validate_email(self, email: str) -> None:
        """Validate email format."""
        if not email or "@" not in email:
            raise ValueError("Invalid email")

    def _validate_password(self, password: str) -> None:
        """Validate password strength."""
        if len(password) < 8:
            raise ValueError("Password too short")

# Step 4: Run tests
# pytest tests/test_user_service.py -x

# Step 5: Commit
# git commit -m "refactor: extract email and password validation methods"

# Step 6: Done - push and create PR
```

### TypeScript Example

**Scenario:** Simplifying complex conditional

```typescript
// BEFORE: Nested conditionals
function getDiscount(customer: Customer, order: Order): number {
  let discount = 0;

  if (customer.isPremium) {
    if (order.total > 100) {
      discount = 0.15;
    } else {
      discount = 0.10;
    }
  } else {
    if (order.total > 100) {
      discount = 0.05;
    } else {
      discount = 0;
    }
  }

  return discount;
}

// Step 1: Verify tests
// npm test -- --coverage --collectCoverageFrom=src/discount.ts

// Step 2: Create branch
// git checkout -b refactor/simplify-discount-logic

// Step 3: Replace Nested Conditional with Guard Clauses
function getDiscount(customer: Customer, order: Order): number {
  if (!customer.isPremium && order.total <= 100) {
    return 0;
  }

  if (!customer.isPremium && order.total > 100) {
    return 0.05;
  }

  if (customer.isPremium && order.total <= 100) {
    return 0.10;
  }

  // customer.isPremium && order.total > 100
  return 0.15;
}

// Step 4: Run tests
// npm test

// Step 5: Commit
// git commit -m "refactor: flatten nested conditionals in getDiscount"

// Optional Step 6: Further refactoring - Extract to lookup table
const DISCOUNT_RATES: Record<string, number> = {
  "premium-high": 0.15,
  "premium-low": 0.10,
  "standard-high": 0.05,
  "standard-low": 0,
};

function getDiscount(customer: Customer, order: Order): number {
  const tier = customer.isPremium ? "premium" : "standard";
  const volume = order.total > 100 ? "high" : "low";
  return DISCOUNT_RATES[`${tier}-${volume}`];
}

// Step 4 again: Run tests
// npm test

// Step 5 again: Commit
// git commit -m "refactor: replace conditionals with lookup table"
```

## References

- [Refactoring.com](https://refactoring.com/) - Martin Fowler's refactoring catalog
- [Refactoring: Improving the Design of Existing Code](https://martinfowler.com/books/refactoring.html) - Definitive guide
- [Workflows of Refactoring](https://martinfowler.com/articles/workflowsOfRefactoring/) - When and how to refactor
- [Working Effectively with Legacy Code](https://www.oreilly.com/library/view/working-effectively-with/0131177052/) - Michael Feathers
- [Code Smells Catalog](https://refactoring.guru/refactoring/smells) - Identifying what to refactor

## Changelog

- **v1.0** (2025-11-15): Initial version with 6-step safe refactoring process
