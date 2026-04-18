"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startNodeSchema, type StartNodeFormData } from '@/lib/schemas';
import { useCanvasStore } from '@/stores/canvasStore';

export function StartNodeForm({ nodeId, data }: { nodeId: string; data: Record<string, unknown> }) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const { register, handleSubmit, formState: { errors } } = useForm<StartNodeFormData>({
    resolver: zodResolver(startNodeSchema),
    defaultValues: { title: (data.title as string) || '' },
  });

  const onSubmit = (values: StartNodeFormData) => {
    updateNodeData(nodeId, values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Start Title *</label>
        <input {...register('title')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-start)]" />
        {errors.title && <p className="text-[10px] text-red-500 mt-0.5">{errors.title.message}</p>}
      </div>
      <button type="submit" className="w-full text-xs font-medium bg-[var(--node-start)] text-white py-1.5 rounded-md hover:opacity-90 transition-opacity cursor-pointer">Save</button>
    </form>
  );
}
