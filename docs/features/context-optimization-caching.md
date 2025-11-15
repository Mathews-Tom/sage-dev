# Context Optimization Caching

**Created:** 2025-11-13
**Status:** Draft
**Type:** Feature Request - Phase 2
**Phase:** 2 of 4
**Timeline:** 2 weeks (Weeks 3-4)
**Complexity:** Medium-High

---

## Feature Description

Implement intelligent caching and progressive loading systems to eliminate redundant research operations and extract repository patterns automatically, achieving 80-85% token reduction across all Sage-Dev operations.

### Problem Statement

Current inefficiencies in Sage-Dev workflows:

- **Research operations reload 180,000+ tokens** every time, even for identical queries
- **No pattern extraction**: Repository patterns not captured, leading to repetitive analysis
- **No caching mechanism**: Market research, competitive analysis, best practices fetched repeatedly
- **All patterns loaded**: Even when only 5-10% are relevant to current task

### Solution Overview

Build on Phase 1 MCP infrastructure to add:

- **Research caching system**: Cache findings in `.sage/agent/research/` with smart invalidation
- **Pattern extraction**: Automatically extract repository patterns during `/sage.init`
- **Progressive loading**: Load only patterns relevant to current feature/file type
- **Context compression**: Compress conversation state by ~30% through smart summarization

### Expected Impact

- **Token Reduction:** Research 180K → 8K (96%), Specification 80K → 18K (77%)
- **Average Reduction:** 80-85% across all operations
- **Performance:** Research 45s → 10s (4.5x faster), cache hits instant
- **Pattern Capture:** 80%+ of repository patterns extracted automatically
- **Foundation:** Enables Phase 3 skill evolution (requires pattern matching)

---

## User Stories & Use Cases

### User Story 1: Instant Research Cache Hits

**As a** developer researching a topic
**I want** identical research queries to return instantly from cache
**So that** I don't waste 45 seconds and 180,000 tokens on repeated queries

**Acceptance Criteria:**

- First research query: 180K tokens, 45 seconds (cache miss)
- Subsequent identical query: <1K tokens, <1 second (cache hit)
- Cache timestamp displayed with results
- Manual cache invalidation available

**Example Flow:**

```bash
# First query (cache miss)
/sage.intel "RAG frameworks 2025"
→ Fetches fresh research: 180K tokens, 45s
→ Caches to: .sage/agent/research/rag-frameworks-2025.json

# Second query (cache hit)
/sage.intel "RAG frameworks 2025"
→ Loads from cache: <1K tokens, <1s
→ Displays: "Cached on 2025-11-13, 2 hours ago"
```

### User Story 2: Automatic Pattern Extraction

**As a** developer initializing a new repository
**I want** Sage-Dev to automatically extract code patterns, naming conventions, and architectural patterns
**So that** subsequent operations use repository-specific context without manual configuration

**Acceptance Criteria:**

- `/sage.init` extracts 80%+ of repository patterns
- Patterns saved to `.sage/agent/examples/repository-patterns.ts`
- Patterns include: naming conventions, type patterns, testing patterns, error handling
- Extraction works for Python, TypeScript, JavaScript repositories

**Example Output:**

```typescript
// .sage/agent/examples/repository-patterns.ts
export const NAMING_CONVENTIONS = {
  functions: "snake_case",
  classes: "PascalCase",
  constants: "UPPER_SNAKE_CASE"
};

export const TYPE_PATTERNS = {
  unionSyntax: "pipe (str | int)",
  generics: "builtin (list[str], dict[str, Any])"
};

export const TESTING_PATTERNS = {
  framework: "pytest",
  fileNaming: "test_*.py",
  fixtures: "conftest.py"
};
```

### User Story 3: Progressive Pattern Loading

**As a** developer working on a specific feature
**I want** only relevant patterns loaded for my current task
**So that** I don't waste context on patterns for other languages/frameworks

**Acceptance Criteria:**

