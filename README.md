# HR Workflow Designer

A visual, drag-and-drop workflow designer for HR process automation built as a mini case study.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![React Flow](https://img.shields.io/badge/React_Flow-12-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

---

## Architecture

```
apps/web/               ← Next.js 16 (App Router) frontend
  src/
    app/                 ← Pages (layout, page)
    components/
      nodes/             ← 5 custom React Flow node types
      forms/             ← 5 Zod-validated node configuration forms
      providers/         ← MSW + React Query providers
      FlowCanvas.tsx     ← React Flow canvas with drag-and-drop
      NodeFormPanel.tsx   ← Right panel — switches form by selected node
      Sidebar.tsx        ← Navigation + draggable node palette
      TopBar.tsx         ← Undo/redo, import/export, simulate
      SimulationSandbox.tsx ← Bottom drawer — step-by-step simulation
    hooks/               ← TanStack Query hooks (useAutomations, useSimulate)
    lib/
      types.ts           ← Shared TypeScript interfaces (PRD §8.2)
      schemas.ts         ← Zod schemas for all 5 node types
      workflow-engine.ts ← Pure logic: validate, simulate, serialize
    mocks/               ← MSW handlers for /automations and /simulate
    stores/              ← Zustand stores (canvasStore, simulationStore)

infra/
  nginx/nginx.conf       ← Reverse proxy for local Docker
  k8s/                   ← Kubernetes manifests (namespaces, deployments, services, ingress, HPA)
  terraform/             ← Azure IaC modules (AKS, ACR, VNet, Key Vault, Front Door)

docs/
  PRD.md                 ← Product Requirements Document
  DESIGN.md              ← Design system tokens and references
```

## Features

### Canvas
- **5 node types**: Start, Task, Approval (dual output), Automated Step, End
- **Drag-and-drop** from sidebar palette onto canvas
- **Click-to-select** → right panel shows the appropriate configuration form
- **Undo/redo** via Zustand history middleware

### Node Forms (Zod Validated)
- **Start**: Title
- **Task**: Title, description, assignee, due date
- **Approval**: Title, approver role (Manager/HRBP/Director/CEO), auto-approve threshold
- **Automated Step**: Title, action selector (fetched from `/automations`), dynamic parameter fields
- **End**: Message, summary flag toggle

### Simulation Sandbox
- Bottom drawer panel with **Run** button
- Validates graph (DAG rules, cycle detection, connectivity) before execution
- Sends `POST /simulate` to MSW, renders step-by-step execution log
- Color-coded badges per node type, status icons, timestamps

### API Layer
- **MSW** mock handlers intercept `/api/automations` and `/api/simulate`
- **TanStack Query** hooks (`useAutomations`, `useSimulate`) with caching
- Toggle `NEXT_PUBLIC_API_MODE=mock|real` to switch between MSW and live backend

### Infrastructure
- Multi-stage **Dockerfile** (37 MB standalone)
- **docker-compose.yml** with nginx, web, postgres
- **Kubernetes** manifests with HPA (2→8 pods)
- **Terraform** modules for Azure (AKS, ACR, VNet, Key Vault, Front Door + WAF)
- **GitHub Actions** CI/CD pipeline

---

## Quick Start

```bash
# Install dependencies
cd apps/web
npm install

# Run dev server
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start
```

## Design Decisions

| Decision | Rationale |
|---|---|
| **Co-located packages** | Phase 1 keeps types, engine, schemas inside `apps/web/src/lib/` for simplicity. PRD's `packages/*` structure applies in Phase 2+ when the monorepo scales. |
| **MSW over real API** | Enables full frontend demo without a running backend. Toggle `API_MODE=real` when `apps/api` exists. |
| **Zustand over Context** | Zustand's selector pattern avoids unnecessary re-renders on the canvas — critical for React Flow performance. |
| **Zod + react-hook-form** | Zod schemas are the single source of truth for validation. Forms use `zodResolver` for zero-boilerplate error handling. |
| **Standalone output** | `next.config.ts` → `output: "standalone"` produces a 37 MB self-contained server, ideal for Docker. |

---

*Refer to [PRD.md](docs/PRD.md) for the full specification and [DESIGN.md](docs/DESIGN.md) for design tokens.*
