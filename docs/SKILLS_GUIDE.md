# Sage-Dev Skills - Universal Installation Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-17

Sage-Dev Skills are portable, composable development expertise packages that work across **all LLM platforms** - Claude, ChatGPT, Gemini, and more.

---

## What Are Sage-Dev Skills?

Skills are **auto-discoverable context packages** that provide specialized development capabilities without requiring manual command invocation. When you mention relevant topics, Skills automatically activate to provide expert guidance.

### Key Benefits

- **Cross-Platform**: Works in Claude, ChatGPT, Gemini - anywhere you use AI
- **Auto-Composition**: Multiple Skills activate together for comprehensive guidance
- **Zero Memorization**: Natural language triggers Skills - no commands to remember
- **Portable**: Download once, use everywhere
- **Community-Driven**: Contribute your own Skills to help others

---

## Available Skills (8 Total)

### Enforcement Skills

**1. Sage Python Quality Suite** (16 KB)
- Python 3.12+ type enforcement
- Docstring validation
- Test coverage requirements (80%+ overall, 90%+ new code)
- Import ordering and circular dependency detection
- **Triggers**: `python`, `*.py`, `typing`, `pytest`, `mypy`

**2. Sage Security Guard** (13 KB)
- Hardcoded secret detection
- API key and credential scanning
- No-bullshit code pattern enforcement
- **Triggers**: `security`, `secrets`, `api keys`, `credentials`

### Domain Expert Skills

**3. Sage Research Intelligence** (13 KB)
- Strategic intelligence gathering
- Market and competitive analysis
- Best practices research
- **Triggers**: `research`, `intelligence`, `market analysis`, `best practices`

**4. Sage Specification Engine** (69 KB)
- Requirements analysis and specification generation
- Technical breakdowns
- System architecture blueprints
- **Triggers**: `specification`, `spec`, `requirements`, `architecture`

**5. Sage Implementation Planner** (8 KB)
- PRP-format implementation plans
- SMART task breakdowns
- Phased execution strategies
- **Triggers**: `plan`, `planning`, `implementation`, `tasks`

**6. Sage Documentation Generator** (14 KB)
- Documentation creation and updates
- Standard Operating Procedure (SOP) generation
- Code documentation (docstrings)
- Implementation plan capture
- **Triggers**: `documentation`, `SOP`, `docstring`, `inline docs`

**7. Sage Context Optimizer** (5 KB)
- Conversation context compression (30%+ token reduction)
- Research delegation to sub-agents
- **Triggers**: `context`, `compression`, `token optimization`

### Utility Skills

**8. Sage Ticket Manager** (24 KB)
- Ticket system validation
- GitHub synchronization
- Documentation migration to tickets
- Time estimation and velocity tracking
- **Triggers**: `ticket`, `tickets`, `validation`, `sync`

---

## Installation

### Option 1: Claude (claude.ai, Claude Desktop, Claude Code)

**Step 1:** Download Skills
```bash
git clone https://github.com/Mathews-Tom/sage-dev.git
cd sage-dev/skills
```

**Step 2:** Install in Claude
1. Open Claude settings
2. Navigate to "Capabilities" or "Skills" section
3. Click "Add Skill"
4. Upload desired `.zip` files from `skills/` directory
5. Enable each Skill via toggle

**Recommended Starting Set:**
- `sage-python-quality-suite.zip` (if using Python)
- `sage-security-guard.zip` (essential for all projects)
- `sage-specification-engine.zip` (for planning features)
- `sage-implementation-planner.zip` (for execution)

**Step 3:** Verify Installation
Start a new conversation and mention `"I need to write Python code"`. The Sage Python Quality Suite should auto-activate.

---

### Option 2: ChatGPT

**Step 1:** Download Skills
```bash
git clone https://github.com/Mathews-Tom/sage-dev.git
cd sage-dev/skills
```

