# Automatic Skill Evolution Specification

**Version:** 1.0
**Date:** 2025-11-13
**Status:** Draft
**Priority:** P0 (Critical - Phase 3 Foundation)

**Source Documents:**

- Research: `docs/research/automatic-skill-evolution-intel.md`
- Feature Request: `docs/features/automatic-skill-evolution.md`
- Anthropic Reference: "Code Execution with MCP: Building More Efficient AI Agents" (Nov 2024)

---

## 1. Overview

### 1.1 Purpose and Business Value

Transform Sage-Dev into a self-improving system that learns from successful implementations, automatically generating reusable skills that achieve **10x speedup** on repeated feature types through intelligent skill discovery and adaptation.

**Business Value:**

- **10x Speedup:** Reduce repeated feature implementation from 5-10 minutes to 30 seconds
- **90% Token Reduction:** Decrease token usage from 80,000 to 8,000 on skill-based implementations
- **80%+ Reuse Rate:** Achieve high reuse on similar features (auth, CRUD, API endpoints)
- **Institutional Memory:** Skills persist across sessions, developers, and projects
- **Self-Improvement:** System learns optimal patterns automatically over time
- **Cost Savings:** Token efficiency translates to direct cost reduction (API credits)

**Strategic Differentiation:**

1. **Enforcement-First Skills:** Include validation rules and security checks (not just code generation)
2. **Task-Level Reuse:** Full implementations vs line-level suggestions
3. **Metadata Transparency:** Track success rate, reuse count, adaptation time
4. **Institutional Memory:** Skills persist across team (vs individual-only context)
5. **Token Efficiency:** Validated 98.7% reduction in Anthropic production deployments

### 1.2 Success Metrics

**Performance Metrics:**

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| First Implementation Time | 5-10 min | 5-10 min | No change (baseline) |
| Repeated Implementation Time | 5-10 min | 30 sec | **14x faster** |
| First Implementation Tokens | 80,000 | 80,000 | No change (baseline) |
| Repeated Implementation Tokens | 80,000 | 8,000 | **90% reduction** |
| Skill Reuse Rate | 0% | 80%+ | Track per feature type |
| Discovery Accuracy | N/A | >90% | True positive rate |
| Discovery Latency | N/A | <500ms | For <50 skills |
| Adaptation Time | N/A | 20-40s | Average |

**Quality Metrics:**

- Extraction Accuracy: >90% (core logic vs boilerplate)
- Similarity Matching: >90% true positives, <5% false positives
- Adaptation Correctness: 100% (all tests pass after adaptation)
- Security Validation: 0 critical vulnerabilities in approved skills

**Adoption Metrics:**

- Total Skills Generated: Track growth over time
- Active Skills: Approved and reused at least once
- Total Reuses: Cumulative skill usage count
- Average Success Rate: Percentage of successful skill adaptations

### 1.3 Target Users

**Primary Users:**

- **Individual Developers:** Implementing features, seeking faster iteration
- **Development Teams:** Building repetitive patterns (CRUD, auth, payments)
- **Enterprise Organizations:** Requiring institutional memory and compliance

**Secondary Users:**

- **Security Reviewers:** Approving skills for organizational use
- **Tech Leads:** Managing skill library, deprecating outdated patterns
- **System Administrators:** Monitoring skill health and performance

---

## 2. Functional Requirements

### 2.1 Component 1: Skill Generation

**Purpose:** Extract reusable core logic from successful implementations

**Requirements:**

- **REQ-GEN-001:** System SHALL extract core logic using AST parsing after successful implementation
  - Python: Use built-in `ast` module (ast.parse, ast.NodeVisitor)
  - TypeScript: Use `ts-morph` library for type-aware extraction

- **REQ-GEN-002:** System SHALL identify terminal nodes (actual logic, not boilerplate)
  - Parse AST to complete tree structure
  - Identify terminal nodes (leaf logic) vs intermediate/structural nodes
  - Extract function signatures, core logic, dependencies, type annotations

- **REQ-GEN-003:** System SHALL create skill metadata with version, tags, dependencies, original implementation
  - name: feature name (e.g., "user-authentication")
  - version: semantic versioning starting at "1.0"
  - created: ISO timestamp
  - originalImplementation: ticket ID (e.g., "TICKET-AUTH-001")
  - successfulImplementations: array starting with original
  - reusedTimes: 0 initially
  - successRate: 100 initially
  - tags: feature tags (e.g., ["auth", "JWT", "middleware"])
  - dependencies: list of required packages
  - approvalStatus: {status: "pending", notes: "Awaiting manual review"}

- **REQ-GEN-004:** System SHALL save skills to `./skills/[name].ts` with SKILL_META export
  - File format: TypeScript/Python with metadata header
  - Include SKILL_META export for discoverability
  - Format with proper indentation and structure

- **REQ-GEN-005:** System SHALL update `SKILL_REGISTRY.json` with global index
  - Add entry: {name, path, metadata, checksum}
  - Update totalSkills, totalReuses, averageSuccessRate
  - Maintain data integrity with checksums

