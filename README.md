# AEM Vercel Workflow Builder

A visual workflow builder for Adobe Experience Manager (AEM) that integrates with Vercel deployment pipelines. Built with React, TypeScript, and ReactFlow, and managed as a standard AEM multi-module Maven project.

## Build and Deployment

This project is a standard AEM multi-module Maven project. To build and deploy the entire project to a local AEM SDK, run the following command from the root of the project:

```bash
mvn clean install -PautoInstallPackage
```

### Prerequisites

- A local AEM SDK author instance running on `http://localhost:4502`.
- The AEM SDK credentials should be the default `admin`/`admin`.

The `autoInstallPackage` profile will deploy the project to the AEM author instance.

## Features

- 🎨 **Visual Workflow Design** - Drag-and-drop interface using ReactFlow
- 🔗 **AEM Integration** - Native integration with AEM workflow APIs
- 📊 **Real-time Visualization** - Minimap and controls for complex workflows
- 🎯 **Custom Node Types** - Specialized nodes for AEM steps, processes, and workflow controls
- 💾 **State Management** - Zustand-based store for workflow data
- 🔒 **Type Safety** - Full TypeScript support
- 📱 **Responsive Design** - Works across devices

## Architecture

This project is a multi-module Maven project with the following structure:

- `core`: Java bundle containing all core functionality like OSGi services, listeners, and servlets.
- `ui.apps`: contains the /apps parts of the project, ie JS&CSS clientlibs, components, and templates.
- `ui.content`: contains sample content using the components from the ui.apps module.
- `ui.frontend`: a standalone frontend module that contains the React application for the workflow builder.
- `all`: a single content package that embeds all of the compiled modules (bundles and content packages) into a single package.

### Core Components (Frontend)

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
