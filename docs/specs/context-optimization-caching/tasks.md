# Context Optimization & Caching - Task Breakdown

**Epic:** CACHE-001
**Generated:** 2025-11-13
**Total Effort:** 72-92 hours
**Sprints:** 4 sprints over 2 weeks
**Story Tickets:** 23 tickets (CACHE-002 through CACHE-023)

---

## Executive Summary

This document breaks down the Context Optimization & Caching epic (CACHE-001) into 23 actionable story tickets organized across 4 sprints. Each ticket follows SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound) with clear acceptance criteria, dependencies, and effort estimates.

### Sprint Overview

| Sprint | Focus | Tickets | Effort | Duration |
|--------|-------|---------|--------|----------|
| Sprint 0 | Infrastructure Setup | 1 ticket | 2-4h | Day 1 |
| Sprint 1 | Pattern Extraction Foundation | 6 tickets | 29-42h | Days 1-3 |
| Sprint 2 | Research Caching System | 5 tickets | 22-32h | Days 4-5 |
| Sprint 3 | Progressive Loading | 5 tickets | 19-28h | Days 1-3 |
| Sprint 4 | Integration & Validation | 6 tickets | 20-30h | Days 4-5 |
| **Total** | **All Phases** | **23 tickets** | **92-136h** | **2 weeks** |

### Critical Path

```plaintext
CACHE-019 (Infrastructure)
    ↓
[CACHE-002 (Python) + CACHE-003 (TypeScript)] → CACHE-004 (Schema) → CACHE-018 (sage.init)
    ↓                                                                         ↓
CACHE-006 (Cache Manager) → CACHE-007/008 → CACHE-009 (sage.intel)          ↓
    ↓                                                                         ↓
CACHE-011 (Mappings) → CACHE-010 (Loader) → CACHE-012 (sage.specify) ←------+
    ↓
CACHE-014 (MCP) → CACHE-015 (Integration Tests) → CACHE-016 (Benchmarks) → CACHE-017 (Docs)
```

---

## Sprint 0: Infrastructure Setup

**Goal:** Create directory structure, configuration files, and development environment

**Duration:** Day 1 (2-4 hours)

**Success Criteria:**
- All directories created with proper .gitignore files
- Configuration files updated (package.json, .sage/config.json)
- Development environment ready for implementation

### CACHE-019: Directory Structure & Configuration

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 2-4 hours
**Sprint:** 0

**Description:**
Create the complete directory structure for Phase 2, including cache directories, pattern storage, MCP servers, and test infrastructure. Update configuration files to support caching and pattern extraction.

**SMART Criteria:**
- **Specific:** Create 8 directories, 3 .gitignore files, update 2 config files
- **Measurable:** All files/directories created, package.json has ts-morph dependency
- **Achievable:** Standard filesystem operations, no complex logic
- **Relevant:** Required foundation for all Phase 2 work
- **Time-bound:** 2-4 hours

**Acceptance Criteria:**
- ✅ Directory `.sage/agent/research/` created
- ✅ Directory `.sage/agent/examples/` created
- ✅ File `.sage/agent/research/.gitignore` created with `*` (ignore all cache files)
- ✅ File `.sage/agent/examples/.gitignore` created with `!.gitignore` (track patterns in Git)
- ✅ Directory `servers/sage-research/` created with subdirs: schemas/, utils/, tests/
- ✅ Directory `servers/sage-context-optimizer/` created with subdirs: schemas/, utils/, tests/, mappings/
- ✅ File `package.json` updated with `"ts-morph": "^21.0.0"` dependency
- ✅ File `.sage/config.json` updated with cache, patternExtraction, progressiveLoading sections
- ✅ All directories verified with `ls` commands
- ✅ ts-morph installed successfully with `npm install`

**Target Files:**
- `.sage/agent/research/` (create directory)
- `.sage/agent/examples/` (create directory)
- `.sage/agent/research/.gitignore` (create)
- `.sage/agent/examples/.gitignore` (create)
- `servers/sage-research/` (create directory structure)
- `servers/sage-context-optimizer/` (create directory structure)
- `package.json` (modify - add ts-morph dependency)
- `.sage/config.json` (modify - add cache config)

**Dependencies:**
- None (first ticket to execute)

**Blocks:**
- All other tickets (CACHE-002 through CACHE-023)

**Testing Requirements:**
- Manual verification of directory structure
- Verify ts-morph installs without errors
- Validate .sage/config.json is valid JSON

**Implementation Notes:**
```bash
# Create directories
mkdir -p .sage/agent/research
mkdir -p .sage/agent/examples
mkdir -p servers/sage-research/{schemas,utils,tests}
mkdir -p servers/sage-context-optimizer/{schemas,utils,tests,mappings}

# Create .gitignore files
echo "*" > .sage/agent/research/.gitignore
echo "!.gitignore" > .sage/agent/examples/.gitignore

# Install ts-morph
npm install ts-morph@^21.0.0
```

---

## Sprint 1: Pattern Extraction Foundation (Phase 2.1)

**Goal:** Implement AST-based pattern extraction for Python and TypeScript repositories

**Duration:** Week 3, Days 1-3 (24-32 hours)

**Success Criteria:**
- Python and TypeScript extractors operational
- 80%+ pattern capture rate validated on test repositories
- Patterns stored in .sage/agent/examples/repository-patterns.ts
- sage.init command integrated with pattern extraction

### CACHE-002: Python AST Pattern Extractor

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 8-12 hours
**Sprint:** 1

**Description:**
Implement Python AST-based pattern extraction using the built-in ast module. Extract naming conventions (functions, classes, constants), type patterns (union syntax, generics), testing patterns (framework, file naming), and error handling patterns. Assign confidence scores based on consistency across sampled files.

**SMART Criteria:**
- **Specific:** Extract 4 pattern categories from Python files using ast module
- **Measurable:** 80%+ capture rate, confidence scores 0-1, <2min for 1000+ files
- **Achievable:** ast module proven in research, zero external dependencies
- **Relevant:** Python primary language for many repositories
- **Time-bound:** 8-12 hours

**Acceptance Criteria:**
- ✅ File `servers/sage-context-optimizer/pattern-extractor-python.ts` created
- ✅ Naming conventions extracted: functions (snake_case), classes (PascalCase), constants (UPPER_SNAKE_CASE)
- ✅ Type patterns extracted: union syntax (pipe vs Union), generics (builtin vs typing)
- ✅ Testing patterns extracted: framework (pytest/unittest), file naming (test_*.py), fixtures
- ✅ Error handling patterns extracted: try-except usage, error types, logging
- ✅ Confidence scores assigned (0-1 scale) based on sample consistency
- ✅ Python subprocess spawned correctly from Node.js
- ✅ Extraction works on test Python repository (80%+ patterns captured)
- ✅ Performance: <2 minutes for 1000+ Python files
- ✅ Error handling: parsing errors skip file, log warning, continue with others

**Target Files:**
- `servers/sage-context-optimizer/pattern-extractor-python.ts` (create)
- `servers/sage-context-optimizer/schemas/python-patterns.ts` (create)
- `servers/sage-context-optimizer/utils/confidence-scorer.ts` (create)

**Dependencies:**
- CACHE-019 (directory structure must exist)

