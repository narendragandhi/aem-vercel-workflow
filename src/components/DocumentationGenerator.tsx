/**
 * Documentation Generator Component
 *
 * Generates comprehensive documentation for workflows including:
 * - Step-by-step guides
 * - Participant responsibilities
 * - Process handlers
 * - Flow diagrams
 * - Printable format
 */

import React, { useState, useMemo, useRef } from 'react';
import { Node, Edge } from '@reactflow/core';
import {
  FileText, Download, Copy, Printer, X, Eye, Code,
  Users, GitBranch, Clock, Mail, Settings, CheckCircle,
  ChevronDown, ChevronRight, Layers
} from 'lucide-react';
import { exportToMarkdown, generateMermaidDiagram, downloadFile } from '../utils/exporters';

interface DocumentationGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  darkMode?: boolean;
}

type DocSection = 'overview' | 'steps' | 'participants' | 'diagram' | 'technical';

export const DocumentationGenerator: React.FC<DocumentationGeneratorProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  darkMode = false,
}) => {
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [author, setAuthor] = useState('AEMFlow User');
  const [expandedSections, setExpandedSections] = useState<DocSection[]>(['overview', 'steps']);
  const [previewMode, setPreviewMode] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Calculate workflow statistics
  const stats = useMemo(() => {
    const workflowNodes = nodes.filter(n => n.type !== 'startEnd');
    const branchCount = nodes.filter(n => n.type === 'branch').length;
    const participantSteps = nodes.filter(n =>
      n.type === 'aemStep' || n.type === 'participantChooser'
    );
    const processSteps = nodes.filter(n =>
      n.type === 'processStep' || n.type === 'damUpdate' || n.type === 'damMetadata'
    );

    // Collect unique participants
    const participants = new Set<string>();
    nodes.forEach(n => {
      if (n.data?.participant) participants.add(n.data.participant);
    });

    return {
      totalSteps: workflowNodes.length,
      branchCount,
      humanTasks: participantSteps.length,
      automatedTasks: processSteps.length,
      participants: Array.from(participants),
      connectionCount: edges.length,
    };
  }, [nodes, edges]);

  // Group nodes by participant
  const participantGroups = useMemo(() => {
    const groups: Record<string, Node[]> = {};

    nodes.forEach(node => {
      if (node.data?.participant) {
        if (!groups[node.data.participant]) {
          groups[node.data.participant] = [];
        }
        groups[node.data.participant].push(node);
      }
    });

    return groups;
  }, [nodes]);

  // Build step sequence
  const stepSequence = useMemo(() => {
    const sequence: Node[] = [];
    const visited = new Set<string>();
    const startNode = nodes.find(n => n.type === 'startEnd' && n.data?.isStart);

    if (!startNode) return sequence;

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (node && node.type !== 'startEnd') {
        sequence.push(node);
      }

      const outgoing = edges.filter(e => e.source === nodeId);
      outgoing.forEach(edge => traverse(edge.target));
    };

    traverse(startNode.id);
    return sequence;
  }, [nodes, edges]);

  // Toggle section expansion
  const toggleSection = (section: DocSection) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Generate and download documentation
  const handleDownload = (format: 'md' | 'html' | 'txt') => {
    const markdown = exportToMarkdown(nodes, edges, {
      workflowName,
      workflowDescription,
      author,
    });

    if (format === 'md') {
      downloadFile(markdown, `${workflowName.replace(/\s+/g, '-')}-docs.md`, 'text/markdown');
    } else if (format === 'html') {
      const html = convertMarkdownToHTML(markdown);
      downloadFile(html, `${workflowName.replace(/\s+/g, '-')}-docs.html`, 'text/html');
    } else {
      // Plain text (strip markdown formatting)
      const plainText = markdown
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\|/g, ' ')
        .replace(/```[\s\S]*?```/g, '[Diagram]');
      downloadFile(plainText, `${workflowName.replace(/\s+/g, '-')}-docs.txt`, 'text/plain');
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    const markdown = exportToMarkdown(nodes, edges, {
      workflowName,
      workflowDescription,
      author,
    });
    navigator.clipboard.writeText(markdown);
    alert('Documentation copied to clipboard!');
  };

  // Print preview
  const handlePrint = () => {
    if (previewRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${workflowName} - Documentation</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
                h2 { color: #334155; margin-top: 32px; }
                h3 { color: #475569; }
                table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
                th { background: #f8fafc; }
                .step { background: #f8fafc; padding: 16px; margin: 12px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
                .step-number { background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 8px; }
                @media print { body { padding: 20px; } }
              </style>
            </head>
            <body>
              ${previewRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!isOpen) return null;

  const bgColor = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const secondaryText = darkMode ? '#94a3b8' : '#64748b';
  const cardBg = darkMode ? '#334155' : '#f8fafc';

  const nodeTypeLabels: Record<string, string> = {
    aemStep: 'Participant Step',
    processStep: 'Automated Process',
    branch: 'Decision Point',
    emailNotification: 'Email Notification',
    damUpdate: 'DAM Update',
    damMetadata: 'Metadata Update',
    damTranscode: 'Media Transcoding',
    formsProcess: 'Form Processing',
    pageActivation: 'Page Publishing',
    callWorkflow: 'Sub-Workflow',
    participantChooser: 'Dynamic Assignment',
    graniteRouting: 'Routing',
  };

  return (
    <div
      style={{
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
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: bgColor,
          borderRadius: '16px',
          width: '95%',
          maxWidth: '1000px',
          height: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={24} style={{ color: '#8b5cf6' }} />
            <h2 style={{ margin: 0, color: textColor, fontSize: '18px' }}>Documentation Generator</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              style={{
                padding: '8px 16px',
                background: previewMode ? '#8b5cf6' : (darkMode ? '#475569' : '#e2e8f0'),
                color: previewMode ? 'white' : textColor,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Eye size={14} /> Preview
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: textColor,
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Settings Panel */}
          <div style={{
            width: '300px',
            borderRight: `1px solid ${borderColor}`,
            padding: '20px',
            overflowY: 'auto',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: textColor }}>
              Document Settings
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: secondaryText, marginBottom: '6px' }}>
                Workflow Name
              </label>
              <input
                type="text"
                value={workflowName}
                onChange={e => setWorkflowName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: cardBg,
                  color: textColor,
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: secondaryText, marginBottom: '6px' }}>
                Description
              </label>
              <textarea
                value={workflowDescription}
                onChange={e => setWorkflowDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: cardBg,
                  color: textColor,
                  resize: 'vertical',
                }}
                placeholder="Describe the purpose of this workflow..."
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: secondaryText, marginBottom: '6px' }}>
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: cardBg,
                  color: textColor,
                }}
              />
            </div>

            <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: textColor }}>
              Quick Stats
            </h3>
            <div style={{ background: cardBg, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>{stats.totalSteps}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Total Steps</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#8b5cf6' }}>{stats.branchCount}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Decisions</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{stats.humanTasks}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Human Tasks</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>{stats.automatedTasks}</div>
                  <div style={{ fontSize: '11px', color: secondaryText }}>Automated</div>
                </div>
              </div>
            </div>

            <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: textColor }}>
              Export Options
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleDownload('md')}
                style={{
                  padding: '10px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Download size={14} /> Download Markdown
              </button>
              <button
                onClick={() => handleDownload('html')}
                style={{
                  padding: '10px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Code size={14} /> Download HTML
              </button>
              <button
                onClick={handleCopy}
                style={{
                  padding: '10px 16px',
                  background: darkMode ? '#475569' : '#e2e8f0',
                  color: textColor,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Copy size={14} /> Copy to Clipboard
              </button>
              <button
                onClick={handlePrint}
                style={{
                  padding: '10px 16px',
                  background: darkMode ? '#475569' : '#e2e8f0',
                  color: textColor,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Printer size={14} /> Print
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div
            ref={previewRef}
            style={{
              flex: 1,
              padding: '32px',
              overflowY: 'auto',
              background: previewMode ? 'white' : bgColor,
              color: previewMode ? '#1e293b' : textColor,
            }}
          >
            {/* Title */}
            <h1 style={{
              margin: '0 0 8px',
              fontSize: '28px',
              fontWeight: 700,
              borderBottom: `2px solid ${previewMode ? '#e2e8f0' : borderColor}`,
              paddingBottom: '16px',
            }}>
              {workflowName}
            </h1>
            {workflowDescription && (
              <p style={{ margin: '0 0 24px', fontSize: '16px', color: previewMode ? '#64748b' : secondaryText }}>
                {workflowDescription}
              </p>
            )}

            {/* Overview Section */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={() => toggleSection('overview')}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: previewMode ? '#1e293b' : textColor,
                }}
              >
                {expandedSections.includes('overview') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                Overview
              </button>
              {expandedSections.includes('overview') && (
                <div style={{ paddingLeft: '28px' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '12px',
                  }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}`, fontWeight: 500 }}>Total Steps</td>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}` }}>{stats.totalSteps}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}`, fontWeight: 500 }}>Decision Points</td>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}` }}>{stats.branchCount}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}`, fontWeight: 500 }}>Human Tasks</td>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}` }}>{stats.humanTasks}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}`, fontWeight: 500 }}>Automated Tasks</td>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}` }}>{stats.automatedTasks}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}`, fontWeight: 500 }}>Participants</td>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}` }}>{stats.participants.join(', ') || 'None assigned'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}`, fontWeight: 500 }}>Author</td>
                        <td style={{ padding: '8px 12px', border: `1px solid ${previewMode ? '#e2e8f0' : borderColor}` }}>{author}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Steps Section */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={() => toggleSection('steps')}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: previewMode ? '#1e293b' : textColor,
                }}
              >
                {expandedSections.includes('steps') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                Workflow Steps
              </button>
              {expandedSections.includes('steps') && (
                <div style={{ paddingLeft: '28px' }}>
                  {stepSequence.map((node, index) => (
                    <div
                      key={node.id}
                      style={{
                        background: previewMode ? '#f8fafc' : cardBg,
                        padding: '16px',
                        marginTop: '12px',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${
                          node.type === 'branch' ? '#8b5cf6' :
                          node.type === 'aemStep' ? '#3b82f6' :
                          '#f59e0b'
                        }`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          {index + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
                          {node.data?.label || node.id}
                        </h4>
                        <span style={{
                          padding: '2px 8px',
                          background: previewMode ? '#e2e8f0' : (darkMode ? '#475569' : '#e2e8f0'),
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: previewMode ? '#64748b' : secondaryText,
                        }}>
                          {nodeTypeLabels[node.type || ''] || node.type}
                        </span>
                      </div>
                      {node.data?.description && (
                        <p style={{ margin: '0 0 8px', fontSize: '13px', color: previewMode ? '#64748b' : secondaryText }}>
                          {node.data.description}
                        </p>
                      )}
                      {node.data?.participant && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                          <Users size={12} />
                          <span>Assigned to: <strong>{node.data.participant}</strong></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Participants Section */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={() => toggleSection('participants')}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: previewMode ? '#1e293b' : textColor,
                }}
              >
                {expandedSections.includes('participants') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                Participants & Responsibilities
              </button>
              {expandedSections.includes('participants') && (
                <div style={{ paddingLeft: '28px', marginTop: '12px' }}>
                  {Object.keys(participantGroups).length === 0 ? (
                    <p style={{ color: previewMode ? '#64748b' : secondaryText, fontStyle: 'italic' }}>
                      No participants assigned to this workflow.
                    </p>
                  ) : (
                    Object.entries(participantGroups).map(([participant, participantNodes]) => (
                      <div key={participant} style={{ marginBottom: '16px' }}>
                        <h4 style={{
                          margin: '0 0 8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <Users size={16} style={{ color: '#3b82f6' }} />
                          {participant}
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '24px' }}>
                          {participantNodes.map(node => (
                            <li key={node.id} style={{ marginBottom: '4px', fontSize: '13px' }}>
                              {node.data?.label}
                              {node.data?.description && (
                                <span style={{ color: previewMode ? '#94a3b8' : secondaryText }}>
                                  {' '}- {node.data.description}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '32px',
              paddingTop: '16px',
              borderTop: `1px solid ${previewMode ? '#e2e8f0' : borderColor}`,
              fontSize: '12px',
              color: previewMode ? '#94a3b8' : secondaryText,
              textAlign: 'center',
            }}>
              Documentation generated by AEMFlow • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: Convert Markdown to basic HTML
const convertMarkdownToHTML = (markdown: string): string => {
  let html = markdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

  // Handle tables
  const tableRegex = /\|(.+)\|\n\|[-|]+\|\n((?:\|.+\|\n?)+)/g;
  html = html.replace(tableRegex, (match, header, body) => {
    const headerCells = header.split('|').filter(Boolean).map((cell: string) => `<th>${cell.trim()}</th>`).join('');
    const bodyRows = body.split('\n').filter(Boolean).map((row: string) => {
      const cells = row.split('|').filter(Boolean).map((cell: string) => `<td>${cell.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Workflow Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; }
    h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
    h2 { color: #334155; margin-top: 32px; }
    h3 { color: #475569; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 32px 0; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
};

export default DocumentationGenerator;
