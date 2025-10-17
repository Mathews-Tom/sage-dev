#!/bin/bash
# sage-skillify.sh - Convert Sage-Dev commands and agents to Claude Skills
# Usage: ./sage-skillify.sh

set -euo pipefail

VERSION="1.0.0"
OUTPUT_DIR="skills"
TEMP_DIR=".skillify-temp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }
info() { echo -e "${BLUE}→${NC} $1"; }

# Clean and create directories
setup_dirs() {
    info "Setting up directory structure..."
    rm -rf "$OUTPUT_DIR" "$TEMP_DIR"
    mkdir -p "$OUTPUT_DIR" "$TEMP_DIR"
    log "Directories created"
}

# Generate skill.json metadata
generate_skill_json() {
    local skill_name="$1"
    local description="$2"
    local triggers="$3"
    local version="$4"

    cat > "$TEMP_DIR/skill.json" <<EOF
{
  "name": "$skill_name",
  "version": "$version",
  "description": "$description",
  "triggers": [$triggers],
  "requires": ["code_execution"],
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "author": "Sage-Dev",
  "license": "MIT"
}
EOF
}

# Create instruction.md from multiple source files
create_instruction() {
    local output_file="$1"
    shift
    local source_files=("$@")

    cat > "$output_file" <<'HEADER'
# Sage-Dev Skill

You are a specialized Sage-Dev assistant with expertise in software development workflows and quality enforcement.

## Core Principles

- **No Bullshit Code**: Fail fast, throw errors early, no fallbacks or graceful degradation
- **Type Safety First**: Use modern typing (Python 3.12+, built-in generics, | unions)
- **Test-Driven**: 80%+ overall coverage, 90%+ new code coverage
- **Documentation**: Clear, concise, technical - no self-congratulatory language
- **DRY**: Reuse existing code and patterns

---

HEADER

    for file in "${source_files[@]}"; do
        if [ -f "$file" ]; then
            echo "" >> "$output_file"
            echo "## $(basename "$file" .md)" >> "$output_file"
            echo "" >> "$output_file"
            # Remove frontmatter if present
            sed '/^---$/,/^---$/d' "$file" >> "$output_file"
            echo "" >> "$output_file"
        fi
    done
}

# Bundle resources into skill directory
bundle_resources() {
    local skill_dir="$1"
    shift
    local resource_files=("$@")

    mkdir -p "$skill_dir/resources"

    for resource in "${resource_files[@]}"; do
        if [ -f "$resource" ]; then
            cp "$resource" "$skill_dir/resources/"
        elif [ -d "$resource" ]; then
            cp -r "$resource" "$skill_dir/resources/"
        fi
    done
}

# Package skill as zip
package_skill() {
    local skill_name="$1"
    local skill_dir="$TEMP_DIR/$skill_name"

    (cd "$skill_dir" && zip -r "../../$OUTPUT_DIR/${skill_name}.zip" . -q)
    log "Packaged: $OUTPUT_DIR/${skill_name}.zip"
}

# ==================== ENFORCEMENT SKILLS ====================

