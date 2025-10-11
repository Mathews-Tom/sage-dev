# Generate Component Documentation

You are tasked with analyzing source code and generating comprehensive system documentation in the `.sage/agent/system/` directory.

## Input Parameters

The user will provide:
- **Component Path:** Path to file or directory to document

## Instructions

### Step 1: Parse and Validate Input

1. Extract the component path from user input
2. Verify the path exists using Read or Glob tools
3. Determine if path is a file or directory
4. Extract component name:
   - For file: Use filename without extension
   - For directory: Use directory name
5. Slugify the component name:
   - Convert to lowercase
   - Replace spaces and underscores with hyphens
   - Remove special characters (keep alphanumeric and hyphens only)
   - Result format: `component-name`

### Step 2: Analyze Code Structure

#### For Single File:
1. Read the file using Read tool
2. Analyze:
   - Purpose (from file-level comments or module docstrings)
   - Exported functions/classes/interfaces
   - Dependencies (imports, requires)
   - Key algorithms or patterns
   - Edge cases or special handling

#### For Directory:
1. Use Glob tool to find all code files
2. For each significant file, analyze:
   - Module purpose
   - Public APIs
   - Key exports
3. Identify:
   - Directory structure and organization
   - Module relationships
   - Entry points
   - Configuration files

### Step 3: Extract Documentation Components

**Required Components:**

1. **Purpose:**
   - What the component does (1-2 paragraphs)
   - Key capabilities (3-5 bullet points)
   - Design goals

2. **Interfaces:**
   - Functions/methods with signatures
   - Classes with key methods
   - API endpoints if applicable
   - Command-line interfaces
   - File formats (input/output)

3. **Dependencies:**
   - Internal dependencies (other components)
   - External dependencies (libraries, tools)
   - Integration points

4. **Usage:**
   - Common use cases (2-3 examples)
   - Code examples with actual signatures
   - Configuration options
   - Best practices

5. **Edge Cases:**
   - Error handling
   - Boundary conditions
   - Known limitations
   - Troubleshooting tips

**Supported File Types:**

- **Python (.py):** Functions, classes, docstrings, type hints
- **TypeScript/JavaScript (.ts, .js):** Functions, classes, exports, JSDoc
- **Bash (.sh):** Functions, environment variables, script usage
- **Markdown (.md):** Structure, commands, documentation patterns
- **JSON (.json):** Schema, structure, validation rules
- **YAML (.yaml, .yml):** Configuration, structure

### Step 4: Generate Documentation

Use the system template format from `.sage/agent/templates/system-template.md`:

```markdown
# System Documentation: {{COMPONENT_NAME}}

**Component Type:** {{EXTRACTED_TYPE}}
**Created:** {{CURRENT_DATE}}
**Last Updated:** {{CURRENT_DATE}}
**Version:** 1.0
**Owner:** sage-dev team

---

## Purpose

{{EXTRACTED_PURPOSE}}

**Key Capabilities:**
{{EXTRACTED_CAPABILITIES}}

**Design Goals:**
{{EXTRACTED_DESIGN_GOALS}}

---

## Architecture Overview

### System Context

{{EXTRACTED_CONTEXT}}

### Component Structure

{{EXTRACTED_STRUCTURE}}

**Key Modules:**

{{EXTRACTED_MODULES}}

---

## Interfaces

{{EXTRACTED_INTERFACES}}

---

## Data Models

{{EXTRACTED_DATA_MODELS}}

---

## Dependencies

### Internal Dependencies

{{EXTRACTED_INTERNAL_DEPS}}

### External Dependencies

{{EXTRACTED_EXTERNAL_DEPS}}

---

## Usage

### Common Use Cases

{{EXTRACTED_USE_CASES}}

### Code Examples

{{EXTRACTED_CODE_EXAMPLES}}

---

## Configuration

{{EXTRACTED_CONFIG}}

---

## Operational Concerns

### Performance

{{EXTRACTED_PERFORMANCE}}

### Monitoring

{{EXTRACTED_MONITORING}}

### Logging

{{EXTRACTED_LOGGING}}

### Security

{{EXTRACTED_SECURITY}}

---

## Troubleshooting

{{EXTRACTED_TROUBLESHOOTING}}

---

## Design Patterns

{{EXTRACTED_PATTERNS}}

---

## References

### Internal Documentation
{{EXTRACTED_INTERNAL_REFS}}

### Related Components
{{EXTRACTED_RELATED}}

---

*Last Updated: {{CURRENT_DATE}}*
*Document Version: 1.0*
```

### Step 5: Code Analysis Guidelines

