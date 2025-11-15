---
name: "TDD Workflow"
category: "testing"
languages:
  - python
  - typescript
prerequisites:
  tools:
    - pytest>=7.0
    - git>=2.0
  knowledge:
    - basic-unit-testing
evidence:
  - "https://martinfowler.com/bliki/TestDrivenDevelopment.html"
  - "Book: Test Driven Development by Kent Beck"
  - "https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html"
validated: true
validated_by:
  - test-coverage
---

# TDD Workflow

## Purpose

**When to use:**
- Implementing new features with clear requirements
- Fixing bugs with reproducible test cases
- Building APIs where contracts matter
- Refactoring with confidence

**When NOT to use:**
- Exploratory prototyping with unknown requirements
- UI spike testing where visual feedback dominates
- Performance optimization requiring profiling first
- One-off scripts with no maintenance expectation

**Benefits:**
- Immediate regression detection
- Forces clear API design before implementation
- Living documentation of expected behavior
- Higher code coverage by design
- Reduced debugging time

## Prerequisites

### Tools Required

```bash
which pytest && pytest --version
which git && git --version
```

### Knowledge Required

- Understanding of unit test structure (arrange-act-assert)
- Familiarity with test runners and assertions
- Basic git workflow for atomic commits

## Algorithm

### Step 1: Write Failing Test (RED)

**What:** Write a single test that describes one behavior
**Why:** Forces requirement clarity and API design thinking
**How:**
```python
def test_calculate_total_with_tax():
    order = Order(subtotal=100.00, tax_rate=0.10)
    total = order.calculate_total()
    assert total == 110.00
```

**Verification:**
- Test fails with `NameError` or `AttributeError` (not implementation error)
- Error message clearly indicates missing functionality
- Test describes WHAT, not HOW

### Step 2: Make Test Pass (GREEN)

