# AEMFlow Product Specification

## BMAD Phase 00: Product Initialization

### Problem Statement

**AEM developers waste 40%+ time hand-coding XML workflows**

Current state:
- AEM Workflows defined in XML (ecma/flex)
- No visual representation
- No AI assistance
- Steep learning curve for new developers
- Error-prone manual editing

### Target User

| Attribute | Definition |
|-----------|------------|
| **Primary** | AEM Developers (6-15 years experience) |
| **Secondary** | AEM Technical Leads |
| **Tertiary** | AEM Business Analysts (view-only) |
| **NOT for** | Non-technical users |

### Target Market

- Adobe Experience Manager customers
- AEM as a Cloud Service / AEM 6.5+
- Enterprise companies with AEM teams (10+ developers)

### Pain Points (Validated)

| Pain Point | Frequency | Impact |
|------------|-----------|--------|
| XML workflow debugging | Daily | High |
| Trial-and-error AEM workflow syntax | Daily | High |
| No visual feedback during editing | Daily | Medium |
| Time-consuming workflow testing | Weekly | High |
| Knowledge silos (only seniors know workflows) | Weekly | High |

---

## BMAD Phase 01: Market & User Discovery

### Competitive Landscape

| Competitor | Strength | Weakness | AEMFlow Advantage |
|------------|----------|----------|-------------------|
| Adobe Experience Manager Workflow Console | Native | No AI, Basic UI | Visual + AI |
| Visio/Lucidchart | Great UI | No AEM export | AEM-native |
| AEM Workflow Builder (older) | Built-in | Obsolete | Modern tech |

### Unique Value Proposition

**"Visual AI-powered AEM workflow development that cuts development time by 60%"**

### Differentiators

1. **Visual Editor** - Drag-drop, real-time preview
2. **AI Generation** - Natural language to AEM workflow
3. **AEM-Native Export** - Direct XML/JSON to AEM
4. **Validation** - Prevents runtime errors

---

## BMAD Phase 02: Product Model

### Success Metrics (OKRs)

| Objective | Key Result | Target |
|-----------|------------|--------|
| **Adoption** | Weekly Active Users | 50 by Q3 |
| **Time Savings** | Workflow creation time | -60% vs XML |
| **Quality** | Workflow error rate | -80% |
| **Satisfaction** | NPS Score | 40+ |

### MVP Scope

**Feature Set 1: Visual Editor**

| Feature | Must Have | Nice to Have |
|---------|-----------|--------------|
| Drag-drop node canvas | ✅ | |
| Basic node types (6) | ✅ | |
| Edge connections | ✅ | |
| Save/Load workflows | ✅ | |
| Export to AEM XML | ✅ | |
| Export to JSON | | ✅ |

**Feature Set 2: AI Generation**

| Feature | Must Have | Nice to Have |
|---------|-----------|--------------|
| Text-to-workflow prompt | ✅ | |
| OpenAI integration | ✅ | |
| Prompt templates | | ✅ |
| Multi-provider (Anthropic) | | ✅ |

**Feature Set 3: Validation**

| Feature | Must Have | Nice to Have |
|---------|-----------|--------------|
| Required field validation | ✅ | |
| Connection validation | ✅ | |
| Real-time error display | ✅ | |
| Quick-fix suggestions | | ✅ |

### Out of Scope (MVP)

- Undo/Redo (already exists)
- Advanced nodes (Delay, Loop, Condition) - Phase 2
- Collaboration/Multi-user - Phase 3
- AEM Cloud Service integration - Phase 2
- RBAC - Phase 3

---

## BMAD Phase 03: Product Architecture

### Core User Flow

```
1. User opens AEMFlow
2. Chooses: Start blank OR Use AI OR Load template
3. Builds workflow visually (drag nodes, connect edges)
4. Validates (sees errors in real-time)
5. Exports to AEM XML
6. Deploys to AEM
```

### Build Measure Learn Loop

| Week | Build | Measure | Learn |
|------|-------|---------|-------|
| 1 | Visual Editor MVP | Internal testing | UX feedback |
| 2 | AI Integration | 5 beta users | Prompt quality |
| 3 | Export Pipeline | 10 beta users | Export accuracy |
| 4 | Validation | 20 beta users | Error patterns |

---

## Product Requirements

### Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| PR-01 | User can drag nodes onto canvas | Must | Node appears at drop position |
| PR-02 | User can connect nodes with edges | Must | Edge renders between source/target |
| PR-03 | User can export to AEM XML | Must | Valid AEM workflow XML file |
| PR-04 | AI generates workflow from text | Must | At least 3 node workflow generated |
| PR-05 | Validation shows errors in real-time | Must | Error appears within 500ms |
| PR-06 | User can save/load workflow | Must | JSON persists and reloads correctly |

### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Page load time | < 3 seconds |
| NFR-02 | Node drag responsiveness | < 16ms (60fps) |
| NFR-03 | AI response time | < 30 seconds |
| NFR-04 | Browser support | Chrome, Firefox, Safari |

---

## Go-to-Market Strategy

### Launch Phases

| Phase | Timeline | Focus |
|-------|----------|-------|
| Private Beta | Week 1-4 | 20 AEM developers |
| Public Beta | Week 5-8 | 100 users |
| v1.0 Launch | Week 9-12 | General availability |

### Distribution Channels

1. **Direct**: aemflow.com
2. **AEM Community**: Blog posts, forums
3. **GitHub**: Open source core, paid features

### Pricing Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Visual Editor, Export XML |
| Pro | $29/mo | AI generation, Templates, Support |
| Enterprise | Custom | SSO, On-prem, SLA |

---

## Success Validation

### Before Building (Must Answer)

- [x] Who is the target user? → AEM Developers
- [x] What problem do they have? → XML workflow is slow/error-prone
- [x] How do we solve it better? → Visual + AI generation
- [x] How will we measure success? → Time savings, error reduction
- [x] What's the MVP scope? → Visual Editor + AI + Validation + Export

### After MVP (Must Validate)

- [ ] 20+ beta users actively building workflows
- [ ] Time-to-create workflow < 5 minutes (vs 15 min XML)
- [ ] 0 critical bugs in production
- [ ] User feedback collected and incorporated

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-16 | PM Review | Initial product specification |

## Approval

- [ ] Product Strategy: _________________ Date: _______
- [ ] Technical Feasibility: _________________ Date: _______
- [ ] Resource Commitment: _________________ Date: _______
