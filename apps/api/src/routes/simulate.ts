// ── Simulate Route — POST /api/simulate ───────────────
import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../db.js';

const simulate = new Hono();

// ── Zod validation schema ────────────────────────────
const nodeSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'task', 'approval', 'automated_step', 'end']),
  data: z.record(z.string(), z.unknown()),
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

const simulateSchema = z.object({
  workflowId: z.string().optional(),
  nodes: z.array(nodeSchema).min(1, 'At least one node is required'),
  edges: z.array(edgeSchema),
});

// ── Validation logic ─────────────────────────────────
type WfNode = z.infer<typeof nodeSchema>;
type WfEdge = z.infer<typeof edgeSchema>;

interface Violation {
  nodeId?: string;
  rule: string;
  message: string;
}

function validateWorkflow(nodes: WfNode[], edges: WfEdge[]): Violation[] {
  const violations: Violation[] = [];

  const startNodes = nodes.filter((n) => n.type === 'start');
  const endNodes = nodes.filter((n) => n.type === 'end');

  if (startNodes.length === 0) violations.push({ rule: 'NO_START', message: 'Workflow must have a Start node' });
  if (startNodes.length > 1) violations.push({ rule: 'MULTIPLE_START', message: 'Only one Start node is allowed' });
  if (endNodes.length === 0) violations.push({ rule: 'NO_END', message: 'Workflow must have an End node' });

  for (const s of startNodes) {
    if (edges.some((e) => e.target === s.id)) {
      violations.push({ nodeId: s.id, rule: 'START_HAS_INCOMING', message: 'Start node cannot have incoming connections' });
    }
  }

  for (const e of endNodes) {
    if (edges.some((ed) => ed.source === e.id)) {
      violations.push({ nodeId: e.id, rule: 'END_HAS_OUTGOING', message: 'End node cannot have outgoing connections' });
    }
  }

  // Cycle detection (DFS)
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) adj.get(e.source)?.push(e.target);

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const n of nodes) color.set(n.id, WHITE);

  function dfs(id: string): boolean {
    color.set(id, GRAY);
    for (const nb of adj.get(id) || []) {
      if (color.get(nb) === GRAY) return true;
      if (color.get(nb) === WHITE && dfs(nb)) return true;
    }
    color.set(id, BLACK);
    return false;
  }

  for (const n of nodes) {
    if (color.get(n.id) === WHITE && dfs(n.id)) {
      violations.push({ rule: 'CYCLE_DETECTED', message: 'Cycle detected — workflows must be acyclic' });
      break;
    }
  }

  return violations;
}

// ── Route handler ────────────────────────────────────
simulate.post('/simulate', async (c) => {
  const body = (c as unknown as Record<string, unknown>).sanitizedBody || await c.req.json();
  const parsed = simulateSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'INVALID_INPUT', detail: parsed.error.flatten() }, 400);
  }

  const { nodes, edges, workflowId } = parsed.data;
  const violations = validateWorkflow(nodes, edges);

  if (violations.length > 0) {
    return c.json({ error: 'VALIDATION_FAILED', violations }, 422);
  }

  // BFS simulation
  const startNode = nodes.find((n) => n.type === 'start')!;
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) adj.get(e.source)?.push(e.target);

  const visited = new Set<string>();
  const queue = [startNode.id];
  const steps: Array<{
    stepIndex: number;
    nodeId: string;
    nodeType: string;
    title: string;
    status: string;
    message: string;
    timestampMs: number;
  }> = [];
  let idx = 0;
  const startTime = Date.now();

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (visited.has(curr)) continue;
    visited.add(curr);

    const node = nodes.find((n) => n.id === curr);
    if (!node) continue;

    idx++;
    const title = (node.data.title as string) || (node.data.endMessage as string) || node.type;

    steps.push({
      stepIndex: idx,
      nodeId: node.id,
      nodeType: node.type,
      title,
      status: 'completed',
      message: `Step ${idx}: ${node.type} "${title}" processed`,
      timestampMs: Date.now() - startTime,
    });

    for (const next of adj.get(curr) || []) {
      if (!visited.has(next)) queue.push(next);
    }
  }

  const durationMs = Date.now() - startTime;
  const runId = crypto.randomUUID();

  // Persist simulation run to DB
  try {
    await prisma.simulationRun.create({
      data: {
        id: runId,
        workflowId: workflowId || null,
        status: 'COMPLETED',
        durationMs,
        steps: {
          create: steps.map((s) => ({
            stepIndex: s.stepIndex,
            nodeId: s.nodeId,
            nodeType: s.nodeType.toUpperCase().replace(' ', '_') as 'START' | 'TASK' | 'APPROVAL' | 'AUTOMATED_STEP' | 'END',
            title: s.title,
            status: 'COMPLETED' as const,
            message: s.message,
            timestampMs: s.timestampMs,
          })),
        },
      },
    });
  } catch {
    // DB persistence is best-effort — simulation still returns result
    console.warn('Failed to persist simulation run to database');
  }

  return c.json({
    runId,
    status: 'completed',
    totalSteps: steps.length,
    durationMs,
    steps,
  });
});

export { simulate };
