"use client";
// ── NodeFormPanel — switches which form to render based on selected node ──

import { useCanvasStore } from '@/stores/canvasStore';
import { StartNodeForm } from './forms/StartNodeForm';
import { TaskNodeForm } from './forms/TaskNodeForm';
import { ApprovalNodeForm } from './forms/ApprovalNodeForm';
import { AutomatedStepNodeForm } from './forms/AutomatedStepNodeForm';
import { EndNodeForm } from './forms/EndNodeForm';
import { X } from 'lucide-react';

const FORM_MAP: Record<string, React.ComponentType<{ nodeId: string; data: Record<string, unknown> }>> = {
  start: StartNodeForm,
  task: TaskNodeForm,
  approval: ApprovalNodeForm,
  automated_step: AutomatedStepNodeForm,
  end: EndNodeForm,
};

const LABELS: Record<string, string> = {
  start: 'Start Node',
  task: 'Task Node',
  approval: 'Approval Node',
  automated_step: 'Automated Step',
  end: 'End Node',
};

const COLORS: Record<string, string> = {
  start: 'var(--node-start)',
  task: 'var(--node-task)',
  approval: 'var(--node-approval)',
  automated_step: 'var(--node-automated)',
  end: 'var(--node-end)',
};

export function NodeFormPanel() {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);
  const selectNode = useCanvasStore((s) => s.selectNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  if (!selectedNode) {
    return (
      <aside className="w-[var(--right-panel-width)] bg-[var(--surface-primary)] border-l border-[var(--border-default)] h-full flex items-center justify-center shrink-0">
        <p className="text-sm text-[var(--text-tertiary)] text-center px-4">Select a node to configure it</p>
      </aside>
    );
  }

  const nodeType = selectedNode.type || 'task';
  const FormComponent = FORM_MAP[nodeType];
  const color = COLORS[nodeType] || 'var(--node-task)';
  const history = selectedNode.data.__history as any[] | undefined;

  return (
    <aside className="w-[var(--right-panel-width)] bg-[var(--surface-primary)] border-l border-[var(--border-default)] h-full flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-semibold">{LABELS[nodeType] || 'Node'}</h3>
        </div>
        <button onClick={() => selectNode(null)} className="text-[var(--text-secondary)] hover:bg-gray-100 p-1 rounded cursor-pointer">
          <X size={16} />
        </button>
      </div>
      <div className="p-4">
        {FormComponent ? (
          <FormComponent nodeId={selectedNode.id} data={selectedNode.data as Record<string, unknown>} />
        ) : (
          <p className="text-xs text-[var(--text-tertiary)]">No form available for this node type.</p>
        )}
      </div>

      {/* Node Version History */}
      {history && Array.isArray(history) && history.length > 0 && (
        <div className="p-4 mt-auto border-t border-[var(--border-default)]">
          <h4 className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Version History</h4>
          <div className="flex flex-col gap-2 relative before:content-[''] before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-px before:bg-gray-200">
            {history.map((log: any, idx: number) => {
              const date = new Date(log.timestamp);
              return (
                <div key={idx} className="relative pl-5">
                  <div className="absolute left-0 top-1.5 w-3 h-3 bg-white border-2 border-gray-300 rounded-full" />
                  <p className="text-[11px] text-[var(--text-primary)] font-medium">
                    Updated {log.updatedFields?.join(', ') || 'fields'}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