- Python file: Only Python patterns loaded
- React component: Only React/TypeScript patterns loaded
- API endpoint: Only API patterns loaded
- 90%+ reduction in loaded patterns

**Example:**

```typescript
// Working on src/auth/service.py
// Only load:
- Python patterns
- Authentication patterns
- Service layer patterns

// Don't load:
- React patterns
- CSS patterns
- Database migration patterns
```

### User Story 4: Smart Specification Generation

**As a** developer generating specifications
**I want** specification engine to use cached research and extracted patterns
**So that** specification generation uses 77% fewer tokens

**Acceptance Criteria:**

- Specification generation: 80K → 18K tokens (77% reduction)
- Uses cached research findings automatically
- References extracted repository patterns
- Progressive loading of only relevant standards

---

## Code Examples & Patterns

### Research Caching Implementation

```typescript
// servers/sage-research/cache-manager.ts
export async function getCachedResearch(topic: string): Promise<ResearchFindings | null> {
  const cacheFile = `.sage/agent/research/${topic}-findings.json`;

  if (!fs.existsSync(cacheFile)) {
    return null; // Cache miss
  }

  const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));

  // Check expiration (default: 30 days)
  const age = Date.now() - new Date(cache.timestamp).getTime();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

  if (age > maxAge) {
    console.log(`Cache expired (${Math.floor(age / (24 * 60 * 60 * 1000))} days old)`);
    return null; // Expired
  }

  console.log(`✓ Cache hit: ${topic} (cached ${formatAge(age)} ago)`);
  return cache.findings;
}

export async function cacheResearch(topic: string, findings: ResearchFindings): Promise<void> {
  const cacheFile = `.sage/agent/research/${topic}-findings.json`;

  fs.writeFileSync(cacheFile, JSON.stringify({
    topic,
    timestamp: new Date().toISOString(),
    findings
  }, null, 2));

  console.log(`✓ Cached research: ${topic}`);
}
```

### Pattern Extraction Implementation

```typescript
// servers/sage-context-optimizer/pattern-extractor.ts
export async function extractRepositoryPatterns(rootDir: string): Promise<RepositoryPatterns> {
  const patterns: RepositoryPatterns = {
    naming: {},
    typing: {},
    testing: {},
    errorHandling: {},
    architecture: {}
  };

  // Extract Python patterns
  const pythonFiles = glob.sync(`${rootDir}/**/*.py`, { ignore: ['**/node_modules/**', '**/.venv/**'] });
  patterns.naming.python = await extractNamingConventions(pythonFiles);
  patterns.typing.python = await extractTypePatterns(pythonFiles);
  patterns.testing.python = await extractTestPatterns(pythonFiles);

  // Extract TypeScript patterns
  const tsFiles = glob.sync(`${rootDir}/**/*.ts`, { ignore: ['**/node_modules/**'] });
  patterns.naming.typescript = await extractNamingConventions(tsFiles);
  patterns.typing.typescript = await extractTypePatterns(tsFiles);

  // Save to .sage/agent/examples/repository-patterns.ts
  const output = `
export const REPOSITORY_PATTERNS = ${JSON.stringify(patterns, null, 2)};
export default REPOSITORY_PATTERNS;
  `;

  fs.writeFileSync('.sage/agent/examples/repository-patterns.ts', output);
  console.log(`✓ Extracted patterns: ${Object.keys(patterns).length} categories`);

  return patterns;
}
```

### Progressive Loading Implementation

```typescript
// servers/sage-context-optimizer/progressive-loader.ts
export async function loadRelevantPatterns(context: TaskContext): Promise<Patterns> {
  const allPatterns = await import('.sage/agent/examples/repository-patterns');

  // Filter patterns based on context
  const relevant: Patterns = {};

  // Language-specific patterns
  if (context.fileType === 'python') {
    relevant.naming = allPatterns.naming.python;
    relevant.typing = allPatterns.typing.python;
    relevant.testing = allPatterns.testing.python;
  } else if (context.fileType === 'typescript') {
    relevant.naming = allPatterns.naming.typescript;
    relevant.typing = allPatterns.typing.typescript;
  }

  // Feature-specific patterns
  if (context.feature.includes('auth')) {
    relevant.security = allPatterns.security.authentication;
  }

  console.log(`✓ Loaded ${Object.keys(relevant).length} relevant pattern categories`);
  return relevant;
}
```

