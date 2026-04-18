"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { approvalNodeSchema, type ApprovalNodeFormData } from '@/lib/schemas';
import { useCanvasStore } from '@/stores/canvasStore';

export function ApprovalNodeForm({ nodeId, data }: { nodeId: string; data: Record<string, unknown> }) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const { register, handleSubmit, formState: { errors } } = useForm<ApprovalNodeFormData>({
    resolver: zodResolver(approvalNodeSchema),
    defaultValues: {
      title: (data.title as string) || '',
      approverRole: (data.approverRole as 'Manager' | 'HRBP' | 'Director' | 'CEO') || 'Manager',
      autoApproveThresholdDays: (data.autoApproveThresholdDays as number) || undefined,
    },
  });

  const onSubmit = (values: ApprovalNodeFormData) => updateNodeData(nodeId, values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Title *</label>
        <input {...register('title')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-approval)]" />
        {errors.title && <p className="text-[10px] text-red-500 mt-0.5">{errors.title.message}</p>}
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Approver Role *</label>
        <select {...register('approverRole')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-approval)] bg-white">
          <option value="Manager">Manager</option>
          <option value="HRBP">HRBP</option>
          <option value="Director">Director</option>
          <option value="CEO">CEO</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Auto-approve after (days)</label>
        <input {...register('autoApproveThresholdDays', { valueAsNumber: true, setValueAs: (v) => v === '' || isNaN(Number(v)) ? undefined : Number(v) })} type="number" min={1} max={365} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-approval)]" />
      </div>
      <button type="submit" className="w-full text-xs font-medium bg-[var(--node-approval)] text-white py-1.5 rounded-md hover:opacity-90 transition-opacity cursor-pointer">Save</button>
    </form>
  );
}
