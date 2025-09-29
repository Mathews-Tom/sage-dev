# Development Workflow Visualization

## 🔄 Complete Workflow Diagram

```mermaid
graph TB
    Start[📁 Documentation] --> Specify["/specify<br/>Requirements Analysis"]

    Specify --> POC{Need<br/>Validation?}
    POC -->|Yes| POCGen["/poc<br/>Proof of Concept"]
    POC -->|No| Plan
    POCGen -->|Validated ✓| Plan["/plan<br/>Technical Planning"]
    POCGen -->|Failed ✗| Revise[Revise Approach]
    Revise --> Specify

    Plan --> Tasks["/tasks<br/>Task Breakdown"]
    Tasks --> Breakdown["/breakdown<br/>Implementation Details"]

    Breakdown --> DevFlow["/devflow<br/>System Roadmap"]
    DevFlow --> Implement["/implement<br/>Phased Implementation"]
    Implement --> Dev[👨‍💻 Development]

    Specify -.-> DevFlow
    Plan -.-> DevFlow
    Tasks -.-> DevFlow

    Start -.-> Assessment["/strategic-intelligence<br/>Strategic Assessment & Market Intelligence"]
    Assessment -.-> Specify
    Assessment -.-> Plan
    Assessment -.-> DevFlow

    Dev --> Commit["/commit<br/>Git Workflow"]
    Commit --> PR[📤 Pull Request]

    style POCGen fill:#fff3e0
    style Specify fill:#e1f5fe
    style Dev fill:#e8f5e9
    style DevFlow fill:#f3e5f5
    style Plan fill:#e8eaf6
    style Tasks fill:#fce4ec
    style Breakdown fill:#f1f8e9
    style Implement fill:#e3f2fd
    style Commit fill:#fff9c4
    style Assessment fill:#ffe0f0
```

## 📊 Workflow Phases

### Phase 1: Discovery & Analysis

```mermaid
graph LR
    A[Raw Documentation] --> B["/specify"]
    A -.-> G["/strategic-intelligence"]
    B --> C[Component Specs]
    G --> H[Strategic Assessment & Market Intelligence]
    C --> D{High Risk?}
    H -.-> C
    D -->|Yes| E["/poc"]
    D -->|No| F["/plan"]
    E --> F
    H -.-> F

    style B fill:#e1f5fe
    style E fill:#fff3e0
    style G fill:#ffe0f0
```

**Duration:** 1-3 days (+ 1-2 days for strategic intelligence)
**Output:** Clear understanding of requirements, components, and strategic position

---

### Phase 2: Planning & Estimation

```mermaid
graph LR
    A[Component Specs] --> B["/plan"]
    B --> C[Technical Plans]
    C --> D["/tasks"]
    D --> E[Task Breakdown]
    
    style B fill:#e8eaf6
    style D fill:#fce4ec
```

**Duration:** 2-5 days  
**Output:** Detailed technical plans and actionable tasks

---

### Phase 3: Implementation Preparation

```mermaid
graph LR
    A[Plans & Tasks] --> B["/breakdown"]
    B --> C[Technical Details]
    C --> D["/devflow"]
    D --> E[System Roadmap]
    E --> F[Ready to Implement]

    style B fill:#f1f8e9
    style D fill:#f3e5f5
```

**Duration:** 1-3 days
**Output:** Complete implementation guides and timeline

---

### Phase 4: Phased Implementation

```mermaid
graph LR
    A[System Roadmap] --> B["/implement"]
    B --> C[Phase Implementation]
    C --> D[Test Validation]
    D --> E[Progress Tracking]
    E --> F[Ready for Next Phase]

    style B fill:#e3f2fd
```

**Duration:** Varies by phase complexity
**Output:** Working code with comprehensive tests and updated progress tracking

---

### Phase 5: Development & Delivery

```mermaid
graph LR
    A[Implementation] --> B[Code Changes]
    B --> C["/commit"]
    C --> D[PR Created]
    D --> E[Review & Merge]
    
    style C fill:#fff9c4
```

**Duration:** Varies by project  
**Output:** Clean commits and comprehensive PRs