### Anthropic's Pattern Reference

> "When working with large datasets, agents can filter and transform results in code before returning them... The agent sees five rows instead of 10,000."

**Sage-Dev Application:**

```typescript
// Filter research in execution environment
const allFindings = await research.marketResearch(topic);  // 50KB in memory
const topFindings = allFindings
  .sort((a, b) => b.relevance - a.relevance)
  .slice(0, 5)  // Only top 5
  .map(f => ({ title: f.title, summary: f.summary }));

// Cache full for future
await cacheResearch(topic, allFindings);

// Log only summary (2KB to context)
console.log(JSON.stringify(topFindings, null, 2));

// Token reduction: 180,000 → 8,000 (96% savings)
```

---

## Documentation References

### Primary Reference

- **Anthropic Blog:** "Code Execution with MCP: Building More Efficient AI Agents"
  - URL: <https://www.anthropic.com/engineering/code-execution-with-mcp>
  - Section: "Context-Efficient Tool Results"
  - Quote: "agents can filter and transform results in code before returning them"

### Enhancement Plan Documents

- `.docs/code-execution-enhancement/sage-dev-enhancement-plan.md`
  - Part 3.3: Context-Efficient Result Processing (lines 311-350)
  - Part 4, Phase 2: Context Optimization (lines 456-501)
- `.docs/code-execution-enhancement/sage-dev-action-plan.md`
  - Week 3-4 tasks (lines 369-434)

### Technical Standards

- Cache invalidation strategies
- Pattern extraction algorithms (AST parsing)
- Progressive loading design patterns

---

## Technical Considerations

### Architecture Implications

**New Directory Structure:**

```
.sage/
├── agent/
│   ├── examples/
│   │   └── repository-patterns.ts    ← NEW: Extracted patterns
│   ├── research/
│   │   ├── rag-frameworks-2025.json  ← NEW: Cached research
│   │   ├── llm-benchmarks.json       ← NEW: Cached findings
│   │   └── CACHE_MANIFEST.json       ← NEW: Cache metadata
│   └── EXECUTION_RULES.md            (updated with caching rules)

servers/
├── sage-research/                     ← NEW: Research MCP server
│   ├── market-research.ts
│   ├── competitive-analysis.ts
│   ├── best-practices.ts
│   ├── cache-manager.ts               ← NEW: Cache operations
│   └── index.ts
├── sage-context-optimizer/            ← NEW: Optimization server
│   ├── pattern-extractor.ts
│   ├── progressive-loader.ts
│   ├── compressor.ts
│   └── index.ts
└── sage-specification/                ← NEW: Spec generation server
    ├── feature-extractor.ts
    ├── requirement-analyzer.ts
    └── index.ts
```

**Updated Commands:**

- `/sage.init` - Now extracts repository patterns
- `/sage.intel` - Now checks cache before fetching
- `/sage.specify` - Now uses progressive loading

### Performance Concerns

**Token Reduction Targets:**

```
Research Operations:
  Current: 180,000 tokens
  Target: 8,000 tokens (first run)
  Cache hit: <1,000 tokens
  Reduction: 96% (first), 99.4% (cache hit)

Specification Generation:
  Current: 80,000 tokens
  Target: 18,000 tokens
  Reduction: 77%

Overall Average:
  Current: 142,000 tokens
  Target: 32,000 tokens (first run)
  Target: 12,000 tokens (cache hits)
  Reduction: 77-92%
```

**Cache Performance:**

