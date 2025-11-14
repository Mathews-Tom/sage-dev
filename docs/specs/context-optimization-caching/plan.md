# Context Optimization & Caching Implementation Blueprint (PRP)

**Format:** Product Requirements Prompt (Context Engineering)
**Generated:** 2025-11-13
**Specification:** `docs/specs/context-optimization-caching/spec.md`
**Feature Request:** `docs/features/context-optimization-caching.md`
**Research:** `docs/research/context-optimization-caching-intel.md`

---

## 📖 Context & Documentation

### Traceability Chain

**Feature Request → Research → Specification → This Plan**

1. **Original Feature Request:** docs/features/context-optimization-caching.md
   - User stories: Instant research cache hits, automatic pattern extraction, progressive pattern loading, smart specification generation
   - Initial technical considerations: Caching strategies, AST parsing, progressive loading patterns
   - Success criteria: 80-85% token reduction, 80%+ pattern capture, 90%+ pattern filtering

2. **Research & Enhancement:** docs/research/context-optimization-caching-intel.md
   - Technical approach: Hybrid caching system with AST-based pattern extraction and context-aware progressive loading
   - Competitive analysis: Redis, Cache-Craft (RAG), Mem0, LLMLingua, ts-codebase-analyzer evaluated
   - Security patterns: Path validation, schema validation, sensitive file filtering
   - Performance patterns: Lazy cache loading, incremental extraction, pattern loading cache, streaming AST parsing
   - Technology evaluation: Node.js fs + JSON (caching), Python ast module (zero deps), ts-morph (TypeScript), ES6 dynamic import()

3. **Formal Specification:** docs/specs/context-optimization-caching/spec.md
   - Functional requirements: 26 "shall" statements across 3 components
   - Non-functional requirements: Performance (cache hit <1s), Security (no sensitive data), Scalability (10K files), Reliability (99.5% success)
   - Acceptance criteria: Research 96% reduction, Specification 77% reduction, Pattern extraction 80%+ capture rate
   - Target files: 22 files identified (8 create, 4 modify, 10 test/doc)

### Related Documentation

**System Context:**

- No existing `.sage/agent/system/` documentation yet - will be created during Phase 2 implementation
- Existing MCP server pattern: `servers/sage-enforcement/` (reference for new servers)
- Existing commands: `commands/sage.init.md`, `commands/sage.intel.md`, `commands/sage.specify.md`

**Code Examples:**

- No existing `.sage/agent/examples/` yet - will be created by pattern extraction
- MCP server structure from sage-enforcement: agents/, rules/, schemas/, tests/, utils/, index.ts

**Other Specifications:**

- Phase 1: MCP Server Infrastructure (COMPLETE) - Prerequisite for Phase 2
- Phase 3: Automatic Skill Evolution (BLOCKED BY Phase 2) - Requires pattern matching
- Phase 4: Parallel Agent Orchestration (BLOCKED BY Phase 2) - Builds on caching infrastructure

---

## 📊 Executive Summary

### Business Alignment

**Purpose:** Eliminate redundant research operations and extract repository patterns automatically to achieve 80-85% token reduction across all Sage-Dev operations.

**Problem Statement:**

- Research operations reload 180,000+ tokens every time, even for identical queries (45 seconds wasted)
- No pattern extraction: Repository patterns analyzed repeatedly instead of captured once
- No caching mechanism: Market research, competitive analysis, best practices fetched repeatedly
- All patterns loaded: Even when only 5-10% relevant to current task

**Value Proposition:**

- **Cost Savings:** 80-85% reduction in API token costs
- **Performance:** 4.5x-45x speedup (cache hits instant vs 45s baseline)
- **Developer Experience:** Automatic pattern extraction eliminates manual configuration
- **Foundation:** Enables Phase 3 (skill evolution) and Phase 4 (parallel orchestration)

**Target Users:**

- Developers using Sage-Dev for feature development workflows
- Teams requiring consistent repository patterns across members
- Power users performing frequent research operations
- Contributors to repositories with established coding conventions

### Technical Approach

**Architecture Pattern:** Layered Caching System with AST-Based Pattern Extraction and Context-Aware Progressive Loading

**Three Integrated Components:**

1. **Research Cache System (CACHE)** - Intelligent caching with TTL and LRU eviction
   - Filesystem-based JSON storage in `.sage/agent/research/`
   - 30-day TTL with manual invalidation via `--no-cache` flag
   - 100MB storage limit with LRU eviction
   - Zod schema validation for cache integrity

2. **Pattern Extraction Engine (PATTERN)** - AST-based automatic pattern discovery
   - Python ast module (built-in, zero dependencies)
   - TypeScript ts-morph (official compiler wrapper)
   - Confidence scoring (0-1 scale) for pattern validation
   - Incremental extraction via file hash tracking

3. **Progressive Loading System (LOADER)** - Context-aware pattern filtering
   - File type filtering (python, typescript, javascript)
   - Feature filtering (auth, api, ui, data)
   - Domain filtering (frontend, backend, infra)
   - Dynamic import() for on-demand loading

**Technology Stack:** Node.js 18+ (runtime), Zod (validation), Python ast module (parsing), ts-morph (TypeScript parsing), ES6 dynamic import() (progressive loading)

**Implementation Strategy:** 4 phases over 2 weeks (72-92 hours total)

- Phase 2.1: Pattern Extraction Foundation (24-32h)
- Phase 2.2: Research Caching System (16-20h)
- Phase 2.3: Progressive Loading (16-20h)
- Phase 2.4: Integration & Metrics Validation (16-20h)

### Key Success Metrics

**Service Level Objectives (SLOs):**

- Cache hit response time: <1 second (vs 45s baseline)
- Cache miss response time: ≤15 seconds (vs 45s baseline)
- Pattern extraction time: ≤2 minutes for 1000+ files
- Progressive loading overhead: <50ms filtering time
- Cache operation success rate: 99.5%+

**Key Performance Indicators (KPIs):**

- Research token reduction (first run): 180K → 8K (96%)
- Research token reduction (cache hit): 180K → <1K (99.4%)
- Specification token reduction: 80K → 18K (77%)
- Pattern capture rate: 80%+ validated against manual review
- Pattern filtering reduction: 90%+ of patterns excluded by progressive loading
- Overall token reduction: 80-85% across all operations

---

## 💻 Code Examples & Patterns

### Repository Patterns (from Existing Codebase)

**Relevant Existing Patterns:**

1. **MCP Server Structure:** `servers/sage-enforcement/`
   - **Application:** Template for new sage-research and sage-context-optimizer servers
   - **Directory Structure:**

     ```plaintext
     servers/sage-enforcement/
     ├── agents/       - Agent implementation modules
     ├── rules/        - Rule definitions and validation
     ├── schemas/      - Data schemas and validation
     ├── tests/        - Unit and integration tests
     ├── utils/        - Shared utility functions
     └── index.ts      - MCP server entry point
     ```

   - **Adaptation Notes:** Apply same structure to new servers, add cache-specific and pattern-specific modules

2. **Command Pattern:** `commands/sage.*.md`
   - **Application:** Modify existing commands to integrate caching and pattern extraction
   - **Integration Points:**
     - `sage.init.md` - Add pattern extraction step after repository analysis
     - `sage.intel.md` - Add cache check before research operations
     - `sage.specify.md` - Add progressive loading before specification generation
   - **Adaptation Notes:** Preserve existing command structure, insert new steps at appropriate points

### Implementation Reference Examples

**From Research (context-optimization-caching-intel.md):**

**Example 1: Filesystem-Based Research Cache**

```typescript
// Cache structure from research recommendations
// .sage/agent/research/
// ├── rag-frameworks-2025.json
// ├── llm-benchmarks.json
// └── CACHE_MANIFEST.json

// Cache entry format
interface CacheEntry {
  topic: string;                    // "rag-frameworks-2025"
  timestamp: string;                // ISO 8601: "2025-11-13T10:30:00Z"
  expiresAt: string;                // ISO 8601: "2025-12-13T10:30:00Z"
  findings: ResearchFindings;       // Research output object
  metadata: {
    tokenCount: number;             // 180000
    queryTime: number;              // milliseconds: 45000
    sources: string[];              // ["url1", "url2"]
  };
}

// Cache-first research pattern
async function performResearch(topic: string) {
  // Check cache first
  const cached = await getCachedResearch(topic);

  if (cached && !isExpired(cached)) {
    console.log(`✓ Cache hit: ${topic} (${formatAge(cached.age)} old)`);
    return cached.findings;  // <1K tokens, <1s
  }

  // Cache miss: fetch fresh
  console.log(`Cache miss: fetching ${topic}...`);
  const findings = await fetchFreshResearch(topic);  // 180K tokens, 45s

  // Cache for future
  await cacheResearch(topic, findings);

  return findings;
}
```

