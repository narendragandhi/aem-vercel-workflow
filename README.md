# AEMFlow - Visual Workflow Builder for Adobe Experience Manager

<p align="center">
  <strong>Stop writing XML. Start designing visually.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/react-18.2-61dafb" alt="React">
  <img src="https://img.shields.io/badge/typescript-5.2-3178c6" alt="TypeScript">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

## Highlights

- **15+ Enterprise Templates** - Production-ready workflow templates
- **Workflow Simulator** - Step-by-step dry-run with decision points
- **Analytics Dashboard** - Complexity metrics and health scoring
- **Command Palette** - VS Code-style quick actions (Cmd+K)
- **Multi-format Export** - JSON, YAML, Markdown, Mermaid diagrams
- **Documentation Generator** - Auto-generate workflow docs
- **Template Gallery** - Searchable, filterable template browser

---

## The Problem

Creating AEM workflows today means:
- Writing complex XML models by hand
- No visual feedback while designing
- Hours of trial-and-error debugging
- Steep learning curve for new developers
- No way to simulate before deployment

## The Solution

**AEMFlow** is a visual workflow builder that lets you:
- **Design visually** - Drag-and-drop interface
- **AI Generation** - Describe workflow in plain English
- **Simulate workflows** - Test before you deploy
- **Export to AEM** - Generates ready-to-deploy workflow XML
- **15+ templates** - Start with enterprise workflows
- **Validate & analyze** - Catch errors and optimize

---

## Quick Start

```bash
cd aemflow/ui.frontend
npm install
npm run dev
```

Open http://localhost:5173 and start building!

---

## Features

### Visual Editor
- Drag-and-drop workflow design
- Zoom, pan, and minimap navigation
- Dark/Light mode toggle
- Auto-layout for node arrangement
- Real-time validation feedback

### Node Types (13 types)

| Node | Description | Icon |
|------|-------------|------|
| **Start/End** | Workflow entry and exit points | |
| **AEM Step** | Participant assignments with timeout | |
| **Process** | Automated process steps | |
| **Branch (XOR)** | Decision points with Yes/No paths | |
| **DAM Update** | Asset processing | |
| **Email** | Send notifications | |
| **Participant Chooser** | Dynamic participant selection | |
| **Granite Routing** | Dynamic routing | |
| **Forms Process** | Adaptive form handling | |
| **DAM Metadata** | Write metadata to assets | |
| **Transcode** | Media transcoding | |
| **Call Workflow** | Invoke another workflow | |
| **Page Activation** | Publish/unpublish pages | |

### Enterprise Templates (15+)

Organized by category:

| Category | Templates |
|----------|-----------|
| **Content** | Multi-Level Approval, Scheduled Publishing, Content Expiration |
| **Assets** | Brand Portal Sync, Video Processing, Bulk Import |
| **Forms** | Loan Application, Employee Onboarding |
| **Integration** | Salesforce Sync, Analytics Tracking |
| **Marketing** | Campaign Launch, Content Personalization |
| **Governance** | GDPR Request, Content Audit |
| **Commerce** | Product Launch |

### Workflow Simulator

Test your workflows before deployment:
- Step-by-step execution
- Decision point interaction
- Variable tracking
- Execution timeline
- Speed control (Slow/Normal/Fast/Instant)

### Analytics Dashboard

Get insights into your workflow:
- **Health Score** - Overall workflow quality (0-100)
- **Complexity Metrics** - Cyclomatic complexity, nesting depth
- **Path Analysis** - Shortest/longest paths, critical path
- **Recommendations** - Actionable improvement suggestions

### Command Palette (Cmd+K)

Quick actions at your fingertips:
- All commands searchable
- Recent commands history
- Keyboard shortcut hints
- Categorized by function

### Multi-Format Export

| Format | Use Case |
|--------|----------|
| **AEM XML** | Direct deployment to AEM |
| **JSON** | Backup, transfer, version control |
| **YAML** | Human-readable configuration |
| **Markdown** | Documentation |
| **Mermaid** | Diagrams in docs/wikis |

### Documentation Generator

Auto-generate comprehensive docs:
- Overview with statistics
- Step-by-step descriptions
- Participant responsibilities
- Flow diagrams
- Export as Markdown, HTML, or print

---

## AI Workflow Generation

Describe your workflow in plain English:
- "Create a multi-level approval workflow with legal review"
- "Build a DAM asset processing pipeline with virus scanning"
- "Make an employee onboarding workflow with IT provisioning"

**AI Options:**

| Provider | Cost | Speed | Capability |
|----------|------|-------|------------|
| **Pattern Match** | Free | Instant | Common patterns |
| **Ollama (Local)** | Free | Fast | Custom workflows |
| **OpenAI GPT-4** | Paid | Fast | Any workflow |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Cmd/Ctrl + K** | Open command palette |
| **Cmd/Ctrl + S** | Save workflow |
| **Cmd/Ctrl + Z** | Undo |
| **Cmd/Ctrl + Shift + Z** | Redo |
| **Delete** | Delete selected node |
| **0** | Fit view |
| **+/-** | Zoom in/out |
| **?** | Show shortcuts |

