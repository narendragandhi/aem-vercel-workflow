# AEM Vercel Workflow Project Documentation

**Project:** AEM Vercel Workflow Builder  
**Version:** 1.0.0-SNAPSHOT  
**Created:** January 15, 2026  
**Status:** In Development  

## Project Overview

This is a visual workflow builder for Adobe Experience Manager (AEM) using Vercel Workflow and React Flow. The project enables users to create, manage, and execute complex content workflows through a drag-and-drop interface.

## Architecture

### Maven Multi-Module Structure

```
aem-vercel-workflow/
├── pom.xml                 # Parent POM with dependency management
├── core/                   # Backend Java components (OSGi bundle)
├── ui.apps/               # AEM application package
├── ui.content/            # AEM content package
├── ui.frontend/           # React/TypeScript frontend application
├── dispatcher/            # Apache dispatcher configuration
├── it.tests/              # Integration tests
└── all/                   # Combined package
```

### Technology Stack

**Backend (AEM/Java):**
- AEM SDK API (2023.12.13363.20231213T120324Z-231200)
- OSGi Framework (R7)
- Apache Sling Models
- Jackson JSON Processing (2.15.2)
- Lombok (1.18.30)
- JUnit 4 + Mockito for testing

**Frontend (React/TypeScript):**
- React 18.2.0 with TypeScript 5.2.2
- React Flow (11.11.4) for visual workflow editing
- Zustand (4.4.7) for state management
- Vite (4.5.0) for build tooling
- Jest + React Testing Library for testing

## Current Implementation Status

### ✅ Completed Components

#### 1. Project Foundation
- **Maven Structure**: Standard AEM multi-module setup with proper dependency management
- **Frontend Build**: Vite-based React/TypeScript application with hot reload
- **Testing Framework**: Jest configuration with React Testing Library
- **Code Quality**: ESLint + TypeScript for linting and type checking

#### 2. Frontend Core Components

**WorkflowBuilder.tsx** (`ui.frontend/src/components/`)
- Main canvas component using React Flow
- Visual drag-and-drop workflow editing
- Custom node types: AEM steps, Process steps, Start/End nodes
- Real-time workflow saving
- Read-only mode support
- Minimap, controls, and grid background

**Custom Node Components** (`ui.frontend/src/components/nodes/`)
- `StartEndNode.tsx`: Workflow start and end points
- `AEMStepNode.tsx`: AEM-specific workflow steps
- `ProcessStepNode.tsx`: Generic process steps
- Each node supports drag-and-drop and customization

#### 3. State Management

**useWorkflowStore.ts** (`ui.frontend/src/hooks/`)
- Zustand-based global state management
- Workflow CRUD operations
- Loading states and error handling
- Current workflow tracking

#### 4. Data Models & Types

**workflow.ts** (`ui.frontend/src/types/`)
- `WorkflowDefinition`: Complete workflow structure
- `WorkflowStep`: Individual workflow steps with configuration
- `WorkflowEdge`: Connections between steps
- `WorkflowPort`: Data input/output definitions
- `WorkflowExecution`: Runtime execution tracking
- `WorkflowLog`: Audit trail and debugging

#### 5. Testing Infrastructure

**Test Files** (`ui.frontend/src/**/__tests__/`)
- Component unit tests
- Hook testing with proper mocking
- Test coverage configuration
- CSS mocking for React Flow components

#### 6. Backend Java Services

**Core Models** (`core/src/main/java/com/example/aem/vercel/workflow/model/`)
- `WorkflowDefinitionModel`: Sling model for workflow definitions
- `WorkflowStepModel`: Individual workflow steps with Jackson serialization
- `WorkflowEdgeModel`: Connections between workflow steps
- `WorkflowPortModel`: Input/output port definitions
- `WorkflowExecutionModel`: Runtime execution state management
- `WorkflowLogEntryModel`: Execution logging and audit trail

**Service Interfaces** (`core/src/main/java/com/example/aem/vercel/workflow/service/`)
- `WorkflowDefinitionService`: CRUD operations for workflows with validation
- `WorkflowExecutionService`: Runtime management and execution control
- `AEMWorkflowIntegrationService`: Bridge to native AEM workflows

**Service Implementations** (`core/src/main/java/com/example/aem/vercel/workflow/service/impl/`)
- `WorkflowDefinitionServiceImpl`: JCR-based storage with caching
- `WorkflowExecutionServiceImpl`: Multi-threaded execution engine
- **Features**: Concurrent execution, pause/resume, cancellation, variable management

**REST API Endpoints** (`core/src/main/java/com/example/aem/vercel/workflow/servlet/`)
- `WorkflowApiServlet`: `/api/workflows` - Full CRUD operations
- `WorkflowExecutionApiServlet`: `/api/workflows/executions` - Execution management
- **Features**: CORS support, error handling, JSON responses

**OSGi Configuration** (`core/src/main/java/com/example/aem/vercel/workflow/config/`)
- `WorkflowConfig`: Comprehensive configuration for all services
- **Settings**: Cache size, execution limits, storage paths, AEM integration

### 🚧 AEM Modules Status

**Other AEM Modules**
<br>- `ui.apps`, `ui.content`, `dispatcher`, `it.tests`, `all`
- **Status**: Configuration exists but content/components not yet implemented