- **Cache miss:** 180K tokens, 45 seconds
- **Cache hit:** <1K tokens, <1 second
- **Cache size:** ~50KB per research topic
- **Storage limit:** 100MB (auto-cleanup oldest)

**Pattern Extraction Performance:**

- **Small repo (<100 files):** 10-15 seconds
- **Medium repo (100-1000 files):** 30-60 seconds
- **Large repo (>1000 files):** 1-2 minutes
- **Extraction accuracy:** 80%+ of patterns captured

### Security Requirements

**Cache Security:**

- Cache files stored locally in `.sage/` (gitignored)
- No sensitive data cached (PII, credentials)
- Cache invalidation: 30 days default, configurable
- Manual cache clear: `/sage.cache --clear`

**Pattern Extraction:**

- Only extract from tracked files (no .gitignore files)
- No extraction from secrets/, credentials/
- Pattern files reviewed before use
- Extraction runs in sandboxed environment

**Progressive Loading:**

- Validate pattern files before loading
- Schema validation for pattern structure
- Fallback to default patterns if corrupted

### Edge Cases & Gotchas

**Cache Invalidation Challenges:**

- **Problem:** Cached research becomes stale
- **Solution:** 30-day expiration, manual invalidation option
- **Detection:** Display cache age with results

**Pattern Extraction Accuracy:**

- **Problem:** Might miss unconventional patterns
- **Solution:** Confidence scores, manual review option
- **Fallback:** Default patterns if extraction fails

**Progressive Loading Confusion:**

- **Problem:** Agent might not recognize which patterns to load
- **Solution:** Explicit mapping: file type → pattern categories
- **Validation:** Test suite validates pattern loading logic

**Cache Corruption:**

- **Problem:** Cache file becomes corrupted
- **Solution:** JSON schema validation, fallback to fresh fetch
- **Recovery:** Auto-delete corrupted cache, log error

**Storage Limits:**

- **Problem:** Research cache grows unbounded
- **Solution:** 100MB limit, auto-cleanup oldest entries
- **Monitoring:** Log cache size, warn at 80MB

---

## Success Criteria

### Phase 2 Complete (Week 4)

- [ ] **Pattern extraction system working:**
  - [ ] `/sage.init` extracts 80%+ of repository patterns
  - [ ] Patterns saved to `.sage/agent/examples/repository-patterns.ts`
  - [ ] Extraction tested on Python, TypeScript, JavaScript repos
  - [ ] Pattern categories: naming, typing, testing, error handling, architecture

- [ ] **Research caching implemented:**
  - [ ] Cache system in `.sage/agent/research/`
  - [ ] Cache hit detection working
  - [ ] Cache expiration (30 days default)
  - [ ] Manual invalidation available
  - [ ] Cache manifest tracking metadata

- [ ] **Progressive loading working:**
  - [ ] Only relevant patterns loaded per task
  - [ ] File type → pattern mapping correct
  - [ ] Feature type → pattern mapping correct
  - [ ] 90%+ reduction in loaded patterns

- [ ] **Token reduction achieved:**
  - [ ] Research: 180K → 8K (96% reduction)
  - [ ] Specification: 80K → 18K (77% reduction)
  - [ ] Overall average: 80-85% reduction
  - [ ] Cache hits: 99%+ reduction

- [ ] **MCP servers implemented:**
  - [ ] sage-research server with caching
  - [ ] sage-context-optimizer server
  - [ ] sage-specification server
  - [ ] All servers discoverable via filesystem

- [ ] **Documentation updated:**
  - [ ] CACHING.md explains cache system
  - [ ] PATTERN_EXTRACTION.md documents extraction
  - [ ] PHASE_2_RESULTS.md with metrics

### Metrics Validation

**Token Efficiency:**

- Research (first): 180,000 → 8,000 (96% reduction)
- Research (cache): 180,000 → <1,000 (99.4% reduction)
- Specification: 80,000 → 18,000 (77% reduction)
- Overall: 80-85% reduction across operations

