# Sage-Dev Quickstart Guide

Get started with Sage-Dev in 5 minutes.

## Prerequisites

- Git 2.30+
- Node.js 18+ (optional, for MCP servers)
- Claude Code, Opencode, or DROID CLI

## Installation (2 minutes)

```bash
# Clone repository
git clone https://github.com/Mathews-Tom/sage-dev.git
cd sage-dev

# Run setup
./sage-setup.sh

# Select:
# 1. Your AI agent (auto-detected)
# 2. Your language (Python/JavaScript/TypeScript)
# 3. Enforcement level (STRICT/BALANCED/PROTOTYPE)
```

## First Use (3 minutes)

### Step 1: Initialize Your Project

In your AI coding agent:

```bash
/sage.init
```

This extracts patterns from your codebase and generates baseline documentation.

### Step 2: Choose Your Workflow

```bash
/sage.workflow
```

**Traditional**: Manual control over each step
**Ticket-Based**: Automated execution with state tracking

### Step 3: Create a Feature

```bash
/sage.init-feature my-feature
```

### Step 4: Execute

**Traditional Workflow:**

```bash
/sage.specify      # Generate spec
/sage.plan         # Create plan
/sage.tasks        # Break down tasks
/sage.implement    # Execute implementation
/sage.commit       # Commit changes
```

**Ticket-Based Workflow:**

```bash
/sage.specify      # Generate spec
/sage.plan         # Create plan
/sage.tasks        # Break down tasks
/sage.migrate      # Convert to tickets
/sage.stream --semi-auto  # Auto-execute (3-5× faster)
```

## Common Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/sage.init` | Initialize repository | `/sage.init` |
| `/sage.workflow` | Select workflow | `/sage.workflow` |
| `/sage.init-feature` | Create feature request | `/sage.init-feature auth` |
| `/sage.intel` | Research best practices | `/sage.intel` |
| `/sage.specify` | Generate specification | `/sage.specify` |
| `/sage.plan` | Create implementation plan | `/sage.plan` |
| `/sage.tasks` | Break down into tasks | `/sage.tasks` |
| `/sage.implement` | Execute implementation | `/sage.implement` |
| `/sage.stream` | Automated execution | `/sage.stream --semi-auto` |
| `/sage.commit` | Create semantic commit | `/sage.commit` |

## Execution Modes

```bash
/sage.stream --interactive  # Confirm every step (default)
/sage.stream --semi-auto    # Confirm per component (3-5× faster)
/sage.stream --auto         # No confirmations (5-10× faster)
/sage.stream --auto --parallel=3  # Parallel execution (10-20× faster)
```

## Optional: MCP Servers

For advanced features (pattern extraction, research caching):

```bash
cd servers/sage-context-optimizer
npm install && npm run build
cd ..

# Configure ~/.claude/mcp_servers.json
```

See [docs/MCP_SETUP.md](MCP_SETUP.md) for full setup.

## Next Steps

- **Full Installation Guide**: [docs/INSTALLATION.md](INSTALLATION.md)
- **All Workflow Scenarios**: [docs/WORKFLOWS.md](WORKFLOWS.md)
- **Command Reference**: [commands/SAGE.COMMANDS.md](../commands/SAGE.COMMANDS.md)
- **MCP Server Setup**: [docs/MCP_SETUP.md](MCP_SETUP.md)

## Common Issues

**Commands not appearing?**

```bash
ls ~/.claude/commands/ | grep sage
./sage-setup.sh claude-code python
```

**Need help with a command?**

```bash
# Ask your AI agent:
"How do I use /sage.stream?"
"What are the prerequisites for /sage.implement?"
```

## Support

- **GitHub Issues**: <https://github.com/Mathews-Tom/sage-dev/issues>
- **In-Agent Help**: Ask your AI agent about any command
- **Documentation**: See `commands/`, `docs/` directories