**Example 2: AST-Based Pattern Extraction (Python)**

```python
# Python pattern extraction from research
import ast

def extract_naming_conventions(file_paths):
    functions = []
    classes = []

    for file_path in file_paths:
        tree = ast.parse(open(file_path).read())

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                functions.append(node.name)
            elif isinstance(node, ast.ClassDef):
                classes.append(node.name)

    # Analyze patterns
    return {
        "functions": detect_case(functions),  # snake_case
        "classes": detect_case(classes)       # PascalCase
    }

def detect_case(names):
    """Detect predominant case convention with confidence score"""
    snake_count = sum(1 for n in names if '_' in n and n.islower())
    camel_count = sum(1 for n in names if n[0].islower() and any(c.isupper() for c in n))
    pascal_count = sum(1 for n in names if n[0].isupper() and any(c.islower() for c in n))

    total = len(names)
    if total == 0:
        return {"convention": "unknown", "confidence": 0.0}

    max_count = max(snake_count, camel_count, pascal_count)
    confidence = max_count / total

    if max_count == snake_count:
        return {"convention": "snake_case", "confidence": confidence}
    elif max_count == camel_count:
        return {"convention": "camelCase", "confidence": confidence}
    else:
        return {"convention": "PascalCase", "confidence": confidence}
```

**Example 3: TypeScript Pattern Extraction (ts-morph)**

```typescript
// TypeScript pattern extraction from research
import { Project } from 'ts-morph';

function extractTypePatterns(projectPath: string) {
    const project = new Project({ tsConfigFilePath: projectPath });

    const patterns = {
        unionSyntax: 'pipe',  // str | int vs Union[str, int]
        generics: 'builtin'   // list[str] vs List[str]
    };

    let pipeUnions = 0;
    let unionTypeUnions = 0;

    project.getSourceFiles().forEach(sourceFile => {
        sourceFile.getTypeAliases().forEach(alias => {
            const typeText = alias.getTypeNode()?.getText() || '';

            // Detect pipe unions (|)
            if (typeText.includes('|') && !typeText.includes('Union[')) {
                pipeUnions++;
            }

            // Detect Union[] syntax
            if (typeText.includes('Union[')) {
                unionTypeUnions++;
            }
        });
    });

    const total = pipeUnions + unionTypeUnions;
    patterns.unionSyntax = pipeUnions > unionTypeUnions ? 'pipe' : 'Union';

    return {
        ...patterns,
        confidence: total > 0 ? Math.max(pipeUnions, unionTypeUnions) / total : 0
    };
}
```

**Example 4: Progressive Pattern Loading**

```typescript
// Context-based pattern loading from research
export async function loadRelevantPatterns(context: TaskContext) {
    const allPatterns = await loadAllPatterns();

    // File type filtering
    const filePatterns = filterByFileType(
        allPatterns,
        context.fileType  // 'python' | 'typescript' | 'javascript'
    );

    // Feature filtering
    const featurePatterns = filterByFeature(
        filePatterns,
        context.feature  // 'auth' | 'api' | 'ui'
    );

    // Result: 90% reduction in loaded patterns
    return featurePatterns;
}

function filterByFileType(patterns: RepositoryPatterns, fileType: string) {
    return {
        naming: patterns.naming[fileType],
        typing: patterns.typing[fileType],
        testing: patterns.testing[fileType],
        errorHandling: patterns.errorHandling,  // Language-agnostic
        architecture: patterns.architecture      // Language-agnostic
    };
}
```

**Key Takeaways from Examples:**

- **Filesystem caching is simple and effective** - No external dependencies (Redis, PostgreSQL)
- **AST parsing provides high accuracy** - 80-90% pattern capture validated in research
- **Confidence scoring enables validation** - Flag low-confidence patterns for manual review
- **Progressive loading is straightforward** - Simple filtering logic, massive token savings
- **Patterns are testable** - Clear inputs/outputs, easy to unit test

### Anti-Patterns to Avoid

From research recommendations:

- ❌ **No expiration policy** - Stale cached data misleads users → Use 30-day TTL with age display
- ❌ **Unbounded cache growth** - Filesystem fills up → Enforce 100MB limit with LRU eviction
- ❌ **Loading all patterns upfront** - Defeats progressive loading → Load on-demand with context filtering
- ❌ **No cache invalidation mechanism** - Users stuck with outdated research → Provide `--no-cache` flag
- ❌ **Synchronous AST parsing** - Blocks event loop for large codebases → Use async file reading, batch processing

### New Patterns to Create

**Patterns This Implementation Will Establish:**

1. **Research Caching Pattern**
   - **Purpose:** Eliminate redundant research operations
   - **Location:** `.sage/agent/examples/caching/research-cache.md`
   - **Reusability:** Any operation with expensive API calls (competitive analysis, market research, best practices)

2. **AST Pattern Extraction Pattern**
   - **Purpose:** Automatically discover code conventions
   - **Location:** `.sage/agent/examples/analysis/ast-extraction.md`
   - **Reusability:** Code quality tools, linters, documentation generators

3. **Progressive Loading Pattern**
   - **Purpose:** Load only relevant data based on context
   - **Location:** `.sage/agent/examples/optimization/progressive-loading.md`
   - **Reusability:** Any large dataset that can be filtered by context (documentation, examples, templates)

---

## 🔧 Technology Stack

### Recommended Stack (from Research & Intel)

**Based on research from:** `docs/research/context-optimization-caching-intel.md`

| Component | Technology | Version | Rationale (from Research) |
|-----------|------------|---------|---------------------------|
| **Runtime** | Node.js | 18+ | Already using for MCP servers, async fs/promises support |
| **Validation** | Zod | Latest | Already using in Phase 1, type-safe schema validation |
| **Python AST** | ast module | Built-in | Zero dependencies, standard library, officially supported |
| **TypeScript AST** | ts-morph | Latest | Simpler API than compiler API, wrapper around official TypeScript compiler |
| **Progressive Loading** | ES6 dynamic import() | Native | Native browser/Node support, no bundler required |
| **Storage** | Filesystem JSON | Native | Simplest approach, no external deps, gitignored naturally |
| **Cache Invalidation** | TTL + manual | N/A | Simple, sufficient for research use case (30-day TTL) |
| **Multi-Language (optional)** | Tree-sitter | Latest | 40+ languages, unified query interface (future enhancement) |
| **Compression (optional)** | LLMLingua | Latest | 20x compression proven, optional integration for power users |

**Key Technology Decisions:**

**Decision 1: Filesystem Storage over Redis**

- **Rationale:** Filesystem simplest, no external dependencies, gitignored naturally
- **Research Citation:** "Redis requires separate server (not filesystem-based), not optimized for LLM context/research caching" - docs/research/context-optimization-caching-intel.md, Competitive Analysis section
- **Trade-offs:** Slower than in-memory (acceptable for research operations), simpler setup

**Decision 2: Python ast Module over lib2to3/parso**

- **Rationale:** Zero dependencies, standard library, officially supported
- **Research Citation:** "Python ast module: Built-in, zero-dependency parsing" - docs/research/context-optimization-caching-intel.md, Technology Choices table
- **Trade-offs:** Python-specific (acceptable, covers primary use case), mature API

**Decision 3: ts-morph over TypeScript Compiler API**

- **Rationale:** Simpler API, wrapper around official compiler, active maintenance
- **Research Citation:** "ts-morph: Simpler API, wrapper around official compiler" - docs/research/context-optimization-caching-intel.md, Technology Choices table
- **Trade-offs:** Additional dependency (acceptable, npm package), slightly larger bundle

**Decision 4: ES6 Dynamic Import() over Webpack/SystemJS**

- **Rationale:** Native Node.js support, no bundler required, standard feature
- **Research Citation:** "Native browser/Node support, no bundler required" - docs/research/context-optimization-caching-intel.md, Technology Choices table
- **Trade-offs:** Requires Node 12+ (acceptable, using Node 18+), module-based

### Alternatives Considered (from Research)

**Option 2: Redis + Traditional Caching Platforms**

