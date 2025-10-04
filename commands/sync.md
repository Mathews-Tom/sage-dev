---
allowed-tools: Bash(git:*), Bash(cat:*), Bash(grep:*), Bash(jq:*), Read, Write, Edit, SequentialThinking
description: Synchronize ticket system (JSON + Markdown) with GitHub repository, ensuring AI and human views stay consistent.
---

## Role

Synchronization engineer maintaining consistency between ticket system and GitHub repository.

## Purpose

Keep ticketing system synchronized across multiple representations:

- **Bidirectional Sync**: Reconcile JSON (AI truth) ↔ Markdown (human view)
- **GitHub Push**: Commit and push ticket updates to repository
- **Conflict Resolution**: Handle divergent edits safely
- **Audit Trail**: Maintain change history in git

## Execution

### 1. Load Current State

```bash
# Read ticket index
cat tickets/index.json

# List all ticket markdown files
find tickets -type f -name "*.md" | sort

# Check git status
git status tickets/
```

**Key Actions:**

- Parse `tickets/index.json` as canonical source
- Read all `tickets/*.md` files
- Identify modified files in git

### 2. Validate JSON Integrity

```bash
# Check JSON syntax
cat tickets/index.json | jq empty

# Validate required fields
cat tickets/index.json | jq '.tickets[] | select(.id == null or .state == null)'

# Check for duplicate IDs
cat tickets/index.json | jq -r '.tickets[].id' | sort | uniq -d
```

**Key Actions:**

- Verify JSON is well-formed
- Ensure all tickets have required fields
- Detect duplicate ticket IDs
- Report validation errors

### 3. Bidirectional Synchronization

**JSON → Markdown (Canonical Fields)**

These fields in JSON always overwrite Markdown:

- `id` - Ticket identifier
- `children` - Child ticket references
- `dependencies` - Blocking dependencies
- `git.commits` - Commit history
- `git.branch` - Associated branch
- `created` - Creation timestamp
- `updated` - Last update timestamp

**Markdown → JSON (User-Editable Fields)**

These fields in Markdown can update JSON:

- `state` - UNPROCESSED/IN_PROGRESS/DEFERRED/COMPLETED
- `priority` - P0/P1/P2
- `title` - Ticket title
- `description` - Work description
- `notes` - User-added context

**Sync Algorithm:**

```bash
# For each ticket in index.json:
# 1. Read corresponding tickets/[ID].md
# 2. Parse user-editable fields from markdown
# 3. Update JSON if markdown values differ
# 4. Regenerate markdown from JSON for canonical fields
# 5. Write updated files
```

### 4. Conflict Detection and Resolution

**Conflict Types:**

1. **Field Conflicts**: JSON and Markdown disagree on same field
2. **Structural Conflicts**: Dependency chains broken
3. **State Conflicts**: Invalid state transitions

**Resolution Rules:**

```markdown
| Field | JSON Value | MD Value | Winner | Reason |
|-------|------------|----------|--------|--------|
| id | AUTH-001 | AUTH-002 | JSON | Immutable |
| state | IN_PROGRESS | COMPLETED | MD | User override |
| dependencies | [DB-001] | [DB-002] | JSON | System managed |
| commits | [abc123] | [def456] | JSON | Git is source |
| priority | P0 | P1 | MD | User preference |
| notes | "" | "Added fix" | MD | User context |
```

**Action on Conflict:**

- Log conflict in sync report
- Apply resolution rule
- Update both JSON and Markdown
- Preserve conflict history in git commit message

### 5. Update Ticket Files

```bash
# Update index.json with reconciled data
cat > tickets/index.json <<EOF
{
  "version": "1.0",
  "generated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "tickets": [...]
}
EOF

# Regenerate markdown files from JSON
for ticket in $(jq -r '.tickets[].id' tickets/index.json); do
  cat > tickets/${ticket}.md <<EOF
# ${ticket}: [title]
...
EOF
done
```

**Key Actions:**

- Write updated `index.json` with ISO8601 timestamp
- Regenerate all markdown files for consistency
- Preserve user-added notes sections
- Maintain git-friendly formatting

### 6. Commit to Git

```bash
# Stage ticket changes
git add tickets/

# Create descriptive commit message
git commit -m "$(cat <<'EOF'
chore(tickets): sync ticket updates

Updated tickets:
- AUTH-001: state change IN_PROGRESS → COMPLETED
- DB-002: priority change P1 → P0
- UI-003: added user notes

Conflicts resolved: 2
- AUTH-001: precedence given to user state override
- DB-002: preserved JSON-managed dependencies

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Push to configured branch
git push origin tickets-sync
```

**Commit Message Template:**

```text
chore(tickets): sync ticket updates

Updated tickets:
- [ID]: [summary of change]
- [ID]: [summary of change]

Conflicts resolved: [N]
- [ID]: [resolution description]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 7. Generate Sync Report

```bash
tee .docs/SYNC_REPORT.md
```

**Report Template:**

```markdown
# Ticket Sync Report

**Generated:** [timestamp]
**Branch:** tickets-sync
**Commit:** [sha]

## Summary

- **Total Tickets:** N
- **Updated:** X
- **Conflicts Resolved:** Y
- **Validation Errors:** Z

## Changes

### State Changes
- AUTH-001: IN_PROGRESS → COMPLETED
- DB-002: UNPROCESSED → IN_PROGRESS

### Priority Changes
- UI-003: P1 → P0

### User-Added Notes
- AUTH-001: "Fixed edge case with empty tokens"
- DB-002: "Migration needs manual review"

## Conflicts Resolved