**Step 2:** Upload Per Chat
1. Start a new ChatGPT conversation
2. Click the attachment/upload button
3. Upload desired `.zip` files
4. Mention in your first message: "Using uploaded Skills, help me [task]"

**Example:**
```
User: *uploads sage-python-quality-suite.zip*

User: "Using the uploaded Skill, help me write a Python function
that validates email addresses with proper type hints and test coverage."

ChatGPT: *Extracts Skill, applies Python 3.12 typing standards,
creates tests first (TDD), ensures 90%+ coverage*
```

**Note:** ChatGPT requires Skills to be re-uploaded per conversation. Consider uploading your most-used Skills at the start of each session.

---

### Option 3: Gemini

**Step 1:** Download Skills
```bash
git clone https://github.com/Mathews-Tom/sage-dev.git
cd sage-dev/skills
```

**Step 2:** Upload Per Chat
1. Start a new Gemini conversation
2. Use the file upload feature
3. Upload desired `.zip` files
4. Reference Skills explicitly: "Using the Sage Python Quality Suite Skill..."

**Compatibility Note:** Gemini's Skill support may vary. Test with single Skills first before combining multiple.

---

### Option 4: Other LLMs (Cursor, Windsurf, etc.)

Most AI coding tools support file uploads. Process:
1. Download Skills from `skills/` directory
2. Upload `.zip` files to your tool
3. Reference Skills in your prompts
4. Tool extracts and applies guidance

**Verification:**
If the tool displays Skill contents (skill.json, instruction.md), it can use Skills.

---

## Usage Examples

### Example 1: Python Development with Quality Enforcement

**Setup:**
- Upload `sage-python-quality-suite.zip`
- Upload `sage-security-guard.zip`

**Conversation:**
```
User: "Create a user authentication function with password hashing"

[Sage Python Quality Suite AUTO-ACTIVATES]
[Sage Security Guard AUTO-ACTIVATES]

AI Response:
✓ Using Python 3.12 typing (built-in generics, | unions)
✓ Enforcing test coverage (90%+ for new code)
✓ Scanning for hardcoded secrets
✓ No fallback patterns allowed

from typing import Optional
from hashlib import sha256
import secrets

def authenticate_user(username: str, password: str) -> tuple[bool, Optional[str]]:
    """Authenticate user with secure password hashing.

    Args:
        username: User identifier
        password: Plain text password

    Returns:
        Tuple of (success status, error message if failed)

    Raises:
        ValueError: If username or password empty
    """
    if not username or not password:
        raise ValueError("Username and password required")

    # Hash with salt (secret scanner ensures no hardcoded salts)
    salt = secrets.token_hex(16)
    hashed = sha256(f"{password}{salt}".encode()).hexdigest()

    return (True, None)

# Test coverage enforced:
def test_authenticate_user():
    result, error = authenticate_user("user", "pass123")
    assert result is True
    assert error is None
```

**Skills Applied:**
- Type hints on all functions (Python Quality Suite)
- Docstrings with Args/Returns/Raises (Python Quality Suite)
- No hardcoded secrets (Security Guard)
- Test coverage included (Python Quality Suite)

---

### Example 2: Feature Planning and Implementation

**Setup:**
- Upload `sage-specification-engine.zip`
- Upload `sage-implementation-planner.zip`
- Upload `sage-documentation-generator.zip`

**Conversation:**
```
User: "I need to add OAuth authentication to my API. Help me plan this."

[Sage Specification Engine AUTO-ACTIVATES]
[Sage Implementation Planner AUTO-ACTIVATES]

AI Response:

# OAuth Authentication Specification

## 1. Overview
OAuth 2.0 authentication for REST API with token-based auth...

## 2. Functional Requirements
- FR-1: Support OAuth 2.0 authorization code flow
- FR-2: JWT token generation and validation
- FR-3: Refresh token rotation
...

[After spec approval]

# Implementation Plan

## Phase 1: Core OAuth Flow (4 hours)
- Task 1.1: Implement authorization endpoint
- Task 1.2: Token exchange endpoint
- Task 1.3: Token validation middleware

## Phase 2: Security Hardening (2 hours)
- Task 2.1: Refresh token rotation
- Task 2.2: Rate limiting on auth endpoints
...

[After implementation]

[Sage Documentation Generator AUTO-ACTIVATES]
Generated: docs/sops/oauth-setup.md
Generated: docs/api/authentication.md
```