generate_python_quality_suite() {
    info "Generating Sage Python Quality Suite..."

    local skill_dir="$TEMP_DIR/sage-python-quality-suite"
    mkdir -p "$skill_dir"

    # Generate skill.json
    generate_skill_json \
        "Sage Python Quality Suite" \
        "Python 3.12+ type enforcement, docstring validation, test coverage, import standards" \
        '"python", "*.py", "typing", "pytest", "mypy"' \
        "$VERSION"
    mv "$TEMP_DIR/skill.json" "$skill_dir/"

    # Create instruction.md
    create_instruction "$skill_dir/instruction.md" \
        "agents/python/type-enforcer.md" \
        "agents/python/doc-validator.md" \
        "agents/python/test-coverage.md" \
        "agents/python/import-enforcer.md"

    # Bundle resources
    bundle_resources "$skill_dir" \
        "rules/typing-standards.md" \
        "rules/test-standards.md"

    # Add examples if they exist
    if [ -d ".sage/agent/examples/python" ]; then
        mkdir -p "$skill_dir/examples"
        cp -r .sage/agent/examples/python/* "$skill_dir/examples/" 2>/dev/null || true
    fi

    package_skill "sage-python-quality-suite"
}

generate_security_guard() {
    info "Generating Sage Security Guard..."

    local skill_dir="$TEMP_DIR/sage-security-guard"
    mkdir -p "$skill_dir"

    generate_skill_json \
        "Sage Security Guard" \
        "Detects hardcoded secrets, API keys, credentials, and enforces no-bullshit code principles" \
        '"security", "secrets", "api keys", "credentials", "*.py", "*.js", "*.ts"' \
        "$VERSION"
    mv "$TEMP_DIR/skill.json" "$skill_dir/"

    create_instruction "$skill_dir/instruction.md" \
        "agents/shared/secret-scanner.md" \
        "agents/shared/bs-check.md" \
        "agents/shared/bs-enforce.md"

    bundle_resources "$skill_dir" \
        "rules/security-standards.md" \
        "rules/enforcement-guide.md"

    package_skill "sage-security-guard"
}

# ==================== DOMAIN EXPERT SKILLS ====================

generate_research_intelligence() {
    info "Generating Sage Research Intelligence..."

    local skill_dir="$TEMP_DIR/sage-research-intelligence"
    mkdir -p "$skill_dir"

    generate_skill_json \
        "Sage Research Intelligence" \
        "Strategic intelligence gathering and enhancement analysis for research-driven development" \
        '"research", "intelligence", "market analysis", "best practices", "competitive analysis"' \
        "$VERSION"
    mv "$TEMP_DIR/skill.json" "$skill_dir/"

    create_instruction "$skill_dir/instruction.md" \
        "commands/sage.intel.md" \
        "commands/sage.enhance.md"

    bundle_resources "$skill_dir" \
        ".sage/agent/templates/system-template.md"

    package_skill "sage-research-intelligence"
}

generate_specification_engine() {
    info "Generating Sage Specification Engine..."

    local skill_dir="$TEMP_DIR/sage-specification-engine"
    mkdir -p "$skill_dir"

    generate_skill_json \
        "Sage Specification Engine" \
        "Generate structured specifications, technical breakdowns, and system blueprints from documentation" \
        '"specification", "spec", "requirements", "architecture", "technical breakdown"' \
        "$VERSION"
    mv "$TEMP_DIR/skill.json" "$skill_dir/"

    create_instruction "$skill_dir/instruction.md" \
        "commands/sage.specify.md" \
        "commands/sage.breakdown.md" \
        "commands/sage.blueprint.md"

    bundle_resources "$skill_dir" \
        ".sage/agent/templates/system-template.md"

    # Add example specs
    if [ -d "docs/specs" ]; then
        mkdir -p "$skill_dir/examples"
        cp -r docs/specs/* "$skill_dir/examples/" 2>/dev/null || true
    fi

    package_skill "sage-specification-engine"
}

generate_implementation_planner() {
    info "Generating Sage Implementation Planner..."

    local skill_dir="$TEMP_DIR/sage-implementation-planner"
    mkdir -p "$skill_dir"

    generate_skill_json \
        "Sage Implementation Planner" \
        "Create PRP-format implementation plans and SMART task breakdowns from specifications" \
        '"plan", "planning", "implementation", "tasks", "breakdown", "PRP"' \
        "$VERSION"
    mv "$TEMP_DIR/skill.json" "$skill_dir/"

    create_instruction "$skill_dir/instruction.md" \
        "commands/sage.plan.md" \
        "commands/sage.tasks.md"

    bundle_resources "$skill_dir" \
        ".sage/agent/templates/task-template.md"

    package_skill "sage-implementation-planner"
}

generate_documentation_generator() {
    info "Generating Sage Documentation Generator..."

    local skill_dir="$TEMP_DIR/sage-documentation-generator"
    mkdir -p "$skill_dir"

    generate_skill_json \
        "Sage Documentation Generator" \
        "Create and update documentation, SOPs, code documentation, and implementation plans" \
        '"documentation", "SOP", "standard operating procedure", "docstring", "inline docs"' \
        "$VERSION"
    mv "$TEMP_DIR/skill.json" "$skill_dir/"

    create_instruction "$skill_dir/instruction.md" \
        "commands/sage.update-doc.md" \
        "commands/sage.gen-sop.md" \
        "commands/sage.docify.md" \
        "commands/sage.save-plan.md"

    bundle_resources "$skill_dir" \
        ".sage/agent/templates/sop-template.md" \
        ".sage/agent/templates/task-template.md" \
        ".sage/agent/templates/system-template.md"

    package_skill "sage-documentation-generator"
}

generate_context_optimizer() {
    info "Generating Sage Context Optimizer..."

    local skill_dir="$TEMP_DIR/sage-context-optimizer"
    mkdir -p "$skill_dir"

    generate_skill_json \
        "Sage Context Optimizer" \
        "Compress conversation context and delegate research to sub-agents for efficient token usage" \
        '"context", "compression", "token optimization", "research delegation"' \
        "$VERSION"
    mv "$TEMP_DIR/skill.json" "$skill_dir/"

    create_instruction "$skill_dir/instruction.md" \
        "commands/sage.compact-context.md" \
        "commands/sage.offload-research.md"

    package_skill "sage-context-optimizer"
}

# ==================== UTILITY SKILLS ====================

generate_ticket_manager() {
    info "Generating Sage Ticket Manager..."

    local skill_dir="$TEMP_DIR/sage-ticket-manager"
    mkdir -p "$skill_dir"

    generate_skill_json \
        "Sage Ticket Manager" \
        "Validate, synchronize, migrate, estimate, and repair ticket system integrity" \
        '"ticket", "tickets", "validation", "sync", "migration", "estimation"' \
        "$VERSION"
    mv "$TEMP_DIR/skill.json" "$skill_dir/"

    create_instruction "$skill_dir/instruction.md" \
        "commands/sage.validate.md" \
        "commands/sage.sync.md" \
        "commands/sage.migrate.md" \
        "commands/sage.estimate.md" \
        "commands/sage.repair.md"

    package_skill "sage-ticket-manager"
}

# ==================== MAIN EXECUTION ====================

main() {
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "   Sage-Dev Skills Generator v$VERSION"
    echo "   Converting commands and agents to Claude Skills"
    echo "═══════════════════════════════════════════════════════"
    echo ""

    setup_dirs

    echo ""
    info "Generating Enforcement Skills..."
    generate_python_quality_suite
    generate_security_guard

    echo ""
    info "Generating Domain Expert Skills..."
    generate_research_intelligence
    generate_specification_engine
    generate_implementation_planner
    generate_documentation_generator
    generate_context_optimizer

    echo ""
    info "Generating Utility Skills..."
    generate_ticket_manager

    # Cleanup
    rm -rf "$TEMP_DIR"

    echo ""
    echo "═══════════════════════════════════════════════════════"
    log "Successfully generated $(ls -1 "$OUTPUT_DIR" | wc -l | tr -d ' ') Skills"
    echo ""
    echo "Output directory: $OUTPUT_DIR/"
    ls -lh "$OUTPUT_DIR"
    echo ""
    echo "Next steps:"
    echo "  1. Test Skills in Claude: Upload to Claude capabilities panel"
    echo "  2. Test cross-platform: Upload zips to ChatGPT/Gemini"
    echo "  3. Review installation guide: docs/SKILLS_GUIDE.md"
    echo "═══════════════════════════════════════════════════════"
    echo ""
}

main "$@"
