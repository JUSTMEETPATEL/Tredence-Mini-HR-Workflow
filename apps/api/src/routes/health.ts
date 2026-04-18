// ── Health Route ──────────────────────────────────────
import { Hono } from 'hono';
import { prisma } from '../db.js';

const health = new Hono();

health.get('/health', async (c) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  return c.json({
    status: 'ok',
    db: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export { health };