- **REQ-GEN-006:** System SHALL only generate skills from successful implementations
  - Validation: implementation.success === true
  - Validation: implementation.testsPass === true
  - Reject: Failed implementations or implementations without test coverage

- **REQ-GEN-007:** System SHALL prompt user after successful implementation
  - Display: "Save as reusable skill? [Y/n]"
  - Default: Yes (user can decline)
  - Show: Estimated future speedup and token savings

**User Stories:**

- **US-GEN-001:** As a developer who completed a feature, I want Sage-Dev to automatically extract the core logic as a reusable skill so that similar features can be implemented 10x faster in the future
- **US-GEN-002:** As a system, I want to extract only proven patterns (tests passing) so the skill library maintains high quality
- **US-GEN-003:** As a developer, I want to see what logic is being extracted so I can verify correctness before saving

### 2.2 Component 2: Skill Discovery

**Purpose:** Find matching skills before generating new implementations

**Requirements:**

- **REQ-DISC-001:** System SHALL scan `./skills/` directory for all skill files before planning
  - Read all `.ts` files in ./skills/
  - Parse SKILL_META from each file
  - Build candidate list for matching

- **REQ-DISC-002:** System SHALL calculate multi-factor similarity score
  - **Tag Overlap (Jaccard Similarity) - 40% weight:**
    - Formula: intersection(A, B) / union(A, B)
    - Use case: Match by feature tags (auth, CRUD, API, payment, etc.)
  - **Name Similarity (Levenshtein Distance) - 30% weight:**
    - Formula: Minimum single-character edits to transform string A to B
    - Normalize: 1 - (distance / max(len(A), len(B)))
  - **Description Similarity (Cosine Similarity) - 30% weight:**
    - Use TF-IDF vectors for description text
    - Cosine of angle between vectors
  - **Combined Score:** (tagOverlap × 0.4) + (nameSim × 0.3) + (descSim × 0.3)

- **REQ-DISC-003:** System SHALL filter matches by threshold
  - Discovery threshold: >70% similarity
  - Automatic use threshold: >85% similarity
  - Below 70%: No match, generate from scratch

- **REQ-DISC-004:** System SHALL rank results by similarity (descending)
  - Sort matches by combined similarity score
  - Return top N matches (default: top 5)
  - Include metadata: version, reuse count, success rate

- **REQ-DISC-005:** System SHALL cache similarity scores for performance
  - Cache key: hash(feature spec + skill metadata)
  - Cache duration: Until skill or feature changes
  - Invalidate on skill updates

- **REQ-DISC-006:** System SHALL display discovered skills to user
  - Show top 3 matches with similarity percentages
  - Include: skill name, version, reuse count, success rate
  - Format: "user-authentication (95% match, 5 reuses, 100% success)"

**User Stories:**

- **US-DISC-001:** As a developer planning an implementation, I want to see applicable skills before generating from scratch so I can leverage proven solutions
- **US-DISC-002:** As a developer, I want high-confidence matches (85%+) to be suggested automatically so I don't waste time reviewing obvious matches
- **US-DISC-003:** As a developer, I want medium-confidence matches (70-85%) to require my approval so I maintain control over skill usage
- **US-DISC-004:** As a system, I want to rank matches by relevance so the best option is presented first

### 2.3 Component 3: Skill Adaptation

**Purpose:** Modify existing skills to match new requirements

**Requirements:**

- **REQ-ADAPT-001:** System SHALL load base skill code from `./skills/`
  - Read skill file by name
  - Parse SKILL_META and core logic
  - Validate skill approval status (must be "approved")

- **REQ-ADAPT-002:** System SHALL identify adaptation points via AST analysis
  - Parameter name changes (userId → customerId)
  - API endpoint modifications (/api/users → /api/customers)
  - Configuration value updates (port 3000 → 8080)
  - Validation rule adjustments (email regex → phone regex)
  - Type annotation updates

- **REQ-ADAPT-003:** System SHALL apply transformations using AST manipulation
  - JavaScript/TypeScript: Use `jscodeshift` for AST-based transformation
  - Python: Use `ast` module for tree rewriting
  - Preserve: Code structure, formatting, type safety
  - Validate: Syntax correctness after transformation

- **REQ-ADAPT-004:** System SHALL update skill metadata after successful adaptation
  - Increment: reusedTimes += 1
  - Append: successfulImplementations.push(newFeature.ticketId)
  - Update: lastReused = current timestamp
  - Recalculate: successRate based on successful/failed adaptations

- **REQ-ADAPT-005:** System SHALL validate adapted code before use
  - Syntax validation: AST parse succeeds
  - Type validation: Pyright (Python) or tsc (TypeScript)
  - Security scanning: Check for introduced vulnerabilities
  - Test execution: Run unit tests if available

- **REQ-ADAPT-006:** System SHALL measure adaptation time and token usage
  - Track: Start time, end time, duration
  - Track: Token count for adaptation process
  - Report: Comparison to from-scratch baseline
  - Log: Adaptation metrics to skill metadata

- **REQ-ADAPT-007:** System SHALL rollback on adaptation failure
  - On error: Restore original skill (do not corrupt)
  - On test failure: Report error, offer from-scratch option
  - On validation failure: Block usage, suggest manual review

