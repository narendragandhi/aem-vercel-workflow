---
id: MRW-002-review-001
workflow_id: MRW-002
type: review
agent: reviewer
status: in_progress
priority: high
depends_on: [MRW-002-spec-001, MRW-002-impl-001, MRW-002-test-001]
blocks: []
---

# Code Review - ResourceResolver Integration

## Reference
- Specification: bmad/gastown/bead/.issues/docs/MRW-002-spec-001.md
- Implementation: bmad/gastown/bead/.issues/coder/MRW-002-impl-001.md
- Tests: bmad/gastown/bead/.issues/tester/MRW-002-test-001.md

## Review Checklist

### ResourceResolver Usage
- [ ] ResourceResolverFactory properly injected via @Reference
- [ ] Service user (subservice) pattern used - NOT admin session
- [ ] ResourceResolver properly closed (try-with-resources)
- [ ] LoginException handled appropriately

### Sling Models
- [ ] @Model annotation on model classes
- [ ] @Inject annotations for resource properties
- [ ] @Named for JCR property mapping
- [ ] Proper adaptation: resource.adaptTo(Model.class)

### Code Quality
- [ ] No hardcoded paths - constants used
- [ ] Logging at appropriate levels
- [ ] Null checks for missing resources
- [ ] Proper exception handling

### Testing
- [ ] Tests use AemMockTest base class
- [ ] AemContext properly configured
- [ ] Coverage meets 80% threshold
- [ ] All tests pass

## Review Output

### Issues Found

| Severity | Issue | Location | Recommendation |
|----------|-------|----------|----------------|

### Approval Status

- [ ] APPROVED
- [ ] CHANGES REQUESTED
- [ ] BLOCKED

## Final Decision

```
APPROVED / CHANGES REQUESTED
```
