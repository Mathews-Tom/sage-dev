# Context Optimization & Caching Specification

**Version:** 1.0
**Status:** Draft
**Created:** 2025-11-13
**Phase:** 2 of 4
**Complexity:** Medium-High

**Sources:**

- Feature Request: `docs/features/context-optimization-caching.md`
- Research Output: `docs/research/context-optimization-caching-intel.md`

---

## 1. Overview

### Purpose and Business Value

This system implements intelligent caching and progressive loading to eliminate redundant research operations and extract repository patterns automatically. The solution addresses critical inefficiencies where research operations reload 180,000+ tokens every time, even for identical queries, and repository patterns are analyzed repeatedly instead of being captured once.

**Business Value:**

- **Token Reduction:** 80-85% reduction across all operations (research 96%, specifications 77%)
- **Performance Improvement:** 4.5x-45x speedup (research cache hits instant vs 45s baseline)
- **Pattern Capture:** 80%+ of repository patterns extracted automatically
- **Foundation:** Enables Phase 3 (Automatic Skill Evolution) and Phase 4 (Parallel Agent Orchestration)
- **Cost Savings:** Reduced API costs from token efficiency

### Success Metrics

| Metric | Baseline | Target | Improvement |
|--------|----------|--------|-------------|
| Research tokens (first run) | 180,000 | 8,000 | 96% reduction |
| Research tokens (cache hit) | 180,000 | <1,000 | 99.4% reduction |
| Specification tokens | 80,000 | 18,000 | 77% reduction |
| Research time (cache hit) | 45 seconds | <1 second | 45x speedup |
| Pattern capture rate | Manual (0%) | 80%+ | Automatic |
| Pattern extraction time | N/A | <2 minutes | For 1000+ files |

### Target Users

- **Developers** using Sage-Dev for feature development workflows
- **Teams** requiring consistent repository patterns across members
- **Power Users** performing frequent research operations (competitive analysis, market research, best practices)
- **Contributors** to repositories with established coding conventions

### Component Architecture

This specification covers three integrated components:

1. **Research Cache System** - Intelligent caching with TTL and LRU eviction
2. **Pattern Extraction Engine** - AST-based automatic pattern discovery
3. **Progressive Loading System** - Context-aware pattern filtering

---

## 2. Functional Requirements

### 2.1 Research Cache System

**Component ID:** CACHE

#### Core Capabilities

The Research Cache System **shall**:

1. **Cache research findings** in `.sage/agent/research/` directory as JSON files with naming pattern `[topic-slug].json`

2. **Validate all cache entries** using Zod schemas to ensure data integrity

3. **Enforce 30-day TTL** (Time-To-Live) with configurable expiration policy

4. **Detect cache hits** and display cache age to user in human-readable format (e.g., "Cached 2 hours ago")

5. **Provide manual invalidation** via `--no-cache` flag to force fresh research fetch

6. **Enforce 100MB storage limit** with LRU (Least Recently Used) eviction policy

7. **Track cache metadata** in `CACHE_MANIFEST.json` including timestamps, sizes, access counts, and sources

8. **Fall back to fresh fetch** automatically if cache is corrupted, expired, or missing

9. **Support cache operations**: get, set, invalidate, clear, stats, cleanup

10. **Log cache status** with clear indicators for cache hit, cache miss, expired, or corrupted states

#### User Stories

**Story 1: Instant Research Cache Hits**

**As a** developer researching a topic
**I want** identical research queries to return instantly from cache
**So that** I don't waste 45 seconds and 180,000 tokens on repeated queries

**Acceptance Criteria:**

- ✅ First research query: 180K tokens, 45 seconds (cache miss), result cached
- ✅ Subsequent identical query: <1K tokens, <1 second (cache hit)
- ✅ Cache timestamp displayed: "Cached on 2025-11-13, 2 hours ago"
- ✅ Manual cache bypass available: `--no-cache` flag
- ✅ Cache expiration enforced: entries older than 30 days treated as miss

**Example Flow:**

```bash
# First query (cache miss)
/sage.intel "RAG frameworks 2025"
→ Fetching fresh research: 180K tokens, 45s
→ Cached to: .sage/agent/research/rag-frameworks-2025.json

# Second query (cache hit)
/sage.intel "RAG frameworks 2025"
→ ✓ Cache hit: rag-frameworks-2025 (cached 2 hours ago)
→ Loaded from cache: <1K tokens, <1s
```

**Story 2: Automatic Cache Cleanup**

**As a** developer with limited disk space
**I want** the cache system to automatically manage storage limits
**So that** I don't need to manually delete old cache entries

**Acceptance Criteria:**

- ✅ Storage limit enforced: 100MB maximum
- ✅ LRU eviction: least recently used entries removed when limit reached
- ✅ Warning at 80MB: "Cache approaching storage limit (80MB/100MB)"
- ✅ Cleanup logging: "Evicted 3 entries (12MB) to stay within limit"
- ✅ Manual cleanup command: `/sage.cache --clear` removes all entries

#### Business Rules and Constraints

1. **Cache Key Generation**
   - Topic slug must be alphanumeric with hyphens only
   - Maximum slug length: 100 characters
   - Collision handling: append hash if duplicate topic slugs

2. **Expiration Policy**
   - Default TTL: 30 days
   - Configurable via `.sage/config.json`: `cache.ttl` (days)
   - Grace period: 7 days warning before expiration

