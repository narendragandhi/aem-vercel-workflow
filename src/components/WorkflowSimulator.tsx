/**
 * Workflow Simulator Component
 *
 * Provides step-by-step workflow simulation with:
 * - Visual step highlighting
 * - Decision point interaction
 * - Execution timeline
 * - Variable tracking
 * - Mock data generation
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Node, Edge } from '@reactflow/core';
import {
  Play, Pause, SkipForward, RotateCcw, X, ChevronRight,
  CheckCircle, AlertCircle, Clock, User, Zap, GitBranch,
  MessageSquare, Activity, Database, Settings, FastForward
} from 'lucide-react';

export interface SimulationStep {
  id: string;
  nodeId: string;
  nodeType: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'failed';
  startTime?: number;
  endTime?: number;
  duration?: number;
  decision?: 'true' | 'false';
  variables?: Record<string, any>;
  logs?: SimulationLog[];
}

export interface SimulationLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

export interface SimulationConfig {
  speed: 'slow' | 'normal' | 'fast' | 'instant';
  autoAdvance: boolean;
  mockData: boolean;
  showLogs: boolean;
  highlightPath: boolean;
}

interface WorkflowSimulatorProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
  onHighlightNode: (nodeId: string | null) => void;
  onHighlightPath: (nodeIds: string[]) => void;
  darkMode?: boolean;
}

const SPEED_MAP = {
  slow: 3000,
  normal: 1500,
  fast: 500,
  instant: 100,
};

const MOCK_PARTICIPANTS = [
  'john.doe@example.com',
  'jane.smith@example.com',
  'content-reviewer',
  'marketing-team',
  'admin-group',
];

const MOCK_DECISIONS = {
  'Approved?': ['approved', 'needs revision'],
  'Valid?': ['valid', 'invalid'],
  'Ready?': ['ready', 'not ready'],
  'default': ['yes', 'no'],
};

export const WorkflowSimulator: React.FC<WorkflowSimulatorProps> = ({
  nodes,
  edges,
  onClose,
  onHighlightNode,
  onHighlightPath,
  darkMode = false,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [executedPath, setExecutedPath] = useState<string[]>([]);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [awaitingDecision, setAwaitingDecision] = useState<string | null>(null);
  const [config, setConfig] = useState<SimulationConfig>({
    speed: 'normal',
    autoAdvance: true,
    mockData: true,
    showLogs: true,
    highlightPath: true,
  });

  // Build execution plan from nodes and edges
  const buildExecutionPlan = useCallback(() => {
    const startNode = nodes.find(n => n.type === 'startEnd' && n.data?.isStart);
    if (!startNode) return [];

    const plan: SimulationStep[] = [];
    const visited = new Set<string>();
    const queue: string[] = [startNode.id];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      plan.push({
        id: `step-${plan.length}`,
        nodeId: node.id,
        nodeType: node.type || 'unknown',
        label: node.data?.label || node.id,
        status: 'pending',
      });

      // Find outgoing edges
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      outgoingEdges.forEach(edge => {
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
        }
      });
    }

    return plan;
  }, [nodes, edges]);

  // Initialize simulation
  const initializeSimulation = useCallback(() => {
    const plan = buildExecutionPlan();
    setSteps(plan);
    setCurrentStepIndex(-1);
    setExecutedPath([]);
    setVariables({
      workflowId: `wf-${Date.now()}`,
      startTime: new Date().toISOString(),
      initiator: 'simulator',
    });
    setLogs([]);
    setAwaitingDecision(null);
    onHighlightNode(null);
    onHighlightPath([]);
  }, [buildExecutionPlan, onHighlightNode, onHighlightPath]);

  useEffect(() => {
    initializeSimulation();
  }, []);

  // Add log entry
  const addLog = useCallback((level: SimulationLog['level'], message: string, data?: any) => {
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      level,
      message,
      data,
    }]);
  }, []);

  // Execute a single step
  const executeStep = useCallback(async (stepIndex: number) => {
    if (stepIndex >= steps.length) {
      setIsRunning(false);
      addLog('info', 'Workflow simulation completed');
      return;
    }

    const step = steps[stepIndex];
    const node = nodes.find(n => n.id === step.nodeId);
    if (!node) return;

    // Update step status to active
    setSteps(prev => prev.map((s, i) =>
      i === stepIndex ? { ...s, status: 'active', startTime: Date.now() } : s
    ));
    setCurrentStepIndex(stepIndex);
    onHighlightNode(step.nodeId);

    // Add to executed path
    setExecutedPath(prev => [...prev, step.nodeId]);
    if (config.highlightPath) {
      onHighlightPath([...executedPath, step.nodeId]);
    }

    addLog('info', `Executing: ${step.label}`, { nodeType: step.nodeType });

    // Handle different node types
    if (node.type === 'branch') {
      // For branch nodes, wait for user decision
      setAwaitingDecision(step.nodeId);
      setIsPaused(true);
      addLog('info', `Decision required: ${step.label}`);
      return;
    }

    if (node.type === 'aemStep' || node.type === 'participantChooser') {
      // Simulate participant step
      const participant = config.mockData
        ? MOCK_PARTICIPANTS[Math.floor(Math.random() * MOCK_PARTICIPANTS.length)]
        : node.data?.participant || 'user';

      setVariables(prev => ({
        ...prev,
        [`${step.nodeId}_assignee`]: participant,
        [`${step.nodeId}_completedAt`]: new Date().toISOString(),
      }));
      addLog('info', `Assigned to: ${participant}`);
    }

    if (node.type === 'emailNotification') {
      addLog('info', `Email sent: ${node.data?.description || 'Notification'}`);
    }

    if (node.type === 'processStep') {
      addLog('debug', `Process executed: ${node.data?.processHandler || 'default'}`);
    }

    // Wait based on speed setting
    await new Promise(resolve => setTimeout(resolve, SPEED_MAP[config.speed]));

    // Mark step as completed
    setSteps(prev => prev.map((s, i) =>
      i === stepIndex ? { ...s, status: 'completed', endTime: Date.now(), duration: Date.now() - (s.startTime || 0) } : s
    ));

    // Find next step based on edges
    const outgoingEdges = edges.filter(e => e.source === step.nodeId);
    if (outgoingEdges.length > 0) {
      const nextNodeId = outgoingEdges[0].target;
      const nextStepIndex = steps.findIndex(s => s.nodeId === nextNodeId);
      if (nextStepIndex !== -1 && config.autoAdvance) {
        setTimeout(() => executeStep(nextStepIndex), 100);
      }
    } else {
      // End of workflow
      setIsRunning(false);
      addLog('info', 'Workflow completed successfully');
    }
  }, [steps, nodes, edges, config, addLog, onHighlightNode, onHighlightPath, executedPath]);

  // Handle branch decision
  const handleDecision = useCallback((decision: 'true' | 'false') => {
    const currentStep = steps[currentStepIndex];
    if (!currentStep || !awaitingDecision) return;

    // Update step with decision
    setSteps(prev => prev.map((s, i) =>
      i === currentStepIndex ? { ...s, status: 'completed', decision, endTime: Date.now() } : s
    ));

    addLog('info', `Decision made: ${decision === 'true' ? 'Yes/True' : 'No/False'}`);

    // Find the edge for this decision
    const outgoingEdges = edges.filter(e => e.source === currentStep.nodeId);
    const selectedEdge = outgoingEdges.find(e => e.sourceHandle === decision) || outgoingEdges[0];

    if (selectedEdge) {
      const nextStepIndex = steps.findIndex(s => s.nodeId === selectedEdge.target);

      // Mark skipped branches
      outgoingEdges.forEach(edge => {
        if (edge !== selectedEdge) {
          const skippedIndex = steps.findIndex(s => s.nodeId === edge.target);
          if (skippedIndex !== -1) {
            setSteps(prev => prev.map((s, i) =>
              i === skippedIndex ? { ...s, status: 'skipped' } : s
            ));
          }
        }
      });

      setAwaitingDecision(null);
      setIsPaused(false);

      if (nextStepIndex !== -1) {
        setTimeout(() => executeStep(nextStepIndex), SPEED_MAP[config.speed] / 2);
      }
    }
  }, [steps, currentStepIndex, awaitingDecision, edges, config.speed, executeStep, addLog]);

  // Start simulation
  const startSimulation = useCallback(() => {
    if (steps.length === 0) {
      initializeSimulation();
    }
    setIsRunning(true);
    setIsPaused(false);

    const startStepIndex = currentStepIndex < 0 ? 0 : currentStepIndex;
    addLog('info', 'Starting workflow simulation');
    executeStep(startStepIndex);
  }, [steps.length, currentStepIndex, initializeSimulation, executeStep, addLog]);

  // Pause/Resume
  const togglePause = useCallback(() => {
    if (awaitingDecision) return; // Can't pause while awaiting decision
    setIsPaused(!isPaused);
    if (isPaused && isRunning) {
      executeStep(currentStepIndex + 1);
    }
  }, [isPaused, isRunning, currentStepIndex, awaitingDecision, executeStep]);

  // Skip to next step
  const skipStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      if (awaitingDecision) {
        // Auto-select first option
        handleDecision('true');
      } else {
        executeStep(currentStepIndex + 1);
      }
    }
  }, [currentStepIndex, steps.length, awaitingDecision, handleDecision, executeStep]);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    initializeSimulation();
    addLog('info', 'Simulation reset');
  }, [initializeSimulation, addLog]);

  // Calculate stats
  const stats = useMemo(() => {
    const completed = steps.filter(s => s.status === 'completed').length;
    const skipped = steps.filter(s => s.status === 'skipped').length;
    const failed = steps.filter(s => s.status === 'failed').length;
    const totalDuration = steps.reduce((acc, s) => acc + (s.duration || 0), 0);

    return {
      total: steps.length,
      completed,
      skipped,
      failed,
      pending: steps.length - completed - skipped - failed,
      totalDuration,
      progress: steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0,
    };
  }, [steps]);

  const bgColor = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const secondaryText = darkMode ? '#94a3b8' : '#64748b';

  return (
    <div style={{
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
    }}>
      <div style={{
        background: bgColor,
        borderRadius: '16px',
        width: '90%',
        maxWidth: '1200px',
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={24} style={{ color: '#8b5cf6' }} />
            <h2 style={{ margin: 0, color: textColor, fontSize: '18px' }}>Workflow Simulator</h2>
            <span style={{
              background: isRunning ? '#10b981' : isPaused ? '#f59e0b' : '#64748b',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {isRunning ? (awaitingDecision ? 'AWAITING DECISION' : 'RUNNING') : isPaused ? 'PAUSED' : 'READY'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Speed selector */}
            <select
              value={config.speed}
              onChange={(e) => setConfig(prev => ({ ...prev, speed: e.target.value as any }))}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${borderColor}`,
                background: darkMode ? '#334155' : '#f1f5f9',
                color: textColor,
                fontSize: '13px',
              }}
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
              <option value="instant">Instant</option>
            </select>

            <button onClick={onClose} style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: textColor,
            }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Steps panel */}
          <div style={{
            width: '350px',
            borderRight: `1px solid ${borderColor}`,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '16px',
              borderBottom: `1px solid ${borderColor}`,
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!isRunning ? (
                  <button onClick={startSimulation} style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}>
                    <Play size={18} /> Start
                  </button>
                ) : (
                  <button onClick={togglePause} disabled={!!awaitingDecision} style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: awaitingDecision ? '#94a3b8' : '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: awaitingDecision ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                  }}>
                    <Pause size={18} /> {isPaused ? 'Resume' : 'Pause'}
                  </button>
                )}
                <button onClick={skipStep} style={{
                  padding: '12px',
                  background: darkMode ? '#475569' : '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}>
                  <SkipForward size={18} />
                </button>
                <button onClick={resetSimulation} style={{
                  padding: '12px',
                  background: darkMode ? '#475569' : '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}>
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: secondaryText }}>Progress</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>{stats.progress}%</span>
              </div>
              <div style={{
                height: '8px',
                background: darkMode ? '#334155' : '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${stats.progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '12px',
                color: secondaryText,
              }}>
                <span>{stats.completed} completed</span>
                <span>{stats.skipped} skipped</span>
                <span>{stats.pending} pending</span>
              </div>
            </div>

            {/* Steps list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  style={{
                    padding: '12px',
                    marginBottom: '4px',
                    borderRadius: '8px',
                    background: step.status === 'active'
                      ? (darkMode ? '#3b82f620' : '#3b82f610')
                      : 'transparent',
                    border: step.status === 'active'
                      ? '2px solid #3b82f6'
                      : `1px solid ${step.status === 'completed' ? '#10b981' : 'transparent'}`,
                    opacity: step.status === 'skipped' ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: step.status === 'completed' ? '#10b981'
                        : step.status === 'active' ? '#3b82f6'
                        : step.status === 'skipped' ? '#94a3b8'
                        : step.status === 'failed' ? '#ef4444'
                        : (darkMode ? '#475569' : '#e2e8f0'),
                      color: step.status === 'pending' ? secondaryText : 'white',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>
                      {step.status === 'completed' ? <CheckCircle size={14} />
                        : step.status === 'active' ? <Activity size={14} />
                        : step.status === 'failed' ? <AlertCircle size={14} />
                        : index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: textColor,
                        marginBottom: '2px',
                      }}>
                        {step.label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '11px',
                          color: secondaryText,
                          textTransform: 'capitalize',
                        }}>
                          {step.nodeType}
                        </span>
                        {step.duration && (
                          <span style={{ fontSize: '11px', color: secondaryText }}>
                            <Clock size={10} style={{ marginRight: '2px' }} />
                            {step.duration}ms
                          </span>
                        )}
                      </div>
                    </div>
                    {step.decision && (
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: step.decision === 'true' ? '#10b98120' : '#f59e0b20',
                        color: step.decision === 'true' ? '#10b981' : '#f59e0b',
                      }}>
                        {step.decision === 'true' ? 'Yes' : 'No'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel - Decision & Logs */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Decision panel */}
            {awaitingDecision && (
              <div style={{
                padding: '24px',
                background: darkMode ? '#3b82f610' : '#3b82f608',
                borderBottom: `1px solid ${borderColor}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}>
                  <GitBranch size={24} style={{ color: '#8b5cf6' }} />
                  <div>
                    <h3 style={{ margin: 0, color: textColor, fontSize: '16px' }}>Decision Required</h3>
                    <p style={{ margin: '4px 0 0', color: secondaryText, fontSize: '13px' }}>
                      {steps[currentStepIndex]?.label}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleDecision('true')}
                    style={{
                      flex: 1,
                      padding: '16px 24px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle size={18} /> Yes / Approve
                  </button>
                  <button
                    onClick={() => handleDecision('false')}
                    style={{
                      flex: 1,
                      padding: '16px 24px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <X size={18} /> No / Reject
                  </button>
                </div>
              </div>
            )}

            {/* Variables panel */}
            <div style={{
              padding: '16px 24px',
              borderBottom: `1px solid ${borderColor}`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <Database size={16} style={{ color: '#8b5cf6' }} />
                <h4 style={{ margin: 0, color: textColor, fontSize: '14px' }}>Workflow Variables</h4>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px',
              }}>
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key} style={{
                    padding: '8px 12px',
                    background: darkMode ? '#334155' : '#f1f5f9',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}>
                    <span style={{ color: secondaryText }}>{key}:</span>{' '}
                    <span style={{ color: textColor, fontWeight: 500 }}>
                      {typeof value === 'string' ? value.slice(0, 30) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logs panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{
                padding: '12px 24px',
                borderBottom: `1px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <MessageSquare size={16} style={{ color: '#8b5cf6' }} />
                <h4 style={{ margin: 0, color: textColor, fontSize: '14px' }}>Execution Logs</h4>
                <span style={{
                  background: darkMode ? '#334155' : '#e2e8f0',
                  color: secondaryText,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}>
                  {logs.length} entries
                </span>
              </div>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 24px',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}>
                {logs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '6px 0',
                      borderBottom: `1px solid ${borderColor}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <span style={{ color: secondaryText, whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: log.level === 'error' ? '#ef444420'
                        : log.level === 'warn' ? '#f59e0b20'
                        : log.level === 'debug' ? '#64748b20'
                        : '#10b98120',
                      color: log.level === 'error' ? '#ef4444'
                        : log.level === 'warn' ? '#f59e0b'
                        : log.level === 'debug' ? '#64748b'
                        : '#10b981',
                    }}>
                      {log.level}
                    </span>
                    <span style={{ color: textColor, flex: 1 }}>{log.message}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ color: secondaryText, textAlign: 'center', padding: '24px' }}>
                    No logs yet. Start the simulation to see execution logs.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer stats */}
        <div style={{
          padding: '12px 24px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          gap: '24px',
          fontSize: '13px',
          color: secondaryText,
        }}>
          <span>Total Steps: <strong style={{ color: textColor }}>{stats.total}</strong></span>
          <span>Completed: <strong style={{ color: '#10b981' }}>{stats.completed}</strong></span>
          <span>Skipped: <strong style={{ color: '#f59e0b' }}>{stats.skipped}</strong></span>
          <span>Duration: <strong style={{ color: textColor }}>{stats.totalDuration}ms</strong></span>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSimulator;
