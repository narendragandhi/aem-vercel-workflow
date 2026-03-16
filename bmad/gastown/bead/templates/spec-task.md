# Specification Task

## Task
Create a detailed specification document for this feature.

## Input
- Feature request or problem statement
- Context from the Mayor
- Existing documentation

## Output
A SPEC.md document in `bmad/gastown/bead/.issues/docs/` following the template:

```markdown
---
id: {ISSUE_ID}
workflow_id: {WORKFLOW_ID}
type: specification
agent: docs
status: in_progress
priority: {priority}
depends_on: []
blocks: [{IMPLEMENTATION_ISSUE_ID}, {TEST_ISSUE_ID}]
---

# Feature Title

## Overview
...

## Context
...

## Functional Specification
...

## Non-Functional Requirements
...

## Acceptance Criteria
...

## Technical Design
...
```

## Steps
1. Read and understand the feature request
2. Research existing code and patterns
3. Gather requirements
4. Write the specification
5. Ensure all acceptance criteria are testable

## Quality Criteria
- Complete - all sections filled
- Accurate - technically correct
- Testable - acceptance criteria are verifiable
- Feasible - can be implemented

## Completion
When done, update the issue status to `completed` and move to next phase.
