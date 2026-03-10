/**
 * Unit Tests for Workflow Export Utilities
 *
 * Tests the export and import functionality for various formats:
 * - AEM XML
 * - JSON
 * - YAML
 * - Markdown
 * - Mermaid diagrams
 *
 * @module tests/utils/exporters
 */

import {
  exportToAEMXML,
  exportToJSON,
  exportToYAML,
  exportToMarkdown,
  generateMermaidDiagram,
  importFromJSON,
  importFromYAML,
  downloadFile,
} from '../../src/utils/exporters';
import type { Node, Edge } from '@reactflow/core';

// Sample test data
const createSampleNodes = (): Node[] => [
  {
    id: 'start-1',
    type: 'startEnd',
    position: { x: 100, y: 100 },
    data: { label: 'Start', isStart: true },
  },
  {
    id: 'step-1',
    type: 'aemStep',
    position: { x: 100, y: 200 },
    data: {
      label: 'Review Content',
      description: 'Content review by editor',
      participant: 'content-authors',
      timeout: 48,
    },
  },
  {
    id: 'branch-1',
    type: 'branch',
    position: { x: 100, y: 300 },
    data: { label: 'Approved?' },
  },
  {
    id: 'end-1',
    type: 'startEnd',
    position: { x: 100, y: 400 },
    data: { label: 'End', isStart: false },
  },
];

const createSampleEdges = (): Edge[] => [
  {
    id: 'e1',
    source: 'start-1',
    target: 'step-1',
  },
  {
    id: 'e2',
    source: 'step-1',
    target: 'branch-1',
  },
  {
    id: 'e3',
    source: 'branch-1',
    target: 'end-1',
    label: 'Yes',
    sourceHandle: 'yes',
  },
];

describe('exportToAEMXML', () => {
  const nodes = createSampleNodes();
  const edges = createSampleEdges();

  it('should generate valid XML with default options', () => {
    const xml = exportToAEMXML(nodes, edges);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('jcr:primaryType="cq:Page"');
    expect(xml).toContain('xmlns:sling="http://sling.apache.org/jcr/sling/1.0"');
  });

  it('should include workflow name in XML', () => {
    const xml = exportToAEMXML(nodes, edges, {
      workflowName: 'Content Approval',
    });

    expect(xml).toContain('jcr:title="Content Approval"');
  });

  it('should include workflow description', () => {
    const xml = exportToAEMXML(nodes, edges, {
      workflowDescription: 'Multi-level review process',
    });

    expect(xml).toContain('description="Multi-level review process"');
  });

  it('should handle empty nodes array', () => {
    const xml = exportToAEMXML([], []);

    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<nodes jcr:primaryType="nt:unstructured">');
  });

  it('should escape XML special characters', () => {
    const nodesWithSpecialChars: Node[] = [
      {
        id: 'test',
        type: 'aemStep',
        position: { x: 0, y: 0 },
        data: { label: 'Test <with> "special" & \'chars\'' },
      },
    ];

    const xml = exportToAEMXML(nodesWithSpecialChars, []);

    expect(xml).toContain('&lt;');
    expect(xml).toContain('&gt;');
    expect(xml).toContain('&quot;');
    expect(xml).toContain('&amp;');
  });

  it('should include transitions for edges', () => {
    const xml = exportToAEMXML(nodes, edges);

    expect(xml).toContain('<transitions jcr:primaryType="nt:unstructured">');
  });
});

describe('exportToJSON', () => {
  const nodes = createSampleNodes();
  const edges = createSampleEdges();

  it('should generate valid JSON with default options', () => {
    const json = exportToJSON(nodes, edges);
    const parsed = JSON.parse(json);

    expect(parsed.version).toBe('1.0');
    expect(parsed.format).toBe('aemflow-json');
    expect(parsed.nodes).toHaveLength(4);
    expect(parsed.edges).toHaveLength(3);
  });

  it('should include metadata when requested', () => {
    const json = exportToJSON(nodes, edges, {
      includeMetadata: true,
      workflowName: 'Test Workflow',
      author: 'Test Author',
    });
    const parsed = JSON.parse(json);

    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.name).toBe('Test Workflow');
    expect(parsed.metadata.author).toBe('Test Author');
    expect(parsed.metadata.nodeCount).toBe(4);
    expect(parsed.metadata.edgeCount).toBe(3);
  });

  it('should include positions when requested', () => {
    const json = exportToJSON(nodes, edges, { includePositions: true });
    const parsed = JSON.parse(json);

    expect(parsed.nodes[0].position).toEqual({ x: 100, y: 100 });
  });

  it('should exclude positions when not requested', () => {
    const json = exportToJSON(nodes, edges, { includePositions: false });
    const parsed = JSON.parse(json);

    expect(parsed.nodes[0].position).toBeUndefined();
  });

  it('should pretty print when requested', () => {
    const prettyJson = exportToJSON(nodes, edges, { prettyPrint: true });
    const compactJson = exportToJSON(nodes, edges, { prettyPrint: false });

    expect(prettyJson.length).toBeGreaterThan(compactJson.length);
    expect(prettyJson).toContain('\n');
  });
});

