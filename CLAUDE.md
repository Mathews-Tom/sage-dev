- The system uses `uv` as the package manager and hence we should be using the command `uv add` to install packages and `uv run` to execute commands or run scripts.
- This system is running macOS and hence should not use the command that don't exist on a mac, like `timeout`
- Use the UNIX command `fd` to search for files and folders in the system.


# CLAUDE.md

## Overview

This document defines the internal engineering and coding guidelines for this system. It establishes standards for environment setup, model usage, coding practices, testing discipline, and workflow rules. These instructions are mandatory and intended to maintain consistency, reliability, and quality across the project.

*Last updated: 2025-09-19*

---

## Environment & Tools

* Use `uv` as the package manager:

  * Install packages with `uv add`.
  * Execute commands or scripts with `uv run`.
* The system runs on macOS:

  * Do not use unsupported commands (e.g., `timeout`).
* Use the UNIX command `fd` for searching files and directories.

---

## Output Style

* Default output style: **`only-way`**.
* All responses must be concise, factual, and technical.
* Avoid self-congratulatory or adjective-heavy phrasing.

---

## Code & Testing Rules

* **File handling:**
  * Do not create files unless absolutely necessary.
  * Always prefer editing existing files.
  * Create documentation files (`*.md`, `README`) only when explicitly requested.
* **Testing discipline:**
  * Never create simplified or mock tests.
  * Always test with the production pipeline.
* **Typing:**
  * Never use `any`.
  * Always use correct types and verify when in doubt.
* **Error handling:**
  * Fail fast. Throw errors early and explicitly.
  * Do not use fallbacks or graceful degradation.
* **Refactoring:**
  * Breaking code during refactoring is acceptable in pre-production.

---

## Models & Configurations

* Only use **GPT Mini or Normal models**:

  * `gpt-4.1`
  * `gpt-4.1-mini`
  * `gpt-5`
  * `gpt-5-mini`

* Remove obsolete model references (e.g., `gpt-3.5-turbo`, `gpt-4o-mini`).
* Do not hardcode model references in code.
* Store model references only in configuration files.

---

## No Bullshit Code

* Enforce quality with `bs-check` and `bs-enforce` agents in `.claude/agents/`.
* Write **only** what is asked for — nothing more, nothing less.
* **Before coding:**
  * Check for bullshit patterns (fallbacks, mocks, templates, error swallowing).
* **After coding:**
  * Verify that no bullshit patterns were introduced.
* Apply `bs-check` to clean existing codebases.
* Apply `bs-enforce` to block new bullshit from entering.

---

## Core Code Principles

* **DRY (Don’t Repeat Yourself):**
  * Reuse existing code, functions, and patterns wherever possible.
* **Separation of concerns:**
  * Place code in `.py` files.
  * Store secrets in environment variables.
  * Keep configuration in `config.toml`.
* **Commit discipline:**
  * Commit frequently with small, logical units.
  * Use clear and descriptive commit messages after each working change.

---

## References

* `bs-check` and `bs-enforce`: Tools for enforcing coding discipline by detecting and blocking patterns of poor practices.
* Project configs and environment rules are defined in `.claude/agents/` and `config.toml`.
