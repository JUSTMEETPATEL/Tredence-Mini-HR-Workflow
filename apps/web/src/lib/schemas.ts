// ── Zod Schemas for Node Forms ─────────────────────────
// PRD §6.2.1–6.2.5

import { z } from 'zod';

export const startNodeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(80),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const taskNodeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(80),
  description: z.string().max(500).optional().or(z.literal('')),
  assignee: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
});

export const approvalNodeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(80),
  approverRole: z.enum(['Manager', 'HRBP', 'Director', 'CEO']),
  autoApproveThresholdDays: z.number().min(1).max(365).optional(),
});

export const decisionNodeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(80),
  condition: z.string().min(1, 'Condition is required').max(200),
  trueLabel: z.string().max(30).optional().or(z.literal('')),
  falseLabel: z.string().max(30).optional().or(z.literal('')),
});

export const automatedStepNodeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(80),
  actionId: z.string().min(1, 'Action is required'),
  actionParams: z.record(z.string(), z.string()).optional(),
});

export const endNodeSchema = z.object({
  endMessage: z.string().max(200).optional().or(z.literal('')),
  summaryFlag: z.boolean(),
});

export type StartNodeFormData = z.infer<typeof startNodeSchema>;
export type TaskNodeFormData = z.infer<typeof taskNodeSchema>;
export type ApprovalNodeFormData = z.infer<typeof approvalNodeSchema>;
export type DecisionNodeFormData = z.infer<typeof decisionNodeSchema>;
export type AutomatedStepNodeFormData = z.infer<typeof automatedStepNodeSchema>;
export type EndNodeFormData = z.infer<typeof endNodeSchema>;