---

## 🎯 Decision Flow

### When to Run Each Command

```mermaid
graph TD
    Start{Starting Point} --> NewProject{New Project?}
    NewProject -->|Yes| AllDocs[Run All Commands]
    NewProject -->|No| Update{What Changed?}

    Update -->|Requirements| Specify["/specify → /plan → /tasks → /devflow"]
    Update -->|Technology| Plan["/plan → /tasks → /breakdown"]
    Update -->|Timeline| Tasks["/tasks → /devflow"]
    Update -->|Market/Strategy| Assessment["/strategic-intelligence → /plan → /devflow"]
    Update -->|Implementation Ready| Implement["/implement"]
    Update -->|Code Ready| Commit["/commit"]

    AllDocs --> Risk{High Risk?}
    Risk -->|Yes| POCFirst["/strategic-intelligence → /specify → /poc → /plan → /tasks → /breakdown → /devflow → /implement"]
    Risk -->|No| Standard["/strategic-intelligence → /specify → /plan → /tasks → /breakdown → /devflow → /implement"]

    style Specify fill:#e1f5fe
    style Plan fill:#e8eaf6
    style Tasks fill:#fce4ec
    style Implement fill:#e3f2fd
    style Commit fill:#fff9c4
    style POCFirst fill:#fff3e0
    style Assessment fill:#ffe0f0
```

---

## 📈 Timeline Visualization

### Typical Project Timeline

```mermaid
gantt
    title Development Workflow Timeline
    dateFormat YYYY-MM-DD
    section Assessment
    /strategic-intelligence :2024-01-01, 2d
    section Documentation
    /specify          :2024-01-03, 2d
    /poc              :2024-01-05, 3d
    /plan             :2024-01-08, 2d
    /tasks            :2024-01-10, 1d
    /breakdown        :2024-01-11, 2d
    /devflow          :2024-01-13, 1d
    section Implementation
    /implement        :2024-01-14, 10d
    section Development
    Code Review       :2024-01-24, 4d
    /commit           :2024-01-28, 1d
```

---

## 🔀 Usage Patterns

### Pattern 1: Full Workflow with Assessment

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Assessment as Market Assessment
    participant Docs as Documentation
    participant POC as POC Validation
    participant Plan as Planning
    participant Code as Implementation

    Dev->>Assessment: /strategic-intelligence
    Assessment-->>Dev: Strategic Assessment & Market Intelligence

    Dev->>Docs: /specify
    Docs-->>Dev: Component Specs

    Dev->>POC: /poc
    POC-->>Dev: Validation Results

    Dev->>Plan: /plan
    Plan-->>Dev: Technical Plans

    Dev->>Plan: /tasks
    Plan-->>Dev: Task Breakdown

    Dev->>Plan: /breakdown
    Plan-->>Dev: Implementation Guide

    Dev->>Plan: /devflow
    Plan-->>Dev: System Roadmap

    Dev->>Code: /implement
    Code-->>Dev: Phase Implementation

    Dev->>Code: /commit
    Code-->>Dev: PR Created
```

---

### Pattern 2: Quick Feature Addition

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Docs as Documentation
    participant Code as Implementation
    
    Dev->>Docs: /specify (new feature)
    Docs-->>Dev: Feature Spec
    
    Dev->>Docs: /plan
    Docs-->>Dev: Integration Plan
    
    Dev->>Docs: /tasks
    Docs-->>Dev: Task List

    Dev->>Code: /implement
    Code-->>Dev: Feature Implementation

    Dev->>Code: /commit
    Code-->>Dev: PR Created
```

---

### Pattern 3: Strategic Review

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Assessment as Market Assessment
    participant Plan as Planning

    Dev->>Assessment: /strategic-intelligence
    Assessment-->>Dev: Strategic Assessment & Market Intelligence

    Dev->>Plan: /plan (updated strategy)
    Plan-->>Dev: Revised Plans

    Dev->>Plan: /devflow
    Plan-->>Dev: Updated Roadmap
