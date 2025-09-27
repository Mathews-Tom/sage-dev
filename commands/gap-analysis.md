---
allowed-tools: Bash(find:*), Bash(cat:*), Bash(ls:*), Bash(grep:*), Bash(tee:*), WebSearch, SequentialThinking
description: Analyze system gaps against industry best practices and generate comprehensive improvement recommendations.
---

## Role

Senior system analyst conducting comprehensive gap analysis between current system state and industry best practices.

## Purpose

Systematically evaluate the current system documentation, architecture, processes, and practices against industry standards to identify improvement opportunities and create actionable recommendations.

## Execution

1. **Discovery Phase**:

   ```bash
   # Discover all documentation created by other commands
   find docs -type f -name "*.md" | sort
   find . -name "README.md" -o -name "CLAUDE.md" | sort
   ls -la # Check for additional config files
   ```

2. **Current State Analysis**:
   - Use `cat` to read all documentation files
   - Use `SequentialThinking` to:
     - Categorize existing documentation by type and purpose
     - Identify current architecture patterns and practices
     - Map existing processes and workflows
     - Assess documentation completeness and quality

3. **Industry Standards Research**:
   Use `WebSearch` to research current best practices in:
   - Software development methodologies and frameworks
   - Architecture patterns and design principles
   - Quality assurance and testing strategies
   - Security and compliance standards
   - DevOps and operational practices
   - Documentation and knowledge management
   - Team collaboration and project management

4. **Gap Analysis**:
   Use `SequentialThinking` to:
   - Compare current state against industry standards
   - Identify specific gaps in each category
   - Assess impact and effort for each gap
   - Prioritize recommendations by value and feasibility

5. **Report Generation**:

   ```bash
   tee docs/gap-analysis.md
   ```

## Research Areas

### 1. Development Standards

- **Search:** "software development best practices 2025"
- **Search:** "enterprise software architecture patterns"
- **Focus:** Coding standards, architecture patterns, design principles

### 2. Quality Assurance

- **Search:** "software testing pyramid 2025 best practices"
- **Search:** "continuous integration best practices"
- **Focus:** Testing strategies, CI/CD, code quality

### 3. Security & Compliance

- **Search:** "software security best practices OWASP"
- **Search:** "enterprise security compliance frameworks"
- **Focus:** Security practices, compliance requirements, risk management

### 4. Operations & DevOps

- **Search:** "DevOps best practices 2025"
- **Search:** "cloud native operations patterns"
- **Focus:** Deployment, monitoring, infrastructure, scalability

### 5. Documentation & Knowledge Management

- **Search:** "software documentation best practices"
- **Search:** "technical writing standards software"
- **Focus:** Documentation standards, knowledge sharing, onboarding

### 6. Team & Process

- **Search:** "agile development team practices 2025"
- **Search:** "software engineering team productivity"
- **Focus:** Team collaboration, project management, communication

### 7. API & Integration

- **Search:** "REST API design best practices 2025"
- **Search:** "microservices integration patterns"
- **Focus:** API design, service integration, data exchange

## Analysis Framework

Use `SequentialThinking` with this structured approach:

### Phase 1: Current State Inventory

- List all existing documentation and artifacts
- Categorize by type (specs, plans, architecture, etc.)
- Assess completeness and quality of each category
- Identify existing processes and standards

### Phase 2: Industry Standards Mapping

- Research current best practices for each category
- Identify relevant frameworks and standards
- Collect benchmark metrics and guidelines
- Note emerging trends and future considerations

### Phase 3: Gap Identification

- Compare current state against standards for each category
- Identify missing elements, outdated practices, and improvement areas
- Assess criticality and impact of each gap
- Consider dependencies between different gaps

### Phase 4: Prioritization & Recommendations

- Rank gaps by impact (business value, risk reduction)
- Estimate effort required to address each gap
- Group related gaps into improvement initiatives
- Create implementation timeline with phases

## Report Template

````markdown
# System Gap Analysis Report

**Generated:** <YYYY-MM-DD>
**Scope:** Complete system analysis against industry best practices
**Methodology:** Documentation review + industry research + expert analysis

---

## 📊 Executive Summary

### System Maturity Assessment

**Overall Score:** [X/10] - [Beginner/Intermediate/Advanced/Expert]

**Maturity by Category:**
- 📚 Documentation: [X/10]
- 🏗️ Architecture: [X/10]
- 🔨 Development: [X/10]
- 🧪 Quality Assurance: [X/10]
- 🔒 Security: [X/10]
- ⚙️ Operations: [X/10]
- 👥 Team & Process: [X/10]

### Top 5 Critical Gaps

1. **[Gap Name]** - Impact: High, Effort: Medium
2. **[Gap Name]** - Impact: High, Effort: Low
3. **[Gap Name]** - Impact: Medium, Effort: Low
4. **[Gap Name]** - Impact: High, Effort: High
5. **[Gap Name]** - Impact: Medium, Effort: Medium

### Recommended Action Plan

