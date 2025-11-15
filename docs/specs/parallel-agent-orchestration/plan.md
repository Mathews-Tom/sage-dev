# Parallel Agent Orchestration Implementation Blueprint (PRP)

**Format:** Product Requirements Prompt (Context Engineering)
**Generated:** 2025-11-13
**Specification:** `docs/specs/parallel-agent-orchestration/spec.md`
**Feature Request:** `docs/features/parallel-agent-orchestration.md`
**Research:** `docs/research/parallel-agent-orchestration-intel.md`

---

## 📖 Context & Documentation

### Traceability Chain

**Feature Request → Research → Specification → This Plan**

1. **Original Feature Request:** `docs/features/parallel-agent-orchestration.md`
   - Transform sequential command chains into parallel multi-agent orchestration
   - User stories: Parallel research pipeline, end-to-end workflows, zero context reloads, cross-session persistence
   - Initial technical considerations: Promise.all() patterns, dependency graphs, state machines, workflow templates
   - Success criteria: 3-5x speedup, 86% token reduction, 0 context reloads

2. **Research & Enhancement:** `docs/research/parallel-agent-orchestration-intel.md`
   - **Technical Approach:** Anthropic "Powerful Control Flow" pattern validated with 98.7% token reduction (150K→2K)
   - **Technology Stack:** Promise.all() + Promise.allSettled(), Kahn's algorithm, FSM + LangGraph checkpointers, p-limit
   - **Competitive Analysis:** Airflow (dominant), Temporal (code-first), Prefect (LLM-focused), Kestra (fast-growing)
   - **Key Findings:** 3x speedup on parallel ops validated, O(V+E) complexity for dependency resolution, circuit breaker for resilience
   - **Security:** Sandboxed execution, encrypted state files, no secrets in state, audit logging
   - **Performance:** max(operation_times) not sum(), 86% token reduction with caching, zero context reloads

3. **Formal Specification:** `docs/specs/parallel-agent-orchestration/spec.md`
   - **Functional Requirements:** 10 core capabilities (FR-1 through FR-10)
   - **Non-Functional Requirements:** Performance (3-5x), scalability (10+ workflows, 50+ nodes), reliability (95%+ resume), security (sandboxing, encryption)
   - **Acceptance Criteria:** 10 criteria covering parallel execution, dependency management, orchestration, state persistence, integration
   - **Target Files:** 18 files identified (10 create, 3 modify, 5 tests)

### Related Documentation

**System Context:**

- Main README: `README.md` - Sage-Dev overview
- Tickets System: `.sage/tickets/README.md` - Ticket management
- Agent Context: `.sage/agent/README.md` - Agent context engineering

**Existing Implementations:**

- Enforcement Server: `servers/sage-enforcement/` - Example MCP server structure
- Ticket System: `.sage/tickets/index.json` - 132 tickets, ticket state machine
- Command Definitions: `.claude/commands/` - Slash command patterns

**Cross-Component Dependencies:**

- Phase 1 Specs: MCP Server Infrastructure (mcp-server-infrastructure)
- Phase 2 Specs: Context Optimization & Caching (context-optimization-caching)
- Phase 3 Specs: Automatic Skill Evolution (automatic-skill-evolution)

---

## 📊 Executive Summary

### Business Alignment

**Purpose:** Transform sage-dev from sequential command execution into a parallel orchestration platform that dramatically improves developer productivity and reduces operational costs.

**Value Proposition:**

- **Developer Productivity:** 3-5x faster workflows (5-10 min → 1-2 min)
- **Cost Reduction:** 86% token reduction (250K → 35K tokens) directly reduces API costs
- **Institutional Memory:** Cross-session state persistence enables multi-day workflows and team collaboration
- **Automatic Orchestration:** Eliminates manual command chaining, reducing cognitive load
- **Strategic Differentiation:** First AI-native orchestration platform (vs adapted data pipeline tools)

**Target Users:**

1. **AI Agent Development Teams:** Building complex multi-agent systems with sage-dev
2. **Cost-Conscious Organizations:** Reducing LLM API costs through token efficiency
3. **Enterprise Development Teams:** Requiring state persistence and workflow resumption
4. **Feature Development Teams:** Needing rapid iteration cycles for complex features

### Technical Approach

**Architecture Pattern:** Code-First Orchestration with Unified Execution Environment

- All operations execute in single Node.js process (MCP server)
- DAG-based workflow definitions with dependency awareness
- Finite State Machine for workflow phase management
- LangGraph-style checkpointers for state persistence

**Technology Stack:** (Validated by Research)

- **Parallel Execution:** Promise.all() + Promise.allSettled() (JavaScript/TypeScript)
- **Dependency Management:** Kahn's algorithm for topological sorting
- **State Management:** FSM pattern + JSON-based checkpoints
- **Error Handling:** Circuit breaker pattern (Polly-inspired)
- **Throttling:** p-limit for API rate limiting
- **Integration:** MCP (Model Context Protocol) servers

**Implementation Strategy:** Phased rollout over 2 weeks (Phase 4.1 through 4.5)

1. Phase 4.1 (Days 1-3): Parallel execution engine
2. Phase 4.2 (Days 4-5): Dependency management
3. Phase 4.3 (Days 6-7): Workflow orchestration
4. Phase 4.4 (Days 8-9): State persistence & integration
5. Phase 4.5 (Day 10): Validation & documentation

### Key Success Metrics

**Service Level Objectives (SLOs):**

- **Availability:** 99.9% (orchestration engine uptime)
- **Response Time:** <100ms (workflow dispatch)
- **Throughput:** 10+ concurrent workflows
- **Error Rate:** <1% (excluding external API failures)
- **Resume Success:** ≥95% (from interrupted workflows)

**Key Performance Indicators (KPIs):**

- **Workflow Speedup:** 3-5x faster (measured: 5-10 min → 1-2 min)
- **Token Reduction:** 86% (measured: 250K → 35K)
- **Context Reload Elimination:** 100% (measured: 4-5 → 0)
- **Parallel Efficiency:** 3x speedup on independent operations
- **Cache Hit Rate:** 60%+ (research findings cached)

**System-Wide Impact (Phase 4 Complete):**

- Overall token reduction: 87% (142K avg → 19K avg)
- Overall performance: 4-6x faster
- Skill reuse rate: 80%+ (Phase 3 integration)
- Self-improvement: Active (continuous skill evolution)

---

## 💻 Code Examples & Patterns

### Repository Patterns

**Existing Server Pattern:** `servers/sage-enforcement/`

The sage-enforcement server provides a reference structure for MCP servers in this repository:

```
servers/sage-enforcement/
├── agents/          # Agent implementations
├── rules/           # Enforcement rules
├── schemas/         # Validation schemas
├── tests/           # Test suites
└── utils/           # Utility functions
```

**Application to Orchestration Server:**

```
servers/sage-orchestration/
├── workflow-orchestrator.ts      # Main orchestration logic
├── research-pipeline.ts          # Parallel research executor
├── dependency-manager.ts         # Kahn's algorithm
├── state-manager.ts              # Checkpoint/restore
├── workflow-templates.ts         # Pre-defined workflows
├── circuit-breaker.ts            # Error handling
├── types.ts                      # TypeScript definitions
├── index.ts                      # Server exports
└── __tests__/                    # Test suites
    ├── workflow-orchestrator.test.ts
    ├── dependency-manager.test.ts
    ├── state-manager.test.ts
    ├── research-pipeline.test.ts
    └── circuit-breaker.test.ts
```

### Implementation Reference Examples

**From Research (parallel-agent-orchestration-intel.md):**

**1. Promise.all() Pattern for Parallel Execution:**

```typescript
// Sequential (slow) - 135s total
const transcript1 = await getTranscript(call1); // 45s
const transcript2 = await getTranscript(call2); // 30s
const transcript3 = await getTranscript(call3); // 40s
const transcript4 = await getTranscript(call4); // 20s

// Parallel (fast) - 45s total
const [transcript1, transcript2, transcript3, transcript4] = await Promise.all([
  getTranscript(call1), // 45s
  getTranscript(call2), // 30s
  getTranscript(call3), // 40s
  getTranscript(call4)  // 20s
]);
// Total: max(45, 30, 40, 20) = 45s (3x speedup)
```

**Application:** Research pipeline will use this pattern for market research, competitive analysis, best practices, and pattern extraction.

**2. Kahn's Algorithm for Dependency Management:**

```typescript
function topologicalSort(graph: Graph): Node[] {
  const inDegree = new Map<Node, number>(); // Count of incoming edges
  const queue: Node[] = [];
  const result: Node[] = [];

  // Initialize in-degrees
  for (const node of graph.nodes) {
    inDegree.set(node, 0);
  }

  for (const node of graph.nodes) {
    for (const neighbor of node.dependencies) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
    }
  }

  // Enqueue nodes with no dependencies
  for (const [node, degree] of inDegree) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  // Process queue
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    for (const neighbor of node.dependents) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Cycle detection
  if (result.length !== graph.nodes.length) {
    throw new Error('Cycle detected in dependency graph');
  }

  return result;
}
```

**Application:** Dependency manager will use this for correct execution ordering with cycle detection.

**3. Circuit Breaker Pattern:**

```typescript
class CircuitBreaker {
  private failures = 0;
  private threshold = 5;
  private timeout = 60000; // 60s
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private lastFailure = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

**Application:** Protect external API calls (research, MCP servers) from cascade failures.

**4. LangGraph-Style Checkpointers:**

```typescript
interface WorkflowCheckpoint {
  phase: string;
  status: 'in_progress' | 'completed' | 'failed';
  results: any;
  timestamp: string;
  completedAt?: string;
}

