# AEMFlow MVP BEAD Task Breakdown

## Product Context

**MVP Goal**: Build a Visual AI-Powered AEM Workflow Editor that reduces workflow creation time by 60%

**Target User**: AEM Developers (6-15 years experience)

**⚠️ CRITICAL**: This spec contains hypotheses, not validated facts. MVP-000 must be completed FIRST to validate assumptions.

**Success Metrics**:
- 20+ beta users actively building workflows (not assumed)
- Time-to-create workflow < 5 minutes (measured, not assumed)
- 0 critical bugs in production

---

## Sprint 0: User Discovery (BMAD 01) - MUST START FIRST

### MVP-000: User Research & Validation

```yaml
beadId: MVP-000
phase: 01-Discovery
owner: Mayor Agent
title: User Discovery & Validation
status: pending
priority: critical
depends_on: []
notes:
  - Interview 5+ AEM developers
  - Validate pain points (XML workflow debugging, time spent)
  - Test price sensitivity ($29/mo - too much/just right/too cheap)
  - Find 20 beta user candidates
  - Document findings in bmad/discovery/
```

**Deliverables:**
- [ ] User interview transcripts (5+)
- [ ] Validated pain point list
- [ ] 20 beta user signups
- [ ] Price validation feedback
- [ ] Go/No-Go decision for MVP scope

**Questions to Answer:**
1. Do AEM developers actually spend 40%+ time on XML workflows?
2. Would they pay $29/mo for a visual solution?
3. What features matter most to them?
4. How do they currently create workflows?

---

## MVP Feature Prioritization

### Must Have (Build Now)

| Priority | Feature | Value |
|----------|---------|-------|
| P0 | Visual Canvas (drag-drop nodes) | Core product |
| P0 | Node connections (edges) | Core product |
| P0 | Export to AEM XML | Primary differentiation |
| P0 | Save/Load workflows | Essential |
| P1 | AI text-to-workflow | Key differentiator |
| P1 | Real-time validation | Quality assurance |
| P2 | Basic node types (6) | Essential |

### Nice to Have (Phase 2)

- Advanced nodes (Delay, Loop, Condition)
- Multiple AI providers
- Templates gallery
- Collaboration

---

## Sprint 1: Core Visual Editor (BMAD 04)

### MVP-001: Visual Canvas Infrastructure

```yaml
beadId: MVP-001
phase: 04-Development
owner: Coder Agent
title: Visual Canvas with Drag-Drop
status: pending
priority: critical
depends_on: []
notes:
  - ReactFlow canvas setup
  - Node drag-and-drop from sidebar
  - Canvas pan/zoom
  - Grid background
```

### MVP-002: Basic Node Types

```yaml
beadId: MVP-002
phase: 04-Development
owner: Coder Agent
title: Core Node Components
status: pending
priority: critical
depends_on: [MVP-001]
notes:
  - Start/End node
  - Process Step node
  - Participant node
  - Granit Routing node
  - DAM Update node
  - Email Notification node
```

### MVP-003: Edge Connections

```yaml
beadId: MVP-003
phase: 04-Development
owner: Coder Agent
title: Node Connection System
status: pending
priority: critical
depends_on: [MVP-001, MVP-002]
notes:
  - Connect source to target handles
  - Animated edges
  - Delete connection
  - Connection validation
```

---

## Sprint 2: Save/Load & Export (BMAD 04)

### MVP-004: Workflow Persistence

```yaml
beadId: MVP-004
phase: 04-Development
owner: Coder Agent
title: Save and Load Workflows
status: pending
priority: critical
depends_on: [MVP-003]
notes:
  - Save to localStorage
  - Load from localStorage
  - JSON schema validation
  - Import from file
```

### MVP-005: AEM XML Export

```yaml
beadId: MVP-005
phase: 04-Development
owner: Coder Agent
title: Export to AEM Workflow XML
status: pending
priority: critical
depends_on: [MVP-004]
notes:
  - Generate valid AEM workflow XML
  - Support all node types
  - Download as .xml file
  - Validate XML structure
```

### MVP-006: JSON Export

