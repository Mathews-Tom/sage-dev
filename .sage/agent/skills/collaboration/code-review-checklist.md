---
name: "Code Review Checklist"
category: "collaboration"
languages:
  - python
  - typescript
prerequisites:
  tools:
    - git>=2.0
  knowledge:
    - basic-git-workflow
evidence:
  - "https://google.github.io/eng-practices/review/"
  - "https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/"
  - "Book: Code Review in Practice by Sebastian Veith"
validated: true
validated_by:
  - doc-validator
---

# Code Review Checklist

## Purpose

**When to use:**
- Reviewing pull requests before merge
- Providing constructive feedback to teammates
- Learning from others' code
- Ensuring code quality standards
- Knowledge sharing across team

**When NOT to use:**
- Reviewing your own code without fresh eyes (wait 24 hours)
- Emergency hotfixes (review post-merge, but still review)
- Nitpicking style issues (automate with linters instead)

**Benefits:**
- Catches bugs before production
- Shares knowledge across team
- Ensures consistent code quality
- Provides learning opportunities
- Reduces technical debt

## Prerequisites

### Tools Required

```bash
which git && git --version
```

### Knowledge Required

- Git workflows (branching, PRs)
- Project coding standards
- Domain knowledge of the feature area

## Algorithm

### Step 1: Understand Context

**What:** Read PR description and linked issues before code
**Why:** Context determines if implementation is appropriate
**How:**
```markdown
# PR Review Start Checklist
- [ ] Read PR title and description
- [ ] Check linked issue/ticket for requirements
- [ ] Note the scope: bug fix, feature, refactoring
- [ ] Identify affected areas of codebase
- [ ] Check PR size (aim for <400 lines changed)
```

**Verification:**
- You understand WHAT is being changed and WHY
- Scope is clear and appropriately sized
- No questions about intent before reading code

### Step 2: Review for Correctness

**What:** Verify code does what it claims to do
**Why:** Logic errors are highest impact bugs
**How:**
```python
# Ask yourself:
# - Does the logic match the requirements?
# - Are edge cases handled?
# - Are error conditions handled appropriately?

# Example: Reviewing a discount calculation
def apply_discount(price: float, discount_percent: float) -> float:
    # REVIEW QUESTIONS:
    # 1. What if price is negative? (edge case)
    # 2. What if discount_percent > 100? (edge case)
    # 3. Is rounding handled correctly? (precision)
    return price * (1 - discount_percent / 100)

# Better version handles edge cases:
def apply_discount(price: float, discount_percent: float) -> float:
    if price < 0:
        raise ValueError("Price cannot be negative")
    if not 0 <= discount_percent <= 100:
        raise ValueError("Discount must be between 0 and 100")
    return round(price * (1 - discount_percent / 100), 2)
```

**Verification:**
- Logic matches stated requirements
- Edge cases considered
- Error handling present
- No obvious bugs

### Step 3: Review for Security

**What:** Check for common security vulnerabilities
**Why:** Security issues can be critical and hard to fix later
**How:**
```python
# Security checklist:
# - [ ] No hardcoded secrets (passwords, API keys)
# - [ ] Input validation present
# - [ ] SQL injection prevented (parameterized queries)
# - [ ] XSS prevented (output encoding)
# - [ ] Authentication/authorization checks

# BAD: SQL injection vulnerability
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"  # DANGEROUS!
    return db.execute(query)

# GOOD: Parameterized query
def get_user(user_id: int):
    query = "SELECT * FROM users WHERE id = :id"
    return db.execute(query, {"id": user_id})
```

**Verification:**
- No secrets in code
- All inputs validated/sanitized
- No injection vulnerabilities
- Proper authorization checks

### Step 4: Review for Maintainability

**What:** Assess code clarity and future maintenance burden
**Why:** Code is read more than written; maintainability matters
**How:**
```typescript
// Maintainability checklist:
// - [ ] Meaningful variable/function names
// - [ ] Functions are focused (single responsibility)
// - [ ] No magic numbers (use named constants)
// - [ ] Comments explain "why" not "what"
// - [ ] Code is DRY (Don't Repeat Yourself)

// BAD: Unclear and unmaintainable
function p(d: any[]): number {
  let t = 0;
  for (let i = 0; i < d.length; i++) {
    t += d[i].v * 0.08; // What is 0.08?
  }
  return t;
}

// GOOD: Clear and maintainable
const TAX_RATE = 0.08;

function calculateTotalTax(lineItems: LineItem[]): number {
  return lineItems.reduce((total, item) => total + item.value * TAX_RATE, 0);
}
```

