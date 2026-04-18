// ── Workflow Engine — Pure Graph Logic ──────────────
// Corresponds to PRD §6.1.3 + packages/workflow-engine
// Zero UI deps — validate and simulate a workflow graph.

import type {
  WorkflowNode,
  WorkflowEdge,
  ValidationViolation,
  SimulationStep,
  SimulationResult,
} from './types';

// ── Validation ────────────────────────────────────────

export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  // 1. Must have a Start node
  const startNodes = nodes.filter((n) => n.type === 'start');
  if (startNodes.length === 0) {
    violations.push({ rule: 'NO_START', message: 'Workflow must have a Start node' });
  }
  if (startNodes.length > 1) {
    violations.push({ rule: 'MULTIPLE_START', message: 'Only one Start node is allowed' });
  }

  // 2. Must have an End node
  const endNodes = nodes.filter((n) => n.type === 'end');
  if (endNodes.length === 0) {
    violations.push({ rule: 'NO_END', message: 'Workflow must have an End node' });
  }

  // 3. Start cannot have incoming edges
  for (const start of startNodes) {
    if (edges.some((e) => e.target === start.id)) {
      violations.push({
        nodeId: start.id,
        rule: 'START_HAS_INCOMING',
        message: 'Start node cannot have incoming connections',
      });
    }
  }

  // 4. End cannot have outgoing edges
  for (const end of endNodes) {
    if (edges.some((e) => e.source === end.id)) {
      violations.push({
        nodeId: end.id,
        rule: 'END_HAS_OUTGOING',
        message: 'End node cannot have outgoing connections',
      });
    }
  }

  // 5. Disconnected nodes
  for (const node of nodes) {
    if (node.type === 'start') {
      const hasOutgoing = edges.some((e) => e.source === node.id);
      if (!hasOutgoing) {
        violations.push({
          nodeId: node.id,
          rule: 'DISCONNECTED_NODE',
          message: `Node '${(node.data as { title?: string }).title || node.id}' is not connected`,
        });
      }
    } else if (node.type === 'end') {
      const hasIncoming = edges.some((e) => e.target === node.id);
      if (!hasIncoming) {
        violations.push({
          nodeId: node.id,
          rule: 'DISCONNECTED_NODE',
          message: `Node '${(node.data as { endMessage?: string }).endMessage || node.id}' is not connected`,
        });
      }
    } else {
      const hasIncoming = edges.some((e) => e.target === node.id);
      const hasOutgoing = edges.some((e) => e.source === node.id);
      if (!hasIncoming && !hasOutgoing) {
        violations.push({
          nodeId: node.id,
          rule: 'DISCONNECTED_NODE',
          message: `Node '${(node.data as { title?: string }).title || node.id}' is not connected`,
        });
      }
    }
  }

  // 6. Cycle detection (DFS)
  if (detectCycle(nodes, edges)) {
    violations.push({
      rule: 'CYCLE_DETECTED',
      message: 'Cycle detected — workflows must be acyclic',
    });
  }

  return violations;
}

function detectCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const node of nodes) adj.set(node.id, []);
  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target);
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const node of nodes) color.set(node.id, WHITE);

  function dfs(id: string): boolean {
    color.set(id, GRAY);
    for (const neighbour of adj.get(id) || []) {
      if (color.get(neighbour) === GRAY) return true;
      if (color.get(neighbour) === WHITE && dfs(neighbour)) return true;
    }
    color.set(id, BLACK);
    return false;
  }

  for (const node of nodes) {
    if (color.get(node.id) === WHITE && dfs(node.id)) return true;
  }
  return false;
}

// ── Simulation ────────────────────────────────────────

export function simulateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): SimulationResult {
  const runId = `sim-${crypto.randomUUID()}`;

  // Validate first
  const violations = validateWorkflow(nodes, edges);
  if (violations.length > 0) {
    return {
      runId,
      status: 'validation_error',
      totalSteps: 0,
      durationMs: 0,
      steps: [],
    };
  }

  // BFS traversal from start node
  const startNode = nodes.find((n) => n.type === 'start')!;
  const adj = new Map<string, string[]>();
  for (const node of nodes) adj.set(node.id, []);
  for (const edge of edges) adj.get(edge.source)?.push(edge.target);

  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  const steps: SimulationStep[] = [];
  let stepIndex = 0;
  const startTime = Date.now();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const node = nodes.find((n) => n.id === currentId);
    if (!node) continue;

    stepIndex++;
    const title = (node.data as { title?: string }).title || 
                  (node.data as { endMessage?: string }).endMessage || 
                  node.type;

    steps.push({
      stepIndex,
      nodeId: node.id,
      nodeType: node.type,
      title,
      status: 'completed',
      message: getStepMessage(node.type, title),
      timestampMs: Date.now() - startTime,
    });

    const neighbours = adj.get(currentId) || [];
    for (const n of neighbours) {
      if (!visited.has(n)) queue.push(n);
    }
  }

  return {
    runId,
    status: 'completed',
    totalSteps: steps.length,
    durationMs: Date.now() - startTime,
    steps,
  };
}

function getStepMessage(type: string, title: string): string {
  switch (type) {
    case 'start':          return `Workflow initiated: ${title}`;
    case 'task':           return `Task "${title}" completed`;
    case 'approval':       return `Approval "${title}" granted`;
    case 'automated_step': return `Automated action "${title}" executed`;
    case 'end':            return `Workflow completed: ${title}`;
    default:               return `Step "${title}" processed`;
  }
}

// ── Serialization ─────────────────────────────────────

export function serializeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  name?: string
): string {
  const payload = { name: name || 'Untitled Workflow', nodes, edges };
  return JSON.stringify(payload, null, 2);
}

export function deserializeWorkflow(json: string): {
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  return JSON.parse(json);
}
