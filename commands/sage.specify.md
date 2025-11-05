---
allowed-tools: Bash(ls:*), Bash(find:*), Bash(mkdir:*), Bash(cat:*), Bash(tee:*), Bash(gh:*), Bash(jq:*), WebSearch, SequentialThinking
description: Generate structured specifications from docs folder into docs/specs/<component>/spec.md files.
argument-hint: '[--github] (optional, creates GitHub Issues for epic tickets)'
---

## Role

Requirements analyst creating actionable software specifications.

## Template

```markdown
# [Component Name] Specification

## 1. Overview
- Purpose and business value
- Success metrics
- Target users

## 2. Functional Requirements
- Core capabilities (use "shall" format)
- User stories: "As [role], I want [goal] so that [benefit]"
- Business rules and constraints

## 3. Non-Functional Requirements
- Performance targets
- Security requirements
- Scalability considerations

## 4. Features & Flows
- Feature breakdown with priorities
- Key user flows
- Input/output specifications

## 5. Acceptance Criteria
- Definition of done
- Validation approach

## 6. Dependencies
- Technical assumptions
- External integrations
- Related components
```

## Execution

1. **Priority-Based Discovery**:

   ```bash
   # Priority 1: Research outputs (from /sage.intel)
   RESEARCH_DOCS=$(find docs/research -type f -name "*.md" 2>/dev/null | sort)

   # Priority 2: Feature requests (from /sage.init-feature)
   FEATURE_DOCS=$(find docs/features -type f -name "*.md" 2>/dev/null | sort)

   # Priority 3: Other documentation
   OTHER_DOCS=$(find docs -type f \( -name "*.md" -o -name "*.txt" \) \
     ! -path "docs/specs/*" \
     ! -path "docs/research/*" \
     ! -path "docs/features/*" 2>/dev/null | sort)

   echo "📚 Document Discovery"
   echo "  Research outputs: $(echo "$RESEARCH_DOCS" | wc -l) files"
   echo "  Feature requests: $(echo "$FEATURE_DOCS" | wc -l) files"
   echo "  Other documentation: $(echo "$OTHER_DOCS" | wc -l) files"
   echo ""
   ```

2. **Prioritized Analysis**:

   Use `SequentialThinking` with priority-based reading:

   **Phase 1: Process Research Outputs** (Highest Priority)
   - Read all `docs/research/*.md` files
   - Extract technical recommendations
   - Identify architecture patterns
   - Note security and performance requirements
   - Capture technology stack decisions
   - Link back to source feature requests

   **Phase 2: Process Feature Requests** (High Priority)
   - Read all `docs/features/*.md` files
   - Extract user stories and use cases
   - Identify functional requirements
   - Note technical considerations
   - Capture success criteria
   - Link to related research if available

   **Phase 3: Process Other Documentation** (Standard Priority)
   - Read remaining documentation
   - Extract additional requirements
   - Identify missing specifications
   - Supplement research-driven specs

   **Component Identification:**
   - Group requirements by logical component boundaries
   - Use research recommendations for component structure
   - Consider feature dependencies
   - Identify cross-component integrations

3. **Research Supplementation**:

   Use `WebSearch` for relevant standards only if:
   - No research output exists for the feature
   - Additional industry standards needed
   - Clarification on specific requirements

4. **Specification Generation with Traceability**:

   ```bash
   mkdir -p docs/specs/<component>
   tee docs/specs/<component>/spec.md
   ```