**User Stories:**

- **US-ADAPT-001:** As a developer using a skill, I want it adapted to my specific requirements while preserving core logic
- **US-ADAPT-002:** As a system, I want to validate adapted code before use to ensure correctness and security
- **US-ADAPT-003:** As a developer, I want failed adaptations to rollback cleanly without corrupting the skill library

### 2.4 Component 4: Skill Validation

**Purpose:** Ensure skill security and quality

**Requirements:**

- **REQ-VAL-001:** System SHALL validate syntax correctness
  - Parse to AST: ast.parse() for Python, TypeScript compiler for TS
  - Requirement: Parse must succeed without errors
  - Report: Specific syntax errors if validation fails

- **REQ-VAL-002:** System SHALL validate type correctness
  - Python: Run Pyright type checker
  - TypeScript: Run tsc compiler with strict mode
  - Requirement: Zero type errors
  - Report: Type errors with file/line locations

- **REQ-VAL-003:** System SHALL scan for security issues
  - **Hardcoded Credentials:** Detect API keys, passwords, tokens
  - **SQL Injection:** Detect string concatenation in SQL queries
  - **Command Injection:** Detect unsafe subprocess calls
  - **Suspicious Imports:** Detect dangerous modules (eval, exec, pickle without safeguards)
  - Tool Integration: Snyk Code or SonarQube

- **REQ-VAL-004:** System SHALL implement approval workflow
  - **States:** pending → approved → rejected → active
  - **Transition Rules:**
    - New skills start as "pending"
    - Only "approved" skills can be used automatically
    - "Rejected" skills cannot be used
    - "Active" state set on first successful adaptation
  - **Metadata:** Track reviewer, review date, notes

- **REQ-VAL-005:** System SHALL require manual review for first-time skills
  - Prompt: "Skill [name] requires approval before use"
  - Action: Display skill code, security scan results
  - Options: Approve, Reject, Review Later
  - Default: Review Later (do not auto-approve)

- **REQ-VAL-006:** System SHALL block unapproved skills from automatic use
  - Check: approvalStatus.status === "approved"
  - On pending: Prompt user, offer manual approval or from-scratch
  - On rejected: Block usage, generate from scratch
  - Audit: Log approval check attempts

**User Stories:**

- **US-VAL-001:** As a security reviewer, I want to approve skills before organizational use to ensure compliance and security
- **US-VAL-002:** As a developer, I want automated security scanning to catch obvious issues without manual review
- **US-VAL-003:** As a system admin, I want to enforce approval workflow to prevent malicious or low-quality code from entering production

### 2.5 Component 5: Skill Management

**Purpose:** Manage skill lifecycle, versioning, and metadata

**Requirements:**

- **REQ-MGT-001:** System SHALL maintain `SKILL_REGISTRY.json` with global skill index
  - Structure: {skills: [], totalSkills, totalReuses, averageSuccessRate}
  - Per-skill: {name, path, metadata, checksum}
  - Operations: Add, update, delete, query
  - Integrity: Validate checksums on read

- **REQ-MGT-002:** System SHALL implement semantic versioning (X.Y.Z)
  - **MAJOR (X):** Backward-incompatible API changes (signature changes, removed features)
  - **MINOR (Y):** Backward-compatible feature additions (new parameters with defaults)
  - **PATCH (Z):** Bug fixes, no API changes (logic corrections, performance)
  - Automation: Parse commit messages (conventional commits) for auto-increment

- **REQ-MGT-003:** System SHALL provide management commands
  - **/sage.skills list:** View all skills with metadata (version, reuse count, success rate, approval status)
  - **/sage.skills approve [name]:** Approve pending skill for automatic use
  - **/sage.skills reject [name]:** Reject skill, block from use
  - **/sage.skills version [name] [type]:** Increment version (patch|minor|major)
  - **/sage.skills delete [name]:** Remove skill from library
  - **/sage.skills validate:** Check registry integrity, repair if needed

- **REQ-MGT-004:** System SHALL handle skill deprecation
  - Mark skills as deprecated (add deprecation flag to metadata)
  - Warning: Display deprecation notice on use
  - Transition: Suggest replacement skill if available
  - Removal: Delete after grace period (e.g., 30 days)

- **REQ-MGT-005:** System SHALL support skill consolidation
  - Identify: Similar skills with low reuse counts
  - Merge: Combine into single, more general skill
  - Migration: Update references from old skills to new consolidated skill
  - Cleanup: Archive or delete merged skills

- **REQ-MGT-006:** System SHALL maintain version history via git
  - Commit: Skill file changes with semantic commit messages
  - Tag: Major version releases (v1.0.0, v2.0.0)
  - Rollback: Restore previous version from git history
  - Audit: Track all skill modifications

**User Stories:**

- **US-MGT-001:** As a developer, I want to see all available skills with reuse statistics to understand what's available
- **US-MGT-002:** As a team lead, I want to approve skills before team-wide use to maintain quality standards
- **US-MGT-003:** As a system admin, I want to deprecate outdated skills and consolidate duplicates to maintain library health
- **US-MGT-004:** As a developer, I want to roll back to previous skill versions if new versions introduce bugs

