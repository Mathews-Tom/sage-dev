# Automatic Skill Evolution - Implementation Blueprint (PRP)

**Format:** Product Requirements Prompt (Context Engineering)
**Generated:** 2025-11-13
**Specification:** `docs/specs/automatic-skill-evolution/spec.md`
**Feature Request:** `docs/features/automatic-skill-evolution.md`
**Research:** `docs/research/automatic-skill-evolution-intel.md`

---

## 📖 Context & Documentation

### Traceability Chain

**Feature Request → Research → Specification → This Plan**

1. **Original Feature Request:** docs/features/automatic-skill-evolution.md
   - **Problem:** Every feature coded from scratch, no learning mechanism, no code reuse system, redundant effort
   - **Solution:** Anthropic's "Skills as Code" pattern - automatic skill generation, discovery, and adaptation
   - **User Stories:** First implementation creates skill, subsequent implementation discovers and uses skill, skill evolution through reuse
   - **Success Criteria:** 10x speedup (7 min → 30 sec), 90% token reduction (80K → 8K), 80%+ skill reuse rate

2. **Research & Enhancement:** docs/research/automatic-skill-evolution-intel.md
   - **Validation:** Anthropic production: 98.7% token reduction (150K → 2K tokens)
   - **Technology Stack:** Python ast + ts-morph (extraction), Jaccard + Levenshtein + Cosine (similarity), jscodeshift (adaptation), Snyk/SonarQube (validation)
   - **Architecture:** Filesystem-based ./skills/, SKILL_REGISTRY.json, approval workflow (pending → approved → active)
   - **Competitive Differentiation:** Enforcement-first skills, task-level reuse, metadata transparency, institutional memory

3. **Formal Specification:** docs/specs/automatic-skill-evolution/spec.md
   - **5 Components:** Generation (REQ-GEN-001-007), Discovery (REQ-DISC-001-006), Adaptation (REQ-ADAPT-001-007), Validation (REQ-VAL-001-006), Management (REQ-MGT-001-006)
   - **Performance Requirements:** <500ms discovery, 20-40s adaptation, 10x speedup minimum
   - **Security Requirements:** Approval workflow, security scanning, audit trail
   - **20 Target Files:** 16 create, 4 modify

### Related Documentation

**Epic Tickets:**

- `.sage/tickets/SKILL-001.md` - Skill Generation (P0, 16h, foundational)
- `.sage/tickets/SKILL-002.md` - Skill Discovery (P0, 20h, depends on SKILL-001)
- `.sage/tickets/SKILL-003.md` - Skill Adaptation (P0, 24h, depends on SKILL-002)
- `.sage/tickets/SKILL-004.md` - Skill Validation (P1, 20h, security)
- `.sage/tickets/SKILL-005.md` - Skill Management (P1, 16h, depends on all)

**System Context:**

- MCP servers: `servers/sage-planning/` (to be enhanced with skill components)
- Commands: `commands/sage.plan.md`, `commands/sage.implement.md` (to be modified)

---

## 📊 Executive Summary

### Business Alignment

**Purpose:** Transform Sage-Dev into a self-improving system that learns from successful implementations, eliminating redundant work and accelerating repeated feature types.

**Value Proposition:**

- **10x Speedup:** Reduce repeated feature implementation from 5-10 minutes to 30 seconds
- **90% Token Reduction:** Decrease token usage from 80,000 to 8,000 on skill-based implementations
- **Cost Savings:** Token efficiency translates to direct API cost reduction (validated 98.7% reduction in Anthropic production)
- **Institutional Memory:** Skills persist across sessions, developers, and projects - knowledge survives turnover
- **Self-Improvement:** System learns optimal patterns automatically, quality improves over time

**Target Users:**

- **Individual Developers:** Faster iteration on similar features (auth variants, CRUD operations, API endpoints)
- **Development Teams:** Building repetitive patterns at scale (SaaS companies with CRUD/auth/payment patterns)
- **Enterprise Organizations:** Institutional memory, compliance-approved skill library, audit trails

### Technical Approach

**Architecture Pattern:** Filesystem-Based Skill Library with Centralized Registry

- **Rationale:** Anthropic's validated "Skills as Code" pattern - proven 98.7% token reduction in production
- **Storage:** `./skills/[name].ts` files with SKILL_META exports, `SKILL_REGISTRY.json` global index
- **Discovery:** Progressive tool discovery pattern - check filesystem before generating new code
- **Workflow:** Skill-first approach integrated into `/sage.plan` (discovery) and `/sage.implement` (generation)

**Technology Stack:** Research-Validated Open Source

- **Extraction:** Python `ast` module (built-in) + `ts-morph` library (TypeScript AST manipulation)
- **Similarity:** Multi-factor matching - Jaccard (tags 40%), Levenshtein (names 30%), Cosine (descriptions 30%)
- **Adaptation:** `jscodeshift` (Facebook-maintained, AST transformations) for JS/TS, `ast` tree rewriting for Python
- **Validation:** Snyk Code or SonarQube (SAST, AI-powered vulnerability detection)
- **Versioning:** Semantic versioning with `conventional commits` for automated MAJOR/MINOR/PATCH increments

**Implementation Strategy:** 5-Phase Incremental Rollout (2 weeks, Week 5-6)

1. **Phase 3.1 (Days 1-3):** Skill Generation - Extract core logic after success, save to ./skills/
2. **Phase 3.2 (Days 4-5):** Skill Discovery - Multi-factor similarity matching, rank by relevance
3. **Phase 3.3 (Days 6-7):** Skill Adaptation - AST-based transformations, 10x speedup delivery
4. **Phase 3.4 (Days 8-9):** Integration & Workflow - Update /sage.plan and /sage.implement commands
5. **Phase 3.5 (Day 10):** Validation & Metrics - Performance benchmarking, security scanning, acceptance testing

### Key Success Metrics

**Service Level Objectives (SLOs):**

- **Availability:** 99.9% (skill system downtime does NOT block from-scratch implementation)
- **Discovery Latency:** <500ms (p95) for libraries with <50 skills
- **Adaptation Time:** 20-40 seconds average (p50), <60 seconds (p95)
- **Extraction Accuracy:** >90% core logic vs boilerplate (manual review validation)

**Key Performance Indicators (KPIs):**

- **Speedup Ratio:** 10x minimum (7 min → 30 sec) on repeated feature types
- **Token Reduction:** 90% (80,000 → 8,000 tokens) on skill-based implementations
- **Skill Reuse Rate:** 80%+ on similar features (auth: 90%, CRUD: 85%, API: 80%)
- **Discovery Accuracy:** >90% true positives, <5% false positives, <10% false negatives
- **Similarity Matching:** Precision >90%, Recall >85%, F1 score >87%

**Business KPIs:**

- **Developer Satisfaction:** Survey after using skill system (target: 8/10 satisfaction)
- **Time Savings:** Cumulative hours saved via skill reuse (track monthly)
- **Token Cost Savings:** Cumulative cost reduction from 90% token efficiency (track in $$)
- **Knowledge Retention:** Skills surviving developer turnover (count reused skills after departure)

