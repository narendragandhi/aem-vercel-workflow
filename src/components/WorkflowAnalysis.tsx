import React, { useState } from 'react';
import { Edge, Node } from '@reactflow/core';
import { AlertTriangle, Brain, CheckCircle, Lightbulb, Loader2, Sparkles, X, Zap } from 'lucide-react';

interface WorkflowAnalysisProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
  darkMode?: boolean;
}

interface AnalysisResult {
  category: 'issue' | 'improvement' | 'success';
  title: string;
  description: string;
}

const analyzeWorkflow = (nodes: Node[], edges: Edge[]): AnalysisResult[] => {
  const results: AnalysisResult[] = [];

  const startNodes = nodes.filter(n => n.type === 'startEnd' && n.data?.isStart);
  const endNodes = nodes.filter(n => n.type === 'startEnd' && !n.data?.isStart);

  if (startNodes.length === 0) {
    results.push({
      category: 'issue',
      title: 'Missing Start Node',
      description: 'Every workflow must have exactly one Start node to begin execution.'
    });
  } else if (startNodes.length > 1) {
    results.push({
      category: 'issue',
      title: 'Multiple Start Nodes',
      description: 'Found multiple Start nodes. Consider splitting into separate workflows.'
    });
  }

  if (endNodes.length === 0) {
    results.push({
      category: 'issue',
      title: 'Missing End Node',
      description: 'Workflow has no End node. This will cause workflows to run indefinitely.'
    });
  }

  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const orphanNodes = nodes.filter(n =>
    n.type !== 'startEnd' && !connectedNodeIds.has(n.id)
  );

  if (orphanNodes.length > 0) {
    results.push({
      category: 'issue',
      title: 'Orphan Nodes Detected',
      description: `${orphanNodes.length} node(s) are not connected to the workflow flow.`
    });
  }

  const branchNodes = nodes.filter(n => n.type === 'branch');
  branchNodes.forEach(node => {
    const outgoing = edges.filter(e => e.source === node.id);
    if (outgoing.length < 2) {
      results.push({
        category: 'issue',
        title: 'Incomplete Branch',
        description: `"${node.data?.label}" has only ${outgoing.length} outgoing connection(s). Branches should have at least 2 paths.`
      });
    }
  });

  const participantNodes = nodes.filter(n => 
    n.type === 'aemStep' || n.type === 'participantChooser' || n.type === 'graniteRouting'
  );
  
  participantNodes.forEach(node => {
    if (!node.data?.participant && !node.data?.assignTo) {
      results.push({
        category: 'improvement',
        title: 'Missing Participant',
        description: `"${node.data?.label}" has no participant assigned. Add a user or group for approval.`
      });
    }
  });

  const emailNodes = nodes.filter(n => n.type === 'emailNotification');
  if (emailNodes.length > 0) {
    results.push({
      category: 'success',
      title: 'Notification Setup',
      description: `Good job! ${emailNodes.length} email notification(s) will keep stakeholders informed.`
    });
  }

  const processNodes = nodes.filter(n => n.type === 'processStep');
  if (processNodes.length > 0 && processNodes.length < 3) {
    results.push({
      category: 'improvement',
      title: 'Simple Workflow',
      description: 'Consider adding more validation steps or notifications for better process control.'
    });
  } else if (processNodes.length >= 5) {
    results.push({
      category: 'success',
      title: 'Comprehensive Workflow',
      description: `Well structured! ${processNodes.length} process steps provide thorough automation.`
    });
  }

  const cycles = detectCycles(nodes, edges);
  if (cycles.length > 0) {
    results.push({
      category: 'issue',
      title: 'Potential Infinite Loop',
      description: 'Detected cyclic dependencies that could cause workflows to run indefinitely.'
    });
  }

  const timeoutNodes = nodes.filter(n => 
    (n.type === 'aemStep' || n.type === 'processStep') && n.data?.timeout
  );
  
  if (timeoutNodes.length === 0 && participantNodes.length > 0) {
    results.push({
      category: 'improvement',
      title: 'No Timeouts Set',
      description: 'Consider adding timeout values to participant steps to prevent workflow stalls.'
    });
  }

  if (results.length === 0) {
    results.push({
      category: 'success',
      title: 'Workflow Looks Good!',
      description: 'No issues found. Your workflow is properly structured.'
    });
  }

  return results;
};

