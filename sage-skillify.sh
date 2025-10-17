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

# Generate Skill.md with YAML frontmatter and markdown body
generate_skill_md() {
    local output_file="$1"
    local skill_name="$2"
    local description="$3"
    local version="$4"
    shift 4
    local source_files=("$@")

    # Create YAML frontmatter
    cat > "$output_file" <<EOF
---
name: $skill_name
description: $description
version: $version
---

# $skill_name

You are a specialized Sage-Dev assistant with expertise in software development workflows and quality enforcement.

## Core Principles

- **No Bullshit Code**: Fail fast, throw errors early, no fallbacks or graceful degradation
- **Type Safety First**: Use modern typing (Python 3.12+, built-in generics, | unions)
- **Test-Driven**: 80%+ overall coverage, 90%+ new code coverage
- **Documentation**: Clear, concise, technical - no self-congratulatory language
- **DRY**: Reuse existing code and patterns

---

EOF

    # Append content from source files
    for file in "${source_files[@]}"; do
        if [ -f "$file" ]; then
            echo "" >> "$output_file"
            echo "## $(basename "$file" .md | sed 's/^sage\.//')" >> "$output_file"
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

# Package skill as zip (ZIP must contain skill folder as root)
package_skill() {
    local skill_name="$1"

    # ZIP structure should be: skill-name.zip/skill-name/Skill.md
    # NOT: skill-name.zip/Skill.md
    (cd "$TEMP_DIR" && zip -r "../$OUTPUT_DIR/${skill_name}.zip" "$skill_name" -q)
    log "Packaged: $OUTPUT_DIR/${skill_name}.zip"
}

# ==================== ENFORCEMENT SKILLS ====================

generate_python_quality_suite() {
    info "Generating Sage Python Quality Suite..."

    local skill_dir="$TEMP_DIR/sage-python-quality-suite"
    mkdir -p "$skill_dir"

    # Generate Skill.md with YAML frontmatter
    generate_skill_md "$skill_dir/Skill.md" \
        "Sage Python Quality Suite" \
        "Apply Python 3.12+ typing, docstrings, test coverage, and import standards to code" \
        "$VERSION" \
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

    generate_skill_md "$skill_dir/Skill.md" \
        "Sage Security Guard" \
        "Detect secrets, enforce security standards, and eliminate bullshit code patterns" \
        "$VERSION" \
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

    generate_skill_md "$skill_dir/Skill.md" \
        "Sage Research Intelligence" \
        "Gather strategic intelligence and analyze market trends for research-driven development" \
        "$VERSION" \
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

    generate_skill_md "$skill_dir/Skill.md" \
        "Sage Specification Engine" \
        "Generate specifications, technical breakdowns, and system blueprints from requirements" \
        "$VERSION" \
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

    generate_skill_md "$skill_dir/Skill.md" \
        "Sage Implementation Planner" \
        "Create PRP-format implementation plans and SMART task breakdowns from specifications" \
        "$VERSION" \
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

    generate_skill_md "$skill_dir/Skill.md" \
        "Sage Documentation Generator" \
        "Create and update documentation, SOPs, docstrings, and implementation plans" \
        "$VERSION" \
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

    generate_skill_md "$skill_dir/Skill.md" \
        "Sage Context Optimizer" \
        "Compress conversation context and delegate research to sub-agents for token efficiency" \
        "$VERSION" \
        "commands/sage.compact-context.md" \
        "commands/sage.offload-research.md"

    package_skill "sage-context-optimizer"
}

# ==================== UTILITY SKILLS ====================

generate_ticket_manager() {
    info "Generating Sage Ticket Manager..."

    local skill_dir="$TEMP_DIR/sage-ticket-manager"
    mkdir -p "$skill_dir"

    generate_skill_md "$skill_dir/Skill.md" \
        "Sage Ticket Manager" \
        "Validate, sync, migrate, estimate, and repair ticket system integrity" \
        "$VERSION" \
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