describe('exportToYAML', () => {
  const nodes = createSampleNodes();
  const edges = createSampleEdges();

  it('should generate valid YAML', () => {
    const yaml = exportToYAML(nodes, edges);

    expect(yaml).toContain('version: "1.0"');
    expect(yaml).toContain('format: aemflow-yaml');
    expect(yaml).toContain('nodes:');
    expect(yaml).toContain('edges:');
  });

  it('should include metadata when requested', () => {
    const yaml = exportToYAML(nodes, edges, {
      includeMetadata: true,
      workflowName: 'Test Workflow',
    });

    expect(yaml).toContain('metadata:');
    expect(yaml).toContain('name: "Test Workflow"');
  });

  it('should include node data', () => {
    const yaml = exportToYAML(nodes, edges);

    expect(yaml).toContain('id: "start-1"');
    expect(yaml).toContain('type: startEnd');
    expect(yaml).toContain('label: "Start"');
  });

  it('should include edge connections', () => {
    const yaml = exportToYAML(nodes, edges);

    expect(yaml).toContain('source: "start-1"');
    expect(yaml).toContain('target: "step-1"');
  });

  it('should include positions when requested', () => {
    const yaml = exportToYAML(nodes, edges, { includePositions: true });

    expect(yaml).toContain('position:');
    expect(yaml).toContain('x: 100');
    expect(yaml).toContain('y: 100');
  });
});

describe('exportToMarkdown', () => {
  const nodes = createSampleNodes();
  const edges = createSampleEdges();

  it('should generate valid Markdown', () => {
    const md = exportToMarkdown(nodes, edges, {
      workflowName: 'Content Approval',
    });

    expect(md).toContain('# Content Approval');
    expect(md).toContain('## Overview');
    expect(md).toContain('## Workflow Steps');
  });

  it('should include statistics table', () => {
    const md = exportToMarkdown(nodes, edges);

    expect(md).toContain('| Metric | Value |');
    expect(md).toContain('| Total Steps |');
    expect(md).toContain('| Decision Points |');
  });

  it('should include Mermaid diagram', () => {
    const md = exportToMarkdown(nodes, edges);

    expect(md).toContain('```mermaid');
    expect(md).toContain('flowchart TD');
    expect(md).toContain('```');
  });

  it('should include participants section', () => {
    const md = exportToMarkdown(nodes, edges);

    expect(md).toContain('## Participants');
  });

  it('should group steps by type', () => {
    const md = exportToMarkdown(nodes, edges);

    expect(md).toContain('### Participant Steps');
    expect(md).toContain('### Decision Points');
  });
});

describe('generateMermaidDiagram', () => {
  const nodes = createSampleNodes();
  const edges = createSampleEdges();

  it('should generate valid Mermaid syntax', () => {
    const mermaid = generateMermaidDiagram(nodes, edges);

    expect(mermaid).toContain('flowchart TD');
  });

  it('should use circle for start nodes', () => {
    const mermaid = generateMermaidDiagram(nodes, edges);

    expect(mermaid).toMatch(/start_1\(\(Start\)\)/);
  });

  it('should use double circle for end nodes', () => {
    const mermaid = generateMermaidDiagram(nodes, edges);

    expect(mermaid).toMatch(/end_1\(\(\(End\)\)\)/);
  });

  it('should use diamond for branch nodes', () => {
    const mermaid = generateMermaidDiagram(nodes, edges);

    expect(mermaid).toMatch(/branch_1\{Approved\?\}/);
  });

  it('should include edge labels', () => {
    const mermaid = generateMermaidDiagram(nodes, edges);

    expect(mermaid).toContain('-->|Yes|');
  });

  it('should include styling classes', () => {
    const mermaid = generateMermaidDiagram(nodes, edges);

    expect(mermaid).toContain('classDef startEnd');
    expect(mermaid).toContain('classDef branch');
  });
});

describe('importFromJSON', () => {
  it('should import valid AEMFlow JSON', () => {
    const json = JSON.stringify({
      version: '1.0',
      format: 'aemflow-json',
      nodes: [
        { id: 'test-1', type: 'aemStep', data: { label: 'Test' } },
      ],
      edges: [
        { id: 'e1', source: 'test-1', target: 'test-2' },
      ],
    });

    const { nodes, edges } = importFromJSON(json);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('test-1');
    expect(nodes[0].draggable).toBe(true);
    expect(edges).toHaveLength(1);
  });

  it('should throw error for invalid format', () => {
    const json = JSON.stringify({
      format: 'invalid-format',
      nodes: [],
      edges: [],
    });

    expect(() => importFromJSON(json)).toThrow('Invalid AEMFlow JSON format');
  });

  it('should throw error for invalid JSON', () => {
    expect(() => importFromJSON('not valid json')).toThrow();
  });
});

describe('importFromYAML', () => {
  it('should import valid AEMFlow YAML', () => {
    const yaml = `
nodes:
  - id: "test-1"
    type: aemStep
    label: "Test Step"
edges:
  - id: "e1"
    source: "test-1"
    target: "test-2"
`;

    const { nodes, edges } = importFromYAML(yaml);

    expect(nodes.length).toBeGreaterThan(0);
    expect(edges.length).toBeGreaterThan(0);
  });

  it('should handle empty YAML', () => {
    const yaml = `
nodes:
edges:
`;

    const { nodes, edges } = importFromYAML(yaml);

    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });
});

describe('downloadFile', () => {
  it('should create and trigger download', () => {
    // Mock document methods
    const mockClick = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
    };

    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

    downloadFile('test content', 'test.txt', 'text/plain');

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.download).toBe('test.txt');
    expect(mockClick).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
