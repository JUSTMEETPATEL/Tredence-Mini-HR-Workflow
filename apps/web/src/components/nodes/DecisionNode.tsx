"use client";
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { NodeValidationBadge } from './NodeValidationBadge';

export function DecisionNode({ id, data, selected }: { id: string; data: Record<string, unknown>; selected?: boolean }) {
  const trueLabel = String(data.trueLabel || 'Yes');
  const falseLabel = String(data.falseLabel || 'No');

  return (
    <div className={`relative bg-white border-2 rounded-xl shadow-[var(--shadow-node)] min-w-[240px] transition-all duration-200 ${selected ? 'border-[var(--node-decision)] ring-2 ring-[var(--node-decision)]/30' : 'border-[var(--node-decision)]/40'}`}>
      <NodeValidationBadge nodeId={id} />
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--node-decision)] !border-2 !border-white" />
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--node-decision)]/10 rounded-t-[10px] border-b border-[var(--node-decision)]/20">
        <div className="bg-[var(--node-decision)] p-1 rounded"><GitBranch size={12} className="text-white" /></div>
        <span className="text-xs font-semibold text-[var(--node-decision)] uppercase tracking-wider">Decision</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[var(--text-primary)]">{(data.title as string) || 'Decision'}</p>
        {data.condition ? <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{String(data.condition)}</p> : null}
        <div className="mt-2 flex gap-2">
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{trueLabel}</span>
          <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-medium">{falseLabel}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white !left-[35%]" />
      <Handle type="source" position={Position.Bottom} id="false" className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white !left-[65%]" />
    </div>
  );
}
