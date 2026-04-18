"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskNodeSchema, type TaskNodeFormData } from '@/lib/schemas';
import { useCanvasStore } from '@/stores/canvasStore';

export function TaskNodeForm({ nodeId, data }: { nodeId: string; data: Record<string, unknown> }) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const { register, handleSubmit, formState: { errors } } = useForm<TaskNodeFormData>({
    resolver: zodResolver(taskNodeSchema),
    defaultValues: {
      title: (data.title as string) || '',
      description: (data.description as string) || '',
      assignee: (data.assignee as string) || '',
      dueDate: (data.dueDate as string) || '',
    },
  });

  const onSubmit = (values: TaskNodeFormData) => updateNodeData(nodeId, values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Title *</label>
        <input {...register('title')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-task)]" />
        {errors.title && <p className="text-[10px] text-red-500 mt-0.5">{errors.title.message}</p>}
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Description</label>
        <textarea {...register('description')} rows={3} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-task)] resize-none" />
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Assignee</label>
        <input {...register('assignee')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-task)]" />
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Due Date</label>
        <input {...register('dueDate')} type="date" className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-task)]" />
      </div>
      <button type="submit" className="w-full text-xs font-medium bg-[var(--node-task)] text-white py-1.5 rounded-md hover:opacity-90 transition-opacity cursor-pointer">Save</button>
    </form>
  );
}