const detectCycles = (nodes: Node[], edges: Edge[]): string[][] => {
  const adj: Record<string, string[]> = {};
  nodes.forEach(n => adj[n.id] = []);
  edges.forEach(e => {
    if (adj[e.source]) {adj[e.source].push(e.target);}
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

export const WorkflowAnalysis: React.FC<WorkflowAnalysisProps> = ({
  nodes,
  edges,
  onClose,
  darkMode = false
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const analysis = analyzeWorkflow(nodes, edges);
      setResults(analysis);
      setAnalyzing(false);
    }, 800);
  };

  const handleAIInsights = async (apiKey: string) => {
    if (!apiKey) {
      alert('Please enter an API key first');
      return;
    }

    setAnalyzing(true);
    
    const workflowSummary = nodes.map(n => `${n.type}: ${n.data?.label}`).join(', ');
    
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
              content: `You are an AEM workflow expert. Analyze the following workflow and provide improvement suggestions. Be concise and practical.`
            },
            {
              role: 'user',
              content: `Workflow nodes: ${workflowSummary}\n\nProvide 3-5 specific improvement suggestions.`
            }
          ],
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.choices[0].message.content);
      } else {
        alert('Failed to get AI insights. Please check your API key.');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      alert('Failed to connect to AI service.');
    }
    
    setAnalyzing(false);
  };

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      background: bgColor,
      borderLeft: `1px solid ${borderColor}`,
      boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '20px',
        borderBottom: `1px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Brain size={20} style={{ color: '#8b5cf6' }} />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Workflow Analysis</h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: textColor,
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          style={{
            width: '100%',
            padding: '12px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: analyzing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: analyzing ? 0.7 : 1,
          }}
        >
          {analyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {analyzing ? 'Analyzing...' : 'Analyze Workflow'}
        </button>

        {results.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: textColor }}>
              Analysis Results
            </h3>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  background: result.category === 'issue' 
                    ? (darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)')
                    : result.category === 'improvement'
                    ? (darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)')
                    : (darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)'),
                  border: `1px solid ${
                    result.category === 'issue' ? '#ef4444' 
                    : result.category === 'improvement' ? '#fbbf24' 
                    : '#22c55e'
                  }`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {result.category === 'issue' && <AlertTriangle size={16} style={{ color: '#ef4444' }} />}
                  {result.category === 'improvement' && <Lightbulb size={16} style={{ color: '#fbbf24' }} />}
                  {result.category === 'success' && <CheckCircle size={16} style={{ color: '#22c55e' }} />}
                  <span style={{ fontWeight: '600', fontSize: '13px', color: textColor }}>
                    {result.title}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                  {result.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: textColor }}>
              AI-Powered Insights
            </h3>
            <p style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '12px' }}>
              Get deeper analysis using AI. Enter your OpenAI API key:
            </p>
            <input
              type="password"
              id="analysis-api-key"
              placeholder="sk-..."
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
                fontSize: '13px',
                background: darkMode ? '#334155' : 'white',
                color: textColor,
                marginBottom: '8px',
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('analysis-api-key') as HTMLInputElement;
                handleAIInsights(input?.value || '');
              }}
              disabled={analyzing}
              style={{
                width: '100%',
                padding: '10px',
                background: '#06b6d4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Zap size={16} />
              Get AI Insights
            </button>
            
            {aiInsights && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: darkMode ? '#334155' : '#f8fafc',
                borderRadius: '8px',
                fontSize: '12px',
                color: textColor,
                whiteSpace: 'pre-wrap',
              }}>
                {aiInsights}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