---

## 💻 Code Examples & Patterns

### Anthropic Skills as Code Pattern

**Source:** Anthropic Blog "Code Execution with MCP: Building More Efficient AI Agents" (Nov 2024)

**Pattern: Persistent Skills**

```typescript
// After successful implementation - save skill
export async function saveSheetAsCsv(sheetId: string) {
  const data = await gdrive.getSheet({ sheetId });
  const csv = data.map(row => row.join(',')).join('\n');
  await fs.writeFile(`./workspace/sheet-${sheetId}.csv`, csv);
  return `./workspace/sheet-${sheetId}.csv`;
}

// Save to filesystem
await fs.writeFile('./skills/save-sheet-as-csv.ts', skillCode);

// Later implementation - automatic discovery
import { saveSheetAsCsv } from './skills/save-sheet-as-csv';
const csvPath = await saveSheetAsCsv('abc123');
```

**Key Benefits:**

1. **Context Efficiency:** Load tools on-demand, filter data before model, execute complex logic in single step
2. **Intermediate Results:** Stay in execution environment, don't consume context
3. **Composable Functions:** Build library over time, import/combine as needed
4. **Persistent Memory:** Skills survive session boundaries, institutional knowledge accumulates

**Anthropic Recommendations:**

- Save agent-generated code that successfully completes tasks to `./skills/`
- Agent builds library of reusable, composable functions over time
- Filesystem-based discovery (progressive tool discovery pattern)
- Write intermediate results to files (resume work across sessions)

### Sage-Dev Implementation Patterns

**Pattern 1: Skill Generation (After Success)**

```typescript
// servers/sage-planning/skill-generator.ts
export async function generateSkill(implementation: Implementation): Promise<Skill> {
  // Validation
  if (!implementation.success || !implementation.testsPass) {
    throw new Error('Cannot generate skill from failed implementation');
  }

  // Extract core logic (AST traversal)
  const coreLogic = await extractCoreLogic(implementation.code);
  // - Parse to AST (Python: ast.parse(), TypeScript: ts-morph)
  // - Identify terminal nodes (actual logic, not boilerplate)
  // - Extract function signatures, dependencies, types
  // - Strip test code, debug statements, comments

  // Create skill
  const skill: Skill = {
    name: implementation.featureName,
    version: "1.0",
    code: coreLogic,
    metadata: {
      created: new Date().toISOString(),
      originalImplementation: implementation.ticketId,
      successfulImplementations: [implementation.featureName],
      reusedTimes: 0,
      successRate: 100,
      tags: implementation.tags,
      dependencies: implementation.dependencies,
      approvalStatus: {
        status: 'pending',
        notes: 'Awaiting manual review'
      }
    }
  };

  // Save to ./skills/
  const skillPath = `./skills/${skill.name}.ts`;
  await fs.writeFile(skillPath, formatSkill(skill));

  // Update registry
  await updateSkillRegistry(skill);

  console.log(`✓ Skill saved: ${skill.name} (v${skill.version})`);
  console.log(`⚠️  Status: pending approval (use /sage.skills approve ${skill.name})`);

  return skill;
}
```

**Pattern 2: Skill Discovery (Similarity Matching)**

```typescript
// servers/sage-planning/skill-discovery.ts
export async function discoverSkills(feature: FeatureSpec): Promise<SkillMatch[]> {
  const skillFiles = fs.readdirSync('./skills/').filter(f => f.endsWith('.ts'));
  const matches: SkillMatch[] = [];

  for (const skillFile of skillFiles) {
    const skill = await import(`./skills/${skillFile}`);
    const similarity = calculateSimilarity(feature, skill);

    if (similarity > 0.70) {  // Discovery threshold
      matches.push({ skill, similarity, metadata: skill.SKILL_META });
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}

function calculateSimilarity(feature: FeatureSpec, skill: Skill): number {
  let score = 0;

  // Tag overlap (Jaccard similarity) - 40% weight
  const featureTags = new Set(feature.tags);
  const skillTags = new Set(skill.metadata.tags);
  const intersection = [...featureTags].filter(t => skillTags.has(t)).length;
  const union = new Set([...featureTags, ...skillTags]).size;
  score += (intersection / union) * 0.4;

  // Name similarity (Levenshtein) - 30% weight
  const nameSimilarity = 1 - (levenshteinDistance(feature.name, skill.name) /
                               Math.max(feature.name.length, skill.name.length));
  score += nameSimilarity * 0.3;

  // Description similarity (Cosine) - 30% weight
  const descSimilarity = cosineSimilarity(
    tfidfVectorize(feature.description),
    tfidfVectorize(skill.metadata.description)
  );
  score += descSimilarity * 0.3;

  return score;
}
```

**Pattern 3: Skill Adaptation (AST Transformation)**

```typescript
// servers/sage-planning/skill-adapter.ts
export async function adaptSkill(
  skill: Skill,
  newFeature: FeatureSpec
): Promise<Implementation> {
  console.log(`Adapting skill: ${skill.name} (v${skill.version})`);

  // Load skill code
  const baseCode = skill.code;

  // Identify adaptation points (AST analysis)
  const adaptations = identifyAdaptations(baseCode, newFeature);
  // Example adaptations:
  // - Rename parameter: 'userId' → 'customerId'
  // - Update API endpoint: '/api/users' → '/api/customers'
  // - Modify validation: email regex → phone regex

  // Apply transformations (jscodeshift)
  let adaptedCode = baseCode;
  for (const adaptation of adaptations) {
    adaptedCode = await applyJscodeshiftTransform(adaptedCode, adaptation);
  }

  // Validate adapted code
  await validateSkill(adaptedCode);  // Syntax, type, security checks

  // Update metadata
  const updatedMetadata = {
    ...skill.metadata,
    reusedTimes: skill.metadata.reusedTimes + 1,
    successfulImplementations: [
      ...skill.metadata.successfulImplementations,
      newFeature.ticketId
    ],
    lastReused: new Date().toISOString()
  };

  // Save updated skill
  await updateSkillMetadata(skill.name, updatedMetadata);

  console.log(`✓ Skill adapted in ${Date.now() - startTime}ms`);

  return {
    code: adaptedCode,
    basedOnSkill: skill.name,
    adaptations: adaptations.length
  };
}
```

**Pattern 4: Skill-First Workflow (Integration)**

