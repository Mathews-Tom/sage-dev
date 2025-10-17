---
name: Sage Test Factory
description: Auto-generate unit, integration, and E2E tests with mocks, fixtures, and coverage enforcement for your codebase.
version: 1.0.0
dependencies: python>=3.12, pytest, playwright
---

# Sage Test Factory

Auto-generate comprehensive test suites with coverage enforcement.

## Purpose

Produce unit, integration, and end-to-end test code based on existing services, enforcing coverage thresholds and quality standards.

## When to Use

- Ensuring test coverage in new codebases
- Adding tests to legacy code
- Generating test suites for APIs
- Creating E2E test scenarios
- Enforcing quality gates in CI/CD

## Core Workflow

### 1. Code Analysis

Analyze codebase structure to identify test candidates:

```python
import ast
from pathlib import Path
from typing import NamedTuple

class CodeElement(NamedTuple):
    type: str  # "function", "class", "method"
    name: str
    file_path: Path
    line_number: int
    parameters: list[str]
    return_type: str | None

def analyze_python_file(file_path: Path) -> list[CodeElement]:
    """Extract testable elements from Python file."""
    with open(file_path) as f:
        tree = ast.parse(f.read())

    elements = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            elements.append(CodeElement(
                type="function",
                name=node.name,
                file_path=file_path,
                line_number=node.lineno,
                parameters=[arg.arg for arg in node.args.args],
                return_type=getattr(node.returns, 'id', None)
            ))
        elif isinstance(node, ast.ClassDef):
            for item in node.body:
                if isinstance(item, ast.FunctionDef):
                    elements.append(CodeElement(
                        type="method",
                        name=f"{node.name}.{item.name}",
                        file_path=file_path,
                        line_number=item.lineno,
                        parameters=[arg.arg for arg in item.args.args],
                        return_type=getattr(item.returns, 'id', None)
                    ))

    return elements
```

### 2. Unit Test Generation

Generate unit tests for functions and methods:

```python
# For a function like:
# def calculate_discount(price: float, discount_percent: float) -> float:
#     return price * (1 - discount_percent / 100)

# Generated test:
import pytest
from decimal import Decimal

def test_calculate_discount_basic():
    """Test basic discount calculation."""
    result = calculate_discount(100.0, 10.0)
    assert result == 90.0

def test_calculate_discount_zero_percent():
    """Test with zero discount."""
    result = calculate_discount(100.0, 0.0)
    assert result == 100.0

def test_calculate_discount_full_discount():
    """Test with 100% discount."""
    result = calculate_discount(100.0, 100.0)
    assert result == 0.0

def test_calculate_discount_invalid_negative():
    """Test with negative discount (should handle or raise)."""
    with pytest.raises(ValueError):
        calculate_discount(100.0, -10.0)

@pytest.mark.parametrize("price,discount,expected", [
    (100.0, 10.0, 90.0),
    (50.0, 20.0, 40.0),
    (200.0, 15.0, 170.0),
])
def test_calculate_discount_parametrized(price, discount, expected):
    """Parametrized tests for various scenarios."""
    assert calculate_discount(price, discount) == expected
```

### 3. Mock Data Fixtures

Generate reusable test fixtures:

```python
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

@pytest.fixture
def sample_user():
    """Create a sample user for testing."""
    return {
        "id": uuid4(),
        "email": "test@example.com",
        "name": "Test User",
        "created_at": datetime.utcnow(),
    }

@pytest.fixture
def user_with_orders(sample_user):
    """Create user with orders."""
    return {
        **sample_user,
        "orders": [
            {
                "id": uuid4(),
                "total": 99.99,
                "status": "completed",
                "created_at": datetime.utcnow() - timedelta(days=7),
            },
            {
                "id": uuid4(),
                "total": 149.99,
                "status": "pending",
                "created_at": datetime.utcnow() - timedelta(days=1),
            },
        ]
    }

@pytest.fixture
def db_session():
    """Create test database session."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine("sqlite:///:memory:")
    Session = sessionmaker(bind=engine)
    session = Session()

    # Create tables
    Base.metadata.create_all(engine)

    yield session

    session.close()
```

### 4. Integration Test Generation

