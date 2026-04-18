"use client";

import { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomNode } from './nodes/CustomNode';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: { label: 'Initialize Data', description: 'Initializing for Automation', nodeType: 'start' },
    position: { x: 250, y: 50 },
  },
  {
    id: '2',
    type: 'custom',
    data: { 
      label: 'Data Collection', 
      description: 'Gathering Data Connected', 
      nodeType: 'task',
      stats: [11, 27, 41, 72]
    },
    position: { x: 100, y: 150 },
  },
  {
    id: '3',
    type: 'custom',
    data: { label: 'User Initializing', description: 'Initializing for Automation', nodeType: 'start' },
    position: { x: 400, y: 50 },
  },
  {
    id: '4',
    type: 'custom',
    data: { 
      label: 'Execute Triggered', 
      description: 'Workflows on Triggers', 
      nodeType: 'automated_step',
    },
    position: { x: 400, y: 150 },
  },
  {
    id: '5',
    type: 'custom',
    data: { 
      label: 'Setup Automation', 
      description: 'Triggered Actions', 
      nodeType: 'approval',
      stats: [11, 27, 41, 72]
    },
    position: { x: 700, y: 150 },
  },
  {
    id: '6',
    type: 'custom',
    data: { 
      label: 'Data Validation', 
      description: 'Ensuring Data Accuracy', 
      nodeType: 'task',
      stats: [91, 18, 20, 21]
    },
    position: { x: 400, y: 250 },
  },
  {
    id: '7',
    type: 'custom',
    data: { 
      label: 'Direct Processing', 
      description: 'Direct Actions', 
      nodeType: 'start'
    },
    position: { x: 50, y: 400 },
  },
  {
    id: '8',
    type: 'custom',
    data: { 
      label: 'Combine Results', 
      description: '', 
      nodeType: 'task'
    },
    position: { x: 200, y: 350 },
  },
  {
    id: '9',
    type: 'custom',
    data: { 
      label: 'Action Trigger', 
      description: 'Performing Tasks Conditions', 
      nodeType: 'task',
      stats: [87, 34, 17, 18]
    },
    position: { x: 400, y: 400 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-6', source: '2', target: '6', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#f59e0b' } },
  { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: '#10b981' } },
  { id: 'e5-6', source: '5', target: '6', style: { stroke: '#8b5cf6' } },
  { id: 'e6-9', source: '6', target: '9' },
  { id: 'e7-10', source: '7', target: '10', animated: true, style: { stroke: '#06b6d4' } },
  { id: 'e8-9', source: '8', target: '9', style: { stroke: '#8b5cf6' } },
];

export function FlowCanvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds));

  // use memo to avoid re-rendering
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[var(--canvas-bg)]"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
