---
id: AEMF-002-impl-001
workflow_id: AEMF-002
type: implementation
agent: coder
status: pending
priority: critical
depends_on: [AEMF-002-spec-001]
blocks: [AEMF-002-test-001, AEMF-002-review-001]
---

# TypeScript Strict Mode Implementation

## Reference
- Specification: bmad/gastown/bead/.issues/docs/AEMF-002-spec-001.md

## Implementation Details

### Step 1: Enable Strict Mode

**Update tsconfig.json:**

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### Step 2: Run Type Check & Catalog Errors

```bash
npm run type-check 2>&1 | tee strict-errors.txt
```

### Step 3: Fix Null/Undefined Issues

**Common patterns:**

```typescript
// src/store/workflowStore.ts
// Add explicit return types and null checks

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

function findNode(nodes: Node[], id: string): Node | undefined {
  return nodes.find((n) => n.id === id);
}

// Use optional chaining and nullish coalescing
const nodeName = node?.data?.label ?? 'Unnamed';
```

### Step 4: Fix Missing Return Types

```typescript
// Add void return to functions that don't return
function logMessage(message: string): void {
  console.log(message);
}

// Add return types to conditional returns
function getNodeById(id: string): Node | undefined {
  if (!id) return undefined;
  return nodes.find((n) => n.id === id);
}
```

### Step 5: Fix Property Initialization

```typescript
// Use definite assignment or initialize in constructor
class WorkflowManager {
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  
  constructor() {
    // or use '!' if assigned before use
  }
}
```

### Step 6: Fix Array Access

```typescript
// Use optional chaining or check length
const firstNode = nodes[0]; // Error: possibly undefined
const firstNode = nodes[0]!; // Only if guaranteed
const firstNode = nodes.at(0); // Returns undefined if empty

// Or check explicitly
if (nodes.length > 0) {
  const first = nodes[0];
}
```

### Step 7: Fix Strict Function Types

```typescript
// Ensure parameter types match exactly
type NodeCallback = (node: Node) => void;

function processNode(callback: NodeCallback): void {
  const node = getNode();
  if (node) {
    callback(node);
  }
}
```

### Step 8: Update ESLint Config

```javascript
// .eslintrc.cjs
module.exports = {
  rules: {
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
  }
};
```

### Step 9: Add Type Annotations

```typescript
// src/components/nodes/CustomNode.tsx
import { Handle, Position, NodeProps } from 'reactflow';

interface CustomNodeData {
  label: string;
  status?: 'pending' | 'active' | 'complete';
}

export function CustomNode({ data }: NodeProps<CustomNodeData>) {
  const label: string = data.label;
  const status: string = data.status ?? 'pending';
  
  return (
    <div className={`node ${status}`}>
      <Handle type="target" position={Position.Top} />
      <div>{label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

### Step 10: Verify Build Passes

```bash
npm run lint
npm run type-check
npm test
```

## Files to Modify

- `tsconfig.json` - Enable strict flags
- `src/types/*.ts` - Add proper types
- `src/store/workflowStore.ts` - Fix type issues
- `src/utils/*.ts` - Fix utility functions
- `src/components/**/*.tsx` - Fix component types
- `.eslintrc.cjs` - Add strict rules

## Quality Gates

- [ ] `npm run type-check` passes with 0 errors
- [ ] `npm run lint` passes
- [ ] All tests pass
- [ ] No runtime type errors in dev mode

## Next Steps

- Add strict mode to CONTRIBUTING.md
- Consider adding pre-commit type check
- Create type safety guidelines

