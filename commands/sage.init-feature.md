---
allowed-tools: Bash(mkdir:*), Bash(cat:*), Bash(tee:*), Bash(ls:*), Bash(test:*), SequentialThinking
description: Create structured feature request document as starting point for development workflow.
argument-hint: '[feature-name] (optional - will prompt if not provided)'
---

## Role

Feature request specialist creating structured initial documentation for new features.

## Purpose

Create comprehensive feature request documents that serve as the foundation for:
- Research and enhancement (`/sage.intel`)
- Specification generation (`/sage.specify`)
- Implementation planning (`/sage.plan`)

## Execution

### Step 1: Parse Feature Name

```bash
# Feature name can be provided as argument or prompted
FEATURE_NAME="$1"

if [ -z "$FEATURE_NAME" ]; then
    echo "Feature name not provided. Let's create one interactively."
    echo ""
    # Will prompt user in Step 2
    INTERACTIVE_MODE=true
else
    # Validate feature name format
    # Must be kebab-case (lowercase with hyphens)
    if [[ ! "$FEATURE_NAME" =~ ^[a-z0-9-]+$ ]]; then
        echo "❌ Invalid feature name: $FEATURE_NAME"
        echo ""
        echo "Feature names must be:"
        echo "  • Lowercase letters and numbers only"
        echo "  • Hyphens to separate words"
        echo "  • Example: user-authentication or payment-integration"
        echo ""
        exit 1
    fi
    INTERACTIVE_MODE=false
fi
```

### Step 2: Interactive Feature Name Prompt (if needed)

```plaintext
═══════════════════════════════════════════════════════════════════
                        CREATE FEATURE REQUEST
═══════════════════════════════════════════════════════════════════

Let's create a structured feature request document.

Feature Name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Enter a short, descriptive name for your feature:
  • Use lowercase letters and hyphens
  • Example: user-authentication, payment-integration, real-time-chat
  • This will be used as the filename

Feature name: _
```

Validate input:
- Must be non-empty
- Must be kebab-case format
- Must not contain spaces or special characters (except hyphens)
- Must not already exist in `docs/features/`

### Step 3: Check Directory Structure

```bash
# Ensure docs/features/ exists
if [ ! -d "docs/features" ]; then
    echo "⚠️  docs/features/ not found"
    echo ""
    echo "Have you run /sage.init to initialize the repository?"
    echo ""
    echo "Creating docs/features/ directory..."
    mkdir -p docs/features
    echo "✓ Created docs/features/"
    echo ""
fi

# Check if feature already exists
FEATURE_FILE="docs/features/${FEATURE_NAME}.md"
if [ -f "$FEATURE_FILE" ]; then
    echo "⚠️  Feature request already exists: $FEATURE_FILE"
    echo ""
    echo "Options:"
    echo "  1. Edit existing file: $FEATURE_FILE"
    echo "  2. Choose different feature name"
    echo "  3. Delete existing and recreate"
    echo ""
    exit 1
fi
```

### Step 4: Interactive Content Gathering

Use **SequentialThinking** to guide interactive prompts:

```plaintext
Feature Description
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide a high-level description of this feature:
  • What problem does it solve?
  • Who will use it?
  • What value does it provide?

Description (press Enter twice when done):
_
```

```plaintext
User Stories & Use Cases
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Describe how users will interact with this feature.
Format: "As a [role], I want [goal] so that [benefit]"

Add user stories (press Enter twice when done):
_
```

```plaintext
Documentation References
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Any relevant documentation, APIs, or libraries to reference?
  • External APIs
  • Library documentation
  • Similar implementations
  • Standards or specifications

References (comma-separated, or press Enter to skip):
_
```

```plaintext
Technical Considerations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Any technical constraints, concerns, or gotchas?
  • Performance requirements
  • Security considerations
  • Compatibility constraints
  • Known challenges

Considerations (press Enter twice when done, or Enter once to skip):
_
```

### Step 5: Suggest Code Examples from Repository

