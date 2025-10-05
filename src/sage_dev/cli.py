"""Main CLI for sage-setup."""

from __future__ import annotations

import sys
from typing import Annotated

import typer
from rich.prompt import Confirm

from .config import Config, load_config, save_config
from .constants import (
    AGENT_DIRS,
    LANGUAGE_DESCRIPTIONS,
    SUPPORTED_LANGUAGES,
)
from .detection import detect_installed_agents, validate_agent
from .display import (
    console,
    show_error,
    show_getting_started,
    show_header,
    show_installation_complete,
    show_installation_plan,
    show_installation_progress,
    show_no_agents_detected,
    show_update_instructions,
)
from .installer import count_files, install_to_agent

app = typer.Typer(
    name="sage-setup",
    help="Interactive CLI setup tool for AI coding agents with language-specific enforcement",
    add_completion=False,
    rich_markup_mode="rich",
)


def select_language(language_arg: str | None) -> str:
    """Determine programming language from arg/config/default."""
    # Check if language specified via argument
    if language_arg:
        if language_arg not in SUPPORTED_LANGUAGES:
            show_error(f"Unsupported language: {language_arg}")
            console.print()
            console.print("Supported languages:")
            for lang in SUPPORTED_LANGUAGES:
                console.print(f"  - {lang}")
            sys.exit(1)
        return language_arg

    # Try to load from config
    config = load_config()
    if config:
        return config.language

    # Default to python
    return "python"


def select_agent(agent_arg: str | None) -> tuple[str, list[str]]:
    """Determine agent from arg or auto-detect. Returns (selected_agent, detected_agents)."""
    detected_agents: list[str] = []

    # Check if agent specified via argument
    if agent_arg:
        if agent_arg != "all" and not validate_agent(agent_arg):
            show_error(f"Unknown agent: {agent_arg}")
            console.print()
            console.print("Supported agents:")
            for agent in AGENT_DIRS:
                console.print(f"  - {agent}")
            console.print("  - all (install to all detected agents)")
            sys.exit(1)

        # Populate detected_agents for later use
        if agent_arg == "all":
            detected_agents = detect_installed_agents()
        else:
            detected_agents = [agent_arg]

        return agent_arg, detected_agents

    # Auto-detect installed agents
    detected_agents = detect_installed_agents()

    if not detected_agents:
        show_no_agents_detected()
        sys.exit(1)

    # Default to installing to all detected agents
    return "all", detected_agents


@app.command()
def main(
    agent: Annotated[
        str | None,
        typer.Option(
            "--agent",
            "-a",
            help="Agent to install to (e.g., claude-code, cline, all). If not specified, auto-detects installed agents.",
            rich_help_panel="Installation Options",
        ),
    ] = None,
    language: Annotated[
        str | None,
        typer.Option(
            "--language",
            "-l",
            help="Programming language (python, javascript, typescript). Default: python or from .sage/config.json",
            rich_help_panel="Installation Options",
        ),
    ] = None,
    list_agents: Annotated[
        bool,
        typer.Option(
            "--list-agents",
            help="List all supported AI coding agents and their installation paths",
            rich_help_panel="Information",
        ),
    ] = False,
    list_languages: Annotated[
        bool,
        typer.Option(
            "--list-languages",
            help="List all supported programming languages and their features",
            rich_help_panel="Information",
        ),
    ] = False,
) -> None:
    """
    Install sage-dev commands, agents, and rules to AI coding agents.

    Supports multiple AI coding agents including Claude Code, Cline, Roo-Cline,
    Continue, Cursor, Opencode, and DROID. Provides language-specific enforcement
    for Python, JavaScript, and TypeScript.

    \b
    Examples:
        sage-setup                               # Interactive mode
        sage-setup -a claude-code -l python      # Specific agent and language
        sage-setup --agent all -l typescript     # Install to all detected agents
        sage-setup --list-agents                 # Show available agents
        sage-setup --list-languages              # Show available languages
    """
    # Handle list commands
    if list_agents:
        console.print("[bold]Supported AI Agents:[/bold]")
        for agent_name, agent_dir in AGENT_DIRS.items():
            console.print(f"  • [cyan]{agent_name}[/cyan] → {agent_dir}")
        return

    if list_languages:
        console.print("[bold]Supported Languages:[/bold]")
        for lang in SUPPORTED_LANGUAGES:
            desc = LANGUAGE_DESCRIPTIONS.get(lang, "")
            console.print(f"  • [yellow]{lang}[/yellow] - {desc}")
        return

    # Show header
    show_header()

    # Select language
    selected_language = select_language(language)

    # Select agent
    selected_agent, detected_agents = select_agent(agent)

    if not selected_agent:
        show_error("No agent selected")
        sys.exit(1)

    # Count files
    command_count, shared_agent_count, lang_agent_count, rule_count = count_files(
        selected_language
    )

    # Show installation plan with confirmation
    show_installation_plan(
        selected_agent,
        detected_agents,
        AGENT_DIRS,
        selected_language,
        command_count,
        shared_agent_count,
        lang_agent_count,
        rule_count,
    )

    # Ask for confirmation
    if not Confirm.ask("Proceed with installation?", default=True):
        console.print()
        console.print("Installation cancelled.")
        sys.exit(0)

    console.print()
    console.print("[green]✓[/green] Proceeding with installation...")
    console.print()

    # Install to agent(s)
    installed_agents: list[str] = []
    if selected_agent == "all":
        for agent_name in detected_agents:
            show_installation_progress(agent_name)
            install_to_agent(agent_name, selected_language)
            installed_agents.append(agent_name)
    else:
        show_installation_progress(selected_agent)
        install_to_agent(selected_agent, selected_language)

    # Save configuration
    config = Config(language=selected_language, agent=selected_agent)
    save_config(config)

    # Show completion summary
    show_installation_complete(
        agent=selected_agent if selected_agent != "all" else None,
        language=selected_language,
        command_count=command_count,
        shared_agent_count=shared_agent_count,
        lang_agent_count=lang_agent_count,
        rule_count=rule_count,
        agent_dir=AGENT_DIRS[selected_agent]
        if selected_agent != "all"
        else AGENT_DIRS[installed_agents[0]],
        installed_agents=installed_agents if selected_agent == "all" else None,
    )

    # Show getting started
    show_getting_started(selected_agent, selected_language)

    # Show update instructions
    show_update_instructions(selected_agent, selected_language)


if __name__ == "__main__":
    app()
