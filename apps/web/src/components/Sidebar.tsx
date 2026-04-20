"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Calendar,
  BarChart2,
  Link,
  Server,
  Workflow,
  Settings,
  Play,
  GitBranch,
  ClipboardList,
  Zap,
  Square,
  Plus,
  Trash2,
  Save,
  X,
  Eye,
  Sparkles,
  MoreHorizontal,
  Pencil,
  Copy,
} from "lucide-react";
import { useCanvasStore, type SavedWorkflow } from "@/stores/canvasStore";
import { useViewStore } from "@/stores/viewStore";
import { DEMO_WORKFLOWS } from "@/lib/demo-workflows";

const NODE_PALETTE = [
  { type: "start", label: "Start Node", hint: "Entry point", color: "var(--node-start)", icon: Play },
  { type: "task", label: "Task Node", hint: "Manual work", color: "var(--node-task)", icon: ClipboardList },
  { type: "approval", label: "Approval Node", hint: "Decision gate", color: "var(--node-approval)", icon: ShieldCheck },
  { type: "decision", label: "Decision Node", hint: "Branch by condition", color: "var(--node-decision)", icon: GitBranch },
  { type: "automated_step", label: "Automated Step", hint: "System action", color: "var(--node-automated)", icon: Zap },
  { type: "end", label: "End Node", hint: "Flow outcome", color: "var(--node-end)", icon: Square },
];

function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{children}</p>
      {action}
    </div>
  );
}

