# AEMFlow BMAD

Business Model for AI Development (BMAD) with BEADS methodology.

## Structure

```
bmad/
├── PRODUCT_SPEC.md           # Product definition (Phase 00-03)
├── MVP_TASK_BREAKDOWN.md     # MVP-focused task list
├── SPEC_GROWTH_INITIATIVE.md # Original growth spec
├── BEAD_TASK_BREAKDOWN.md    # Full 42-task breakdown (reference)
├── README.md                 # This file
└── gastown/
    ├── config/               # Agent orchestration
    ├── agents/               # Agent personas
    └── bead/.issues/         # Task tracking
```

## Current Focus: MVP

We pivoted from "feature factory" to **validated product development**.

### What Changed

| Before | After |
|--------|-------|
| 42 tasks, 6 sprints | 11 tasks, 4 sprints (MVP) |
| Build without validation | Build-Measure-Learn loop |
| Technical metrics | User outcome metrics |
| "Done" = code shipped | "Done" = users adopt |

### MVP Goals

1. **Visual Editor** - Drag-drop workflow canvas
2. **Export** - AEM XML generation
3. **AI** - Text-to-workflow
4. **Validation** - Real-time error checking

### Success Metrics

- 20+ beta users
- Workflow creation < 5 min (vs 15 min XML)
- 0 critical bugs

## Active Sprint

**Sprint 1: Core Visual Editor**

- [ ] MVP-001: Visual Canvas
- [ ] MVP-002: Basic Nodes  
- [ ] MVP-003: Edge Connections

## Product Spec

See `PRODUCT_SPEC.md` for:
- Target user definition
- Pain points validated
- Success metrics (OKRs)
- Go-to-market strategy