```typescript
// commands/sage.plan.ts (UPDATED)
export async function planImplementation(specification: Spec): Promise<Plan> {
  console.log('Planning implementation...');

  // STEP 1: Check for applicable skills (NEW)
  console.log('→ Checking skills...');
  const skillMatches = await discoverSkills(specification);

  if (skillMatches.length > 0) {
    console.log(`✓ Found ${skillMatches.length} applicable skill(s):`);

    for (const match of skillMatches.slice(0, 3)) {
      const pct = Math.round(match.similarity * 100);
      console.log(`  ${match.skill.name} (${pct}% match, ${match.metadata.reusedTimes} reuses)`);
    }

    // Use best match if high confidence
    const bestMatch = skillMatches[0];
    if (bestMatch.similarity > 0.85) {
      console.log(`→ Using ${bestMatch.skill.name} as base (high similarity)`);
      return await adaptSkill(bestMatch.skill, specification);
    } else if (bestMatch.similarity > 0.70) {
      // Prompt user for approval (70-85% confidence)
      const approved = await askUserApproval(bestMatch);
      if (approved) {
        return await adaptSkill(bestMatch.skill, specification);
      }
    }
  }

  // STEP 2: Generate plan from scratch (fallback)
  console.log('→ No applicable skills found, generating from scratch');
  return await generatePlanFromScratch(specification);
}
```

### Key Takeaways from Patterns

**From Anthropic Pattern:**

- Filesystem-based discovery is proven at scale (production validated)
- Skills must be executable code, not documentation
- Metadata critical for discovery and filtering
- Progressive tool discovery pattern reduces context overhead

**From Research Findings:**

- AST traversal with terminal node identification for clean extraction
- Multi-factor similarity outperforms single-metric approaches (research validated >90% accuracy)
- jscodeshift pattern: parse → traverse → modify → regenerate (preserves structure)
- Approval workflow essential for enterprise adoption (security compliance)

**Anti-Patterns to Avoid:**

- ❌ **Black-box skill generation:** No explainability, no user control
- ❌ **Over-reliance on skills:** Must have from-scratch fallback
- ❌ **Auto-approve all skills:** Security risk, malicious code injection
- ❌ **Global skill namespace:** Risk of name collisions, use registry
- ❌ **Implicit skill updates:** Breaking changes without versioning

---

## 🔧 Technology Stack

### Recommended Stack (from Research & Intel)

**Based on research from:** `docs/research/automatic-skill-evolution-intel.md`

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| **AST Extraction (Python)** | Python `ast` | Built-in (3.11+) | **Research:** Tree-structured LSTM decoder, terminal node identification, AST-based chunking with RAG. Built-in = zero dependencies, production-ready. |
| **AST Extraction (TypeScript)** | `ts-morph` | Latest | **Research:** Structure-aware code generation (StructCoder pattern), type-aware transformations, preserves target code structure. Industry standard for TS AST manipulation. |
| **Similarity (Jaccard)** | Custom implementation | N/A | **Research:** 40% weight, intersection/union for tag overlap, >0.70 discovery threshold, >0.85 auto-use threshold. Simple formula, no library needed. |
| **Similarity (Levenshtein)** | `string-similarity` or custom | 4.x | **Research:** 30% weight, most frequently used string similarity algorithm (2024 validation), order-sensitive, character-level precision. |
| **Similarity (Cosine)** | `natural` (Node) or `scipy` (Python) | Latest | **Research:** 30% weight, TF-IDF vectors, outperforms Jaccard for document similarity (academic paper matching). Semantic knowledge reflection. |
| **Code Transformation (JS/TS)** | `jscodeshift` | 0.15.x | **Research:** Facebook-maintained, AST-based codemods, surface syntax transformations, incremental application, automated rollback. Production-proven at Meta scale. |
| **Code Transformation (Python)** | Python `ast` | Built-in | **Research:** Tree rewriting, node replacement, code generation. Built-in, no dependencies. |
| **Security Scanning** | Snyk Code | Latest | **Research:** SAST, finds unsafe code 50x faster, AI-powered, pre-validated auto-fixes, GitHub Actions integration. 62% of orgs have severe vulnerabilities (Orca 2024). |
| **Alternative Security** | SonarQube | Latest | **Research:** AI Code Assurance (2024), validates AI-generated code for quality + security, deep static analysis, detects unique risks in generated code. |
| **Semantic Versioning** | `semver` (Node) or `semantic_version` (Python) | Latest | **Research:** Semantic Versioning 2.0.0 standard, automated via conventional commits, breaking change detection via golden files. |
| **Type Checking (Python)** | Pyright | Latest | **Research:** Microsoft-maintained, fast static type checker, strict mode validation, catches 90%+ type errors. |
| **Type Checking (TypeScript)** | `tsc` (TypeScript Compiler) | 5.x | **Research:** Official compiler, strict mode, type-aware transformations, golden files for API compatibility. |
| **Vector Embeddings (Optional)** | `code2vec` | Latest | **Research:** Distributed code representations via AST paths, proven for semantic search at >50 skills, fusion with LLM embeddings (2025 enhancement). **Phase 3.3+ only.** |

### Key Technology Decisions

**Decision 1: Filesystem-Based Skill Storage**

- **Choice:** `./skills/[name].ts` files + `SKILL_REGISTRY.json` global index
- **Rationale (from Research):** Anthropic validated pattern, 98.7% token reduction in production, progressive tool discovery, no database overhead, git history for versioning
- **Trade-offs:**
  - ✅ **Pros:** Simple, git-native, no DB setup, filesystem guarantees, atomic writes
  - ❌ **Cons:** No complex queries (use vector DB at >50 skills), no transactions (use file locking)

**Decision 2: Multi-Factor Similarity (Not Single Metric)**

- **Choice:** Combined score: Jaccard (40%) + Levenshtein (30%) + Cosine (30%)
- **Rationale (from Research):** Single metric <70% accuracy, multi-factor >90% accuracy (research validation), complements strengths (Jaccard=overlap, Levenshtein=edit distance, Cosine=semantic)
- **Thresholds:** 70-85% prompt user, >85% auto-use, <70% no match

**Decision 3: AST-Based Transformations (Not String Manipulation)**

- **Choice:** `jscodeshift` (JS/TS), `ast` tree rewriting (Python)
- **Rationale (from Research):** String manipulation breaks on formatting changes, AST preserves structure, type-aware, lossless transformations (OpenRewrite LST), Facebook production-proven
- **Implementation:** Parse → Traverse → Modify nodes → Regenerate code

**Decision 4: Approval Workflow (Not Auto-Approve)**

- **Choice:** pending → approved (manual review) → active (first successful use)
- **Rationale (from Research):** 62% of orgs have severe vulnerabilities (Orca 2024), enterprise requires audit trail, prevents malicious code injection, first-time skills highest risk
- **Trade-offs:**
  - ✅ **Pros:** Security compliance, audit trail, human oversight, phased rollout
  - ❌ **Cons:** Approval latency (mitigate with automated scanning to pre-filter)

**Decision 5: Semantic Versioning (Not Date-Based)**

- **Choice:** MAJOR.MINOR.PATCH with conventional commits automation
- **Rationale (from Research):** Semantic Versioning 2.0.0 standard, clear breaking change signals, automated via `semantic-release`, backward compatibility tests, golden files for API surface validation
- **Automation:** `fix:` → PATCH, `feat:` → MINOR, `BREAKING CHANGE:` → MAJOR

### Research Citations

**Anthropic Production Validation:**

- **Citation:** "Code Execution with MCP: Building More Efficient AI Agents" (Nov 2024)
- **Finding:** 150,000 → 2,000 tokens (98.7% reduction) with Skills as Code pattern
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 268-297

