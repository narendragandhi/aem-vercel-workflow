/**
 * Workflow Analytics Dashboard
 *
 * Provides comprehensive analytics and insights for workflows including:
 * - Node distribution and complexity metrics
 * - Path analysis and bottleneck detection
 * - Performance predictions
 * - Best practice recommendations
 */

import React, { useMemo } from 'react';
import { Node, Edge } from '@reactflow/core';
import {
  BarChart3, GitBranch, Users, Zap, Clock, AlertTriangle,
  CheckCircle, TrendingUp, Activity, Target, Shield, X,
  Lightbulb, ArrowRight, Layers, Network, Timer, FileText
} from 'lucide-react';

interface WorkflowAnalyticsProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
  darkMode?: boolean;
}

interface AnalysisResult {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
}

interface Recommendation {
  type: 'warning' | 'suggestion' | 'info';
  title: string;
  description: string;
  nodeId?: string;
}

interface PathAnalysis {
  shortestPath: number;
  longestPath: number;
  averagePath: number;
  criticalPath: string[];
  parallelPaths: number;
}

export const WorkflowAnalytics: React.FC<WorkflowAnalyticsProps> = ({
  nodes,
  edges,
  onClose,
  darkMode = false,
}) => {
  // Calculate node type distribution
  const nodeDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    nodes.forEach(node => {
      const type = node.type || 'unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return distribution;
  }, [nodes]);

  // Calculate complexity metrics
  const complexityMetrics = useMemo(() => {
    const workflowNodes = nodes.filter(n => n.type !== 'startEnd');
    const branchNodes = nodes.filter(n => n.type === 'branch');
    const participantNodes = nodes.filter(n =>
      n.type === 'aemStep' || n.type === 'participantChooser' || n.type === 'graniteRouting'
    );
    const processNodes = nodes.filter(n =>
      n.type === 'processStep' || n.type === 'damUpdate' || n.type === 'damMetadata' ||
      n.type === 'damTranscode' || n.type === 'formsProcess' || n.type === 'callWorkflow'
    );

    // Calculate cyclomatic complexity (V = E - N + 2P where P = connected components)
    const cyclomaticComplexity = edges.length - nodes.length + 2;

    // Calculate nesting depth (max branch levels)
    const calculateNestingDepth = (): number => {
      let maxDepth = 0;
      const visited = new Set<string>();
      const startNode = nodes.find(n => n.type === 'startEnd' && n.data?.isStart);
      if (!startNode) return 0;

      const dfs = (nodeId: string, depth: number, branchDepth: number) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const node = nodes.find(n => n.id === nodeId);
        if (node?.type === 'branch') {
          maxDepth = Math.max(maxDepth, branchDepth + 1);
        }

        const outgoing = edges.filter(e => e.source === nodeId);
        outgoing.forEach(edge => {
          dfs(edge.target, depth + 1, node?.type === 'branch' ? branchDepth + 1 : branchDepth);
        });
      };

      dfs(startNode.id, 0, 0);
      return maxDepth;
    };

    return {
      totalNodes: workflowNodes.length,
      branchCount: branchNodes.length,
      participantCount: participantNodes.length,
      processCount: processNodes.length,
      edgeCount: edges.length,
      cyclomaticComplexity: Math.max(1, cyclomaticComplexity),
      nestingDepth: calculateNestingDepth(),
      parallelPaths: branchNodes.length,
    };
  }, [nodes, edges]);

  // Analyze paths
  const pathAnalysis = useMemo((): PathAnalysis => {
    const startNode = nodes.find(n => n.type === 'startEnd' && n.data?.isStart);
    const endNodes = nodes.filter(n => n.type === 'startEnd' && !n.data?.isStart);
    if (!startNode || endNodes.length === 0) {
      return { shortestPath: 0, longestPath: 0, averagePath: 0, criticalPath: [], parallelPaths: 0 };
    }

    const allPaths: string[][] = [];

    const findPaths = (nodeId: string, path: string[], visited: Set<string>) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      path.push(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (node?.type === 'startEnd' && !node.data?.isStart) {
        allPaths.push([...path]);
      } else {
        const outgoing = edges.filter(e => e.source === nodeId);
        outgoing.forEach(edge => {
          findPaths(edge.target, path, new Set(visited));
        });
      }
    };

    findPaths(startNode.id, [], new Set());

    const pathLengths = allPaths.map(p => p.length);
    const shortest = Math.min(...pathLengths);
    const longest = Math.max(...pathLengths);
    const average = pathLengths.reduce((a, b) => a + b, 0) / pathLengths.length;
    const criticalPath = allPaths.find(p => p.length === longest) || [];

    return {
      shortestPath: shortest,
      longestPath: longest,
      averagePath: Math.round(average * 10) / 10,
      criticalPath,
      parallelPaths: allPaths.length,
    };
  }, [nodes, edges]);

  // Calculate overall health score
  const healthScore = useMemo((): AnalysisResult => {
    let score = 100;
    const issues: string[] = [];

    // Check for orphan nodes
    const connectedNodes = new Set<string>();
    edges.forEach(e => {
      connectedNodes.add(e.source);
      connectedNodes.add(e.target);
    });
    const orphanCount = nodes.filter(n =>
      n.type !== 'startEnd' && !connectedNodes.has(n.id)
    ).length;
    if (orphanCount > 0) score -= orphanCount * 10;

    // Check for missing participants
    const unassignedParticipants = nodes.filter(n =>
      (n.type === 'aemStep' || n.type === 'participantChooser') && !n.data?.participant
    ).length;
    if (unassignedParticipants > 0) score -= unassignedParticipants * 5;

    // Check complexity
    if (complexityMetrics.cyclomaticComplexity > 10) score -= 15;
    else if (complexityMetrics.cyclomaticComplexity > 5) score -= 5;

    // Check branch paths
    const branchNodes = nodes.filter(n => n.type === 'branch');
    branchNodes.forEach(branch => {
      const outgoing = edges.filter(e => e.source === branch.id);
      if (outgoing.length < 2) score -= 10;
    });

    score = Math.max(0, Math.min(100, score));

    let level: AnalysisResult['level'];
    let color: string;

    if (score >= 90) { level = 'excellent'; color = '#10b981'; }
    else if (score >= 70) { level = 'good'; color = '#3b82f6'; }
    else if (score >= 50) { level = 'fair'; color = '#f59e0b'; }
    else { level = 'poor'; color = '#ef4444'; }

    return { score, level, color };
  }, [nodes, edges, complexityMetrics]);

  // Generate recommendations
  const recommendations = useMemo((): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Check for orphan nodes
    const connectedNodes = new Set<string>();
    edges.forEach(e => {
      connectedNodes.add(e.source);
      connectedNodes.add(e.target);
    });

    nodes.forEach(node => {
      if (node.type !== 'startEnd' && !connectedNodes.has(node.id)) {
        recs.push({
          type: 'warning',
          title: 'Orphan Node Detected',
          description: `"${node.data?.label}" is not connected to the workflow`,
          nodeId: node.id,
        });
      }

      if ((node.type === 'aemStep' || node.type === 'participantChooser') && !node.data?.participant) {
        recs.push({
          type: 'warning',
          title: 'Missing Participant',
          description: `"${node.data?.label}" has no assigned participant`,
          nodeId: node.id,
        });
      }

      if (node.type === 'branch') {
        const outgoing = edges.filter(e => e.source === node.id);
        if (outgoing.length < 2) {
          recs.push({
            type: 'warning',
            title: 'Incomplete Branch',
            description: `"${node.data?.label}" should have at least 2 outgoing paths`,
            nodeId: node.id,
          });
        }
      }
    });

    // Complexity recommendations
    if (complexityMetrics.cyclomaticComplexity > 10) {
      recs.push({
        type: 'suggestion',
        title: 'High Complexity',
        description: 'Consider breaking this workflow into sub-workflows using Call Workflow nodes',
      });
    }

    if (complexityMetrics.nestingDepth > 3) {
      recs.push({
        type: 'suggestion',
        title: 'Deep Nesting',
        description: 'Deeply nested branches can be hard to maintain. Consider flattening the structure.',
      });
    }

    if (complexityMetrics.participantCount === 0 && complexityMetrics.totalNodes > 2) {
      recs.push({
        type: 'info',
        title: 'Fully Automated',
        description: 'This workflow has no human touchpoints. Consider adding review steps for critical processes.',
      });
    }

    // Add best practice suggestions
    const hasTimeout = nodes.some(n => n.data?.timeout);
    if (!hasTimeout && complexityMetrics.participantCount > 0) {
      recs.push({
        type: 'suggestion',
        title: 'Add Timeouts',
        description: 'Consider adding timeout values to participant steps to prevent workflow stalls',
      });
    }

    const hasNotification = nodes.some(n => n.type === 'emailNotification');
    if (!hasNotification && complexityMetrics.participantCount > 2) {
      recs.push({
        type: 'info',
        title: 'Add Notifications',
        description: 'Email notifications help keep participants informed about workflow progress',
      });
    }

    return recs;
  }, [nodes, edges, complexityMetrics]);

  // Estimated execution time
  const estimatedTime = useMemo(() => {
    let totalMinutes = 0;
    nodes.forEach(node => {
      if (node.type === 'aemStep' || node.type === 'participantChooser') {
        totalMinutes += node.data?.timeout || 1440; // Default 24 hours
      } else if (node.type === 'processStep') {
        totalMinutes += 5; // Assume 5 minutes for automated steps
      }
    });

    if (totalMinutes < 60) return `${totalMinutes} minutes`;
    if (totalMinutes < 1440) return `${Math.round(totalMinutes / 60)} hours`;
    return `${Math.round(totalMinutes / 1440)} days`;
  }, [nodes]);

  const bgColor = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const secondaryText = darkMode ? '#94a3b8' : '#64748b';
  const cardBg = darkMode ? '#334155' : '#f8fafc';

  const nodeTypeColors: Record<string, string> = {
    aemStep: '#3b82f6',
    processStep: '#f59e0b',
    branch: '#8b5cf6',
    damUpdate: '#10b981',
    emailNotification: '#06b6d4',
    participantChooser: '#ec4899',
    graniteRouting: '#14b8a6',
    formsProcess: '#f97316',
    damMetadata: '#6366f1',
    damTranscode: '#f43f5e',
    callWorkflow: '#64748b',
    pageActivation: '#0ea5e9',
    startEnd: '#94a3b8',
  };

  const nodeTypeLabels: Record<string, string> = {
    aemStep: 'AEM Step',
    processStep: 'Process',
    branch: 'Branch',
    damUpdate: 'DAM Update',
    emailNotification: 'Email',
    participantChooser: 'Participant',
    graniteRouting: 'Routing',
    formsProcess: 'Forms',
    damMetadata: 'Metadata',
    damTranscode: 'Transcode',
    callWorkflow: 'Sub-Workflow',
    pageActivation: 'Activation',
    startEnd: 'Start/End',
  };

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
        maxWidth: '1100px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BarChart3 size={24} style={{ color: '#8b5cf6' }} />
            <h2 style={{ margin: 0, color: textColor, fontSize: '18px' }}>Workflow Analytics</h2>
          </div>
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

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Health Score */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px',
          }}>
            {/* Main Score Card */}
            <div style={{
              gridColumn: 'span 1',
              background: cardBg,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: `2px solid ${healthScore.color}20`,
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 12px',
                borderRadius: '50%',
                background: `${healthScore.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: healthScore.color,
                }}>
                  {healthScore.score}
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, textTransform: 'capitalize' }}>
                {healthScore.level}
              </div>
              <div style={{ fontSize: '12px', color: secondaryText, marginTop: '4px' }}>
                Health Score
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ background: cardBg, borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Layers size={18} style={{ color: '#3b82f6' }} />
                <span style={{ fontSize: '13px', color: secondaryText }}>Structure</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: textColor }}>{complexityMetrics.totalNodes}</div>
              <div style={{ fontSize: '12px', color: secondaryText }}>Total Nodes</div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#8b5cf6' }}>{complexityMetrics.branchCount}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Branches</div>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#10b981' }}>{edges.length}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Connections</div>
                </div>
              </div>
            </div>

            <div style={{ background: cardBg, borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Activity size={18} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '13px', color: secondaryText }}>Complexity</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: textColor }}>{complexityMetrics.cyclomaticComplexity}</div>
              <div style={{ fontSize: '12px', color: secondaryText }}>Cyclomatic</div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#ec4899' }}>{complexityMetrics.nestingDepth}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Max Depth</div>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#06b6d4' }}>{pathAnalysis.parallelPaths}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Paths</div>
                </div>
              </div>
            </div>

            <div style={{ background: cardBg, borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Clock size={18} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '13px', color: secondaryText }}>Timing</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: textColor }}>{estimatedTime}</div>
              <div style={{ fontSize: '12px', color: secondaryText }}>Est. Duration</div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#3b82f6' }}>{complexityMetrics.participantCount}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Human Steps</div>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#f59e0b' }}>{complexityMetrics.processCount}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Auto Steps</div>
                </div>
              </div>
            </div>
          </div>

          {/* Node Distribution & Path Analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Node Distribution */}
            <div style={{ background: cardBg, borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: textColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Network size={16} style={{ color: '#8b5cf6' }} />
                Node Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(nodeDistribution)
                  .filter(([type]) => type !== 'startEnd')
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const percentage = Math.round((count / complexityMetrics.totalNodes) * 100);
                    return (
                      <div key={type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: textColor }}>{nodeTypeLabels[type] || type}</span>
                          <span style={{ fontSize: '12px', color: secondaryText }}>{count} ({percentage}%)</span>
                        </div>
                        <div style={{
                          height: '8px',
                          background: darkMode ? '#475569' : '#e2e8f0',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: nodeTypeColors[type] || '#64748b',
                            borderRadius: '4px',
                          }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Path Analysis */}
            <div style={{ background: cardBg, borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: textColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitBranch size={16} style={{ color: '#8b5cf6' }} />
                Path Analysis
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{pathAnalysis.shortestPath}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Shortest Path</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>{pathAnalysis.averagePath}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Average Path</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>{pathAnalysis.longestPath}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Longest Path</div>
                </div>
              </div>

              {pathAnalysis.criticalPath.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '8px' }}>Critical Path:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                    {pathAnalysis.criticalPath.slice(0, 6).map((nodeId, index) => {
                      const node = nodes.find(n => n.id === nodeId);
                      return (
                        <React.Fragment key={nodeId}>
                          <span style={{
                            padding: '4px 8px',
                            background: darkMode ? '#475569' : '#e2e8f0',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: textColor,
                          }}>
                            {node?.data?.label || nodeId}
                          </span>
                          {index < Math.min(pathAnalysis.criticalPath.length - 1, 5) && (
                            <ArrowRight size={12} style={{ color: secondaryText }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                    {pathAnalysis.criticalPath.length > 6 && (
                      <span style={{ fontSize: '11px', color: secondaryText }}>
                        +{pathAnalysis.criticalPath.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ background: cardBg, borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: textColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={16} style={{ color: '#f59e0b' }} />
              Recommendations
              <span style={{
                background: recommendations.length > 0 ? '#f59e0b20' : '#10b98120',
                color: recommendations.length > 0 ? '#f59e0b' : '#10b981',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {recommendations.length} items
              </span>
            </h3>

            {recommendations.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                color: '#10b981',
              }}>
                <CheckCircle size={32} style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: 600 }}>Workflow looks great!</div>
                <div style={{ fontSize: '13px', color: secondaryText, marginTop: '4px' }}>
                  No issues or suggestions found
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: rec.type === 'warning' ? '#ef444410'
                        : rec.type === 'suggestion' ? '#f59e0b10'
                        : '#3b82f610',
                      border: `1px solid ${rec.type === 'warning' ? '#ef444430'
                        : rec.type === 'suggestion' ? '#f59e0b30'
                        : '#3b82f630'}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    {rec.type === 'warning' ? (
                      <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    ) : rec.type === 'suggestion' ? (
                      <Lightbulb size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <FileText size={18} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: textColor, marginBottom: '4px' }}>
                        {rec.title}
                      </div>
                      <div style={{ fontSize: '12px', color: secondaryText }}>
                        {rec.description}
                      </div>
                    </div>
                    {rec.nodeId && (
                      <span style={{
                        padding: '4px 8px',
                        background: darkMode ? '#475569' : '#e2e8f0',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: secondaryText,
                      }}>
                        Node
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '12px', color: secondaryText }}>
            Analysis generated at {new Date().toLocaleString()}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowAnalytics;
