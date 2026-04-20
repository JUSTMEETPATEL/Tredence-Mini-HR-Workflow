"use client";

import { useState } from "react";
import { RotateCcw, RotateCw, Play, Upload, Download, LayoutGrid, ShieldCheck, Save, X, Link as LinkIcon, Sun, Moon, Laptop } from "lucide-react";
import { useCanvasStore } from '@/stores/canvasStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { serializeWorkflow, deserializeWorkflow } from '@/lib/workflow-engine';
import type { WorkflowNode, WorkflowEdge } from '@/lib/types';
import { useTheme, type ThemeMode } from './providers/ThemeProvider';

const WORKFLOW_TYPES = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'offboarding', label: 'Offboarding' },
  { value: 'leave-request', label: 'Leave Request' },
  { value: 'expense', label: 'Expense Approval' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'custom', label: 'Custom' },
];

export function TopBar() {
  const { mode, setMode } = useTheme();
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const currentWorkflowId = useCanvasStore((s) => s.currentWorkflowId);
  const savedWorkflows = useCanvasStore((s) => s.savedWorkflows);
  const toggleSandbox = useSimulationStore((s) => s.toggle);
  const applyAutoLayout = useCanvasStore((s) => s.applyAutoLayout);
  const autoConnectNodes = useCanvasStore((s) => s.autoConnectNodes);
  const runValidation = useCanvasStore((s) => s.runValidation);
  const validationErrors = useCanvasStore((s) => s.validationErrors);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveType, setSaveType] = useState('custom');

  // Find current workflow name for display
  const currentWf = savedWorkflows.find(wf => wf.id === currentWorkflowId);
  const displayTitle = currentWf?.name || (nodes.length > 0 ? 'Unsaved Workflow' : 'HR Workflow Designer');

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
    const json = serializeWorkflow(wfNodes, wfEdges, displayTitle);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${displayTitle.replace(/\s+/g, '-').toLowerCase()}.json`;
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

  const handleSaveClick = () => {
    if (nodes.length === 0) return;
    // If already named, just re-save
    if (currentWorkflowId && currentWf) {
      useCanvasStore.getState().saveWorkflow(currentWf.name, currentWf.type);
    } else {
      setSaveName('');
      setSaveType('custom');
      setShowSaveModal(true);
    }
  };

  const handleSaveSubmit = () => {
    const trimmed = saveName.trim();
    if (!trimmed) return;
    useCanvasStore.getState().saveWorkflow(trimmed, saveType);
    setShowSaveModal(false);
  };

  const themeOptions: Array<{ mode: ThemeMode; label: string; icon: typeof Laptop }> = [
    { mode: 'system', label: 'System theme', icon: Laptop },
    { mode: 'light', label: 'Light theme', icon: Sun },
    { mode: 'dark', label: 'Dark theme', icon: Moon },
  ];

  return (
    <>
      <header className="h-[var(--toolbar-height)] border-b border-[var(--border-default)] bg-[var(--surface-primary)] flex items-center justify-between px-5 z-10 shadow-sm shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="FlowForge Logo" className="w-7 h-7 object-contain rounded-md bg-[var(--surface-primary)] shadow-sm" />
          <span className="font-semibold text-[16px] font-heading text-[var(--color-brand-600)]">FlowForge</span>
        </div>

        {/* Title — shows current workflow name */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium">{displayTitle}</span>
          <span className="text-[11px] text-[var(--text-tertiary)]">
            {nodes.length > 0 
              ? `${nodes.length} node${nodes.length !== 1 ? 's' : ''} • ${edges.length} connection${edges.length !== 1 ? 's' : ''}`
              : 'Drag nodes from sidebar to begin'
            }
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)] p-0.5 mr-1">
            {themeOptions.map(({ mode: optionMode, label, icon: Icon }) => (
              <button
                key={optionMode}
                onClick={() => setMode(optionMode)}
                title={label}
                aria-label={label}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${mode === optionMode ? 'bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-primary)]/70 hover:text-[var(--text-primary)]'}`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
          <button onClick={undo} className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Undo (Ctrl+Z)">
            <RotateCcw size={15} />
          </button>
          <button onClick={redo} className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Redo (Ctrl+Shift+Z)">
            <RotateCw size={15} />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Save */}
          <button 
            onClick={handleSaveClick} 
            disabled={nodes.length === 0}
            className={`p-1.5 rounded transition-colors cursor-pointer ${nodes.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)]'}`}
            title={currentWorkflowId ? 'Save Changes' : 'Save Workflow'}
          >
            <Save size={15} />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Import / Export */}
          <button onClick={handleImport} className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Import JSON File">
            <Upload size={15} />
          </button>
          <button onClick={handleExport} className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Export JSON File">
            <Download size={15} />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Layout & Validation */}
          <button onClick={applyAutoLayout} className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Auto-layout (Horizontal)">
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={autoConnectNodes}
            disabled={nodes.length < 2}
            className={`p-1.5 rounded transition-colors cursor-pointer ${nodes.length < 2 ? 'text-gray-300 cursor-not-allowed' : 'text-[var(--text-secondary)] hover:text-black hover:bg-gray-100'}`}
            title="Auto-connect nodes"
          >
            <LinkIcon size={15} />
          </button>
          <button onClick={() => runValidation()} className={`relative p-1.5 rounded transition-colors cursor-pointer ${validationErrors.length > 0 ? 'text-red-500 hover:bg-red-50' : 'text-[var(--text-secondary)] hover:text-black hover:bg-gray-100'}`} title="Validate workflow">
            <ShieldCheck size={15} />
            {validationErrors.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{validationErrors.length}</span>
            )}
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Simulate */}
          <button onClick={toggleSandbox} data-tutorial="tutorial-simulate-btn" className="flex items-center gap-1.5 text-xs font-medium bg-[var(--color-brand-500)] text-white px-3 py-1.5 rounded-md hover:bg-[var(--color-brand-600)] transition-all shadow-sm hover:shadow cursor-pointer">
            <Play size={13} fill="currentColor" />
            Simulate
          </button>
        </div>
      </header>

      {/* Quick-save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={() => setShowSaveModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[380px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><Save size={15} /> Save Workflow</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"><X size={14} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Workflow Name *</label>
                <input
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="e.g. Employee Onboarding v2"
                  autoFocus
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent"
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveSubmit(); }}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Workflow Type</label>
                <select
                  value={saveType}
                  onChange={e => setSaveType(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent bg-white"
                >
                  {WORKFLOW_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50/50">
              <button onClick={() => setShowSaveModal(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
              <button
                onClick={handleSaveSubmit}
                disabled={!saveName.trim()}
                className="px-4 py-1.5 text-xs font-medium bg-[var(--color-brand-500)] text-white rounded-md hover:bg-[var(--color-brand-600)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