**Blocks:**
- CACHE-004 (pattern storage needs schema from extractors)
- CACHE-005 (testing needs extractors complete)

**Testing Requirements:**
- Unit tests for naming convention detection
- Unit tests for confidence scoring algorithm
- Integration test on real Python repository (e.g., Flask, Django, FastAPI)
- Performance test: 1000 files in <2 minutes

**Implementation Notes:**
- Use Node.js `child_process.spawn()` to call Python script
- Python script uses `ast.parse()` and `ast.walk()` for traversal
- Sample 50% of files for medium repos (100-1000 files)
- Timeout: 5 seconds per file, skip if exceeded

### CACHE-003: TypeScript ts-morph Pattern Extractor

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 8-10 hours
**Sprint:** 1

**Description:**
Implement TypeScript AST-based pattern extraction using ts-morph library. Extract naming conventions (functions, classes, interfaces), type patterns (type aliases, generics, union syntax), testing patterns (Jest, Vitest detection), and architecture patterns (module organization).

**SMART Criteria:**
- **Specific:** Extract 4 pattern categories from TypeScript files using ts-morph
- **Measurable:** 80%+ capture rate, confidence scores 0-1, <2min for 1000+ files
- **Achievable:** ts-morph proven in research, simpler API than compiler
- **Relevant:** TypeScript primary language for MCP servers and commands
- **Time-bound:** 8-10 hours

**Acceptance Criteria:**
- ✅ File `servers/sage-context-optimizer/pattern-extractor-typescript.ts` created
- ✅ Naming conventions extracted: functions (camelCase), classes (PascalCase), interfaces (PascalCase)
- ✅ Type patterns extracted: union syntax (| vs Union<>), generics (builtin vs legacy)
- ✅ Testing patterns extracted: framework (Jest/Vitest), file naming (*.test.ts)
- ✅ Architecture patterns extracted: module organization, export patterns
- ✅ Confidence scores assigned (0-1 scale) based on sample consistency
- ✅ ts-morph Project initialized correctly with tsconfig.json
- ✅ Extraction works on test TypeScript repository (80%+ patterns captured)
- ✅ Performance: <2 minutes for 1000+ TypeScript files
- ✅ Error handling: parsing errors skip file, log warning, continue with others

**Target Files:**
- `servers/sage-context-optimizer/pattern-extractor-typescript.ts` (create)
- `servers/sage-context-optimizer/schemas/typescript-patterns.ts` (create)

**Dependencies:**
- CACHE-019 (directory structure and ts-morph installed)

**Blocks:**
- CACHE-004 (pattern storage needs schema from extractors)
- CACHE-005 (testing needs extractors complete)

**Testing Requirements:**
- Unit tests for naming convention detection
- Unit tests for type pattern extraction (union syntax, generics)
- Integration test on real TypeScript repository (e.g., Express, NestJS)
- Performance test: 1000 files in <2 minutes

**Implementation Notes:**
- Use ts-morph `Project` class with tsConfigFilePath
- Traverse with `sourceFile.getTypeAliases()`, `sourceFile.getInterfaces()`
- Sample 50% of files for medium repos (100-1000 files)
- Timeout: 5 seconds per file, skip if exceeded

### CACHE-021: Cache Manager Unit Tests

**Type:** Story
**Priority:** P1 (High)
**Effort:** 3-4 hours
**Sprint:** 1

**Description:**
Create comprehensive unit test suite for cache manager operations (get, set, invalidate, clear, stats, cleanup). Test TTL expiration, cache hit/miss detection, storage limit enforcement, and error handling scenarios. Achieve 85%+ test coverage.

**SMART Criteria:**
- **Specific:** Write 15+ unit tests for cache manager operations
- **Measurable:** 85%+ coverage, all operations tested, all edge cases covered
- **Achievable:** Standard Vitest testing, clear inputs/outputs
- **Relevant:** Validates cache reliability before integration
- **Time-bound:** 3-4 hours

**Acceptance Criteria:**
- ✅ File `tests/cache-manager.test.ts` created
- ✅ Test: cache.get() returns null on miss
- ✅ Test: cache.set() stores entry correctly
- ✅ Test: cache.get() returns entry on hit
- ✅ Test: TTL expiration causes cache miss after 30 days
- ✅ Test: cache.invalidate() removes specific entry
- ✅ Test: cache.clear() removes all entries
- ✅ Test: cache.stats() returns correct metrics
- ✅ Test: cache.cleanup() removes expired entries
- ✅ Test: Corrupted cache file auto-deleted
- ✅ Test: Invalid schema validation rejects entry
- ✅ Test coverage: 85%+ for cache-manager.ts
- ✅ All tests passing with `npm test`

**Target Files:**
- `tests/cache-manager.test.ts` (create)

**Dependencies:**
- CACHE-019 (test infrastructure directory exists)
- CACHE-006 (cache manager implementation) - can prepare tests in advance

**Blocks:**
- None (tests can be written before implementation)

**Testing Requirements:**
- Use Vitest framework
- Mock filesystem operations for isolation
- Mock date/time for TTL testing
- Test both success and error paths

**Implementation Notes:**
- Use `vi.mock('fs/promises')` for filesystem mocking
- Use `vi.useFakeTimers()` for time manipulation
- Test atomic write operations (temp file + rename)

### CACHE-004: Pattern Storage & Schema

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 4-6 hours
**Sprint:** 1

**Description:**
Create the repository patterns storage format and Zod validation schemas. Implement merge strategy for incremental pattern updates. Define TypeScript interfaces for all pattern types (naming, typing, testing, error handling, architecture). Store patterns in .sage/agent/examples/repository-patterns.ts as exportable TypeScript module.

**SMART Criteria:**
- **Specific:** Define 5 pattern category schemas, implement merge logic
- **Measurable:** All schemas validate with Zod, patterns exportable from .ts file
- **Achievable:** Standard Zod validation, clear data structures
- **Relevant:** Foundation for pattern extraction and progressive loading
- **Time-bound:** 4-6 hours

**Acceptance Criteria:**
- ✅ File `servers/sage-context-optimizer/schemas/repository-patterns.ts` created
- ✅ Interface `RepositoryPatterns` defined with naming, typing, testing, errorHandling, architecture
- ✅ Interface `NamingConventions` defined with functions, classes, constants, confidence
- ✅ Interface `TypePatterns` defined with unionSyntax, generics, confidence
- ✅ Interface `TestPatterns` defined with framework, fileNaming, fixtures, confidence
- ✅ Zod schemas created for all interfaces
- ✅ Function `mergePatterns(base, update)` implemented for incremental updates
- ✅ Function `savePatterns(patterns)` writes to `.sage/agent/examples/repository-patterns.ts`
- ✅ Function `loadPatterns()` reads from patterns file using dynamic import()
- ✅ Export format: `export const REPOSITORY_PATTERNS = { ... }`
- ✅ Validation: patterns file is valid TypeScript, importable

**Target Files:**
- `servers/sage-context-optimizer/schemas/repository-patterns.ts` (create)
- `servers/sage-context-optimizer/utils/pattern-storage.ts` (create)
- `.sage/agent/examples/repository-patterns.ts` (generated file)

**Dependencies:**
- CACHE-002 (Python extractor defines schema requirements)
- CACHE-003 (TypeScript extractor defines schema requirements)

