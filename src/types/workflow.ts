export interface WorkflowDefinition {
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

export interface WorkflowStep {
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

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: Record<string, any>;
}

export interface WorkflowPort {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
}

export interface AEMWorkflowStep {
  id: string;
  stepType: 'participant' | 'process' | 'external' | 'custom';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: string;
  endTime?: string;
  currentStep?: string;
  logs: WorkflowLog[];
  variables?: Record<string, any>;
}

export interface WorkflowLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  stepId?: string;
  data?: any;
}