3. **Storage Management**
   - Hard limit: 100MB
   - Warning threshold: 80MB
   - Eviction batch size: Remove entries until <90MB
   - Minimum entry retention: 1 day (no eviction before 24 hours)

4. **Cache Invalidation Events**
   - Manual: `--no-cache` flag, `/sage.cache --clear` command
   - Automatic: TTL expiration, storage limit exceeded, schema validation failure
   - Corruption: Auto-delete corrupted file, log error, fetch fresh

---

### 2.2 Pattern Extraction Engine

**Component ID:** PATTERN

#### Core Capabilities

The Pattern Extraction Engine **shall**:

1. **Extract naming conventions** from Python and TypeScript files (functions, classes, constants, variables)

2. **Extract type patterns** including union syntax (pipe vs Union), generics (builtin vs typing module)

3. **Extract testing patterns** including framework detection (pytest, Jest, Vitest), file naming, fixture usage

4. **Extract error handling patterns** including try-catch usage, error types, logging patterns

5. **Extract architecture patterns** including module organization, dependency injection, API design

6. **Achieve 80%+ pattern capture rate** validated against manual code review

7. **Assign confidence scores** to all extracted patterns on 0-1 scale based on sample size and consistency

8. **Save patterns** to `.sage/agent/examples/repository-patterns.ts` in TypeScript export format

9. **Support incremental extraction** via file hash tracking to avoid re-parsing unchanged files

10. **Handle multiple languages** with dedicated parsers: Python (ast module), TypeScript/JavaScript (ts-morph)

11. **Skip sensitive files** respecting `.gitignore` and excluding `secrets/`, `credentials/`, `.env` files

12. **Complete extraction** in <2 minutes for repositories with 1000+ files

#### User Stories

**Story 3: Automatic Pattern Extraction**

**As a** developer initializing a new repository
**I want** Sage-Dev to automatically extract code patterns, naming conventions, and architectural patterns
**So that** subsequent operations use repository-specific context without manual configuration

**Acceptance Criteria:**

- ✅ `/sage.init` extracts 80%+ of repository patterns
- ✅ Patterns saved to `.sage/agent/examples/repository-patterns.ts`
- ✅ Patterns include: naming, typing, testing, error handling, architecture
- ✅ Extraction works for Python, TypeScript, JavaScript repositories
- ✅ Confidence scores assigned to all patterns
- ✅ Extraction completes in <2 minutes for 1000+ file repos

**Example Output:**

```typescript
// .sage/agent/examples/repository-patterns.ts
export const REPOSITORY_PATTERNS = {
  "naming": {
    "python": {
      "functions": "snake_case",
      "classes": "PascalCase",
      "constants": "UPPER_SNAKE_CASE",
      "confidence": 0.95
    },
    "typescript": {
      "functions": "camelCase",
      "classes": "PascalCase",
      "interfaces": "PascalCase",
      "confidence": 0.88
    }
  },
  "typing": {
    "python": {
      "unionSyntax": "pipe",  // str | int
      "generics": "builtin",  // list[str], dict[str, Any]
      "confidence": 0.92
    }
  },
  "testing": {
    "python": {
      "framework": "pytest",
      "fileNaming": "test_*.py",
      "fixtures": "conftest.py",
      "confidence": 0.90
    }
  },
  "metadata": {
    "extractedAt": "2025-11-13T10:30:00Z",
    "fileCount": 247,
    "overallConfidence": 0.91
  }
};
```

**Story 4: Incremental Pattern Updates**

**As a** developer making changes to the repository
**I want** pattern extraction to only re-analyze changed files
**So that** extraction remains fast even after initial setup

**Acceptance Criteria:**

- ✅ File hashes tracked in `.sage/agent/examples/.pattern-hashes.json`
- ✅ Only changed files re-parsed on subsequent `/sage.init`
- ✅ Pattern merge strategy combines old + new patterns
- ✅ "No changes detected" message if no files changed
- ✅ Extraction time <10 seconds for typical incremental updates

#### Business Rules and Constraints

1. **Pattern Confidence Scoring**
   - High confidence (0.8-1.0): 80%+ consistency across sampled files
   - Medium confidence (0.6-0.8): 60-80% consistency
   - Low confidence (<0.6): <60% consistency, suggest manual review

2. **File Sampling Strategy**
   - Small repos (<100 files): analyze all files
   - Medium repos (100-1000 files): sample 50% randomly + all tests
   - Large repos (>1000 files): sample 30% weighted by modification frequency

3. **Pattern Priority**
   - Naming conventions: highest priority (most frequently used)
   - Type patterns: high priority (affects code generation)
   - Testing patterns: medium priority (affects test generation)
   - Architecture patterns: lower priority (informational)

4. **Extraction Safety**
   - Read-only operations: no file modifications
   - Sandboxed parsing: AST parsing without code execution
   - Error isolation: parsing error in one file doesn't fail entire extraction

---

### 2.3 Progressive Loading System

**Component ID:** LOADER

#### Core Capabilities

The Progressive Loading System **shall**:

1. **Filter patterns by file type** (python, typescript, javascript, rust, go) loading only language-specific patterns

2. **Filter patterns by feature** (auth, api, ui, data) loading only feature-relevant patterns

3. **Filter patterns by domain** (frontend, backend, infra) loading only domain-specific patterns