```

---

### Pattern 4: Documentation Update

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Docs as Documentation

    Dev->>Docs: /specify (updated requirements)
    Docs-->>Dev: Updated Specs

    Dev->>Docs: /devflow
    Docs-->>Dev: Updated Roadmap
```

---

## 🎨 Component Relationships

### How Commands Build on Each Other

```mermaid
graph TD
    Assessment["/strategic-intelligence<br/>Strategic Assessment & Market Intelligence"] --> Specify["/specify<br/>Foundation"]
    Assessment -.->|Informs| Plan["/plan<br/>Architecture"]
    Assessment -.->|Strategic Input| DevFlow["/devflow<br/>System View"]

    Specify --> Plan
    Specify --> POC["/poc<br/>Validation"]

    Plan --> Tasks["/tasks<br/>Execution Plan"]
    Plan --> Breakdown["/breakdown<br/>Implementation Details"]

    Tasks --> DevFlow
    Breakdown --> DevFlow

    POC --> Plan
    POC -.->|Informs| Breakdown

    DevFlow --> Implement["/implement<br/>Phase Execution"]
    Breakdown --> Implement
    Tasks --> Implement

    Implement --> Dev[Development]
    Dev --> Commit["/commit<br/>Delivery"]

    style Assessment fill:#ffe0f0,stroke:#c2185b
    style Specify fill:#e1f5fe,stroke:#01579b
    style POC fill:#fff3e0,stroke:#e65100
    style Plan fill:#e8eaf6,stroke:#311b92
    style Tasks fill:#fce4ec,stroke:#880e4f
    style Breakdown fill:#f1f8e9,stroke:#33691e
    style DevFlow fill:#f3e5f5,stroke:#4a148c
    style Implement fill:#e3f2fd,stroke:#0277bd
    style Commit fill:#fff9c4,stroke:#f57f17
```

---

## 📋 Command Dependencies

### What Each Command Needs

```mermaid
graph LR
    subgraph "Input Sources"
        Docs[Documentation Files]
        Specs[Specifications]
        Plans[Plans]
        Tasks[Tasks]
        Code[Code Changes]
        Market[Market Domain Info]
    end

    subgraph "Commands"
        Assessment["/strategic-intelligence"]
        Specify["/specify"]
        POC["/poc"]
        Plan["/plan"]
        TaskCmd["/tasks"]
        Breakdown["/breakdown"]
        DevFlow["/devflow"]
        Implement["/implement"]
        Commit["/commit"]
    end

    subgraph "Outputs"
        StrategicReport[Strategic Intelligence Report]
        CompSpecs[Component Specs]
        POCDocs[POC Design]
        TechPlans[Technical Plans]
        TaskLists[Task Lists]
        ImplGuides[Implementation Guides]
        Roadmap[System Roadmap]
        PhaseCode[Phase Implementation]
        PR[Pull Request]
    end

    Docs --> Assessment
    Market --> Assessment
    Assessment --> StrategicReport

    Docs --> Specify
    StrategicReport -.-> Specify
    Specify --> CompSpecs

    CompSpecs --> POC
    CompSpecs --> Plan
    StrategicReport -.-> Plan
    POC --> POCDocs

    CompSpecs --> Plan
    Plan --> TechPlans

    CompSpecs --> TaskCmd
    TechPlans --> TaskCmd
    TaskCmd --> TaskLists

    CompSpecs --> Breakdown
    TechPlans --> Breakdown
    TaskLists --> Breakdown
    Breakdown --> ImplGuides

    CompSpecs --> DevFlow
    TechPlans --> DevFlow
    TaskLists --> DevFlow
    StrategicReport -.-> DevFlow
    DevFlow --> Roadmap

    Roadmap --> Implement
    TaskLists --> Implement
    ImplGuides --> Implement
    Implement --> PhaseCode

    Code --> Commit
    Commit --> PR
```

---

## 🚦 Quality Gates

### Validation Checkpoints