---

## 3. Non-Functional Requirements

### 3.1 Performance Requirements

**Discovery Performance:**

- **NFR-PERF-001:** Skill discovery SHALL complete in <500ms for libraries with <50 skills
- **NFR-PERF-002:** Skill discovery SHALL use vector embeddings (code2vec) for libraries with >50 skills
- **NFR-PERF-003:** Similarity calculation SHALL use caching to avoid redundant computations

**Adaptation Performance:**

- **NFR-PERF-004:** Skill adaptation SHALL complete in 20-40 seconds average
- **NFR-PERF-005:** Skill adaptation SHALL use 8,000-12,000 tokens (vs 80,000 from scratch)
- **NFR-PERF-006:** Adaptation speedup SHALL be minimum 10x vs from-scratch implementation

**Extraction Performance:**

- **NFR-PERF-007:** Skill extraction SHALL complete in <5 seconds for typical implementations
- **NFR-PERF-008:** Skill extraction accuracy SHALL exceed 90% (core logic vs boilerplate)

**Registry Operations:**

- **NFR-PERF-009:** SKILL_REGISTRY.json operations SHALL complete in <100ms
- **NFR-PERF-010:** Registry SHALL support up to 1000 skills without performance degradation

### 3.2 Security Requirements

**Code Security:**

- **NFR-SEC-001:** Generated skills SHALL be scanned for hardcoded credentials (API keys, passwords, tokens)
- **NFR-SEC-002:** Generated skills SHALL be scanned for injection vulnerabilities (SQL, command, code)
- **NFR-SEC-003:** Generated skills SHALL be scanned for suspicious imports (eval, exec, unsafe deserialization)
- **NFR-SEC-004:** Security scanning SHALL complete in <10 seconds per skill

**Access Control:**

- **NFR-SEC-005:** Skill approval SHALL require manual authorization (cannot be bypassed)
- **NFR-SEC-006:** Unapproved skills SHALL NOT be usable automatically
- **NFR-SEC-007:** Skill modifications SHALL be tracked with audit trail (reviewer, date, notes)

**Data Integrity:**

- **NFR-SEC-008:** Skill files SHALL use checksums to detect tampering
- **NFR-SEC-009:** SKILL_REGISTRY.json SHALL be validated on read/write operations
- **NFR-SEC-010:** Failed operations SHALL NOT corrupt existing skills or registry

### 3.3 Scalability Requirements

**Library Growth:**

- **NFR-SCALE-001:** System SHALL support minimum 100 skills without performance degradation
- **NFR-SCALE-002:** System SHALL migrate to vector embeddings when library exceeds 50 skills
- **NFR-SCALE-003:** Registry operations SHALL remain <100ms regardless of library size

**Concurrent Access:**

- **NFR-SCALE-004:** Multiple developers SHALL be able to generate skills concurrently
- **NFR-SCALE-005:** Registry updates SHALL use file locking to prevent corruption
- **NFR-SCALE-006:** Skill discovery SHALL be thread-safe for parallel workflows

**Resource Usage:**

- **NFR-SCALE-007:** Skill generation SHALL use <500MB memory for typical implementations
- **NFR-SCALE-008:** Skill library SHALL use <100MB disk space for 50 skills
- **NFR-SCALE-009:** Cache size SHALL be limited to 50MB maximum

### 3.4 Reliability Requirements

**Error Handling:**

- **NFR-REL-001:** Adaptation failures SHALL rollback cleanly without corrupting skills
- **NFR-REL-002:** Validation failures SHALL block skill usage with clear error messages
- **NFR-REL-003:** Registry corruption SHALL be auto-recovered from git history

**Data Persistence:**

- **NFR-REL-004:** Skill files SHALL be committed to git automatically on creation/update
- **NFR-REL-005:** Registry SHALL be backed up before modifications
- **NFR-REL-006:** Skill metadata SHALL be recoverable from git history if lost

**Availability:**

- **NFR-REL-007:** Skill system downtime SHALL NOT block from-scratch implementation
- **NFR-REL-008:** Missing skills SHALL trigger graceful fallback to generation
- **NFR-REL-009:** System SHALL continue operating with zero skills in library

### 3.5 Usability Requirements

**Developer Experience:**

- **NFR-USE-001:** Skill discovery results SHALL display similarity percentage and reuse count
- **NFR-USE-002:** Skill generation prompt SHALL show estimated future savings (time, tokens)
- **NFR-USE-003:** Approval workflow SHALL display skill code and security scan results
- **NFR-USE-004:** Error messages SHALL be actionable (explain problem, suggest fix)

**Documentation:**

- **NFR-USE-005:** Each skill SHALL include inline comments explaining core logic
- **NFR-USE-006:** SKILL_META SHALL include usage examples and dependencies
- **NFR-USE-007:** Management commands SHALL provide help text and examples

---

## 4. Features & Flows

### 4.1 Feature Breakdown

**Priority P0 (Critical):**

