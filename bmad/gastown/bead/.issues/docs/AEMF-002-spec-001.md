---
id: AEMF-002-spec-001
workflow_id: AEMF-002
type: specification
agent: docs
status: completed
priority: critical
depends_on: []
blocks: [AEMF-002-impl-001]
---

# TypeScript Strict Mode Migration

## Overview

Enable full TypeScript strict mode across the AEMFlow codebase to eliminate type safety vulnerabilities, improve code quality, and catch errors at compile time rather than runtime.

## Context

AEMFlow currently uses TypeScript without strict mode enabled. This leads to:
- Potential null/undefined runtime errors
- Missing type checking on returns
- Silent fallthrough in switch statements
- Incomplete type coverage

Enabling strict mode will:
- Force explicit type annotations where needed
- Enable strict null checks
- Ensure all code paths return a value
- Catch switch fallthroughs
- Improve IDE autocomplete and refactoring

## Functional Specification

### 1. tsconfig.json Configuration

**Current (needs update):**
```json
{
  "compilerOptions": {
    "strict": false,
    // ...
  }
}
```

**Target:**
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
    "noPropertyAccessFromIndexSignature": true,
    // ...
  }
}
```

### 2. Migration Strategy

**Phase 1: Enable & Inventory**
- Enable strict mode in tsconfig.json
- Run `npm run type-check` to get full error list
- Categorize errors by module/severity

**Phase 2: Fix Critical Errors**
- Fix null/undefined reference errors
- Fix missing return type errors
- Fix strict property initialization

**Phase 3: Fix Remaining Errors**
- Fix noUncheckedIndexedAccess issues
- Fix strict function types
- Fix property access restrictions

**Phase 4: Verify & Document**
- All strict checks pass
- Update tsconfig reference in docs
- Add strict mode notes to CONTRIBUTING.md

### 3. Key Files to Update

**Primary targets:**
- `src/types/` - Type definitions
- `src/store/` - Zustand store
- `src/utils/` - Utility functions
- `src/components/` - React components

### 4. Common Fixes Pattern

**Adding null checks:**
```typescript
// Before
function getNode(id: string) {
  return nodes.find(n => n.id === id);
}

// After  
function getNode(id: string): Node | undefined {
  return nodes.find(n => n.id === id);
}
```

**Adding return types:**
```typescript
// Before
function handleError(error) {
  if (error) {
    log(error);
    return;
  }
}

// After
function handleError(error: Error): void {
  if (error) {
    log(error);
    return;
  }
}
```

**Non-null assertions (use sparingly):**
```typescript
// Only when absolutely certain value exists
const node = nodes.find(n => n.id === id)!;
```

## Non-Functional Requirements

- **Build Time**: Type checking should complete in < 30 seconds
- **Error Reduction**: Reduce runtime type errors by 100%
- **Developer Experience**: No regressions in IDE performance
- **Documentation**: Clear guidelines for strict mode compliance

## Acceptance Criteria

1. [ ] `strict: true` enabled in tsconfig.json
2. [ ] All 7 strict flags enabled
3. [ ] Zero TypeScript errors in CI pipeline
4. [ ] Zero ESLint strict-type errors
5. [ ] CONTRIBUTING.md updated with strict mode guidelines
6. [ ] All team members aware of strict mode requirements

## Progress Log

