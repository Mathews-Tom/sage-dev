---
name: "Systematic Debugging"
category: "debugging"
languages:
  - python
  - typescript
prerequisites:
  tools:
    - git>=2.0
    - python>=3.8
  knowledge:
    - basic-git-workflow
evidence:
  - "https://blog.regehr.org/archives/199"
  - "Book: Debugging by David J. Agans"
  - "https://jvns.ca/blog/2019/06/23/a-few-debugging-resources/"
validated: true
validated_by:
  - bs-enforce
---

# Systematic Debugging

## Purpose

**When to use:**
- Bug reports with reproducible steps
- Test failures in CI/CD pipeline
- Runtime errors in production logs
- Performance regressions after changes
- Any defect requiring root cause analysis

**When NOT to use:**
- Obvious typos or syntax errors
- Compiler errors with clear messages
- One-off issues you've seen before with known fixes

**Benefits:**
- Avoids random "shotgun debugging"
- Documents debugging process for future reference
- Identifies root cause, not just symptoms
- Builds systematic problem-solving skills
- Reduces average time to resolution

## Prerequisites

### Tools Required

```bash
which git && git --version
which python3 && python3 --version
```

### Knowledge Required

- Basic understanding of the codebase architecture
- Familiarity with git bisect for regression hunting
- Ability to read stack traces and error messages

## Algorithm

### Step 1: Reproduce the Bug

**What:** Create minimal, consistent reproduction case
**Why:** Can't fix what you can't see; inconsistent bugs hide root causes
**How:**
```bash
# Document exact reproduction steps
echo "Bug: User login fails with 500 error"
echo "Steps to reproduce:"
echo "1. Navigate to /login"
echo "2. Enter valid credentials"
echo "3. Click 'Sign In'"
echo "4. Observe 500 error"

# Create reproduction script
python3 test_reproduction.py
```

**Verification:**
- Bug reproduces consistently (at least 3 times)
- Steps are minimal (no unnecessary actions)
- Environment is documented (OS, versions, config)

### Step 2: Isolate the Failure

**What:** Narrow down the scope of the problem
**Why:** Smaller search space means faster diagnosis
**How:**
```python
# Binary search the codebase
# Start with: "Does it fail in module A or B?"
def debug_login():
    # Checkpoint 1: Does request reach server?
    print("DEBUG: Request received")

    # Checkpoint 2: Does authentication pass?
    user = authenticate(request.credentials)
    print(f"DEBUG: User authenticated: {user}")

    # Checkpoint 3: Does session creation work?
    session = create_session(user)
    print(f"DEBUG: Session created: {session}")

    # Found: Failure occurs between checkpoint 2 and 3
```

**Verification:**
- Failure location narrowed to specific function/module
- Non-failing code paths eliminated
- Scope reduced by at least 50%

### Step 3: Examine the State

**What:** Inspect variables, memory, and data at failure point
**Why:** Bugs manifest when actual state differs from expected state
**How:**
```python
import pdb

def create_session(user):
    pdb.set_trace()  # Examine state here
    # Check: user object structure, session store, permissions
    session_data = {
        "user_id": user.id,
        "expires": datetime.utcnow() + timedelta(hours=1)
    }
    return Session.create(session_data)

# In debugger:
# (Pdb) print(user)
# (Pdb) print(user.__dict__)
# (Pdb) print(type(user.id))  # Found: user.id is None!
```

**Verification:**
- Specific variable or state anomaly identified
- Difference between expected and actual state documented
- Root cause hypothesis formed

### Step 4: Form and Test Hypothesis

**What:** Create testable hypothesis about root cause
**Why:** Guessing without testing leads to incorrect fixes
**How:**
```bash
# Hypothesis: "user.id is None because database query returns empty result"

# Test 1: Check database directly
psql -c "SELECT id FROM users WHERE email='test@example.com'"
# Result: No rows returned

# Test 2: Check if user exists
psql -c "SELECT * FROM users WHERE email='test@example.com'"
# Result: User exists but email column has trailing space

# Root cause confirmed: Email comparison fails due to whitespace
```

**Verification:**
- Hypothesis is specific and testable
- Test confirms or refutes hypothesis
- If refuted, form new hypothesis and repeat

### Step 5: Fix and Verify

**What:** Implement fix and prove it resolves the issue
**Why:** Incomplete fixes leave bugs or introduce regressions
**How:**
```python
# Fix: Normalize email input
def authenticate(credentials):
    email = credentials.email.strip().lower()  # Normalize
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(credentials.password):
        return user
    raise AuthenticationError("Invalid credentials")

# Verify: Original reproduction case passes
python3 test_reproduction.py  # Success!

# Verify: No regressions
pytest tests/auth/  # All pass
```

**Verification:**
- Original bug no longer reproduces
- Fix addresses root cause (not just symptom)
- No new bugs introduced
- Tests added to prevent regression

### Step 6: Document and Learn

**What:** Record findings for future reference
**Why:** Prevents repeating same debugging process
**How:**
```markdown
# Bug Report: Login 500 Error

**Root Cause:** Email normalization missing in authentication
**Fix:** Added .strip().lower() to email input processing
**Prevention:** Added unit tests for email edge cases
**Time Spent:** 2 hours
**Key Learning:** Always normalize string inputs before database queries
```