---

## Installation

### Development
```bash
cd ui.frontend
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Tests
```bash
npm run test
npm run test:coverage
```

---

## Architecture

```
aemflow/
├── ui.frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WorkflowBuilder.tsx     # Main editor
│   │   │   ├── WorkflowSimulator.tsx   # Step-by-step simulator
│   │   │   ├── WorkflowAnalytics.tsx   # Analytics dashboard
│   │   │   ├── CommandPalette.tsx      # Quick actions
│   │   │   ├── TemplateGallery.tsx     # Template browser
│   │   │   ├── DocumentationGenerator.tsx  # Doc generator
│   │   │   └── nodes/                  # 13 custom node types
│   │   ├── data/
│   │   │   └── advancedTemplates.ts    # Enterprise templates
│   │   ├── utils/
│   │   │   └── exporters.ts            # Multi-format exporters
│   │   ├── hooks/
│   │   │   └── useWorkflowStore.ts     # State management
│   │   └── types/
│   │       └── workflow.ts             # TypeScript definitions
├── core/                              # AEM Java bundle
├── ui.apps/                           # AEM components
└── ui.content/                        # Sample content
```

---

## Component Usage

### WorkflowSimulator

```tsx
import { WorkflowSimulator } from './components';

<WorkflowSimulator
  nodes={nodes}
  edges={edges}
  onClose={() => setShowSimulator(false)}
  onHighlightNode={(nodeId) => highlightNode(nodeId)}
  onHighlightPath={(nodeIds) => highlightPath(nodeIds)}
  darkMode={darkMode}
/>
```

### WorkflowAnalytics

```tsx
import { WorkflowAnalytics } from './components';

<WorkflowAnalytics
  nodes={nodes}
  edges={edges}
  onClose={() => setShowAnalytics(false)}
  darkMode={darkMode}
/>
```

### CommandPalette

```tsx
import { CommandPalette, createDefaultCommands } from './components';

const commands = createDefaultCommands({
  onSave: handleSave,
  onUndo: handleUndo,
  onShowSimulator: () => setShowSimulator(true),
  // ... more handlers
});

<CommandPalette
  isOpen={showPalette}
  onClose={() => setShowPalette(false)}
  commands={commands}
  darkMode={darkMode}
/>
```

### Export Utilities

```tsx
import {
  exportToAEMXML,
  exportToJSON,
  exportToYAML,
  exportToMarkdown,
  generateMermaidDiagram,
  downloadFile
} from './utils';

// Export to AEM XML
const xml = exportToAEMXML(nodes, edges, {
  workflowName: 'My Workflow',
  author: 'Developer'
});
downloadFile(xml, 'workflow.xml', 'application/xml');

// Export to JSON
const json = exportToJSON(nodes, edges, { prettyPrint: true });

// Generate Mermaid diagram
const mermaid = generateMermaidDiagram(nodes, edges);
```

---

## Who Is This For?

| Role | Benefit |
|------|---------|
| **AEM Developers** | Replace hours of XML coding with visual design |
| **AEM Administrators** | Manage workflows without deep technical knowledge |
| **Business Analysts** | Prototype and validate workflow designs |
| **Solution Architects** | Quickly mock up workflow architectures |
| **QA Engineers** | Simulate workflows before testing |

---

## Comparison

| Task | Traditional XML | AEMFlow |
|------|-----------------|---------|
| Create workflow | 2-4 hours | 10-15 min |
| AI generation | N/A | Seconds |
| Simulate workflow | Deploy & test | Built-in |
| Generate docs | Manual | Automatic |
| Validate | Deploy & debug | Pre-validation |
| Analyze complexity | Manual review | Automatic |

---

## AEM Integration

1. Design your workflow visually
2. Simulate and validate
3. Click "Export to AEM XML"
4. Copy XML to your AEM project:
   ```
   /apps/my-project/workflow/models/my-workflow/.content.xml
   ```
5. Deploy and activate

---

## Tech Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **ReactFlow 11** - Visual workflow engine
- **Zustand 4** - State management
- **Vite 4** - Build tool
- **Tailwind CSS 3** - Styling
- **Lucide React** - Icons

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all checks pass:
   ```bash
   npm run type-check
   npm run lint
   npm run test
   ```
6. Submit a pull request

---

## License

MIT License - see LICENSE file for details.

---

## Related Resources

- [AEM Workflow Documentation](https://experienceleague.adobe.com/docs/experience-manager-65/administering-operations/workflows.html)
- [ReactFlow Documentation](https://reactflow.dev/)
- [Ollama - Local AI](https://ollama.ai)
- [OpenAI Platform](https://platform.openai.com)

---

<p align="center">
  <strong>Built with by the AEM Community</strong>
</p>
