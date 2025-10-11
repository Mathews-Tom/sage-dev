# SOP: Adding a New Slash Command

**Category:** Development
**Created:** 2025-10-11
**Last Updated:** 2025-10-11
**Version:** 1.0
**Owner:** sage-dev team

---

## Purpose

This procedure describes how to create a new slash command for the sage-dev system, including file creation, installation configuration, and documentation updates.

---

## When to Use This SOP

Use this procedure when:

- Creating a new slash command for user-facing functionality
- Adding a command that will be installed to ~/.claude/commands/
- Implementing a feature that requires a custom prompt expansion

**Do NOT use this procedure when:**

- Creating a background agent (use SOP: Adding a Background Agent instead)
- Adding a validation rule (use SOP: Adding a Validation Rule instead)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Sage-dev repository cloned and up to date
- [ ] Text editor configured for Markdown editing
- [ ] Understanding of slash command behavior in Claude Code
- [ ] Access to write to the repository

**Required Tools:**
- Text editor (VS Code, vim, etc.)
- git (for version control)
- bash (for testing)

**Required Access:**
- Write access to sage-dev repository
- Ability to run `sage-dev install` command

**Required Knowledge:**
- Markdown formatting
- Slash command syntax and behavior
- Basic bash scripting (for complex commands)

---

## Procedure

### Step 1: Create Command File

**Objective:** Create the command markdown file in the commands/ directory

**Actions:**
1. Navigate to the `commands/` directory in the sage-dev repository
2. Create a new `.md` file with the command name (e.g., `my-command.md`)
3. Write the command prompt using Markdown format

**Expected Result:**
A new markdown file exists in `commands/` with the command's prompt content.

**Example:**
```bash
cd /path/to/sage-dev
touch commands/my-command.md
```

Then edit `commands/my-command.md`:
```markdown
# My Command

Execute the following task:

{{TASK_DESCRIPTION}}

## Steps

1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}

## Validation

Ensure that:
- {{VALIDATION_1}}
- {{VALIDATION_2}}
```

**Common Issues:**
- **Issue:** File created in wrong directory (e.g., root or docs/)
  - **Solution:** Move file to commands/ directory: `mv my-command.md commands/`

---

### Step 2: Update SAGE.COMMANDS.md

**Objective:** Document the new command in the command reference

**Actions:**
1. Open `commands/SAGE.COMMANDS.md`
2. Add entry in appropriate category section
3. Include command name, syntax, description, and example
4. Update the command count and last updated date

**Expected Result:**
New command appears in SAGE.COMMANDS.md with complete documentation.

**Example:**
```markdown
### /my-command

**Description:** Brief description of what this command does.

**Usage:**
```bash
/my-command [options]
```

**Arguments:**
- `option1` - Description of option1

**Example:**
```bash
/my-command --verbose
```
```

**Common Issues:**
- **Issue:** Forgot to update "Last Updated" date
  - **Solution:** Update the date at the top of SAGE.COMMANDS.md

---

### Step 3: Update Installer (if needed)

**Objective:** Ensure the installer copies the new command file

**Actions:**
1. Open `src/sage_dev/installer.py`
2. Check if `commands/` directory is already copied wholesale
3. If individual files are listed, add new command to the list
4. If using patterns, verify new command matches existing pattern

**Expected Result:**
Installer configuration includes the new command file.

**Example:**
```python
# In installer.py, verify this pattern exists:
commands_dir = repo_root / "commands"
for command_file in commands_dir.glob("*.md"):
    install_command(command_file)
```

**Common Issues:**
- **Issue:** Installer only copies specific files, new command not included
  - **Solution:** Add explicit copy for new command or update to use glob pattern

---

### Step 4: Test Installation

**Objective:** Verify command installs correctly to ~/.claude/commands/

**Actions:**
1. Run `sage-dev install` or reinstall command
2. Check `~/.claude/commands/` for new command file
3. Verify file permissions are correct (0644)
4. Test command execution in Claude Code

**Expected Result:**
Command file exists in ~/.claude/commands/ with correct content and permissions.

**Example:**
```bash
sage-dev install
ls -la ~/.claude/commands/my-command.md
# Should show: -rw-r--r--  1 user  staff  ... my-command.md

# Test in Claude Code:
/my-command
```

**Common Issues:**
- **Issue:** Command file not found in ~/.claude/commands/
  - **Solution:** Check installer configuration, verify commands/ directory is copied

---

## Validation

After completing the procedure, verify:

- [ ] Command file exists in `commands/my-command.md`
- [ ] Command documented in `commands/SAGE.COMMANDS.md`
- [ ] Installer includes new command (if needed)
- [ ] Command file installed to `~/.claude/commands/my-command.md`
- [ ] Command executes correctly when invoked as `/my-command`