**Verification:**
- Documentation exists in issue tracker or commit message
- Learnings shared with team if applicable
- Preventive measures identified

## Validation

### Success Criteria

- [ ] Bug consistently reproducible before fix
- [ ] Root cause identified (not just symptom patched)
- [ ] Fix verified with original reproduction case
- [ ] No regressions introduced
- [ ] Tests added to prevent recurrence
- [ ] Debugging process documented

### Automated Validation

```bash
pytest tests/ --tb=short
git diff --stat
```

### Manual Verification

1. Original bug reproduction case passes
2. Related functionality still works
3. Code review confirms fix addresses root cause
4. Test coverage increased for bug area

## Common Pitfalls

### Pitfall 1: Fixing Symptoms Instead of Root Cause

**Symptom:** Bug returns in slightly different form
**Cause:** Patched visible symptom without understanding why it occurred
**Solution:** Always ask "Why did this happen?" until you reach the source

### Pitfall 2: Shotgun Debugging

**Symptom:** Random changes hoping something works
**Cause:** Frustration or time pressure
**Solution:** Follow systematic process; add print statements strategically

### Pitfall 3: Not Documenting the Fix

**Symptom:** Same bug found and fixed repeatedly
**Cause:** No record of root cause or fix
**Solution:** Document every bug fix in commit message and issue tracker

### Pitfall 4: Over-Relying on Print Statements

**Symptom:** Console filled with debug output, still confused
**Cause:** Adding prints without strategy
**Solution:** Use binary search approach; remove prints after each isolation step

## Examples

### Python Example

**Scenario:** API returns stale data after update

```python
# Step 1: Reproduce
def test_stale_data_bug():
    # Update user name
    response = client.patch("/users/1", json={"name": "New Name"})
    assert response.status_code == 200

    # Immediately fetch user
    response = client.get("/users/1")
    data = response.json()

    # BUG: Still shows old name!
    assert data["name"] == "New Name"  # FAILS

# Step 2: Isolate
def update_user(user_id, data):
    user = User.query.get(user_id)
    user.name = data["name"]
    db.session.commit()  # Checkpoint 1: Committed?
    print(f"DEBUG: Committed user {user.id} with name {user.name}")
    return user

def get_user(user_id):
    user = User.query.get(user_id)  # Checkpoint 2: Fresh query?
    print(f"DEBUG: Fetched user {user.id} with name {user.name}")
    return user

# Found: Committed shows new name, but fetch shows old name

# Step 3: Examine State
# Hypothesis: Caching issue - ORM returning cached object
# Test: Check if same session object
print(f"Session identity map: {db.session.identity_map}")

# Step 4: Test Hypothesis
def get_user(user_id):
    db.session.expire_all()  # Force fresh query
    user = User.query.get(user_id)
    return user
# Result: Now returns new name!

# Step 5: Fix
# Root cause: SQLAlchemy identity map caching
# Fix: Use read-committed isolation or expire cache
@app.after_request
def expire_session(response):
    db.session.expire_all()
    return response

# Step 6: Document
# Commit: "fix: expire SQLAlchemy session after each request to prevent stale reads"
```

### TypeScript Example

**Scenario:** Event handler fires multiple times

```typescript
// Step 1: Reproduce
describe("button click handler", () => {
  it("calls handler once per click", () => {
    const handler = jest.fn();
    render(<Button onClick={handler} />);

    fireEvent.click(screen.getByRole("button"));

    expect(handler).toHaveBeenCalledTimes(1);
    // FAILS: Called 3 times!
  });
});

// Step 2: Isolate
function Button({ onClick }: { onClick: () => void }) {
  console.log("Button render"); // Checkpoint 1

  useEffect(() => {
    console.log("Effect running"); // Checkpoint 2
    document.addEventListener("click", onClick);
    // Found: Effect runs 3 times, adding 3 listeners!
  }, [onClick]);

  return <button>Click</button>;
}

// Step 3: Examine State
// onClick changes identity each render due to parent re-renders
// useEffect runs on each onClick change

// Step 4: Test Hypothesis
function Button({ onClick }: { onClick: () => void }) {
  useEffect(() => {
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick); // Cleanup!
  }, [onClick]);

  return <button>Click</button>;
}
// Result: Now fires once!

// Step 5: Fix
// Root cause: Missing cleanup in useEffect
// Fix: Add cleanup function to remove old listener

// Step 6: Document
// Added ESLint rule: react-hooks/exhaustive-deps
// Commit: "fix: add cleanup to prevent event listener accumulation"
```

## References

- [How to Debug Any Problem](https://blog.regehr.org/archives/199) - John Regehr's systematic approach
- [Debugging by David J. Agans](https://debuggingrules.com/) - Nine indispensable rules
- [Julia Evans' Debugging Resources](https://jvns.ca/blog/2019/06/23/a-few-debugging-resources/) - Practical tools and techniques
- [Git Bisect Documentation](https://git-scm.com/docs/git-bisect) - Binary search for regressions
- [The Science of Debugging](https://www.amazon.com/Scientific-Debugging-Systematic-Finding-Fixing/dp/1558608168) - Zeller's delta debugging

## Changelog

- **v1.0** (2025-11-15): Initial version with 6-step systematic process
