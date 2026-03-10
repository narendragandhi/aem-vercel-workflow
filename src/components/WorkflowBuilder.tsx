import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
} from '@reactflow/core';
import { Background, BackgroundVariant } from '@reactflow/background';
import { Controls } from '@reactflow/controls';
import { MiniMap } from '@reactflow/minimap';
import {
  Save, Download, Upload, Trash2, User, Cog,
  Plus, GitBranch, X, Library, Mail, Image, UserCheck,
  FileText, Globe, Route, ArrowRightCircle, Moon, Sun,
  Undo2, Redo2, Layout, BarChart3, AlertTriangle, CheckCircle,
  Clock, Settings, Zap, RotateCcw, FileUp, Sparkles, Send, Loader2,
  Play, Command, BookOpen, Grid3X3
} from 'lucide-react';
import { WorkflowSimulator } from './WorkflowSimulator';
import { WorkflowAnalytics } from './WorkflowAnalytics';
import { CommandPalette, createDefaultCommands } from './CommandPalette';
import { TemplateGallery } from './TemplateGallery';
import { DocumentationGenerator } from './DocumentationGenerator';
import { ADVANCED_TEMPLATES } from '../data/advancedTemplates';
import { exportToAEMXML, exportToJSON, exportToYAML, exportToMarkdown, generateMermaidDiagram, downloadFile } from '../utils/exporters';
import { WorkflowDefinition, WorkflowStep, WorkflowEdge } from '../types/workflow';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { AEMStepNode } from './nodes/AEMStepNode';
import { ProcessStepNode } from './nodes/ProcessStepNode';
import { StartEndNode } from './nodes/StartEndNode';
import { BranchNode } from './nodes/BranchNode';
import { DAMUpdateAssetNode } from './nodes/DAMUpdateAssetNode';
import { EmailNotificationNode } from './nodes/EmailNotificationNode';
import { ParticipantChooserNode } from './nodes/ParticipantChooserNode';
import { GraniteRoutingNode } from './nodes/GraniteRoutingNode';
import { FormsProcessStepNode } from './nodes/FormsProcessStepNode';
import { DAMMetadataWriteNode } from './nodes/DAMMetadataWriteNode';
import { DAMTranscodeNode } from './nodes/DAMTranscodeNode';
import { CallWorkflowNode } from './nodes/CallWorkflowNode';
import { PageActivationNode } from './nodes/PageActivationNode';

const nodeTypes: NodeTypes = {
  aemStep: AEMStepNode,
  processStep: ProcessStepNode,
  startEnd: StartEndNode,
  branch: BranchNode,
  damUpdate: DAMUpdateAssetNode,
  emailNotification: EmailNotificationNode,
  participantChooser: ParticipantChooserNode,
  graniteRouting: GraniteRoutingNode,
  formsProcess: FormsProcessStepNode,
  damMetadata: DAMMetadataWriteNode,
  damTranscode: DAMTranscodeNode,
  callWorkflow: CallWorkflowNode,
  pageActivation: PageActivationNode,
};

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

const TEMPLATES = [
  {
    id: 'simple-approval',
    name: 'Simple Approval',
    description: 'Basic content approval flow',
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true }, draggable: false },
      { id: 'review', type: 'aemStep', position: { x: 300, y: 150 }, data: { label: 'Review', description: 'Review content', participant: 'reviewer' }, draggable: false },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 280 }, data: { label: 'End', isStart: false }, draggable: false },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'review', animated: true },
      { id: 'e2', source: 'review', target: 'end', animated: true },
    ],
  },
  {
    id: 'publish-approval',
    name: 'Publish Approval',
    description: 'Review, approve, and publish',
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true }, draggable: false },
      { id: 'review', type: 'aemStep', position: { x: 150, y: 150 }, data: { label: 'Content Review', description: 'Review content', participant: 'reviewer' }, draggable: false },
      { id: 'approve', type: 'branch', position: { x: 300, y: 150 }, data: { label: 'Approved?', branchType: 'xor' }, draggable: false },
      { id: 'publish', type: 'processStep', position: { x: 450, y: 250 }, data: { label: 'Publish', description: 'Publish content', processType: 'automated' }, draggable: false },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 350 }, data: { label: 'End', isStart: false }, draggable: false },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'approve', animated: true },
      { id: 'e2', source: 'approve', target: 'review', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e3', source: 'approve', target: 'publish', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e4', source: 'publish', target: 'end', animated: true },
      { id: 'e5', source: 'review', target: 'approve', animated: true },
    ],
  },
  {
    id: 'dam-asset-approval',
    name: 'DAM Asset Approval',
    description: 'Process and approve digital assets',
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true }, draggable: false },
      { id: 'upload', type: 'damUpdate', position: { x: 300, y: 150 }, data: { label: 'Upload Asset', description: 'Process uploaded asset' }, draggable: false },
      { id: 'review', type: 'aemStep', position: { x: 300, y: 260 }, data: { label: 'Asset Review', description: 'Review asset quality', participant: 'dam-reviewer' }, draggable: false },
      { id: 'approve', type: 'branch', position: { x: 300, y: 370 }, data: { label: 'Approved?', branchType: 'xor' }, draggable: false },
      { id: 'metadata', type: 'damMetadata', position: { x: 450, y: 480 }, data: { label: 'Write Metadata', description: 'Add metadata fields', xmpWrite: true }, draggable: false },
      { id: 'publish', type: 'pageActivation', position: { x: 150, y: 480 }, data: { label: 'Publish Asset', description: 'Publish to delivery' }, draggable: false },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 580 }, data: { label: 'End', isStart: false }, draggable: false },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'upload', animated: true },
      { id: 'e2', source: 'upload', target: 'review', animated: true },
      { id: 'e3', source: 'review', target: 'approve', animated: true },
      { id: 'e4', source: 'approve', target: 'metadata', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e5', source: 'approve', target: 'publish', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e6', source: 'metadata', target: 'end', animated: true },
      { id: 'e7', source: 'publish', target: 'end', animated: true },
    ],
  },
  {
    id: 'form-submission',
    name: 'Adaptive Form Workflow',
    description: 'Process form submissions with approval',
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true }, draggable: false },
      { id: 'submit', type: 'formsProcess', position: { x: 300, y: 150 }, data: { label: 'Form Submission', description: 'Handle form submit', submitAction: 'submit' }, draggable: false },
      { id: 'review', type: 'aemStep', position: { x: 300, y: 260 }, data: { label: 'Review Submission', description: 'Review form data', participant: 'form-reviewer' }, draggable: false },
      { id: 'approve', type: 'branch', position: { x: 300, y: 370 }, data: { label: 'Valid?', branchType: 'xor' }, draggable: false },
      { id: 'notify', type: 'emailNotification', position: { x: 450, y: 480 }, data: { label: 'Send Confirmation', description: 'Send email to user' }, draggable: false },
      { id: 'reject', type: 'emailNotification', position: { x: 150, y: 480 }, data: { label: 'Send Rejection', description: 'Notify applicant' }, draggable: false },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 580 }, data: { label: 'End', isStart: false }, draggable: false },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'submit', animated: true },
      { id: 'e2', source: 'submit', target: 'review', animated: true },
      { id: 'e3', source: 'review', target: 'approve', animated: true },
      { id: 'e4', source: 'approve', target: 'notify', sourceHandle: 'true', animated: true, label: 'Yes' },
      { id: 'e5', source: 'approve', target: 'reject', sourceHandle: 'false', animated: true, label: 'No' },
      { id: 'e6', source: 'notify', target: 'end', animated: true },
      { id: 'e7', source: 'reject', target: 'end', animated: true },
    ],
  },
  {
    id: 'translation',
    name: 'Translation Workflow',
    description: 'Multi-language content translation',
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true }, draggable: false },
      { id: 'translate-en', type: 'processStep', position: { x: 150, y: 150 }, data: { label: 'English Translation', description: 'Translate to EN' }, draggable: false },
      { id: 'translate-fr', type: 'processStep', position: { x: 300, y: 150 }, data: { label: 'French Translation', description: 'Translate to FR' }, draggable: false },
      { id: 'translate-de', type: 'processStep', position: { x: 450, y: 150 }, data: { label: 'German Translation', description: 'Translate to DE' }, draggable: false },
      { id: 'review', type: 'aemStep', position: { x: 300, y: 260 }, data: { label: 'Translation Review', description: 'Review all translations', participant: 'translator' }, draggable: false },
      { id: 'publish', type: 'pageActivation', position: { x: 300, y: 370 }, data: { label: 'Publish All', description: 'Publish localized content' }, draggable: false },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 480 }, data: { label: 'End', isStart: false }, draggable: false },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'translate-en', animated: true },
      { id: 'e2', source: 'start', target: 'translate-fr', animated: true },
      { id: 'e3', source: 'start', target: 'translate-de', animated: true },
      { id: 'e4', source: 'translate-en', target: 'review', animated: true },
      { id: 'e5', source: 'translate-fr', target: 'review', animated: true },
      { id: 'e6', source: 'translate-de', target: 'review', animated: true },
      { id: 'e7', source: 'review', target: 'publish', animated: true },
      { id: 'e8', source: 'publish', target: 'end', animated: true },
    ],
  },
];