4. **Achieve 90%+ reduction** in loaded patterns compared to loading all patterns

5. **Cache loaded patterns** for the session duration to avoid repeated filtering

6. **Complete filtering** in <50ms overhead per operation

7. **Support dynamic imports** using ES6 `import()` for on-demand pattern loading

8. **Provide context inference** automatically detecting file type and feature from task context

9. **Fall back gracefully** loading all patterns if filtering fails or context unclear

10. **Log filtering results** showing pattern count before/after filtering

#### User Stories

**Story 5: Progressive Pattern Loading**

**As a** developer working on a specific feature
**I want** only relevant patterns loaded for my current task
**So that** I don't waste context on patterns for other languages/frameworks

**Acceptance Criteria:**

- ✅ Python file: only Python patterns loaded
- ✅ React component: only React/TypeScript patterns loaded
- ✅ API endpoint: only API patterns loaded
- ✅ 90%+ reduction in loaded patterns
- ✅ Filtering overhead <50ms
- ✅ Pattern cache hits after first load

**Example:**

```typescript
// Working on src/auth/login.py
// Context detected: { fileType: 'python', feature: 'auth', domain: 'backend' }

// Load only:
- Python naming patterns (snake_case, PascalCase)
- Python typing patterns (pipe unions, builtin generics)
- Authentication patterns (token handling, session management)
- Backend patterns (API structure, error responses)

// Don't load (90% filtered):
- React patterns (hooks, component structure)
- CSS patterns (naming, organization)
- Database migration patterns
- Frontend routing patterns
- JavaScript naming conventions
- TypeScript interface patterns
```

**Story 6: Smart Specification Generation**

**As a** developer generating specifications
**I want** specification engine to use cached research and extracted patterns
**So that** specification generation uses 77% fewer tokens

**Acceptance Criteria:**

- ✅ Specification generation: 80K → 18K tokens (77% reduction)
- ✅ Uses cached research findings automatically
- ✅ References extracted repository patterns
- ✅ Progressive loading of only relevant standards
- ✅ Clear logging of optimization: "Using cached research (96% token reduction)"

#### Business Rules and Constraints

1. **Context Detection Rules**
   - File extension → file type: `.py` → python, `.ts`/`.tsx` → typescript
   - Directory name → feature: `auth/` → auth, `api/` → api, `ui/` → ui
   - File path → domain: `src/` → backend, `frontend/` → frontend, `infra/` → infra

2. **Filtering Priority**
   - Level 1: File type (most specific, mandatory)
   - Level 2: Feature (context-specific, if detected)
   - Level 3: Domain (broader context, optional)

3. **Session Cache Management**
   - Cache key: `${fileType}-${feature}-${domain}`
   - Cache lifetime: session duration (cleared on agent restart)
   - Cache size: unlimited (patterns already filtered to 10% of original)

4. **Fallback Strategy**
   - If file type unclear: load Python + TypeScript patterns
   - If feature unclear: load all feature patterns
   - If domain unclear: load all domain patterns
   - Log fallback reason for debugging

---

## 3. Non-Functional Requirements

### 3.1 Performance Requirements

| Operation | Target | Measurement Method |
|-----------|--------|-------------------|
| Research cache hit | <1 second, <1K tokens | Timer + token counter |
| Research cache miss | ≤15 seconds, ≤12K tokens | 96% reduction from 180K baseline |
| Pattern extraction (1000+ files) | ≤2 minutes | Wall clock time |
| Progressive loading filtering | <50ms overhead | Benchmarking suite |
| Cache lookup (hit detection) | <10ms | Performance profiling |
| Specification generation | ≤20K tokens | 77% reduction from 80K baseline |
| Cache manifest read | <5ms | Filesystem timing |
| Pattern merge (incremental) | <500ms | Merge operation timing |

### 3.2 Security Requirements

**Filesystem Security:**

- Cache stored in `.sage/agent/research/` (gitignored by default)
- No network access for caching operations (filesystem-only)
- Read/write permissions restricted to project directory
- Path validation to prevent directory traversal attacks

**Data Privacy:**

- No sensitive data cached (PII, credentials, API keys)
- Research findings sanitized before caching (redact credentials if present)
- Manual cache clear option: `/sage.cache --clear`
- Optional audit log for cache operations

**Pattern Extraction Security:**

- Only extract from Git-tracked files (respect `.gitignore`)
- Skip sensitive directories: `secrets/`, `credentials/`, `.env`, `private/`
- Pattern files reviewed before use (confidence scores displayed)
- Extraction runs in sandboxed environment (from Phase 1 MCP infrastructure)
- No code execution during AST parsing (static analysis only)

**Cache Integrity:**

- JSON schema validation on every read
- Zod validation for cache structure
- Auto-delete corrupted cache files
- Fallback to fresh fetch if validation fails
- Atomic write operations (temp file + rename) to prevent partial writes

**Security Testing:**

- Penetration testing for path traversal in cache operations
- Fuzzing cache JSON with malformed data
- Validation that sensitive files excluded from pattern extraction
- Integration with OWASP security scanning

### 3.3 Scalability Requirements

**Repository Scale:**

- Support repositories up to 10,000 files
- Handle mixed-language codebases (Python + TypeScript + JavaScript)
- Scale pattern extraction with file count (linear time complexity)

**Cache Scale:**

- Support up to 100MB of cached research (50+ topics at ~2MB each)
- Automatic LRU eviction when limit reached
- No performance degradation with cache size