### AUTH-001: State Conflict
- **JSON:** IN_PROGRESS
- **Markdown:** COMPLETED
- **Resolution:** Markdown (user override)
- **Rationale:** User marked work complete, tests passing

### DB-002: Dependency Conflict
- **JSON:** [DB-001]
- **Markdown:** [DB-003]
- **Resolution:** JSON (system managed)
- **Rationale:** Dependencies managed by /plan command

## Validation Warnings

- UI-005: Dependency DB-999 does not exist
- AUTH-007: Invalid state transition COMPLETED → UNPROCESSED

## Git Status

**Branch:** tickets-sync
**Commit:** abc123def456
**Pushed:** Yes
**Files Changed:** 5

## Next Steps

1. Review conflicts resolved above
2. Fix validation warnings if needed
3. Merge tickets-sync branch if approved
4. Run `/implement` to process updated tickets
```

### 8. Branch Strategy

**Option A: Dedicated Sync Branch**

```bash
# Create/switch to tickets-sync branch
git checkout -b tickets-sync 2>/dev/null || git checkout tickets-sync

# Commit changes
git commit -m "chore(tickets): sync updates"

# Push to remote
git push -u origin tickets-sync

# Optionally create PR for review
gh pr create --title "Ticket Sync Updates" --body "Automated ticket synchronization"
```

**Option B: Direct to Main**

```bash
# Commit directly to current branch
git add tickets/
git commit -m "chore(tickets): sync updates"
git push
```

**Configuration:**
User can set preference in `config.toml`:

```toml
[tickets]
sync_branch = "tickets-sync"  # or "main" for direct commits
auto_pr = true  # create PR automatically
```

## Integration Points

**Inputs:**

- `tickets/index.json` - Canonical ticket data (AI managed)
- `tickets/*.md` - Human-readable tickets (user editable)
- Git repository state (branches, remote status)
- User configuration for sync strategy

**Outputs:**

- Updated `tickets/index.json` with reconciled data
- Regenerated `tickets/*.md` files
- Git commit with descriptive message
- `.docs/SYNC_REPORT.md` with sync details
- Pushed commits to GitHub (tickets-sync or main branch)

**Workflow Position:**

- **After**: `/implement`, `/commit`, `/progress`, `/migrate`
- **Before**: Manual review, PR merge, next `/stream` iteration
- **Frequency**: After each `/commit`, or as part of `/stream` loop

## Sync Scenarios

### Scenario 1: AI Updates Ticket After Implementation

```bash
# /implement completes ticket AUTH-001
# Updates: state → COMPLETED, commits → [abc123], branch → merged

# /sync runs:
# 1. JSON updated by /implement
# 2. Markdown regenerated from JSON
# 3. Git commit created
# 4. Pushed to GitHub

# Result: GitHub reflects latest state
```

### Scenario 2: Human Edits Markdown Ticket

```bash
# User manually edits tickets/AUTH-002.md:
# - Changes priority: P1 → P0
# - Adds notes: "Blocking production release"

# /sync runs:
# 1. Detects markdown changes
# 2. Updates JSON with priority + notes
# 3. Regenerates markdown to ensure consistency
# 4. Commits changes
# 5. Pushes to GitHub

# Result: User edits preserved and synced
```

### Scenario 3: Concurrent Updates (Conflict)

```bash
# AI updates AUTH-001 state → COMPLETED (in JSON)
# User updates AUTH-001 state → DEFERRED (in markdown)

# /sync runs:
# 1. Detects conflict on 'state' field
# 2. Applies resolution rule: Markdown wins (user override)
# 3. Updates JSON: COMPLETED → DEFERRED
# 4. Logs conflict in sync report
# 5. Commits with conflict details

# Result: User preference honored, conflict tracked
```

## Error Scenarios and Recovery

### Invalid JSON Structure

```bash
cat tickets/index.json | jq empty 2>&1
```

**Action**: Report parse error, refuse to sync, preserve backup

### Missing Ticket Files

```bash
# JSON references AUTH-001 but tickets/AUTH-001.md missing
find tickets -name "AUTH-001.md"
```

**Action**: Regenerate missing markdown from JSON

### Broken Dependencies

```bash
# Ticket references non-existent dependency
jq '.tickets[] | select(.dependencies[] | IN("INVALID-001"))' tickets/index.json
```

**Action**: Warn in sync report, do not block sync

### Git Push Failures

```bash
git push 2>&1 | grep -q "rejected"
```

**Action**: Pull and retry, or warn user to resolve manually

### Merge Conflicts

```bash
git status | grep -q "both modified"
```

**Action**: Guide user through manual resolution

## Success Criteria

- [ ] JSON and Markdown fully synchronized
- [ ] User edits preserved (state, priority, notes)
- [ ] System fields enforced (id, dependencies, commits)
- [ ] Conflicts detected and resolved per rules
- [ ] Validation errors reported clearly
- [ ] Git commit created with descriptive message
- [ ] Changes pushed to GitHub successfully
- [ ] Sync report generated with full details
- [ ] No data loss during sync process

## Usage Examples

```bash
# Sync after implementing tickets
/implement
/commit
/sync

# Sync after manual markdown edits
# (user edited tickets/AUTH-001.md)
/sync

# Sync as part of automated loop
/stream  # includes /sync internally

# Force sync with validation check
/sync
cat .docs/SYNC_REPORT.md
```

## Notes

- **JSON is canonical** for system-managed fields
- **Markdown is editable** for user-managed fields
- Always run after `/commit` to keep GitHub updated
- Safe to run multiple times (idempotent)
- Creates audit trail in git history
- Supports both direct-to-main and PR workflows