5. **Target File Detection** (NEW v2.3.0):

   Use `SequentialThinking` to analyze the spec and detect target files:

   **Phase 1: Explicit Path References**
   - Scan spec for file path patterns: `src/path/to/file.py`, `/api/endpoint`
   - Extract all mentioned file paths
   - Categorize by action: modify (existing files) vs create (new files)

   **Phase 2: Component/Module Pattern Detection**
   - "auth module" → `src/auth/*.py` or `lib/auth/*.js`
   - "user service" → `src/services/user.py` or `services/user.ts`
   - "API endpoint" → route definition files (e.g., `routes/api.py`, `app/routes.ts`)
   - "database model" → model files (e.g., `models/user.py`, `db/schema.sql`)

   **Phase 3: Test File Inference**
   - For each target file, infer corresponding test file
   - Naming conventions:
     * Python: `test_*.py` (modify `src/auth/login.py` → `tests/test_auth.py`)
     * JavaScript/TypeScript: `*.test.ts`, `*.spec.ts`
     * Ruby: `*_spec.rb`
   - Check if test files exist; mark as "create" if not

   **Phase 4: Configuration File Inference**
   - API changes → check `routes.py`, `urls.py`, `router.ts`, `api.config.js`
   - Database changes → check `models.py`, `schema.sql`, `migrations/`
   - New features → check main config files, environment files

   **Phase 5: Line Range Estimation** (Optional)
   - For "modify" actions, if spec mentions specific functionality
   - Search target files for related code (e.g., function names, class names)
   - Estimate line range based on current implementation
   - Leave empty if unable to determine

   **Output Format**:
   ```json
   [
     {
       "path": "src/auth/login.py",
       "action": "modify",
       "lineRange": "23-45",
       "purpose": "Add rate limiting decorator"
     },
     {
       "path": "src/middleware/rate_limit.py",
       "action": "create",
       "purpose": "Implement rate limiter"
     },
     {
       "path": "tests/test_auth.py",
       "action": "modify",
       "lineRange": "100-120",
       "purpose": "Add rate limit tests"
     }
   ]
   ```

   **Validation**:
   - Verify "modify" paths exist in codebase
   - Mark as "create" if path doesn't exist
   - Use `.sage/context.md` for directory structure hints if available

6. **Generate Epic Tickets with Target Files**:

   ```bash
   # Create tickets directory if not exists
   mkdir -p .sage/tickets

   # Load or initialize index.json
   test -f .sage/tickets/index.json || echo '{"version":"1.0","tickets":[]}' > .sage/tickets/index.json

   # For each component spec, create epic ticket
   COMPONENT_ID="AUTH"  # e.g., AUTH, DB, UI, API
   TICKET_NUMBER="001"
   TICKET_ID="${COMPONENT_ID}-${TICKET_NUMBER}"

   # Generate ticket markdown with target files
   tee .sage/tickets/${TICKET_ID}.md <<EOF
   # ${TICKET_ID}: [Component Name] Implementation

   **State:** UNPROCESSED
   **Priority:** P0
   **Type:** Epic

   ## Description
   [Component overview from spec]

   ## Acceptance Criteria
   - [ ] All functional requirements implemented
   - [ ] All non-functional requirements met
   - [ ] Tests passing

   ## Target Files
   [Auto-detected from spec analysis - Step 5]

   - \`src/path/to/file.py\` (modify, lines X-Y): [Purpose]
   - \`src/path/to/new_file.py\` (create): [Purpose]
   - \`tests/test_file.py\` (modify): [Purpose]

   ## Dependencies
   - None (or list component dependencies)

   ## Context
   **Specs:** docs/specs/${COMPONENT}/spec.md

   ## Progress
   **Notes:** Generated from /specify command
   EOF

   # Update index.json with target files
   # Add ticket entry with metadata including targetFiles array:
   # {
   #   "id": "COMPONENT-001",
   #   "title": "Component Implementation",
   #   "type": "epic",
   #   "state": "UNPROCESSED",
   #   "priority": "P0",
   #   "targetFiles": [
   #     {"path": "src/...", "action": "modify", "lineRange": "X-Y", "purpose": "..."},
   #     {"path": "tests/...", "action": "create", "purpose": "..."}
   #   ],
   #   "docs": {"spec": "docs/specs/component/spec.md"},
   #   ...
   # }
   ```