1. **Skill Generation:** Extract core logic after successful implementation
2. **Skill Discovery:** Find matching skills before planning
3. **Skill Adaptation:** Modify skills for new requirements
4. **Basic Validation:** Syntax and type checking

**Priority P1 (High):**

5. **Security Scanning:** Detect vulnerabilities in generated skills
6. **Approval Workflow:** Manual review for first-time skills
7. **Skill Management:** List, approve, version, delete commands

**Priority P2 (Medium):**

8. **Skill Consolidation:** Merge similar skills
9. **Deprecation Workflow:** Mark and remove outdated skills
10. **Performance Optimization:** Vector embeddings for large libraries

### 4.2 Key User Flows

**Flow 1: First Implementation Creates Skill**

```
Developer → /sage.implement TICKET-AUTH-001
  ↓
System → Implement feature, run tests
  ↓
Tests Pass → Prompt: "Save as reusable skill? [Y/n]"
  ↓
Developer → Y
  ↓
System → Extract core logic via AST
  ↓
System → Create SKILL_META (v1.0, pending approval)
  ↓
System → Save to ./skills/user-authentication.ts
  ↓
System → Update SKILL_REGISTRY.json
  ↓
System → Display: "Skill saved: user-authentication (v1.0, pending approval)"
  ↓
System → Display: "Future implementations of similar features will be 10x faster"
```

**Flow 2: Subsequent Implementation Discovers and Uses Skill**

```
Developer → /sage.plan "Admin authentication system"
  ↓
System → Check ./skills/ for matching skills
  ↓
System → Calculate similarity scores (Jaccard + Levenshtein + Cosine)
  ↓
System → Find match: user-authentication.ts (95% similarity)
  ↓
System → Display: "Found: user-authentication (v1.0, 0 reuses, 100% success)"
  ↓
System → Prompt: "Use existing skill as base? [Y/n]"
  ↓
Developer → Y
  ↓
System → Check approval status → pending
  ↓
System → Prompt: "Skill requires approval. Approve now? [Y/n/review]"
  ↓
Developer → Y (or delegate to security reviewer)
  ↓
System → Update approvalStatus: "approved"
  ↓
System → Load skill code
  ↓
System → Identify adaptation points (AST analysis)
  ↓
System → Apply transformations (userId → adminId, /users → /admins)
  ↓
System → Validate adapted code (syntax, types, security)
  ↓
System → Update metadata (reusedTimes: 1, lastReused: timestamp)
  ↓
System → Generate implementation in 30 seconds (vs 7 minutes)
  ↓
System → Display: "Implementation complete. Time: 30s, Tokens: 8,000 (90% reduction)"
```

**Flow 3: Skill Management**

```
Developer → /sage.skills list
  ↓
System → Display all skills:
  user-authentication (v1.2, 5 reuses, 100% success, approved)
  payment-processing (v1.0, 1 reuse, 100% success, approved)
  crud-operations (v2.1, 12 reuses, 95% success, approved)
  api-error-handling (v1.0, 0 reuses, N/A, pending)

Developer → /sage.skills approve api-error-handling
  ↓
System → Display skill code and security scan results
  ↓
System → Prompt: "Approve api-error-handling for use? [Y/n]"
  ↓
Developer → Y
  ↓
System → Update approvalStatus: {status: "approved", reviewer: "developer", date: "2025-11-13"}
  ↓
System → Commit change to git
  ↓
System → Display: "Skill approved: api-error-handling (v1.0)"
```

### 4.3 Input/Output Specifications

**Skill Generation Input:**

```typescript
interface ImplementationInput {
  ticketId: string;              // "TICKET-AUTH-001"
  featureName: string;           // "user-authentication"
  code: string;                  // Implementation source code
  tests: string;                 // Test source code
  success: boolean;              // true
  testsPass: boolean;            // true
  tags: string[];                // ["auth", "JWT", "middleware"]
  dependencies: string[];        // ["jsonwebtoken", "bcrypt"]
}
```

**Skill Generation Output:**

```typescript
interface SkillOutput {
  name: string;                  // "user-authentication"
  version: string;               // "1.0"
  path: string;                  // "./skills/user-authentication.ts"
  metadata: SkillMetadata;       // See metadata schema below
  checksum: string;              // "sha256:abc123..."
}
```

**Skill Discovery Input:**

```typescript
interface FeatureSpec {
  name: string;                  // "admin-authentication"
  description: string;           // "Authentication system for admin users"
  tags: string[];                // ["auth", "admin", "JWT"]
  requirements: string[];        // Functional requirements
}
```

**Skill Discovery Output:**

```typescript
interface SkillMatch {
  skill: Skill;                  // Skill object
  similarity: number;            // 0.95 (95%)
  metadata: SkillMetadata;       // Version, reuse count, etc.
  matchFactors: {
    tagOverlap: number;          // 0.90 (Jaccard)
    nameSimilarity: number;      // 0.85 (Levenshtein)
    descSimilarity: number;      // 0.80 (Cosine)
  };
}
```

**Skill Metadata Schema:**

