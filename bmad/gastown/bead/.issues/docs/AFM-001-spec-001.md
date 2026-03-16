---
id: AFM-001-spec-001
workflow_id: AFM-001
type: specification
agent: docs
status: in_progress
priority: high
created: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:00:00Z
depends_on: []
blocks: [AFM-001-impl-001, AFM-001-test-001, AFM-001-review-001]
---

# Workflow Version Control System

## Overview

**Component/Feature**: Workflow Version Control
**Type**: Core Feature
**Purpose**: Enable saving, versioning, and restoring workflow designs with history tracking and comparison capabilities.

## Context

### Business Requirements

1. Authors can save workflow versions with meaningful names
2. System maintains version history with timestamps
3. Users can restore any previous version
4. Users can compare two versions side-by-side
5. Old versions are automatically cleaned up after 90 days

### Technical Constraints

- Frontend-only implementation (localStorage)
- Maximum 50 versions per workflow
- Version data includes: nodes, edges, metadata
- Must work offline after initial load

## Functional Specification

### Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Save Version | Save current workflow as named version | Required |
| Version History | List all saved versions with timestamps | Required |
| Restore Version | Load and restore a previous version | Required |
| Delete Version | Remove unwanted versions | Required |
| Version Compare | Visual diff between two versions | Optional |
| Auto-save | Periodic automatic saving | Optional |

### User Interactions

1. User clicks "Save Version" button
2. Modal appears with version name input
3. User enters name and confirms
4. Version is saved with timestamp
5. Success notification shown

### Data Model

```typescript
interface WorkflowVersion {
  id: string;
  workflowId: string;
  name: string;
  timestamp: string;
  data: {
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
  };
  metadata?: {
    description?: string;
    author?: string;
  };
}

interface VersionHistory {
  workflowId: string;
  versions: WorkflowVersion[];
  maxVersions: number;
  retentionDays: number;
}
```

### Storage Schema

```typescript
// localStorage keys
'aemflow_versions_{workflowId}' => VersionHistory
```

### Edge Cases

1. **Storage full** - Show warning, offer to delete old versions
2. **Corrupt data** - Validate data on load, skip invalid versions
3. **No versions** - Show empty state with call to action
4. **Name collision** - Append timestamp to duplicate names

## Non-Functional Requirements

### Performance

- Save operation < 500ms
- Load history < 200ms
- No blocking UI during save

### Storage

- Max 10MB per workflow in localStorage
- Compress version data before saving

### UX

- Undo restore within 30 seconds
- Confirmation before overwriting unsaved changes

## Acceptance Criteria

- [ ] User can save a named version of current workflow
- [ ] User can view list of all saved versions
- [ ] User can restore any previous version
- [ ] User can delete individual versions
- [ ] Versions persist across browser sessions
- [ ] Storage limit is enforced (max 50 versions)
- [ ] Empty state shown when no versions exist
- [ ] All tests pass
- [ ] 60%+ code coverage

## Technical Design

### File Structure

| File Type | Path |
|-----------|------|
| Version Service | `src/services/versionService.ts` |
| Store Integration | `src/hooks/useWorkflowStore.ts` (add version methods) |
| UI Component | `src/components/VersionHistory.tsx` |
| Tests | `src/services/__tests__/versionService.test.ts` |

### Dependencies

No new dependencies required. Uses localStorage built into browsers.

### UI Integration Points

- Add "Save Version" button to toolbar
- Add "Version History" button to toolbar
- Show version history in side panel or modal

### API (Future)

```typescript
// Future AEM backend integration
interface VersionAPI {
  save(workflowId: string, version: WorkflowVersion): Promise<void>;
  list(workflowId: string): Promise<WorkflowVersion[]>;
  restore(workflowId: string, versionId: string): Promise<void>;
  delete(workflowId: string, versionId: string): Promise<void>;
}
```

## Progress Log

### 2026-03-13
Initial specification created following BMAD methodology.

## Notes

- This is a core feature that enables safe experimentation
- Future: Cloud sync with AEM backend
- Consider: Version tagging for milestones
