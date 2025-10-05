# Installing Sage-Dev Commands for AI Coding Agents

This guide explains how to install and use the sage-dev command system directly within AI coding agents like Claude Code, Opencode, DROID, and others.

## 🤖 Supported AI Agents

The sage-dev command system works with **any AI coding agent that supports markdown-based slash commands**:

| Agent | Directory | Status |
|-------|-----------|--------|
| **Claude Code** | `~/.claude/commands` | ✅ Fully supported |
| **Opencode CLI** | `~/.config/opencode/commands` | ✅ Fully supported |
| **DROID CLI** | `~/.factory/commands` | ✅ Fully supported |

**Universal Compatibility:** If your AI agent supports markdown files as slash commands, sage-dev will work!

---

## Overview

The sage-dev command system consists of 20 markdown-based slash commands that Claude Code can execute directly. Each command file contains:

1. **Frontmatter metadata** - `allowed-tools`, `description`, `argument-hint`
2. **Execution instructions** - Step-by-step implementation guide
3. **Integration points** - Inputs, outputs, workflow position
4. **Examples and templates** - Usage patterns and best practices

---

## Installation Methods

### Method 1: Manual Installation (Recommended for Learning)

**Step 1: Locate Your AI Agent's Custom Commands Directory**

```bash
# AI agents store custom commands in different locations:

# Claude Code
mkdir -p ~/.claude/commands

# Opencode CLI
mkdir -p ~/.config/opencode/commands

# DROID CLI
mkdir -p ~/.factory/commands
```

**Step 2: Copy Command Files**

```bash
# Navigate to sage-dev commands directory
cd /path/to/sage-dev/commands

# Copy all command files to your AI agent
# Replace AGENT_DIR with your agent's directory

# For Claude Code:
cp *.md ~/.claude/commands/

# For Opencode CLI:
cp *.md ~/.config/opencode/commands/

# For DROID CLI:
cp *.md ~/.factory/commands/

# Verify installation
ls -1 ~/.claude/commands/ | wc -l  # or your agent's directory
# Should show 24 files (20 commands + 4 documentation files)
```

**Step 3: Verify in Your AI Agent**

Open your AI coding agent and type `/` - you should see all 20 commands:

```text
/workflow      - Choose between Traditional and Ticket-Based workflows
/intel         - Strategic assessment & market intelligence
/specify       - Generate structured specifications from docs
/plan          - Generate research-backed implementation plans
/tasks         - Generate SMART task breakdowns
/breakdown     - Generate technical breakdowns with architecture
/blueprint     - Generate unified system roadmap
/estimate      - Add time estimates and calculate velocity
/migrate       - Convert documentation to ticket system
/implement     - Execute ticket-based implementation
/stream        - Automated development loop
/progress      - Analyze project progress
/commit        - Create semantic commits and PRs
/sync          - Synchronize ticket system with GitHub
/validate      - Validate ticket system integrity
/quality       - Validate command output quality
/repair        - Fix ticket system issues
/rollback      - Rollback last operation
/enhance       - Research-driven system enhancement
/poc           - Generate minimal POC documentation
```

---

### Method 2: Automated Installation (Fastest) ⭐ RECOMMENDED

The installation script **auto-detects** installed AI agents and supports multiple installations!

**Basic Usage (Auto-detect):**

```bash
cd /path/to/sage-dev
./install-sage-commands.sh
```

The script will:

1. ✅ Auto-detect installed AI coding agents
2. ✅ Show detected agents with their directories
3. ✅ Let you choose which agent(s) to install to
4. ✅ Backup existing commands automatically
5. ✅ Verify successful installation

**Specify Agent Manually:**

```bash
# Install to specific agent
./install-sage-commands.sh claude-code
./install-sage-commands.sh opencode
./install-sage-commands.sh droid
```

**Install to All Detected Agents:**

```bash
./install-sage-commands.sh all
# Installs to every detected AI agent at once!
```

**Example Output:**

