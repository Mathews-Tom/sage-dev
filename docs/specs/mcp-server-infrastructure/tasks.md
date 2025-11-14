# Tasks: MCP Server Infrastructure

**From:** `spec.md` + `plan.md`
**Timeline:** 2 weeks, 2 sprints
**Team:** 1-2 senior engineers
**Created:** 2025-11-13

## Summary

- **Total tasks:** 12 story tasks
- **Estimated effort:** 38 story points (~80-120 hours)
- **Critical path duration:** 2 weeks (10 business days)
- **Key risks:**
  1. Token reduction target not achieved (92% reduction)
  2. Agent prompting confusion (loading all agents instead of on-demand)
  3. Security vulnerabilities in sandboxing (V8 Isolates implementation)

## Phase Breakdown

### Phase 1.1: Foundation & PoC (Sprint 1, 18 story points)

**Goal:** Establish MCP server foundation and validate token reduction with type-enforcer PoC
**Deliverable:** Working MCP server with one agent achieving ≥60% token reduction

#### Tasks

**[MCP-002] Create MCP Server Directory Structure**

- **Description:** Set up `servers/sage-enforcement/` directory with subdirectories for agents, rules, schemas, utils, and tests. Initialize package.json with MCP SDK dependencies and tsconfig.json with strict TypeScript configuration.
- **Acceptance:**
  - [ ] Directory structure created: `servers/sage-enforcement/{agents,rules,schemas,utils,tests}`
  - [ ] `package.json` initialized with @modelcontextprotocol/sdk, zod, isolated-vm dependencies
  - [ ] `tsconfig.json` configured with strict mode, no `any` types allowed
  - [ ] `.gitignore` updated to exclude `node_modules/` and build artifacts
  - [ ] `npm install` completes successfully
- **Effort:** 2 story points (4 hours, Day 1)
- **Owner:** Senior Engineer
- **Dependencies:** None
- **Priority:** P0 (Blocker)
- **Risks:** None (straightforward setup task)

**[MCP-003] Implement MCP Server Entry Point**

- **Description:** Create `servers/sage-enforcement/index.ts` with MCP server initialization, JSON-RPC 2.0 protocol handler, stdio transport, and tool registration logic.
- **Acceptance:**
  - [ ] `index.ts` implements Server class from @modelcontextprotocol/sdk
  - [ ] StdioServerTransport configured and connected
  - [ ] `initialize` request handler returns server capabilities
  - [ ] `tools/list` request handler returns empty tool list (agents added later)
  - [ ] `tools/call` request handler stub created
  - [ ] Server starts without errors via `npm start`
- **Effort:** 3 story points (6 hours, Day 1-2)
- **Owner:** Senior Engineer
- **Dependencies:** MCP-002
- **Priority:** P0 (Blocker)
- **Risks:** MCP SDK integration complexity (Low - well-documented)

**[MCP-004] Create Zod Schemas for Agent I/O**

- **Description:** Define Zod schemas in `servers/sage-enforcement/schemas/index.ts` for TypeCheckInput, Violation, AgentResult, and standards objects. Schemas must auto-generate JSON Schema for MCP protocol.
- **Acceptance:**
  - [ ] `TypeCheckInput` schema defined with filePath, code, standards fields
  - [ ] `Violation` schema defined with file, line, column, severity, rule, message, suggestion, autoFixable fields
  - [ ] `AgentResult` schema defined with agent, executionTime, tokensUsed, violations, summary fields
  - [ ] `TypingStandards`, `TestStandards`, `SecurityStandards` schemas defined
  - [ ] All schemas export TypeScript types via `z.infer<typeof Schema>`
  - [ ] JSON Schema generation tested with `.toJSON()` method
- **Effort:** 2 story points (4 hours, Day 2)
- **Owner:** Senior Engineer
- **Dependencies:** MCP-003
- **Priority:** P0 (Critical)
- **Risks:** Schema complexity (Low - Zod well-documented)

**[MCP-005] Implement Type Enforcer Agent (PoC)**

