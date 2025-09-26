---
allowed-tools: Bash(git:*), Bash(mkdir:*), Bash(cat:*), Bash(tee:*), Bash(test:*), SequentialThinking
description: Create semantic commits, push changes, and generate comprehensive PR descriptions. Enforces safe branching (never commit to main/master).
---

## Role

Developer organizing changes into clean, conventional commits with comprehensive PR documentation.

## Pre-check: Branch Safety

1. **Check Current Branch**:

   ```bash
   git branch --show-current
   ```

2. **Rules**:

   * Never commit directly to `main` or `master`.
   * If on `main`/`master`:

     * Propose a new branch name (e.g., `feature/<description>`).
     * Confirm with the user before creating and checking out the new branch.
   * If already on a local branch:

     * Confirm with the user whether to continue on the same branch or switch to a different one.

3. **Branch Creation (if needed)**:

   ```bash
   git checkout -b <new-branch-name>
   ```

---

## Execution

1. **Analyze Changes**:

   ```bash
   git status --short
   git diff --stat
   git branch --show-current
   ```

2. **Group Files**: Use `SequentialThinking` to:

   * Identify logical change groups
   * Determine commit types and scopes
   * Order commits by dependency

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

---

## Commit Strategy

### Conventional Commit Format

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

* **feat**: New feature
* **fix**: Bug fix
* **docs**: Documentation only
* **style**: Formatting, missing semicolons
* **refactor**: Code restructuring
* **perf**: Performance improvement
* **test**: Adding tests
* **chore**: Build, tools, dependencies

### Scoping Guidelines

* Use component/directory name (e.g., `auth`, `api`, `ui`)
* Use `*` for multiple scopes
* Omit scope if change is global

### Authorship Guidelines

* All commits should be made on behalf of the developer without any reference to AI assistance
* Never include phrases like "AI-assisted", "Claude-generated", or any other reference to an AI tool in commit messages
* Ensure commit messages use first-person perspective when appropriate
* Git user.name and user.email configuration should reflect only the developer's identity

---

## Grouping Strategy

1. **Review all changes**: Understand full scope
2. **Identify atoms**: Find smallest logical units
3. **Group related**: Combine interdependent changes
4. **Order logically**: Dependencies first, then features

Decision tree:

* **Single concern?** → One commit
* **Multiple features?** → Separate commits
* **Feature + tests?** → Same commit
* **Feature + docs?** → Same commit
* **Unrelated fixes?** → Separate commits
* **Refactor + feature?** → Separate commits

---

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

---

## Validation Checklist

Before pushing:

* [ ] All commits follow conventional format
* [ ] Commit messages are descriptive
* [ ] No WIP or temp commits
* [ ] Related changes grouped together
* [ ] Tests committed with features
* [ ] No sensitive data in commits
* [ ] No references to AI tools or assistance
* [ ] **Not committing to `main` or `master`**
* [ ] Branch name matches convention
