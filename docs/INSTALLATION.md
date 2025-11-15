# Sage-Dev Installation & Setup Guide

Complete guide for installing, updating, and configuring Sage-Dev v2.6+.

## Table of Contents

- [Quick Start](#quick-start)
- [Requirements](#requirements)
- [Installation Methods](#installation-methods)
- [MCP Server Setup](#mcp-server-setup)
- [Post-Installation Configuration](#post-installation-configuration)
- [Updating Sage-Dev](#updating-sage-dev)
- [Uninstallation](#uninstallation)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Mathews-Tom/sage-dev.git
cd sage-dev

# 2. Run setup (interactive)
./sage-setup.sh

# 3. Initialize your project repository
/sage.init

# 4. (Optional) Setup MCP servers for advanced features
./scripts/setup-mcp-servers.sh

# 5. Start developing
/sage.workflow
```

---

## Requirements

### Minimum Requirements

- **Operating System**: macOS 12+ / Linux (Ubuntu 20.04+) / Windows 10+ (WSL2)
- **AI Coding Agent**: Claude Code, Opencode CLI, or DROID CLI
- **Git**: 2.30+
- **Bash**: 4.0+ (zsh 5.0+ also supported)

### Optional Requirements (for advanced features)

- **Node.js**: 18+ (for MCP servers)
- **npm**: 9+ (for MCP server dependencies)
- **Python**: 3.12+ (for Python pattern extraction)
- **uv**: Latest (Python package manager)

### Verify Requirements

```bash
# Check versions
git --version          # Should be 2.30+
node --version         # Should be 18+
npm --version          # Should be 9+
python3 --version      # Should be 3.12+
bash --version         # Should be 4.0+
```

---

## Installation Methods

### Method 1: Interactive Setup (Recommended)

```bash
# Clone and enter directory
git clone https://github.com/Mathews-Tom/sage-dev.git
cd sage-dev

# Run interactive setup
./sage-setup.sh
```

The setup wizard will:

1. Auto-detect installed AI coding agents
2. Prompt for programming language selection
3. Install commands, agents, and rules
4. Configure enforcement settings
5. Create `.sage/config.json`

**Example Session:**

```plaintext
╔════════════════════════════════════════════════════════════════╗
║              Sage-Dev Setup Wizard v2.6                        ║
╚════════════════════════════════════════════════════════════════╝

🔍 Detecting installed AI coding agents...
   ✓ Found: claude-code (~/.claude/)

🌐 Select your programming language:
   1) Python (default)
   2) JavaScript
   3) TypeScript

Enter choice [1-3] (default: 1): 1

📋 Installing components...
   ✓ Commands (37 files)
   ✓ Agents (7 files)
   ✓ Rules (5 files)
   ✓ Configuration files

✅ Installation complete!

Next steps:
1. Open your AI coding agent
2. Run /sage.init to initialize your project
3. Run /sage.workflow to select your workflow
```

### Method 2: Specify Agent and Language

```bash
# Install for specific agent and language
./sage-setup.sh claude-code python
./sage-setup.sh opencode typescript
./sage-setup.sh droid javascript

# Install for all detected agents
./sage-setup.sh all python
```

### Method 3: Symlink Installation (Development)

Best for contributing to sage-dev or testing changes:

```bash
# For Claude Code
rm -rf ~/.claude/commands
ln -s /path/to/sage-dev/commands ~/.claude/commands

rm -rf ~/.claude/agents
ln -s /path/to/sage-dev/agents ~/.claude/agents

# Changes to sage-dev are immediately available
```

### Method 4: Manual Installation

```bash
# Copy commands
cp -r commands/*.md ~/.claude/commands/

# Copy agents
cp -r agents/* ~/.claude/agents/

# Copy rules
cp -r rules/* ~/.claude/rules/

# Create config directory
mkdir -p .sage
cp -r .sage/* ./.sage/
```

---

## MCP Server Setup

MCP (Model Context Protocol) servers provide advanced features like pattern extraction, research caching, and code enforcement.

### Available MCP Servers

| Server | Purpose | Key Features |
|--------|---------|--------------|
| **sage-context-optimizer** | Pattern extraction & progressive loading | 60-80% token reduction, AST analysis |
| **sage-research** | Research caching | 24h TTL, query deduplication |
| **sage-enforcement** | Code quality enforcement | Real-time linting, pattern validation |

### Quick Setup

```bash
# Install all MCP servers
cd servers

# sage-context-optimizer
cd sage-context-optimizer
npm install
npm run build
cd ..

# sage-research
cd sage-research
npm install
npm run build
cd ..

# sage-enforcement
cd sage-enforcement
npm install
npm run build
cd ..
```

### Configure Claude Code

Add to `~/.claude/mcp_servers.json`:

```json
{
  "mcpServers": {
    "sage-context-optimizer": {
      "command": "node",
      "args": ["/path/to/sage-dev/servers/sage-context-optimizer/dist/index.js"],
      "env": {}
    },
    "sage-research": {
      "command": "node",
      "args": ["/path/to/sage-dev/servers/sage-research/dist/index.js"],
      "env": {}
    },
    "sage-enforcement": {
      "command": "node",
      "args": ["/path/to/sage-dev/servers/sage-enforcement/dist/index.js"],
      "env": {}
    }
  }
}
```

### Verify MCP Servers

```bash
# Test pattern extraction
node servers/sage-context-optimizer/dist/index.js --test

# Run MCP server tests
cd servers/sage-context-optimizer
npm test

# Check available tools
# In Claude Code, MCP tools appear as: mcp__sage-context-optimizer__*
```

### MCP Server Tools

**sage-context-optimizer:**

- `extract_patterns` - AST-based pattern extraction
- `load_patterns` - Load saved patterns from disk
- `display_patterns` - Human-readable pattern output
- `load_patterns_progressive` - Context-aware loading with token reduction

**sage-research:**

- `research_query` - Query cached research
- `research_store` - Store research findings
- `research_invalidate` - Invalidate cache entry
- `research_stats` - Cache statistics
- `research_cleanup` - Remove expired entries

---

## Post-Installation Configuration

### 1. Initialize Your Repository

```bash
# In Claude Code, run:
/sage.init
```

This performs:

- Codebase analysis and pattern extraction
- Baseline documentation generation
- Tech stack detection
- Pattern storage in `.sage/agent/examples/`

### 2. Select Workflow

```bash
/sage.workflow
```

Choose between:

- **Traditional**: Manual spec → plan → implement
- **Ticket-Based**: Automated ticket system with state management

### 3. Configure Enforcement Level

Edit `.sage/config.json`:

```json
{
  "language": "python",
  "enforcement_level": "BALANCED",
  "configured_at": "2025-01-15T10:30:00Z"
}
```

**Levels:**

- `STRICT` - Zero tolerance, all agents, auto-fix enabled
- `BALANCED` - Core agents, warnings for non-critical issues
- `PROTOTYPE` - Security agents only, violations logged

### 4. Configure Agent Settings

Edit `.sage/enforcement.json`:

```json
{
  "agents": {
    "sage.type-enforcer": {
      "enabled": true,
      "severity": "error"
    },
    "sage.doc-validator": {
      "enabled": true,
      "severity": "warning"
    },
    "sage.test-coverage": {
      "enabled": true,
      "threshold": 80
    }
  }
}
```

---

## Updating Sage-Dev

### Standard Update

```bash
# Navigate to sage-dev directory
cd /path/to/sage-dev

# Pull latest changes
git pull origin main

# Re-run setup (preserves configuration)
./sage-setup.sh claude-code python

# Update MCP servers
cd servers/sage-context-optimizer && npm install && npm run build && cd ..
cd servers/sage-research && npm install && npm run build && cd ..
cd servers/sage-enforcement && npm install && npm run build && cd ..
```

### Update with Migration

```bash
# Check for breaking changes
git fetch origin
git log HEAD..origin/main --oneline

# Pull and migrate
git pull origin main
./sage-setup.sh --migrate
```

### Version Check

```bash
# Check installed version
cat README.md | grep "Version"

# Check command versions
head -5 ~/.claude/commands/sage.workflow.md
```

### Rollback to Previous Version

```bash
# List available versions
git tag -l

# Rollback to specific version
git checkout v2.5.0

# Re-run setup
./sage-setup.sh claude-code python
```

---

## Uninstallation

### Remove Commands Only

```bash
# Remove sage-dev commands
rm -f ~/.claude/commands/sage.*.md
rm -f ~/.claude/commands/SAGE.*.md

# Keep your AI agent's other commands
```

### Full Uninstallation

```bash
# Remove all installed components
rm -rf ~/.claude/commands/sage.*
rm -rf ~/.claude/agents/sage.*
rm -rf ~/.claude/rules/*

# Remove MCP server configurations
# Edit ~/.claude/mcp_servers.json to remove sage-* entries

# Remove project-level configuration
rm -rf .sage/

# Remove sage-dev repository
rm -rf /path/to/sage-dev
```

### Preserve Configuration

Before uninstalling, backup:

```bash
# Backup configuration
cp -r .sage/ ~/sage-backup/
cp ~/.claude/mcp_servers.json ~/sage-backup/

# Backup custom commands/agents
cp -r ~/.claude/commands/custom-* ~/sage-backup/
```

---

## Troubleshooting

### Commands Not Appearing

**Issue**: `/sage.*` commands not in autocomplete

**Solution**:

```bash
# Verify installation
ls -la ~/.claude/commands/ | grep sage

# Re-run setup
./sage-setup.sh claude-code python

# Restart Claude Code
```

### MCP Server Connection Failed

**Issue**: MCP tools not available

**Solution**:

```bash
# Check server is built
ls servers/sage-context-optimizer/dist/index.js

# Rebuild if missing
cd servers/sage-context-optimizer
npm run build

# Verify config path
cat ~/.claude/mcp_servers.json | jq .

# Test server directly
node servers/sage-context-optimizer/dist/index.js
```

### Pattern Extraction Fails

**Issue**: `/sage.init` pattern extraction errors

**Solution**:

```bash
# Ensure Python 3.12+
python3 --version

# Install ast tools
pip3 install ast-grep

# Check file permissions
chmod +x servers/sage-context-optimizer/extract-patterns.sh

# Run with verbose output
/sage.init --verbose
```

### Agent Enforcement Errors

**Issue**: Agents blocking valid code

**Solution**:

```bash
# Check enforcement level
cat .sage/config.json | jq .enforcement_level

# Temporarily reduce strictness
{
  "enforcement_level": "PROTOTYPE"
}

# Disable specific agent
cat .sage/enforcement.json | jq '.agents["sage.type-enforcer"].enabled = false'
```

### Permission Denied

**Issue**: Setup script fails with permission error

**Solution**:

```bash
# Make scripts executable
chmod +x sage-setup.sh
chmod +x scripts/*.sh
chmod +x servers/*/build.sh

# Re-run setup
./sage-setup.sh
```

### Node.js Version Mismatch

**Issue**: MCP servers require Node 18+

**Solution**:

```bash
# Check Node version
node --version

# Install Node 18+ via nvm
nvm install 18
nvm use 18

# Or via brew (macOS)
brew install node@18
```

### Symlink Issues

**Issue**: Symlinked commands not updating

**Solution**:

```bash
# Verify symlink target
ls -la ~/.claude/commands

# Check if target exists
ls -la /path/to/sage-dev/commands/

# Recreate symlink
rm ~/.claude/commands
ln -s /path/to/sage-dev/commands ~/.claude/commands

# Restart Claude Code
```

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Mathews-Tom/sage-dev/issues)
- **Documentation**: See `commands/`, `agents/`, and `rules/` directories
- **In-Agent Help**: Ask "How do I use /sage.workflow?" or "Explain the ticket system"

---

## Next Steps

After installation:

1. **Initialize**: `/sage.init` - Extract patterns and generate baseline docs
2. **Choose Workflow**: `/sage.workflow` - Traditional vs Ticket-Based
3. **Start Feature**: `/sage.init-feature <name>` - Create feature request
4. **Research**: `/sage.intel` - Gather best practices and solutions
5. **Specify**: `/sage.specify` - Generate technical specifications
6. **Plan**: `/sage.plan` - Create implementation plan
7. **Execute**: `/sage.implement` or `/sage.stream` - Build your feature

**For more information:**

- [Workflow Guide](WORKFLOWS.md)
- [Command Reference](../commands/SAGE.COMMANDS.md)
- [Skills Guide](SKILLS_GUIDE.md)
