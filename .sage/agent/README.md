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

**Example:**
```
tasks/stream-semi-auto-plan.md
tasks/CONTEXT-001-plan.md
```

### system/

System-level architecture and technical specifications.

**Contents:**
- Architecture diagrams and design patterns
- Database schemas and data models
- API specifications and interface contracts
- Critical code patterns and conventions

**Naming Convention:** `<topic>.md`

**Example:**
```
system/architecture.md
system/ticket-system-schema.md
system/agent-integration.md
```

### sops/

Standard Operating Procedures for recurring or error-prone tasks.

**Contents:**
- Step-by-step guides for common operations
- Error resolution procedures
- Best practices and lessons learned
- Agent action templates

**Naming Convention:** `<task-type>.md` or `<operation>.md`

**Example:**
```
sops/adding-slash-command.md
sops/ticket-creation.md
sops/resolving-merge-conflicts.md
```

### templates/

Reusable documentation templates for consistency.

**Contents:**
- Task documentation template
- SOP template
- System documentation template
- Architecture decision record (ADR) template

**Naming Convention:** `<type>-template.md`

**Example:**
```
templates/task-template.md
templates/sop-template.md
templates/system-template.md
```

### research/

Offloaded research results and analysis.

**Contents:**
- Market research and competitive analysis
- Technology evaluations
- Extended investigation results
- Context-heavy analysis delegated to sub-agents

**Naming Convention:** `<topic>-research-<date>.md`

**Example:**
```
research/parallel-execution-research-2025-10-06.md
research/context-engineering-analysis-2025-10-11.md
```

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

- `/sage.update-doc <topic>` - Update or create documentation
- `/sage.gen-sop <task>` - Generate SOP from task description
- `/sage.save-plan <feature>` - Save implementation plan
- `/sage.docify <component>` - Generate inline documentation
- `/sage.update-index` - Regenerate this README with updated links

### Documentation Standards

- Use Markdown format with clear headers
- Include date stamps and version information
- Cross-reference related documents
- Keep concise and agent-readable
- Update immediately after implementation or learning

---

## Recently Updated

*This section will be auto-populated by `/sage.update-index` command*

No documents yet.

---

## Quick Links by Category

### Tasks
*No task documents yet*

### System
*No system documents yet*

### SOPs
*No SOP documents yet*

### Templates
*Templates will be created in CONTEXT-003*

### Research
*No research documents yet*

---

## Configuration

The agent documentation system integrates with:

- **Slash Commands**: `/sage.update-doc`, `/sage.gen-sop`, `/sage.save-plan`, `/sage.docify`, `/sage.update-index`
- **Context Management**: `/sage.compact-context`, `/sage.offload-research`
- **Ticket System**: `.sage/tickets/` for implementation tracking
- **Installer**: Automatic setup via `sage-dev install`

---

*Last Updated: 2025-10-11*
*System Version: 1.0.0 (CONTEXT-002)*