interface WorkflowBuilderProps {
  workflow?: WorkflowDefinition;
  onSave?: (workflow: WorkflowDefinition) => void;
  readOnly?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const validateWorkflow = (nodes: Node[], edges: Edge[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const startNodes = nodes.filter(n => n.type === 'startEnd' && n.data?.isStart);
  const endNodes = nodes.filter(n => n.type === 'startEnd' && !n.data?.isStart);

  if (startNodes.length === 0) {
    errors.push('Workflow must have a Start node');
  } else if (startNodes.length > 1) {
    warnings.push('Workflow has multiple Start nodes');
  }

  if (endNodes.length === 0) {
    errors.push('Workflow must have an End node');
  }

  if (nodes.length <= 2) {
    warnings.push('Workflow has very few nodes');
  }

  const orphanedNodes = nodes.filter(node => {
    if (node.type === 'startEnd') return false;
    const hasIncoming = edges.some(e => e.target === node.id);
    const hasOutgoing = edges.some(e => e.source === node.id);
    return !hasIncoming || !hasOutgoing;
  });

  if (orphanedNodes.length > 0) {
    warnings.push(`${orphanedNodes.length} node(s) are not connected`);
  }

  const participantNodes = nodes.filter(n => 
    n.type === 'aemStep' || n.type === 'participantChooser' || n.type === 'graniteRouting'
  );
  
  participantNodes.forEach(node => {
    if (!node.data?.participant && !node.data?.assignTo) {
      warnings.push(`"${node.data?.label}" has no participant assigned`);
    }
  });

  const branchNodes = nodes.filter(n => n.type === 'branch');
  branchNodes.forEach(node => {
    const outgoing = edges.filter(e => e.source === node.id);
    if (outgoing.length < 2) {
      errors.push(`"${node.data?.label}" (Branch) needs at least 2 outgoing paths`);
    }
  });

  const cycles = detectCycles(nodes, edges);
  if (cycles.length > 0) {
    warnings.push(`Potential infinite loop detected in workflow`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

const detectCycles = (nodes: Node[], edges: Edge[]): string[][] => {
  const adj: Record<string, string[]> = {};
  nodes.forEach(n => adj[n.id] = []);
  edges.forEach(e => {
    if (adj[e.source]) adj[e.source].push(e.target);
  });

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();

  const dfs = (nodeId: string, path: string[]): void => {
    visited.add(nodeId);
    recStack.add(nodeId);
    path.push(nodeId);

    for (const neighbor of adj[nodeId] || []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path]);
      } else if (recStack.has(neighbor)) {
        cycles.push([...path, neighbor]);
      }
    }

    recStack.delete(nodeId);
  };

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      dfs(n.id, []);
    }
  });

  return cycles;
};

const generateAEMXML = (nodes: Node[], edges: Edge[]): string => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<workflow-model id="custom-workflow" title="Custom Workflow" version="1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:cq="http://www.day.com/cq/1.0"
    xmlns:sling="http://sling.apache.org/ontology/sling"
    jcr:primaryType="cq:WorkflowModel"
    sling:resourceType="cq/workflow/components/model">

  <metaData jcr:primaryType="nt:unstructured">
    <master jcr:primaryType="String">workflow-model</master>
  </metaData>

  <steps jcr:primaryType="cq:WorkflowStepConfig">
`;

  nodes.forEach(node => {
    if (node.type === 'startEnd') return;
    
    xml += `    <step id="${node.id.replace(/[^a-zA-Z0-9-_]/g, '_')}"\n`;
    xml += `          title="${node.data?.label || node.id}"\n`;
    xml += `          jcr:description="${(node.data?.description || '').replace(/"/g, '&quot;')}"\n`;
    
    if (node.type === 'aemStep') {
      xml += `          type="participant"\n`;
      xml += `          assignee="${node.data?.participant || 'administrators'}"\n`;
      if (node.data?.timeout) {
        xml += `          timeout="${node.data.timeout}"\n`;
      }
    } else if (node.type === 'processStep') {
      xml += `          type="process"\n`;
      xml += `          process="${node.data?.processHandler || 'com.adobe.granite.workflow.process.DynamicProcess'}"\n`;
      if (node.data?.autoAdvance !== false) {
        xml += `          handler="advance"\n`;
      }
    } else if (node.type === 'branch') {
      xml += `          type="route"\n`;
      xml += `          jcr:primaryType="cq:WorkflowRoute"\n`;
    } else if (node.type === 'damUpdate') {
      xml += `          type="process"\n`;
      xml += `          process="com.adobe.granite.workflow.process.DAMUpdateAssetProcess"\n`;
      xml += `          handler="advance"\n`;
    } else if (node.type === 'emailNotification') {
      xml += `          type="process"\n`;
      xml += `          process="com.day.cq.workflow.email.EmailNotificationService"\n`;
      xml += `          handler="advance"\n`;
    } else if (node.type === 'participantChooser') {
      xml += `          type="participant"\n`;
      xml += `          handler="com.adobe.granite.workflow.process.ParticipantChooser"\n`;
    } else if (node.type === 'graniteRouting') {
      xml += `          type="participant"\n`;
      xml += `          assignee="${node.data?.assignTo || 'administrators'}"\n`;
    } else if (node.type === 'formsProcess') {
      xml += `          type="process"\n`;
      xml += `          process="com.adobe.forms.foundation.workflow.FPProcessStep"\n`;
    } else if (node.type === 'damMetadata') {
      xml += `          type="process"\n`;
      xml += `          process="com.adobe.granite.workflow.process.DAMMetadataWriteProcess"\n`;
      xml += `          handler="advance"\n`;
    } else if (node.type === 'damTranscode') {
      xml += `          type="process"\n`;
      xml += `          process="com.adobe.granite.workflow.process.DAMTranscodeProcess"\n`;
      xml += `          handler="advance"\n`;
    } else if (node.type === 'callWorkflow') {
      xml += `          type="process"\n`;
      xml += `          process="com.adobe.granite.workflow.process.CallWorkflowProcess"\n`;
    } else if (node.type === 'pageActivation') {
      xml += `          type="process"\n`;
      xml += `          process="com.day.cq.replication.ProcessRunner"\n`;
      xml += `          handler="advance"\n`;
    }
    
    xml += `          jcr:primaryType="cq:WorkflowStepConfig"/>\n`;
  });
  
  xml += `  </steps>
</workflow-model>`;
  
  return xml;
};