function NavButton({
  active,
  icon: Icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: typeof LayoutDashboard;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${
        active
          ? "border-[var(--color-brand-500)] bg-[var(--surface-tint)] text-[var(--text-primary)]"
          : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <Icon size={16} className={active ? "text-[var(--color-brand-500)]" : "text-[var(--text-tertiary)]"} />
          <span className="text-sm font-medium">{label}</span>
        </span>
        {typeof count === "number" && (
          <span className="status-chip rounded-full px-2 py-0.5 text-[10px] font-semibold metric-value">
            {count}
          </span>
        )}
      </div>
    </button>
  );
}

function RenameWorkflowModal({
  workflow,
  onClose,
}: {
  workflow: SavedWorkflow;
  onClose: () => void;
}) {
  const [name, setName] = useState(workflow.name);
  const renameWorkflow = useCanvasStore((s) => s.renameWorkflow);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--overlay-backdrop)] backdrop-blur-sm" onClick={onClose}>
      <div className="panel-card w-[400px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Pencil size={15} />
              Rename Workflow
            </h3>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">This name will replace the generated draft name.</p>
          </div>
          <button onClick={onClose} className="interactive-subtle rounded-lg p-1.5 cursor-pointer">
            <X size={14} />
          </button>
        </div>
        <div className="px-5 py-4">
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Workflow Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2.5 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) {
                renameWorkflow(workflow.id, name);
                onClose();
              }
            }}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--border-default)] bg-[var(--surface-secondary)] px-5 py-4">
          <button onClick={onClose} className="interactive-subtle rounded-xl px-4 py-2 text-xs font-medium cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => {
              renameWorkflow(workflow.id, name);
              onClose();
            }}
            disabled={!name.trim()}
            className="rounded-xl bg-[var(--color-brand-500)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const savedWorkflows = useCanvasStore((s) => s.savedWorkflows);

  const clearAllWorkflows = () => {
    if (confirm(`Delete all ${savedWorkflows.length} saved workflows? This cannot be undone.`)) {
      savedWorkflows.forEach((wf) => useCanvasStore.getState().deleteWorkflow(wf.id));
    }
  };

  const resetTutorial = () => {
    localStorage.removeItem("tredence_tutorial_completed");
    alert("Tutorial will replay on next page refresh.");
  };

  const exportAll = () => {
    const data = JSON.stringify(savedWorkflows, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all-workflows-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--overlay-backdrop)] backdrop-blur-sm" onClick={onClose}>
      <div className="panel-card w-[420px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Settings size={15} />
              Workspace Settings
            </h3>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">Local data, tutorial recovery, and backup actions.</p>
          </div>
          <button onClick={onClose} className="interactive-subtle rounded-lg p-1.5 cursor-pointer">
            <X size={14} />
          </button>
        </div>
        <div className="space-y-5 px-5 py-4">
          <div>
            <SectionLabel>Storage</SectionLabel>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2.5">
                <span className="text-xs text-[var(--text-secondary)]">Saved workflows</span>
                <span className="text-xs font-semibold metric-value text-[var(--text-primary)]">{savedWorkflows.length}</span>
              </div>
              <button onClick={exportAll} className="interactive-subtle flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs cursor-pointer">
                <Save size={13} /> Export all workflows
              </button>
              <button onClick={clearAllWorkflows} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50 cursor-pointer">
                <Trash2 size={13} /> Clear saved workflows
              </button>
            </div>
          </div>
          <div>
            <SectionLabel>Guidance</SectionLabel>
            <button onClick={resetTutorial} className="interactive-subtle flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs cursor-pointer">
              <Play size={13} /> Replay onboarding tutorial
            </button>
          </div>
        </div>
        <div className="flex justify-end border-t border-[var(--border-default)] bg-[var(--surface-secondary)] px-5 py-4">
          <button onClick={onClose} className="rounded-xl bg-[var(--color-brand-500)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)] cursor-pointer">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkflowHistoryItem({
  workflow,
  isCurrent,
  onRename,
}: {
  workflow: SavedWorkflow;
  isCurrent: boolean;
  onRename: (workflow: SavedWorkflow) => void;
}) {
  const loadWorkflow = useCanvasStore((s) => s.loadWorkflow);
  const deleteWorkflow = useCanvasStore((s) => s.deleteWorkflow);
  const duplicateWorkflow = useCanvasStore((s) => s.duplicateWorkflow);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onClick={() => loadWorkflow(workflow.id)}
      className={`group rounded-2xl border px-3 py-2.5 transition-colors cursor-pointer ${
        isCurrent ? "border-[var(--color-brand-500)] bg-[var(--surface-tint)]" : "border-[var(--border-default)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-secondary)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex items-start gap-2">
          <Workflow size={14} className="mt-0.5 shrink-0 text-[var(--color-brand-500)]" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{workflow.name}</p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--text-tertiary)] capitalize">
              {workflow.type} • {new Date(workflow.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            className="rounded-lg p-1 text-[var(--text-tertiary)] opacity-0 transition-opacity hover:bg-[var(--surface-secondary)] group-hover:opacity-100 cursor-pointer"
            title="Workflow actions"
          >
            <MoreHorizontal size={12} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-[90] w-40 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] p-1.5 shadow-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRename(workflow);
                }}
                className="interactive-subtle flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs cursor-pointer"
              >
                <Pencil size={13} />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateWorkflow(workflow.id);
                  setMenuOpen(false);
                }}
                className="interactive-subtle flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs cursor-pointer"
              >
                <Copy size={13} />
                Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteWorkflow(workflow.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const savedWorkflows = useCanvasStore((s) => s.savedWorkflows);
  const currentWorkflowId = useCanvasStore((s) => s.currentWorkflowId);
  const createNewWorkflow = useCanvasStore((s) => s.createNewWorkflow);
  const saveWorkflow = useCanvasStore((s) => s.saveWorkflow);
  const nodes = useCanvasStore((s) => s.nodes);

  const activeNav = useViewStore((s) => s.activeView);
  const setActiveNav = useViewStore((s) => s.setActiveView);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [renameWorkflow, setRenameWorkflow] = useState<SavedWorkflow | null>(null);

  return (
    <>
      <aside className="surface-panel w-[var(--sidebar-width)] border-r border-[var(--border-default)] h-full shrink-0">
        <div className="flex h-full flex-col overflow-hidden px-4 py-4">
          <div className="mb-5 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Builder Workspace</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">Drafts autosave with generated names as you build.</p>
              </div>
              <button onClick={() => setSettingsOpen(true)} className="interactive-subtle rounded-xl p-2 cursor-pointer" title="Workspace settings">
                <Settings size={14} />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Canvas</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)] metric-value">{nodes.length} nodes</p>
              </div>
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Library</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)] metric-value">{savedWorkflows.length} saved</p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto pr-1">
            <div className="mb-5">
              <SectionLabel>General</SectionLabel>
              <div className="space-y-1">
                <NavButton active={activeNav === "dashboard"} icon={LayoutDashboard} label="Dashboard" onClick={() => setActiveNav("dashboard")} />
                <NavButton active={activeNav === "compliance"} icon={ShieldCheck} label="Compliance" onClick={() => setActiveNav("compliance")} />
                <NavButton active={activeNav === "scheduler"} icon={Calendar} label="Scheduler" count={savedWorkflows.length} onClick={() => setActiveNav("scheduler")} />
                <NavButton active={activeNav === "analytics"} icon={BarChart2} label="Analytics" onClick={() => setActiveNav("analytics")} />
              </div>
            </div>

            <div className="mb-5">
              <SectionLabel>Automation</SectionLabel>
              <div className="space-y-1">
                <NavButton active={activeNav === "integrations"} icon={Link} label="Integrations" onClick={() => setActiveNav("integrations")} />
                <NavButton active={activeNav === "repository"} icon={Server} label="Repository" count={DEMO_WORKFLOWS.length} onClick={() => setActiveNav("repository")} />
              </div>
            </div>

            <div className="mb-5">
              <SectionLabel
                action={
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => saveWorkflow()}
                      className="interactive-subtle rounded-lg p-1.5 cursor-pointer"
                      title="Save current workflow now"
                    >
                      <Save size={13} />
                    </button>
                    <button
                      onClick={() => createNewWorkflow()}
                      className="interactive-subtle rounded-lg p-1.5 cursor-pointer"
                      title="Create new workflow"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                }
              >
                Workflow History
              </SectionLabel>
              <div className="space-y-1.5">
                {savedWorkflows.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-5 text-center">
                    <Sparkles size={16} className="mx-auto text-[var(--color-brand-500)]" />
                    <p className="mt-2 text-xs font-medium text-[var(--text-primary)]">No saved workflows yet</p>
                    <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">Add a node to the canvas and autosave will create the first draft.</p>
                  </div>
                ) : (
                  savedWorkflows.map((wf) => (
                    <WorkflowHistoryItem
                      key={wf.id}
                      workflow={wf}
                      isCurrent={currentWorkflowId === wf.id}
                      onRename={setRenameWorkflow}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="mb-5">
              <SectionLabel>Demo Templates</SectionLabel>
              <div className="space-y-1.5">
                {DEMO_WORKFLOWS.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => {
                      useCanvasStore.setState({
                        nodes: JSON.parse(JSON.stringify(wf.nodes)),
                        edges: JSON.parse(JSON.stringify(wf.edges)),
                        currentWorkflowId: null,
                        history: [],
                        historyIndex: -1,
                        selectedNodeId: null,
                        selectedNodeIds: [],
                        validationErrors: [],
                        isDirty: true,
                        lastSavedAt: null,
                      });
                    }}
                    className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-2.5 text-xs transition-colors hover:bg-[var(--surface-secondary)] cursor-pointer"
                    title={`Load ${wf.name} template`}
                  >
                    <div className="flex items-center gap-2">
                      <Eye size={13} className="shrink-0 text-[var(--color-brand-500)]" />
                      <span className="truncate font-medium text-[var(--text-primary)]">{wf.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Node Palette</SectionLabel>
              <div className="space-y-2">
                {NODE_PALETTE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/reactflow", item.type);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      data-tutorial={`tutorial-${item.type}-node`}
                      className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-3 transition-shadow hover:shadow-md active:cursor-grabbing cursor-grab"
                      style={{ borderLeftColor: item.color, borderLeftWidth: 3 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface-secondary)]">
                          <Icon size={14} style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-primary)]">{item.label}</p>
                          <p className="text-[11px] text-[var(--text-tertiary)]">{item.hint}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {renameWorkflow && <RenameWorkflowModal workflow={renameWorkflow} onClose={() => setRenameWorkflow(null)} />}
    </>
  );
}
