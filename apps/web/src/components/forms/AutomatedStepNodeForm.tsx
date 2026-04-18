"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { automatedStepNodeSchema, type AutomatedStepNodeFormData } from '@/lib/schemas';
import { useCanvasStore } from '@/stores/canvasStore';
import { useAutomations } from '@/hooks/useAutomations';
import { useMemo } from 'react';

export function AutomatedStepNodeForm({ nodeId, data }: { nodeId: string; data: Record<string, unknown> }) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const { data: automations, isLoading } = useAutomations();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<AutomatedStepNodeFormData>({
    resolver: zodResolver(automatedStepNodeSchema),
    defaultValues: {
      title: (data.title as string) || '',
      actionId: (data.actionId as string) || '',
      actionParams: (data.actionParams as Record<string, string>) || {},
    },
  });

  const selectedActionId = watch('actionId');
  const selectedAction = useMemo(
    () => automations?.find((a) => a.id === selectedActionId),
    [automations, selectedActionId]
  );

  const onSubmit = (values: AutomatedStepNodeFormData) => updateNodeData(nodeId, values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Title *</label>
        <input {...register('title')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-automated)]" />
        {errors.title && <p className="text-[10px] text-red-500 mt-0.5">{errors.title.message}</p>}
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Action *</label>
        <select {...register('actionId')} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-automated)] bg-white" disabled={isLoading}>
          <option value="">Select an action...</option>
          {automations?.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
        {errors.actionId && <p className="text-[10px] text-red-500 mt-0.5">{errors.actionId.message}</p>}
      </div>

      {/* Dynamic parameter fields from /automations API */}
      {selectedAction?.params.map((param) => (
        <div key={param}>
          <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1 capitalize">{param}</label>
          <input
            {...register(`actionParams.${param}` as `actionParams.${string}`)}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--node-automated)]"
            placeholder={param}
          />
        </div>
      ))}

      <button type="submit" className="w-full text-xs font-medium bg-[var(--node-automated)] text-white py-1.5 rounded-md hover:opacity-90 transition-opacity cursor-pointer">Save</button>
    </form>
  );
}