**Multi-Factor Similarity:**

- **Citation:** "Enhancing Python Code Embeddings: Fusion of Code2vec with Large Language Models" (2025)
- **Finding:** Cosine outperforms Jaccard for document similarity, multi-factor improves precision
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 78-111

**AST-Based Extraction:**

- **Citation:** "An AST Structure Enhanced Decoder for Code Generation" (IEEE)
- **Finding:** Complete AST traversal verifies correctness, terminal node identification for semantic chunks
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 52-76

**Security Scanning:**

- **Citation:** Orca 2024 State of Cloud Security Report
- **Finding:** 62% of organizations have severe vulnerabilities in code repositories
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 172-205

**Code Transformation:**

- **Citation:** Martin Fowler: "Refactoring with Codemods to Automate API Changes"
- **Finding:** jscodeshift pattern for lossless transformations, OpenRewrite LST for type attribution
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 136-169

### Alternatives Considered (from Research)

**Option 2: Database-Based Skill Storage (PostgreSQL + Vector Extension)**

- **Pros:** Complex queries, vector similarity search, transactions, concurrent access
- **Cons:** Additional infrastructure, database setup/migration, not git-native, Anthropic uses filesystem
- **Why Not Chosen:** Filesystem pattern proven at Anthropic scale, simpler setup, git history sufficient for versioning, migrate to vector DB only at >50 skills

**Option 3: Single-Metric Similarity (Jaccard Only)**

- **Pros:** Simpler implementation, faster computation, no NLP libraries
- **Cons:** <70% accuracy (research finding), misses semantic similarity, sensitive to tag choice
- **Why Not Chosen:** Research validates multi-factor >90% accuracy, marginal complexity increase, significant accuracy gain

**Option 4: Line-Level Suggestions (GitHub Copilot Pattern)**

- **Pros:** Real-time, in-editor, familiar UX
- **Cons:** No institutional memory, regenerated each time, no explicit skill library, no task-level reuse
- **Why Not Chosen:** Sage-Dev differentiation is task-level reuse (10x speedup) vs line-level (10% typing reduction)

---

## 🏗️ Architecture Design

### Component Architecture

**Architecture Pattern:** Modular Filesystem-Based Skill Library with Plugin Integration

**Rationale:**

- **Anthropic Validated:** Production deployment proves scalability and token efficiency
- **Git-Native:** Filesystem storage enables version control, branching, rollback
- **Progressive Discovery:** Load tools on-demand, reduce context overhead
- **Plugin Architecture:** MCP servers provide skill operations as tools (skill-generator, skill-discovery, skill-adapter)

**System Design:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     Sage-Dev System                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐          ┌──────────────────┐               │
│  │  /sage.plan    │─────────▶│ Skill Discovery  │               │
│  │  Command       │          │  (similarity)    │               │
│  └────────────────┘          └────────┬─────────┘               │
│                                       │                          │
│                                       ▼                          │
│  ┌────────────────┐          ┌──────────────────┐               │
│  │ /sage.implement│◀─────────│  Skill Adapter   │               │
│  │   Command      │          │  (transform)     │               │
│  └───────┬────────┘          └────────┬─────────┘               │
│          │                            │                          │
│          │ On Success                 │                          │
│          ▼                            │                          │
│  ┌────────────────┐                  │                          │
│  │ Skill Generator│                  │                          │
│  │  (extract AST) │                  │                          │
│  └───────┬────────┘                  │                          │
│          │                            │                          │
│          └────────────────┬───────────┘                          │
│                           ▼                                      │
│                  ┌─────────────────┐                             │
│                  │   ./skills/     │                             │
│                  │ ┌─────────────┐ │                             │
│                  │ │  skill1.ts  │ │                             │
│                  │ │  skill2.ts  │ │                             │
│                  │ │  skill3.ts  │ │                             │
│                  │ │  REGISTRY   │ │◀───┐                        │
│                  │ └─────────────┘ │    │                        │
│                  └─────────────────┘    │                        │
│                                         │                        │
│  ┌────────────────┐          ┌─────────┴────────┐               │
│  │ /sage.skills   │─────────▶│ Skill Management │               │
│  │  approve       │          │  (CRUD, version) │               │
│  │  list, version │          └──────────────────┘               │
│  └────────────────┘                                              │
│          ▲                                                       │
│          │                                                       │
│  ┌───────┴────────┐                                              │
│  │ Skill Validator│                                              │
│  │ (security scan)│                                              │
│  └────────────────┘                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow:**

```
Implementation Workflow (Skill-First):

1. User: /sage.plan "admin authentication"
   ↓
2. Skill Discovery: Scan ./skills/, calculate similarity
   ↓
3. Found: user-authentication.ts (95% match)
   ↓
4. Prompt: "Use skill? [Y/n]" → User: Y
   ↓
5. Check: approvalStatus === "approved" → ✓
   ↓
6. Skill Adapter: Load skill, identify adaptations, apply transforms
   ↓
7. Validate: Syntax, types, security → ✓
   ↓
8. Implement: Generate adapted code in 30 sec (vs 7 min)
   ↓
9. Update: skill.reusedTimes++, skill.successfulImplementations.push()
   ↓
10. Result: 10x speedup, 90% token reduction

Generation Workflow (After Success):

1. User: /sage.implement TICKET-AUTH-001
   ↓
2. Implementation: Complete feature, tests pass → ✓
   ↓
3. Prompt: "Save as reusable skill? [Y/n]" → User: Y
   ↓
4. Skill Generator: Extract core logic via AST
   ↓
5. Create: SKILL_META (version 1.0, tags, dependencies, approval: pending)
   ↓
6. Save: ./skills/user-authentication.ts
   ↓
7. Update: SKILL_REGISTRY.json (add entry, checksum)
   ↓
8. Skill Validator: Security scan (async)
   ↓
9. Status: Pending approval (manual review required)
   ↓
10. Future: Skill available for discovery once approved
```

### Component Breakdown

**Component 1: Skill Generator** (SKILL-001, P0, 16h)

- **Purpose:** Extract reusable core logic from successful implementations
- **Technology:** Python `ast` + `ts-morph` for AST parsing, terminal node identification
- **Pattern:** Tree-structured LSTM decoder pattern from research
- **Files:**
  - `servers/sage-planning/skill-generator.ts` - Main generation orchestration
  - `servers/sage-planning/ast-extractor.ts` - AST parsing utilities (Python/TypeScript)
  - `servers/sage-planning/metadata-builder.ts` - SKILL_META construction
- **Interfaces:**
  - **Input:** `Implementation` (ticketId, featureName, code, tests, success, testsPass, tags, dependencies)
  - **Output:** `Skill` (name, version, path, metadata, checksum)
- **Dependencies:** None (foundational component)

**Component 2: Skill Discovery** (SKILL-002, P0, 20h)