**Pattern Extraction:**

- Capture rate: 80%+ of repository patterns
- Accuracy: 90%+ (validated against manual review)
- Coverage: All file types in repository

**Performance:**

- Research cache hit: <1 second
- Pattern extraction: <2 minutes for large repos
- Progressive loading: Instant (patterns pre-extracted)

---

## Dependencies

### Technical Dependencies

**Required:**

- Phase 1: MCP Server Infrastructure (must be complete)
- TypeScript 5.0+ (for pattern types)
- AST parsers: Python (ast module), TypeScript (ts-morph)
- JSON schema validation library

**Optional:**

- Disk usage monitoring
- Cache analytics dashboard

### Feature Dependencies

**Prerequisite:**

- [x] Phase 1: MCP Server Infrastructure complete
- [ ] `/sage.init` command functional
- [ ] `.sage/agent/` directory structure exists

**Blockers:**

- Phase 1 must be complete (uses MCP infrastructure)
- Filesystem discovery mechanism must work

**Enables:**

- Phase 3: Automatic Skill Evolution (requires pattern matching)
- Phase 4: Parallel Agent Orchestration (builds on caching)

---

## Timeline Estimate

**Complexity:** Medium-High

**Estimated Effort:** 80-120 hours

**Team Composition:**

- 1-2 senior engineers (caching systems, AST parsing)
- 1-2 junior engineers (implementation, testing)

**Weekly Breakdown:**

**Week 3:**

- Mon-Tue: Design cache system, pattern extraction algorithm (8 hours)
- Wed-Thu: Implement pattern extraction, test on real repos (12 hours)
- Fri: Implement research caching, cache manager (6 hours)

**Week 4:**

- Mon-Tue: Implement progressive loading, pattern filtering (8 hours)
- Wed-Thu: Create sage-research, sage-context-optimizer servers (10 hours)
- Fri: Integration testing, metrics validation (8 hours)
- Weekend: Documentation, Phase 2 results report (4 hours)

**Total:** 2 weeks (10 business days)

---

## Implementation Strategy

### Gradual Rollout

**Phase 2.1 (Week 3):**

- Implement pattern extraction first
- Test on 3+ real repositories
- Validate 80%+ capture rate

**Phase 2.2 (Week 3 continued):**

- Implement research caching
- Test cache hit/miss scenarios
- Validate 96% token reduction

**Phase 2.3 (Week 4):**

- Implement progressive loading
- Test pattern filtering logic
- Validate 77% reduction on specs

**Phase 2.4 (Week 4 continued):**

- Full integration testing
- Metrics validation
- Documentation

### Backward Compatibility

- Pattern extraction optional (works without it)
- Caching transparent (fallback to fresh fetch)
- Progressive loading graceful fallback (load all if filtering fails)
- No breaking changes to existing commands

### Testing Strategy

**Unit Tests:**

- Cache manager operations (get, set, invalidate, cleanup)
- Pattern extraction for each language
- Progressive loading logic

**Integration Tests:**

- End-to-end: `/sage.init` → pattern extraction → storage
- End-to-end: `/sage.intel` → cache miss → cache hit
- End-to-end: `/sage.specify` → progressive loading → spec generation

**Performance Benchmarking:**

- Pattern extraction on small/medium/large repos
- Cache hit vs miss performance
- Token usage measurement (before/after)

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Pattern extraction <80% accuracy | Medium | High | Manual review, confidence scores, fallback to defaults |
| Cache invalidation issues | Low | Medium | Timestamps, expiration rules, manual clear option |
| Storage limits exceeded | Low | Low | 100MB limit, auto-cleanup oldest, monitoring |
| Progressive loading confusion | Medium | Medium | Explicit file type mapping, validation tests |
| Cache corruption | Low | Medium | JSON schema validation, auto-delete corrupted, fallback |

---

## Next Steps

### Immediate Actions

