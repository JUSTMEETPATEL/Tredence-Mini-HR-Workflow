// ── Automations Route — GET /api/automations ─────────
import { Hono } from 'hono';
import { prisma } from '../db.js';

const automations = new Hono();

automations.get('/automations', async (c) => {
  const list = await prisma.automation.findMany({
    select: {
      id: true,
      label: true,
      params: true,
    },
    orderBy: { label: 'asc' },
  });

  return c.json(list);
});

export { automations };
