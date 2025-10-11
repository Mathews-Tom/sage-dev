# Compact Conversation Context

You are tasked with compressing the current conversation state to reduce token usage while preserving critical information.

## Input Parameters

The user may provide:
- **--aggressive:** (Optional flag) Use aggressive compression mode

## Instructions

### Step 1: Determine Compression Mode

1. Check if `--aggressive` flag is present
2. Set compression mode:
   - **Normal mode:** Preserve detail, compress redundancy (default)
   - **Aggressive mode:** Maximum compression, accept some detail loss

### Step 2: Analyze Conversation

Review the entire conversation history and identify:

**Critical Information (MUST PRESERVE):**
- Completed work and deliverables
- Active tasks and in-progress work
- Decisions made and rationale
- Blockers and unresolved issues
- File paths and code locations modified
- Error messages and solutions
- Acceptance criteria for current task
- Dependencies and prerequisites
- Current state of todo list

**Redundant Information (CAN REMOVE):**
- Verbose explanations of concepts
- Repeated instructions or confirmations
- Intermediate debugging steps that succeeded
- Exploratory discussions that reached conclusion
- Tool outputs that were already processed
- Lengthy code snippets (keep references, remove full code)
- Multiple restatements of the same point

### Step 3: Generate Compacted Summary

Create a structured summary using this format:

```markdown
# Conversation Summary (Compacted)

**Generated:** {{CURRENT_DATE_TIME}}
**Compression Mode:** {{NORMAL|AGGRESSIVE}}
**Original Message Count:** {{MESSAGE_COUNT}}
**Token Reduction Target:** {{TARGET_PERCENTAGE}}%

---

## Session Context

**Project:** {{PROJECT_NAME}}
**Working Directory:** {{CWD}}
**Current Branch:** {{GIT_BRANCH}}
**Workflow Mode:** {{WORKFLOW_MODE}}

---

## Completed Work

{{LIST_ALL_COMPLETED_TASKS}}

**Files Modified:**
{{LIST_MODIFIED_FILES_WITH_PATHS}}

**Key Changes:**
{{SUMMARIZE_CHANGES_BRIEFLY}}

---

## Active Tasks

**Current Task:** {{CURRENT_TASK}}
**Status:** {{STATUS}}
**Progress:** {{PROGRESS_PERCENTAGE}}%

**Todo List:**
{{CURRENT_TODO_LIST}}

---

## Decisions Made

{{LIST_DECISIONS_WITH_RATIONALE}}

---

## Blockers and Issues

{{LIST_UNRESOLVED_BLOCKERS}}

---

## Technical Context

**Dependencies:**
{{KEY_DEPENDENCIES}}

**Configuration:**
{{IMPORTANT_CONFIG_DETAILS}}

**Code Locations:**
{{KEY_FILE_PATHS_AND_LINE_NUMBERS}}

---

## Next Steps

{{IMMEDIATE_NEXT_ACTIONS}}

---

## Preserved for Reference

{{CRITICAL_ERROR_MESSAGES_OR_EXAMPLES}}

---

*Compaction Notes: {{COMPRESSION_DETAILS}}*
```

### Step 4: Apply Compression Rules

#### Normal Mode Compression:

**Preserve:**
- All completed work summaries
- All active tasks with full context
- All decisions with brief rationale
- All blockers and unresolved issues
- Key file paths and changes
- Recent error messages (last 3-5)

**Compress:**
- Consolidate repeated explanations into single statement
- Remove successful debugging steps (keep only solution)
- Summarize long discussions into key points
- Replace code snippets with file:line references
- Merge related tool outputs

**Target:** 30-40% token reduction

#### Aggressive Mode Compression:

**Preserve:**
- Completed work (titles only, minimal details)
- Current active task only
- Critical decisions (1 sentence each)
- Unresolved blockers only
- Essential file paths only

**Compress:**
- Remove all explanatory context
- Remove all successful experiments
- Remove all intermediate states
- Keep only final states and outcomes
- Minimal rationale for decisions
- No code snippets (file references only)

**Target:** 50-70% token reduction

### Step 5: Present Compacted Summary

1. Display the generated summary to the user
2. Show compression statistics:
   ```
   Context Compaction Complete:
   - Mode: {{MODE}}
   - Original messages: {{ORIGINAL_COUNT}}
   - Compacted to: {{SUMMARY_LENGTH}} characters
   - Estimated token reduction: {{PERCENTAGE}}%

   The conversation state has been preserved in a compact form above.
   You can continue from this point, referencing the summary as needed.
   ```

3. Inform user they can continue working from this compacted state

### Step 6: Compression Techniques

**Consolidation:**
```
Before: "Let me create the directory. <tool> mkdir. Directory created successfully."
After: "Created directory: .sage/agent/"
```

**Aggregation:**
```
Before: "Created file A. Created file B. Created file C."
After: "Created 3 files: A, B, C"
```

**Reference Replacement:**
```
Before: [100 lines of code snippet]
After: "See implementation in src/module.py:45-145"
```

**State Compression:**
```
Before: "Let me check X. X is valid. Let me check Y. Y is valid."
After: "Validated X, Y"
```

**Decision Compression (Normal):**
```
Before: [3 paragraphs explaining decision reasoning]
After: "Chose approach A over B because: performance (2× faster), simplicity, maintainability"
```

**Decision Compression (Aggressive):**
```
Before: [3 paragraphs]
After: "Chose A (performance, simplicity)"
```

## Example Interaction

**User Input:** `/compact-context`

**Your Actions:**

