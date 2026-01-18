import { WorkflowDefinition } from '@/types/workflow';

// Demo workflows for immediate testing
export const DEMO_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'demo-1',
    name: 'Content Approval Workflow',
    description: 'Simple content approval process with review and publishing',
    steps: [
      {
        id: 'start',
        type: 'startEnd',
        position: { x: 250, y: 25 },
        data: { label: 'Start', isStart: true }
      },
      {
        id: 'review',
        type: 'aemStep',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Content Review',
          description: 'Review content for quality and compliance'
        }
      },
      {
        id: 'approve',
        type: 'processStep',
        position: { x: 250, y: 300 },
        data: { 
          label: 'Approval Decision',
          description: 'Approve or reject content'
        }
      },
      {
        id: 'end',
        type: 'startEnd',
        position: { x: 250, y: 500 },
        data: { label: 'End', isStart: false }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'start',
        target: 'review'
      },
      {
        id: 'edge-2', 
        source: 'review',
        target: 'approve'
      },
      {
        id: 'edge-3',
        source: 'approve',
        target: 'end'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'demo-user'
  },
  {
    id: 'demo-2',
    name: 'Asset Processing Pipeline',
    description: 'Automated asset processing with quality checks',
    steps: [
      {
        id: 'start',
        type: 'startEnd',
        position: { x: 100, y: 25 },
        data: { label: 'Start', isStart: true }
      },
      {
        id: 'upload',
        type: 'aemStep',
        position: { x: 100, y: 150 },
        data: { 
          label: 'Asset Upload',
          description: 'Upload assets to DAM'
        }
      },
      {
        id: 'resize',
        type: 'processStep',
        position: { x: 300, y: 150 },
        data: { 
          label: 'Image Processing',
          description: 'Resize and optimize images'
        }
      },
      {
        id: 'quality',
        type: 'processStep',
        position: { x: 300, y: 300 },
        data: { 
          label: 'Quality Check',
          description: 'Validate asset quality'
        }
      },
      {
        id: 'publish',
        type: 'aemStep',
        position: { x: 100, y: 450 },
        data: { 
          label: 'Publish Assets',
          description: 'Publish to CDN'
        }
      },
      {
        id: 'end',
        type: 'startEnd',
        position: { x: 200, y: 500 },
        data: { label: 'End', isStart: false }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'start',
        target: 'upload'
      },
      {
        id: 'edge-2',
        source: 'upload', 
        target: 'resize'
      },
      {
        id: 'edge-3',
        source: 'resize',
        target: 'quality'
      },
      {
        id: 'edge-4',
        source: 'quality',
        target: 'publish'
      },
      {
        id: 'edge-5',
        source: 'publish',
        target: 'end'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'demo-user'
  }
];