**Phase 1 (Weeks 1-4):** Address critical gaps with low effort
**Phase 2 (Weeks 5-12):** Implement high-impact improvements
**Phase 3 (Months 4-6):** Long-term strategic improvements

---

## 🔍 Current State Analysis

### Documentation Inventory

**Existing Documentation:**
- Specifications: [count] components documented
- Implementation Plans: [count] plans created
- Task Breakdowns: [count] detailed task lists
- Technical Breakdowns: [count] architecture documents
- Process Documentation: [list types]

**Documentation Quality:**
- ✅ Strengths: [list strong areas]
- ❌ Weaknesses: [list gaps]
- 📈 Coverage: [percentage]% of system documented

### Architecture Assessment

**Current Architecture:**
- Pattern: [Monolith/Microservices/Modular/Hybrid]
- Components: [count] identified components
- Integration: [REST/GraphQL/Events/Mixed]
- Data Strategy: [SQL/NoSQL/Mixed]

**Architecture Maturity:**
- ✅ Well-defined: [list areas]
- ⚠️ Needs improvement: [list areas]
- ❌ Missing: [list gaps]

### Development Practices

**Current Practices:**
- Version Control: [Git workflow description]
- Code Quality: [linting, formatting, review process]
- Testing: [current testing strategy]
- CI/CD: [current automation level]

**Practice Maturity:**
- ✅ Established: [list practices]
- ⚠️ Partially implemented: [list areas]
- ❌ Not implemented: [list gaps]

---

## 🌍 Industry Standards Comparison

### Benchmarking Results

**Development Standards:**
- Industry Standard: [description from research]
- Current State: [our current approach]
- Gap Assessment: [specific differences]
- Recommendation: [specific actions]

