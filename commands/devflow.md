---
allowed-tools: Bash(find:*), Bash(cat:*), Bash(grep:*), SequentialThinking
description: Generate unified system roadmap from all component documentation with cross-dependencies.
---

## Role

Senior program manager creating unified development roadmap across all components.

## Execution

1. **Discover**:

   ```bash
   find docs/specs -type f -name "*.md" | sort
   ```

2. **Extract**: Use `cat` and `grep` to gather:
   - Component names and descriptions
   - Phase definitions and timelines
   - Task dependencies and estimates
   - Risk assessments

3. **Analyze**: `SequentialThinking` to identify:
   - System-wide critical path
   - Cross-component dependencies
   - Resource bottlenecks
   - Risk cascades

4. **Generate**: Create `docs/roadmap.md`

5. **Validate**: Ensure all components and phases covered

## Roadmap Template

````markdown
# System Development Roadmap

**Generated:** <YYYY-MM-DD>  
**Components:** [count] | **Duration:** [weeks] | **Team Size:** [count]

## Executive Summary

**Business Value:** [Strategic alignment and expected ROI]  
**Timeline:** [Start date] → [Launch date]  
**Investment:** [Team × weeks, key resources]  
**Top Risks:** [3 critical risks with mitigation]

## System Timeline

```text
Week 1-3    Week 4-10      Week 11-16     Week 17-20
   │            │              │              │
   ▼            ▼              ▼              ▼
[SETUP]     [CORE MVP]    [INTEGRATION]   [LAUNCH]
   │            │              │              │
   └─→ Env     └─→ Features   └─→ Scale      └─→ Deploy
      CI/CD        APIs            Optimize      Monitor
      Docs         Data            Security      Support
```

## Phase Overview

### Phase 0: Foundation (Week 1-3)
**Goal:** Development infrastructure ready  
**Deliverables:** 
- Dev/staging environments operational
- CI/CD pipelines configured
- Team onboarded, requirements finalized

**Critical Path:** ENV-001 → CI-001 → DOC-001 (3 weeks)

### Phase 1: Core MVP (Week 4-10)  
**Goal:** Functional prototype with core features  
**Deliverables:**
- Primary APIs operational
- Core data models implemented
- Basic UI/integration working

**Critical Path:** [Component A]-T1.3 → [Component B]-T2.1 → [Component C]-T1.5 (7 weeks)

### Phase 2: Integration & Scale (Week 11-16)
**Goal:** Fully integrated, production-ready system  
**Deliverables:**
- All components integrated
- Performance targets met
- Security hardened

**Critical Path:** INT-001 → PERF-001 → SEC-001 (6 weeks)

### Phase 3: Launch (Week 17-20)
**Goal:** Production deployment with monitoring  
**Deliverables:**
- Production deployed
- Monitoring/alerting live
- Documentation complete

**Critical Path:** DEPLOY-001 → MONITOR-001 (4 weeks)

## Component Details

### [Component A Name]
📁 [Spec](docs/specs/component-a/spec.md) | [Plan](docs/specs/component-a/plan.md) | [Tasks](docs/specs/component-a/tasks.md)

**Purpose:** [One-line description]  
**Owner:** [Team/role]  
**Dependencies:** [Component B, External API X]

**Milestones:**
- ✓ Phase 0: Dev environment setup (Week 2)
- → Phase 1: Core API implementation (Week 5-7)
- → Phase 2: Performance optimization (Week 12-14)
- → Phase 3: Production deployment (Week 18)

### [Component B Name]
📁 [Spec](docs/specs/component-b/spec.md) | [Plan](docs/specs/component-b/plan.md) | [Tasks](docs/specs/component-b/tasks.md)

**Purpose:** [One-line description]  
**Owner:** [Team/role]  
**Dependencies:** [Component A output]

**Milestones:**
- ✓ Phase 0: Schema design (Week 2)
- → Phase 1: Data layer implementation (Week 6-8)
- → Phase 2: Integration with Component A (Week 11-13)
- → Phase 3: Migration scripts (Week 17)

[Repeat for all components...]

## System Integration Map

```text
[Component A] ──HTTP──→ [Component B]
      │                      │
      │                      ▼
      └────Event Bus───→ [Component C] ──→ [External API]
                             │
                             ▼
                        [Component D]
```

**Integration Points:**
1. A→B: REST API (Week 11)
2. A→C: Event streaming (Week 12)  
3. C→External: Webhook integration (Week 13)
4. C→D: Shared database (Week 11)

## Critical Path Analysis

**System Critical Path:** 20 weeks
```
Setup → Component A Core → Component B Integration → 
Performance Testing → Security Audit → Deployment
```

**Bottlenecks:**
1. **Week 5-7:** Component A development (blocks B, C)
2. **Week 11-13:** Integration phase (all components converge)
3. **Week 18:** Production deployment (final gate)

**Parallel Work Streams:**
- Frontend development (Week 4-16)
- Documentation (Week 1-20)
- Test automation (Week 3-17)

## Risk Dashboard

| Risk | Probability | Impact | Component | Mitigation | Owner |
|------|------------|--------|-----------|------------|-------|
| External API instability | High | High | Component C | Mock layer, contract tests | Backend Lead |
| Performance bottleneck | Medium | High | Component B | Early load testing | DevOps |
| Scope creep | Medium | Medium | All | Strict change control | PM |

## Resource Allocation

**Team Composition:**
- Backend Engineers: 3 (Components A, B, C)
- Frontend Engineers: 2 (UI, integration)
- QA Engineer: 1 (Test automation)
- DevOps: 1 (Infrastructure, CI/CD)
- Product Manager: 1 (Coordination)

**Resource Conflicts:**
- Week 11-13: All engineers needed for integration
- Week 18: DevOps + QA critical for deployment

## Success Metrics

**Technical KPIs:**
- API response time: <200ms (p95)
- System uptime: 99.9%
- Test coverage: >80%
- Zero critical security issues

**Business KPIs:**
- User adoption: [target]
- Feature completion: 100% MVP
- Time to market: 20 weeks
- Budget adherence: ±10%

## Next Steps

**Week 1 Actions:**
- [ ] Finalize team assignments
- [ ] Provision infrastructure
- [ ] Set up project tracking
- [ ] Schedule kickoff meeting

**Decision Points:**
- Week 4: MVP scope review
- Week 10: Integration approach validation
- Week 16: Go/no-go for launch

## Appendix

**Component Summary:**
- Total components: [count]
- Total tasks: [count]
- Total story points: [count]

**Reference Documents:**
- [Project Charter](docs/project-charter.md)
- [Architecture Overview](docs/architecture.md)
- All component specs in `/specs/*/`
````

## Discovery Pattern

```bash
# Extract all component info
for dir in docs/specs/*/; do
  component=$(basename "$dir")
  echo "## $component"
  grep -h "^#" "$dir"/*.md | head -5
done
```

## Linking Format

Use relative paths from docs/:

- `[spec](docs/specs/component-a/spec.md)`
- `[tasks](docs/specs/component-a/tasks.md#phase-1)`