- **Pros:** Extremely fast (sub-millisecond reads), mature technology, rich data structures
- **Cons:** Requires separate Redis server, not optimized for LLM context caching, network overhead for local development
- **Why Not Chosen:** Filesystem simplicity preferred, no external dependencies needed, research operations tolerate slightly higher latency

**Option 3: RAG Systems with Chunk Caching (Cache-Craft)**

- **Pros:** Optimized for LLM-based retrieval, reuses KV cache across similar queries, academic validation
- **Cons:** Chunk-level not research-level, requires vector database integration, focused on retrieval not research operations
- **Why Not Chosen:** Research-level caching (entire operations) provides better token reduction (96% vs incremental chunk gains)

**Option 4: Tree-sitter for Multi-Language Support**

- **Pros:** 40+ languages supported, unified query interface, active development
- **Cons:** Additional complexity, C library dependency, learning curve for query syntax
- **Why Not Chosen:** Python + TypeScript + JavaScript cover 95%+ of use cases, can add Tree-sitter later as enhancement

### Alignment with Existing System

**From existing codebase:**

- **Consistent With:** Node.js runtime (MCP servers), TypeScript (command definitions), Zod (validation from Phase 1)
- **New Additions:** ts-morph (TypeScript parsing), Python ast integration (call from Node.js)
- **Migration Considerations:** None - additive changes only, no breaking changes to existing commands

**Package.json Updates Required:**

```json
{
  "dependencies": {
    "ts-morph": "^21.0.0",  // NEW - TypeScript AST parsing
    "zod": "^3.22.0"        // Already present from Phase 1
  }
}
```

---

## 🏗️ Architecture Design

### System Context (from Existing Codebase)

**Existing System Architecture:**

- MCP server infrastructure (Phase 1): `servers/sage-enforcement/` provides template pattern
- Command-based workflow: `commands/sage.*.md` defines agent behaviors
- Ticket-based system: `.sage/tickets/index.json` tracks implementation state
- No existing `.sage/agent/` directory yet - will be created during Phase 2

**Integration Points:**

- This feature creates the `.sage/agent/` directory structure for context engineering
- Integrates with existing commands: `sage.init.md`, `sage.intel.md`, `sage.specify.md`
- Follows MCP server pattern established in Phase 1
- Enables Phase 3 (skill evolution) and Phase 4 (parallel orchestration)

### Component Architecture

**Architecture Pattern:** Layered Caching System with AST-Based Pattern Extraction and Progressive Loading

**Rationale:**

- **Layered approach** separates concerns (caching, extraction, loading) for independent testing and evolution
- **AST-based extraction** provides high accuracy (80-90%) without code execution
- **Progressive loading** achieves massive token reduction (90%) through context-aware filtering
- **Alignment:** Consistent with Phase 1 modular MCP server approach

**System Design:**

```plaintext
┌─────────────────────────────────────────────────────────────────┐
│                    Sage-Dev Command Layer                       │
│  /sage.init     /sage.intel     /sage.specify     /sage.tasks   │
└───────┬─────────────┬─────────────┬──────────────────────────────┘
        │             │             │
        │             │             │
┌───────▼─────────────▼─────────────▼──────────────────────────────┐
│                     MCP Server Layer                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ servers/sage-context-optimizer/                            │  │
│  │  ├── pattern-extractor-python.ts                           │  │
│  │  ├── pattern-extractor-typescript.ts                       │  │
│  │  ├── progressive-loader.ts                                 │  │
│  │  └── index.ts (MCP tool handlers)                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ servers/sage-research/                                     │  │
│  │  ├── cache-manager.ts                                      │  │
│  │  ├── cache-storage.ts                                      │  │
│  │  └── index.ts (MCP tool handlers)                          │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    │
┌───────────────────────────────────▼───────────────────────────────┐
│                     Storage Layer                                  │
│                                                                    │
│  .sage/agent/research/              .sage/agent/examples/         │
│  ├── rag-frameworks-2025.json       └── repository-patterns.ts    │
│  ├── llm-benchmarks.json                                          │
│  └── CACHE_MANIFEST.json                                          │
└────────────────────────────────────────────────────────────────────┘
```

**Data Flow:**

**Flow 1: Repository Initialization with Pattern Extraction**

```
User: /sage.init
  ↓
1. sage.init command analyzes repository
  ↓
2. Calls sage-context-optimizer MCP server
   └→ pattern-extractor-python.ts parses Python files
   └→ pattern-extractor-typescript.ts parses TypeScript files
  ↓
3. Patterns saved to .sage/agent/examples/repository-patterns.ts
  ↓
4. Displays extraction summary with confidence scores
```

**Flow 2: Research with Caching**

```
User: /sage.intel "topic"
  ↓
1. sage.intel calls sage-research MCP server
  ↓
2. cache-manager.ts checks cache:
   ├─ Cache HIT → Load from cache (<1s, <1K tokens)
   └─ Cache MISS → Fetch fresh research (45s, 180K tokens)
  ↓
3. If MISS: cache-manager.ts stores result
  ↓
4. cache-storage.ts enforces 100MB limit (LRU eviction)
```

**Flow 3: Specification with Progressive Loading**

```
User: /sage.specify component
  ↓
1. sage.specify detects context (file type, feature, domain)
  ↓
2. Calls sage-context-optimizer MCP server
   └→ progressive-loader.ts filters patterns (90% reduction)
  ↓
3. Calls sage-research MCP server
   └→ cache-manager.ts loads cached research (99% reduction)
  ↓
4. Generates specification with optimized context (77% token reduction)
```

### Architecture Decisions (from Research)

**Decision 1: MCP Server Integration Pattern**

- **Choice:** Two separate MCP servers (sage-research, sage-context-optimizer)
- **Rationale:** Separation of concerns, independent evolution, Phase 1 MCP infrastructure enables this
- **Implementation:** Each server provides tool handlers callable from commands
- **Trade-offs:** Slight complexity vs flexibility (acceptable, follows Phase 1 pattern)

**Decision 2: Filesystem Storage Pattern**

- **Choice:** JSON files in `.sage/agent/` with gitignore for cache
- **Rationale:** Simplest approach, no external dependencies, consistent with sage-dev philosophy
- **Implementation:**
  - Cache: `.sage/agent/research/*.json` (gitignored)
  - Patterns: `.sage/agent/examples/repository-patterns.ts` (tracked in Git)
- **Trade-offs:** Slower than in-memory vs simplicity and zero deps (acceptable for research operations)

**Decision 3: Incremental Pattern Extraction**

- **Choice:** File hash tracking to avoid re-parsing unchanged files
- **Rationale:** Large repositories (1000+ files) benefit from incremental updates
- **Implementation:** Store file hashes in `.sage/agent/examples/.pattern-hashes.json`
- **Trade-offs:** Additional hash storage vs performance on large repos (acceptable, <1KB overhead)

**Decision 4: Progressive Loading Strategy**

- **Choice:** Three-level filtering (file type → feature → domain)
- **Rationale:** Achieves 90%+ reduction while maintaining accuracy
- **Implementation:**
  - Level 1 (mandatory): File type filtering
  - Level 2 (context-specific): Feature filtering
  - Level 3 (optional): Domain filtering
- **Trade-offs:** Filtering complexity vs token reduction (acceptable, simple mapping logic)

### Component Breakdown

**Core Components:**

#### 1. Research Cache System (servers/sage-research/)

**Purpose:** Eliminate redundant research operations through intelligent caching

**Technology:** Node.js 18+, Zod validation, Filesystem JSON storage

**Modules:**

- `cache-manager.ts` - Cache operations (get, set, invalidate, clear, stats, cleanup)
- `cache-storage.ts` - Storage management (LRU eviction, size monitoring)
- `schemas/cache-entry.ts` - Zod schemas for validation
- `utils/cache-helpers.ts` - Path validation, age formatting, TTL calculation
- `index.ts` - MCP server entry point with tool handlers

**Interfaces:**

- **Input:** Research topic (string), optional flags (--no-cache)
- **Output:** Cached findings or fresh fetch, cache status message
- **API:** `getCachedResearch(topic)`, `cacheResearch(topic, findings)`, `invalidateCache(topic)`, `clearCache()`, `getCacheStats()`
- **Events:** Cache hit, cache miss, cache expired, eviction triggered

**Dependencies:**

- Node.js fs/promises (file operations)
- Zod (schema validation)
- None external (filesystem-only)

