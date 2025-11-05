---
allowed-tools: Bash(git:*), Bash(cat:*), Bash(grep:*), Bash(jq:*), Bash(gh:*), Read, Write, Edit, SequentialThinking
description: Synchronize ticket system (JSON + Markdown) with GitHub repository, ensuring AI and human views stay consistent.
argument-hint: '[ticket-id] [--github] [--pull] [--create-all] (optional flags for GitHub Issues sync)'
---

## Role

Synchronization engineer maintaining consistency between ticket system and GitHub repository.

## Purpose

Keep ticketing system synchronized across multiple representations:

- **Bidirectional Sync**: Reconcile JSON (AI truth) ↔ Markdown (human view)
- **GitHub Push**: Commit and push ticket updates to repository
- **GitHub Issues Sync** (NEW v2.3.0): Bidirectional sync with GitHub Issues (optional --github flag)
- **Conflict Resolution**: Handle divergent edits safely
- **Audit Trail**: Maintain change history in git

## GitHub Integration (NEW v2.3.0)

When `--github` flag is provided:
- Creates GitHub Issues for tickets missing `github.issueNumber`
- Updates existing GitHub Issues when tickets are modified
- Syncs state: COMPLETED → closed, others → open
- Maps priority → labels, type → labels
- Optionally pulls GitHub updates to local tickets (`--pull` flag)

## Execution

### 1. Load Current State

```bash
# Read ticket index
cat .sage/.sage/tickets/index.json

# List all ticket markdown files
find tickets -type f -name "*.md" | sort

# Check git status
git status .sage/tickets/
```

**Key Actions:**

- Parse `.sage/.sage/tickets/index.json` as canonical source
- Read all `.sage/tickets/*.md` files
- Identify modified files in git

### 2. Validate JSON Integrity

```bash
# Check JSON syntax
cat .sage/.sage/tickets/index.json | jq empty

# Validate required fields
cat .sage/.sage/tickets/index.json | jq '.tickets[] | select(.id == null or .state == null)'

# Check for duplicate IDs
cat .sage/.sage/tickets/index.json | jq -r '.tickets[].id' | sort | uniq -d
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
# 1. Read corresponding .sage/tickets/[ID].md
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
cat > .sage/.sage/tickets/index.json <<EOF
{
  "version": "1.0",
  "generated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "tickets": [...]
}
EOF

# Regenerate markdown files from JSON
for ticket in $(jq -r '.tickets[].id' .sage/.sage/tickets/index.json); do
  cat > .sage/tickets/${ticket}.md <<EOF
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

### 6. GitHub Issues Sync (NEW v2.3.0 - Optional)

**Only runs when `--github` flag is provided**

```bash
# ========================================
# Check for --github flag
# ========================================
GITHUB_SYNC=false
GITHUB_PULL=false
CREATE_ALL=false
SPECIFIC_TICKET=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --github)
      GITHUB_SYNC=true
      shift
      ;;
    --pull)
      GITHUB_PULL=true
      shift
      ;;
    --create-all)
      CREATE_ALL=true
      shift
      ;;
    *)
      SPECIFIC_TICKET="$1"
      shift
      ;;
  esac
done

if [ "$GITHUB_SYNC" = "false" ]; then
  echo "ℹ️  Skipping GitHub sync (use --github flag to enable)"
  # Skip to Step 7 (Commit to Git)