**Blocks:**
- CACHE-005 (testing needs storage working)
- CACHE-011 (progressive loading needs patterns format)
- CACHE-018 (sage.init needs storage API)

**Testing Requirements:**
- Unit test: schema validation with valid patterns
- Unit test: schema validation rejects invalid patterns
- Unit test: mergePatterns combines base + update correctly
- Unit test: savePatterns creates valid TypeScript file
- Unit test: loadPatterns imports patterns successfully

**Implementation Notes:**
- Use `fs.writeFile()` to write TypeScript export
- Format output with proper indentation (2 spaces)
- Merge strategy: prefer higher confidence scores
- Include metadata: extractedAt timestamp, fileCount, overallConfidence

### CACHE-005: Pattern Extraction Testing & Validation

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 4-6 hours
**Sprint:** 1

**Description:**
Validate pattern extraction on 3+ real-world repositories (Python, TypeScript, hybrid). Manually review extracted patterns to confirm 80%+ capture rate. Create integration tests for end-to-end extraction flow. Benchmark performance on repositories with 1000+ files.

**SMART Criteria:**
- **Specific:** Test on 3 real repos, validate 80%+ capture, benchmark performance
- **Measurable:** Manual review counts patterns, performance timing measured
- **Achievable:** Real repositories available (Flask, Express, sage-dev itself)
- **Relevant:** Validates pattern extraction accuracy before release
- **Time-bound:** 4-6 hours

**Acceptance Criteria:**
- ✅ Test repository 1 (Python): Flask or Django, 80%+ patterns captured
- ✅ Test repository 2 (TypeScript): Express or NestJS, 80%+ patterns captured
- ✅ Test repository 3 (Hybrid): sage-dev itself, 80%+ patterns captured
- ✅ Manual review: extracted patterns match actual code conventions
- ✅ Performance benchmark: 1000+ files extracted in <2 minutes
- ✅ Confidence scores: majority of patterns have confidence ≥0.8
- ✅ Integration test: end-to-end extraction flow (directory → patterns file)
- ✅ Validation report created documenting capture rates and accuracy

**Target Files:**
- `tests/integration/pattern-extraction-flow.test.ts` (create)
- `docs/specs/context-optimization-caching/extraction-validation.md` (create report)

**Dependencies:**
- CACHE-002 (Python extractor)
- CACHE-003 (TypeScript extractor)
- CACHE-004 (pattern storage)

**Blocks:**
- CACHE-018 (sage.init integration needs validation complete)

**Testing Requirements:**
- Clone 3 test repositories to temporary directories
- Run extraction on each repository
- Compare extracted patterns with manual code review
- Measure extraction time with high-precision timer
- Document results in validation report

**Implementation Notes:**
- Use real-world popular repositories for testing
- Document any patterns that fail to extract
- Suggest improvements for pattern extraction algorithms

### CACHE-018: sage.init Pattern Extraction Integration

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 2-4 hours
**Sprint:** 1

**Description:**
Modify commands/sage.init.md to trigger pattern extraction after repository analysis. Display extraction summary with confidence scores. Handle cases where extraction fails gracefully (continue with default patterns).

**SMART Criteria:**
- **Specific:** Add pattern extraction step to sage.init command
- **Measurable:** Command displays "✓ Extracted N files" message
- **Achievable:** Existing command structure, clear insertion point
- **Relevant:** Automates pattern extraction on repository initialization
- **Time-bound:** 2-4 hours

**Acceptance Criteria:**
- ✅ File `commands/sage.init.md` modified to add pattern extraction step
- ✅ Step inserted after "Agent discovers repository structure"
- ✅ Pattern extraction called via MCP tool handler
- ✅ Extraction summary displayed: "✓ Extracted 247 files: naming (0.95), typing (0.92), testing (0.90)"
- ✅ Error handling: extraction failure logs warning, continues with defaults
- ✅ Incremental extraction: only re-extract changed files on subsequent runs
- ✅ Manual test: run `/sage.init` in test repository, verify patterns created
- ✅ Documentation: usage documented in sage.init command help

**Target Files:**
- `commands/sage.init.md` (modify - add pattern extraction step around lines 50-70)

**Dependencies:**
- CACHE-004 (pattern storage API)
- CACHE-005 (validation confirms extraction works)

**Blocks:**
- None (completes Sprint 1)

**Testing Requirements:**
- Manual test: run `/sage.init` in fresh repository
- Verify `.sage/agent/examples/repository-patterns.ts` created
- Verify patterns are valid and importable
- Test incremental extraction: modify file, re-run, verify only changed file parsed

**Implementation Notes:**
- Insert step between repository analysis and completion
- Use MCP tool call: `pattern_extract(rootDir)`
- Parse extraction summary from MCP response
- Display user-friendly message with confidence scores

---

## Sprint 2: Research Caching System (Phase 2.2)

**Goal:** Implement filesystem-based research caching with TTL and LRU eviction

**Duration:** Week 3, Days 4-5 (16-20 hours)

**Success Criteria:**
- Cache hit: <1s response time, <1K tokens
- TTL expiration working (30 days)
- Storage limit enforced (100MB) with LRU eviction
- sage.intel command integrated with caching

### CACHE-006: Cache Manager Implementation

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 6-8 hours
**Sprint:** 2

**Description:**
Implement core cache manager with operations: get, set, invalidate, clear, stats, cleanup. Enforce 30-day TTL with expiration checking. Validate all cache entries with Zod schemas. Display cache age in human-readable format. Implement atomic write operations to prevent corruption.

**SMART Criteria:**
- **Specific:** Implement 6 cache operations with TTL and validation
- **Measurable:** All operations functional, Zod validation on all reads
- **Achievable:** Filesystem operations straightforward, Zod from Phase 1
- **Relevant:** Core caching functionality for 96% token reduction
- **Time-bound:** 6-8 hours

**Acceptance Criteria:**
- ✅ File `servers/sage-research/cache-manager.ts` created
- ✅ Function `get(topic)` returns CacheEntry or null
- ✅ Function `set(topic, findings, metadata)` stores cache entry
- ✅ Function `has(topic)` checks cache existence
- ✅ Function `invalidate(topic)` removes specific entry
- ✅ Function `clear()` removes all cache entries
- ✅ Function `stats()` returns CacheStats (totalEntries, totalSize, hitRate)
- ✅ Function `cleanup()` removes expired entries (>30 days)
- ✅ TTL calculation: expiresAt = timestamp + 30 days
- ✅ Age display: "Cached 2 hours ago", "Cached 3 days ago"
- ✅ Zod validation: all cache reads validated with CacheEntrySchema
- ✅ Atomic writes: write to temp file, then rename
- ✅ Error handling: corrupted files auto-deleted, log error

**Target Files:**
- `servers/sage-research/cache-manager.ts` (create)
- `servers/sage-research/schemas/cache-entry.ts` (create)
- `servers/sage-research/utils/cache-helpers.ts` (create)

**Dependencies:**
- CACHE-019 (directory structure)
- CACHE-021 (unit tests prepared)

**Blocks:**
- CACHE-007 (storage management needs cache manager)
- CACHE-008 (manifest needs cache manager)
- CACHE-009 (sage.intel integration needs cache manager)

