"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  RotateCcw,
  RotateCw,
  Play,
  Upload,
  Download,
  LayoutGrid,
  ShieldCheck,
  Save,
  Link as LinkIcon,
  Sun,
  Moon,
  Laptop,
  CircleDot,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  X,
} from "lucide-react";
import { useCanvasStore } from "@/stores/canvasStore";
import { useSimulationStore } from "@/stores/simulationStore";
import { serializeWorkflow, deserializeWorkflow } from "@/lib/workflow-engine";
import type { WorkflowNode, WorkflowEdge } from "@/lib/types";
import { useTheme, type ThemeMode } from "./providers/ThemeProvider";

function ToolButton({
  onClick,
  title,
  children,
  disabled = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`h-9 w-9 rounded-xl flex items-center justify-center interactive-subtle ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-1.5 py-1">
      {children}
    </div>
  );
}

function formatSavedStatus(isDirty: boolean, lastSavedAt: string | null) {
  if (isDirty) return "Saving changes...";
  if (!lastSavedAt) return "Autosave ready";

  const diffSeconds = Math.max(0, Math.round((Date.now() - new Date(lastSavedAt).getTime()) / 1000));
  if (diffSeconds < 5) return "Autosaved just now";
  if (diffSeconds < 60) return `Autosaved ${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `Autosaved ${Math.round(diffSeconds / 60)}m ago`;
  return `Autosaved ${Math.round(diffSeconds / 3600)}h ago`;
}

function RenameWorkflowModal({
  initialName,
  onClose,
  onSubmit,
}: {
  initialName: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--overlay-backdrop)] backdrop-blur-sm" onClick={onClose}>
      <div className="panel-card w-[400px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Pencil size={15} />
              Rename Workflow
            </h3>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">Manual names override the generated draft name.</p>
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
              if (e.key === "Enter" && name.trim()) onSubmit(name);
            }}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--border-default)] bg-[var(--surface-secondary)] px-5 py-4">
          <button onClick={onClose} className="interactive-subtle rounded-xl px-4 py-2 text-xs font-medium cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(name)}
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

