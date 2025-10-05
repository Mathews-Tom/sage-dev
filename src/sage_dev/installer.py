"""Installation logic for sage-setup."""

from __future__ import annotations

import shutil
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from rich.progress import Progress, SpinnerColumn, TextColumn

from .constants import AGENT_AGENT_DIRS, AGENT_DIRS, AGENT_RULES_DIRS
from .display import console, show_error, show_info, show_success, show_warning


@dataclass
class InstallationResult:
    """Result of an installation operation."""

    commands_installed: int
    agents_installed: int
    rules_installed: int
    success: bool
    errors: list[str]


def get_script_dir() -> Path:
    """Get the sage-dev script directory."""
    # Assuming this is called from the sage-dev directory
    return Path.cwd()


def get_source_dirs() -> tuple[Path, Path, Path]:
    """Get source directories for commands, agents, and rules."""
    script_dir = get_script_dir()
    return (
        script_dir / "commands",
        script_dir / "agents",
        script_dir / "rules",
    )


def count_files(language: str) -> tuple[int, int, int, int]:
    """Count files to be installed."""
    commands_dir, agents_dir, rules_dir = get_source_dirs()

    # Count command files
    command_count = len(list(commands_dir.glob("*.md"))) if commands_dir.exists() else 0

    # Count shared agent files
    shared_agent_dir = agents_dir / "shared"
    shared_agent_count = len(list(shared_agent_dir.glob("*.md"))) if shared_agent_dir.exists() else 0

    # Count language-specific agent files
    lang_agent_dir = agents_dir / language
    lang_agent_count = len(list(lang_agent_dir.glob("*.md"))) if lang_agent_dir.exists() else 0

    # Count rule files
    rule_count = len(list(rules_dir.glob("*.md"))) if rules_dir.exists() else 0

    return command_count, shared_agent_count, lang_agent_count, rule_count


def backup_existing_files(target_dir: Path) -> Path | None:
    """Backup existing files if any exist."""
    if not target_dir.exists() or not any(target_dir.iterdir()):
        return None

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_dir = target_dir.parent / f"{target_dir.name}.backup.{timestamp}"

    shutil.copytree(target_dir, backup_dir)
    return backup_dir


def copy_files(source_dir: Path, target_dir: Path, pattern: str = "*.md") -> int:
    """Copy files from source to target directory."""
    if not source_dir.exists():
        return 0

    target_dir.mkdir(parents=True, exist_ok=True)
    count = 0

    for file in source_dir.glob(pattern):
        if file.is_file():
            shutil.copy2(file, target_dir / file.name)
            count += 1

    return count


def install_to_agent(agent: str, language: str) -> InstallationResult:
    """Install sage-dev to a specific agent."""
    errors: list[str] = []

    # Get target directories
    commands_target = AGENT_DIRS[agent]
    agents_target = AGENT_AGENT_DIRS[agent]
    rules_target = AGENT_RULES_DIRS[agent]

    # Get source directories
    commands_dir, agents_dir, rules_dir = get_source_dirs()

    # Verify source directories exist
    if not commands_dir.exists():
        errors.append(f"Commands directory not found: {commands_dir}")
        return InstallationResult(0, 0, 0, False, errors)

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        # Create directories
        task = progress.add_task("Creating directories...", total=None)
        commands_target.mkdir(parents=True, exist_ok=True)
        agents_target.mkdir(parents=True, exist_ok=True)
        rules_target.mkdir(parents=True, exist_ok=True)
        progress.update(task, completed=True)
        show_info(f"Commands: {commands_target}")
        show_info(f"Agents: {agents_target}")
        show_info(f"Rules: {rules_target}")
        console.print()

        # Backup existing files
        task = progress.add_task("Checking for existing files...", total=None)
        backup_dir = backup_existing_files(commands_target)
        progress.update(task, completed=True)
        if backup_dir:
            show_info(f"Backup saved to: {backup_dir}")
            console.print()

        # Copy command files
        task = progress.add_task("Copying command files...", total=None)
        commands_installed = copy_files(commands_dir, commands_target)
        progress.update(task, completed=True)
        show_success(f"Copied {commands_installed} command files")
        console.print()

        # Copy agent files
        task = progress.add_task("Copying agent files...", total=None)
        agents_installed = 0

        # Copy shared agents
        shared_agent_dir = agents_dir / "shared"
        if shared_agent_dir.exists():
            shared_count = copy_files(shared_agent_dir, agents_target)
            agents_installed += shared_count
            show_success(f"Copied {shared_count} shared agents")

        # Copy language-specific agents
        lang_agent_dir = agents_dir / language
        if lang_agent_dir.exists():
            lang_count = copy_files(lang_agent_dir, agents_target)
            agents_installed += lang_count
            show_success(f"Copied {lang_count} {language} agents")

        # Copy agent registry
        registry_file = agents_dir / "index.json"
        if registry_file.exists():
            shutil.copy2(registry_file, agents_target / "index.json")
            show_success("Copied agent registry (index.json)")

        progress.update(task, completed=True)
        console.print()

        # Copy rule files
        task = progress.add_task("Copying rule files...", total=None)
        rules_installed = copy_files(rules_dir, rules_target)
        progress.update(task, completed=True)
        show_success(f"Copied {rules_installed} rule files")
        console.print()

    # Verify installation
    command_count, shared_agent_count, lang_agent_count, rule_count = count_files(language)
    total_agent_count = shared_agent_count + lang_agent_count

    if commands_installed != command_count:
        show_warning(f"Commands: Expected {command_count} files, but installed {commands_installed}")
    else:
        show_success("Commands installation verified")

    if agents_installed != total_agent_count:
        show_warning(f"Agents: Expected {total_agent_count} files, but installed {agents_installed}")
    else:
        show_success("Agents installation verified")

    if rules_installed != rule_count:
        show_warning(f"Rules: Expected {rule_count} files, but installed {rules_installed}")
    else:
        show_success("Rules installation verified")

    console.print()

    return InstallationResult(
        commands_installed=commands_installed,
        agents_installed=agents_installed,
        rules_installed=rules_installed,
        success=len(errors) == 0,
        errors=errors,
    )
