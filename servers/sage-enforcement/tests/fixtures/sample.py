"""
Sample Python file with proper type annotations.
Used for testing type enforcer with clean code.
"""

from typing import Callable, Protocol


class Processor(Protocol):
    """Protocol for processing objects."""

    def process(self, data: dict[str, int]) -> str:
        """Process data and return result."""
        ...


def greet(name: str) -> str:
    """
    Greets a person by name.

    Args:
        name: The person's name

    Returns:
        A greeting message
    """
    return f"Hello, {name}!"


def calculate_sum(numbers: list[int]) -> int:
    """
    Calculate sum of numbers.

    Args:
        numbers: List of integers

    Returns:
        Sum of all numbers
    """
    return sum(numbers)


def get_config() -> dict[str, str | int]:
    """
    Get configuration dictionary.

    Returns:
        Configuration with string or int values
    """
    return {"name": "sage", "version": 1}


def maybe_process(data: str | None) -> str:
    """
    Process data if present.

    Args:
        data: Optional data string

    Returns:
        Processed data or default
    """
    if data is None:
        return "default"
    return data.upper()


class Calculator:
    """Calculator with proper type annotations."""

    def __init__(self, initial: int = 0) -> None:
        """
        Initialize calculator.

        Args:
            initial: Initial value
        """
        self.value = initial

    def add(self, amount: int) -> int:
        """
        Add amount to current value.

        Args:
            amount: Amount to add

        Returns:
            New value
        """
        self.value += amount
        return self.value

    def apply(self, func: Callable[[int], int]) -> int:
        """
        Apply function to current value.

        Args:
            func: Function to apply

        Returns:
            Result of function application
        """
        self.value = func(self.value)
        return self.value