- **Purpose:** Find matching skills before generating new implementations
- **Technology:** Jaccard (40%) + Levenshtein (30%) + Cosine (30%) multi-factor similarity
- **Pattern:** Progressive tool discovery pattern (Anthropic)
- **Files:**
  - `servers/sage-planning/skill-discovery.ts` - Discovery orchestration, ranking
  - `servers/sage-planning/similarity-algorithms.ts` - Jaccard, Levenshtein, Cosine implementations
- **Interfaces:**
  - **Input:** `FeatureSpec` (name, description, tags, requirements)
  - **Output:** `SkillMatch[]` (skill, similarity, metadata, matchFactors)
- **Dependencies:** SKILL-001 (requires skills in ./skills/ to discover)

**Component 3: Skill Adapter** (SKILL-003, P0, 24h)

- **Purpose:** Modify existing skills to match new requirements (delivers 10x speedup)
- **Technology:** `jscodeshift` (JS/TS), `ast` tree rewriting (Python), AST-based transformations
- **Pattern:** Codemods pattern from research (parse → traverse → modify → regenerate)
- **Files:**
  - `servers/sage-planning/skill-adapter.ts` - Adaptation orchestration, metadata updates
  - `servers/sage-planning/ast-transformer.ts` - jscodeshift integration, AST node manipulation
- **Interfaces:**
  - **Input:** `Skill` + `FeatureSpec`
  - **Output:** `Implementation` (code, basedOnSkill, adaptations count)
- **Dependencies:** SKILL-002 (adapts discovered skills)

**Component 4: Skill Validator** (SKILL-004, P1, 20h)

- **Purpose:** Ensure skill security and quality through automated validation and approval workflow
- **Technology:** Pyright + tsc (type checking), Snyk Code or SonarQube (security scanning)
- **Pattern:** Approval workflow (pending → approved → active), SAST integration
- **Files:**
  - `servers/sage-planning/skill-validator.ts` - Validation orchestration (syntax, types, security)
  - `servers/sage-planning/security-scanner.ts` - Snyk/SonarQube API integration, pattern-based detection
- **Interfaces:**
  - **Input:** `Skill` or `string` (code)
  - **Output:** `ValidationResult` (syntax, types, security, approvalStatus)
- **Dependencies:** Can run in parallel with SKILL-003 (validates during adaptation)

**Component 5: Skill Manager** (SKILL-005, P1, 16h)

- **Purpose:** Manage skill lifecycle, versioning, and metadata
- **Technology:** Semantic versioning, `SKILL_REGISTRY.json` global index, conventional commits
- **Pattern:** CRUD operations, semantic versioning automation
- **Files:**
  - `servers/sage-planning/skill-manager.ts` - Registry CRUD operations
  - `servers/sage-planning/version-manager.ts` - Semantic versioning (parse, compare, increment)
  - `skills/SKILL_REGISTRY.json` - Global skill index
- **Interfaces:**
  - **Input:** Management commands (list, approve, reject, version, delete, validate)
  - **Output:** Updated registry, skill metadata, version numbers
- **Dependencies:** SKILL-001, SKILL-002, SKILL-003, SKILL-004 (integrates all components)

### Architecture Decisions

**Decision 1: Filesystem Storage (Not Database)**

- **Choice:** `./skills/[name].ts` files + `SKILL_REGISTRY.json`
- **Rationale:** Anthropic validated pattern, git-native versioning, no database overhead, atomic filesystem operations, proven at production scale
- **Implementation:** File locking for concurrent writes, checksums for integrity, git commits for history
- **Trade-offs:**
  - ✅ **Pros:** Simple setup, git history, no migrations, filesystem guarantees
  - ❌ **Cons:** No complex queries (mitigate: vector DB at >50 skills), no transactions (mitigate: file locking)

**Decision 2: Plugin Architecture (MCP Servers)**

- **Choice:** Skill operations as MCP tools (skill-generator, skill-discovery, skill-adapter)
- **Rationale:** Anthropic MCP pattern, decoupled from core commands, reusable across workflows, parallel execution support
- **Implementation:** `servers/sage-planning/` with skill-specific tools
- **Integration:** `/sage.plan` and `/sage.implement` commands call MCP tools

**Decision 3: Approval Workflow (Not Auto-Approve)**

- **Choice:** pending (manual review) → approved (usable) → active (successfully reused)
- **Rationale:** Enterprise security requirement, 62% orgs have vulnerabilities (Orca 2024), audit trail, prevents malicious injection
- **Implementation:** `approvalStatus` in SKILL_META, check before automatic use, `/sage.skills approve` command
- **Trade-offs:**
  - ✅ **Pros:** Security compliance, human oversight, phased rollout
  - ❌ **Cons:** Approval latency (mitigate: automated scanning pre-filter, show scan results for faster review)

**Decision 4: Multi-Factor Similarity (Not Single Metric)**

- **Choice:** Jaccard (40%) + Levenshtein (30%) + Cosine (30%)
- **Rationale:** Research validates >90% accuracy (vs <70% single metric), complements strengths (structural + edit distance + semantic)
- **Implementation:** `similarity-algorithms.ts` with caching, thresholds: 70-85% prompt, >85% auto-use
- **Trade-offs:**
  - ✅ **Pros:** High accuracy, robust to variations
  - ❌ **Cons:** More complex (mitigate: well-tested library functions), slower (mitigate: caching)

**Decision 5: AST-Based Adaptation (Not String Manipulation)**

- **Choice:** `jscodeshift` (JS/TS), `ast` tree rewriting (Python)
- **Rationale:** String manipulation fragile (breaks on formatting), AST preserves structure, type-aware, lossless (OpenRewrite LST), production-proven (Facebook)
- **Implementation:** Parse → Traverse → Modify nodes → Regenerate, validate after transformation
- **Trade-offs:**
  - ✅ **Pros:** Robust, structure-preserving, type-safe
  - ❌ **Cons:** More complex (mitigate: jscodeshift library handles complexity), requires AST knowledge (mitigate: examples in research)

---

## 📋 Implementation Roadmap

### Phase 3.1: Skill Generation (Week 5, Days 1-3, 24h)

**Epic Ticket:** SKILL-001 (P0, 16h estimate, +8h buffer)

**Deliverables:**

1. `skill-generator.ts` - Main generation orchestration
   - Validate implementation success and tests passing
   - Extract core logic via AST
   - Create SKILL_META with metadata
   - Save to ./skills/[name].ts
   - Update SKILL_REGISTRY.json

2. `ast-extractor.ts` - AST parsing utilities
   - Python: `ast.parse()`, `ast.NodeVisitor` for traversal, terminal node identification
   - TypeScript: `ts-morph` for parsing, type extraction, structure preservation
   - Strip boilerplate: test code, debug statements, comments

3. `metadata-builder.ts` - SKILL_META construction
   - version: "1.0" (initial), tags, dependencies, originalImplementation
   - approvalStatus: {status: "pending", notes: "Awaiting manual review"}
   - Created/updated timestamps

4. Update `sage.implement.md` - Add post-success skill generation prompt
   - After tests pass: "Save as reusable skill? [Y/n]"
   - Display estimated savings: "Future implementations will be 10x faster"
   - Call skill-generator tool

