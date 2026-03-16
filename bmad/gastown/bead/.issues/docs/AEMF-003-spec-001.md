---
id: AEMF-003-spec-001
workflow_id: AEMF-003
type: specification
agent: docs
status: completed
priority: high
depends_on: []
blocks: [AEMF-003-impl-001]
---

# ReactFlow 11.x Upgrade

## Overview

Upgrade ReactFlow from version 10.x to 11.x to leverage new features, performance improvements, and ensure compatibility with the latest React ecosystem.

## Context

ReactFlow 11.x introduces:
- Improved performance for large graphs
- New node types and hooks
- Better TypeScript support
- Updated internal APIs

Current version: ReactFlow 10.x
Target version: ReactFlow 11.x

## Functional Specification

### 1. Dependency Update

**Current package.json:**
```json
{
  "dependencies": {
    "reactflow": "^10.3.0"
  }
}
```

**Target:**
```json
{
  "dependencies": {
    "reactflow": "^11.0.0"
  }
}
```

### 2. Breaking Changes to Address

**a) Node Types Update**
```typescript
// Before (10.x)
const nodeTypes = {
  custom: CustomNode,
};

// After (11.x)
// May require type: 'custom' explicitly in node data
```

**b) Hook API Changes**
```typescript
// Before
const { nodes, edges, onNodesChange } = useReactFlow();

// After
// Some hooks may have updated signatures
```

**c) Edge Types**
```typescript
// Before
const edgeTypes = {
  custom: CustomEdge,
};

// After
// Verify custom edge handling
```

**d) Component Props**
```typescript
// Before
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
/>

// After
// Some props may be required vs optional
```

### 3. Testing Requirements

**a) Visual Regression Tests**
- Canvas renders correctly
- Nodes draggable and positionable
- Edges connect properly
- Minimap displays correctly
- Controls function properly

**b) Interaction Tests**
- Node selection works
- Edge creation works
- Zoom/pan works
- Node deletion works

**c) Custom Node Tests**
- Verify all custom node implementations
- Check data binding
- Check handles/connections

### 4. Package Updates

ReactFlow 11.x may require:
- `@xyflow/react` (new package name in some versions)
- Update peer dependencies for React 18

## Non-Functional Requirements

- **Performance**: No regression in canvas performance
- **Compatibility**: Works with React 18
- **Types**: Full TypeScript support
- **Bundle**: No significant size increase

## Acceptance Criteria

1. [ ] ReactFlow upgraded to 11.x
2. [ ] All custom nodes updated for new API
3. [ ] All edge types updated
4. [ ] Canvas interactions work (drag, zoom, pan)
5. [ ] Minimap renders correctly
6. [ ] Controls function properly
7. [ ] All existing tests pass
8. [ ] No TypeScript errors from upgrade

## Progress Log

