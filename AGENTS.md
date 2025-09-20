**Build/Lint/Test**
- Build: none (docs repo). If Python code added, follow below.
- Dev tools: `uv add -D ruff mypy pytest`
- Lint/format: `uv run ruff check .` | fix `--fix`; format `uv run ruff format .`
- Types: `uv run mypy .`
- Tests: `uv run pytest -q`; single: `-k 'pattern'` or `<file>::<Class>::<test>` with `-q`

**Environment**
- Package manager: `uv add` to install, `uv run` to execute
- macOS: avoid `timeout`; use `fd` for file search
- Models: only `gpt-4.1{,-mini}` or `gpt-5{,-mini}`; configure, don’t hardcode

**Code Style**
- Imports: absolute, sorted; no wildcard; top-level only
- Formatting: ruff format enforced; no manual deviations
- Typing: Python 3.12; `from __future__ import annotations`; built-in generics; `|` unions; never `Any`
- Naming: PEP 8 — snake_case (vars/functions), PascalCase (classes), UPPER_SNAKE_CASE (constants); private with leading `_`
- Error handling & logging: fail fast; no fallbacks/magic defaults; no bare `except`; never swallow; use `logging.exception`; no `print` in libs
- Separation: code in `.py`; secrets via env; config in `config.toml`
- Commits: small, conventional; messages explain “why” over “what”
- Quality gates: enforce `agents/bs-check.md` and `agents/bs-enforce.md`; see `CLAUDE.md`