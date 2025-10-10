---
allowed-tools: Bash(cat:*), Bash(ls:*), SequentialThinking
description: Interactive workflow selector that recommends Traditional vs Ticket-Based workflow based on project context.
argument-hint: ''
---

## Role

Workflow advisor helping users choose the optimal development workflow for their project.

## Purpose

Resolve workflow confusion by:

- Asking clarifying questions about project context
- Analyzing current project state
- Recommending Traditional or Ticket-Based workflow
- Validating workflow prerequisites
- Preventing accidental workflow mixing

## Execution

1. **Analyze Current State**:

   ```bash
   # Check for existing workflow indicators
   ls -la docs/ 2>/dev/null
   ls -la .sage/tickets/ 2>/dev/null

   # Check for blueprint (Traditional workflow)
   test -f docs/blueprint.md && echo "TRADITIONAL_ACTIVE"

   # Check for ticket system (Ticket-Based workflow)
   test -f .sage/tickets/index.json && echo "TICKET_ACTIVE"

   # Check for specifications
   ls docs/specs/*/spec.md 2>/dev/null | wc -l
   ```

2. **Interactive Questions**:

   Ask user (unless workflow already detected):

   ```plaintext
   1. Project Type:
      - Is this a NEW project or EXISTING codebase?

   2. Control Preference:
      - Do you want AUTOMATED execution or MANUAL control?

   3. Automation Comfort:
      - Are you comfortable with AI making commits automatically?

   4. Project Maturity:
      - Is this EXPERIMENTAL (POC) or PRODUCTION-BOUND?

   5. Team Size:
      - Solo developer or TEAM collaboration?
   ```

3. **Use SequentialThinking** to:
   - Analyze project state + user answers
   - Determine best workflow match
   - Identify any conflicts or risks
   - Generate recommendation with rationale

4. **Present Recommendation**:

   ```plaintext
   RECOMMENDED WORKFLOW: [Traditional | Ticket-Based]

   RATIONALE:
   - [Why this workflow fits]
   - [Key benefits for your context]
   - [Risks with alternative workflow]

   NEXT STEPS:
   - [Specific commands to run]
   - [Prerequisites to complete]
   - [Configuration needed]
   ```

5. **Validate Prerequisites**:

   Before allowing workflow start, check:
   - Required tools available
   - Directory structure valid
   - No conflicting workflow artifacts

6. **Set Workflow Mode**:

   ```bash
   # Create workflow mode indicator
   mkdir -p .sage
   echo "TRADITIONAL" > .sage/workflow-mode
   # or
   echo "TICKET_BASED" > .sage/workflow-mode

   # Add to .gitignore if not present
   grep -q "^\.sage/$" .gitignore 2>/dev/null || echo ".sage/" >> .gitignore
   ```

## Decision Matrix

### Traditional Workflow Recommended When

- ✅ New project + Manual control preferred
- ✅ Production-bound + Need review before commits
- ✅ Experimental + POC validation needed
- ✅ Team collaboration + Code review culture
- ✅ Complex architecture + Need detailed breakdowns
- ✅ Not comfortable with automated commits
- ✅ Prefer step-by-step verification

**Commands:** `/specify → /plan → /tasks → /breakdown → /blueprint → /implement → /progress → /commit`

### Ticket-Based Workflow Recommended When

- ✅ New project + Automation preferred
- ✅ Solo developer + Fast iteration needed
- ✅ Comfortable with AI-driven commits
- ✅ Want hands-off execution
- ✅ Clear specifications + Low ambiguity
- ✅ Experimental + Quick validation
- ✅ Trust automated testing

**Commands:** `/specify → /plan → /tasks → /migrate-tickets → /stream`

### Hybrid Workflow (Advanced)

Start Traditional, migrate to Ticket-Based:

```bash
# Phase 1: Traditional for planning
/specify → /plan → /tasks → /breakdown → /blueprint

# Phase 2: Migrate to automation
/migrate-tickets

# Phase 3: Automated execution
/stream
```

## Workflow Conflict Detection

### Scenario 1: Both Workflows Detected

```bash
# Found both docs/blueprint.md AND .sage/tickets/index.json
WARNING: Mixed workflow detected!

Current State:
- Traditional workflow: ACTIVE (docs/blueprint.md exists)
- Ticket workflow: ACTIVE (.sage/tickets/index.json exists)

This is VALID if you migrated from Traditional → Ticket-Based.

Question: Did you run /migrate to convert?
- Yes → Continue with Ticket-Based workflow
- No → Choose primary workflow and archive the other
```

### Scenario 2: Workflow Mode Mismatch

```bash
# .sage/workflow-mode says TRADITIONAL but .sage/tickets/ exists
ERROR: Workflow mode mismatch!

Expected: TRADITIONAL
Found: .sage/tickets/index.json (indicates TICKET_BASED)

Options:
1. Switch to Ticket-Based: rm .sage/workflow-mode && echo "TICKET_BASED" > .sage/workflow-mode
2. Remove tickets: rm -rf .sage/tickets/ (CAUTION: destructive)
3. Run /migrate to formalize migration
```

## Output Template