```typescript
interface SkillMetadata {
  name: string;                  // "user-authentication"
  version: string;               // "1.2"
  created: string;               // "2025-11-13T10:00:00Z"
  lastUpdated: string;           // "2025-11-20T15:30:00Z"
  reusedTimes: number;           // 5
  successfulImplementations: string[]; // ["TICKET-AUTH-001", "TICKET-AUTH-015", ...]
  successRate: number;           // 100
  averageAdaptationTime: number; // 28 (seconds)
  tags: string[];                // ["auth", "JWT", "middleware"]
  dependencies: string[];        // ["jsonwebtoken", "bcrypt"]
  originalImplementation: string; // "TICKET-AUTH-001"
  approvalStatus: {
    status: "pending" | "approved" | "rejected" | "active";
    reviewer?: string;           // "alice@example.com"
    reviewDate?: string;         // "2025-11-13T12:00:00Z"
    notes?: string;              // "Verified security scan results"
  };
}
```

---

## 5. Acceptance Criteria

### 5.1 Definition of Done

**Phase 3 Complete When:**

1. **Skill Generation Working:**
   - [ ] After successful implementation, skill extraction prompt appears
   - [ ] Core logic extracted correctly (>90% accuracy, no boilerplate)
   - [ ] Skills saved to `./skills/[name].ts` with SKILL_META export
   - [ ] SKILL_REGISTRY.json updated with new skill entry
   - [ ] Metadata includes version, tags, dependencies, approval status

2. **Skill Discovery Implemented:**
   - [ ] `/sage.plan` checks skills before generating plan
   - [ ] Multi-factor similarity (Jaccard + Levenshtein + Cosine) working
   - [ ] Similarity matching accuracy >90% (validated on 50+ feature pairs)
   - [ ] Multiple matches ranked by relevance
   - [ ] Discovery completes in <500ms for <50 skills

3. **Skill-First Workflow Functional:**
   - [ ] High-confidence matches (85%+) suggested automatically
   - [ ] Medium-confidence matches (70-85%) require user approval
   - [ ] Skill adaptation working correctly (100% test pass rate)
   - [ ] Fallback to from-scratch if no applicable skill

4. **Performance Targets Achieved:**
   - [ ] Repeated task speedup: 5-10 min → 30 sec (10x minimum)
   - [ ] Repeated task tokens: 80,000 → 8,000 (90% reduction)
   - [ ] Skill reuse rate: 80%+ on similar features (auth, CRUD, API)
   - [ ] Discovery latency: <500ms
   - [ ] Adaptation time: 20-40 seconds average

5. **Skill Management Implemented:**
   - [ ] `/sage.skills list` - View all skills with metadata
   - [ ] `/sage.skills approve [name]` - Approve pending skills
   - [ ] `/sage.skills reject [name]` - Reject skills
   - [ ] `/sage.skills version [name] [type]` - Update skill version
   - [ ] `/sage.skills delete [name]` - Remove skill
   - [ ] `/sage.skills validate` - Check registry integrity

6. **Validation and Security:**
   - [ ] Skill approval workflow (pending → approved → active) enforced
   - [ ] Security scanning integrated (Snyk or SonarQube)
   - [ ] Unapproved skills blocked from automatic use
   - [ ] Skill versioning and rollback working
   - [ ] Failed adaptations don't corrupt skills

### 5.2 Validation Approach

**Functional Testing:**

- **Unit Tests:** Test each component independently
  - Skill generation: Extraction accuracy, metadata creation
  - Skill discovery: Similarity algorithms, ranking correctness
  - Skill adaptation: Transformation accuracy, validation
  - Skill management: CRUD operations, versioning

- **Integration Tests:** Test end-to-end workflows
  - Flow 1: Implement → Generate Skill → Save → Update Registry
  - Flow 2: Plan → Discover Skills → Adapt → Implement
  - Flow 3: List Skills → Approve → Use in Adaptation

**Performance Testing:**

- **Speedup Validation:**
  - Implement feature from scratch: Measure time and tokens
  - Implement similar feature with skill: Measure time and tokens
  - Calculate: Speedup ratio (target: 10x), token reduction (target: 90%)

- **Scalability Testing:**
  - Create 10, 25, 50, 100 skills
  - Measure discovery latency at each size
  - Validate: <500ms for 50 skills, <2s for 100 skills

- **Accuracy Testing:**
  - Generate 50+ feature pairs (similar and dissimilar)
  - Measure: True positives, false positives, false negatives
  - Calculate: Precision, recall, F1 score
  - Target: >90% precision, >85% recall

**Security Testing:**

- **Vulnerability Scanning:**
  - Test skills with hardcoded credentials → Should detect
  - Test skills with SQL injection → Should detect
  - Test skills with command injection → Should detect
  - Test skills with suspicious imports → Should detect

- **Approval Workflow:**
  - Attempt to use unapproved skill automatically → Should block
  - Approve skill → Should allow automatic use
  - Reject skill → Should permanently block

**User Acceptance Testing:**

- **Real-World Scenarios:**
  - Auth Scenario: Implement user-auth, then admin-auth (validate speedup)
  - CRUD Scenario: Implement user-CRUD, then product-CRUD (validate speedup)
  - API Scenario: Implement POST endpoint, then PUT endpoint (validate speedup)