**Verification:**
- Names are descriptive and consistent
- Functions are appropriately sized
- Code is readable without explanation
- Future developers can understand it

### Step 5: Review Tests

**What:** Verify test coverage and quality
**Why:** Tests are the safety net for the code
**How:**
```python
# Test review checklist:
# - [ ] Tests exist for new/changed code
# - [ ] Tests cover happy path
# - [ ] Tests cover error conditions
# - [ ] Tests are readable and maintainable
# - [ ] No testing implementation details

# GOOD test: Behavior-focused
def test_apply_discount_reduces_price():
    original_price = 100.00
    discount_percent = 10

    final_price = apply_discount(original_price, discount_percent)

    assert final_price == 90.00

def test_apply_discount_rejects_negative_price():
    with pytest.raises(ValueError, match="Price cannot be negative"):
        apply_discount(-10, 10)

# BAD test: Tests implementation detail
def test_apply_discount_uses_multiplication():
    # Don't test HOW, test WHAT
    pass
```

**Verification:**
- New code has corresponding tests
- Tests verify behavior, not implementation
- Edge cases tested
- Tests are readable

### Step 6: Provide Constructive Feedback

**What:** Comment with specific, actionable, and kind feedback
**Why:** Goal is to improve code AND help author learn
**How:**
```markdown
# Good comment format:
# [Priority] [Category]: [Observation] [Suggestion]

# BLOCKING (must fix):
"🔴 Security: This SQL query is vulnerable to injection.
Consider using parameterized queries: `db.execute(query, params)`"

# SHOULD FIX (important but not blocking):
"🟡 Maintainability: This function is 80 lines long.
Consider extracting the validation logic into a separate method."

# SUGGESTION (optional improvement):
"🟢 Style: The variable `d` could be more descriptive.
Consider renaming to `data` or `items` for clarity."

# QUESTION (seeking clarification):
"❓ I don't understand why we're caching this result.
Could you explain the performance requirement?"

# PRAISE (acknowledge good work):
"👍 Great use of the strategy pattern here!
This makes the code very extensible."
```

**Verification:**
- Feedback is specific and actionable
- Tone is constructive and respectful
- Priority is clear (blocking vs suggestion)
- Questions are asked when unclear

### Step 7: Approve or Request Changes

**What:** Make final decision on PR status
**Why:** Clear resolution enables workflow to continue
**How:**
```markdown
# Approval: No blocking issues, code is good to merge
"✅ LGTM (Looks Good To Me)

Great work! Code is well-structured and tests are comprehensive.
Minor suggestions above are optional improvements."

# Request Changes: Blocking issues must be addressed
"🔄 Request Changes

Please address the security concern in `user_service.py:45`
and add test coverage for the error handling path.
Happy to re-review once updated!"

# Comment: Need more information before deciding
"💬 Comment

I have some questions about the caching strategy.
Could we discuss before I complete my review?"
```

**Verification:**
- Decision is clear and justified
- Blocking issues are identified
- Path forward is clear for author
- Timeline expectations set if needed

## Validation

### Success Criteria

- [ ] Context understood before reading code
- [ ] Correctness verified (logic matches requirements)
- [ ] Security checked (no vulnerabilities)
- [ ] Maintainability assessed (readable, DRY)
- [ ] Tests reviewed (coverage, quality)
- [ ] Feedback is constructive and actionable
- [ ] Clear approval/rejection with reasoning

### Automated Validation

```bash
# Pre-review automated checks
git diff --stat origin/main...HEAD  # Check PR size
pytest --cov=src --cov-fail-under=80  # Verify coverage
flake8 src/ --count  # Style violations
mypy src/  # Type checking
```

### Manual Verification

1. Reviewer understands the change fully
2. All critical issues identified
3. Author learns from feedback
4. Code quality improved post-review
5. Review completed in reasonable time (<2 hours)

## Common Pitfalls

### Pitfall 1: Reviewing Without Understanding Context

**Symptom:** Comments miss the point or contradict requirements
**Cause:** Jumping into code without reading PR description
**Solution:** Always read issue/ticket and PR description first

### Pitfall 2: Nitpicking Style Issues

