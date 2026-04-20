"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  SelectionMode,
  type Node,
  type OnSelectionChangeParams,
  type ReactFlowInstance,
} from '@xyflow/react';

import { useCanvasStore } from '@/stores/canvasStore';
import { StartNode } from './nodes/StartNode';
import { TaskNode } from './nodes/TaskNode';
import { ApprovalNode } from './nodes/ApprovalNode';
import { DecisionNode } from './nodes/DecisionNode';
import { AutomatedStepNode } from './nodes/AutomatedStepNode';
import { EndNode } from './nodes/EndNode';
import { MoveRight, MousePointer2, ScanSearch } from 'lucide-react';

let nodeIdCounter = 0;

const NODE_TYPES = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  decision: DecisionNode,
  automated_step: AutomatedStepNode,
  end: EndNode,
};

export function FlowCanvas() {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const addNode = useCanvasStore((s) => s.addNode);
  const selectNode = useCanvasStore((s) => s.selectNode);
  const setSelectedNodes = useCanvasStore((s) => s.setSelectedNodes);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const copySelected = useCanvasStore((s) => s.copySelected);
  const pasteClipboard = useCanvasStore((s) => s.pasteClipboard);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
  }, [selectNode]);

  const onMiniMapNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    if (reactFlowInstance) {
      // Offset by roughly half the node width/height so it actually centers
      reactFlowInstance.setCenter(node.position.x + 100, node.position.y + 40, { duration: 800, zoom: 1.2 });
      selectNode(node.id);
    }
  }, [reactFlowInstance, selectNode]);

  const nodeColor = (node: Node) => {
    switch (node.type) {
      case 'start': return '#3B82F6';
      case 'task': return '#F97316';
      case 'approval': return '#8B5CF6';
      case 'decision': return '#0EA5A4';
      case 'automated_step': return '#EC4899';
      case 'end': return '#EF4444';
      default: return '#E4E4E7';
    }
  };

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const onSelectionChange = useCallback(({ nodes: selectedNodes }: OnSelectionChangeParams) => {
    setSelectedNodes(selectedNodes.map((node) => node.id));
  }, [setSelectedNodes]);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const isModifierPressed = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (isModifierPressed && key === 'c') {
        e.preventDefault();
        copySelected();
        return;
      }

      if (isModifierPressed && key === 'v') {
        e.preventDefault();
        pasteClipboard();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelected, deleteSelected, pasteClipboard]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
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
    if (type === 'decision') {
      defaultData.condition = 'Does this request meet the rule?';
      defaultData.trueLabel = 'Yes';
      defaultData.falseLabel = 'No';
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
      {nodes.length === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[5] w-[420px] -translate-x-1/2 -translate-y-1/2">
          <div className="panel-card px-6 py-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-secondary)] text-[var(--color-brand-500)]">
              <ScanSearch size={20} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-[var(--text-primary)]">Start your workflow on the canvas</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Drag a Start node from the palette, then add tasks and approvals as the process expands.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-left">
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                  <MousePointer2 size={13} className="text-[var(--color-brand-500)]" />
                  Multi-select
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">Click and drag on empty space.</p>
              </div>
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                  <MoveRight size={13} className="text-[var(--color-brand-500)]" />
                  Connect
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">Drag between node handles to create flow.</p>
              </div>
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                  <ScanSearch size={13} className="text-[var(--color-brand-500)]" />
                  Navigate
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">Use two-finger pan to move around.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={setReactFlowInstance}
        defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={NODE_TYPES}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        panOnDrag={false}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        zoomOnScroll={false}
        fitView
        deleteKeyCode={null}
        className="bg-[var(--canvas-bg)]"
      >
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeStrokeWidth={3}
          nodeColor={nodeColor}
          onNodeClick={onMiniMapNodeClick}
          pannable
          zoomable
          className="!bg-[var(--surface-panel)] !border !border-[var(--border-default)] !rounded-2xl"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--canvas-dot-color)" />
      </ReactFlow>
    </div>
  );
}