**Success Criteria:**

- Extraction accuracy >90% (manual review of 10+ generated skills)
- Skills saved correctly to ./skills/ with SKILL_META export
- Registry updated with checksums and metadata
- Extraction completes in <5 seconds for typical implementations
- Zero test failures

**Testing Strategy:**

- **Unit Tests:** Test extraction on 5+ feature types (auth, CRUD, API, payment, validation)
- **Integration Test:** Implement feature → generate skill → verify file created → verify registry updated
- **Manual Review:** Compare extracted core logic to original implementation, verify no boilerplate

**Risks & Mitigation:**

- **Risk:** Extraction includes boilerplate (test code, debug statements)
  - **Mitigation:** Terminal node identification pattern from research, whitelist/blacklist AST node types
- **Risk:** Language-specific extraction complexity (Python vs TypeScript)
  - **Mitigation:** Separate extractors, reference research patterns, incremental testing per language

**Day-by-Day Breakdown:**

- **Day 1:** `ast-extractor.ts` - Python AST parsing, terminal node identification (8h)
- **Day 2:** `ast-extractor.ts` - TypeScript ts-morph integration, type extraction (8h)
- **Day 3:** `skill-generator.ts` + `metadata-builder.ts`, registry update, prompt integration (8h)

### Phase 3.2: Skill Discovery (Week 5, Days 4-5, 16h)

**Epic Ticket:** SKILL-002 (P0, 20h estimate, use Phase 3.1 buffer)

**Deliverables:**

1. `skill-discovery.ts` - Discovery orchestration
   - Scan ./skills/ directory for all .ts files
   - Load SKILL_META from each skill
   - Calculate similarity scores via similarity-algorithms
   - Filter by threshold (>70% for discovery)
   - Rank by similarity descending
   - Return top N matches (default: 5)

2. `similarity-algorithms.ts` - Multi-factor similarity
   - **Jaccard Similarity (40%):** intersection(tags) / union(tags)
   - **Levenshtein Distance (30%):** Edit distance normalized by max length
   - **Cosine Similarity (30%):** TF-IDF vectors, cosine of angle
   - **Combined Score:** (J × 0.4) + (L × 0.3) + (C × 0.3)
   - **Caching:** Hash-based cache for similarity scores

3. Update `sage.plan.md` - Add skill-first workflow
   - Before planning: Call skill-discovery tool
   - Display top 3 matches with similarity percentages
   - If >85%: Auto-suggest with user confirmation
   - If 70-85%: Prompt user for approval
   - If <70%: Proceed with from-scratch planning

**Success Criteria:**

- Discovery completes in <500ms for libraries with <50 skills
- Similarity matching accuracy >90% true positives, <5% false positives (test on 50+ feature pairs)
- Top 3 matches displayed with clear metadata
- Caching reduces repeat discovery time by 80%
- Zero crashes on malformed SKILL_META

**Testing Strategy:**

- **Unit Tests:** Test each similarity algorithm independently (Jaccard, Levenshtein, Cosine)
- **Integration Test:** Create 10 skills, query with similar/dissimilar features, verify ranking correctness
- **Performance Test:** Benchmark discovery time with 10, 25, 50 skills, verify <500ms
- **Accuracy Test:** 50+ feature pairs (25 similar, 25 dissimilar), measure precision/recall/F1

**Risks & Mitigation:**

- **Risk:** Similarity accuracy <90% (false positives block user, false negatives miss opportunities)
  - **Mitigation:** Multi-factor algorithm from research (validated >90%), user approval for 70-85%, A/B test thresholds
- **Risk:** Discovery latency >500ms at scale
  - **Mitigation:** Caching (80% reduction), tag-based pre-filtering, defer vector embeddings to Phase 3.3+

**Day-by-Day Breakdown:**

- **Day 4:** `similarity-algorithms.ts` - Jaccard, Levenshtein, Cosine implementations, caching (8h)
- **Day 5:** `skill-discovery.ts` - Orchestration, ranking, filtering, `/sage.plan` integration (8h)

### Phase 3.3: Skill Adaptation (Week 6, Days 1-2, 20h)

**Epic Ticket:** SKILL-003 (P0, 24h estimate, +4h buffer)

**Deliverables:**

1. `skill-adapter.ts` - Adaptation orchestration
   - Load base skill code from ./skills/
   - Validate approval status (must be "approved")
   - Identify adaptation points via AST analysis
   - Apply transformations via ast-transformer
   - Validate adapted code (syntax, types, security)
   - Update skill metadata (reusedTimes++, successfulImplementations.push())
   - Measure adaptation time and token usage
   - Rollback on failure (preserve original skill)

2. `ast-transformer.ts` - AST-based code modification
   - **JavaScript/TypeScript:** jscodeshift integration
     - Parse to AST, traverse nodes, modify specific nodes, regenerate code
     - Adaptations: parameter renaming, API endpoint updates, config value changes
   - **Python:** ast tree rewriting
     - ast.parse(), ast.NodeTransformer for modifications, ast.unparse()
   - Validate transformations preserve types and structure

**Success Criteria:**

- Adaptation completes in 20-40 seconds average (validate on 20+ adaptations)
- Token usage: 8,000-12,000 (90% reduction vs 80,000 from scratch)
- Achieves 10x speedup minimum vs from-scratch (7 min → 30 sec validated)
- Adaptation correctness: 100% (all tests pass after adaptation)
- Rollback works on failure (zero skill corruption)

**Testing Strategy:**

- **Unit Tests:** Test jscodeshift transformations (parameter renaming, endpoint updates, config changes)
- **Integration Test:** Discover skill → adapt to new feature → validate code → run tests → verify 100% pass rate
- **Performance Test:** Measure adaptation time (target: 20-40s), token usage (target: 8K-12K), speedup ratio (target: 10x)
- **Rollback Test:** Simulate failures (syntax error, test failure, validation error), verify skill not corrupted

**Risks & Mitigation:**

- **Risk:** Adaptation introduces bugs (tests fail, runtime errors)
  - **Mitigation:** Validation pipeline (syntax, types, security), test execution before accepting adaptation, rollback on failure
- **Risk:** Over-adaptation breaks core logic (changes too much)
  - **Mitigation:** AST-based transformations preserve structure, limit adaptation to specific node types (identifiers, literals, not logic)
- **Risk:** Speedup <10x (adaptation too slow or token-heavy)
  - **Mitigation:** Profile adaptation steps, optimize AST traversal, cache transformation patterns

**Day-by-Day Breakdown:**

- **Day 6:** `ast-transformer.ts` - jscodeshift integration (JS/TS), parameter/endpoint/config adaptations (10h)
- **Day 7:** `skill-adapter.ts` - Orchestration, validation pipeline, metadata updates, rollback logic (10h)

### Phase 3.4: Integration & Workflow (Week 6, Days 3-4, 18h)

**Epic Tickets:** SKILL-004 (P1, 20h), SKILL-005 (P1, 16h)

