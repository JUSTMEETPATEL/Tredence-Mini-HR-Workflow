"use client";
import { Handle, Position } from '@xyflow/react';
import { ClipboardList } from 'lucide-react';
import { NodeValidationBadge } from './NodeValidationBadge';

export function TaskNode({ id, data, selected }: { id: string; data: Record<string, unknown>; selected?: boolean }) {
  return (
    <div className={`relative bg-white border-2 rounded-xl shadow-[var(--shadow-node)] min-w-[220px] transition-all duration-200 ${selected ? 'border-[var(--node-task)] ring-2 ring-[var(--node-task)]/30' : 'border-[var(--node-task)]/40'}`}>
      <NodeValidationBadge nodeId={id} />
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--node-task)] !border-2 !border-white" />
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--node-task)]/10 rounded-t-[10px] border-b border-[var(--node-task)]/20">
        <div className="bg-[var(--node-task)] p-1 rounded"><ClipboardList size={12} className="text-white" /></div>
        <span className="text-xs font-semibold text-[var(--node-task)] uppercase tracking-wider">Task</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[var(--text-primary)]">{(data.title as string) || 'Task'}</p>
        {data.description ? <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{String(data.description)}</p> : null}
        {data.assignee ? <p className="text-[10px] text-[var(--text-secondary)] mt-1 bg-gray-50 px-1.5 py-0.5 rounded inline-block">Assignee: {String(data.assignee)}</p> : null}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--node-task)] !border-2 !border-white" />
    </div>
  );
}
