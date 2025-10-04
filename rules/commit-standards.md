---
description: Conventional commit standards and git workflow enforcement rules
---

# Commit Standards

## Conventional Commits Format

REQUIRED FORMAT:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

**Example:**

```
feat(auth): add OAuth2 login support

Implement OAuth2 authentication flow with Google and GitHub providers.
Users can now sign in using their existing accounts without creating
new credentials.

Closes #123
BREAKING CHANGE: Removed basic auth endpoint /api/login
```

---

## Commit Types

### Primary Types (Required)

| Type | Description | Changelog | Example |
|------|-------------|-----------|---------|
| `feat` | New feature | Yes | `feat(api): add user profile endpoint` |
| `fix` | Bug fix | Yes | `fix(auth): resolve session timeout issue` |
| `docs` | Documentation only | No | `docs(readme): update installation steps` |
| `style` | Code style (formatting, semicolons, etc.) | No | `style(lint): fix import ordering` |
| `refactor` | Code change that neither fixes bug nor adds feature | No | `refactor(db): simplify query logic` |
| `perf` | Performance improvement | Yes | `perf(search): optimize query indexing` |
| `test` | Adding or updating tests | No | `test(auth): add OAuth flow tests` |
| `build` | Build system or dependencies | No | `build(deps): upgrade Django to 4.2` |
| `ci` | CI/CD configuration | No | `ci(github): add automated testing workflow` |
| `chore` | Other changes (maintenance) | No | `chore(deps): update dev dependencies` |
| `revert` | Revert previous commit | Yes | `revert(feat): revert "add user profiles"` |

### Extended Types (Optional)

| Type | Description | Example |
|------|-------------|---------|
| `security` | Security fix/improvement | `security(auth): patch XSS vulnerability` |
| `deps` | Dependency update | `deps(npm): update react to 18.2.0` |
| `i18n` | Internationalization | `i18n(ui): add French translations` |
| `a11y` | Accessibility | `a11y(forms): improve screen reader support` |
| `seo` | SEO improvement | `seo(meta): add Open Graph tags` |

---

## Scopes

**Scope indicates the area of codebase affected:**

**Backend:**

- `auth` - Authentication/authorization
- `api` - API endpoints
- `db` - Database models/queries
- `models` - Data models
- `services` - Business logic services
- `utils` - Utility functions
- `config` - Configuration

**Frontend:**

- `ui` - User interface components
- `forms` - Form components
- `routes` - Routing logic
- `state` - State management
- `styles` - CSS/styling
- `hooks` - React hooks

**Infrastructure:**

- `docker` - Docker configuration
- `k8s` - Kubernetes
- `ci` - CI/CD pipelines
- `deploy` - Deployment scripts

**Example scopes:**

```text
feat(auth): add password reset flow
fix(api): handle null user responses
docs(api): document authentication endpoints
refactor(db): optimize user query performance
```

---

## Subject Line Rules

### Requirements

1. **Imperative mood**: Use "add" not "added" or "adds"
   - ✅ `add user authentication`
   - ❌ `added user authentication`
   - ❌ `adds user authentication`

2. **No capitalization**: Start with lowercase
   - ✅ `add user profile endpoint`
   - ❌ `Add user profile endpoint`

3. **No period**: Don't end with period
   - ✅ `fix memory leak in parser`
   - ❌ `fix memory leak in parser.`

4. **Maximum 72 characters**: Keep subject concise
   - ✅ `feat(auth): implement OAuth2 with Google provider`
   - ❌ `feat(auth): implement OAuth2 authentication system with support for Google and GitHub providers and session management`

5. **Descriptive**: Clearly state what changed
   - ✅ `fix(api): handle 404 errors in user lookup`
   - ❌ `fix bug`
   - ❌ `update code`

---

## Commit Body

### Format

- Wrap at 72 characters per line
- Separate from subject with blank line
- Explain *what* and *why*, not *how*
- Use bullet points for multiple changes
- Reference issues/tickets

### Example

```
feat(search): implement full-text search with Elasticsearch

Add Elasticsearch integration for improved search performance.
This allows searching across user profiles, posts, and comments
with sub-second response times.

Changes:
- Add Elasticsearch client configuration
- Create search index for User, Post, Comment models
- Implement search API endpoint /api/search
- Add search results pagination

Closes #456
```

---

## Commit Footer

### Breaking Changes

**Format:**

```text
BREAKING CHANGE: <description>
```

**Example:**

```text
feat(api): redesign authentication API

BREAKING CHANGE: The /api/login endpoint has been removed.
Use /api/auth/login instead. Old tokens are incompatible.
Migration guide: https://docs.example.com/v2-migration
```

### Issue References

**Closing issues:**

```text
Closes #123
Fixes #456
Resolves #789
```

**Referencing issues:**

```text
Related to #123
See #456
Part of #789
```

**Multiple issues:**

```text
Closes #123, #456, #789
```

### Co-authors

**Format:**

```
Co-authored-by: Name <email@example.com>
```

**Example:**

```
feat(auth): add OAuth2 support

Implement OAuth2 authentication flow.

Co-authored-by: Jane Doe <jane@example.com>
Co-authored-by: John Smith <john@example.com>
```

---

## Commit Size and Scope

### Single Responsibility

**One logical change per commit:**

- ✅ One commit: "feat(auth): add OAuth2 login"
- ✅ Another commit: "docs(auth): document OAuth2 setup"
- ❌ One commit: "feat(auth): add OAuth2 login and update docs and fix typos"