Generate integration tests for APIs:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_user_integration():
    """Test user creation endpoint."""
    response = client.post(
        "/api/v1/users/",
        json={
            "email": "newuser@example.com",
            "name": "New User",
            "password": "securepass123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data
    assert "password" not in data  # Should not return password

def test_get_user_integration(sample_user_id):
    """Test get user endpoint."""
    response = client.get(f"/api/v1/users/{sample_user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(sample_user_id)

def test_update_user_integration(sample_user_id):
    """Test update user endpoint."""
    response = client.put(
        f"/api/v1/users/{sample_user_id}",
        json={"name": "Updated Name"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"

def test_delete_user_integration(sample_user_id):
    """Test delete user endpoint."""
    response = client.delete(f"/api/v1/users/{sample_user_id}")
    assert response.status_code == 204

    # Verify deletion
    get_response = client.get(f"/api/v1/users/{sample_user_id}")
    assert get_response.status_code == 404

def test_user_authentication_flow():
    """Test complete authentication flow."""
    # Register
    register_response = client.post(
        "/api/v1/auth/register",
        json={"email": "auth@example.com", "password": "pass123"}
    )
    assert register_response.status_code == 201

    # Login
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "auth@example.com", "password": "pass123"}
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    # Access protected endpoint
    protected_response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert protected_response.status_code == 200
```

### 5. E2E Test Generation

Generate Playwright tests for frontend:

```python
from playwright.async_api import async_playwright, Page
import pytest

@pytest.fixture
async def browser():
    """Create browser instance."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        yield browser
        await browser.close()

@pytest.fixture
async def page(browser):
    """Create new page."""
    page = await browser.new_page()
    yield page
    await page.close()

async def test_user_registration_e2e(page: Page):
    """Test user registration flow end-to-end."""
    # Navigate to registration page
    await page.goto("http://localhost:3000/register")

    # Fill form
    await page.fill('input[name="email"]', "test@example.com")
    await page.fill('input[name="password"]', "securepass123")
    await page.fill('input[name="confirm_password"]', "securepass123")

    # Submit
    await page.click('button[type="submit"]')

    # Wait for redirect to dashboard
    await page.wait_for_url("**/dashboard")

    # Verify success message
    success_msg = await page.locator('.success-message').text_content()
    assert "registered successfully" in success_msg.lower()

async def test_product_search_e2e(page: Page):
    """Test product search functionality."""
    await page.goto("http://localhost:3000")

    # Enter search query
    await page.fill('input[placeholder="Search products"]', "laptop")
    await page.press('input[placeholder="Search products"]', "Enter")

    # Wait for results
    await page.wait_for_selector('.product-card')

    # Verify results contain search term
    products = await page.locator('.product-card').all()
    assert len(products) > 0

    first_product = products[0]
    title = await first_product.locator('.product-title').text_content()
    assert "laptop" in title.lower()
```

### 6. Coverage Enforcement

Generate coverage configuration and enforcement:

```python
# pytest.ini
[tool.pytest.ini_options]
minversion = "8.0"
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = """
    --strict-markers
    --tb=short
    --cov=app
    --cov-report=term-missing
    --cov-report=html
    --cov-report=xml
    --cov-fail-under=80
"""

# .coveragerc
[run]
source = app
omit =
    */tests/*
    */migrations/*
    */venv/*
    */virtualenv/*

[report]
precision = 2
skip_empty = True
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
    @abstract
```

### 7. Test Utilities

Generate helper utilities for testing:

```python
from typing import Any
import json

def assert_dict_contains(actual: dict, expected: dict):
    """Assert actual dict contains all keys/values from expected dict."""
    for key, value in expected.items():
        assert key in actual, f"Key '{key}' not found in actual dict"
        assert actual[key] == value, f"Value mismatch for key '{key}': {actual[key]} != {value}"

def load_fixture(name: str) -> dict[str, Any]:
    """Load JSON fixture from file."""
    with open(f"tests/fixtures/{name}.json") as f:
        return json.load(f)

class MockResponse:
    """Mock HTTP response for testing."""
    def __init__(self, json_data: dict, status_code: int = 200):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception(f"HTTP {self.status_code}")

async def wait_for_condition(condition_fn, timeout: int = 5, interval: float = 0.1):
    """Wait for condition to become true."""
    import asyncio
    start = asyncio.get_event_loop().time()
    while not condition_fn():
        if asyncio.get_event_loop().time() - start > timeout:
            raise TimeoutError("Condition not met within timeout")
        await asyncio.sleep(interval)
```

### 8. CI Integration

Generate GitHub Actions workflow for tests:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install uv
          uv sync

      - name: Run unit tests
        run: uv run pytest tests/unit/ -v

      - name: Run integration tests
        run: uv run pytest tests/integration/ -v

      - name: Check coverage
        run: uv run pytest --cov=app --cov-fail-under=80

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage.xml
```

## Best Practices

1. **Test Structure**: Follow Arrange-Act-Assert pattern
2. **Naming**: Use descriptive test names (test_feature_scenario_expectedresult)
3. **Independence**: Tests should not depend on each other
4. **Fixtures**: Use fixtures for reusable test data
5. **Parametrization**: Use parametrized tests for multiple scenarios
6. **Coverage**: Enforce minimum coverage thresholds (80% overall, 90% new code)
7. **Speed**: Keep unit tests fast (<1s each)
8. **Isolation**: Mock external dependencies

## Quality Checklist

- [ ] Unit tests for all public functions/methods
- [ ] Integration tests for all API endpoints
- [ ] E2E tests for critical user flows
- [ ] Test fixtures for reusable data
- [ ] Mock data generators
- [ ] Coverage enforcement configured
- [ ] CI/CD integration
- [ ] Test documentation
- [ ] Error case coverage
- [ ] Edge case coverage
