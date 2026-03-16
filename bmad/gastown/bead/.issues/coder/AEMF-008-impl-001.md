---
id: AEMF-008-impl-001
workflow_id: AEMF-008
type: implementation
agent: coder
status: completed
priority: high
depends_on: [AEMF-008-spec-001]
blocks: [AEMF-008-test-001]
---

# Workflow Validation Engine Implementation

## Context

SPEC: AEMF-008-spec-001

## Implementation Plan

### Phase 1: Validation Core
1. Create validator class in `src/utils/validator.ts`
2. Define ValidationRule interface
3. Implement base rule infrastructure

### Phase 2: Rule Implementation
1. RequiredFields rule
2. ConnectedNodes rule
3. NoOrphans rule
4. ValidTransitions rule
5. ParticipantAssigned rule
6. ProcessArgs rule
7. NoCycles rule
8. MaxDepth rule

### Phase 3: UI Integration
1. Validation panel component
2. Real-time validation hook
3. Quick-fix actions

## Key Files
- `src/utils/validator.ts`
- `src/utils/validationRules.ts`
- `src/components/panels/ValidationPanel.tsx`
- `src/hooks/useValidation.ts`

## Quality Gates
- [ ] npm run build passes
- [ ] npm run lint passes
- [ ] npm run type-check passes

## Notes