const parseAEMXML = (xmlString: string): { nodes: Node[], edges: Edge[] } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const stepNodes = doc.querySelectorAll('step');
  let yOffset = 100;
  
  const nodeIdMap: Record<string, string> = {};
  
  stepNodes.forEach((step, index) => {
    const id = step.getAttribute('id') || `step_${index}`;
    const title = step.getAttribute('title') || id;
    const description = step.getAttribute('jcr:description') || '';
    const type = step.getAttribute('type') || 'process';
    const assignee = step.getAttribute('assignee') || '';
    
    const nodeId = `node_${Date.now()}_${index}`;
    nodeIdMap[id] = nodeId;
    
    let nodeType = 'processStep';
    if (type === 'participant') {
      nodeType = 'aemStep';
    } else if (type === 'route') {
      nodeType = 'branch';
    }
    
    nodes.push({
      id: nodeId,
      type: nodeType,
      position: { x: 300, y: yOffset },
      data: {
        label: title,
        description,
        participant: assignee,
        stepType: type,
      },
    });
    
    yOffset += 120;
  });
  
  nodes.unshift({
    id: 'start',
    type: 'startEnd',
    position: { x: 300, y: 50 },
    data: { label: 'Start', isStart: true },
  });
  
  nodes.push({
    id: 'end',
    type: 'startEnd',
    position: { x: 300, y: yOffset + 50 },
    data: { label: 'End', isStart: false },
  });
  
  if (nodes.length > 2) {
    for (let i = 1; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge_${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        animated: true,
      });
    }
    edges.push({
      id: 'edge_start',
      source: 'start',
      target: nodes[1].id,
      animated: true,
    });
    edges.push({
      id: 'edge_end',
      source: nodes[nodes.length - 2].id,
      target: 'end',
      animated: true,
    });
  }
  
  return { nodes, edges };
};

const autoLayoutNodes = (nodes: Node[], edges: Edge[]): { nodes: Node[], edges: Edge[] } => {
  if (nodes.length === 0) return { nodes, edges };
  
  const startNodes = nodes.filter(n => n.type === 'startEnd' && n.data?.isStart);
  const endNodes = nodes.filter(n => n.type === 'startEnd' && !n.data?.isStart);
  const processNodes = nodes.filter(n => n.type !== 'startEnd');
  
  const adj: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  nodes.forEach(n => {
    adj[n.id] = [];
    inDegree[n.id] = 0;
  });
  
  edges.forEach(e => {
    if (adj[e.source]) adj[e.source].push(e.target);
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });
  
  const levels: Node[][] = [];
  const visited = new Set<string>();
  
  const getLevel = (nodeId: string, level: number): number => {
    if (visited.has(nodeId)) return level;
    visited.add(nodeId);
    
    const parents = edges.filter(e => e.target === nodeId).map(e => e.source);
    if (parents.length === 0) return 0;
    
    let maxLevel = 0;
    parents.forEach(p => {
      maxLevel = Math.max(maxLevel, getLevel(p, level + 1));
    });
    
    return maxLevel;
  };
  
  processNodes.forEach(n => {
    const level = getLevel(n.id, 0);
    if (!levels[level]) levels[level] = [];
    levels[level].push(n);
  });
  
  const newNodes = nodes.map(n => ({ ...n }));
  const nodeSpacingX = 280;
  const nodeSpacingY = 150;
  const startX = 100;
  const startY = 100;
  
  newNodes.forEach(node => {
    if (node.type === 'startEnd' && node.data?.isStart) {
      node.position = { x: 300, y: startY };
    } else if (node.type === 'startEnd' && !node.data?.isStart) {
      node.position = { x: 300, y: startY + (levels.length + 1) * nodeSpacingY };
    } else {
      const level = getLevel(node.id, 0);
      const levelNodes = levels[level] || [];
      const index = levelNodes.findIndex(n => n.id === node.id);
      node.position = {
        x: startX + level * nodeSpacingX,
        y: startY + index * nodeSpacingY + level * 50,
      };
    }
  });
  
  return { nodes: newNodes, edges };
};

interface AIGeneratedWorkflow {
  nodes: Node[];
  edges: Edge[];
}

type AIProvider = 'pattern' | 'openai' | 'ollama';

