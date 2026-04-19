// ── Workflows Routes — CRUD ───────────────────────────
import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../db.js';

const workflows = new Hono();

// ── GET /api/workflows — list all ────────────────────
workflows.get('/workflows', async (c) => {
  const list = await prisma.workflow.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { nodes: true, edges: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return c.json(list.map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
    nodeCount: w._count.nodes,
    edgeCount: w._count.edges,
  })));
});

// ── GET /api/workflows/:id — full detail ─────────────
workflows.get('/workflows/:id', async (c) => {
  const id = c.req.param('id');
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: {
      nodes: { orderBy: { nodeType: 'asc' } },
      edges: true,
    },
  });

  if (!workflow) {
    return c.json({ error: 'NOT_FOUND', message: 'Workflow not found' }, 404);
  }

  return c.json({
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
    nodes: workflow.nodes.map((n) => ({
      id: n.id,
      type: n.nodeType.toLowerCase().replace('_s', '_s'),
      position: { x: n.positionX, y: n.positionY },
      data: n.data,
    })),
    edges: workflow.edges.map((e) => ({
      id: e.id,
      source: e.sourceId,
      target: e.targetId,
      label: e.label,
    })),
  });
});

// ── POST /api/workflows — create ─────────────────────
const nodePayload = z.object({
  id: z.string(),
  type: z.enum(['start', 'task', 'approval', 'automated_step', 'end', 'ai']),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.string(), z.unknown()),
});

const edgePayload = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  nodes: z.array(nodePayload),
  edges: z.array(edgePayload),
});

workflows.post('/workflows', async (c) => {
  const body = (c as unknown as Record<string, unknown>).sanitizedBody || await c.req.json();
  const parsed = createWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'INVALID_INPUT', detail: parsed.error.flatten() }, 400);
  }

  const { name, description, nodes, edges } = parsed.data;

  const workflow = await prisma.workflow.create({
    data: {
      name,
      description,
      nodes: {
        create: nodes.map((n) => ({
          id: n.id,
          nodeType: n.type.toUpperCase().replace(' ', '_') as 'START' | 'TASK' | 'APPROVAL' | 'AUTOMATED_STEP' | 'END' | 'AI',
          positionX: n.position.x,
          positionY: n.position.y,
          data: n.data as object,
        })),
      },
      edges: {
        create: edges.map((e) => ({
          id: e.id,
          sourceId: e.source,
          targetId: e.target,
          label: e.label,
        })),
      },
    },
  });

  return c.json({ id: workflow.id, name: workflow.name, createdAt: workflow.createdAt }, 201);
});

// ── DELETE /api/workflows/:id ────────────────────────
workflows.delete('/workflows/:id', async (c) => {
  const id = c.req.param('id');

  try {
    await prisma.workflow.delete({ where: { id } });
    return c.json({ deleted: true });
  } catch {
    return c.json({ error: 'NOT_FOUND', message: 'Workflow not found' }, 404);
  }
});

// ── PUT /api/workflows/:id — upsert ───────────────────
workflows.put('/workflows/:id', async (c) => {
  const id = c.req.param('id');
  const body = (c as unknown as Record<string, unknown>).sanitizedBody || await c.req.json();
  const parsed = createWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'INVALID_INPUT', detail: parsed.error.flatten() }, 400);
  }

  const { name, description, nodes, edges } = parsed.data;

  const exists = await prisma.workflow.findUnique({ where: { id } });

  if (exists) {
    const updated = await prisma.workflow.update({
      where: { id },
      data: {
        name,
        description,
        nodes: {
          deleteMany: {},
          create: nodes.map((n) => ({
            id: n.id,
            nodeType: n.type.toUpperCase().replace(' ', '_') as 'START' | 'TASK' | 'APPROVAL' | 'AUTOMATED_STEP' | 'END' | 'AI',
            positionX: n.position.x,
            positionY: n.position.y,
            data: n.data as object,
          })),
        },
        edges: {
          deleteMany: {},
          create: edges.map((e) => ({
            id: e.id,
            sourceId: e.source,
            targetId: e.target,
            label: e.label,
          })),
        },
      },
    });
    return c.json({ id: updated.id, name: updated.name, updatedAt: updated.updatedAt }, 200);
  } else {
    const created = await prisma.workflow.create({
      data: {
        id, // explicitly use the provided ID
        name,
        description,
        nodes: {
          create: nodes.map((n) => ({
            id: n.id,
            nodeType: n.type.toUpperCase().replace(' ', '_') as 'START' | 'TASK' | 'APPROVAL' | 'AUTOMATED_STEP' | 'END' | 'AI',
            positionX: n.position.x,
            positionY: n.position.y,
            data: n.data as object,
          })),
        },
        edges: {
          create: edges.map((e) => ({
            id: e.id,
            sourceId: e.source,
            targetId: e.target,
            label: e.label,
          })),
        },
      },
    });
    return c.json({ id: created.id, name: created.name, createdAt: created.createdAt }, 201);
  }
});

export { workflows };