**Symptom:** 50 comments about spacing and naming conventions
**Cause:** Manual enforcement of style rules
**Solution:** Automate style checks with linters; focus on logic and design

### Pitfall 3: Being Too Harsh or Too Lenient

**Symptom:** Author feels attacked OR obvious bugs slip through
**Cause:** Lack of balance in feedback approach
**Solution:** Be kind but honest; prioritize critical issues; praise good work

### Pitfall 4: Rubber Stamping

**Symptom:** LGTM without actually reviewing
**Cause:** Time pressure or trust without verification
**Solution:** If you can't review properly, ask someone else to

## Examples

### Python Example

**Scenario:** Reviewing a user registration endpoint

```python
# PR: Add user registration endpoint
# Linked Issue: #123 - User can create account with email and password

# Code to review:
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data["email"]
    password = data["password"]

    # Check if user exists
    existing = User.query.filter_by(email=email).first()
    if existing:
        return {"error": "Email exists"}, 400

    # Create user
    user = User(email=email, password=password)
    db.session.add(user)
    db.session.commit()

    return {"id": user.id}, 201

# REVIEW COMMENTS:

# 🔴 BLOCKING - Security
# Line 4-5: No input validation.
# What if request.json is None? What if email/password keys missing?
# Suggestion: Add validation and proper error handling
# Example:
# if not request.json or "email" not in request.json:
#     return {"error": "Missing email"}, 400

# 🔴 BLOCKING - Security
# Line 13: Storing plaintext password!
# Passwords must be hashed before storage.
# Suggestion: Use werkzeug.security.generate_password_hash()
# Example: password_hash = generate_password_hash(password)

# 🟡 SHOULD FIX - Correctness
# Line 7-9: Race condition possible.
# Between check and insert, another request could create same email.
# Suggestion: Use database unique constraint and handle IntegrityError

# 🟢 SUGGESTION - Maintainability
# Line 15: Consider returning more user data (email, created_at)
# Or follow consistent API response format

# Overall: 🔄 REQUEST CHANGES
# Critical security issues must be fixed before merge.
# Please address password hashing and input validation.
```

### TypeScript Example

**Scenario:** Reviewing a shopping cart service

```typescript
// PR: Add cart item removal
// Linked Issue: #456 - User can remove items from cart

// Code to review:
class CartService {
  removeItem(cartId: string, itemId: string): Cart {
    const cart = this.cartRepository.findById(cartId);
    cart.items = cart.items.filter((i) => i.id !== itemId);
    return this.cartRepository.save(cart);
  }
}

// REVIEW COMMENTS:

// 🔴 BLOCKING - Correctness
// Line 2: What if cart doesn't exist?
// findById could return null/undefined.
// Suggestion: Add null check
// Example:
// const cart = this.cartRepository.findById(cartId);
// if (!cart) {
//   throw new CartNotFoundError(cartId);
// }

// 🟡 SHOULD FIX - Maintainability
// Line 3: Mutating cart.items directly.
// Consider immutable approach for predictability.
// Example:
// const updatedItems = cart.items.filter(...);
// return this.cartRepository.save({ ...cart, items: updatedItems });

// 🟢 SUGGESTION - User Experience
// What if itemId doesn't exist in cart?
// Should we silently succeed or notify caller?
// Consider returning whether item was actually removed.

// 👍 PRAISE
// Good use of filter() method - clean and readable!
// Service method is focused on single responsibility.

// ❓ QUESTION
// Is there a test for removing a non-existent item?
// I don't see it in the test file.

// Overall: 🔄 REQUEST CHANGES
// Please handle the null cart case.
// Other suggestions are optional but recommended.
```

## References

- [Google Engineering Practices: Code Review](https://google.github.io/eng-practices/review/) - Industry standard guide
- [SmartBear Code Review Best Practices](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/) - Data-driven practices
- [Thoughtbot Code Review Guide](https://github.com/thoughtbot/guides/tree/main/code-review) - Practical examples
- [The Art of Readable Code](https://www.oreilly.com/library/view/the-art-of/9781449318482/) - Dustin Boswell
- [How to Make Good Code Reviews Better](https://stackoverflow.blog/2019/09/30/how-to-make-good-code-reviews-better/) - Stack Overflow insights

## Changelog

- **v1.0** (2025-11-15): Initial version with 7-step review process