**Validation Commands:**
```bash
# Verify source file
ls -la commands/my-command.md

# Verify documentation
grep "my-command" commands/SAGE.COMMANDS.md

# Verify installation
ls -la ~/.claude/commands/my-command.md

# Test execution (in Claude Code session)
/my-command
```

**Expected Output:**
```
# Source file exists
-rw-r--r--  1 user  staff  1234 Oct 11 12:00 commands/my-command.md

# Documentation includes command
### /my-command

# Installed file exists
-rw-r--r--  1 user  staff  1234 Oct 11 12:05 /Users/user/.claude/commands/my-command.md

# Command expands in Claude Code
<command-message>my-command is running…</command-message>
```

---

## Rollback Procedure

If something goes wrong, follow these steps to rollback:

### Step 1: Remove Command File
```bash
rm commands/my-command.md
```

### Step 2: Remove Documentation Entry
```bash
# Manually edit SAGE.COMMANDS.md to remove the command entry
```

### Step 3: Remove Installed File
```bash
rm ~/.claude/commands/my-command.md
```

---

## Troubleshooting

### Issue 1: Command Not Expanding in Claude Code

**Symptoms:**
- `/my-command` shows as regular text instead of expanding
- No `<command-message>` appears

**Cause:**
Command file not installed to ~/.claude/commands/ or Claude Code not detecting it.

**Solution:**
1. Verify file exists: `ls ~/.claude/commands/my-command.md`
2. Restart Claude Code session
3. Check file permissions: `chmod 644 ~/.claude/commands/my-command.md`

**Prevention:**
Always run `sage-dev install` after creating new command files.

---

### Issue 2: Command Expands but Shows Wrong Content

**Symptoms:**
- Command expands but shows outdated or incorrect prompt
- Changes to command file not reflected

**Cause:**
Installed file in ~/.claude/commands/ not updated after editing source file.

**Solution:**
1. Re-run `sage-dev install` to update installed files
2. Verify installed file content: `cat ~/.claude/commands/my-command.md`
3. Restart Claude Code if necessary

**Prevention:**
Always reinstall after editing command files during development.

---

### Issue 3: Installer Doesn't Copy New Command

**Symptoms:**
- `sage-dev install` runs successfully
- New command file not in ~/.claude/commands/

**Cause:**
Installer configuration doesn't include new command or uses explicit file list.

**Solution:**
1. Check `src/sage_dev/installer.py` for command copy logic
2. Add new command to explicit list or update to use glob pattern
3. Re-run `sage-dev install`

**Prevention:**
Use glob pattern (*.md) instead of explicit file lists in installer.

---

## Best Practices

- Use kebab-case for command names (my-command, not my_command or MyCommand)
- Include clear instructions and validation steps in command prompt
- Add examples to help users understand command usage
- Keep commands focused on single responsibility
- Use placeholders ({{VARIABLE}}) for dynamic content
- Test command before committing to repository

---

## Common Pitfalls

- **Pitfall:** Creating command in wrong directory (docs/ instead of commands/)
  - **Avoidance:** Always create in commands/ directory for installation

- **Pitfall:** Forgetting to update SAGE.COMMANDS.md documentation
  - **Avoidance:** Make documentation update part of standard checklist

- **Pitfall:** Not testing installation before committing
  - **Avoidance:** Always run `sage-dev install` and test command execution

---

## Frequency and Timing

**Recommended Frequency:** As needed when new functionality requires slash command

**Best Time to Execute:** During feature development, before implementation phase

**Duration:** 15-30 minutes

---

## Related Procedures

- [SOP: Adding a Background Agent](adding-background-agent.md)
- [SOP: Adding a Validation Rule](adding-validation-rule.md)
- [SOP: Updating Documentation](updating-documentation.md)

---

## References

### Internal Documentation
- [SAGE.COMMANDS.md](../../../commands/SAGE.COMMANDS.md)
- [Slash Command System](../system/slash-command-system.md)
- [Installer Documentation](../system/installer.md)

### External Resources
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [Markdown Guide](https://www.markdownguide.org/)

### Related Tickets
- CONTEXT-004 through CONTEXT-010 (Context Engineering commands)

---

## Change History

### Version 1.0 - 2025-10-11
**Changes:**
- Initial version created as example for template system

**Author:** sage-dev team

---

## Approval

**Reviewed By:** N/A
**Approved By:** N/A
**Approval Date:** N/A

---

*Last Updated: 2025-10-11*
*Document Version: 1.0*
