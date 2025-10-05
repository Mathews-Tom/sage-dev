"""Configuration management for sage-setup."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


@dataclass
class Config:
    """Sage-setup configuration."""

    language: str
    agent: str | None = None
    enforcement_level: str = "BALANCED"
    configured_at: str | None = None

    @classmethod
    def from_dict(cls, data: dict[str, str]) -> Config:
        """Create config from dictionary."""
        return cls(
            language=data["language"],
            agent=data.get("agent"),
            enforcement_level=data.get("enforcement_level", "BALANCED"),
            configured_at=data.get("configured_at"),
        )

    def to_dict(self) -> dict[str, str]:
        """Convert config to dictionary."""
        result: dict[str, str] = {
            "language": self.language,
            "enforcement_level": self.enforcement_level,
            "configured_at": self.configured_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        if self.agent:
            result["agent"] = self.agent
        return result


def get_config_path() -> Path:
    """Get the path to the config file."""
    config_dir = Path.cwd() / ".sage"
    return config_dir / "config.json"


def load_config() -> Config | None:
    """Load configuration from file."""
    config_path = get_config_path()
    if not config_path.exists():
        return None

    try:
        with config_path.open() as f:
            data = json.load(f)
        return Config.from_dict(data)
    except (json.JSONDecodeError, KeyError, OSError):
        return None


def save_config(config: Config) -> None:
    """Save configuration to file."""
    config_path = get_config_path()
    config_path.parent.mkdir(parents=True, exist_ok=True)

    with config_path.open("w") as f:
        json.dump(config.to_dict(), f, indent=2)
