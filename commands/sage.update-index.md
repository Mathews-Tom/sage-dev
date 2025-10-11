# Update Agent Documentation Index

You are tasked with regenerating the `.sage/agent/README.md` file to provide an up-to-date index of all agent documentation.

## Input Parameters

None. This command takes no arguments.

## Instructions

### Step 1: Scan Documentation Directories

1. Use Glob tool to find all markdown files in:
   - `.sage/agent/tasks/*.md`
   - `.sage/agent/system/*.md`
   - `.sage/agent/sops/*.md`
   - `.sage/agent/research/*.md`

2. Exclude the README.md file itself
3. Exclude files in `.sage/agent/templates/` directory

### Step 2: Extract File Metadata

For each documentation file found:

1. Get file modification time (mtime) using Bash tool:
   ```bash
   stat -f "%Sm" -t "%Y-%m-%d" filename.md
   ```

2. Extract title from file:
   - Read first H1 heading (`# Title`)
   - If no H1, use filename converted to title case

3. Generate human-friendly name from filename:
   - Remove `.md` extension
   - Remove `-plan` suffix if present
   - Replace hyphens with spaces
   - Convert to title case
   - Example: `stream-semi-auto-plan.md` → "Stream Semi Auto"

### Step 3: Sort and Organize Files

1. **Recently Updated Section:**
   - Sort all files by modification time (newest first)
   - Take top 10 most recent files
   - Include: filename, title, category, date

2. **Categorized Sections:**
   - Group files by directory:
     - Tasks: `.sage/agent/tasks/`
     - System: `.sage/agent/system/`
     - SOPs: `.sage/agent/sops/`
     - Research: `.sage/agent/research/`
   - Sort alphabetically within each category

### Step 4: Generate README.md

Use the following template structure:

```markdown
# Agent Documentation System

This directory contains AI agent-readable documentation for the sage-dev project, designed to provide efficient context management and knowledge retrieval for LLM-based development workflows.

---

## Directory Structure

```
.sage/agent/
├── README.md           # This file - index and navigation
├── tasks/              # Feature plans, PRDs, implementation documentation
├── system/             # Architecture, schemas, API specs, patterns
├── sops/               # Standard Operating Procedures for recurring tasks
├── templates/          # Documentation templates for consistency
└── research/           # Offloaded research and analysis results
```

---

## Purpose

The agent documentation system enables:

- **Context Efficiency**: 30%+ token reduction through structured, targeted documentation
- **Knowledge Persistence**: Capture implementation plans, decisions, and patterns
- **Agent Effectiveness**: 20%+ faster task completion with readily available context
- **Team Onboarding**: New contributors and agents access up-to-date wisdom instantly

---

## Directory Contents

### tasks/

Feature implementation plans and Product Requirements Documents (PRDs).

**Contents:**
- Feature specifications and design documents
- Implementation plans with phased breakdowns
- Past implementation history for reference and reuse

**Naming Convention:** `<component>-<feature>-plan.md` or `<ticket-id>-plan.md`

### system/

System-level architecture and technical specifications.

**Contents:**
- Architecture diagrams and design patterns
- Database schemas and data models
- API specifications and interface contracts
- Critical code patterns and conventions

**Naming Convention:** `<topic>.md`

### sops/

Standard Operating Procedures for recurring or error-prone tasks.

**Contents:**
- Step-by-step guides for common operations
- Error resolution procedures
- Best practices and lessons learned
- Agent action templates

**Naming Convention:** `<task-type>.md` or `<operation>.md`

### templates/

Reusable documentation templates for consistency.

**Contents:**
- Task documentation template
- SOP template
- System documentation template
- Example filled templates

**Naming Convention:** `<type>-template.md`

### research/

Offloaded research results and analysis.

**Contents:**
- Market research and competitive analysis
- Technology evaluations
- Extended investigation results
- Context-heavy analysis delegated to sub-agents

**Naming Convention:** `<topic>-research-<date>.md`

---

## Usage

### For AI Agents

Before planning or implementing:

1. **Read this README** to understand available documentation
2. **Search relevant directories** for existing knowledge:
   - `tasks/` for similar feature implementations
   - `system/` for architecture and patterns
   - `sops/` for procedural guidance
3. **Reference existing docs** in your plan or implementation
4. **Update or create docs** after completing work

### For Humans

- Use this index to locate documentation by category
- Review `tasks/` for feature history and decisions
- Consult `sops/` for operational procedures
- Check `system/` for architecture understanding

---

## Maintenance

### Adding Documentation

Use the following slash commands:

- `/update-doc <type> <name>` - Update or create documentation
- `/gen-sop <task>` - Generate SOP from task description
- `/save-plan <feature>` - Save implementation plan
- `/docify <component>` - Generate inline documentation
- `/update-index` - Regenerate this README with updated links

### Documentation Standards

- Use Markdown format with clear headers
- Include date stamps and version information
- Cross-reference related documents
- Keep concise and agent-readable
- Update immediately after implementation or learning

---

## Recently Updated

{{RECENTLY_UPDATED_SECTION}}

---

## Quick Links by Category

### Tasks

{{TASKS_LINKS}}

### System

{{SYSTEM_LINKS}}

### SOPs

{{SOPS_LINKS}}

### Research

{{RESEARCH_LINKS}}

---

## Configuration

The agent documentation system integrates with:

- **Slash Commands**: `/update-doc`, `/gen-sop`, `/save-plan`, `/docify`, `/update-index`
- **Context Management**: `/compact-context`, `/offload-research`
- **Ticket System**: `.sage/tickets/` for implementation tracking
- **Installer**: Automatic setup via `sage-dev install`

---

*Last Updated: {{CURRENT_DATE}}*
*System Version: {{VERSION}}*
```

