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

1. **Discover**: `find docs -type f -name "*.md" -o -name "*.txt" | grep -v specs | sort`
2. **Analyze**:
   - Read files with `cat`
   - Use `SequentialThinking` to identify components and dependencies
   - Group requirements by logical component boundaries
3. **Research**: `WebSearch` for relevant standards (if needed)
4. **Generate**:

   ```bash
   mkdir -p docs/specs/<component>
   tee docs/specs/<component>/spec.md
   ```

5. **Validate**: Review structure with `find docs/specs -type f`
6. **Summary**: List created specs and highlight cross-dependencies

## Component Identification

- Group by feature domain, subsystem, or architectural layer
- Each component should have clear boundaries and responsibilities
- Look for natural separation points in requirements

## Output Quality

- Requirements must be testable and measurable
- Dependencies explicitly mapped
- Source traceability maintained (cite doc files)
- Use clear, concise language
