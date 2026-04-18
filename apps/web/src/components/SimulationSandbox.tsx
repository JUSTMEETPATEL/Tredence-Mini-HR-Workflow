"use client";
// ── Simulation Sandbox — Bottom Drawer Panel ──────────
// PRD §6.4 — slides up, shows step-by-step execution log

import { useSimulationStore } from '@/stores/simulationStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useSimulate } from '@/hooks/useSimulate';
import { validateWorkflow } from '@/lib/workflow-engine';
import type { WorkflowNode, WorkflowEdge } from '@/lib/types';
import { X, Play, AlertTriangle, CheckCircle2, Clock, ChevronUp } from 'lucide-react';

const STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} className="text-green-500" />,
  failed: <AlertTriangle size={14} className="text-red-500" />,
  running: <Clock size={14} className="text-amber-500 animate-spin" />,
  pending: <Clock size={14} className="text-gray-400" />,
  skipped: <AlertTriangle size={14} className="text-gray-400" />,
};

const TYPE_COLORS: Record<string, string> = {
  start: 'bg-teal-100 text-teal-700',
  task: 'bg-blue-100 text-blue-700',
  approval: 'bg-purple-100 text-purple-700',
  automated_step: 'bg-amber-100 text-amber-700',
  end: 'bg-red-100 text-red-700',
};

export function SimulationSandbox() {
  const { isOpen, toggle, result, status, validationErrors, reset, setResult, setValidationErrors, setStatus } = useSimulationStore();
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const simulate = useSimulate();

  const runSimulation = async () => {
    reset();
    setStatus('validating');

    // Convert React Flow nodes/edges to WorkflowNode/WorkflowEdge
    const wfNodes: WorkflowNode[] = nodes.map((n) => ({
      id: n.id,
      type: (n.type || 'task') as WorkflowNode['type'],
      position: n.position,
      data: n.data as unknown as WorkflowNode['data'],
    }));
    const wfEdges: WorkflowEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    const violations = validateWorkflow(wfNodes, wfEdges);
    if (violations.length > 0) {
      setValidationErrors(violations.map((v) => v.message));
      return;
    }

    setStatus('running');

    try {
      const payload = {
        nodes: nodes.map((n) => ({ id: n.id, type: n.type || 'task', data: n.data as Record<string, unknown> })),
        edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
      };
      const res = await simulate.mutateAsync(payload);
      setResult(res);
    } catch (err) {
      setValidationErrors([(err as Error).message]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggle}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[var(--color-brand-600)] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-[var(--color-brand-500)] transition-colors cursor-pointer z-50"
      >
        <ChevronUp size={16} /> Simulation Sandbox
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-[var(--sidebar-width)] right-0 h-[var(--sandbox-height)] bg-[var(--surface-primary)] border-t border-[var(--border-default)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40 flex flex-col transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-default)] shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">Simulation Sandbox</h3>
          {result && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              {result.totalSteps} steps · {result.durationMs}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runSimulation} disabled={simulate.isPending} className="flex items-center gap-1 text-xs font-medium bg-[var(--color-brand-600)] text-white px-3 py-1.5 rounded-md hover:bg-[var(--color-brand-500)] transition-colors disabled:opacity-50 cursor-pointer">
            <Play size={12} /> {simulate.isPending ? 'Running...' : 'Run'}
          </button>
          <button onClick={toggle} className="p-1 text-[var(--text-secondary)] hover:bg-gray-100 rounded cursor-pointer">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {status === 'idle' && <p className="text-sm text-[var(--text-tertiary)] text-center mt-8">Click Run to simulate your workflow</p>}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-sm font-medium text-red-700">Validation Errors</span>
            </div>
            <ul className="space-y-1">
              {validationErrors.map((e, i) => (
                <li key={i} className="text-xs text-red-600">• {e}</li>
              ))}
            </ul>
          </div>
        )}

        {status === 'running' && (
          <div className="flex items-center justify-center mt-8 gap-2">
            <div className="w-4 h-4 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-secondary)]">Simulating...</span>
          </div>
        )}

        {status === 'completed' && result && (
          <div className="space-y-2">
            {result.steps.map((step) => (
              <div key={step.stepIndex} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-mono font-bold text-[var(--text-secondary)] shrink-0">
                  {step.stepIndex}
                </div>
                {STATUS_ICON[step.status]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{step.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase ${TYPE_COLORS[step.nodeType] || 'bg-gray-100 text-gray-600'}`}>
                      {step.nodeType}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{step.message}</p>
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono shrink-0">{step.timestampMs}ms</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