else
  echo "🔄 GitHub Issues Sync..."
  echo ""

  # ========================================
  # Verify GitHub CLI
  # ========================================
  if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found"
    echo ""
    echo "Install gh CLI:"
    echo "  macOS: brew install gh"
    echo "  Linux: sudo apt install gh"
    echo ""
    echo "Then authenticate:"
    echo "  gh auth login"
    exit 1
  fi

  # Verify authentication
  if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI not authenticated"
    echo "Run: gh auth login"
    exit 1
  fi

  # Get repository info
  REPO_OWNER=$(gh repo view --json owner -q .owner.login)
  REPO_NAME=$(gh repo view --json name -q .name)
  REPO_URL=$(gh repo view --json url -q .url)

  echo "✓ GitHub CLI authenticated"
  echo "  Repository: $REPO_OWNER/$REPO_NAME"
  echo ""

  # ========================================
  # Filter Tickets to Sync
  # ========================================
  if [ -n "$SPECIFIC_TICKET" ]; then
    # Sync specific ticket
    TICKETS_TO_SYNC=$(cat .sage/tickets/index.json | jq -r ".tickets[] | select(.id == \"$SPECIFIC_TICKET\") | .id")
    echo "Syncing specific ticket: $SPECIFIC_TICKET"
  elif [ "$CREATE_ALL" = "true" ]; then
    # Sync all tickets (create GitHub Issues for those without)
    TICKETS_TO_SYNC=$(cat .sage/tickets/index.json | jq -r '.tickets[].id')
    echo "Syncing all tickets..."
  else
    # Sync only modified tickets (git diff)
    TICKETS_TO_SYNC=$(git diff --name-only .sage/tickets/*.md | sed 's|.sage/tickets/||' | sed 's|.md||' | sort | uniq)
    echo "Syncing modified tickets..."
  fi

  SYNC_COUNT=0
  CREATED_COUNT=0
  UPDATED_COUNT=0

  # ========================================
  # Sync Each Ticket
  # ========================================
  for TICKET_ID in $TICKETS_TO_SYNC; do
    echo "Processing $TICKET_ID..."

    # Load ticket data
    TICKET_JSON=$(cat .sage/tickets/index.json | jq ".tickets[] | select(.id == \"$TICKET_ID\")")

    TITLE=$(echo $TICKET_JSON | jq -r '.title')
    TYPE=$(echo $TICKET_JSON | jq -r '.type')
    PRIORITY=$(echo $TICKET_JSON | jq -r '.priority')
    STATE=$(echo $TICKET_JSON | jq -r '.state')
    DESCRIPTION=$(echo $TICKET_JSON | jq -r '.description // ""')
    ACCEPTANCE_CRITERIA=$(echo $TICKET_JSON | jq -r '.acceptanceCriteria[]?' | sed 's/^/- [ ] /')

    # Check if GitHub issue already exists
    ISSUE_NUMBER=$(echo $TICKET_JSON | jq -r '.github.issueNumber // empty')

    # ========================================
    # Create or Update GitHub Issue
    # ========================================
    if [ -z "$ISSUE_NUMBER" ]; then
      echo "  Creating GitHub Issue..."

      # Map priority to label
      PRIORITY_LABEL=$(case $PRIORITY in
        P0) echo "critical" ;;
        P1) echo "high" ;;
        P2) echo "medium" ;;
        *) echo "medium" ;;
      esac)

      # Map type to label
      TYPE_LABEL=$(case $TYPE in
        epic) echo "epic" ;;
        story) echo "story" ;;
        bugfix) echo "bug" ;;
        implementation) echo "enhancement" ;;
        *) echo "enhancement" ;;
      esac)

      # Build issue body
      ISSUE_BODY="**Type:** $TYPE
**Priority:** $PRIORITY
**State:** $STATE

## Description
$DESCRIPTION

## Acceptance Criteria
$ACCEPTANCE_CRITERIA

---
*Generated by sage-dev v2.3.0*
*Local Ticket ID: $TICKET_ID*"

      # Create GitHub Issue
      ISSUE_URL=$(gh issue create \
        --title "[$TICKET_ID] $TITLE" \
        --body "$ISSUE_BODY" \
        --label "$TYPE_LABEL" \
        --label "$PRIORITY_LABEL" \
        --label "sage-dev" \
        --json url -q .url)

      # Extract issue number from URL
      ISSUE_NUMBER=$(echo $ISSUE_URL | grep -o '[0-9]*$')

      echo "  ✓ Created GitHub Issue #$ISSUE_NUMBER"
      echo "    URL: $ISSUE_URL"

      # Update ticket with GitHub metadata
      cat .sage/tickets/index.json | jq "
        .tickets |= map(
          if .id == \"$TICKET_ID\" then
            .github = {
              issueNumber: $ISSUE_NUMBER,
              issueUrl: \"$ISSUE_URL\",
              labels: [\"$TYPE_LABEL\", \"$PRIORITY_LABEL\", \"sage-dev\"],
              milestone: null,
              assignees: []
            } |
            .updated = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
          else . end
        )
      " > .sage/tickets/index.json.tmp && mv .sage/tickets/index.json.tmp .sage/tickets/index.json

      CREATED_COUNT=$((CREATED_COUNT + 1))

    else
      echo "  Updating GitHub Issue #$ISSUE_NUMBER..."

      # Map state to GitHub issue state
      if [ "$STATE" = "COMPLETED" ]; then
        # Close issue if completed
        gh issue close $ISSUE_NUMBER --comment "Completed via sage-dev"
        echo "  ✓ Closed GitHub Issue #$ISSUE_NUMBER"
      else
        # Reopen issue if not completed
        gh issue reopen $ISSUE_NUMBER --comment "Reopened via sage-dev" 2>/dev/null || true
        echo "  ✓ Updated GitHub Issue #$ISSUE_NUMBER"
      fi

      UPDATED_COUNT=$((UPDATED_COUNT + 1))
    fi

    SYNC_COUNT=$((SYNC_COUNT + 1))
    echo ""
  done

  echo "═══════════════════════════════════════"
  echo "    GitHub Sync Complete"
  echo "═══════════════════════════════════════"
  echo ""
  echo "Summary:"
  echo "  Total synced: $SYNC_COUNT"
  echo "  Created: $CREATED_COUNT"
  echo "  Updated: $UPDATED_COUNT"
  echo ""

  # ========================================
  # Pull from GitHub (Optional)
  # ========================================
  if [ "$GITHUB_PULL" = "true" ]; then
    echo "📥 Pulling updates from GitHub..."
    echo ""

    # Get all GitHub Issues with sage-dev label
    GITHUB_ISSUES=$(gh issue list --label "sage-dev" --json number,title,state,labels --limit 1000)

    # For each issue, update local ticket if needed
    echo "$GITHUB_ISSUES" | jq -r '.[] | @json' | while read -r ISSUE_JSON; do
      ISSUE_NUMBER=$(echo $ISSUE_JSON | jq -r '.number')
      ISSUE_STATE=$(echo $ISSUE_JSON | jq -r '.state')

      # Find matching local ticket
      TICKET_ID=$(cat .sage/tickets/index.json | jq -r ".tickets[] | select(.github.issueNumber == $ISSUE_NUMBER) | .id")

      if [ -n "$TICKET_ID" ]; then
        echo "  Syncing Issue #$ISSUE_NUMBER → $TICKET_ID..."

        # Map GitHub state to ticket state
        NEW_STATE="UNPROCESSED"
        if [ "$ISSUE_STATE" = "CLOSED" ]; then
          NEW_STATE="COMPLETED"
        fi

        # Update ticket state
        cat .sage/tickets/index.json | jq "
          .tickets |= map(
            if .id == \"$TICKET_ID\" then
              .state = \"$NEW_STATE\" |
              .updated = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
            else . end
          )
        " > .sage/tickets/index.json.tmp && mv .sage/tickets/index.json.tmp .sage/tickets/index.json

        echo "    Updated state: $NEW_STATE"
      fi
    done

    echo ""
    echo "✓ Pull from GitHub complete"
    echo ""
  fi
fi
```

**Key Actions:**

- **Verify `gh` CLI**: Check installation and authentication
- **Filter tickets**: Sync specific, all, or modified tickets
- **Create Issues**: For tickets without `github.issueNumber`
- **Update Issues**: Sync state changes (close/reopen)
- **Map metadata**: Priority → labels, type → labels, state → issue state
- **Pull updates** (optional): Sync GitHub state to local tickets
- **Update index.json**: Record GitHub metadata (issueNumber, issueUrl, labels)

**GitHub Issue Creation:**
- Title format: `[TICKET-ID] Title`
- Body includes: type, priority, state, description, acceptance criteria
- Labels: priority (critical/high/medium), type (epic/story/bug), "sage-dev"
- Ticket ID included in footer for traceability

**State Mapping:**
- COMPLETED → close issue
- IN_PROGRESS → reopen issue (if closed)
- UNPROCESSED → reopen issue (if closed)
- DEFERRED → keep open with "deferred" label

**Benefits:**
- Team visibility in GitHub UI
- GitHub Projects integration
- Issue boards and kanban views
- Notifications and @mentions
- Preserves local-first workflow

### 7. Commit to Git

```bash
# Stage ticket changes
git add .sage/tickets/

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
EOF
)"

# Push to configured branch
git push origin tickets-sync
```

**Commit Message Template:**

```plaintext
chore(tickets): sync ticket updates

Updated tickets:
- [ID]: [summary of change]
- [ID]: [summary of change]

Conflicts resolved: [N]
- [ID]: [resolution description]
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
git add .sage/tickets/
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

- `.sage/.sage/tickets/index.json` - Canonical ticket data (AI managed)
- `.sage/tickets/*.md` - Human-readable tickets (user editable)
- Git repository state (branches, remote status)
- User configuration for sync strategy

**Outputs:**

- Updated `.sage/.sage/tickets/index.json` with reconciled data
- Regenerated `.sage/tickets/*.md` files
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
# User manually edits .sage/tickets/AUTH-002.md:
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
cat .sage/.sage/tickets/index.json | jq empty 2>&1
```

**Action**: Report parse error, refuse to sync, preserve backup

### Missing Ticket Files

```bash
# JSON references AUTH-001 but .sage/tickets/AUTH-001.md missing
find tickets -name "AUTH-001.md"
```

**Action**: Regenerate missing markdown from JSON

### Broken Dependencies

```bash
# Ticket references non-existent dependency
jq '.tickets[] | select(.dependencies[] | IN("INVALID-001"))' .sage/.sage/tickets/index.json
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
# (user edited .sage/tickets/AUTH-001.md)
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
