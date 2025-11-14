# MCP Server Infrastructure Specification

**Component:** MCP Server Infrastructure
**Type:** Infrastructure Transformation - Phase 1
**Priority:** P0 (Critical - Foundation for all phases)
**Complexity:** Medium
**Estimated Effort:** 80-120 hours (2 weeks)
**Created:** 2025-11-13

**Source Documents:**

- Research: `docs/research/mcp-server-infrastructure-intel.md`
- Feature Request: `docs/features/mcp-server-infrastructure.md`

---

## 1. Overview

### Purpose and Business Value

This specification defines the transformation of Sage-Dev's monolithic command system into a filesystem-based Model Context Protocol (MCP) server architecture. The transformation will enable progressive tool discovery and achieve 92% token reduction on enforcement operations.

**Business Value:**

- **Cost Reduction:** 92% token reduction (150K → 12K tokens) reduces API costs
- **Performance Improvement:** 3x speedup (30s → 10s per enforcement check)
- **Scalability:** Foundation for 50+ MCP servers without context overhead
- **Strategic Alignment:** Implements proven Anthropic pattern for code execution with MCP

### Success Metrics

| Metric | Baseline | Target | Minimum Acceptable |
|--------|----------|--------|-------------------|
| Token Usage | 150,000 | 12,000 (92% reduction) | 60,000 (60% reduction) |
| Execution Time | 30 seconds | 10 seconds (3x faster) | 15 seconds (2x faster) |
| Context Overhead | 270KB | 6KB (97.8% reduction) | 50KB (81% reduction) |
| Agents Loaded | All (4+) | 1-2 (on-demand) | 2-3 (selective) |
| Violation Detection | 100% | 100% (no regression) | 100% (no regression) |

### Target Users

- **Primary:** Sage-Dev developers using enforcement commands (`/sage.enforce`)
- **Secondary:** DevOps engineers integrating enforcement into CI/CD pipelines
- **Tertiary:** Open-source contributors extending the agent ecosystem

---

## 2. Functional Requirements

### FR-1: MCP Server Structure

The system shall:

- FR-1.1: Create a filesystem-based MCP server at `servers/sage-enforcement/`
- FR-1.2: Organize agents in `servers/sage-enforcement/agents/` directory
- FR-1.3: Organize rules in `servers/sage-enforcement/rules/` directory
- FR-1.4: Organize schemas in `servers/sage-enforcement/schemas/` directory
- FR-1.5: Provide an MCP-compliant server entry point at `servers/sage-enforcement/index.ts`
- FR-1.6: Support JSON-RPC 2.0 transport layer over stdio, SSE, or WebSocket
- FR-1.7: Implement MCP lifecycle management (initialize, shutdown)
- FR-1.8: Support bidirectional communication as per MCP specification

**User Story:** As a developer, I want enforcement agents organized in a filesystem-based structure so that agents can be discovered and loaded on-demand.

### FR-2: Type Enforcer Agent

The system shall:

- FR-2.1: Implement a type-enforcer agent at `servers/sage-enforcement/agents/type-enforcer.ts`
- FR-2.2: Validate Python 3.12 type annotations (PEP 585, 604, 698)
- FR-2.3: Detect missing return type annotations
- FR-2.4: Detect usage of deprecated `typing.List`, `typing.Dict`, `typing.Optional`
- FR-2.5: Detect usage of `typing.Any` when stricter types are available
- FR-2.6: Integrate with Pyright for static type analysis (3-5x faster than mypy)
- FR-2.7: Return structured violation results with line numbers and severity
- FR-2.8: Provide auto-fixable suggestions for type violations
- FR-2.9: Use Zod schema validation for input/output validation

**User Story:** As a Python developer, I want my code checked for Python 3.12 type annotation compliance so that I maintain modern typing standards.

### FR-3: Documentation Validator Agent

The system shall:

- FR-3.1: Implement a doc-validator agent at `servers/sage-enforcement/agents/doc-validator.ts`
- FR-3.2: Validate Google-style docstrings for all functions and classes
- FR-3.3: Detect missing Args, Returns, and Raises sections
- FR-3.4: Validate argument documentation completeness
- FR-3.5: Check for outdated docstrings after signature changes
- FR-3.6: Return structured violation results with suggestions
- FR-3.7: Support configurable strictness levels

**User Story:** As a developer, I want complete docstring validation so that my code documentation meets project standards.

### FR-4: Test Coverage Agent

The system shall:

- FR-4.1: Implement a test-coverage agent at `servers/sage-enforcement/agents/test-coverage.ts`
- FR-4.2: Integrate with pytest-cov for Python coverage analysis
- FR-4.3: Enforce minimum coverage thresholds (default: 80%)
- FR-4.4: Identify uncovered code blocks with line numbers
- FR-4.5: Suggest missing test scenarios
- FR-4.6: Support per-file and per-function coverage metrics
- FR-4.7: Block commits below coverage threshold (configurable)

**User Story:** As a developer, I want test coverage automatically validated so that I maintain quality standards.

### FR-5: Security Scanner Agent

The system shall:

- FR-5.1: Implement a security-scanner agent at `servers/sage-enforcement/agents/security-scanner.ts`
- FR-5.2: Detect OWASP Top 10 vulnerabilities (SQL injection, XSS, etc.)
- FR-5.3: Identify hardcoded secrets and API keys
- FR-5.4: Detect insecure coding patterns (eval, exec, unsafe deserialization)
- FR-5.5: Validate input sanitization for user-facing functions
- FR-5.6: Check for proper authentication and authorization
- FR-5.7: Return critical violations with severity: error
- FR-5.8: Provide remediation guidance with code examples

**User Story:** As a security-conscious developer, I want automatic security vulnerability detection so that I prevent security issues before deployment.

### FR-6: Standards and Rules

The system shall:

- FR-6.1: Define Python 3.12 typing standards at `servers/sage-enforcement/rules/typing-standards.ts`
- FR-6.2: Define test coverage standards at `servers/sage-enforcement/rules/test-standards.ts`
- FR-6.3: Define security standards at `servers/sage-enforcement/rules/security-standards.ts`
- FR-6.4: Support configurable strictness levels (strict, moderate, lenient)
- FR-6.5: Allow project-specific overrides via configuration files
- FR-6.6: Provide allow/deny lists for specific patterns
- FR-6.7: Support versioned standards with migration paths

**User Story:** As a project lead, I want configurable enforcement standards so that I can adapt rules to project needs.

### FR-7: Progressive Tool Discovery

The system shall:

- FR-7.1: Support filesystem-based agent discovery via directory listing
- FR-7.2: Load only applicable agents for each file type
- FR-7.3: Map file extensions to applicable agents (`.py` → type-enforcer, doc-validator)
- FR-7.4: Lazy-load agent code only when needed
- FR-7.5: Cache discovered agents per session
- FR-7.6: Support on-demand rules loading
- FR-7.7: Implement agent discovery with <100ms latency (cached), <500ms (cold start)

**User Story:** As a developer checking TypeScript code, I want only TypeScript-relevant agents loaded so that Python agents don't consume my context.

### FR-8: Result Filtering and Context Optimization

The system shall:

- FR-8.1: Filter violations by severity in execution environment before context logging
- FR-8.2: Prioritize error > warning > info violations
- FR-8.3: Limit violations logged to context (top 10 per severity)
- FR-8.4: Provide full violation report in execution environment
- FR-8.5: Support result pagination for large violation sets
- FR-8.6: Compress results using structured JSON format
- FR-8.7: Stream violations progressively as discovered

**User Story:** As a developer reviewing violations, I want only critical issues logged to context so that I'm not overwhelmed with warnings.

### FR-9: Integration with Sage-Dev Workflow

The system shall:

- FR-9.1: Integrate with `/sage.enforce` slash command
- FR-9.2: Support file path and enforcement option parameters
- FR-9.3: Create tickets for unresolved violations in `.sage/tickets/index.json`
- FR-9.4: Link violations to specific tickets with traceability
- FR-9.5: Track resolution progress in ticket system
- FR-9.6: Feed project context from `.sage/context.md` to agents
- FR-9.7: Support batch enforcement operations across multiple files

**User Story:** As a Sage-Dev user, I want enforcement integrated with my existing workflow so that I don't need to learn new tools.

### FR-10: Execution Rules and Directives

The system shall:

- FR-10.1: Document execution rules at `.sage/EXECUTION_RULES.md`
- FR-10.2: Provide explicit on-demand loading directives
- FR-10.3: Provide result filtering guidelines
- FR-10.4: Provide context optimization rules
- FR-10.5: Include 5+ examples of correct usage patterns
- FR-10.6: Include warnings against common anti-patterns (loading all agents, unfiltered results)
- FR-10.7: Support AI agent instruction parsing

**User Story:** As an AI agent, I want clear execution directives so that I load tools efficiently without wasting context.

---

## 3. Non-Functional Requirements

### NFR-1: Performance

- NFR-1.1: Token usage shall be ≤12,000 per enforcement operation (target) or ≤60,000 (minimum)
- NFR-1.2: Execution time shall be ≤10 seconds per file check (target) or ≤15 seconds (minimum)
- NFR-1.3: Agent discovery latency shall be <100ms (cached) or <500ms (cold start)
- NFR-1.4: Batch operations shall process >10 files/minute
- NFR-1.5: Response time shall achieve 3x speedup from 30s baseline
- NFR-1.6: Memory usage shall not exceed 512MB per isolated instance
- NFR-1.7: Cache hit rate shall be >80% for repeated operations

