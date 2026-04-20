"use client";

import {
  ShieldCheck,
  Calendar,
  BarChart2,
  Link,
  Server,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  ArrowRight,
  Activity,
  PlayCircle,
  Sparkles,
  Database,
} from "lucide-react";
import { useCanvasStore } from "@/stores/canvasStore";
import { DEMO_WORKFLOWS } from "@/lib/demo-workflows";
import { useViewStore } from "@/stores/viewStore";

function ViewShell({
  icon: Icon,
  title,
  description,
  actions,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-[var(--surface-secondary)]">
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--color-brand-500)]">
              <Icon size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{title}</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
            </div>
          </div>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: typeof ShieldCheck;
  tone?: "default" | "good" | "warn" | "danger";
}) {
  const tones = {
    default: "text-[var(--text-primary)]",
    good: "text-emerald-600",
    warn: "text-amber-600",
    danger: "text-red-600",
  };

  return (
    <div className="panel-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">{label}</p>
          <p className={`metric-value mt-3 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">{helper}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-secondary)] text-[var(--color-brand-500)]">
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

function SurfaceSection({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="panel-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-default)] bg-[var(--surface-secondary)] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-[var(--text-tertiary)]">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}

function StatusBadge({ tone, children }: { tone: "good" | "warn" | "danger" | "neutral"; children: React.ReactNode }) {
  const styles = {
    good: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    neutral: "bg-[var(--surface-secondary)] text-[var(--text-secondary)]",
  };

  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${styles[tone]}`}>{children}</span>;
}

export function ComplianceView() {
  const rules = [
    { id: "R-001", label: "All workflows must have a Start node", status: "pass", owner: "Structure" },
    { id: "R-002", label: "All workflows must have an End node", status: "pass", owner: "Structure" },
    { id: "R-003", label: "Every task must have an assignee defined", status: "warn", owner: "Task policy" },
    { id: "R-004", label: "Approval nodes require an approver field", status: "pass", owner: "Approvals" },
    { id: "R-005", label: "No orphan nodes disconnected from graph", status: "fail", owner: "Structure" },
    { id: "R-006", label: "Workflows must not exceed 50 nodes", status: "pass", owner: "Scale" },
    { id: "R-007", label: "Sensitive data fields must be encrypted", status: "warn", owner: "Security" },
    { id: "R-008", label: "Automated steps must reference valid endpoints", status: "pass", owner: "Automation" },
  ];

  const passCount = rules.filter((r) => r.status === "pass").length;
  const warnCount = rules.filter((r) => r.status === "warn").length;
  const failCount = rules.filter((r) => r.status === "fail").length;

  return (
    <ViewShell
      icon={ShieldCheck}
      title="Compliance"
      description="Audit workflow structure and policy coverage before automation goes live."
      actions={<StatusBadge tone={failCount > 0 ? "danger" : "good"}>{failCount > 0 ? "Attention required" : "Healthy"}</StatusBadge>}
    >
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Passing checks" value={passCount} helper={`of ${rules.length} rules are satisfied`} icon={CheckCircle2} tone="good" />
        <StatCard label="Warnings" value={warnCount} helper="Needs policy completion before launch" icon={AlertTriangle} tone="warn" />
        <StatCard label="Failures" value={failCount} helper="Critical issues blocking confidence" icon={XCircle} tone="danger" />
      </div>

      <SurfaceSection title="Policy Findings" subtitle="Most severe issues should be resolved before simulation or export.">
        <div className="divide-y divide-[var(--border-default)]">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {rule.status === "pass" ? (
                    <CheckCircle2 size={15} className="text-emerald-500" />
                  ) : rule.status === "warn" ? (
                    <AlertTriangle size={15} className="text-amber-500" />
                  ) : (
                    <XCircle size={15} className="text-red-500" />
                  )}
                  <p className="text-sm font-medium text-[var(--text-primary)]">{rule.label}</p>
                </div>
                <p className="mt-1 pl-6 text-xs text-[var(--text-tertiary)]">
                  {rule.id} • Owned by {rule.owner}
                </p>
              </div>
              <StatusBadge tone={rule.status === "pass" ? "good" : rule.status === "warn" ? "warn" : "danger"}>
                {rule.status}
              </StatusBadge>
            </div>
          ))}
        </div>
      </SurfaceSection>
    </ViewShell>
  );
}