- **Success Criteria:**
  - Developers successfully generate and discover skills
  - 10x speedup validated on repeated features
  - Security reviewers successfully approve/reject skills
  - No skill corruption or data loss

---

## 6. Dependencies

### 6.1 Technical Dependencies

**Required Technologies:**

1. **AST Parsing:**
   - Python: Built-in `ast` module (ast.parse, ast.NodeVisitor, ast.dump)
   - TypeScript: `ts-morph` library for type-aware AST manipulation
   - Purpose: Extract core logic, identify terminal nodes

2. **Similarity Algorithms:**
   - Jaccard Similarity: Tag overlap calculation
   - Levenshtein Distance: String edit distance for name matching
   - Cosine Similarity: TF-IDF vectors for description matching
   - Library: Implement or use `string-similarity`, `natural` (Node), `scipy` (Python)

3. **Code Transformation:**
   - JavaScript/TypeScript: `jscodeshift` (Facebook-maintained)
   - Python: `ast` module tree rewriting
   - Purpose: Apply adaptations while preserving structure

4. **Security Scanning:**
   - Option A: Snyk Code (SAST, AI-powered, pre-validated auto-fixes)
   - Option B: SonarQube (AI Code Assurance, deep static analysis)
   - Integration: API or CLI for automated scanning

5. **Semantic Versioning:**
   - Library: `semver` (Node) or `semantic_version` (Python)
   - Purpose: Parse, compare, increment versions

6. **Vector Embeddings (Optional, Phase 3.3+):**
   - code2vec: Distributed code representations via AST paths
   - Purpose: Semantic search for libraries >50 skills
   - Fallback: Rule-based similarity for <50 skills

**Infrastructure:**

- **File System:** `./skills/` directory for skill storage
- **Registry:** `./skills/SKILL_REGISTRY.json` for global index
- **Git Integration:** Automatic commits for skill changes
- **Cache:** In-memory or file-based cache for similarity scores

### 6.2 Phase Dependencies

**Prerequisites (Must Be Complete):**

1. **Phase 1: MCP Server Infrastructure** (Status: Complete per feature request)
   - Required for code execution and skill generation
   - MCP servers provide skill-generator, skill-discovery tools
   - Baseline: 80,000 tokens per implementation

2. **Phase 2: Context Optimization & Caching** (Status: Complete per feature request)
   - Required for pattern matching and similarity algorithms
   - Caching infrastructure used for similarity score caching
   - Pattern library used for skill discovery

**Blockers:**

- Phase 2 must be complete (uses pattern matching and caching)
- Pattern library must exist (for similarity matching baseline)
- Repository patterns must be available (for extraction reference)

**Enables:**

- Phase 4: Parallel Agent Orchestration (skills used in parallel workflows)
- Cross-session institutional memory (skills persist)
- Team knowledge accumulation (skills shared across developers)

### 6.3 External Integrations

**Security Scanning:**

- **Snyk Code API:** Requires API key, subscription
- **SonarQube:** Requires server setup or cloud subscription
- **Fallback:** Basic pattern matching (regex for credentials, SQL patterns)

**Version Control:**

- **Git:** Required for skill version history and rollback
- **GitHub/GitLab:** Optional for remote backup and team sharing

**Monitoring (Optional):**

- **Metrics Dashboard:** Track skill usage, reuse rate, speedup
- **Alerting:** Notify on skill validation failures or low success rates

### 6.4 Assumptions

**Technical Assumptions:**

- TypeScript/Python are primary languages for implementations
- Git is available and configured for the repository
- Filesystem has read/write access to `./skills/` directory
- 500MB memory available for skill operations
- 100MB disk space available for skill library (50 skills)

**Workflow Assumptions:**

- Developers use `/sage.implement` for feature implementation
- Tests are run and pass before skill generation
- Security reviewers approve skills within reasonable timeframe (SLA TBD)
- Skills are language-specific (no cross-language adaptation yet)

**Performance Assumptions:**

- Skill library grows to ~50 skills over 6 months
- 80% of features match to existing skills after library matures
- Average implementation is 200-500 lines of code
- Network latency for security scanning API: <2 seconds

---

## 7. Target Files

**Component 1: Skill Generation**

1. `servers/sage-planning/skill-generator.ts` (create)
   - Purpose: Extract core logic via AST, create SKILL_META, save to ./skills/

2. `servers/sage-planning/ast-extractor.ts` (create)
   - Purpose: AST parsing utilities (Python ast, TypeScript ts-morph)

3. `servers/sage-planning/metadata-builder.ts` (create)
   - Purpose: Construct SKILL_META with version, tags, dependencies

4. `commands/sage.implement.md` (modify, lines ~300-400)
   - Purpose: Add post-success skill generation prompt

**Component 2: Skill Discovery**

5. `servers/sage-planning/skill-discovery.ts` (create)
   - Purpose: Scan ./skills/, calculate similarity, rank matches

6. `servers/sage-planning/similarity-algorithms.ts` (create)
   - Purpose: Jaccard, Levenshtein, Cosine implementations

