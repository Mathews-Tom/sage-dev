---
allowed-tools: Bash(find:*), Bash(cat:*), Bash(grep:*), Bash(mkdir:*), Bash(tee:*), WebSearch, SequentialThinking
description: Generate minimal POC documentation for quick, throwaway validation of core concept.
---

## Role

Technical architect designing disposable proof-of-concept to validate core innovation in 1-3 days.

## Clarification Phase

Before generating POC, ask user:

1. **Core Concept:**
   - "In one sentence, what is the ONE thing this POC needs to prove?"
   - "What's the simplest possible way to validate this?"
   - "What would make you confident to throw this away and build properly?"

2. **Validation Criteria:**
   - "What's the minimal output that proves success?"
   - "What can we hardcode? (Everything should be hardcoded)"
   - "What's acceptable performance for validation? (Rough numbers okay)"

3. **Constraints:**
   - "How many hours can you spend on this? (Should be <24 hours)"
   - "Any specific technology required, or can we use whatever's fastest?"

## Execution

1. **Discover**:

   ```bash
   find docs -type f -name "*.md" | sort
   ```

2. **Analyze**: `cat` all documentation and use `SequentialThinking` to:
   - Identify the SINGLE core innovation
   - Strip away ALL non-essential features
   - Find the absolute minimum to validate hypothesis

3. **Research**: `WebSearch` for:
   - Simplest implementation approach
   - Quick-and-dirty code examples
   - Minimal dependency solutions

4. **Clarify**: Ask user the questions above

5. **Generate**: Create minimal POC documentation:

   ```bash
   mkdir -p docs/poc
   tee docs/poc/README.md
   tee docs/poc/CORE_CONCEPT.md
   tee docs/poc/THROWAWAY_CODE.md
   ```

## POC Documentation Structure

### docs/poc/README.md

````markdown
# POC: [System Name] - Core Concept Validation

⚠️ **THIS IS DISPOSABLE CODE - DO NOT EXTEND OR REFACTOR**

## Purpose

Validate: [ONE specific hypothesis in plain English]

**Expected outcome:** Prove that [X] works before investing in full implementation.

## Quick Start

```bash
# Setup (should take <5 minutes)
[2-3 commands maximum]

# Run POC
[Single command to execute]

# Expected output
[What success looks like - specific output/number/behavior]
```

## Success Criteria

- ✅ Core concept works: [Specific measurable outcome]
- ✅ Performance acceptable: [Rough numbers - "under 1 second" is fine]
- ✅ Ready to delete: If this proves it works, throw it away

## What Happens Next

### If Successful ✓

1. **DELETE this entire `docs/poc/` folder**
2. Run `/plan` to design proper implementation
3. Start fresh - do NOT reuse this code

### If Failed ✗

1. Document what didn't work
2. Revise approach
3. Try different hypothesis or pivot

## Timeline

**Target:** 1-3 days (8-24 hours of work)
**Maximum:** Never spend more than 3 days on POC

If you're spending longer, you're over-engineering. Stop and reassess.

````

### docs/poc/CORE_CONCEPT.md

````markdown
# Core Concept - What We're Proving

## The Hypothesis

**We believe:** [Core assumption in one sentence]

**To validate this, we must prove:** [Single specific thing]

**Simplest possible test:** [Minimal example that proves/disproves]

## Essential Only

### What We MUST Include
- [Component 1]: [Why absolutely necessary]
- [Component 2]: [Why absolutely necessary]
- [Maximum 2-3 items]

### What We're IGNORING (On Purpose)
- ❌ Authentication/Authorization - Not needed for validation
- ❌ Database - Use in-memory dict/array
- ❌ Error handling - Happy path only
- ❌ Edge cases - Test with ideal inputs
- ❌ UI/UX - Print to console is fine
- ❌ Logging/Monitoring - Use print statements
- ❌ Testing - One manual test is enough
- ❌ Configuration - Hardcode everything
- ❌ Documentation - This POC IS the documentation
- ❌ Code quality - Ugly code is encouraged
- ❌ [Any other non-essential component]