**Concurrent Operations:**

- Support concurrent cache reads (multiple agents)
- Safe concurrent cache writes (file locking via Node.js fs.promises)
- Multiple pattern extraction sessions without interference

**Load Handling:**

- 100+ cache lookups per session without performance degradation
- Pattern extraction on repositories with 10,000+ files in <5 minutes
- Progressive loading scales with pattern count (O(n) filtering)

### 3.4 Reliability Requirements

**Fault Tolerance:**

- Graceful fallback to fresh fetch on cache failure (99.5% success rate)
- Auto-recovery from corrupted cache files (delete + fresh fetch)
- Default patterns available if extraction fails
- No data loss on cache eviction (entries logged before deletion)

**Error Handling:**

- Cache read errors: log error, treat as cache miss, continue
- Pattern extraction errors: skip problematic file, continue with others
- Schema validation errors: delete corrupted entry, log warning, fresh fetch
- Storage limit errors: trigger eviction, retry operation, alert if fails

**Monitoring and Logging:**

- Cache hit/miss rate logged per session
- Pattern extraction success rate logged
- Storage usage warnings at 80MB threshold
- Performance metrics logged for analysis

### 3.5 Maintainability Requirements

**Code Organization:**

- Separate modules for cache, pattern extraction, progressive loading
- Clear interfaces between components
- Comprehensive inline documentation
- TypeScript strict mode enabled

**Testing Requirements:**

- Unit test coverage: 80% minimum
- Integration test coverage: 90% minimum
- Performance benchmarks: 100% of targets validated
- Test repositories: Python, TypeScript, JavaScript, hybrid

**Documentation Requirements:**

- API documentation for all public functions
- Cache format specification documented
- Pattern schema documented
- Troubleshooting guide for common issues

---

## 4. Features & Flows

### 4.1 Feature Breakdown with Priorities

| Feature | Priority | Complexity | Estimated Effort |
|---------|----------|------------|------------------|
| Research Cache System | P0 (Critical) | Medium | 24-32 hours |
| Pattern Extraction (Python) | P0 (Critical) | Medium-High | 16-24 hours |
| Pattern Extraction (TypeScript) | P1 (High) | Medium | 12-16 hours |
| Progressive Loading | P0 (Critical) | Medium | 16-20 hours |
| Cache Manifest & Tracking | P1 (High) | Low-Medium | 8-12 hours |
| Incremental Extraction | P2 (Medium) | Medium | 12-16 hours |
| Storage Limit & LRU Eviction | P1 (High) | Medium | 8-12 hours |
| Multi-language Support (Tree-sitter) | P3 (Low) | High | 20-30 hours |
| Cache Analytics Dashboard | P3 (Low) | Low | 4-8 hours |

### 4.2 Key User Flows

#### Flow 1: Initial Repository Setup with Pattern Extraction

```
User: /sage.init
  ↓
1. Agent loads existing .sage/ configuration
  ↓
2. Agent discovers repository structure
  ↓
3. Agent triggers pattern extraction
   - Scans for Python files
   - Parses AST for patterns
   - Scans for TypeScript files
   - Parses with ts-morph
   - Assigns confidence scores
  ↓
4. Agent saves patterns to .sage/agent/examples/repository-patterns.ts
  ↓
5. Agent displays extraction summary:
   "✓ Extracted 247 files: naming (0.95), typing (0.92), testing (0.90)"
  ↓
6. Patterns available for all future operations
```

#### Flow 2: Research with Caching

```
User: /sage.intel "RAG frameworks 2025"
  ↓
1. Agent generates cache key: "rag-frameworks-2025"
  ↓
2. Agent checks cache:
   - Path: .sage/agent/research/rag-frameworks-2025.json
   - Exists? → Yes/No
   - Valid (not expired)? → Yes/No
  ↓
3a. CACHE HIT:
    - Load findings from cache (<1s, <1K tokens)
    - Display: "✓ Cache hit: rag-frameworks-2025 (cached 2 hours ago)"
    - Return cached findings
  ↓
3b. CACHE MISS:
    - Display: "Cache miss: fetching fresh research..."
    - Fetch fresh research (45s, 180K tokens)
    - Cache result for future
    - Display: "✓ Cached research: rag-frameworks-2025"
    - Return fresh findings
```

#### Flow 3: Specification with Progressive Loading

```
User: /sage.specify auth-service
  ↓
1. Agent detects context:
   - Feature: "auth-service" → feature = 'auth'
   - Component files: src/auth/*.py → fileType = 'python'
   - Directory: backend/ → domain = 'backend'
  ↓
2. Agent loads relevant patterns (progressive loading):
   - Filter: fileType = 'python' → load Python patterns only
   - Filter: feature = 'auth' → load auth-related patterns
   - Filter: domain = 'backend' → load backend patterns
   - Result: 10% of total patterns loaded (90% filtered)
   - Cache key: "python-auth-backend"
  ↓
3. Agent checks research cache:
   - Topic: "authentication best practices 2025"
   - Cache hit: load from cache (99% token reduction)
  ↓
4. Agent generates specification:
   - Uses cached research findings
   - References extracted repository patterns
   - Progressive loaded patterns only
   - Token usage: 80K → 18K (77% reduction)
  ↓
5. Agent saves specification:
   - Output: docs/specs/auth-service/spec.md
```

