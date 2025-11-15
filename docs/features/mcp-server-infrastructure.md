# MCP Server Infrastructure

**Created:** 2025-11-13
**Status:** Draft
**Type:** Feature Request - Phase 1
**Phase:** 1 of 4
**Timeline:** 2 weeks (Weeks 1-2)
**Complexity:** Medium

---

## Feature Description

Transform Sage-Dev's monolithic command system into a filesystem-based MCP (Model Context Protocol) server architecture to enable progressive tool discovery and achieve 92% token reduction on enforcement operations.

### Problem Statement

Currently, Sage-Dev suffers from massive context window bloat:

- **270KB+ overhead** loaded upfront before any task execution
- **150,000+ tokens consumed** per enforcement operation
- **Only 3% actually needed** (8KB), 97% wasted (262KB)
- All 37 commands, agents, rules, and patterns loaded even when only 1-2 are needed

### Solution Overview

Implement Anthropic's proven "Code Execution with MCP" pattern:

- Convert enforcement agents to filesystem-based MCP servers
- Enable on-demand tool discovery through filesystem queries
- Load only the specific agents needed for each file type
- Filter results in execution environment before logging to context

### Expected Impact

- **Token Reduction:** 150,000 → 12,000 tokens (92% reduction)
- **Performance:** 30 seconds → 10 seconds per enforcement check (3x faster)
- **Scalability:** Foundation for 50+ MCP servers without context overhead
- **Foundation:** Enables Phases 2, 3, and 4 enhancements

---

## User Stories & Use Cases

### User Story 1: Token-Efficient Enforcement

**As a** developer using Sage-Dev enforcement
**I want** enforcement checks to consume 92% fewer tokens
**So that** I can run more checks within my token budget and get faster results

**Acceptance Criteria:**

- Enforcement operations use ≤12,000 tokens (down from 150,000)
- All violations are still detected correctly
- Execution time reduced from 30s to 10s

### User Story 2: On-Demand Agent Loading

**As a** Python developer
**I want** only Python-relevant agents to load when checking my code
**So that** JavaScript, TypeScript, and other language agents don't consume context

**Acceptance Criteria:**

- Only applicable agents load (e.g., type-enforcer, doc-validator for Python)
- Inapplicable agents remain unloaded
- Filesystem discovery mechanism works correctly

### User Story 3: Context-Efficient Results

**As a** developer reviewing violations
**I want** only critical violations logged to context
**So that** I'm not overwhelmed with warnings and info-level messages

**Acceptance Criteria:**

- Violations filtered by severity (error > warning > info)
- Only top N violations logged to context
- Full violation report available in execution environment

---

## Code Examples & Patterns

### Anthropic's Pattern (Reference Implementation)

```typescript
// Progressive tool discovery
const servers = fs.readdirSync('./servers/');
const tools = fs.readdirSync(`./servers/${server}/tools/`);

// Load only specific tool needed
import { getDocument } from './servers/google-drive/getDocument';
```

### Sage-Dev Implementation (Target)

```typescript
// Discover enforcement agents
import * as enforcement from './servers/sage-enforcement/';

// List available agents
const agents = fs.readdirSync('./servers/sage-enforcement/agents/');
// Result: ['type-enforcer.ts', 'doc-validator.ts', ...]

// Load only applicable agents for file type
const pythonFile = 'src/auth/service.py';
const applicableAgents = ['type-enforcer', 'doc-validator', 'security-scanner'];

// Import specific agents (not all)
const { typeEnforcer } = await import('./servers/sage-enforcement/agents/type-enforcer.ts');

// Execute with standards (also discovered)
const { TYPING_STANDARDS } = await import('./servers/sage-enforcement/rules/typing-standards.ts');

const violations = await typeEnforcer({
  filePath: pythonFile,
  code: fileContent,
  standards: TYPING_STANDARDS
});

// Filter in execution environment
const critical = violations.filter(v => v.severity === 'error');
console.log(critical.slice(0, 5)); // Only first 5 to context
```

### Repository Patterns

To be identified during implementation:

- Current enforcement agent structure in `.sage/agents/`
- Existing MCP tool patterns in the repository
- Python/TypeScript agent interfaces

---

## Documentation References

### Primary Reference

- **Anthropic Blog:** "Code Execution with MCP: Building More Efficient AI Agents"
  - URL: <https://www.anthropic.com/engineering/code-execution-with-mcp>
  - Key Insight: 8x token reduction with skills (32K → 4K tokens)
  - Proven Pattern: Progressive disclosure, context-efficient results

### Enhancement Plan Documents

- `.docs/code-execution-enhancement/sage-dev-executive-summary.md`
- `.docs/code-execution-enhancement/sage-dev-enhancement-plan.md` (Part 3.1-3.2, Part 6.1)
- `.docs/code-execution-enhancement/sage-dev-action-plan.md` (Week 1-2, lines 7-336)

### Technical Standards

- MCP Protocol Specification
- TypeScript interface design patterns
- Python 3.12 type system documentation

---

## Technical Considerations

### Architecture Implications

**New Directory Structure:**

```
servers/
├── sage-enforcement/
│   ├── agents/
│   │   ├── type-enforcer.ts      (3KB - Python type checking)
│   │   ├── doc-validator.ts      (3KB - Docstring validation)
│   │   ├── test-coverage.ts      (4KB - Coverage checking)
│   │   └── security-scanner.ts   (2KB - Security scanning)
│   ├── rules/
│   │   ├── typing-standards.ts   (2KB - Python 3.12 standards)
│   │   ├── test-standards.ts     (2KB - Coverage standards)
│   │   └── security-standards.ts (1KB - Security rules)
│   └── index.ts                  (exports)
```

**Agent Directives (.sage/EXECUTION_RULES.md):**

```markdown
## Rule 1: Skill-First Discovery
- Check ./skills/ directory first
- If matching skill exists, LOAD and ADAPT
- NEVER regenerate what's already proven

## Rule 2: On-Demand Tool Loading
- Import only the specific tool file needed
- Example: import { typeEnforcer } from './servers/...'
- NEVER load all agents/rules

## Rule 3: Result Filtering in Code
- Filter large result sets in execution environment
- Sort violations by severity
- Return only top N results to context
```

### Performance Concerns

**Token Reduction Calculation:**

- Current: 150,000 tokens per operation
- Target: 12,000 tokens per operation
- Reduction: 92% (138,000 tokens saved)
- Mechanism: Load 1-2 agents (6KB) instead of all agents (50KB)

**Execution Time:**

- Current: ~30 seconds per enforcement check
- Target: ~10 seconds per enforcement check
- Speedup: 3x faster
- Mechanism: Reduced context processing overhead

### Security Requirements

**Sandboxing:**

- Code execution must occur in sandboxed environment
- Resource limits: execution time, memory usage
- Prevent filesystem access outside project directory

**Tool Validation:**

- Verify MCP tool interfaces match expected schemas
- Validate agent output before logging to context
- Sanitize file paths to prevent directory traversal

**Agent Code Review:**

- All agent TypeScript interfaces reviewed before deployment
- Standards files audited for correctness
- Test suite validates agent behavior

### Edge Cases & Gotchas

**Critical Success Factor: Agent Prompting**

> "The prompting is crucial for efficient code execution. Agent directives must explicitly state on-demand tool loading and result filtering."

Without explicit directives, agents will:

- ❌ Load all tools upfront (defeating the enhancement)
- ❌ Pass all results through context (no token savings)
- ❌ Chain tools sequentially (no performance gain)

**Filesystem Discovery Confusion:**

- Agent might load incorrect agent for file type
- Mitigation: Explicit file-type → agent mapping in directives

**TypeScript Interface Mismatch:**

- TypeScript interfaces must match Python MCP tool schemas
- Mitigation: Integration tests validate interface compatibility

**Performance Regression:**

- Filesystem queries add latency
- Mitigation: Cache discovered agents, benchmark against baseline

---

## Success Criteria

### Phase 1 Complete (Week 2)