## Minimal Workflow

```

Input: [Hardcoded test case]
  ↓
[Core Process]: [Single algorithm/transformation]
  ↓
Output: [Expected result]

```

**That's it.** If you're thinking about more steps, you're overthinking.

## Anti-Patterns We WANT

**For this POC, we ENCOURAGE:**
- ✅ Global variables
- ✅ No functions (just linear code)
- ✅ Copy-paste
- ✅ Hardcoded values
- ✅ No error handling
- ✅ Magic numbers
- ✅ No abstractions
- ✅ Spaghetti code
- ✅ No comments

**Remember:** This code will be deleted. Write the worst code of your career.

## Validation Example

```python
# Hardcoded test
test_input = "example query"

# Expected output
expected_result = "specific expected value"

# Run core concept
actual_result = core_function(test_input)

# Validate
print(f"Expected: {expected_result}")
print(f"Got: {actual_result}")
print(f"Success: {actual_result == expected_result}")
```

## Success Metrics (Rough)

**Functional:**

- Does it produce correct output? Y/N
- [ONE other specific metric]

**Performance (ballpark okay):**

- Runs in reasonable time? (<1 sec, <10 sec, <1 min - pick one)

**That's all we care about.**

````

### docs/poc/THROWAWAY_CODE.md

````markdown
# Implementation Guide - Disposable Code

⚠️ **READ THIS FIRST**: This code is meant to be DELETED. Do not try to make it good.

## Timeline: 1-3 Days MAX

### Hour 0-2: Setup
- Install ONE library if absolutely needed
- Create single file: `poc.py` (or `poc.js`, `poc.go`, etc.)
- Hardcode test data directly in file

### Hour 2-8: Core Implementation
- Write procedural code - no classes, no functions unless unavoidable
- Copy-paste freely
- Skip all error handling
- Focus on happy path only

### Hour 8-12: Validation
- Run with test data
- Print results
- Compare to expected outcome
- Document if it worked

### Hour 12-24: Iteration (if needed)
- If failed, try different approach
- Still keep it ugly and simple
- Do NOT refactor or improve

**If you hit 24 hours, STOP.** The POC has failed - reassess approach.

## File Structure (Absolute Minimum)

```

docs/poc/
├── README.md           # This documentation
├── CORE_CONCEPT.md     # What we're proving
├── THROWAWAY_CODE.md   # You are here
└── poc.py              # THE ENTIRE POC (one file)

```

Optional if absolutely necessary:
```

├── requirements.txt    # Maximum 3 dependencies
└── test_data.json      # If hardcoding in code is too messy

```

**Never create:**
- ❌ Multiple modules
- ❌ Config files
- ❌ Test suites
- ❌ Documentation beyond these 3 files
- ❌ Docker/deployment stuff

## The Entire POC (Template)