async function saveCheckpoint(featureName: string, checkpoint: WorkflowCheckpoint) {
  const checkpointFile = `.sage/state/workflow-${featureName}.json`;
  const state = {
    version: "1.0",
    feature: featureName,
    checkpoints: [checkpoint],
    lastUpdated: new Date().toISOString()
  };

  // Atomic write: write to temp, validate, rename
  const tempFile = `${checkpointFile}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
  fs.renameSync(tempFile, checkpointFile);
}

async function resumeWorkflow(featureName: string): Promise<WorkflowState> {
  const checkpointFile = `.sage/state/workflow-${featureName}.json`;
  if (!fs.existsSync(checkpointFile)) {
    throw new Error('No checkpoint found');
  }

  const state = JSON.parse(fs.readFileSync(checkpointFile, 'utf-8'));

  // Find last completed phase
  const lastCompleted = state.checkpoints
    .filter(c => c.status === 'completed')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  return state;
}
```

**Application:** State manager will use this for cross-session persistence and resumption.

### Key Takeaways from Examples

**Performance Optimizations:**

- Use Promise.all() for independent operations (3x speedup)
- Filter data in code before logging to context (96% token reduction)
- Cache results progressively (TTL-based invalidation)
- Use p-limit for API throttling (respect rate limits)

**Error Handling Best Practices:**

- Circuit breaker for external APIs (prevent cascade failures)
- Promise.allSettled() for partial failure handling
- Progressive retry with backoff (exponential backoff)
- Fallback to cached data when available

**State Management Patterns:**

- Atomic writes (write to temp, rename)
- Checksum validation on load
- Backup before overwrite
- Separate checkpoint per phase

**Anti-Patterns to Avoid:**

- Over-awaiting (don't await each promise sequentially)
- No cycle detection (always validate DAG before execution)
- No error isolation (don't let one failure crash workflow)
- State corruption (always use atomic writes)

### New Patterns to Create

**Patterns This Implementation Will Establish:**

1. **AI-Native Workflow Orchestration**
   - **Purpose:** Orchestrate LLM agent workflows with token efficiency
   - **Location:** `servers/sage-orchestration/` (entire server)
   - **Reusability:** Template for other AI agent orchestration systems
   - **Key Innovation:** Zero context reloads through unified execution environment

2. **Research Pipeline Parallelization**
   - **Purpose:** Execute multiple research operations in parallel with result filtering
   - **Location:** `servers/sage-orchestration/research-pipeline.ts`
   - **Reusability:** Pattern for parallelizing any independent operations with context efficiency
   - **Key Innovation:** Filter in code, log summaries (180KB → 8KB)

3. **Dependency-Aware Batch Execution**
   - **Purpose:** Execute workflow DAGs with parallel within-batch, sequential across-batch
   - **Location:** `servers/sage-orchestration/dependency-manager.ts`
   - **Reusability:** Pattern for any dependency-aware task orchestration
   - **Key Innovation:** O(V+E) complexity with cycle detection

4. **Cross-Session Workflow State**
   - **Purpose:** Persist and resume multi-day workflows with 95%+ success rate
   - **Location:** `servers/sage-orchestration/state-manager.ts`
   - **Reusability:** Pattern for long-running agent workflows with checkpointing
   - **Key Innovation:** LangGraph-style checkpointers for AI workflows

---

## 🔧 Technology Stack

### Recommended Stack (from Research & Intel)

**Based on research from:** `docs/research/parallel-agent-orchestration-intel.md`

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Runtime | Node.js | ≥18.0.0 | Required for MCP server execution, async/await support, Promise.all() semantics |
| Language | TypeScript | ≥5.0 | Type safety for complex orchestration logic, better developer experience |
| MCP Framework | @modelcontextprotocol/sdk | Latest | Official Anthropic MCP SDK for server implementation |
| Testing | Vitest | Latest | Fast unit tests, TypeScript support, ESM-first |
| Validation | Zod | Latest | Runtime type validation for workflow definitions and state |
| CLI Integration | Python 3.12+ | ≥3.12 | Existing sage-dev CLI (Typer + Rich) |
| State Storage | JSON Files | - | Simple, auditable, version-control friendly (`.sage/state/`) |
| Logging | Console + Rich | - | Integrate with existing sage-dev CLI output |

**Key Technology Decisions:**

1. **Node.js/TypeScript for Orchestration Server**
   - **Rationale:** MCP servers run in Node.js, Promise.all() native support, async/await ergonomics
   - **Research Citation:** Anthropic MCP pattern validated with 98.7% token reduction in production
   - **Trade-off:** Introduces Node.js dependency to Python project, but necessary for MCP architecture

2. **JSON for State Persistence**
   - **Rationale:** Simple, human-readable, version-control friendly, no database overhead
   - **Research Citation:** LangGraph uses similar checkpoint pattern with 95%+ resume success
   - **Trade-off:** Not suitable for distributed systems, but acceptable for local-first architecture

3. **Kahn's Algorithm for Dependency Resolution**
   - **Rationale:** O(V+E) linear time complexity, built-in cycle detection, well-tested algorithm
   - **Research Citation:** Industry standard for DAG topological sorting (Make, Gradle, Bazel)
   - **Trade-off:** None - optimal algorithm for this use case

4. **Circuit Breaker for API Resilience**
   - **Rationale:** Prevent cascade failures, protect external APIs, improve user experience
   - **Research Citation:** Polly pattern, industry standard for microservices (2024)
   - **Trade-off:** Adds complexity, but critical for reliability

5. **p-limit for Throttling**
   - **Rationale:** Respect API rate limits, prevent resource exhaustion, simple API
   - **Research Citation:** Recommended by MDN and Node.js best practices
   - **Trade-off:** Additional dependency, but tiny (1KB)

### Alternatives Considered (from Research)

**Alternative 1: Apache Airflow**

- **Pros:** Mature, extensive integrations, large community, battle-tested
- **Cons:** Heavy infrastructure (requires database, workers, scheduler), data pipeline focused (not AI-native), complex setup
- **Why Not Chosen:** Too heavyweight for local-first tool, not designed for token efficiency or LLM workflows

**Alternative 2: Temporal**

- **Pros:** Code-first, durable execution, sophisticated state management, fault-tolerant
- **Cons:** Requires infrastructure (Temporal server), steep learning curve, microservices-focused
- **Why Not Chosen:** External dependencies conflict with local-first philosophy, overkill for use case

**Alternative 3: Prefect (with ControlFlow)**

- **Pros:** Modern API, LLM integration (2024), cloud-native, observability
- **Cons:** Python-only (MCP needs Node.js), still requires infrastructure, less control over token efficiency
- **Why Not Chosen:** Can't leverage MCP's unified execution environment, token efficiency not core focus

**Alternative 4: External Database for State (PostgreSQL, SQLite)**

- **Pros:** ACID guarantees, query capabilities, mature ecosystem
- **Cons:** Additional dependency, migration overhead, less auditable than JSON files
- **Why Not Chosen:** JSON files sufficient for local-first tool, human-readable state preferred for debugging

### Alignment with Existing System

**From Project Structure:**

**Consistent With:**

- Python CLI (Typer + Rich) - orchestration integrates via slash commands
- MCP architecture - orchestration server follows MCP pattern
- `.sage/` directory structure - state files in `.sage/state/`
- Ticket system - epic tickets reference orchestration plans

**New Additions:**

- Node.js/TypeScript runtime (for MCP server)
- `servers/sage-orchestration/` (new MCP server)
- `.sage/state/` (workflow state persistence)
- `.claude/commands/sage.workflow.md` (new command)

**Migration Considerations:**

- None - this is a new capability, not replacing existing functionality
- Backward compatible - existing sequential commands continue to work
- Gradual adoption - users can opt into orchestration with `/sage.workflow`

---

## 🏗️ Architecture Design

### System Context

**Existing System Architecture:**

Sage-dev is a CLI tool for AI agent development with context engineering:

- Python CLI (Typer + Rich) for user interaction
- Slash commands (`.claude/commands/`) for agent instructions
- Ticket system (`.sage/tickets/`) for task management
- MCP servers (`servers/`) for specialized capabilities
- Agent context (`.sage/agent/`) for code examples and patterns

**Integration Points:**

This orchestration server integrates with:

1. **CLI Layer:** New `/sage.workflow` command invokes orchestration
2. **MCP Servers:** Orchestration calls existing MCP servers (sage-research, sage-patterns, etc.)
3. **Ticket System:** Workflow state references tickets, results update tickets
4. **Cache Layer:** Orchestration leverages research cache (Phase 2)
5. **Skill System:** Orchestration discovers and uses skills (Phase 3)

**New Architectural Patterns:**

- **Unified Execution Environment:** All MCP servers share Node.js process (zero context reloads)
- **Dependency-Aware Orchestration:** DAG-based workflow execution with topological sorting
- **Cross-Session State:** Persistent workflow state with checkpoint/restore
- **Progressive Tool Discovery:** Load MCP tools on-demand (Anthropic pattern)

### Component Architecture

**Architecture Pattern:** Modular Monolith with Event-Driven Coordination

- **Rationale:**
  - Modular: Each orchestration concern (parallel exec, dependencies, state) is separate module
  - Monolith: All modules in single Node.js process (unified execution environment)
  - Event-Driven: Workflow phases emit events for progress tracking and state updates
  - **Research Citation:** Anthropic "Powerful Control Flow" pattern emphasizes unified execution

- **Alignment:** Fits with MCP architecture - orchestration server is just another MCP server

**System Design:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Sage-Dev CLI (Python)                        │
│                    /sage.workflow command                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              MCP: Sage-Orchestration Server (Node.js)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐     ┌──────────────────────┐        │
│  │  Workflow Orchestr.  │────▶│  Dependency Manager  │        │
│  │  - DAG execution     │     │  - Kahn's algorithm  │        │
│  │  - Phase coordination│     │  - Cycle detection   │        │
│  │  - Progress display  │     │  - Topo sort         │        │
│  └──────────┬───────────┘     └──────────┬───────────┘        │
│             │                             │                     │
│             ▼                             ▼                     │
│  ┌──────────────────────┐     ┌──────────────────────┐        │
│  │  Parallel Execution  │     │  State Manager       │        │
│  │  - Promise.all()     │     │  - Checkpoints       │        │
│  │  - Research pipeline │     │  - Resume support    │        │
│  │  - Result filtering  │     │  - Persistence       │        │
│  └──────────┬───────────┘     └──────────┬───────────┘        │
│             │                             │                     │
│             ▼                             ▼                     │
│  ┌──────────────────────────────────────────────┐             │
│  │          Workflow Templates                  │             │
│  │  - Feature development                       │             │
│  │  - Bug fix                                   │             │
│  │  - Enhancement                               │             │
│  └──────────────────────────────────────────────┘             │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│            Unified Code Environment (Node.js Process)           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ MCP Servers │  │   Caching   │  │   Skills    │            │
│  │  (Phase 1)  │  │  (Phase 2)  │  │  (Phase 3)  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                │                │                     │
│         └────────────────┴────────────────┘                     │
│                          │                                      │
│            ┌─────────────▼─────────────┐                       │
│            │  In-Memory Result Store   │                       │
│            │  - Research findings      │                       │
│            │  - Patterns               │                       │
│            │  - Specifications         │                       │
│            │  - Plans                  │                       │
│            └───────────────────────────┘                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Filesystem Persistence                       │
│  .sage/state/workflow-*.json  (Checkpoints)                    │
│  .sage/cache/                 (Research cache)                 │
│  .sage/tickets/               (Ticket system)                  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow:**

```
User: /sage.workflow "payment-processing"
  │
  ├─▶ CLI parses command, invokes MCP orchestration server
  │
  ├─▶ Orchestrator loads workflow template (feature development)
  │
  ├─▶ Dependency Manager builds DAG, detects cycles, generates execution order
  │   Batches: [research, patterns, standards], [specification], [planning], [implementation]
  │
  ├─▶ Parallel Execution (Batch 1): research + patterns + standards
  │   ├─ Promise.all([marketResearch(), competitiveAnalysis(), bestPractices(), extractPatterns()])
  │   ├─ Results stay in memory (no context reload)
  │   └─ Filter: 180KB → 8KB before logging
  │
  ├─▶ State Manager saves checkpoint: Phase 1 complete
  │
  ├─▶ Sequential Execution (Batch 2): specification
  │   ├─ Uses Phase 1 results from memory (no reload)
  │   └─ Generates: docs/specs/payment-processing/spec.md
  │
  ├─▶ State Manager saves checkpoint: Phase 2 complete
  │
  ├─▶ Sequential Execution (Batch 3): planning
  │   ├─ Uses Phase 1+2 results from memory (no reload)
  │   └─ Generates: docs/specs/payment-processing/plan.md
  │
  ├─▶ State Manager saves checkpoint: Phase 3 complete
  │
  ├─▶ Sequential Execution (Batch 4): implementation
  │   ├─ Uses all results from memory (no reload)
  │   └─ Generates: Code, tests, tickets
  │
  ├─▶ State Manager saves checkpoint: Phase 4 complete
  │
  └─▶ CLI displays: ✓ Workflow complete (1 min 15 sec, 35K tokens, 0 reloads)
```

### Architecture Decisions (from Research)

**Decision 1: Unified Execution Environment**

- **Choice:** All operations in single Node.js process (not distributed)
- **Rationale:** Anthropic pattern achieves 98.7% token reduction by eliminating context reloads
- **Implementation:** MCP orchestration server hosts all workflow operations
- **Trade-offs:**
  - **Pro:** Zero context reloads, massive token savings
  - **Pro:** Simpler architecture (no distributed coordination)
  - **Con:** Not suitable for multi-machine deployments (acceptable for local-first tool)

**Decision 2: DAG-Based Workflow Definition**

- **Choice:** Directed Acyclic Graph (DAG) for workflow structure
- **Rationale:** Industry standard (Airflow, Make, Gradle), optimal for dependency resolution
- **Implementation:** Kahn's algorithm for topological sort + cycle detection
- **Trade-offs:**
  - **Pro:** O(V+E) linear time complexity (efficient)
  - **Pro:** Built-in cycle detection (prevents infinite loops)
  - **Con:** No dynamic dependencies (must be known upfront)

**Decision 3: JSON-Based State Persistence**

- **Choice:** JSON files in `.sage/state/` (not database)
- **Rationale:** Simple, auditable, version-control friendly, no external dependencies
- **Implementation:** Atomic writes (write to temp, rename), checksum validation
- **Trade-offs:**
  - **Pro:** Human-readable, easy to debug
  - **Pro:** No database setup or maintenance
  - **Pro:** Version control friendly (can track state changes in git)
  - **Con:** Not suitable for high concurrency (acceptable for local tool)

**Decision 4: Event-Driven Progress Tracking**

- **Choice:** Workflow phases emit events for progress display
- **Rationale:** Decouple orchestration from UI, enable real-time progress without blocking
- **Implementation:** EventEmitter pattern for phase transitions
- **Trade-offs:**
  - **Pro:** Flexible (can add new progress handlers)
  - **Pro:** Non-blocking (orchestration continues while events processed)
  - **Con:** Slightly more complex than direct logging

**Decision 5: Template-Based Workflows**

- **Choice:** Pre-defined templates (feature, bugfix, enhancement) + custom support
- **Rationale:** Common patterns reusable, lower cognitive load, faster workflow creation
- **Implementation:** JSON workflow definitions with validation
- **Trade-offs:**
  - **Pro:** Faster for common cases (no manual DAG creation)
  - **Pro:** Best practices baked in (e.g., parallel research in feature template)
  - **Con:** Less flexible than fully custom workflows (but custom templates supported)

### Component Breakdown

**Core Components:**

**1. Workflow Orchestrator** (`workflow-orchestrator.ts`)

- **Purpose:** Main orchestration engine, coordinates all workflow execution
- **Technology:** TypeScript with async/await
- **Pattern:** Mediator pattern (coordinates between components)
- **Interfaces:**
  - `executeWorkflow(definition: WorkflowDefinition): Promise<WorkflowResult>`
  - `resumeWorkflow(featureName: string): Promise<WorkflowResult>`
  - `listActiveWorkflows(): Promise<string[]>`
- **Dependencies:** DependencyManager, ParallelExecutor, StateManager
- **Responsibilities:**
  - Load workflow template or custom definition
  - Validate workflow DAG (no cycles)
  - Coordinate execution across phases
  - Emit progress events
  - Handle errors and partial failures

**2. Dependency Manager** (`dependency-manager.ts`)

- **Purpose:** Resolve workflow dependencies, generate execution order
- **Technology:** TypeScript, Kahn's algorithm
- **Pattern:** Strategy pattern (different sorting strategies)
- **Interfaces:**
  - `addNode(node: WorkflowNode): void`
  - `getExecutionOrder(): string[][]` (batches)
  - `detectCycle(): boolean`
  - `validateDAG(): void`
- **Dependencies:** None (pure algorithm)
- **Responsibilities:**
  - Build dependency graph from workflow definition
  - Detect cycles (throw error if found)
  - Topological sort for execution order
  - Group independent nodes into parallel batches

**3. Parallel Executor** (`research-pipeline.ts`)

- **Purpose:** Execute multiple operations in parallel with result filtering
- **Technology:** TypeScript, Promise.all(), p-limit
- **Pattern:** Facade pattern (simplifies parallel execution)
- **Interfaces:**
  - `executeResearchPipeline(topic: string): Promise<ResearchResults>`
  - `executeBatch(operations: Operation[]): Promise<Results[]>`
  - `executeWithThrottling(operations: Operation[], limit: number): Promise<Results[]>`
- **Dependencies:** MCP servers (sage-research, sage-patterns, etc.), circuit breaker
- **Responsibilities:**
  - Execute independent operations in parallel
  - Filter results in code (before context logging)
  - Cache results for future use
  - Respect API rate limits (p-limit)
  - Handle partial failures (Promise.allSettled)

**4. State Manager** (`state-manager.ts`)

- **Purpose:** Persist and restore workflow state across sessions
- **Technology:** TypeScript, Node.js fs, JSON
- **Pattern:** Memento pattern (capture and restore state)
- **Interfaces:**
  - `saveCheckpoint(featureName: string, checkpoint: Checkpoint): Promise<void>`
  - `loadCheckpoint(featureName: string): Promise<WorkflowState>`
  - `resumeWorkflow(featureName: string): Promise<WorkflowState>`
  - `deleteCheckpoint(featureName: string): Promise<void>`
- **Dependencies:** Filesystem (`.sage/state/`)
- **Responsibilities:**
  - Save checkpoint after each phase (atomic writes)
  - Validate state integrity (checksums)
  - Restore state for resumption
  - Clean up old checkpoints

**5. Workflow Templates** (`workflow-templates.ts`)

- **Purpose:** Pre-defined workflow patterns for common use cases
- **Technology:** TypeScript, JSON schemas
- **Pattern:** Factory pattern (create workflows from templates)
- **Interfaces:**
  - `getTemplate(name: string): WorkflowDefinition`
  - `listTemplates(): string[]`
  - `validateTemplate(definition: WorkflowDefinition): boolean`
  - `registerCustomTemplate(name: string, definition: WorkflowDefinition): void`
- **Dependencies:** None (static definitions)
- **Responsibilities:**
  - Provide feature development template
  - Provide bug fix template
  - Provide enhancement template
  - Support custom template registration
  - Validate template DAG structure

**6. Circuit Breaker** (`circuit-breaker.ts`)

- **Purpose:** Protect external APIs from cascade failures
- **Technology:** TypeScript
- **Pattern:** Circuit Breaker pattern (Polly-inspired)
- **Interfaces:**
  - `execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>`
  - `getState(): CircuitState`
  - `reset(): void`
- **Dependencies:** None (self-contained)
- **Responsibilities:**
  - Track failure rate
  - Open circuit after threshold failures
  - Close circuit after successful recovery
  - Provide fallback mechanism
  - Log state transitions

**7. Types** (`types.ts`)

- **Purpose:** TypeScript type definitions for entire orchestration system
- **Technology:** TypeScript interfaces and types
- **Pattern:** Type-driven development
- **Exports:**
  - `WorkflowDefinition`, `WorkflowNode`, `WorkflowPhase`
  - `WorkflowState`, `Checkpoint`, `PhaseResult`
  - `CircuitState`, `ExecutionBatch`, `ResearchResults`
- **Dependencies:** None (pure types)

**8. Server Index** (`index.ts`)

- **Purpose:** MCP server exports and initialization
- **Technology:** TypeScript, MCP SDK
- **Pattern:** Facade pattern (unified server interface)
- **Exports:**
  - MCP server handler
  - Tool definitions for CLI integration
  - Health check endpoint
- **Dependencies:** All orchestration components

### Data Flow & Boundaries

**Request Flow:**

```
1. User Request
   /sage.workflow "payment-processing"
   ↓
2. CLI Processing (Python)
   - Parse command arguments
   - Validate feature name
   - Invoke MCP orchestration server
   ↓
3. Orchestration Server (Node.js)
   - Load workflow template (feature development)
   - Build dependency graph
   - Validate DAG (no cycles)
   ↓
4. Dependency Resolution
   - Kahn's algorithm for topological sort
   - Generate execution batches:
     Batch 1: [research, patterns, standards] (parallel)
     Batch 2: [specification] (sequential)
     Batch 3: [planning] (sequential)
     Batch 4: [implementation] (sequential)
   ↓
5. Execution Loop (for each batch)
   - If parallel batch: Promise.all(operations)
   - If sequential batch: await operation
   - Save checkpoint after each batch
   - Emit progress events
   - Filter results before logging
   ↓
6. Result Processing
   - Aggregate results from all batches
   - Save final checkpoint
   - Return to CLI
   ↓
7. CLI Display (Python)
   - Format results with Rich
   - Display progress summary
   - Show metrics (time, tokens, reloads)
```

**Component Boundaries:**

**Public Interface (MCP Server):**

- `/sage.workflow` command handler
- `/sage.workflow --resume` handler
- `/sage.workflow --template` handler
- `/sage.workflow --list` handler

**Internal Implementation (Hidden):**

- Dependency resolution algorithms
- State persistence format
- Circuit breaker state machine
- Parallel execution coordination

**Cross-Component Contracts:**

1. **Orchestrator ↔ Dependency Manager:**
   - Input: `WorkflowDefinition` (nodes + dependencies)
   - Output: `ExecutionBatch[]` (ordered batches)

2. **Orchestrator ↔ Parallel Executor:**
   - Input: `Operation[]` (batch of operations)
   - Output: `Results[]` (filtered results)

3. **Orchestrator ↔ State Manager:**
   - Input: `featureName, Checkpoint` (phase results)
   - Output: `void` (saved) or `WorkflowState` (loaded)

4. **Orchestrator ↔ MCP Servers:**
   - Input: Operation parameters (topic, query, etc.)
   - Output: Operation results (research, patterns, specs, etc.)

5. **Orchestrator ↔ CLI:**
   - Input: Command + arguments
   - Output: Workflow results + progress events

---

## 4. Technical Specification

### Data Model

**Workflow Definition:**

```typescript
interface WorkflowDefinition {
  name: string;                  // Workflow name
  description?: string;          // Description
  phases: PhaseDefinition[];     // Ordered phases
  timeout?: number;              // Global timeout (ms)
}

interface PhaseDefinition {
  id: string;                    // Unique phase ID
  name: string;                  // Human-readable name
  operations: OperationDefinition[] | OperationDefinition;  // Parallel or single
  dependencies: string[];        // Phase IDs this depends on
  timeout?: number;              // Phase-specific timeout
}

interface OperationDefinition {
  type: string;                  // Operation type (research, pattern, spec, etc.)
  params: Record<string, any>;   // Operation parameters
}
```

**Workflow State:**

```typescript
interface WorkflowState {
  version: string;               // State format version ("1.0")
  feature: string;               // Feature name
  template: string;              // Template used
  phase: string;                 // Current phase ID
  status: 'running' | 'paused' | 'completed' | 'failed';
  checkpoints: Map<string, Checkpoint>;  // Phase checkpoints
  startedAt: string;             // ISO 8601 timestamp
  lastUpdatedAt: string;         // ISO 8601 timestamp
  metrics: WorkflowMetrics;      // Performance metrics
}

interface Checkpoint {
  phaseId: string;               // Phase identifier
  status: 'in_progress' | 'completed' | 'failed';
  results: any;                  // Phase-specific results
  timestamp: string;             // ISO 8601 timestamp
  completedAt?: string;          // ISO 8601 timestamp (if completed)
  error?: string;                // Error message (if failed)
  metrics: PhaseMetrics;         // Phase performance
}

interface WorkflowMetrics {
  totalTime: number;             // Total execution time (ms)
  totalTokens: number;           // Total tokens consumed
  contextReloads: number;        // Number of context reloads (should be 0)
  phaseCount: number;            // Number of phases executed
}

interface PhaseMetrics {
  duration: number;              // Phase duration (ms)
  tokens: number;                // Tokens consumed
  operationCount: number;        // Number of operations
  parallelOps: number;           // Number of parallel operations
}
```

**Dependency Graph:**

```typescript
interface DependencyGraph {
  nodes: Map<string, WorkflowNode>;      // Node ID → Node
  edges: Map<string, Set<string>>;       // Node ID → Dependent IDs
  inDegree: Map<string, number>;         // Node ID → Incoming edge count
}

interface WorkflowNode {
  id: string;                            // Unique node ID
  operation: () => Promise<any>;         // Operation to execute
  dependencies: string[];                // IDs of nodes this depends on
  dependents: string[];                  // IDs of nodes that depend on this
}
```

**Validation Rules:**

1. **Workflow Definition:**
   - `name` must be non-empty string
   - `phases` must have at least 1 phase
   - Phase IDs must be unique
   - Dependencies must reference existing phase IDs
   - No cycles in dependency graph

2. **State Persistence:**
   - Checkpoints must have valid timestamps
   - Status must be one of: 'in_progress', 'completed', 'failed'
   - Results must be JSON-serializable
   - Version must match current format ("1.0")

3. **Execution:**
   - All dependencies must complete before dependent
   - Failed dependencies block dependents
   - Timeout violations result in failure
   - Partial failures logged but don't block independent operations

**Indexing Strategy:**

- **In-Memory:** Map-based indexing for fast lookups during execution
- **Filesystem:** File-per-workflow pattern (`.sage/state/workflow-{feature}.json`)
- **Cache:** TTL-based cache invalidation (30 days default)

**Migration Approach:**

- Version field in state format enables forward/backward compatibility
- V1.0 → V1.1: Add new optional fields, ignore on load if missing
- Breaking changes: Bump major version, migrate on load

### API Design

**Top 6 Critical Endpoints (MCP Tools):**

**1. Execute Workflow**

- **Method:** POST
- **Tool:** `sage_workflow_execute`
- **Purpose:** Execute full workflow for a feature
- **Request Schema:**

  ```typescript
  {
    feature: string;           // Feature name
    template?: string;         // Template name (default: "feature")
    options?: {
      parallel?: boolean;      // Enable parallelization (default: true)
      caching?: boolean;       // Enable caching (default: true)
      timeout?: number;        // Global timeout (ms)
    }
  }
  ```

- **Response Schema:**

  ```typescript
  {
    success: boolean;
    workflowId: string;
    status: 'completed' | 'failed';
    results: {
      phases: PhaseResult[];
      metrics: WorkflowMetrics;
    };
    errors?: string[];
  }
  ```

- **Error Handling:**
  - `WORKFLOW_VALIDATION_ERROR`: Invalid workflow definition
  - `CYCLE_DETECTED`: Dependency cycle found
  - `TIMEOUT_EXCEEDED`: Workflow timeout
  - `EXTERNAL_API_FAILURE`: MCP server failure

**2. Resume Workflow**

- **Method:** POST
- **Tool:** `sage_workflow_resume`
- **Purpose:** Resume interrupted workflow from last checkpoint
- **Request Schema:**

  ```typescript
  {
    feature: string;           // Feature name
    fromPhase?: string;        // Resume from specific phase (default: last completed)
  }
  ```

- **Response Schema:**

  ```typescript
  {
    success: boolean;
    workflowId: string;
    resumedFrom: string;       // Phase ID resumed from
    status: 'completed' | 'failed';
    results: {
      phases: PhaseResult[];
      metrics: WorkflowMetrics;
    };
  }
  ```

- **Error Handling:**
  - `NO_CHECKPOINT_FOUND`: No saved state for feature
  - `STATE_CORRUPTED`: Checksum validation failed
  - `INVALID_PHASE`: Requested resume phase doesn't exist

**3. List Active Workflows**

- **Method:** GET
- **Tool:** `sage_workflow_list`
- **Purpose:** List all active workflows
- **Request Schema:**

  ```typescript
  {
    filter?: 'running' | 'paused' | 'completed' | 'failed';
  }
  ```

- **Response Schema:**

  ```typescript
  {
    workflows: Array<{
      feature: string;
      template: string;
      phase: string;
      status: string;
      startedAt: string;
      progress: number;         // Percentage (0-100)
    }>;
  }
  ```

- **Error Handling:**
  - `FILESYSTEM_ERROR`: Can't read `.sage/state/`

**4. Get Workflow Status**

- **Method:** GET
- **Tool:** `sage_workflow_status`
- **Purpose:** Get detailed status of specific workflow
- **Request Schema:**

  ```typescript
  {
    feature: string;
  }
  ```

- **Response Schema:**

  ```typescript
  {
    feature: string;
    template: string;
    phase: string;
    status: string;
    startedAt: string;
    lastUpdatedAt: string;
    progress: {
      completed: number;        // Completed phases
      total: number;            // Total phases
      percentage: number;       // 0-100
    };
    metrics: WorkflowMetrics;
    errors?: string[];
  }
  ```

- **Error Handling:**
  - `WORKFLOW_NOT_FOUND`: No workflow for feature

**5. Cancel Workflow**

- **Method:** POST
- **Tool:** `sage_workflow_cancel`
- **Purpose:** Cancel running workflow gracefully
- **Request Schema:**

  ```typescript
  {
    feature: string;
    saveCheckpoint?: boolean;  // Save state before cancel (default: true)
  }
  ```

- **Response Schema:**

  ```typescript
  {
    success: boolean;
    feature: string;
    cancelledAt: string;
    checkpointSaved: boolean;
  }
  ```

- **Error Handling:**
  - `WORKFLOW_NOT_RUNNING`: Can't cancel non-running workflow
  - `CHECKPOINT_SAVE_FAILED`: Couldn't save state

**6. Validate Workflow Template**

- **Method:** POST
- **Tool:** `sage_workflow_validate`
- **Purpose:** Validate custom workflow template before execution
- **Request Schema:**

  ```typescript
  {
    template: WorkflowDefinition;
  }
  ```

- **Response Schema:**

  ```typescript
  {
    valid: boolean;
    errors?: Array<{
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }>;
    warnings?: string[];
    graph: {
      nodes: number;
      edges: number;
      depth: number;            // Max dependency depth
    };
  }
  ```

- **Error Handling:**
  - None (validation always returns success with errors array)

### Security (from Research)

**Based on:** `docs/research/parallel-agent-orchestration-intel.md` Section 6 (Race Conditions & Security)

**Authentication/Authorization:**

- **Approach:** Local-first tool, no authentication required
- **Implementation:** File system permissions control access
- **Standards:** POSIX file permissions (600 for state files, 700 for directories)

**Secrets Management:**

- **Strategy:** Environment variables for API keys, never in state files
- **Pattern:** Filter secrets before state persistence
- **Validation:** Scan state files for common secret patterns before write
- **Rotation:** User responsibility (environment variables)

**Data Protection:**

- **Encryption in Transit:** N/A (local tool, no network communication except external APIs)
- **Encryption at Rest:** State files encrypted with AES-256 (optional, configurable)
- **PII Handling:** Filter PII before logging to context or state
- **Compliance:** User responsibility (tool provides primitives)

**Execution Sandboxing:**

- **Approach:** Resource limits per operation (memory, CPU, time)
- **Implementation:** Node.js worker threads with resource constraints
- **Filesystem:** Restrict access to project directory only
- **Network:** Whitelist approved endpoints (MCP servers, research APIs)

**Security Testing:**

- **Approach:** SAST (static analysis) for secret detection
- **Tools:**
  - `semgrep` for secret scanning
  - TypeScript strict mode for type safety
  - ESLint security plugin
- **Frequency:** Pre-commit hooks + CI pipeline

**Compliance:**

- **OWASP Top 10:** Address injection, XSS, insecure deserialization
- **Input Validation:** Zod schemas for all external input
- **Output Encoding:** Sanitize before logging to CLI

**Audit Logging:**

- **Events Logged:**
  - Workflow start/stop/resume
  - State file modifications
  - Error occurrences
  - External API calls
- **Format:** JSON lines (`.sage/logs/audit.jsonl`)
- **Retention:** 30 days (configurable)
- **Access:** File system permissions (owner only)

### Performance (from Research)

**Based on:** `docs/research/parallel-agent-orchestration-intel.md` Sections 1-3 (Parallel Execution, Performance Validation)

**Performance Targets (from Research):**

| Metric | Baseline | Target | Rationale |
|--------|----------|--------|-----------|
| Research Pipeline | 135s | 45s | 3x speedup from parallel execution (research) |
| Full Workflow | 5-10 min | 1-2 min | 3-5x speedup from parallelization + zero reloads (research) |
| Token Usage | 250K | 35K | 86% reduction from context efficiency (research) |
| Context Reloads | 4-5 | 0 | 100% elimination from unified environment (research) |
| Resume Success | N/A | ≥95% | LangGraph-style checkpointers validated (research) |
| Memory Usage | N/A | 200-300MB | 50MB per operation, 4-6 parallel (research) |

**Caching Strategy:**

- **Approach:** Research findings cached in `.sage/cache/` with TTL-based invalidation
- **Pattern:** Check cache before expensive operations (market research, competitive analysis)
- **TTL Strategy:** 30 days default, configurable per operation type
- **Invalidation:** Time-based (TTL) + manual (`/sage.cache --clear`)
- **Cache Hit Rate Target:** 60%+ (repeat features benefit from cached research)
- **Storage:** JSON files with checksums for integrity

**Database Optimization:**

- **N/A:** No database (JSON file-based state persistence)

**Scaling Strategy:**

- **Horizontal:** N/A (local-first tool, single machine)
- **Vertical:** Configurable parallelism (4-6 operations default, adjustable)
- **Auto-scaling:** N/A
- **Performance Monitoring:**
  - Metrics embedded in checkpoint files
  - Progress events with timing data
  - Summary displayed at workflow completion

**API Throttling:**

- **Tool:** p-limit npm package
- **Configuration:** Default 4 concurrent requests, configurable per API
- **Rationale:** Respect rate limits, prevent resource exhaustion
- **Implementation:**

  ```typescript
  import pLimit from 'p-limit';

  const limit = pLimit(4);
  const results = await Promise.all(
    operations.map(op => limit(() => op.execute()))
  );
  ```

**Result Filtering (Context Efficiency):**

- **Strategy:** Filter large datasets in code before logging to context
- **Pattern:**

  ```typescript
  // Large dataset stays in execution environment
  const allUsers = await fetchUsers(); // 10,000 users, 5MB

  // Filter before logging to context
  const topUsers = allUsers.slice(0, 10); // 10 users, 5KB
  console.log(topUsers); // Only 5KB to context
  ```

- **Impact:** Research phase 180KB → 8KB (96% reduction)
- **Rationale:** Anthropic pattern validated with 98.7% token reduction

**Connection Pooling:**

- **N/A:** MCP servers use HTTP/WebSocket (stateless)

**Query Optimization:**

- **N/A:** No database queries

---

## 5. Development Setup

### Required Tools and Versions

**Core Requirements:**

- **Node.js:** ≥18.0.0 (async/await, Promise.all(), ESM support)
- **npm:** ≥9.0.0 (workspaces, package-lock v3)
- **TypeScript:** ≥5.0.0 (type-driven development)
- **Python:** ≥3.12.0 (existing CLI, integration)

**Development Tools:**

- **Code Editor:** VS Code recommended (TypeScript IntelliSense)
- **Git:** ≥2.30.0 (version control)
- **uv:** Latest (Python package manager, existing project standard)

**Testing Framework:**

- **Vitest:** Latest (fast unit tests, TypeScript support)
- **Test Coverage:** ≥90% target

**Linting & Formatting:**

- **ESLint:** Latest (code quality)
- **Prettier:** Latest (code formatting)
- **TypeScript:** Strict mode enabled

### Local Environment

**Directory Structure:**

```
sage-dev/
├── servers/
│   └── sage-orchestration/          # New orchestration server
│       ├── workflow-orchestrator.ts
│       ├── research-pipeline.ts
│       ├── dependency-manager.ts
│       ├── state-manager.ts
│       ├── workflow-templates.ts
│       ├── circuit-breaker.ts
│       ├── types.ts
│       ├── index.ts
│       ├── package.json             # Server dependencies
│       ├── tsconfig.json            # TypeScript config
│       └── __tests__/               # Test suites
├── .sage/
│   ├── state/                       # Workflow state (gitignored)
│   ├── cache/                       # Research cache (existing)
│   └── tickets/                     # Ticket system (existing)
├── .claude/
│   └── commands/
│       └── sage.workflow.md         # New workflow command
├── pyproject.toml                   # Python project config
└── README.md                        # Updated with Phase 4 docs
```

**Environment Variables:**

```bash
# .env (gitignored, user-created)
ANTHROPIC_API_KEY=sk-...            # For research API calls
SAGE_PARALLEL_LIMIT=4               # Max parallel operations (default: 4)
SAGE_WORKFLOW_TIMEOUT=600000        # Global timeout ms (default: 10 min)
SAGE_CACHE_TTL=2592000000           # Cache TTL ms (default: 30 days)
SAGE_STATE_ENCRYPTION=false         # Encrypt state files (default: false)
```

**Docker Compose (Optional):**

```yaml
# docker-compose.yml
version: '3.8'

services:
  sage-dev:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  # Future: Add MCP server containers if needed
```

**Installation Steps:**

```bash
# 1. Install Node.js dependencies (orchestration server)
cd servers/sage-orchestration
npm install

# 2. Install Python dependencies (existing CLI)
cd ../..
uv sync

# 3. Build TypeScript
cd servers/sage-orchestration
npm run build

# 4. Run tests
npm test

# 5. Start development mode (watch)
npm run dev
```

### CI/CD Pipeline Requirements

**GitHub Actions Workflow:**

```yaml
# .github/workflows/orchestration.yml
name: Orchestration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd servers/sage-orchestration
          npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

**Quality Gates:**

- **Test Coverage:** ≥90% (fail pipeline if below)
- **Type Errors:** 0 (TypeScript strict mode)
- **Linting Errors:** 0 (ESLint)
- **Security:** No high/critical vulnerabilities (npm audit)

### Testing Framework and Coverage Targets

**Testing Stack:**

- **Framework:** Vitest (fast, TypeScript-first)
- **Mocking:** Vitest built-in mocks
- **Assertions:** Expect (Vitest/Jest-compatible)
- **Coverage:** c8 (Vitest's default coverage tool)

**Test Structure:**

```
servers/sage-orchestration/__tests__/
├── workflow-orchestrator.test.ts    # Orchestration logic
├── dependency-manager.test.ts       # Kahn's algorithm, cycle detection
├── state-manager.test.ts            # Checkpoint/restore
├── research-pipeline.test.ts        # Parallel execution
├── circuit-breaker.test.ts          # Error handling
└── integration.test.ts              # End-to-end workflows
```

**Coverage Targets:**

- **Overall:** ≥90%
- **Critical Paths:** 100% (dependency resolution, state persistence, parallel execution)
- **Error Handling:** 100% (circuit breaker, partial failures)

**Test Categories:**

1. **Unit Tests (≥90% coverage):**
   - Kahn's algorithm correctness
   - Cycle detection accuracy
   - Checkpoint save/load integrity
   - Circuit breaker state transitions
   - Template validation

2. **Integration Tests (≥80% coverage):**
   - Full workflow execution
   - Resume from interrupted state
   - Parallel execution with real operations
   - Error recovery scenarios
   - Cache integration

3. **Performance Tests:**
   - Parallel vs sequential speedup (measure 3x)
   - Full workflow time (measure 3-5x)
   - Token usage (measure 86% reduction)
   - Context reloads (verify 0)
   - Memory usage (verify 200-300MB)

4. **Security Tests:**
   - Secret filtering from state
   - Filesystem access restrictions
   - Input validation (Zod schemas)
   - Audit logging

**Test Execution:**

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test workflow-orchestrator.test.ts

# Watch mode
npm test -- --watch

# Integration tests only
npm test integration.test.ts
```

---

## 6. Risk Management

### Critical Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation | Contingency |
|------|--------|------------|------------|-------------|
| **Dependency cycle not detected** | High | Low | Kahn's algorithm with cycle detection before execution, comprehensive test suite with 10+ cycle scenarios, template validation before workflow start | If cycle found at runtime: halt workflow, display cycle path, guide user to fix definition |
| **Race conditions in parallel ops** | High | Medium | Promise.all() semantics (no shared mutable state), file-based locks for state files, integration tests with concurrent workflows | If race detected: retry with exponential backoff, log incident, alert user |
| **State corruption (checkpoint files)** | Medium | Low | Atomic writes (write to temp, rename), checksum validation on load, backup before overwrite, comprehensive tests | If corruption detected: restore from backup, resume from previous checkpoint, log error |
| **Performance not as expected** | High | Low | Benchmarking against baseline (5-10 min → 1-2 min), fallback to sequential if parallel slower, optimization iterations | If target missed: profile operations, optimize bottlenecks, adjust parallelism limit |
| **Integration complexity (Phases 1-4)** | High | High | Incremental rollout (Phase 4.1-4.5), extensive integration tests, backward compatibility maintained, gradual migration | If integration fails: roll back to previous phase, fix integration issues, re-test |
| **Partial failure handling** | Medium | Medium | Promise.allSettled() for fail-safe execution, circuit breaker for external APIs, progressive retry with backoff | If partial failure: log failures, continue with successful operations, notify user |
| **Long-running operation timeout** | Medium | Low | Configurable timeouts per phase (default 10 min), save partial state before timeout, resume capability | If timeout: save checkpoint, notify user, allow resume from last completed phase |
| **Concurrent workflow conflicts** | Low | Low | Lock mechanism (ACTIVE_WORKFLOWS.json), detect conflicts before start, prompt user to resolve | If conflict: display active workflows, allow user to cancel/wait, retry after resolution |
| **MCP server unavailability** | High | Medium | Circuit breaker protection, fallback to cached data, health checks before workflow start | If MCP down: use cached results if available, defer operation, notify user |
| **Token limit exceeded** | Low | Low | Context efficiency (filter results in code), token tracking per phase, alert before limit | If limit exceeded: pause workflow, log token usage, guide user to optimize |
| **Insufficient memory** | Low | Low | Memory limits per operation (50MB), garbage collection after phases, parallelism limit (4-6) | If OOM: reduce parallelism, run sequential fallback, increase system resources |
| **TypeScript/Node.js integration with Python CLI** | Medium | Medium | Well-defined MCP interface, integration tests, clear error messages across language boundary | If integration issues: enhance error logging, add retry logic, improve MCP protocol handling |

### Critical Success Factors

**1. Dependency Graph Correctness:**

- **Strategy:** Kahn's algorithm with O(V+E) complexity, cycle detection before execution
- **Validation:** Test suite with 20+ graph scenarios (simple, complex, cycles, deep nesting)
- **Fallback:** Sequential execution if cycle detected, clear error message with cycle path

**2. Race Condition Prevention:**

- **Strategy:** Promise.all() semantics (no shared mutable state), file-based locks for state files
- **Validation:** Concurrent execution stress tests (10+ parallel workflows)
- **Monitoring:** Log all file access, detect lock conflicts, alert on failures

**3. State Persistence Reliability:**

- **Strategy:** Atomic writes, checksum validation (SHA-256), backup before overwrite
- **Validation:** Corrupt checkpoint tests (intentionally corrupt file, verify recovery)
- **Recovery:** Restore from backup (.bak file), restart from last valid phase

**4. Performance Achievement:**

- **Strategy:** Benchmark against baseline (5-10 min → 1-2 min), measure speedup per phase
- **Validation:**
  - Parallel operations: 3x speedup (measured)
  - Full workflow: 3-5x speedup (measured)
  - Token reduction: 86% (measured)
  - Context reloads: 0 (verified)
- **Fallback:** Sequential execution if parallel slower (adaptive strategy)

**5. Integration Stability:**

- **Strategy:** Incremental rollout (Phase 4.1-4.5), extensive integration testing
- **Validation:** All phases (1, 2, 3, 4) work together, end-to-end tests pass
- **Monitoring:** Track token usage, execution time, error rates per phase

### Monitoring & Alerting

**Key Metrics to Monitor:**

1. Workflow execution time (target: 1-2 min)
2. Token usage per workflow (target: 35K)
3. Context reloads (target: 0)
4. Resume success rate (target: ≥95%)
5. Cache hit rate (target: 60%+)
6. Error rate (target: <1%)
7. Memory usage (target: 200-300MB)

**Alerting Thresholds:**

- Workflow time >5 min (investigate performance degradation)
- Token usage >100K (investigate context efficiency)
- Context reloads >0 (investigate unified environment failure)
- Resume success rate <90% (investigate state persistence)
- Error rate >5% (investigate external API issues)

---

## 7. Implementation Roadmap

### Phase 4.1: Parallel Execution Foundation (Days 1-3)

**Goal:** Implement Promise.all()-based parallel execution with 3x speedup validation

**Deliverables:**

1. `research-pipeline.ts` with parallel execution
   - Promise.all() for market research, competitive analysis, best practices
   - Result filtering (180KB → 8KB)
   - p-limit integration for API throttling
2. `circuit-breaker.ts` for error handling
   - CLOSED, OPEN, HALF_OPEN states
   - Failure tracking and recovery
   - Fallback mechanism
3. Unit tests for parallel execution
   - Promise.all() behavior
   - p-limit throttling
   - Circuit breaker state machine
4. Benchmarking suite
   - Parallel vs sequential comparison
   - 3x speedup validation

**Success Criteria:**

- ✅ Research pipeline completes in max(45s) not sum(135s)
- ✅ 3x speedup measured and validated
- ✅ Token reduction: 180K → 8K (96%)
- ✅ No race conditions detected
- ✅ Circuit breaker prevents cascade failures
- ✅ Unit tests: ≥90% coverage

**Dependencies:**

- None (foundation phase)

**Risks:**

- API rate limiting (mitigation: p-limit)
- Partial failures (mitigation: Promise.allSettled, circuit breaker)

---

### Phase 4.2: Dependency Management (Days 4-5)

**Goal:** Implement Kahn's algorithm for dependency resolution with cycle detection

**Deliverables:**

1. `dependency-manager.ts` with Kahn's algorithm
   - Topological sort for execution order
   - Cycle detection before execution
   - Batch generation (parallel within, sequential across)
2. `types.ts` with type definitions
   - WorkflowDefinition, WorkflowNode, ExecutionBatch
   - DependencyGraph, CircuitState
3. DAG visualization (console output)
   - Display execution order
   - Show parallel batches
4. Unit tests for dependency management
   - Cycle detection (positive and negative cases)
   - Topological sort correctness
   - Complex graphs (50+ nodes)

**Success Criteria:**

- ✅ Dependency graphs generated correctly
- ✅ Cycles detected and rejected with clear error
- ✅ Execution order validated (dependencies before dependents)
- ✅ Integration tests pass (10+ workflow templates)
- ✅ Handles complex graphs (50+ nodes) efficiently
- ✅ Unit tests: ≥95% coverage (critical path)

**Dependencies:**

- Phase 4.1 (parallel execution)

**Risks:**

- Complex graphs (mitigation: O(V+E) algorithm, tested at scale)
- Cycle detection failures (mitigation: comprehensive test suite)

---

### Phase 4.3: Workflow Orchestration (Days 6-7)

**Goal:** Implement full workflow orchestration with templates and real-time progress

**Deliverables:**

1. `workflow-orchestrator.ts` with main orchestration logic
   - Load workflow template or custom definition
   - Validate DAG (no cycles)
   - Coordinate execution across phases
   - Emit progress events
2. `workflow-templates.ts` with pre-defined workflows
   - Feature development template
   - Bug fix template
   - Enhancement template
   - Custom template support
3. Real-time progress display
   - Phase transitions
   - Parallel operation status
   - Completion percentage
4. Integration with existing MCP servers
   - sage-research, sage-patterns, sage-specification, etc.
5. Integration tests for full workflows
   - End-to-end feature workflow
   - Bug fix workflow
   - Enhancement workflow

**Success Criteria:**

- ✅ Full workflow: 5-10 min → 1-2 min (3-5x validated)
- ✅ Token reduction: 250K → 35K (86% validated)
- ✅ Zero context reloads confirmed
- ✅ Templates execute correctly
- ✅ Progress displayed in real-time
- ✅ Integration tests: 100% pass rate

**Dependencies:**

- Phase 4.1 (parallel execution)
- Phase 4.2 (dependency management)
- Existing MCP servers (Phase 1)

**Risks:**

- Integration complexity (mitigation: incremental integration, extensive tests)
- Performance targets not met (mitigation: profiling, optimization)

---

### Phase 4.4: State Persistence & Integration (Days 8-9)

**Goal:** Implement cross-session state persistence and full system integration

**Deliverables:**

1. `state-manager.ts` with LangGraph-style checkpointers
   - Save checkpoint after each phase (atomic writes)
   - Load checkpoint for resumption
   - Validate state integrity (checksums)
   - Backup before overwrite
2. Resume functionality
   - `/sage.workflow --resume` command
   - Detect last completed phase
   - Continue execution from correct phase
3. Full system integration (Phases 1-4)
   - MCP servers (Phase 1)
   - Caching (Phase 2)
   - Skills (Phase 3)
   - Orchestration (Phase 4)
4. `.claude/commands/sage.workflow.md` command definition
   - Execute workflow
   - Resume workflow
   - List workflows
   - Get status
5. Integration tests for state persistence
   - Save/load checkpoint correctness
   - Resume from interrupted workflow
   - State corruption recovery
6. End-to-end system tests
   - All phases working together
   - Skills discovered and used
   - Patterns loaded progressively
   - Research cached and reused

**Success Criteria:**

- ✅ Workflow state saved to `.sage/state/`
- ✅ Resume from interrupted workflows (95%+ success)
- ✅ State persistence validated (no data loss)
- ✅ All phases integrated (1, 2, 3, 4)
- ✅ `/sage.workflow` command working
- ✅ End-to-end tests pass

**Dependencies:**

- Phase 4.1 (parallel execution)
- Phase 4.2 (dependency management)
- Phase 4.3 (orchestration)
- All previous phases (1, 2, 3)

**Risks:**

- State corruption (mitigation: atomic writes, checksums, backups)
- Integration failures (mitigation: comprehensive integration tests)

---

### Phase 4.5: Validation & Documentation (Day 10)

**Goal:** Validate all metrics, complete documentation, demonstrate system

**Deliverables:**

1. Performance benchmarking report
   - Parallel operations: 3x speedup (measured)
   - Full workflow: 3-5x speedup (measured)
   - Token reduction: 86% (measured)
   - Context reloads: 0 (verified)
   - Resume success rate: ≥95% (measured)
2. Integration test suite (all passing)
   - Unit tests: ≥90% coverage
   - Integration tests: 100% pass
   - Performance tests: Targets met
   - Security tests: No vulnerabilities
3. Error recovery tests
   - Partial failures handled
   - Circuit breaker protection
   - State corruption recovery
   - Timeout handling
4. Documentation
   - `README.md` updated with Phase 4 overview
   - `docs/specs/parallel-agent-orchestration/plan.md` (this document)
   - `servers/sage-orchestration/README.md` (server documentation)
   - API documentation (JSDoc comments)
5. System demo
   - Execute full feature workflow
   - Resume interrupted workflow
   - Show metrics (time, tokens, reloads)
   - Demonstrate integration with all phases

**Success Criteria:**

- ✅ All metrics validated (speedup, tokens, reloads)
- ✅ Zero test failures
- ✅ Documentation complete
- ✅ System demo successful
- ✅ Ready for production use

**Dependencies:**

- All previous phases (4.1, 4.2, 4.3, 4.4)

**Risks:**

- Metrics not met (mitigation: optimization iterations, fallback strategies)
- Documentation incomplete (mitigation: allocate full day for docs)

---

### Timeline Summary

**Total Duration:** 10 business days (2 weeks)

| Phase | Days | Focus | Key Deliverable |
|-------|------|-------|-----------------|
| 4.1 | 1-3 | Parallel Execution | research-pipeline.ts, 3x speedup |
| 4.2 | 4-5 | Dependency Management | dependency-manager.ts, cycle detection |
| 4.3 | 6-7 | Orchestration | workflow-orchestrator.ts, templates |
| 4.4 | 8-9 | State & Integration | state-manager.ts, resume capability |
| 4.5 | 10 | Validation & Docs | Benchmarks, documentation, demo |

**Estimated Effort:** 80-120 hours

- Phase 4.1: 24 hours (3 days)
- Phase 4.2: 16 hours (2 days)
- Phase 4.3: 16 hours (2 days)
- Phase 4.4: 16 hours (2 days)
- Phase 4.5: 8 hours (1 day)

**Team Composition:**

- 1-2 senior engineers (orchestration, state management, distributed systems)
- 1-2 junior engineers (implementation, testing)

---

## 8. Quality Assurance

### Testing Strategy

**Testing Pyramid:**

```
        /\
       /E2E\        ← 10% (End-to-end workflows)
      /------\
     /  INT   \     ← 30% (Integration tests)
    /----------\
   /    UNIT    \   ← 60% (Unit tests)
  /--------------\
```

**Unit Testing (60% of tests, ≥90% coverage):**

**Modules to Test:**

1. **dependency-manager.ts**
   - Kahn's algorithm correctness (10+ graph types)
   - Cycle detection (positive and negative cases)
   - Topological sort validation
   - Complex graphs (50+ nodes)
   - Edge cases (single node, disconnected nodes, star topology)

2. **research-pipeline.ts**
   - Promise.all() parallel execution
   - Promise.allSettled() partial failure handling
   - p-limit throttling
   - Result filtering (180KB → 8KB)
   - Cache integration

3. **state-manager.ts**
   - Atomic write operations (write to temp, rename)
   - Checksum validation (SHA-256)
   - Backup creation
   - State loading and restoration
   - Corruption detection and recovery

4. **circuit-breaker.ts**
   - State transitions (CLOSED → OPEN → HALF_OPEN → CLOSED)
   - Failure tracking and thresholds
   - Success tracking in HALF_OPEN
   - Fallback mechanism
   - Timeout handling

5. **workflow-templates.ts**
   - Template validation (DAG structure)
   - Custom template registration
   - Template instantiation
   - Dependency resolution for templates

**Integration Testing (30% of tests, ≥80% coverage):**

**Scenarios to Test:**

1. **Full Feature Workflow**
   - Execute feature development template
   - Verify all phases complete
   - Measure: time, tokens, reloads
   - Validate: 3-5x speedup, 86% token reduction, 0 reloads

2. **Resume from Interrupted Workflow**
   - Start workflow, interrupt after Phase 2
   - Load checkpoint
   - Resume from Phase 3
   - Verify: no data loss, correct phase detection

3. **Parallel Execution with Real Operations**
   - Execute research pipeline with real MCP calls
   - Verify: parallel execution (not sequential)
   - Measure: speedup vs sequential baseline

4. **Error Recovery Scenarios**
   - Partial failure (1 of 4 parallel ops fails)
   - Circuit breaker opens (5 consecutive failures)
   - State corruption (checksum mismatch)
   - Timeout (operation exceeds limit)
   - Verify: graceful degradation, user notified

5. **Cache Integration**
   - Execute workflow with cold cache
   - Execute again with warm cache
   - Verify: cache hit rate >60%, faster execution

6. **Skill Integration (Phase 3)**
   - Execute workflow with skill discovery
   - Verify: skills found and used
   - Measure: skill reuse rate

**End-to-End Testing (10% of tests, ≥70% coverage):**

**Full System Scenarios:**

1. **Cold Start (No Cache, No State)**
   - User: `/sage.workflow "payment-processing"`
   - Verify: Full workflow completes, all phases execute, results correct

2. **Warm Start (Cache Hit)**
   - Execute workflow for previously researched feature
   - Verify: Cache hit, faster execution, same results

3. **Resume After Interruption**
   - Start workflow, kill process after Phase 2
   - User: `/sage.workflow --resume "payment-processing"`
   - Verify: Resumes from Phase 3, completes successfully

4. **Concurrent Workflows**
   - Start 3 workflows simultaneously
   - Verify: No conflicts, all complete successfully, lock mechanism works

5. **Custom Template**
   - User defines custom workflow in `.sage/templates/`
   - User: `/sage.workflow --template custom "feature"`
   - Verify: Custom workflow executes, respects dependencies

### Code Quality Gates

**Pre-Commit Hooks:**

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint           # ESLint (no errors)
npm run type-check     # TypeScript (strict mode, no errors)
npm run test -- --run  # Vitest (all tests pass)
```

**CI Pipeline Quality Gates:**

```yaml
# Required checks (fail if not met):
- Test coverage: ≥90%
- Type errors: 0
- Linting errors: 0
- Security vulnerabilities: 0 high/critical
- Performance regression: <10% slower than baseline
```

**Code Review Checklist:**

- [ ] All functions have JSDoc comments
- [ ] Complex logic has inline comments
- [ ] Error handling comprehensive
- [ ] No hardcoded values (use config)
- [ ] Tests added for new functionality
- [ ] Performance impact measured (if applicable)
- [ ] Security implications considered

### Deployment Verification Checklist

**Pre-Deployment:**

- [ ] All tests passing (unit, integration, e2e)
- [ ] Performance benchmarks met (3-5x speedup, 86% token reduction)
- [ ] Documentation updated (README, API docs)
- [ ] Changelog updated with release notes
- [ ] Semantic versioning applied (v3.1.0 - minor feature)

**Deployment:**

- [ ] Build successful (`npm run build`)
- [ ] No build warnings
- [ ] Package size acceptable (<5MB)
- [ ] Dependencies up-to-date (no critical vulnerabilities)

**Post-Deployment:**

- [ ] Smoke test: Execute simple workflow
- [ ] Verify: Metrics displayed correctly
- [ ] Verify: State persistence working
- [ ] Verify: Resume capability functional
- [ ] Monitor: Error rates, execution times

**Rollback Plan:**

- If critical issue: Revert to v3.0.0 (pre-orchestration)
- If partial issue: Disable orchestration (`/sage.workflow --disable`), fallback to sequential
- If state corruption: Restore from backups (`.sage/state/*.json.bak`)

### Monitoring and Alerting Setup

**Metrics to Track:**

```json
{
  "workflow": {
    "executionTime": 75000,        // ms (target: 60-120s)
    "tokenUsage": 35000,           // tokens (target: <35K)
    "contextReloads": 0,           // count (target: 0)
    "phaseCount": 4,               // count
    "parallelOps": 4,              // count (in Phase 1)
    "cacheHitRate": 0.65           // percentage (target: >0.6)
  },
  "performance": {
    "speedup": 4.5,                // multiplier (target: 3-5x)
    "tokenReduction": 0.86,        // percentage (target: 0.86)
    "resumeSuccessRate": 0.97      // percentage (target: >0.95)
  },
  "errors": {
    "errorRate": 0.008,            // percentage (target: <0.01)
    "circuitBreakerOpens": 0,      // count
    "stateCor ruptions": 0,        // count
    "timeouts": 0                  // count
  }
}
```

**Alerting Rules:**

- Workflow time >300s (5 min): WARN (investigate)
- Workflow time >600s (10 min): CRITICAL (timeout)
- Token usage >100K: WARN (context efficiency issue)
- Context reloads >0: CRITICAL (unified environment broken)
- Resume success rate <90%: CRITICAL (state persistence issue)
- Error rate >5%: CRITICAL (external API or internal bug)

**Logging:**

- **Level:** INFO for normal operations, WARN for recoverable errors, ERROR for failures
- **Format:** JSON lines (`.sage/logs/orchestration.jsonl`)
- **Retention:** 30 days
- **Contents:** Timestamp, level, message, context (workflow ID, phase, metrics)

---

## ⚠️ Error Handling & Edge Cases

**From:** Feature request technical considerations + Research findings

### Error Scenarios (from Research)

**Critical Error Paths:**

**1. Dependency Cycle Detected**

- **Cause:** Workflow definition contains circular dependencies (A → B → C → A)
- **Impact:** Workflow cannot execute (infinite loop)
- **Detection:** Kahn's algorithm detects during graph validation (before execution)
- **Handling:**

  ```typescript
  if (result.length !== graph.nodes.length) {
    throw new WorkflowValidationError(
      'Cycle detected in dependency graph',
      { cycle: detectCyclePath(graph) }
    );
  }
  ```

- **Recovery:** Display cycle path to user, guide to fix workflow definition
- **User Experience:** Clear error message with cycle visualization

  ```
  ❌ Cycle detected in workflow dependencies:
  research → specification → research (invalid)

  Fix: Remove circular dependency
  ```

**2. External API Failure (MCP Server Unavailable)**

- **Cause:** MCP server (sage-research, sage-patterns) is down or unresponsive
- **Impact:** Workflow cannot complete, user blocked
- **Detection:** Circuit breaker detects after 5 consecutive failures
- **Handling:** Circuit breaker opens, fallback to cached data if available

  ```typescript
  const breaker = new CircuitBreaker();
  const research = await breaker.execute(
    () => researchServer.marketResearch(topic),
    () => getCachedResearch(topic)  // Fallback to cache
  );
  ```

- **Recovery:**
  - If cache available: Continue with cached data
  - If no cache: Save checkpoint, notify user, allow resume later
- **User Experience:**

  ```
  ⚠️ External API unavailable (sage-research)
  ✓ Using cached data from 3 days ago
  Continue? [y/n]
  ```

**3. State Corruption (Checkpoint File Invalid)**

- **Cause:** Disk failure, power loss, manual file edit during write
- **Impact:** Cannot resume workflow, potential data loss
- **Detection:** Checksum validation on load

  ```typescript
  const state = JSON.parse(fs.readFileSync(checkpointFile));
  const checksum = calculateChecksum(state);
  if (checksum !== state.checksum) {
    throw new StateCorruptionError('Checkpoint file corrupted');
  }
  ```

- **Handling:** Restore from backup (`.bak` file)

  ```typescript
  const backupFile = `${checkpointFile}.bak`;
  if (fs.existsSync(backupFile)) {
    fs.copyFileSync(backupFile, checkpointFile);
    return loadCheckpoint(featureName);  // Retry
  }
  ```

- **Recovery:** Resume from previous valid checkpoint
- **User Experience:**

  ```
  ⚠️ Workflow state corrupted, restoring from backup
  ✓ Restored to Phase 2 (last valid checkpoint)
  Continue? [y/n]
  ```

**4. Timeout Exceeded (Long-Running Operation)**

- **Cause:** Operation takes longer than configured timeout (default 10 min)
- **Impact:** Workflow blocked, resources wasted
- **Detection:** Promise.race with timeout promise

  ```typescript
  const result = await Promise.race([
    operation(),
    timeout(WORKFLOW_TIMEOUT)
  ]);
  ```

- **Handling:** Save checkpoint before timeout, allow resume

  ```typescript
  try {
    await executePhase(phase);
  } catch (TimeoutError) {
    await saveCheckpoint(featureName, currentState);
    throw new WorkflowTimeoutError('Phase timeout exceeded', {
      phase: phase.id,
      checkpoint: checkpointFile
    });
  }
  ```

- **Recovery:** User can resume from last checkpoint
- **User Experience:**

  ```
  ⏱️ Phase timeout exceeded (implementation > 10 min)
  ✓ Progress saved to checkpoint
  Resume later with: /sage.workflow --resume "payment-processing"
  ```

**5. Partial Failure (Some Parallel Operations Fail)**

- **Cause:** 1 of 4 parallel operations fails (e.g., competitive analysis API error)
- **Impact:** Some research missing, but workflow can continue
- **Detection:** Promise.allSettled catches individual failures

  ```typescript
  const results = await Promise.allSettled([
    marketResearch(topic),
    competitiveAnalysis(topic),  // Fails
    bestPractices(topic),
    extractPatterns(topic)
  ]);

  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');
  ```

- **Handling:** Continue with successful results, log failures
- **Recovery:** Workflow continues, user notified of partial failure
- **User Experience:**

  ```
  ⚠️ 1 of 4 research operations failed (competitive analysis)
  ✓ Continuing with 3 successful results
  Review failures in logs? [y/n]
  ```

### Edge Cases (from Feature Request & Research)

**Identified in Feature Request:**

| Edge Case | Detection | Handling | Testing Approach |
|-----------|-----------|----------|------------------|
| **No dependencies (all parallel)** | Check inDegree map (all 0) | Execute all in single batch | Unit test: All-parallel workflow |
| **All sequential (linear chain)** | Check max depth = node count | Execute one at a time | Unit test: Linear dependency chain |
| **Disconnected graph (multiple trees)** | Check connected components | Execute each tree independently | Unit test: Multi-tree workflow |
| **Single node workflow** | Check node count = 1 | Execute immediately | Unit test: Single-op workflow |
| **Empty workflow** | Check node count = 0 | Error: Invalid workflow | Unit test: Empty definition |
| **Duplicate node IDs** | Check ID uniqueness during add | Error: Duplicate node | Unit test: Duplicate IDs |
| **Non-existent dependency** | Check dependency IDs exist | Error: Invalid dependency | Unit test: Missing dep reference |
| **State file missing** | Check file existence on resume | Error: No checkpoint found | Integration test: Resume without state |

**Identified in Research:**

| Edge Case | Detection | Handling | Testing Approach |
|-----------|-----------|----------|------------------|
| **Cache expired** | Check TTL on load | Re-execute research | Integration test: Expired cache |
| **Memory limit exceeded** | Monitor memory usage | Reduce parallelism | Performance test: High memory |
| **Disk space full** | Catch write errors | Error: Cannot save state | Error test: Full disk simulation |
| **Concurrent workflow conflicts** | Check ACTIVE_WORKFLOWS.json | Error: Workflow in progress | Integration test: Concurrent starts |
| **Rate limit exceeded** | p-limit throttling | Queue operations | Integration test: Rate limit |
| **Network timeout** | Circuit breaker timeout | Fallback to cache | Integration test: Network failure |

### Input Validation

**Validation Rules:**

**WorkflowDefinition:**

```typescript
const WorkflowDefinitionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  phases: z.array(PhaseDefinitionSchema).min(1),
  timeout: z.number().int().positive().optional()
});

const PhaseDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),  // lowercase, numbers, hyphens
  name: z.string().min(1).max(50),
  operations: z.union([
    z.array(OperationDefinitionSchema),   // Parallel
    OperationDefinitionSchema              // Single
  ]),
  dependencies: z.array(z.string()),
  timeout: z.number().int().positive().optional()
});
```

**State Files:**

```typescript
const WorkflowStateSchema = z.object({
  version: z.literal("1.0"),
  feature: z.string().min(1),
  template: z.string(),
  phase: z.string(),
  status: z.enum(['running', 'paused', 'completed', 'failed']),
  checkpoints: z.record(z.string(), CheckpointSchema),
  startedAt: z.string().datetime(),
  lastUpdatedAt: z.string().datetime(),
  checksum: z.string().length(64)  // SHA-256 hex
});
```

**Sanitization:**

- **XSS Prevention:** N/A (no HTML output)
- **Injection Prevention:** Validate all file paths (no `..` traversal)
- **Input Normalization:** Trim whitespace, lowercase IDs

### Graceful Degradation

**Fallback Strategies:**

| Service Unavailable | Fallback Approach | User Impact |
|---------------------|-------------------|-------------|
| **sage-research (market research)** | Use cached data (if available) | Slightly outdated data, still functional |
| **sage-patterns (pattern extraction)** | Skip pattern loading, continue without | No pattern suggestions, manual approach |
| **sage-specification (spec generation)** | Save checkpoint, defer to manual | Workflow paused, manual spec creation |
| **.sage/cache/ (cache unavailable)** | Execute research without cache | Slower (no cache hit), higher tokens |
| **.sage/state/ (state unavailable)** | Disable resume capability | Cannot resume workflows, must start fresh |

**Partial Failure Mode:**

- If ≥75% of parallel operations succeed: Continue workflow
- If <75% succeed: Pause workflow, notify user, allow resume after fixes

**Degraded Mode:**

- If parallelization fails: Fall back to sequential execution (slower, but functional)
- If context efficiency fails: Continue without filtering (higher tokens, but functional)

### Monitoring & Alerting

**Error Tracking:**

- **Tool:** Console logging + optional external tool (Sentry)
- **Threshold:** Alert if error rate >1% over 1 hour
- **Response:**
  - Check logs for patterns
  - Identify failing operations
  - Notify maintainers if critical

**Error Categories:**

- **Transient:** Network timeouts, API rate limits (retry)
- **Persistent:** Dependency cycles, state corruption (user action required)
- **Critical:** MCP server down, disk full (system issue)

**Incident Response:**

1. Detect error (monitoring alert)
2. Triage severity (transient vs persistent vs critical)
3. If transient: Retry with backoff
4. If persistent: Notify user, save checkpoint, provide guidance
5. If critical: Alert maintainers, provide workaround

---

## 📚 References & Traceability

### Source Documentation

**Feature Request:**

- `docs/features/parallel-agent-orchestration.md`
  - Problem statement: Sequential execution, 4-5 context reloads, 5-10 min workflows
  - Solution overview: Anthropic "Powerful Control Flow" pattern
  - User stories: Parallel research, end-to-end workflows, zero reloads, cross-session state
  - Expected impact: 3-5x speedup, 86% token reduction, 0 context reloads
  - Success criteria: Performance, token efficiency, state persistence validated

**Research & Intelligence:**

- `docs/research/parallel-agent-orchestration-intel.md`
  - Anthropic pattern: 98.7% token reduction (150K→2K) validated in production
  - Technology stack: Promise.all(), Kahn's algorithm, FSM, LangGraph checkpointers, p-limit
  - Competitive analysis: Airflow (dominant), Temporal (code-first), Prefect (LLM integration), Kestra (fast-growing)
  - Performance validation: 3x speedup on parallel ops, O(V+E) complexity, 86% token reduction
  - Security patterns: Sandboxing, encryption, audit logging, no secrets in state
  - Error handling: Circuit breaker, progressive retry, rollback recovery

**Specification:**

- `docs/specs/parallel-agent-orchestration/spec.md`
  - 10 functional requirements (FR-1 through FR-10)
  - Non-functional requirements: Performance (3-5x), scalability (10+ workflows, 50+ nodes), reliability (95%+ resume), security
  - 10 acceptance criteria covering all aspects
  - 18 target files identified (10 create, 3 modify, 5 tests)
  - Data models, API specs, security requirements detailed

### System Context

**Architecture & Patterns:**

- Project structure: Python CLI (Typer + Rich), MCP servers (Node.js/TypeScript), `.sage/` directory
- Existing patterns: Enforcement server (`servers/sage-enforcement/`), ticket system (`.sage/tickets/`)
- Integration points: CLI → MCP orchestration server → existing MCP servers

**Code Examples:**

- Promise.all() pattern from research (parallel execution, 3x speedup)
- Kahn's algorithm pseudocode from research (O(V+E) complexity)
- Circuit breaker implementation from research (Polly-inspired)
- LangGraph checkpointers pattern from research (95%+ resume success)

### Research Citations

**Best Practices Research:**

- Anthropic Blog: "Code Execution with MCP: Building More Efficient AI Agents" (Nov 2024)
  - URL: <https://www.anthropic.com/engineering/code-execution-with-mcp>
  - Key insight: 98.7% token reduction with Powerful Control Flow pattern
- MDN Web Docs: Promise.all(), Promise.allSettled(), async/await patterns
  - Parallel execution best practices
- LangGraph Documentation: Persistence, Checkpoints, Threads (2024)
  - Checkpoint/restore pattern for AI workflows

**Technology Evaluation:**

- Node.js ≥18.0.0 documentation (async/await, Promise APIs)
- TypeScript ≥5.0 documentation (strict mode, type-driven development)
- Vitest documentation (fast testing, ESM-first)
- p-limit npm package (API throttling)

**Security Standards:**

- OWASP Top 10 Web Application Security Risks (2021)
- POSIX file permissions (600 for files, 700 for directories)
- AES-256 encryption standard

**Performance Benchmarks:**

- Research validation: 3x speedup on parallel operations (135s → 45s)
- Full workflow: 5-10 min → 1-2 min (3-5x speedup)
- Token reduction: 250K → 35K (86%)
- Anthropic production: 150K → 2K (98.7%)

### Related Components

**Dependencies (Prerequisites):**

- **MCP-001**: MCP Server Infrastructure
  - Status: COMPLETE (Phase 1)
  - Provides: sage-research, sage-patterns, sage-specification, sage-planning, sage-implementation servers
  - Integration: Orchestration calls these servers

- **CACHE-001**: Context Optimization & Caching
  - Status: COMPLETE (Phase 2)
  - Provides: `.sage/cache/` research cache, TTL-based invalidation
  - Integration: Orchestration checks cache before expensive operations

- **SKILL-001**: Automatic Skill Evolution
  - Status: COMPLETE (Phase 3)
  - Provides: `.sage/skills/` skill library, skill discovery
  - Integration: Orchestration discovers and uses skills during implementation

**Dependents (Components That Depend on This):**

- **Future Enhancement**: Distributed Orchestration (multi-machine)
  - Would build on: This orchestration foundation
  - Would add: Distributed coordination, cross-machine state
- **Future Enhancement**: Visual Workflow Editor
  - Would build on: Workflow templates and validation
  - Would add: GUI for custom workflow creation

**Cross-Component Integration:**

```
Phase 1 (MCP Infrastructure)
  ↓ provides MCP servers
Phase 4 (Orchestration) ← THIS PLAN
  ↓ discovers skills
Phase 3 (Skill Evolution)
  ↓ uses caching
Phase 2 (Context Optimization)
```

---

## Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-13 | Sage-Dev Plan Agent | Initial PRP-format implementation plan created from spec, research, and feature request |

---

**Plan Status:** Complete
**Next Steps:** Task breakdown (`/sage.tasks`)
**Priority:** P0 (Critical - Final integration phase)
**Estimated Effort:** 80-120 hours over 2 weeks (Phases 4.1-4.5)
**Epic Ticket:** ORCH-001

**This plan delivers the culmination of the 8-week enhancement:**

- 87% average token reduction (142K → 19K)
- 4-6x overall performance improvement
- 10x speedup on repeated tasks (skill reuse)
- Zero context reloads (unified execution environment)
- Self-improving, parallel-executing AI development platform
