// ── Shared Type Definitions ────────────────────────────
// Corresponds to PRD §8.2 — packages/types

export type NodeType =
  | 'start'
  | 'task'
  | 'approval'
  | 'decision'
  | 'automated_step'
  | 'end';

// ── Node Data Interfaces ──────────────────────────────

export interface StartNodeData {
  title: string;
  metadata?: Record<string, string>;
}

export interface TaskNodeData {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  customFields?: Record<string, string>;
}

export interface ApprovalNodeData {
  title: string;
  approverRole: 'Manager' | 'HRBP' | 'Director' | 'CEO';
  autoApproveThresholdDays?: number;
}

export interface DecisionNodeData {
  title: string;
  condition: string;
  trueLabel?: string;
  falseLabel?: string;
}

export interface AutomatedStepNodeData {
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData {
  endMessage?: string;
  summaryFlag: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | DecisionNodeData
  | AutomatedStepNodeData
  | EndNodeData;

// ── Graph Types ───────────────────────────────────────

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowGraphPayload {
  workflowId?: string;
  name?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// ── API Types ─────────────────────────────────────────

export interface Automation {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  stepIndex: number;
  nodeId: string;
  nodeType: NodeType;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  message: string;
  timestampMs: number;
}

export interface SimulationResult {
  runId: string;
  status: 'completed' | 'failed' | 'validation_error';
  totalSteps: number;
  durationMs: number;
  steps: SimulationStep[];
}

export interface ValidationViolation {
  nodeId?: string;
  rule: string;
  message: string;
}
