---
allowed-tools: Bash(git:*), Bash(mkdir:*), Bash(cat:*), Bash(tee:*), Bash(test:*), SequentialThinking
description: Create semantic commits, push changes, and generate comprehensive PR descriptions.
---

## Role

Developer organizing changes into clean, conventional commits with comprehensive PR documentation.

## Execution

1. **Analyze Changes**:

   ```bash
   git status --short
   git diff --stat
   git branch --show-current
   ```

2. **Group Files**: Use `SequentialThinking` to:
   - Identify logical change groups
   - Determine commit types and scopes
   - Order commits by dependency

3. **Create Commits**: For each group:

   ```bash
   git add <files>
   git commit -m "type(scope): subject" -m "body"
   ```

4. **Validate**: Check commit history:

   ```bash
   git log --oneline -10
   ```

5. **Push**:

   ```bash
   git push origin $(git branch --show-current)
   ```

6. **Generate PR Message**:

   ```bash
   mkdir -p TEMP_DOCS
   tee TEMP_DOCS/PR_MESSAGE.md
   ```

## Commit Strategy

### Conventional Commit Format

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting, missing semicolons
- **refactor**: Code restructuring
- **perf**: Performance improvement
- **test**: Adding tests
- **chore**: Build, tools, dependencies

### Scoping Guidelines

- Use component/directory name (e.g., `auth`, `api`, `ui`)
- Use `*` for multiple scopes
- Omit scope if change is global

### Authorship Guidelines

- All commits should be made on behalf of the developer without any reference to AI assistance
- Never include phrases like "AI-assisted", "Claude-generated", or any other reference to an AI tool in commit messages
- Ensure commit messages use first-person perspective when appropriate
- Git user.name and user.email configuration should reflect only the developer's identity

### Examples

```bash
feat(api): add user authentication endpoint

Implement JWT-based authentication with refresh tokens.
Includes rate limiting and session management.

Refs: #123

---

fix(ui): resolve mobile navigation z-index issue

The mobile menu was appearing behind modal overlays.
Updated z-index hierarchy to fix stacking context.

Closes: #456

---

docs(readme): update installation instructions

Add prerequisites section and troubleshooting guide.

---

refactor(db): optimize query performance

Replace N+1 queries with batch loading.
Reduce query time from 500ms to 50ms.

---

test(auth): add integration tests for login flow

Cover happy path and error scenarios.
Achieve 95% coverage for auth module.
```

## Grouping Strategy

### Analyze and Group

1. **Review all changes**: Understand full scope
2. **Identify atoms**: Find smallest logical units
3. **Group related**: Combine interdependent changes
4. **Order logically**: Dependencies first, then features

### Decision Tree

- **Single concern?** → One commit
- **Multiple features?** → Separate commits
- **Feature + tests?** → Same commit
- **Feature + docs?** → Same commit
- **Unrelated fixes?** → Separate commits
- **Refactor + feature?** → Separate commits

## PR Message Template

```markdown
# [Type]: [Concise title]

## 🎯 Purpose

[Why this change is needed - business value or problem solved]

## 📝 Changes

### Added
- Feature/functionality added

### Changed
- Modified behavior or implementation

### Fixed
- Bug fixes and corrections

### Removed
- Deprecated or deleted code

## 🔧 Technical Details

**Approach:**
[High-level implementation strategy]

**Key Files:**
- `path/to/file1.ts` - [what changed]
- `path/to/file2.ts` - [what changed]

**Dependencies:**
- [Any new dependencies added]
- [Version updates]

## 🧪 Testing

**Test Coverage:**
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

**Test Scenarios:**
1. [Scenario 1]
2. [Scenario 2]

## 📊 Impact

**Performance:**
- [Any performance implications]

**Breaking Changes:**
- [ ] No breaking changes
- [ ] Breaking changes (describe below)

**Migration Required:**
- [ ] No migration needed
- [ ] Migration steps provided

## 🔗 References

- Closes #[issue-number]
- Related to #[issue-number]
- Depends on #[PR-number]

## 📸 Screenshots/Demo

[If UI changes, include screenshots or GIF]

## ✅ Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Reviewed own code
- [ ] Ready for review

## 📋 Review Notes

[Any specific areas reviewers should focus on]

---

### Commits in this PR

- `abc123f` feat(api): add authentication endpoint
- `def456a` test(api): add auth integration tests
- `ghi789b` docs(api): update API documentation
```

## Commit Flow Examples

### Example 1: Feature Addition

```bash
# 1. Review changes
git status

# 2. Group and commit feature
git add src/features/auth/
git commit -m "feat(auth): implement OAuth2 login" \
  -m "Add Google and GitHub OAuth providers with PKCE flow." \
  -m "Refs: #123"

# 3. Commit tests
git add tests/auth/
git commit -m "test(auth): add OAuth integration tests" \
  -m "Cover success and error scenarios for OAuth flow."

# 4. Commit docs
git add docs/auth.md
git commit -m "docs(auth): add OAuth setup guide"

# 5. Push
git push origin feature/oauth-login
```

### Example 2: Bug Fix

```bash
# 1. Commit fix
git add src/utils/validation.ts
git commit -m "fix(validation): correct email regex pattern" \
  -m "Previous regex failed for emails with + character." \
  -m "Closes: #456"

# 2. Commit test
git add tests/validation.test.ts
git commit -m "test(validation): add email validation edge cases"

# 3. Push
git push origin bugfix/email-validation
```

### Example 3: Refactoring

```bash
# 1. Commit refactor
git add src/services/
git commit -m "refactor(services): extract common HTTP logic" \
  -m "Create reusable HTTP client wrapper to reduce duplication."

# 2. Update dependent code
git add src/api/
git commit -m "refactor(api): use new HTTP client wrapper"

# 3. Push
git push origin refactor/http-client
```

## Error Handling

### Push Failures

```bash
# If push rejected (branch diverged)
git pull --rebase origin $(git branch --show-current)
git push origin $(git branch --show-current)
```

### Commit Message Mistakes

```bash
# Amend last commit message
git commit --amend -m "corrected message"

# Amend without changing message (add forgotten files)
git add forgotten-file.ts
git commit --amend --no-edit
```

### Wrong Files Staged

```bash
# Unstage specific file
git reset HEAD path/to/file

# Unstage all
git reset HEAD
```

## Validation Checklist

Before pushing:

- [ ] All commits follow conventional format
- [ ] Commit messages are descriptive
- [ ] No WIP or temp commits
- [ ] Related changes grouped together
- [ ] Tests committed with features
- [ ] No sensitive data in commits
- [ ] No references to AI tools or assistance
- [ ] Branch name matches convention

## Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical production fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `test/description` - Test additions