- [ ] **MCP server structure created** at `servers/sage-enforcement/`
- [ ] **All 4 enforcement agents implemented:**
  - [ ] type-enforcer.ts (Python type validation)
  - [ ] doc-validator.ts (Docstring validation)
  - [ ] test-coverage.ts (Coverage checking)
  - [ ] security-scanner.ts (Security scanning)
- [ ] **All 3 rule files created:**
  - [ ] typing-standards.ts (Python 3.12 standards)
  - [ ] test-standards.ts (Coverage standards)
  - [ ] security-standards.ts (Security rules)
- [ ] **Agent directives documented** in `.sage/EXECUTION_RULES.md`
- [ ] **Filesystem discovery working:** Agents load on-demand, not all at once
- [ ] **Token reduction achieved:**
  - [ ] Minimum: 150K → 60K (60% reduction)
  - [ ] Target: 150K → 12K (92% reduction)
- [ ] **Zero test failures** in enforcement operations
- [ ] **Documentation updated:**
  - [ ] README.md with MCP server explanation
  - [ ] ARCHITECTURE.md documenting new structure
  - [ ] PHASE_1_RESULTS.md with metrics

### Metrics Validation

**Token Efficiency:**

- Enforcement: 150,000 → 12,000 (92% reduction)
- Minimum acceptable: 150,000 → 60,000 (60% reduction)

**Performance:**

- Single file check: 30s → 10s (3x faster)
- Batch operations: Linear scaling with file count

**Accuracy:**

- 100% of violations detected (no regressions)
- Severity classification correct
- Suggestions provided for all violations

---

## Dependencies

### Technical Dependencies

**Required:**

- TypeScript 5.0+ (for interface definitions)
- Node.js 18+ (for MCP server runtime)
- Python 3.12+ (for enforcement targets)
- MCP Protocol implementation

**Optional:**

- Sandboxed execution environment (Docker/VM)
- Monitoring dashboard for metrics

### Feature Dependencies

**Prerequisite:**

- [ ] Repository initialized with `/sage.init`
- [ ] Directory structure: `docs/`, `.sage/`, `commands/` exist

**Blockers:**

- None (Phase 1 is foundational)

**Enables:**

- Phase 2: Context Optimization & Caching (builds on MCP infrastructure)
- Phase 3: Automatic Skill Evolution (uses agent discovery)
- Phase 4: Parallel Agent Orchestration (requires MCP servers)

---

## Timeline Estimate

**Complexity:** Medium

**Estimated Effort:** 80-120 hours

**Team Composition:**

- 1-2 senior engineers (AI architect, full-stack)
- 1-2 junior engineers (implementation, testing)

**Weekly Breakdown:**

**Week 1:**

- Mon-Tue: Team alignment, knowledge transfer (4 hours)
- Wed-Fri: Directory setup, file skeletons, planning (6 hours)

**Week 2:**

- Day 1-2: Implement type-enforcer agent (4 hours)
- Day 3-4: Implement other 3 agents (6 hours)
- Day 5: Implement rules and directives (3 hours)
- Day 5 (cont): Testing and validation (4 hours)
- Final: Documentation (3 hours)

**Total:** 2 weeks (10 business days)

---

## Implementation Strategy

### Gradual Rollout

**Phase 1.1 (Week 1):**

- Create MCP server structure
- Implement 1 agent (type-enforcer) as proof-of-concept
- Validate token reduction on single agent

**Phase 1.2 (Week 2):**

- Implement remaining 3 agents
- Create all rules files
- Full integration testing
- Metrics validation

### Backward Compatibility

- Existing `/sage.enforce` command continues to work
- Gradual migration: enable per-agent basis
- Fallback to direct MCP if code execution fails
- No breaking changes to user interface

### Testing Strategy

**Unit Tests:**

- TypeScript interface validation
- Rules loading and parsing
- Agent discovery mechanism

**Integration Tests:**

- End-to-end enforcement checks
- Multiple file types (Python, JavaScript, TypeScript)
- Batch operations

**Performance Benchmarking:**

