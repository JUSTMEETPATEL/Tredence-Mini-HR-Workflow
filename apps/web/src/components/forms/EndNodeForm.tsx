"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { endNodeSchema, type EndNodeFormData } from '@/lib/schemas';
import { useCanvasStore } from '@/stores/canvasStore';

export function EndNodeForm({ nodeId, data }: { nodeId: string; data: Record<string, unknown> }) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const { register, handleSubmit } = useForm<EndNodeFormData>({
    resolver: zodResolver(endNodeSchema),
    defaultValues: {
      endMessage: (data.endMessage as string) || '',
      summaryFlag: (data.summaryFlag as boolean) || false,
    },
  });

  const onSubmit = (values: EndNodeFormData) => updateNodeData(nodeId, values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">End Message</label>
        <input {...register('endMessage')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-end)]" />
      </div>
      <div className="flex items-center gap-2">
        <input {...register('summaryFlag')} type="checkbox" id={`summary-${nodeId}`} className="rounded border-gray-300 accent-[var(--node-end)]" />
        <label htmlFor={`summary-${nodeId}`} className="text-xs text-[var(--text-secondary)]">Generate summary report</label>
      </div>
      <button type="submit" className="w-full text-xs font-medium bg-[var(--node-end)] text-white py-1.5 rounded-md hover:opacity-90 transition-opacity cursor-pointer">Save</button>
    </form>
  );
}