#### 2. Pattern Extraction Engine (servers/sage-context-optimizer/)

**Purpose:** Automatically discover and extract repository code patterns

**Technology:** Python ast module, ts-morph, Node.js child_process

**Modules:**

- `pattern-extractor-python.ts` - Python AST parser (spawns Python subprocess)
- `pattern-extractor-typescript.ts` - TypeScript ts-morph parser
- `schemas/repository-patterns.ts` - Pattern data structures
- `utils/file-hash-tracker.ts` - Incremental extraction support
- `utils/confidence-scorer.ts` - Pattern confidence calculation
- `index.ts` - MCP server entry point

**Interfaces:**

- **Input:** Repository root directory, file list (optional for incremental)
- **Output:** RepositoryPatterns object with confidence scores
- **API:** `extractPatterns(rootDir)`, `extractFromFiles(files)`, `validatePatterns(patterns)`, `mergePatterns(base, update)`
- **Events:** Extraction started, file parsed, patterns discovered, extraction complete

**Dependencies:**

- Python 3.10+ (ast module, called via subprocess)
- ts-morph npm package (TypeScript parsing)
- Node.js crypto (file hashing)

#### 3. Progressive Loading System (servers/sage-context-optimizer/)

**Purpose:** Load only relevant patterns based on task context

**Technology:** ES6 dynamic import(), context detection heuristics

**Modules:**

- `progressive-loader.ts` - Context-based filtering logic
- `utils/context-detector.ts` - Infer context from file paths, directories
- `mappings/file-type-patterns.ts` - File type → pattern mappings
- `mappings/feature-patterns.ts` - Feature → pattern mappings

**Interfaces:**

- **Input:** TaskContext (fileType, feature, domain)
- **Output:** Filtered RelevantPatterns (90% reduction)
- **API:** `loadForContext(context)`, `filterByFileType(patterns, fileType)`, `filterByFeature(patterns, feature)`
- **Events:** Patterns loaded, filtering applied, cache hit (session)

**Dependencies:**

- Pattern extraction output (`.sage/agent/examples/repository-patterns.ts`)
- ES6 dynamic import() (native Node.js)

### Component Boundaries

**Public Interfaces:**

- **sage-research MCP Server:**
  - Tool: `research_cache_get(topic: string)` → CacheEntry | null
  - Tool: `research_cache_set(topic: string, findings: object)` → void
  - Tool: `research_cache_invalidate(topic: string)` → void
  - Tool: `research_cache_stats()` → CacheStats

- **sage-context-optimizer MCP Server:**
  - Tool: `pattern_extract(rootDir: string)` → RepositoryPatterns
  - Tool: `pattern_load_for_context(context: TaskContext)` → RelevantPatterns
  - Tool: `pattern_validate(patterns: object)` → ValidationResult

**Internal Implementation:**

- Cache storage format, eviction algorithm, hash calculation hidden
- AST traversal logic, confidence scoring algorithm hidden
- Context detection heuristics, filtering logic hidden

**Cross-Component Contracts:**

- Pattern extraction output format defined in `schemas/repository-patterns.ts`
- Cache entry format defined in `schemas/cache-entry.ts`
- Task context format defined in `schemas/task-context.ts`
- All schemas validated with Zod at runtime

---

## 📋 Technical Specification

### Data Model

**Cache Entry (Research Cache System):**

```typescript
interface CacheEntry {
  topic: string;                    // Sanitized topic slug
  timestamp: string;                // ISO 8601 creation time
  expiresAt: string;                // ISO 8601 expiration time (30 days default)
  findings: ResearchFindings;       // Arbitrary research output
  metadata: {
    tokenCount: number;             // Original research token count
    queryTime: number;              // Original query time (milliseconds)
    sources: string[];              // Source URLs
  };
}

// Zod schema
const CacheEntrySchema = z.object({
  topic: z.string().regex(/^[a-z0-9-]+$/),
  timestamp: z.string().datetime(),
  expiresAt: z.string().datetime(),
  findings: z.object({}).passthrough(),
  metadata: z.object({
    tokenCount: z.number().positive(),
    queryTime: z.number().positive(),
    sources: z.array(z.string().url())
  })
});
```

**Repository Patterns (Pattern Extraction Engine):**

```typescript
interface RepositoryPatterns {
  naming: {
    python?: NamingConventions;
    typescript?: NamingConventions;
    javascript?: NamingConventions;
  };
  typing: {
    python?: TypePatterns;
    typescript?: TypePatterns;
  };
  testing: {
    python?: TestPatterns;
    typescript?: TestPatterns;
  };
  errorHandling: ErrorHandlingPatterns;
  architecture: ArchitecturePatterns;
  metadata: {
    extractedAt: string;            // ISO 8601
    fileCount: number;              // Files analyzed
    confidence: number;             // Overall confidence (0-1)
  };
}

interface NamingConventions {
  functions: string;                // "snake_case" | "camelCase"
  classes: string;                  // "PascalCase"
  constants: string;                // "UPPER_SNAKE_CASE"
  confidence: number;               // 0-1
}

interface TypePatterns {
  unionSyntax: string;              // "pipe" | "Union"
  generics: string;                 // "builtin" | "typing"
  confidence: number;               // 0-1
}
```

**Task Context (Progressive Loading System):**

```typescript
interface TaskContext {
  fileType: 'python' | 'typescript' | 'javascript' | 'rust' | 'go';
  feature: string;                  // 'auth', 'api', 'ui', 'data'
  domain: string;                   // 'frontend', 'backend', 'infra'
}
```

**Cache Manifest (Internal):**

```typescript
interface CacheManifest {
  version: string;                  // "1.0"
  entries: CacheManifestEntry[];
  totalSize: number;                // bytes
  lastCleanup: string;              // ISO 8601
}

interface CacheManifestEntry {
  topic: string;
  file: string;                     // Filename
  size: number;                     // bytes
  createdAt: string;                // ISO 8601
  lastAccessed: string;             // ISO 8601
  accessCount: number;
}
```

**Validation Rules:**

- Cache topic: alphanumeric + hyphens only, max 100 chars
- Timestamps: ISO 8601 format, validated with Zod
- Confidence scores: 0.0-1.0 range, high (0.8-1.0), medium (0.6-0.8), low (<0.6)
- File paths: validated to prevent directory traversal

**Indexing Strategy:**

- Cache manifest: In-memory index for fast lookups, persisted to disk
- Pattern hashes: Flat JSON file, hash → {path, hash, timestamp}
- No database required, filesystem performance sufficient

**Migration Approach:**

- V1.0 format established, future versions add fields (backward compatible)
- Cache manifest includes version field for format detection
- Invalid cache entries auto-deleted, warn user, fresh fetch

### API Design

**Top 6 Critical Endpoints (MCP Tool Handlers):**

#### 1. research_cache_get

- **Method:** MCP Tool Call
- **Purpose:** Retrieve cached research findings or return null if cache miss/expired
- **Request Schema:**

  ```typescript
  {
    topic: string  // "rag-frameworks-2025"
  }
  ```

- **Response Schema:**

  ```typescript
  {
    status: "hit" | "miss" | "expired",
    findings: ResearchFindings | null,
    age: string | null,  // "2 hours ago"
    metadata: CacheMetadata | null
  }
  ```

- **Error Handling:**
  - Corrupted cache file: Auto-delete, log error, return null (treat as miss)
  - Invalid topic: Return error with sanitization suggestion
  - Filesystem error: Log error, return null (treat as miss)

#### 2. research_cache_set

- **Method:** MCP Tool Call
- **Purpose:** Store research findings in cache with TTL
- **Request Schema:**

  ```typescript
  {
    topic: string,
    findings: ResearchFindings,
    metadata: {
      tokenCount: number,
      queryTime: number,
      sources: string[]
    }
  }
  ```

- **Response Schema:**

  ```typescript
  {
    status: "cached",
    expiresAt: string,  // ISO 8601
    file: string        // Cache file path
  }
  ```

- **Error Handling:**
  - Storage limit exceeded: Trigger LRU eviction, retry, return error if still fails
  - Filesystem error: Return error with details
  - Invalid schema: Validate with Zod, return validation errors

#### 3. pattern_extract

- **Method:** MCP Tool Call
- **Purpose:** Extract repository patterns via AST parsing
- **Request Schema:**

  ```typescript
  {
    rootDir: string,
    incremental: boolean = false
  }
  ```

