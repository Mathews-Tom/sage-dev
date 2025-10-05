"""Rich display utilities for sage-setup CLI."""

from __future__ import annotations

from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree

from .constants import AGENT_NAMES, LANGUAGE_DESCRIPTIONS

console = Console()


def show_header() -> None:
    """Display the setup header."""
    header = Panel(
        "[bold cyan]Sage-Dev Setup for AI Coding Agents[/bold cyan]\n"
        "[dim]Language-Specific Enforcement • Commands • Agents • Rules[/dim]",
        border_style="cyan",
    )
    console.print(header)
    console.print()


def show_installation_plan(
    selected_agent: str,
    detected_agents: list[str],
    agent_dirs: dict[str, Path],
    language: str,
    command_count: int,
    shared_agent_count: int,
    lang_agent_count: int,
    rule_count: int,
) -> None:
    """Display the installation plan with confirmation prompt."""
    total_agents = shared_agent_count + lang_agent_count

    # Show confirmation header
    console.print(Panel(
        "[bold cyan]Installation Confirmation[/bold cyan]",
        border_style="cyan",
    ))
    console.print()

    console.print("[bold]📦 Installation Plan:[/bold]")
    console.print()

    # Show target agents
    if selected_agent == "all":
        console.print(f"   🎯 [bold]Target:[/bold] All detected agents ({len(detected_agents)})")
        for agent in detected_agents:
            console.print(f"      • [cyan]{agent}[/cyan] → {agent_dirs[agent]}")
    else:
        console.print(f"   🎯 [bold]Target:[/bold] {selected_agent}")
        console.print(f"      → {agent_dirs[selected_agent]}")

    console.print()
    console.print(f"   🌐 [bold]Language:[/bold] {language}")
    console.print(f"   📋 [bold]Commands:[/bold] {command_count} files")
    console.print(f"   🤖 [bold]Agents:[/bold] {total_agents} files")
    console.print(f"      - Shared: {shared_agent_count} (language-agnostic)")
    console.print(f"      - {language}: {lang_agent_count} (language-specific)")
    console.print(f"   📜 [bold]Rules:[/bold] {rule_count} files")
    console.print("   📑 [bold]Agent registry:[/bold] agents/index.json")
    console.print()
    console.print("━" * 66)
    console.print()


def show_detected_agents(agents: list[str], agent_dirs: dict[str, Path]) -> None:
    """Display detected agents."""
    console.print("[bold]🔍 Detecting installed AI coding agents...[/bold]")
    console.print()

    for agent in agents:
        agent_dir = agent_dirs[agent]
        console.print(f"   [green]✓[/green] Found: [cyan]{agent}[/cyan] ({agent_dir})")


def show_no_agents_detected() -> None:
    """Display message when no agents are detected."""
    console.print("[yellow]   ℹ️  No AI coding agents detected[/yellow]")
    console.print()
    console.print("Please specify an agent manually:")
    console.print("  [dim]sage-setup --agent claude-code[/dim]")
    console.print("  [dim]sage-setup --agent cline[/dim]")
    console.print("  [dim]sage-setup --agent roo-cline[/dim]")


def show_installation_progress(agent: str) -> None:
    """Display installation progress header."""
    console.rule(f"[bold cyan]Installing to: {agent}[/bold cyan]")
    console.print()


def show_installation_complete(
    agent: str | None,
    language: str,
    command_count: int,
    shared_agent_count: int,
    lang_agent_count: int,
    rule_count: int,
    agent_dir: Path,
    installed_agents: list[str] | None = None,
) -> None:
    """Display installation completion summary."""
    console.print()
    console.print(Panel("[bold green]✅ INSTALLATION COMPLETE[/bold green]", border_style="green"))
    console.print()

    # Installation location
    if installed_agents:
        console.print("[bold]📍 Installed to multiple agents:[/bold]")
        for installed_agent in installed_agents:
            console.print(f"   • {installed_agent}")
    else:
        console.print("[bold]📍 Installation Location:[/bold]")
        console.print(f"   {agent_dir}")

    console.print()

    # Summary
    total_agents = shared_agent_count + lang_agent_count
    table = Table(title="📊 Installation Summary", border_style="cyan")
    table.add_column("Component", style="cyan")
    table.add_column("Details", style="white")

    table.add_row("Language", f"[yellow]{language}[/yellow]")
    table.add_row("Commands", f"{command_count} files")
    table.add_row("  • Slash commands", str(command_count - 4))
    table.add_row("  • Documentation", "4 files")
    table.add_row("Agents", f"{total_agents} files + registry")
    table.add_row("  • Shared", f"{shared_agent_count} (bs-check, bs-enforce, secret-scanner)")

    if language == "python":
        table.add_row(
            f"  • {language}",
            f"{lang_agent_count} (type-enforcer, doc-validator, test-coverage, import-enforcer)",
        )
    else:
        table.add_row(f"  • {language}", f"{lang_agent_count} (available for future implementation)")

    table.add_row("Rules", f"{rule_count} files")
    table.add_row(
        "  • Rule types",
        "enforcement-guide, typing-standards, test-standards, security-standards, commit-standards",
    )

    console.print(table)
    console.print()