```mermaid
graph TB
    Start([Start]) --> Assessment{"/strategic-intelligence<br/>Optional?"}
    Assessment -->|Yes| AssessmentRun["/strategic-intelligence"]
    Assessment -->|No| Specify

    AssessmentRun --> AssessmentCheck{Strategic Intelligence<br/>Complete?}
    AssessmentCheck -->|Yes| Specify{"/specify<br/>Complete?"}
    AssessmentCheck -->|No| AssessmentFix[Refine Analysis]
    AssessmentFix --> AssessmentRun

    Specify -->|Yes| SpecCheck{Quality Check}
    Specify -->|No| SpecFix[Fix Issues]
    SpecFix --> Specify

    SpecCheck -->|Pass| POC{Need<br/>POC?}
    SpecCheck -->|Fail| SpecFix

    POC -->|Yes| POCRun["/poc"]
    POC -->|No| Plan

    POCRun --> POCCheck{Validated?}
    POCCheck -->|Yes| Plan["/plan"]
    POCCheck -->|No| Pivot[Pivot Strategy]
    Pivot --> Specify

    Plan --> PlanCheck{Quality Check}
    PlanCheck -->|Pass| Tasks["/tasks"]
    PlanCheck -->|Fail| PlanFix[Fix Issues]
    PlanFix --> Plan

    Tasks --> TaskCheck{Quality Check}
    TaskCheck -->|Pass| Breakdown["/breakdown"]
    TaskCheck -->|Fail| TaskFix[Fix Issues]
    TaskFix --> Tasks

    Breakdown --> DevFlow["/devflow"]
    DevFlow --> Implement["/implement"]
    Implement --> Ready([Ready to Code])

    style AssessmentCheck fill:#e91e63
    style SpecCheck fill:#ffeb3b
    style POCCheck fill:#ff9800
    style PlanCheck fill:#ffeb3b
    style TaskCheck fill:#ffeb3b
```

---

## 🔄 Iterative Development

### Continuous Improvement Loop

```mermaid
graph LR
    A[Initial Specs] --> B["/implement"]
    B --> C[Implementation]
    C --> D{Feedback}
    D -->|Requirements Changed| E["/specify"]
    D -->|Tech Issues| F["/plan"]
    D -->|Estimate Wrong| G["/tasks"]
    D -->|Market Changes| H["/strategic-intelligence"]
    D -->|Phase Issues| I["/implement"]
    D -->|All Good| J[Continue]

    E --> K[Update Docs]
    F --> K
    G --> K
    H --> K
    K --> L["/devflow"]
    L --> B

    style C fill:#ff9800
```

---

## 📊 Metrics Dashboard

### Track Progress Through Workflow

```mermaid
graph TD
    subgraph "Strategic Intelligence Phase"
        M0[Strategic Intelligence Completion: X hours]
        M01[Strategic Insights Generated: N]
        M02[Strategic Alignment Score: Y/10]
    end

    subgraph "Documentation Phase"
        M1[Time to Spec: X hours]
        M2[Components Identified: N]
        M3[POC Success Rate: Y%]
    end

    subgraph "Planning Phase"
        M4[Plan Accuracy: Z%]
        M5[Risks Identified: R]
        M6[Alternatives Considered: A]
        M7[Market Alignment Score: M/10]
    end

    subgraph "Implementation Phase"
        M8[Phase Completion Rate: P%]
        M9[Tasks Completed: T/Total]
        M10[Test Success Rate: S%]
        M11[Implementation Velocity: V phases/week]
    end

    subgraph "Execution Phase"
        M12[Estimation Accuracy: E%]
        M13[Code Quality Score: Q/10]
        M14[Error Resolution Rate: R%]
    end

    subgraph "Delivery Phase"
        M15[Commit Quality: C score]
        M16[PR Approval Time: A hours]
        M17[Bug Rate: B/1000 lines]
        M18[Market Impact Score: I/10]
    end
```

---

## 🎯 Success Criteria

### How to Know You're Done

