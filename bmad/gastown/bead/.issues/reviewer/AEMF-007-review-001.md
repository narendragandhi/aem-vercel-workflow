---
id: AEMF-007-review-001
workflow_id: AEMF-007
type: review
agent: reviewer
status: pending
priority: critical
depends_on: [AEMF-007-test-001]
blocks: []
---

# Advanced Node Types Review

## Context

Test: AEMF-007-test-001

## Review Checklist

### Code Quality
- [ ] Clean code principles followed
- [ ] No code duplication
- [ ] Proper error handling

### Architecture
- [ ] Follows existing patterns
- [ ] Extensible design
- [ ] Proper separation of concerns

### Testing
- [ ] Test coverage adequate
- [ ] Edge cases covered
- [ ] No flakiness

### Documentation
- [ ] Code comments where needed
- [ ] README updated
- [ ] API documented

## Quality Gates
- [ ] All tests pass
- [ ] npm run lint passes
- [ ] npm run type-check passes

## Notes
