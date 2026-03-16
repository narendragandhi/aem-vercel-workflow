---
id: AEMF-007-impl-001
workflow_id: AEMF-007
type: implementation
agent: coder
status: pending
priority: critical
depends_on: [AEMF-003, AEMF-007-spec-001]
blocks: [AEMF-007-test-001]
---

# Advanced Node Types Implementation

## Context

SPEC: AEMF-007-spec-001

## Implementation Plan

### Phase 1: Base Infrastructure
1. Create node type registry in `src/components/nodes/`
2. Define base types for advanced nodes
3. Add node configuration panels

### Phase 2: Core Nodes
1. ConditionNode - Branch logic
2. LoopNode - Iteration support
3. ParallelNode - Concurrent execution

### Phase 3: Enterprise Nodes
1. SubWorkflowNode - Nested workflows
2. DelayNode - Timing control
3. ErrorHandlerNode - Exception handling

### Phase 4: UI/UX
1. Expression editor component
2. Branch visualizer
3. Sub-workflow picker

## Key Files

- `src/components/nodes/advanced/` - Node implementations
- `src/components/panels/` - Configuration panels
- `src/types/nodes.ts` - Type definitions
- `src/store/workflowStore.ts` - State updates

## Quality Gates

- [ ] npm run build passes
- [ ] npm run lint passes
- [ ] npm run type-check passes
- [ ] npm test passes (60%+ coverage)

## Notes
