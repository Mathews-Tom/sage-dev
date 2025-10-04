---
description: Python 3.12 typing standards and enforcement rules for type safety validation
---

# Typing Standards

## Python 3.12 Type System Enforcement

VALIDATION FLOW:
  |
  +-- Check __future__ import:
  |   +-- REQUIRE: from __future__ import annotations
  |   +-- Must be first import (after module docstring)
  |   +-- Enables deferred annotation evaluation (PEP 563)
  |
  +-- Check type imports:
  |   |
  |   +-- PROHIBITED (Legacy):
  |       +-- typing.List → use list[T]
  |       +-- typing.Dict → use dict[K, V]
  |       +-- typing.Tuple → use tuple[...]
  |       +-- typing.Set → use set[T]
  |       +-- typing.FrozenSet → use frozenset[T]
  |       +-- typing.Optional[T] → use T | None
  |       +-- typing.Union[A, B] → use A | B
  |       +-- typing.Type[T] → use type[T]
  |
  +-- Check type annotations:
  |   |
  |   +-- REQUIRE for all:
  |   |   +-- Function parameters (except self, cls)
  |   |   +-- Function return types
  |   |   +-- Class attributes
  |   |   +-- Module-level variables
  |   |
  |   +-- PREFER built-in generics:
  |   |   +-- list[int] over List[int]
  |   |   +-- dict[str, Any] over Dict[str, Any]
  |   |   +-- tuple[int, ...] over Tuple[int, ...]
  |   |   +-- set[str] over Set[str]
  |   |
  |   +-- PREFER | unions:
  |       +-- int | None over Optional[int]
  |       +-- str | int | float over Union[str, int, float]
  |
  +-- Type hint quality:
      |
      +-- Specificity:
      |   +-- AVOID: Any (unless justified)
      |   +-- AVOID: object (use Protocol for duck typing)
      |   +-- PREFER: Specific types (str, int, CustomClass)
      |   +-- PREFER: Literal types for constants
      |
      +-- Modern patterns:
      |   +-- Use typing.Self for fluent APIs (not TypeVar)
      |   +-- Use typing.Protocol for structural typing
      |   +-- Use type alias syntax: type MyType = str | int (PEP 695)
      |   +-- Use typing.Never for unreachable code
      |
      +-- Type narrowing:
          +-- Use typing.TypeGuard for type guards
          +-- Use typing.TypeIs for type narrowing (3.13+)
          +-- Use assert_type for type assertions

---

## Approved Modern Typing Imports

__Always Allowed:__

```python
from __future__ import annotations

from typing import (
    # Type variables and parameters
    TypeVar, ParamSpec, TypeVarTuple, Unpack,

    # Structural typing
    Protocol, TypedDict,

    # Literal types
    Literal, LiteralString,

    # Class annotations
    Final, ClassVar,

    # Control flow
    Never, NoReturn,

    # Type guards
    TypeGuard, TypeIs,

    # Utilities
    TypeAlias, overload, override,

    # Async
    Callable, Awaitable, Coroutine,

    # Introspection
    get_origin, get_args,

    # Special
    Self,  # 3.11+
    dataclass_transform,

    # Runtime checks
    TYPE_CHECKING,
)
```

__Collections (from collections.abc):__

```python
from collections.abc import (
    Callable,
    Mapping,
    MutableMapping,
    Sequence,
    MutableSequence,
    Iterable,
    Iterator,
)
```

---

## Type Annotation Examples

### Built-in Generics (Python 3.12+)

__Functions:__

```python
def process_items(items: list[str]) -> dict[str, int]:
    """Process list of items and return counts."""
    return {item: len(item) for item in items}

def merge_data(
    data1: dict[str, Any],
    data2: dict[str, Any]
) -> dict[str, Any]:
    """Merge two dictionaries."""
    return {**data1, **data2}
```

__Union Types:__

```python
def parse_value(value: str | int | float) -> float:
    """Parse value to float."""
    return float(value)

def get_user(user_id: int) -> User | None:
    """Get user by ID, return None if not found."""
    return db.get(user_id)
```

