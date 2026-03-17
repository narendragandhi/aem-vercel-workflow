import { Edge, Node } from '@reactflow/core';

export type ValidationSeverity = 'error' | 'warning' | 'info';

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  message: string;
  nodeId?: string;
  edgeId?: string;
  rule: string;
  fix?: () => void;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

export interface ValidationRule {
  name: string;
  description: string;
  severity: ValidationSeverity;
  validate: (nodes: Node[], edges: Edge[]) => ValidationIssue[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const requiredFieldsRule: ValidationRule = {
  name: 'RequiredFields',
  description: 'Title, description present',
  severity: 'error',
  validate: (nodes: Node[]) => {
    const issues: ValidationIssue[] = [];
    nodes.forEach((node) => {
      if (!node.data?.label) {
        issues.push({
          id: generateId(),
          severity: 'error',
          message: `Node "${node.id}" missing label`,
          nodeId: node.id,
          rule: 'RequiredFields',
        });
      }
    });
    return issues;
  },
};

export const connectedNodesRule: ValidationRule = {
  name: 'ConnectedNodes',
  description: 'All nodes connected',
  severity: 'error',
  validate: (nodes: Node[], edges: Edge[]) => {
    const issues: ValidationIssue[] = [];
    const connectedNodeIds = new Set<string>();
    
    edges.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    nodes.forEach((node) => {
      if (!connectedNodeIds.has(node.id) && nodes.length > 1) {
        issues.push({
          id: generateId(),
          severity: 'error',
          message: `Node "${node.data?.label || node.id}" is not connected`,
          nodeId: node.id,
          rule: 'ConnectedNodes',
        });
      }
    });
    return issues;
  },
};

export const noOrphansRule: ValidationRule = {
  name: 'NoOrphans',
  description: 'No disconnected nodes',
  severity: 'warning',
  validate: (nodes: Node[], edges: Edge[]) => {
    const issues: ValidationIssue[] = [];
    const sourceNodes = new Set(edges.map((e) => e.source));
    const targetNodes = new Set(edges.map((e) => e.target));
    
    nodes.forEach((node) => {
      const isSource = sourceNodes.has(node.id);
      const isTarget = targetNodes.has(node.id);
      if (!isSource && !isTarget && nodes.length > 2) {
        const nodeType = node.data?.isStart ? 'start' : node.data?.isEnd ? 'end' : 'node';
        if (nodeType !== 'start' && nodeType !== 'end') {
          issues.push({
            id: generateId(),
            severity: 'warning',
            message: `Node "${node.data?.label || node.id}" may be orphaned`,
            nodeId: node.id,
            rule: 'NoOrphans',
          });
        }
      }
    });
    return issues;
  },
};

export const validTransitionsRule: ValidationRule = {
  name: 'ValidTransitions',
  description: 'Valid source/target',
  severity: 'error',
  validate: (nodes: Node[], edges: Edge[]) => {
    const issues: ValidationIssue[] = [];
    const nodeIds = new Set(nodes.map((n) => n.id));
    
    edges.forEach((edge) => {
      if (!nodeIds.has(edge.source)) {
        issues.push({
          id: generateId(),
          severity: 'error',
          message: `Edge "${edge.id}" has invalid source node`,
          edgeId: edge.id,
          rule: 'ValidTransitions',
        });
      }
      if (!nodeIds.has(edge.target)) {
        issues.push({
          id: generateId(),
          severity: 'error',
          message: `Edge "${edge.id}" has invalid target node`,
          edgeId: edge.id,
          rule: 'ValidTransitions',
        });
      }
    });
    return issues;
  },
};

export const participantAssignedRule: ValidationRule = {
  name: 'ParticipantAssigned',
  description: 'Participant step has user',
  severity: 'error',
  validate: (nodes: Node[]) => {
    const issues: ValidationIssue[] = [];
    const participantTypes = ['participantChooser', 'participant'];
    
    nodes.forEach((node) => {
      if (participantTypes.includes(node.type || '')) {
        if (!node.data?.participant && !node.data?.user) {
          issues.push({
            id: generateId(),
            severity: 'error',
            message: `Participant node "${node.data?.label || node.id}" has no user assigned`,
            nodeId: node.id,
            rule: 'ParticipantAssigned',
          });
        }
      }
    });
    return issues;
  },
};

export const processArgsRule: ValidationRule = {
  name: 'ProcessArgs',
  description: 'Process step has arguments',
  severity: 'warning',
  validate: (nodes: Node[]) => {
    const issues: ValidationIssue[] = [];
    const processTypes = ['processStep', 'aemStep', 'formsProcess'];
    
    nodes.forEach((node) => {
      if (processTypes.includes(node.type || '')) {
        if (!node.data?.processArgs && !node.data?.arguments) {
          issues.push({
            id: generateId(),
            severity: 'warning',
            message: `Process node "${node.data?.label || node.id}" has no arguments`,
            nodeId: node.id,
            rule: 'ProcessArgs',
          });
        }
      }
    });
    return issues;
  },
};

export const noCyclesRule: ValidationRule = {
  name: 'NoCycles',
  description: 'No infinite loops',
  severity: 'warning',
  validate: (nodes: Node[], edges: Edge[]) => {
    const issues: ValidationIssue[] = [];
    
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (nodeId: string, path: string[]): boolean => {
      if (recursionStack.has(nodeId)) {
        return true;
      }
      if (visited.has(nodeId)) {
        return false;
      }
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const outgoing = edges.filter((e) => e.source === nodeId);
      for (const edge of outgoing) {
        if (hasCycle(edge.target, [...path, edge.target])) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    for (const node of nodes) {
      visited.clear();
      recursionStack.clear();
      if (hasCycle(node.id, [node.id])) {
        issues.push({
          id: generateId(),
          severity: 'warning',
          message: `Potential cycle detected starting from "${node.data?.label || node.id}"`,
          nodeId: node.id,
          rule: 'NoCycles',
        });
        break;
      }
    }
    
    return issues;
  },
};

export const maxDepthRule: ValidationRule = {
  name: 'MaxDepth',
  description: 'Within nesting limits',
  severity: 'warning',
  validate: (nodes: Node[], edges: Edge[]) => {
    const issues: ValidationIssue[] = [];
    const maxDepth = 20;
    
    const getDepth = (nodeId: string, visited: Set<string> = new Set()): number => {
      if (visited.has(nodeId)) {return 0;}
      visited.add(nodeId);
      
      const outgoing = edges.filter((e) => e.source === nodeId);
      if (outgoing.length === 0) {return 1;}
      
      let max = 0;
      for (const edge of outgoing) {
        max = Math.max(max, getDepth(edge.target, new Set(visited)));
      }
      return max + 1;
    };
    
    for (const node of nodes) {
      const depth = getDepth(node.id);
      if (depth > maxDepth) {
        issues.push({
          id: generateId(),
          severity: 'warning',
          message: `Node "${node.data?.label || node.id}" depth (${depth}) exceeds maximum (${maxDepth})`,
          nodeId: node.id,
          rule: 'MaxDepth',
        });
      }
    }
    
    return issues;
  },
};

export const validationRules: ValidationRule[] = [
  requiredFieldsRule,
  connectedNodesRule,
  noOrphansRule,
  validTransitionsRule,
  participantAssignedRule,
  processArgsRule,
  noCyclesRule,
  maxDepthRule,
];

export function validateWorkflow(nodes: Node[], edges: Edge[]): ValidationResult {
  const allIssues: ValidationIssue[] = [];
  
  for (const rule of validationRules) {
    const issues = rule.validate(nodes, edges);
    allIssues.push(...issues);
  }
  
  return {
    valid: allIssues.filter((i) => i.severity === 'error').length === 0,
    issues: allIssues,
    errorCount: allIssues.filter((i) => i.severity === 'error').length,
    warningCount: allIssues.filter((i) => i.severity === 'warning').length,
    infoCount: allIssues.filter((i) => i.severity === 'info').length,
  };
}