const generateWorkflowFromAI = async (
  prompt: string, 
  provider: AIProvider = 'pattern',
  apiKey?: string,
  ollamaModel?: string
): Promise<AIGeneratedWorkflow> => {
  const normalizedPrompt = prompt.toLowerCase();
  
  const patterns: Array<{ regex: RegExp; generator: () => AIGeneratedWorkflow }> = [
    {
      regex: /approval|review|approve/i,
      generator: () => ({
        nodes: [
          { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
          { id: 'review', type: 'aemStep', position: { x: 300, y: 160 }, data: { label: 'Review Content', description: 'Review and approve', participant: 'reviewer' } },
          { id: 'decision', type: 'branch', position: { x: 300, y: 270 }, data: { label: 'Approved?', branchType: 'xor' } },
          { id: 'publish', type: 'processStep', position: { x: 450, y: 380 }, data: { label: 'Publish', description: 'Publish content' } },
          { id: 'notify', type: 'emailNotification', position: { x: 150, y: 380 }, data: { label: 'Notify Rejection', description: 'Send rejection email' } },
          { id: 'end', type: 'startEnd', position: { x: 300, y: 490 }, data: { label: 'End', isStart: false } },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'review', animated: true },
          { id: 'e2', source: 'review', target: 'decision', animated: true },
          { id: 'e3', source: 'decision', target: 'publish', sourceHandle: 'true', animated: true, label: 'Yes' },
          { id: 'e4', source: 'decision', target: 'notify', sourceHandle: 'false', animated: true, label: 'No' },
          { id: 'e5', source: 'publish', target: 'end', animated: true },
          { id: 'e6', source: 'notify', target: 'end', animated: true },
        ],
      }),
    },
    {
      regex: /dam|asset|image|photo|media/i,
      generator: () => ({
        nodes: [
          { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
          { id: 'upload', type: 'damUpdate', position: { x: 300, y: 160 }, data: { label: 'Upload Asset', description: 'Process uploaded asset' } },
          { id: 'metadata', type: 'damMetadata', position: { x: 300, y: 270 }, data: { label: 'Write Metadata', description: 'Add metadata', xmpWrite: true } },
          { id: 'review', type: 'aemStep', position: { x: 300, y: 380 }, data: { label: 'Asset Review', description: 'Review asset quality', participant: 'dam-reviewer' } },
          { id: 'approve', type: 'branch', position: { x: 300, y: 490 }, data: { label: 'Approved?', branchType: 'xor' } },
          { id: 'publish', type: 'pageActivation', position: { x: 450, y: 600 }, data: { label: 'Publish Asset', description: 'Publish to delivery' } },
          { id: 'end', type: 'startEnd', position: { x: 300, y: 710 }, data: { label: 'End', isStart: false } },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'upload', animated: true },
          { id: 'e2', source: 'upload', target: 'metadata', animated: true },
          { id: 'e3', source: 'metadata', target: 'review', animated: true },
          { id: 'e4', source: 'review', target: 'approve', animated: true },
          { id: 'e5', source: 'approve', target: 'publish', sourceHandle: 'true', animated: true, label: 'Yes' },
          { id: 'e6', source: 'approve', target: 'end', sourceHandle: 'false', animated: true, label: 'No' },
          { id: 'e7', source: 'publish', target: 'end', animated: true },
        ],
      }),
    },
    {
      regex: /form|submit|application/i,
      generator: () => ({
        nodes: [
          { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
          { id: 'submit', type: 'formsProcess', position: { x: 300, y: 160 }, data: { label: 'Form Submission', description: 'Handle form submit', submitAction: 'submit' } },
          { id: 'review', type: 'aemStep', position: { x: 300, y: 270 }, data: { label: 'Review Submission', description: 'Review form data', participant: 'reviewer' } },
          { id: 'decision', type: 'branch', position: { x: 300, y: 380 }, data: { label: 'Valid?', branchType: 'xor' } },
          { id: 'approve', type: 'emailNotification', position: { x: 450, y: 490 }, data: { label: 'Send Approval', description: 'Confirm approval' } },
          { id: 'reject', type: 'emailNotification', position: { x: 150, y: 490 }, data: { label: 'Send Rejection', description: 'Notify applicant' } },
          { id: 'end', type: 'startEnd', position: { x: 300, y: 600 }, data: { label: 'End', isStart: false } },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'submit', animated: true },
          { id: 'e2', source: 'submit', target: 'review', animated: true },
          { id: 'e3', source: 'review', target: 'decision', animated: true },
          { id: 'e4', source: 'decision', target: 'approve', sourceHandle: 'true', animated: true, label: 'Yes' },
          { id: 'e5', source: 'decision', target: 'reject', sourceHandle: 'false', animated: true, label: 'No' },
          { id: 'e6', source: 'approve', target: 'end', animated: true },
          { id: 'e7', source: 'reject', target: 'end', animated: true },
        ],
      }),
    },
    {
      regex: /translation|translate|local/i,
      generator: () => ({
        nodes: [
          { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
          { id: 'en', type: 'processStep', position: { x: 150, y: 160 }, data: { label: 'English', description: 'Translate to EN' } },
          { id: 'fr', type: 'processStep', position: { x: 300, y: 160 }, data: { label: 'French', description: 'Translate to FR' } },
          { id: 'de', type: 'processStep', position: { x: 450, y: 160 }, data: { label: 'German', description: 'Translate to DE' } },
          { id: 'review', type: 'aemStep', position: { x: 300, y: 280 }, data: { label: 'Review Translations', description: 'Review all', participant: 'translator' } },
          { id: 'publish', type: 'pageActivation', position: { x: 300, y: 390 }, data: { label: 'Publish All', description: 'Publish localized' } },
          { id: 'end', type: 'startEnd', position: { x: 300, y: 500 }, data: { label: 'End', isStart: false } },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'en', animated: true },
          { id: 'e2', source: 'start', target: 'fr', animated: true },
          { id: 'e3', source: 'start', target: 'de', animated: true },
          { id: 'e4', source: 'en', target: 'review', animated: true },
          { id: 'e5', source: 'fr', target: 'review', animated: true },
          { id: 'e6', source: 'de', target: 'review', animated: true },
          { id: 'e7', source: 'review', target: 'publish', animated: true },
          { id: 'e8', source: 'publish', target: 'end', animated: true },
        ],
      }),
    },
    {
      regex: /publish|activate|deploy/i,
      generator: () => ({
        nodes: [
          { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
          { id: 'review', type: 'aemStep', position: { x: 300, y: 160 }, data: { label: 'Content Review', description: 'Review before publish', participant: 'reviewer' } },
          { id: 'approve', type: 'branch', position: { x: 300, y: 270 }, data: { label: 'Ready?', branchType: 'xor' } },
          { id: 'publish', type: 'pageActivation', position: { x: 300, y: 380 }, data: { label: 'Publish', description: 'Activate page' } },
          { id: 'notify', type: 'emailNotification', position: { x: 300, y: 490 }, data: { label: 'Notify', description: 'Notify stakeholders' } },
          { id: 'end', type: 'startEnd', position: { x: 300, y: 600 }, data: { label: 'End', isStart: false } },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'review', animated: true },
          { id: 'e2', source: 'review', target: 'approve', animated: true },
          { id: 'e3', source: 'approve', target: 'publish', sourceHandle: 'true', animated: true, label: 'Yes' },
          { id: 'e4', source: 'approve', target: 'end', sourceHandle: 'false', animated: true, label: 'No' },
          { id: 'e5', source: 'publish', target: 'notify', animated: true },
          { id: 'e6', source: 'notify', target: 'end', animated: true },
        ],
      }),
    },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(normalizedPrompt)) {
      return pattern.generator();
    }
  }

  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an AEM workflow expert. Generate a workflow based on the user's description. 
Return ONLY a JSON object with this exact structure:
{
  "nodes": [{"id": "string", "type": "string", "position": {"x": number, "y": number}, "data": {"label": "string", "description": "string", "participant": "string?"}}],
  "edges": [{"id": "string", "source": "string", "target": "string", "label": "string?"}]
}
Valid node types: aemStep, processStep, branch, damUpdate, emailNotification, participantChooser, graniteRouting, formsProcess, damMetadata, damTranscode, callWorkflow, pageActivation, startEnd`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        const parsed = JSON.parse(content);
        
        return {
          nodes: parsed.nodes.map((n: any) => ({ ...n, draggable: true })),
          edges: parsed.edges.map((e: any) => ({ ...e, animated: true })),
        };
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }

  if (provider === 'ollama') {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: ollamaModel || 'llama2',
          prompt: `You are an AEM workflow expert. Generate a workflow based on the user's description. 
Return ONLY a JSON object with this exact structure (no other text):
{
  "nodes": [{"id": "string", "type": "string", "position": {"x": number, "y": number}, "data": {"label": "string", "description": "string", "participant": "string?"}}],
  "edges": [{"id": "string", "source": "string", "target": "string", "label": "string?"}]
}
Valid node types: aemStep, processStep, branch, damUpdate, emailNotification, participantChooser, graniteRouting, formsProcess, damMetadata, damTranscode, callWorkflow, pageActivation, startEnd