### Size Guidelines

**Lines of code:**

- Ideal: < 200 lines
- Maximum: < 500 lines
- Large changes: Break into logical commits

**Files changed:**

- Ideal: < 10 files
- Maximum: < 20 files
- Exceptions: Refactoring, dependency updates

---

## Forbidden Practices

### ❌ DO NOT

**Vague commit messages:**

```text
❌ fix stuff
❌ update code
❌ changes
❌ wip
❌ temp
❌ asdf
```

**Multiple unrelated changes:**

```text
❌ feat: add login and fix bug and update docs
```

**Commit broken code:**

```text
❌ feat(api): add endpoint (tests failing)
```

**Include secrets:**

```text
❌ Any commit with API keys, passwords, tokens
```

**Commit debug code:**

```text
❌ Code with console.log, print statements, debugger
```

---

## Git Workflow

### Branch Naming

**Format:**

```text
<type>/<ticket-id>-<short-description>
```

**Examples:**

```
feat/AUTH-123-oauth2-login
fix/BUG-456-session-timeout
docs/TASK-789-api-documentation
refactor/TECH-101-db-optimization
```

### Commit Flow

1. **Make atomic changes**

   ```bash
   git add src/auth/oauth.py
   git commit -m "feat(auth): add OAuth2 provider"
   ```

2. **Write descriptive message**

   ```bash
   git commit -m "feat(auth): implement OAuth2 login

   Add OAuth2 authentication flow with Google provider.
   Users can now sign in using Google accounts.

   Closes #123"
   ```

3. **Amend if needed** (before push)

   ```bash
   git commit --amend
   ```

4. **Rebase to clean history** (before PR)

   ```bash
   git rebase -i main
   # Squash fixup commits, reorder, reword
   ```

### Pre-commit Checks

**Automated checks:**

- [ ] Tests pass: `pytest`
- [ ] Linting clean: `ruff check .`
- [ ] Type check: `mypy .`
- [ ] No secrets: Run secret-scanner
- [ ] Conventional format: Validate commit message

**Pre-commit hook:**

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run tests
pytest -q || exit 1

# Run linter
ruff check . || exit 1

# Run type checker
mypy . || exit 1

# Scan for secrets
git diff --cached | grep -E "(api[_-]?key|password|secret)" && exit 1

echo "✓ Pre-commit checks passed"
```

---

## Commit Message Template

**Setup:**

```bash
git config commit.template ~/.gitmessage
```

**~/.gitmessage:**

```text
# <type>(<scope>): <subject> (max 72 char)
# |<----  Using a Maximum Of 72 Characters  ---->|

# Explain why this change is being made
# |<----   Try To Limit Each Line to a Maximum Of 72 Characters   ---->|

# Provide links or keys to any relevant tickets, articles or other resources
# Example: Closes #23

# --- COMMIT END ---
# Type can be
#    feat     (new feature)
#    fix      (bug fix)
#    refactor (refactoring code)
#    style    (formatting, missing semi colons, etc; no code change)
#    docs     (changes to documentation)
#    test     (adding or refactoring tests; no production code change)
#    chore    (updating grunt tasks etc; no production code change)
# --------------------
# Remember to
#    Capitalize the subject line
#    Use the imperative mood in the subject line
#    Do not end the subject line with a period
#    Separate subject from body with a blank line
#    Use the body to explain what and why vs. how
#    Can use multiple lines with "-" for bullet points in body
# --------------------
```

---

## Automated Enforcement

### Commit Message Validation

**commitlint configuration (.commitlintrc.json):**

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", [
      "feat", "fix", "docs", "style", "refactor",
      "perf", "test", "build", "ci", "chore", "revert"
    ]],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72],
    "body-leading-blank": [1, "always"],
    "body-max-line-length": [2, "always", 72],
    "footer-leading-blank": [1, "always"]
  }
}
```

**Husky pre-commit hook:**

```json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "pre-commit": "pytest && ruff check ."
    }
  }
}
```

---

## Changelog Generation

**Automatically generate changelog from conventional commits:**

```bash
# Using conventional-changelog
npm install -g conventional-changelog-cli
conventional-changelog -p angular -i CHANGELOG.md -s

# Using git-cliff
git cliff --output CHANGELOG.md
```

**CHANGELOG.md example:**

```markdown
# Changelog

## [2.1.0] - 2025-01-15

### Features
- **auth**: add OAuth2 login support (#123)
- **api**: implement user profile endpoint (#145)

### Bug Fixes
- **auth**: resolve session timeout issue (#134)
- **db**: fix connection pool leak (#156)

### Performance
- **search**: optimize query indexing (#167)

### BREAKING CHANGES
- **api**: removed /api/login endpoint, use /api/auth/login
```

---

## Enforcement Rules

1. **Conventional format required** - type(scope): subject
2. **Imperative mood** - "add" not "added"
3. **No capitalization** - Lowercase subject
4. **Max 72 chars** - Subject line limit
5. **Descriptive subject** - Clear what changed
6. **Body for complex changes** - Explain what and why
7. **Reference issues** - Link tickets/issues
8. **Breaking changes noted** - BREAKING CHANGE: in footer
9. **Atomic commits** - One logical change per commit
10. **No broken code** - Tests must pass

---

## Tools

**Commit message validation:**

- commitlint
- commitizen
- git-cz

**Changelog generation:**

- conventional-changelog
- standard-version
- semantic-release
- git-cliff

**Pre-commit hooks:**

- husky
- pre-commit (Python)
- lefthook