### NFR-2: Security

- NFR-2.1: Code execution shall occur in sandboxed environment (V8 Isolates or separate process)
- NFR-2.2: Resource limits shall prevent infinite loops and memory exhaustion
- NFR-2.3: CPU time limit shall be 60 seconds per agent execution
- NFR-2.4: Memory limit shall be 512MB per isolated instance
- NFR-2.5: Filesystem access shall be restricted to project directory
- NFR-2.6: Path validation shall prevent directory traversal attacks
- NFR-2.7: Input validation shall sanitize all user-provided file paths
- NFR-2.8: Environment variables and sensitive data shall be inaccessible to agents
- NFR-2.9: Audit logging shall track all file operations
- NFR-2.10: Authentication middleware shall support OAuth integration (future)

### NFR-3: Reliability

- NFR-3.1: Violation detection accuracy shall be 100% (no regressions from baseline)
- NFR-3.2: System shall handle empty files gracefully without errors
- NFR-3.3: System shall handle syntax errors by reporting parse errors before type checking
- NFR-3.4: System shall handle very large files (>10,000 lines) with streaming/pagination
- NFR-3.5: System shall handle concurrent requests with proper isolation
- NFR-3.6: System shall handle malformed input with clear Zod validation errors
- NFR-3.7: System shall kill runaway processes with timeout enforcement
- NFR-3.8: Test pass rate shall be >99.5% (no flaky tests)

### NFR-4: Maintainability

- NFR-4.1: Code coverage shall be ≥80% (unit tests), ≥90% (integration tests)
- NFR-4.2: All TypeScript code shall use strict mode with no `any` types
- NFR-4.3: All agent interfaces shall be documented with JSDoc comments
- NFR-4.4: All schemas shall be defined with Zod for automatic JSON Schema generation
- NFR-4.5: All rules shall be externalized to configuration files (not hardcoded)
- NFR-4.6: Test execution time shall be <30 seconds (unit), <2 minutes (integration)
- NFR-4.7: Documentation shall include developer guide for adding new agents

### NFR-5: Scalability

- NFR-5.1: System shall support 50+ MCP servers without context overhead
- NFR-5.2: System shall support parallel agent execution (foundation for Phase 4)
- NFR-5.3: System shall support incremental analysis (only changed files)
- NFR-5.4: System shall support smart caching (cache results per file hash)
- NFR-5.5: System shall support extensibility for community-contributed agents
- NFR-5.6: System shall support multi-language targets (Python, TypeScript, JavaScript)

### NFR-6: Compatibility

- NFR-6.1: System shall comply with MCP specification (2025-03-26 or later)
- NFR-6.2: System shall support TypeScript 5.0+
- NFR-6.3: System shall support Node.js 18+
- NFR-6.4: System shall support Python 3.12+
- NFR-6.5: System shall maintain backward compatibility with `/sage.enforce` command
- NFR-6.6: System shall support JSON-RPC 2.0 protocol
- NFR-6.7: System shall support stdio, SSE, and WebSocket transports

---

## 4. Features & Flows

### Feature 1: MCP Server Foundation (Priority: P0 - Critical)

**Description:** Create the foundational MCP server structure with lifecycle management and protocol compliance.

**Components:**

- `servers/sage-enforcement/index.ts` - MCP server entry point
- `servers/sage-enforcement/schemas/index.ts` - Zod schema definitions
- Package configuration with MCP TypeScript SDK dependencies

**User Flow:**

1. System initializes MCP server on startup
2. Server registers available tools (agents) via MCP protocol
3. Server handles JSON-RPC 2.0 requests over configured transport
4. Server manages lifecycle (initialize → ready → shutdown)

**Input/Output:**

- Input: MCP initialization request
- Output: Tool list with agent metadata (name, description, inputSchema)

### Feature 2: Type Enforcement (Priority: P0 - Critical)

**Description:** Validate Python 3.12 type annotations using Pyright integration.

**Components:**

- `servers/sage-enforcement/agents/type-enforcer.ts`
- `servers/sage-enforcement/rules/typing-standards.ts`

**User Flow:**

1. User executes `/sage.enforce` on Python file
2. System discovers type-enforcer agent for `.py` extension
3. System loads typing-standards rules
4. Agent validates file with Pyright
5. Agent returns structured violations (line, severity, message, suggestion)
6. System filters results (errors first, top 10 per severity)
7. System logs filtered results to context

