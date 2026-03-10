# AEMFlow - Visual Workflow Builder for Adobe Experience Manager

## Project Overview

AEMFlow is a visual workflow builder that replaces manual XML coding with an intuitive drag-and-drop interface for creating AEM workflows. It features AI-powered workflow generation and multi-format export capabilities.

### Key Features
- Visual drag-and-drop workflow editor using ReactFlow
- AI-powered workflow generation (OpenAI, Anthropic, Google, Ollama)
- Multi-format export (AEM XML, JSON, YAML, Markdown with Mermaid diagrams)
- Real-time collaboration support
- Comprehensive validation and error handling

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- ReactFlow for visual editing
- Zustand for state management
- TailwindCSS for styling
- Vite for build tooling

**Backend (AEM):**
- Java OSGi services
- JCR for persistence
- Sling servlets for API endpoints

**Testing:**
- Jest + React Testing Library (unit tests)
- Playwright (E2E tests)

## Setup & Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run type-check` | TypeScript type checking |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |

## Project Structure

```
aemflow/
├── src/
│   ├── components/      # React components
│   │   ├── nodes/       # Custom ReactFlow nodes
│   │   └── panels/      # Side panels and dialogs
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state management
│   ├── utils/           # Utilities (exporters, validators, errors)
│   ├── types/           # TypeScript type definitions
│   └── services/        # API services
├── core/                # Java AEM backend
│   └── src/main/java/   # OSGi services and servlets
├── tests/
│   ├── components/      # Component tests
│   ├── utils/           # Utility tests
│   └── e2e/             # Playwright E2E tests
└── ui.frontend/         # Submodule for AEM clientlib integration
```

## Key Files

- `src/utils/errors.ts` - Centralized error handling with typed errors
- `src/utils/exporters.ts` - Multi-format workflow export
- `src/store/workflowStore.ts` - Zustand workflow state
- `src/components/WorkflowCanvas.tsx` - Main canvas component
- `core/.../AIActionServiceImpl.java` - AI integration backend

## Error Handling

The project uses a centralized error system (`src/utils/errors.ts`):

```typescript
// Error types
- AEMFlowError (base)
- NetworkError
- ValidationError
- WorkflowError
- AuthError

// Integration with monitoring
addErrorListener((error) => {
  Sentry.captureException(error);
});

// Integration with toast notifications
setNotificationHandler((message, options) => {
  toast.error(message);
});
```

## Testing Notes

- **Unit tests**: 82+ tests covering core utilities and components
- **Coverage threshold**: 60% (branches, functions, lines, statements)
- **Known test environment issues**: Some component tests require jsdom mocks for browser APIs

## Git Workflow

The repository uses a submodule (`ui.frontend`) for AEM clientlib integration. When committing:

```bash
# Commit changes in main repo
git add . && git commit -m "message"

# If ui.frontend has changes, commit there first
cd ui.frontend
git add . && git commit -m "message"
cd ..
git add ui.frontend && git commit -m "Update ui.frontend submodule"
```

## Recent Changes (v2.1)

- Enhanced error handling with listener and notification systems
- Implemented bulk import/export in AIActionServiceImpl
- Fixed Jest configuration for ES modules
- Added scrollIntoView mock for test environment