```bash
# Check .sage/agent/examples/ for relevant patterns
echo ""
echo "🔍 Checking repository for relevant code patterns..."

# Look for related patterns based on feature name keywords
# e.g., "authentication" → check for auth* patterns
# e.g., "payment" → check for payment* patterns

if [ -d ".sage/agent/examples" ]; then
    # Search for relevant examples
    EXAMPLES=$(find .sage/agent/examples -type f -name "*.md" | grep -i "[keyword from feature name]" || echo "")

    if [ -n "$EXAMPLES" ]; then
        echo "✓ Found relevant code patterns:"
        echo "$EXAMPLES"
        echo ""
        echo "These will be referenced in the feature document."
    else
        echo "ℹ️  No matching patterns found in .sage/agent/examples/"
        echo "   These can be added later or will be identified by /sage.intel"
    fi
else
    echo "ℹ️  Pattern library not initialized"
    echo "   Run /sage.init to extract code patterns from your codebase"
fi
echo ""
```

### Step 6: Generate Feature Request Document

```bash
cat > "$FEATURE_FILE" <<EOF
# ${FEATURE_NAME^}

**Created:** $(date +%Y-%m-%d)
**Status:** Draft
**Type:** Feature Request

---

## Feature Description

${DESCRIPTION}

## User Stories & Use Cases

${USER_STORIES}

## Code Examples & Patterns

### Repository Patterns

${FOUND_PATTERNS}

### Reference Implementations

${EXTERNAL_REFERENCES}

## Documentation References

${DOCUMENTATION_REFS}

## Technical Considerations

### Architecture Implications

${ARCHITECTURE_NOTES}

### Performance Concerns

${PERFORMANCE_NOTES}

### Security Requirements

${SECURITY_NOTES}

### Edge Cases & Gotchas

${EDGE_CASES}

## Success Criteria

- [ ] Feature fully implements user stories
- [ ] Passes all acceptance tests
- [ ] Documentation complete
- [ ] Performance requirements met
- [ ] Security requirements satisfied

## Dependencies

### Technical Dependencies

- [List any required libraries, services, or components]

### Feature Dependencies

- [List any other features this depends on]

## Timeline Estimate

**Complexity:** [Low | Medium | High]
**Estimated Effort:** [To be determined by /sage.plan]

## Next Steps

1. **Research & Enhancement**
   \`\`\`bash
   /sage.intel
   \`\`\`
   Run this to research best practices, competitive solutions, and enhancement opportunities.
   Output: docs/research/${FEATURE_NAME}-intel.md

2. **Specification Generation**
   \`\`\`bash
   /sage.specify
   \`\`\`
   Generate detailed specifications from research findings.
   Output: docs/specs/[component]/spec.md

3. **Implementation Planning**
   \`\`\`bash
   /sage.plan
   \`\`\`
   Create technical implementation plan.
   Output: docs/specs/[component]/plan.md

---

**Related Files:**
- Research: docs/research/${FEATURE_NAME}-intel.md (generated by /sage.intel)
- Specs: docs/specs/[component]/spec.md (generated by /sage.specify)
- Plans: docs/specs/[component]/plan.md (generated by /sage.plan)

EOF

echo "✓ Created feature request: $FEATURE_FILE"
```

### Step 7: Display Summary and Next Steps

```plaintext
═══════════════════════════════════════════════════════════════════
               FEATURE REQUEST CREATED SUCCESSFULLY
═══════════════════════════════════════════════════════════════════

📄 Feature Document
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Location: docs/features/[feature-name].md

  Sections created:
    ✓ Feature Description
    ✓ User Stories & Use Cases
    ✓ Code Examples & Patterns
    ✓ Documentation References
    ✓ Technical Considerations
    ✓ Success Criteria
    ✓ Dependencies
    ✓ Next Steps

📖 Content Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Feature: [Feature Name]
  Complexity: [Estimated]
  User Stories: [Count]
  Technical Considerations: [Count]
  Related Patterns: [Count if found]

🔍 Next Steps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Research & Enhance the Feature

     /sage.intel

     This will:
       • Research best practices and solutions
       • Analyze competitive implementations
       • Identify enhancement opportunities
       • Generate: docs/research/[feature-name]-intel.md

  2. Review & Refine

     Edit docs/features/[feature-name].md to:
       • Add more details
       • Refine user stories
       • Update technical considerations

  3. Continue Development Workflow

     /sage.specify   Generate specifications
     /sage.plan      Create implementation plan
     /sage.tasks     Break down into tasks

═══════════════════════════════════════════════════════════════════

Feature request ready for research and enhancement!

Run: /sage.intel
```