**What:** Write minimal code to make test pass
**Why:** Avoids YAGNI (You Aren't Gonna Need It)
**How:**
```python
class Order:
    def __init__(self, subtotal: float, tax_rate: float):
        self.subtotal = subtotal
        self.tax_rate = tax_rate

    def calculate_total(self) -> float:
        return self.subtotal * (1 + self.tax_rate)
```

**Verification:**
- Test passes (green bar)
- No other tests broken
- Code is intentionally minimal

### Step 3: Refactor (REFACTOR)

**What:** Improve code quality without changing behavior
**Why:** Maintain clean code while tests protect against regressions
**How:**
```python
class Order:
    def __init__(self, subtotal: float, tax_rate: float) -> None:
        self._validate_inputs(subtotal, tax_rate)
        self.subtotal = subtotal
        self.tax_rate = tax_rate

    def _validate_inputs(self, subtotal: float, tax_rate: float) -> None:
        if subtotal < 0:
            raise ValueError("Subtotal cannot be negative")
        if not 0 <= tax_rate <= 1:
            raise ValueError("Tax rate must be between 0 and 1")

    def calculate_total(self) -> float:
        """Calculate total including tax."""
        return round(self.subtotal * (1 + self.tax_rate), 2)
```

**Verification:**
- All tests still pass
- Code is cleaner and more robust
- No new functionality added (just quality improvements)

### Step 4: Commit and Repeat

**What:** Commit working code and start next test
**Why:** Small, verifiable increments reduce risk
**How:**
```bash
git add -A
git commit -m "feat: add Order.calculate_total with tax calculation"
```

**Verification:**
- Each commit is self-contained and tests pass
- Git history shows incremental progress

## Validation

### Success Criteria

- [ ] Test written BEFORE implementation (git history proves this)
- [ ] Test initially fails (RED phase documented)
- [ ] Minimal code makes test pass (no extra features)
- [ ] Code refactored without changing behavior
- [ ] Coverage increased for new code
- [ ] All tests pass after each cycle

### Automated Validation

```bash
pytest --cov=src --cov-report=term-missing --cov-fail-under=80
git log --oneline --name-only | head -20
```

### Manual Verification

1. Review git history: test commits appear before implementation
2. Code coverage report shows new lines are tested
3. No dead code or unused branches
4. Tests are readable and document behavior

## Common Pitfalls

### Pitfall 1: Testing Implementation Details

**Symptom:** Tests break when refactoring internal structure
**Cause:** Testing private methods or internal state directly
**Solution:** Test public API behavior only; use black-box testing

### Pitfall 2: Writing Too Much Code in GREEN Phase

**Symptom:** Implementation includes features not covered by tests
**Cause:** Anticipating future requirements ("might need this later")
**Solution:** Write ONLY enough code to pass current test; add new tests for new features

### Pitfall 3: Skipping REFACTOR Phase

**Symptom:** Code becomes messy over time despite passing tests
**Cause:** Moving to next feature too quickly
**Solution:** Always refactor before moving on; technical debt compounds

### Pitfall 4: Testing Multiple Behaviors in One Test

**Symptom:** Unclear which behavior failed when test fails
**Cause:** Testing too much in single test function
**Solution:** One logical assertion per test; descriptive test names

## Examples

### Python Example

**Scenario:** Building a user authentication service

```python
import pytest
from datetime import datetime, timedelta

# RED: Write failing test
def test_token_expires_after_one_hour():
    token = AuthToken.create(user_id="user123")
    future = datetime.utcnow() + timedelta(hours=2)
    assert token.is_expired(at_time=future) is True

def test_token_valid_within_one_hour():
    token = AuthToken.create(user_id="user123")
    future = datetime.utcnow() + timedelta(minutes=30)
    assert token.is_expired(at_time=future) is False

# GREEN: Minimal implementation
class AuthToken:
    def __init__(self, user_id: str, created_at: datetime) -> None:
        self.user_id = user_id
        self.created_at = created_at

    @classmethod
    def create(cls, user_id: str) -> "AuthToken":
        return cls(user_id=user_id, created_at=datetime.utcnow())

    def is_expired(self, at_time: datetime) -> bool:
        expiry = self.created_at + timedelta(hours=1)
        return at_time > expiry

# REFACTOR: Extract constant, add type hints
TOKEN_LIFETIME = timedelta(hours=1)

class AuthToken:
    def __init__(self, user_id: str, created_at: datetime) -> None:
        self.user_id = user_id
        self.created_at = created_at
        self._expiry = created_at + TOKEN_LIFETIME

    @classmethod
    def create(cls, user_id: str) -> "AuthToken":
        return cls(user_id=user_id, created_at=datetime.utcnow())

    def is_expired(self, at_time: datetime | None = None) -> bool:
        """Check if token has expired."""
        check_time = at_time or datetime.utcnow()
        return check_time > self._expiry
```

**Key Points:**
- Each test verifies one specific behavior
- Implementation grows incrementally
- Refactoring extracts constants and improves clarity

### TypeScript Example

**Scenario:** Building a shopping cart

```typescript
// RED: Write failing test
describe("ShoppingCart", () => {
  it("calculates total for multiple items", () => {
    const cart = new ShoppingCart();
    cart.addItem({ name: "Book", price: 10 });
    cart.addItem({ name: "Pen", price: 2 });

    expect(cart.getTotal()).toBe(12);
  });

  it("returns zero for empty cart", () => {
    const cart = new ShoppingCart();
    expect(cart.getTotal()).toBe(0);
  });
});

// GREEN: Minimal implementation
interface CartItem {
  name: string;
  price: number;
}

class ShoppingCart {
  private items: CartItem[] = [];

  addItem(item: CartItem): void {
    this.items.push(item);
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

// REFACTOR: Add validation and immutability
interface CartItem {
  readonly name: string;
  readonly price: number;
}

class ShoppingCart {
  private readonly items: CartItem[] = [];

  addItem(item: CartItem): void {
    if (item.price < 0) {
      throw new Error("Price cannot be negative");
    }
    this.items.push(item);
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  getItemCount(): number {
    return this.items.length;
  }
}
```

**Key Points:**
- Tests drive the API design (addItem, getTotal)
- Refactoring adds safety without changing behavior
- New methods added only when tests require them

## References

- [Test Driven Development by Kent Beck](https://www.oreilly.com/library/view/test-driven-development/0321146530/) - Original TDD methodology
- [Martin Fowler on TDD](https://martinfowler.com/bliki/TestDrivenDevelopment.html) - Canonical definition and philosophy
- [The Three Laws of TDD](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html) - Uncle Bob's refinement
- [Refactoring by Martin Fowler](https://refactoring.com/) - REFACTOR phase techniques
- [Growing Object-Oriented Software by Freeman & Pryce](http://www.growing-object-oriented-software.com/) - TDD in practice

## Changelog

- **v1.0** (2025-11-15): Initial version with Python and TypeScript examples