- **Response Schema:**

  ```typescript
  {
    patterns: RepositoryPatterns,
    summary: {
      filesAnalyzed: number,
      patternsFound: number,
      confidenceScore: number,
      duration: number  // milliseconds
    }
  }
  ```

- **Error Handling:**
  - Parsing error in file: Skip file, log warning, continue with others
  - Python subprocess error: Return error with Python stderr
  - ts-morph error: Return error with stack trace, suggest tsconfig check

#### 4. pattern_load_for_context

- **Method:** MCP Tool Call
- **Purpose:** Load only relevant patterns for task context
- **Request Schema:**

  ```typescript
  {
    context: TaskContext
  }
  ```

- **Response Schema:**

  ```typescript
  {
    patterns: RelevantPatterns,
    stats: {
      totalPatterns: number,
      loadedPatterns: number,
      reductionPercent: number,
      filteringTime: number  // milliseconds
    }
  }
  ```

- **Error Handling:**
  - Patterns file missing: Return error, suggest running /sage.init
  - Invalid context: Use fallback (load all Python + TypeScript), log warning
  - Filtering error: Load all patterns (safe fallback), log error

#### 5. research_cache_stats

- **Method:** MCP Tool Call
- **Purpose:** Get cache statistics for monitoring
- **Request Schema:** None
- **Response Schema:**

  ```typescript
  {
    totalEntries: number,
    totalSize: number,       // bytes
    hitRate: number,         // 0-1 (session)
    averageAge: string,      // "5 days"
    oldestEntry: string,     // Topic slug
    newestEntry: string,     // Topic slug
    storageUsed: number,     // percent (0-100)
    nearLimit: boolean       // true if >80MB
  }
  ```

- **Error Handling:**
  - Manifest missing: Create new manifest, return empty stats
  - Manifest corrupted: Rebuild from filesystem scan, log warning

#### 6. pattern_validate

- **Method:** MCP Tool Call
- **Purpose:** Validate extracted patterns for quality
- **Request Schema:**

  ```typescript
  {
    patterns: RepositoryPatterns
  }
  ```

- **Response Schema:**

  ```typescript
  {
    valid: boolean,
    issues: ValidationIssue[],
    suggestions: string[]
  }

  interface ValidationIssue {
    severity: "error" | "warning",
    category: string,  // "low_confidence", "insufficient_samples", "conflicting_patterns"
    message: string,
    affectedPattern: string
  }
  ```

- **Error Handling:**
  - Invalid schema: Return schema validation errors
  - Low confidence: Return warnings, suggest manual review

### Security (from Research)

**Based on:** `docs/research/context-optimization-caching-intel.md` Security section

#### Authentication/Authorization

- **Approach:** Filesystem permissions only, no network authentication needed
- **Implementation:** Rely on OS-level file permissions for `.sage/` directory
- **Standards:** Follow principle of least privilege, no unnecessary permissions

#### Secrets Management

- **Strategy:** No secrets in cache files, environment variables for any credentials
- **Pattern:** Never cache API keys, tokens, passwords, PII
- **Rotation:** N/A (no secrets stored)

#### Data Protection

- **Encryption in Transit:** N/A (filesystem-only, no network)
- **Encryption at Rest:** Rely on OS-level filesystem encryption if needed
- **PII Handling:** Never cache PII, sanitize before caching, compliance with GDPR

**Path Sanitization (Critical Security Control):**

```typescript
import path from 'path';

function validateCachePath(topic: string): string {
    const safeDir = '.sage/agent/research';
    const fileName = topic.replace(/[^a-z0-9-]/gi, '-') + '.json';
    const fullPath = path.join(safeDir, fileName);

    // Ensure path stays within cache directory
    if (!fullPath.startsWith(path.resolve(safeDir))) {
        throw new Error('Invalid cache path: directory traversal detected');
    }

    return fullPath;
}
```

**Schema Validation (Data Integrity Control):**

```typescript
import { z } from 'zod';

const CacheEntrySchema = z.object({
    topic: z.string(),
    timestamp: z.string().datetime(),
    expiresAt: z.string().datetime(),
    findings: z.object({}).passthrough(),
    metadata: z.object({
        tokenCount: z.number(),
        queryTime: z.number(),
        sources: z.array(z.string())
    })
});

function validateCacheEntry(data: unknown): CacheEntry {
    return CacheEntrySchema.parse(data);  // Throws if invalid
}
```

**Sensitive Pattern Filtering (Privacy Control):**

```typescript
const SENSITIVE_PATTERNS = [
    /password/i,
    /api[_-]?key/i,
    /secret/i,
    /token/i,
    /credential/i
];

function filterSensitivePatterns(patterns: ExtractedPatterns) {
    // Remove patterns that might contain sensitive data
    return patterns.filter(p =>
        !SENSITIVE_PATTERNS.some(regex => regex.test(p.name))
    );
}
```

#### Security Testing

- **Approach:** Penetration testing for path traversal, fuzzing for cache corruption, validation of sensitive file exclusion
- **Tools:** OWASP Zap (future), manual security review (Phase 2)
- **Compliance:** GDPR (no PII caching), OWASP Top 10 (input validation, path traversal prevention)

**Vulnerability Prevention:**

- ✅ **Path traversal** - Validated paths restricted to `.sage/` directory
- ✅ **Code injection** - AST parsing (no eval), sandboxed execution
- ✅ **Data exfiltration** - Filesystem-only, no network calls from cache
- ✅ **Cache poisoning** - Schema validation, integrity checks with Zod
- ✅ **Resource exhaustion** - 100MB size limit, LRU eviction, batch processing

### Performance (from Research)

**Based on:** `docs/research/context-optimization-caching-intel.md` Performance section

#### Performance Targets (from Research)

| Operation | Baseline | Target | Improvement |
|-----------|----------|--------|-------------|
| Research (first run) | 180K tokens, 45s | 8K tokens, 10s | 96% tokens, 4.5x speed |
| Research (cache hit) | 180K tokens, 45s | <1K tokens, <1s | 99.4% tokens, 45x speed |
| Specification generation | 80K tokens, 30s | 18K tokens, 10s | 77% tokens, 3x speed |
| Pattern extraction (1K files) | N/A (manual) | <2 minutes | Automated |
| Progressive loading overhead | N/A | <50ms | 90%+ pattern reduction |
| Cache lookup | N/A | <10ms | Fast hit detection |

#### Caching Strategy

**Approach:** Filesystem-based with TTL and LRU eviction (from research recommendation)

**Pattern:** Cache-first pattern

```typescript
async function performResearch(topic: string, noCache: boolean = false) {
  if (!noCache) {
    const cached = await getCachedResearch(topic);
    if (cached && !isExpired(cached)) {
      return cached.findings;  // <1K tokens, <1s
    }
  }

  const findings = await fetchFreshResearch(topic);  // 180K tokens, 45s
  await cacheResearch(topic, findings);
  return findings;
}
```

**TTL Strategy:** 30 days default, configurable via `.sage/config.json`

**Invalidation:** Time-based (TTL) + manual (`--no-cache` flag)

**Performance Patterns from Research:**

1. **Lazy Cache Loading**

```typescript
// Don't load cache manifest on startup
// Load on-demand when cache access needed

let cacheManifest: CacheManifest | null = null;

function getCacheManifest(): CacheManifest {
    if (!cacheManifest) {
        cacheManifest = loadCacheManifest();
    }
    return cacheManifest;
}
```

2. **Incremental Pattern Extraction**

```typescript
// Don't re-extract entire repo on every init
// Track file hashes, only re-extract changed files

async function incrementalExtraction(repo: Repository) {
    const lastHashes = loadLastExtractionHashes();
    const currentHashes = computeFileHashes(repo);

    const changedFiles = findChangedFiles(lastHashes, currentHashes);

    if (changedFiles.length === 0) {
        console.log('No changes, using cached patterns');
        return loadCachedPatterns();
    }

    // Re-extract only changed files
    const updatedPatterns = await extractPatterns(changedFiles);
    return mergePatterns(loadCachedPatterns(), updatedPatterns);
}
```

3. **Pattern Loading Cache (Session)**

```typescript
// Cache loaded patterns in memory for session

const patternCache = new Map<string, Patterns>();

async function loadPatternsForContext(context: TaskContext) {
    const cacheKey = `${context.fileType}-${context.feature}`;

    if (patternCache.has(cacheKey)) {
        return patternCache.get(cacheKey)!;
    }

    const patterns = await loadAndFilterPatterns(context);
    patternCache.set(cacheKey, patterns);

    return patterns;
}
```

