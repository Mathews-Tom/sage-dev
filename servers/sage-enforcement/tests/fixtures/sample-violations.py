"""
Sample Python file with type annotation violations.
Used for testing type enforcer violation detection.
"""

from typing import List, Dict, Optional, Union


# Violation: Deprecated typing.List
def process_items(items: List[str]) -> str:
    """Process list of items."""
    return ", ".join(items)


# Violation: Deprecated typing.Dict
def get_mapping(keys: list[str]) -> Dict[str, int]:
    """Get mapping from keys."""
    return {k: len(k) for k in keys}


# Violation: Deprecated typing.Optional
def find_user(user_id: int) -> Optional[str]:
    """Find user by ID."""
    if user_id > 0:
        return f"user_{user_id}"
    return None


# Violation: Deprecated typing.Union
def parse_value(value: str) -> Union[int, str]:
    """Parse value as int or return string."""
    try:
        return int(value)
    except ValueError:
        return value


# Violation: Missing return type annotation
def calculate_total(prices):
    """Calculate total price."""
    return sum(prices)


# Violation: Missing parameter type annotation
def format_name(first_name, last_name: str) -> str:
    """Format full name."""
    return f"{first_name} {last_name}"


# Violation: Multiple deprecated imports in one function
def complex_function(data: List[Dict[str, Optional[int]]]) -> Union[str, None]:
    """Process complex data structure."""
    if not data:
        return None
    return str(len(data))


class UserManager:
    """User manager with type violations."""

    # Violation: Missing return type
    def __init__(self, users: List[str]):
        """Initialize with users."""
        self.users = users

    # Violation: Deprecated Optional
    def get_user(self, index: int) -> Optional[str]:
        """Get user by index."""
        if 0 <= index < len(self.users):
            return self.users[index]
        return None

    # Violation: Missing return type
    def add_user(self, name: str):
        """Add new user."""
        self.users.append(name)