7. `commands/sage.plan.md` (modify, lines ~100-200)
   - Purpose: Add skill-first workflow (check skills before planning)

**Component 3: Skill Adaptation**

8. `servers/sage-planning/skill-adapter.ts` (create)
   - Purpose: Load skill, identify adaptation points, apply transformations

9. `servers/sage-planning/ast-transformer.ts` (create)
   - Purpose: jscodeshift integration for AST-based code modification

**Component 4: Skill Validation**

10. `servers/sage-planning/skill-validator.ts` (create)
    - Purpose: Syntax validation, type checking, security scanning

11. `servers/sage-planning/security-scanner.ts` (create)
    - Purpose: Snyk/SonarQube integration, pattern-based vulnerability detection

12. `commands/sage.skills.md` (create)
    - Purpose: Management commands (list, approve, reject, version, delete, validate)

**Component 5: Skill Management**

13. `skills/SKILL_REGISTRY.json` (create)
    - Purpose: Global skill index with metadata

14. `servers/sage-planning/skill-manager.ts` (create)
    - Purpose: CRUD operations on skill registry

15. `servers/sage-planning/version-manager.ts` (create)
    - Purpose: Semantic versioning operations

**Test Files**

16. `tests/skill-generator.test.ts` (create)
    - Purpose: Test extraction accuracy, metadata creation

17. `tests/skill-discovery.test.ts` (create)
    - Purpose: Test similarity matching, ranking correctness

18. `tests/skill-adaptation.test.ts` (create)
    - Purpose: Test transformation correctness, validation

19. `tests/similarity-algorithms.test.ts` (create)
    - Purpose: Test Jaccard, Levenshtein, Cosine implementations

20. `tests/integration/skill-workflow.test.ts` (create)
    - Purpose: End-to-end workflow testing

---

## 8. Cross-Component Dependencies

**Skill Generation → Skill Discovery:**

- Generated skills must include SKILL_META for discovery
- Metadata schema must match discovery expectations

**Skill Discovery → Skill Adaptation:**

- Discovered skills must include enough metadata for adaptation
- Similarity score must be passed to adaptation for logging

**Skill Adaptation → Skill Validation:**

- Adapted code must be validated before use
- Validation failures must trigger rollback in adaptation

**Skill Validation → Skill Management:**

- Approval workflow updates registry via management layer
- Validation results stored in skill metadata

**All Components → Skill Management:**

- All operations update registry for consistency
- Registry serves as single source of truth

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Skill matching <90% accuracy | Medium | High | Multi-factor similarity (Jaccard + Levenshtein + Cosine), user approval for 70-85% confidence, confidence thresholds |
| Generated skills have bugs | Medium | High | Approval workflow (pending → approved → active), validation (syntax, type, security), sandboxed execution for first-time use |
| Agent over-relies on skills | Low | Medium | Confidence thresholds (70% discovery, 85% auto-use), user override option (force from-scratch), similarity score transparency |
| Skill proliferation (100s) | Low | Medium | Skill consolidation (merge similar), deprecation workflow, categories/tags, vector embeddings for fast search at scale |
| Discovery latency >1s | Low | Low | Vector embeddings (code2vec), caching, tag-based pre-filtering, incremental indexing |
| Security vulnerabilities in skills | Medium | Critical | Mandatory security scanning, approval workflow, automated pattern detection, audit trail |
| Registry corruption | Low | High | Checksums, git history backup, automatic recovery, validation on read |

---

## 10. Success Validation

**Metrics to Track:**

1. **Performance Metrics:**
   - Implementation time: First vs repeated (target: 10x speedup)
   - Token usage: First vs repeated (target: 90% reduction)
   - Discovery latency: Measure per library size (target: <500ms for 50 skills)
   - Adaptation time: Average across all adaptations (target: 20-40s)

2. **Quality Metrics:**
   - Extraction accuracy: Manual review of generated skills (target: >90%)
   - Similarity accuracy: Precision/recall on test pairs (target: >90%/>85%)
   - Adaptation correctness: Test pass rate after adaptation (target: 100%)
   - Security scan results: Vulnerabilities detected vs false positives (target: <5% FP)

3. **Adoption Metrics:**
   - Total skills generated: Track growth over time
   - Skill reuse rate: Percentage of implementations using skills (target: 80%+)
   - Active skills: Skills with at least 1 reuse
   - Average reuses per skill: Indicator of skill quality

4. **Business Metrics:**
   - Developer satisfaction: Survey after using skill system
   - Time savings: Cumulative hours saved via skill reuse
   - Token cost savings: Cumulative cost reduction from 90% token reduction
   - Knowledge retention: Skills surviving developer turnover

**Go/No-Go Criteria:**

- **GO:** 10x speedup validated, >90% similarity accuracy, 80%+ reuse rate, zero critical security issues
- **NO-GO:** <5x speedup, <70% similarity accuracy, <50% reuse rate, critical security vulnerabilities

---

**Document Status:** Complete
**Next Phase:** `/sage.plan` to create implementation plan
**Epic Ticket:** To be created in `.sage/tickets/` by specification generation process