```yaml
beadId: MVP-006
phase: 04-Development
owner: Coder Agent
title: Export to JSON Format
status: pending
priority: medium
depends_on: [MVP-004]
notes:
  - Export workflow as JSON
  - Import from JSON
  - Schema versioning
```

---

## Sprint 3: AI Generation (BMAD 04)

### MVP-007: AI Service Integration

```yaml
beadId: MVP-007
phase: 04-Development
owner: Coder Agent
title: AI Text-to-Workflow Service
status: pending
priority: high
depends_on: [MVP-005]
notes:
  - OpenAI API integration
  - Prompt template system
  - Response parsing
  - Error handling
```

### MVP-008: AI UI Integration

```yaml
beadId: MVP-008
phase: 04-Development
owner: Coder Agent
title: AI Generation UI
status: pending
priority: high
depends_on: [MVP-007]
notes:
  - Prompt input field
  - Generate button
  - Loading state
  - Error display
  - Insert generated workflow to canvas
```

---

## Sprint 4: Validation & Polish (BMAD 05)

### MVP-009: Real-time Validation

```yaml
beadId: MVP-009
phase: 05-Testing
owner: Tester Agent
title: Workflow Validation System
status: pending
priority: high
depends_on: [MVP-005]
notes:
  - Required fields check
  - Connection integrity
  - Error panel UI
  - Error highlighting on nodes
```

### MVP-010: Integration Testing

```yaml
beadId: MVP-010
phase: 05-Testing
owner: Tester Agent
title: End-to-End User Flows
status: pending
priority: critical
depends_on: [MVP-009]
notes:
  - Full user journey test
  - Export validation test
  - AI generation test
  - Cross-browser testing
```

### MVP-011: Documentation

```yaml
beadId: MVP-011
phase: 06-Documentation
owner: Docs Agent
title: User Documentation
status: pending
priority: medium
depends_on: [MVP-010]
notes:
  - Getting started guide
  - Node reference
  - AI prompt examples
  - FAQ
```

---

## Phase 2: Enhancement (Post-MVP)

### Post-MVP Features

| Feature | Priority | Dependency |
|---------|----------|------------|
| Advanced nodes (Delay, Loop) | Medium | MVP-002 |
| Multi-provider AI (Anthropic) | Medium | MVP-008 |
| Template gallery | Medium | MVP-004 |
| Collaboration features | Low | MVP-005 |

---

## Quality Gates

Before each feature is complete:

- [ ] `npm run build` passes
- [ ] `npm run lint` passes (or baseline established)
- [ ] `npm test` passes
- [ ] Manual testing completed
- [ ] Acceptance criteria met

---

## Velocity Tracking

| Sprint | Planned | Completed | Notes |
|--------|---------|-----------|-------|
| Sprint 0 | 1 bead | ? | User Discovery (MUST FIRST) |
| Sprint 1 | 3 beads | ? | Visual Editor |
| Sprint 2 | 3 beads | ? | Save/Load/Export |
| Sprint 3 | 2 beads | ? | AI Integration |
| Sprint 4 | 3 beads | ? | Validation/Docs |
| **Total** | **12 beads** | | **MVP** |

---

## ⚠️ Important Notes

**STOP - READ BEFORE CONTINUING:**

1. **MVP-000 is mandatory** - Do not start coding until user research is done
2. **This is a hypothesis-driven product** - Every assumption needs validation
3. **If users don't validate pain points** - Pivot or cancel
4. **If users won't pay $29** - Adjust pricing or business model
5. **If can't find 20 beta users** - Reconsider product-market fit

## Build-Measure-Learn Schedule

| Week | Sprint | Build | Measure | Learn |
|------|--------|-------|---------|-------|
| 1 | Sprint 0 | User Interviews | Survey | Pain points validated? |
| 2 | Sprint 1 | Visual Editor | Internal | UX works? |
| 3 | Sprint 2 | Save/Load/Export | 5 beta users | Export accurate? |
| 4 | Sprint 3 | AI Generation | 10 beta users | AI useful? |
| 5 | Sprint 4 | Validation | 20 beta users | Errors caught? |

- All tasks must tie back to product requirements (PR-01 through PR-06)
- Focus on MVP only - resist scope creep
- Validate with users after each sprint
- Measure: time-to-create, error rate, user satisfaction
