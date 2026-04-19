"use client";

import { useState } from "react";
import { LayoutDashboard, ShieldCheck, Calendar, BarChart2, Link, Server, Workflow, Settings, Play, ClipboardList, Zap, Square, Plus, Trash2, Save, X, FilePlus, Eye } from "lucide-react";
import { useCanvasStore } from "@/stores/canvasStore";
import { useViewStore } from "@/stores/viewStore";
import { DEMO_WORKFLOWS } from "@/lib/demo-workflows";

const NODE_PALETTE = [
  { type: 'start', label: 'Start Node', color: 'var(--node-start)', icon: Play },
  { type: 'task', label: 'Task Node', color: 'var(--node-task)', icon: ClipboardList },
  { type: 'approval', label: 'Approval Node', color: 'var(--node-approval)', icon: ShieldCheck },
  { type: 'automated_step', label: 'Automated Step', color: 'var(--node-automated)', icon: Zap },
  { type: 'end', label: 'End Node', color: 'var(--node-end)', icon: Square },
];

const WORKFLOW_TYPES = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'offboarding', label: 'Offboarding' },
  { value: 'leave-request', label: 'Leave Request' },
  { value: 'expense', label: 'Expense Approval' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'custom', label: 'Custom' },
];

// ── Save / New Workflow Modal ────────────────────────
function SaveWorkflowModal({ mode, onClose }: { mode: 'save' | 'new'; onClose: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('custom');
  const saveWorkflow = useCanvasStore(s => s.saveWorkflow);
  const createNewWorkflow = useCanvasStore(s => s.createNewWorkflow);
  const nodes = useCanvasStore(s => s.nodes);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (mode === 'new') {
      // If current canvas has content, offer to save first
      if (nodes.length > 0) {
        saveWorkflow(trimmed, type);
      }
      createNewWorkflow();
    } else {
      saveWorkflow(trimmed, type);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[380px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            {mode === 'save' ? <><Save size={15} /> Save Workflow</> : <><FilePlus size={15} /> New Workflow</>}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"><X size={14} /></button>
        </div>
        <div className="p-4 space-y-3">
          {mode === 'new' && nodes.length > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              Your current canvas has {nodes.length} node(s). Give it a name below to save before creating a new one, or leave blank to discard.
            </p>
          )}
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Workflow Name *</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Employee Onboarding v2"
              autoFocus
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent"
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Workflow Type</label>
            <select 
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent bg-white"
            >
              {WORKFLOW_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50/50">
          {mode === 'new' && nodes.length > 0 && (
            <button onClick={() => { createNewWorkflow(); onClose(); }} className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors">
              Discard & Create New
            </button>
          )}
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={!name.trim()}
            className="px-4 py-1.5 text-xs font-medium bg-[var(--color-brand-600)] text-white rounded-md hover:bg-[var(--color-brand-700)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {mode === 'save' ? 'Save' : (nodes.length > 0 ? 'Save & Create New' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Settings Modal ──────────────────────────────────
function SettingsModal({ onClose }: { onClose: () => void }) {
  const savedWorkflows = useCanvasStore(s => s.savedWorkflows);

  const clearAllWorkflows = () => {
    if (confirm(`Delete all ${savedWorkflows.length} saved workflows? This cannot be undone.`)) {
      savedWorkflows.forEach(wf => useCanvasStore.getState().deleteWorkflow(wf.id));
    }
  };

  const resetTutorial = () => {
    localStorage.removeItem('tredence_tutorial_completed');
    alert('Tutorial will replay on next page refresh.');
  };

  const exportAll = () => {
    const data = JSON.stringify(savedWorkflows, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-workflows-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><Settings size={15} /> Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"><X size={14} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Storage</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                <span className="text-xs text-[var(--text-secondary)]">Saved Workflows</span>
                <span className="text-xs font-medium">{savedWorkflows.length}</span>
              </div>
              <button onClick={exportAll} className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-gray-50 rounded-md transition-colors">
                <Save size={13} /> Export All Workflows as Backup
              </button>
              <button onClick={clearAllWorkflows} className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 size={13} /> Clear All Saved Workflows
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Tutorial</p>
            <button onClick={resetTutorial} className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-gray-50 rounded-md transition-colors">
              <Play size={13} /> Reset Onboarding Tutorial
            </button>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">About</p>
            <div className="bg-gray-50 rounded-md px-3 py-2 space-y-1">
              <p className="text-xs text-[var(--text-primary)] font-medium">HR Workflow Designer</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">Tredence Mini HR Workflow • v1.0.0</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-medium bg-[var(--color-brand-600)] text-white rounded-md hover:bg-[var(--color-brand-700)] transition-colors shadow-sm">Done</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Sidebar ────────────────────────────────────
export function Sidebar() {
  const savedWorkflows = useCanvasStore(s => s.savedWorkflows);
  const currentWorkflowId = useCanvasStore(s => s.currentWorkflowId);
  const loadWorkflow = useCanvasStore(s => s.loadWorkflow);
  const deleteWorkflow = useCanvasStore(s => s.deleteWorkflow);
  const nodes = useCanvasStore(s => s.nodes);

  const activeNav = useViewStore(s => s.activeView);
  const setActiveNav = useViewStore(s => s.setActiveView);
  const [modal, setModal] = useState<'save' | 'new' | 'settings' | null>(null);

  return (
    <>
      <aside className="w-[var(--sidebar-width)] bg-[var(--surface-primary)] border-r border-[var(--border-default)] h-full flex flex-col shrink-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto py-4 flex flex-col">
          {/* Navigation */}
          <div className="px-4 mb-2">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">General</p>
            <ul className="space-y-0.5">
              <li>
                <button onClick={() => setActiveNav('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer text-left ${activeNav === 'dashboard' ? 'font-medium text-[var(--color-brand-600)] bg-[var(--color-brand-50)]' : 'text-[var(--text-secondary)] hover:bg-gray-50'}`}>
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveNav('compliance')} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer text-left ${activeNav === 'compliance' ? 'font-medium text-[var(--color-brand-600)] bg-[var(--color-brand-50)]' : 'text-[var(--text-secondary)] hover:bg-gray-50'}`}>
                  <ShieldCheck size={16} />Compliance
                </button>
              </li>
              <li>
                <button onClick={() => setActiveNav('scheduler')} className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer ${activeNav === 'scheduler' ? 'font-medium text-[var(--color-brand-600)] bg-[var(--color-brand-50)]' : 'text-[var(--text-secondary)] hover:bg-gray-50'}`}>
                  <span className="flex items-center gap-3"><Calendar size={16} />Scheduler</span>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{savedWorkflows.length}</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveNav('analytics')} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer text-left ${activeNav === 'analytics' ? 'font-medium text-[var(--color-brand-600)] bg-[var(--color-brand-50)]' : 'text-[var(--text-secondary)] hover:bg-gray-50'}`}>
                  <BarChart2 size={16} />Analytics
                </button>
              </li>
            </ul>
          </div>

          <div className="px-4 mb-2 mt-5">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Automation</p>
            <ul className="space-y-0.5">
              <li>
                <button onClick={() => setActiveNav('integrations')} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer text-left ${activeNav === 'integrations' ? 'font-medium text-[var(--color-brand-600)] bg-[var(--color-brand-50)]' : 'text-[var(--text-secondary)] hover:bg-gray-50'}`}>
                  <Link size={16} />Integrations
                </button>
              </li>
              <li>
                <button onClick={() => setActiveNav('repository')} className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer ${activeNav === 'repository' ? 'font-medium text-[var(--color-brand-600)] bg-[var(--color-brand-50)]' : 'text-[var(--text-secondary)] hover:bg-gray-50'}`}>
                  <span className="flex items-center gap-3"><Server size={16} />Repository</span>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{DEMO_WORKFLOWS.length}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* ── Workflow History ── */}
          <div className="px-4 mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Workflow History</p>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setModal('save')}
                  className="text-gray-400 hover:text-[var(--color-brand-600)] transition-colors p-1 rounded hover:bg-gray-100"
                  title="Save Current Workflow"
                >
                  <Save size={13} />
                </button>
                <button
                  onClick={() => setModal('new')}
                  className="text-gray-400 hover:text-[var(--color-brand-600)] transition-colors p-1 rounded hover:bg-gray-100"
                  title="New Workflow"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
            <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
              {savedWorkflows.length === 0 ? (
                <p className="text-xs text-gray-400 italic px-2 py-3 text-center">No saved workflows yet.<br/>Build one and hit Save!</p>
              ) : (
                savedWorkflows.map(wf => (
                  <div 
                    key={wf.id}
                    onClick={() => loadWorkflow(wf.id)}
                    className={`group flex items-center justify-between px-3 py-2 text-xs rounded-md cursor-pointer border transition-all ${currentWorkflowId === wf.id ? 'border-[var(--color-brand-300)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]' : 'border-transparent text-[var(--text-secondary)] hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Workflow size={13} className="shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium">{wf.name || 'Untitled'}</span>
                        <span className="text-[10px] text-gray-400 truncate">{wf.type} • {new Date(wf.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteWorkflow(wf.id); }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Demo Templates ── */}
          <div className="px-4 mt-5">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Demo Templates</p>
            <div className="space-y-1">
              {DEMO_WORKFLOWS.map(wf => (
                <div 
                  key={wf.id}
                  onClick={() => {
                    useCanvasStore.setState({
                      nodes: JSON.parse(JSON.stringify(wf.nodes)),
                      edges: JSON.parse(JSON.stringify(wf.edges)),
                      currentWorkflowId: null,
                      history: [], historyIndex: -1, selectedNodeId: null, validationErrors: []
                    });
                  }}
                  className="group flex items-center gap-2 px-3 py-2 text-xs rounded-md cursor-pointer border border-transparent text-[var(--text-secondary)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)] transition-colors"
                  title={`Load "${wf.name}" demo template`}
                >
                  <Eye size={13} className="shrink-0 text-[var(--color-brand-400)]" />
                  <span className="truncate">{wf.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Node Palette ── */}
          <div className="px-4 mt-6">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Node Palette</p>
            <div className="space-y-1.5">
              {NODE_PALETTE.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/reactflow', item.type);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    data-tutorial={`tutorial-${item.type}-node`}
                    className="border border-[var(--border-default)] rounded-lg p-2.5 text-xs flex items-center gap-2.5 cursor-grab bg-white hover:shadow-md active:cursor-grabbing transition-shadow"
                    style={{ borderLeftColor: item.color, borderLeftWidth: 3 }}
                  >
                    <Icon size={14} style={{ color: item.color }} />
                    <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom: Settings */}
        <div className="p-4 border-t border-[var(--border-default)] mt-auto">
          <button onClick={() => setModal('settings')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 rounded-md cursor-pointer">
            <Settings size={16} />Settings
          </button>
        </div>
      </aside>

      {/* Modals */}
      {(modal === 'save' || modal === 'new') && <SaveWorkflowModal mode={modal} onClose={() => setModal(null)} />}
      {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} />}
    </>
  );
}