- **Description:** Create `servers/sage-enforcement/agents/type-enforcer.ts` with Pyright integration, violation parsing, and Zod validation. This is the proof-of-concept agent to validate the MCP pattern.
- **Acceptance:**
  - [ ] `type-enforcer.ts` exports async `typeEnforcer()` function
  - [ ] Input validated with TypeCheckInput Zod schema
  - [ ] Pyright subprocess spawned with `--outputjson` flag
  - [ ] Pyright JSON output parsed into Violation objects
  - [ ] Detects missing return type annotations (100% accuracy on test fixtures)
  - [ ] Detects deprecated `typing.List`, `typing.Dict`, `typing.Optional` (100% accuracy)
  - [ ] Detects inappropriate `typing.Any` usage (100% accuracy)
  - [ ] Returns top 10 error violations (filtered in agent, not context)
  - [ ] Tool registered in `index.ts` as `sage_type_enforcer`
- **Effort:** 5 story points (10 hours, Day 2-3)
- **Owner:** Senior Engineer
- **Dependencies:** MCP-004
- **Priority:** P0 (Critical)
- **Risks:** Pyright integration complexity (Medium - subprocess management, JSON parsing)

**[MCP-006] Create Python 3.12 Typing Standards**

- **Description:** Define `servers/sage-enforcement/rules/typing-standards.ts` with Python 3.12 standards (PEP 585, 604, 698), configurable strictness levels, and allow/deny lists.
- **Acceptance:**
  - [ ] `typing-standards.ts` exports `TYPING_STANDARDS` object
  - [ ] Standards include: enforceReturnTypes, allowAny, pythonVersion, deprecatedImports, builtinGenerics
  - [ ] Deprecated imports list: `typing.List`, `typing.Dict`, `typing.Optional`, `typing.Union`
  - [ ] Built-in generics enforcement: require `list`, `dict`, `tuple`, not `typing.List`, etc.
  - [ ] Configurable strictness levels: strict, moderate, lenient
  - [ ] Allow/deny lists for specific patterns (e.g., allow `Any` in specific files)
- **Effort:** 2 story points (4 hours, Day 3)
- **Owner:** Senior Engineer
- **Dependencies:** None (independent of code)
- **Priority:** P0 (Critical)
- **Risks:** None (configuration file)

**[MCP-007] Write Type Enforcer Unit Tests**

- **Description:** Create `servers/sage-enforcement/tests/type-enforcer.test.ts` with Vitest test suite achieving ≥80% coverage. Test critical scenarios from spec (missing return types, deprecated typing, etc.).
- **Acceptance:**
  - [ ] Test: Missing return type detected (Scenario 1 from spec)
  - [ ] Test: Deprecated `typing.List` detected (Scenario 2 from spec)
  - [ ] Test: Empty file handled gracefully (Edge Case 1 from spec)
  - [ ] Test: Syntax error reported before type checking (Edge Case 3 from spec)
  - [ ] Test: Malformed input caught by Zod validation (Edge Case 5 from spec)
  - [ ] Code coverage ≥80% measured with `npm run coverage`
  - [ ] All tests pass with `npm test`
- **Effort:** 3 story points (6 hours, Day 4)
- **Owner:** Senior Engineer
- **Dependencies:** MCP-005, MCP-006
- **Priority:** P0 (Critical)
- **Risks:** None (testing task)

**[MCP-008] Validate Token Reduction (PoC Milestone)**

- **Description:** Measure baseline token usage (current `/sage.enforce`), measure PoC token usage (MCP type-enforcer), validate ≥60% reduction minimum. Document results for Phase 1.1 completion.
- **Acceptance:**
  - [ ] Baseline token usage measured on 5 Python files: average 150K tokens
  - [ ] PoC token usage measured on same 5 files with MCP type-enforcer
  - [ ] Token reduction ≥60% achieved (150K → ≤60K)
  - [ ] Results documented with file-by-file breakdown
  - [ ] If <60% reduction: root cause analysis and mitigation plan
  - [ ] Metrics logged to `.sage/enforcement-metrics.log`
- **Effort:** 1 story point (2 hours, Day 5)
- **Owner:** Senior Engineer
- **Dependencies:** MCP-007 (PoC complete and tested)
- **Priority:** P0 (Critical - Go/No-Go decision)
- **Risks:** **HIGH** - If token reduction <60%, requires strategy adjustment

---

### Phase 1.2: Complete Implementation (Sprint 2, 20 story points)

**Goal:** Implement remaining 3 agents, discovery system, filtering pipeline, and achieve 92% token reduction target
**Deliverable:** Production-ready MCP server with all 4 agents, full test coverage, and performance metrics

#### Tasks

**[MCP-009] Implement Remaining Agents (Doc Validator, Test Coverage, Security Scanner)**

