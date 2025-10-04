#!/bin/bash
# install-sage-commands.sh
# Install Sage-Dev commands to AI coding agents (Claude Code, Cline, Roo-Cline, etc.)

set -e

# Configuration
SAGE_DIR="$(cd "$(dirname "$0")/commands" && pwd)"

# Supported AI agents and their command directories
declare -A AGENT_DIRS=(
    ["claude-code"]="$HOME/.claude/commands"
    ["cline"]="$HOME/.config/cline/commands"
    ["roo-cline"]="$HOME/.config/roo-cline/commands"
    ["continue"]="$HOME/.continue/commands"
    ["cursor"]="$HOME/.cursor/commands"
    ["opencode"]="$HOME/.config/opencode/command"
    ["droid"]="$HOME/.factory/commands"
)

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Sage-Dev Command Installation for AI Coding Agents         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if sage-dev commands directory exists
if [ ! -d "$SAGE_DIR" ]; then
  echo "❌ ERROR: Sage-Dev commands directory not found"
  echo "Expected: $SAGE_DIR"
  echo ""
  echo "Please run this script from the sage-dev directory:"
  echo "  cd /path/to/sage-dev"
  echo "  ./install-sage-commands.sh [agent]"
  exit 1
fi

# Show what will be installed
COMMAND_COUNT=$(ls -1 "$SAGE_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "📦 Found $COMMAND_COUNT command files in:"
echo "   $SAGE_DIR"
echo ""

# Detect or select agent
SELECTED_AGENT=""

if [ -n "$1" ]; then
  # Agent specified via argument
  SELECTED_AGENT="$1"
  if [ -z "${AGENT_DIRS[$SELECTED_AGENT]}" ]; then
    echo "❌ ERROR: Unknown agent: $SELECTED_AGENT"
    echo ""
    echo "Supported agents:"
    for agent in "${!AGENT_DIRS[@]}"; do
      echo "  - $agent"
    done
    echo ""
    echo "Usage: ./install-sage-commands.sh [agent]"
    echo "Example: ./install-sage-commands.sh claude-code"
    exit 1
  fi
else
  # Auto-detect installed agents
  echo "🔍 Detecting installed AI coding agents..."
  echo ""

  DETECTED_AGENTS=()
  for agent in "${!AGENT_DIRS[@]}"; do
    agent_dir="${AGENT_DIRS[$agent]}"
    parent_dir=$(dirname "$agent_dir")

    if [ -d "$parent_dir" ]; then
      echo "   ✓ Found: $agent ($agent_dir)"
      DETECTED_AGENTS+=("$agent")
    fi
  done

  if [ ${#DETECTED_AGENTS[@]} -eq 0 ]; then
    echo "   ℹ️  No AI coding agents detected"
    echo ""
    echo "Please specify an agent manually:"
    echo "  ./install-sage-commands.sh claude-code"
    echo "  ./install-sage-commands.sh cline"
    echo "  ./install-sage-commands.sh roo-cline"
    exit 1
  elif [ ${#DETECTED_AGENTS[@]} -eq 1 ]; then
    SELECTED_AGENT="${DETECTED_AGENTS[0]}"
    echo ""
    echo "📌 Auto-selected: $SELECTED_AGENT"
  else
    echo ""
    echo "Multiple agents detected. Please choose:"
    echo ""
    select agent in "${DETECTED_AGENTS[@]}" "Install to all" "Cancel"; do
      if [ "$agent" = "Cancel" ]; then
        echo "Installation cancelled."
        exit 0
      elif [ "$agent" = "Install to all" ]; then
        SELECTED_AGENT="all"
        break
      elif [ -n "$agent" ]; then
        SELECTED_AGENT="$agent"
        break
      fi
    done
  fi
fi

echo ""

# Function to install to a specific agent
install_to_agent() {
  local agent=$1
  local target_dir="${AGENT_DIRS[$agent]}"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Installing to: $agent"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Create agent commands directory
  echo "📁 Creating commands directory..."
  mkdir -p "$target_dir"
  echo "   ✓ $target_dir"
  echo ""

  # Backup existing commands if any
  if [ -d "$target_dir" ] && [ "$(ls -A $target_dir 2>/dev/null)" ]; then
    BACKUP_DIR="$target_dir.backup.$(date +%Y%m%d-%H%M%S)"
    echo "💾 Backing up existing commands..."
    cp -r "$target_dir" "$BACKUP_DIR"
    echo "   ✓ Backup saved to: $BACKUP_DIR"
    echo ""
  fi

  # Copy all command files
  echo "📋 Copying command files..."
  cp "$SAGE_DIR"/*.md "$target_dir/"

  # Verify installation
  INSTALLED_COUNT=$(ls -1 "$target_dir"/*.md 2>/dev/null | wc -l | tr -d ' ')

  if [ "$INSTALLED_COUNT" -eq "$COMMAND_COUNT" ]; then
    echo "   ✓ Successfully copied $INSTALLED_COUNT files"
  else
    echo "   ⚠️  Warning: Expected $COMMAND_COUNT files, but found $INSTALLED_COUNT"
  fi
  echo ""

  return 0
}

# Install to selected agent(s)
if [ "$SELECTED_AGENT" = "all" ]; then
  for agent in "${DETECTED_AGENTS[@]}"; do
    install_to_agent "$agent"
  done
  INSTALL_COUNT=${#DETECTED_AGENTS[@]}
else
  install_to_agent "$SELECTED_AGENT"
  INSTALL_COUNT=1
fi

# List installed commands (from first installed agent)
SAMPLE_DIR=""
if [ "$SELECTED_AGENT" = "all" ]; then
  SAMPLE_DIR="${AGENT_DIRS[${DETECTED_AGENTS[0]}]}"
else
  SAMPLE_DIR="${AGENT_DIRS[$SELECTED_AGENT]}"
fi

echo "📝 Installed Commands:"
echo ""
ls -1 "$SAMPLE_DIR"/*.md 2>/dev/null | while read file; do
  FILENAME=$(basename "$file" .md)
  DESCRIPTION=$(grep "^description:" "$file" 2>/dev/null | sed 's/description: //' || echo "")

  if [ "$FILENAME" = "SAGE_DEV_WORKFLOW" ] || [ "$FILENAME" = "SAGE_DEV_COMMANDS" ] || [ "$FILENAME" = "TESTING" ] || [ "$FILENAME" = "INSTALLATION" ]; then
    printf "   📄 %-20s (Documentation)\n" "$FILENAME"
  else
    printf "   /%s\n" "$FILENAME"
    if [ -n "$DESCRIPTION" ]; then
      printf "      %s\n" "$DESCRIPTION"
    fi
  fi
done
echo ""

# Installation summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ INSTALLATION COMPLETE                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ "$SELECTED_AGENT" = "all" ]; then
  echo "📍 Installed to $INSTALL_COUNT agents:"
  for agent in "${DETECTED_AGENTS[@]}"; do
    echo "   • $agent: ${AGENT_DIRS[$agent]}"
  done
else
  echo "📍 Installation Location:"
  echo "   ${AGENT_DIRS[$SELECTED_AGENT]}"
fi

echo ""
echo "📊 Installation Summary:"
echo "   • Total files: $COMMAND_COUNT"
echo "   • Commands: $(( COMMAND_COUNT - 4 ))  (executable slash commands)"
echo "   • Documentation: 4  (SAGE_DEV_WORKFLOW, SAGE_DEV_COMMANDS, TESTING, INSTALLATION)"
echo ""

# Agent-specific getting started instructions
if [ "$SELECTED_AGENT" = "all" ]; then
  AGENT_NAME="your AI coding agent"
elif [ "$SELECTED_AGENT" = "claude-code" ]; then
  AGENT_NAME="Claude Code"
elif [ "$SELECTED_AGENT" = "cline" ]; then
  AGENT_NAME="Cline"
elif [ "$SELECTED_AGENT" = "roo-cline" ]; then
  AGENT_NAME="Roo-Cline"
elif [ "$SELECTED_AGENT" = "opencode" ]; then
  AGENT_NAME="Opencode CLI"
elif [ "$SELECTED_AGENT" = "droid" ]; then
  AGENT_NAME="DROID CLI"
else
  AGENT_NAME="$SELECTED_AGENT"
fi

echo "🚀 Getting Started:"
echo ""
echo "   1. Open $AGENT_NAME"
echo "   2. Type / to see all available commands"
echo "   3. Run /workflow to choose your workflow (START HERE)"
echo "   4. Use /SAGE_DEV_COMMANDS for complete syntax guide"
echo ""
echo "💡 Quick Commands:"
echo ""
echo "   /workflow          Choose Traditional vs Ticket-Based workflow"
echo "   /intel             Strategic system assessment"
echo "   /specify           Generate specifications from docs"
echo "   /plan              Create implementation plans"
echo "   /tasks             Break down into SMART tasks"
echo "   /migrate           Convert to ticket system"
echo "   /stream            Automated development loop"
echo "   /validate          Validate ticket system"
echo "   /quality           Validate output quality"
echo ""
echo "📚 Documentation:"
echo ""
echo "   /SAGE_DEV_WORKFLOW Full workflow guide"
echo "   /SAGE_DEV_COMMANDS Complete command syntax reference"
echo ""
echo "   Or simply ask your AI agent:"
echo "   \"How do I use /stream?\" or \"Explain the ticket workflow\""
echo ""
echo "🔄 To update commands in the future:"
echo "   cd /path/to/sage-dev"
echo "   git pull"
if [ "$SELECTED_AGENT" = "all" ]; then
  echo "   ./install-sage-commands.sh all"
else
  echo "   ./install-sage-commands.sh $SELECTED_AGENT"
fi
echo ""
echo "💡 Supported AI Agents:"
for agent in "${!AGENT_DIRS[@]}"; do
  echo "   • $agent → ${AGENT_DIRS[$agent]}"
done
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
