---
id: AEMF-003-impl-001
workflow_id: AEMF-003
type: implementation
agent: coder
status: pending
priority: high
depends_on: [AEMF-003-spec-001]
blocks: [AEMF-003-test-001, AEMF-003-review-001]
---

# ReactFlow 11.x Upgrade Implementation

## Reference
- Specification: bmad/gastown/bead/.issues/docs/AEMF-003-spec-001.md

## Implementation Details

### Step 1: Update Dependencies

```bash
npm install reactflow@^11.0.0
```

Or if using @xyflow/react:

```bash
npm install @xyflow/react@^12.0.0
```

### Step 2: Check for Breaking Changes

**Review the changelog:**
- https://github.com/xyflow/xyflow/blob/main/packages/react/CHANGELOG.md
- https://github.com/xyflow/xyflow/releases

### Step 3: Update Custom Node Types

```typescript
// Before: src/components/nodes/types.ts
import { Node } from 'reactflow';

// After (11.x):
import { Node, NodeProps } from 'reactflow';

// Update node props interface
export interface CustomNodeData {
  label: string;
  config?: Record<string, unknown>;
}

export type CustomNode = Node<CustomNodeData, 'custom'>;
```

### Step 4: Update Node Component Signatures

```typescript
// Before
export function CustomNode({ data, selected }) {
  return <div>{data.label}</div>;
}

// After - ensure proper typing
interface CustomNodeProps {
  data: CustomNodeData;
  selected?: boolean;
}

export function CustomNode({ data, selected }: CustomNodeProps) {
  return <div>{data.label}</div>;
}
```

### Step 5: Update Edge Types

```typescript
// src/components/edges/types.ts
import { Edge, EdgeProps } from 'reactflow';

export interface CustomEdgeData {
  animated?: boolean;
  style?: React.CSSProperties;
}

export type CustomEdge = Edge<CustomEdgeData>;
```

### Step 6: Update Hook Usage

```typescript
// Before
import { useReactFlow } from 'reactflow';

const { nodes, edges } = useReactFlow();

// After - verify hook still works
import { useReactFlow } from 'reactflow';

const { nodes, edges, onNodesChange } = useReactFlow();

// Check if any hooks have changed signatures
```

### Step 7: Update ReactFlow Provider

```typescript
// Before
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';

// After - may need adjustment
import ReactFlow from 'reactflow';
// Some styles may need explicit import
```

### Step 8: Update Minimap/Controls

```typescript
// Verify these still work
import { 
  ReactFlow, 
  Controls, 
  MiniMap,
  Background,
  BackgroundVariant 
} from 'reactflow';

<ReactFlow
  nodes={nodes}
  edges={edges}
>
  <Controls />
  <MiniMap />
  <Background variant={BackgroundVariant.Dots} />
</ReactFlow>
```

### Step 9: Check Node Handle Types

```typescript
// Verify handle positioning still works
import { Handle, Position } from 'reactflow';

<Handle 
  type="target" 
  position={Position.Top} 
  id="input"
/>
<Handle 
  type="source" 
  position={Position.Bottom} 
  id="output"
/>
```

### Step 10: Run Tests & Verify

```bash
npm run dev
# Test manually:
# - Canvas loads
# - Nodes draggable
# - Edges connect
# - Minimap works
# - Controls work
# - Zoom/pan works

npm test
```

### Step 11: Visual Regression (Optional)

```bash
# Install Playwright if not present
npx playwright install

# Take baseline screenshot
# After upgrade, compare screenshots
```

## Files to Modify

- `package.json` - Update reactflow version
- `src/components/WorkflowCanvas.tsx` - Update imports/usage
- `src/components/nodes/*.tsx` - Update node components
- `src/components/edges/*.tsx` - Update edge components
- `src/hooks/*.ts` - Update custom hooks

## Breaking Changes to Watch

1. **Node types**: May need explicit type in data
2. **Edge types**: Check custom edge implementation
3. **Hooks**: Verify signatures
4. **CSS**: Some styles may need adjustment

## Quality Gates

- [ ] `npm install` succeeds
- [ ] Dev server starts without errors
- [ ] Canvas renders correctly
- [ ] All node types work
- [ ] Edges connect properly
- [ ] Minimap and controls function
- [ ] Tests pass

## Rollback Plan

If issues occur:

```bash
npm install reactflow@^10.3.0
```

## Next Steps

- Update documentation for custom node creation
- Verify React 18 compatibility
- Consider using @xyflow/react going forward