**For Functions:**
```markdown
#### {{FUNCTION_NAME}}

**Syntax:**
```{{LANGUAGE}}
{{FUNCTION_SIGNATURE}}
```

**Arguments:**
- `{{arg1}}` ({{type}}) - {{description}}
- `{{arg2}}` ({{type}}) - {{description}}

**Returns:** {{return_type}} - {{return_description}}

**Example:**
```{{LANGUAGE}}
{{ACTUAL_USAGE_EXAMPLE}}
```

**Edge Cases:**
- {{edge_case_1}}
- {{edge_case_2}}
```

**For Classes:**
```markdown
### {{CLASS_NAME}}

**Description:** {{class_purpose}}

**Key Methods:**

#### {{method_name}}

**Signature:**
```{{LANGUAGE}}
{{method_signature}}
```

**Parameters:**
- `{{param}}` - {{description}}

**Returns:** {{return_type}}

**Example:**
```{{LANGUAGE}}
{{usage_example}}
```
```

**For APIs:**
```markdown
#### {{API_NAME}}

**Endpoint:** `{{endpoint}}`
**Method:** {{HTTP_METHOD}}

**Request:**
```json
{{request_schema}}
```

**Response:**
```json
{{response_schema}}
```

**Error Codes:**
- `{{code}}` - {{description}}
```

### Step 6: Save Documentation

1. Write the generated documentation to `.sage/agent/system/{slugified-name}.md`
2. Inform user: "Generated documentation for {{component}} at .sage/agent/system/{slugified-name}.md"

### Step 7: Update Index

1. Call `/sage.update-index` command to regenerate README.md
2. Inform user: "Documentation index updated"

## Example Interactions

### Example 1: Single File

**User Input:** `/docify src/sage_dev/installer.py`

**Your Actions:**
1. Parse: path="src/sage_dev/installer.py"
2. Verify: File exists ✓
3. Component name: "installer"
4. Slugify: "installer"
5. Read file and analyze:
   ```python
   # Extract:
   - Purpose: "Installer for sage-dev system, copies commands/agents/rules to ~/.claude/"
   - Functions: install_commands(), install_agents(), install_rules(), main()
   - Dependencies: pathlib, shutil, os
   - Key patterns: File copying, directory creation, permission setting
   ```
6. Generate documentation with:
   - Purpose section
   - Function interfaces with signatures
   - Dependencies (internal/external)
   - Usage examples
   - Error handling
7. Write to `.sage/agent/system/installer.md`
8. Call `/sage.update-index`
9. Respond: "Generated documentation for installer at .sage/agent/system/installer.md. Documentation index updated."

### Example 2: Directory

**User Input:** `/docify commands/`

**Your Actions:**
1. Parse: path="commands/"
2. Verify: Directory exists ✓
3. Component name: "commands"
4. Slugify: "commands"
5. Glob: Find all .md files in commands/
6. Analyze structure:
   ```
   - Slash command system
   - Command files: stream.md, implement.md, validate.md, etc.
   - Installation: Copied to ~/.claude/commands/
   - Expansion: Prompts expanded by Claude Code
   ```
7. Generate documentation with:
   - Purpose: Slash command collection
   - Structure: Directory of .md files
   - Interfaces: Each command's syntax
   - Usage: How commands are invoked
   - Installation process
8. Write to `.sage/agent/system/commands.md`
9. Call `/sage.update-index`
10. Respond: "Generated documentation for commands at .sage/agent/system/commands.md. Documentation index updated."

## Error Handling

- If path empty, display: "Error: Component path required"
- If path doesn't exist, display: "Error: Path not found: {path}"
- If file type unsupported, still attempt analysis but warn: "Limited support for {extension} files"
- If no extractable content, display: "Warning: Minimal content extracted. Generated skeleton documentation."
- If `.sage/agent/system/` directory doesn't exist, create it first
- If write operation fails, display specific error message

## Important Notes

- ALWAYS slugify component name (lowercase, hyphens, alphanumeric only)
- ALWAYS call `/sage.update-index` after generating documentation
- Read files using Read tool (not bash cat)
- For directories, focus on significant files (skip tests, generated code)
- Extract actual code signatures, don't invent APIs
- Include real code examples from the analyzed code
- If docstrings exist, extract and use them
- Preserve type hints from Python code
- Extract JSDoc comments from JS/TS
- For bash scripts, document environment variables and functions
- Include file paths and line numbers for key components
- Be thorough but avoid documenting every internal helper function
- Focus on public APIs and user-facing functionality
- Ensure `.sage/agent/system/` directory exists before writing
- If analysis is incomplete, mark sections with "TODO: Expand with more details"