---

### Example 3: Research-Driven Development

**Setup:**
- Upload `sage-research-intelligence.zip`
- Upload `sage-specification-engine.zip`

**Conversation:**
```
User: "What's the best approach for implementing real-time notifications?"

[Sage Research Intelligence AUTO-ACTIVATES]

AI Response:

# Real-Time Notifications Research

## Technologies Evaluated
1. **WebSockets** (Score: 9/10)
   - Pros: Bi-directional, low latency, wide support
   - Cons: Connection overhead, scaling complexity

2. **Server-Sent Events (SSE)** (Score: 7/10)
   - Pros: Simple, HTTP-based, automatic reconnection
   - Cons: One-way only, browser limit (6 connections)

3. **Long Polling** (Score: 5/10)
   - Pros: Universal compatibility
   - Cons: High latency, server load

## Recommendation
WebSockets with fallback to SSE for maximum compatibility...

[User approves approach]

[Sage Specification Engine AUTO-ACTIVATES]

Generated: docs/specs/real-time-notifications/spec.md
```

---

## Best Practices

### Skill Selection Strategy

**Minimalist Approach** (Recommended for ChatGPT/Gemini):
- Upload 2-3 Skills per conversation
- Focus on task-specific Skills
- Reduces context overhead

**Comprehensive Approach** (Recommended for Claude):
- Enable all relevant Skills in capabilities panel
- Skills auto-activate only when needed
- Maximum coverage, no manual selection

### When to Use Which Skills

**Starting New Feature:**
1. `sage-research-intelligence.zip` - Research best practices
2. `sage-specification-engine.zip` - Generate spec
3. `sage-implementation-planner.zip` - Create plan
4. Language-specific quality suite - Enforce standards during implementation

**Code Review/Refactoring:**
1. `sage-python-quality-suite.zip` (or language-specific)
2. `sage-security-guard.zip`
3. `sage-documentation-generator.zip` - Update docs

**Bug Fixing:**
1. Language-specific quality suite - Ensure fix meets standards
2. `sage-security-guard.zip` - Verify no security regressions

**Documentation:**
1. `sage-documentation-generator.zip`

### Multi-Skill Composition

Skills stack automatically in Claude. In ChatGPT/Gemini:

**Good Combination:**
```
Upload: sage-python-quality-suite.zip
        sage-security-guard.zip

Result: Python code with type safety + security validation
```

**Avoid Overloading:**
```
❌ Upload: All 8 Skills at once in ChatGPT
Result: Context overload, slower responses

✓ Upload: 2-3 task-relevant Skills
Result: Focused, fast responses
```

---

## Troubleshooting

### Skill Not Activating

**Claude:**
- Check Skills are enabled in capabilities panel
- Verify toggle is ON
- Restart conversation

**ChatGPT/Gemini:**
- Ensure zip file uploaded successfully
- Explicitly mention Skill name in prompt
- Example: "Using Sage Python Quality Suite, write..."

### Skill Conflicts

If Skills provide contradictory guidance:
- Disable lower-priority Skill
- Explicitly state which Skill to follow
- Example: "Prioritize Sage Security Guard over Python Quality Suite"

### Performance Issues

**Claude:**
- Disable unused Skills
- Skills only load when triggered

**ChatGPT/Gemini:**
- Reduce number of uploaded Skills per conversation
- Upload only task-specific Skills

### Skill Content Not Displaying

**Verify Skill Integrity:**
```bash
cd skills/
unzip -l sage-python-quality-suite.zip

Expected output:
- skill.json
- instruction.md
- resources/
```