```python
#!/usr/bin/env python3
"""
POC: [Core Concept]
THROWAWAY CODE - DELETE AFTER VALIDATION

Purpose: Prove [hypothesis] works
Expected: [outcome]
"""

# Hardcode everything
TEST_INPUT = "sample data"
EXPECTED_OUTPUT = "expected result"
CONFIG = {
    "param1": "hardcoded_value",
    "param2": 42
}

def main():
    # Step 1: [Minimal setup]
    data = TEST_INPUT
    
    # Step 2: [Core algorithm - THE ONLY IMPORTANT PART]
    result = core_logic(data)
    
    # Step 3: [Validate]
    print(f"Input: {data}")
    print(f"Expected: {EXPECTED_OUTPUT}")
    print(f"Got: {result}")
    print(f"SUCCESS: {result == EXPECTED_OUTPUT}")
    
    return result == EXPECTED_OUTPUT

def core_logic(input_data):
    """
    THE CORE INNOVATION - This is what we're testing
    Everything else is noise
    """
    # TODO: Implement minimal version of core concept
    # Use hardcoded values, global variables, whatever works
    
    pass  # Replace with actual logic

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
````

## Technology Choice

**Use whatever you know best.** Speed matters more than "right" choice.

- Know Python? Use Python
- Know JavaScript? Use Node.js
- Know Go? Use Go

**Don't use:**

- New languages you want to learn
- Complex frameworks
- Microservices
- Databases (use dict/array)
- Message queues (use function calls)

## Dependencies (Minimize)

**Ideal:** Zero dependencies

**Acceptable:** 1-3 dependencies if they save significant time

**Never:**

- Web frameworks
- ORMs
- Heavy libraries
- Multiple competing solutions

Example `requirements.txt` (if needed):

```txt
# Maximum 3 lines
requests==2.31.0
```

## "Development" Process

1. **Write code directly in `poc.py`**
2. **Run it**: `python poc.py`
3. **Did it work?**
   - Yes → Document success, delete code, run `/plan`
   - No → Try different approach, still in same file
4. **Repeat until validated or 24 hours elapsed**

**No:**

- Version control (Git is overkill for POC)
- Code reviews
- Testing frameworks
- Debugging sessions >1 hour

## Validation Checklist

**After running POC:**

- [ ] Core concept proven or disproven
- [ ] Performance measured (rough numbers)
- [ ] Decision made: proceed or pivot
- [ ] Documentation of learnings (3 bullet points max)

**Then immediately:**

- [ ] **DELETE `docs/poc/` folder** (if successful)
- [ ] Run `/plan` to start proper implementation
- [ ] Never look at this code again

## Common Mistakes to Avoid

**DON'T:**

- ❌ Try to make it "production ready"
- ❌ Add error handling "just in case"
- ❌ Write tests "for completeness"
- ❌ Refactor "to make it cleaner"
- ❌ Add features "since we're here"
- ❌ Think about extending it later

**DO:**

- ✅ Write terrible code
- ✅ Hardcode everything
- ✅ Copy-paste freely
- ✅ Skip edge cases
- ✅ Use global variables
- ✅ Print debug statements
- ✅ Delete when done

## Example: What Success Looks Like

```bash
$ python poc.py
Testing core concept: [hypothesis]

Input: sample query
Processing with [core algorithm]...
Output: expected result

Expected: expected result
Got: expected result

✅ SUCCESS - Core concept validated!

Next steps:
1. Delete this POC
2. Run /plan for proper implementation
3. Start fresh
```

## Example: What Failure Looks Like

```bash
$ python poc.py
Testing core concept: [hypothesis]

Input: sample query  
Processing with [core algorithm]...
Output: unexpected result

Expected: expected result
Got: unexpected result

❌ FAILED - Core concept needs revision

Learnings:
- [What didn't work]
- [Why it failed]
- [Alternative approach to try]

Next steps:
1. Revise hypothesis
2. Try different approach
3. Or pivot entirely
```

## Measuring Success

**POC succeeded if:**

- You can confidently say "yes, this works" or "no, this doesn't work"
- You spent <24 hours
- You learned something specific

**POC failed if:**

- You're still unsure after 24 hours
- You're thinking about architecture
- You want to extend the code
- You're refactoring

## Remember

**Good POC code is:**

- Fast to write
- Easy to understand
- Quick to validate
- Simple to delete

**This is not production code. This is not even good code. This is validation code.**

**When done, DELETE IT ALL and start fresh with proper planning.**

## Quality Criteria

Generated POC documentation must:

- Emphasize disposability in every section
- Limit timeline to 1-3 days (24 hours max)
- Encourage bad coding practices
- Focus on single hypothesis validation
- Make deletion the expected outcome
- Discourage any form of optimization

## Key Principles

1. **Single File**: Entire POC in one file if possible
2. **Hardcode Everything**: No config, no environment variables
3. **No Abstractions**: Linear, procedural code
4. **Delete When Done**: Success = deletion
5. **Speed Over Quality**: Ugliest code wins
6. **One Thing Only**: Prove single hypothesis
7. **No Extensions**: Never reuse this code
