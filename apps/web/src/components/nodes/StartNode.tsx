"use client";
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export function StartNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  return (
    <div className={`bg-white border-2 rounded-xl shadow-[var(--shadow-node)] min-w-[200px] transition-all duration-200 ${selected ? 'border-[var(--node-start)] ring-2 ring-[var(--node-start)]/30' : 'border-[var(--node-start)]/40'}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--node-start)]/10 rounded-t-[10px] border-b border-[var(--node-start)]/20">
        <div className="bg-[var(--node-start)] p-1 rounded"><Play size={12} className="text-white" /></div>
        <span className="text-xs font-semibold text-[var(--node-start)] uppercase tracking-wider">Start</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[var(--text-primary)]">{(data.title as string) || 'Start'}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--node-start)] !border-2 !border-white" />
    </div>
  );
}