**Input/Output:**

- Input: `{filePath: string, code: string, standards: object}`
- Output: `{violations: Violation[], summary: {errors: number, warnings: number}}`

### Feature 3: Documentation Validation (Priority: P1 - High)

**Description:** Validate Google-style docstrings for completeness and accuracy.

**Components:**

- `servers/sage-enforcement/agents/doc-validator.ts`

**User Flow:**

1. System loads doc-validator for Python functions/classes
2. Agent parses docstrings and function signatures
3. Agent validates Args, Returns, Raises sections
4. Agent detects missing or outdated documentation
5. Agent returns violations with suggestions

**Input/Output:**

- Input: `{filePath: string, code: string}`
- Output: `{violations: Violation[]}`

### Feature 4: Test Coverage Validation (Priority: P1 - High)

**Description:** Enforce minimum test coverage thresholds using pytest-cov.

**Components:**

- `servers/sage-enforcement/agents/test-coverage.ts`
- `servers/sage-enforcement/rules/test-standards.ts`

**User Flow:**

1. System loads test-coverage agent for production files
2. Agent executes pytest-cov to measure coverage
3. Agent identifies uncovered blocks below threshold
4. Agent suggests missing test scenarios
5. Agent blocks commit if below threshold (configurable)

**Input/Output:**

- Input: `{filePath: string, threshold: number}`
- Output: `{violations: Violation[], coverage: {percentage: number, uncoveredLines: number[]}}`

### Feature 5: Security Scanning (Priority: P0 - Critical)

**Description:** Detect OWASP Top 10 vulnerabilities and insecure coding patterns.

**Components:**

- `servers/sage-enforcement/agents/security-scanner.ts`
- `servers/sage-enforcement/rules/security-standards.ts`

**User Flow:**

1. System loads security-scanner for all code files
2. Agent scans for SQL injection, XSS, hardcoded secrets, etc.
3. Agent detects insecure patterns (eval, exec, unsafe deserialization)
4. Agent validates input sanitization
5. Agent returns critical violations with remediation guidance

**Input/Output:**

- Input: `{filePath: string, code: string}`
- Output: `{violations: Violation[], criticalCount: number}`

### Feature 6: Progressive Discovery & Lazy Loading (Priority: P0 - Critical)

**Description:** On-demand agent loading based on file type and context.

**Components:**

- Agent discovery mechanism
- File extension → agent mapping
- Agent caching system

**User Flow:**

1. User requests enforcement on file(s)
2. System determines file type from extension
3. System loads applicable agent mapping configuration
4. System loads only applicable agents (lazy import)
5. System caches loaded agents for session
6. System executes only loaded agents

**Input/Output:**

- Input: `{filePath: string}`
- Output: `{loadedAgents: string[], executionTime: number}`

### Feature 7: Result Filtering & Context Optimization (Priority: P0 - Critical)

**Description:** Filter and compress results before context logging.

**Components:**

- Result filtering pipeline
- Violation prioritization logic
- Pagination support

**User Flow:**

1. Agent returns all violations
2. System filters by severity (error > warning > info)
3. System sorts within each severity
4. System paginates to top N results (default: 10 per severity)
5. System logs filtered results to context
6. Full results available in execution environment

**Input/Output:**

- Input: `{violations: Violation[], maxPerSeverity: number}`
- Output: `{filtered: Violation[], total: number, truncated: number}`

### Feature 8: Execution Rules & AI Directives (Priority: P0 - Critical)

**Description:** Clear directives for AI agents on efficient tool usage.

**Components:**

- `.sage/EXECUTION_RULES.md` documentation
- Rule examples and anti-pattern warnings

**User Flow:**

1. AI agent reads EXECUTION_RULES.md
2. Agent understands on-demand loading pattern
3. Agent follows result filtering guidelines
4. Agent avoids anti-patterns (loading all tools, unfiltered results)

**Input/Output:**

- Input: AI agent instruction set
- Output: Efficient tool usage behavior

---

## 5. Acceptance Criteria

### AC-1: MCP Server Structure

- [ ] Directory structure `servers/sage-enforcement/` created with subdirectories: `agents/`, `rules/`, `schemas/`
- [ ] MCP server entry point `servers/sage-enforcement/index.ts` implements JSON-RPC 2.0 protocol
- [ ] Server registers all 4 agents as MCP tools
- [ ] Server supports stdio transport (minimum)
- [ ] Server handles initialize, tools/list, tools/call, shutdown requests
- [ ] Integration test validates MCP protocol compliance

### AC-2: Type Enforcer Agent

