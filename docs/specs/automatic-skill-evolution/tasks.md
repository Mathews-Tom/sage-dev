# Tasks: Automatic Skill Evolution

**From:** `spec.md` + `plan.md`
**Timeline:** 2 weeks (Week 5-6), 2 sprints
**Team:** 3-4 engineers (2 backend, 1 full-stack, 1 QA)
**Created:** 2025-11-13

## Summary

- Total tasks: 34 story tickets
- Estimated effort: 133 story points (96 hours)
- Critical path duration: 10 days (2 weeks)
- Key risks: AST transformation complexity, 10x speedup validation, security scanning integration

## Phase Breakdown

### Phase 3.1: Skill Generation (Sprint 1, Week 5 Days 1-3, 28 SP)

**Goal:** Extract reusable core logic from successful implementations
**Deliverable:** Skills saved to ./skills/ with SKILL_META, registry updated

#### Tasks

**[SKILL-002] Python AST Extractor**

- **Description:** Implement Python AST extraction using built-in `ast` module. Parse implementation code, traverse AST, identify terminal nodes (actual logic vs boilerplate), extract function signatures, dependencies, and type annotations.
- **Acceptance:**
  - [ ] ast.parse() successfully parses Python implementations
  - [ ] Terminal node identification excludes test code, debug statements, comments
  - [ ] Extraction accuracy >90% validated on 5+ Python implementations
  - [ ] Extraction completes in <3 seconds for typical Python code
- **Effort:** 5 story points (4-5 hours)
- **Owner:** Backend Engineer (Python)
- **Dependencies:** None
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/ast-extractor.ts` (Python extraction functions)
- **Risk:** Medium - Terminal node identification is research-based pattern

**[SKILL-003] TypeScript AST Extractor**

- **Description:** Implement TypeScript AST extraction using `ts-morph` library. Parse TypeScript/JavaScript code, identify core logic, preserve type information, extract dependencies.
- **Acceptance:**
  - [ ] ts-morph successfully parses TypeScript implementations
  - [ ] Type-aware extraction preserves type annotations
  - [ ] Extraction accuracy >90% validated on 5+ TypeScript implementations
  - [ ] Extraction completes in <3 seconds for typical TypeScript code
- **Effort:** 5 story points (4-5 hours)
- **Owner:** Backend Engineer (TypeScript)
- **Dependencies:** None
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/ast-extractor.ts` (TypeScript extraction functions)
- **Risk:** Medium - ts-morph library complexity

**[SKILL-004] Metadata Builder**

- **Description:** Construct SKILL_META with version (1.0 initial), tags, dependencies, originalImplementation, approvalStatus (pending), timestamps.
- **Acceptance:**
  - [ ] SKILL_META includes all required fields (version, created, tags, dependencies, approvalStatus)
  - [ ] approvalStatus defaults to "pending" with notes
  - [ ] Tags extracted from implementation metadata
  - [ ] Dependencies parsed from package.json or imports