export function TopBar() {
  const { mode, setMode } = useTheme();
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const currentWorkflowId = useCanvasStore((s) => s.currentWorkflowId);
  const savedWorkflows = useCanvasStore((s) => s.savedWorkflows);
  const saveWorkflow = useCanvasStore((s) => s.saveWorkflow);
  const renameWorkflow = useCanvasStore((s) => s.renameWorkflow);
  const duplicateWorkflow = useCanvasStore((s) => s.duplicateWorkflow);
  const deleteWorkflow = useCanvasStore((s) => s.deleteWorkflow);
  const isDirty = useCanvasStore((s) => s.isDirty);
  const lastSavedAt = useCanvasStore((s) => s.lastSavedAt);
  const toggleSandbox = useSimulationStore((s) => s.toggle);
  const applyAutoLayout = useCanvasStore((s) => s.applyAutoLayout);
  const autoConnectNodes = useCanvasStore((s) => s.autoConnectNodes);
  const runValidation = useCanvasStore((s) => s.runValidation);
  const validationErrors = useCanvasStore((s) => s.validationErrors);

  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const autosaveTimerRef = useRef<number | null>(null);

  const currentWf = savedWorkflows.find((wf) => wf.id === currentWorkflowId);
  const displayTitle = currentWf?.name || (nodes.length > 0 ? "Draft workflow" : "HR Workflow Designer");
  const workflowLabel = currentWf?.type ? currentWf.type.replace("-", " ") : "Draft";
  const saveStatus = formatSavedStatus(isDirty, lastSavedAt);

  const themeOptions: Array<{ mode: ThemeMode; label: string; icon: typeof Laptop }> = [
    { mode: "system", label: "System theme", icon: Laptop },
    { mode: "light", label: "Light theme", icon: Sun },
    { mode: "dark", label: "Dark theme", icon: Moon },
  ];

  const workflowStats = useMemo(
    () => [
      `${nodes.length} node${nodes.length === 1 ? "" : "s"}`,
      `${edges.length} connection${edges.length === 1 ? "" : "s"}`,
      selectedNodeIds.length > 0 ? `${selectedNodeIds.length} selected` : saveStatus,
    ],
    [edges.length, nodes.length, saveStatus, selectedNodeIds.length]
  );

  useEffect(() => {
    if (nodes.length === 0 || !isDirty) return;

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      saveWorkflow();
      autosaveTimerRef.current = null;
    }, 900);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [edges, isDirty, nodes, saveWorkflow]);

  const handleExport = () => {
    const wfNodes: WorkflowNode[] = nodes.map((n) => ({
      id: n.id,
      type: (n.type || "task") as WorkflowNode["type"],
      position: n.position,
      data: n.data as unknown as WorkflowNode["data"],
    }));
    const wfEdges: WorkflowEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));
    const json = serializeWorkflow(wfNodes, wfEdges, displayTitle);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${displayTitle.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const { nodes: wfNodes, edges: wfEdges } = deserializeWorkflow(reader.result as string);
          setNodes(
            wfNodes.map((n) => ({
              id: n.id,
              type: n.type,
              position: n.position,
              data: n.data as unknown as Record<string, unknown>,
            }))
          );
          setEdges(
            wfEdges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
            }))
          );
        } catch {
          alert("Invalid workflow JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <>
      <header className="h-[var(--toolbar-height)] border-b border-[var(--border-default)] bg-[var(--surface-primary)] px-5 z-10 shrink-0">
        <div className="flex h-full items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src="/logo.png"
                alt="FlowForge Logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-contain border border-[var(--border-default)] bg-[var(--surface-secondary)] p-1 shadow-sm"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-[var(--text-primary)]">FlowForge</span>
                  <span className="status-chip rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">
                    {workflowLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate text-sm font-medium text-[var(--text-primary)]">{displayTitle}</span>
                  {nodes.length > 0 ? (
                    <span className={`inline-flex items-center gap-1 text-[11px] ${isDirty ? "text-amber-600" : "text-emerald-600"}`}>
                      <CircleDot size={10} />
                      {saveStatus}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--text-tertiary)]">Start by dragging a node onto the canvas</span>
                  )}
                  {currentWf && (
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen((open) => !open)}
                        className="interactive-subtle rounded-lg p-1.5 cursor-pointer"
                        title="Workflow actions"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {menuOpen && (
                        <div className="absolute left-0 top-9 z-[80] w-44 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] p-1.5 shadow-xl">
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              setRenameOpen(true);
                            }}
                            className="interactive-subtle flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs cursor-pointer"
                          >
                            <Pencil size={13} />
                            Rename
                          </button>
                          <button
                            onClick={() => {
                              duplicateWorkflow(currentWf.id);
                              setMenuOpen(false);
                            }}
                            className="interactive-subtle flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs cursor-pointer"
                          >
                            <Copy size={13} />
                            Duplicate
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${currentWf.name}"?`)) {
                                deleteWorkflow(currentWf.id);
                              }
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
                  )}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {workflowStats.map((stat) => (
                <span key={stat} className="status-chip rounded-full px-2.5 py-1 text-[11px] font-medium metric-value">
                  {stat}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ToolbarGroup>
              {themeOptions.map(({ mode: optionMode, label, icon: Icon }) => (
                <button
                  key={optionMode}
                  onClick={() => setMode(optionMode)}
                  title={label}
                  aria-label={label}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    mode === optionMode ? "bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-sm" : "interactive-subtle"
                  }`}
                >
                  <Icon size={15} />
                </button>
              ))}
            </ToolbarGroup>

            <ToolbarGroup>
              <ToolButton onClick={undo} title="Undo (Ctrl+Z)">
                <RotateCcw size={15} />
              </ToolButton>
              <ToolButton onClick={redo} title="Redo (Ctrl+Shift+Z)">
                <RotateCw size={15} />
              </ToolButton>
            </ToolbarGroup>

            <ToolbarGroup>
              <ToolButton onClick={() => saveWorkflow()} title="Save now" disabled={nodes.length === 0}>
                <Save size={15} />
              </ToolButton>
              <ToolButton onClick={handleImport} title="Import JSON File">
                <Upload size={15} />
              </ToolButton>
              <ToolButton onClick={handleExport} title="Export JSON File">
                <Download size={15} />
              </ToolButton>
            </ToolbarGroup>

            <ToolbarGroup>
              <ToolButton onClick={applyAutoLayout} title="Auto-layout (Horizontal)">
                <LayoutGrid size={15} />
              </ToolButton>
              <ToolButton onClick={autoConnectNodes} title="Auto-connect nodes" disabled={nodes.length < 2}>
                <LinkIcon size={15} />
              </ToolButton>
              <ToolButton
                onClick={() => runValidation()}
                title={
                  validationErrors.length > 0
                    ? `${validationErrors.length} validation issue${validationErrors.length === 1 ? "" : "s"}`
                    : "Validate workflow"
                }
              >
                <div className="relative">
                  <ShieldCheck size={15} className={validationErrors.length > 0 ? "text-red-500" : undefined} />
                  {validationErrors.length > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white metric-value">
                      {validationErrors.length}
                    </span>
                  )}
                </div>
              </ToolButton>
            </ToolbarGroup>

            <button
              onClick={toggleSandbox}
              data-tutorial="tutorial-simulate-btn"
              className="flex h-10 items-center gap-2 rounded-xl bg-[var(--color-brand-500)] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-brand-600)] cursor-pointer"
            >
              <Play size={14} fill="currentColor" />
              Simulate
            </button>
          </div>
        </div>
      </header>

      {renameOpen && currentWf && (
        <RenameWorkflowModal
          initialName={currentWf.name}
          onClose={() => setRenameOpen(false)}
          onSubmit={(name) => {
            renameWorkflow(currentWf.id, name);
            setRenameOpen(false);
          }}
        />
      )}
    </>
  );
}