**Testing Requirements:**
- Use unit tests from CACHE-021
- Test all 6 operations (get, set, has, invalidate, clear, stats)
- Test TTL expiration (mock date/time)
- Test Zod validation with invalid data
- Test atomic write operations
- Test corrupted file recovery

**Implementation Notes:**
- Cache directory: `.sage/agent/research/`
- File naming: `[topic-slug].json`
- Topic sanitization: alphanumeric + hyphens only
- Use `fs.promises.writeFile()` with temp file + rename pattern
- TTL: 30 days (configurable via .sage/config.json)

### CACHE-008: Cache Manifest & Tracking

**Type:** Story
**Priority:** P1 (High)
**Effort:** 2-4 hours
**Sprint:** 2

**Description:**
Create cache manifest (CACHE_MANIFEST.json) to track all cache entries with metadata: topic, file, size, createdAt, lastAccessed, accessCount. Update manifest on every cache operation. Use manifest for LRU eviction and statistics calculation.

**SMART Criteria:**
- **Specific:** Implement manifest creation, updates, and queries
- **Measurable:** Manifest updated on every cache operation
- **Achievable:** JSON file operations, simple data structure
- **Relevant:** Required for LRU eviction and cache statistics
- **Time-bound:** 2-4 hours

**Acceptance Criteria:**
- ✅ File `servers/sage-research/schemas/cache-manifest.ts` created with interface
- ✅ Manifest file: `.sage/agent/research/CACHE_MANIFEST.json`
- ✅ Manifest tracks: version, entries[], totalSize, lastCleanup
- ✅ Entry tracks: topic, file, size, createdAt, lastAccessed, accessCount
- ✅ Manifest updated on cache.set(): add new entry
- ✅ Manifest updated on cache.get(): increment accessCount, update lastAccessed
- ✅ Manifest updated on cache.invalidate(): remove entry
- ✅ Manifest updated on cache.clear(): empty entries array
- ✅ Function `loadManifest()` reads and validates manifest
- ✅ Function `saveManifest(manifest)` writes atomically
- ✅ Error handling: missing manifest creates new empty one

**Target Files:**
- `servers/sage-research/schemas/cache-manifest.ts` (create)
- `servers/sage-research/utils/manifest-manager.ts` (create)
- `.sage/agent/research/CACHE_MANIFEST.json` (generated)

**Dependencies:**
- CACHE-006 (cache manager operations)

**Blocks:**
- CACHE-007 (LRU eviction needs manifest)
- CACHE-009 (sage.intel displays cache stats from manifest)

**Testing Requirements:**
- Unit test: manifest creation on first cache operation
- Unit test: manifest updated correctly on each operation
- Unit test: corrupted manifest recovered (rebuild from filesystem)
- Unit test: manifest accessCount increments on cache hits

**Implementation Notes:**
- Load manifest lazily (on first cache access)
- Keep manifest in memory, persist on updates
- Atomic writes: temp file + rename
- Rebuild manifest if corrupted: scan `.sage/agent/research/` directory

### CACHE-007: Storage Management & LRU Eviction

**Type:** Story
**Priority:** P1 (High)
**Effort:** 4-6 hours
**Sprint:** 2

**Description:**
Implement storage limit enforcement (100MB) with LRU (Least Recently Used) eviction policy. Monitor disk usage, trigger eviction when limit reached. Log evicted entries. Warn users at 80MB threshold. Implement cleanup scheduling for expired entries.

**SMART Criteria:**
- **Specific:** Enforce 100MB limit with LRU eviction
- **Measurable:** Storage never exceeds 100MB, LRU eviction functional
- **Achievable:** Manifest provides LRU data, filesystem operations standard
- **Relevant:** Prevents unbounded cache growth
- **Time-bound:** 4-6 hours

**Acceptance Criteria:**
- ✅ File `servers/sage-research/cache-storage.ts` created
- ✅ Function `checkStorageLimit()` calculates total cache size
- ✅ Function `enforceStorageLimit()` triggers eviction if >100MB
- ✅ LRU eviction: sort entries by lastAccessed, remove oldest
- ✅ Eviction continues until cache size <90MB (buffer)
- ✅ Warning at 80MB: "Cache approaching storage limit (80MB/100MB)"
- ✅ Eviction logging: "Evicted 3 entries (12MB) to stay within limit"
- ✅ Function `getStorageStats()` returns current size and usage percentage
- ✅ Minimum retention: entries less than 1 day old never evicted
- ✅ Integration: checkStorageLimit() called after every cache.set()

**Target Files:**
- `servers/sage-research/cache-storage.ts` (create)
- `servers/sage-research/utils/storage-helpers.ts` (create)

**Dependencies:**
- CACHE-006 (cache manager)
- CACHE-008 (manifest provides LRU data)

**Blocks:**
- CACHE-009 (sage.intel integration needs storage management complete)

**Testing Requirements:**
- Unit test: storage limit calculation
- Unit test: LRU eviction removes oldest entries
- Unit test: eviction continues until <90MB
- Unit test: warning at 80MB threshold
- Integration test: fill cache to 110MB, verify eviction triggered

**Implementation Notes:**
- Storage limit: 100MB (configurable via .sage/config.json)
- Warning threshold: 80MB
- Eviction target: 90MB (10% buffer)
- Sort manifest entries by lastAccessed (ascending)
- Delete files and update manifest atomically

### CACHE-009: sage.intel Cache Integration

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 4-6 hours
**Sprint:** 2

**Description:**
Modify commands/sage.intel.md to check cache before performing research operations. Display cache status (hit/miss/expired). Support --no-cache flag to bypass cache. Store fresh research results in cache. Show cache age for hits ("Cached 2 hours ago").

**SMART Criteria:**
- **Specific:** Add cache check step to sage.intel command
- **Measurable:** Cache hit <1s, cache miss stores result
- **Achievable:** Existing command structure, clear integration point
- **Relevant:** Achieves 96% token reduction for research operations
- **Time-bound:** 4-6 hours

**Acceptance Criteria:**
- ✅ File `commands/sage.intel.md` modified to add cache check step
- ✅ Cache check inserted before "Research operations" section
- ✅ Cache hit: displays "✓ Cache hit: rag-frameworks-2025 (cached 2 hours ago)"
- ✅ Cache hit: loads findings in <1s, uses <1K tokens
- ✅ Cache miss: displays "Cache miss: fetching fresh research..."
- ✅ Cache miss: performs research, stores result in cache
- ✅ Cache expired: displays "Cache expired (cached 32 days ago): fetching fresh..."
- ✅ Flag `--no-cache`: bypasses cache check, forces fresh fetch
- ✅ Storage check: warnings displayed if cache approaching limit
- ✅ Manual test: run `/sage.intel "topic"` twice, verify cache hit on second run

**Target Files:**
- `commands/sage.intel.md` (modify - add cache check around lines 30-45)

**Dependencies:**
- CACHE-006 (cache manager)
- CACHE-007 (storage management)
- CACHE-008 (manifest for stats)

**Blocks:**
- None (completes Sprint 2)

**Testing Requirements:**
- Manual test: cache miss on first query
- Manual test: cache hit on second identical query
- Manual test: --no-cache bypasses cache
- Manual test: cache expiration after 30 days (mock date)
- Integration test: end-to-end research caching flow