If corrupted, regenerate:
```bash
./sage-skillify.sh
```

---

## Advanced Usage

### Creating Custom Skills

Modify `sage-skillify.sh` to add your own Skills:

```bash
generate_custom_skill() {
    local skill_dir="$TEMP_DIR/my-custom-skill"
    mkdir -p "$skill_dir"

    generate_skill_json \
        "My Custom Skill" \
        "Description of what this skill does" \
        '"trigger1", "trigger2"' \
        "$VERSION"

    create_instruction "$skill_dir/instruction.md" \
        "path/to/source1.md" \
        "path/to/source2.md"

    bundle_resources "$skill_dir" \
        "path/to/resources"

    package_skill "my-custom-skill"
}
```

Then add to main():
```bash
info "Generating Custom Skills..."
generate_custom_skill
```

### Skill Versioning

Skills include version metadata in `skill.json`:
```json
{
  "name": "Sage Python Quality Suite",
  "version": "1.0.0",
  "created": "2025-10-17T...",
  ...
}
```

When updating Skills:
1. Modify source files (commands/*.md, agents/*.md)
2. Run `./sage-skillify.sh`
3. Re-upload updated zips

---

## Platform-Specific Notes

### Claude

**Advantages:**
- Skills persist across conversations
- Auto-discovery works seamlessly
- Multiple Skills compose automatically
- Version management via API

**Limitations:**
- Requires Claude Pro/Team/Enterprise
- Platform-specific (not portable to other tools during session)

### ChatGPT

**Advantages:**
- Works with all ChatGPT tiers (Free/Plus/Team)
- Simple upload process

**Limitations:**
- Skills must be re-uploaded per conversation
- No auto-discovery (must reference explicitly)
- 10-20 file upload limit per conversation

### Gemini

**Advantages:**
- Free tier supports file uploads
- Works across Google ecosystem

**Limitations:**
- Skill interpretation may vary
- File upload limits more restrictive
- Test thoroughly before relying on multi-skill composition

---

## FAQ

**Q: Can I use Skills offline?**
A: No, Skills require LLM access. However, you can inspect Skill contents offline by unzipping.

**Q: Are Skills language-specific?**
A: Enforcement Skills are language-specific (Python Quality Suite, JavaScript Quality Suite). Domain Expert Skills work across languages.

**Q: How do I know which Skills are active?**
A: In Claude, check the capabilities panel. In ChatGPT/Gemini, ask "Which Skills are currently loaded?"

**Q: Can I modify Skill contents?**
A: Yes! Unzip, edit `instruction.md`, re-zip. Skills are just packaged markdown.

**Q: Do Skills work with Claude Code (CLI)?**
A: Yes, if uploaded to Claude capabilities panel. Skills are platform-agnostic once uploaded.

**Q: Can I contribute Skills to Sage-Dev?**
A: Yes! See CONTRIBUTING.md (coming soon) for guidelines. Submit PR with new Skill source files.

**Q: What's the difference between Skills and slash commands?**
A: Slash commands require manual invocation (`/sage.specify`). Skills auto-activate based on conversation context. Use slash commands for explicit workflow control, Skills for automatic guidance.

**Q: Can I use Skills in VS Code with Copilot?**
A: Not directly. Copilot doesn't support Skill uploads. Use Cursor or Claude Code instead.

---

## Next Steps

1. **Download Skills**: `git clone https://github.com/Mathews-Tom/sage-dev.git`
2. **Choose Platform**: Claude (persistent) or ChatGPT/Gemini (per-chat)
3. **Start Small**: Upload 2-3 Skills for your current task
4. **Expand**: Add more Skills as you discover use cases
5. **Contribute**: Share your custom Skills with the community

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Mathews-Tom/sage-dev/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mathews-Tom/sage-dev/discussions)
- **Documentation**: See `README.md` and `commands/SAGE.COMMANDS.md`

---

*Generated by sage-skillify.sh v1.0.0*
*Last Updated: 2025-10-17*