**Quality Assurance:**
- Industry Standard: [testing pyramid, coverage targets, automation levels]
- Current State: [our current testing approach]
- Gap Assessment: [what's missing or suboptimal]
- Recommendation: [specific improvements]

**Security Practices:**
- Industry Standard: [OWASP guidelines, security frameworks]
- Current State: [current security measures]
- Gap Assessment: [security vulnerabilities or missing practices]
- Recommendation: [security improvements]

**Operations & DevOps:**
- Industry Standard: [modern DevOps practices, monitoring, scalability]
- Current State: [current operational setup]
- Gap Assessment: [operational gaps]
- Recommendation: [operational improvements]

**Documentation Standards:**
- Industry Standard: [documentation best practices, formats, coverage]
- Current State: [current documentation approach]
- Gap Assessment: [documentation gaps]
- Recommendation: [documentation improvements]

**Team & Process:**
- Industry Standard: [agile practices, collaboration tools, workflows]
- Current State: [current team processes]
- Gap Assessment: [process gaps]
- Recommendation: [process improvements]

---

## 🎯 Gap Analysis by Category

### 📚 Documentation Gaps

**Missing Documentation:**
- [ ] **API Documentation** - Impact: High, Effort: Medium
  - Current: [current state]
  - Standard: [industry expectation]
  - Gap: [specific missing elements]
  - Recommendation: [specific actions]

- [ ] **Architecture Decision Records (ADRs)** - Impact: Medium, Effort: Low
  - Gap: [description]
  - Recommendation: [actions]

**Documentation Quality Issues:**
- [ ] **[Specific issue]** - Impact: [H/M/L], Effort: [H/M/L]

### 🏗️ Architecture Gaps

**Design Pattern Gaps:**
- [ ] **[Pattern name]** - Impact: High, Effort: High
  - Current: [what we have]
  - Standard: [what industry does]
  - Gap: [specific missing elements]
  - Recommendation: [implementation plan]

**Scalability Gaps:**
- [ ] **[Scalability concern]** - Impact: [H/M/L], Effort: [H/M/L]

### 🔨 Development Gaps

**Code Quality Gaps:**
- [ ] **Automated Code Review** - Impact: Medium, Effort: Low
- [ ] **Code Coverage Monitoring** - Impact: High, Effort: Medium
- [ ] **[Other gaps]** - Impact: [H/M/L], Effort: [H/M/L]

**Development Workflow Gaps:**
- [ ] **[Workflow issue]** - Impact: [H/M/L], Effort: [H/M/L]

### 🧪 Quality Assurance Gaps

**Testing Strategy Gaps:**
- [ ] **End-to-End Testing** - Impact: High, Effort: High
- [ ] **Performance Testing** - Impact: High, Effort: Medium
- [ ] **Security Testing** - Impact: High, Effort: Medium

**Quality Process Gaps:**
- [ ] **[Process gap]** - Impact: [H/M/L], Effort: [H/M/L]

### 🔒 Security Gaps

**Security Practice Gaps:**
- [ ] **Security Scanning** - Impact: High, Effort: Low
- [ ] **Dependency Vulnerability Monitoring** - Impact: High, Effort: Low
- [ ] **[Other security gaps]** - Impact: [H/M/L], Effort: [H/M/L]

**Compliance Gaps:**
- [ ] **[Compliance requirement]** - Impact: [H/M/L], Effort: [H/M/L]

### ⚙️ Operations Gaps

**Monitoring & Observability:**
- [ ] **Application Monitoring** - Impact: High, Effort: Medium
- [ ] **Log Aggregation** - Impact: Medium, Effort: Medium
- [ ] **Alerting Strategy** - Impact: High, Effort: Low

**Deployment & Infrastructure:**
- [ ] **[Infrastructure gap]** - Impact: [H/M/L], Effort: [H/M/L]

### 👥 Team & Process Gaps

**Collaboration Gaps:**
- [ ] **[Collaboration issue]** - Impact: [H/M/L], Effort: [H/M/L]

**Process Gaps:**
- [ ] **[Process issue]** - Impact: [H/M/L], Effort: [H/M/L]

---

## 📋 Prioritized Recommendations

### Phase 1: Quick Wins (Weeks 1-4)

**High Impact, Low Effort:**

1. **[Recommendation 1]**
   - **Gap:** [specific gap addressed]
   - **Action:** [specific steps]
   - **Timeline:** [timeframe]
   - **Resources:** [requirements]
   - **Success Metric:** [how to measure]

2. **[Recommendation 2]**
   - **Gap:** [specific gap addressed]
   - **Action:** [specific steps]
   - **Timeline:** [timeframe]
   - **Resources:** [requirements]
   - **Success Metric:** [how to measure]

### Phase 2: High Impact Improvements (Weeks 5-16)

**High Impact, Medium Effort:**

1. **[Recommendation 1]**
   - **Gap:** [specific gap addressed]
   - **Action:** [specific steps]
   - **Timeline:** [timeframe]
   - **Resources:** [requirements]
   - **Success Metric:** [how to measure]

### Phase 3: Strategic Improvements (Months 4-12)

**High Impact, High Effort:**

1. **[Recommendation 1]**
   - **Gap:** [specific gap addressed]
   - **Action:** [specific steps]
   - **Timeline:** [timeframe]
   - **Resources:** [requirements]
   - **Success Metric:** [how to measure]

---

## 🗓️ Implementation Roadmap

### Quarter 1: Foundation Building

**Month 1:**
- [ ] Implement quick wins from Phase 1
- [ ] Set up basic monitoring and alerting
- [ ] Establish documentation standards

**Month 2:**
- [ ] Begin Phase 2 improvements
- [ ] Implement automated testing
- [ ] Security enhancements

**Month 3:**
- [ ] Complete Phase 2 initiatives
- [ ] Quality process improvements
- [ ] Team training and onboarding

### Quarter 2: Maturity Enhancement

**Month 4:**
- [ ] Begin Phase 3 strategic improvements
- [ ] Architecture enhancements
- [ ] Advanced monitoring implementation

**Months 5-6:**
- [ ] Complete strategic improvements
- [ ] Performance optimization
- [ ] Compliance and security hardening

### Success Metrics

**Technical Metrics:**
- Code coverage: Target [X]%
- Deployment frequency: Target [frequency]
- Mean time to recovery: Target [time]
- Security vulnerability count: Target [count]

**Process Metrics:**
- Documentation coverage: Target [X]%
- Team velocity: Target [improvement]%
- Onboarding time: Target [reduction]%
- Incident response time: Target [time]

---

## 🔗 Research References

**Industry Standards Researched:**
- [List of WebSearch results and sources]
- [Best practice frameworks referenced]
- [Industry benchmarks and guidelines]

**Compliance Frameworks:**
- [Relevant compliance standards]
- [Security frameworks (OWASP, NIST, etc.)]
- [Quality standards (ISO, CMMI, etc.)]

**Best Practice Sources:**
- [Industry reports and surveys]
- [Expert recommendations and case studies]
- [Tool and platform documentation]

---

## 📈 Continuous Improvement

**Quarterly Reviews:**
- Re-assess gaps and progress
- Update recommendations based on new standards
- Adjust timeline and priorities

**Industry Monitoring:**
- Subscribe to relevant industry publications
- Attend conferences and training
- Monitor emerging best practices and tools

**Feedback Loops:**
- Regular team retrospectives
- Stakeholder feedback collection
- Metrics-driven decision making

---

*This gap analysis should be reviewed and updated quarterly to ensure recommendations remain current with evolving industry standards and business needs.*
````

## Quality Criteria

Generated gap analysis must:

- Provide specific, actionable recommendations with clear timelines
- Include effort estimates and resource requirements
- Reference industry standards with research citations
- Prioritize recommendations by impact and feasibility
- Include measurable success metrics
- Maintain objectivity while being constructive
- Cover all major aspects of software development lifecycle
- Balance technical debt with feature development needs

## Validation Steps

After generation, verify:

1. All categories covered comprehensively
2. Recommendations are specific and actionable
3. Research citations support all industry standard claims
4. Timeline is realistic and achievable
5. Success metrics are measurable and relevant
6. Report is structured for both technical and business audiences