**Implementation Notes:**
- Insert cache check before research operations
- Generate cache key from research topic (sanitize to slug)
- Use MCP tool call: `research_cache_get(topic)`
- If cache hit: return cached findings
- If cache miss: perform research, call `research_cache_set(topic, findings)`

### CACHE-022: Pattern Extractor Unit Tests

**Type:** Story
**Priority:** P1 (High)
**Effort:** 3-4 hours
**Sprint:** 2

**Description:**
Create comprehensive unit test suite for pattern extraction (Python and TypeScript). Test naming convention detection, type pattern extraction, confidence scoring, and error handling. Achieve 80%+ test coverage.

**SMART Criteria:**
- **Specific:** Write 20+ unit tests for pattern extractors
- **Measurable:** 80%+ coverage, all pattern categories tested
- **Achievable:** Standard Vitest testing, clear extraction logic
- **Relevant:** Validates pattern extraction reliability
- **Time-bound:** 3-4 hours

**Acceptance Criteria:**
- ✅ File `tests/pattern-extractor.test.ts` created
- ✅ Test: Python naming conventions (snake_case, PascalCase)
- ✅ Test: Python type patterns (pipe unions, builtin generics)
- ✅ Test: Python testing patterns (pytest, unittest)
- ✅ Test: TypeScript naming conventions (camelCase, PascalCase)
- ✅ Test: TypeScript type patterns (union syntax, generics)
- ✅ Test: Confidence scoring algorithm (high/medium/low)
- ✅ Test: File hash tracking for incremental extraction
- ✅ Test: Error handling (parsing error skips file)
- ✅ Test: Performance (1000 files in <2min)
- ✅ Test coverage: 80%+ for pattern extractors
- ✅ All tests passing with `npm test`

**Target Files:**
- `tests/pattern-extractor.test.ts` (create)

**Dependencies:**
- CACHE-002 (Python extractor)
- CACHE-003 (TypeScript extractor)

**Blocks:**
- None (tests validate existing implementation)

**Testing Requirements:**
- Use Vitest framework
- Create test files with known patterns
- Mock filesystem for controlled test data
- Test both success and error paths

**Implementation Notes:**
- Create sample Python/TypeScript files with known patterns
- Test confidence scoring with various consistency levels
- Test incremental extraction with file hash changes

---

## Sprint 3: Progressive Loading (Phase 2.3)

**Goal:** Implement context-aware pattern filtering to achieve 90%+ reduction

**Duration:** Week 4, Days 1-3 (16-20 hours)

**Success Criteria:**
- Progressive loading reduces patterns by 90%+
- Filtering overhead <50ms
- Specification token usage ≤20K (77% reduction)
- sage.specify command integrated with progressive loading

### CACHE-011: Context Detection & Mappings

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 4-6 hours
**Sprint:** 3

**Description:**
Create explicit mappings between file types, features, domains and relevant patterns. Implement context detection heuristics to infer context from file paths and directories. Define filtering rules for three levels: file type (mandatory), feature (context-specific), domain (optional).

**SMART Criteria:**
- **Specific:** Create 3 mapping files, implement context detection heuristics
- **Measurable:** Context detected correctly for common file path patterns
- **Achievable:** Simple mapping tables and regex-based detection
- **Relevant:** Foundation for progressive loading filtering
- **Time-bound:** 4-6 hours

**Acceptance Criteria:**
- ✅ File `servers/sage-context-optimizer/mappings/file-type-patterns.ts` created
- ✅ Mapping: python → [python naming, python typing, python testing]
- ✅ Mapping: typescript → [typescript naming, typescript typing, typescript testing]
- ✅ Mapping: javascript → [javascript naming]
- ✅ File `servers/sage-context-optimizer/mappings/feature-patterns.ts` created
- ✅ Mapping: auth → [security patterns, authentication patterns]
- ✅ Mapping: api → [REST patterns, validation patterns]
- ✅ Mapping: ui → [React patterns, CSS patterns]
- ✅ File `servers/sage-context-optimizer/utils/context-detector.ts` created
- ✅ Function `detectFileType(filePath)` returns python/typescript/javascript
- ✅ Function `detectFeature(filePath)` returns auth/api/ui/data
- ✅ Function `detectDomain(filePath)` returns frontend/backend/infra
- ✅ Detection rules: .py → python, .ts/.tsx → typescript, .js → javascript
- ✅ Detection rules: auth/ directory → auth, api/ → api, ui/ → ui
- ✅ Detection rules: src/ → backend, frontend/ → frontend, infra/ → infra

**Target Files:**
- `servers/sage-context-optimizer/mappings/file-type-patterns.ts` (create)
- `servers/sage-context-optimizer/mappings/feature-patterns.ts` (create)
- `servers/sage-context-optimizer/utils/context-detector.ts` (create)
- `servers/sage-context-optimizer/schemas/task-context.ts` (create)

**Dependencies:**
- CACHE-004 (pattern storage format must be defined)
- Sprint 1 complete (patterns must exist)

**Blocks:**
- CACHE-010 (progressive loader needs mappings)
- CACHE-012 (sage.specify needs context detection)

**Testing Requirements:**
- Unit test: file type detection for various extensions
- Unit test: feature detection from directory names
- Unit test: domain detection from file paths
- Unit test: edge cases (unknown file types, missing context)

**Implementation Notes:**
- Use path module for file path parsing
- Regex patterns for directory detection
- Fallback rules for unclear context

### CACHE-010: Progressive Loader Implementation

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 6-8 hours
**Sprint:** 3

**Description:**
Implement progressive loader with context-based filtering logic. Filter patterns by file type (Level 1), feature (Level 2), domain (Level 3). Use dynamic import() for on-demand pattern loading. Cache loaded patterns for session duration. Achieve 90%+ reduction in loaded patterns.

**SMART Criteria:**
- **Specific:** Implement 3-level filtering with session caching
- **Measurable:** 90%+ reduction, <50ms filtering overhead
- **Achievable:** Simple filtering logic, ES6 dynamic import() native
- **Relevant:** Achieves 77% token reduction for specifications
- **Time-bound:** 6-8 hours

**Acceptance Criteria:**
- ✅ File `servers/sage-context-optimizer/progressive-loader.ts` created
- ✅ Function `loadForContext(context)` returns filtered patterns
- ✅ Level 1 filtering: file type (python/typescript/javascript)
- ✅ Level 2 filtering: feature (auth/api/ui/data)
- ✅ Level 3 filtering: domain (frontend/backend/infra)
- ✅ Pattern reduction: 90%+ of patterns filtered out
- ✅ Filtering performance: <50ms overhead
- ✅ Session cache: loaded patterns cached with key `${fileType}-${feature}-${domain}`
- ✅ Dynamic import: patterns loaded on-demand with ES6 import()
- ✅ Fallback: load all Python + TypeScript patterns if context unclear
- ✅ Logging: "Loaded 15 patterns (90% reduction from 150 total)"

**Target Files:**
- `servers/sage-context-optimizer/progressive-loader.ts` (create)
- `servers/sage-context-optimizer/utils/pattern-filter.ts` (create)

**Dependencies:**
- CACHE-011 (mappings and context detection)

