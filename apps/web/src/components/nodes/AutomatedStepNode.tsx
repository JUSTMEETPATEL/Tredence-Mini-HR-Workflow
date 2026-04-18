"use client";
import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export function AutomatedStepNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  return (
    <div className={`bg-white border-2 rounded-xl shadow-[var(--shadow-node)] min-w-[220px] transition-all duration-200 ${selected ? 'border-[var(--node-automated)] ring-2 ring-[var(--node-automated)]/30' : 'border-[var(--node-automated)]/40'}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--node-automated)] !border-2 !border-white" />
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--node-automated)]/10 rounded-t-[10px] border-b border-[var(--node-automated)]/20">
        <div className="bg-[var(--node-automated)] p-1 rounded"><Zap size={12} className="text-white" /></div>
        <span className="text-xs font-semibold text-[var(--node-automated)] uppercase tracking-wider">Automated</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[var(--text-primary)]">{(data.title as string) || 'Automated Step'}</p>
        {data.actionId ? <p className="text-[10px] text-amber-700 mt-1 bg-amber-50 px-1.5 py-0.5 rounded inline-block font-medium">{String(data.actionId)}</p> : null}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--node-automated)] !border-2 !border-white" />
    </div>
  );
}
