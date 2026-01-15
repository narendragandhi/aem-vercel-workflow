# AEM Vercel Workflow Builder

A visual workflow builder for Adobe Experience Manager (AEM) that integrates with Vercel deployment pipelines. Built with React, TypeScript, and ReactFlow.

## Features

- 🎨 **Visual Workflow Design** - Drag-and-drop interface using ReactFlow
- 🔗 **AEM Integration** - Native integration with AEM workflow APIs
- 📊 **Real-time Visualization** - Minimap and controls for complex workflows
- 🎯 **Custom Node Types** - Specialized nodes for AEM steps, processes, and workflow controls
- 💾 **State Management** - Zustand-based store for workflow data
- 🔒 **Type Safety** - Full TypeScript support
- 📱 **Responsive Design** - Works across devices

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Architecture

### Core Components

- **`WorkflowBuilder.tsx`** - Main workflow canvas with ReactFlow integration
- **`workflowService.ts`** - API service for AEM workflow operations
- **`useWorkflowStore.ts`** - Zustand store for state management

### Node Types

#### AEMStepNode
Represents AEM workflow steps with participant assignments:
- User/Participant assignment
- Step type indicators (participant/process/external)
- Configuration options

#### ProcessStepNode
Automated or manual process steps:
- Process type (automated/manual/script)
- Configuration parameters
- Execution metadata

#### StartEndNode
Workflow start and end points:
- Visual distinction (green start, red end)
- Connection points for workflow flow
- Descriptive labels

## Usage Examples

### Basic Workflow Builder

```tsx
import React from 'react';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';
import { WorkflowDefinition } from '@/types/workflow';

const MyWorkflowApp = () => {
  const handleSave = (workflow: WorkflowDefinition) => {
    console.log('Saving workflow:', workflow);
    // Save to your backend
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <WorkflowBuilder onSave={handleSave} />
    </div>
  );
};
```

### Loading Existing Workflow

```tsx
import React, { useEffect, useState } from 'react';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';
import { workflowService } from '@/services/workflowService';

const WorkflowEditor = ({ workflowId }: { workflowId: string }) => {
  const [workflow, setWorkflow] = useState(null);

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const data = await workflowService.getWorkflow(workflowId);
        setWorkflow(data);
      } catch (error) {
        console.error('Failed to load workflow:', error);
      }
    };

    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId]);

  const handleSave = async (updatedWorkflow: WorkflowDefinition) => {
    try {
      const saved = await workflowService.saveWorkflow(updatedWorkflow);
      setWorkflow(saved);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  if (!workflow && workflowId) {
    return <div>Loading...</div>;
  }

  return (
    <WorkflowBuilder 
      workflow={workflow} 
      onSave={handleSave}
    />
  );
};
```

### Read-only Workflow Viewer

```tsx
import React from 'react';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';

const WorkflowViewer = ({ workflow }: { workflow: WorkflowDefinition }) => {
  return (
    <WorkflowBuilder 
      workflow={workflow} 
      readOnly={true}
    />
  );
};
```

## API Reference

### WorkflowService

The service provides methods for interacting with AEM workflows:

```typescript
// Get all workflows
const workflows = await workflowService.getWorkflows();

// Get specific workflow
const workflow = await workflowService.getWorkflow('workflow-id');

// Save workflow (create or update)
const saved = await workflowService.saveWorkflow(workflowDefinition);

// Delete workflow
await workflowService.deleteWorkflow('workflow-id');

// Execute workflow
const execution = await workflowService.executeWorkflow('workflow-id', variables);

// Get execution history
const executions = await workflowService.getExecutions('workflow-id');
```

### WorkflowDefinition Interface

```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
  variables?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### WorkflowStep Interface

```typescript
interface WorkflowStep {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    config?: Record<string, any>;
    inputs?: WorkflowPort[];
    outputs?: WorkflowPort[];
  };
}
```

## State Management

The application uses Zustand for state management. The workflow store provides:

```typescript
interface WorkflowStore {
  // State
  currentWorkflow: WorkflowDefinition | null;
  workflows: WorkflowDefinition[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentWorkflow: (workflow: WorkflowDefinition | null) => void;
  updateWorkflow: (workflow: WorkflowDefinition) => void;
  addWorkflow: (workflow: WorkflowDefinition) => void;
  removeWorkflow: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
```

## Styling

The components use Tailwind CSS classes. You can customize the appearance by modifying the class names in the component files.

### Node Styling

- **AEM Step**: Blue border, user icon
- **Process Step**: Orange border, cog icon  
- **Start Node**: Green circle, play icon
- **End Node**: Red circle, check icon

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:coverage
```

## Development Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type checking
npm run type-check
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root:

```env
REACT_APP_AEM_URL=http://localhost:4502
REACT_APP_API_BASE_URL=/api
```

### AEM Configuration

Ensure your AEM instance has the workflow API endpoints configured:

- `/api/workflow/definitions.json` - List workflows
- `/api/workflow/definitions/{id}.json` - Get specific workflow
- `/api/workflow/definitions` - Create/update workflow
- `/api/workflow/definitions/{id}` - Delete workflow
- `/api/workflow/execute` - Execute workflow
- `/api/workflow/executions.json` - List executions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.