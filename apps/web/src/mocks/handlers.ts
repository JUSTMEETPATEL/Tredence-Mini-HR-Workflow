// ── MSW Handlers — Mock API for /automations and /simulate ──
// PRD §7.2 mock behaviour

import { http, HttpResponse } from 'msw';
import type { Automation } from '@/lib/types';

const automations: Automation[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'notify_slack', label: 'Notify Slack', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary', 'assignee'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employee_id', 'field', 'value'] },
];

export const handlers = [
  // GET /automations
  http.get('/api/automations', () => {
    return HttpResponse.json(automations);
  }),

  // POST /simulate
  http.post('/api/simulate', async ({ request }) => {
    const body = await request.json() as { nodes: Array<{ id: string; type: string; data: Record<string, string> }>; edges: Array<{ source: string; target: string }> };
    const { nodes, edges } = body;

    // Basic validation
    const startNodes = nodes.filter((n) => n.type === 'start');
    const endNodes = nodes.filter((n) => n.type === 'end');

    if (startNodes.length === 0 || endNodes.length === 0) {
      return HttpResponse.json({
        error: 'VALIDATION_FAILED',
        violations: [
          ...(startNodes.length === 0 ? [{ rule: 'NO_START', message: 'Workflow must have a Start node' }] : []),
          ...(endNodes.length === 0 ? [{ rule: 'NO_END', message: 'Workflow must have an End node' }] : []),
        ],
      }, { status: 422 });
    }

    // BFS simulation
    const adj = new Map<string, string[]>();
    for (const n of nodes) adj.set(n.id, []);
    for (const e of edges) adj.get(e.source)?.push(e.target);

    const visited = new Set<string>();
    const queue = [startNodes[0].id];
    const steps = [];
    let idx = 0;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (visited.has(curr)) continue;
      visited.add(curr);

      const node = nodes.find((n) => n.id === curr);
      if (!node) continue;

      idx++;
      steps.push({
        stepIndex: idx,
        nodeId: node.id,
        nodeType: node.type,
        title: node.data.title || node.data.endMessage || node.type,
        status: 'completed',
        message: `Step ${idx}: ${node.type} processed`,
        timestampMs: idx * 200,
      });

      for (const next of adj.get(curr) || []) {
        if (!visited.has(next)) queue.push(next);
      }
    }

    return HttpResponse.json({
      runId: `sim-${crypto.randomUUID()}`,
      status: 'completed',
      totalSteps: steps.length,
      durationMs: steps.length * 200,
      steps,
    });
  }),

  // GET /health
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok', db: 'mock', uptime: 9999 });
  }),
];
