#!/bin/bash
# sage-setup.sh
# Setup Sage-Dev for AI coding agents with language-specific enforcement
# Installs commands, agents, and rules to Claude Code, Cline, Roo-Cline, and more

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMANDS_DIR="$SCRIPT_DIR/commands"
AGENTS_DIR="$SCRIPT_DIR/agents"
RULES_DIR="$SCRIPT_DIR/rules"
CONFIG_DIR="$SCRIPT_DIR/.sage"
CONFIG_FILE="$CONFIG_DIR/config.json"

# Supported AI agents and their directories
declare -A AGENT_DIRS=(
    ["claude-code"]="$HOME/.claude/commands"
    ["opencode"]="$HOME/.config/opencode/command"
    ["droid"]="$HOME/.factory/commands"
)

# Agent directories for agents and rules
declare -A AGENT_AGENT_DIRS=(
    ["claude-code"]="$HOME/.claude/agents"
    ["opencode"]="$HOME/.config/opencode/agents"
    ["droid"]="$HOME/.factory/agents"
)

declare -A AGENT_RULES_DIRS=(
    ["claude-code"]="$HOME/.claude/rules"
    ["opencode"]="$HOME/.config/opencode/rules"
    ["droid"]="$HOME/.factory/rules"
)

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Sage-Dev Setup for AI Coding Agents                           ║"
echo "║  Language-Specific Enforcement • Commands • Agents • Rules     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if sage-dev directories exist
if [ ! -d "$COMMANDS_DIR" ]; then
  echo "❌ ERROR: Sage-Dev commands directory not found"
  echo "Expected: $COMMANDS_DIR"
  echo ""
  echo "Please run this script from the sage-dev directory:"
  echo "  cd /path/to/sage-dev"
  echo "  ./sage-setup.sh [agent] [language]"
  exit 1
fi

# Language selection - determine but don't prompt yet
SELECTED_LANGUAGE=""
SUPPORTED_LANGUAGES=("python" "javascript" "typescript")

if [ -n "$2" ]; then
  # Language specified via argument
  SELECTED_LANGUAGE="$2"
  if [[ ! " ${SUPPORTED_LANGUAGES[@]} " =~ " ${SELECTED_LANGUAGE} " ]]; then
    echo "❌ ERROR: Unsupported language: $SELECTED_LANGUAGE"
    echo ""
    echo "Supported languages:"
    for lang in "${SUPPORTED_LANGUAGES[@]}"; do
      echo "  - $lang"
    done
    echo ""
    echo "Usage: ./sage-setup.sh [agent] [language]"
    echo "Example: ./sage-setup.sh claude-code python"
    exit 1
  fi
elif [ -f "$CONFIG_FILE" ]; then
  # Load from config if exists
  if command -v jq &> /dev/null; then
    SELECTED_LANGUAGE=$(jq -r '.language // "python"' "$CONFIG_FILE" 2>/dev/null || echo "python")
  else
    SELECTED_LANGUAGE="python"
  fi
else
  # Default to python
  SELECTED_LANGUAGE="python"
fi

# Detect or select agent - determine but don't prompt yet
SELECTED_AGENT=""
DETECTED_AGENTS=()

if [ -n "$1" ]; then
  # Agent specified via argument
  SELECTED_AGENT="$1"
  if [ "$SELECTED_AGENT" != "all" ] && [ -z "${AGENT_DIRS[$SELECTED_AGENT]}" ]; then
    echo "❌ ERROR: Unknown agent: $SELECTED_AGENT"
    echo ""
    echo "Supported agents:"
    for agent in "${!AGENT_DIRS[@]}"; do
      echo "  - $agent"
    done
    echo " - all (install to all detected agents)"
    echo ""
    echo "Usage: ./sage-setup.sh [agent] [language]"
    echo "Example: ./sage-setup.sh claude-code python"
    exit 1
  fi

  # If specific agent was specified, populate DETECTED_AGENTS for later use
  if [ "$SELECTED_AGENT" = "all" ]; then
    # Detect all agents
    for agent in "${!AGENT_DIRS[@]}"; do
      agent_dir="${AGENT_DIRS[$agent]}"
      parent_dir=$(dirname "$agent_dir")
      if [ -d "$parent_dir" ]; then
        DETECTED_AGENTS+=("$agent")
      fi
    done
  else
    DETECTED_AGENTS=("$SELECTED_AGENT")
  fi
