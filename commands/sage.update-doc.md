# Update or Create Agent Documentation

You are tasked with updating or creating documentation in the `.sage/agent/` directory system.

## Input Parameters

The user will provide:
- **Type:** `task`, `system`, or `sop`
- **Name:** Document name (will be slugified)
- **Path:** (Optional) Specific path if updating existing document

## Instructions

### Step 1: Validate Input

1. Verify type is one of: `task`, `system`, or `sop`
2. If invalid, respond with: "Invalid type. Must be 'task', 'system', or 'sop'"
3. Extract and slugify the name:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters (keep alphanumeric and hyphens only)
   - Result format: `my-document-name`

### Step 2: Determine Target Path

1. Construct target path based on type:
   - `task` → `.sage/agent/tasks/{slugified-name}.md`
   - `system` → `.sage/agent/system/{slugified-name}.md`
   - `sop` → `.sage/agent/sops/{slugified-name}.md`

2. If path parameter provided, use that instead

3. Check if document already exists at target path

### Step 3: Create or Update Document

#### If Document Does NOT Exist (Create):

1. Read the appropriate template from `.sage/agent/templates/`:
   - `task` → `task-template.md`
   - `system` → `system-template.md`
   - `sop` → `sop-template.md`

2. Substitute key placeholders:
   - `{{TASK_NAME}}` / `{{SYSTEM_NAME}}` / `{{SOP_NAME}}` → Original name (title case)
   - `{{DATE}}` → Current date (YYYY-MM-DD format)
   - `{{LAST_UPDATED}}` → Current date (YYYY-MM-DD format)
   - `{{VERSION}}` → "1.0"
   - `{{OWNER}}` → "sage-dev team"
   - Leave other placeholders for user to fill

3. Write the populated template to target path using the Write tool

4. Inform user: "Created new {type} documentation at {path}. Please fill in remaining placeholders."

#### If Document DOES Exist (Update):

1. Read the existing document using the Read tool

2. Ask user what they want to update

3. Wait for user response with update details

4. Apply updates using the Edit tool

5. Update `{{LAST_UPDATED}}` placeholder if present

6. Inform user: "Updated {type} documentation at {path}"

### Step 4: Update Index

After creating or updating the document:

1. Call the `/sage.update-index` command to regenerate the README.md index

2. Inform user: "Documentation index updated"

## Example Interactions

### Example 1: Create New Task Document

**User Input:** `/update-doc task "Stream Semi-Auto Mode Implementation"`

**Your Actions:**
1. Validate: type=task ✓
2. Slugify: "stream-semi-auto-mode-implementation"
3. Target path: `.sage/agent/tasks/stream-semi-auto-mode-implementation.md`
4. Check exists: No
5. Read template: `.sage/agent/templates/task-template.md`
6. Substitute placeholders:
   - `{{TASK_NAME}}` → "Stream Semi-Auto Mode Implementation"
   - `{{DATE}}` → "2025-10-11"
   - `{{LAST_UPDATED}}` → "2025-10-11"
   - `{{VERSION}}` → "1.0"
   - `{{OWNER}}` → "sage-dev team"
7. Write to `.sage/agent/tasks/stream-semi-auto-mode-implementation.md`
8. Call `/sage.update-index`
9. Respond: "Created new task documentation at .sage/agent/tasks/stream-semi-auto-mode-implementation.md. Please fill in remaining placeholders. Documentation index updated."

### Example 2: Update Existing System Document

**User Input:** `/update-doc system "Ticket System"`

**Your Actions:**
1. Validate: type=system ✓
2. Slugify: "ticket-system"
3. Target path: `.sage/agent/system/ticket-system.md`
4. Check exists: Yes
5. Read existing document
6. Ask: "What would you like to update in the Ticket System documentation?"
7. Wait for user response
8. Apply updates based on user input
9. Update `{{LAST_UPDATED}}` to current date
10. Call `/sage.update-index`
11. Respond: "Updated system documentation at .sage/agent/system/ticket-system.md. Documentation index updated."

### Example 3: Create SOP with Custom Path

**User Input:** `/update-doc sop "Adding Slash Commands" .sage/agent/sops/adding-slash-command.md`

**Your Actions:**
1. Validate: type=sop ✓
2. Slugify: "adding-slash-commands" (for reference, but path provided)
3. Target path: `.sage/agent/sops/adding-slash-command.md` (from parameter)
4. Check exists: No
5. Read template: `.sage/agent/templates/sop-template.md`
6. Substitute placeholders:
   - `{{SOP_NAME}}` → "Adding Slash Commands"
   - `{{DATE}}` → "2025-10-11"
   - `{{LAST_UPDATED}}` → "2025-10-11"
   - `{{VERSION}}` → "1.0"
   - `{{OWNER}}` → "sage-dev team"
   - `{{CATEGORY}}` → "Development"
7. Write to `.sage/agent/sops/adding-slash-command.md`
8. Call `/sage.update-index`
9. Respond: "Created new sop documentation at .sage/agent/sops/adding-slash-command.md. Please fill in remaining placeholders. Documentation index updated."

## Error Handling

- If type is invalid, display error and stop
- If template file missing, display error: "Template not found: .sage/agent/templates/{type}-template.md"
- If target directory doesn't exist, create it first
- If Write/Edit/Read operations fail, display specific error message

## Important Notes

- ALWAYS slugify the name (lowercase, hyphens, alphanumeric only)
- ALWAYS call `/sage.update-index` after creating or updating documentation
- For new documents, only substitute basic placeholders (name, date, version, owner)
- Leave detailed placeholders for user to fill manually
- For existing documents, ask user what to update before making changes
- Use Write tool for new documents, Edit tool for updates
- Ensure `.sage/agent/{type}/` directory exists before writing