- [ ] Agent implemented at `servers/sage-enforcement/agents/type-enforcer.ts`
- [ ] Detects missing return type annotations (100% accuracy)
- [ ] Detects deprecated `typing.List`, `typing.Dict`, `typing.Optional` (100% accuracy)
- [ ] Detects inappropriate `typing.Any` usage (100% accuracy)
- [ ] Integrates with Pyright for static analysis
- [ ] Returns structured violations with line numbers
- [ ] Provides auto-fixable suggestions
- [ ] Input/output validated with Zod schemas
- [ ] Unit test coverage ≥80%

### AC-3: Documentation Validator Agent

- [ ] Agent implemented at `servers/sage-enforcement/agents/doc-validator.ts`
- [ ] Validates Google-style docstrings
- [ ] Detects missing Args, Returns, Raises sections
- [ ] Detects outdated docstrings after signature changes
- [ ] Returns structured violations with suggestions
- [ ] Unit test coverage ≥80%

### AC-4: Test Coverage Agent

- [ ] Agent implemented at `servers/sage-enforcement/agents/test-coverage.ts`
- [ ] Integrates with pytest-cov
- [ ] Enforces minimum coverage threshold (default: 80%)
- [ ] Identifies uncovered lines with line numbers
- [ ] Suggests missing test scenarios
- [ ] Blocks commits below threshold (configurable)
- [ ] Unit test coverage ≥80%

### AC-5: Security Scanner Agent

- [ ] Agent implemented at `servers/sage-enforcement/agents/security-scanner.ts`
- [ ] Detects SQL injection vulnerabilities
- [ ] Detects XSS vulnerabilities
- [ ] Detects hardcoded secrets and API keys
- [ ] Detects insecure patterns (eval, exec)
- [ ] Provides remediation guidance
- [ ] Returns critical violations with severity: error
- [ ] Unit test coverage ≥80%

### AC-6: Standards and Rules

- [ ] `servers/sage-enforcement/rules/typing-standards.ts` defines Python 3.12 standards
- [ ] `servers/sage-enforcement/rules/test-standards.ts` defines coverage standards
- [ ] `servers/sage-enforcement/rules/security-standards.ts` defines security rules
- [ ] Rules support configurable strictness levels
- [ ] Rules support allow/deny lists
- [ ] Rules externalized (not hardcoded in agents)

### AC-7: Progressive Discovery

- [ ] Agent discovery via filesystem directory listing implemented
- [ ] File extension → agent mapping configuration created
- [ ] Only applicable agents loaded for each file type
- [ ] Agent code lazy-loaded on-demand
- [ ] Agents cached per session
- [ ] Discovery latency <100ms (cached), <500ms (cold start)
- [ ] Token usage reduced by ≥60% (minimum acceptable)

### AC-8: Result Filtering

- [ ] Violations filtered by severity in execution environment
- [ ] Error violations prioritized over warnings/info
- [ ] Top 10 violations per severity logged to context
- [ ] Full violation report available in execution environment
- [ ] Result pagination implemented
- [ ] Progressive streaming implemented

### AC-9: Performance Targets

- [ ] Token usage ≤12,000 per operation (target) or ≤60,000 (minimum)
- [ ] Execution time ≤10 seconds per file (target) or ≤15 seconds (minimum)
- [ ] Context overhead ≤6KB (target) or ≤50KB (minimum)
- [ ] Batch operations process >10 files/minute
- [ ] Performance benchmarks documented in `PHASE_1_RESULTS.md`

### AC-10: Security & Reliability

- [ ] Code execution in sandboxed environment (V8 Isolates or separate process)
- [ ] CPU time limit enforced (60 seconds)
- [ ] Memory limit enforced (512MB)
- [ ] Filesystem access restricted to project directory
- [ ] Path validation prevents directory traversal
- [ ] Input validation with Zod schemas
- [ ] Violation detection accuracy 100% (no regressions)
- [ ] Security penetration tests passed

### AC-11: Documentation

- [ ] `.sage/EXECUTION_RULES.md` created with explicit directives
- [ ] `README.md` explains MCP server architecture
- [ ] `ARCHITECTURE.md` documents system design
- [ ] `PHASE_1_RESULTS.md` reports metrics and benchmarks
- [ ] Developer guide for adding new agents created
- [ ] All code documented with JSDoc comments

### AC-12: Testing

- [ ] Unit test coverage ≥80%
- [ ] Integration test coverage ≥90%
- [ ] Performance benchmarks run and documented
- [ ] Test pass rate >99.5% (no flaky tests)
- [ ] Test execution time <30s (unit), <2min (integration)
- [ ] All critical scenarios tested (see test scenarios below)

### AC-13: Integration with Sage-Dev

