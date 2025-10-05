"""Agent detection utilities."""

from __future__ import annotations

from pathlib import Path

from .constants import AGENT_DIRS


def detect_installed_agents() -> list[str]:
    """Detect installed AI coding agents by checking for parent directories."""
    detected: list[str] = []

    for agent, agent_dir in AGENT_DIRS.items():
        parent_dir = agent_dir.parent
        if parent_dir.exists():
            detected.append(agent)

    return detected


def validate_agent(agent: str) -> bool:
    """Validate that an agent is supported."""
    return agent in AGENT_DIRS