1. Mode: Normal (no --aggressive flag)
2. Analyze conversation:
   - Messages: 45
   - Completed: CONTEXT-002, CONTEXT-003, CONTEXT-004, CONTEXT-005
   - Active: CONTEXT-006
   - Decisions: Use .sage/agent/ nested structure, task/sop/system templates
   - Files: 9 files created in .sage/agent/
3. Generate summary:
   ```markdown
   # Conversation Summary (Compacted)

   **Generated:** 2025-10-11 06:20
   **Compression Mode:** Normal
   **Original Message Count:** 45
   **Token Reduction Target:** 35%

   ---

   ## Session Context

   **Project:** sage-dev
   **Working Directory:** /Users/druk/WorkSpace/AetherForge/sage-dev
   **Current Branch:** main
   **Workflow Mode:** TICKET_BASED

   ---

   ## Completed Work

   1. **CONTEXT-002:** Created .sage/agent/ directory structure
      - Directories: tasks/, system/, sops/, templates/, research/
      - Permissions: 0755 for dirs, 0644 for files
      - README.md with structure overview

   2. **CONTEXT-003:** Created documentation templates
      - task-template.md, sop-template.md, system-template.md
      - {{PLACEHOLDER}} format for variables
      - Example filled templates in templates/examples/

   3. **CONTEXT-004:** Created /update-doc command
      - Accepts: /update-doc <type> <name> [path]
      - Validates type (task/system/sop)
      - Slugifies names, substitutes placeholders
      - Calls /update-index after changes

   4. **CONTEXT-005:** Created /gen-sop command
      - Template mode and --from-context mode
      - Extracts SOP from conversation using agent
      - Saves to .sage/agent/sops/

   **Files Modified:**
   - .sage/agent/README.md
   - .sage/agent/templates/{task,sop,system}-template.md
   - .sage/agent/templates/examples/{task,sop,system}-example.md
   - commands/{update-doc,gen-sop}.md

   **Key Changes:**
   - Implemented directory structure for agent documentation
   - Created reusable templates with placeholder system
   - Added slash commands for documentation management

   ---

   ## Active Tasks

   **Current Task:** CONTEXT-006 - Implement /save-plan command
   **Status:** In Progress
   **Progress:** 0%

   **Todo List:**
   1. ✅ CONTEXT-002: Initialize directory structure
   2. ✅ CONTEXT-003: Create templates
   3. ✅ CONTEXT-004: Create /update-doc
   4. ✅ CONTEXT-005: Create /gen-sop
   5. → CONTEXT-006: Create /save-plan
   6. ⏳ CONTEXT-007: Create /docify
   7. ⏳ CONTEXT-008: Create /update-index
   8. ⏳ CONTEXT-009: Create /compact-context
   9. ⏳ CONTEXT-010: Create /offload-research

   ---

   ## Decisions Made

   1. **Directory Structure:** Use .sage/agent/ nested within existing .sage/ directory
      - Rationale: Cleaner root, consistent with existing structure, better organization

   2. **Template Format:** Use {{PLACEHOLDER}} for variable substitution
      - Rationale: Clear, human-readable, easy to identify unfilled sections

   3. **Command Dependencies:** /update-index called by other commands
      - Rationale: Automatic index regeneration ensures README stays current

   ---

   ## Blockers and Issues

   *None*

   ---

   ## Technical Context

   **Dependencies:**
   - jq for JSON processing
   - bash for command execution
   - Task tool for agent delegation

   **Configuration:**
   - Workflow mode: TICKET_BASED (from .sage/workflow-mode)
   - Tickets: .sage/tickets/index.json

   **Code Locations:**
   - Templates: .sage/agent/templates/*.md
   - Commands: commands/*.md
   - Documentation: .sage/agent/{tasks,system,sops,research}/

   ---

   ## Next Steps

   1. Create /save-plan command (CONTEXT-006)
   2. Create /docify command (CONTEXT-007)
   3. Create /update-index command (CONTEXT-008)
   4. Create /compact-context command (CONTEXT-009)
   5. Create /offload-research command (CONTEXT-010)

   ---

   *Compaction Notes: Removed verbose tool outputs, consolidated file creation confirmations, compressed template content descriptions.*
   ```

4. Display statistics:
   ```
   Context Compaction Complete:
   - Mode: Normal
   - Original messages: 45
   - Compacted to: 2,450 characters
   - Estimated token reduction: 35%

   The conversation state has been preserved in a compact form above.
   You can continue from this point, referencing the summary as needed.
   ```

## Error Handling

- If conversation too short (< 10 messages), display: "Conversation is already compact. No compression needed."
- If compression achieves < 20% reduction, display: "Limited redundancy found. Achieved {{PERCENTAGE}}% reduction."
- If aggressive mode loses critical context, warn: "Aggressive compression applied. Some detail may be lost. Review summary carefully."

## Important Notes

- NEVER compress the current active task - preserve full context
- NEVER remove unresolved blockers or errors
- NEVER remove file paths that were just modified
- ALWAYS preserve todo list in current state
- ALWAYS preserve the last error message if task failed
- For normal mode: Be conservative, preserve context when in doubt
- For aggressive mode: Be bold, remove aggressively but preserve essentials
- Include timestamps in summary for temporal context
- Use markdown formatting for readability
- Include statistics to show compression effectiveness
- Target 30%+ token reduction minimum
- The summary itself should be concise (not verbose)
- Focus on preserving "state" not "process"
- Completed work: What was done (not how)
- Active tasks: What remains (with full context)
- Decisions: What was chosen (brief why)