**Blocks:**
- CACHE-012 (sage.specify integration)
- CACHE-013 (testing needs loader working)

**Testing Requirements:**
- Unit test: file type filtering
- Unit test: feature filtering
- Unit test: domain filtering
- Unit test: session cache hits
- Unit test: 90%+ reduction validation
- Performance test: filtering overhead <50ms

**Implementation Notes:**
- Use ES6 dynamic import() for patterns
- Session cache: in-memory Map<string, Patterns>
- Filtering: simple object property selection
- Fallback: if context detection fails, load python + typescript patterns

### CACHE-012: sage.specify Progressive Loading Integration

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 4-6 hours
**Sprint:** 3

**Description:**
Modify commands/sage.specify.md to use progressive loading before specification generation. Detect context from component name and file paths. Load only relevant patterns. Combine with cached research from Phase 2.2. Measure token reduction (target 77%).

**SMART Criteria:**
- **Specific:** Add progressive loading step to sage.specify command
- **Measurable:** Token usage ≤20K (77% reduction from 80K baseline)
- **Achievable:** Existing command structure, clear integration point
- **Relevant:** Achieves specification token reduction goal
- **Time-bound:** 4-6 hours

**Acceptance Criteria:**
- ✅ File `commands/sage.specify.md` modified to add progressive loading step
- ✅ Context detection: infer fileType, feature, domain from component name
- ✅ Progressive loading called via MCP tool: `pattern_load_for_context(context)`
- ✅ Cached research loaded via MCP tool: `research_cache_get(topic)`
- ✅ Token reduction: specification uses ≤20K tokens (77% reduction from 80K)
- ✅ Logging: "Using cached research (96% token reduction)"
- ✅ Logging: "Loaded 15 patterns (90% reduction)"
- ✅ Manual test: run `/sage.specify auth-service`, verify token usage
- ✅ Integration: works with both cache hit and cache miss scenarios

**Target Files:**
- `commands/sage.specify.md` (modify - add progressive loading around lines 40-60)

**Dependencies:**
- CACHE-010 (progressive loader)
- CACHE-009 (research cache integration from Sprint 2)

**Blocks:**
- None (completes core Sprint 3 functionality)

**Testing Requirements:**
- Manual test: run `/sage.specify` on test component
- Measure token usage with token counter
- Verify cache hit message displayed
- Verify progressive loading message displayed
- Integration test: end-to-end specification generation flow

**Implementation Notes:**
- Insert progressive loading before specification generation
- Detect context from component name (e.g., "auth-service" → feature=auth)
- Call MCP tools in sequence: cache_get → pattern_load → specify
- Log token savings for user visibility

### CACHE-013: Progressive Loading Testing

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 2-4 hours
**Sprint:** 3

**Description:**
Create unit and integration tests for progressive loading. Validate 90%+ reduction in loaded patterns. Test context detection accuracy. Test session cache effectiveness. Measure filtering overhead (<50ms target).

**SMART Criteria:**
- **Specific:** Write 15+ tests for progressive loading
- **Measurable:** 90%+ reduction validated, <50ms overhead measured
- **Achievable:** Clear test scenarios, measurable metrics
- **Relevant:** Validates progressive loading effectiveness
- **Time-bound:** 2-4 hours

**Acceptance Criteria:**
- ✅ File `tests/progressive-loader.test.ts` created (if not from CACHE-023)
- ✅ Test: file type filtering reduces patterns correctly
- ✅ Test: feature filtering reduces patterns correctly
- ✅ Test: domain filtering reduces patterns correctly
- ✅ Test: 90%+ reduction achieved across test scenarios
- ✅ Test: filtering overhead <50ms (performance benchmark)
- ✅ Test: session cache hit after first load
- ✅ Test: context detection accuracy for common patterns
- ✅ Test: fallback behavior when context unclear
- ✅ Integration test: end-to-end specification with progressive loading
- ✅ All tests passing with `npm test`

**Target Files:**
- `tests/progressive-loader.test.ts` (create or extend from CACHE-023)
- `tests/integration/specification-flow.test.ts` (create)

**Dependencies:**
- CACHE-010 (progressive loader)
- CACHE-011 (context detection)
- CACHE-012 (sage.specify integration)

**Blocks:**
- None (validates Sprint 3)

**Testing Requirements:**
- Use Vitest framework
- Create test patterns with known sizes
- Measure filtering time with high-precision timer
- Test with various context combinations

**Implementation Notes:**
- Mock patterns with known pattern counts
- Calculate reduction percentage
- Use `performance.now()` for timing measurements

### CACHE-023: Progressive Loader Unit Tests

**Type:** Story
**Priority:** P1 (High)
**Effort:** 3-4 hours
**Sprint:** 3

**Description:**
Create comprehensive unit test suite for progressive loader filtering logic. Test each filtering level (file type, feature, domain) independently. Test session cache behavior. Test fallback scenarios. Achieve 85%+ test coverage.

**SMART Criteria:**
- **Specific:** Write 15+ unit tests for filtering logic
- **Measurable:** 85%+ coverage, all filtering levels tested
- **Achievable:** Standard Vitest testing, clear filtering logic
- **Relevant:** Validates progressive loading reliability
- **Time-bound:** 3-4 hours

**Acceptance Criteria:**
- ✅ File `tests/progressive-loader.test.ts` created
- ✅ Test: `filterByFileType()` returns only Python patterns
- ✅ Test: `filterByFileType()` returns only TypeScript patterns
- ✅ Test: `filterByFeature()` returns only auth patterns
- ✅ Test: `filterByFeature()` returns only api patterns
- ✅ Test: `filterByDomain()` returns only backend patterns
- ✅ Test: `loadForContext()` applies all 3 levels correctly
- ✅ Test: Session cache stores loaded patterns
- ✅ Test: Session cache returns cached patterns on second call
- ✅ Test: Fallback loads Python + TypeScript if context unclear
- ✅ Test: Filtering overhead <50ms (performance test)
- ✅ Test coverage: 85%+ for progressive-loader.ts
- ✅ All tests passing with `npm test`

**Target Files:**
- `tests/progressive-loader.test.ts` (create)

**Dependencies:**
- CACHE-010 (progressive loader implementation)

**Blocks:**
- CACHE-013 (integration testing can use these unit tests)

**Testing Requirements:**
- Use Vitest framework
- Mock pattern data with known structure
- Test each filtering function independently
- Test combined filtering logic

**Implementation Notes:**
- Create mock patterns with all categories
- Test reduction percentage calculation
- Use `vi.useFakeTimers()` if needed for cache testing

---

## Sprint 4: Integration & Validation (Phase 2.4)

**Goal:** Complete MCP server packaging, integration testing, performance validation, and documentation

**Duration:** Week 4, Days 4-5 (16-20 hours)

**Success Criteria:**
- All integration tests passing (≥90% coverage)
- Performance targets validated (research 96%, spec 77%)
- MCP servers discoverable and functional
- Documentation complete (CACHING.md, PATTERN_EXTRACTION.md, PROGRESSIVE_LOADING.md, PHASE_2_RESULTS.md)

### CACHE-014: MCP Server Packaging

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 4-6 hours
**Sprint:** 4

