---
id: AFM-003-spec-001
workflow_id: AFM-003
type: specification
agent: docs
status: pending
priority: medium
created: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:00:00Z
depends_on: []
blocks: [AFM-003-impl-001, AFM-003-test-001, AFM-003-review-001]
---

# Enhanced Workflow Validation

## Overview

**Component/Feature**: Enhanced Workflow Validation
**Type**: Core Feature
**Purpose**: Comprehensive validation system to catch workflow errors before deployment to AEM.

## Context

### Business Requirements

1. Real-time validation as user builds workflow
2. Clear error messages with fix suggestions
3. Validation warnings for best practices
4. Pre-deployment validation checklist
5. Validation categories: Errors, Warnings, Info

### Technical Constraints

- Must not impact editor performance
- Validation rules are extensible
- Compatible with all AEM workflow features

## Functional Specification

### Validation Rules

| Rule | Category | Description | Severity |
|------|----------|-------------|----------|
| No orphan nodes | Error | All nodes must be connected | Error |
| Start required | Error | Workflow must have exactly one start | Error |
| End required | Error | Workflow must have at least one end | Error |
| No circular refs | Error | No circular references in calls | Error |
| Participant required | Warning | Process steps should have participant | Warning |
| Timeout recommended | Info | Long tasks should have timeout | Info |
| Duplicate names | Warning | Node names should be unique | Warning |
| Empty workflow | Error | Cannot save empty workflow | Error |

### Validation Levels

```typescript
type ValidationLevel = 'error' | 'warning' | 'info';

interface ValidationIssue {
  id: string;
  level: ValidationLevel;
  message: string;
  nodeId?: string;
  fix?: string;
  autoFixable?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  nodeIssues: Record<string, ValidationIssue[]>;
}
```

### User Interactions

1. Validation runs automatically on changes
2. Issues shown in panel with icons
3. Click issue to highlight relevant node
4. Auto-fix available for fixable issues
5. Pre-deploy modal shows full checklist

### Edge Cases

1. **Very large workflows** - Debounce validation (300ms)
2. **Complex cycles** - Timeout detection algorithm
3. **Unknown node types** - Skip validation, warn user

## Acceptance Criteria

- [ ] Real-time validation during editing
- [ ] Clear error/warning/info icons
- [ ] Click to navigate to issue
- [ ] Pre-deploy validation modal
- [ ] Auto-fix for simple issues
- [ ] All existing workflows validated
- [ ] 60%+ test coverage

## Technical Design

### File Structure

| File Type | Path |
|-----------|------|
| Validator | `src/utils/workflowValidator.ts` |
| Rules | `src/utils/validationRules.ts` |
| UI Panel | `src/components/ValidationPanel.tsx` |
| Store Integration | `src/hooks/useWorkflowStore.ts` |
| Tests | `src/utils/__tests__/workflowValidator.test.ts` |

## Progress Log

### 2026-03-13
Initial specification created.