```mermaid
stateDiagram-v2
    [*] --> Assessment

    Assessment --> Documentation: /strategic-intelligence
    Documentation --> Validated: /specify + /poc
    Validated --> Planned: /plan
    Planned --> TasksReady: /tasks
    TasksReady --> ImplementationReady: /breakdown + /devflow

    ImplementationReady --> PhaseImplementation: /implement
    PhaseImplementation --> Development: Phase Complete
    Development --> CodeComplete: Features Done
    CodeComplete --> Committed: /commit
    Committed --> [*]: PR Merged

    note right of Assessment
        ✓ Strategic capabilities assessed
        ✓ Market intelligence gathered
        ✓ Competitive positioning analyzed
    end note

    note right of Validated
        ✓ Requirements clear
        ✓ Core concept proven
    end note

    note right of Planned
        ✓ Architecture defined
        ✓ Tech stack chosen
        ✓ Risks mitigated
        ✓ Market alignment confirmed
    end note

    note right of TasksReady
        ✓ Tasks estimated
        ✓ Dependencies mapped
        ✓ Sprint planned
    end note

    note right of ImplementationReady
        ✓ APIs defined
        ✓ Tests planned
        ✓ Roadmap clear
        ✓ Strategic alignment confirmed
    end note

    note right of PhaseImplementation
        ✓ Phase code implemented
        ✓ Tests created and passing
        ✓ Progress tracking updated
        ✓ Feature branch ready
    end note
```

---

## 🔧 Troubleshooting Flow

### When Things Go Wrong

```mermaid
graph TD
    Problem{Issue?} --> Type{What Type?}

    Type -->|Too many components| Merge[Merge related components<br/>Re-run /specify]
    Type -->|Wrong tech choice| Research[Add constraints<br/>Re-run /plan]
    Type -->|Bad estimates| Velocity[Review velocity<br/>Re-run /tasks]
    Type -->|Unclear POC| Context[Add more context<br/>Re-run /poc]
    Type -->|Too detailed| Simplify[Skip /breakdown<br/>for simple components]
    Type -->|Timeline off| Scope[Adjust scope<br/>Re-run /devflow]
    Type -->|Wrong commits| Stage[Stage manually<br/>Re-run /commit]
    Type -->|Market misalignment| Assessment[Update strategic intelligence<br/>Re-run /strategic-intelligence]
    Type -->|Competitive pressure| Strategy[Reassess strategy<br/>Re-run /strategic-intelligence + /plan]

    Merge --> Verify{Fixed?}
    Research --> Verify
    Velocity --> Verify
    Context --> Verify
    Simplify --> Verify
    Scope --> Verify
    Stage --> Verify
    Assessment --> Verify
    Strategy --> Verify

    Verify -->|Yes| Success[Continue]
    Verify -->|No| Problem

    style Problem fill:#f44336
    style Verify fill:#ff9800
    style Success fill:#4caf50
```

---

## 📅 Sprint Integration

### How Workflow Maps to Sprints

```mermaid
gantt
    title Sprint Planning Integration
    dateFormat YYYY-MM-DD
    section Sprint 0
    /strategic-intelligence :s0-0, 2024-01-01, 2d
    /specify & /poc       :s0-1, after s0-0, 3d
    /plan & /tasks        :s0-2, after s0-1, 2d
    /breakdown & /devflow :s0-3, after s0-2, 2d
    section Sprint 1
    Setup & Foundation    :s1-1, 2024-01-10, 10d
    Daily Updates         :milestone, 2024-01-20, 0d
    section Sprint 2
    Core Features         :s2-1, 2024-01-20, 10d
    /devflow Update      :s2-2, 2024-01-30, 1d
    section Sprint 3
    Integration           :s3-1, 2024-01-31, 10d
    Testing              :s3-2, after s3-1, 3d
    section Sprint 4
    Polish & Deploy       :s4-1, 2024-02-13, 7d
    /commit & PR         :s4-2, after s4-1, 1d
    section Quarterly Review
    /strategic-intelligence Review :q1-1, 2024-04-01, 1d
```

---

## 🎓 Learning Path

### Workflow Mastery Journey