#### Flow 4: Cache Cleanup on Storage Limit

```
System: Cache size reaches 100MB (automatic trigger)
  ↓
1. System loads CACHE_MANIFEST.json
  ↓
2. System calculates total size: 102MB (over limit)
  ↓
3. System sorts entries by last access time (LRU)
  ↓
4. System marks entries for eviction:
   - Oldest entry: "rag-frameworks-2024.json" (last accessed 45 days ago)
   - Second oldest: "llm-benchmarks-2024.json" (last accessed 30 days ago)
   - Total to evict: 12MB
  ↓
5. System deletes marked entries
  ↓
6. System updates CACHE_MANIFEST.json
  ↓
7. System logs: "Evicted 2 entries (12MB) to stay within limit. Current: 90MB"
  ↓
8. System continues normal operations
```

### 4.3 Input/Output Specifications

#### Cache Entry Format (Input/Output)

```typescript
interface CacheEntry {
  topic: string;                    // "rag-frameworks-2025"
  timestamp: string;                // ISO 8601: "2025-11-13T10:30:00Z"
  expiresAt: string;                // ISO 8601: "2025-12-13T10:30:00Z"
  findings: ResearchFindings;       // Research output object
  metadata: {
    tokenCount: number;             // 180000
    queryTime: number;              // milliseconds: 45000
    sources: string[];              // ["https://...", "https://..."]
  };
}
```

#### Repository Patterns Format (Output)

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
    fileCount: number;              // 247
    confidence: number;             // 0-1: 0.91
  };
}
```

#### Task Context Format (Input)

```typescript
interface TaskContext {
  fileType: 'python' | 'typescript' | 'javascript' | 'rust' | 'go';
  feature: string;                  // 'auth', 'api', 'ui', 'data'
  domain: string;                   // 'frontend', 'backend', 'infra'
}
```

#### Cache Manifest Format (Internal)

```typescript
interface CacheManifest {
  version: string;                  // "1.0"
  entries: CacheManifestEntry[];
  totalSize: number;                // bytes
  lastCleanup: string;              // ISO 8601
}