4. **Streaming AST Parsing (Large Repos)**

```typescript
// For large repos, parse files in batches

async function* extractPatternsStreaming(files: string[]) {
    const BATCH_SIZE = 100;

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const patterns = await extractBatch(batch);
        yield patterns;
    }
}
```

#### Database Optimization

- **N/A** - No database, filesystem-only
- **Query Patterns:** Direct file reads, no complex queries
- **Connection Pooling:** N/A
- **Partitioning:** Directory-based (research/, examples/)

#### Scaling Strategy

- **Horizontal:** N/A - local filesystem, single user
- **Vertical:** Resource limits enforced (100MB cache, 2min extraction timeout)
- **Auto-scaling:** N/A - not a service
- **Performance Monitoring:** Log cache hit rate, extraction time, token usage

**Optimization Strategies from Research:**

- **Cache Warming:** Pre-load frequently accessed research on startup (optional future enhancement)
- **Parallel Extraction:** Use worker threads for AST parsing (Node.js workers, future enhancement)
- **Compression:** gzip cache files for storage efficiency (optional future enhancement)
- **Indexing:** Cache manifest with topic index for fast lookups (already planned)
- **Pruning:** Auto-delete expired cache entries weekly (background task, optional)

---

## 🚀 Development Setup

### Required Tools and Versions

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime for MCP servers |
| Python | 3.10+ | AST parsing for pattern extraction |
| npm | 9+ | Package management |
| TypeScript | 5.0+ | Type-safe development |
| Zod | 3.22+ | Schema validation |
| ts-morph | 21.0+ | TypeScript AST parsing |

### Local Environment Setup

**1. Install Dependencies:**

```bash
# Install ts-morph for TypeScript parsing
npm install ts-morph@^21.0.0

# Verify Python installation (ast module is built-in)
python3 --version  # Should be 3.10+

# Verify Node.js version
node --version  # Should be 18+
```

**2. Create Directory Structure:**

```bash
# Create cache directory
mkdir -p .sage/agent/research
echo "*" > .sage/agent/research/.gitignore

# Create patterns directory
mkdir -p .sage/agent/examples
echo "!.gitignore" > .sage/agent/examples/.gitignore

# Create MCP server directories
mkdir -p servers/sage-research/{schemas,utils,tests}
mkdir -p servers/sage-context-optimizer/{schemas,utils,tests}
```

**3. Environment Variables:**

```bash
# .env file (if needed for future enhancements)
SAGE_CACHE_TTL_DAYS=30
SAGE_CACHE_SIZE_LIMIT_MB=100
SAGE_PATTERN_CONFIDENCE_THRESHOLD=0.6
```

**4. Configuration:**

```json
// .sage/config.json (create if not exists)
{
  "cache": {
    "ttlDays": 30,
    "sizeLimitMB": 100,
    "autoCleanup": true
  },
  "patternExtraction": {
    "confidenceThreshold": 0.6,
    "maxFileSizeBytes": 1048576,
    "timeoutSeconds": 120
  },
  "progressiveLoading": {
    "sessionCache": true,
    "filteringTimeout": 50
  }
}
```

### CI/CD Pipeline Requirements

**Testing Pipeline:**

```yaml
# .github/workflows/phase2-tests.yml
name: Phase 2 - Context Optimization Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: npm install

      - name: Run cache manager tests
        run: npm test tests/cache-manager.test.ts

      - name: Run pattern extractor tests
        run: npm test tests/pattern-extractor.test.ts

      - name: Run progressive loader tests
        run: npm test tests/progressive-loader.test.ts

      - name: Run integration tests
        run: npm test tests/integration/

      - name: Check test coverage
        run: npm run test:coverage
```

**Quality Gates:**

- Unit test coverage: ≥80%
- Integration test coverage: ≥90%
- No TypeScript errors: `tsc --noEmit`
- Linting pass: `eslint servers/`
- Performance benchmarks: All targets met

### Testing Framework and Coverage Targets

**Framework:** Vitest (consistent with Phase 1)

**Coverage Targets:**

- **Unit Tests:** 80% minimum coverage
  - cache-manager.ts: 85%+
  - pattern-extractor-python.ts: 80%+
  - pattern-extractor-typescript.ts: 80%+
  - progressive-loader.ts: 85%+
  - All utils: 75%+

- **Integration Tests:** 90% minimum coverage
  - End-to-end flows: 100%
  - Error scenarios: 90%+
  - Edge cases: 85%+

**Test Suites:**

1. `tests/cache-manager.test.ts` - Cache operations
2. `tests/pattern-extractor.test.ts` - Pattern extraction
3. `tests/progressive-loader.test.ts` - Progressive loading
4. `tests/integration/caching-flow.test.ts` - Research caching flow
5. `tests/integration/pattern-extraction-flow.test.ts` - Pattern extraction flow
6. `tests/integration/specification-flow.test.ts` - Specification generation flow

---

## ⚠️ Risk Management

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| **Pattern extraction <80% accuracy** | High | Medium | Confidence scoring system (0-1 scale), manual review option for low confidence (<0.6), fallback to default patterns, iterative improvement based on validation, test on 3+ real repositories before release |
| **Cache invalidation confusion** | Medium | Low | Clear timestamp display ("Cached 2 hours ago"), 30-day TTL documented in user guide, manual `--no-cache` flag, warn when cache >7 days old, user education in CACHING.md |
| **Storage limits exceeded** | Low | Low | 100MB hard limit with alerts at 80MB, automatic LRU eviction, cleanup command `/sage.cache --clear`, log evicted entries, user notification with recommendation |
| **Progressive loading doesn't reduce tokens** | High | Medium | Explicit file-type → pattern mapping (documented), validation tests for each context type, debug mode showing loaded patterns, A/B testing before/after, rollback if <70% reduction |
| **Cache corruption** | Medium | Low | Atomic write operations (temp + rename), Zod schema validation on every read, auto-delete corrupted files, fallback to fresh fetch, log errors for debugging |
| **AST parsing errors** | Medium | Low | Try-catch around all parsing operations, skip problematic files gracefully, log errors with file paths for debugging, partial results acceptable (continue with others), timeout after 5s per file |
| **Performance regression** | High | Low | Continuous benchmarking in CI/CD, alerts if research >12K tokens or cache hit >1s, optimize bottlenecks iteratively, rollback if targets not met, profiling tools for debugging |
| **ts-morph installation issues** | Medium | Medium | Document installation steps in README, troubleshooting guide for common issues (tsconfig, node_modules), fallback to JavaScript parsing only if TypeScript fails, error messages with suggestions |
| **Context detection failures** | Medium | Medium | Explicit user-provided context as fallback option, logging of detection logic for debugging, validation tests for common file path patterns, default to safe fallback (load Python + TypeScript) |
| **Phase 1 dependency not ready** | High | Low | Verify Phase 1 complete before starting Phase 2, integration tests validate MCP server pattern, block Phase 2 tickets until Phase 1 validated |

---

## 🗓️ Implementation Roadmap

### Phase 2.1: Pattern Extraction Foundation (Week 3, Days 1-3)

**Duration:** 24-32 hours
**Team:** 1-2 engineers

**Deliverables:**

1. Python AST extractor (`pattern-extractor-python.ts`)
   - Naming conventions (functions, classes, constants)
   - Type patterns (union syntax, generics)
   - Testing patterns (framework, file naming, fixtures)
   - Confidence scoring algorithm

2. TypeScript ts-morph extractor (`pattern-extractor-typescript.ts`)
   - Naming conventions (functions, classes, interfaces)
   - Type patterns (type aliases, generics)
   - Testing patterns (Jest, Vitest detection)

3. Pattern storage (`repository-patterns.ts`)
   - TypeScript export format
   - JSON schema validation with Zod
   - Merge strategy for incremental updates

4. Extraction tests (`pattern-extractor.test.ts`)
   - Test on 3 real repositories (Python, TypeScript, hybrid)
   - Validate 80%+ capture rate
   - Confidence score validation

**Tasks:**

- [ ] Create `servers/sage-context-optimizer/` directory structure
- [ ] Implement Python AST extractor with subprocess spawning
- [ ] Implement TypeScript ts-morph extractor
- [ ] Create pattern storage schema with Zod
- [ ] Implement confidence scoring algorithm
- [ ] Write unit tests (80%+ coverage)
- [ ] Test on 3+ real repositories
- [ ] Document pattern extraction process

