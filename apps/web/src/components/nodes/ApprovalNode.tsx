"use client";
import { Handle, Position } from '@xyflow/react';
import { ShieldCheck } from 'lucide-react';
import { NodeValidationBadge } from './NodeValidationBadge';

export function ApprovalNode({ id, data, selected }: { id: string; data: Record<string, unknown>; selected?: boolean }) {
  return (
    <div className={`relative bg-white border-2 rounded-xl shadow-[var(--shadow-node)] min-w-[220px] transition-all duration-200 ${selected ? 'border-[var(--node-approval)] ring-2 ring-[var(--node-approval)]/30' : 'border-[var(--node-approval)]/40'}`}>
      <NodeValidationBadge nodeId={id} />
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--node-approval)] !border-2 !border-white" />
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--node-approval)]/10 rounded-t-[10px] border-b border-[var(--node-approval)]/20">
        <div className="bg-[var(--node-approval)] p-1 rounded"><ShieldCheck size={12} className="text-white" /></div>
        <span className="text-xs font-semibold text-[var(--node-approval)] uppercase tracking-wider">Approval</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[var(--text-primary)]">{(data.title as string) || 'Approval'}</p>
        {data.approverRole ? <p className="text-[10px] text-[var(--node-approval)] mt-1 bg-purple-50 px-1.5 py-0.5 rounded inline-block font-medium">{String(data.approverRole)}</p> : null}
      </div>
      <Handle type="source" position={Position.Bottom} id="approved" className="!w-3 !h-3 !bg-green-500 !border-2 !border-white !left-[35%]" />
      <Handle type="source" position={Position.Bottom} id="rejected" className="!w-3 !h-3 !bg-red-500 !border-2 !border-white !left-[65%]" />
    </div>
  );
}
