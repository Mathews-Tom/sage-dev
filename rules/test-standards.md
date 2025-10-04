---
description: Test coverage and quality standards for production-grade testing discipline
---

# Test Standards

## Test Coverage Requirements

COVERAGE THRESHOLDS:
  |
  +-- Overall project: ≥ 80%
  +-- New code: ≥ 90%
  +-- Critical paths: ≥ 95%
  +-- Per-file minimum: ≥ 75%
  +-- No coverage regression

CRITICAL PATHS:
  +-- Authentication & authorization
  +-- Data validation & sanitization
  +-- Payment processing
  +-- API endpoints (public)
  +-- Database operations (core)
  +-- Security-sensitive code

---

## Test Organization

```text
project/
├── src/
│   ├── auth/
│   │   ├── __init__.py
│   │   └── login.py
│   └── models/
│       ├── __init__.py
│       └── user.py
└── tests/
    ├── __init__.py
    ├── test_auth/
    │   ├── __init__.py
    │   └── test_login.py      # Mirrors src structure
    └── test_models/
        ├── __init__.py
        └── test_user.py
```

**Rules:**

- Tests in `tests/` directory
- Mirror source directory structure
- Test files: `test_*.py` or `*_test.py`
- Test functions: `test_*`
- Test classes: `Test*`

---

## Test Quality Standards

### Required Test Patterns

**1. Arrange-Act-Assert (AAA):**

```python
def test_user_creation():
    # Arrange: Set up test data
    name = "John Doe"
    email = "john@example.com"

    # Act: Execute the operation
    user = User.create(name=name, email=email)

    # Assert: Verify the outcome
    assert user.name == name
    assert user.email == email
    assert user.id is not None
```

**2. Test Edge Cases:**

```python
def test_division_by_zero():
    """Test error handling for edge case."""
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)

def test_empty_input():
    """Test behavior with empty input."""
    result = process_items([])
    assert result == []
```

**3. Test Isolation:**

```python
@pytest.fixture
def clean_database():
    """Ensure clean state for each test."""
    db.clear()
    yield
    db.clear()

def test_user_save(clean_database):
    user = User(name="Test")
    user.save()
    assert db.count() == 1
```

### Prohibited Test Anti-Patterns

**❌ Empty Tests:**

```python
# PROHIBITED
def test_something():
    pass  # No actual test
```

**❌ Tests Without Assertions:**

```python
# PROHIBITED
def test_process():
    process_data()  # No verification
```

**❌ Overly Broad Exception Handling:**

```python
# PROHIBITED
def test_api_call():
    try:
        api.call()
    except:  # Catches everything, hides failures
        pass
```

**❌ Disabled Tests Without Reason:**

```python
# PROHIBITED
@pytest.mark.skip  # No reason given
def test_feature():
    ...

# ALLOWED
@pytest.mark.skip(reason="Feature not implemented yet - ticket #123")
def test_future_feature():
    ...
```

**❌ Mocking Everything:**

```python
# PROHIBITED - Nothing is actually tested
def test_service(mocker):
    mocker.patch('module.database')
    mocker.patch('module.api')
    mocker.patch('module.validator')
    # No real code execution
```

---

## Test Coverage Enforcement

### Minimum Thresholds

**Overall Coverage: 80%**

- Measured across entire codebase
- Includes statements, branches, functions
- Blocks commit if below threshold (STRICT mode)

**New Code Coverage: 90%**

- Higher bar for new/modified code
- Prevents coverage degradation
- Calculated per-commit

**Critical Files: 95%**

- Core business logic
- Security-sensitive code
- Data validation
- Authentication/authorization

**Per-File Minimum: 75%**

- Every file must meet baseline
- Prevents untested modules
- Exceptions require justification

### Coverage Configuration

**pytest.ini:**

```ini
[pytest]
testpaths = tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
addopts =
    --cov=src
    --cov-report=term-missing
    --cov-report=html
    --cov-report=json
    --cov-fail-under=80
    --strict-markers
    -v
```

**.coveragerc:**

```ini
[run]
source = src
omit =
    */tests/*
    */migrations/*
    */__pycache__/*
    */venv/*
    */virtualenv/*

[report]
precision = 2
show_missing = true
skip_covered = false
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
    @abstractmethod
```

---

## Test Execution Standards

### Test Speed Requirements

**Unit Tests:**

- Target: < 100ms per test
- Maximum: 500ms per test
- No external dependencies
- No network calls
- No file I/O (use in-memory)

**Integration Tests:**

- Target: < 1s per test
- Maximum: 5s per test
- May use database (test DB)
- May use external services (mocked or test instances)

**End-to-End Tests:**

- Target: < 10s per test
- Maximum: 30s per test
- Full stack execution
- Real services (test environment)

### Parallel Execution