- **Description:** Create `doc-validator.ts`, `test-coverage.ts`, and `security-scanner.ts` agents with corresponding Zod schemas, subprocess integrations, and tool registrations.
- **Acceptance:**
  - [ ] **Doc Validator:**
    - Validates Google-style docstrings (Args, Returns, Raises sections)
    - Detects incomplete docstrings (Scenario 3 from spec)
    - AST parsing via Python subprocess
    - Returns structured violations
  - [ ] **Test Coverage:**
    - Integrates with pytest-cov subprocess
    - Enforces 80% minimum coverage threshold
    - Detects uncovered lines (Scenario 5 from spec)
    - Suggests missing test scenarios
  - [ ] **Security Scanner:**
    - Detects SQL injection risks (Scenario 4 from spec)
    - Detects XSS vulnerabilities
    - Detects hardcoded secrets (regex patterns)
    - Detects insecure functions (eval, exec, unsafe deserialization)
    - Returns critical violations with remediation guidance
  - [ ] All 3 agents registered in `index.ts` with MCP tool definitions
  - [ ] Zod schemas created for each agent's input/output
- **Effort:** 8 story points (16 hours, Day 6-7)
- **Owner:** Senior Engineer + Junior Engineer (parallel work)
- **Dependencies:** MCP-005 (pattern established by type-enforcer)
- **Priority:** P0 (Critical)
- **Risks:** pytest-cov integration complexity (Medium), security pattern accuracy (Medium)

**[MCP-010] Create Remaining Rules Files**

- **Description:** Define `test-standards.ts` and `security-standards.ts` with coverage thresholds, test patterns, OWASP rules, and vulnerability patterns.
- **Acceptance:**
  - [ ] **test-standards.ts:**
    - minCoverage: 80% default
    - blockCommitBelowThreshold: true
    - requireFunctionCoverage: true
    - Test patterns: naming conventions, fixture patterns
  - [ ] **security-standards.ts:**
    - OWASP Top 10 rules: SQL injection, XSS, CSRF, etc.
    - Secret patterns: API keys, passwords, tokens (regex)
    - Insecure functions: eval, exec, pickle.loads, yaml.unsafe_load
    - Input sanitization requirements
- **Effort:** 2 story points (4 hours, Day 8)
- **Owner:** Senior Engineer
- **Dependencies:** MCP-009 (agents need standards)
- **Priority:** P0 (Critical)
- **Risks:** None (configuration files)

**[MCP-011] Implement Agent Discovery System**

- **Description:** Create `discovery.ts` with filesystem-based agent discovery, file type → agent mapping, lazy loading, and session-based caching.
- **Acceptance:**
  - [ ] `discovery.ts` exports `getApplicableAgents(filePath)` function
  - [ ] File type mapping: `.py` → [type-enforcer, doc-validator, test-coverage, security-scanner]
  - [ ] Filesystem query via `fs.readdirSync('servers/sage-enforcement/agents/')`
  - [ ] Lazy loading: `await import()` only for applicable agents
  - [ ] Session-based cache: `Map<string, Agent>` with `getAgent(type)` helper
  - [ ] Discovery latency <100ms (cached), <500ms (cold start) - measured and logged
  - [ ] Selective Loading (Scenario 6 from spec): Python file loads 1-2 agents, not all 4
- **Effort:** 3 story points (6 hours, Day 8)
- **Owner:** Senior Engineer
- **Dependencies:** MCP-009 (all agents implemented)
- **Priority:** P0 (Critical - core token reduction mechanism)
- **Risks:** Cache invalidation bugs (Low), latency targets not met (Low)

**[MCP-012] Implement Result Filtering Pipeline**

- **Description:** Create `filters.ts` with severity-based sorting, pagination to top 10 per severity, and progressive streaming support.
- **Acceptance:**
  - [ ] `filters.ts` exports `filterViolations(violations, maxPerSeverity)` function
  - [ ] Sort by severity: error > warning > info
  - [ ] Sort within severity by line number (ascending)
  - [ ] Paginate to top N violations per severity (default: 10)
  - [ ] Return filtered violations + metadata (total, truncated count)
  - [ ] Progressive streaming: async generator for large result sets
  - [ ] Unit tests: 100% coverage (critical path)
- **Effort:** 2 story points (4 hours, Day 8)
- **Owner:** Senior Engineer
- **Dependencies:** None (independent utility)
- **Priority:** P0 (Critical - core token reduction mechanism)
- **Risks:** None (straightforward filtering logic)

**[MCP-013] Create Execution Rules Documentation**

