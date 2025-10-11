# Save Implementation Plan

You are tasked with extracting and saving an implementation plan from the current conversation to the `.sage/agent/tasks/` directory.

## Input Parameters

The user will provide:
- **Feature Name:** Name of the feature/component being planned (will be slugified)

## Instructions

### Step 1: Parse Input

1. Extract the feature name from user input
2. Slugify the feature name:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters (keep alphanumeric and hyphens only)
   - Result format: `my-feature-name`
3. Construct target path: `.sage/agent/tasks/{slugified-name}-plan.md`

### Step 2: Extract Plan from Conversation

Analyze the recent conversation (last 20-30 messages) to extract implementation plan components:

**Look for:**
- Feature description and objectives
- Problem statement and solution approach
- Architecture diagrams or component descriptions
- Implementation phases or steps
- Testing strategy and requirements
- Dependencies (internal and external)
- Risks and mitigations
- Acceptance criteria or success metrics
- Technical decisions and rationale

**If No Plan Found:**
- Display warning: "No implementation plan found in recent conversation"
- Ask user: "Would you like to create a blank plan template instead?"
- If yes, use task-template.md and proceed
- If no, abort

### Step 3: Structure the Extracted Plan

Use the task template format from `.sage/agent/templates/task-template.md` and populate with extracted content:

```markdown
# {{FEATURE_NAME}}

**Feature/Ticket:** {{TICKET_ID_IF_AVAILABLE}}
**Created:** {{CURRENT_DATE}}
**Status:** Planning
**Owner:** sage-dev team

---

## Overview

{{EXTRACTED_DESCRIPTION}}

**Problem Statement:**
{{EXTRACTED_PROBLEM}}

**Solution Approach:**
{{EXTRACTED_SOLUTION}}

---

## Objectives

### Primary Goals

{{EXTRACTED_GOALS}}

### Success Metrics

{{EXTRACTED_METRICS}}

### Non-Goals

{{EXTRACTED_NON_GOALS}}

---

## Implementation Plan

{{EXTRACTED_PHASES_AND_STEPS}}

---

## Architecture

{{EXTRACTED_ARCHITECTURE}}

### Key Components

{{EXTRACTED_COMPONENTS}}

### Data Flow

{{EXTRACTED_DATA_FLOW}}

---

## Dependencies

### Internal Dependencies

{{EXTRACTED_INTERNAL_DEPS}}

### External Dependencies

{{EXTRACTED_EXTERNAL_DEPS}}

### Blockers

{{EXTRACTED_BLOCKERS}}

---

## Testing Strategy

### Unit Tests

{{EXTRACTED_UNIT_TESTS}}

### Integration Tests

{{EXTRACTED_INTEGRATION_TESTS}}

### End-to-End Tests

{{EXTRACTED_E2E_TESTS}}

---

## Risks and Mitigations

{{EXTRACTED_RISKS}}

---

## Implementation Checklist

{{EXTRACTED_CHECKLIST}}

---

## References

### Internal Documentation
{{EXTRACTED_INTERNAL_REFS}}

### External Resources
{{EXTRACTED_EXTERNAL_REFS}}

---

## Decision Log

{{EXTRACTED_DECISIONS}}

---

*Last Updated: {{CURRENT_DATE}}*
*Document Version: 1.0*
```

### Step 4: Extraction Prompt Guidelines

When extracting plan from conversation, focus on:

**Overview Section:**
- Summarize the feature in 2-3 sentences
- Extract problem statement (what are we solving?)
- Extract solution approach (how are we solving it?)

**Objectives Section:**
- Extract 3-5 primary goals from discussion
- Extract measurable success metrics if mentioned
- Extract explicit non-goals if stated

**Implementation Plan:**
- Identify phases or steps mentioned
- For each phase: duration, tasks, deliverables
- Preserve numbering and structure from conversation

**Architecture:**
- Extract component descriptions
- Extract diagrams (Mermaid syntax if present)
- Extract interfaces and integrations
- Extract data flow descriptions

**Dependencies:**
- Internal: Other components, tickets, features
- External: Libraries, tools, services
- Blockers: Prerequisites not yet satisfied

**Testing Strategy:**
- Extract test coverage targets
- Extract test cases or scenarios mentioned
- Extract performance benchmarks if discussed

**Risks:**
- Extract risks identified in conversation
- Extract mitigations for each risk
- Include impact and likelihood if mentioned

**Decisions:**
- Extract architectural decisions made
- Extract alternatives considered
- Extract rationale for chosen approach

### Step 5: Save Plan

1. Write the populated plan to `.sage/agent/tasks/{slugified-name}-plan.md`
2. Inform user: "Saved implementation plan to .sage/agent/tasks/{slugified-name}-plan.md"

### Step 6: Update Index

1. Call `/sage.update-index` command to regenerate README.md
2. Inform user: "Documentation index updated"

## Example Interaction

**User Input:** `/save-plan "Stream Semi-Auto Mode"`

**Your Actions:**
1. Parse: feature_name="Stream Semi-Auto Mode"
2. Slugify: "stream-semi-auto-mode"
3. Target: `.sage/agent/tasks/stream-semi-auto-mode-plan.md`
4. Analyze conversation for plan components
5. Extract:
   ```
   Overview: "Implement component-level automation for /stream command..."
   Problem: "Interactive mode requires 50+ confirmations causing fatigue..."
   Solution: "Group tickets by component prefix, confirm at boundaries..."
   Goals:
     - Reduce confirmations by 90%
     - Maintain user control at component boundaries
     - Enable pause/resume
   Metrics:
     - Execution speed: 3-5× faster than interactive
     - Confirmation reduction: 90%
   Architecture:
     - Component grouping: Parse ticket IDs, extract prefix
     - Batch files: .sage/batches/*.batch
     - Confirmation handlers: start/push/continue
   ...
   ```
6. Populate task template with extracted content
7. Write to `.sage/agent/tasks/stream-semi-auto-mode-plan.md`
8. Call `/sage.update-index`
9. Respond: "Saved implementation plan to .sage/agent/tasks/stream-semi-auto-mode-plan.md. Documentation index updated."

## Error Handling

- If feature name empty, display: "Error: Feature name required"
- If no plan found in conversation:
  - Warn user
  - Offer blank template option
  - Proceed based on user choice
- If `.sage/agent/tasks/` directory doesn't exist, create it first
- If write operation fails, display specific error message
- If extraction yields partial plan, save it and inform user: "Saved partial plan. Please review and fill in missing sections."

## Important Notes

- ALWAYS slugify feature name (lowercase, hyphens, alphanumeric only)
- Append `-plan` to filename: `{slugified-name}-plan.md`
- ALWAYS call `/sage.update-index` after saving plan
- Search last 20-30 messages of conversation for plan content
- Include ALL relevant content from conversation (be thorough)
- If multiple phases discussed, preserve phase structure
- Include code examples, diagrams, commands from conversation
- Extract ticket IDs if mentioned (TICKET-XXX format)
- Mark incomplete sections with placeholders for user to fill
- Use task-template.md format for consistency
- Ensure `.sage/agent/tasks/` directory exists before writing
