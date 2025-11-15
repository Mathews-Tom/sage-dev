---
allowed-tools: Bash(cp:*), Bash(sed:*), Bash(test:*), Bash(ls:*), Bash(mkdir:*), Read, Write
description: Create new skill from template with category selection and placeholder substitution.
---

## Role

Skill creation wizard that scaffolds new skills from the template with guided category selection.

## Arguments

```
/sage.skill-add <skill-name>
```

- `<skill-name>`: Name for the new skill (will be slugified for filename)

## Execution

### 1. Parse and Validate Skill Name

```bash
SKILL_NAME="$1"

if [ -z "$SKILL_NAME" ]; then
  echo "❌ Usage: /sage.skill-add <skill-name>"
  echo ""
  echo "Example: /sage.skill-add performance-profiling"
  exit 1
fi

# Slugify: lowercase, replace spaces with hyphens
SKILL_SLUG=$(echo "$SKILL_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')

echo "📝 Creating new skill: $SKILL_SLUG"
```

**Actions:**
- Extract skill name from argument
- Validate name provided
- Slugify: lowercase, hyphens, alphanumeric only

### 2. Display Category Menu

```bash
echo ""
echo "Select category for skill:"
echo ""
echo "  1. testing       - Test strategies, TDD workflows, coverage patterns"
echo "  2. debugging     - Systematic debugging, root cause analysis"
echo "  3. refactoring   - Safe refactoring patterns, code transformations"
echo "  4. collaboration - Code review, pair programming, team practices"
echo "  5. architecture  - Design patterns, system design, dependency management"
echo ""
echo "Enter choice (1-5): "
```

**Actions:**
- Present numbered category options
- Include brief description for each
- Prompt for user selection

### 3. Validate Category Selection

```bash
# Read user input
read -r CHOICE

case $CHOICE in
  1) CATEGORY="testing" ;;
  2) CATEGORY="debugging" ;;
  3) CATEGORY="refactoring" ;;
  4) CATEGORY="collaboration" ;;
  5) CATEGORY="architecture" ;;
  *)
    echo "❌ Invalid selection: $CHOICE"
    echo "Please enter a number between 1 and 5"
    exit 1
    ;;
esac

echo "Selected category: $CATEGORY"
```

**Actions:**
- Map numeric choice to category name
- Validate input is 1-5
- Show error for invalid selection

### 4. Check for Existing Skill

```bash
TARGET_FILE=".sage/agent/skills/${CATEGORY}/${SKILL_SLUG}.md"

if [ -f "$TARGET_FILE" ]; then
  echo ""
  echo "❌ Skill already exists: $SKILL_SLUG"
  echo "   File: $TARGET_FILE"
  echo ""
  echo "To edit existing skill, open the file directly."
  echo "To create a different skill, use a unique name."
  exit 1
fi
```

**Actions:**
- Construct target file path
- Check if file already exists
- Prevent overwriting existing skills

### 5. Copy Template with Substitution

```bash
TEMPLATE_FILE=".sage/agent/templates/skill-template.md"

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "❌ Template not found: $TEMPLATE_FILE"
  echo "Run SKILLS-003 to create the template first."
  exit 1
fi

# Copy template to target location
cp "$TEMPLATE_FILE" "$TARGET_FILE"

# Substitute placeholders
# {{NAME}} -> Human-readable skill name (with proper capitalization)
DISPLAY_NAME=$(echo "$SKILL_NAME" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')

sed -i '' "s/{{NAME}}/$DISPLAY_NAME/g" "$TARGET_FILE"
sed -i '' "s/{{CATEGORY}}/$CATEGORY/g" "$TARGET_FILE"

echo ""
echo "✅ Created: $TARGET_FILE"
```

**Actions:**
- Verify template exists
- Copy template to target directory
- Substitute `{{NAME}}` with display name
- Substitute `{{CATEGORY}}` with selected category
- Preserve all template structure

### 6. Display Next Steps

