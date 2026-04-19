# ── API Dockerfile — Multi-stage Build ─────────────────
# PRD §9.1 — Hono.js on Node.js (tsx for dev, node for prod)

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN if [ -f .env.docker ]; then cp .env.docker .env; fi
RUN npx prisma generate
RUN npx tsc

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://hrflow:hrflow_dev@postgres:5432/hr_workflow
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/.env.docker ./.env
EXPOSE 4000
CMD ["node", "dist/index.js"]
