---
allowed-tools: Bash(ls:*), Bash(find:*), Bash(mkdir:*), Bash(cat:*), Bash(tee:*), Bash(node:*), WebSearch, SequentialThinking, Read
description: Generate structured specifications from docs folder into docs/specs/<component>/spec.md files.
argument-hint: '[component-name] (optional - auto-detect if not specified) [--github]'
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

## 5. Code Pattern Requirements
- Naming conventions (from repository patterns)
- Type safety requirements
- Testing approach and framework
- Error handling patterns
- Architecture patterns (if applicable)

## 6. Acceptance Criteria
- Definition of done
- Validation approach

## 7. Dependencies
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

2. **Load Repository Patterns**:

   ```bash
   # Load extracted patterns for code standards
   PATTERNS_FILE=".sage/agent/examples/repository-patterns.ts"

   if [ -f "$PATTERNS_FILE" ]; then
       echo "🔬 Loading repository patterns..."

       # Extract key pattern information using progressive loader
       if [ -d "servers/sage-context-optimizer/dist" ]; then
           # Use progressive loader to get context-aware patterns
           COMPONENT_FILE="src/${COMPONENT_NAME}/index.ts"  # Typical entry point

           cd servers/sage-context-optimizer
           PATTERNS_JSON=$(node -e "
               import { ProgressiveLoader } from './dist/progressive-loader.js';
               const loader = new ProgressiveLoader({ patternsDir: '../../.sage/agent/examples' });
               loader.loadForContext('${COMPONENT_FILE}', 'extended')
                   .then(result => console.log(JSON.stringify(result.patterns, null, 2)))
                   .catch(() => console.log('{}'));
           " 2>/dev/null)
           cd ../..

           echo "  ✓ Patterns loaded with context: ${COMPONENT_FILE}"
       else
           # Fallback: read patterns directly
           echo "  ✓ Using static patterns from $PATTERNS_FILE"
       fi

       # Generate pattern summary for spec generation using formatter
       if [ -f "servers/sage-context-optimizer/dist/format-patterns-for-spec.js" ]; then
           PATTERN_SUMMARY=$(node servers/sage-context-optimizer/dist/format-patterns-for-spec.js \
               --dir .sage/agent/examples --format markdown 2>/dev/null)

           if [ -n "$PATTERN_SUMMARY" ]; then
               echo "  ✓ Generated Code Pattern Requirements section"
           else
               echo "  ⚠️  Failed to format patterns, using defaults"
               PATTERN_SUMMARY=""
           fi
       else
           echo "  ⚠️  Pattern formatter not built, using raw patterns"
           PATTERN_SUMMARY=""
       fi
   else
       echo "⚠️  No repository patterns found. Run /sage.init first for pattern-aware specs."
       echo "    Proceeding without pattern requirements..."
       PATTERN_SUMMARY=""
   fi
   ```

3. **Prioritized Analysis**:

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

   **Phase 4: Apply Repository Patterns**
   - Read `.sage/agent/examples/repository-patterns.ts` if available
   - Extract naming conventions (functions, classes, variables)
   - Identify typing requirements (type hints, union syntax)
   - Determine testing framework and patterns
   - Note architecture patterns (module system, exports)
   - Include confidence scores to prioritize patterns

   **Component Identification:**
   - Group requirements by logical component boundaries
   - Use research recommendations for component structure
   - Consider feature dependencies
   - Identify cross-component integrations

4. **Research Supplementation**:

   Use `WebSearch` for relevant standards only if:
   - No research output exists for the feature
   - Additional industry standards needed
   - Clarification on specific requirements

5. **Specification Generation with Traceability**:

   ```bash
   mkdir -p docs/specs/<component>
   tee docs/specs/<component>/spec.md
   ```

   **Include Code Pattern Requirements in Section 5:**

   When generating the specification, populate the "Code Pattern Requirements" section with actual values from the loaded patterns:

   ```markdown
   ## 5. Code Pattern Requirements

   ### Naming Conventions
   - **Functions**: camelCase (90% consistent, 84% confidence)
   - **Classes**: PascalCase (100% consistent)
   - **Variables**: camelCase (95% consistent)
   - **Constants**: SCREAMING_SNAKE_CASE

   ### Type Safety Requirements
   - **Type hint coverage**: ≥84% (matches repository baseline)
   - **Union syntax**: Use `|` operator (not `Union[]`)
   - **Generics**: Use builtin generics (`list[T]`, not `List[T]`)
   - **Null handling**: Explicit (`T | None`)

   ### Testing Approach
   - **Framework**: Vitest (detected from repository)
   - **Coverage requirement**: ≥80% (baseline from existing tests)
   - **Mocking strategy**: vi.mock() for dependencies
   - **Test patterns**: describe/it/expect structure

   ### Error Handling
   - **Strategy**: Explicit throws (no silent failures)
   - **Custom exceptions**: Required for domain errors
   - **Validation**: Input validation at boundaries

   ### Architecture Patterns
   - **Module system**: ESM (export/import)
   - **Export style**: Named exports preferred
   - **Import style**: Absolute paths with .js extension
   ```

6. **Generate Epic Tickets**:

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

7. **Validate**: Review structure with `find docs/specs -type f` and `find tickets -type f`
8. **Summary**: List created specs, epic tickets, pattern requirements included, and highlight cross-dependencies

   ```bash
   echo "✅ Specification Generation Complete"
   echo ""
   echo "📋 Generated Specifications:"
   find docs/specs -name "spec.md" -type f | while read spec; do
       echo "  • $spec"
   done
   echo ""
   echo "🎫 Epic Tickets Created:"
   find .sage/tickets -name "*.md" -type f | while read ticket; do
       echo "  • $ticket"
   done
   echo ""
   if [ -f ".sage/agent/examples/repository-patterns.ts" ]; then
       echo "🔬 Pattern Requirements:"
       echo "  ✓ Code pattern requirements included in all specs"
       echo "  ✓ Naming conventions enforced"
       echo "  ✓ Testing framework specified"
       echo "  ✓ Type safety requirements defined"
   fi
   ```

## Component Identification

- Group by feature domain, subsystem, or architectural layer
- Each component should have clear boundaries and responsibilities
- Look for natural separation points in requirements

## Output Quality

- Requirements must be testable and measurable
- Dependencies explicitly mapped
- Source traceability maintained (cite doc files)
- Use clear, concise language
- **Code Pattern Requirements section populated with actual repository patterns**
- Naming conventions reflect extracted patterns with consistency percentages
- Testing requirements match detected framework (Vitest, pytest, etc.)
- Type safety requirements based on repository baseline coverage
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
