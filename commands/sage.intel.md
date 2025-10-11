---
allowed-tools: Bash(find:*), Bash(cat:*), Bash(ls:*), Bash(grep:*), Bash(tee:*), WebSearch, SequentialThinking
description: Gather strategic intelligence through comprehensive system assessment and market analysis to inform technical and business decisions.
---

## Role

Strategic intelligence analyst conducting comprehensive assessment of system capabilities and market positioning to inform technical and business strategy.

## Purpose

Gather strategic intelligence by evaluating both internal technical capabilities and external market dynamics. Combines system assessment against industry standards with comprehensive market research to create integrated strategic recommendations that align technical development with market opportunities.

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
   tee docs/intel.md
   ```

## Research Areas

### Strategic Assessment (Internal Focus)

#### 1. Development Standards

- **Search:** "software development best practices 2025"
- **Search:** "enterprise software architecture patterns"
- **Focus:** Coding standards, architecture patterns, design principles

#### 2. Quality Assurance

- **Search:** "software testing pyramid 2025 best practices"
- **Search:** "continuous integration best practices"
- **Focus:** Testing strategies, CI/CD, code quality

#### 3. Security & Compliance

- **Search:** "software security best practices OWASP"
- **Search:** "enterprise security compliance frameworks"
- **Focus:** Security practices, compliance requirements, risk management

#### 4. Operations & DevOps

- **Search:** "DevOps best practices 2025"
- **Search:** "cloud native operations patterns"
- **Focus:** Deployment, monitoring, infrastructure, scalability

#### 5. Documentation & Knowledge Management

- **Search:** "software documentation best practices"
- **Search:** "technical writing standards software"
- **Focus:** Documentation standards, knowledge sharing, onboarding

#### 6. Team & Process

- **Search:** "agile development team practices 2025"
- **Search:** "software engineering team productivity"
- **Focus:** Team collaboration, project management, communication

#### 7. API & Integration

- **Search:** "REST API design best practices 2025"
- **Search:** "microservices integration patterns"
- **Focus:** API design, service integration, data exchange

### Market Intelligence (External Focus)

#### 8. Market Analysis

- **Search:** "software market size trends 2025 [domain]"
- **Search:** "enterprise software market growth forecast"
- **Focus:** Market size, growth rates, customer segments, industry dynamics

#### 9. Competitive Landscape

- **Search:** "competitive analysis software tools [domain]"
- **Search:** "market leaders software [domain] comparison"
- **Focus:** Direct/indirect competitors, feature comparison, pricing strategies

#### 10. Customer Research

- **Search:** "software customer pain points [domain] 2025"
- **Search:** "user behavior patterns enterprise software"
- **Focus:** Customer needs, pain points, user personas, behavior analysis

#### 11. Technology Trends

- **Search:** "emerging technology trends software 2025"
- **Search:** "technology adoption rates enterprise [domain]"
- **Focus:** Emerging technologies, adoption curves, future technology outlook

#### 12. Business Model Analysis

- **Search:** "software pricing models 2025 trends"
- **Search:** "SaaS monetization strategies best practices"
- **Focus:** Pricing strategies, revenue models, monetization approaches

#### 13. Go-to-Market Strategy

- **Search:** "software go-to-market strategies 2025"
- **Search:** "enterprise software distribution channels"
- **Focus:** Market entry, distribution, marketing approaches, positioning

#### 14. Market Risk Assessment

- **Search:** "software market risks competitive threats 2025"
- **Search:** "regulatory changes software industry [domain]"
- **Focus:** Competitive threats, market risks, regulatory landscape

## Analysis Framework

Use `SequentialThinking` with this structured approach:

### Phase 1: Current State Inventory

- List all existing documentation and artifacts
- Categorize by type (specs, plans, architecture, etc.)
- Assess completeness and quality of each category
- Identify existing processes and standards

### Phase 2: Strategic Intelligence Gathering

**Strategic Assessment Research:**

- Research current best practices for each technical category
- Identify relevant frameworks and standards
- Collect benchmark metrics and guidelines
- Assess internal capabilities and maturity

**Market Intelligence Research:**

- Analyze market trends and competitive landscape
- Research customer needs and pain points
- Study business models and pricing strategies
- Assess technology adoption trends
- Note emerging trends and future considerations

### Phase 3: Integrated Analysis

**Strategic Assessment (Internal):**

- Compare current state against technical standards for each category
- Identify missing elements, outdated practices, and improvement areas
- Assess criticality and impact of each technical gap
- Evaluate organizational capabilities and constraints

**Market Intelligence (External):**

- Compare current positioning against market leaders
- Identify competitive disadvantages and market opportunities
- Assess customer needs not being addressed
- Evaluate business model and pricing gaps
- Analyze competitive threats and market dynamics

### Phase 4: Strategic Recommendations

- Integrate technical capabilities with market opportunities
- Rank recommendations by strategic impact (technical value + market opportunity)
- Estimate effort required considering both technical and market factors
- Consider market timing and competitive pressure
- Group related initiatives into strategic themes
- Create implementation blueprint balancing technical debt and market positioning
- Align technical improvements with market requirements

## Report Template

````markdown
# Strategic Intelligence Report

**Generated:** <YYYY-MM-DD>
**Scope:** Comprehensive strategic assessment and market intelligence analysis
**Methodology:** System assessment + market research + competitive intelligence + strategic analysis

---

## 📊 Executive Summary

### Strategic Intelligence Overview

**Overall Strategic Position:** [X/10] - [Emerging/Developing/Competitive/Leading]

### Strategic Assessment (Internal Capabilities)
- 📚 Documentation Maturity: [X/10]
- 🏗️ Architecture Quality: [X/10]
- 🔨 Development Process: [X/10]
- 🧪 Quality Assurance: [X/10]
- 🔒 Security Posture: [X/10]
- ⚙️ Operational Excellence: [X/10]
- 👥 Team & Process: [X/10]

### Market Intelligence (External Position)
- 🎯 Market Positioning: [X/10]
- 🏆 Competitive Advantage: [X/10]
- 👥 Customer Alignment: [X/10]
- 💰 Business Model Strength: [X/10]
- 📈 Growth Potential: [X/10]
- 🔍 Market Opportunity: [X/10]

### Top 5 Strategic Priorities

1. **[Strategic Initiative]** - Impact: High, Effort: Medium, Focus: [Strategic/Market/Technical]
2. **[Strategic Initiative]** - Impact: High, Effort: Low, Focus: [Strategic/Market/Technical]
3. **[Strategic Initiative]** - Impact: Medium, Effort: Low, Focus: [Strategic/Market/Technical]
4. **[Strategic Initiative]** - Impact: High, Effort: High, Focus: [Strategic/Market/Technical]
5. **[Strategic Initiative]** - Impact: Medium, Effort: Medium, Focus: [Strategic/Market/Technical]

### Key Strategic Opportunities

1. **[Strategic Opportunity]** - Value: [X]M, Timeline: [Y] months, Risk: [Low/Medium/High]
2. **[Strategic Opportunity]** - Value: [X]M, Timeline: [Y] months, Risk: [Low/Medium/High]
3. **[Strategic Opportunity]** - Value: [X]M, Timeline: [Y] months, Risk: [Low/Medium/High]

### Strategic Action Plan

**Phase 1 (Weeks 1-4):** Address critical capabilities and quick market wins
**Phase 2 (Weeks 5-12):** Execute high-impact strategic initiatives
**Phase 3 (Months 4-6):** Long-term strategic positioning and market expansion

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

## 🌍 Strategic Intelligence Analysis

### Strategic Assessment Results

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

### Market Intelligence Results

**Market Dynamics:**
- Market Size: [Total Addressable Market size]
- Growth Rate: [Annual growth percentage]
- Market Segments: [Key customer segments identified]
- Market Trends: [Key trends affecting the market]
- Market Maturity: [Emerging/Growth/Mature/Declining]

**Competitive Intelligence:**
- Direct Competitors: [List of main competitors with market share]
- Indirect Competitors: [Alternative solutions in the market]
- Competitive Positioning: [Our position vs competitors]
- Competitive Advantages: [What competitors do better]
- Market Gaps: [Underserved market segments or needs]
- Competitive Threats: [Emerging competitive risks]

**Customer Intelligence:**
- Primary Personas: [Key customer personas identified]
- Pain Points: [Main customer problems in the market]
- Buying Behavior: [How customers make purchasing decisions]
- Customer Needs: [Unmet or poorly met customer needs]
- Customer Satisfaction: [Market satisfaction levels]
- Customer Acquisition: [Market acquisition strategies]

**Technology Intelligence:**
- Emerging Technologies: [Technologies gaining adoption]
- Adoption Rates: [Technology adoption timeline and penetration]
- Technology Disruption: [Potential disruptive technologies]
- Innovation Opportunities: [Areas for technological innovation]
- Technology Blueprint: [Industry technology evolution]

**Business Intelligence:**
- Pricing Models: [Common pricing strategies in the market]
- Revenue Streams: [How competitors monetize]
- Distribution Channels: [How products reach customers]
- Value Propositions: [What customers value most]
- Business Model Innovation: [Emerging business model trends]

---

## 🎯 Strategic Analysis by Category

### Strategic Assessment Gaps

#### 📚 Documentation Gaps

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

#### 👥 Team & Process Gaps

**Collaboration Gaps:**
- [ ] **[Collaboration issue]** - Impact: [H/M/L], Effort: [H/M/L]

**Process Gaps:**
- [ ] **[Process issue]** - Impact: [H/M/L], Effort: [H/M/L]

### Market Intelligence Gaps

#### 🎯 Market Positioning Gaps

**Market Understanding:**
- [ ] **Customer Persona Definition** - Impact: High, Effort: Medium
  - Current: [current customer understanding]
  - Gap: [missing persona details or market segments]
  - Recommendation: [customer research and persona development]

- [ ] **Competitive Positioning** - Impact: High, Effort: Low
  - Current: [current competitive position]
  - Gap: [competitive disadvantages or unclear positioning]
  - Recommendation: [competitive analysis and positioning strategy]

**Market Coverage:**
- [ ] **Underserved Market Segments** - Impact: Medium, Effort: High
  - Current: [current market coverage]
  - Gap: [missed market opportunities]
  - Recommendation: [market expansion strategy]

#### 💰 Business Model Gaps

**Pricing Strategy:**
- [ ] **Pricing Model Optimization** - Impact: High, Effort: Medium
  - Current: [current pricing approach]
  - Market Standard: [competitive pricing models]
  - Gap: [pricing optimization opportunities]
  - Recommendation: [pricing strategy improvements]

**Revenue Optimization:**
- [ ] **Revenue Stream Diversification** - Impact: Medium, Effort: High
  - Current: [current revenue streams]
  - Market Opportunity: [additional revenue opportunities]
  - Gap: [missed monetization opportunities]
  - Recommendation: [new revenue stream development]

#### 🏆 Competitive Advantage Gaps

**Feature Gaps:**
- [ ] **Core Feature Parity** - Impact: High, Effort: [H/M/L]
  - Current: [current feature set]
  - Competitor Advantage: [competitor feature advantages]
  - Gap: [feature gaps vs competition]
  - Recommendation: [feature development priorities]

**Innovation Gaps:**
- [ ] **Technology Innovation** - Impact: [H/M/L], Effort: [H/M/L]
  - Current: [current technology stack]
  - Market Trend: [emerging technology trends]
  - Gap: [innovation opportunities]
  - Recommendation: [technology adoption strategy]

#### 📈 Go-to-Market Gaps

**Market Reach:**
- [ ] **Distribution Channel Optimization** - Impact: Medium, Effort: Medium
  - Current: [current distribution channels]
  - Market Standard: [common distribution approaches]
  - Gap: [channel optimization opportunities]
  - Recommendation: [distribution strategy improvements]

**Customer Acquisition:**
- [ ] **Customer Acquisition Strategy** - Impact: High, Effort: Medium
  - Current: [current acquisition approach]
  - Market Best Practice: [effective acquisition strategies]
  - Gap: [acquisition efficiency improvements]
  - Recommendation: [acquisition strategy optimization]

---

## 📋 Strategic Recommendations

### Phase 1: Immediate Actions (Weeks 1-4)

**High Impact, Low Effort (Strategic Wins):**

1. **[Strategic Initiative]**
   - **Focus:** [Strategic Assessment/Market Intelligence/Integrated]
   - **Strategic Gap:** [capability or market gap addressed]
   - **Action:** [specific steps]
   - **Timeline:** [timeframe]
   - **Resources:** [requirements]
   - **Success Metric:** [how to measure]
   - **Strategic Value:** [competitive/market/operational benefit]

2. **[Strategic Initiative]**
   - **Focus:** [Strategic Assessment/Market Intelligence/Integrated]
   - **Strategic Gap:** [capability or market gap addressed]
   - **Action:** [specific steps]
   - **Timeline:** [timeframe]
   - **Resources:** [requirements]
   - **Success Metric:** [how to measure]
   - **Strategic Value:** [competitive/market/operational benefit]

### Phase 2: Strategic Development (Weeks 5-16)

**High Impact, Medium Effort:**

1. **[Strategic Initiative]**
   - **Focus:** [Strategic Assessment/Market Intelligence/Integrated]
   - **Strategic Gap:** [gap addressed]
   - **Action:** [specific steps]
   - **Timeline:** [timeframe]
   - **Resources:** [requirements]
   - **Success Metric:** [how to measure]
   - **Strategic Value:** [competitive/market/operational benefit]
   - **Dependencies:** [strategic or market dependencies]

### Phase 3: Strategic Transformation (Months 4-12)

**High Impact, High Effort:**

1. **[Strategic Initiative]**
   - **Focus:** [Strategic Assessment/Market Intelligence/Integrated]
   - **Strategic Gap:** [gap addressed]
   - **Action:** [specific steps]
   - **Timeline:** [timeframe]
   - **Resources:** [requirements]
   - **Success Metric:** [how to measure]
   - **Strategic Value:** [competitive/market/operational benefit]
   - **ROI Projection:** [expected strategic return on investment]

---

## 🗓️ Implementation Blueprint

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

**Strategic Metrics:**
- Market share: Target [X]%
- Customer acquisition cost: Target [reduction]%
- Customer satisfaction: Target [score]
- Competitive win rate: Target [X]%
- Revenue growth: Target [X]% YoY
- Strategic positioning score: Target [X/10]
- Market intelligence accuracy: Target [X]%
- Strategic initiative success rate: Target [X]%

---

## 🔗 Research References

**Strategic Assessment Sources:**
- [List of WebSearch results and sources for technical standards]
- [Best practice frameworks referenced]
- [Industry benchmarks and guidelines]
- [Organizational capability assessments]

**Market Intelligence Sources:**
- [Market research reports and industry analyses]
- [Competitive intelligence platforms]
- [Customer research and survey data]
- [Technology trend reports]
- [Business model and pricing research]

**Compliance & Standards:**
- [Relevant compliance standards]
- [Security frameworks (OWASP, NIST, etc.)]
- [Quality standards (ISO, CMMI, etc.)]
- [Strategic planning frameworks]

**Strategic Intelligence Sources:**
- [Industry reports and strategic analyses]
- [Competitive intelligence platforms]
- [Customer feedback and market research]
- [Technology blueprint and innovation reports]
- [Business strategy and market positioning studies]

---

## 📈 Continuous Improvement

**Quarterly Strategic Reviews:**
- Re-assess strategic capabilities and market position
- Update strategic recommendations based on new intelligence
- Adjust strategic priorities based on competitive dynamics
- Review strategic positioning and stakeholder feedback

**Strategic Intelligence Monitoring:**
- Subscribe to relevant industry publications and strategic research
- Attend strategic planning conferences and industry events
- Monitor emerging best practices, technologies, and market trends
- Track competitive landscape and strategic movements
- Monitor customer needs and strategic market evolution

**Strategic Feedback Loops:**
- Regular strategic retrospectives on capability and market progress
- Stakeholder feedback collection including strategic insights
- Metrics-driven strategic decision making
- Competitive intelligence gathering and strategic analysis
- Strategic positioning and market impact tracking

---

*This strategic intelligence analysis should be reviewed and updated quarterly to ensure recommendations remain current with evolving strategic landscape, market conditions, competitive dynamics, and stakeholder needs.*
````

## Quality Criteria

Generated strategic intelligence must:

- Provide specific, actionable strategic recommendations with clear timelines
- Include effort estimates and resource requirements for strategic initiatives
- Reference industry standards, market research, and strategic frameworks with citations
- Prioritize recommendations by strategic impact, market opportunity, and feasibility
- Include measurable success metrics for both capability and market outcomes
- Maintain objectivity while being strategically constructive
- Cover all major aspects of strategic capability development and market positioning
- Balance capability building with market opportunity exploitation
- Integrate internal capabilities with external market dynamics and competitive positioning
- Provide clear strategic ROI projections for all initiatives
- Align technical development with strategic business objectives

## Validation Steps

After generation, verify:

1. All strategic assessment and market intelligence categories covered comprehensively
2. Strategic recommendations are specific and actionable for both capability and market outcomes
3. Research citations support all strategic frameworks, standards, and market intelligence claims
4. Timeline is realistic and achievable considering strategic and market constraints
5. Success metrics are measurable and relevant for strategic stakeholders across the organization
6. Market intelligence includes comprehensive competitive analysis and customer insights
7. Strategic assessment aligns with market opportunities and competitive positioning
8. Report is structured for strategic, operational, and executive decision-making
9. Strategic ROI projections are realistic, well-supported, and aligned with business objectives
10. Strategic positioning and competitive advantage are clearly articulated
11. Integration between internal capabilities and external market dynamics is evident
12. Strategic recommendations support long-term competitive advantage
