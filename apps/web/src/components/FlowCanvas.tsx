"use client";

import { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
} from '@xyflow/react';

import { useCanvasStore } from '@/stores/canvasStore';
import { StartNode } from './nodes/StartNode';
import { TaskNode } from './nodes/TaskNode';
import { ApprovalNode } from './nodes/ApprovalNode';
import { AutomatedStepNode } from './nodes/AutomatedStepNode';
import { EndNode } from './nodes/EndNode';

let nodeIdCounter = 0;

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const addNode = useCanvasStore((s) => s.addNode);
  const selectNode = useCanvasStore((s) => s.selectNode);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);

  const nodeTypes = useMemo(() => ({
    start: StartNode,
    task: TaskNode,
    approval: ApprovalNode,
    automated_step: AutomatedStepNode,
    end: EndNode,
  }), []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
  }, [selectNode]);

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteSelected();
    }
  }, [deleteSelected]);

  // Drop handler for drag-and-drop from sidebar
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    const position = {
      x: e.clientX - bounds.left - 100,
      y: e.clientY - bounds.top - 25,
    };

    const id = `${type}-${Date.now()}-${++nodeIdCounter}`;
    const defaultData: Record<string, unknown> = {
      title: `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}`,
    };

    if (type === 'approval') {
      defaultData.approverRole = 'Manager';
    }
    if (type === 'end') {
      defaultData.endMessage = 'Workflow Complete';
      defaultData.summaryFlag = false;
      delete defaultData.title;
    }
    if (type === 'automated_step') {
      defaultData.actionId = '';
      defaultData.actionParams = {};
    }

    addNode({ id, type, position, data: defaultData });
  }, [addNode]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full" onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={null}
        className="bg-[var(--canvas-bg)]"
      >
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeStrokeWidth={3}
          pannable
          zoomable
          className="!bg-white !border !border-gray-200 !rounded-lg !shadow-sm"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(0,0,0,0.07)" />
      </ReactFlow>
    </div>
  );
}
