"use client";

import { Code, RotateCcw, RotateCw, Play, Upload, Download } from "lucide-react";
import { useCanvasStore } from '@/stores/canvasStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { serializeWorkflow, deserializeWorkflow } from '@/lib/workflow-engine';
import type { WorkflowNode, WorkflowEdge } from '@/lib/types';

export function TopBar() {
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const toggleSandbox = useSimulationStore((s) => s.toggle);

  const handleExport = () => {
    const wfNodes: WorkflowNode[] = nodes.map((n) => ({
      id: n.id,
      type: (n.type || 'task') as WorkflowNode['type'],
      position: n.position,
      data: n.data as unknown as WorkflowNode['data'],
    }));
    const wfEdges: WorkflowEdge[] = edges.map((e) => ({
      id: e.id, source: e.source, target: e.target,
    }));
    const json = serializeWorkflow(wfNodes, wfEdges, 'My Workflow');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const { nodes: wfNodes, edges: wfEdges } = deserializeWorkflow(reader.result as string);
          setNodes(wfNodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data as unknown as Record<string, unknown>,
          })));
          setEdges(wfEdges.map((e) => ({
            id: e.id, source: e.source, target: e.target,
          })));
        } catch {
          alert('Invalid workflow JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <header className="h-[var(--toolbar-height)] border-b border-[var(--border-default)] bg-[var(--surface-primary)] flex items-center justify-between px-5 z-10 shadow-sm shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-[var(--color-brand-600)] text-white p-1.5 rounded-md">
          <Code size={16} />
        </div>
        <span className="font-semibold text-[15px] text-[var(--text-primary)]">CodeAuto</span>
      </div>

      {/* Title */}
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium">HR Workflow Designer</span>
        <span className="text-[11px] text-[var(--text-tertiary)]">Drag nodes from sidebar to begin</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button onClick={undo} className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Undo (Ctrl+Z)">
          <RotateCcw size={15} />
        </button>
        <button onClick={redo} className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Redo (Ctrl+Shift+Z)">
          <RotateCw size={15} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button onClick={handleImport} className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Import JSON">
          <Upload size={15} />
        </button>
        <button onClick={handleExport} className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Export JSON">
          <Download size={15} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button onClick={toggleSandbox} className="flex items-center gap-1.5 text-xs font-medium bg-[var(--color-brand-600)] text-white px-3 py-1.5 rounded-md hover:bg-[var(--color-brand-500)] transition-colors cursor-pointer">
          <Play size={13} fill="currentColor" />
          Simulate
        </button>
      </div>
    </header>
  );
}