- **Description:** Write `.sage/EXECUTION_RULES.md` with explicit AI agent directives for on-demand loading, result filtering, and anti-patterns to avoid.
- **Acceptance:**
  - [ ] **Rule 1:** On-demand tool loading (import only specific agent, NEVER load all)
  - [ ] **Rule 2:** Result filtering in code (filter before logging to context)
  - [ ] **Rule 3:** Progressive discovery (check filesystem, load applicable agents)
  - [ ] 5+ code examples showing correct usage patterns
  - [ ] Explicit warnings: "DO NOT load all agents", "DO NOT pass unfiltered results"
  - [ ] Anti-patterns section: what NOT to do with clear explanations
  - [ ] Integration with existing `.sage/` documentation structure
- **Effort:** 2 story points (4 hours, Day 9)
- **Owner:** Senior Engineer
- **Dependencies:** MCP-011, MCP-012 (patterns established)
- **Priority:** P0 (Critical - prevents agent confusion)
- **Risks:** **HIGH** - Unclear directives lead to all agents loaded (defeats token reduction)

**[MCP-014] Write Full Test Suite and Performance Benchmarks**

- **Description:** Create unit tests for remaining agents, integration tests for MCP protocol, and performance benchmarks for token usage, execution time, and cache hit rate.
- **Acceptance:**
  - [ ] **Unit Tests:**
    - `doc-validator.test.ts`: ≥80% coverage
    - `test-coverage.test.ts`: ≥80% coverage
    - `security-scanner.test.ts`: ≥80% coverage
    - `discovery.test.ts`: 100% coverage (critical)
    - `filters.test.ts`: 100% coverage (critical)
  - [ ] **Integration Tests:**
    - `integration.test.ts`: End-to-end MCP protocol (initialize, tools/list, tools/call)
    - Schema compatibility: TypeScript ↔ Python (Zod + Pydantic)
    - Multi-agent execution on single file
    - Concurrent requests (10 parallel calls, no race conditions)
  - [ ] **Performance Benchmarks:**
    - Token usage: ≤12K per operation (target) or ≤60K (minimum)
    - Execution time: ≤10s per file (target) or ≤15s (minimum)
    - Agent discovery: <100ms (cached), <500ms (cold)
    - Cache hit rate: >80% for repeated operations
  - [ ] All tests pass: `npm test`
  - [ ] Coverage report: `npm run coverage` (≥80% unit, ≥90% integration)
- **Effort:** 5 story points (10 hours, Day 9)
- **Owner:** Senior Engineer + Junior Engineer
- **Dependencies:** MCP-009, MCP-011, MCP-012
- **Priority:** P0 (Critical)
- **Risks:** Performance targets not met (Medium - requires optimization)

**[MCP-015] Create Documentation and Metrics Report**

- **Description:** Write `README.md`, `ARCHITECTURE.md`, and `PHASE_1_RESULTS.md` with MCP server explanation, system design, and performance metrics.
- **Acceptance:**
  - [ ] **README.md:**
    - MCP server overview and purpose
    - Installation instructions (npm install, dependencies)
    - Usage examples (`npm start`, testing MCP protocol)
    - Developer guide: adding new agents
  - [ ] **ARCHITECTURE.md:**
    - System design diagram (ASCII + Mermaid)
    - Component breakdown (MCP server, agents, discovery, filtering)
    - Data flow and boundaries
    - Technology stack and rationale
  - [ ] **PHASE_1_RESULTS.md:**
    - Performance metrics: token usage, execution time, cache hit rate
    - Baseline vs target vs actual comparison
    - Violation detection accuracy (100% validation)
    - Lessons learned and optimization opportunities
  - [ ] All docs reviewed for clarity and completeness
- **Effort:** 3 story points (6 hours, Day 10)
- **Owner:** Senior Engineer
- **Dependencies:** MCP-014 (metrics collected)
- **Priority:** P1 (High - important but not blocking)
- **Risks:** None (documentation task)

---

## Critical Path

```plaintext
MCP-002 → MCP-003 → MCP-004 → MCP-005 → MCP-006 → MCP-007 → MCP-008
  (4h)      (6h)      (4h)      (10h)     (4h)      (6h)      (2h)
[Phase 1.1: 36 hours / 5 days]

MCP-008 → MCP-009 → MCP-010 → MCP-011 → MCP-012 → MCP-013 → MCP-014 → MCP-015
           (16h)     (4h)      (6h)      (4h)      (4h)      (10h)     (6h)
[Phase 1.2: 50 hours / 5 days]

Total: 86 hours / 10 days (within 80-120 hour estimate)
```

