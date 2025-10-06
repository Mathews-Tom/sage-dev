"""Constants for sage-setup CLI."""

from __future__ import annotations

from pathlib import Path

# Supported languages
SUPPORTED_LANGUAGES = ["python", "javascript", "typescript"]

# Agent directories for commands
AGENT_DIRS: dict[str, Path] = {
    "claude-code": Path.home() / ".claude" / "commands",
    "opencode": Path.home() / ".config" / "opencode" / "commands",
    "droid": Path.home() / ".factory" / "commands",
}

# Agent directories for agents
AGENT_AGENT_DIRS: dict[str, Path] = {
    "claude-code": Path.home() / ".claude" / "agents",
    "opencode": Path.home() / ".config" / "opencode" / "agent",
    "droid": Path.home() / ".factory" / "agents",
}

# Agent directories for rules
AGENT_RULES_DIRS: dict[str, Path] = {
    "claude-code": Path.home() / ".claude" / "rules",
    "opencode": Path.home() / ".config" / "opencode" / "rules",
    "droid": Path.home() / ".factory" / "rules",
}

# Agent display names
AGENT_NAMES: dict[str, str] = {
    "claude-code": "Claude Code",
    "opencode": "Opencode CLI",
    "droid": "DROID CLI",
}

# Language descriptions
LANGUAGE_DESCRIPTIONS: dict[str, str] = {
    "python": "Type safety, test coverage, docstring validation",
    "javascript": "Code quality, secret scanning",
    "typescript": "Type safety, code quality, secret scanning",
}
