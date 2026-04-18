# PRD — HR Workflow Designer
**Project:** `hr-workflow-designer`
**Version:** 1.0.0
**Author:** Meet
**Status:** Draft — awaiting sign-off
**Last Updated:** 2026-04-18

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals and Non-Goals](#2-goals-and-non-goals)
3. [Tech Stack](#3-tech-stack)
4. [Monorepo Structure](#4-monorepo-structure)
5. [Architecture](#5-architecture)
6. [Feature Specification](#6-feature-specification)
7. [API Specification](#7-api-specification)
8. [Data Models](#8-data-models)
9. [Infrastructure & DevOps](#9-infrastructure--devops)
10. [Testing Strategy](#10-testing-strategy)
11. [Environment Configuration](#11-environment-configuration)
12. [Milestones & Delivery Scope](#12-milestones--delivery-scope)
13. [Open Questions](#13-open-questions)

---

## 1. Overview

### 1.1 Problem Statement

HR administrators lack a visual, low-code tool for designing internal process workflows such as employee onboarding, leave approvals, and document verification. Existing enterprise tools are either over-engineered, locked behind vendor contracts, or require engineering involvement to configure.

### 1.2 Solution

A browser-based **HR Workflow Designer** that allows HR admins to visually construct, configure, and simulate internal workflows on a drag-and-drop canvas. Built as a production-grade full-stack prototype demonstrating architectural depth, clean code practices, and scalable design — as required by the Tredence Studio AI Agentic Platforms internship case study.

### 1.3 Intended Users

- HR administrators creating and managing internal workflows
- Engineering reviewers assessing code quality, architecture, and extensibility

---

## 2. Goals and Non-Goals

### 2.1 Goals

- Deliver a functional workflow canvas with 5 node types, all configurable via form panels
- Integrate a mock API layer (`/automations`, `/simulate`) with MSW, mirrored by a real Hono.js + PostgreSQL backend
- Demonstrate scalable monorepo architecture with strict package separation
- Produce a Dockerised, Kubernetes-deployable system with Terraform-managed Azure infrastructure
- Provide bonus features: JSON export/import, undo/redo, workflow validation, minimap

### 2.2 Non-Goals

- Authentication/authorization (explicitly excluded by case study)
- Real email dispatch or document generation
- Multi-tenant or multi-user collaboration in v1
- Mobile-responsive canvas (desktop-first)

---

## 3. Tech Stack

### 3.1 Frontend

| Concern | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x (strict mode) |
| Styling | Tailwind CSS | 4.x |
| Canvas | React Flow | 12.x |
| State management | Zustand | 5.x |
| Forms | React Hook Form + Zod | 7.x / 3.x |
| Server state | TanStack Query | 5.x |
| Component dev | Storybook | 8.x |
| UI primitives | shadcn/ui + Radix UI | latest |

### 3.2 Backend

| Concern | Technology | Version |
|---|---|---|
| Runtime | Bun | 1.x |
| Framework | Hono.js | 4.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 16.x |
| Mock layer | MSW (Mock Service Worker) | 2.x |
| Validation | Zod (shared with frontend) | 3.x |

### 3.3 Infrastructure

| Concern | Technology |
|---|---|
| Containerisation | Docker + Docker Compose |
| Orchestration | Kubernetes (AKS) |
| IaC | Terraform (Azure provider) |
| Container registry | Azure Container Registry (ACR) |
| Reverse proxy | Nginx Ingress Controller |
| API gateway / edge | Azure Front Door + WAF |
| Load balancer | Azure Load Balancer (L4) |
| Secrets | Azure Key Vault + CSI driver |
| Monitoring | Prometheus + Grafana + Loki |
| CI/CD | GitHub Actions |

### 3.4 Monorepo Tooling

| Concern | Technology |
|---|---|
| Monorepo manager | Turborepo |
| Package manager | bun |
| Linting | ESLint (shared config) |
| Formatting | Prettier |
| Testing (unit) | Vitest |
| Testing (E2E) | Playwright |
| Git hooks | Husky + lint-staged |

---

## 4. Monorepo Structure

```
hr-workflow-designer/
├── apps/
│   ├── web/                        # Next.js 15 application
│   │   ├── app/                    # App Router pages and layouts
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Redirect → /designer
│   │   │   └── designer/
│   │   │       └── page.tsx        # Main canvas page
│   │   ├── components/             # App-local components
│   │   ├── hooks/                  # App-local hooks
│   │   └── stores/                 # Zustand store slices
│   │       ├── canvasStore.ts
│   │       ├── simulationStore.ts
│   │       └── workflowStore.ts
│   │
│   ├── api/                        # Hono.js + Bun backend
│   │   ├── src/
│   │   │   ├── index.ts            # Hono app entry
│   │   │   ├── routes/
│   │   │   │   ├── automations.ts  # GET /automations
│   │   │   │   ├── simulate.ts     # POST /simulate
│   │   │   │   ├── workflows.ts    # CRUD /workflows (bonus real backend)
│   │   │   │   └── health.ts       # GET /health
│   │   │   ├── middleware/
│   │   │   │   ├── sanitizer.ts    # Input sanitization middleware
│   │   │   │   ├── cors.ts
│   │   │   │   └── logger.ts
│   │   │   ├── db/
│   │   │   │   └── client.ts       # Prisma client singleton
│   │   │   └── lib/
│   │   │       └── simulator.ts    # Graph simulation engine
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── Dockerfile
│   │
│   └── storybook/                  # Component documentation
│       └── stories/
│
├── packages/
│   ├── ui/                         # Shared design system
│   │   ├── src/
│   │   │   ├── components/         # shadcn-based primitives
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── workflow-canvas/            # React Flow engine package
│   │   ├── src/
│   │   │   ├── nodes/              # All 5 custom node types
│   │   │   │   ├── StartNode.tsx
│   │   │   │   ├── TaskNode.tsx
│   │   │   │   ├── ApprovalNode.tsx
│   │   │   │   ├── AutomatedStepNode.tsx
│   │   │   │   └── EndNode.tsx
│   │   │   ├── edges/              # Custom edge types
│   │   │   ├── hooks/
│   │   │   │   ├── useWorkflowCanvas.ts
│   │   │   │   └── useNodeSelection.ts
│   │   │   ├── Canvas.tsx          # Main React Flow wrapper
│   │   │   └── Sidebar.tsx         # Draggable node palette
│   │   └── package.json
│   │
│   ├── node-forms/                 # Node configuration forms
│   │   ├── src/
│   │   │   ├── forms/
│   │   │   │   ├── StartNodeForm.tsx
│   │   │   │   ├── TaskNodeForm.tsx
│   │   │   │   ├── ApprovalNodeForm.tsx
│   │   │   │   ├── AutomatedStepNodeForm.tsx  # Dynamic fields
│   │   │   │   └── EndNodeForm.tsx
│   │   │   ├── schemas/            # Zod validation schemas
│   │   │   │   └── index.ts
│   │   │   └── NodeFormPanel.tsx   # Form panel container
│   │   └── package.json
│   │
│   ├── workflow-engine/            # Pure graph logic — zero UI deps
│   │   ├── src/
│   │   │   ├── validate.ts         # DAG validation, cycle detection
│   │   │   ├── simulate.ts         # Step-by-step simulation runner
│   │   │   ├── serialize.ts        # Workflow → JSON and back
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   ├── api-client/                 # Typed fetch layer
│   │   ├── src/
│   │   │   ├── hooks/
│   │   │   │   ├── useAutomations.ts
│   │   │   │   └── useSimulate.ts
│   │   │   └── client.ts           # Base fetch + error handling
│   │   └── package.json
│   │
│   └── types/                      # Shared TypeScript interfaces
│       ├── src/
│       │   ├── workflow.ts          # WorkflowNode, WorkflowEdge, etc.
│       │   ├── api.ts               # Request/response contracts
│       │   └── index.ts
│       └── package.json
│
├── tooling/
│   ├── eslint-config/
│   ├── tsconfig/
│   ├── jest-preset/
│   └── prettier-config/
│
├── infra/                           # Terraform + Kubernetes manifests
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── modules/
│   │   │   ├── aks/
│   │   │   ├── acr/
│   │   │   ├── networking/
│   │   │   ├── keyvault/
│   │   │   └── frontdoor/
│   │   └── environments/
│   │       ├── dev.tfvars
│   │       └── prod.tfvars
│   │
│   └── k8s/
│       ├── namespaces/
│       ├── deployments/
│       │   ├── web.yaml
│       │   ├── api.yaml
│       │   └── sanitizer.yaml
│       ├── services/
│       ├── ingress/
│       │   └── nginx.yaml
│       ├── hpa/
│       └── configmaps/
│
├── docker-compose.yml               # Local full-stack dev
├── docker-compose.override.yml      # Local overrides
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 5. Architecture

### 5.1 Request Lifecycle (production)

```
Browser
  → Azure Front Door (TLS, CDN, WAF, DDoS)
  → Azure Load Balancer L4 (round-robin, health probes)
  → Nginx Ingress Controller (L7 routing, rate-limit, upstream SSL)
  → Sanitizer Microservice (XSS strip, SQLi check, schema validation)
  → Target Service (web | api)
  → Data Layer (PostgreSQL | Redis)
```

### 5.2 Kubernetes Namespaces

| Namespace | Contents |
|---|---|
| `ingress` | Nginx Ingress Controller, Sanitizer svc |
| `app` | web (Next.js), api (Hono), storybook |
| `monitoring` | Prometheus, Grafana, Loki |
| `cert-manager` | Let's Encrypt TLS automation |

### 5.3 Service Communication

All internal traffic uses `ClusterIP` services — nothing is exposed as `NodePort` or `LoadBalancer` internally. Services reference each other by DNS name (`api.app.svc.cluster.local`). The Next.js app calls the Hono API via server-side `fetch` using the internal ClusterIP DNS, keeping API credentials off the client entirely.

### 5.4 Mock vs Real Backend

The system runs in two modes controlled by the `NEXT_PUBLIC_API_MODE` environment variable:

- `mock` — MSW intercepts all fetch calls in the browser (dev/demo mode, no backend required)
- `real` — requests go to the Hono.js API with a live PostgreSQL connection

This allows the case study prototype to run with `mock` mode for judges while the full stack is available as a bonus deliverable.

### 5.5 Local Development

```bash
# Full stack local
docker-compose up

# Services started:
#   web      → localhost:3000  (Next.js)
#   api      → localhost:4000  (Hono + Bun)
#   postgres → localhost:5432
#   nginx    → localhost:80    (reverse proxy)
```

---

## 6. Feature Specification

### 6.1 Workflow Canvas

**Package:** `packages/workflow-canvas`

The canvas is a full-viewport React Flow instance. Users drag node types from a left sidebar onto the canvas, connect them with edges, and select nodes to configure them in a right-side panel.

#### 6.1.1 Node Types

| Node | Color | Required connections |
|---|---|---|
| Start | Green | Must have exactly one outgoing edge |
| Task | Blue | Min 1 incoming, min 1 outgoing |
| Approval | Purple | Min 1 incoming, 1–2 outgoing (approved/rejected) |
| Automated Step | Amber | Min 1 incoming, min 1 outgoing |
| End | Red | Min 1 incoming, no outgoing |

#### 6.1.2 Canvas Actions

- Drag nodes from sidebar panel onto canvas
- Connect nodes via edge handles
- Click a node to open its configuration form in the right panel
- Delete node or edge via keyboard (`Delete` / `Backspace`) or context menu
- Zoom and pan (mouse wheel + drag)
- Minimap (bottom-right, toggleable)
- Auto-layout via `dagre` algorithm (toolbar button)
- Undo/redo via `Ctrl+Z` / `Ctrl+Shift+Z` and `Cmd+Z` / `Cmd+Shift+Z` (Zustand history slice)

#### 6.1.3 Canvas Validation

Validation runs on every graph mutation and before simulation. Errors are displayed as a red badge on the offending node.

| Rule | Error message |
|---|---|
| No Start node | "Workflow must have a Start node" |
| Multiple Start nodes | "Only one Start node is allowed" |
| No End node | "Workflow must have an End node" |
| Disconnected node | "Node '{title}' is not connected" |
| Cycle detected | "Cycle detected — workflows must be acyclic" |
| Start has incoming edge | "Start node cannot have incoming connections" |
| End has outgoing edge | "End node cannot have outgoing connections" |

### 6.2 Node Configuration Forms

**Package:** `packages/node-forms`

Each node type has a dedicated form rendered in a right-side panel when the node is selected. Forms use React Hook Form with Zod schemas. All fields use controlled components. Saving a form updates the node's `data` object in Zustand `canvasStore`.

#### 6.2.1 Start Node Form

| Field | Type | Validation |
|---|---|---|
| Start title | text | required, max 80 chars |
| Metadata pairs | key-value list | key: required string, value: any string |

#### 6.2.2 Task Node Form

| Field | Type | Validation |
|---|---|---|
| Title | text | required, max 80 chars |
| Description | textarea | optional, max 500 chars |
| Assignee | text | optional |
| Due date | date input | optional, ISO date string |
| Custom fields | key-value list | key: required string |

#### 6.2.3 Approval Node Form

| Field | Type | Validation |
|---|---|---|
| Title | text | required, max 80 chars |
| Approver role | select | `Manager` \| `HRBP` \| `Director` \| `CEO` |
| Auto-approve threshold (days) | number | optional, min 1, max 365 |

#### 6.2.4 Automated Step Node Form

| Field | Type | Validation |
|---|---|---|
| Title | text | required, max 80 chars |
| Action | select | populated from `GET /automations` |
| Action parameters | dynamic fields | rendered per action's `params` array |

The `params` array from the API drives the dynamic field list. Each param name becomes a text input label. This is the primary demonstration of dynamic form architecture.

#### 6.2.5 End Node Form

| Field | Type | Validation |
|---|---|---|
| End message | text | optional, max 200 chars |
| Summary flag | boolean toggle | default false |

### 6.3 Workflow Toolbar

A top toolbar provides global canvas actions:

- Save workflow (serialise to JSON, POST to API or save to Zustand)
- Load workflow (import from JSON file — `<input type="file">`)
- Export JSON (download current graph as `.json`)
- Auto-layout (dagre)
- Validate (manual trigger, shows error summary panel)
- Run simulation (opens Sandbox panel)
- Undo / Redo
- Zoom controls
- Toggle minimap

### 6.4 Simulation Sandbox Panel

A bottom drawer panel (650px wide, 320px tall, slides up) that:

1. Validates the workflow graph before running
2. Serialises the full graph to `WorkflowGraphPayload` JSON
3. POSTs to `POST /simulate`
4. Streams or receives a step-by-step execution log
5. Renders each step as a timeline entry with: step number, node title, node type badge, status (pending → running → completed/failed), timestamp, and any output message
6. Highlights the currently executing node on the canvas with a pulsing amber border
7. Shows a final summary: total steps, duration, pass/fail status

---

## 7. API Specification

### 7.1 Base URLs

| Mode | Base URL |
|---|---|
| Mock (MSW) | Intercepted in browser, no network request |
| Local real | `http://localhost:4000` |
| Production | `https://api.hr-workflow.internal` (ClusterIP DNS) |

### 7.2 Endpoints

#### `GET /health`

Returns API and database health status.

**Response 200:**
```json
{
  "status": "ok",
  "db": "connected",
  "uptime": 3600
}
```

---

#### `GET /automations`

Returns the list of available automated actions for the Automated Step node form.

**Response 200:**
```json
[
  {
    "id": "send_email",
    "label": "Send Email",
    "params": ["to", "subject", "body"]
  },
  {
    "id": "generate_doc",
    "label": "Generate Document",
    "params": ["template", "recipient"]
  },
  {
    "id": "notify_slack",
    "label": "Notify Slack",
    "params": ["channel", "message"]
  },
  {
    "id": "create_ticket",
    "label": "Create JIRA Ticket",
    "params": ["project", "summary", "assignee"]
  },
  {
    "id": "update_hris",
    "label": "Update HRIS Record",
    "params": ["employee_id", "field", "value"]
  }
]
```

**Mock behaviour:** Returns the same static list. MSW handler registered at `handlers/automations.ts`.

**Real backend behaviour:** Reads from `automations` table in PostgreSQL via Prisma.

---

#### `POST /simulate`

Accepts a serialised workflow graph and returns a mock step-by-step execution result.

**Request body:**
```json
{
  "workflowId": "optional-string",
  "nodes": [
    {
      "id": "node-1",
      "type": "start",
      "data": { "title": "Employee Onboarding" }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ]
}
```

**Response 200:**
```json
{
  "runId": "sim-uuid-v4",
  "status": "completed",
  "totalSteps": 4,
  "durationMs": 1240,
  "steps": [
    {
      "stepIndex": 1,
      "nodeId": "node-1",
      "nodeType": "start",
      "title": "Employee Onboarding",
      "status": "completed",
      "message": "Workflow initiated",
      "timestampMs": 0
    }
  ]
}
```

**Response 422 (validation failure):**
```json
{
  "error": "VALIDATION_FAILED",
  "violations": [
    { "nodeId": "node-3", "rule": "DISCONNECTED_NODE", "message": "Node 'Collect Documents' is not connected" }
  ]
}
```

**Mock behaviour:** MSW handler runs the `workflow-engine` simulation logic locally in the browser — no network. Returns the same shape as real API.

**Real backend behaviour:** Hono route calls `packages/workflow-engine/simulate.ts` on the server, persists run log to `simulation_runs` table.

---

#### `GET /workflows` *(bonus — real backend only)*

Returns all saved workflows.

**Response 200:**
```json
[
  {
    "id": "wf-uuid",
    "name": "Employee Onboarding",
    "createdAt": "2026-04-18T10:00:00Z",
    "updatedAt": "2026-04-18T12:00:00Z",
    "nodeCount": 6,
    "edgeCount": 5
  }
]
```

---

#### `POST /workflows` *(bonus — real backend only)*

Persists a workflow graph.

**Request body:** Full `WorkflowGraphPayload` (same shape as `/simulate` body, plus `name` field)

**Response 201:**
```json
{ "id": "wf-uuid", "name": "Employee Onboarding", "createdAt": "..." }
```

---

#### `GET /workflows/:id` *(bonus — real backend only)*

Returns a full workflow by ID including all nodes and edges.

---

#### `DELETE /workflows/:id` *(bonus — real backend only)*

Deletes a workflow.

---

### 7.3 Input Sanitization (all routes)

The Hono middleware stack applies sanitization before any route handler executes:

```
Request → cors() → logger() → sanitizer() → route handler
```

The `sanitizer` middleware (in `apps/api/src/middleware/sanitizer.ts`) does:

- Strip HTML tags from all string fields in request body
- Escape special characters (`<`, `>`, `"`, `'`, `` ` ``)
- Reject requests where any field exceeds 10,000 characters
- Reject requests with `__proto__`, `constructor`, or `prototype` keys (prototype pollution)
- Return `400 Bad Request` with `{ "error": "INVALID_INPUT", "detail": "..." }` on violation

---

## 8. Data Models

### 8.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Automation {
  id        String   @id @default(uuid())
  label     String
  params    String[] // array of param names
  createdAt DateTime @default(now())

  automatedStepNodes AutomatedStepNode[]
}

model Workflow {
  id             String          @id @default(uuid())
  name           String
  description    String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  nodes          WorkflowNode[]
  edges          WorkflowEdge[]
  simulationRuns SimulationRun[]
}

model WorkflowNode {
  id         String   @id @default(uuid())
  workflowId String
  workflow   Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  nodeType   NodeType
  positionX  Float
  positionY  Float
  data       Json     // node-type-specific config blob

  @@index([workflowId])
}

model WorkflowEdge {
  id         String   @id @default(uuid())
  workflowId String
  workflow   Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  sourceId   String
  targetId   String
  label      String?

  @@index([workflowId])
}

model AutomatedStepNode {
  id           String     @id @default(uuid())
  automationId String
  automation   Automation @relation(fields: [automationId], references: [id])
  params       Json       // { to: "...", subject: "..." }
}

model SimulationRun {
  id          String          @id @default(uuid())
  workflowId  String?
  workflow    Workflow?       @relation(fields: [workflowId], references: [id])
  status      SimulationStatus
  durationMs  Int
  steps       SimulationStep[]
  createdAt   DateTime        @default(now())
}

model SimulationStep {
  id           String        @id @default(uuid())
  runId        String
  run          SimulationRun @relation(fields: [runId], references: [id], onDelete: Cascade)
  stepIndex    Int
  nodeId       String
  nodeType     NodeType
  title        String
  status       StepStatus
  message      String?
  timestampMs  Int
}

enum NodeType {
  START
  TASK
  APPROVAL
  AUTOMATED_STEP
  END
}

enum SimulationStatus {
  COMPLETED
  FAILED
  VALIDATION_ERROR
}

enum StepStatus {
  COMPLETED
  FAILED
  SKIPPED
}
```

### 8.2 Shared TypeScript Types

```typescript
// packages/types/src/workflow.ts

export type NodeType =
  | 'start'
  | 'task'
  | 'approval'
  | 'automated_step'
  | 'end';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export type NodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData;

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

export interface AutomatedStepNodeData {
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData {
  endMessage?: string;
  summaryFlag: boolean;
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
```

---

## 9. Infrastructure & DevOps

### 9.1 Docker Setup

#### `docker-compose.yml` (local dev)

Services:

| Service | Image | Port | Purpose |
|---|---|---|---|
| `web` | `./apps/web` | 3000 | Next.js frontend |
| `api` | `./apps/api` | 4000 | Hono.js backend |
| `postgres` | `postgres:16-alpine` | 5432 | Database |
| `nginx` | `nginx:alpine` | 80 | Reverse proxy |

All services share a `hr-network` bridge network. `api` and `web` depend on `postgres`. Health checks on `postgres` via `pg_isready`. `nginx` proxies `/api/*` to `api:4000` and `/*` to `web:3000`.

#### Dockerfiles

**`apps/api/Dockerfile`** — multi-stage Bun build:
```dockerfile
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bunx prisma generate
RUN bun build ./src/index.ts --outdir ./dist --target bun

FROM oven/bun:1-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
ENV NODE_ENV=production
EXPOSE 4000
CMD ["bun", "dist/index.js"]
```

**`apps/web/Dockerfile`** — Next.js standalone output:
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 9.2 Kubernetes Manifests

All manifests live in `infra/k8s/`. Key specs:

**`deployments/api.yaml`**
- `replicas: 2` (minimum)
- `image: <acr>.azurecr.io/hr-workflow-api:$TAG`
- Resources: `requests: cpu=100m mem=128Mi`, `limits: cpu=500m mem=512Mi`
- Liveness probe: `GET /health` every 15s
- Readiness probe: `GET /health` every 5s
- Env vars from `ConfigMap` and `SecretProviderClass` (Key Vault CSI)

**`deployments/web.yaml`**
- `replicas: 2`
- `image: <acr>.azurecr.io/hr-workflow-web:$TAG`
- Resources: `requests: cpu=200m mem=256Mi`, `limits: cpu=1000m mem=1Gi`

**`hpa/api-hpa.yaml`**
- `minReplicas: 2`, `maxReplicas: 10`
- Scale on `cpu: 70%` average utilisation

**`ingress/nginx.yaml`**
- `kubernetes.io/ingress.class: nginx`
- Route `/api/` → `api-service:4000`
- Route `/` → `web-service:3000`
- TLS via cert-manager `ClusterIssuer`

### 9.3 Terraform Modules

`infra/terraform/modules/` contains:

| Module | Resources provisioned |
|---|---|
| `networking` | VNet, subnets, NSGs, private endpoints |
| `aks` | AKS cluster, system + workload node pools, managed identity |
| `acr` | Azure Container Registry, role assignments |
| `keyvault` | Key Vault, access policies, CSI secrets |
| `frontdoor` | Azure Front Door profile, WAF policy, origin group |

#### Key Terraform variables (`variables.tf`)

```hcl
variable "location"           { default = "eastus" }
variable "resource_group"     { default = "hr-workflow-rg" }
variable "aks_node_count_min" { default = 2 }
variable "aks_node_count_max" { default = 10 }
variable "aks_vm_size"        { default = "Standard_D4s_v3" }
variable "acr_sku"            { default = "Basic" }
variable "environment"        { default = "dev" }
```

Dev environment (`dev.tfvars`) uses `Standard_B2s` VMs and `Basic` ACR to minimise cost. Prod (`prod.tfvars`) upgrades to `Standard_D4s_v3` and `Standard` ACR.

### 9.4 CI/CD Pipeline

**`.github/workflows/ci.yml`** runs on every push and PR:

```
1. pnpm install (cached)
2. Turbo lint (all packages)
3. Turbo typecheck (all packages)
4. Turbo test (Vitest unit tests)
5. Turbo build (all apps)
6. Playwright E2E (on main branch only)
```

**`.github/workflows/deploy.yml`** runs on merge to `main`:

```
1. Build Docker images (web + api)
2. Push to ACR with SHA tag
3. Update Helm values with new tag
4. helm upgrade --install hr-workflow ./charts/hr-workflow
5. kubectl rollout status deployment/web deployment/api
```

---

## 10. Testing Strategy

### 10.1 Unit Tests (Vitest)

| Package | What's tested |
|---|---|
| `workflow-engine` | Graph validation, cycle detection, simulation runner, serializer |
| `node-forms` | Zod schemas for all 5 node types, edge cases |
| `api-client` | Fetch abstraction, error handling |
| `apps/api` | Sanitizer middleware, route handlers (with mocked Prisma) |

Coverage target: 80% lines on `workflow-engine` and `node-forms`.

### 10.2 Component Tests (Vitest + Testing Library)

- Each node form renders correctly with default values
- Form validation errors appear on submit with invalid data
- Dynamic `AutomatedStepNodeForm` re-renders fields when action selection changes
- `NodeFormPanel` switches form component when node selection changes

### 10.3 E2E Tests (Playwright)

| Test | Scenario |
|---|---|
| `canvas-basic.spec.ts` | Drag Start + Task + End, connect them, run simulation |
| `node-forms.spec.ts` | Select each node type, fill all fields, verify canvas data updates |
| `validation.spec.ts` | Attempt simulation with disconnected node, verify error badge |
| `export-import.spec.ts` | Export workflow as JSON, reimport, verify graph is identical |
| `simulate.spec.ts` | Run full 5-node onboarding workflow, verify step-by-step log |

---

## 11. Environment Configuration

### 11.1 `apps/web/.env.local`

```env
NEXT_PUBLIC_API_MODE=mock              # 'mock' | 'real'
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 11.2 `apps/api/.env`

```env
DATABASE_URL=postgresql://hr_user:hr_password@postgres:5432/hr_workflow
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 11.3 Kubernetes Secrets (from Key Vault)

```
DATABASE_URL         → kv secret: hr-workflow-db-url
CORS_ORIGIN          → kv secret: hr-workflow-cors-origin
```

---

## 12. Milestones & Delivery Scope

### Phase 1 — Core prototype (case study scope, ~4–6 hours) ✅

- [x] ~~Monorepo scaffold with Turborepo + pnpm~~ → Co-located in `apps/web/src/lib/` and `apps/web/src/stores/` for Phase 1 simplicity
- [x] `src/lib/types.ts` — all shared interfaces (`WorkflowNode`, `WorkflowEdge`, `SimulationResult`, etc.)
- [x] `src/lib/workflow-engine.ts` — validate (7 rules + cycle detection) + simulate (BFS) + serialize/deserialize
- [x] `src/components/nodes/` — 5 custom React Flow node types (`StartNode`, `TaskNode`, `ApprovalNode`, `AutomatedStepNode`, `EndNode`)
- [x] `src/components/forms/` — all 5 forms with Zod validation (`StartNodeForm`, `TaskNodeForm`, `ApprovalNodeForm`, `AutomatedStepNodeForm`, `EndNodeForm`)
- [x] `apps/web` — designer page wiring canvas + `NodeFormPanel` + `TopBar` + `Sidebar` with drag-and-drop palette
- [x] `src/hooks/` — TanStack Query hooks (`useAutomations`, `useSimulate`)
- [x] `src/mocks/handlers.ts` — MSW mock handlers for `GET /automations` and `POST /simulate`
- [x] `src/components/SimulationSandbox.tsx` — bottom drawer with step-by-step execution log
- [x] `README.md` with architecture, run instructions, design decisions

### Phase 2 — Real backend (bonus)

- [ ] `apps/api` — Hono.js + Bun + Prisma setup
- [ ] All 4 route files + sanitizer middleware
- [ ] Prisma schema + migrations
- [x] `docker-compose.yml` full stack
- [ ] Switch `NEXT_PUBLIC_API_MODE=real` tested end-to-end

### Phase 3 — Infrastructure (bonus) ✅

- [x] Dockerfiles for `web` (multi-stage, 37 MB standalone)
- [x] Kubernetes manifests (deployments, services, ingress, HPA, configmaps, namespaces)
- [x] Terraform modules for AKS, ACR, networking, Key Vault, Front Door + WAF
- [x] GitHub Actions CI + deploy pipelines

### Phase 4 — Polish (bonus) — Partial ✅

- [ ] Storybook stories for all node components and forms
- [ ] Playwright E2E suite
- [x] Undo/redo (Zustand history middleware in `canvasStore`)
- [ ] Auto-layout (dagre)
- [x] JSON export/import (TopBar buttons)
- [ ] Workflow validation error badges on nodes
- [ ] Node version history

---

## 13. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Sanitizer as sidecar (Dapr) vs standalone pod? | Meet | Open |
| 2 | Dev VM size: `Standard_B2s` dev / `Standard_D4s_v3` prod? | Meet | Proposed |
| 3 | Simulation sandbox: bottom drawer (current) or modal? | Meet | Proposed: drawer |
| 4 | Should `/workflows` CRUD persist to PostgreSQL in Phase 1 or only Phase 2? | Meet | Proposed: Phase 2 |
| 5 | Redis for workflow state (future) — include placeholder Terraform module? | Meet | Open |

---

*This document is the single source of truth for the HR Workflow Designer project. All architectural decisions made prior to PRD sign-off should be reflected here before implementation begins.*