## Template Structure

The generated feature request document follows this structure:

### Required Sections
1. **Feature Description** - High-level overview
2. **User Stories & Use Cases** - User-centered scenarios
3. **Code Examples & Patterns** - Links to repository patterns
4. **Documentation References** - External resources
5. **Technical Considerations** - Architecture, performance, security, edge cases
6. **Success Criteria** - Definition of done
7. **Dependencies** - Technical and feature dependencies
8. **Timeline Estimate** - Complexity and effort estimate
9. **Next Steps** - Clear workflow progression

### Optional Enhancements (Added Later)
- **Research Findings** - Added by `/sage.intel`
- **Competitive Analysis** - Added by `/sage.intel`
- **Architecture Diagrams** - Added by `/sage.plan`
- **API Contracts** - Added by `/sage.breakdown`

## Validation

Before creating the document, validate:

1. **Feature name** - Kebab-case format, no conflicts
2. **Directory structure** - docs/features/ exists
3. **Required content** - Description and at least one user story
4. **No duplicates** - Feature doesn't already exist

## Integration with Workflow

```mermaid
graph LR
    A[/sage.init-feature] --> B[docs/features/name.md]
    B --> C[/sage.intel]
    C --> D[docs/research/name-intel.md]
    D --> E[/sage.specify]
    E --> F[docs/specs/component/spec.md]
    F --> G[/sage.plan]
    G --> H[docs/specs/component/plan.md]
```

## Smart Defaults

Use **SequentialThinking** to provide smart defaults based on:
- Repository analysis from `.sage/agent/system/`
- Detected patterns in `.sage/agent/examples/`
- Common feature types (authentication, API, UI, data processing, etc.)
- Project tech stack

Example:
```
Feature: user-authentication

Smart suggestions:
  • Security considerations: OAuth2, JWT, session management
  • Relevant patterns: .sage/agent/examples/python/api/auth-*.md
  • Documentation: FastAPI security docs, OWASP guidelines
  • Success criteria: OWASP compliance, performance targets
```

## Error Handling

### Feature Name Conflicts
```plaintext
❌ ERROR: Feature already exists

A feature request with this name already exists:
  docs/features/[name].md

Options:
  1. Choose a different name
  2. Edit existing file
  3. Delete and recreate (careful - will lose content)

What would you like to do? [1/2/3]
```

### Missing /sage.init
```plaintext
⚠️  Repository not initialized

The docs/features/ directory doesn't exist.

Recommendation: Run /sage.init first to:
  • Initialize directory structure
  • Extract code patterns
  • Generate baseline documentation

Run /sage.init now? [Y/n]
```

### Invalid Feature Name
```plaintext
❌ Invalid feature name format

Feature names must be:
  • Lowercase letters (a-z)
  • Numbers (0-9)
  • Hyphens (-) to separate words
  • No spaces or special characters

Examples:
  ✓ user-authentication
  ✓ payment-api-v2
  ✓ real-time-messaging

  ✗ User Authentication (spaces)
  ✗ payment_api (underscores)
  ✗ RealTimeChat (uppercase)

Please enter a valid feature name: _
```

## Output Quality

- **Clear Structure** - Well-organized sections
- **Actionable** - Specific user stories and success criteria
- **Linked** - References to repository patterns
- **Complete** - All required sections populated
- **Guided** - Clear next steps for workflow
- **Traceable** - Links to related documents

## Success Criteria

- [x] Feature name validated (kebab-case, no conflicts)
- [x] docs/features/ directory exists or created
- [x] Feature document generated with all sections
- [x] Repository patterns referenced (if available)
- [x] Next steps clearly documented
- [x] /sage.intel recommended as next command
- [x] Document follows template structure

## Notes

- Interactive mode if no argument provided
- Non-interactive mode if feature name argument supplied
- Safe to create multiple feature requests
- Each feature is a separate file (flat structure)
- Automatically links to relevant code patterns
- Provides smart defaults based on repository analysis
- Clear progression: init-feature → intel → specify → plan → tasks