```text
╔════════════════════════════════════════════════════════════════╗
║     Sage-Dev Command Installation for AI Coding Agents         ║
╚════════════════════════════════════════════════════════════════╝

📦 Found 24 command files

🔍 Detecting installed AI coding agents...

   ✓ Found: claude-code (~/.claude/commands)
   ✓ Found: opencode (~/.config/opencode/commands)

Multiple agents detected. Please choose:

1) claude-code
2) opencode
3) Install to all
4) Cancel
#? 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Installing to: claude-code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Creating commands directory...
   ✓ ~/.claude/commands

📋 Copying command files...
   ✓ Successfully copied 24 files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Installing to: opencode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Creating commands directory...
   ✓ ~/.config/opencode/commands

📋 Copying command files...
   ✓ Successfully copied 24 files

╔════════════════════════════════════════════════════════════════╗
║                  ✅ INSTALLATION COMPLETE                      ║
╚════════════════════════════════════════════════════════════════╝

📍 Installed to 2 agents:
   • claude-code: ~/.claude/commands
   • opencode: ~/.config/opencode/commands
```

---

### Method 3: Symlink Installation (For Development)

If you're actively developing/modifying commands, use symlinks to keep them in sync:

```bash
# For Claude Code
rm -rf ~/.claude/commands
ln -s /path/to/sage-dev/commands ~/.claude/commands

# For Opencode CLI
rm -rf ~/.config/opencode/commands
ln -s /path/to/sage-dev/commands ~/.config/opencode/commands

# For DROID CLI
rm -rf ~/.factory/commands
ln -s /path/to/sage-dev/commands ~/.factory/commands

# Any changes to sage-dev/commands/*.md are immediately available!
```

**Benefits:**

- ✅ Edit once, update everywhere
- ✅ Git version control on commands
- ✅ No manual copy/paste needed
- ✅ Works across multiple AI agents simultaneously
- ⚠️ Changes affect all agents immediately (be careful)

---

## Accessing Documentation Within Claude Code

### Option 1: Use SAGE_DEV_WORKFLOW as a Slash Command

Since `SAGE_DEV_WORKFLOW.md` is now in `~/.claude/commands/`, Claude Code will treat it as a command:

```text
/SAGE_DEV_WORKFLOW
# Shows the full workflow documentation and usage guide
```

### Option 2: Use SAGE_DEV_COMMANDS as a Slash Command

```text
/SAGE_DEV_COMMANDS
# Shows complete command syntax reference and workflow visualizations
```

### Option 3: Query Claude Code Directly

Within any Claude Code conversation:

```text
User: "How do I use the sage-dev workflow selector?"
Claude: [Reads ~/.claude/commands/workflow.md and explains]

User: "Show me the ticket-based workflow sequence"
Claude: [Reads SAGE_DEV_COMMANDS.md and shows the diagram]

User: "What commands are available for quality validation?"
Claude: [Lists /validate, /quality, /repair with descriptions]
```

**Claude Code automatically has access to all command files for reference!**

---

## Command Discovery Mechanism

### Built-in Command List

Type `/` in Claude Code to see all commands. Commands appear with:

- **Command name** (from filename)
- **Description** (from frontmatter `description` field)
- **Argument hint** (from frontmatter `argument-hint` field)

Example display:

```text
/workflow                    Choose between Traditional and Ticket-Based workflows
/intel                       Strategic assessment & market intelligence
/migrate [component-name]    Convert documentation to ticket system
/stream [--interactive|--auto|--dry-run]  Automated development loop
/validate [--strict]         Validate ticket system integrity
```

### Command Help System

To get help on any command:

```
User: "How does /stream work?"
Claude: [Automatically reads ~/.claude/commands/stream.md and explains execution steps]

User: "What are the prerequisites for /migrate?"
Claude: [Reads migrate.md, shows prerequisites section]

User: "Show me examples of /quality usage"
Claude: [Reads quality.md, shows usage examples section]
```

---

## Integration with Claude Code Features

### 1. Command Auto-completion

When you type `/`, Claude Code shows all available commands with descriptions from the `description` field in frontmatter.