- [ ] `/sage.enforce` command triggers MCP server
- [ ] File paths and options passed correctly
- [ ] Violations create tickets in `.sage/tickets/index.json`
- [ ] Violations linked to tickets with traceability
- [ ] Project context from `.sage/context.md` fed to agents (if exists)
- [ ] Batch operations supported
- [ ] Backward compatibility maintained (no breaking changes)

---

## 6. Dependencies

### Technical Dependencies

**Required:**

| Dependency | Version | Purpose |
|------------|---------|---------|
| TypeScript | 5.0+ | Type-safe agent implementation |
| Node.js | 18+ | MCP server runtime |
| Python | 3.12+ | Enforcement target language |
| @modelcontextprotocol/sdk | latest | Official MCP TypeScript SDK |
| zod | latest | Schema validation & JSON Schema generation |
| pyright | latest | Python type checking (3-5x faster than mypy) |
| pytest-cov | latest | Python test coverage analysis |

**Optional:**

| Dependency | Version | Purpose |
|------------|---------|---------|
| vitest | latest | TypeScript testing framework |
| isolated-vm | latest | V8 Isolates for sandboxing |
| Docker | latest | Alternative sandboxing approach |

**Installation:**

```bash
# MCP server dependencies
npm install @modelcontextprotocol/sdk zod
npm install -D typescript@5 pyright vitest

# Python dependencies
uv add pytest-cov
```

### External Integrations

- **MCP Protocol:** Compliance with specification 2025-03-26 or later
- **Pyright:** Static type analysis for Python 3.12
- **pytest-cov:** Coverage measurement for Python
- **Git:** Version control integration for incremental analysis
- **CI/CD:** GitHub Actions, GitLab CI (future integration)

### Feature Dependencies

**Prerequisites:**

- [ ] Repository initialized with `/sage.init`
- [ ] Directory structure: `docs/`, `.sage/`, `commands/` exist
- [ ] Python 3.12+ installed
- [ ] Node.js 18+ installed
- [ ] TypeScript compiler available

**Blockers:**

- None (Phase 1 is foundational)

**Enables:**

- Phase 2: Context Optimization & Caching (builds on MCP infrastructure)
- Phase 3: Automatic Skill Evolution (uses agent discovery)
- Phase 4: Parallel Agent Orchestration (requires MCP servers)

### Cross-Component Dependencies

- **Slash Command System:** `/sage.enforce` triggers MCP server
- **Ticket System:** `.sage/tickets/index.json` stores violations
- **Context System:** `.sage/context.md` provides project context (if exists)

---

## 7. Target Files

### New Files (Create)

| File Path | Purpose | Size Est. |
|-----------|---------|-----------|
| `servers/sage-enforcement/index.ts` | MCP server entry point | 200 lines |
| `servers/sage-enforcement/schemas/index.ts` | Zod schema definitions | 150 lines |
| `servers/sage-enforcement/agents/type-enforcer.ts` | Python type validation agent | 300 lines |
| `servers/sage-enforcement/agents/doc-validator.ts` | Docstring validation agent | 250 lines |
| `servers/sage-enforcement/agents/test-coverage.ts` | Coverage checking agent | 200 lines |
| `servers/sage-enforcement/agents/security-scanner.ts` | Security scanning agent | 350 lines |
| `servers/sage-enforcement/rules/typing-standards.ts` | Python 3.12 type standards | 150 lines |
| `servers/sage-enforcement/rules/test-standards.ts` | Test coverage standards | 100 lines |
| `servers/sage-enforcement/rules/security-standards.ts` | Security rules & patterns | 200 lines |
| `servers/sage-enforcement/utils/validation.ts` | Path validation utilities | 100 lines |
| `servers/sage-enforcement/utils/sandbox.ts` | Sandboxing utilities | 150 lines |
| `servers/sage-enforcement/package.json` | NPM package configuration | 50 lines |
| `servers/sage-enforcement/tsconfig.json` | TypeScript configuration | 30 lines |
| `servers/sage-enforcement/README.md` | MCP server documentation | 200 lines |
| `servers/sage-enforcement/ARCHITECTURE.md` | Architecture documentation | 300 lines |
| `.sage/EXECUTION_RULES.md` | AI agent directives | 250 lines |
| `servers/sage-enforcement/tests/type-enforcer.test.ts` | Type enforcer unit tests | 400 lines |
| `servers/sage-enforcement/tests/doc-validator.test.ts` | Doc validator unit tests | 300 lines |
| `servers/sage-enforcement/tests/test-coverage.test.ts` | Coverage agent unit tests | 250 lines |
| `servers/sage-enforcement/tests/security-scanner.test.ts` | Security scanner unit tests | 350 lines |
| `servers/sage-enforcement/tests/integration.test.ts` | MCP integration tests | 500 lines |
| `servers/sage-enforcement/tests/fixtures/sample.py` | Python test fixture | 100 lines |
| `servers/sage-enforcement/tests/fixtures/sample-violations.py` | Violation test fixture | 150 lines |
| `PHASE_1_RESULTS.md` | Metrics and benchmark results | 200 lines |