- Token usage measurement
- Execution time tracking
- Comparison against baseline

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Agent prompting confusion | Medium | High | Crystal clear directives, multiple examples |
| TypeScript interface mismatch | Low | Medium | Integration tests, schema validation |
| Filesystem query latency | Low | Low | Caching, benchmarking |
| Token reduction not achieved | Medium | High | Validate discovery pattern, review filtering |
| Security in execution env | Medium | High | Sandboxing, resource limits, code review |

---

## Next Steps

### Immediate Actions

1. **Research & Enhancement**

   ```bash
   /sage.intel
   ```

   Research MCP server patterns, TypeScript interface design, sandboxing approaches.
   Output: `docs/research/mcp-server-infrastructure-intel.md`

2. **Specification Generation**

   ```bash
   /sage.specify
   ```

   Generate detailed technical specifications for MCP servers, agents, and rules.
   Output: `docs/specs/mcp-server-infrastructure/spec.md`

3. **Implementation Planning**

   ```bash
   /sage.plan
   ```

   Create week-by-week implementation plan with SMART tasks.
   Output: `docs/specs/mcp-server-infrastructure/plan.md`

4. **Task Breakdown**

   ```bash
   /sage.tasks
   ```

   Generate granular implementation tasks for team execution.
   Output: Tickets in `.sage/tickets/index.json`

5. **Implementation**

   ```bash
   /sage.implement
   ```

   Execute implementation following Ticket Clearance Methodology.

### Success Checkpoint

**After Phase 1 completion:**

- 92% token reduction validated
- All agents discoverable via filesystem
- Documentation complete
- Team ready for Phase 2

**Proceed to:**

- Phase 2: Context Optimization & Caching (feature request: `context-optimization-caching`)

---

## Related Files

- **Enhancement Documents:**
  - `.docs/code-execution-enhancement/sage-dev-executive-summary.md`
  - `.docs/code-execution-enhancement/sage-dev-enhancement-plan.md`
  - `.docs/code-execution-enhancement/sage-dev-action-plan.md`

- **Research Output:** `docs/research/mcp-server-infrastructure-intel.md` (generated by `/sage.intel`)
- **Specifications:** `docs/specs/mcp-server-infrastructure/spec.md` (generated by `/sage.specify`)
- **Implementation Plan:** `docs/specs/mcp-server-infrastructure/plan.md` (generated by `/sage.plan`)
- **Tickets:** `.sage/tickets/index.json` (generated by `/sage.tasks`)

---

## Metrics Tracking

```json
{
  "phase": 1,
  "feature": "mcp-server-infrastructure",
  "baseline": {
    "tokens_per_operation": 150000,
    "execution_time_sec": 30,
    "agents_loaded": "all (4+)",
    "overhead_kb": 270
  },
  "target": {
    "tokens_per_operation": 12000,
    "execution_time_sec": 10,
    "agents_loaded": "1-2",
    "overhead_kb": 6
  },
  "improvement": {
    "token_reduction_percent": 92,
    "speedup_multiplier": 3,
    "overhead_reduction_percent": 97.8
  }
}
```

---

## Research Findings

**Research Date:** 2025-11-13
**Research Output:** docs/research/mcp-server-infrastructure-intel.md

### Key Research Findings

1. **Proven Pattern Validated** - Anthropic's Code Execution with MCP achieves 98.7% token reduction (150K→2K tokens)
2. **Technology Stack Confirmed** - Official MCP TypeScript SDK + Zod validation + Pyright (3-5x faster than mypy)
3. **Security Architecture** - V8 Isolates (CloudFlare pattern) recommended over Node.js vm module
4. **Competitive Position** - Differentiation through enforcement-first approach, token optimization, Python 3.12 specialization
5. **Implementation Risk** - Medium overall (proven patterns exist, integration complexity manageable)

### Recommended Next Steps

1. Generate specification: `/sage.specify mcp-server-infrastructure`
2. Create implementation plan: `/sage.plan mcp-server-infrastructure`
3. Break down tasks: `/sage.tasks mcp-server-infrastructure`
4. Execute implementation: `/sage.implement [ticket-id]`

**Status:** Research complete - Ready for specification generation (/sage.specify)
**Priority:** High (foundational for all subsequent phases)
**Strategic Alignment:** Anthropic Code Execution with MCP Pattern