### 2. Argument Hints

The `argument-hint` in frontmatter appears in the command palette:

```yaml
---
description: Execute ticket-based implementation
argument-hint: '[ticket-id] (optional, defaults to next UNPROCESSED ticket)'
---
```

Displays as:

```text
/implement [ticket-id]
```

### 3. Allowed Tools Enforcement

The `allowed-tools` frontmatter controls which tools Claude can use:

```yaml
---
allowed-tools: Bash(git:*), Read, Write, Edit, SequentialThinking
---
```

Claude Code enforces these restrictions during command execution.

### 4. Contextual Help

Claude Code can read command files to provide contextual assistance:

```text
User: "I'm getting an error with /validate"
Claude: [Reads validate.md error scenarios section, provides specific fix]

User: "What's the difference between /stream --interactive and --auto?"
Claude: [Reads stream.md execution modes section, explains differences]
```

---

## Best Practices for Using Commands in Claude Code

### 1. Start with Workflow Selection

```text
/workflow
# Always run this first on new projects
# Creates .sage/workflow-mode file
# Recommends Traditional vs Ticket-Based workflow
```

### 2. Use Command Chaining

```text
# Traditional workflow
/specify → /plan → /tasks → /breakdown → /blueprint → /implement → /commit

# Ticket-based workflow
/specify → /plan → /tasks → /migrate → /stream
```

### 3. Leverage Documentation Commands

Before using complex commands, read the documentation:

```text
# Read full guide
/SAGE_DEV_COMMANDS

# Get command-specific help
User: "Explain /stream in detail"
Claude: [Reads stream.md and provides comprehensive explanation]
```

### 4. Use Validation Commands

Always validate before proceeding:

```text
/specify
/quality --command=specify --strict
# Only proceed if quality score ≥ 90/100

/migrate
/validate
# Only proceed if ticket system is valid
```

---

## Verifying Installation

### Check 1: Count Installed Commands

```bash
ls -1 ~/.claude/commands/*.md | wc -l
# Should show 23 (20 commands + 3 documentation files)
```

### Check 2: Verify Frontmatter

```bash
# Check that frontmatter is valid
head -5 ~/.claude/commands/workflow.md
```

Should show:

```yaml
---
allowed-tools: Bash(cat:*), Bash(ls:*), SequentialThinking
description: Choose between Traditional and Ticket-Based workflows
argument-hint: ''
---
```

### Check 3: Test in Claude Code

1. Open Claude Code
2. Type `/workflow`
3. Command should appear in autocomplete
4. Execute and verify it works

---

## Troubleshooting

### Commands Not Appearing in Claude Code

**Cause:** Commands directory not in correct location

**Fix:**

```bash
# Check Claude Code config location
echo $HOME/.claude/commands

# Ensure files are there
ls -la ~/.claude/commands/

# Restart Claude Code
```

### Command Execution Fails

**Cause:** Invalid frontmatter or missing required fields

**Fix:**

```bash
# Validate frontmatter syntax
head -10 ~/.claude/commands/[command].md

# Ensure required fields present:
# - allowed-tools
# - description
```

### Documentation Not Accessible

**Cause:** SAGE_DEV_WORKFLOW.md or SAGE_DEV_COMMANDS.md not copied

**Fix:**

```bash
# Copy documentation files
cp /path/to/sage-dev/commands/SAGE_DEV_WORKFLOW.md ~/.claude/commands/
cp /path/to/sage-dev/commands/SAGE_DEV_COMMANDS.md ~/.claude/commands/
```

---

## Updating Commands

### Manual Update

```bash
# Copy updated commands
cp /path/to/sage-dev/commands/*.md ~/.claude/commands/

# Restart Claude Code to reload
```

### With Symlinks (Automatic)

If using symlink installation, changes are immediate:

```bash
# Edit command file
vim /path/to/sage-dev/commands/workflow.md

# Changes automatically available in Claude Code
# (may need to restart Claude Code)
```

### Version Control

Keep commands in git for version tracking:

