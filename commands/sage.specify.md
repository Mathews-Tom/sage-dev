---
allowed-tools: Bash(ls:*), Bash(find:*), Bash(mkdir:*), Bash(cat:*), Bash(tee:*), WebSearch, SequentialThinking
description: Generate structured specifications from docs folder into docs/specs/<component>/spec.md files.
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

5. **Generate Epic Tickets**:

   ```bash
   # Create tickets directory if not exists
   mkdir -p .sage/tickets

   # Load or initialize index.json
   test -f .sage/tickets/index.json || echo '{"version":"1.0","tickets":[]}' > .sage/tickets/index.json

   # For each component spec, create epic ticket
   COMPONENT_ID="AUTH"  # e.g., AUTH, DB, UI, API
   TICKET_NUMBER="001"
   TICKET_ID="${COMPONENT_ID}-${TICKET_NUMBER}"

   # Generate ticket markdown
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

   ## Dependencies
   - None (or list component dependencies)

   ## Context
   **Specs:** docs/specs/${COMPONENT}/spec.md

   ## Progress
   **Notes:** Generated from /specify command
   EOF

   # Update index.json
   # Add ticket entry with metadata
   ```

6. **Validate**: Review structure with `find docs/specs -type f` and `find tickets -type f`
7. **Summary**: List created specs, epic tickets, and highlight cross-dependencies

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

**Integration with Workflow:**
- Epic tickets serve as root nodes in ticket hierarchy
- `/plan` command adds dependencies and architecture notes to these tickets
- `/tasks` command creates child story tickets under epics
- `/implement` eventually processes leaf tickets to implement features