## Key Features Implemented

### Frontend Capabilities
1. **Visual Workflow Design**: Drag-and-drop canvas with React Flow
2. **Custom Node Types**: Specialized nodes for AEM and generic process steps
3. **Real-time Collaboration**: Zustand state management for reactive UI
4. **Workflow Persistence**: Save/load workflow definitions
5. **Responsive Design**: Mobile-friendly interface
6. **Error Handling**: Comprehensive error states and user feedback

### Data Flow Architecture
1. **Workflow Definition**: JSON-based workflow structure
2. **Step Configuration**: Flexible step metadata and configuration
3. **Edge Connections**: Visual connections with data flow semantics
4. **Execution Tracking**: Runtime state and logging infrastructure

## Configuration Details

### Maven Properties
```xml
<aem.host>localhost</aem.host>
<aem.port>4502</aem.port>
<aem.publish.host>localhost</aem.publish.host>
<aem.publish.port>4503</aem.publish.port>
<sling.user>admin</sling.user>
<sling.password>admin</sling.password>
<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
<maven.compiler.source>11</maven.compiler.source>
<maven.compiler.target>11</maven.compiler.target>
```

### Build Configuration

**Maven Compiler Plugin**
The project is configured to use `maven-compiler-plugin` version `3.13.0` and `lombok` version `1.18.30` for annotation processing. This is configured in the parent `pom.xml`.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.13.0</version>
    <configuration>
        <source>${maven.compiler.source}</source>
        <target>${maven.compiler.target}</target>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.30</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "@reactflow/core": "^11.11.4",
  "zustand": "^4.4.7",
  "typescript": "^5.2.2",
  "vite": "^4.5.0"
}
```

## Development Commands

### Frontend Development
```bash
cd ui.frontend
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # ESLint check
npm run type-check   # TypeScript validation
```

### Maven Commands
```bash
mvn clean install                 # Full build
mvn clean install -PautoInstallPackage    # Install to AEM author
mvn clean install -PautoInstallPackagePublish # Install to AEM publish
```

## Known Issues & Limitations

### Frontend
- ✅ All major components implemented and tested
- ⚠️ Integration with AEM backend pending
- ⚠️ Workflow execution engine not implemented

### Backend
- ✅ All major services implemented (`WorkflowDefinitionServiceImpl`)
- ✅ Basic integration with JCR storage
- ⚠️ REST API endpoints to be implemented
- ⚠️ Basic content structure in place

## Next Steps

### Immediate Priorities
1. **Frontend-Backend Integration**: Connect React UI with Java REST APIs
2. **AEM Content Structure**: Define JCR content types and component structures
3. **Frontend API Client**: Create services to call backend endpoints
4. **Error Handling**: Implement proper error handling across full stack

### Medium Term
1. **Advanced Workflow Logic**: Implement conditional branching, loops, parallel execution
2. **User Interface**: Add property panels, validation, step configuration dialogs
3. **AEM UI Integration**: Embed workflow builder in AEM touch UI
4. **Testing**: Add integration tests and end-to-end testing
5. **Documentation**: API documentation and user guides

### Advanced Features
1. **Workflow Templates**: Pre-built templates for common use cases
2. **Versioning**: Workflow version control and rollback
3. **Permissions**: Role-based access control for workflows
4. **Monitoring**: Real-time execution monitoring and dashboard
5. **Analytics**: Workflow execution analytics and reporting

## File Structure Reference

### Frontend Key Files
```
ui.frontend/src/
├── components/
│   ├── WorkflowBuilder.tsx     # Main workflow canvas
│   └── nodes/
│       ├── StartEndNode.tsx   # Start/end workflow nodes
│       ├── AEMStepNode.tsx     # AEM-specific steps
│       └── ProcessStepNode.tsx # Generic process steps
├── hooks/
│   └── useWorkflowStore.ts     # Global state management
├── types/
│   └── workflow.ts             # TypeScript type definitions
├── services/
│   └── workflowService.ts      # API service layer
└── examples/
    └── DemoApp.tsx            # Demo application
```

### Backend Implemented Structure
```
core/src/main/java/com/example/aem/vercel/workflow/
├── model/                     # Sling models and data structures
│   ├── WorkflowDefinitionModel.java
│   ├── WorkflowStepModel.java
│   ├── WorkflowEdgeModel.java
│   ├── WorkflowPortModel.java
│   ├── WorkflowExecutionModel.java
│   └── WorkflowLogEntryModel.java
├── service/                   # Service interfaces
│   ├── WorkflowDefinitionService.java
│   ├── WorkflowExecutionService.java
│   └── AEMWorkflowIntegrationService.java
├── service/impl/              # Service implementations
│   ├── WorkflowDefinitionServiceImpl.java
│   └── WorkflowExecutionServiceImpl.java
├── servlet/                   # REST API endpoints
│   ├── WorkflowApiServlet.java
│   └── WorkflowExecutionApiServlet.java
└── config/                    # OSGi configuration
    └── WorkflowConfig.java
```

## Git Repository Status

**Current Branch**: main  
**Last Commit**: Initial project structure setup  
**Working Directory**: Clean (no uncommitted changes)

---

**Documentation Last Updated**: January 15, 2026  
**Next Review**: After backend implementation completion