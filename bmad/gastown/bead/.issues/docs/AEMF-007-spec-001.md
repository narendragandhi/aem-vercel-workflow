---
id: AEMF-007-spec-001
workflow_id: AEMF-007
type: specification
agent: docs
status: completed
priority: critical
depends_on: [AEMF-003]
blocks: [AEMF-007-impl-001]
---

# Advanced Node Types Library

## Overview

Expand the AEMFlow node library with advanced node types that enable complex workflow patterns including conditionals, loops, parallel execution, and sub-workflows.

## Context

Current nodes are basic: Process Step, Participant, Workflow Model. Need advanced types for enterprise workflows.

## Functional Specification

### 1. Node Types

| Node | Description | Parameters |
|------|-------------|------------|
| Condition | Branch based on expression | condition expression, true branch, false branch |
| Loop | Repeat until condition | max iterations, condition, body |
| Parallel | Execute multiple branches | branches[], join type (all/any) |
| SubWorkflow | Call another workflow | workflowId, inputs, outputs |
| Delay | Wait for duration | duration, unit (ms/s/min/h) |
| ErrorHandler | Catch and handle errors | error types[], handler |

### 2. Node Configuration UI

- Expression editor with syntax highlighting
- Visual branch configuration
- Sub-workflow picker
- Duration picker

### 3. Data Flow

- Variables: input, output, context
- Scoping: node-local, workflow-global
- Types: string, number, boolean, array, object

## Acceptance Criteria

1. [ ] 6 new node types implemented
2. [ ] Each node has full configuration UI
3. [ ] Data flow works between nodes
4. [ ] Type checking for expressions
5. [ ] Tests for each node type

## Progress Log