User request: ${prompt}`,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.response;
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            nodes: parsed.nodes.map((n: any) => ({ ...n, draggable: true })),
            edges: parsed.edges.map((e: any) => ({ ...e, animated: true })),
          };
        }
      }
    } catch (error) {
      console.error('Ollama API error:', error);
      alert('Could not connect to Ollama. Make sure it is running (ollama serve)');
    }
  }

  return {
    nodes: [
      { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true } },
      { id: 'process', type: 'processStep', position: { x: 300, y: 160 }, data: { label: 'Process', description: 'Custom process step' } },
      { id: 'end', type: 'startEnd', position: { x: 300, y: 270 }, data: { label: 'End', isStart: false } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'process', animated: true },
      { id: 'e2', source: 'process', target: 'end', animated: true },
    ],
  };
};

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  onSave,
  readOnly = false
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider>('pattern');
  const [apiKey, setApiKey] = useState('');
  const [ollamaModel, setOllamaModel] = useState('llama2');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editParticipant, setEditParticipant] = useState('');
  const [editTimeout, setEditTimeout] = useState('');
  const [editErrorHandler, setEditErrorHandler] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { saveWorkflow } = useWorkflowStore();

  // IMPORTANT: Define initialNodes/initialEdges FIRST, then use them in useNodesState/useEdgesState
  const initialNodes = useMemo(() => {
    if (workflow?.steps?.length) {
      return workflow.steps.map((step): Node => ({
        id: step.id,
        type: getNodeType(step.type),
        position: step.position,
        data: step.data,
        draggable: !readOnly,
      }));
    }
    
    return [
      {
        id: 'start',
        type: 'startEnd',
        position: { x: 300, y: 50 },
        data: { label: 'Start', isStart: true },
        draggable: !readOnly,
      },
      {
        id: 'end',
        type: 'startEnd',
        position: { x: 300, y: 400 },
        data: { label: 'End', isStart: false },
        draggable: !readOnly,
      }
    ];
  }, [workflow, readOnly]);

  const initialEdges = useMemo(() => {
    if (workflow?.edges?.length) {
      return workflow.edges.map((edge): Edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type || 'default',
        animated: true,
      }));
    }
    return [];
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Stats computation
  const stats = useMemo(() => {
    const nodeTypes = nodes.reduce((acc, node) => {
      const type = node.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find orphan nodes (no incoming or outgoing edges)
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    const orphanNodes = nodes.filter(n =>
      n.type !== 'startEnd' && !connectedNodeIds.has(n.id)
    ).length;

    // Calculate complexity
    const branchCount = nodeTypes.branch || 0;
    const totalSteps = nodes.length;
    let complexity: 'Low' | 'Medium' | 'High' = 'Low';
    if (branchCount > 3 || totalSteps > 15) complexity = 'High';
    else if (branchCount > 1 || totalSteps > 8) complexity = 'Medium';

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodeTypes,
      participantNodes: nodeTypes.aemStep || 0,
      processNodes: nodeTypes.processStep || 0,
      branchNodes: nodeTypes.branch || 0,
      emailNodes: nodeTypes.emailNotification || 0,
      orphanNodes,
      complexity,
    };
  }, [nodes, edges]);

  // History management for undo/redo
  const pushHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ nodes: newNodes, edges: newEdges });
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Initialize history with current state
  useEffect(() => {
    if (history.length === 0) {
      pushHistory(nodes, edges);
    }
  }, []); // Only on mount

  // Auto-save effect
  useEffect(() => {
    if (autoSaveEnabled && nodes.length > 0) {
      const saveTimer = setTimeout(() => {
        saveWorkflow({
          id: workflow?.id || 'draft',
          name: workflow?.name || 'Untitled Workflow',
          steps: nodes.map(n => ({
            id: n.id,
            type: n.type || 'unknown',
            position: n.position,
            data: n.data,
          })),
          edges: edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle ?? undefined,
            targetHandle: e.targetHandle ?? undefined,
            type: e.type,
          })),
          createdAt: workflow?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: workflow?.createdBy || 'anonymous',
        });
      }, 2000);
      return () => clearTimeout(saveTimer);
    }
  }, [nodes, edges, autoSaveEnabled, workflow, saveWorkflow]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Cmd/Ctrl + Shift + Z for redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowSimulator(false);
        setShowAnalytics(false);
        setShowTemplateGallery(false);
        setShowDocGenerator(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      if (!params.source || !params.target) return;
      
      const edgeLabel = params.sourceHandle === 'true' ? 'Yes' : params.sourceHandle === 'false' ? 'No' : undefined;
      
      const newEdge: Edge = {
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        animated: true,
        label: edgeLabel,
      };
      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        pushHistory(nodes, updated);
        return updated;
      });
    },
    [readOnly, setEdges, nodes, pushHistory]
  );

  const onNodesChangeHandler = useCallback(
    (changes: any) => {
      if (readOnly) return;
      onNodesChange(changes);
    },
    [readOnly, onNodesChange]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: any) => {
      if (readOnly) return;
      onEdgesChange(changes);
    },
    [readOnly, onEdgesChange]
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setEditLabel(node.data?.label || '');
    setEditDescription(node.data?.description || '');
    setEditParticipant(node.data?.participant || node.data?.assignTo || '');
    setEditTimeout(node.data?.timeout?.toString() || '');
    setEditErrorHandler(node.data?.errorHandler || '');
  }, []);

  const handleUpdateNode = useCallback(() => {
    if (!selectedNode) return;
    
    setNodes((nds) => {
      const updated = nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: editLabel,
              description: editDescription,
              participant: editParticipant,
              assignTo: editParticipant,
              timeout: editTimeout ? parseInt(editTimeout) : undefined,
              errorHandler: editErrorHandler,
            },
          };
        }
        return node;
      });
      pushHistory(updated, edges);
      return updated;
    });
    setSelectedNode(null);
  }, [selectedNode, editLabel, editDescription, editParticipant, editTimeout, editErrorHandler, setNodes, edges, pushHistory]);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return;
    if (selectedNode.type === 'startEnd') {
      alert('Cannot delete Start or End nodes');
      return;
    }
    setNodes((nds) => {
      const updated = nds.filter((n) => n.id !== selectedNode.id);
      pushHistory(updated, edges.filter(e => 
        e.source !== selectedNode.id && e.target !== selectedNode.id
      ));
      return updated;
    });
    setEdges((eds) => eds.filter((e) => 
      e.source !== selectedNode.id && e.target !== selectedNode.id
    ));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges, edges, pushHistory]);

  const addNode = useCallback((type: string) => {
    const labels: Record<string, string> = {
      aemStep: 'New Review',
      processStep: 'New Process',
      branch: 'Decision',
      damUpdate: 'Update Asset',
      emailNotification: 'Send Email',
      participantChooser: 'Choose Participant',
      graniteRouting: 'Route',
      formsProcess: 'Form Process',
      damMetadata: 'Write Metadata',
      damTranscode: 'Transcode',
      callWorkflow: 'Call Workflow',
      pageActivation: 'Activate Page',
    };
    
    const newNode: Node = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 100 },
      data: { 
        label: labels[type] || 'New Node',
        description: '',
        stepType: 'participant',
        branchType: 'xor',
        processType: 'metadata',
      },
      draggable: !readOnly,
    };
    setNodes((nds) => {
      const updated = [...nds, newNode];
      pushHistory(updated, edges);
      return updated;
    });
  }, [setNodes, readOnly, edges, pushHistory]);

  const loadTemplate = useCallback((template: any) => {
    const newNodes = template.nodes.map((n: any) => ({ ...n, draggable: !readOnly }));
    const nodeIdMap: Record<string, string> = {};
    newNodes.forEach((n: any, i: number) => { 
      const newId = `${template.id}-${Date.now()}-${i}`;
      nodeIdMap[template.nodes[i].id] = newId;
      n.id = newId;
    });
    
    const newEdges = template.edges.map((e: any, i: number) => ({
      ...e,
      id: `${e.id}-${Date.now()}-${i}`,
      source: nodeIdMap[e.source] || e.source,
      target: nodeIdMap[e.target] || e.target,
    }));
    
    setNodes(newNodes);
    setEdges(newEdges);
    pushHistory(newNodes, newEdges);
    setShowTemplates(false);
  }, [setNodes, setEdges, readOnly, pushHistory]);

  // Handler for loading templates from gallery
  const handleLoadTemplateFromGallery = useCallback((template: any) => {
    const newNodes = template.nodes.map((n: any, i: number) => ({
      ...n,
      id: `${template.id}-${Date.now()}-${i}`,
      draggable: !readOnly,
    }));

    const nodeIdMap: Record<string, string> = {};
    template.nodes.forEach((n: any, i: number) => {
      nodeIdMap[n.id] = newNodes[i].id;
    });

    const newEdges = template.edges.map((e: any, i: number) => ({
      ...e,
      id: `edge-${Date.now()}-${i}`,
      source: nodeIdMap[e.source] || e.source,
      target: nodeIdMap[e.target] || e.target,
      animated: true,
    }));

    setNodes(newNodes);
    setEdges(newEdges);
    pushHistory(newNodes, newEdges);
    setShowTemplateGallery(false);
  }, [setNodes, setEdges, readOnly, pushHistory]);

  // Highlight node during simulation
  const handleHighlightNode = useCallback((nodeId: string | null) => {
    setHighlightedNodeId(nodeId);
  }, []);

  // Highlight path during simulation
  const handleHighlightPath = useCallback((nodeIds: string[]) => {
    setHighlightedPath(nodeIds);
  }, []);

  // Export handlers for different formats
  const handleExportJSON = useCallback(() => {
    const json = exportToJSON(nodes, edges, { prettyPrint: true });
    downloadFile(json, 'workflow.json', 'application/json');
  }, [nodes, edges]);

  const handleExportYAML = useCallback(() => {
    const yaml = exportToYAML(nodes, edges);
    downloadFile(yaml, 'workflow.yaml', 'text/yaml');
  }, [nodes, edges]);

  const handleExportMarkdown = useCallback(() => {
    const md = exportToMarkdown(nodes, edges, {
      workflowName: workflow?.name || 'Workflow',
      includeDescription: true,
    });
    downloadFile(md, 'workflow.md', 'text/markdown');
  }, [nodes, edges, workflow]);

  const handleExportMermaid = useCallback(() => {
    const mermaid = generateMermaidDiagram(nodes, edges);
    downloadFile(mermaid, 'workflow.mmd', 'text/plain');
  }, [nodes, edges]);

  const handleExport = useCallback(() => {
    const result = validateWorkflow(nodes, edges);
    setValidationResult(result);
    setShowValidation(true);
    
    if (!result.valid) {
      const proceed = window.confirm(`Validation failed with ${result.errors.length} error(s). Export anyway?`);
      if (!proceed) return;
    }
    
    const xml = generateAEMXML(nodes, edges);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow-model.xml';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const saveToLocalStorage = useCallback(() => {
    const data = { nodes, edges, savedAt: new Date().toISOString() };
    localStorage.setItem('aemflow-workflow', JSON.stringify(data));
    alert('Workflow saved!');
  }, [nodes, edges]);

  const loadFromLocalStorage = useCallback(() => {
    const saved = localStorage.getItem('aemflow-workflow');
    if (saved) {
      const data = JSON.parse(saved);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      pushHistory(data.nodes || [], data.edges || []);
    } else {
      alert('No saved workflow found');
    }
  }, [setNodes, setEdges, pushHistory]);

  const handleImportXML = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const xml = event.target?.result as string;
        const { nodes: importedNodes, edges: importedEdges } = parseAEMXML(xml);
        setNodes(importedNodes);
        setEdges(importedEdges);
        pushHistory(importedNodes, importedEdges);
        alert('Workflow imported successfully!');
      } catch (error) {
        alert('Failed to parse XML. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [setNodes, setEdges, pushHistory]);

  const handleAutoLayout = useCallback(() => {
    const { nodes: laidNodes, edges: laidEdges } = autoLayoutNodes(nodes, edges);
    setNodes(laidNodes);
    setEdges(laidEdges);
    pushHistory(laidNodes, laidEdges);
  }, [nodes, edges, setNodes, setEdges, pushHistory]);

  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) {
      alert('Please describe your workflow');
      return;
    }
    
    setAiLoading(true);
    try {
      const result = await generateWorkflowFromAI(
        aiPrompt, 
        aiProvider,
        apiKey || undefined,
        ollamaModel || undefined
      );
      const newNodes = result.nodes.map((n: any) => ({ ...n, draggable: !readOnly }));
      const newEdges = result.edges.map((e: any, i: number) => ({
        ...e,
        id: e.id || `e-${Date.now()}-${i}`,
      }));
      
      setNodes(newNodes);
      setEdges(newEdges);
      pushHistory(newNodes, newEdges);
      setShowAI(false);
      setAiPrompt('');
    } catch (error) {
      alert('Failed to generate workflow');
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, apiKey, readOnly, setNodes, setEdges, pushHistory]);

  const handleSave = useCallback(async () => {
    const workflowDefinition: WorkflowDefinition = {
      id: workflow?.id || `workflow-${Date.now()}`,
      name: workflow?.name || 'Untitled Workflow',
      description: workflow?.description,
      steps: nodes.map((node): WorkflowStep => ({
        id: node.id,
        type: node.type as string,
        position: { x: node.position.x, y: node.position.y },
        data: node.data,
      })),
      edges: edges.map((edge): WorkflowEdge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? undefined,
        targetHandle: edge.targetHandle ?? undefined,
      })),
      createdAt: workflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'demo-user',
    };

    try {
      if (onSave) {
        await onSave(workflowDefinition);
      } else {
        await saveWorkflow(workflowDefinition);
      }
      alert('Workflow saved!');
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  }, [nodes, edges, workflow, onSave, saveWorkflow]);

  // Create command palette commands
  const commands = useMemo(() => createDefaultCommands({
    onSave: saveToLocalStorage,
    onLoad: loadFromLocalStorage,
    onUndo: undo,
    onRedo: redo,
    onAutoLayout: handleAutoLayout,
    onExport: handleExport,
    onExportJSON: handleExportJSON,
    onExportYAML: handleExportYAML,
    onExportMarkdown: handleExportMarkdown,
    onShowSimulator: () => setShowSimulator(true),
    onShowAnalytics: () => setShowAnalytics(true),
    onShowTemplates: () => setShowTemplateGallery(true),
    onShowDocGenerator: () => setShowDocGenerator(true),
    onToggleDarkMode: () => setDarkMode(d => !d),
    onNewWorkflow: () => {
      if (window.confirm('Start a new workflow? This will clear the current workflow.')) {
        setNodes([
          { id: 'start', type: 'startEnd', position: { x: 300, y: 50 }, data: { label: 'Start', isStart: true }, draggable: !readOnly },
          { id: 'end', type: 'startEnd', position: { x: 300, y: 400 }, data: { label: 'End', isStart: false }, draggable: !readOnly },
        ]);
        setEdges([]);
      }
    },
    onAddNode: addNode,
    onFitView: () => {}, // Can be connected to ReactFlow fitView
  }), [saveToLocalStorage, loadFromLocalStorage, undo, redo, handleAutoLayout, handleExport, handleExportJSON, handleExportYAML, handleExportMarkdown, readOnly, setNodes, setEdges, addNode]);

  const theme = darkMode ? darkTheme : lightTheme;
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const panelBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: bgColor, color: textColor }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {showTemplates && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, background: panelBg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Library size={20} /> Templates
              </h3>
              <button onClick={() => setShowTemplates(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  style={{
                    padding: '16px',
                    background: darkMode ? '#334155' : '#f8fafc',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: textColor,
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{template.name}</div>
                  <div style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b' }}>{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showValidation && validationResult && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, background: panelBg, maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Validation Results
              </h3>
              <button onClick={() => setShowValidation(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor }}>
                <X size={20} />
              </button>
            </div>
            
            {validationResult.valid ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '16px' }}>
                <CheckCircle size={20} />
                <span style={{ fontWeight: '600' }}>Workflow is valid!</span>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '8px' }}>
                  <AlertTriangle size={20} />
                  <span style={{ fontWeight: '600' }}>{validationResult.errors.length} Error(s)</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#ef4444' }}>
                  {validationResult.errors.map((err, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.warnings.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px' }}>
                  <AlertTriangle size={20} />
                  <span style={{ fontWeight: '600' }}>{validationResult.warnings.length} Warning(s)</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#f59e0b' }}>
                  {validationResult.warnings.map((warn, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <button onClick={() => setShowValidation(false)} style={{ ...buttonStyle, background: '#3b82f6', width: '100%', marginTop: '16px' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {showAI && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, background: panelBg, maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} /> AI Workflow Generator
              </h3>
              <button onClick={() => setShowAI(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px' }}>
                AI Provider:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setAiProvider('pattern')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: aiProvider === 'pattern' ? '#3b82f6' : (darkMode ? '#334155' : '#f1f5f9'),
                    color: aiProvider === 'pattern' ? 'white' : textColor,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: aiProvider === 'pattern' ? '600' : '400',
                  }}
                >
                  Pattern Match
                </button>
                <button
                  onClick={() => setAiProvider('ollama')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: aiProvider === 'ollama' ? '#10b981' : (darkMode ? '#334155' : '#f1f5f9'),
                    color: aiProvider === 'ollama' ? 'white' : textColor,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: aiProvider === 'ollama' ? '600' : '400',
                  }}
                >
                  Ollama (Local)
                </button>
                <button
                  onClick={() => setAiProvider('openai')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: aiProvider === 'openai' ? '#8b5cf6' : (darkMode ? '#334155' : '#f1f5f9'),
                    color: aiProvider === 'openai' ? 'white' : textColor,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: aiProvider === 'openai' ? '600' : '400',
                  }}
                >
                  OpenAI
                </button>
              </div>
            </div>

            {aiProvider === 'ollama' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px' }}>
                  Ollama Model:
                </label>
                <select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    background: darkMode ? '#334155' : 'white',
                    color: textColor,
                  }}
                >
                  <option value="llama2">llama2</option>
                  <option value="llama2:7b">llama2:7b</option>
                  <option value="llama2:13b">llama2:13b</option>
                  <option value="codellama">codellama</option>
                  <option value="mistral">mistral</option>
                </select>
                <p style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
                  Make sure Ollama is running: <code>ollama serve</code>
                </p>
              </div>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Describe your workflow:
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Create an approval workflow for content publishing with review steps and email notifications"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  background: darkMode ? '#334155' : 'white',
                  color: textColor,
                }}
              />
            </div>

            {aiProvider === 'openai' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px' }}>
                OpenAI API Key:
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: darkMode ? '#334155' : 'white',
                  color: textColor,
                }}
              />
              <p style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
                Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>OpenAI</a>
              </p>
            </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Try these examples:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Content approval workflow', 'DAM asset processing', 'Form submission review', 'Translation workflow', 'Publish website'].map((example) => (
                  <button
                    key={example}
                    onClick={() => setAiPrompt(example)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: darkMode ? '#334155' : '#f1f5f9',
                      border: 'none',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      color: textColor,
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleAIGenerate} 
                disabled={aiLoading}
                style={{ 
                  ...buttonStyle, 
                  background: aiLoading ? '#94a3b8' : '#8b5cf6', 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {aiLoading ? 'Generating...' : 'Generate Workflow'}
              </button>
              <button 
                onClick={() => setShowAI(false)} 
                style={{ 
                  ...buttonStyle, 
                  background: darkMode ? '#475569' : '#64748b',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, background: panelBg, maxWidth: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} /> Workflow Stats
              </h3>
              <button onClick={() => setShowStats(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <StatCard label="Total Nodes" value={stats.totalNodes} color="#3b82f6" darkMode={darkMode} />
              <StatCard label="Participant Steps" value={stats.participantNodes} color="#8b5cf6" darkMode={darkMode} />
              <StatCard label="Process Steps" value={stats.processNodes} color="#10b981" darkMode={darkMode} />
              <StatCard label="Branch/Decision" value={stats.branchNodes} color="#f59e0b" darkMode={darkMode} />
              <StatCard label="Email Notifications" value={stats.emailNodes} color="#06b6d4" darkMode={darkMode} />
              <StatCard label="Connections" value={stats.totalEdges} color="#64748b" darkMode={darkMode} />
              <StatCard label="Orphan Nodes" value={stats.orphanNodes} color={stats.orphanNodes > 0 ? '#ef4444' : '#10b981'} darkMode={darkMode} />
              <div style={{ padding: '12px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Complexity</div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: stats.complexity === 'High' ? '#ef4444' : stats.complexity === 'Medium' ? '#f59e0b' : '#10b981'
                }}>
                  {stats.complexity}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Simulator */}
      {showSimulator && (
        <WorkflowSimulator
          nodes={nodes}
          edges={edges}
          onClose={() => setShowSimulator(false)}
          onHighlightNode={handleHighlightNode}
          onHighlightPath={handleHighlightPath}
          darkMode={darkMode}
        />
      )}

      {/* Workflow Analytics */}
      {showAnalytics && (
        <WorkflowAnalytics
          nodes={nodes}
          edges={edges}
          onClose={() => setShowAnalytics(false)}
          darkMode={darkMode}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={commands}
        darkMode={darkMode}
      />

      {/* Template Gallery */}
      <TemplateGallery
        isOpen={showTemplateGallery}
        onSelectTemplate={handleLoadTemplateFromGallery}
        onClose={() => setShowTemplateGallery(false)}
        darkMode={darkMode}
      />

      {/* Documentation Generator */}
      <DocumentationGenerator
        isOpen={showDocGenerator}
        nodes={nodes}
        edges={edges}
        onClose={() => setShowDocGenerator(false)}
        darkMode={darkMode}
      />

      {!readOnly && (
        <div style={{
          width: '200px',
          background: panelBg,
          borderRight: `1px solid ${borderColor}`,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} /> Add Nodes
          </div>

          <button onClick={() => addNode('aemStep')} style={{...nodeButtonStyle, color: '#3b82f6', borderColor: '#3b82f6', background: darkMode ? '#1e293b' : 'white'}}>
            <User size={16} /> AEM Step
          </button>
          <button onClick={() => addNode('processStep')} style={{...nodeButtonStyle, color: '#f59e0b', borderColor: '#f59e0b', background: darkMode ? '#1e293b' : 'white'}}>
            <Cog size={16} /> Process
          </button>
          <button onClick={() => addNode('branch')} style={{...nodeButtonStyle, color: '#8b5cf6', borderColor: '#8b5cf6', background: darkMode ? '#1e293b' : 'white'}}>
            <GitBranch size={16} /> Branch
          </button>
          <button onClick={() => addNode('damUpdate')} style={{...nodeButtonStyle, color: '#10b981', borderColor: '#10b981', background: darkMode ? '#1e293b' : 'white'}}>
            <Image size={16} /> DAM Update
          </button>
          <button onClick={() => addNode('emailNotification')} style={{...nodeButtonStyle, color: '#06b6d4', borderColor: '#06b6d4', background: darkMode ? '#1e293b' : 'white'}}>
            <Mail size={16} /> Email
          </button>
          <button onClick={() => addNode('participantChooser')} style={{...nodeButtonStyle, color: '#ec4899', borderColor: '#ec4899', background: darkMode ? '#1e293b' : 'white'}}>
            <UserCheck size={16} /> Participant
          </button>
          <button onClick={() => addNode('graniteRouting')} style={{...nodeButtonStyle, color: '#14b8a6', borderColor: '#14b8a6', background: darkMode ? '#1e293b' : 'white'}}>
            <Route size={16} /> Routing
          </button>
          <button onClick={() => addNode('formsProcess')} style={{...nodeButtonStyle, color: '#f59e0b', borderColor: '#f59e0b', background: darkMode ? '#1e293b' : 'white'}}>
            <FileText size={16} /> Forms
          </button>
          <button onClick={() => addNode('damMetadata')} style={{...nodeButtonStyle, color: '#8b5cf6', borderColor: '#8b5cf6', background: darkMode ? '#1e293b' : 'white'}}>
            <FileText size={16} /> Metadata
          </button>
          <button onClick={() => addNode('damTranscode')} style={{...nodeButtonStyle, color: '#f43f5e', borderColor: '#f43f5e', background: darkMode ? '#1e293b' : 'white'}}>
            <Image size={16} /> Transcode
          </button>
          <button onClick={() => addNode('callWorkflow')} style={{...nodeButtonStyle, color: '#64748b', borderColor: '#64748b', background: darkMode ? '#1e293b' : 'white'}}>
            <ArrowRightCircle size={16} /> Call WF
          </button>
          <button onClick={() => addNode('pageActivation')} style={{...nodeButtonStyle, color: '#3b82f6', borderColor: '#3b82f6', background: darkMode ? '#1e293b' : 'white'}}>
            <Globe size={16} /> Activate
          </button>

          {selectedNode && (
            <div style={{ marginTop: '16px', borderTop: `1px solid ${borderColor}`, paddingTop: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={16} /> Edit Node
              </div>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="Label"
                style={{...inputStyle, background: darkMode ? '#334155' : 'white', color: textColor, borderColor}}
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
                rows={2}
                style={{...inputStyle, resize: 'vertical', background: darkMode ? '#334155' : 'white', color: textColor, borderColor}}
              />
              {(selectedNode.type === 'aemStep' || selectedNode.type === 'graniteRouting' || selectedNode.type === 'participantChooser') && (
                <input
                  type="text"
                  value={editParticipant}
                  onChange={(e) => setEditParticipant(e.target.value)}
                  placeholder={selectedNode.type === 'graniteRouting' ? 'Assign To' : 'Participant'}
                  style={{...inputStyle, background: darkMode ? '#334155' : 'white', color: textColor, borderColor}}
                />
              )}
              <input
                type="number"
                value={editTimeout}
                onChange={(e) => setEditTimeout(e.target.value)}
                placeholder="Timeout (minutes)"
                style={{...inputStyle, background: darkMode ? '#334155' : 'white', color: textColor, borderColor}}
              />
              <select
                value={editErrorHandler}
                onChange={(e) => setEditErrorHandler(e.target.value)}
                style={{...inputStyle, background: darkMode ? '#334155' : 'white', color: textColor, borderColor}}
              >
                <option value="">Error Handler</option>
                <option value="rollback">Rollback</option>
                <option value="notify">Notify & Continue</option>
                <option value="stop">Stop Workflow</option>
              </select>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleUpdateNode} style={{...buttonStyle, background: '#3b82f6', flex: 1}}>Update</button>
                <button onClick={handleDeleteNode} style={{...buttonStyle, background: '#ef4444'}}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChangeHandler}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          style={{ background: bgColor }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={darkMode ? '#475569' : '#cbd5e1'} />
          <Controls />
          <MiniMap 
            nodeStrokeColor="#fff"
            nodeColor={(node) => {
              switch (node.type) {
                case 'startEnd': return node.data?.isStart ? '#10b981' : '#ef4444';
                case 'aemStep': return '#3b82f6';
                case 'processStep': return '#f59e0b';
                case 'branch': return '#8b5cf6';
                case 'damUpdate': return '#10b981';
                case 'emailNotification': return '#06b6d4';
                case 'participantChooser': return '#ec4899';
                default: return '#6b7280';
              }
            }}
            nodeBorderRadius={2}
            style={{ background: panelBg }}
          />
          
          {!readOnly && (
            <div style={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              zIndex: 10, 
              display: 'flex', 
              gap: '6px',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}>
              <button onClick={undo} style={{...topButtonStyle, background: darkMode ? '#475569' : '#64748b'}} title="Undo (Ctrl+Z)">
                <Undo2 size={16} />
              </button>
              <button onClick={redo} style={{...topButtonStyle, background: darkMode ? '#475569' : '#64748b'}} title="Redo (Ctrl+Y)">
                <Redo2 size={16} />
              </button>
              <button onClick={handleAutoLayout} style={{...topButtonStyle, background: '#8b5cf6'}} title="Auto Layout">
                <Layout size={16} /> Layout
              </button>
              <button onClick={() => setShowSimulator(true)} style={{...topButtonStyle, background: '#10b981'}} title="Simulate Workflow">
                <Play size={16} /> Simulate
              </button>
              <button onClick={() => setShowAnalytics(true)} style={{...topButtonStyle, background: '#06b6d4'}} title="Analytics Dashboard">
                <BarChart3 size={16} /> Analytics
              </button>
              <button onClick={() => setShowStats(true)} style={{...topButtonStyle, background: '#64748b'}} title="Quick Stats">
                <BarChart3 size={16} /> Stats
              </button>
              <button onClick={() => setShowTemplateGallery(true)} style={{...topButtonStyle, background: '#0ea5e9'}} title="Template Gallery">
                <Grid3X3 size={16} /> Gallery
              </button>
              <button onClick={() => setShowTemplates(true)} style={{...topButtonStyle, background: '#0ea5e9'}}>
                <Library size={16} /> Templates
              </button>
              <button onClick={() => setShowDocGenerator(true)} style={{...topButtonStyle, background: '#8b5cf6'}} title="Generate Documentation">
                <BookOpen size={16} /> Docs
              </button>
              <button onClick={() => setShowCommandPalette(true)} style={{...topButtonStyle, background: '#475569'}} title="Command Palette (Cmd+K)">
                <Command size={16} />
              </button>
              <button onClick={() => setShowAI(true)} style={{...topButtonStyle, background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', fontWeight: 'bold'}}>
                <Sparkles size={16} /> AI Generate
              </button>
              <button onClick={handleImportXML} style={{...topButtonStyle, background: '#6366f1'}}>
                <FileUp size={16} /> Import
              </button>
              <button onClick={loadFromLocalStorage} style={{...topButtonStyle, background: '#6366f1'}}>
                <Upload size={16} /> Load
              </button>
              <button onClick={saveToLocalStorage} style={{...topButtonStyle, background: '#8b5cf6'}}>
                <Save size={16} /> Save
              </button>
              <button onClick={handleExport} style={{...topButtonStyle, background: '#f59e0b'}}>
                <Download size={16} /> Validate & Export
              </button>
              <button onClick={handleSave} style={{...topButtonStyle, background: '#10b981', fontWeight: 'bold'}}>
                <Save size={16} /> Save Workflow
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                style={{...topButtonStyle, background: darkMode ? '#f59e0b' : '#1e293b'}}
                title="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          )}
        </ReactFlow>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string; darkMode: boolean }> = ({ label, value, color, darkMode }) => (
  <div style={{ padding: '12px', background: darkMode ? '#334155' : '#f1f5f9', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{label}</span>
    <span style={{ fontSize: '20px', fontWeight: 'bold', color }}>{value}</span>
  </div>
);

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.6)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalStyle: React.CSSProperties = {
  borderRadius: '12px',
  padding: '24px',
  maxWidth: '600px',
  width: '90%',
  maxHeight: '80vh',
  overflow: 'auto',
};

const nodeButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 12px',
  border: '1px solid',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '500' as const,
  fontSize: '13px',
  width: '100%' as const,
  justifyContent: 'flex-start' as const,
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  marginBottom: '8px',
  border: '1px solid',
  borderRadius: '4px',
  fontSize: '13px',
};

const buttonStyle = {
  padding: '8px 12px',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
};

const topButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
};

const darkTheme = {
  background: '#0f172a',
  panel: '#1e293b',
  text: '#e2e8f0',
  border: '#334155',
};

const lightTheme = {
  background: '#f8fafc',
  panel: '#ffffff',
  text: '#1e293b',
  border: '#e2e8f0',
};

function getNodeType(type: string): string {
  switch (type) {
    case 'aemStep': return 'aemStep';
    case 'processStep': return 'processStep';
    case 'startEnd': return 'startEnd';
    case 'branch': return 'branch';
    case 'damUpdate': return 'damUpdate';
    case 'emailNotification': return 'emailNotification';
    case 'participantChooser': return 'participantChooser';
    case 'graniteRouting': return 'graniteRouting';
    case 'formsProcess': return 'formsProcess';
    case 'damMetadata': return 'damMetadata';
    case 'damTranscode': return 'damTranscode';
    case 'callWorkflow': return 'callWorkflow';
    case 'pageActivation': return 'pageActivation';
    default: return 'aemStep';
  }
}