export function SchedulerView() {
  const setActiveView = useViewStore((s) => s.setActiveView);
  const schedules = [
    { name: "Weekly Onboarding Batch", cron: "Every Monday 9:00 AM", status: "active", lastRun: "2 hours ago", nextRun: "Mon, Apr 27 • 9:00 AM" },
    { name: "Expense Report Sweep", cron: "Daily at 6:00 PM", status: "active", lastRun: "18 hours ago", nextRun: "Today • 6:00 PM" },
    { name: "Compliance Audit", cron: "Monthly on the 1st", status: "paused", lastRun: "Mar 1, 2026", nextRun: "May 1, 2026" },
    { name: "Offboarding Reminder", cron: "Every Friday 4:00 PM", status: "active", lastRun: "Last Friday", nextRun: "Fri, Apr 25 • 4:00 PM" },
    { name: "Leave Approval Escalation", cron: "Every 4 hours", status: "active", lastRun: "1 hour ago", nextRun: "In 3 hours" },
    { name: "Quarterly Performance Review", cron: "Quarterly", status: "paused", lastRun: "Jan 1, 2026", nextRun: "Jul 1, 2026" },
  ];

  return (
    <ViewShell
      icon={Calendar}
      title="Scheduler"
      description="Track recurring workflow runs and spot which automations are stalled or waiting."
      actions={
        <button onClick={() => setActiveView("dashboard")} className="interactive-subtle rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
          Open builder
        </button>
      }
    >
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Active schedules" value={schedules.filter((s) => s.status === "active").length} helper="Running without manual intervention" icon={Activity} tone="good" />
        <StatCard label="Paused schedules" value={schedules.filter((s) => s.status === "paused").length} helper="Require review before restart" icon={Clock} />
        <StatCard label="Total executions" value="1,247" helper="Recent run count across active jobs" icon={TrendingUp} />
      </div>

      <SurfaceSection title="Scheduled Workflows" subtitle="Use the builder to prepare and save a workflow before scheduling it.">
        <div className="divide-y divide-[var(--border-default)]">
          {schedules.map((schedule) => (
            <div key={schedule.name} className="grid grid-cols-[1.8fr_1fr_1fr_140px] items-center gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{schedule.name}</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{schedule.cron}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Last run</p>
                <p className="mt-1 text-xs text-[var(--text-primary)]">{schedule.lastRun}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Next run</p>
                <p className="mt-1 text-xs text-[var(--text-primary)]">{schedule.nextRun}</p>
              </div>
              <div className="justify-self-end">
                <StatusBadge tone={schedule.status === "active" ? "good" : "neutral"}>{schedule.status}</StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </SurfaceSection>
    </ViewShell>
  );
}

export function AnalyticsView() {
  const savedWorkflows = useCanvasStore((s) => s.savedWorkflows);
  const totalNodes = savedWorkflows.reduce((sum, wf) => sum + wf.nodes.length, 0);
  const totalEdges = savedWorkflows.reduce((sum, wf) => sum + wf.edges.length, 0);
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const usage = [72, 85, 64, 91, 78, 30, 15];

  const typeBreakdown = savedWorkflows.reduce((acc, wf) => {
    acc[wf.type] = (acc[wf.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ViewShell
      icon={BarChart2}
      title="Analytics"
      description="Scan workflow volume, graph complexity, and usage patterns across the saved library."
      actions={<StatusBadge tone="neutral">{savedWorkflows.length === 0 ? "No data yet" : "Live snapshot"}</StatusBadge>}
    >
      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard label="Workflows" value={savedWorkflows.length} helper="Saved in local workspace" icon={FileText} />
        <StatCard label="Nodes" value={totalNodes} helper="Across all saved workflows" icon={Activity} />
        <StatCard label="Connections" value={totalEdges} helper="Total graph edges tracked" icon={ArrowRight} />
        <StatCard label="Average size" value={savedWorkflows.length ? Math.round(totalNodes / savedWorkflows.length) : 0} helper="Nodes per workflow" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-6">
        <SurfaceSection title="Weekly Activity" subtitle="Relative workflow usage over the last 7 days.">
          <div className="px-5 py-5">
            <div className="flex h-44 items-end gap-3">
              {weekdays.map((day, index) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full items-end justify-center rounded-t-2xl bg-[var(--surface-secondary)]" style={{ height: "100%" }}>
                    <div
                      className="w-full rounded-t-2xl bg-[var(--color-brand-500)]/85"
                      style={{ height: `${usage[index]}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[var(--text-tertiary)]">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </SurfaceSection>

        <SurfaceSection title="Workflow Types" subtitle="Distribution of saved workflow categories.">
          <div className="px-5 py-5">
            {Object.keys(typeBreakdown).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-8 text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">No analytics yet</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">Save a few workflows to populate this breakdown.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(typeBreakdown).map(([type, count]) => (
                  <div key={type}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium capitalize text-[var(--text-primary)]">{type}</span>
                      <span className="metric-value text-[var(--text-secondary)]">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-brand-500)]"
                        style={{ width: `${(count / savedWorkflows.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SurfaceSection>
      </div>
    </ViewShell>
  );
}

export function IntegrationsView() {
  const integrations = [
    { name: "Slack", desc: "Send notifications and approvals via Slack channels", connected: true, category: "Messaging" },
    { name: "Microsoft Teams", desc: "Push workflow updates to Teams channels", connected: false, category: "Messaging" },
    { name: "Gmail / SMTP", desc: "Send automated email notifications", connected: true, category: "Email" },
    { name: "Jira", desc: "Create and track issues from workflow tasks", connected: false, category: "Ticketing" },
    { name: "SAP SuccessFactors", desc: "Sync employee data with HR system", connected: true, category: "HRIS" },
    { name: "Workday", desc: "Import org charts and employee records", connected: false, category: "HRIS" },
    { name: "DocuSign", desc: "Request e-signatures within approval flows", connected: false, category: "Documents" },
    { name: "Google Sheets", desc: "Log workflow outcomes to spreadsheets", connected: true, category: "Data" },
    { name: "Webhooks", desc: "Send and receive custom HTTP webhook calls", connected: true, category: "Automation" },
    { name: "PostgreSQL", desc: "Read and write internal operational data", connected: true, category: "Data" },
  ];

  return (
    <ViewShell
      icon={Link}
      title="Integrations"
      description="Track connected systems and identify which endpoints are still available to wire in."
      actions={<StatusBadge tone="neutral">{integrations.filter((i) => i.connected).length} connected</StatusBadge>}
    >
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Connected" value={integrations.filter((i) => i.connected).length} helper="Available for workflow actions" icon={CheckCircle2} tone="good" />
        <StatCard label="Available" value={integrations.filter((i) => !i.connected).length} helper="Ready to configure next" icon={Sparkles} />
        <StatCard label="Categories" value="6" helper="Messaging, HRIS, data, and automation" icon={Database} />
      </div>

      <SurfaceSection title="Integration Catalog" subtitle="Connected systems are ready to use in automation steps and notifications.">
        <div className="grid grid-cols-2 gap-4 p-5">
          {integrations.map((integration) => (
            <div key={integration.name} className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{integration.name}</p>
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">{integration.desc}</p>
                </div>
                <StatusBadge tone={integration.connected ? "good" : "neutral"}>
                  {integration.connected ? "Connected" : "Available"}
                </StatusBadge>
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">{integration.category}</p>
            </div>
          ))}
        </div>
      </SurfaceSection>
    </ViewShell>
  );
}

export function RepositoryView() {
  const savedWorkflows = useCanvasStore((s) => s.savedWorkflows);
  const setActiveView = useViewStore((s) => s.setActiveView);

  const allWorkflows = [
    ...savedWorkflows.map((wf) => ({ ...wf, source: "saved" as const })),
    ...DEMO_WORKFLOWS.map((wf) => ({ ...wf, source: "demo" as const })),
  ];

  return (
    <ViewShell
      icon={Server}
      title="Repository"
      description="Browse saved workflows and demo templates from one shared library."
      actions={
        <button onClick={() => setActiveView("dashboard")} className="interactive-subtle rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
          Open builder
        </button>
      }
    >
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Saved workflows" value={savedWorkflows.length} helper="Created in this workspace" icon={FileText} />
        <StatCard label="Templates" value={DEMO_WORKFLOWS.length} helper="Reusable demo starting points" icon={PlayCircle} />
        <StatCard label="Total library" value={allWorkflows.length} helper="Saved plus demo assets" icon={Server} />
      </div>

      {allWorkflows.length === 0 ? (
        <SurfaceSection title="Library Empty" subtitle="Create or import a workflow to start building a repository.">
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">No workflows available yet</p>
            <button
              onClick={() => setActiveView("dashboard")}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-500)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)] cursor-pointer"
            >
              Go to Dashboard <ArrowRight size={12} />
            </button>
          </div>
        </SurfaceSection>
      ) : (
        <SurfaceSection title="Workflow Library" subtitle="Open any saved flow or load a demo template into the builder.">
          <div className="divide-y divide-[var(--border-default)]">
            {allWorkflows.map((wf) => (
              <div key={wf.id} className="grid grid-cols-[1.8fr_120px_140px_110px] items-center gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-1.5 rounded-full ${wf.source === "demo" ? "bg-violet-400" : "bg-blue-400"}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">{wf.name}</p>
                      <p className="mt-1 truncate text-xs text-[var(--text-tertiary)]">
                        {wf.nodes.length} nodes • {wf.edges.length} edges
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-xs capitalize text-[var(--text-secondary)]">{wf.type}</div>
                <div className="justify-self-start">
                  <StatusBadge tone={wf.source === "demo" ? "neutral" : "good"}>
                    {wf.source === "demo" ? "Template" : "Saved"}
                  </StatusBadge>
                </div>
                <button
                  onClick={() => {
                    if (wf.source === "saved") {
                      useCanvasStore.getState().loadWorkflow(wf.id);
                    } else {
                      useCanvasStore.setState({
                        nodes: JSON.parse(JSON.stringify(wf.nodes)),
                        edges: JSON.parse(JSON.stringify(wf.edges)),
                        currentWorkflowId: null,
                        history: [],
                        historyIndex: -1,
                        selectedNodeId: null,
                        selectedNodeIds: [],
                        validationErrors: [],
                        isDirty: true,
                        lastSavedAt: null,
                      });
                    }
                    setActiveView("dashboard");
                  }}
                  className="justify-self-end rounded-xl border border-[var(--border-default)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)] cursor-pointer"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </SurfaceSection>
      )}
    </ViewShell>
  );
}