**Success Criteria:**

- 80%+ pattern capture rate validated
- Confidence scores accurate (manual review confirms)
- Extraction completes in <2min for 1000+ files
- TypeScript patterns file generated correctly
- All unit tests passing

**Dependencies:**

- ts-morph npm package installed
- Python 3.10+ available
- Test repositories prepared (Python, TypeScript, hybrid)

### Phase 2.2: Research Caching System (Week 3, Days 4-5)

**Duration:** 16-20 hours
**Team:** 1-2 engineers

**Deliverables:**

1. Cache manager (`cache-manager.ts`)
   - get, set, invalidate, clear, stats, cleanup methods
   - 30-day TTL with expiration checking
   - Age display formatting
   - Zod schema validation

2. Cache manifest (`CACHE_MANIFEST.json`)
   - Tracks all cache entries (topic, timestamp, size, access count)
   - Updated on every cache operation
   - Used for LRU eviction

3. Storage management (`cache-storage.ts`)
   - 100MB size limit enforcement
   - LRU eviction policy implementation
   - Disk usage monitoring
   - Cleanup scheduling (optional background task)

4. Integration with `/sage.intel` command
   - Modify `commands/sage.intel.md` to call cache-manager
   - Display cache status ("Cached 2 hours ago" or "Fetching fresh...")
   - Support `--no-cache` flag to force fresh fetch

**Tasks:**

- [ ] Create `servers/sage-research/` directory structure
- [ ] Implement cache manager with all operations
- [ ] Implement storage management with LRU eviction
- [ ] Create cache entry schema with Zod
- [ ] Implement TTL calculation and expiration checking
- [ ] Modify `sage.intel.md` for cache integration
- [ ] Write unit tests (80%+ coverage)
- [ ] Document cache system in CACHING.md

**Success Criteria:**

- Cache hit: <1s response time, <1K tokens
- Cache miss: stores result correctly
- TTL expiration working (30 days)
- Storage limit enforced (100MB)
- Manual invalidation working (`--no-cache`)
- LRU eviction triggered correctly at limit

**Dependencies:**

- Node.js fs/promises module (available)
- Zod library (from Phase 1)
- `/sage.intel` command exists (verified)

### Phase 2.3: Progressive Loading (Week 4, Days 1-3)

**Duration:** 16-20 hours
**Team:** 1-2 engineers

**Deliverables:**

1. Progressive loader (`progressive-loader.ts`)
   - Context-based filtering (file type, feature, domain)
   - Dynamic import() integration
   - Pattern caching for session
   - 90%+ reduction validation

2. File type mapping (`file-type-patterns.ts`)
   - Explicit mapping: python → [python naming, typing, testing]
   - TypeScript → [typescript naming, typing]
   - JavaScript → [javascript naming]

3. Feature mapping (`feature-patterns.ts`)
   - auth → [security, authentication patterns]
   - api → [REST, validation patterns]
   - ui → [React, CSS patterns]

4. Integration with `/sage.specify` command
   - Modify `commands/sage.specify.md` to call progressive loader
   - Load only relevant patterns before spec generation
   - Measure token reduction (target: 77%)
   - Cache loaded patterns for session

**Tasks:**

- [ ] Implement progressive loader with filtering logic
- [ ] Create file type → pattern mappings
- [ ] Create feature → pattern mappings
- [ ] Implement context detection heuristics
- [ ] Implement session-based pattern cache
- [ ] Modify `sage.specify.md` for progressive loading
- [ ] Write unit tests (80%+ coverage)
- [ ] Document progressive loading in PROGRESSIVE_LOADING.md

**Success Criteria:**

- Progressive loading reduces patterns by 90%+
- Filtering overhead <50ms
- Specification token usage ≤20K (77% reduction from 80K)
- No pattern mismatch errors
- Context detection accurate for common patterns

**Dependencies:**

- Phase 2.1 complete (patterns extracted and available)
- ES6 dynamic import() support (Node 18+)
- `/sage.specify` command exists (verified)

### Phase 2.4: Integration & Metrics Validation (Week 4, Days 4-5)

**Duration:** 16-20 hours
**Team:** 1-2 engineers

**Deliverables:**

1. Full integration testing
   - End-to-end: `/sage.init` → pattern extraction → storage → validation
   - End-to-end: `/sage.intel` → cache miss → fetch → store → cache hit
   - End-to-end: `/sage.specify` → progressive loading → cached research → spec generation
   - Token measurement at each step
   - Performance benchmarking

2. MCP server packaging
   - `servers/sage-research/index.ts` - Tool handlers for caching
   - `servers/sage-context-optimizer/index.ts` - Tool handlers for extraction and loading
   - MCP tool registration and discovery

3. Documentation
   - `docs/CACHING.md` - Cache system explanation, TTL, manual invalidation
   - `docs/PATTERN_EXTRACTION.md` - Extraction process, confidence scoring
   - `docs/PROGRESSIVE_LOADING.md` - Filtering logic, context detection
   - `docs/PHASE_2_RESULTS.md` - Metrics validation and benchmarks

4. Metrics dashboard (optional)
   - Token usage tracking per operation
   - Cache hit rate over time
   - Pattern extraction statistics
   - Progressive loading reduction stats

**Tasks:**

- [ ] Write integration test suite
- [ ] Implement MCP tool handlers
- [ ] Register MCP servers for filesystem discovery
- [ ] Measure token usage (baseline vs optimized)
- [ ] Validate performance benchmarks
- [ ] Write CACHING.md documentation
- [ ] Write PATTERN_EXTRACTION.md documentation
- [ ] Write PROGRESSIVE_LOADING.md documentation
- [ ] Write PHASE_2_RESULTS.md with metrics
- [ ] Create optional metrics dashboard

**Success Criteria:**

- Research: 180K→8K (96% reduction) validated
- Research cache hit: 180K→<1K (99.4% reduction) validated
- Specification: 80K→18K (77% reduction) validated
- Cache hit rate >80% after initial usage
- All integration tests passing
- Documentation complete and reviewed
- MCP servers discoverable and functional

**Dependencies:**

- All previous phases complete (2.1, 2.2, 2.3)
- Integration test framework setup
- Documentation templates prepared

---

## ✅ Quality Assurance

### Testing Strategy

**Testing Pyramid:**

**Unit Tests (80% coverage target):**

- Cache manager operations: get, set, invalidate, clear, stats, cleanup
- AST parsing for Python: naming, typing, testing pattern extraction
- AST parsing for TypeScript: interface, type alias, function extraction
- Pattern confidence scoring algorithm
- TTL calculation and expiration checking
- Progressive loader filtering logic: file type, feature, domain
- Storage limit enforcement and LRU eviction
- Path validation and sanitization
- Schema validation with Zod

**Integration Tests (90% coverage target):**

- End-to-end: `/sage.init` → pattern extraction → storage → file creation
- End-to-end: `/sage.intel` → cache miss → fetch → store → cache hit on retry
- End-to-end: `/sage.specify` → progressive loading → spec generation
- Cache expiration flow: create entry → simulate 30 days → verify treated as miss
- Pattern extraction on real repositories: Python, TypeScript, JavaScript, hybrid
- Incremental extraction: modify files → re-run → verify only changed files parsed
- Storage limit: fill cache to 110MB → verify LRU eviction → verify under 100MB

**Performance Tests (100% of benchmarks):**

- Research token usage: measure baseline (180K) vs cache miss (8K) vs cache hit (<1K)
- Cache hit speed: 100 iterations, measure average, verify <10ms
- Pattern extraction timing: test on small (100 files), medium (500 files), large (1000+ files) repos
- Progressive loading overhead: measure filtering time, verify <50ms
- Storage limit eviction: measure eviction time, verify <100ms

**Security Tests:**

- Path traversal attempts: try `../../etc/passwd`, verify blocked
- Malformed JSON fuzzing: corrupt cache files, verify auto-delete and recovery
- Sensitive file exclusion: verify `secrets/`, `.env`, `credentials/` files skipped
- Schema validation: try invalid cache entries, verify rejected with clear errors

**User Acceptance Testing:**

- Developer workflow: `/sage.init` → `/sage.intel "topic"` → `/sage.specify component` with metrics tracking
- Cache hit rate validation: run 10 research queries, measure hit rate after second run
- Pattern accuracy validation: manual code review confirms 80%+ patterns captured
- Progressive loading effectiveness: measure token reduction, verify 77%+ on specifications