**Bottlenecks:**

- **MCP-005 (Type Enforcer PoC):** 10 hours, highest complexity, critical for Phase 1.1 validation
- **MCP-009 (Remaining Agents):** 16 hours, parallel work possible (doc-validator + test-coverage + security-scanner)
- **MCP-008 (Token Reduction Validation):** Go/No-Go decision point - if <60% reduction, requires strategy pivot

**Parallel Tracks:**

- **Phase 1.1 (Sequential):** Must validate PoC before continuing (MCP-002 → MCP-008)
- **Phase 1.2 (Some Parallel):**
  - Track A: Agent implementation (MCP-009) || Rules (MCP-010)
  - Track B: Discovery (MCP-011) || Filtering (MCP-012)
  - Track C: Testing (MCP-014) || Docs (MCP-015) can overlap

---

## Quick Wins (Week 1)

1. **[MCP-002] Directory Structure** (Day 1) - Unblocks all development
2. **[MCP-003] MCP Server Entry Point** (Day 1-2) - Proves MCP SDK integration works
3. **[MCP-005] Type Enforcer PoC** (Day 2-3) - Early validation of core pattern
4. **[MCP-008] Token Reduction Validation** (Day 5) - Go/No-Go decision, demonstrates progress

---

## Risk Mitigation

| Task | Risk | Mitigation | Contingency |
|------|------|------------|-------------|
| MCP-008 | Token reduction <60% | Validate discovery pattern early, benchmark at each step | Adjust filtering strategy, increase pagination limits |
| MCP-005 | Pyright integration fails | Extensive subprocess error handling, fallback to mypy | Use mypy instead (3-5x slower but proven) |
| MCP-009 | pytest-cov integration complex | Test subprocess management with simple scripts first | Fallback to coverage.py direct integration |
| MCP-013 | Agent prompting confusion | 5+ clear examples, explicit anti-patterns, user testing | Revise directives based on agent behavior |
| MCP-014 | Performance targets missed | Profile hotspots, optimize caching, reduce subprocess overhead | Accept minimum targets (60% token reduction, 15s execution) |

---

## Testing Strategy

### Automated Testing Tasks

- **[MCP-007] Type Enforcer Unit Tests** (3 SP) - Sprint 1, Day 4
- **[MCP-014] Full Test Suite** (5 SP) - Sprint 2, Day 9
  - Unit tests for remaining agents (80%+ coverage)
  - Integration tests for MCP protocol (90%+ coverage)
  - Performance benchmarks (100% of metrics)

### Quality Gates

- **Unit Tests:** ≥80% code coverage required
- **Integration Tests:** ≥90% coverage, all critical paths tested
- **Performance Benchmarks:** Token ≤12K (target) or ≤60K (minimum), Time ≤10s (target) or ≤15s (minimum)
- **Violation Detection:** 100% accuracy (no regressions from baseline)
- **Test Reliability:** >99.5% pass rate (no flaky tests)