def show_getting_started(agent: str | None, language: str) -> None:
    """Display getting started instructions."""
    agent_name = AGENT_NAMES.get(agent, "your AI coding agent") if agent else "your AI coding agent"

    console.print("[bold cyan]🚀 Getting Started:[/bold cyan]")
    console.print()
    console.print("   1. Open [cyan]{agent_name}[/cyan]".format(agent_name=agent_name))
    console.print("   2. Type [yellow]/[/yellow] to see all available commands")
    console.print("   3. Run [yellow]/workflow[/yellow] to choose your workflow (START HERE)")
    console.print("   4. Use [yellow]/SAGE_DEV_COMMANDS[/yellow] for complete syntax guide")
    console.print()

    console.print("[bold cyan]💡 Quick Commands:[/bold cyan]")
    console.print()

    # Workflow commands
    tree = Tree("📋 [bold]Workflow[/bold]")
    tree.add("[yellow]/workflow[/yellow]          Choose Traditional vs Ticket-Based workflow")
    tree.add("[yellow]/intel[/yellow]             Strategic system assessment")
    tree.add("[yellow]/specify[/yellow]           Generate specifications from docs")
    tree.add("[yellow]/plan[/yellow]              Create implementation plans")
    tree.add("[yellow]/tasks[/yellow]             Break down into SMART tasks")
    tree.add("[yellow]/migrate[/yellow]           Convert to ticket system")
    tree.add("[yellow]/stream[/yellow]            Automated development loop")

    console.print(tree)
    console.print()

    # Quality commands
    tree2 = Tree("✅ [bold]Quality & Validation[/bold]")
    tree2.add("[yellow]/enforce[/yellow]          Run agent enforcement pipeline")
    tree2.add("[yellow]/validate[/yellow]         Validate ticket system")
    tree2.add("[yellow]/quality[/yellow]          Validate output quality")

    console.print(tree2)
    console.print()

    # Enforcement agents
    console.print("[bold cyan]🤖 Enforcement Agents:[/bold cyan]")
    console.print("   • [green]bs-check[/green]         Remove bullshit code patterns")
    console.print("   • [green]type-enforcer[/green]    Python 3.12 typing validation")
    console.print("   • [green]secret-scanner[/green]   Detect hardcoded secrets")
    console.print("   • [green]test-coverage[/green]    Enforce coverage thresholds")
    console.print()


def show_update_instructions(agent: str | None, language: str) -> None:
    """Display update instructions."""
    console.print("[bold cyan]🔄 To update in the future:[/bold cyan]")
    console.print("   cd /path/to/sage-dev")
    console.print("   git pull")
    if agent == "all":
        console.print(f"   sage-setup --agent all --language {language}")
    elif agent:
        console.print(f"   sage-setup --agent {agent} --language {language}")
    else:
        console.print(f"   sage-setup --language {language}")
    console.print()

    console.print("[bold cyan]💡 To change language:[/bold cyan]")
    console.print(f"   sage-setup --agent {agent or 'AGENT'} --language [python|javascript|typescript]")
    console.print("   Or delete .sage/config.json to re-run the wizard")
    console.print()


def show_error(message: str) -> None:
    """Display an error message."""
    console.print(f"[bold red]❌ ERROR:[/bold red] {message}")


def show_warning(message: str) -> None:
    """Display a warning message."""
    console.print(f"[yellow]⚠️  {message}[/yellow]")


def show_success(message: str) -> None:
    """Display a success message."""
    console.print(f"[green]✅ {message}[/green]")


def show_info(message: str) -> None:
    """Display an info message."""
    console.print(f"[cyan]ℹ️  {message}[/cyan]")