**Deliverables:**

**Validation (SKILL-004):**

1. `skill-validator.ts` - Validation orchestration
   - Syntax validation: AST parse succeeds (Python: ast.parse(), TypeScript: tsc)
   - Type validation: Pyright (Python), tsc strict mode (TypeScript)
   - Security scanning: Snyk Code or SonarQube API integration
   - Approval workflow: pending → approved (manual) → active (first successful use)

2. `security-scanner.ts` - Security scanning
   - **Pattern-Based Detection (Basic):**
     - Hardcoded credentials: Regex for API keys, passwords, tokens
     - SQL injection: String concatenation in SQL queries
     - Command injection: subprocess without shell=False, unsafe exec()
   - **Tool Integration (Advanced):** Snyk Code or SonarQube API
   - False positive rate target: <5%

3. `commands/sage.skills.md` - Management commands
   - `/sage.skills approve [name]` - Approve pending skill (display code + scan results)
   - `/sage.skills reject [name]` - Reject skill, block usage
   - `/sage.skills validate` - Check registry integrity, repair if needed

**Management (SKILL-005):**

1. `skills/SKILL_REGISTRY.json` - Global skill index
   - Structure: {version: "1.0", skills: [], totalSkills, totalReuses, averageSuccessRate}
   - Per-skill: {name, path, metadata, checksum: "sha256:..."}

2. `skill-manager.ts` - Registry CRUD operations
   - Add skill (on generation), update skill (on adaptation/approval), delete skill, query skills
   - Checksum validation on read/write (sha256)
   - File locking for concurrent writes

3. `version-manager.ts` - Semantic versioning
   - Parse version strings (MAJOR.MINOR.PATCH)
   - Compare versions (semver.gt, semver.gte, etc.)
   - Increment versions: patch (bug fixes), minor (features), major (breaking changes)
   - Integrate with conventional commits: `fix:` → PATCH, `feat:` → MINOR, `BREAKING CHANGE:` → MAJOR

4. Expand `commands/sage.skills.md` - All management commands
   - `/sage.skills list` - View all skills with metadata (version, reuse count, success rate, approval status)
   - `/sage.skills version [name] [type]` - Increment version (patch|minor|major)
   - `/sage.skills delete [name]` - Remove skill from library

**Success Criteria:**

- **Validation:**
  - Security scan completes in <10 seconds
  - False positive rate <5% (validate on 50+ skills)
  - Approval workflow enforced (unapproved skills blocked from auto-use)
  - Audit trail maintained (reviewer, reviewDate, notes)

- **Management:**
  - Registry operations complete in <100ms
  - Checksums detect tampering (test with manual file edits)
  - Semantic versioning works correctly (test all increment types)
  - All management commands functional

**Testing Strategy:**

- **Validation Tests:**
  - Security: Test detection of hardcoded credentials, SQL injection, command injection
  - Approval: Attempt auto-use of pending skill (should block), approve skill (should allow)
  - False Positives: Test safe code patterns, verify <5% false alarm rate

- **Management Tests:**
  - Registry: Add/update/delete skills, verify consistency, checksum validation
  - Versioning: Increment versions (patch, minor, major), verify correctness
  - Commands: Test all `/sage.skills` commands, verify output format

**Risks & Mitigation:**

- **Risk:** Security scanning too many false positives (blocks safe code)
  - **Mitigation:** Pattern-based rules tuned to <5% FP rate, Snyk/SonarQube AI filtering, user override option
- **Risk:** Approval workflow delays adoption (users skip approval)
  - **Mitigation:** Automated scanning results displayed for fast manual review, consider auto-approve for non-critical skills (configurable)

**Day-by-Day Breakdown:**

- **Day 8:** Validation - `skill-validator.ts`, `security-scanner.ts`, pattern-based detection (9h)
- **Day 9:** Management - `skill-manager.ts`, `version-manager.ts`, registry operations, `/sage.skills` commands (9h)

### Phase 3.5: Validation & Metrics (Week 6, Day 5, 8h)

**Deliverables:**

1. **Integration Tests** - End-to-end workflow validation
   - **Test 1:** Implement feature → generate skill → discover skill → adapt skill → validate speedup
   - **Test 2:** Multiple feature types (auth, CRUD, API) → verify skill generation and reuse
   - **Test 3:** Skill approval workflow → pending → approve → use automatically
   - **Test 4:** Skill versioning → patch, minor, major increments → rollback to previous version

2. **Performance Benchmarking** - Validate success metrics
   - **Speedup Ratio:** Implement from scratch (measure time, tokens) → Implement with skill (measure time, tokens) → Calculate ratio (target: 10x)
   - **Token Reduction:** First implementation: 80K tokens → Skill-based: 8K tokens (target: 90% reduction)
   - **Discovery Latency:** Measure discovery time at 10, 25, 50 skills (target: <500ms)
   - **Adaptation Time:** Measure adaptation time across 20+ adaptations (target: 20-40s average)

3. **Security Validation** - Snyk/SonarQube integration
   - Scan all generated skills for vulnerabilities
   - Validate false positive rate <5%
   - Test approval workflow enforcement

4. **Documentation** - Implementation summary
   - Update `ARCHITECTURE.md` with skill system design
   - Create `PHASE_3_RESULTS.md` with metrics validation
   - Update `README.md` with skill-first workflow instructions

**Success Criteria:**

- All integration tests pass (zero failures)
- 10x speedup validated on repeated features (auth, CRUD, API)
- 90% token reduction validated (80K → 8K)
- Skill reuse rate >80% on similar features
- Discovery accuracy >90% (precision/recall)
- Zero critical security vulnerabilities in approved skills

**Testing Matrix:**

| Test Case | First Implementation | Skill-Based Implementation | Speedup | Token Reduction |
|-----------|---------------------|----------------------------|---------|-----------------|
| User Auth | 7 min, 80K tokens | 30 sec, 8K tokens | 14x | 90% |
| Admin Auth | 7 min, 80K tokens | 30 sec, 8K tokens | 14x | 90% |
| User CRUD | 8 min, 85K tokens | 35 sec, 9K tokens | 13.7x | 89.4% |
| Product CRUD | 8 min, 85K tokens | 35 sec, 9K tokens | 13.7x | 89.4% |
| POST Endpoint | 6 min, 75K tokens | 28 sec, 7.5K tokens | 12.9x | 90% |
| PUT Endpoint | 6 min, 75K tokens | 28 sec, 7.5K tokens | 12.9x | 90% |

**Go/No-Go Decision:**

- **GO:** 10x speedup validated, >90% similarity accuracy, 80%+ reuse rate, zero critical security issues
- **NO-GO:** <5x speedup, <70% similarity accuracy, <50% reuse rate, critical security vulnerabilities

**Day Breakdown:**

- **Day 10:** Integration tests (3h), performance benchmarking (3h), security validation (1h), documentation (1h)

---

## ⚠️ Risk Management