else
  # Auto-detect installed agents
  for agent in "${!AGENT_DIRS[@]}"; do
    agent_dir="${AGENT_DIRS[$agent]}"
    parent_dir=$(dirname "$agent_dir")

    if [ -d "$parent_dir" ]; then
      DETECTED_AGENTS+=("$agent")
    fi
  done

  if [ ${#DETECTED_AGENTS[@]} -eq 0 ]; then
    echo "❌ ERROR: No AI coding agents detected"
    echo ""
    echo "Please specify an agent manually:"
    echo "  ./sage-setup.sh claude-code"
    echo "  ./sage-setup.sh all"
    echo ""
    echo "Supported agents:"
    for agent in "${!AGENT_DIRS[@]}"; do
      echo "  - $agent"
    done
    exit 1
  fi

  # Default to installing to all detected agents
  SELECTED_AGENT="all"
fi

# Show what will be installed
COMMAND_COUNT=$(ls -1 "$COMMANDS_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
SHARED_AGENT_COUNT=$(ls -1 "$AGENTS_DIR/shared"/*.md 2>/dev/null | wc -l | tr -d ' ')
LANG_AGENT_COUNT=$(ls -1 "$AGENTS_DIR/$SELECTED_LANGUAGE"/*.md 2>/dev/null | wc -l | tr -d ' ')
TOTAL_AGENT_COUNT=$((SHARED_AGENT_COUNT + LANG_AGENT_COUNT))
RULE_COUNT=$(ls -1 "$RULES_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              Installation Confirmation                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 Installation Plan:"
echo ""
if [ "$SELECTED_AGENT" = "all" ]; then
  echo "   🎯 Target: All detected agents (${#DETECTED_AGENTS[@]})"
  for agent in "${DETECTED_AGENTS[@]}"; do
    echo "      • $agent → ${AGENT_DIRS[$agent]}"
  done
else
  echo "   🎯 Target: $SELECTED_AGENT"
  echo "      → ${AGENT_DIRS[$SELECTED_AGENT]}"
fi
echo ""
echo "   🌐 Language: $SELECTED_LANGUAGE"
echo "   📋 Commands: $COMMAND_COUNT files"
echo "   🤖 Agents: $TOTAL_AGENT_COUNT files"
echo "      - Shared: $SHARED_AGENT_COUNT (language-agnostic)"
echo "      - $SELECTED_LANGUAGE: $LANG_AGENT_COUNT (language-specific)"
echo "   📜 Rules: $RULE_COUNT files"
echo "   📑 Agent registry: agents/index.json"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Proceed with installation? (y/n): " response
echo ""

case "$response" in
  [yY][eE][sS]|[yY])
    echo "✓ Proceeding with installation..."
    echo ""
    ;;
  *)
    echo "Installation cancelled."
    exit 0
    ;;
esac

# Function to install to a specific agent
install_to_agent() {
  local agent=$1
  local commands_target="${AGENT_DIRS[$agent]}"
  local agents_target="${AGENT_AGENT_DIRS[$agent]}"
  local rules_target="${AGENT_RULES_DIRS[$agent]}"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Installing to: $agent"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Create directories
  echo "📁 Creating directories..."
  mkdir -p "$commands_target"
  mkdir -p "$agents_target"
  mkdir -p "$rules_target"
  echo "   ✓ Commands: $commands_target"
  echo "   ✓ Agents: $agents_target"
  echo "   ✓ Rules: $rules_target"
  echo ""

  # Backup existing files if any
  if [ -d "$commands_target" ] && [ "$(ls -A $commands_target 2>/dev/null)" ]; then
    BACKUP_DIR="$commands_target.backup.$(date +%Y%m%d-%H%M%S)"
    echo "💾 Backing up existing commands..."
    cp -r "$commands_target" "$BACKUP_DIR"
    echo "   ✓ Backup saved to: $BACKUP_DIR"
    echo ""
  fi

  # Copy command files
  echo "📋 Copying command files..."
  cp "$COMMANDS_DIR"/*.md "$commands_target/"
  INSTALLED_COMMANDS=$(ls -1 "$commands_target"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "   ✓ Copied $INSTALLED_COMMANDS command files"
  echo ""

  # Copy agent files (shared + language-specific)
  echo "🤖 Copying agent files..."

  # Copy shared agents (language-agnostic)
  if [ -d "$AGENTS_DIR/shared" ]; then
    cp "$AGENTS_DIR/shared"/*.md "$agents_target/" 2>/dev/null || true
  fi

  # Copy language-specific agents
  if [ -d "$AGENTS_DIR/$SELECTED_LANGUAGE" ]; then
    cp "$AGENTS_DIR/$SELECTED_LANGUAGE"/*.md "$agents_target/" 2>/dev/null || true
  fi

  # Copy agent registry
  if [ -f "$AGENTS_DIR/index.json" ]; then
    cp "$AGENTS_DIR/index.json" "$agents_target/"
  fi

  INSTALLED_AGENTS=$(ls -1 "$agents_target"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "   ✓ Copied $SHARED_AGENT_COUNT shared agents"
  echo "   ✓ Copied $LANG_AGENT_COUNT $SELECTED_LANGUAGE agents"
  echo "   ✓ Copied agent registry (index.json)"
  echo ""

  # Copy rule files
  echo "📜 Copying rule files..."
  cp "$RULES_DIR"/*.md "$rules_target/" 2>/dev/null || true
  INSTALLED_RULES=$(ls -1 "$rules_target"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "   ✓ Copied $INSTALLED_RULES rule files"
  echo ""

  # Verify installation
  if [ "$INSTALLED_COMMANDS" -eq "$COMMAND_COUNT" ]; then
    echo "✅ Commands installation complete"
  else
    echo "⚠️  Commands: Expected $COMMAND_COUNT files, but found $INSTALLED_COMMANDS"
  fi

  if [ "$INSTALLED_AGENTS" -eq "$TOTAL_AGENT_COUNT" ]; then
    echo "✅ Agents installation complete"
  else
    echo "⚠️  Agents: Expected $TOTAL_AGENT_COUNT files, but found $INSTALLED_AGENTS"
  fi

  if [ "$INSTALLED_RULES" -eq "$RULE_COUNT" ]; then
    echo "✅ Rules installation complete"
  else
    echo "⚠️  Rules: Expected $RULE_COUNT files, but found $INSTALLED_RULES"
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

# Save configuration
mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" <<EOF
{
  "language": "$SELECTED_LANGUAGE",
  "agent": "$SELECTED_AGENT",
  "enforcement_level": "BALANCED",
  "configured_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

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
echo "   • Language: $SELECTED_LANGUAGE"
echo "   • Commands: $COMMAND_COUNT files"
echo "     - Slash commands: $(( COMMAND_COUNT - 4 ))"
echo "     - Documentation: 4 (SAGE_DEV_WORKFLOW, SAGE_DEV_COMMANDS, TESTING, INSTALLATION)"
echo "   • Agents: $TOTAL_AGENT_COUNT files + registry"
echo "     - Shared ($SHARED_AGENT_COUNT): bs-check, bs-enforce, secret-scanner"
if [ "$SELECTED_LANGUAGE" = "python" ]; then
  echo "     - Python ($LANG_AGENT_COUNT): type-enforcer, doc-validator, test-coverage, import-enforcer"
elif [ "$SELECTED_LANGUAGE" = "javascript" ]; then
  echo "     - JavaScript ($LANG_AGENT_COUNT): (available for future implementation)"
elif [ "$SELECTED_LANGUAGE" = "typescript" ]; then
  echo "     - TypeScript ($LANG_AGENT_COUNT): (available for future implementation)"
fi
echo "   • Rules: $RULE_COUNT files"
echo "     - enforcement-guide, typing-standards"
echo "     - test-standards, security-standards, commit-standards"
echo ""

# Check and suggest .gitignore additions
echo "⚙️  Gitignore Recommendations:"
echo ""

GITIGNORE_FILE=".gitignore"
NEEDS_UPDATE=false

if [ -f "$GITIGNORE_FILE" ]; then
  if ! grep -q "^\.sage" "$GITIGNORE_FILE" 2>/dev/null; then
    echo "   ⚠️  Consider adding '.sage/' to your .gitignore"
    NEEDS_UPDATE=true
  fi
  if ! grep -q "^\.docs" "$GITIGNORE_FILE" 2>/dev/null; then
    echo "   ⚠️  Consider adding '.docs/' to your .gitignore"
    NEEDS_UPDATE=true
  fi

  if [ "$NEEDS_UPDATE" = true ]; then
    echo ""
    echo "   You might want to keep these directories out of version control, as they usually contain developer-local files:"
    echo "   • .sage/  - Workflow configuration and state"
    echo "   • .docs/  - Generated reports and analysis"
    echo ""
    echo "   Add to $GITIGNORE_FILE:"
    echo ""
    echo "   # Developer workspace (Sage-Dev generated files)"
    echo "   .sage/"
    echo "   .docs/"
    echo ""
  else
    echo "   ✓ .gitignore is properly configured"
    echo ""
  fi
else
  echo "   ℹ️  No .gitignore found. Consider creating one with:"
  echo ""
  echo "   # Developer workspace (Sage-Dev generated files)"
  echo "   .sage/"
  echo "   .docs/"
  echo ""
fi

# Agent-specific getting started instructions
if [ "$SELECTED_AGENT" = "all" ]; then
  AGENT_NAME="your AI coding agent"
elif [ "$SELECTED_AGENT" = "claude-code" ]; then
  AGENT_NAME="Claude Code"
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
echo "   Workflow:"
echo "   /workflow          Choose Traditional vs Ticket-Based workflow"
echo "   /intel             Strategic system assessment"
echo "   /specify           Generate specifications from docs"
echo "   /plan              Create implementation plans"
echo "   /tasks             Break down into SMART tasks"
echo "   /migrate           Convert to ticket system"
echo "   /stream            Automated development loop"
echo ""
echo "   Quality & Validation:"
echo "   /enforce           Run agent enforcement pipeline"
echo "   /validate          Validate ticket system"
echo "   /quality           Validate output quality"
echo ""
echo "   Enforcement Agents (NEW):"
echo "   • bs-check         Remove bullshit code patterns"
echo "   • type-enforcer    Python 3.12 typing validation"
echo "   • secret-scanner   Detect hardcoded secrets"
echo "   • test-coverage    Enforce coverage thresholds"
echo ""
echo "📚 Documentation:"
echo ""
echo "   /SAGE_DEV_WORKFLOW Full workflow guide"
echo "   /SAGE_DEV_COMMANDS Complete command syntax reference"
echo ""
echo "   Or simply ask your AI agent:"
echo "   \"How do I use /stream?\" or \"Explain the ticket workflow\""
echo ""
echo "🔄 To update in the future:"
echo "   cd /path/to/sage-dev"
echo "   git pull"
if [ "$SELECTED_AGENT" = "all" ]; then
  echo "   ./sage-setup.sh all $SELECTED_LANGUAGE"
else
  echo "   ./sage-setup.sh $SELECTED_AGENT $SELECTED_LANGUAGE"
fi
echo ""
echo "💡 To change language:"
echo "   ./sage-setup.sh $SELECTED_AGENT [python|javascript|typescript]"
echo "   Or delete .sage/config.json to re-run the wizard"
echo ""
echo "💡 Supported AI Agents:"
for agent in "${!AGENT_DIRS[@]}"; do
  echo "   • $agent → ${AGENT_DIRS[$agent]}"
done
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
