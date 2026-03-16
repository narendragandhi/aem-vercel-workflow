# Implementation Task

## Task
Implement the feature according to the specification.

## Input
- SPEC.md document
- Implementation issue with requirements
- Reference to existing code patterns

## Output
Working implementation with:
- Source code in appropriate locations
- TypeScript types if needed
- Basic error handling

## Implementation Locations

```
src/
├── components/
│   ├── nodes/          # Custom ReactFlow nodes
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── store/              # Zustand stores
├── utils/              # Utility functions
├── types/              # TypeScript types
└── services/           # API services
```

## Steps
1. Read the SPEC document thoroughly
2. Check existing code for patterns
3. Implement the feature
4. Run lint and type-check
5. Write unit tests for new code

## Quality Gates
- [ ] Build passes: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Type check passes: `npm run type-check`
- [ ] Tests pass: `npm test`

## Completion
When done, update the issue with:
- Files changed
- Any issues or concerns
- Next steps for testing
