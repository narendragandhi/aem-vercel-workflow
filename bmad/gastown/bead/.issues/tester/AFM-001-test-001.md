---
id: AFM-001-test-001
workflow_id: AFM-001
type: testing
agent: tester
status: pending
priority: high
created: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:00:00Z
depends_on: [AFM-001-impl-001]
blocks: [AFM-001-review-001]
spec_ref: docs/AFM-001-spec-001.md
---

# Testing: Workflow Version Control

## Task
Write comprehensive tests for the version control implementation.

## Test Coverage Requirements

### Unit Tests
- [ ] versionService.save() saves to localStorage
- [ ] versionService.load() retrieves version
- [ ] versionService.list() returns all versions
- [ ] versionService.delete() removes version
- [ ] Storage limit enforced (max 50)
- [ ] Duplicate names handled
- [ ] Empty history handled

### Component Tests
- [ ] VersionHistory component renders
- [ ] Version list displays correctly
- [ ] Save button triggers save
- [ ] Restore button restores version
- [ ] Delete button removes version
- [ ] Empty state shown when no versions

### Edge Cases
- [ ] localStorage unavailable
- [ ] Storage quota exceeded
- [ ] Corrupt data in localStorage

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/__tests__/versionService.test.ts` | Service unit tests |
| `src/components/__tests__/VersionHistory.test.tsx` | Component tests |

## Quality Gates
- [ ] 60%+ line coverage
- [ ] All tests pass: `npm test`
- [ ] Tests are maintainable

## Progress
- [ ] Review specification
- [ ] Review implementation
- [ ] Write service tests
- [ ] Write component tests
- [ ] Run coverage
- [ ] Fix any issues