1. **Research & Enhancement**

   ```bash
   /sage.intel
   ```

   Research caching strategies, AST parsing libraries, progressive loading patterns.
   Output: `docs/research/context-optimization-caching-intel.md`

2. **Specification Generation**

   ```bash
   /sage.specify
   ```

   Generate detailed specs for cache system, pattern extraction, progressive loading.
   Output: `docs/specs/context-optimization-caching/spec.md`

3. **Implementation Planning**

   ```bash
   /sage.plan
   ```

   Create week-by-week implementation plan with SMART tasks.
   Output: `docs/specs/context-optimization-caching/plan.md`

4. **Task Breakdown**

   ```bash
   /sage.tasks
   ```

   Generate granular tasks for team execution.
   Output: Tickets in `.sage/tickets/index.json`

5. **Implementation**

   ```bash
   /sage.implement
   ```

   Execute implementation following Ticket Clearance Methodology.

### Success Checkpoint

**After Phase 2 completion:**

- 80-85% token reduction validated across operations
- Pattern extraction captures 80%+ of repository patterns
- Research caching working (96% reduction)
- Progressive loading functional (77% reduction on specs)
- Team ready for Phase 3

**Proceed to:**

- Phase 3: Automatic Skill Evolution (feature request: `automatic-skill-evolution`)

---

## Related Files

- **Prerequisite:**
  - `docs/features/mcp-server-infrastructure.md` (Phase 1)

- **Enhancement Documents:**
  - `.docs/code-execution-enhancement/sage-dev-enhancement-plan.md`
  - `.docs/code-execution-enhancement/sage-dev-action-plan.md`

- **Research Output:** `docs/research/context-optimization-caching-intel.md`
- **Specifications:** `docs/specs/context-optimization-caching/spec.md`
- **Implementation Plan:** `docs/specs/context-optimization-caching/plan.md`
- **Tickets:** `.sage/tickets/index.json`

---

## Metrics Tracking

```json
{
  "phase": 2,
  "feature": "context-optimization-caching",
  "baseline": {
    "research_tokens": 180000,
    "specification_tokens": 80000,
    "pattern_extraction": "manual",
    "caching": "none"
  },
  "target": {
    "research_tokens_first": 8000,
    "research_tokens_cached": 1000,
    "specification_tokens": 18000,
    "pattern_extraction": "automatic (80%+)",
    "caching": "intelligent (30 day expiry)"
  },
  "improvement": {
    "research_reduction_first": "96%",
    "research_reduction_cached": "99.4%",
    "specification_reduction": "77%",
    "overall_reduction": "80-85%",
    "cache_hit_speedup": "45x faster"
  }
}
```

---

## Research Findings

**Research Date:** 2025-11-13
**Research Output:** docs/research/context-optimization-caching-intel.md

### Key Research Findings

1. **Compression Techniques Validated** - KVzip 3-4x compression, LLMLingua 20x compression, Acon 26-54% reduction
2. **AST Parsing Established** - Python ast module, ts-morph for TypeScript, Tree-sitter for multi-language
3. **Progressive Loading Standard** - React.lazy() reduces bundles 30-60%, dynamic import() proven pattern
4. **Caching Strategies** - Event-driven + TTL hybrid, AI-enhanced invalidation emerging in 2025
5. **Implementation Risk** - Medium overall (AST parsing complex, integration manageable with Phase 1 foundation)

### Recommended Next Steps

1. Generate specification: `/sage.specify context-optimization-caching`
2. Create implementation plan: `/sage.plan context-optimization-caching`
3. Break down tasks: `/sage.tasks context-optimization-caching`
4. Execute implementation: `/sage.implement [ticket-id]`

**Status:** Research complete - Ready for specification generation (/sage.specify)
**Priority:** High (foundational for Phase 3 skill evolution)
**Dependencies:** Phase 1 must be complete
**Strategic Alignment:** Anthropic Code Execution - Context Efficiency Pattern