### Modified Files (Modify)

| File Path | Purpose | Line Range Est. |
|-----------|---------|-----------------|
| `commands/sage.enforce.md` | Update to reference MCP server | Lines 15-25 |
| `package.json` | Add MCP server dependencies | Lines 10-15 |
| `.gitignore` | Add server build artifacts | Lines 50-55 |

### Configuration Files

| File Path | Purpose |
|-----------|---------|
| `servers/sage-enforcement/package.json` | NPM dependencies and scripts |
| `servers/sage-enforcement/tsconfig.json` | TypeScript compiler options |
| `.sage/EXECUTION_RULES.md` | AI agent execution directives |

---

## 8. Test Scenarios

### Critical Test Scenarios

**Scenario 1: Type Enforcer - Missing Return Type**

```python
# Input: src/test.py
def process_data(items: list[str]):  # Missing return type
    return len(items)
```

Expected Output:

- Violation: severity=error, line=1, rule="missing-return-type"
- Suggestion: "Add return type annotation: -> int"
- Auto-fixable: true

**Scenario 2: Type Enforcer - Deprecated Typing**

```python
# Input: src/test.py
from typing import List, Dict, Optional

def get_items() -> Optional[List[str]]:
    return ["item1"]
```

Expected Output:

- Violation 1: severity=error, line=1, rule="deprecated-typing-import"
- Violation 2: severity=error, line=3, rule="use-builtin-generics"
- Suggestion: "Use list[str] | None instead of Optional[List[str]]"

**Scenario 3: Doc Validator - Incomplete Docstring**

```python
# Input: src/test.py
def calculate(a: int, b: int) -> int:
    """Calculates something."""  # Missing Args/Returns
    return a + b
```

Expected Output:

- Violation: severity=warning, line=2, rule="incomplete-docstring"
- Suggestion: "Add Args and Returns sections"

**Scenario 4: Security Scanner - SQL Injection**

```python
# Input: src/test.py
user_id = request.args.get('id')
query = f"SELECT * FROM users WHERE id = {user_id}"  # Unsafe
```

Expected Output:

- Violation: severity=error, line=2, rule="sql-injection-risk"
- Suggestion: "Use parameterized queries: WHERE id = %s"
- Auto-fixable: false

**Scenario 5: Test Coverage - Below Threshold**

```python
# Input: src/auth/service.py (45% coverage, threshold: 80%)
def authenticate(user): ...
def authorize(user, resource): ...  # Uncovered
```

Expected Output:

- Violation: severity=warning, line=0, rule="insufficient-coverage"
- Message: "Coverage 45% below threshold 80%"
- Uncovered lines: [3, 4, 5]

**Scenario 6: Progressive Discovery - Selective Loading**

Input: Python file `src/test.py`

Expected Behavior:

- Loaded: type-enforcer, doc-validator
- NOT loaded: security-scanner (unless SQL/XSS patterns detected)
- Token usage: <15K (not all agents loaded)

### Edge Cases

**Edge Case 1: Empty File**

Input: Empty file `src/test.py`

Expected Output:

- No violations
- No errors
- Graceful handling

**Edge Case 2: Syntax Error**

Input: File with syntax error

Expected Output:

- Parse error reported
- Type checking skipped
- Clear error message

**Edge Case 3: Very Large File (>10,000 lines)**

Input: Large Python file

Expected Output:

- Streaming/pagination enabled
- Timeout enforced
- Memory limit enforced
- Top N violations returned

**Edge Case 4: Concurrent Requests**

Input: Multiple enforcement requests in parallel

Expected Output:

- Proper isolation
- No race conditions
- Correct results per request

**Edge Case 5: Malformed Input**

Input: Invalid file path or parameters

Expected Output:

- Zod validation catches error
- Clear error message
- No system crash

**Edge Case 6: Path Traversal Attempt**

Input: File path `../../etc/passwd`

Expected Output:

- Path validation blocks request
- Security alert logged
- Error returned to user

**Edge Case 7: Resource Exhaustion**

Input: File with infinite loop pattern

Expected Output:

- Timeout kills process after 60s
- Cleanup occurs
- Error reported to user

---

## 9. Implementation Phases

### Phase 1.1: Foundation & PoC (Week 1)

**Timeline:** 5 days

**Deliverables:**

