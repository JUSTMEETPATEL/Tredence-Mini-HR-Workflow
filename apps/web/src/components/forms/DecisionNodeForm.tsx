"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { decisionNodeSchema, type DecisionNodeFormData } from '@/lib/schemas';
import { useCanvasStore } from '@/stores/canvasStore';

export function DecisionNodeForm({ nodeId, data }: { nodeId: string; data: Record<string, unknown> }) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const { register, handleSubmit, formState: { errors } } = useForm<DecisionNodeFormData>({
    resolver: zodResolver(decisionNodeSchema),
    defaultValues: {
      title: (data.title as string) || '',
      condition: (data.condition as string) || '',
      trueLabel: (data.trueLabel as string) || 'Yes',
      falseLabel: (data.falseLabel as string) || 'No',
    },
  });

  const onSubmit = (values: DecisionNodeFormData) => updateNodeData(nodeId, values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Title *</label>
        <input {...register('title')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-decision)]" />
        {errors.title && <p className="text-[10px] text-red-500 mt-0.5">{errors.title.message}</p>}
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Condition *</label>
        <textarea {...register('condition')} rows={3} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--node-decision)]" />
        {errors.condition && <p className="text-[10px] text-red-500 mt-0.5">{errors.condition.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">True branch label</label>
          <input {...register('trueLabel')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-decision)]" />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">False branch label</label>
          <input {...register('falseLabel')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-decision)]" />
        </div>
      </div>
      <button type="submit" className="w-full text-xs font-medium bg-[var(--node-decision)] text-white py-1.5 rounded-md hover:opacity-90 transition-opacity cursor-pointer">Save</button>
    </form>
  );
}
