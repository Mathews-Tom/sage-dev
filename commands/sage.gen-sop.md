# Generate Standard Operating Procedure (SOP)

You are tasked with generating a Standard Operating Procedure (SOP) document for the `.sage/agent/sops/` directory.

## Input Parameters

The user will provide:
- **Task Name:** Name of the task/procedure (will be slugified)
- **--from-context:** (Optional flag) Extract SOP from current conversation context

## Instructions

### Step 1: Parse Input

1. Extract the task name from user input
2. Check if `--from-context` flag is present
3. Slugify the task name:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters (keep alphanumeric and hyphens only)
   - Result format: `my-sop-name`

### Step 2: Determine Mode

#### Mode A: Template Mode (No --from-context flag)

This is the simple mode - just copy the template.

**Actions:**
1. Read the SOP template from `.sage/agent/templates/sop-template.md`
2. Substitute basic placeholders:
   - `{{SOP_NAME}}` → Original task name (title case)
   - `{{CATEGORY}}` → "Operational" (default)
   - `{{DATE}}` → Current date (YYYY-MM-DD)
   - `{{LAST_UPDATED}}` → Current date (YYYY-MM-DD)
   - `{{VERSION}}` → "1.0"
   - `{{OWNER}}` → "sage-dev team"
   - Leave all other placeholders for user to fill
3. Write to `.sage/agent/sops/{slugified-name}.md`
4. Inform user: "Created SOP template at .sage/agent/sops/{slugified-name}.md. Please fill in procedure steps and other details."

#### Mode B: Context Extraction Mode (With --from-context flag)

This mode uses AI to extract an SOP from the current conversation.

**Actions:**
1. Analyze the current conversation context
2. Extract the following SOP components:
   - **Purpose:** Why this procedure exists
   - **When to Use:** Specific scenarios and use cases
   - **Prerequisites:** Required tools, access, knowledge
   - **Procedure Steps:** Numbered, actionable steps with examples
   - **Validation:** How to verify success
   - **Common Issues:** Pitfalls, problems, and solutions
   - **Best Practices:** Tips for optimal execution

3. Structure the extracted information using the SOP template format
4. Populate ALL relevant placeholders with extracted content
5. Write to `.sage/agent/sops/{slugified-name}.md`
6. Inform user: "Generated SOP from conversation context at .sage/agent/sops/{slugified-name}.md. Review and refine as needed."

### Step 3: Context Extraction Guidelines (Mode B Only)

When extracting SOP from conversation:

**Look for:**
- Commands or scripts that were executed
- Problems that were solved
- Step-by-step instructions you provided
- Error messages and their solutions
- Validation checks performed
- Tools and dependencies used
- Decisions made and rationale

**Structure as:**

```markdown
# SOP: {{TASK_NAME}}

**Category:** {{CATEGORY}}
**Created:** {{CURRENT_DATE}}
**Last Updated:** {{CURRENT_DATE}}
**Version:** 1.0
**Owner:** sage-dev team

---

## Purpose

{{EXTRACTED_PURPOSE}}

---

## When to Use This SOP

Use this procedure when:

- {{EXTRACTED_USE_CASE_1}}
- {{EXTRACTED_USE_CASE_2}}
- {{EXTRACTED_USE_CASE_3}}

**Do NOT use this procedure when:**

- {{EXTRACTED_DONT_USE_1}}
- {{EXTRACTED_DONT_USE_2}}

---

## Prerequisites

Before starting, ensure you have:

- [ ] {{EXTRACTED_PREREQUISITE_1}}
- [ ] {{EXTRACTED_PREREQUISITE_2}}

**Required Tools:**
- {{EXTRACTED_TOOL_1}}
- {{EXTRACTED_TOOL_2}}

**Required Knowledge:**
- {{EXTRACTED_KNOWLEDGE_1}}

---

## Procedure

### Step 1: {{STEP_1_NAME}}

**Objective:** {{STEP_1_OBJECTIVE}}

**Actions:**
1. {{EXTRACTED_ACTION_1}}
2. {{EXTRACTED_ACTION_2}}

**Example:**
```bash
{{EXTRACTED_COMMAND_1}}
```

**Expected Result:**
{{EXTRACTED_RESULT_1}}

---

### Step 2: {{STEP_2_NAME}}

...

---

## Validation

After completing the procedure, verify:

- [ ] {{EXTRACTED_VALIDATION_1}}
- [ ] {{EXTRACTED_VALIDATION_2}}

**Validation Commands:**
```bash
{{EXTRACTED_VALIDATION_COMMAND}}
```

---

## Troubleshooting

### Issue 1: {{EXTRACTED_ISSUE_1}}

**Symptoms:** {{EXTRACTED_SYMPTOMS_1}}

**Solution:**
{{EXTRACTED_SOLUTION_1}}

**Prevention:**
{{EXTRACTED_PREVENTION_1}}

---

## Best Practices

- {{EXTRACTED_PRACTICE_1}}
- {{EXTRACTED_PRACTICE_2}}

---

## Common Pitfalls

- **Pitfall:** {{EXTRACTED_PITFALL_1}}
  - **Avoidance:** {{EXTRACTED_AVOIDANCE_1}}

---

*Last Updated: {{CURRENT_DATE}}*
*Document Version: 1.0*
```

**Extraction Prompt for Agent:**

If using Task tool for extraction, use this prompt:

```
Analyze the conversation and extract a Standard Operating Procedure for "{{TASK_NAME}}".

Extract the following components:

1. PURPOSE: Why this procedure exists (1-2 sentences)
2. WHEN TO USE: Specific scenarios (3-5 bullet points)
3. PREREQUISITES: Required tools, access, knowledge (categorized lists)
4. PROCEDURE: Step-by-step instructions with:
   - Step name and objective
   - Numbered actions
   - Code examples from conversation
   - Expected results
5. VALIDATION: How to verify success (checklist + commands)
6. TROUBLESHOOTING: Common issues, symptoms, solutions from conversation
7. BEST PRACTICES: Tips for optimal execution (3-5 points)
8. COMMON PITFALLS: What to avoid (3-5 points with avoidance strategies)

Format as structured JSON:
{
  "purpose": "string",
  "whenToUse": ["string"],
  "prerequisites": {
    "checklist": ["string"],
    "tools": ["string"],
    "knowledge": ["string"]
  },
  "steps": [
    {
      "name": "string",
      "objective": "string",
      "actions": ["string"],
      "example": "string",
      "expectedResult": "string"
    }
  ],
  "validation": {
    "checklist": ["string"],
    "commands": ["string"]
  },
  "troubleshooting": [
    {
      "issue": "string",
      "symptoms": ["string"],
      "solution": "string",
      "prevention": "string"
    }
  ],
  "bestPractices": ["string"],
  "pitfalls": [
    {
      "pitfall": "string",
      "avoidance": "string"
    }
  ]
}
```

### Step 4: Update Index

After creating the SOP:

1. Call `/sage.update-index` command to regenerate the README.md index
2. Inform user: "Documentation index updated"

## Example Interactions

### Example 1: Template Mode

**User Input:** `/gen-sop "Adding a New Slash Command"`

**Your Actions:**
1. Parse: task_name="Adding a New Slash Command", mode=template
2. Slugify: "adding-a-new-slash-command"
3. Read template: `.sage/agent/templates/sop-template.md`
4. Substitute:
   - `{{SOP_NAME}}` → "Adding a New Slash Command"
   - `{{CATEGORY}}` → "Operational"
   - `{{DATE}}` → "2025-10-11"
   - `{{LAST_UPDATED}}` → "2025-10-11"
   - `{{VERSION}}` → "1.0"
   - `{{OWNER}}` → "sage-dev team"
5. Write to `.sage/agent/sops/adding-a-new-slash-command.md`
6. Call `/sage.update-index`
7. Respond: "Created SOP template at .sage/agent/sops/adding-a-new-slash-command.md. Please fill in procedure steps and other details. Documentation index updated."

### Example 2: Context Extraction Mode

**User Input:** `/gen-sop "Implementing Context Engineering Tickets" --from-context`

**Your Actions:**
1. Parse: task_name="Implementing Context Engineering Tickets", mode=from-context
2. Slugify: "implementing-context-engineering-tickets"
3. Analyze conversation for:
   - Commands executed (mkdir, Write tool, jq, etc.)
   - Steps followed (create directories, write templates, update index)
   - Issues encountered (none in this case)
   - Validation performed (ls, permissions check)
4. Extract components:
   ```json
   {
     "purpose": "Implement tickets in the Context Engineering system following structured workflow",
     "whenToUse": [
       "Implementing CONTEXT-* tickets",
       "Creating .sage/agent/ directory structure",
       "Generating documentation templates"
     ],
     "prerequisites": {
       "checklist": [
         "Sage-dev repository cloned",
         "Ticket system initialized",
         "Read ticket acceptance criteria"
       ],
       "tools": ["bash", "jq", "text editor"],
       "knowledge": ["Ticket workflow", "Directory structure"]
     },
     "steps": [
       {
         "name": "Read Ticket",
         "objective": "Understand requirements and acceptance criteria",
         "actions": [
           "Query ticket from index.json using jq",
           "Review acceptance criteria",
           "Check dependencies"
         ],
         "example": "jq '.tickets[] | select(.id == \"CONTEXT-002\")' .sage/tickets/index.json",
         "expectedResult": "Ticket details displayed with all fields"
       },
       ...
     ],
     ...
   }
   ```
5. Populate SOP template with extracted content
6. Write to `.sage/agent/sops/implementing-context-engineering-tickets.md`
7. Call `/sage.update-index`
8. Respond: "Generated SOP from conversation context at .sage/agent/sops/implementing-context-engineering-tickets.md. Review and refine as needed. Documentation index updated."

## Error Handling

- If task name empty, display: "Error: Task name required"
- If template file missing, display: "Error: Template not found at .sage/agent/templates/sop-template.md"
- If --from-context but no relevant context found, display: "Warning: Limited context found. Generated partial SOP. Please fill in missing details."
- If `.sage/agent/sops/` directory doesn't exist, create it first
- If write operation fails, display specific error message

## Important Notes

- ALWAYS slugify task name (lowercase, hyphens, alphanumeric only)
- ALWAYS call `/sage.update-index` after creating SOP
- Template mode: Only substitute basic placeholders
- Context extraction mode: Extract and populate as much as possible from conversation
- For --from-context, be thorough - include all commands, steps, issues from conversation
- Include code examples from actual conversation (bash commands, tool calls)
- Ensure `.sage/agent/sops/` directory exists before writing
- If using Task tool for extraction, wait for result before proceeding
