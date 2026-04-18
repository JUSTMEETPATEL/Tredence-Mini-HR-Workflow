// ── Hono API Entry Point ──────────────────────────────
// PRD §3.1 — apps/api with Hono.js

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { sanitizer } from './middleware/sanitizer.js';
import { health } from './routes/health.js';
import { automations } from './routes/automations.js';
import { simulate } from './routes/simulate.js';
import { workflows } from './routes/workflows.js';

const app = new Hono().basePath('/api');

// ── Middleware stack (PRD §7.3) ──────────────────────
// Request → cors() → logger() → sanitizer() → route handler
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type'],
}));
app.use('*', logger());
app.use('*', sanitizer);

// ── Routes ───────────────────────────────────────────
app.route('/', health);
app.route('/', automations);
app.route('/', simulate);
app.route('/', workflows);

// ── Start server ─────────────────────────────────────
const port = parseInt(process.env.PORT || '4000', 10);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🚀 HR Workflow API running at http://localhost:${info.port}/api`);
  console.log(`   Health:      GET  /api/health`);
  console.log(`   Automations: GET  /api/automations`);
  console.log(`   Simulate:    POST /api/simulate`);
  console.log(`   Workflows:   CRUD /api/workflows`);
});

export default app;
