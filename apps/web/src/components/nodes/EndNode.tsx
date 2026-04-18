"use client";
import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';

export function EndNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  return (
    <div className={`bg-white border-2 rounded-xl shadow-[var(--shadow-node)] min-w-[180px] transition-all duration-200 ${selected ? 'border-[var(--node-end)] ring-2 ring-[var(--node-end)]/30' : 'border-[var(--node-end)]/40'}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--node-end)] !border-2 !border-white" />
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--node-end)]/10 rounded-t-[10px] border-b border-[var(--node-end)]/20">
        <div className="bg-[var(--node-end)] p-1 rounded"><Square size={12} className="text-white" /></div>
        <span className="text-xs font-semibold text-[var(--node-end)] uppercase tracking-wider">End</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[var(--text-primary)]">{(data.endMessage as string) || 'End'}</p>
      </div>
    </div>
  );
}