```bash
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Open the file to complete the skill definition:"
echo "   $TARGET_FILE"
echo ""
echo "2. Fill in the following sections:"
echo "   - Update languages[] in frontmatter"
echo "   - Add prerequisites (tools and knowledge)"
echo "   - Write Purpose section (when to use/not use)"
echo "   - Document Algorithm with step-by-step procedure"
echo "   - Define Validation criteria"
echo "   - Add Common Pitfalls"
echo "   - Provide Examples in multiple languages"
echo "   - Add evidence links (articles, books, docs)"
echo ""
echo "3. Set validated: false until peer review"
echo ""
echo "4. View template example for reference:"
echo "   .sage/agent/templates/examples/skill-example.md"
echo ""
echo "5. Test your skill:"
echo "   /sage.skill $SKILL_SLUG"
echo "   /sage.skill $SKILL_SLUG --apply"
```

**Actions:**
- Provide clear instructions for completing skill
- List all sections to fill in
- Reference example template
- Show how to test the new skill

## Output Format

### Successful Creation

```
📝 Creating new skill: performance-profiling

Select category for skill:

  1. testing       - Test strategies, TDD workflows, coverage patterns
  2. debugging     - Systematic debugging, root cause analysis
  3. refactoring   - Safe refactoring patterns, code transformations
  4. collaboration - Code review, pair programming, team practices
  5. architecture  - Design patterns, system design, dependency management

Enter choice (1-5):
2
Selected category: debugging

✅ Created: .sage/agent/skills/debugging/performance-profiling.md

📝 Next steps:

1. Open the file to complete the skill definition:
   .sage/agent/skills/debugging/performance-profiling.md

2. Fill in the following sections:
   - Update languages[] in frontmatter
   - Add prerequisites (tools and knowledge)
   - Write Purpose section (when to use/not use)
   - Document Algorithm with step-by-step procedure
   - Define Validation criteria
   - Add Common Pitfalls
   - Provide Examples in multiple languages
   - Add evidence links (articles, books, docs)

3. Set validated: false until peer review

4. View template example for reference:
   .sage/agent/templates/examples/skill-example.md

5. Test your skill:
   /sage.skill performance-profiling
   /sage.skill performance-profiling --apply
```

### Skill Already Exists

```
📝 Creating new skill: tdd-workflow

Select category for skill:
...
Enter choice (1-5):
1
Selected category: testing

❌ Skill already exists: tdd-workflow
   File: .sage/agent/skills/testing/tdd-workflow.md

To edit existing skill, open the file directly.
To create a different skill, use a unique name.
```

### Invalid Category

```
📝 Creating new skill: my-skill

Select category for skill:
...
Enter choice (1-5):
9

❌ Invalid selection: 9
Please enter a number between 1 and 5
```

## Error Handling

### Missing Skill Name

```
❌ Usage: /sage.skill-add <skill-name>

Example: /sage.skill-add performance-profiling
```

### Missing Template

```
❌ Template not found: .sage/agent/templates/skill-template.md
Run SKILLS-003 to create the template first.
```

## Integration Points

**Used By:**
- Developers creating new skills
- Team expanding skills library

**Uses:**
- `.sage/agent/templates/skill-template.md`
- `.sage/agent/skills/` directory structure

## Success Criteria

- [ ] Accepts skill name as argument
- [ ] Displays numbered category menu
- [ ] Validates category selection (1-5)
- [ ] Creates skill file in correct category directory
- [ ] Copies from template preserving structure
- [ ] Substitutes {{NAME}} with proper case
- [ ] Substitutes {{CATEGORY}} with selected category
- [ ] Prevents overwriting existing skills
- [ ] Provides clear next steps for completion
- [ ] References example template

## Usage Examples

```bash
# Create a new testing skill
/sage.skill-add mutation-testing
# Select: 1 (testing)
# Creates: .sage/agent/skills/testing/mutation-testing.md

# Create a new architecture skill
/sage.skill-add event-sourcing
# Select: 5 (architecture)
# Creates: .sage/agent/skills/architecture/event-sourcing.md

# Create skill with spaces (will be slugified)
/sage.skill-add "Memory Leak Detection"
# Becomes: memory-leak-detection
# Select: 2 (debugging)
# Creates: .sage/agent/skills/debugging/memory-leak-detection.md
```