```mermaid
journey
    title Workflow Mastery Journey
    section Beginner
      Run /specify: 3: Developer
      Understand specs: 4: Developer
      Run /plan: 3: Developer
    section Intermediate
      Run /poc for validation: 5: Developer
      Use /tasks for planning: 4: Developer
      Run /breakdown: 4: Developer
    section Advanced
      Customize workflows: 5: Developer
      Integrate with tools: 5: Developer
      Optimize process: 5: Developer
      Mentor others: 5: Developer
```

---

## 🔗 Integration Points

### External Tool Connections

```mermaid
graph TB
    subgraph "Claude Code Workflow"
        Specify["/specify"]
        Plan["/plan"]
        Tasks["/tasks"]
        Breakdown["/breakdown"]
        DevFlow["/devflow"]
        Commit["/commit"]
    end
    
    subgraph "External Tools"
        Jira[Jira/Linear]
        Confluence[Confluence/Notion]
        GitHub[GitHub/GitLab]
        Slack[Slack/Teams]
    end
    
    Tasks -->|CSV Export| Jira
    Breakdown -->|API Docs| Confluence
    DevFlow -->|Roadmap| Confluence
    Commit -->|PR| GitHub
    DevFlow -->|Updates| Slack
    
    style Jira fill:#0052cc
    style Confluence fill:#172b4d
    style GitHub fill:#24292e
    style Slack fill:#4a154b
```

---

## 📖 Quick Reference Card

### Command Cheat Sheet

| Scenario | Commands to Run | Skip |
|----------|----------------|------|
| **New Project** | `/strategic-intelligence` → `/specify` → `/poc` → `/plan` → `/tasks` → `/breakdown` → `/devflow` → `/implement` | None |
| **High Risk Feature** | `/strategic-intelligence` → `/specify` → `/poc` → `/plan` → `/tasks` → `/implement` | `/breakdown` (unless complex) |
| **Simple Feature** | `/specify` → `/plan` → `/tasks` → `/implement` | `/strategic-intelligence`, `/poc`, `/breakdown` |
| **Strategic Planning** | `/strategic-intelligence` → `/plan` → `/devflow` | Others |
| **Requirement Change** | `/specify` → `/devflow` | Others |
| **Tech Stack Change** | `/plan` → `/tasks` → `/breakdown` | `/specify` |
| **Strategic Change** | `/strategic-intelligence` → `/plan` → `/devflow` | Others |
| **Timeline Update** | `/tasks` → `/devflow` | Others |
| **Implementation Ready** | `/implement` | Others |
| **Before Coding** | `/breakdown` | Others |
| **Quarterly Review** | `/strategic-intelligence` | All others |
| **Code Complete** | `/commit` | All others |

---

## 🎉 Success Stories

### Workflow in Action

```mermaid
graph LR
    A[📝 Day 1<br/>Strategic position unclear] --> B["/strategic-intelligence"]
    B --> C[✓ Strategic assessment & market intelligence]

    C --> D[📝 Day 2<br/>Requirements unclear] --> E["/specify"]
    E --> F[✓ Clear component boundaries]

    F --> G[📝 Day 3<br/>High risk approach] --> H["/poc"]
    H --> I[✓ Concept validated]

    I --> J[📝 Day 4<br/>Need architecture] --> K["/plan"]
    K --> L[✓ Tech stack & strategy aligned]

    L --> M[📝 Day 5<br/>Need estimates] --> N["/tasks"]
    N --> O[✓ Sprint planned]

    O --> P[📝 Week 2<br/>Start coding] --> Q["/breakdown"]
    Q --> R[✓ APIs defined]

    R --> S[📝 Week 4<br/>Track progress] --> T["/devflow"]
    T --> U[✓ On schedule & market-aligned]

    U --> V[📝 Week 5<br/>Start implementation] --> W["/implement"]
    W --> X[✓ Phased implementation complete]

    X --> Y[📝 Week 6<br/>Feature complete] --> Z["/commit"]
    Z --> AA[✓ Clean PR with strategic impact]

    style C fill:#4caf50
    style F fill:#4caf50
    style I fill:#4caf50
    style L fill:#4caf50
    style O fill:#4caf50
    style R fill:#4caf50
    style U fill:#4caf50
    style X fill:#4caf50
    style AA fill:#4caf50
```