**Description:**
Create MCP server entry points with tool handlers for caching and pattern operations. Implement servers/sage-research/index.ts with tool handlers: research_cache_get, research_cache_set, research_cache_invalidate, research_cache_stats. Implement servers/sage-context-optimizer/index.ts with tool handlers: pattern_extract, pattern_load_for_context, pattern_validate. Register servers for filesystem discovery.

**SMART Criteria:**
- **Specific:** Create 2 MCP server entry points with 7 tool handlers
- **Measurable:** All tool handlers callable from commands
- **Achievable:** Phase 1 MCP infrastructure provides template
- **Relevant:** Enables command integration with caching and patterns
- **Time-bound:** 4-6 hours

**Acceptance Criteria:**
- ✅ File `servers/sage-research/index.ts` created
- ✅ Tool handler: `research_cache_get(topic)` returns CacheEntry or null
- ✅ Tool handler: `research_cache_set(topic, findings, metadata)` stores cache
- ✅ Tool handler: `research_cache_invalidate(topic)` removes entry
- ✅ Tool handler: `research_cache_stats()` returns CacheStats
- ✅ File `servers/sage-context-optimizer/index.ts` created
- ✅ Tool handler: `pattern_extract(rootDir, incremental?)` returns RepositoryPatterns
- ✅ Tool handler: `pattern_load_for_context(context)` returns RelevantPatterns
- ✅ Tool handler: `pattern_validate(patterns)` returns ValidationResult
- ✅ MCP servers discoverable via filesystem
- ✅ Manual test: call each tool handler from command prompt

**Target Files:**
- `servers/sage-research/index.ts` (create)
- `servers/sage-context-optimizer/index.ts` (create)

**Dependencies:**
- All previous sprints complete (implementations ready)

**Blocks:**
- CACHE-015 (integration tests need MCP servers)
- CACHE-016 (benchmarks need MCP servers)

**Testing Requirements:**
- Manual test: call each tool handler directly
- Verify tool handlers return expected data types
- Verify error handling (invalid inputs)
- Test MCP server registration and discovery

**Implementation Notes:**
- Follow Phase 1 MCP server pattern from sage-enforcement
- Use Zod for input validation
- Return structured responses with status codes
- Log all tool handler calls for debugging

### CACHE-015: Integration Test Suite

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 4-6 hours
**Sprint:** 4

**Description:**
Create comprehensive integration test suite covering end-to-end flows: repository initialization with pattern extraction, research operations with caching (miss then hit), specification generation with progressive loading and cached research. Achieve 90%+ integration test coverage.

**SMART Criteria:**
- **Specific:** Write 3 integration test files covering all end-to-end flows
- **Measurable:** 90%+ integration coverage, all flows tested
- **Achievable:** All components implemented, clear integration points
- **Relevant:** Validates system works end-to-end
- **Time-bound:** 4-6 hours

**Acceptance Criteria:**
- ✅ File `tests/integration/caching-flow.test.ts` created
- ✅ Test: research cache miss → fetch → store → cache hit on retry
- ✅ Test: cache expiration after 30 days (mocked)
- ✅ Test: storage limit triggers LRU eviction
- ✅ Test: --no-cache flag bypasses cache
- ✅ File `tests/integration/pattern-extraction-flow.test.ts` created
- ✅ Test: /sage.init triggers extraction → patterns stored → file created
- ✅ Test: incremental extraction only re-extracts changed files
- ✅ Test: extraction works on Python, TypeScript, hybrid repositories
- ✅ File `tests/integration/specification-flow.test.ts` created
- ✅ Test: /sage.specify → progressive loading → cached research → spec generation
- ✅ Test: token reduction measured (77% target)
- ✅ Test: works with both cache hit and miss scenarios
- ✅ Test coverage: 90%+ integration coverage
- ✅ All tests passing with `npm test`

**Target Files:**
- `tests/integration/caching-flow.test.ts` (create)
- `tests/integration/pattern-extraction-flow.test.ts` (create)
- `tests/integration/specification-flow.test.ts` (create)

**Dependencies:**
- CACHE-014 (MCP servers must be functional)

**Blocks:**
- CACHE-016 (benchmarks build on integration tests)

**Testing Requirements:**
- Use Vitest framework
- Create temporary test directories for isolation
- Mock time for TTL expiration testing
- Measure token usage for validation

**Implementation Notes:**
- Use real filesystem operations (not mocks) for integration testing
- Clean up test directories after each test
- Use actual MCP tool handlers for realistic testing

### CACHE-016: Performance Benchmarking & Validation

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 4-6 hours
**Sprint:** 4

**Description:**
Measure token usage at each operation (research, specification) and validate against targets. Benchmark cache hit rate over multiple sessions. Time pattern extraction on various repository sizes. Validate progressive loading reduction percentage. Document all metrics in validation report.

**SMART Criteria:**
- **Specific:** Measure 8 key metrics and validate against targets
- **Measurable:** Research 96% reduction, Spec 77% reduction, cache hit rate >80%
- **Achievable:** All operations functional, token counters available
- **Relevant:** Validates system achieves performance goals
- **Time-bound:** 4-6 hours

**Acceptance Criteria:**
- ✅ Metric: Research token usage (first run) ≤8K tokens (96% reduction from 180K)
- ✅ Metric: Research token usage (cache hit) <1K tokens (99.4% reduction)
- ✅ Metric: Specification token usage ≤20K tokens (77% reduction from 80K)
- ✅ Metric: Cache hit response time <1 second
- ✅ Metric: Cache hit rate >80% after initial usage (10+ queries)
- ✅ Metric: Pattern extraction time <2 minutes for 1000+ files
- ✅ Metric: Progressive loading reduction ≥90%
- ✅ Metric: Progressive loading overhead <50ms
- ✅ Validation report created: `docs/specs/context-optimization-caching/performance-validation.md`
- ✅ All targets met or documented with mitigation plan

**Target Files:**
- `docs/specs/context-optimization-caching/performance-validation.md` (create)
- `tests/benchmarks/token-usage.test.ts` (create)
- `tests/benchmarks/performance.test.ts` (create)

**Dependencies:**
- CACHE-015 (integration tests provide baseline)

**Blocks:**
- CACHE-017 (documentation needs metrics)

**Testing Requirements:**
- Measure token usage with token counter library
- Use high-precision timers for response time
- Test on real repositories of various sizes
- Run benchmarks multiple times for statistical validity

**Implementation Notes:**
- Create token counter utility
- Log all measurements to CSV for analysis
- Compare baseline vs optimized measurements
- Document any metrics that don't meet targets with reasons

### CACHE-017: Documentation & User Guides

**Type:** Story
**Priority:** P0 (Critical)
**Effort:** 4-6 hours
**Sprint:** 4

**Description:**
Create comprehensive user-facing documentation explaining the caching system, pattern extraction process, and progressive loading. Document cache TTL, manual invalidation, storage limits. Create PHASE_2_RESULTS.md with metrics validation and benchmarks.

**SMART Criteria:**
- **Specific:** Create 4 documentation files with user guides
- **Measurable:** All features documented, examples provided
- **Achievable:** Clear system design, established patterns to document
- **Relevant:** Enables users to understand and use Phase 2 features
- **Time-bound:** 4-6 hours

