# AEMFlow - Visual Workflow Builder for Adobe Experience Manager

<p align="center">
  <strong>Stop writing XML. Start designing visually.</strong>
</p>

## The Problem

Creating AEM workflows today means:
- ✏️ Writing complex XML models by hand
- 🔍 No visual feedback while designing
- ⏰ Hours of trial-and-error debugging
- 📚 Steep learning curve for new developers

## The Solution

**AEMFlow** is a visual workflow builder that lets you:
- 🎨 **Design visually** - Drag-and-drop interface
- 🤖 **AI Generation** - Describe workflow in plain English
- ⚡ **Export to AEM** - Generates ready-to-deploy workflow XML
- 📦 **Pre-built templates** - Start with common workflows
- ✅ **Validate before deploy** - Catch errors early

## Who Is This For?

| Role | Benefit |
|------|---------|
| **AEM Developers** | Replace hours of XML coding with visual design |
| **AEM Administrators** | Manage workflows without deep technical knowledge |
| **Business Analysts** | Prototype and visualize workflows |
| **Solution Architects** | Quickly mock up workflow designs |

## Use Cases

- **Content Approval** - Review → Approve/Reject → Publish
- **Translation** - Multi-language content workflows
- **DAM Assets** - Asset upload → Process → Approve → Publish
- **Forms** - Form submission → Review → Archive
- **Custom Workflows** - Any AEM workflow pattern

## Quick Start

```bash
cd aemflow
npm install
npm run dev
```

Then open http://localhost:5173 and click "Try Demo"

## Features

### Visual Editor
- Drag-and-drop workflow design
- Zoom, pan, and minimap navigation
- Dark/Light mode toggle
- Auto-layout for node arrangement

### Node Types (13 types)
| Node | Description |
|------|-------------|
| **Start/End** | Workflow entry and exit points |
| **AEM Step** | Participant assignments with timeout |
| **Process** | Automated process steps |
| **Branch (XOR)** | Decision points with Yes/No paths |
| **DAM Update** | Asset processing |
| **Email** | Send notifications |
| **Participant Chooser** | Dynamic participant selection |
| **Granite Routing** | Dynamic routing |
| **Forms Process** | Adaptive form handling |
| **DAM Metadata** | Write metadata to assets |
| **Transcode** | Media transcoding |
| **Call Workflow** | Invoke another workflow |
| **Page Activation** | Publish/unpublish pages |

### AI Workflow Generation
Describe your workflow in plain English:
- "Create an approval workflow for content publishing"
- "Build a DAM asset processing pipeline"
- "Make a form submission review workflow"

**AI Options:**
1. **Pattern Matching** - Free, works offline for common workflows
2. **OpenAI GPT-4** - Custom workflows with API key
3. **Ollama (Local)** - Run AI locally with llama2/codellama

### Workflow Management
- **Save** - Store workflows in browser local storage
- **Auto-save** - Automatically saves every 2 seconds
- **Load** - Restore previously saved workflows
- **Export** - Generate AEM workflow model XML
- **Import** - Load existing AEM XML workflows
- **Templates** - 5 pre-built workflow patterns

### Editing Features
- **Undo/Redo** - 50-step history (Ctrl+Z / Ctrl+Y)
- **Validation** - Check workflow before export
- **Stats** - View node counts, complexity metrics

### Collaboration
- **Share** - Export XML and share with team
- **Version** - Full undo/redo history

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+S | Save Workflow |

## AI Configuration

### Option 1: Pattern Matching (Default)
Free, works offline. Supports common patterns:
- Approval workflows
- DAM asset processing
- Form submissions
- Translation workflows
- Publishing flows

### Option 2: OpenAI GPT-4
1. Get API key from https://platform.openai.com/api-keys
2. Click "AI Generate" button
3. Enter your API key
4. Describe any custom workflow

### Option 3: Ollama (Local AI)
1. Install Ollama: https://ollama.ai
2. Run: `ollama serve` and `ollama pull llama2`
3. In AEMFlow, select "Ollama" provider
4. Describe your workflow

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve

# Pull a model
ollama pull llama2
```

## Architecture

```
aemflow/
├── core/              # AEM Java bundle (OSGi services)
├── ui.apps/           # AEM components
├── ui.content/        # Sample content
└── ui.frontend/      # React application
    └── src/
        ├── components/
        │   ├── WorkflowBuilder.tsx   # Main editor
        │   └── nodes/               # 13 custom node types
        ├── hooks/                   # State management
        └── types/                   # TypeScript definitions
```

## Comparison

| Task | Traditional XML | AEMFlow |
|------|-----------------|---------|
| Create workflow | 2-4 hours | 10-15 min |
| AI generation | N/A | Seconds |
| Edit existing | Edit XML manually | Visual edit |
| Validate | Deploy & test | Pre-validation |
| Share design | XML files | Export XML |

## Installation

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## AEM Integration

Export your workflow as XML and deploy to AEM:

1. Design your workflow visually
2. Click "Validate & Export"
3. Copy the XML to your AEM project at:
   `/apps/my-project/workflow/models/`
4. Activate the workflow model in AEM

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **ReactFlow** - Visual workflow engine
- **Zustand** - State management
- **Vite** - Build tool
- **Lucide** - Icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm run type-check`, `npm run lint`)
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related

- [AEM Workflow Documentation](https://experienceleague.adobe.com/docs/experience-manager-65/administering-operations/workflows.html)
- [ReactFlow Documentation](https://reactflow.dev/)
- [Ollama](https://ollama.ai) - Local AI models
- [OpenAI](https://openai.com) - Cloud AI models
