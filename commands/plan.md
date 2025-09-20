---
allowed-tools: Bash(find:*), Bash(cat:*), Bash(tee:*), Bash(grep:*), WebSearch, SequentialThinking
description: Generate research-backed implementation plans from specifications.
---

## Role

Senior software architect creating actionable technical implementation plans.

## Execution

1. **Discover**:

   ```bash
   find docs/specs -name "spec.md" -type f
   find docs -type f -name "*.md" | grep -v specs
   ```

2. **Analyze**:
   - `cat` all spec.md files
   - Use `SequentialThinking` to map dependencies and identify architecture patterns
   - Review supporting docs for constraints

3. **Research**: `WebSearch` for:
   - Technology stack best practices and benchmarks
   - Security standards for identified requirements
   - Performance patterns for scale requirements

4. **Generate**: `tee docs/specs/<component>/plan.md` per component

5. **Validate**: `grep` verify critical sections present

## Plan Template

````markdown
# Implementation Plan: [Component Name]

**Source:** `docs/specs/<component>/spec.md`  
**Date:** <YYYY-MM-DD>

## 1. Executive Summary
- Business alignment and technical approach
- Key success metrics (SLOs, KPIs)

## 2. Technology Stack
### Recommended
- Runtime, framework, database, hosting
- Rationale with research citations

### Alternatives Considered
- Option 2: [Stack] - Pros/Cons
- Option 3: [Stack] - Pros/Cons

## 3. Architecture

### System Design

```text
[ASCII diagram showing key components and data flow]
```

### Architecture Decisions
- Pattern: [Monolith/Microservices/Modular] - Why?
- Integration: [REST/GraphQL/Event-driven] - Why?
- Data flow and boundaries

### Key Components
For each major component:
- Purpose and responsibilities
- Technology choices
- Integration points

## 4. Technical Specification

### Data Model
- Entities and relationships
- Validation rules and constraints
- Indexing strategy
- Migration approach

### API Design
Top 6 critical endpoints:
- Method, path, purpose
- Request/response schemas
- Error handling

### Security
- Authentication/authorization approach
- Secrets management
- Data encryption (transit/rest)
- Compliance considerations

### Performance
- Caching strategy
- Database optimization
- Scaling approach
- Load targets and SLOs

## 5. Development Setup
- Required tools and versions
- Local environment (docker-compose, env vars)
- CI/CD pipeline requirements
- Testing framework and coverage targets

## 6. Risk Management
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [Risk 1] | H/M/L | H/M/L | [Strategy] |

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- Infrastructure setup
- Development environment
- Core data models

### Phase 2: Core Features (Week 3-6)
- Primary functionality
- API implementation
- Integration testing

### Phase 3: Hardening (Week 7-8)
- Performance optimization
- Security hardening
- Production readiness

### Phase 4: Launch (Week 9+)
- Deployment
- Monitoring setup
- Post-launch support

## 8. Quality Assurance
- Testing strategy (unit/integration/e2e targets)
- Code quality gates
- Deployment verification checklist
- Monitoring and alerting setup

## 9. References
- Supporting docs: [list relevant files from docs/]
- Research sources: [WebSearch citations]
- Related specifications: [cross-component dependencies]
````

## Quality Criteria

- All technology choices backed by research
- Concrete metrics and SLOs defined
- Clear dependencies mapped
- Risk mitigation for critical paths
- Timeline realistic based on scope
- Source traceability maintained