**Acceptance Criteria:**
- ✅ File `docs/CACHING.md` created
- ✅ Explains cache system, TTL (30 days), manual invalidation (--no-cache)
- ✅ Documents cache directory location, file format, storage limits
- ✅ Provides examples: cache hit, cache miss, cache expiration
- ✅ File `docs/PATTERN_EXTRACTION.md` created
- ✅ Explains extraction process, AST parsing, confidence scoring
- ✅ Documents pattern categories, format, storage location
- ✅ Provides examples: extraction output, incremental updates
- ✅ File `docs/PROGRESSIVE_LOADING.md` created
- ✅ Explains filtering logic, context detection, session caching
- ✅ Documents 3-level filtering (file type, feature, domain)
- ✅ Provides examples: pattern reduction, fallback behavior
- ✅ File `docs/PHASE_2_RESULTS.md` created
- ✅ Documents all metrics: token reduction, cache hit rate, performance
- ✅ Includes benchmark results from CACHE-016
- ✅ Provides before/after comparisons

**Target Files:**
- `docs/CACHING.md` (create)
- `docs/PATTERN_EXTRACTION.md` (create)
- `docs/PROGRESSIVE_LOADING.md` (create)
- `docs/PHASE_2_RESULTS.md` (create)

**Dependencies:**
- CACHE-016 (metrics for PHASE_2_RESULTS.md)
- All implementations complete (to document accurately)

**Blocks:**
- None (final documentation)

**Testing Requirements:**
- Review documentation for clarity and accuracy
- Verify all examples are executable
- Validate metrics in PHASE_2_RESULTS.md

**Implementation Notes:**
- Use clear, concise language
- Provide code examples with expected outputs
- Include troubleshooting sections
- Link to related documentation

### CACHE-020: EXECUTION_RULES.md Updates

**Type:** Story
**Priority:** P1 (High)
**Effort:** 2-3 hours
**Sprint:** 4

**Description:**
Update .sage/EXECUTION_RULES.md to include caching rules, pattern usage guidelines, and progressive loading best practices. Document when to use cache, when to bypass, how to interpret confidence scores, and context detection rules.

**SMART Criteria:**
- **Specific:** Add 3 sections to EXECUTION_RULES.md
- **Measurable:** All Phase 2 features covered in execution rules
- **Achievable:** Clear system design to document
- **Relevant:** Guides agent behavior for caching and patterns
- **Time-bound:** 2-3 hours

**Acceptance Criteria:**
- ✅ File `.sage/EXECUTION_RULES.md` modified
- ✅ Section added: "Caching Rules" with cache usage guidelines
- ✅ Rule: always check cache before research operations
- ✅ Rule: respect --no-cache flag when present
- ✅ Rule: display cache age for transparency
- ✅ Section added: "Pattern Usage Guidelines" with confidence interpretation
- ✅ Rule: use high-confidence patterns (≥0.8) without validation
- ✅ Rule: warn user about low-confidence patterns (<0.6)
- ✅ Rule: re-extract patterns if repository structure changes significantly
- ✅ Section added: "Progressive Loading Best Practices"
- ✅ Rule: always infer context before loading patterns
- ✅ Rule: log pattern reduction for user visibility
- ✅ Rule: use fallback (Python + TypeScript) if context unclear

**Target Files:**
- `.sage/EXECUTION_RULES.md` (modify)

**Dependencies:**
- All implementations complete (to document rules accurately)

**Blocks:**
- None (updates existing documentation)

**Testing Requirements:**
- Review rules for completeness
- Ensure rules are actionable and clear
- Validate rules against implementation

**Implementation Notes:**
- Follow existing EXECUTION_RULES.md format
- Use clear imperative language ("always", "never", "must")
- Provide examples for each rule

---

## Appendix

### A. Ticket Dependencies Graph

```
CACHE-019 (Infrastructure)
    ├─→ CACHE-002 (Python Extractor)
    ├─→ CACHE-003 (TypeScript Extractor)
    ├─→ CACHE-021 (Cache Tests - preparation)
    │
CACHE-002 + CACHE-003
    └─→ CACHE-004 (Pattern Storage)
            ├─→ CACHE-005 (Pattern Testing)
            └─→ CACHE-018 (sage.init Integration)

CACHE-021 (Cache Tests)
    └─→ CACHE-006 (Cache Manager)
            ├─→ CACHE-007 (Storage Management)
            ├─→ CACHE-008 (Cache Manifest)
            │
CACHE-006 + CACHE-007 + CACHE-008
    └─→ CACHE-009 (sage.intel Integration)

CACHE-004 (Pattern Storage)
    └─→ CACHE-011 (Context Mappings)
            └─→ CACHE-010 (Progressive Loader)
                    ├─→ CACHE-012 (sage.specify Integration)
                    ├─→ CACHE-013 (Progressive Testing)
                    └─→ CACHE-023 (Loader Tests)

All Previous Sprints
    └─→ CACHE-014 (MCP Packaging)
            └─→ CACHE-015 (Integration Tests)
                    └─→ CACHE-016 (Benchmarks)
                            └─→ CACHE-017 (Documentation)
                                    └─→ CACHE-020 (EXECUTION_RULES)

CACHE-022 (Pattern Tests) - parallel with Sprint 2
```

### B. Effort Summary by Component

| Component | Tickets | Total Effort | % of Total |
|-----------|---------|--------------|------------|
| Pattern Extraction | 6 tickets | 29-42h | 32% |
| Research Caching | 5 tickets | 22-32h | 25% |
| Progressive Loading | 5 tickets | 19-28h | 22% |
| Integration & Testing | 6 tickets | 20-30h | 21% |
| Infrastructure | 1 ticket | 2-4h | <1% |
| **Total** | **23 tickets** | **92-136h** | **100%** |

### C. Risk Mitigation Summary

| Risk | Affected Tickets | Mitigation |
|------|------------------|------------|
| Pattern extraction <80% accuracy | CACHE-002, CACHE-003, CACHE-005 | Confidence scoring, validation on 3+ repos, manual review option |
| Cache corruption | CACHE-006, CACHE-008 | Atomic writes, Zod validation, auto-recovery |
| Performance regression | CACHE-016 | Continuous benchmarking, alerts if targets not met, rollback plan |
| Context detection failures | CACHE-011, CACHE-012 | Explicit fallback (Python + TypeScript), logging, validation tests |
| ts-morph installation issues | CACHE-003, CACHE-019 | Documented troubleshooting, fallback to JavaScript parsing |

### D. Testing Coverage Summary

| Test Type | Target Coverage | Tickets |
|-----------|-----------------|---------|
| Unit Tests | 80%+ | CACHE-021, CACHE-022, CACHE-023 |
| Integration Tests | 90%+ | CACHE-005, CACHE-015 |
| Performance Tests | 100% of targets | CACHE-016 |
| Security Tests | Key scenarios | CACHE-006 (validation), CACHE-011 (path sanitization) |

---

**End of Task Breakdown**

**Next Steps:**
1. Review and approve task breakdown
2. Create story tickets CACHE-002 through CACHE-023 in .sage/tickets/index.json
3. Link all story tickets to parent epic CACHE-001
4. Begin Sprint 0: Execute CACHE-019 (Infrastructure Setup)
5. Proceed sequentially through sprints following dependency graph