| Risk | Impact | Likelihood | Mitigation | Owner |
|------|--------|------------|------------|-------|
| **Skill matching accuracy <90%** | High (false positives waste time, false negatives miss opportunities) | Medium | Multi-factor similarity (Jaccard + Levenshtein + Cosine) from research (validated >90%), user approval for 70-85% confidence, A/B test thresholds, manual override | Skill Discovery Lead |
| **Generated skills have bugs** | High (corrupted skill library, failed implementations) | Medium | Approval workflow (pending → approved → active), validation pipeline (syntax, type, security), sandboxed execution for first-time use, rollback on failure | Skill Validation Lead |
| **Agent over-relies on skills** | Medium (inappropriate skill use, poor adaptations) | Low | Confidence thresholds (70% discovery, 85% auto-use), user override option (force from-scratch), similarity score transparency, adaptation review | Skill Adapter Lead |
| **Skill proliferation (100s of skills)** | Medium (slow discovery, library bloat) | Low | Skill consolidation (merge similar skills), deprecation workflow, categories/tags for filtering, vector embeddings at >50 skills (code2vec) | Skill Management Lead |
| **Discovery latency >1s** | Low (user experience degradation) | Low | Vector embeddings (code2vec), caching (80% reduction), tag-based pre-filtering, incremental indexing | Skill Discovery Lead |
| **Security vulnerabilities in skills** | Critical (malicious code execution, data breaches) | Medium | Mandatory security scanning (Snyk/SonarQube), approval workflow enforcement, automated pattern detection (credentials, SQL injection, command injection), audit trail | Security Team |
| **Registry corruption** | High (skill library unusable) | Low | Checksums (sha256), git history backup, automatic recovery from git, validation on read/write, file locking | Skill Management Lead |
| **Adaptation introduces bugs** | High (tests fail, runtime errors) | Medium | Validation pipeline (syntax, types, security), test execution before accepting, rollback on failure, AST-based transformations preserve structure | Skill Adapter Lead |
| **Approval workflow delays adoption** | Medium (users skip skills, reduced reuse rate) | Medium | Automated scanning results displayed for fast review, configurable auto-approve for non-critical skills, SLA for approval (target: <24h) | Product Owner |
| **Extraction includes boilerplate** | Medium (skill quality issues) | Low | Terminal node identification pattern from research, whitelist/blacklist AST node types, manual review of first 10 generated skills | Skill Generator Lead |
| **Speedup <10x** | High (value proposition not delivered) | Low | Profile adaptation steps, optimize AST traversal, cache transformation patterns, measure continuously | Tech Lead |

---

## 📚 References & Traceability

### Source Documentation

**Feature Request:**

- `docs/features/automatic-skill-evolution.md`
  - Problem: Every feature coded from scratch, no learning mechanism
  - User stories: First implementation creates skill, subsequent discovers and uses
  - Success criteria: 10x speedup, 90% token reduction, 80%+ reuse rate

**Research & Intelligence:**

- `docs/research/automatic-skill-evolution-intel.md`
  - **Section: Technology Landscape** (lines 50-297) - AST extraction, similarity algorithms, code adaptation, validation, versioning
  - **Section: Competitive Analysis** (lines 298-378) - GitHub Copilot, CodeWhisperer, TabNine, Sage-Dev differentiation
  - **Section: Technical Architecture** (lines 379-625) - Directory structure, metadata schema, workflows, performance validation
  - **Section: Implementation Roadmap** (lines 748-825) - Phase 3.1-3.5 breakdown, week-by-week tasks

**Specification:**

- `docs/specs/automatic-skill-evolution/spec.md`
  - **Section 2:** Functional Requirements (5 components, 30 requirements)
  - **Section 3:** Non-Functional Requirements (performance, security, scalability)
  - **Section 4:** Features & Flows (3 key user flows)
  - **Section 5:** Acceptance Criteria (6 categories, measurable targets)
  - **Section 6:** Dependencies (technology stack, phase dependencies)

### Research Citations

**Anthropic Skills as Code Pattern:**

- **Citation:** "Code Execution with MCP: Building More Efficient AI Agents" (Nov 2024)
- **URL:** <https://www.anthropic.com/engineering/code-execution-with-mcp>
- **Finding:** 150,000 → 2,000 tokens (98.7% reduction) with Skills as Code + Code Execution pattern
- **Application:** Filesystem-based ./skills/ storage, progressive tool discovery, persistent functions
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 268-297

**AST-Based Code Extraction:**

- **Citation:** "An AST Structure Enhanced Decoder for Code Generation" (IEEE)
- **Finding:** Complete AST traversal verifies program correctness, terminal node identification for semantic chunking
- **Application:** Extraction logic for skill-generator.ts, distinguish core logic from boilerplate
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 52-76

**Multi-Factor Similarity Matching:**

- **Citation:** "Enhancing Python Code Embeddings: Fusion of Code2vec with Large Language Models" (2025)
- **Finding:** Cosine similarity outperforms Jaccard for document similarity, multi-factor improves precision
- **Application:** Combined score: Jaccard (40%) + Levenshtein (30%) + Cosine (30%)
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 78-111

**Code Transformation with Codemods:**

- **Citation:** Martin Fowler: "Refactoring with Codemods to Automate API Changes"
- **Finding:** jscodeshift pattern for lossless transformations, OpenRewrite LST for type attribution
- **Application:** skill-adapter.ts AST-based transformations, preserve structure and types
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 136-169

**Security Scanning for AI-Generated Code:**

- **Citation:** Orca 2024 State of Cloud Security Report
- **Finding:** 62% of organizations have severe vulnerabilities in code repositories
- **Application:** Mandatory Snyk/SonarQube scanning, approval workflow, pattern-based detection
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 172-205

**Semantic Versioning Automation:**

- **Citation:** Semantic Versioning 2.0.0 Specification
- **Finding:** MAJOR (breaking), MINOR (backward-compatible), PATCH (bug fixes), conventional commits automation
- **Application:** version-manager.ts, automated version increments via commit message parsing
- **Source:** docs/research/automatic-skill-evolution-intel.md, lines 208-242

### Related Components

**Dependencies:**

- **Phase 1:** MCP Server Infrastructure (complete) - Required for code execution and skill generation
- **Phase 2:** Context Optimization & Caching (complete) - Required for pattern matching and similarity caching
- **MCP Servers:** `servers/sage-planning/` - To be enhanced with skill-generator, skill-discovery, skill-adapter, skill-validator, skill-manager tools
- **Commands:** `commands/sage.plan.md`, `commands/sage.implement.md` - To be updated with skill-first workflow

**Dependents (Enables):**

- **Phase 4:** Parallel Agent Orchestration - Skills used in parallel workflows for maximum efficiency
- **Cross-Session Memory:** Skills persist across sessions, building institutional knowledge
- **Team Knowledge:** Skills shared across developers, onboarding acceleration

---

**Blueprint Status:** Complete - Ready for /sage.tasks breakdown
**Next Phase:** /sage.tasks automatic-skill-evolution
**Priority:** P0 (Critical - foundational for self-improvement)
**Confidence:** High (98.7% token reduction validated in Anthropic production)