````markdown
# Workflow Recommendation

**Project Analysis:**
- Type: [New | Existing]
- Docs Present: [Yes | No]
- Tickets Present: [Yes | No]
- Current Mode: [Traditional | Ticket-Based | None | Mixed]

**User Preferences:**
- Control: [Automated | Manual]
- Automation Comfort: [High | Medium | Low]
- Project Stage: [Experimental | Production]
- Team: [Solo | Team]

---

## 🎯 RECOMMENDED WORKFLOW: [TRADITIONAL | TICKET-BASED]

### Why This Workflow?

1. **[Primary Reason]**
   - [Specific benefit for your context]

2. **[Secondary Reason]**
   - [How this matches your preferences]

3. **[Risk Mitigation]**
   - [Why alternative workflow would be problematic]

### What This Means

**You will use:**
- [List of primary commands]
- [Expected workflow pattern]

**You will NOT use:**
- [Commands to avoid]
- [Conflicting patterns]

---

## 📋 Next Steps

### Immediate Actions:

1. **[First Command]**
   ```bash
   /[command-name]
   ```

- Purpose: [What this does]
- Output: [What to expect]

2. **[Second Command]**

   ```bash
   /[command-name]
   ```

   - Purpose: [What this does]
   - Output: [What to expect]

### Workflow Sequence

**Traditional Flow:**

```plaintext
/specify → /plan → /tasks → /breakdown → /blueprint → /implement → /progress → /commit
```

**Ticket-Based Flow:**

```plaintext
/specify → /plan → /tasks → /migrate → /stream
```

**Hybrid Flow (Advanced):**

```plaintext
Traditional flow through /blueprint → /migrate → /stream
```

---

## ⚙️ Configuration

**Workflow Mode Set:** [TRADITIONAL | TICKET_BASED]

**Location:** `.sage/workflow-mode`

**Commands will now:**

- ✅ Validate workflow mode before execution
- ✅ Prevent mixing workflows accidentally
- ✅ Show warnings if mode conflicts detected
- ✅ Use workflow-appropriate defaults

**To change workflow later:**

```bash
echo "TICKET_BASED" > .sage/workflow-mode  # Switch to Ticket-Based
echo "TRADITIONAL" > .sage/workflow-mode   # Switch to Traditional
```

---

## 🔍 Validation Checks

**Prerequisites Met:**

- [✓] Directory structure valid
- [✓] Git repository initialized
- [✓] Required tools available
- [✓] No workflow conflicts

**Ready to Start:** ✅

---

## ⚠️ Important Notes

### Traditional Workflow

- **Manual control at each step**
- Review outputs before proceeding
- Run `/implement` per phase manually
- Commit when YOU decide with `/commit`

### Ticket-Based Workflow

- **Automated execution with `/stream`**
- AI makes commits automatically (includes ticket IDs)
- Sub-agents process tickets independently
- User confirms after each ticket (interactive mode)
- Use `--auto` for fully hands-off (advanced)

### Workflow Migration

**Traditional → Ticket-Based:**

1. Complete Traditional workflow through `/blueprint`
2. Run `/migrate` to convert docs to tickets
3. Run `/stream` for automated execution

**Ticket-Based → Traditional:**

- Not recommended (tickets are richer structure)
- Manual extraction needed if required

---

## 📚 Additional Resources

- **SAGE_DEV_WORKFLOW.md:** Full workflow documentation
- **SAGE_DEV_COMMANDS.md:** Command reference with visual workflow diagrams
- **commands/[name].md:** Individual command details
- **.docs/GAP_ANALYSIS.md:** System architecture insights

---

**Workflow mode saved to:** `.sage/workflow-mode`

**Rerun this command anytime:** `/workflow` to reassess
````

## Validation

After recommendation, validate:

1. ✅ User understands chosen workflow
2. ✅ Prerequisites are met
3. ✅ No conflicting artifacts
4. ✅ Workflow mode file created
5. ✅ Next steps are clear

## Error Scenarios

### No User Input Available

```plaintext
ERROR: /workflow requires interactive input

This command cannot run in automated mode.
Please run manually to set workflow preference.

Alternatively, manually create workflow mode:
  echo "TRADITIONAL" > .sage/workflow-mode
  echo "TICKET_BASED" > .sage/workflow-mode
```

### Conflicting State Cannot Resolve

```plaintext
ERROR: Cannot determine valid workflow

Found:

- docs/blueprint.md (Traditional)
- .sage/tickets/index.json (Ticket-Based)
- .sage/workflow-mode: MISSING

Manual intervention required:

1. Review project state
2. Choose primary workflow
3. Set mode: echo "[MODE]" > .sage/workflow-mode
4. Archive or delete conflicting artifacts
```

## Success Criteria

- [ ] User understands recommended workflow
- [ ] Workflow mode file created
- [ ] No conflicts detected
- [ ] Prerequisites validated
- [ ] Next commands clear
- [ ] Rationale explained

## Notes

- Run this BEFORE any other commands on new projects
- Rerun if switching workflows
- Safe to run multiple times (idempotent)
- Will detect and warn about conflicts
- Does not modify existing work, only sets mode
