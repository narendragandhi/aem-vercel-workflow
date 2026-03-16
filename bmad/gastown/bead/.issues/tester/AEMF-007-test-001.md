---
id: AEMF-007-test-001
workflow_id: AEMF-007
type: test
agent: tester
status: pending
priority: critical
depends_on: [AEMF-007-impl-001]
blocks: [AEMF-007-review-001]
---

# Advanced Node Types Testing

## Context

Implementation: AEMF-007-impl-001

## Test Plan

### Unit Tests
- ConditionNode evaluation
- LoopNode iteration
- ParallelNode branch spawning
- SubWorkflowNode invocation
- DelayNode timing
- ErrorHandlerNode catch/throw

### Integration Tests
- Node-to-node data flow
- Variable scoping
- Expression evaluation
- State persistence

### Visual Tests
- Node rendering
- Configuration panel
- Expression editor
- Branch visualization

## Coverage Target
- 70% line coverage
- All node types tested
- Edge cases covered

## Quality Gates
- [ ] npm test passes
- [ ] 70%+ coverage
- [ ] No console errors

## Notes