__Generic Classes:__

```python
from collections.abc import Sequence

def first_element[T](items: Sequence[T]) -> T | None:
    """Return first element or None."""
    return items[0] if items else None
```

### Modern Type Patterns

__Self for Fluent APIs:__

```python
from typing import Self

class Builder:
    def set_name(self, name: str) -> Self:
        self.name = name
        return self

    def set_age(self, age: int) -> Self:
        self.age = age
        return self
```

__Protocol for Structural Typing:__

```python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

def render(obj: Drawable) -> None:
    obj.draw()  # Works with any object that has draw()
```

__Type Alias (PEP 695):__

```python
# Modern syntax (Python 3.12+)
type UserId = int
type UserData = dict[str, str | int]
type Result[T] = T | Exception

# Legacy (still acceptable)
from typing import TypeAlias
UserId: TypeAlias = int
```

__Literal Types:__

```python
from typing import Literal

def set_mode(mode: Literal["read", "write", "append"]) -> None:
    """Set file mode."""
    ...
```

__TypeGuard for Type Narrowing:__

```python
from typing import TypeGuard

def is_str_list(val: list[Any]) -> TypeGuard[list[str]]:
    """Check if list contains only strings."""
    return all(isinstance(x, str) for x in val)

def process(items: list[Any]) -> None:
    if is_str_list(items):
        # items is now list[str]
        print(items[0].upper())
```

---

## Type Checking Configuration

### mypy Configuration (pyproject.toml)

```toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
disallow_subclassing_any = true
disallow_untyped_calls = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true
```

### Pyright Configuration (pyrightconfig.json)

```json
{
  "pythonVersion": "3.12",
  "typeCheckingMode": "strict",
  "useLibraryCodeForTypes": true,
  "strictListInference": true,
  "strictDictionaryInference": true,
  "strictSetInference": true,
  "reportMissingTypeStubs": "warning",
  "reportUnknownMemberType": "warning",
  "reportUnknownArgumentType": "warning",
  "reportUnknownVariableType": "warning"
}
```

---

## Enforcement Rules

1. __from __future__ import annotations__ - Mandatory first import
2. __Built-in generics only__ - No typing.List, typing.Dict, etc.
3. __| unions only__ - No typing.Optional, typing.Union
4. __All public functions typed__ - Parameters and return values
5. __Any requires justification__ - Comment explaining why Any is needed
6. __mypy --strict must pass__ - No type errors allowed
7. __Prefer Self over TypeVar__ - For fluent APIs
8. __Use Protocol for duck typing__ - Instead of informal interfaces
9. __Type aliases for clarity__ - Use type X = ... syntax (PEP 695)
10. __TYPE_CHECKING for circular imports__ - Avoid runtime import cycles

---

## Common Violations and Fixes

| Violation | Fix |
|-----------|-----|
| `List[int]` | `list[int]` |
| `Dict[str, Any]` | `dict[str, Any]` |
| `Optional[str]` | `str \| None` |
| `Union[int, str]` | `int \| str` |
| `Tuple[int, str]` | `tuple[int, str]` |
| Missing return type | Add `-> ReturnType` |
| Missing param type | Add `: ParamType` |
| `Any` without comment | Add justification or use specific type |
| TypeVar for self return | Use `typing.Self` |

---

## Auto-Fix Transformations

__The type-enforcer agent will automatically apply these fixes:__

1. __Remove legacy imports:__
   - Delete `from typing import List, Dict, Optional, Union`

2. __Convert type annotations:__
   - `List[X]` → `list[X]`
   - `Dict[K, V]` → `dict[K, V]`
   - `Optional[T]` → `T | None`
   - `Union[A, B]` → `A | B`

3. __Add missing __future__ import:__
   - Insert `from __future__ import annotations` at top

4. __Sort type imports:__
   - Group and alphabetize typing imports

__Manual fixes required:__

- Adding missing type annotations (agent suggests, developer implements)
- Justifying Any usage (add comment)
- Fixing mypy errors (agent reports, developer fixes)