### Test Execution

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run performance benchmarks
npm run benchmark
```

---

## Team Allocation

**Senior Engineer (1, full-time, 80 hours)**

- MCP server architecture (MCP-002, MCP-003, MCP-004)
- Type enforcer PoC (MCP-005, MCP-006, MCP-007, MCP-008)
- Discovery and filtering (MCP-011, MCP-012)
- Execution rules (MCP-013)
- Documentation (MCP-015)

**Junior Engineer (1, part-time, 40 hours)**

- Remaining agents support (MCP-009: doc-validator, test-coverage)
- Rules files (MCP-010)
- Testing support (MCP-014)

**Workload Distribution:**

- Phase 1.1 (Week 1): Senior Engineer 100% (36 hours)
- Phase 1.2 (Week 2): Senior Engineer 60%, Junior Engineer 40% (50 hours total)

---

## Sprint Planning

**2-week sprints, ~40 SP velocity**

| Sprint | Focus | Story Points | Key Deliverables |
|--------|-------|--------------|------------------|
| **Sprint 1 (Phase 1.1)** | Foundation & PoC | 18 SP | MCP server structure, type-enforcer agent, ≥60% token reduction validated |
| **Sprint 2 (Phase 1.2)** | Complete Implementation | 20 SP | Remaining 3 agents, discovery system, filtering, full test suite, 92% token reduction |

**Sprint 1 Milestones:**

- Day 1-2: MCP server foundation (MCP-002, MCP-003, MCP-004)
- Day 2-3: Type enforcer implementation (MCP-005, MCP-006)
- Day 4: Testing (MCP-007)
- Day 5: **Go/No-Go Decision** (MCP-008) - Token reduction validated

**Sprint 2 Milestones:**

- Day 6-7: Remaining agents (MCP-009, MCP-010)
- Day 8: Discovery and filtering (MCP-011, MCP-012)
- Day 9: Execution rules and testing (MCP-013, MCP-014)
- Day 10: Documentation and wrap-up (MCP-015)

---

## Task Import Format

CSV export for project management tools:

```csv
ID,Title,Description,Estimate,Priority,Assignee,Dependencies,Sprint,Type
MCP-002,Create MCP Server Directory Structure,Set up directory structure and package.json,2,P0,Senior Engineer,,1,Story
MCP-003,Implement MCP Server Entry Point,Create index.ts with MCP protocol,3,P0,Senior Engineer,MCP-002,1,Story
MCP-004,Create Zod Schemas for Agent I/O,Define input/output schemas,2,P0,Senior Engineer,MCP-003,1,Story
MCP-005,Implement Type Enforcer Agent (PoC),Create type-enforcer.ts with Pyright,5,P0,Senior Engineer,MCP-004,1,Story
MCP-006,Create Python 3.12 Typing Standards,Define typing-standards.ts,2,P0,Senior Engineer,,1,Story
MCP-007,Write Type Enforcer Unit Tests,Create test suite with Vitest,3,P0,Senior Engineer,MCP-005|MCP-006,1,Story
MCP-008,Validate Token Reduction (PoC Milestone),Measure and validate ≥60% reduction,1,P0,Senior Engineer,MCP-007,1,Story
MCP-009,Implement Remaining Agents,Create doc-validator test-coverage security-scanner,8,P0,Senior+Junior,MCP-005,2,Story
MCP-010,Create Remaining Rules Files,Define test-standards security-standards,2,P0,Senior Engineer,MCP-009,2,Story
MCP-011,Implement Agent Discovery System,Create discovery.ts with filesystem queries,3,P0,Senior Engineer,MCP-009,2,Story
MCP-012,Implement Result Filtering Pipeline,Create filters.ts with severity sorting,2,P0,Senior Engineer,,2,Story
MCP-013,Create Execution Rules Documentation,Write .sage/EXECUTION_RULES.md,2,P0,Senior Engineer,MCP-011|MCP-012,2,Story
MCP-014,Write Full Test Suite and Performance Benchmarks,Unit integration performance tests,5,P0,Senior+Junior,MCP-009|MCP-011|MCP-012,2,Story
MCP-015,Create Documentation and Metrics Report,Write README ARCHITECTURE PHASE_1_RESULTS,3,P1,Senior Engineer,MCP-014,2,Story
```

---

## Appendix

**Estimation Method:** Expert estimation based on similar TypeScript/MCP implementations, validated against research estimates (80-120 hours from plan.md)

**Story Point Scale:** Fibonacci (1, 2, 3, 5, 8, 13, 21)

- 1 SP = ~2 hours (trivial configuration)
- 2 SP = ~4 hours (straightforward implementation)
- 3 SP = ~6 hours (moderate complexity)
- 5 SP = ~10 hours (high complexity, integration work)
- 8 SP = ~16 hours (very high complexity, requires research)

**Definition of Done:**

- [ ] Code implemented and self-reviewed
- [ ] Unit tests written and passing (≥80% coverage)
- [ ] Integration tests passing (if applicable)
- [ ] TypeScript compilation successful (no errors, strict mode)
- [ ] ESLint passing (zero warnings)
- [ ] Documentation updated (JSDoc comments, README if needed)
- [ ] Code reviewed and approved by senior engineer
- [ ] Performance benchmarks validated (if applicable)

**Velocity Assumptions:**

- Senior Engineer: 8 story points/day (experienced with TypeScript, MCP)
- Junior Engineer: 5 story points/day (learning MCP pattern)
- Sprint 1: 18 SP (5 days × ~3.6 SP/day average)
- Sprint 2: 20 SP (5 days × ~4 SP/day average)

**Buffer:**

- 20% buffer included in estimates for unknowns (38 SP × 1.2 = ~46 SP nominal)
- Critical path: 86 hours (within 80-120 hour range from plan)
- Contingency: 34 hours remaining (120 - 86) for risk mitigation