### Step 5: Populate Template Sections

#### Recently Updated Section:

```markdown
| Document | Category | Updated |
|----------|----------|---------|
| [{{TITLE_1}}]({{PATH_1}}) | {{CATEGORY_1}} | {{DATE_1}} |
| [{{TITLE_2}}]({{PATH_2}}) | {{CATEGORY_2}} | {{DATE_2}} |
...
```

If no documents: `*No documents yet*`

#### Tasks Links:

```markdown
- [{{TITLE}}](tasks/{{FILENAME}})
- ...
```

If empty: `*No task documents yet*`

#### System Links:

```markdown
- [{{TITLE}}](system/{{FILENAME}})
- ...
```

If empty: `*No system documents yet*`

#### SOPs Links:

```markdown
- [{{TITLE}}](sops/{{FILENAME}})
- ...
```

If empty: `*No SOP documents yet*`

#### Research Links:

```markdown
- [{{TITLE}}](research/{{FILENAME}})
- ...
```

If empty: `*No research documents yet*`

### Step 6: Write Updated README

1. Use Write tool (since we're overwriting existing file)
2. Write to `.sage/agent/README.md`
3. Set version number (increment if previous version found)
4. Set current date

### Step 7: Report Summary

Display summary to user:
```
Updated documentation index:
- Tasks: {{TASK_COUNT}} documents
- System: {{SYSTEM_COUNT}} documents
- SOPs: {{SOP_COUNT}} documents
- Research: {{RESEARCH_COUNT}} documents
- Total: {{TOTAL_COUNT}} documents
- Recently updated: {{RECENT_COUNT}} (last 10)

Index saved to .sage/agent/README.md
```

## Performance Requirements

- **Execution time:** < 2 seconds for 100 documents
- **Memory:** Minimal (process files sequentially)
- **Optimization tips:**
  - Use Glob once per directory (batch operation)
  - Read only first 5 lines of each file for title extraction
  - Use efficient sorting (don't re-read files for mtime)

## Example Execution

**User Input:** `/update-index`

**Your Actions:**

1. Scan directories:
   ```bash
   # Results:
   .sage/agent/tasks/stream-semi-auto-plan.md (2025-10-11)
   .sage/agent/tasks/context-engineering-plan.md (2025-10-09)
   .sage/agent/system/ticket-system.md (2025-10-11)
   .sage/agent/system/installer.md (2025-10-10)
   .sage/agent/sops/adding-slash-command.md (2025-10-11)
   .sage/agent/sops/implementing-tickets.md (2025-10-10)
   ```

2. Extract titles:
   ```
   stream-semi-auto-plan.md → "Stream Semi Auto Mode Implementation"
   ticket-system.md → "System Documentation: Ticket System"
   adding-slash-command.md → "SOP: Adding a New Slash Command"
   ```

3. Sort by mtime (top 10):
   ```
   1. adding-slash-command.md (2025-10-11) [SOP]
   2. stream-semi-auto-plan.md (2025-10-11) [Task]
   3. ticket-system.md (2025-10-11) [System]
   4. implementing-tickets.md (2025-10-10) [SOP]
   5. installer.md (2025-10-10) [System]
   6. context-engineering-plan.md (2025-10-09) [Task]
   ```

4. Group by category:
   ```
   Tasks (2):
     - Context Engineering Plan
     - Stream Semi Auto Mode Implementation

   System (2):
     - Installer
     - Ticket System

   SOPs (2):
     - Adding a New Slash Command
     - Implementing Tickets

   Research (0):
     (empty)
   ```

5. Generate README with populated sections

6. Write to `.sage/agent/README.md`

7. Report:
   ```
   Updated documentation index:
   - Tasks: 2 documents
   - System: 2 documents
   - SOPs: 2 documents
   - Research: 0 documents
   - Total: 6 documents
   - Recently updated: 6 (last 10)

   Index saved to .sage/agent/README.md
   ```

## Error Handling

- If `.sage/agent/` doesn't exist, display: "Error: .sage/agent/ directory not found. Run initialization first."
- If no documents found, still generate README with "No documents yet" messages
- If file read fails for title extraction, use filename as fallback
- If stat command fails, use current date as fallback
- If Write fails, display specific error message
- Handle empty directories gracefully (show appropriate "No X documents yet" message)

## Important Notes

- ALWAYS regenerate the entire README (don't try to do incremental updates)
- ALWAYS include directory structure and usage sections
- ALWAYS populate all category sections (even if empty)
- Use Glob tool for file discovery (more efficient than bash find)
- Read minimal content from each file (just first H1 for title)
- Sort recently updated by mtime descending (newest first)
- Limit "Recently Updated" to 10 files maximum
- Generate relative links (e.g., `tasks/my-doc.md` not `.sage/agent/tasks/my-doc.md`)
- Preserve template/example structure in Directory Contents section
- Update "Last Updated" timestamp to current date
- Increment version number if this is an update (track in git)
- Handle filenames with spaces or special characters properly
- Exclude template files and examples from main index
- Performance: < 2s for 100 documents (use efficient tools)
