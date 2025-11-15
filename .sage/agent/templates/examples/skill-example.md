---
name: "Red-Green-Refactor"
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
validated: true
validated_by:
  - test-coverage
---

# Red-Green-Refactor

## Purpose

**When to use:**
- Writing new features where requirements are clear
- Fixing bugs with reproducible test cases
- Adding functionality to existing codebase

**When NOT to use:**
- Exploratory prototyping where requirements are unknown
- UI/visual components where manual testing dominates
- Performance-critical code requiring profiling first

**Benefits:**
- Catches regressions immediately
- Forces clear API design before implementation
- Provides living documentation of expected behavior

## Prerequisites

### Tools Required

```bash
which pytest && pytest --version
which git && git --version
```

### Knowledge Required

- Understanding of unit test structure (arrange-act-assert)
- Familiarity with test runners and assertions

## Algorithm

### Step 1: Write Failing Test (RED)

**What:** Write a test that describes expected behavior
**Why:** Forces you to think about API design and requirements first
**How:**
```python
def test_add_returns_sum_of_two_numbers():
    result = add(2, 3)
    assert result == 5
```

**Verification:** Test fails with clear error message about missing implementation

### Step 2: Make Test Pass (GREEN)

**What:** Write minimal code to pass the test
**Why:** Avoids over-engineering and YAGNI violations
**How:**
```python
def add(a: int, b: int) -> int:
    return a + b
```

**Verification:** Test passes; no other tests broken

### Step 3: Refactor (REFACTOR)

**What:** Improve code quality without changing behavior
**Why:** Clean code while tests protect against regressions
**How:**
```python
def add(a: int, b: int) -> int:
    """Add two integers and return the sum."""
    return a + b
```

**Verification:** All tests still pass after refactoring

## Validation

### Success Criteria

- [ ] Test written before implementation
- [ ] Test initially fails (RED phase confirmed)
- [ ] Minimal code makes test pass
- [ ] Code improved without changing behavior

### Automated Validation

```bash
pytest --cov=src --cov-fail-under=80
```

### Manual Verification

1. Check git history shows test commit before implementation
2. Verify test covers the actual requirement
3. Confirm no dead code was introduced

## Common Pitfalls

### Pitfall 1: Testing Implementation Details

**Symptom:** Tests break when refactoring internal structure
**Cause:** Testing private methods or internal state
**Solution:** Test public API behavior only

### Pitfall 2: Writing Too Much Code in GREEN Phase

**Symptom:** Additional untested functionality added
**Cause:** Anticipating future requirements
**Solution:** Write only enough code to pass current test

## Examples

### Python Example

**Scenario:** Implementing a string reverser

```python
import pytest

# RED: Write failing test first
def test_reverse_returns_reversed_string():
    result = reverse("hello")
    assert result == "olleh"

def test_reverse_handles_empty_string():
    result = reverse("")
    assert result == ""

# GREEN: Minimal implementation
def reverse(text: str) -> str:
    return text[::-1]

# REFACTOR: Add docstring and type hints (already done above)
```

**Key Points:**
- Test describes behavior, not implementation
- Implementation uses Python idiom for brevity

### TypeScript Example

**Scenario:** Implementing a string reverser

```typescript
// RED: Write failing test first
describe("reverse", () => {
  it("returns reversed string", () => {
    expect(reverse("hello")).toBe("olleh");
  });

  it("handles empty string", () => {
    expect(reverse("")).toBe("");
  });
});

// GREEN: Minimal implementation
function reverse(text: string): string {
  return text.split("").reverse().join("");
}
```

**Key Points:**
- Tests are descriptive and independent
- Implementation leverages built-in array methods

## References

- [Martin Fowler on TDD](https://martinfowler.com/bliki/TestDrivenDevelopment.html) - Canonical definition
- [Test Driven Development by Kent Beck](https://www.oreilly.com/library/view/test-driven-development/0321146530/) - Original methodology
- [The Three Laws of TDD](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html) - Uncle Bob's refinement

## Changelog

- **v1.0** (2025-11-15): Initial version