1. MCP server structure created
2. Type enforcer agent (PoC)
3. Typing standards rules
4. Initial test suite
5. Token reduction validation (≥60%)

**Success Criteria:**

- Type enforcer detects 100% of test violations
- Token usage reduced by ≥60% on PoC
- Integration test passes with MCP protocol
- Documentation for agent development pattern

### Phase 1.2: Core Features (Week 2)

**Timeline:** 5 days

**Deliverables:**

1. Remaining agents (doc-validator, test-coverage, security-scanner)
2. Remaining rules (test-standards, security-standards)
3. Agent discovery system
4. Full testing & metrics
5. PHASE_1_RESULTS.md report

**Success Criteria:**

- All 4 agents operational and MCP-compliant
- Token usage ≤12K per operation (92% reduction)
- Execution time ≤10s per file (3x speedup)
- 100% violation detection accuracy
- Documentation complete

### Phase 1.3: Optimization & Production (Ongoing)

**Timeline:** Continuous

**Deliverables:**

1. Performance optimization (caching, incremental analysis)
2. CI/CD integration (GitHub Actions, pre-commit hooks)
3. Documentation & training (developer guide, video walkthrough)
4. Migration guide from old system

**Success Criteria:**

- Cache hit rate >80%
- CI/CD integration working
- Team trained on new system
- Migration plan validated

---

## 10. Risk Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Agent prompting confusion | Medium | High | Crystal clear EXECUTION_RULES.md with 5+ examples, explicit "DO NOT load all agents" warnings |
| TypeScript/Python interface mismatch | Low | Medium | Integration tests validate schema compatibility, Zod + Pydantic ensure consistency |
| Security vulnerabilities in sandbox | Medium | High | Use proven V8 Isolates pattern (CloudFlare), security audit, penetration testing |
| Token reduction not achieved | Medium | High | Validate discovery pattern early (Phase 1.1), benchmark at each milestone, adjust strategy |
| Performance regression from FS queries | Low | Low | Implement caching in Phase 1.1, benchmark discovery latency, optimize if >100ms |
| Pyright integration complexity | Low | Medium | Fallback to mypy if needed, extensive testing with Python 3.12 samples |
| MCP spec breaking changes | Low | Medium | Pin SDK version, subscribe to spec announcements, maintain compatibility layer |

---

## 11. Success Validation

### Metrics Collection

**Token Usage:**

```bash
# Baseline: Current /sage.enforce
BASELINE_TOKENS=$(measure_tokens_before)

# After MCP implementation
MCP_TOKENS=$(measure_tokens_after)

# Validation
if [ $MCP_TOKENS -le 12000 ]; then
  echo "✅ Target achieved: 92% reduction"
elif [ $MCP_TOKENS -le 60000 ]; then
  echo "⚠️  Minimum acceptable: 60% reduction"
else
  echo "❌ Token reduction target missed"
fi
```

**Performance:**

```bash
# Baseline: 30 seconds per file
time /sage.enforce src/test.py

# After MCP implementation
time /sage.enforce src/test.py

# Target: ≤10 seconds (3x speedup)
# Minimum: ≤15 seconds (2x speedup)
```

**Accuracy:**

```bash
# Run enforcement on test suite
/sage.enforce tests/fixtures/*.py

# Validate:
# - 100% of known violations detected
# - No false positives
# - Severity classification correct
```

### Performance Benchmarks

**Test Suite:**

- 10 Python files with known violations
- Mix of type errors, missing docs, security issues
- Various file sizes (100-5000 lines)

**Measurements:**

- Token usage per operation
- Execution time per file
- Agent discovery latency (cached vs cold)
- Memory consumption
- Cache hit rate

**Reporting:**
Document results in `PHASE_1_RESULTS.md` with:

- Baseline vs target vs actual metrics
- Performance charts
- Violation detection accuracy
- Lessons learned and optimization opportunities

---

## 12. References

**Technical Documentation:**

- MCP Specification: <https://modelcontextprotocol.io/specification/2025-03-26>
- TypeScript SDK: <https://github.com/modelcontextprotocol/typescript-sdk>
- Zod Documentation: <https://zod.dev/>
- Pyright Documentation: <https://github.com/microsoft/pyright>

**Best Practices:**

- Anthropic MCP Blog: <https://www.anthropic.com/engineering/code-execution-with-mcp>
- Node.js Security: <https://nodejs.org/en/learn/getting-started/security-best-practices>
- OWASP Node.js Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html>

**Source Documents:**

- Research: `docs/research/mcp-server-infrastructure-intel.md`
- Feature Request: `docs/features/mcp-server-infrastructure.md`

---

**Specification Version:** 1.0
**Last Updated:** 2025-11-13
**Status:** Ready for Planning