interface CacheManifestEntry {
  topic: string;
  file: string;                     // "rag-frameworks-2025.json"
  size: number;                     // bytes
  createdAt: string;                // ISO 8601
  lastAccessed: string;             // ISO 8601
  accessCount: number;
}
```

---

## 5. Acceptance Criteria

### 5.1 Definition of Done

**Research Cache System:**

- ✅ Cache miss: fetches fresh research, stores in `.sage/agent/research/[topic].json`
- ✅ Cache hit: loads from cache in <1s, displays age ("Cached 2 hours ago")
- ✅ Expiration: 30-day TTL enforced, expired entries treated as cache miss
- ✅ Manual invalidation: `--no-cache` flag bypasses cache
- ✅ Storage limit: 100MB enforced with LRU eviction, warnings at 80MB
- ✅ Validation: Zod schema validation on all reads, corrupted files auto-deleted
- ✅ Token reduction: 180K→8K (first run), 180K→<1K (cache hit)

**Pattern Extraction Engine:**

- ✅ Extraction rate: 80%+ of patterns captured (validated on 3+ test repos)
- ✅ Languages: Python, TypeScript, JavaScript support
- ✅ Pattern categories: naming, typing, testing, error handling, architecture
- ✅ Confidence scores: assigned to all patterns (0-1 scale)
- ✅ Storage: patterns saved to `.sage/agent/examples/repository-patterns.ts`
- ✅ Incremental: only re-extract changed files (file hash tracking)
- ✅ Performance: <2min for 1000+ file repositories

**Progressive Loading System:**

- ✅ Filtering: context-based (file type + feature + domain)
- ✅ Reduction: 90%+ of patterns filtered out
- ✅ Performance: <50ms filtering overhead
- ✅ Caching: loaded patterns cached for session
- ✅ Integration: `/sage.specify` uses progressive loading
- ✅ Token reduction: 80K→18K for specifications (77%)

**Integration Requirements:**

- ✅ `/sage.init` runs pattern extraction automatically
- ✅ `/sage.intel` checks cache before research
- ✅ `/sage.specify` uses progressive loading + cached research
- ✅ All MCP servers discoverable via filesystem
- ✅ No breaking changes to existing commands
- ✅ Backward compatibility: works without patterns or cache

**Documentation Requirements:**

- ✅ `CACHING.md` explains cache system, TTL, manual invalidation
- ✅ `PATTERN_EXTRACTION.md` documents extraction process, confidence scoring
- ✅ `PROGRESSIVE_LOADING.md` explains filtering logic, context detection
- ✅ `PHASE_2_RESULTS.md` with metrics validation and benchmarks

### 5.2 Validation Approach

**Unit Testing:**

- Cache manager operations (get, set, invalidate, clear, stats, cleanup)
- AST parsing for Python (naming, typing, testing pattern extraction)
- ts-morph parsing for TypeScript (interface, type alias extraction)
- Pattern confidence scoring algorithm
- TTL calculation and expiration checking
- Progressive loader filtering logic (file type, feature, domain)
- Storage limit enforcement and LRU eviction

**Integration Testing:**

- End-to-end: `/sage.init` → pattern extraction → storage → validation
- End-to-end: `/sage.intel` → cache miss → fetch → store → cache hit
- End-to-end: `/sage.specify` → progressive loading → specification generation
- Cache expiration flow: create entry → wait 30 days (simulated) → verify treated as miss
- Pattern extraction on real repositories (Python, TypeScript, hybrid)
- Incremental extraction: modify files → re-run extraction → verify only changed files parsed

**Performance Benchmarking:**

- Research token usage measurement (baseline vs with cache)
- Cache hit speed testing (100 iterations, measure average)
- Pattern extraction timing (small/medium/large repos)
- Progressive loading overhead measurement
- Storage limit and eviction performance

**Security Testing:**

- Path traversal attempts in cache operations
- Malformed JSON fuzzing for cache files
- Sensitive file exclusion validation
- Corrupted cache file recovery testing

**User Acceptance Testing:**

- Developer workflow: init → research → specify with metrics tracking
- Cache hit rate validation over 10+ sessions
- Pattern accuracy validation via manual code review
- Progressive loading effectiveness measurement

---

## 6. Dependencies

### 6.1 Technical Dependencies

**Required (MUST have):**

- Phase 1: MCP Server Infrastructure (MUST be complete)
- Node.js 18+ with fs/promises module
- TypeScript 5.0+ compiler
- Zod validation library (from Phase 1)
- Python 3.10+ with ast module (standard library)
- ts-morph npm package (NEW - requires installation)

**Optional (MAY have):**

- Tree-sitter (multi-language AST parsing, future enhancement)
- LLMLingua (20x compression, optional integration)
- Cache analytics dashboard dependencies

### 6.2 Feature Dependencies

**Prerequisites (MUST exist):**

- ✅ Phase 1: MCP Server Infrastructure complete
- ✅ `/sage.init` command functional
- ✅ `.sage/agent/` directory structure exists
- ✅ Zod validation library installed
- ✅ MCP filesystem discovery mechanism working

**Blockers (MUST resolve):**

- Phase 1 incomplete → blocks all Phase 2 work
- MCP server infrastructure broken → blocks new server creation
- ts-morph installation fails → blocks TypeScript pattern extraction

**Enables (unlocks future work):**

- Phase 3: Automatic Skill Evolution (requires pattern matching capabilities)
- Phase 4: Parallel Agent Orchestration (builds on caching infrastructure)
- Future: IDE integration (pattern hints, real-time validation)

### 6.3 External Integrations

**Git Integration:**

- Respect `.gitignore` for pattern extraction
- Track file changes for incremental extraction
- Integration with pre-commit hooks (optional)

**IDE Integration (Future):**

- VSCode extension showing extracted patterns
- Real-time pattern validation
- Quick-fix suggestions based on patterns

---

## 7. Target Files

### 7.1 Files to Create

**MCP Servers:**

1. `servers/sage-research/cache-manager.ts` - Cache operations (get, set, invalidate, clear, stats, cleanup)
2. `servers/sage-research/cache-storage.ts` - Storage management (LRU eviction, size monitoring)
3. `servers/sage-research/index.ts` - MCP server entry point
4. `servers/sage-context-optimizer/pattern-extractor-python.ts` - Python AST parser
5. `servers/sage-context-optimizer/pattern-extractor-typescript.ts` - TypeScript ts-morph parser
6. `servers/sage-context-optimizer/progressive-loader.ts` - Context-based filtering
7. `servers/sage-context-optimizer/index.ts` - MCP server entry point
8. `servers/sage-specification/index.ts` - Spec generation with optimization

**Test Files:**
9. `tests/cache-manager.test.ts` - Cache operations unit tests
10. `tests/pattern-extractor.test.ts` - Pattern extraction unit tests
11. `tests/progressive-loader.test.ts` - Progressive loading unit tests
12. `tests/integration/caching-flow.test.ts` - End-to-end caching tests
13. `tests/integration/pattern-extraction-flow.test.ts` - End-to-end extraction tests

**Configuration & Data:**
14. `.sage/agent/research/.gitignore` - Ignore all cache files
15. `.sage/agent/examples/.gitignore` - Don't ignore patterns (track in Git)
16. `.sage/agent/research/CACHE_MANIFEST.json` - Cache metadata (generated)
17. `.sage/agent/examples/repository-patterns.ts` - Extracted patterns (generated)
18. `.sage/agent/examples/.pattern-hashes.json` - File hashes for incremental extraction (generated)

**Documentation:**
19. `docs/CACHING.md` - Cache system documentation
20. `docs/PATTERN_EXTRACTION.md` - Pattern extraction documentation
21. `docs/PROGRESSIVE_LOADING.md` - Progressive loading documentation
22. `docs/PHASE_2_RESULTS.md` - Metrics validation and benchmarks

### 7.2 Files to Modify

**Commands:**

1. `commands/sage.init.md` - Add pattern extraction step (lines 50-70 estimated)
2. `commands/sage.intel.md` - Add cache check step (lines 30-45 estimated)
3. `commands/sage.specify.md` - Add progressive loading step (lines 40-60 estimated)

**Configuration:**
4. `.sage/EXECUTION_RULES.md` - Add caching rules and pattern usage guidelines
5. `.sage/config.json` - Add cache configuration (TTL, storage limit)

**Package Configuration:**
6. `package.json` - Add ts-morph dependency
7. `tsconfig.json` - Ensure proper TypeScript settings for new servers

### 7.3 Directory Structure

```
.sage/
├── agent/
│   ├── examples/
│   │   ├── repository-patterns.ts        ← NEW (generated by extraction)
│   │   ├── .pattern-hashes.json          ← NEW (file hash tracking)
│   │   └── .gitignore                    ← NEW (don't ignore patterns)
│   ├── research/
│   │   ├── [topic].json                  ← NEW (cached research files)
│   │   ├── CACHE_MANIFEST.json           ← NEW (cache metadata)
│   │   └── .gitignore                    ← NEW (ignore all cache files)
│   └── EXECUTION_RULES.md                (modified)
├── config.json                           (modified)
└── tickets/                              (existing)

servers/
├── sage-research/                        ← NEW
│   ├── cache-manager.ts
│   ├── cache-storage.ts
│   └── index.ts
├── sage-context-optimizer/               ← NEW
│   ├── pattern-extractor-python.ts
│   ├── pattern-extractor-typescript.ts
│   ├── progressive-loader.ts
│   └── index.ts
└── sage-specification/                   ← NEW
    └── index.ts

docs/
├── specs/
│   └── context-optimization-caching/
│       └── spec.md                       ← THIS FILE
├── CACHING.md                            ← NEW
├── PATTERN_EXTRACTION.md                 ← NEW
├── PROGRESSIVE_LOADING.md                ← NEW
└── PHASE_2_RESULTS.md                    ← NEW

tests/
├── cache-manager.test.ts                 ← NEW
├── pattern-extractor.test.ts             ← NEW
├── progressive-loader.test.ts            ← NEW
└── integration/
    ├── caching-flow.test.ts              ← NEW
    └── pattern-extraction-flow.test.ts   ← NEW
```

---

## 8. Implementation Phases

### Phase 2.1: Pattern Extraction Foundation (Week 3, Days 1-3)

**Effort:** 24-32 hours

**Deliverables:**

- Python AST extractor with naming, typing, testing pattern detection
- TypeScript ts-morph extractor with interface, type alias detection
- Pattern confidence scoring algorithm
- Pattern storage in `.sage/agent/examples/repository-patterns.ts`
- Unit tests for extraction (80%+ coverage)
- Validation on 3+ real repositories (Python, TypeScript, hybrid)

**Success Criteria:**

- 80%+ pattern capture rate validated
- Confidence scores accurate (manual review)
- Extraction completes in <2min for 1000+ files
- TypeScript patterns file generated correctly

### Phase 2.2: Research Caching System (Week 3, Days 4-5)

**Effort:** 16-20 hours

**Deliverables:**

- Cache manager with get, set, invalidate, clear, stats, cleanup
- Cache manifest tracking (timestamps, sizes, access counts)
- Storage management (100MB limit, LRU eviction)
- Zod schema validation
- Integration with `/sage.intel` command
- Unit tests for caching (80%+ coverage)

**Success Criteria:**

- Cache hit: <1s, <1K tokens
- Cache miss: stores result correctly
- TTL expiration working (30 days)
- Storage limit enforced (100MB)
- Manual invalidation working

### Phase 2.3: Progressive Loading (Week 4, Days 1-3)

**Effort:** 16-20 hours

**Deliverables:**

- Progressive loader with context-based filtering
- File type, feature, domain mappings
- Dynamic import() integration
- Session-based pattern caching
- Integration with `/sage.specify` command
- Unit tests for filtering (80%+ coverage)

**Success Criteria:**

- Progressive loading reduces patterns by 90%+
- Filtering overhead <50ms
- Specification token usage ≤20K (77% reduction)
- No pattern mismatch errors

### Phase 2.4: Integration & Metrics Validation (Week 4, Days 4-5)

**Effort:** 16-20 hours

**Deliverables:**

- Full integration testing (init → research → specify)
- Token measurement at each step
- Performance benchmarking suite
- Documentation (CACHING.md, PATTERN_EXTRACTION.md, PHASE_2_RESULTS.md)
- MCP server packaging and deployment

**Success Criteria:**

- Research: 180K→8K (96% reduction) validated
- Specification: 80K→18K (77% reduction) validated
- Cache hit rate >80% after initial usage
- All integration tests passing
- Documentation complete and reviewed

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Pattern extraction <80% accuracy | Medium | High | Confidence scoring, manual review option, fallback to default patterns, iterative improvement based on validation |
| Cache invalidation confusion | Low | Medium | Clear timestamp display, 30-day TTL documented, manual `--no-cache` flag, user education in docs |
| Storage limits exceeded frequently | Low | Low | 100MB hard limit with alerts at 80MB, LRU eviction automatic, cleanup command available, user notifications |
| Progressive loading doesn't reduce tokens | Medium | High | Explicit file-type → pattern mapping, validation tests, debug mode showing loaded patterns, A/B testing |
| Cache corruption from concurrent writes | Low | Medium | Atomic write operations (temp + rename), file locking via fs.promises, Zod validation on reads, auto-recovery |
| AST parsing errors on edge cases | Low | Medium | Try-catch around parsing, skip problematic files gracefully, log errors with file paths, partial results acceptable |
| Performance regression on large repos | Low | High | Continuous benchmarking in CI, alerts on token > target, optimize bottlenecks iteratively, sampling strategy for large repos |
| ts-morph installation issues | Medium | Medium | Document installation steps, provide troubleshooting guide, fallback to JavaScript parsing only if TypeScript fails |
| Context detection failures | Medium | Medium | Explicit user-provided context as fallback, logging of detection logic, validation tests for common scenarios |

---

## 10. Metrics & Validation

### 10.1 Performance Metrics

**Baseline (Before Phase 2):**

- Research operation: 180,000 tokens, 45 seconds
- Specification generation: 80,000 tokens, 30 seconds
- Pattern extraction: Manual, not automated
- Caching: None

**Target (After Phase 2):**

- Research (first run): 8,000 tokens, 10 seconds (96% reduction, 4.5x speedup)
- Research (cache hit): <1,000 tokens, <1 second (99.4% reduction, 45x speedup)
- Specification: 18,000 tokens, 10 seconds (77% reduction, 3x speedup)
- Pattern extraction: 80%+ capture rate, <2 minutes for 1000+ files
- Progressive loading: 90%+ pattern reduction, <50ms overhead

**Validation Method:**

- Token counting: Log token usage before/after each operation
- Timing: Measure wall clock time with high-precision timers
- Accuracy: Manual code review validates pattern extraction accuracy
- Cache hit rate: Track hits vs misses over 10+ sessions

### 10.2 Quality Metrics

**Test Coverage:**

- Unit tests: 80% minimum coverage
- Integration tests: 90% minimum coverage
- Performance tests: 100% of benchmarks validated

**Code Quality:**

- TypeScript strict mode: enabled
- ESLint: zero errors, <5 warnings
- Type safety: no `any` types (except explicitly documented cases)
- Documentation: all public APIs documented

**Reliability:**

- Cache operation success rate: 99.5%+
- Pattern extraction success rate: 95%+
- Test pass rate: 99.5%+
- Zero data loss on cache eviction

---

## 11. Traceability Matrix

| Requirement ID | Source Document | Section | Priority |
|----------------|-----------------|---------|----------|
| REQ-CACHE-001 | Feature Request | Story 1 | P0 |
| REQ-CACHE-002 | Research Output | Section 3.2 | P0 |
| REQ-PATTERN-001 | Feature Request | Story 3 | P0 |
| REQ-PATTERN-002 | Research Output | Section 2.1 | P0 |
| REQ-LOADER-001 | Feature Request | Story 5 | P0 |
| REQ-LOADER-002 | Research Output | Section 2.3 | P1 |
| REQ-PERF-001 | Research Output | Section 5 | P0 |
| REQ-SEC-001 | Research Output | Section 4 | P1 |

**Source Documents:**

- `docs/features/context-optimization-caching.md` - User stories, acceptance criteria, expected impact
- `docs/research/context-optimization-caching-intel.md` - Technical recommendations, technology stack, implementation phases

---

## 12. Appendix

### 12.1 Technology Stack Summary

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Caching Storage | Node.js fs + JSON | Filesystem-based, no external dependencies, gitignored naturally |
| Cache Validation | Zod schemas | Already using Zod in Phase 1, type-safe validation |
| Python AST | Built-in ast module | Zero dependencies, standard library, officially supported |
| TypeScript AST | ts-morph | Simpler API than compiler API, wrapper around official TypeScript compiler |
| Progressive Loading | ES6 dynamic import() | Native Node.js support, no bundler required |
| Multi-Language (optional) | Tree-sitter | 40+ languages, unified query interface, future enhancement |
| Compression (optional) | LLMLingua | 20x compression proven, optional integration for power users |

### 12.2 API Contracts

**Cache Manager API:**

```typescript
interface CacheManager {
  get(topic: string): Promise<CacheEntry | null>;
  set(topic: string, findings: ResearchFindings): Promise<void>;
  has(topic: string): Promise<boolean>;
  invalidate(topic: string): Promise<void>;
  clear(): Promise<void>;
  stats(): Promise<CacheStats>;
  cleanup(): Promise<number>;
}
```

**Pattern Extractor API:**

```typescript
interface PatternExtractor {
  extract(rootDir: string): Promise<RepositoryPatterns>;
  extractFromFiles(files: string[]): Promise<RepositoryPatterns>;
  validate(patterns: RepositoryPatterns): ValidationResult;
  merge(base: RepositoryPatterns, update: RepositoryPatterns): RepositoryPatterns;
}
```

**Progressive Loader API:**

```typescript
interface ProgressiveLoader {
  loadForContext(context: TaskContext): Promise<RelevantPatterns>;
  filterByFileType(patterns: RepositoryPatterns, fileType: FileType): Patterns;
  filterByFeature(patterns: Patterns, feature: string): Patterns;
}
```

### 12.3 Glossary

- **AST (Abstract Syntax Tree):** Tree representation of code structure, enables pattern extraction without execution
- **Cache Hit:** Request served from cache (fast, low tokens)
- **Cache Miss:** Request requires fresh fetch (slow, high tokens)
- **Confidence Score:** Measure of pattern consistency (0-1 scale)
- **LRU (Least Recently Used):** Eviction policy removing oldest-accessed entries first
- **Progressive Loading:** Loading only relevant subset of data based on context
- **TTL (Time-To-Live):** Duration before cached entry expires
- **Zod:** TypeScript-first schema validation library

---

**End of Specification**

**Next Steps:**

1. Review and approve specification
2. Run `/sage.plan context-optimization-caching` to create implementation plan
3. Run `/sage.tasks context-optimization-caching` to generate task breakdown
4. Run `/sage.implement [ticket-id]` to execute implementation