- **Effort:** 3 story points (3 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/metadata-builder.ts`

**[SKILL-005] Skill Generator Orchestrator**

- **Description:** Main generation logic - validate implementation success, call AST extractor, build metadata, save to ./skills/[name].ts with SKILL_META export, update registry.
- **Acceptance:**
  - [ ] Only generates skills from successful implementations (success && testsPass)
  - [ ] Calls appropriate AST extractor based on language
  - [ ] Creates properly formatted skill file with SKILL_META export
  - [ ] Saves to ./skills/[name].ts with correct structure
  - [ ] Updates SKILL_REGISTRY.json with new entry
  - [ ] Extraction completes in <5 seconds end-to-end
- **Effort:** 8 story points (6-8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILL-002, SKILL-003, SKILL-004
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/skill-generator.ts`

**[SKILL-006] Registry Operations**

- **Description:** Implement SKILL_REGISTRY.json update operations - add skill entry, update totalSkills/totalReuses/averageSuccessRate, calculate checksums (sha256).
- **Acceptance:**
  - [ ] Registry structure matches specification (skills array, totals, checksums)
  - [ ] Add operation creates entry with {name, path, metadata, checksum}
  - [ ] Checksums calculated correctly (sha256)
  - [ ] Atomic file operations (read-modify-write)
  - [ ] Registry operations complete in <100ms
- **Effort:** 5 story points (4-5 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/skill-generator.ts` (registry functions)

**[SKILL-007] Integration with sage.implement**

- **Description:** Add post-success prompt to sage.implement command - "Save as reusable skill? [Y/n]". Display estimated future savings, call skill-generator tool.
- **Acceptance:**
  - [ ] Prompt appears after successful implementation with tests passing
  - [ ] Default is Yes (user can decline)
  - [ ] Shows estimated savings: "Future implementations will be 10x faster"
  - [ ] Calls skill-generator tool on user approval
  - [ ] Displays confirmation: "Skill saved: [name] (v1.0, pending approval)"
- **Effort:** 2 story points (2 hours)
- **Owner:** Full-Stack Engineer
- **Dependencies:** SKILL-005
- **Priority:** P0 (Critical)
- **Target Files:** `commands/sage.implement.md` (lines ~300-400)

### Phase 3.2: Skill Discovery (Sprint 1, Week 5 Days 4-5, 17 SP)

**Goal:** Find matching skills before generating new implementations
**Deliverable:** Multi-factor similarity matching with >90% accuracy

#### Tasks

**[SKILL-008] Jaccard Similarity Algorithm**

- **Description:** Implement Jaccard similarity for tag overlap - intersection(tags) / union(tags). Apply 40% weight in combined score.
- **Acceptance:**
  - [ ] Jaccard formula correctly implemented (intersection/union)
  - [ ] Handles empty tag sets gracefully
  - [ ] Returns score between 0.0 and 1.0
  - [ ] Unit tests validate correctness on known inputs
- **Effort:** 2 story points (2 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/similarity-algorithms.ts`

**[SKILL-009] Levenshtein Distance Algorithm**

- **Description:** Implement Levenshtein edit distance for name similarity. Normalize: 1 - (distance / max(len(A), len(B))). Apply 30% weight.
- **Acceptance:**
  - [ ] Levenshtein distance correctly calculated (minimum edits)
  - [ ] Normalized to 0.0-1.0 range
  - [ ] Handles different string lengths correctly
  - [ ] Unit tests validate correctness on known inputs
- **Effort:** 2 story points (2 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/similarity-algorithms.ts`

**[SKILL-010] Cosine Similarity Algorithm**

- **Description:** Implement Cosine similarity for description matching using TF-IDF vectors. Apply 30% weight.
- **Acceptance:**
  - [ ] TF-IDF vectorization implemented correctly
  - [ ] Cosine of angle between vectors calculated
  - [ ] Returns score between 0.0 and 1.0
  - [ ] Unit tests validate correctness on known inputs
- **Effort:** 3 story points (3 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/similarity-algorithms.ts`
- **Risk:** Medium - TF-IDF implementation more complex than other algorithms

**[SKILL-011] Similarity Caching**

- **Description:** Implement cache for similarity scores using hash(feature spec + skill metadata) as key. Invalidate on skill updates.
- **Acceptance:**
  - [ ] Cache key generation (hash of feature + skill)
  - [ ] Cache hit reduces computation (measured performance improvement)
  - [ ] Cache invalidation on skill update
  - [ ] Cache reduces repeat discovery time by 80%
- **Effort:** 2 story points (2 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILL-008, SKILL-009, SKILL-010
- **Priority:** P1 (High)
- **Target Files:** `servers/sage-planning/similarity-algorithms.ts`

**[SKILL-012] Skill Discovery Orchestrator**

- **Description:** Scan ./skills/ directory, load SKILL_META, calculate combined similarity score (Jaccard 40% + Levenshtein 30% + Cosine 30%), filter by threshold (>70%), rank by similarity, return top N matches.
- **Acceptance:**
  - [ ] Scans ./skills/ and loads all skill files
  - [ ] Calculates combined similarity score correctly
  - [ ] Filters matches by >70% threshold
  - [ ] Ranks results by similarity descending
  - [ ] Returns top 5 matches by default
  - [ ] Discovery completes in <500ms for <50 skills
  - [ ] Similarity accuracy >90% true positives on test set
- **Effort:** 5 story points (4-5 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILL-008, SKILL-009, SKILL-010, SKILL-011
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/skill-discovery.ts`

**[SKILL-013] Integration with sage.plan**

- **Description:** Add skill-first workflow to sage.plan - call discovery before planning, display top 3 matches, prompt for approval if 70-85%, auto-suggest if >85%, fallback to from-scratch if <70%.
- **Acceptance:**
  - [ ] Discovery runs before planning
  - [ ] Top 3 matches displayed with similarity percentages and metadata
  - [ ] >85% similarity: Auto-suggest with user confirmation
  - [ ] 70-85% similarity: Prompt user for approval
  - [ ] <70% similarity: Proceed with from-scratch planning
  - [ ] User can override and force from-scratch
- **Effort:** 3 story points (3 hours)
- **Owner:** Full-Stack Engineer
- **Dependencies:** SKILL-012
- **Priority:** P0 (Critical)
- **Target Files:** `commands/sage.plan.md` (lines ~100-200)

### Phase 3.3: Skill Adaptation (Sprint 2, Week 6 Days 1-2, 30 SP)

**Goal:** Modify existing skills to match new requirements (delivers 10x speedup)
**Deliverable:** AST-based adaptation with 100% correctness

#### Tasks

**[SKILL-014] TypeScript AST Transformer**

- **Description:** Implement jscodeshift integration for JS/TS transformations. Parse → Traverse → Modify nodes (parameter names, API endpoints, config values) → Regenerate code.
- **Acceptance:**
  - [ ] jscodeshift successfully transforms TypeScript code
  - [ ] Parameter renaming works (userId → customerId)
  - [ ] API endpoint updates work (/api/users → /api/customers)
  - [ ] Config value changes work (port 3000 → 8080)
  - [ ] Code structure and formatting preserved
  - [ ] Type safety maintained after transformation
- **Effort:** 8 story points (6-8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/ast-transformer.ts` (TypeScript functions)
- **Risk:** High - jscodeshift library complexity, needs prototyping

**[SKILL-015] Python AST Transformer**

- **Description:** Implement Python ast tree rewriting for transformations. Use ast.NodeTransformer for modifications, ast.unparse() for code generation.
- **Acceptance:**
  - [ ] ast tree rewriting works correctly
  - [ ] Parameter renaming works
  - [ ] String literal updates work (endpoints, config)
  - [ ] Code structure preserved
  - [ ] Type annotations preserved
- **Effort:** 5 story points (4-5 hours)
- **Owner:** Backend Engineer (Python)
- **Dependencies:** None
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/ast-transformer.ts` (Python functions)

**[SKILL-016] Adaptation Point Identifier**

- **Description:** Analyze feature spec vs skill code to identify what needs to change. Detect parameter names, API endpoints, config values, validation rules that differ.
- **Acceptance:**
  - [ ] Identifies parameter name differences
  - [ ] Identifies API endpoint differences
  - [ ] Identifies config value differences
  - [ ] Identifies validation rule differences
  - [ ] Returns list of adaptation points with type and old/new values
- **Effort:** 3 story points (3 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/skill-adapter.ts` (identification functions)

**[SKILL-017] Skill Adapter Orchestrator**

- **Description:** Load skill code, validate approval status, identify adaptation points, apply transformations via ast-transformer, validate adapted code, update metadata (reusedTimes++, successfulImplementations.push()), measure time and tokens.
- **Acceptance:**
  - [ ] Loads skill from ./skills/ by name
  - [ ] Validates approval status (must be "approved")
  - [ ] Identifies adaptation points via identifier
  - [ ] Applies transformations via ast-transformer
  - [ ] Validates adapted code (syntax, types, security)
  - [ ] Updates skill metadata on success
  - [ ] Measures adaptation time (target: 20-40s)
  - [ ] Measures token usage (target: 8K-12K)
  - [ ] Rollback on failure (calls rollback mechanism)
- **Effort:** 8 story points (6-8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILL-014, SKILL-015, SKILL-016
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/skill-adapter.ts`
- **Risk:** High - Critical for 10x speedup, needs careful validation

**[SKILL-018] Validation Pipeline**

- **Description:** Multi-stage validation for adapted code - syntax (AST parse), types (Pyright/tsc), security (pattern scan). Block on any failure.
- **Acceptance:**
  - [ ] Syntax validation runs (Python: ast.parse(), TypeScript: tsc)
  - [ ] Type validation runs (Pyright for Python, tsc strict for TypeScript)
  - [ ] Security scan runs (pattern-based detection)
  - [ ] All stages must pass for validation success
  - [ ] Clear error messages on validation failure
  - [ ] Validation completes in <5 seconds
- **Effort:** 3 story points (3 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILL-014, SKILL-015
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/skill-adapter.ts` (validation functions)

**[SKILL-019] Rollback Mechanism**

- **Description:** On adaptation failure (syntax error, test failure, validation error), restore original skill without corruption. Log failure details.
- **Acceptance:**
  - [ ] Detects adaptation failures (syntax, test, validation errors)
  - [ ] Restores original skill code on failure
  - [ ] Does not corrupt skill metadata or registry
  - [ ] Logs failure details for debugging
  - [ ] Offers from-scratch option to user
- **Effort:** 3 story points (3 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILL-017
- **Priority:** P0 (Critical)
- **Target Files:** `servers/sage-planning/skill-adapter.ts` (rollback functions)

### Phase 3.4a: Skill Validation (Sprint 2, Week 6 Day 3, 23 SP)

**Goal:** Ensure skill security and quality
**Deliverable:** Approval workflow with security scanning

#### Tasks

**[SKILL-020] Syntax Validator**

- **Description:** Validate syntax correctness using AST parsing - Python: ast.parse(), TypeScript: tsc compiler.
- **Acceptance:**
  - [ ] Python syntax validation works (ast.parse succeeds)
  - [ ] TypeScript syntax validation works (tsc succeeds)
  - [ ] Returns specific syntax errors with line numbers
  - [ ] Validation completes in <1 second
- **Effort:** 2 story points (2 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P1 (High)
- **Target Files:** `servers/sage-planning/skill-validator.ts` (syntax functions)

**[SKILL-021] Type Validator**

- **Description:** Validate type correctness - Python: Pyright, TypeScript: tsc strict mode.
- **Acceptance:**
  - [ ] Python type validation works (Pyright integration)
  - [ ] TypeScript type validation works (tsc strict mode)
  - [ ] Returns type errors with file/line locations
  - [ ] Validation completes in <3 seconds
- **Effort:** 3 story points (3 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P1 (High)
- **Target Files:** `servers/sage-planning/skill-validator.ts` (type functions)

**[SKILL-022] Pattern-Based Security Scanner**

- **Description:** Detect common vulnerabilities using regex patterns - hardcoded credentials (API keys, passwords), SQL injection (string concatenation in queries), command injection (unsafe subprocess calls).
- **Acceptance:**
  - [ ] Detects hardcoded credentials (API keys, passwords, tokens)
  - [ ] Detects SQL injection patterns (string concat in queries)
  - [ ] Detects command injection (unsafe subprocess, eval, exec)
  - [ ] False positive rate <5% validated on test set
  - [ ] Scan completes in <5 seconds
- **Effort:** 3 story points (3 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P1 (High)
- **Target Files:** `servers/sage-planning/security-scanner.ts` (pattern functions)

**[SKILL-023] Security Tool Integration**

- **Description:** Integrate Snyk Code or SonarQube API for advanced security scanning. Handle authentication, API calls, result parsing.
- **Acceptance:**
  - [ ] Snyk Code or SonarQube API integrated
  - [ ] Authentication configured (API key or OAuth)
  - [ ] Scan results parsed correctly
  - [ ] Vulnerabilities categorized by severity
  - [ ] Scan completes in <10 seconds
  - [ ] Graceful fallback to pattern-based scan if tool unavailable
- **Effort:** 8 story points (6-8 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILL-022
- **Priority:** P1 (High)
- **Target Files:** `servers/sage-planning/security-scanner.ts` (tool integration)
- **Risk:** High - External API dependency, authentication complexity

**[SKILL-024] Approval Workflow**

- **Description:** Implement state machine - pending (new skills) → approved (manual review) → active (first successful use). Track reviewer, reviewDate, notes in metadata.
- **Acceptance:**
  - [ ] New skills start in "pending" state
  - [ ] Approval transitions to "approved" state with reviewer/date/notes
  - [ ] First successful use transitions to "active" state
  - [ ] Rejection blocks skill from use permanently
  - [ ] State transitions validated (no invalid transitions)
  - [ ] Audit trail maintained (all transitions logged)
- **Effort:** 5 story points (4-5 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILL-020, SKILL-021, SKILL-022, SKILL-023
- **Priority:** P1 (High)
- **Target Files:** `servers/sage-planning/skill-validator.ts` (approval functions)
- **Risk:** Medium - State machine design critical for security

**[SKILL-025] sage.skills approve/reject commands**

- **Description:** Implement `/sage.skills approve [name]` and `/sage.skills reject [name]` commands. Display skill code and security scan results, prompt for confirmation.
- **Acceptance:**
  - [ ] `/sage.skills approve [name]` command works
  - [ ] Displays skill code and security scan results
  - [ ] Prompts for confirmation before approving
  - [ ] Updates approvalStatus with reviewer/date/notes
  - [ ] `/sage.skills reject [name]` command works
  - [ ] Blocks rejected skill from use
- **Effort:** 2 story points (2 hours)
- **Owner:** Full-Stack Engineer
- **Dependencies:** SKILL-024
- **Priority:** P1 (High)
- **Target Files:** `commands/sage.skills.md` (approve/reject sections)

### Phase 3.4b: Skill Management (Sprint 2, Week 6 Day 4, 15 SP)

**Goal:** Manage skill lifecycle and versioning
**Deliverable:** Registry operations with semantic versioning

#### Tasks

**[SKILL-026] SKILL_REGISTRY.json Schema**

- **Description:** Define and implement registry structure - {version: "1.0", skills: [], totalSkills, totalReuses, averageSuccessRate}. Per-skill: {name, path, metadata, checksum}.
- **Acceptance:**
  - [ ] Registry schema matches specification
  - [ ] JSON structure validated on write
  - [ ] Initial registry created if missing
  - [ ] Checksums included for each skill (sha256)
- **Effort:** 2 story points (2 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P1 (High)
- **Target Files:** `skills/SKILL_REGISTRY.json` (initial schema)

**[SKILL-027] Skill Manager CRUD**

- **Description:** Implement registry operations - add skill (on generation), update skill (on adaptation/approval), delete skill, query skills. Include checksum validation (sha256) and atomic operations.
- **Acceptance:**
  - [ ] Add skill operation works (creates registry entry)
  - [ ] Update skill operation works (modifies metadata)
  - [ ] Delete skill operation works (removes entry, updates totals)
  - [ ] Query skills operation works (search by name, tag, status)
  - [ ] Checksums validated on read/write
  - [ ] Atomic file operations (read-modify-write)
  - [ ] Registry operations complete in <100ms
- **Effort:** 5 story points (4-5 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILL-026
- **Priority:** P1 (High)
- **Target Files:** `servers/sage-planning/skill-manager.ts`

**[SKILL-028] Semantic Version Manager**

- **Description:** Implement semantic versioning operations - parse version strings (MAJOR.MINOR.PATCH), compare versions, increment versions (patch/minor/major). Integrate with conventional commits.
- **Acceptance:**
  - [ ] Parse version strings correctly (X.Y.Z)
  - [ ] Compare versions (gt, gte, lt, lte, eq)
  - [ ] Increment PATCH (bug fixes, no API changes)
  - [ ] Increment MINOR (backward-compatible features)
  - [ ] Increment MAJOR (breaking changes)
  - [ ] Conventional commits integration: fix: → PATCH, feat: → MINOR, BREAKING CHANGE: → MAJOR
- **Effort:** 3 story points (3 hours)
- **Owner:** Backend Engineer
- **Dependencies:** None
- **Priority:** P1 (High)
- **Target Files:** `servers/sage-planning/version-manager.ts`

**[SKILL-029] File Locking Mechanism**

- **Description:** Implement file locking for concurrent registry writes. Use proper-lockfile or similar to ensure atomic operations.
- **Acceptance:**
  - [ ] File locking prevents concurrent writes to registry
  - [ ] Lock acquired before write, released after
  - [ ] Timeouts configured for lock acquisition
  - [ ] Lock release guaranteed even on errors
  - [ ] Concurrent operations queued correctly
- **Effort:** 3 story points (3 hours)
- **Owner:** Backend Engineer
- **Dependencies:** SKILL-027
- **Priority:** P1 (High)
- **Target Files:** `servers/sage-planning/skill-manager.ts` (locking functions)

**[SKILL-030] sage.skills management commands**

- **Description:** Implement management commands - `/sage.skills list` (view all skills), `/sage.skills version [name] [type]` (increment version), `/sage.skills delete [name]` (remove skill), `/sage.skills validate` (check integrity).
- **Acceptance:**
  - [ ] `/sage.skills list` displays all skills with metadata
  - [ ] `/sage.skills version [name] patch|minor|major` increments version
  - [ ] `/sage.skills delete [name]` removes skill from library
  - [ ] `/sage.skills validate` checks registry integrity, repairs if needed
  - [ ] All commands have help text and examples
- **Effort:** 2 story points (2 hours)
- **Owner:** Full-Stack Engineer
- **Dependencies:** SKILL-027, SKILL-028
- **Priority:** P1 (High)
- **Target Files:** `commands/sage.skills.md` (management sections)

### Phase 3.5: Validation & Metrics (Sprint 2, Week 6 Day 5, 21 SP)

**Goal:** Validate all acceptance criteria and success metrics
**Deliverable:** Comprehensive test suite and performance benchmarks

#### Tasks

**[SKILL-031] Integration Test Suite**

- **Description:** End-to-end workflow tests - Test 1: implement → generate skill → discover skill → adapt skill → validate speedup. Test 2: multiple feature types (auth, CRUD, API). Test 3: approval workflow. Test 4: versioning and rollback.
- **Acceptance:**
  - [ ] Test 1: Full workflow from implementation to adaptation passes
  - [ ] Test 2: Auth, CRUD, and API feature types tested
  - [ ] Test 3: Approval workflow (pending → approved → active) validated
  - [ ] Test 4: Version increments and rollback work correctly
  - [ ] All integration tests pass (zero failures)
  - [ ] Tests run in CI pipeline
- **Effort:** 8 story points (6-8 hours)
- **Owner:** QA Engineer
- **Dependencies:** All previous stories
- **Priority:** P0 (Critical)
- **Target Files:** `tests/integration/skill-workflow.test.ts`

**[SKILL-032] Performance Benchmarking**

- **Description:** Validate success metrics - speedup ratio (10x target), token reduction (90% target), discovery latency (<500ms), adaptation time (20-40s). Test on auth, CRUD, API feature types.
- **Acceptance:**
  - [ ] Speedup ratio measured: first vs skill-based implementation
  - [ ] Speedup ≥10x on auth, CRUD, API features (target met)
  - [ ] Token reduction measured: first vs skill-based tokens
  - [ ] Token reduction ≥90% (80K → 8K) (target met)
  - [ ] Discovery latency <500ms for <50 skills (target met)
  - [ ] Adaptation time 20-40s average (target met)
  - [ ] Performance report generated with metrics table
- **Effort:** 5 story points (4-5 hours)
- **Owner:** QA Engineer
- **Dependencies:** SKILL-031
- **Priority:** P0 (Critical)
- **Target Files:** `tests/performance/benchmarks.test.ts`
- **Risk:** High - Must validate 10x speedup claim

**[SKILL-033] Accuracy Testing**

- **Description:** Validate similarity matching accuracy - precision >90%, recall >85%, F1 score >87%. Test on 50+ feature pairs (25 similar, 25 dissimilar). Measure false positive rate <5%.
- **Acceptance:**
  - [ ] Test dataset: 50+ feature pairs (similar and dissimilar)
  - [ ] Precision >90% (true positives / all positives)
  - [ ] Recall >85% (true positives / all relevant)
  - [ ] F1 score >87% (harmonic mean)
  - [ ] False positive rate <5%
  - [ ] Accuracy report generated
- **Effort:** 3 story points (3 hours)
- **Owner:** QA Engineer
- **Dependencies:** SKILL-012
- **Priority:** P0 (Critical)
- **Target Files:** `tests/accuracy/similarity-matching.test.ts`

**[SKILL-034] Security Validation**

- **Description:** Scan all generated skills for vulnerabilities. Validate false positive rate <5%, approval workflow enforcement, zero critical vulnerabilities in approved skills.
- **Acceptance:**
  - [ ] All skills scanned with Snyk/SonarQube or pattern-based scanner
  - [ ] False positive rate <5% validated
  - [ ] Approval workflow prevents unapproved skill use
  - [ ] Zero critical vulnerabilities in approved skills
  - [ ] Security audit report generated
- **Effort:** 3 story points (3 hours)
- **Owner:** Security Engineer / QA
- **Dependencies:** SKILL-023, SKILL-024
- **Priority:** P0 (Critical)
- **Target Files:** `tests/security/vulnerability-scan.test.ts`

**[SKILL-035] Documentation Updates**

- **Description:** Update system documentation - ARCHITECTURE.md (skill system design), README.md (skill-first workflow), usage guides for /sage.skills commands.
- **Acceptance:**
  - [ ] ARCHITECTURE.md updated with skill system design
  - [ ] README.md updated with skill-first workflow instructions
  - [ ] Usage guide created for /sage.skills commands
  - [ ] Code examples provided for each workflow
  - [ ] Phase 3 results documented with metrics
- **Effort:** 2 story points (2 hours)
- **Owner:** Tech Lead / Documentation
- **Dependencies:** SKILL-031, SKILL-032, SKILL-033, SKILL-034
- **Priority:** P1 (High)
- **Target Files:** `ARCHITECTURE.md`, `README.md`, `docs/guides/skill-workflow.md`

## Critical Path

```plaintext
SKILL-002/003 → SKILL-004 → SKILL-005 → SKILL-006 → SKILL-007 (Phase 3.1: 24h)
     ↓
SKILL-008/009/010 → SKILL-011 → SKILL-012 → SKILL-013 (Phase 3.2: 16h)
     ↓
SKILL-014/015/016 → SKILL-017 → SKILL-018 → SKILL-019 (Phase 3.3: 20h)
     ↓
SKILL-020/021/022/023 → SKILL-024 → SKILL-025 (Phase 3.4a: 18h)
SKILL-026 → SKILL-027 → SKILL-028 → SKILL-029 → SKILL-030 (Phase 3.4b: 15h, parallel)
     ↓
SKILL-031 → SKILL-032 → SKILL-033 → SKILL-034 → SKILL-035 (Phase 3.5: 8h)
```

**Total Critical Path:** 10 days (2 weeks)

**Bottlenecks:**

- SKILL-017: Skill Adapter Orchestrator - Critical for 10x speedup delivery
- SKILL-023: Security Tool Integration - External API dependency
- SKILL-032: Performance Benchmarking - Validates key success metrics

**Parallel Tracks:**

- Phase 3.1: SKILL-002/003 (AST extractors) run in parallel
- Phase 3.2: SKILL-008/009/010 (similarity algorithms) run in parallel
- Phase 3.3: SKILL-014/015/016 (transformers + identifier) run in parallel
- Phase 3.4: SKILL-004 (Validation) and SKILL-005 (Management) run in parallel

## Quick Wins (Week 5, Days 1-2)

1. **SKILL-008/009/010: Similarity Algorithms** - Unblocks discovery, easy to test
2. **SKILL-004: Metadata Builder** - Simple, enables skill generation
3. **SKILL-006: Registry Operations** - Foundation for all metadata tracking

## Risk Mitigation

| Task | Risk | Mitigation | Contingency |
|------|------|------------|-------------|
| SKILL-014 | jscodeshift complexity, transformation bugs | Prototype transformations first, extensive unit tests, validate on 10+ examples | Fallback to string manipulation for Phase 3 MVP, AST later |
| SKILL-017 | Speedup <10x, adaptation too slow | Profile each step, optimize AST traversal, cache patterns | Accept 5x speedup for MVP if 10x not achievable |
| SKILL-023 | Snyk/SonarQube API auth issues, rate limits | Test API early, implement pattern-based fallback, cache scan results | Use pattern-based scanner only for MVP |
| SKILL-032 | Performance targets not met | Continuous benchmarking during Phase 3.3, optimize hot paths | Adjust targets based on real-world data if research projections incorrect |

## Testing Strategy

### Automated Testing Tasks

- **Unit Tests:** SKILL-002 through SKILL-030 (each story includes unit tests)
- **Integration Tests:** SKILL-031 (end-to-end workflows)
- **Performance Tests:** SKILL-032 (benchmarking)
- **Accuracy Tests:** SKILL-033 (similarity matching)
- **Security Tests:** SKILL-034 (vulnerability scanning)

### Quality Gates

- 80% code coverage required (all stories)
- All critical paths have integration tests (SKILL-031)
- Performance benchmarks validate SLOs (SKILL-032)
- Security scans pass with <5% false positives (SKILL-034)

## Team Allocation

**Backend Engineer 1 (Python Focus):**

- Phase 3.1: SKILL-002 (Python AST), SKILL-004 (Metadata), SKILL-005 (Generator)
- Phase 3.2: SKILL-008, SKILL-009, SKILL-010 (Similarity algorithms)
- Phase 3.3: SKILL-015 (Python Transformer), SKILL-016 (Identifier)
- Phase 3.4a: SKILL-020, SKILL-021 (Validators)

**Backend Engineer 2 (TypeScript Focus):**

- Phase 3.1: SKILL-003 (TypeScript AST), SKILL-006 (Registry)
- Phase 3.2: SKILL-011 (Caching), SKILL-012 (Discovery)
- Phase 3.3: SKILL-014 (TypeScript Transformer), SKILL-017 (Adapter), SKILL-018 (Validation), SKILL-019 (Rollback)
- Phase 3.4a: SKILL-022, SKILL-023 (Security Scanner)
- Phase 3.4b: SKILL-026, SKILL-027, SKILL-028, SKILL-029 (Management)

**Full-Stack Engineer:**

- Phase 3.1: SKILL-007 (sage.implement integration)
- Phase 3.2: SKILL-013 (sage.plan integration)
- Phase 3.4a: SKILL-024 (Approval Workflow), SKILL-025 (approve/reject commands)
- Phase 3.4b: SKILL-030 (management commands)

**QA Engineer:**

- Phase 3.5: SKILL-031, SKILL-032, SKILL-033, SKILL-034 (All testing)
- Ongoing: Test all stories as they complete

**Tech Lead / Documentation:**

- Phase 3.5: SKILL-035 (Documentation)
- Ongoing: Code reviews, architecture decisions, risk management

## Sprint Planning

**2-week sprints, 40 SP velocity per engineer**

| Sprint | Focus | Story Points | Key Deliverables |
|--------|-------|--------------|------------------|
| Sprint 1 (Week 5) | Generation + Discovery | 45 SP | Skill generation working, discovery with >90% accuracy |
| Sprint 2 (Week 6) | Adaptation + Validation + Testing | 88 SP | 10x speedup validated, approval workflow, all tests passing |

**Sprint 1 Breakdown (45 SP):**

- Phase 3.1: 28 SP (Days 1-3)
- Phase 3.2: 17 SP (Days 4-5)

**Sprint 2 Breakdown (88 SP):**

- Phase 3.3: 30 SP (Days 1-2)
- Phase 3.4a: 23 SP (Day 3)
- Phase 3.4b: 15 SP (Day 4)
- Phase 3.5: 21 SP (Day 5)

## Task Import Format

CSV export for project management tools:

```csv
ID,Title,Description,Estimate,Priority,Assignee,Dependencies,Sprint,Risk
SKILL-002,Python AST Extractor,Implement Python AST extraction using ast module,5,P0,Backend1,,1,Medium
SKILL-003,TypeScript AST Extractor,Implement TypeScript extraction using ts-morph,5,P0,Backend2,,1,Medium
SKILL-004,Metadata Builder,Construct SKILL_META with version and tags,3,P0,Backend1,SKILL-002/003,1,
SKILL-005,Skill Generator Orchestrator,Main generation logic with registry updates,8,P0,Backend1,SKILL-002/003/004,1,
SKILL-006,Registry Operations,Implement SKILL_REGISTRY.json operations,5,P0,Backend2,,1,
SKILL-007,Integration with sage.implement,Add post-success prompt to sage.implement,2,P0,FullStack,SKILL-005,1,
SKILL-008,Jaccard Similarity Algorithm,Implement tag overlap calculation,2,P0,Backend1,,1,
SKILL-009,Levenshtein Distance Algorithm,Implement name similarity calculation,2,P0,Backend1,,1,
SKILL-010,Cosine Similarity Algorithm,Implement TF-IDF description similarity,3,P0,Backend1,,1,Medium
SKILL-011,Similarity Caching,Implement cache for similarity scores,2,P1,Backend2,SKILL-008/009/010,1,
SKILL-012,Skill Discovery Orchestrator,Scan skills and rank by similarity,5,P0,Backend2,SKILL-008/009/010/011,1,
SKILL-013,Integration with sage.plan,Add skill-first workflow to sage.plan,3,P0,FullStack,SKILL-012,1,
SKILL-014,TypeScript AST Transformer,Implement jscodeshift transformations,8,P0,Backend2,,2,High
SKILL-015,Python AST Transformer,Implement ast tree rewriting,5,P0,Backend1,,2,
SKILL-016,Adaptation Point Identifier,Identify what needs to change in skill,3,P0,Backend1,,2,
SKILL-017,Skill Adapter Orchestrator,Orchestrate adaptation with validation,8,P0,Backend2,SKILL-014/015/016,2,High
SKILL-018,Validation Pipeline,Multi-stage validation for adapted code,3,P0,Backend2,SKILL-014/015,2,
SKILL-019,Rollback Mechanism,Restore skill on adaptation failure,3,P0,Backend2,SKILL-017,2,
SKILL-020,Syntax Validator,Validate syntax with AST parsing,2,P1,Backend1,,2,
SKILL-021,Type Validator,Validate types with Pyright/tsc,3,P1,Backend1,,2,
SKILL-022,Pattern-Based Security Scanner,Detect vulnerabilities with regex,3,P1,Backend2,,2,
SKILL-023,Security Tool Integration,Integrate Snyk/SonarQube API,8,P1,Backend2,SKILL-022,2,High
SKILL-024,Approval Workflow,Implement pending→approved→active states,5,P1,FullStack,SKILL-020/021/022/023,2,Medium
SKILL-025,sage.skills approve/reject commands,Implement approval commands,2,P1,FullStack,SKILL-024,2,
SKILL-026,SKILL_REGISTRY.json Schema,Define and implement registry structure,2,P1,Backend2,,2,
SKILL-027,Skill Manager CRUD,Implement registry CRUD with checksums,5,P1,Backend2,SKILL-026,2,
SKILL-028,Semantic Version Manager,Implement version parse/compare/increment,3,P1,Backend2,,2,
SKILL-029,File Locking Mechanism,Implement concurrent write safety,3,P1,Backend2,SKILL-027,2,
SKILL-030,sage.skills management commands,Implement list/version/delete/validate commands,2,P1,FullStack,SKILL-027/028,2,
SKILL-031,Integration Test Suite,End-to-end workflow tests,8,P0,QA,ALL,2,
SKILL-032,Performance Benchmarking,Validate 10x speedup and 90% token reduction,5,P0,QA,SKILL-031,2,High
SKILL-033,Accuracy Testing,Validate >90% similarity matching accuracy,3,P0,QA,SKILL-012,2,
SKILL-034,Security Validation,Scan all skills for vulnerabilities,3,P0,QA,SKILL-023/024,2,
SKILL-035,Documentation Updates,Update ARCHITECTURE.md and README.md,2,P1,TechLead,SKILL-031/032/033/034,2,
```

## Appendix

**Estimation Method:** Planning Poker with team, validated against research and plan estimates
**Story Point Scale:** Fibonacci (1, 2, 3, 5, 8, 13, 21)
**Definition of Done:**

- Code reviewed and approved
- Unit tests written and passing (80% coverage)
- Integration tests passing (if applicable)
- Documentation updated (inline comments + external docs)
- No regressions in existing functionality
- Performance benchmarks met (if applicable)

**Success Criteria Validation:**

- 10x speedup: SKILL-032 (Performance Benchmarking)
- 90% token reduction: SKILL-032 (Performance Benchmarking)
- >90% similarity accuracy: SKILL-033 (Accuracy Testing)
- <5% false positives: SKILL-022, SKILL-033, SKILL-034
- <500ms discovery: SKILL-012, SKILL-032
- 20-40s adaptation: SKILL-017, SKILL-032

**Go/No-Go Decision (End of Sprint 2):**

- **GO:** 10x speedup validated, >90% similarity accuracy, 80%+ reuse rate, zero critical security issues, all P0 stories complete
- **NO-GO:** <5x speedup, <70% similarity accuracy, <50% reuse rate, critical security vulnerabilities, P0 stories incomplete