### Code Quality Gates

**Pre-Commit Checks:**

- TypeScript compilation: `tsc --noEmit` (zero errors)
- Linting: `eslint servers/` (zero errors, <5 warnings)
- Formatting: `prettier --check servers/` (all files formatted)
- Unit tests: `npm test` (all tests passing)

**Pre-Merge Checks:**

- Code review: 1+ approvals required
- Test coverage: ≥80% unit, ≥90% integration
- Performance benchmarks: all targets met (documented in PR)
- Documentation: updated for all public APIs

**Post-Merge Checks:**

- Integration tests: full suite passing
- Performance regression: compare with baseline (alert if >10% slower)
- Security scan: OWASP dependency check (no critical vulnerabilities)

### Deployment Verification Checklist

**Phase 2.1 Deployment:**

- [ ] Pattern extraction works on 3+ test repositories
- [ ] Patterns file created at `.sage/agent/examples/repository-patterns.ts`
- [ ] Confidence scores ≥0.8 for majority of patterns
- [ ] Extraction time <2min for 1000+ files
- [ ] Unit tests passing (≥80% coverage)

**Phase 2.2 Deployment:**

- [ ] Cache directory created at `.sage/agent/research/`
- [ ] Cache hit detected and loaded in <1s
- [ ] Cache miss fetches fresh and stores correctly
- [ ] TTL expiration working (30 days)
- [ ] Storage limit enforced (100MB)
- [ ] Manual invalidation working (`--no-cache`)
- [ ] Unit tests passing (≥80% coverage)

**Phase 2.3 Deployment:**

- [ ] Progressive loading reduces patterns by ≥90%
- [ ] Filtering overhead <50ms
- [ ] Context detection accurate for common file paths
- [ ] Specification token usage ≤20K
- [ ] Unit tests passing (≥80% coverage)

**Phase 2.4 Deployment:**

- [ ] All integration tests passing (≥90% coverage)
- [ ] Research token reduction: 96% (first run), 99.4% (cache hit)
- [ ] Specification token reduction: 77%
- [ ] Cache hit rate >80% after initial usage
- [ ] Documentation complete (CACHING.md, PATTERN_EXTRACTION.md, PROGRESSIVE_LOADING.md, PHASE_2_RESULTS.md)
- [ ] MCP servers discoverable and functional
- [ ] Performance benchmarks validated and documented

### Monitoring and Alerting Setup

**Metrics to Track:**

- Cache hit rate (per session)
- Average cache age
- Cache size (MB)
- Token usage per operation (research, specification)
- Pattern extraction time
- Progressive loading reduction percentage
- Error rate (cache operations, pattern extraction)

**Alerting Thresholds:**

- Cache size >80MB: Warn (approaching limit)
- Cache hit rate <60%: Warn (low effectiveness)
- Token usage >12K for research: Alert (target exceeded)
- Pattern extraction time >3min: Warn (performance issue)
- Error rate >5%: Alert (system issue)

**Logging:**

- Cache operations: hit, miss, expired, eviction
- Pattern extraction: files analyzed, patterns found, confidence scores
- Progressive loading: patterns loaded, reduction percentage
- Errors: detailed stack traces for debugging

---

## 📚 References & Traceability

### Source Documentation

**Feature Request:**

- `docs/features/context-optimization-caching.md`
  - User stories: Instant cache hits, automatic pattern extraction, progressive loading, smart specification
  - Initial technical considerations: Caching strategies, AST parsing, progressive loading patterns
  - Success criteria: 80-85% token reduction, 80%+ pattern capture, 90%+ pattern filtering
  - Expected impact: Cost savings, performance improvement, developer experience, foundation for Phase 3/4

**Research & Intelligence:**

- `docs/research/context-optimization-caching-intel.md`
  - Technical approach: Hybrid caching system with AST-based pattern extraction and context-aware progressive loading
  - Competitive analysis: Redis, Cache-Craft (RAG), Mem0, LLMLingua, ts-codebase-analyzer evaluated and compared
  - Security patterns: Path validation, schema validation, sensitive file filtering, path traversal prevention
  - Performance patterns: Lazy cache loading, incremental extraction, pattern loading cache, streaming AST parsing
  - Technology evaluation: Node.js fs + JSON (caching), Python ast module (parsing), ts-morph (TypeScript), ES6 dynamic import() (progressive loading)
  - Implementation phases: 4 phases over 2 weeks (72-92 hours), detailed timeline with dependencies

**Specification:**

- `docs/specs/context-optimization-caching/spec.md`
  - Functional requirements: 26 "shall" statements across 3 components (Research Cache System, Pattern Extraction Engine, Progressive Loading System)
  - Non-functional requirements: Performance (cache hit <1s), Security (no sensitive data), Scalability (10K files), Reliability (99.5% success rate)
  - Acceptance criteria: Research 96% reduction (first run), 99.4% reduction (cache hit), Specification 77% reduction, Pattern extraction 80%+ capture rate
  - Target files: 22 files identified (8 create, 4 modify, 10 test/doc files)
  - User stories: 6 stories with detailed acceptance criteria and example flows

### System Context

**Architecture & Patterns:**

- No existing `.sage/agent/system/` documentation yet - will be created during Phase 2 implementation
- Existing MCP server pattern: `servers/sage-enforcement/` - provides template for new servers (agents/, rules/, schemas/, tests/, utils/, index.ts)
- Existing commands: `commands/sage.init.md` (repository analysis), `commands/sage.intel.md` (research), `commands/sage.specify.md` (specification generation)

**Code Examples:**

- No existing `.sage/agent/examples/` yet - will be created by pattern extraction during Phase 2.1
- MCP server structure from `sage-enforcement/`: agents/, rules/, schemas/, tests/, utils/, index.ts

### Research Citations

**Best Practices Research:**

- Cache invalidation strategies: <https://sparkco.ai/blog/deep-dive-into-cache-invalidation-agents-in-2025>
- AST parsing guide: <https://rotemtam.com/2020/08/13/python-ast/>
- Progressive loading patterns: <https://nextjs.org/docs/app/guides/lazy-loading>
- Context-aware patterns: <https://erkanyasun.medium.com/introducing-the-contextual-adapter-pattern>

**Technology Evaluation:**

- Python AST Module: <https://docs.python.org/3/library/ast.html>
- ts-morph Library: <https://ts-morph.com/>
- ES6 Dynamic Import: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import>

**Security Standards:**

- OWASP Top 10: <https://owasp.org/www-project-top-ten/>
- Path traversal prevention: <https://owasp.org/www-community/attacks/Path_Traversal>

**Performance Benchmarks:**

- KVzip Context Compression: <https://techxplore.com/news/2025-11-ai-tech-compress-llm-chatbot.html>
- LLMLingua Compression: <https://www.microsoft.com/en-us/research/blog/llmlingua-innovating-llm-efficiency-with-prompt-compression/>
- Acon Framework: <https://arxiv.org/html/2510.00615v1>

### Related Components

**Dependencies:**

- Phase 1: MCP Server Infrastructure (COMPLETE) - Prerequisite for Phase 2, provides MCP server pattern
- `commands/sage.init.md` - Modified to add pattern extraction step
- `commands/sage.intel.md` - Modified to add cache check step
- `commands/sage.specify.md` - Modified to add progressive loading step

**Dependents:**

- Phase 3: Automatic Skill Evolution (BLOCKED BY Phase 2) - Requires pattern matching capabilities from Phase 2
- Phase 4: Parallel Agent Orchestration (BLOCKED BY Phase 2) - Builds on caching infrastructure from Phase 2
- Future: IDE integration (pattern hints, real-time validation) - Optional enhancement building on Phase 2 patterns

---

**End of Implementation Blueprint**

**Next Steps:**

1. Review and approve implementation plan
2. Run `/sage.tasks context-optimization-caching` to generate task breakdown with story tickets
3. Execute Phase 2.1: Pattern Extraction Foundation (24-32 hours)
4. Execute Phase 2.2: Research Caching System (16-20 hours)
5. Execute Phase 2.3: Progressive Loading (16-20 hours)
6. Execute Phase 2.4: Integration & Metrics Validation (16-20 hours)
7. Validate all success criteria and metrics targets
8. Document results in PHASE_2_RESULTS.md