```bash
# Run tests in parallel
pytest -n auto  # Use all CPU cores

# Run specific test categories
pytest -m unit  # Fast unit tests only
pytest -m integration  # Integration tests
pytest -m "not slow"  # Skip slow tests
```

---

## Test Documentation

### Required Docstrings

```python
def test_user_authentication_success():
    """
    Test successful user authentication with valid credentials.

    Verifies that:
    - User can log in with correct username/password
    - Session token is generated
    - User object is returned with correct attributes
    """
    user = authenticate("john@example.com", "correct_password")
    assert user is not None
    assert user.email == "john@example.com"
```

### Test Markers

```python
import pytest

@pytest.mark.unit
def test_calculation():
    """Fast unit test."""
    ...

@pytest.mark.integration
def test_database_query():
    """Integration test requiring database."""
    ...

@pytest.mark.slow
def test_batch_processing():
    """Slow test (>5s)."""
    ...

@pytest.mark.flaky(reruns=3)
def test_external_api():
    """May fail intermittently, retry up to 3 times."""
    ...
```

---

## Fixtures and Test Data

### Fixture Best Practices

```python
@pytest.fixture(scope="session")
def database():
    """Session-wide database connection."""
    db = Database.connect(test=True)
    yield db
    db.close()

@pytest.fixture(scope="function")
def sample_user():
    """Function-scoped test user."""
    user = User(name="Test User", email="test@example.com")
    yield user
    user.delete()  # Cleanup

@pytest.fixture
def mock_api(mocker):
    """Mock external API."""
    return mocker.patch('module.api_client')
```

### Test Data Factories

```python
# Use factory_boy or similar
import factory

class UserFactory(factory.Factory):
    class Meta:
        model = User

    name = factory.Faker('name')
    email = factory.Faker('email')
    age = factory.Faker('random_int', min=18, max=99)

# In tests
def test_user_properties():
    user = UserFactory()
    assert user.age >= 18
```

---

## Parametrized Testing

```python
@pytest.mark.parametrize("input,expected", [
    (0, 0),
    (1, 1),
    (2, 4),
    (3, 9),
    (-2, 4),
])
def test_square(input, expected):
    """Test square function with multiple inputs."""
    assert square(input) == expected

@pytest.mark.parametrize("email", [
    "invalid",
    "@example.com",
    "user@",
    "user @example.com",
])
def test_invalid_email_validation(email):
    """Test email validation rejects invalid formats."""
    with pytest.raises(ValidationError):
        validate_email(email)
```

---

## Assertion Best Practices

### Clear Assertions

```python
# ✅ GOOD: Specific assertion
assert user.age == 25

# ❌ BAD: Generic assertion
assert user

# ✅ GOOD: Multiple specific assertions
assert response.status_code == 200
assert response.json()["status"] == "success"
assert "data" in response.json()

# ❌ BAD: Multiple unrelated checks in one
assert response.status_code == 200 and response.json()["status"] == "success"
```

### Custom Assertion Messages

```python
# ✅ GOOD: Clear failure message
assert len(items) > 0, f"Expected items but got empty list: {items}"

# ✅ GOOD: Contextual information
assert user.is_active, (
    f"User {user.id} should be active but is_active={user.is_active}. "
    f"Check activation process."
)
```

---

## Enforcement Rules

1. **Minimum coverage: 80%** - Blocks commit if below
2. **New code: 90%** - Higher standard for new code
3. **No regression** - Coverage cannot decrease
4. **All modules tested** - Every .py file needs test_*.py
5. **No empty tests** - Must have assertions
6. **No disabled tests without reason** - Skip with justification
7. **No overly broad mocking** - Test real code paths
8. **Fast unit tests** - < 500ms per test
9. **Parallel safe** - Tests must be isolated
10. **AAA pattern** - Arrange-Act-Assert structure

---

## Coverage Calculation

```bash
# Generate coverage report
pytest --cov=src --cov-report=term-missing

# Check coverage threshold
pytest --cov=src --cov-fail-under=80

# Generate HTML report
pytest --cov=src --cov-report=html
open htmlcov/index.html

# JSON report (for tooling)
pytest --cov=src --cov-report=json
cat coverage.json | jq '.totals.percent_covered'
```

---

## Test Maintenance

### When to Update Tests

- **Code changes**: Update affected tests
- **Bug fixes**: Add regression test first
- **New features**: Write tests before or with code (TDD)
- **Refactoring**: Update tests to match new structure

### Flaky Test Handling

```python
# Mark flaky tests
@pytest.mark.flaky(reruns=3, reruns_delay=2)
def test_external_service():
    """Test may fail due to external factors."""
    ...

# Or fix the root cause:
# - Use mocks for external dependencies
# - Add proper waits for async operations
# - Ensure test isolation
```

### Test Cleanup

```bash
# Find unused tests
pytest --collect-only | grep "test_" | sort

# Find slow tests
pytest --durations=10

# Remove dead code from tests
coverage report --show-missing
```
