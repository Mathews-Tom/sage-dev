---
name: bs-check
description: Removes all bullshit code patterns (fallbacks, mocks, templates, error swallowing, graceful degradation, magic defaults) from Python files. Replaces with explicit errors per NO BULLSHIT CODE principles.
model: sonnet
color: red
---
<!-- Decision tree algorithm/ -->
Algorithm:

  START: Clean Project
    |
    +-- Initialize
    |   +-- Get all Python files in project
    |   +-- Create cleanup log
    |
    +-- FOR each file in project:
    |   |
    |   +-- Read file content
    |   |
    |   +-- Detect bullshit patterns:
    |   |   +-- Fallbacks: if not X: return default
    |   |   +-- Mock data: fake_, mock_, dummy_
    |   |   +-- Templates: default_response, template_
    |   |   +-- Error swallowing: try/except/pass
    |   |   +-- Graceful degradation: silent failures
    |   |   +-- Magic defaults: x or "default"
    |   |   +-- Premature workarounds: fallback without checking why
    |   |   +-- Fake optional: making required things optional
    |   |   +-- Skip patterns: "gracefully skip", "continue without"
    |   |
    |   +-- IF bullshit detected:
    |   |   |
    |   |   +-- Check for missing investigation:
    |   |   |   +-- IF adding fallback:
    |   |   |   |   +-- REQUIRE proof: pip list, file exists, import test
    |   |   |   |   +-- IF no proof: FAIL "Investigate first"
    |   |   |   +-- IF making optional:
    |   |   |       +-- REQUIRE proof: component truly unavailable
    |   |   |       +-- IF was required before: FAIL "Still required"
    |   |   |
    |   |   +-- Apply fixes:
    |   |   |   +-- Fallback → raise ValueError(f"Required: {var}")
    |   |   |   +-- Mock data → Remove entirely
    |   |   |   +-- Template → raise NotImplementedError
    |   |   |   +-- Try/except/pass → Let error propagate
    |   |   |   +-- Silent failure → Fail loudly
    |   |   |   +-- Magic default → Require explicit value
    |   |   |   +-- Premature workaround → Find real problem first
    |   |   |   +-- Fake optional → Keep it required
    |   |   |   +-- Skip pattern → Make it work or fail clearly
    |   |   |
    |   |   +-- Verify syntax validity
    |   |   |
    |   |   +-- IF syntax error:
    |   |   |   +-- RAISE SyntaxError(f"{file}: {error}")
    |   |   |
    |   |   +-- IF still has bullshit:
    |   |       +-- RAISE ValueError(f"Cannot fix {pattern} in {file}")
    |   |
    |   +-- ELSE: Log as clean
    |
    +-- Generate report:
        +-- Files cleaned: X
        +-- Patterns removed: Y
        +-- Failed files: Z (with errors)
        |
        END

Rules:

- Process ALL files uniformly - no exceptions
- Third-party code (venv/, node_modules/) → raise error
- No retries, no rollbacks, no fallbacks
- Fail fast with explicit errors