7. **Create GitHub Issues** (NEW v2.3.0 - Optional):

   **Only runs when `--github` flag is provided**

   ```bash
   # Check for --github flag
   GITHUB_SYNC=false
   if [ "$1" = "--github" ]; then
     GITHUB_SYNC=true
   fi

   if [ "$GITHUB_SYNC" = "true" ]; then
     echo ""
     echo "🔄 Creating GitHub Issues for epic tickets..."
     echo ""

     # Verify gh CLI
     if ! command -v gh &> /dev/null; then
       echo "❌ GitHub CLI (gh) not found. Install with: brew install gh"
       exit 1
     fi

     if ! gh auth status &> /dev/null; then
       echo "❌ GitHub CLI not authenticated. Run: gh auth login"
       exit 1
     fi

     # For each epic ticket created, create GitHub Issue
     for TICKET_ID in $(cat .sage/tickets/index.json | jq -r '.tickets[] | select(.type == "epic") | .id'); do
       echo "Creating GitHub Issue for $TICKET_ID..."

       # Load ticket data
       TICKET_JSON=$(cat .sage/tickets/index.json | jq ".tickets[] | select(.id == \"$TICKET_ID\")")

       TITLE=$(echo $TICKET_JSON | jq -r '.title')
       PRIORITY=$(echo $TICKET_JSON | jq -r '.priority')
       DESCRIPTION=$(echo $TICKET_JSON | jq -r '.description // ""')
       SPEC_PATH=$(echo $TICKET_JSON | jq -r '.docs.spec')

       # Map priority to label
       PRIORITY_LABEL=$(case $PRIORITY in
         P0) echo "critical" ;;
         P1) echo "high" ;;
         P2) echo "medium" ;;
         *) echo "medium" ;;
       esac)

       # Build issue body
       ISSUE_BODY="**Type:** epic
**Priority:** $PRIORITY

## Description
$DESCRIPTION

See specification: \`$SPEC_PATH\`

---
*Generated by sage-dev v2.3.0*
*Local Ticket ID: $TICKET_ID*"

       # Create GitHub Issue
       ISSUE_URL=$(gh issue create \
         --title "[$TICKET_ID] $TITLE" \
         --body "$ISSUE_BODY" \
         --label "epic" \
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
               labels: [\"epic\", \"$PRIORITY_LABEL\", \"sage-dev\"],
               milestone: null,
               assignees: []
             } |
             .updated = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
           else . end
         )
       " > .sage/tickets/index.json.tmp && mv .sage/tickets/index.json.tmp .sage/tickets/index.json

       echo ""
     done

     echo "✓ GitHub Issues created for all epic tickets"
     echo ""
   fi
   ```

   **Key Actions:**
   - Check for `--github` flag
   - Verify `gh` CLI installed and authenticated
   - Create GitHub Issue for each epic ticket
   - Map priority → labels (P0=critical, P1=high, P2=medium)
   - Add "epic" and "sage-dev" labels
   - Update ticket with GitHub metadata (issueNumber, issueUrl)
   - Provide traceability with ticket ID in issue body

8. **Validate**: Review structure with `find docs/specs -type f` and `find .sage/tickets -type f`

9. **Summary**:
   - List created specs with component names
   - Show epic tickets with detected target files count
   - Highlight cross-dependencies
   - If `--github` flag used: show created GitHub Issues with numbers and URLs
   - Note: Target files can be manually edited in ticket markdown or JSON if detection needs refinement

## Component Identification

- Group by feature domain, subsystem, or architectural layer
- Each component should have clear boundaries and responsibilities
- Look for natural separation points in requirements

## Output Quality

- Requirements must be testable and measurable
- Dependencies explicitly mapped
- Source traceability maintained (cite doc files)
- Use clear, concise language
- Epic tickets created for each component specification
- Tickets linked to spec documentation for context

## Ticket Generation

**Epic Ticket Structure:**
- **ID Format**: `[COMPONENT]-001` (e.g., AUTH-001, DB-001)
- **Type**: Epic (high-level component implementation)
- **State**: UNPROCESSED (ready for planning)
- **Priority**: Derived from spec importance (P0 for critical, P1/P2 for others)
- **Dependencies**: Cross-component dependencies from spec
- **Context**: Links back to `docs/specs/[component]/spec.md`
- **Target Files** (NEW v2.3.0): Auto-detected files to create/modify, with actions and purposes

**Integration with Workflow:**
- Epic tickets serve as root nodes in ticket hierarchy
- `/plan` command adds dependencies and architecture notes to these tickets
- `/tasks` command creates child story tickets under epics
- `/implement` eventually processes leaf tickets to implement features