```bash
cd /path/to/sage-dev/commands
git status
git add *.md
git commit -m "docs: update command execution steps"
git push
```

---

## Advanced: Custom Command Development

### Creating New Commands

1. **Create markdown file** in `~/.claude/commands/`

   ```bash
   touch ~/.claude/commands/my-command.md
   ```

2. **Add frontmatter:**

   ```yaml
   ---
   allowed-tools: Bash(ls:*), Read, Write
   description: My custom command that does X
   argument-hint: '[optional-arg]'
   ---
   ```

3. **Add execution instructions:**

   ````markdown
   ## Role

   Brief description of what this command does.

   ## Execution

   ### 1. First Step

   ```bash
   # Code to execute
   ```

   **Key Actions:**

   - Action 1
   - Action 2

   ### 2. Second Step

   ...

   ````

4. **Test in Claude Code:**

```text
/my-command

# Should appear and execute according to your instructions

```

---

## Integration with Project Workflows

### Scenario 1: New Project Setup

```bash
# 1. Install commands
./install-sage-commands.sh

# 2. In Claude Code
/workflow
# Choose workflow (Traditional or Ticket-Based)

# 3. Start development
/specify
/plan
/tasks
# ... continue workflow
```

### Scenario 2: Existing Project Migration

```bash
# 1. Install commands (if not already)
# 2. In Claude Code
/workflow
# Detects existing docs, recommends migration

/migrate
# Converts existing docs to ticket system

/stream
# Start automated development
```

### Scenario 3: Documentation Reference

```bash
# While working in Claude Code:
User: "How do I use the quality validator?"
Claude: [Reads ~/.claude/commands/quality.md]

        The /quality command validates command outputs...

        Usage:
        /quality --command=specify
        /quality --command=plan --strict

        Scoring system:
        - Specifications: 100-point scale
        - Plans: 100-point scale
        ...
```

---

## Benefits of Claude Code Integration

### 1. **Zero Context Switching**

- Commands available directly in your coding environment
- No need to copy/paste from external documentation
- Integrated help system

### 2. **Consistent Execution**

- Claude Code enforces `allowed-tools` restrictions
- Validates frontmatter before execution
- Standardized command interface

### 3. **Discoverable System**

- Type `/` to see all available commands
- Built-in command descriptions
- Contextual help on demand

### 4. **Version Controlled**

- Commands live in git repository
- Track changes over time
- Share with team via git

### 5. **Self-Documenting**

- Commands contain their own execution instructions
- Examples and templates included
- Error scenarios documented

### 6. **Extensible**

- Easy to add new commands
- Customize for your workflow
- Share custom commands via git

---

## Recommended Workflow

### For New Users

1. **Install commands** (Method 1 or 2)
2. **Read documentation** (`/SAGE_DEV_COMMANDS` or `/SAGE_DEV_WORKFLOW`)
3. **Start with workflow selector** (`/workflow`)
4. **Follow recommended workflow sequence**
5. **Use validation commands** (`/validate`, `/quality`)
6. **Reference documentation as needed** (ask Claude about commands)

### For Experienced Users

1. **Use symlink installation** (Method 3) for live updates
2. **Create custom commands** for project-specific needs
3. **Integrate into CI/CD** (use commands in scripts)
4. **Share with team** (commit commands to project repo)

---

## Summary

The sage-dev command system integrates seamlessly with Claude Code:

- ✅ **Copy command files** to `~/.claude/commands/`
- ✅ **Commands appear automatically** in slash command menu
- ✅ **Documentation accessible** via `/SAGE_DEV_WORKFLOW` and `/SAGE_DEV_COMMANDS`
- ✅ **Contextual help** by asking Claude about any command
- ✅ **Version controlled** via git
- ✅ **Extensible** with custom commands

**Next Steps:**

1. Run installation script or manually copy files
2. Type `/` in Claude Code to see all commands
3. Start with `/workflow` to choose your workflow
4. Reference `/SAGE_DEV_COMMANDS` for complete syntax guide

For questions or issues, ask Claude Code directly - it has access to all command documentation!
